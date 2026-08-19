#!/usr/bin/env node
/**
 * Season-end reward watcher.
 *
 * Why this exists. The game's season leaderboards pay real USD prizes (league
 * rankings, the Grand Bounty, per-stat League Prizes) in USDC/SOL at season's
 * end. None of it is in the data API: it lives behind the authenticated game
 * backend, the same wall as pack spend. But the payout itself is an on-chain
 * transfer from a game treasury to the player's embedded wallet, and we now hold
 * a wallet -> owner_ref map. So the realized side is observable on chain even
 * though the projected side is not.
 *
 * The plan is two-phase and this one script does both:
 *
 *   DISCOVERY  Watch every mapped player wallet for a fresh USDC or SOL inflow
 *              from an address that is not another player. When the season pays
 *              out, the same sender lands money in many wallets at once, so the
 *              treasury surfaces as the top external sender in the tally. One
 *              confirmed payout is enough to identify it.
 *
 *   HARVEST    Given the treasury address, scan ITS outflows directly. That
 *              catches every payout in one place, including recipients we never
 *              mapped, which the per-wallet scan cannot see.
 *
 * Design rule, inherited from the ingest: never depend on the database being
 * writable. wallet_links is read once at start; everything this script produces
 * lands in data/rewards/ as append-only JSONL plus an atomically-written state
 * file. A missed payout window is unrecoverable, so the watcher is cheap enough
 * to run often and resumes exactly where it left off.
 *
 * Usage:
 *   node ingest/rewards-watch.js --baseline     # record current high-water, no history scan
 *   node ingest/rewards-watch.js --watch        # scan for new inflows since baseline (the loop job)
 *   node ingest/rewards-watch.js --treasury <address>   # harvest one treasury's outflows
 *   node ingest/rewards-watch.js --report       # summarise what has been captured
 *
 * Optional: SOLANA_RPC_URL in env or .env overrides the public RPC.
 */

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'syndicate.db')
const OUT_DIR = path.join(ROOT, 'data', 'rewards')
const STATE_FILE = path.join(OUT_DIR, 'watch-state.json')
const INFLOWS_LOG = path.join(OUT_DIR, 'inflows.jsonl')

// USDC mint on Solana mainnet. The prizes are dollar-denominated, so USDC is the
// primary signal; SOL inflows are captured too, in case a prize pays in SOL.
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

// A tradeable-market sale already lands SOL in these wallets and is captured
// elsewhere, so a plain SOL inflow is only interesting when it is NOT one of our
// own recorded sales. We cannot know that here without the sales table, so SOL
// inflows are recorded with their sender and left for the report to filter; the
// treasury tally keys on sender, which separates a prize treasury from ordinary
// marketplace counterparties on its own.
const LAMPORTS_PER_SOL = 1e9

// Public RPC is rate limited and occasionally flaky, so every call retries with
// backoff and every wallet scan is spaced out. Override with a paid RPC for
// speed if one is ever configured.
const DEFAULT_RPC = 'https://api.mainnet-beta.solana.com'
const RETRY_DELAYS_MS = [1_000, 3_000, 8_000, 20_000]
const INTER_CALL_MS = 130
// Per-request ceiling. Without it a single unanswered socket hangs the run.
const RPC_TIMEOUT_MS = 20_000
const SIG_PAGE_LIMIT = 25
// Headroom for a busy wallet between runs. launchd StartInterval does not fire
// while the Mac sleeps, so a run can cover a multi-hour gap; a hyperactive trader
// wallet could accumulate a few hundred signatures in that window. Paging only
// goes this deep when a wallet actually has that much new activity, so the extra
// ceiling is close to free for the ~1 new tx/wallet the quiet majority see.
const MAX_SIG_PAGES = 24 // up to 600 new signatures per wallet per run
// Treasury harvests page to exhaustion instead; this is only a runaway backstop.
const TREASURY_MAX_PAGES = 2000
// Signature listing is cheap and carries the memo, so a treasury sweep pulls the
// maximum per call. This is what makes an operational wallet tractable: the
// SOL payout wallet writes ~500 signatures an hour, far too many to fetch one
// transaction at a time, but paging its memos at 1000 a call is minutes of work
// and lets us fetch only the payouts we actually want.
const TREASURY_PAGE_LIMIT = 1000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// --------------------------------------------------------------- config ---

function loadRpcUrl() {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL
  const envPath = path.join(ROOT, '.env')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*SOLANA_RPC_URL\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  }
  return DEFAULT_RPC
}

