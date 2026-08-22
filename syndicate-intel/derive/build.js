#!/usr/bin/env node
/**
 * Build the derived SQLite database from the raw archive.
 *
 * Incremental and idempotent: already-loaded files are skipped via the
 * loaded_files table, and every insert is an upsert, so re-running is always
 * safe. Nothing here is authoritative; `--rebuild` throws the database away
 * and replays the whole archive from raw JSON.
 *
 * Usage:
 *   node derive/build.js
 *   node derive/build.js --rebuild
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW_DIR = path.join(ROOT, 'data', 'raw')
const DB_PATH = path.join(ROOT, 'data', 'syndicate.db')
const SCHEMA_PATH = path.join(__dirname, 'schema.sql')

const args = { rebuild: process.argv.includes('--rebuild') }

// ---------------------------------------------------------------- helpers ---

function readSnapshot(file) {
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8'))
}

/** Feeds are stored as {pages:[...]}; snapshots as the raw {as_of, data}. */
function feedRows(doc, itemsPath) {
  const out = []
  for (const page of doc.pages ?? []) out.push(...(page?.data?.[itemsPath] ?? []))
  return out
}

function listSnapshotFiles(endpoint) {
  const dir = path.join(RAW_DIR, endpoint)
  if (!fs.existsSync(dir)) return []
  const files = []
  for (const day of fs.readdirSync(dir).sort()) {
    const dayDir = path.join(dir, day)
    if (!fs.statSync(dayDir).isDirectory()) continue
    for (const f of fs.readdirSync(dayDir).sort()) {
      if (f.endsWith('.json.gz')) files.push(path.join(dayDir, f))
    }
  }
  return files
}

/** Timestamp encoded in the filename, restored to a real ISO string. */
function capturedAtFromPath(file) {
  const base = path.basename(file).replace('.json.gz', '')
  const m = base.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/)
  if (m) return `${m[1]}T${m[2]}:${m[3]}:${m[4]}.${m[5]}Z`
  return base
}

const dayOf = (iso) => (iso || '').slice(0, 10)
const jsonOrNull = (v) => (v == null ? null : JSON.stringify(v))
const boolInt = (v) => (v == null ? null : v ? 1 : 0)

// ------------------------------------------------------------------ loaders ---
// Each returns the number of rows it wrote.

function loadLeaderboards(db, doc, capturedAt) {
  const stmt = db.prepare(`
    INSERT INTO leaderboard_obs
      (captured_at, board, capo_id, capo_name, tier, owner_display_name, value, rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(captured_at, board, capo_id) DO UPDATE SET
      value = excluded.value, rank = excluded.rank`)

  let n = 0
  const boards = [
    ['earnings', doc.data?.earnings ?? [], 'total_earnings'],
    ['victories', doc.data?.victories ?? doc.data?.combat ?? [], 'net_victories'],
  ]
  // The victories list is keyed differently across responses; find it generically.
  if (boards[1][1].length === 0) {
    for (const [k, v] of Object.entries(doc.data ?? {})) {
      if (k !== 'earnings' && Array.isArray(v) && v.length && 'net_victories' in v[0]) {
        boards[1] = ['victories', v, 'net_victories']
      }
    }
  }

  for (const [board, rows, valueField] of boards) {
    for (const r of rows) {
      stmt.run(
        capturedAt, board, r.capo_id, r.capo_name ?? null, r.tier ?? null,
        r.owner_display_name ?? null, r[valueField] ?? 0, r.rank ?? null,
      )
      n++
    }
  }
  return n
}

