#!/usr/bin/env node
/**
 * Generate per-section JSON for the site.
 *
 * Data is fetched by the pages at runtime rather than baked into the HTML, so
 * the markup deploys rarely and only these files move. That is what makes a
 * ~1 minute refresh cheap; inlining would mean redeploying megabytes of HTML
 * every time a number changed.
 *
 * Usage: node derive/sections.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'data', 'site')

const db = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'))
const all = (sql, ...p) => db.prepare(sql).all(...p)
const one = (sql, ...p) => db.prepare(sql).get(...p)

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'god', 'founder']
// The rank ladder, lowest to highest. Rank is earned by promotion (paid in
// RACKET), distinct from rarity, which is fixed at mint.
const RANKS = ['recruit', 'soldier', 'captain', 'lieutenant', 'underboss', 'boss']
const HOUSE_REFS = ['321736cb06706777a208f2becdd4d959']
const LAMPORTS = 1e9

function write(name, obj) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const f = path.join(OUT_DIR, name + '.json')
  fs.writeFileSync(f, JSON.stringify(obj))
  console.log(`  ${name}.json  ${(fs.statSync(f).size / 1024).toFixed(0)} KB`)
}

const generated_at = new Date().toISOString()

// ------------------------------------------------------------------ money ---
function money() {
  const emissions = all(
    'SELECT day, minted, burned, net FROM economy_daily ORDER BY day')

  const sinks = all(`
    SELECT type, total FROM economy_sinks
    WHERE captured_at = (SELECT MAX(captured_at) FROM economy_sinks)
    ORDER BY total ASC`)

  const totals = one('SELECT * FROM economy_totals ORDER BY captured_at DESC LIMIT 1')

  // Secondary market volume per day, in SOL. Junk pre-2026 rows are excluded:
  // 29 sales carry 2022/2024 timestamps with suspiciously round prices on a
  // game whose own supply history starts 2026-05-13.
  const volume = all(`
    SELECT substr(sold_at, 1, 10) AS day,
           COUNT(*) AS sales,
           SUM(price_lamports) / 1000000000.0 AS sol
    FROM sales
    WHERE sold_at >= '2026-01-01' AND price_lamports IS NOT NULL
    GROUP BY day ORDER BY day`)

  const priceBand = all(`
    SELECT rarity,
           COUNT(*) AS sales,
           ROUND(MIN(price_lamports) / 1000000000.0, 4) AS min_sol,
           ROUND(AVG(price_lamports) / 1000000000.0, 4) AS avg_sol,
           ROUND(MAX(price_lamports) / 1000000000.0, 4) AS max_sol
    FROM sales
    WHERE sold_at >= '2026-01-01' AND rarity IS NOT NULL AND asset_kind = 'capo'
    GROUP BY rarity ORDER BY avg_sol DESC`)

  // How the market actually clears. Volume and price say what changed hands;
  // none of it says how long a seller waits or whether they get their ask.
  // Time on market only exists because we snapshot listings and then see the
  // sale: the API has no sold-at-listing link and no concept of a closed listing.
  const cleared = all(`
    SELECT l.price_lamports AS ask, s.price_lamports AS got, l.listed_at, s.sold_at
    FROM listings l
    JOIN sales s ON s.capo_id = l.capo_id AND s.sold_at >= l.listed_at
    WHERE l.capo_id IS NOT NULL AND l.price_lamports > 0 AND s.price_lamports > 0`)

  const pctl = (arr, p) => {
    const a = arr.filter((x) => x != null && !Number.isNaN(x)).sort((x, y) => x - y)
    return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : null
  }
  const hours = cleared
    .map((r) => (Date.parse(r.sold_at) - Date.parse(r.listed_at)) / 3.6e6)
    .filter((h) => h >= 0)
  const vsAsk = cleared.map((r) => ((r.got - r.ask) / r.ask) * 100)

  const liveListed = one(`
    SELECT COUNT(*) n, AVG(price_lamports) / 1000000000.0 avg_sol FROM listings
    WHERE last_seen_at = (SELECT MAX(last_seen_at) FROM listings)`)
  const sold7 = one(
    "SELECT COUNT(*) n FROM sales WHERE sold_at >= datetime('now', '-7 days')").n

  const liquidity = {
    matched: cleared.length,
    hours_to_sell: {
      p25: +pctl(hours, 0.25)?.toFixed(1),
      median: +pctl(hours, 0.5)?.toFixed(1),
      p75: +pctl(hours, 0.75)?.toFixed(1),
    },
    vs_ask_pct: {
      p25: +pctl(vsAsk, 0.25)?.toFixed(1),
      median: +pctl(vsAsk, 0.5)?.toFixed(1),
      p75: +pctl(vsAsk, 0.75)?.toFixed(1),
    },
    sold_at_or_above_ask_pct: vsAsk.length
      ? +((vsAsk.filter((v) => v >= 0).length / vsAsk.length) * 100).toFixed(1)
      : null,
    listed_now: liveListed.n,
    avg_ask_sol: liveListed.avg_sol ? +liveListed.avg_sol.toFixed(3) : null,
    sold_7d: sold7,
    // Weeks of inventory: how long the current shelf would last at the recent
    // clearing rate. Below one means the market absorbs everything on offer.
    weeks_of_inventory: sold7 ? +(liveListed.n / sold7).toFixed(2) : null,
  }

  return {
    generated_at,
    totals,
    emissions,
    liquidity,
    sinks: {
      spend: sinks.filter((s) => s.total < 0).map((s) => ({ ...s, total: Math.abs(s.total) })),
      income: sinks.filter((s) => s.total > 0).sort((a, b) => b.total - a.total),
    },
    market: { volume, price_band: priceBand },
  }
}

// ------------------------------------------------------------------- wars ---
function wars() {
  const day = one('SELECT MAX(day) d FROM combat_daily').d

  const players = all(`
    SELECT display_name, player_ref, fights_total, fights_won,
           attacks_total, attacks_won, defenses_total, defenses_held,
           passion_flips_for, passion_flips_against,
           distinct_opponents, districts_contested, last_fight_at
    FROM combat_daily WHERE day = ? AND fights_total > 0
    ORDER BY fights_won DESC`, day)

  // Win-rate distribution over players with a meaningful sample. Buckets rather
  // than a scatter: the question is "where does the field sit", not "who".
  const MIN = 50
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    from: i * 10, to: i * 10 + 10, players: 0,
  }))
  let counted = 0
  for (const p of players) {
    if (p.fights_total < MIN) continue
    const rate = (100 * p.fights_won) / p.fights_total
    const idx = Math.min(9, Math.floor(rate / 10))
    buckets[idx].players++
    counted++
  }

  // Attack vs defence: does the field win more by attacking or holding?
  const agg = players.reduce(
    (a, p) => ({
      attacks: a.attacks + (p.attacks_total || 0),
      attacks_won: a.attacks_won + (p.attacks_won || 0),
      defenses: a.defenses + (p.defenses_total || 0),
      defenses_held: a.defenses_held + (p.defenses_held || 0),
      flips_for: a.flips_for + (p.passion_flips_for || 0),
    }),
    { attacks: 0, attacks_won: 0, defenses: 0, defenses_held: 0, flips_for: 0 },
  )

  const cityDay = one('SELECT MAX(day) d FROM cities_daily')?.d
  const cities = cityDay
    ? all(`
      SELECT city_name, league, season_number, current_player_count, max_players,
             total_districts, districts_occupied, season_ends_at
      FROM cities_daily
      WHERE day = ? AND is_active = 1
      ORDER BY league, current_player_count DESC`, cityDay)
    : []

  const leagues = cityDay
    ? all(`
      SELECT league, COUNT(*) AS cities,
             SUM(current_player_count) AS players,
             SUM(max_players) AS capacity,
             SUM(total_districts) AS districts,
             SUM(districts_occupied) AS occupied
      FROM cities_daily WHERE day = ? AND is_active = 1
      GROUP BY league ORDER BY players DESC`, cityDay)
    : []

  // The balance fact nobody states: every attack is somebody's defence, so these
  // two rates are the same contest counted from both ends and must sum to 100.
  // Defending wins it by better than two to one.
  const bal = one(`
    SELECT SUM(attacks_total) atk, SUM(attacks_won) atk_won,
           SUM(defenses_total) def, SUM(defenses_held) def_held,
           SUM(passion_flips_for) flips_for, SUM(passion_flips_against) flips_against,
           AVG(distinct_opponents) opponents, AVG(districts_contested) districts
    FROM combat_daily WHERE day = ?`, day)
  const balance = {
    attacks: bal.atk,
    attack_win_rate: bal.atk ? +((100 * bal.atk_won) / bal.atk).toFixed(1) : null,
    defence_hold_rate: bal.def ? +((100 * bal.def_held) / bal.def).toFixed(1) : null,
    passion_flips_for: bal.flips_for,
    passion_flips_against: bal.flips_against,
    avg_distinct_opponents: bal.opponents ? +bal.opponents.toFixed(1) : null,
    avg_districts_contested: bal.districts ? +bal.districts.toFixed(1) : null,
  }

  return {
    generated_at,
    as_of: day,
    population: players.length,
    aggregate: agg,
    balance,
    win_rate_distribution: { min_fights: MIN, players_counted: counted, buckets },
    top_by_wins: players.slice(0, 25),
    top_by_defence: players
      .filter((p) => p.defenses_total >= 100)
      .map((p) => ({ ...p, hold_rate: +(100 * p.defenses_held / p.defenses_total).toFixed(1) }))
      .sort((a, b) => b.hold_rate - a.hold_rate)
      .slice(0, 25),
    cities,
    leagues,
  }
}

// ----------------------------------------------------------------- growth ---
function growth() {
  // Supply history carries a per-rarity breakdown, which is the one deep
  // time series with composition in it.
  const rows = all('SELECT date, total, burned_total, per_rarity FROM supply_daily ORDER BY date')
  const supply = rows.map((r) => {
    const per = JSON.parse(r.per_rarity || '{}')
    return {
      date: r.date, total: r.total, burned: r.burned_total,
      ...Object.fromEntries(RARITIES.map((k) => [k, per[k] ?? 0])),
    }
  })

  const day = one('SELECT MAX(day) d FROM capos_daily').d

  const bySeason = all(`
    SELECT season_created AS season, COUNT(*) AS capos
    FROM capos_daily WHERE day = ? AND season_created IS NOT NULL
    GROUP BY season_created ORDER BY season_created`, day)

  const byRarity = all(`
    SELECT rarity, COUNT(*) AS capos,
           SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active
    FROM capos_daily WHERE day = ? GROUP BY rarity`, day)

  // Roster-size distribution: how concentrated is ownership?
  const holdings = all(`
    SELECT capos, COUNT(*) AS owners FROM (
      SELECT owner_ref, COUNT(*) AS capos FROM capos_daily
      WHERE day = ? AND owner_ref IS NOT NULL GROUP BY owner_ref)
    GROUP BY capos ORDER BY capos`, day)

  const buckets = [
    { label: '1', min: 1, max: 1 }, { label: '2-5', min: 2, max: 5 },
    { label: '6-20', min: 6, max: 20 }, { label: '21-50', min: 21, max: 50 },
    { label: '51-200', min: 51, max: 200 }, { label: '200+', min: 201, max: 1e9 },
  ].map((b) => ({
    label: b.label,
    owners: holdings.filter((h) => h.capos >= b.min && h.capos <= b.max)
      .reduce((a, h) => a + h.owners, 0),
    capos: holdings.filter((h) => h.capos >= b.min && h.capos <= b.max)
      .reduce((a, h) => a + h.owners * h.capos, 0),
  }))

  const totals = one('SELECT * FROM economy_totals ORDER BY captured_at DESC LIMIT 1')

  return {
    generated_at,
    as_of: day,
    supply,
    by_season: bySeason,
    by_rarity: byRarity,
    ownership: buckets,
    wallet_count: totals?.wallet_count ?? null,
    owners: one('SELECT COUNT(DISTINCT owner_ref) n FROM capos_daily WHERE day=?', day).n,
    players: playerActivity(),
  }
}

/**
 * Rank, promotions and promotion spend.
 *
 * Rank (recruit..boss) is earned by promotion, which costs RACKET, so this is
 * one of the very few per-capo RACKET flows the API exposes. tier_promoted_at
 * dates each capo's CURRENT rank, the only promotion timestamp available, so
 * "promotions in season N" means capos that reached their current rank in that
 * season. It undercounts intermediate steps for a capo promoted more than once,
 * which is stated on the page. A true event history will build itself once the
 * daily archive has enough days to diff tier per capo; today it is one to two
 * days deep, so tier_promoted_at is the only historical signal there is.
 */
