#!/usr/bin/env node
/**
 * The Syndicate archive ingest.
 *
 * Design rule: this script must never depend on a database being up. Raw
 * gzipped JSON on disk is the source of truth; every derived table is
 * rebuildable from it. A missed snapshot is unrecoverable history, a broken
 * derived table is a five minute rebuild, so the archive wins every tradeoff.
 *
 * Usage:
 *   node ingest/snapshot.js --tier fast
 *   node ingest/snapshot.js --tier daily
 *   node ingest/snapshot.js --endpoint market_sales --backfill
 *   node ingest/snapshot.js --tier all --backfill      # first run
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  BASE_URL,
  endpointsForTier,
  endpointByName,
  TIERS,
} from './endpoints.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const RAW_DIR = path.join(DATA_DIR, 'raw')
const RUNS_LOG = path.join(DATA_DIR, 'runs.jsonl')
const STATE_FILE = path.join(DATA_DIR, 'state.json')

const RETRY_DELAYS_MS = [5_000, 15_000, 45_000, 90_000]
const INTER_REQUEST_DELAY_MS = 250
const REQUEST_TIMEOUT_MS = 180_000
// The capos endpoint is ~58MB and can exceed the default; endpoints may override.
const MAX_REQUEST_TIMEOUT_MS = 600_000

// --------------------------------------------------------------- helpers ---

function loadApiKey() {
  const envPath = path.join(ROOT, '.env')
  if (process.env.SYNDICATE_API_KEY) return process.env.SYNDICATE_API_KEY
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*SYNDICATE_API_KEY\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  }
  throw new Error('SYNDICATE_API_KEY not found in env or .env')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  } catch {
    // A corrupt state file must not stop the archive. Worst case we
    // re-fetch a window we already have; duplicates are deduped on load.
    console.warn('[warn] state.json unreadable, starting fresh')
    return {}
  }
}

function saveState(state) {
  const tmp = STATE_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2))
  fs.renameSync(tmp, STATE_FILE)
}

function appendRunLog(entry) {
  ensureDir(DATA_DIR)
  fs.appendFileSync(RUNS_LOG, JSON.stringify(entry) + '\n')
}

/** Atomic gzipped write: a crash mid-write can never leave a corrupt snapshot. */
function writeSnapshot(endpointName, isoStamp, payloadBuffer) {
  const day = isoStamp.slice(0, 10)
  const dir = path.join(RAW_DIR, endpointName, day)
  ensureDir(dir)
  const filename = isoStamp.replace(/[:.]/g, '-') + '.json.gz'
  const finalPath = path.join(dir, filename)
  const tmpPath = finalPath + '.tmp'
  fs.writeFileSync(tmpPath, zlib.gzipSync(payloadBuffer, { level: 6 }))
  fs.renameSync(tmpPath, finalPath)
  return path.relative(ROOT, finalPath)
}

// ----------------------------------------------------------------- fetch ---