const RPC_URL = loadRpcUrl()

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { wallets: {}, treasuryTally: {} }
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    s.wallets ||= {}
    s.treasuryTally ||= {}
    return s
  } catch {
    console.warn('[warn] watch-state.json unreadable, starting fresh')
    return { wallets: {}, treasuryTally: {} }
  }
}

function saveState(state) {
  ensureDir(OUT_DIR)
  const tmp = STATE_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2))
  fs.renameSync(tmp, STATE_FILE)
}

function appendInflows(rows) {
  if (!rows.length) return
  ensureDir(OUT_DIR)
  fs.appendFileSync(INFLOWS_LOG, rows.map((r) => JSON.stringify(r)).join('\n') + '\n')
}

// ----------------------------------------------------------------- rpc ---

let rpcId = 0
async function rpc(method, params) {
  let lastErr
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1])
    // Node's fetch has no default timeout, so a stalled socket blocks forever at
    // zero CPU with nothing in the log. That is what wedged the first deep
    // treasury harvest: alive, connected, and doing nothing for 13 minutes.
    // Abort and let the retry loop handle it like any other transport failure.
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), RPC_TIMEOUT_MS)
    try {
      const res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
        signal: ac.signal,
      })
      if (res.status === 429) { lastErr = '429'; continue }
      if (!res.ok) { lastErr = 'HTTP ' + res.status; continue }
      const j = await res.json()
      if (j.error) {
        // Rate-limit style errors are worth retrying; a genuine bad request is not.
        if (j.error.code === -32005 || /rate/i.test(j.error.message || '')) {
          lastErr = 'rpc ' + j.error.message; continue
        }
        throw new Error('rpc error: ' + JSON.stringify(j.error))
      }
      return j.result
    } catch (e) {
      lastErr = e.name === 'AbortError' ? `timeout after ${RPC_TIMEOUT_MS}ms` : e.message
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error(`rpc ${method} failed after retries: ${lastErr}`)
}

// Newest-first signatures for an address, paging back until we reach `untilSig`
// (the last one we already processed) or run out or hit the page guard.
async function signaturesSince(address, untilSig, maxPages = MAX_SIG_PAGES,
                               pageLimit = SIG_PAGE_LIMIT, stopBefore = null, onPage = null) {
  const collected = []
  let before = null
  for (let page = 0; page < maxPages; page++) {
    const opts = { limit: pageLimit }
    if (before) opts.before = before
    if (untilSig) opts.until = untilSig
    // A rate-limit failure mid-paging returns what we have rather than throwing,
    // so a treasury harvest keeps whatever it already fetched instead of losing
    // the whole run. The caller dedups by signature, so a later pass fills gaps.
    let res
    try {
      res = await rpc('getSignaturesForAddress', [address, opts])
    } catch (e) {
      console.warn(`  signaturesSince stopped early at page ${page}: ${e.message}`)
      break
    }
    await sleep(INTER_CALL_MS)
    if (!res || !res.length) break
    collected.push(...res)
    const oldest = res[res.length - 1]
    if (onPage) onPage(page, collected.length, oldest.blockTime)
    // A date floor keeps a sweep of a hot operational wallet bounded: there is no
    // point paging past the day the game started paying out.
    if (stopBefore && oldest.blockTime && oldest.blockTime * 1000 < stopBefore) break
    if (res.length < pageLimit) break // reached the end / the `until` boundary
    before = oldest.signature
  }
  return collected
}

/**
 * Inspect one transaction for money arriving at `wallet` from someone else.
 * Returns {mint, amount, sender, memo} for the largest inflow, or null.
 */
