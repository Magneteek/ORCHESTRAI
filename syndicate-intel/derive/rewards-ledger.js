#!/usr/bin/env node
/**
 * On-chain prize ledger for The Syndicate.
 *
 * Three distinct prize streams are captured, and they are kept apart because
 * they are paid differently and mean different things:
 *
 *   1. SEASON prizes. The treasury pays league placement at the end of every
 *      7-day season, always around 19:00 UTC, in one burst of dozens of USDC
 *      transfers. A day with SEASON_BURST_MIN or more transfers is a season end.
 *   2. DAILY prizes and BOUNTIES, same treasury, same USDC, but off-burst. The
 *      daily prize is an exact 15/10/5 to three wallets at 19:00; anything else
 *      off-burst is a one-off bounty or special event payout.
 *   3. SOL BOUNTIES, a different wallet entirely, identified by the
 *      `sol-bounty-payout` memo. Kept in SOL and never converted, because there
 *      is no price feed here.
 *
 * The treasury carries no memo on any transfer, so streams 1 and 2 can only be
 * told apart by shape (burst size, then amount). Streams are summed per player
 * in `all_time`, which is the single source both the Prizes page and the player
 * profiles read, so the two surfaces cannot drift apart.
 *
 * Usage: node derive/rewards-ledger.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const INFLOWS = path.join(ROOT, 'data', 'rewards', 'inflows.jsonl')
const OUT = path.join(ROOT, 'data', 'rewards', 'season-ledger.json')
// Site copy: names and amounts only, no wallets or refs, for the public page.
const SITE_OUT = path.join(ROOT, 'data', 'site', 'prizes.json')

const PRIZE_TREASURY = 'HoWrwfPS53CHQ6pTLSVxHVgoez1oaDQyJrSjbaFeoC36'
// A day with at least this many prize transfers is a season-end payout, not the
// handful of daily prizes that also flow from this treasury.
const SEASON_BURST_MIN = 20
// The daily prize is a fixed three-place ladder. Only applied off-burst: on a
// season-end day a $5 transfer is a genuine low-placement league prize.
const DAILY_LADDER = new Set([5, 10, 15])
// Seasons are numbered from a known anchor and a fixed 7-day cadence rather than
// by counting bursts backwards. Counting breaks the moment the archive reaches a
// season whose payout is missing; the date arithmetic does not.
const ANCHOR = { season: 11, date: '2026-08-17' }
const WEEK_MS = 7 * 24 * 3600 * 1000
const seasonForDate = (d) =>
  ANCHOR.season - Math.round((Date.parse(ANCHOR.date) - Date.parse(d)) / WEEK_MS)

const db = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'), { readOnly: true })
const day = db.prepare('SELECT MAX(day) d FROM capos_daily').get().d
const nameOf = (ref) => {
  if (!ref) return null
  return db.prepare(
    `SELECT owner_display_name n FROM capos_daily
     WHERE day = ? AND owner_ref = ? AND owner_display_name IS NOT NULL LIMIT 1`).get(day, ref)?.n ?? null
}

const rows = fs.readFileSync(INFLOWS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const dedup = (rs) => {
  const seen = new Set()
  return rs.filter((r) => {
    const k = r.signature + '|' + r.wallet + '|' + r.mint
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const prize = dedup(rows.filter((r) => r.sender === PRIZE_TREASURY && r.mint === 'USDC'))
const solBounty = dedup(rows.filter((r) => r.mint === 'SOL' && /sol-bounty-payout/.test(r.memo || '')))

// Bucket the treasury's USDC by calendar day, then classify each transfer.
const byDate = {}
for (const r of prize) (byDate[(r.block_time || '').slice(0, 10)] ||= []).push(r)
const isBurst = (d) => (byDate[d] || []).length >= SEASON_BURST_MIN
const kindOf = (r) => {
  const d = (r.block_time || '').slice(0, 10)
  if (isBurst(d)) return 'season'
  return DAILY_LADDER.has(r.amount) ? 'daily' : 'bounty'
}

const seasonDays = Object.keys(byDate).filter(isBurst).sort()

const seasons = seasonDays.map((d) => {
  const rs = byDate[d]
  const perPlayer = {}
  for (const r of rs) {
    const key = r.owner_ref || ('wallet:' + r.wallet)
    const p = (perPlayer[key] ||= { owner_ref: r.owner_ref, wallet: r.wallet, usdc: 0 })
    p.usdc += r.amount
  }
  const winners = Object.values(perPlayer)
    .map((p) => ({ name: nameOf(p.owner_ref), owner_ref: p.owner_ref, wallet: p.wallet, usdc: +p.usdc.toFixed(2) }))
    .sort((a, b) => b.usdc - a.usdc)
  return {
    season: seasonForDate(d),
    date: d,
    total_usdc: +rs.reduce((a, r) => a + r.amount, 0).toFixed(2),
    winners: winners.length,
    payouts: rs.length,
    ledger: winners,
  }
}).reverse() // newest season first

// One row per player, carrying every stream. Both the Prizes page and the player
// profiles read this, so a player's total is the same number wherever it appears.
const players = {}
const bump = (r, field, amount) => {
  const key = r.owner_ref || ('wallet:' + r.wallet)
  const p = (players[key] ||= {
    owner_ref: r.owner_ref, wallet: r.wallet,
    season_usdc: 0, daily_usdc: 0, bounty_usdc: 0, sol_bounties: 0, seasons: new Set(),
  })
  p[field] += amount
  return p
}
for (const r of prize) {
  const kind = kindOf(r)
  const p = bump(r, kind === 'season' ? 'season_usdc' : kind === 'daily' ? 'daily_usdc' : 'bounty_usdc', r.amount)
  if (kind === 'season') p.seasons.add(seasonForDate((r.block_time || '').slice(0, 10)))
}
for (const r of solBounty) bump(r, 'sol_bounties', r.amount)

const allTimeLedger = Object.values(players).map((p) => {
  const usdc = p.season_usdc + p.daily_usdc + p.bounty_usdc
  return {
    name: nameOf(p.owner_ref), owner_ref: p.owner_ref, wallet: p.wallet,
    usdc: +usdc.toFixed(2),
    season_usdc: +p.season_usdc.toFixed(2),
    daily_usdc: +p.daily_usdc.toFixed(2),
    bounty_usdc: +p.bounty_usdc.toFixed(2),
    other_usdc: +(p.daily_usdc + p.bounty_usdc).toFixed(2),
    sol_bounties: +p.sol_bounties.toFixed(4),
    seasons_won: p.seasons.size,
  }
}).sort((a, b) => b.usdc - a.usdc)

const sum = (rs) => +rs.reduce((a, r) => a + r.amount, 0).toFixed(2)
const ofKind = (k) => prize.filter((r) => kindOf(r) === k)
const times = prize.map((r) => r.block_time).sort()

const payload = {
  generated_at: new Date().toISOString(),
  treasury: PRIZE_TREASURY,
  captured_span: { from: times[0], to: times.at(-1) },
  seasons_captured: seasons.length,
  total_usdc_seasons: sum(ofKind('season')),
  total_usdc_daily: sum(ofKind('daily')),
  total_usdc_bounty: sum(ofKind('bounty')),
  total_usdc_other: +(sum(ofKind('daily')) + sum(ofKind('bounty'))).toFixed(2),
  total_usdc_all: sum(prize),
  sol_bounties: {
    total_sol: +solBounty.reduce((a, r) => a + r.amount, 0).toFixed(4),
    payouts: solBounty.length,
    wallets: new Set(solBounty.map((r) => r.wallet)).size,
    span: solBounty.length
      ? { from: solBounty.map((r) => r.block_time).sort()[0], to: solBounty.map((r) => r.block_time).sort().at(-1) }
      : null,
  },
  seasons,
  all_time: allTimeLedger,
}
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2))

const sitePayload = {
  generated_at: payload.generated_at,
  captured_span: payload.captured_span,
  seasons_captured: payload.seasons_captured,
  total_usdc_seasons: payload.total_usdc_seasons,
  total_usdc_daily: payload.total_usdc_daily,
  total_usdc_bounty: payload.total_usdc_bounty,
  total_usdc_other: payload.total_usdc_other,
  total_usdc_all: payload.total_usdc_all,
  sol_bounties: payload.sol_bounties,
  seasons: seasons.map((s) => ({
    season: s.season, date: s.date, total_usdc: s.total_usdc, winners: s.winners,
    ledger: s.ledger.map((w) => ({ name: w.name || 'unnamed', usd: w.usdc })),
  })),
  all_time: allTimeLedger.map((w) => ({
    name: w.name || 'unnamed', usd: w.usdc, season_usd: w.season_usdc,
    other_usd: w.other_usdc, sol_bounties: w.sol_bounties, seasons_won: w.seasons_won,
  })),
}
fs.mkdirSync(path.dirname(SITE_OUT), { recursive: true })
fs.writeFileSync(SITE_OUT, JSON.stringify(sitePayload))

console.log('prize treasury:', PRIZE_TREASURY)
console.log('captured span:', payload.captured_span.from, '->', payload.captured_span.to)
console.log('seasons:', seasons.length, ' $' + payload.total_usdc_seasons)
console.log('daily prizes: $' + payload.total_usdc_daily, ' bounties (USDC): $' + payload.total_usdc_bounty)
console.log('all USDC: $' + payload.total_usdc_all)
console.log('SOL bounties:', payload.sol_bounties.total_sol, 'SOL over',
  payload.sol_bounties.payouts, 'payouts to', payload.sol_bounties.wallets, 'wallets')
console.log('\nper season:')
for (const s of payload.seasons)
  console.log('  S' + String(s.season).padStart(2), s.date, '  $' + String(s.total_usdc.toFixed(0)).padStart(5), '  ' + s.winners + ' winners')
console.log('\nall-time top 10:')
for (const w of allTimeLedger.slice(0, 10))
  console.log('  $' + String(w.usdc.toFixed(0)).padStart(5), (w.name || w.wallet.slice(0, 8)).padEnd(18),
    w.seasons_won + ' seasons', ' other $' + w.other_usdc, w.sol_bounties ? ' +' + w.sol_bounties + ' SOL' : '')
console.log('\nwritten', path.relative(ROOT, OUT))
db.close()
