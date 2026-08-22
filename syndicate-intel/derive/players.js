#!/usr/bin/env node
/**
 * Build per-player profiles, keyed on owner_ref.
 *
 * owner_ref is the universal key: verified 2026-08-16 that listings.seller_ref,
 * contracts.trainer_ref and combat.player_ref all live in the same identifier
 * space as capos.owner_ref, and that display names agree across every endpoint
 * (460/460 checked). It is also not derived from the display name, so it
 * survives renames, which the paid `name_change` sink shows do happen.
 *
 * Wallets are given directly by /market/sales as of 2026-08-17, having
 * previously had to be inferred. See resolveWalletLinks.
 *
 * Usage: node derive/players.js
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import {
  buildCompTable, buildFloorTable, valuePortfolios, effectiveRarityPrice,
  SOL_SALES,
} from './valuation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'syndicate.db')
const OUT = path.join(ROOT, 'data', 'boards', 'players.json')

// Same treasury exclusion the boards use.
const HOUSE_REFS = ['321736cb06706777a208f2becdd4d959']

/**
 * Where a player stands: their city, its league, and their rank inside it.
 *
 * Territory is read from the raw snapshot rather than SQLite because it has no
 * table yet, and it is the only trustworthy source for this. Fights cannot
 * stand in: raids cross city lines, so 49% of players defend in more than one
 * city, and a fight-derived home disagrees with the territory one more often
 * than it agrees (460 against 301). The territory snapshot is unambiguous by
 * contrast, with no controller holding districts in two cities at once.
 *
 * Only current controllers get a standing, about 788 of 4,768 players. Everyone
 * else holds no ground, and inventing a league for them would be a guess.
 */
function loadTerritory() {
  const dir = path.join(ROOT, 'data', 'raw', 'territory')
  if (!fs.existsSync(dir)) return {}
  const files = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name)
      if (e.isDirectory()) walk(f)
      else files.push(f)
    }
  })(dir)
  if (!files.length) return {}

  let j
  try { j = JSON.parse(zlib.gunzipSync(fs.readFileSync(files.sort().at(-1)))) } catch { return {} }
  while (j.data) j = j.data
  const held = (j.districts || []).filter((d) => d.controller_ref)
  if (!held.length) return {}

  const cities = new Map()
  for (const d of held) {
    if (!cities.has(d.city_id)) {
      cities.set(d.city_id, { name: d.city_name, league: d.city_league, by: new Map() })
    }
    const c = cities.get(d.city_id)
    c.by.set(d.controller_ref, (c.by.get(d.controller_ref) || 0) + 1)
  }

  const out = {}
  for (const c of cities.values()) {
    // Standard competition ranking: equal holdings share a place, and the next
    // player down skips accordingly, so "3rd of 14" never overstates a tie.
    const ranked = [...c.by.entries()].sort((a, b) => b[1] - a[1])
    let place = 0, prev = null
    ranked.forEach(([ref, n], i) => {
      if (n !== prev) { place = i + 1; prev = n }
      out[ref] = {
        city: c.name, league: c.league, districts: n,
        place, of: ranked.length,
      }
    })
  }
  return out
}

/**
 * RACKET earned, per account.
 *
 * The first per-account earnings figure this project has ever been able to
 * state. Until /capos/production existed the only per-capo earnings anywhere
 * were /leaderboards, capped at 50 rows and naming 109 capos across the whole
 * archive, so a player page had to say outright that there was no honest
 * earnings column to draw. This covers 52,404 earning capos across 4,208
 * owners, and summing by owner_ref is all it takes.
 *
 * The windowed figures come from the API rather than from differencing our own
 * snapshots, which is the exception rather than the rule here: racket_last_7d
 * and racket_last_30d are computed game-side per capo, so unlike the earnings
 * leaderboard these do not need the archive to be time-scoped. The lifetime
 * total still does, in the sense that nothing else exposes it.
 *
 * Read from the newest raw snapshot rather than SQLite. One snapshot is 52k
 * rows and the only question asked of it is "what does this account earn now",
 * so a daily table would add 19M rows a year to answer nothing extra.
 */
// One shape on every path. These early returns used to omit `rows`, which
// classBenchmarks iterates, so a machine with no production archive yet threw
// "rows is not iterable" and took the whole build down rather than degrading to
// a site with no earnings on it. That is the state every fresh deploy starts in.
const EMPTY_PRODUCTION = { byRef: {}, rows: [], as_of: null, owners: 0 }

