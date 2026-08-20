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
import zlib from 'node:zlib'
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


/**
 * Which league a winner plays in.
 *
 * The prize feed does not say. It carries a name and an amount and nothing else,
 * so this is joined on from the newest territory snapshot, matching owner_ref
 * rather than display name: refs are stable and two players can share a name.
 *
 * It is therefore where a winner holds ground NOW, not a recorded property of
 * the prize they won. For the most recent season those are days apart and the
 * answer is almost always the same one, but it is an inference and the page says
 * so. A winner holding no ground at all has no league and is left blank rather
 * than guessed at; that is about a quarter of any season's winners.
 */
function feedFiles(feed) {
  const dir = path.join(ROOT, 'data', 'raw', feed)
  if (!fs.existsSync(dir)) return []
  const found = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const q = path.join(d, e.name)
      if (e.isDirectory()) walk(q); else found.push(q)
    }
  })(dir)
  return found.sort()
}

function loadFeed(file) {
  let j = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)))
  while (j.data) j = j.data
  return j
}

function newestFeed(feed) {
  const f = feedFiles(feed)
  return f.length ? loadFeed(f.at(-1)) : null
}

/**
 * Which league a winner was playing in, as of the season they won.
 *
 * The prize feed records no league, so it is joined from the territory archive
 * on owner_ref. The snapshot has to be one taken DURING that season. The first
 * version of this used the newest snapshot instead, which was wrong in a way
 * that looked plausible:
 *
 *   during S11   kingpin  9  metro 17  district 34  borough 27  street 17
 *   after S11    kingpin 11  metro 14  district 32  borough 18  street  2
 *
 * Players are promoted a league at the rollover. Across the archived days either
 * side of it, 25 refs went street to borough, 8 borough to district, 4 district
 * to metro and 2 metro to kingpin, and 263 left the map entirely. Reading
 * leagues afterwards therefore moves most winners up a rung and loses everyone
 * who stopped holding ground: that is what emptied street to two winners and
 * pushed the unmatched count from 2 to 29.
 *
 * Territory archiving began 2026-08-16, so only seasons from S11 on can be
 * attributed at all. Earlier seasons get no league rather than a wrong one.
 */
const TERRITORY_FILES = feedFiles('territory')
const leagueCache = new Map()

/**
 * When each season actually ended, from the cities feed rather than assumed.
 *
 * A date-only cutoff is not good enough. S11 paid on 2026-08-17 and ended at
 * 19:00 UTC that same day, so snapshots from 19:05 onward already show the new
 * season: taking the last snapshot "on the 17th" picks one from after the
 * rollover and reads every promotion as though it had been the winner's league
 * all along.
 *
 * territory_cities states season_ends_at outright, so that is used where the
 * archive covers the season. Otherwise the payout date at 19:00 UTC, which is
 * the pattern every observed season follows.
 */
function seasonEnds() {
  const m = new Map()
  for (const f of feedFiles('territory_cities')) {
    for (const c of loadFeed(f).cities || []) {
      if (c.is_active && c.season_number && c.season_ends_at) m.set(c.season_number, c.season_ends_at)
    }
  }
  return m
}
const SEASON_ENDS = seasonEnds()

// 2026-08-17T18-05-14-303Z.json.gz -> 2026-08-17T18:05:14Z
const stampOf = (file) => {
  const b = path.basename(file)
  return b.slice(0, 11) + b.slice(11, 19).replace(/-/g, ':') + 'Z'
}

function leagueMapFor(season) {
  const cutoff = SEASON_ENDS.get(season) || (season.date + 'T19:00:00Z')
  const end = new Date(cutoff).getTime()
  const file = TERRITORY_FILES.filter((f) => new Date(stampOf(f)).getTime() < end).at(-1)
  if (!file) return null
  if (!leagueCache.has(file)) {
    const m = new Map()
    for (const d of loadFeed(file).districts || []) {
      if (d.controller_ref && d.city_league) m.set(d.controller_ref, d.city_league)
    }
    leagueCache.set(file, m)
  }
  return { map: leagueCache.get(file), at: stampOf(file) }
}

/**
 * The leagues, strongest first.
 *
 * The feed states no tier, but max_players is a clean ladder and matches the
 * city counts exactly: street seats 20 across 49 cities, borough 35 across 6,
 * district 50 across 3, metro 75 in one, kingpin 100 in one. Ordering by that
 * rather than hardcoding names means a new league slots itself in.
 */
function leagueOrder() {
  const j = newestFeed('territory_cities')
  const cap = new Map()
  for (const c of (j && j.cities) || []) {
    if (!c.is_active || !c.league) continue
    cap.set(c.league, Math.max(cap.get(c.league) || 0, c.max_players || 0))
  }
  return [...cap.entries()].sort((a, b) => b[1] - a[1]).map(([name, seats]) => ({ name, seats }))
}

const LEAGUES = leagueOrder()

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
  leagues: LEAGUES,
  seasons: seasons.map((s) => ({
    season: s.season, date: s.date, total_usdc: s.total_usdc, winners: s.winners,
    ledger: (() => {
      const lg = leagueMapFor(s.season)
      return s.ledger.map((w) => ({ name: w.name || 'unnamed', usd: w.usdc,
        league: (lg && lg.map.get(w.owner_ref)) || null }))
    })(),
    league_snapshot: (leagueMapFor(s.season) || {}).at || null,
  })),
  all_time: allTimeLedger.map((w) => ({
    name: w.name || 'unnamed', usd: w.usdc, season_usd: w.season_usdc,
    // The two halves of other_usd ship separately: a daily prize and a bounty
    // are won for different things, and a page showing only the sum cannot say
    // which of the two anyone is actually collecting.
    daily_usd: w.daily_usdc, bounty_usd: w.bounty_usdc,
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