function loadListings(db, doc, capturedAt) {
  const stmt = db.prepare(`
    INSERT INTO listings (
      listing_id, capo_id, item_id, listing_type, nft_mint_address, source,
      price_lamports, price_racket, listed_at, seller_ref, seller_display_name,
      stat_muscle, stat_hustle, stat_brains, stat_rep, stat_grit,
      stat_budget_used, power_sum, promo_next_tier, completed_achievements,
      name, character_name, age, rarity, tier,
      trait_greed, trait_finesse, trait_passion,
      first_seen_at, last_seen_at, observations
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    ON CONFLICT(listing_id) DO UPDATE SET
      -- MAX/MIN rather than assignment, so the archive can be replayed in any
      -- order. A plain assignment pushes last_seen_at BACKWARDS when an older
      -- snapshot is loaded after a newer one, which is exactly what happens when
      -- history is imported from another machine, and it silently corrupts the
      -- time-on-market figures derived from the two.
      first_seen_at  = MIN(first_seen_at, excluded.first_seen_at),
      last_seen_at   = MAX(last_seen_at, excluded.last_seen_at),
      observations   = observations + 1,
      price_lamports = excluded.price_lamports,
      price_racket   = excluded.price_racket,
      -- never overwrite a known stat with a null, in case the API strips more
      stat_muscle = COALESCE(excluded.stat_muscle, stat_muscle),
      stat_hustle = COALESCE(excluded.stat_hustle, stat_hustle),
      stat_brains = COALESCE(excluded.stat_brains, stat_brains),
      stat_rep    = COALESCE(excluded.stat_rep,    stat_rep),
      stat_grit   = COALESCE(excluded.stat_grit,   stat_grit),
      power_sum   = COALESCE(excluded.power_sum,   power_sum)`)

  let n = 0
  for (const l of doc.data?.listings ?? []) {
    const stats = [l.stat_muscle, l.stat_hustle, l.stat_brains, l.stat_rep, l.stat_grit]
    const power = stats.every((s) => typeof s === 'number')
      ? stats.reduce((a, b) => a + b, 0)
      : null
    stmt.run(
      l.listing_id, l.capo_id ?? null, l.item_id ?? null, l.listing_type ?? null,
      l.nft_mint_address ?? null, l.source ?? null,
      l.price_lamports ?? null, l.price_racket ?? null, l.listed_at ?? null,
      l.seller_ref ?? null, l.seller_display_name ?? null,
      l.stat_muscle ?? null, l.stat_hustle ?? null, l.stat_brains ?? null,
      l.stat_rep ?? null, l.stat_grit ?? null, l.stat_budget_used ?? null,
      power, l.promo_next_tier ?? null, jsonOrNull(l.completed_achievements),
      l.name ?? null, l.character_name ?? null, l.age ?? null,
      l.rarity ?? null, l.tier ?? null,
      l.trait_greed ?? null, l.trait_finesse ?? null, l.trait_passion ?? null,
      capturedAt, capturedAt,
    )
    n++
  }
  return n
}

function loadSales(db, doc) {
  const stmt = db.prepare(`
    INSERT INTO sales (
      sale_id, signature, mint_address, capo_id, item_id, asset_kind,
      price_lamports, price_racket, usd_price_locked, treasury_fee_usd,
      buyer_wallet, seller_wallet, buyer_ref, seller_ref,
      buyer_display_name, seller_display_name,
      sold_at, source, rarity, item_type, tier, specialty, personality,
      stat_muscle, stat_hustle, stat_brains, stat_rep, stat_grit, power_sum
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(sale_id) DO UPDATE SET
      -- stats were stripped from this endpoint on 2026-08-16; if we ever hold a
      -- row that still has them, a later stat-less copy must not erase it
      stat_muscle = COALESCE(excluded.stat_muscle, stat_muscle),
      stat_hustle = COALESCE(excluded.stat_hustle, stat_hustle),
      stat_brains = COALESCE(excluded.stat_brains, stat_brains),
      stat_rep    = COALESCE(excluded.stat_rep,    stat_rep),
      stat_grit   = COALESCE(excluded.stat_grit,   stat_grit),
      power_sum   = COALESCE(excluded.power_sum,   power_sum),
      -- refs arrived on 2026-08-17 backfilled over all history, so a re-fetch of
      -- an already-stored sale is exactly how old rows acquire them. Same
      -- COALESCE guard in the other direction, in case they get stripped too.
      buyer_ref   = COALESCE(excluded.buyer_ref,   buyer_ref),
      seller_ref  = COALESCE(excluded.seller_ref,  seller_ref)`)

  let n = 0
  for (const s of feedRows(doc, 'sales')) {
    stmt.run(
      s.sale_id, s.signature ?? null, s.mint_address ?? null, s.capo_id ?? null,
      s.item_id ?? null, s.asset_kind ?? null,
      s.price_lamports ?? null, s.price_racket ?? null,
      s.usd_price_locked ?? null, s.treasury_fee_usd ?? null,
      s.buyer_wallet ?? null, s.seller_wallet ?? null,
      s.buyer_ref ?? null, s.seller_ref ?? null,
      s.buyer_display_name ?? null, s.seller_display_name ?? null,
      s.sold_at ?? null, s.source ?? null, s.rarity ?? null,
      s.item_type ?? null, s.tier ?? null, s.specialty ?? null, s.personality ?? null,
      s.stat_muscle ?? null, s.stat_hustle ?? null, s.stat_brains ?? null,
      s.stat_rep ?? null, s.stat_grit ?? null, s.power_sum ?? null,
    )
    n++
  }
  return n
}