async function inflowFor(signature, wallet, memo) {
  const t = await rpc('getTransaction', [
    signature,
    { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
  ])
  await sleep(INTER_CALL_MS)
  if (!t || t.meta?.err) return null

  const keys = t.transaction.message.accountKeys.map((k) => k.pubkey || k)

  // USDC: compare this wallet's token balance before and after.
  const usdcPre = (t.meta.preTokenBalances || [])
    .find((b) => b.owner === wallet && b.mint === USDC_MINT)
  const usdcPost = (t.meta.postTokenBalances || [])
    .find((b) => b.owner === wallet && b.mint === USDC_MINT)
  const usdcDelta = ((usdcPost?.uiTokenAmount.uiAmount) || 0) - ((usdcPre?.uiTokenAmount.uiAmount) || 0)
  if (usdcDelta > 0.000001) {
    // Sender is whoever's USDC balance dropped and is not us.
    const senderBal = (t.meta.preTokenBalances || [])
      .map((b, i) => ({ ...b, delta: computeTokenDelta(t, i) }))
      .find((b) => b.mint === USDC_MINT && b.owner !== wallet && b.delta < 0)
    return {
      mint: 'USDC',
      amount: +usdcDelta.toFixed(6),
      sender: senderBal?.owner || firstSigner(t) || null,
      memo: memo || null,
    }
  }

  // SOL: the wallet's own lamport balance rising, net of any fee it paid.
  const idx = keys.indexOf(wallet)
  if (idx >= 0) {
    const solDelta = (t.meta.postBalances[idx] - t.meta.preBalances[idx]) / LAMPORTS_PER_SOL
    if (solDelta > 0.000001) {
      // Sender is the account with the matching lamport decrease.
      let sender = null, worst = 0
      keys.forEach((k, i) => {
        const d = (t.meta.postBalances[i] - t.meta.preBalances[i]) / LAMPORTS_PER_SOL
        if (k !== wallet && d < worst) { worst = d; sender = k }
      })
      return { mint: 'SOL', amount: +solDelta.toFixed(9), sender, memo: memo || null }
    }
  }

  return null
}

function computeTokenDelta(t, preIndex) {
  const pre = t.meta.preTokenBalances[preIndex]
  const post = (t.meta.postTokenBalances || [])
    .find((b) => b.accountIndex === pre.accountIndex)
  return ((post?.uiTokenAmount.uiAmount) || 0) - ((pre.uiTokenAmount.uiAmount) || 0)
}

function firstSigner(t) {
  const keys = t.transaction.message.accountKeys
  const s = keys.find((k) => k.signer)
  return s ? (s.pubkey || s) : null
}

// --------------------------------------------------------------- data ---

function loadWalletMap() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true })
  const rows = db.prepare('SELECT wallet, owner_ref FROM wallet_links').all()
  db.close()
  const byWallet = {}
  const playerWallets = new Set()
  for (const r of rows) {
    byWallet[r.wallet] = r.owner_ref
    playerWallets.add(r.wallet)
  }
  return { byWallet, playerWallets }
}

// ---------------------------------------------------------------- modes ---

async function runBaseline() {
  const { byWallet } = loadWalletMap()
  const state = loadState()
  // Resumable: a wallet already carrying a high-water was baselined on an earlier
  // (possibly interrupted) run, so skip it. Public RPC is slow enough that a full
  // pass can be interrupted, and re-scanning from scratch would waste the window.
  const wallets = Object.keys(byWallet).filter((w) => !(w in state.wallets))
  const alreadyDone = Object.keys(byWallet).length - wallets.length
  let set = 0, empty = 0
  console.log(`baseline: ${wallets.length} wallets to do, ${alreadyDone} already baselined`)
  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i]
    try {
      const res = await rpc('getSignaturesForAddress', [w, { limit: 1 }])
      await sleep(INTER_CALL_MS)
      const newest = res && res[0] ? res[0].signature : null
      state.wallets[w] = { lastSig: newest, owner_ref: byWallet[w] }
      if (newest) set++; else empty++
    } catch (e) {
      // Leave this wallet without a high-water; the next watch will treat its
      // recent history as new, which is safe (dedup is by signature downstream).
      console.warn(`  ${w.slice(0, 8)}: ${e.message}`)
    }
    if ((i + 1) % 100 === 0) {
      console.log(`  ${i + 1}/${wallets.length}`)
      saveState(state)
    }
  }
  saveState(state)
  console.log(`baseline done: ${set} with history, ${empty} empty`)
}

async function runWatch() {
  const { byWallet, playerWallets } = loadWalletMap()
  const wallets = Object.keys(byWallet)
  const state = loadState()
  const seen = loadSeenSignatures()

  let scanned = 0, newSigs = 0, inflows = 0
  const found = []

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i]
    // Only watch wallets that have a baseline high-water. A wallet not yet
    // baselined has no boundary to scan "since", so treating its whole history as
    // new would record old marketplace sales as inflows. This makes watch safe to
    // run while a baseline pass is still in progress: it simply covers more
    // wallets as the baseline fills in.
    if (!(w in state.wallets)) continue
    const wState = state.wallets[w]
    scanned++
    let sigs
    try {
      sigs = await signaturesSince(w, wState.lastSig)
    } catch (e) {
      console.warn(`  ${w.slice(0, 8)} sigs: ${e.message}`)
      continue
    }
    if (!sigs.length) continue

    // Advance the high-water to the newest signature regardless of what we find,
    // so a transaction is never re-examined.
    const newestSig = sigs[0].signature

    for (const s of sigs) {
      if (seen.has(s.signature)) continue
      newSigs++
      let inf
      try {
        inf = await inflowFor(s.signature, w, s.memo)
      } catch (e) {
        console.warn(`  tx ${s.signature.slice(0, 8)}: ${e.message}`)
        continue
      }
      if (!inf || !inf.amount) continue
      // Ignore money coming from another player's wallet: that is peer activity
      // (a marketplace trade), not a treasury payout.
      if (inf.sender && playerWallets.has(inf.sender)) continue

      inflows++
      const row = {
        wallet: w,
        owner_ref: byWallet[w],
        mint: inf.mint,
        amount: inf.amount,
        sender: inf.sender,
        memo: inf.memo,
        signature: s.signature,
        block_time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
      }
      found.push(row)
      seen.add(s.signature)
      if (inf.sender) {
        state.treasuryTally[inf.sender] = (state.treasuryTally[inf.sender] || 0) + 1
      }
    }

    state.wallets[w] = { lastSig: newestSig, owner_ref: byWallet[w] }
    if ((i + 1) % 100 === 0) {
      appendInflows(found.splice(0))
      saveState(state)
      console.log(`  ${i + 1}/${wallets.length}  new sigs ${newSigs}  inflows ${inflows}`)
    }
  }

  appendInflows(found)
  saveState(state)

  console.log(`watch done: ${scanned} wallets, ${newSigs} new txs, ${inflows} external inflows`)
  reportTreasuries(state, 8)
}

