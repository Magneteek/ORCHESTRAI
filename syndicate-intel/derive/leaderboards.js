#!/usr/bin/env node
/**
 * Compute the community leaderboards from the derived database.
 *
 * Honesty rules baked in, because this project exists to replace numbers the
 * game had to take down and it is worthless if people cannot trust it:
 *
 *  - Period boards report the window we ACTUALLY have data for, never the
 *    window that was requested. Asking for 7d when the archive is 3h old
 *    returns a 3h board clearly labelled as such.
 *  - Boards we cannot honestly build are emitted as explicit `unavailable`
 *    entries explaining why, rather than being quietly omitted.
 *
 * Usage:
 *   node derive/leaderboards.js                 # 7d where available
 *   node derive/leaderboards.js --period 24h
 *   node derive/leaderboards.js --top 25
 */

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'syndicate.db')
const OUT_DIR = path.join(ROOT, 'data', 'boards')

const PERIODS = { '24h': 1, '7d': 7, '30d': 30, all: null }

function parseArgs(argv) {
  const a = { period: '7d', top: 10 }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--period') a.period = argv[++i]
    else if (argv[i] === '--top') a.top = Number(argv[++i])
  }
  return a
}

const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString())

/**
 * Accounts excluded from community boards, with the evidence for each.
 * Disclosed in the output rather than silently filtered: a board that quietly
 * drops accounts is exactly as untrustworthy as one that includes house
 * inventory alongside real players.
 */
const HOUSE_ACCOUNTS = [
  {
    owner_ref: '321736cb06706777a208f2becdd4d959',
    display_name: 'TheSyndicate',
    evidence:
      'holds 334 of the 729 founder capos (46% of total supply), all 812 of its ' +
      'capos are status "collectible" with 0 active, has only 174k RACKET ' +
      'invested across them, and appears in neither combat records nor the ' +
      'earnings leaderboard. Game treasury, not a player.',
  },
]
const HOUSE_REFS = HOUSE_ACCOUNTS.map((a) => a.owner_ref)
// Inlined into SQL as quoted literals; these are fixed hex constants, never user input.
const HOUSE_SQL_LIST = HOUSE_REFS.map((r) => `'${r}'`).join(',') || `''`

// ------------------------------------------------------------------ boards ---

/**
 * Lifetime cumulative boards, straight from the most recent snapshot.
 * Capped at 50 rows by the API, not by us.
 */
function lifetimeCapoBoard(db, board, top) {
  const latest = db
    .prepare('SELECT MAX(captured_at) AS t FROM leaderboard_obs WHERE board = ?')
    .get(board)?.t
  if (!latest) return { unavailable: 'no leaderboard snapshots captured yet' }

  const rows = db.prepare(`
    SELECT capo_id, capo_name, tier, owner_display_name, value, rank
    FROM leaderboard_obs
    WHERE board = ? AND captured_at = ?
    ORDER BY rank ASC LIMIT ?`).all(board, latest, top)

  return {
    as_of: latest,
    scope: 'capo',
    basis: 'lifetime cumulative, as reported by the API',
    caveat: 'API returns a maximum of 50 capos; owners outside that are invisible',
    rows,
  }
}

/**
 * Who is climbing and who is sliding.
 *
 * The API reports a standing, never a movement, so this exists only by diffing
 * our own snapshots. A capo that entered or left the API's 50-row cap inside the
 * window has no comparable rank at one end and is dropped rather than shown as a
 * spectacular jump from nowhere.
 */