function loadCapos(db, doc, capturedAt) {
  const day = dayOf(capturedAt)
  const stmt = db.prepare(`
    INSERT INTO capos_daily (
      day, capo_id, owner_ref, owner_display_name, mint_address, rarity,
      is_founder, tier, role, specialty, personality, name, character_name,
      trait_greed, trait_finesse, trait_passion, leash_level,
      total_racket_invested, status, season_created, tier_promoted_at, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(day, capo_id) DO UPDATE SET
      owner_ref = excluded.owner_ref,
      owner_display_name = excluded.owner_display_name,
      tier = excluded.tier, role = excluded.role, status = excluded.status,
      total_racket_invested = excluded.total_racket_invested,
      tier_promoted_at = excluded.tier_promoted_at`)

  let n = 0
  for (const c of doc.data?.capos ?? []) {
    stmt.run(
      day, c.capo_id, c.owner_ref ?? null, c.owner_display_name ?? null,
      c.mint_address ?? null, c.rarity ?? null, boolInt(c.is_founder),
      c.tier ?? null, c.role ?? null, c.specialty ?? null, c.personality ?? null,
      c.name ?? null, c.character_name ?? null,
      c.trait_greed ?? null, c.trait_finesse ?? null, c.trait_passion ?? null,
      c.leash_level ?? null, c.total_racket_invested ?? null,
      c.status ?? null, c.season_created ?? null,
      c.tier_promoted_at ?? null, c.created_at ?? null,
    )
    n++
  }
  return n
}

function loadCombat(db, doc, capturedAt) {
  const day = dayOf(capturedAt)
  const stmt = db.prepare(`
    INSERT INTO combat_daily (
      day, player_ref, display_name, attacks_total, attacks_won, attacks_lost,
      defenses_total, defenses_held, defenses_lost, fights_total, fights_won,
      passion_flips_for, passion_flips_against, distinct_opponents,
      districts_contested, first_fight_at, last_fight_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(day, player_ref) DO UPDATE SET
      display_name = excluded.display_name,
      attacks_total = excluded.attacks_total, attacks_won = excluded.attacks_won,
      attacks_lost = excluded.attacks_lost,
      defenses_total = excluded.defenses_total, defenses_held = excluded.defenses_held,
      defenses_lost = excluded.defenses_lost,
      fights_total = excluded.fights_total, fights_won = excluded.fights_won,
      passion_flips_for = excluded.passion_flips_for,
      passion_flips_against = excluded.passion_flips_against,
      distinct_opponents = excluded.distinct_opponents,
      districts_contested = excluded.districts_contested,
      last_fight_at = excluded.last_fight_at`)

  let n = 0
  for (const p of doc.data?.players ?? []) {
    stmt.run(
      day, p.player_ref, p.display_name ?? null,
      p.attacks_total ?? null, p.attacks_won ?? null, p.attacks_lost ?? null,
      p.defenses_total ?? null, p.defenses_held ?? null, p.defenses_lost ?? null,
      p.fights_total ?? null, p.fights_won ?? null,
      p.passion_flips_for ?? null, p.passion_flips_against ?? null,
      p.distinct_opponents ?? null, p.districts_contested ?? null,
      p.first_fight_at ?? null, p.last_fight_at ?? null,
    )
    n++
  }
  return n
}