function ranksSection(day) {
  const HOUSE = HOUSE_REFS.map((r) => `'${r}'`).join(',')

  // The pyramid: how many capos sit at each rank right now.
  const counts = Object.fromEntries(RANKS.map((r) => [r, 0]))
  for (const r of all(
    `SELECT tier, COUNT(*) n FROM capos_daily WHERE day = ? AND tier IS NOT NULL GROUP BY tier`, day)) {
    if (r.tier in counts) counts[r.tier] = r.n
  }
  const pyramid = RANKS.map((rank) => ({ rank, capos: counts[rank] }))

  // Season windows, derived from the data rather than guessed: each real season
  // starts at the earliest creation stamp of a capo minted in it, and runs until
  // the next season starts. Non-overlapping by construction, which the raw
  // min/max ranges are not (season 1 is a long launch window).
  const starts = all(`
    SELECT season_created AS season, MIN(created_at) AS start
    FROM capos_daily
    WHERE day = ? AND season_created BETWEEN 1 AND 99 AND created_at IS NOT NULL
    GROUP BY season_created
    HAVING COUNT(*) >= 50
    ORDER BY start`, day)

  const promotionsBySeason = starts.map((s, i) => {
    const end = starts[i + 1]?.start ?? null
    const row = end
      ? one(`SELECT COUNT(*) n FROM capos_daily
             WHERE day = ? AND tier_promoted_at >= ? AND tier_promoted_at < ?`, day, s.start, end)
      : one(`SELECT COUNT(*) n FROM capos_daily
             WHERE day = ? AND tier_promoted_at >= ?`, day, s.start)
    return { season: s.season, start: s.start.slice(0, 10), promotions: row.n }
  })

  // Rank leaderboard: every player who holds at least one boss, no cutoff.
  // Ordered by boss, then down the ladder, so ties resolve by the next rank.
  const rankLeaders = all(`
    SELECT owner_ref,
           MAX(owner_display_name) AS name,
           SUM(CASE WHEN tier='boss' THEN 1 ELSE 0 END) AS boss,
           SUM(CASE WHEN tier='underboss' THEN 1 ELSE 0 END) AS underboss,
           SUM(CASE WHEN tier='lieutenant' THEN 1 ELSE 0 END) AS lieutenant,
           SUM(CASE WHEN tier='captain' THEN 1 ELSE 0 END) AS captain,
           COUNT(*) AS capos
    FROM capos_daily
    WHERE day = ? AND owner_ref IS NOT NULL AND owner_ref NOT IN (${HOUSE})
    GROUP BY owner_ref
    HAVING boss > 0
    ORDER BY boss DESC, underboss DESC, lieutenant DESC, captain DESC`, day)

  // Promotions in the last 7 days, by player, full list. tier_promoted_at within
  // the window is a promotion event; a capo almost never promotes twice in a
  // week, so this is an accurate weekly count even though the field only holds
  // the latest step. Rendered as top-N bars plus a full scrollable table.
  const promotionLeaders = all(`
    SELECT owner_ref,
           MAX(owner_display_name) AS name,
           COUNT(*) AS promotions
    FROM capos_daily
    WHERE day = ? AND owner_ref IS NOT NULL AND owner_ref NOT IN (${HOUSE})
      AND julianday('now') - julianday(tier_promoted_at) <= 7
    GROUP BY owner_ref
    ORDER BY promotions DESC`, day)

  const promotedLast7d = one(`
    SELECT COUNT(*) n FROM capos_daily
    WHERE day = ? AND julianday('now') - julianday(tier_promoted_at) <= 7`, day).n

  // Promotion spend is real RACKET out of pocket, and one of the only per-capo
  // RACKET figures the API gives. Summed across all capos for the ecosystem total.
  const spend = one(`
    SELECT SUM(total_racket_invested) AS racket, COUNT(*) AS capos
    FROM capos_daily WHERE day = ? AND total_racket_invested > 0`, day)

  return {
    pyramid,
    promotions_by_season: promotionsBySeason,
    rank_leaders: rankLeaders,
    promotion_leaders: promotionLeaders,
    promoted_last_7d: promotedLast7d,
    promotion_spend_racket: spend?.racket ?? 0,
    capos_with_investment: spend?.capos ?? 0,
  }
}