async function runTreasury(address, { memo = null, since = null } = {}) {
  if (!address) throw new Error('--treasury needs an address')
  const { byWallet } = loadWalletMap()
  const seen = loadSeenSignatures()
  console.log(`harvesting outflows from treasury ${address}`)
  if (memo) console.log(`  memo filter: "${memo}"`)
  if (since) console.log(`  stopping at: ${new Date(since).toISOString()}`)

  // A treasury harvest wants the wallet's WHOLE history, not the per-run headroom
  // MAX_SIG_PAGES exists for. Stopping at that guard is silently lossy: the first
  // harvest ended exactly on it at 600 signatures and the site reported six
  // seasons as "all time" while earlier seasons sat unread on chain. Page until
  // the RPC runs dry, with a high ceiling only as a runaway backstop.
  const all = await signaturesSince(address, null, TREASURY_MAX_PAGES, TREASURY_PAGE_LIMIT, since,
    (page, total, blockTime) => {
      if (page % 25 === 0)
        console.log(`  paging: ${total} signatures, back to ` +
          (blockTime ? new Date(blockTime * 1000).toISOString().slice(0, 19) : '?'))
    })
  console.log(`  ${all.length} treasury signatures`)
  if (all.length >= TREASURY_MAX_PAGES * TREASURY_PAGE_LIMIT)
    console.warn('  WARNING: hit the treasury page ceiling; history may still be truncated')

  // Filtering on the memo BEFORE fetching transactions is the whole point of the
  // memo filter: it turns an impossible sweep of a busy wallet into a handful of
  // reads. Signatures with no memo cannot be classified and are not guessed at.
  const sigs = memo ? all.filter((x) => (x.memo || '').includes(memo)) : all
  if (memo) console.log(`  ${sigs.length} match the memo filter`)
  let found = []
  let mapped = 0, unmapped = 0, skipped = 0, done = 0

  for (const s of sigs) {
    if (seen.has(s.signature + ':treasury')) continue
    // A single transaction failing on a rate limit must not abandon the whole
    // harvest: skip it and carry on. What we do capture is appended in batches,
    // so a later crash still leaves the earlier payouts on disk.
    let t
    try {
      t = await rpc('getTransaction', [
        s.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
      ])
    } catch (e) {
      skipped++
      await sleep(INTER_CALL_MS * 4)
      continue
    }
    await sleep(INTER_CALL_MS)
    done++
    if (!t || t.meta?.err) continue

    // Every account whose USDC balance rose in a tx the treasury signed is a payee.
    const post = t.meta.postTokenBalances || []
    const pre = t.meta.preTokenBalances || []
    for (const pb of post) {
      if (pb.mint !== USDC_MINT || pb.owner === address) continue
      const before = pre.find((b) => b.accountIndex === pb.accountIndex)
      const delta = (pb.uiTokenAmount.uiAmount || 0) - ((before?.uiTokenAmount.uiAmount) || 0)
      if (delta <= 0.000001) continue
      const owner_ref = byWallet[pb.owner] || null
      owner_ref ? mapped++ : unmapped++
      found.push({
        wallet: pb.owner,
        owner_ref,
        mint: 'USDC',
        amount: +delta.toFixed(6),
        sender: address,
        memo: s.memo || null,
        signature: s.signature,
        block_time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
        via: 'treasury',
      })
      seen.add(s.signature + ':treasury')
    }

    // Native SOL payouts. The USDC branch above only sees token balances, so a
    // wallet that pays in lamports (the SOL bounty payer does) would otherwise
    // come back empty. Any account whose lamport balance rose, other than the
    // treasury itself, is a payee.
    const keys = t.transaction.message.accountKeys.map((k) => k.pubkey || k)
    keys.forEach((k, i) => {
      if (k === address) return
      const delta = (t.meta.postBalances[i] - t.meta.preBalances[i]) / LAMPORTS_PER_SOL
      if (delta <= 0.000001) return
      const owner_ref = byWallet[k] || null
      owner_ref ? mapped++ : unmapped++
      found.push({
        wallet: k,
        owner_ref,
        mint: 'SOL',
        amount: +delta.toFixed(9),
        sender: address,
        memo: s.memo || null,
        signature: s.signature,
        block_time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
        via: 'treasury',
      })
      seen.add(s.signature + ':treasury')
    })

    // Flush periodically so a mid-run failure never loses captured payouts.
    if (found.length >= 50) { appendInflows(found); found = [] }
  }

  appendInflows(found)
  console.log(
    `treasury harvest: ${mapped + unmapped} payouts (${mapped} mapped, ${unmapped} unmapped), ` +
    `${done} txs read, ${skipped} skipped on error`)
}