function loadBounties(db, doc, capturedAt) {
  const stmt = db.prepare(`
    INSERT INTO bounties (
      bounty_id, kind, city_id, city_name, target_district_id, season,
      amount_racket, collector_payout_racket, pool_lamports, payout_lamports,
      fee_lamports, poster_ref, poster_display_name, target_ref,
      target_display_name, collector_ref, collector_display_name,
      collected, refunded, is_system_seeded, created_at, collected_at,
      first_seen_at, last_seen_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(bounty_id) DO UPDATE SET
      first_seen_at = MIN(first_seen_at, excluded.first_seen_at),
      last_seen_at = MAX(last_seen_at, excluded.last_seen_at),
      -- A bounty is posted first and collected later, so these three only ever
      -- arrive on a subsequent fetch. Everything else is fixed at creation.
      collected = excluded.collected,
      refunded = excluded.refunded,
      collected_at = COALESCE(excluded.collected_at, collected_at),
      collector_ref = COALESCE(excluded.collector_ref, collector_ref),
      collector_display_name =
        COALESCE(excluded.collector_display_name, collector_display_name),
      collector_payout_racket =
        COALESCE(excluded.collector_payout_racket, collector_payout_racket)`)

  let n = 0
  for (const b of feedRows(doc, 'bounties')) {
    stmt.run(
      b.bounty_id, b.kind ?? null, b.city_id ?? null, b.city_name ?? null,
      b.target_district_id ?? null, b.season ?? null,
      b.amount_racket ?? null, b.collector_payout_racket ?? null,
      b.pool_lamports ?? null, b.payout_lamports ?? null, b.fee_lamports ?? null,
      b.poster_ref ?? null, b.poster_display_name ?? null,
      b.target_ref ?? null, b.target_display_name ?? null,
      b.collector_ref ?? null, b.collector_display_name ?? null,
      boolInt(b.collected), boolInt(b.refunded), boolInt(b.is_system_seeded),
      b.created_at ?? null, b.collected_at ?? null,
      capturedAt, capturedAt,
    )
    n++
  }
  return n
}

function loadProductionOwners(db, doc, capturedAt) {
  const day = dayOf(capturedAt)
  const byOwner = new Map()
  for (const r of doc.data?.capos ?? []) {
    if (!r.owner_ref) continue
    const o = byOwner.get(r.owner_ref) || { racket: 0, capos: 0 }
    o.racket += r.total_racket_earned || 0
    o.capos++
    byOwner.set(r.owner_ref, o)
  }
  const stmt = db.prepare(`
    INSERT INTO production_owner_daily (day, owner_ref, captured_at, lifetime_racket, earning_capos)
    VALUES (?,?,?,?,?)
    ON CONFLICT(day, owner_ref) DO UPDATE SET
      captured_at = excluded.captured_at,
      lifetime_racket = excluded.lifetime_racket,
      earning_capos = excluded.earning_capos`)
  let n = 0
  for (const [ref, o] of byOwner) {
    stmt.run(day, ref, capturedAt, o.racket, o.capos)
    n++
  }
  return n
}

function loadTraders(db, doc, capturedAt) {
  const day = dayOf(capturedAt)
  const stmt = db.prepare(`
    INSERT INTO traders_daily (
      day, player_ref, display_name, sales_sold, sol_sold_lamports,
      sales_bought, sol_bought_lamports, net_sol_lamports
    ) VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(day, player_ref) DO UPDATE SET
      display_name = excluded.display_name,
      sales_sold = excluded.sales_sold,
      sol_sold_lamports = excluded.sol_sold_lamports,
      sales_bought = excluded.sales_bought,
      sol_bought_lamports = excluded.sol_bought_lamports,
      net_sol_lamports = excluded.net_sol_lamports`)

  let n = 0
  for (const t of doc.data?.traders ?? []) {
    stmt.run(
      day, t.player_ref, t.display_name ?? null,
      t.sales_sold ?? null, t.sol_sold_lamports ?? null,
      t.sales_bought ?? null, t.sol_bought_lamports ?? null,
      t.net_sol_lamports ?? null,
    )
    n++
  }
  return n
}