/**
 * Player acquisition and activity.
 *
 * Unusually for this project, none of this needs archive history: combat rows
 * carry first_fight_at and last_fight_at per player, so the entire curve since
 * launch is computable from one snapshot. Contrast with earnings, where the API
 * reports only lifetime totals and history exists solely because we recorded it.
 *
 * Caveat carried through to the page: this counts players who have FOUGHT.
 * Someone who only runs hustles never appears in the combat feed, so these are
 * combat-active players, not the whole player base.
 */
function playerActivity() {
  const day = one('SELECT MAX(day) d FROM combat_daily').d

  const recency = one(`
    SELECT
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) <= 1  THEN 1 ELSE 0 END) AS d1,
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) <= 7  THEN 1 ELSE 0 END) AS d7,
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) <= 30 THEN 1 ELSE 0 END) AS d30,
      COUNT(*) AS ever
    FROM combat_daily WHERE day = ?`, day)

  const daily = all(`
    SELECT substr(first_fight_at, 1, 10) AS date, COUNT(*) AS new_players
    FROM combat_daily
    WHERE day = ? AND first_fight_at IS NOT NULL
    GROUP BY date ORDER BY date`, day)

  let run = 0
  const series = daily.map((d) => {
    run += d.new_players
    return { date: d.date, new_players: d.new_players, cumulative: run }
  })

  // Cohort retention: of the players who first fought in a given week, how many
  // have fought in the last 7 days. A real retention curve, not a proxy.
  const cohorts = all(`
    SELECT strftime('%Y-W%W', first_fight_at) AS cohort,
           MIN(substr(first_fight_at, 1, 10)) AS starts,
           COUNT(*) AS players,
           SUM(CASE WHEN julianday('now') - julianday(last_fight_at) <= 7 THEN 1 ELSE 0 END) AS still_active
    FROM combat_daily
    WHERE day = ? AND first_fight_at IS NOT NULL
    GROUP BY cohort ORDER BY cohort`, day)
    .map((c) => {
      // A cohort younger than the 7 day retention window is not comparable:
      // its members cannot yet have gone quiet, so it always reads 100%.
      // Flagged rather than dropped, so the number is still inspectable.
      const ageDays = (Date.now() - new Date(c.starts + 'T00:00:00Z')) / 86400000
      return {
        ...c,
        retained_pct: c.players ? +(100 * c.still_active / c.players).toFixed(1) : 0,
        incomplete: ageDays < 14,
      }
    })

  // Exclusive recency bands. The cumulative figures above are right for tiles
  // but wrong for a chart, where nested buckets would double-count players.
  const bands = one(`
    SELECT
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) <= 1 THEN 1 ELSE 0 END) AS b1,
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) > 1
                AND julianday('now') - julianday(last_fight_at) <= 7 THEN 1 ELSE 0 END) AS b7,
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) > 7
                AND julianday('now') - julianday(last_fight_at) <= 30 THEN 1 ELSE 0 END) AS b30,
      SUM(CASE WHEN julianday('now') - julianday(last_fight_at) > 30 THEN 1 ELSE 0 END) AS older
    FROM combat_daily WHERE day = ?`, day)

  const cityDay = one('SELECT MAX(day) d FROM cities_daily')?.d
  const seats = cityDay
    ? one(`SELECT SUM(current_player_count) AS seated, SUM(max_players) AS capacity
           FROM cities_daily WHERE day = ? AND is_active = 1`, cityDay)
    : { seated: null, capacity: null }

  return {
    as_of: day,
    basis: 'players who have fought at least once; hustle-only players never appear in the combat feed',
    recency,
    bands,
    daily: series,
    cohorts,
    seats,
  }
}