function loadProduction() {
  const dir = path.join(ROOT, 'data', 'raw', 'capos_production')
  if (!fs.existsSync(dir)) return EMPTY_PRODUCTION
  const files = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name)
      if (e.isDirectory()) walk(f)
      else files.push(f)
    }
  })(dir)
  if (!files.length) return EMPTY_PRODUCTION

  let j
  try { j = JSON.parse(zlib.gunzipSync(fs.readFileSync(files.sort().at(-1)))) } catch {
    return EMPTY_PRODUCTION
  }
  const asOf = j.as_of || null
  while (j.data) j = j.data
  const rows = j.capos || []
  if (!rows.length) return EMPTY_PRODUCTION

  const house = new Set(HOUSE_REFS)
  const byRef = {}
  for (const r of rows) {
    if (!r.owner_ref || house.has(r.owner_ref)) continue
    const e = (byRef[r.owner_ref] ||= {
      lifetime_racket: 0, last_7d_racket: 0, last_30d_racket: 0,
      season_racket: 0, earning_capos: 0, top_capo: null,
    })
    e.lifetime_racket += r.total_racket_earned || 0
    e.last_7d_racket += r.racket_last_7d || 0
    e.last_30d_racket += r.racket_last_30d || 0
    e.season_racket += r.racket_current_season || 0
    e.earning_capos++
    // The single capo carrying the account, which for a large roster is the
    // difference between one god earner and two hundred mediocre ones.
    if (!e.top_capo || (r.total_racket_earned || 0) > e.top_capo.lifetime_racket) {
      e.top_capo = {
        name: r.capo_name || null,
        lifetime_racket: r.total_racket_earned || 0,
      }
    }
  }

  // Standard competition ranking on lifetime, the same convention the territory
  // standing uses: ties share a place and the next player down skips.
  const ranked = Object.entries(byRef).sort((a, b) => b[1].lifetime_racket - a[1].lifetime_racket)
  let place = 0, prev = null
  ranked.forEach(([, e], i) => {
    if (e.lifetime_racket !== prev) { place = i + 1; prev = e.lifetime_racket }
    e.rank = place
  })

  return { byRef, rows, as_of: asOf, owners: ranked.length }
}

/**
 * What a capo of a given class typically earns per day.
 *
 * Rank and rarity are the only things that move hustle earnings, and they move
 * it enormously: measured 2026-08-22, a boss earns a median 129,931 RACKET a day
 * against a recruit's 576, and a god 97,343 against a common's 870. Specialty
 * and personality do not move it at all. Within rare soldiers the five
 * specialties run 3,023 to 3,333 on ~220 capos each, which is noise, so this
 * benchmarks on rarity and rank and offers nothing on the other two. A tool that
 * ranked capos by specialty would be inventing a signal.
 *
 * Medians, and 25 per cell before a cell is published. Both match what
 * sections.js already does with the same data, so a figure cannot mean one thing
 * on the capos page and another on a profile.
 *
 * A two-step ladder, with the basis published alongside, exactly as
 * valuation.js prices a capo. The rarity-and-rank cell first; where that is too
 * thin, the rank on its own. The fallback is rank rather than rarity because
 * rank is the stronger axis by some margin, and because the cells that need it
 * are all at the top: there are 121 bosses in the entire game, so god, epic and
 * legendary bosses each fall under the floor while being precisely the capos an
 * owner most wants judged. Falling back to rarity instead would compare a god
 * boss against god recruits and call it underperforming.
 *
 * Which step produced a number travels with it, so the page can say "vs all
 * bosses" rather than quietly presenting a coarser comparison as the fine one.
 */
const MIN_CELL = 25

function classBenchmarks(rows) {
  const day = db.prepare('SELECT MAX(day) d FROM capos_daily').get().d
  const attr = new Map()
  for (const r of db.prepare(
    'SELECT capo_id, rarity, tier FROM capos_daily WHERE day = ?').all(day)) {
    attr.set(r.capo_id, r)
  }
  const cells = {}
  const ranks = {}
  for (const r of rows) {
    const a = attr.get(r.capo_id)
    if (!a || !a.rarity || !a.tier) continue
    const v = r.avg_racket_per_day || 0
    ;(cells[`${a.rarity}|${a.tier}`] ||= []).push(v)
    ;(ranks[a.tier] ||= []).push(v)
  }
  const summarise = (groups) => {
    const out = {}
    for (const [k, v] of Object.entries(groups)) {
      if (v.length < MIN_CELL) continue
      v.sort((a, b) => a - b)
      out[k] = { per_day: Math.round(v[Math.floor(v.length / 2)]), n: v.length }
    }
    return out
  }
  return { min_sample: MIN_CELL, cells: summarise(cells), ranks: summarise(ranks) }
}

/**
 * How rare each prestige level is, from /prestige.
 *
 * Aggregate only, and deliberately so: the endpoint is documented as carrying no
 * player identity. It cannot say who is prestige 5, only that 48 players are, so
 * it is used here purely to give a level the context that makes it mean
 * something on a profile.
 */
function prestigeLevels() {
  const dir = path.join(ROOT, 'data', 'raw', 'prestige')
  if (!fs.existsSync(dir)) return {}
  const files = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name)
      if (e.isDirectory()) walk(f); else files.push(f)
    }
  })(dir)
  if (!files.length) return {}
  let j
  try { j = JSON.parse(zlib.gunzipSync(fs.readFileSync(files.sort().at(-1)))) } catch { return {} }
  while (j.data) j = j.data
  const out = {}
  for (const l of j.levels || []) {
    out[l.level] = { holders: l.holders, holders_pct: l.holders_pct }
  }
  return out
}

const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS wallet_links (
    wallet     TEXT NOT NULL,
    owner_ref  TEXT NOT NULL,
    evidence   INTEGER NOT NULL,
    first_seen TEXT,
    PRIMARY KEY (wallet, owner_ref)
  );