function loadContracts(db, doc, capturedAt) {
  const day = dayOf(capturedAt)
  const stmt = db.prepare(`
    INSERT INTO trainers_daily (
      day, trainer_ref, trainer_display_name, trainer_prestige_level,
      trainer_season_pass_tier, rate_lamports, is_available,
      trainer_jobs_settled, trainer_jobs_completed, trainer_completion_rate,
      trainer_on_time_rate, trainer_avg_turnaround_hours,
      listing_id, allowed_stats, min_actions, max_actions,
      max_concurrent_fills, active_fills, available_slots, listed_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(day, trainer_ref) DO UPDATE SET
      trainer_jobs_settled = excluded.trainer_jobs_settled,
      trainer_jobs_completed = excluded.trainer_jobs_completed,
      trainer_completion_rate = excluded.trainer_completion_rate,
      trainer_on_time_rate = excluded.trainer_on_time_rate,
      trainer_avg_turnaround_hours = excluded.trainer_avg_turnaround_hours,
      is_available = excluded.is_available,
      rate_lamports = excluded.rate_lamports,
      listing_id = excluded.listing_id,
      allowed_stats = excluded.allowed_stats,
      min_actions = excluded.min_actions,
      max_actions = excluded.max_actions,
      max_concurrent_fills = excluded.max_concurrent_fills,
      active_fills = excluded.active_fills,
      available_slots = excluded.available_slots,
      listed_at = excluded.listed_at,
      updated_at = excluded.updated_at`)

  let n = 0
  for (const c of doc.data?.contracts ?? []) {
    stmt.run(
      day, c.trainer_ref, c.trainer_display_name ?? null,
      c.trainer_prestige_level ?? null, c.trainer_season_pass_tier ?? null,
      c.rate_lamports ?? null, boolInt(c.is_available),
      c.trainer_jobs_settled ?? null, c.trainer_jobs_completed ?? null,
      c.trainer_completion_rate ?? null, c.trainer_on_time_rate ?? null,
      c.trainer_avg_turnaround_hours ?? null,
      c.listing_id ?? null,
      // null means the trainer takes every stat, which is different from taking
      // none, so it is preserved as null rather than flattened to an empty string.
      Array.isArray(c.allowed_stats) ? c.allowed_stats.join(',') : null,
      c.min_actions ?? null, c.max_actions ?? null,
      c.max_concurrent_fills ?? null, c.active_fills ?? null,
      c.available_slots ?? null, c.created_at ?? null, c.updated_at ?? null,
    )
    n++
  }
  return n
}

function loadEconomy(db, doc, capturedAt) {
  const d = doc.data ?? {}
  let n = 0

  const daily = db.prepare(`
    INSERT INTO economy_daily (day, minted, burned, net) VALUES (?,?,?,?)
    ON CONFLICT(day) DO UPDATE SET
      minted = excluded.minted, burned = excluded.burned, net = excluded.net`)
  for (const e of d.daily_emissions ?? []) {
    daily.run(e.day, e.minted ?? null, e.burned ?? null, e.net ?? null)
    n++
  }

  const sink = db.prepare(`
    INSERT INTO economy_sinks (captured_at, type, total) VALUES (?,?,?)
    ON CONFLICT(captured_at, type) DO UPDATE SET total = excluded.total`)
  for (const s of d.sink_distribution ?? []) {
    sink.run(capturedAt, s.type, s.total ?? null)
    n++
  }

  const t = d.totals
  if (t) {
    db.prepare(`
      INSERT INTO economy_totals (captured_at, total_racket_supply,
        lifetime_earned_racket, lifetime_spent_racket, wallet_count)
      VALUES (?,?,?,?,?)
      ON CONFLICT(captured_at) DO NOTHING`).run(
      capturedAt, t.total_racket_supply ?? null, t.lifetime_earned_racket ?? null,
      t.lifetime_spent_racket ?? null, t.wallet_count ?? null)
    n++
  }
  return n
}

function loadSupply(db, doc) {
  const stmt = db.prepare(`
    INSERT INTO supply_daily (date, total, burned_total, per_rarity, burned_per_rarity)
    VALUES (?,?,?,?,?)
    ON CONFLICT(date) DO UPDATE SET
      total = excluded.total, burned_total = excluded.burned_total,
      per_rarity = excluded.per_rarity,
      burned_per_rarity = excluded.burned_per_rarity`)

  let n = 0
  for (const h of doc.data?.history ?? []) {
    stmt.run(h.date, h.total ?? null, h.burned_total ?? null,
      jsonOrNull(h.per_rarity), jsonOrNull(h.burned_per_rarity))
    n++
  }
  return n
}