// ------------------------------------------------------------------ capos ---
/**
 * The capo breakdown page: rarity, rank, age and progression in one place.
 *
 * Rarity is fixed at mint; rank is earned by promotion; age is time since
 * creation. Progression is how the three interact, so the cross-tab of rank by
 * rarity is the point of the page rather than an afterthought: it shows whether
 * players bother ranking up commons or reserve promotion RACKET for the good ones.
 */
/**
 * What each rung of the promotion ladder costs, in RACKET.
 *
 * Measured from the same capo either side of a promotion: consecutive snapshots
 * where tier changed, differencing its cumulative total_racket_invested. That is
 * what the capo's owner actually paid to move up.
 *
 * The obvious shortcut is wrong and was shipped once. Taking the median spend of
 * capos now at boss and subtracting the median of capos now at underboss put the
 * last rung at 2,595,272 when it is 1,942,000, a 656,502 overstatement across
 * the ladder. Two different populations: a boss keeps buying training after it
 * is promoted, so its lifetime total is not what it had spent on promotion day,
 * and the underboss it is compared against is a capo that never made the jump.
 *
 * Non-positive deltas are dropped. A tier change with no change in spend is the
 * snapshot pair landing either side of the payment rather than a free promotion,
 * and it affects the count without moving any median (verified: identical
 * medians with and without them).
 *
 * The price is not quite fixed. Legendary, god and founder capos are seen paying
 * around 10% less at several rungs, and the boss step ranges from 1,800,000 to
 * 2,200,000 across the only 19 promotions anyone has made. p25 and p75 ship so a
 * consumer can see the spread, and the promotion count ships so a thin rung
 * cannot be mistaken for a firm price.
 */