function rankMovement(db, board, days, top) {
  const latest = db
    .prepare('SELECT MAX(captured_at) AS t FROM leaderboard_obs WHERE board = ?')
    .get(board)?.t
  if (!latest) return { unavailable: 'no leaderboard snapshots captured yet' }

  const priorRow = db.prepare(`
    SELECT MIN(captured_at) AS t FROM leaderboard_obs
    WHERE board = ? AND captured_at >= datetime(?, ?)`).get(board, latest, `-${days} days`)
  const prior = priorRow?.t
  if (!prior || prior === latest) {
    return { unavailable: 'not enough snapshot history yet to compare two points' }
  }

  const rows = db.prepare(`
    SELECT l.capo_id, l.capo_name, l.tier, l.owner_display_name,
           l.rank AS rank, p.rank AS was, p.rank - l.rank AS moved
    FROM leaderboard_obs l
    JOIN leaderboard_obs p ON p.capo_id = l.capo_id AND p.board = l.board
    WHERE l.board = ? AND l.captured_at = ? AND p.captured_at = ? AND p.rank != l.rank
    ORDER BY moved DESC`).all(board, latest, prior)

  return {
    as_of: latest,
    window: { from: prior, to: latest },
    scope: 'capo',
    basis: 'change in board position between two of our own snapshots',
    caveat: 'capos that entered or left the API 50-row cap inside the window are excluded, ' +
            'because they have no comparable rank at one end',
    climbers: rows.filter((r) => r.moved > 0).slice(0, top),
    fallers: rows.filter((r) => r.moved < 0).sort((a, b) => a.moved - b.moved).slice(0, top),
    unchanged: db.prepare(`
      SELECT COUNT(*) n FROM leaderboard_obs l
      JOIN leaderboard_obs p ON p.capo_id = l.capo_id AND p.board = l.board
      WHERE l.board = ? AND l.captured_at = ? AND p.captured_at = ? AND p.rank = l.rank`)
      .get(board, latest, prior).n,
  }
}

/**
 * Period boards, from differencing our own snapshots. This is the only way
 * these exist: the API ignores ?season= and reports lifetime totals only.
 */
function periodCapoEarnings(db, days, top) {
  const bounds = db.prepare(`
    SELECT MIN(captured_at) AS first, MAX(captured_at) AS last,
           COUNT(DISTINCT captured_at) AS snapshots
    FROM leaderboard_obs WHERE board = 'earnings'`).get()

  if (!bounds?.snapshots || bounds.snapshots < 2) {
    return {
      unavailable:
        `needs at least 2 snapshots to difference, have ${bounds?.snapshots ?? 0}. ` +
        'Period boards become available once the ingest has run twice.',
    }
  }

  const since =
    days == null
      ? bounds.first
      : new Date(Date.now() - days * 86400_000).toISOString()
  const windowStart = since > bounds.first ? since : bounds.first

  const rows = db.prepare(`
    SELECT capo_id,
           MAX(capo_name)          AS capo_name,
           MAX(tier)               AS tier,
           MAX(owner_display_name) AS owner_display_name,
           MAX(value) - MIN(value) AS gained,
           COUNT(*)                AS observations
    FROM leaderboard_obs
    WHERE board = 'earnings' AND captured_at >= ?
    GROUP BY capo_id
    HAVING gained > 0
    ORDER BY gained DESC LIMIT ?`).all(windowStart, top)

  const spanMs = new Date(bounds.last) - new Date(windowStart)
  return {
    requested_period: days == null ? 'all' : `${days}d`,
    // The window we actually have, which early on is much shorter than asked for.
    actual_window: { from: windowStart, to: bounds.last, hours: +(spanMs / 3600_000).toFixed(2) },
    snapshots_used: bounds.snapshots,
    scope: 'capo',
    basis: 'difference between our own snapshots; the API cannot report this',
    caveat:
      'a capo that entered the top 50 mid-window understates its gain, because ' +
      'we only observe capos while they are inside the API\'s 50-row cap',
    rows,
  }
}