function loadCities(db, doc, capturedAt) {
  const day = dayOf(capturedAt)
  const stmt = db.prepare(`
    INSERT INTO cities_daily (
      day, city_id, city_name, league, season_number, season_started_at,
      season_ends_at, max_players, current_player_count, total_districts,
      districts_occupied, is_active
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(day, city_id) DO UPDATE SET
      current_player_count = excluded.current_player_count,
      districts_occupied = excluded.districts_occupied,
      is_active = excluded.is_active`)

  let n = 0
  for (const c of doc.data?.cities ?? []) {
    stmt.run(
      day, c.city_id, c.city_name ?? null, c.league ?? null,
      c.season_number ?? null, c.season_started_at ?? null, c.season_ends_at ?? null,
      c.max_players ?? null, c.current_player_count ?? null,
      c.total_districts ?? null, c.districts_occupied ?? null, boolInt(c.is_active),
    )
    n++
  }
  return n
}

/**
 * Open training jobs: the demand side of the trainer market.
 *
 * Keyed on job_id and upserted so a job seen across many snapshots keeps its
 * first sighting and advances its last. The API never says whether a job was
 * filled or simply expired, so how long it stayed visible is the only signal
 * we get, and it only exists because we snapshot.
 */
function loadOpenJobs(db, doc, capturedAt) {
  const stmt = db.prepare(`
    INSERT INTO open_jobs (
      job_id, owner_ref, owner_display_name, capo_id, capo_name, capo_rarity,
      allowed_stats, total_actions, consideration_lamports, house_fee_lamports,
      is_barter, payment_capo_rarity, min_completion_rate, deadline, created_at,
      first_seen_at, last_seen_at, observations
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    ON CONFLICT(job_id) DO UPDATE SET
      first_seen_at = MIN(first_seen_at, excluded.first_seen_at),
      last_seen_at = MAX(last_seen_at, excluded.last_seen_at),
      observations = observations + 1`)

  let n = 0
  for (const j of feedRows(doc, 'open_jobs')) {
    stmt.run(
      j.job_id, j.owner_ref ?? null, j.owner_display_name ?? null,
      j.capo_id ?? null, j.capo_name ?? null, j.capo_rarity ?? null,
      Array.isArray(j.allowed_stats) ? j.allowed_stats.join(',') : null,
      j.total_actions ?? null, j.consideration_lamports ?? null,
      j.house_fee_lamports ?? null, boolInt(j.is_barter),
      j.payment_capo_rarity ?? null, j.min_completion_rate ?? null,
      j.deadline ?? null, j.created_at ?? null,
      capturedAt, capturedAt,
    )
    n++
  }
  return n
}

const LOADERS = {
  leaderboards: loadLeaderboards,
  territory_cities: loadCities,
  market_listings: loadListings,
  market_sales: (db, doc) => loadSales(db, doc),
  market_sales_prestat_relic: (db, doc) => {
    // The 50-row sample captured minutes before the stats were removed. Stored
    // as a bare API response rather than a feed envelope, so it is wrapped here.
    return loadSales(db, { pages: [doc] })
  },
  capos: loadCapos,
  combat_players: loadCombat,
  market_traders: loadTraders,
  capos_production: loadProductionOwners,
  bounties: loadBounties,
  contracts: loadContracts,
  contracts_open_jobs: loadOpenJobs,
  economy: loadEconomy,
  supply: loadSupply,
}

// --------------------------------------------------------------- migrations ---

/**
 * Additive schema changes for databases that already exist.
 *
 * schema.sql only uses CREATE TABLE IF NOT EXISTS, which is a no-op once a table
 * is there, so new columns have to be added explicitly. Checked against
 * PRAGMA table_info rather than caught as an error, so a fresh database (which
 * already has the columns from schema.sql) takes the same path without throwing.
 */