function promotionCost() {
  const rows = all(`SELECT tier, total_racket_invested AS inv,
                           LAG(tier) OVER w AS pt,
                           LAG(total_racket_invested) OVER w AS pi
                    FROM capos_daily
                    WINDOW w AS (PARTITION BY capo_id ORDER BY day)`)

  const q = (v, p) => v[Math.floor(p * (v.length - 1))]
  const out = []
  let cumulative = 0
  for (let i = 1; i < RANKS.length; i++) {
    const from = RANKS[i - 1], to = RANKS[i]
    const v = rows.filter((r) => r.pt === from && r.tier === to)
      .map((r) => r.inv - r.pi).filter((d) => d > 0).sort((a, b) => a - b)
    if (!v.length) continue
    const step = q(v, 0.5)
    cumulative += step
    out.push({
      tier: to, from, promotions: v.length,
      step, total: cumulative, p25: q(v, 0.25), p75: q(v, 0.75),
    })
  }
  return out
}

function capos() {
  const day = one('SELECT MAX(day) d FROM capos_daily').d

  const byRarity = RARITIES.map((rarity) => {
    const r = one(`
      SELECT COUNT(*) AS capos,
             SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active
      FROM capos_daily WHERE day = ? AND rarity = ?`, day, rarity)
    return { rarity, capos: r.capos, active: r.active ?? 0 }
  }).filter((r) => r.capos > 0)

  // Age is the in-game age, not calendar age. A capo is born at 25 and gains a
  // year every season (7 days, Monday to Monday), so age = 25 + seasons lived.
  // Verified against the API's own age field: 25 + (current season - birth
  // season) matched 99% of listed capos. Birth season is taken from the creation
  // date against the real season calendar rather than the season_created tag,
  // which fixes a small pocket of capos mislabelled season 1.
  const seasonStarts = all(`
    SELECT season_created AS season, MIN(created_at) AS start
    FROM capos_daily
    WHERE day = ? AND season_created BETWEEN 1 AND 99 AND created_at IS NOT NULL
    GROUP BY season_created HAVING COUNT(*) >= 50
    ORDER BY start`, day)
  const currentSeason = seasonStarts.length ? seasonStarts.at(-1).season : null
  const birthSeason = (createdAt) => {
    let s = seasonStarts[0]?.season ?? currentSeason
    for (const st of seasonStarts) { if (createdAt >= st.start) s = st.season; else break }
    return s
  }
  const ageOf = (createdAt) =>
    currentSeason == null ? null : 25 + Math.max(0, currentSeason - birthSeason(createdAt))

  const ageCounts = {}
  let ageSum = 0, ageN = 0
  for (const r of all(
    `SELECT created_at FROM capos_daily WHERE day = ? AND created_at IS NOT NULL`, day)) {
    const a = ageOf(r.created_at)
    if (a == null) continue
    ageCounts[a] = (ageCounts[a] || 0) + 1
    ageSum += a; ageN++
  }
  const ageBuckets = Object.keys(ageCounts).map(Number).sort((a, b) => a - b)
    .map((age) => ({ label: age + '', age, capos: ageCounts[age] }))
  const ageStats = {
    avg_years: ageN ? +(ageSum / ageN).toFixed(1) : null,
    max_years: ageBuckets.length ? ageBuckets.at(-1).age : null,
    current_season: currentSeason,
  }

  // Rank by rarity: for each rarity, how its capos spread across the ladder.
  // The progression signal: do rarer capos sit higher because owners invest in them?
  const crossRows = all(`
    SELECT rarity, tier, COUNT(*) n
    FROM capos_daily
    WHERE day = ? AND rarity IS NOT NULL AND tier IS NOT NULL
    GROUP BY rarity, tier`, day)
  const crosstab = RARITIES.filter((ra) => byRarity.some((b) => b.rarity === ra)).map((rarity) => {
    const row = { rarity }
    let total = 0
    for (const rank of RANKS) {
      const cell = crossRows.find((c) => c.rarity === rarity && c.tier === rank)
      row[rank] = cell ? cell.n : 0
      total += row[rank]
    }
    row.total = total
    // Share promoted beyond the starting rank, a one-number progression rate.
    row.promoted_pct = total ? +(100 * (total - row.recruit) / total).toFixed(1) : 0
    return row
  })

  // What a buyer actually wants to know: does the trait you cannot change move
  // the price? Measured on sales rather than listings, so it is what people paid,
  // not what sellers hoped for. Medians alongside means because a handful of
  // god-tier sales would otherwise carry a whole specialty on their own.
  const traitPrice = (col) => {
    const rows = all(`
      SELECT ${col} AS k, price_lamports p FROM sales
      WHERE ${col} IS NOT NULL AND price_lamports > 0 AND sold_at >= '2026-01-01'
        AND asset_kind = 'capo'`)
    const groups = {}
    for (const r of rows) (groups[r.k] ||= []).push(r.p)
    return Object.entries(groups)
      .filter(([, v]) => v.length >= 30)
      .map(([k, v]) => {
        const sorted = v.slice().sort((a, b) => a - b)
        return {
          key: k,
          sales: v.length,
          median_sol: +(sorted[Math.floor(sorted.length / 2)] / LAMPORTS).toFixed(4),
          avg_sol: +(v.reduce((a, b) => a + b, 0) / v.length / LAMPORTS).toFixed(4),
        }
      })
      .sort((a, b) => b.median_sol - a.median_sol)
  }
  const specialty = traitPrice('specialty')
  const personality = traitPrice('personality')
  const spread = (rows) => (rows.length && rows.at(-1).median_sol
    ? +((rows[0].median_sol / rows.at(-1).median_sol - 1) * 100).toFixed(0)
    : null)

  /**
   * RACKET earnings, the one figure the game removed and the community wants.
   *
   * Lifetime comes straight from the API's own board, which is hard-capped at 50
   * capos, so anyone outside that is simply invisible here. The 24 hour board
   * cannot come from the API at all: it is the difference between two of our own
   * snapshots, which is the whole reason the archive exists.
   */
  const earnAt = one("SELECT MAX(captured_at) t FROM leaderboard_obs WHERE board='earnings'")?.t
  const topEarnersLifetime = earnAt ? all(`
    SELECT capo_name, tier, owner_display_name, value
    FROM leaderboard_obs WHERE board = 'earnings' AND captured_at = ?
    ORDER BY rank ASC LIMIT 15`, earnAt) : []

  const eb = one(`SELECT MIN(captured_at) f, MAX(captured_at) l,
    COUNT(DISTINCT captured_at) n FROM leaderboard_obs WHERE board = 'earnings'`)
  let topEarners24h = []
  let earnWindowHours = null
  if (eb?.n >= 2) {
    const dayAgo = new Date(Date.now() - 86400000).toISOString()
    const from = dayAgo > eb.f ? dayAgo : eb.f
    topEarners24h = all(`
      SELECT MAX(capo_name) capo_name, MAX(tier) tier,
             MAX(owner_display_name) owner_display_name,
             MAX(value) - MIN(value) AS gained
      FROM leaderboard_obs
      WHERE board = 'earnings' AND captured_at >= ?
      GROUP BY capo_id HAVING gained > 0
      ORDER BY gained DESC LIMIT 15`, from)
    earnWindowHours = +((Date.parse(eb.l) - Date.parse(from)) / 3600000).toFixed(1)
  }

  /**
   * Who moved on the earnings board.
   *
   * The API reports a standing and never a change, so this exists only by
   * comparing two of our own snapshots. Capos that entered or left the 50-row
   * cap inside the window have no comparable rank at one end and are dropped
   * rather than shown as a spectacular jump out of nowhere.
   */
  let boardMovement = { climbers: [], fallers: [], unavailable: null }
  if (eb?.n >= 2 && earnAt) {
    const dayAgo2 = new Date(Date.now() - 86400000).toISOString()
    const prior = one(`SELECT MIN(captured_at) t FROM leaderboard_obs
      WHERE board = 'earnings' AND captured_at >= ?`, dayAgo2 > eb.f ? dayAgo2 : eb.f)?.t
    if (prior && prior !== earnAt) {
      const moved = all(`
        SELECT l.capo_name, l.owner_display_name, l.rank, p.rank AS was,
               p.rank - l.rank AS moved
        FROM leaderboard_obs l
        JOIN leaderboard_obs p ON p.capo_id = l.capo_id AND p.board = l.board
        WHERE l.board = 'earnings' AND l.captured_at = ? AND p.captured_at = ?
          AND p.rank != l.rank
        ORDER BY moved DESC`, earnAt, prior)
      boardMovement = {
        climbers: moved.filter((r) => r.moved > 0).slice(0, 10),
        fallers: moved.filter((r) => r.moved < 0).sort((a, b) => a.moved - b.moved).slice(0, 10),
        unavailable: null,
      }
    } else {
      boardMovement.unavailable = 'not enough snapshot history yet to compare two points'
    }
  } else {
    boardMovement.unavailable = 'needs at least two snapshots to difference'
  }

  return {
    generated_at,
    as_of: day,
    total: one('SELECT COUNT(*) n FROM capos_daily WHERE day=?', day).n,
    earners: {
      lifetime: topEarnersLifetime,
      last_24h: topEarners24h,
      window_hours: earnWindowHours,
      movement: boardMovement,
    },
    trait_price: {
      specialty,
      personality,
      specialty_spread_pct: spread(specialty),
      personality_spread_pct: spread(personality),
    },
    by_rarity: byRarity,
    age: ageBuckets,
    avg_age_years: ageStats.avg_years,
    oldest_years: ageStats.max_years,
    current_season: ageStats.current_season,
    crosstab,
    ranks: ranksSection(day),
    promotion_cost: promotionCost(),
  }
}