/** Account-level combat. Full population, not truncated. */
function combatBoards(db, days, top) {
  const bounds = db.prepare(
    'SELECT MIN(day) AS first, MAX(day) AS last, COUNT(DISTINCT day) AS days FROM combat_daily',
  ).get()
  if (!bounds?.days) return { unavailable: 'no combat snapshots yet' }

  const lifetime = db.prepare(`
    SELECT player_ref, display_name, fights_total, fights_won,
           attacks_won, defenses_held, distinct_opponents, districts_contested,
           ROUND(100.0 * fights_won / NULLIF(fights_total, 0), 1) AS win_rate_pct
    FROM combat_daily WHERE day = ?
    ORDER BY fights_won DESC LIMIT ?`).all(bounds.last, top)

  // Requires a meaningful sample, otherwise a 3-fight player tops the board.
  const MIN_FIGHTS = 100
  const byWinRate = db.prepare(`
    SELECT player_ref, display_name, fights_total, fights_won,
           ROUND(100.0 * fights_won / NULLIF(fights_total, 0), 1) AS win_rate_pct
    FROM combat_daily WHERE day = ? AND fights_total >= ?
    ORDER BY win_rate_pct DESC, fights_total DESC LIMIT ?`).all(bounds.last, MIN_FIGHTS, top)

  const byDefence = db.prepare(`
    SELECT player_ref, display_name, defenses_total, defenses_held,
           ROUND(100.0 * defenses_held / NULLIF(defenses_total, 0), 1) AS hold_rate_pct
    FROM combat_daily WHERE day = ? AND defenses_total >= ?
    ORDER BY hold_rate_pct DESC, defenses_total DESC LIMIT ?`).all(bounds.last, MIN_FIGHTS, top)

  let period = { unavailable: `needs 2+ days of history, have ${bounds.days}` }
  if (bounds.days >= 2) {
    const since = days == null ? bounds.first
      : new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)
    const windowStart = since > bounds.first ? since : bounds.first
    period = {
      actual_window: { from: windowStart, to: bounds.last },
      rows: db.prepare(`
        SELECT player_ref, MAX(display_name) AS display_name,
               MAX(fights_won) - MIN(fights_won) AS fights_won_gained,
               MAX(fights_total) - MIN(fights_total) AS fights_gained
        FROM combat_daily WHERE day >= ?
        GROUP BY player_ref HAVING fights_gained > 0
        ORDER BY fights_won_gained DESC LIMIT ?`).all(windowStart, top),
    }
  }

  return {
    as_of: bounds.last,
    scope: 'account',
    population: db.prepare('SELECT COUNT(*) AS n FROM combat_daily WHERE day = ?')
      .get(bounds.last).n,
    note: 'full player population, not a truncated top-N',
    most_wins_lifetime: lifetime,
    best_win_rate: { min_fights: MIN_FIGHTS, rows: byWinRate },
    best_defence: { min_defenses: MIN_FIGHTS, rows: byDefence },
    period_gains: period,
  }
}

/** Trainers. Two boards rather than one invented composite score. */
function trainerBoards(db, top) {
  const day = db.prepare('SELECT MAX(day) AS d FROM trainers_daily').get()?.d
  if (!day) return { unavailable: 'no contract snapshots yet' }

  const byVolume = db.prepare(`
    SELECT trainer_ref, trainer_display_name, trainer_prestige_level,
           trainer_jobs_completed, trainer_jobs_settled,
           trainer_completion_rate, trainer_on_time_rate,
           trainer_avg_turnaround_hours,
           ROUND(rate_lamports / 1000000000.0, 4) AS rate_sol
    FROM trainers_daily WHERE day = ?
    ORDER BY trainer_jobs_completed DESC LIMIT ?`).all(day, top)

  const MIN_JOBS = 10
  const byReliability = db.prepare(`
    SELECT trainer_ref, trainer_display_name, trainer_jobs_completed,
           trainer_completion_rate, trainer_on_time_rate,
           trainer_avg_turnaround_hours
    FROM trainers_daily WHERE day = ? AND trainer_jobs_settled >= ?
    ORDER BY trainer_completion_rate DESC, trainer_on_time_rate DESC,
             trainer_avg_turnaround_hours ASC LIMIT ?`).all(day, MIN_JOBS, top)

  return {
    as_of: day,
    scope: 'account',
    population: db.prepare('SELECT COUNT(*) AS n FROM trainers_daily WHERE day = ?').get(day).n,
    caveat: 'covers currently-listed trainers only; counters themselves are lifetime',
    most_jobs_completed: byVolume,
    most_reliable: { min_jobs_settled: MIN_JOBS, rows: byReliability },
  }
}