function loadSeenSignatures() {
  const seen = new Set()
  if (!fs.existsSync(INFLOWS_LOG)) return seen
  for (const line of fs.readFileSync(INFLOWS_LOG, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      const r = JSON.parse(line)
      seen.add(r.via === 'treasury' ? r.signature + ':treasury' : r.signature)
    } catch { /* skip a torn last line */ }
  }
  return seen
}

function reportTreasuries(state, top) {
  const entries = Object.entries(state.treasuryTally).sort((a, b) => b[1] - a[1])
  if (!entries.length) { console.log('  no external senders tallied yet'); return }
  console.log('  candidate treasuries (senders hitting the most wallets):')
  for (const [addr, n] of entries.slice(0, top)) console.log(`    ${n.toString().padStart(4)}  ${addr}`)
}

function runReport() {
  if (!fs.existsSync(INFLOWS_LOG)) { console.log('no inflows captured yet'); return }
  const rows = fs.readFileSync(INFLOWS_LOG, 'utf8').split('\n')
    .filter((l) => l.trim()).map((l) => JSON.parse(l))
  const bySender = {}, byPlayer = {}
  let usdc = 0, sol = 0
  for (const r of rows) {
    const s = (bySender[r.sender] ||= { usdc: 0, sol: 0, wallets: new Set(), n: 0 })
    s.n++; s.wallets.add(r.wallet)
    if (r.mint === 'USDC') { s.usdc += r.amount; usdc += r.amount } else { s.sol += r.amount; sol += r.amount }
    if (r.owner_ref) {
      const p = (byPlayer[r.owner_ref] ||= { usdc: 0, sol: 0 })
      if (r.mint === 'USDC') p.usdc += r.amount; else p.sol += r.amount
    }
  }
  console.log(`captured ${rows.length} inflows: ${usdc.toFixed(2)} USDC, ${sol.toFixed(3)} SOL`)
  console.log('\ntop senders (a prize treasury reaches many distinct wallets):')
  for (const [addr, s] of Object.entries(bySender)
    .sort((a, b) => b[1].wallets.size - a[1].wallets.size).slice(0, 10)) {
    console.log(`  ${String(s.wallets.size).padStart(4)} wallets  ${s.usdc.toFixed(2)} USDC  ${s.sol.toFixed(3)} SOL  ${addr}`)
  }
  console.log(`\nplayers credited: ${Object.keys(byPlayer).length}`)
}

// ---------------------------------------------------------------- main ---

async function main() {
  const argv = process.argv.slice(2)
  const mode = argv.find((a) => a.startsWith('--'))?.slice(2) || 'watch'
  console.log(`rewards-watch: mode=${mode} rpc=${RPC_URL.replace(/\/\/.*@/, '//')}`)
  ensureDir(OUT_DIR)

  if (mode === 'baseline') await runBaseline()
  else if (mode === 'watch') await runWatch()
  else if (mode === 'treasury') await runTreasury(argv[argv.indexOf('--treasury') + 1], {
    memo: argv.includes('--memo') ? argv[argv.indexOf('--memo') + 1] : null,
    since: argv.includes('--since') ? Date.parse(argv[argv.indexOf('--since') + 1]) : null,
  })
  else if (mode === 'report') runReport()
  else {
    console.error(`unknown mode: ${mode}`)
    console.error('use --baseline | --watch | --treasury <addr> | --report')
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