async function fetchWithRetry(url, apiKey, timeoutMs = REQUEST_TIMEOUT_MS) {
  let lastErr
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS_MS[attempt - 1]
      console.warn(`  retry ${attempt} in ${delay / 1000}s (${lastErr})`)
      await sleep(delay)
    }
    try {
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), timeoutMs)
      const res = await fetch(url, {
        headers: { 'x-api-key': apiKey, accept: 'application/json' },
        signal: ac.signal,
      })
      clearTimeout(timer)

      if (res.status === 429) {
        lastErr = 'HTTP 429 rate limited'
        continue
      }
      if (!res.ok) {
        // 4xx other than 429 will not fix themselves; fail fast.
        const body = await res.text().catch(() => '')
        if (res.status >= 400 && res.status < 500) {
          throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`)
        }
        lastErr = `HTTP ${res.status}`
        continue
      }
      const buf = Buffer.from(await res.arrayBuffer())
      return buf
    } catch (err) {
      if (String(err.message).startsWith('HTTP 4')) throw err
      lastErr = err.message
    }
  }
  throw new Error(`all retries exhausted: ${lastErr}`)
}

function buildUrl(endpoint, extraQuery = {}) {
  const url = new URL(BASE_URL + endpoint.path)
  for (const [k, v] of Object.entries({ ...(endpoint.query || {}), ...extraQuery })) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }
  return url.toString()
}

// -------------------------------------------------------------- ingesters ---

async function ingestSnapshot(endpoint, apiKey, state, isoStamp) {
  const url = buildUrl(endpoint)
  const buf = await fetchWithRetry(url, apiKey, endpoint.timeoutMs ?? REQUEST_TIMEOUT_MS)

  // Validate it parses before we treat it as a good snapshot.
  let parsed
  try {
    parsed = JSON.parse(buf.toString('utf8'))
  } catch (err) {
    throw new Error(`response is not valid JSON: ${err.message}`)
  }

  // Hash the payload only, never the envelope: every response carries a fresh
  // `as_of` timestamp, so hashing raw bytes would make every snapshot look
  // changed and defeat dedup entirely.
  const hash = sha256(Buffer.from(JSON.stringify(parsed.data ?? parsed)))

  const prevHash = state[endpoint.name]?.lastHash
  if (prevHash === hash) {
    // Payload identical to the previous snapshot. Record that the run happened,
    // but do not store a duplicate copy. Any point in time resolves by walking
    // back to the most recent stored file.
    return {
      status: 'unchanged',
      bytes: buf.length,
      hash,
      duplicate_of: state[endpoint.name].lastFile,
    }
  }

  const file = writeSnapshot(endpoint.name, isoStamp, buf)
  state[endpoint.name] = { lastHash: hash, lastFile: file, lastRunAt: isoStamp }

  return {
    status: 'stored',
    bytes: buf.length,
    hash,
    file,
    as_of: parsed.as_of ?? null,
    count: parsed?.data?.count ?? null,
  }
}

async function ingestFeed(endpoint, apiKey, state, isoStamp, { backfill }) {
  const st = state[endpoint.name] || {}
  const lastSeenId = st.lastSeenId ?? null
  const maxPages = backfill ? Infinity : endpoint.maxPagesIncremental ?? 5

  const pages = []
  let cursor = null
  let pageNum = 0
  let reachedKnown = false
  let newest = null
  let totalRows = 0

  while (pageNum < maxPages) {
    const buf = await fetchWithRetry(
      buildUrl(endpoint, cursor ? { cursor } : {}),
      apiKey,
      endpoint.timeoutMs ?? REQUEST_TIMEOUT_MS,
    )
    const parsed = JSON.parse(buf.toString('utf8'))
    pages.push(parsed)
    pageNum++

    const rows = parsed?.data?.[endpoint.itemsPath] ?? []
    totalRows += rows.length
    if (rows.length && newest === null) {
      newest = {
        id: endpoint.idField ? rows[0][endpoint.idField] : null,
        ts: endpoint.tsField ? rows[0][endpoint.tsField] : null,
      }
    }

    // Feeds are newest-first, so once we hit a row we already archived we are
    // fully caught up and can stop.
    if (!backfill && lastSeenId && endpoint.idField) {
      if (rows.some((r) => r[endpoint.idField] === lastSeenId)) {
        reachedKnown = true
        break
      }
    }

    cursor = parsed?.data?.next_cursor ?? null
    if (!cursor || rows.length === 0) {
      reachedKnown = true // exhausted the feed entirely
      break
    }
    await sleep(INTER_REQUEST_DELAY_MS)
  }

  // If we paged to our limit without meeting known data, the window was too
  // small for the volume and we may have skipped rows. Loudly flagged rather
  // than silently tolerated, because a gap in an append-only feed is permanent.
  const possibleGap = !backfill && !!lastSeenId && !reachedKnown

  const envelope = {
    archived_at: isoStamp,
    endpoint: endpoint.name,
    mode: backfill ? 'backfill' : 'incremental',
    pages_fetched: pageNum,
    rows_fetched: totalRows,
    previous_high_water: { id: lastSeenId, ts: st.lastSeenTs ?? null },
    possible_gap: possibleGap,
    pages,
  }
  const buf = Buffer.from(JSON.stringify(envelope))
  const file = writeSnapshot(endpoint.name, isoStamp, buf)

  state[endpoint.name] = {
    ...st,
    lastSeenId: newest?.id ?? lastSeenId,
    lastSeenTs: newest?.ts ?? st.lastSeenTs ?? null,
    lastFile: file,
    lastRunAt: isoStamp,
  }

  return {
    status: possibleGap ? 'stored_with_gap_warning' : 'stored',
    bytes: buf.length,
    file,
    pages: pageNum,
    rows: totalRows,
    possible_gap: possibleGap,
  }
}

// ------------------------------------------------------------------ main ---

function parseArgs(argv) {
  const args = { tier: null, endpoint: null, backfill: false }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--tier') args.tier = argv[++i]
    else if (argv[i] === '--endpoint') args.endpoint = argv[++i]
    else if (argv[i] === '--backfill') args.backfill = true
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  if (!args.tier && !args.endpoint) {
    console.error('usage: snapshot.js --tier <fast|hourly|daily|all> [--backfill]')
    console.error('       snapshot.js --endpoint <name> [--backfill]')
    process.exit(2)
  }
  if (args.tier && args.tier !== 'all' && !TIERS.includes(args.tier)) {
    console.error(`unknown tier "${args.tier}" (expected ${TIERS.join(', ')} or all)`)
    process.exit(2)
  }

  const apiKey = loadApiKey()
  const targets = args.endpoint
    ? [endpointByName(args.endpoint)].filter(Boolean)
    : endpointsForTier(args.tier)

  if (targets.length === 0) {
    console.error('no matching endpoints')
    process.exit(2)
  }

  ensureDir(DATA_DIR)
  const state = loadState()
  const runStartedAt = new Date().toISOString()
  const runId = crypto.randomUUID()

  console.log(
    `[${runStartedAt}] run ${runId.slice(0, 8)} tier=${args.tier ?? '-'} ` +
      `endpoints=${targets.length}${args.backfill ? ' (backfill)' : ''}`,
  )

  let failures = 0
  let warnings = 0

  for (const endpoint of targets) {
    const isoStamp = new Date().toISOString()
    const started = Date.now()
    const base = {
      run_id: runId,
      endpoint: endpoint.name,
      tier: endpoint.tier,
      kind: endpoint.kind,
      started_at: isoStamp,
    }
    try {
      const result =
        endpoint.kind === 'feed'
          ? await ingestFeed(endpoint, apiKey, state, isoStamp, args)
          : await ingestSnapshot(endpoint, apiKey, state, isoStamp)

      const duration = Date.now() - started
      // Persist state after every endpoint, not at the end. A crash halfway
      // through must not replay work already safely on disk.
      saveState(state)
      appendRunLog({ ...base, ok: true, duration_ms: duration, ...result })

      if (result.possible_gap) warnings++
      const size = (result.bytes / 1024).toFixed(0)
      const detail =
        result.status === 'unchanged'
          ? 'unchanged'
          : [
              `${size}KB`,
              result.count != null ? `count=${result.count}` : null,
              result.rows != null ? `rows=${result.rows}` : null,
              result.possible_gap ? 'POSSIBLE GAP' : null,
            ]
              .filter(Boolean)
              .join(' ')
      console.log(`  ok   ${endpoint.name.padEnd(20)} ${detail} (${duration}ms)`)
    } catch (err) {
      failures++
      const duration = Date.now() - started
      appendRunLog({
        ...base,
        ok: false,
        duration_ms: duration,
        error: err.message,
      })
      // One endpoint failing must never abort the rest of the run.
      console.error(`  FAIL ${endpoint.name.padEnd(20)} ${err.message}`)
    }
    await sleep(INTER_REQUEST_DELAY_MS)
  }

  console.log(
    `[${new Date().toISOString()}] done: ${targets.length - failures}/${targets.length} ok` +
      (warnings ? `, ${warnings} gap warning(s)` : '') +
      (failures ? `, ${failures} failed` : ''),
  )
  process.exit(failures > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('fatal:', err)
  process.exit(1)
})