/** Account-level collector boards. Factual counts, no invented valuation. */
function collectorBoards(db, top) {
  const day = db.prepare('SELECT MAX(day) AS d FROM capos_daily').get()?.d
  if (!day) return { unavailable: 'no capo snapshots yet' }

  const notHouse = `AND owner_ref NOT IN (${HOUSE_SQL_LIST})`

  const byCount = db.prepare(`
    SELECT owner_ref, MAX(owner_display_name) AS display_name,
           COUNT(*) AS capos,
           SUM(CASE WHEN rarity IN ('god','legendary','founder') THEN 1 ELSE 0 END) AS top_rarity,
           SUM(total_racket_invested) AS racket_invested
    FROM capos_daily WHERE day = ? AND owner_ref IS NOT NULL ${notHouse}
    GROUP BY owner_ref ORDER BY capos DESC LIMIT ?`).all(day, top)

  const byRarity = db.prepare(`
    SELECT owner_ref, MAX(owner_display_name) AS display_name,
           SUM(CASE WHEN rarity = 'god' THEN 1 ELSE 0 END) AS god,
           SUM(CASE WHEN rarity = 'legendary' THEN 1 ELSE 0 END) AS legendary,
           SUM(CASE WHEN rarity = 'founder' THEN 1 ELSE 0 END) AS founder,
           COUNT(*) AS capos
    FROM capos_daily WHERE day = ? AND owner_ref IS NOT NULL ${notHouse}
    GROUP BY owner_ref
    ORDER BY god DESC, legendary DESC, founder DESC LIMIT ?`).all(day, top)

  const byInvested = db.prepare(`
    SELECT owner_ref, MAX(owner_display_name) AS display_name,
           SUM(total_racket_invested) AS racket_invested, COUNT(*) AS capos
    FROM capos_daily WHERE day = ? AND owner_ref IS NOT NULL ${notHouse}
    GROUP BY owner_ref ORDER BY racket_invested DESC LIMIT ?`).all(day, top)

  return {
    as_of: day,
    scope: 'account',
    population: db.prepare(
      'SELECT COUNT(DISTINCT owner_ref) AS n FROM capos_daily WHERE day = ?').get(day).n,
    note: 'RACKET invested is spend, not earnings, and is not a profit figure',
    excluded_accounts: HOUSE_ACCOUNTS,
    largest_rosters: byCount,
    rarest_rosters: byRarity,
    most_racket_invested: byInvested,
  }
}

function economySummary(db) {
  const totals = db.prepare(
    'SELECT * FROM economy_totals ORDER BY captured_at DESC LIMIT 1').get()
  const recent = db.prepare(
    'SELECT day, minted, burned, net FROM economy_daily ORDER BY day DESC LIMIT 14').all()
  const sinkDay = db.prepare('SELECT MAX(captured_at) AS t FROM economy_sinks').get()?.t
  const sinks = sinkDay
    ? db.prepare(`SELECT type, total FROM economy_sinks WHERE captured_at = ?
                  ORDER BY total ASC LIMIT 12`).all(sinkDay)
    : []
  return { totals, recent_days: recent, largest_sinks: sinks }
}

/**
 * Boards the community will ask for that we cannot honestly produce. Emitted
 * explicitly so the site can say why, rather than silently not having them.
 */
function unavailableBoards() {
  return [
    {
      board: 'Account total earnings',
      reason:
        'No endpoint aggregates RACKET earnings per account. /leaderboards is ' +
        'capo-scoped and capped at 50 rows, and with ~4,000 owners holding ~22 ' +
        'capos each, a large holder of mid-tier capos never appears.',
      unblocks: 'an owner_ref earnings rollup, or a much deeper leaderboard',
    },
    {
      board: 'Top hustlers',
      reason:
        '33,635 capos carry role "hustler" but no hustle earnings are exposed ' +
        'at capo or account level anywhere in the API.',
      unblocks: 'per-capo or per-account hustle earnings',
    },
    {
      board: 'Account PNL',
      reason:
        'Realized SOL trading PNL is computable from /market/sales and, since ' +
        'buyer_ref and seller_ref were added on 2026-08-17, is attributable to ' +
        'accounts directly rather than through the old mint_address bridge ' +
        '(979 players resolved, up from 75). Primary spend (packs, card) is ' +
        'still not exposed at all, so a full PNL figure remains incomplete.',
      unblocks: 'an account-level spend and proceeds rollup',
    },
  ]
}

// -------------------------------------------------------------------- main ---

function printBoard(title, board, columns) {
  console.log(`\n${title}`)
  console.log('-'.repeat(76))
  if (board?.unavailable) {
    console.log(`  unavailable: ${board.unavailable}`)
    return
  }
  const rows = board?.rows ?? board
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log('  (no rows yet)')
    return
  }
  rows.forEach((r, i) => {
    const cells = columns.map(([key, width, formatter]) => {
      const v = formatter ? formatter(r[key]) : r[key]
      return String(v ?? '-').padEnd(width)
    })
    console.log(`  ${String(i + 1).padStart(2)}. ${cells.join(' ')}`)
  })
}