`)

// Pre-existing databases have wallet_links without `source`. Added here rather
// than in build.js because this table is owned by this script.
if (!db.prepare('PRAGMA table_info(wallet_links)').all().some((c) => c.name === 'source')) {
  db.exec(`ALTER TABLE wallet_links ADD COLUMN source TEXT`)
}

/**
 * Map wallet -> player straight from /market/sales.
 *
 * On 2026-08-17 the API added buyer_ref and seller_ref to every sale row and
 * backfilled them across all history, so each row now carries a wallet and an
 * owner_ref together. Measured that day: seller_ref on 99.9% and buyer_ref on
 * 98.6% of 12,000 rows going back to 2026-07-30, with no wallet resolving to
 * more than one player.
 *
 * This replaces the old mint-join inference, which reconstructed the same link
 * by matching a listing's seller_ref to a later sale of the same mint_address.
 * That trick needed a listing snapshot to exist for the mint, so it only ever
 * covered a fraction of sellers and never covered buyers at all. The direct
 * mapping is a strict superset of it, so the inference is retired rather than
 * kept as a fallback.
 *
 * Both sides of the trade are used, which is what makes buyer-side coverage
 * possible for the first time.
 */
function resolveWalletLinks() {
  const links = db.prepare(`
    SELECT wallet, owner_ref, COUNT(*) AS evidence, MIN(sold_at) AS first_seen
    FROM (
      SELECT seller_wallet AS wallet, seller_ref AS owner_ref, sold_at
      FROM sales WHERE seller_wallet IS NOT NULL AND seller_ref IS NOT NULL
      UNION ALL
      SELECT buyer_wallet AS wallet, buyer_ref AS owner_ref, sold_at
      FROM sales WHERE buyer_wallet IS NOT NULL AND buyer_ref IS NOT NULL
    )
    GROUP BY wallet, owner_ref`).all()

  // A wallet pointing at two players should now be impossible, since the API
  // states the pairing rather than us deducing it. Kept as an assertion: if it
  // ever fires, their data changed and we should not publish an identity claim
  // we cannot stand behind.
  const perWallet = {}
  for (const l of links) (perWallet[l.wallet] ||= []).push(l)
  const clean = []
  let conflicts = 0
  for (const rows of Object.values(perWallet)) {
    if (rows.length === 1) clean.push(rows[0])
    else conflicts++
  }

  db.exec('BEGIN')
  db.exec('DELETE FROM wallet_links')
  const ins = db.prepare(
    `INSERT INTO wallet_links (wallet, owner_ref, evidence, first_seen, source)
     VALUES (?,?,?,?,'sales_ref')`)
  for (const l of clean) ins.run(l.wallet, l.owner_ref, l.evidence, l.first_seen)
  db.exec('COMMIT')

  return { resolved: clean.length, conflicts }
}

/**
 * Realized SOL trading, per player.
 *
 * Keyed on the refs in the sale row itself, not on wallet_links. A player whose
 * wallet we somehow failed to link still gets counted, and buys count the same
 * way sells do, which they did not under the wallet-join version.
 */
function tradingByPlayer() {
  const rows = db.prepare(`
    SELECT owner_ref,
           SUM(sol_in) AS sol_in, SUM(sol_out) AS sol_out,
           SUM(sells) AS sells,   SUM(buys) AS buys
    FROM (
      SELECT seller_ref AS owner_ref, price_lamports AS sol_in, 0 AS sol_out,
             1 AS sells, 0 AS buys
      FROM sales WHERE seller_ref IS NOT NULL AND ${SOL_SALES}
      UNION ALL
      SELECT buyer_ref AS owner_ref, 0 AS sol_in, price_lamports AS sol_out,
             0 AS sells, 1 AS buys
      FROM sales WHERE buyer_ref IS NOT NULL AND ${SOL_SALES}
    )
    GROUP BY owner_ref`).all()
  const out = {}
  for (const r of rows) {
    const solIn = r.sol_in ?? 0
    const solOut = r.sol_out ?? 0
    out[r.owner_ref] = {
      sol_received: solIn / 1e9,
      sol_spent: solOut / 1e9,
      // Realized only, and secondary-market only: pack purchases never appear
      // in /market/sales, so money spent entering the game is not counted.
      realized_sol: (solIn - solOut) / 1e9,
      sells: r.sells,
      buys: r.buys,
    }
  }
  return out
}

/**
 * RACKET earned per day, per account, from our own snapshot diffs.
 *
 * The API publishes no daily figure at any level. /capos/production is lifetime
 * cumulative with a single racket_last_7d total beside it, so "what did this
 * account earn on Tuesday" is not a question the API can answer, now or
 * retrospectively. It exists only as the difference between two of our
 * snapshots, which makes this the same kind of moat the leaderboard archive is.
 *
 * Intervals, not calendar days. The daily tier runs at 04:15, so a normal
 * interval is about 24 hours, but a missed run makes the next one span two days
 * and a manual snapshot can make one span a few hours. The width in hours rides
 * along with every point and a per-day rate is given beside the raw amount, so a
 * short or double interval reads as what it is instead of as a slump or a spike.
 *
 * Days with no prior snapshot to difference are absent rather than zero, which
 * is the same rule the boards already follow: report the window we have, never
 * the window that was asked for.
 */
const DAILY_WINDOW = 8

function dailyEarnings() {
  const rows = db.prepare(`
    SELECT owner_ref, day, captured_at, lifetime_racket
    FROM production_owner_daily
    WHERE day >= date((SELECT MAX(day) FROM production_owner_daily), '-${DAILY_WINDOW} day')
    ORDER BY owner_ref, day`).all()

  const byRef = {}
  const days = new Set()
  let prevRef = null, prev = null
  for (const r of rows) {
    if (r.owner_ref !== prevRef) { prevRef = r.owner_ref; prev = null }
    if (prev) {
      const hours = prev.captured_at && r.captured_at
        ? (Date.parse(r.captured_at) - Date.parse(prev.captured_at)) / 3.6e6
        : null
      const racket = (r.lifetime_racket ?? 0) - (prev.lifetime_racket ?? 0)
      // A negative delta should be impossible on a lifetime counter. If the game
      // ever resets one, publish nothing rather than a negative day.
      if (racket >= 0) {
        ;(byRef[r.owner_ref] ||= []).push({
          date: r.day,
          racket,
          hours: hours == null ? null : +hours.toFixed(1),
          per_day: hours && hours > 0 ? Math.round((racket / hours) * 24) : null,
        })
        days.add(r.day)
      }
    }
    prev = r
  }
  // The first snapshot, not the first differenced day. They differ by one run,
  // and the page explains the gap with this rather than misreporting when the
  // archive started.
  const first = db.prepare(
    'SELECT MIN(day) d FROM production_owner_daily').get()?.d ?? null
  return { byRef, days: [...days].sort(), window: DAILY_WINDOW, first_snapshot: first }
}

/**
 * Which season is running, and how far into it we are.
 *
 * Taken from /territory/cities, which is the only place the season calendar
 * appears. The day is counted the way the game counts it: the start date is day
 * 1 and it rolls at UTC midnight, which reproduces the "Season 12 - Day 6" the
 * game itself shows rather than an elapsed-hours figure that would read a day
 * behind for most of every day.
 */
function seasonInfo() {
  const day = db.prepare('SELECT MAX(day) d FROM cities_daily').get()?.d
  if (!day) return null
  const r = db.prepare(`
    SELECT season_number, MIN(season_started_at) started, MAX(season_ends_at) ends
    FROM cities_daily WHERE day = ? AND is_active = 1 AND season_number IS NOT NULL
    GROUP BY season_number ORDER BY season_number DESC LIMIT 1`).get(day)
  if (!r || r.season_number == null) return null
  const startDay = (r.started || '').slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const n = startDay
    ? Math.round((Date.parse(today) - Date.parse(startDay)) / 86400000) + 1
    : null
  return { season: r.season_number, started_at: r.started, ends_at: r.ends, day: n }
}

/**
 * RACKET from bounties, per player, collected and posted.
 *
 * The only per-player RACKET income the API attributes outside side hustles, and
 * the only one where a net figure is possible: the collector and the poster are
 * both named on the row, so money in and money out are both measurable.
 *
 * RACKET bounties only. SOL bounties carry pool_lamports instead and are a
 * different currency; they are read off chain by the rewards ledger and are not
 * folded in here, because adding two currencies would produce a number that is
 * neither.
 *
 * Refunded postings are not counted as spend. The RACKET came back.
 */
function bountyIncome(season) {
  const out = {}
  const bump = (ref, key, v) => {
    const o = (out[ref] ||= {
      collected: 0, posted: 0, collections: 0,
      season_collected: 0, season_posted: 0, season_collections: 0,
    })
    o[key] += v
  }
  for (const b of db.prepare(`
    SELECT collector_ref, poster_ref, season, amount_racket,
           collector_payout_racket, collected, refunded
    FROM bounties WHERE kind = 'racket'`).all()) {
    if (b.collected && b.collector_ref) {
      bump(b.collector_ref, 'collected', b.collector_payout_racket || 0)
      bump(b.collector_ref, 'collections', 1)
      if (season != null && b.season === season) {
        bump(b.collector_ref, 'season_collected', b.collector_payout_racket || 0)
        bump(b.collector_ref, 'season_collections', 1)
      }
    }
    if (b.poster_ref && !b.refunded) {
      bump(b.poster_ref, 'posted', b.amount_racket || 0)
      if (season != null && b.season === season) {
        bump(b.poster_ref, 'season_posted', b.amount_racket || 0)
      }
    }
  }
  return out
}

/** Realized SOL inside the current season window, per player. */
function tradingThisSeason(startedAt) {
  const out = {}
  if (!startedAt) return out
  for (const r of db.prepare(`
    SELECT owner_ref, SUM(sol_in) - SUM(sol_out) AS net
    FROM (
      SELECT seller_ref AS owner_ref, price_lamports AS sol_in, 0 AS sol_out
      FROM sales WHERE seller_ref IS NOT NULL AND ${SOL_SALES} AND sold_at >= ?
      UNION ALL
      SELECT buyer_ref AS owner_ref, 0, price_lamports
      FROM sales WHERE buyer_ref IS NOT NULL AND ${SOL_SALES} AND sold_at >= ?
    ) GROUP BY owner_ref`).all(startedAt, startedAt)) {
    out[r.owner_ref] = (r.net ?? 0) / 1e9
  }
  return out
}

/**
 * Check our derived SOL trading against the game's own /market/traders.
 *
 * We publish our figure, not theirs, for two reasons: ours is rebuildable from
 * the archive, and ours can be cut to a window, which theirs cannot be at all.
 * That makes an independent check worth having rather than optional, because
 * these numbers carry a player's name.
 *
 * Compared on lamports exactly, with a tolerance only on the count of players
 * that may legitimately differ: their snapshot is live and our sales table is
 * as fresh as the last ingest, so anyone who traded in between will differ by
 * the trades in that gap. A drift that is not explained by recency is the
 * signal worth acting on, so the newest sale we hold is reported beside it.
 */
function reconcileTrading(trading) {
  const day = db.prepare('SELECT MAX(day) d FROM traders_daily').get()?.d
  if (!day) return null
  const theirs = db.prepare(
    'SELECT player_ref, net_sol_lamports FROM traders_daily WHERE day = ?').all(day)
  if (!theirs.length) return null

  const newestSale = db.prepare('SELECT MAX(sold_at) m FROM sales').get()?.m ?? null
  let agree = 0, differ = 0, missing = 0
  let worstRef = null, worstDelta = 0
  for (const t of theirs) {
    const ours = trading[t.player_ref]
    if (!ours) { missing++; continue }
    const delta = (t.net_sol_lamports ?? 0) - Math.round(ours.realized_sol * 1e9)
    if (Math.abs(delta) <= 1) agree++
    else {
      differ++
      if (Math.abs(delta) > Math.abs(worstDelta)) { worstDelta = delta; worstRef = t.player_ref }
    }
  }
  return {
    checked_on: day,
    api_traders: theirs.length,
    agree,
    differ,
    not_in_ours: missing,
    worst_delta_sol: +(worstDelta / 1e9).toFixed(4),
    worst_ref: worstRef,
    newest_sale_held: newestSale,
    basis:
      'the game states realized SOL per player at /market/traders; we derive the same figure ' +
      'from buyer_ref and seller_ref on the sales feed and publish ours, because ours can be ' +
      'rebuilt and windowed. Players who traded between our last sales snapshot and theirs ' +
      'differ legitimately.',
  }
}

function main() {
  const day = db.prepare('SELECT MAX(day) d FROM capos_daily').get().d
  const link = resolveWalletLinks()
  console.log(`wallet links: ${link.resolved} resolved, ${link.conflicts} conflicts dropped`)

  const house = HOUSE_REFS.map((r) => `'${r}'`).join(',')

  // Roster, per player.
  const roster = db.prepare(`
    SELECT owner_ref,
           MAX(owner_display_name) AS display_name,
           COUNT(*) AS capos,
           SUM(CASE WHEN rarity='god' THEN 1 ELSE 0 END) AS god,
           SUM(CASE WHEN rarity='legendary' THEN 1 ELSE 0 END) AS legendary,
           SUM(CASE WHEN rarity='founder' THEN 1 ELSE 0 END) AS founder,
           SUM(CASE WHEN rarity='epic' THEN 1 ELSE 0 END) AS epic,
           SUM(CASE WHEN rarity='rare' THEN 1 ELSE 0 END) AS rare,
           SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN mint_address IS NOT NULL THEN 1 ELSE 0 END) AS minted,
           SUM(CASE WHEN tier='boss' THEN 1 ELSE 0 END) AS boss,
           SUM(CASE WHEN tier='underboss' THEN 1 ELSE 0 END) AS underboss,
           SUM(CASE WHEN tier='lieutenant' THEN 1 ELSE 0 END) AS lieutenant,
           SUM(CASE WHEN tier='captain' THEN 1 ELSE 0 END) AS captain,
           SUM(CASE WHEN tier='soldier' THEN 1 ELSE 0 END) AS soldier,
           SUM(CASE WHEN tier='recruit' THEN 1 ELSE 0 END) AS recruit,
           SUM(CASE WHEN julianday('now') - julianday(tier_promoted_at) <= 7 THEN 1 ELSE 0 END) AS promoted_7d,
           SUM(total_racket_invested) AS racket_invested
    FROM capos_daily
    WHERE day = ? AND owner_ref IS NOT NULL AND owner_ref NOT IN (${house})
    GROUP BY owner_ref`).all(day)

  const territory = loadTerritory()

  const combat = {}
  for (const c of db.prepare(
    `SELECT * FROM combat_daily WHERE day = (SELECT MAX(day) FROM combat_daily)`).all()) {
    combat[c.player_ref] = {
      fights: c.fights_total, won: c.fights_won,
      win_rate: c.fights_total ? +(100 * c.fights_won / c.fights_total).toFixed(1) : null,
      attacks: c.attacks_total, attacks_won: c.attacks_won,
      defenses: c.defenses_total, defenses_held: c.defenses_held,
      hold_rate: c.defenses_total ? +(100 * c.defenses_held / c.defenses_total).toFixed(1) : null,
      opponents: c.distinct_opponents, districts: c.districts_contested,
      first_fight_at: c.first_fight_at, last_fight_at: c.last_fight_at,
    }
  }

  const trainers = {}
  for (const t of db.prepare(
    `SELECT * FROM trainers_daily WHERE day = (SELECT MAX(day) FROM trainers_daily)`).all()) {
    trainers[t.trainer_ref] = {
      income:
        'three sources of the five the game itself breaks out. Hustles come from ' +
        '/capos/production and bounties from /bounties, both attributed per ' +
        'player by the API; market is realized SOL from the sales feed. ' +
        'Tournament winnings and territory income are NOT included because no ' +
        'endpoint exposes either per player, and on the game\'s own panel those ' +
        'two are around 43% of a season take. Nothing here is presented as a ' +
        'total for that reason. Only bounties support a net figure, since the ' +
        'poster and collector are both named; hustle initiation cost is a ' +
        'game-wide sink and cannot be attributed.',
      prestige: t.trainer_prestige_level,
      jobs_completed: t.trainer_jobs_completed,
      jobs_settled: t.trainer_jobs_settled,
      completion_rate: t.trainer_completion_rate,
      on_time_rate: t.trainer_on_time_rate,
      turnaround_hours: t.trainer_avg_turnaround_hours,
      rate_sol: t.rate_lamports ? t.rate_lamports / 1e9 : null,
    }
  }

  /**
   * Prestige level, for the few players who can have one attributed.
   *
   * The only per-player prestige anywhere in the API is trainer_prestige_level on
   * /contracts, so this covers players who have listed themselves as a trainer
   * and nobody else: 125 of 4,769 profiles when this was written. Game-wide 496
   * players have ever prestiged, so even among those who have one, three in four
   * are unknowable. An absent prestige on a profile therefore means "not visible
   * to us", never "level zero", and the page has to say so rather than let a
   * missing badge read as an absence.
   *
   * Last known level rather than currently listed. A trainer who delists still
   * had the level we saw, and dropping it would lose a fact the archive holds.
   * The day it was seen travels with it, because the level does move: 9 of 125
   * trainers changed level inside five days of archive.
   */
  const levelStats = prestigeLevels()
  const prestige = {}
  for (const r of db.prepare(`
    SELECT t.trainer_ref, t.trainer_prestige_level AS level, t.day
    FROM trainers_daily t
    JOIN (SELECT trainer_ref, MAX(day) AS day FROM trainers_daily
          WHERE trainer_prestige_level IS NOT NULL GROUP BY trainer_ref) m
      ON m.trainer_ref = t.trainer_ref AND m.day = t.day
    WHERE t.trainer_prestige_level IS NOT NULL`).all()) {
    const stat = levelStats[r.level] || {}
    prestige[r.trainer_ref] = {
      level: r.level,
      seen_on: r.day,
      holders: stat.holders ?? null,
      holders_pct: stat.holders_pct ?? null,
      source: 'trainer listing',
    }
  }

  const wallets = {}
  for (const w of db.prepare('SELECT wallet, owner_ref FROM wallet_links').all()) {
    ;(wallets[w.owner_ref] ||= []).push(w.wallet)
  }

  const listings = {}
  for (const l of db.prepare(`
    SELECT seller_ref, COUNT(*) n, SUM(price_lamports) lamports
    FROM listings WHERE seller_ref IS NOT NULL GROUP BY seller_ref`).all()) {
    listings[l.seller_ref] = { active: l.n, asking_sol: (l.lamports || 0) / 1e9 }
  }

  // Name history falls out of the archive for free, because every snapshot
  // stores the display name next to the stable ref.
  const names = {}
  for (const n of db.prepare(`
    SELECT owner_ref, owner_display_name AS name, MIN(day) AS first_day, MAX(day) AS last_day
    FROM capos_daily WHERE owner_display_name IS NOT NULL
    GROUP BY owner_ref, owner_display_name`).all()) {
    ;(names[n.owner_ref] ||= []).push({ name: n.name, from: n.first_day, to: n.last_day })
  }

  // Season prize winnings, from the on-chain reward capture. Realized USD income,
  // per player, across every captured season. Keyed on owner_ref like everything
  // else. Absent file (no capture yet) degrades to an empty map, not an error.
  // Read the ledger's per-player all_time rows rather than re-summing the season
  // bursts. Re-summing is what made a profile disagree with the Prizes page: the
  // board counted every treasury payout while a profile counted only season
  // bursts, so daily prizes and bounties went missing on one surface. One source,
  // one number. by_season is still built from the season list for the breakdown.
  const prizeByRef = {}
  try {
    const led = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'rewards', 'season-ledger.json'), 'utf8'))
    for (const w of led.all_time || []) {
      if (!w.owner_ref) continue
      prizeByRef[w.owner_ref] = {
        total_usd: w.usdc,
        season_usd: w.season_usdc,
        daily_usd: w.daily_usdc,
        bounty_usd: w.bounty_usdc,
        other_usd: w.other_usdc,
        // SOL, deliberately not converted: there is no price feed here.
        sol_bounties: w.sol_bounties,
        seasons_won: w.seasons_won,
        by_season: [],
        latest_usd: 0,
      }
    }
    for (const s of led.seasons || []) {
      for (const w of s.ledger || []) {
        if (!w.owner_ref || !prizeByRef[w.owner_ref]) continue
        prizeByRef[w.owner_ref].by_season.push({ season: s.season, usd: w.usdc })
      }
    }
    const latest = (led.seasons || [])[0]?.season
    for (const p of Object.values(prizeByRef)) {
      p.by_season.sort((a, b) => b.season - a.season)
      p.latest_usd = p.by_season.find((x) => x.season === latest)?.usd ?? 0
    }
  } catch { /* no capture yet */ }

  const trading = tradingByPlayer()
  const production = loadProduction()
  const benchmarks = classBenchmarks(production.rows)
  const daily = dailyEarnings()
  const season = seasonInfo()
  const bounties = bountyIncome(season?.season ?? null)
  const seasonTrading = tradingThisSeason(season?.started_at ?? null)
  const recon = reconcileTrading(trading)

  const comps = buildCompTable(db)
  const floors = buildFloorTable(db)
  const holdings = valuePortfolios(db, day, comps, HOUSE_REFS)

  /**
   * SOL net position: cash already realized plus the mark on what is still held.
   *
   * The two halves do not double count. realized_sol is a cash flow (received
   * from sales, less paid on buys) and portfolio_sol is the current value of the
   * inventory those buys produced, so a capo bought for 0.10 and still held
   * shows as -0.10 realized and +0.13 held, netting the unrealized gain.
   *
   * What it deliberately does not include is pack and fiat entry cost, which the
   * API and the chain both withhold. A player who spent nothing and one who
   * spent thousands on packs are indistinguishable here, so this is a SOL
   * position, not lifetime profit. Null when the player has neither side, so the
   * page can say "no position" rather than render a zero that looks like
   * breaking even.
   */
  function netPosition(ref) {
    const t = trading[ref]
    const h = holdings[ref]
    const prize = prizeByRef[ref]
    const hasHoldings = h && h.priced_capos > 0
    if (!t && !hasHoldings && !prize) return null
    const realized = t?.realized_sol ?? 0
    const held = hasHoldings ? h.portfolio_sol : 0
    return {
      realized_sol: +realized.toFixed(4),
      portfolio_sol: +held.toFixed(4),
      net_sol: +(realized + held).toFixed(4),
      // Prize winnings are realized USD income, kept in their own currency rather
      // than blended into the SOL figure (there is no price feed to convert on).
      // With pack spend still missing, this is the one hard-money inflow we can
      // book, so it is the closest thing to real profit on the page.
      prize_usd: prize ? prize.total_usd : 0,
      excludes: 'pack and fiat entry cost, which is not exposed anywhere',
    }
  }

  const players = roster.map((r) => ({
    ref: r.owner_ref,
    name: r.display_name,
    roster: {
      capos: r.capos, active: r.active, minted: r.minted,
      god: r.god, legendary: r.legendary, founder: r.founder,
      epic: r.epic, rare: r.rare,
      racket_invested: r.racket_invested,
    },
    ranks: {
      // The rank ladder, high to low. Rank is earned by promotion (paid in
      // RACKET), so promotion_spend_racket below is the cost of climbing it.
      boss: r.boss, underboss: r.underboss, lieutenant: r.lieutenant,
      captain: r.captain, soldier: r.soldier, recruit: r.recruit,
      promoted_7d: r.promoted_7d,
      // total_racket_invested is the RACKET a player has sunk into promotions,
      // one of the only per-account RACKET figures the API exposes.
      promotion_spend_racket: r.racket_invested,
    },
    // RACKET earned by the whole account. Null rather than zero when the player
    // owns nothing that has ever earned, because "has not earned" and "earns
    // nothing" read the same as a zero and are not the same claim.
    earnings: production.byRef[r.owner_ref]
      ? { ...production.byRef[r.owner_ref], daily: daily.byRef[r.owner_ref] ?? [] }
      : null,
    prestige: prestige[r.owner_ref] ?? null,
    /**
     * Where the account's money came from, season and lifetime.
     *
     * Three sources, not five. Tournament winnings and territory income are both
     * real and both invisible: no endpoint exposes either per player, and the
     * game's own panel shows them at roughly 43% of a season take. So this is
     * deliberately NOT presented as a total, and the page says which pieces are
     * missing rather than quietly summing what is left.
     */
    income: (() => {
      const e = production.byRef[r.owner_ref]
      const b = bounties[r.owner_ref]
      const t = trading[r.owner_ref]
      if (!e && !b && !t) return null
      return {
        // Null, not zero, when no production snapshot exists yet. Zero would
        // claim the account earned nothing, which is a measurement we have not
        // made. That is the state every fresh deploy is in for its first day.
        hustles: e
          ? { season: e.season_racket, all_time: e.lifetime_racket }
          : null,
        bounties: b
          ? {
              season: b.season_collected, season_spent: b.season_posted,
              season_collections: b.season_collections,
              all_time: b.collected, all_time_spent: b.posted,
              all_time_collections: b.collections,
            }
          : null,
        market_sol: {
          season: seasonTrading[r.owner_ref] != null
            ? +seasonTrading[r.owner_ref].toFixed(4) : null,
          all_time: t ? +t.realized_sol.toFixed(4) : null,
        },
      }
    })(),
    combat: combat[r.owner_ref] ?? null,
    territory: territory[r.owner_ref] ?? null,
    trainer: trainers[r.owner_ref] ?? null,
    listings: listings[r.owner_ref] ?? null,
    wallets: wallets[r.owner_ref] ?? [],
    trading: trading[r.owner_ref] ?? null,
    holdings: holdings[r.owner_ref] ?? null,
    position: netPosition(r.owner_ref),
    prizes: prizeByRef[r.owner_ref] ?? null,
    names: (names[r.owner_ref] ?? []).length > 1 ? names[r.owner_ref] : null,
  }))

  players.sort((a, b) => (b.combat?.won ?? 0) - (a.combat?.won ?? 0) || b.roster.capos - a.roster.capos)

  const payload = {
    generated_at: new Date().toISOString(),
    as_of_day: day,
    player_count: players.length,
    wallets_resolved: Object.keys(wallets).length,
    position_players: players.filter((p) => p.position).length,
    position_net_positive: players.filter((p) => p.position?.net_sol > 0).length,
    // Stated on the page: this is what a visitor needs in order to read a
    // missing PnL figure correctly rather than as a zero.
    earnings_as_of: production.as_of,
    earning_owners: production.owners,
    // Keyed rarity|tier. 42 cells at most, so it rides in the page payload
    // rather than costing a fetch.
    class_benchmarks: benchmarks,
    season: season,
    // How many days of differenced earnings exist at all. The page states this
    // rather than implying a full week it does not have.
    earnings_daily: {
      days: daily.days, window: daily.window, first_snapshot: daily.first_snapshot,
    },
    trading_reconciliation: recon,
    coverage: {
      racket_earnings:
        'RACKET earned per account, summed from /capos/production over every capo the player ' +
        'owns. Lifetime, current season, and the last 7 and 30 days are all stated by the game ' +
        'per capo, so the windows are theirs rather than differences between our snapshots. It ' +
        'covers capos that have earned at all: a player with none is reported as having no ' +
        'earnings record rather than as zero. Side-hustle earnings only, which is the only ' +
        'earnings stream the API breaks out per capo.',
      prestige:
        'only for players who have listed themselves as a trainer, because ' +
        'trainer_prestige_level on /contracts is the sole per-player prestige ' +
        'figure in the API; /prestige is aggregate and carries no identities. ' +
        'That is a small minority of profiles, and 3 of every 4 players who have ' +
        'prestiged cannot be named at all, so no prestige shown means not visible ' +
        'rather than level zero. The level is the last one we observed, dated.',
      sol_trading:
        'realized secondary-market trading only, attributed per player from the buyer_ref and ' +
        'seller_ref on each sale; pack purchases are not in the API so money spent entering the ' +
        'game is not counted. Tensor sales only: in-game sales are priced in RACKET and carry a ' +
        'converted lamport figure alongside, which the game itself leaves out of SOL trading.',
      holdings:
        'mark-to-market on tradeable capos only, priced at the median comparable sale by rarity ' +
        'and tier. Only minted capos are tradeable (all rare and above, none common or uncommon), ' +
        'so roughly 12% of held capos carry a value here; the rest are counted as untradeable ' +
        'rather than as zero. Equipment is excluded entirely because /equipment exposes no owner ' +
        'field, so items cannot be attributed to a player.',
      net_position:
        'realized SOL plus the mark on capos still held. A genuine SOL position, but not ' +
        'lifetime profit: pack and fiat entry cost is missing on the spend side, so a player ' +
        'who bought in heavily and one who started free look the same.',
      pack_spend:
        'not available at any price. Packs are bought with SOL, USDC, card, Contraband or RACKET ' +
        'and none of it is exposed: /market/sales carries secondary trades only (sources tensor ' +
        'and in_game), /economy is a system-wide RACKET aggregate, and on chain the capos arrive ' +
        'as compressed-NFT mints the game pays for, so no purchase leaves the player wallet. Any ' +
        'PNL here is therefore trading PNL, not lifetime profit.',
    },
    market: {
      comp_window_days: comps.window_days,
      capo_medians_sol: Object.fromEntries(
        [...new Set([
          ...Object.keys(comps.rarity), ...Object.keys(comps.rarityWide),
        ])].map((k) => {
          const p = effectiveRarityPrice(comps, k)
          return [k, {
            median_sol: p.lamports == null ? null : +(p.lamports / 1e9).toFixed(4),
            sales: p.n,
            basis: p.basis,
          }]
        }),
      ),
      listing_floors_sol: Object.fromEntries(
        Object.entries(floors).map(([k, v]) => [
          k, { floor_sol: +(v.floor_lamports / 1e9).toFixed(4), listings: v.listings },
        ]),
      ),
    },
    players,
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(payload))
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0)
  console.log(`players: ${players.length}, wallets resolved: ${Object.keys(wallets).length}`)
  console.log(`with trading data: ${Object.keys(trading).length}`)
  const earners = players.filter((p) => p.earnings)
  if (earners.length) {
    const totalRacket = earners.reduce((s, p) => s + p.earnings.lifetime_racket, 0)
    console.log(
      `earnings: ${earners.length} accounts have earned, ` +
      `${totalRacket.toLocaleString('en-US')} RACKET lifetime`)
  } else {
    console.log('earnings: no capos_production snapshot found, earnings omitted')
  }
  console.log(
    `season: ${season ? `${season.season}, day ${season.day}` : 'unknown'}` +
    `, bounty income for ${Object.keys(bounties).length} players`)
  console.log(
    `daily earnings: ${daily.days.length} differenced day(s) ` +
    `(${daily.days.join(', ') || 'none yet, needs a second daily snapshot'})`)
  console.log(
    `prestige: ${Object.keys(prestige).length} players attributable, ` +
    `of ${Object.values(levelStats).reduce((a, l) => a + (l.holders || 0), 0)} who have prestiged`)
  console.log(
    `class benchmarks: ${Object.keys(benchmarks.cells).length} rarity/rank cells ` +
    `and ${Object.keys(benchmarks.ranks).length} rank fallbacks, ` +
    `at least ${benchmarks.min_sample} earning capos each`)
  if (recon) {
    console.log(
      `trading check vs /market/traders (${recon.checked_on}): ` +
      `${recon.agree} agree, ${recon.differ} differ, ${recon.not_in_ours} not in ours` +
      (recon.differ ? `, worst ${recon.worst_delta_sol} SOL` : ''))
  }
  const valued = players.filter((p) => (p.holdings?.portfolio_sol ?? 0) > 0)
  const totalSol = valued.reduce((s, p) => s + p.holdings.portfolio_sol, 0)
  console.log(
    `holdings: ${valued.length} players with a tradeable portfolio, ` +
    `${totalSol.toFixed(1)} SOL total`)
  const pos = players.filter((p) => p.position)
  const up = pos.filter((p) => p.position.net_sol > 0).length
  console.log(
    `position: ${pos.length} players with a SOL position, ${up} net positive, ` +
    `${(pos.reduce((s, p) => s + p.position.net_sol, 0)).toFixed(1)} SOL combined`)
  console.log(`written ${path.relative(ROOT, OUT)} (${kb} KB)`)
  db.close()
}

main()