// --------------------------------------------------------------- overview ---
function overview(m, w, g) {
  const day = one('SELECT MAX(day) d FROM capos_daily').d
  return {
    generated_at,
    headline: {
      racket_supply: m.totals?.total_racket_supply ?? null,
      wallets: m.totals?.wallet_count ?? null,
      capos: one('SELECT COUNT(*) n FROM capos_daily WHERE day=?', day).n,
      owners: g.owners,
      players_with_fights: w.population,
      active_24h: g.players.recency.d1,
      active_7d: g.players.recency.d7,
      seated: g.players.seats.seated,
      // The LAST row is today, which is a partial day: burns run ahead of mints
      // early on, so it reads negative until the day fills in. Reporting that
      // under a "yesterday" label showed -22.5M on a day the economy actually
      // closed +189.8M. Take the last COMPLETE day instead.
      net_yesterday: (() => {
        const today = new Date().toISOString().slice(0, 10)
        const done = m.emissions.filter((e) => e.day < today)
        return done.at(-1)?.net ?? null
      })(),
      net_yesterday_day: (() => {
        const today = new Date().toISOString().slice(0, 10)
        return m.emissions.filter((e) => e.day < today).at(-1)?.day ?? null
      })(),
      sol_volume_7d: +m.market.volume.slice(-7).reduce((a, v) => a + v.sol, 0).toFixed(2),
      sales_7d: m.market.volume.slice(-7).reduce((a, v) => a + v.sales, 0),
    },
    // Quick facts. Deliberately things a player would repeat to someone else,
    // not more of the same aggregates the tiles already carry. Sales are
    // filtered to 2026 onward like everywhere else: a handful of rows carry
    // 2022/2024 timestamps and round prices, and one of them is a 25 SOL sale
    // that would otherwise sit here forever as the all-time record.
    facts: (() => {
      const since = (n) => `datetime('now', '-${n} day')`
      const c24 = one(`SELECT COUNT(*) n FROM capos_daily
        WHERE day = ? AND created_at >= ${since(1)}`, day).n
      const p24 = one(`SELECT COUNT(*) n FROM combat_daily
        WHERE day = (SELECT MAX(day) FROM combat_daily) AND first_fight_at >= ${since(1)}`).n
      // Recruit is the rank a capo is BORN at, and its tier_promoted_at is set on
      // creation, so counting it as a promotion silently reports every newborn
      // as a climber: it inflated this figure roughly fivefold. Real promotions
      // start at soldier.
      const promoRows = all(`SELECT tier, COUNT(*) n FROM capos_daily
        WHERE day = ? AND tier_promoted_at >= ${since(1)} AND tier != 'recruit'
        GROUP BY tier`, day)
      const promoByRank = RANKS.filter((r) => r !== 'recruit').map((rank) => ({
        rank,
        promoted: promoRows.find((r) => r.tier === rank)?.n ?? 0,
      })).reverse()
      const promo24 = promoRows.reduce((a, r) => a + r.n, 0)
      const s24 = one(`SELECT COUNT(*) n, ROUND(SUM(price_lamports)/1000000000.0, 1) sol
        FROM sales WHERE sold_at >= ${since(1)} AND sold_at >= '2026-01-01'`)
      const top24 = one(`SELECT ROUND(price_lamports/1000000000.0, 2) sol, rarity
        FROM sales WHERE sold_at >= ${since(1)} AND sold_at >= '2026-01-01'
          AND price_lamports > 0 ORDER BY price_lamports DESC LIMIT 1`)
      const topEver = one(`SELECT ROUND(price_lamports/1000000000.0, 2) sol, rarity,
          substr(sold_at, 1, 10) day FROM sales
        WHERE price_lamports > 0 AND sold_at >= '2026-01-01'
        ORDER BY price_lamports DESC LIMIT 1`)
      const total = one('SELECT COUNT(*) n FROM capos_daily WHERE day=?', day).n
      const rar = (r) => one(
        'SELECT COUNT(*) n FROM capos_daily WHERE day=? AND rarity=?', day, r).n
      const rar7 = (r) => one(`SELECT COUNT(*) n FROM capos_daily
        WHERE day = ? AND rarity = ? AND created_at >= ${since(7)}`, day, r).n
      const gods = rar('god')
      const rarityShare = RARITIES
        .map((rarity) => ({ rarity, capos: rar(rarity) }))
        .filter((r) => r.capos > 0)
        .sort((a, b) => b.capos - a.capos)
        .map((r) => ({
          ...r,
          share_pct: +((r.capos / total) * 100).toFixed(r.capos / total < 0.01 ? 3 : 1),
          one_in: Math.round(total / r.capos),
        }))

      return {
        rarity_share: rarityShare,
        promotions_by_rank: promoByRank,
        new_capos_24h: c24,
        new_players_24h: p24,
        promotions_24h: promo24,
        sales_24h: s24.n,
        sol_24h: s24.sol,
        top_sale_24h: top24 || null,
        top_sale_ever: topEver || null,
        gods,
        gods_per: gods ? Math.round(total / gods) : null,
        gods_7d: rar7('god'),
        legendaries: rar('legendary'),
        legendaries_7d: rar7('legendary'),
        bosses: one(`SELECT COUNT(*) n FROM capos_daily
          WHERE day = ? AND tier = 'boss'`, day).n,
      }
    })(),
    emissions: m.emissions.slice(-30),
    volume: m.market.volume.slice(-30),
    supply: g.supply.slice(-60),
  }
}