function main() {
  const args = parseArgs(process.argv)
  if (!(args.period in PERIODS)) {
    console.error(`unknown period "${args.period}" (${Object.keys(PERIODS).join(', ')})`)
    process.exit(2)
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error('no database: run `node derive/build.js` first')
    process.exit(1)
  }

  const db = new DatabaseSync(DB_PATH)
  const days = PERIODS[args.period]
  const generatedAt = new Date().toISOString()

  const boards = {
    generated_at: generatedAt,
    requested_period: args.period,
    top_n: args.top,
    capo: {
      top_earners_lifetime: lifetimeCapoBoard(db, 'earnings', args.top),
      top_earners_period: periodCapoEarnings(db, days, args.top),
      top_fighters_lifetime: lifetimeCapoBoard(db, 'victories', args.top),
      earners_movement: rankMovement(db, 'earnings', days, args.top),
      fighters_movement: rankMovement(db, 'victories', days, args.top),
    },
    account: {
      combat: combatBoards(db, days, args.top),
      trainers: trainerBoards(db, args.top),
      collectors: collectorBoards(db, args.top),
    },
    economy: economySummary(db),
    unavailable: unavailableBoards(),
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const outFile = path.join(OUT_DIR, `boards-${args.period}.json`)
  fs.writeFileSync(outFile, JSON.stringify(boards, null, 2))

  // ------------------------------------------------------------- console ---
  console.log(`The Syndicate community boards   generated ${generatedAt}`)
  console.log(`requested period: ${args.period}   top ${args.top}`)

  printBoard('CAPOS: top earners (lifetime, API-reported)',
    boards.capo.top_earners_lifetime,
    [['capo_name', 18], ['owner_display_name', 20], ['tier', 11], ['value', 14, fmt]])

  const p = boards.capo.top_earners_period
  if (p.actual_window) {
    console.log(
      `\n  window actually covered: ${p.actual_window.hours}h ` +
        `(${p.snapshots_used} snapshots) - NOT the full ${args.period}`)
  }
  printBoard('CAPOS: top earners (gained during window, from our snapshots)', p,
    [['capo_name', 18], ['owner_display_name', 20], ['tier', 11], ['gained', 14, fmt]])

  printBoard('CAPOS: top fighters (lifetime net victories)',
    boards.capo.top_fighters_lifetime,
    [['capo_name', 18], ['owner_display_name', 20], ['tier', 11], ['value', 14, fmt]])

  printBoard('ACCOUNTS: most fights won (lifetime)',
    boards.account.combat.most_wins_lifetime,
    [['display_name', 22], ['fights_won', 10, fmt], ['fights_total', 10, fmt],
      ['win_rate_pct', 8]])

  printBoard(`ACCOUNTS: best win rate (min ${boards.account.combat.best_win_rate?.min_fights} fights)`,
    boards.account.combat.best_win_rate,
    [['display_name', 22], ['win_rate_pct', 8], ['fights_won', 10, fmt],
      ['fights_total', 10, fmt]])

  printBoard('ACCOUNTS: trainers by jobs completed',
    boards.account.trainers.most_jobs_completed,
    [['trainer_display_name', 20], ['trainer_jobs_completed', 8, fmt],
      ['trainer_completion_rate', 6], ['trainer_on_time_rate', 6],
      ['trainer_avg_turnaround_hours', 7]])

  printBoard('ACCOUNTS: largest rosters',
    boards.account.collectors.largest_rosters,
    [['display_name', 22], ['capos', 8, fmt], ['top_rarity', 8, fmt],
      ['racket_invested', 14, fmt]])

  console.log('\nEXCLUDED FROM ACCOUNT BOARDS')
  console.log('-'.repeat(76))
  for (const h of boards.account.collectors.excluded_accounts ?? []) {
    console.log(`  ${h.display_name} (${h.owner_ref.slice(0, 12)}...)`)
    console.log(`    ${h.evidence}`)
  }

  console.log('\nNOT AVAILABLE (and why)')
  console.log('-'.repeat(76))
  for (const u of boards.unavailable) {
    console.log(`  ${u.board}`)
    console.log(`    ${u.reason}`)
    console.log(`    unblocked by: ${u.unblocks}`)
  }

  console.log(`\nwritten: ${path.relative(ROOT, outFile)}`)
  db.close()
}

main()