function migrate(db) {
  const added = []
  const columns = (table) =>
    new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name))

  const salesCols = columns('sales')
  for (const col of ['buyer_ref', 'seller_ref']) {
    if (!salesCols.has(col)) {
      db.exec(`ALTER TABLE sales ADD COLUMN ${col} TEXT`)
      added.push(`sales.${col}`)
    }
  }

  const capoCols = columns('capos_daily')
  if (!capoCols.has('tier_promoted_at')) {
    db.exec('ALTER TABLE capos_daily ADD COLUMN tier_promoted_at TEXT')
    added.push('capos_daily.tier_promoted_at')
  }

  // The trainer feed carries capacity, job-size limits, which stats a trainer
  // will take and when the listing was created. None of it was stored, so the
  // marketplace could only be described by price and reputation. Needs
  // --rebuild to backfill from the archive.
  const trainerCols = columns('trainers_daily')
  for (const [col, type] of [
    ['listing_id', 'TEXT'], ['allowed_stats', 'TEXT'],
    ['min_actions', 'INTEGER'], ['max_actions', 'INTEGER'],
    ['max_concurrent_fills', 'INTEGER'], ['active_fills', 'INTEGER'],
    ['available_slots', 'INTEGER'], ['listed_at', 'TEXT'], ['updated_at', 'TEXT'],
  ]) {
    if (!trainerCols.has(col)) {
      db.exec(`ALTER TABLE trainers_daily ADD COLUMN ${col} ${type}`)
      added.push(`trainers_daily.${col}`)
    }
  }

  // Safe now that the columns are guaranteed to exist.
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sales_buyer_ref  ON sales (buyer_ref);
    CREATE INDEX IF NOT EXISTS idx_sales_seller_ref ON sales (seller_ref);
  `)

  if (added.length) console.log(`migrated: added ${added.join(', ')}`)
  return added
}

// -------------------------------------------------------------------- main ---

function main() {
  if (args.rebuild && fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH)
    console.log('removed existing database, replaying archive from raw')
  }

  const db = new DatabaseSync(DB_PATH)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA synchronous = NORMAL')
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'))
  migrate(db)

  const alreadyLoaded = new Set(
    db.prepare('SELECT path FROM loaded_files').all().map((r) => r.path),
  )
  const markLoaded = db.prepare(`
    INSERT INTO loaded_files (path, endpoint, captured_at, loaded_at, rows_loaded)
    VALUES (?,?,?,?,?) ON CONFLICT(path) DO NOTHING`)

  const startedAt = new Date().toISOString()
  let filesLoaded = 0
  let filesSkipped = 0
  const perEndpoint = {}

  for (const [endpoint, loader] of Object.entries(LOADERS)) {
    const files = listSnapshotFiles(endpoint)
    for (const file of files) {
      const rel = path.relative(ROOT, file)
      if (alreadyLoaded.has(rel)) {
        filesSkipped++
        continue
      }
      const capturedAt = capturedAtFromPath(file)
      let doc
      try {
        doc = readSnapshot(file)
      } catch (err) {
        console.error(`  SKIP ${rel}: unreadable (${err.message})`)
        continue
      }

      // One transaction per file: a failure rolls back cleanly and the file is
      // simply not marked loaded, so the next run retries it.
      db.exec('BEGIN')
      try {
        const rows = loader(db, doc, capturedAt)
        markLoaded.run(rel, endpoint, capturedAt, startedAt, rows)
        db.exec('COMMIT')
        filesLoaded++
        perEndpoint[endpoint] = (perEndpoint[endpoint] ?? 0) + rows
      } catch (err) {
        db.exec('ROLLBACK')
        console.error(`  FAIL ${rel}: ${err.message}`)
      }
    }
  }

  console.log(`loaded ${filesLoaded} new file(s), skipped ${filesSkipped} already loaded`)
  for (const [ep, rows] of Object.entries(perEndpoint).sort()) {
    console.log(`  ${ep.padEnd(28)} ${rows.toLocaleString()} rows`)
  }

  console.log('\ntable counts:')
  const tables = [
    'leaderboard_obs', 'listings', 'sales', 'capos_daily',
    'combat_daily', 'traders_daily', 'trainers_daily', 'production_owner_daily',
    'bounties', 'economy_daily', 'economy_sinks', 'economy_totals', 'supply_daily',
  ]
  for (const t of tables) {
    const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get()
    console.log(`  ${t.padEnd(28)} ${n.toLocaleString()}`)
  }

  db.close()
  console.log(`\ndatabase: ${path.relative(ROOT, DB_PATH)}`)
}

main()