const m = money()
const w = wars()
const g = growth()
const c = capos()
console.log('sections:')

// The economy page keeps the RACKET token: what is minted, what is burned,
// where it comes from and where it goes. The secondary market left for a page
// of its own, because what a capo sells for is a different question from how
// the token supply behaves, and the two were competing for one reader.
const { market, liquidity, ...economy } = m
write('money', economy)

// Gear travels with the fight model that consumes it. Which item raises which
// stat is only interesting next to the odds it moves, and it was sitting on the
// capo census page where nothing used it.
write('wars', { ...w, gear: c.gear })

// The market page: what people pay, for capos and for the traits on them. The
// trainer rates that complete the picture are fetched alongside from
// trainers.json, which derive/trainers.js owns and writes after this script.
// `sales`, not `market`: trainers.json is fetched onto the same page and already
// owns a `market` key describing the hiring market. Two different markets under
// one name would have silently shadowed each other at merge time.
write('market', { generated_at, sales: market, liquidity, trait_price: c.trait_price })
// The growth page is gone. Its supply and ownership blocks belong with the
// capos they describe, and its player blocks with the players. growth.json is
// still written because build-players.js reads its `players` block at build
// time, but no page fetches it any more.
write('growth', g)

// gear and trait_price moved to wars and market above.
const { gear: _gear, trait_price: _tp, ...capoCensus } = c
write('capos', {
  ...capoCensus,
  supply: g.supply,
  ownership: g.ownership,
  owners: g.owners,
  by_season: g.by_season,
})
write('overview', overview(m, w, g))
db.close()
