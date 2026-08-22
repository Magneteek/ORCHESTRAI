#!/usr/bin/env node
/**
 * Per-player capo rosters, sharded for on-demand loading.
 *
 * Carries both sides of a capo's ledger: `invested`, the RACKET its owner has
 * SPENT promoting it, and `earned`, the RACKET it has brought in from side
 * hustles. The second only became possible with /capos/production; before that
 * the sole per-capo earnings source was /leaderboards, capped at 50 rows and
 * naming 106 capos out of 95k alive, and this file said so at length.
 *
 * Three earnings fields travel together: `earned` (lifetime), `per_day` (the
 * game's own lifetime total over its active days) and `last_7d`. The rate is
 * what the Hustles tab benchmarks against a capo's class, and the week is what
 * tells an idle capo from a working one; lifetime alone cannot do either, since
 * a capo that earned heavily and then stopped looks identical to one still
 * working.
 *
 * All three are null, not zero, for a capo with no production row. Roughly half
 * the population has never earned, and a zero would claim we measured that.
 *
 * Sharded on the first two characters of owner_ref: 256 files of ~11KB rather
 * than one 2.9MB blob nobody needs all of, or 4,700 tiny files. A profile fetches
 * exactly one shard, and players who share a prefix share a cache hit.
 *
 * Usage: node derive/rosters.js
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { buildAgeResolver } from './age.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'data', 'site', 'rosters')

const db = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'), { readOnly: true })
const day = db.prepare('SELECT MAX(day) d FROM capos_daily').get().d

/**
 * Current season, taken from what sections.js already worked out.
 *
 * NOT `MAX(season_created)`: four capos in the whole archive carry season 18
 * against a real current season of 12, and trusting the max made every capo on
 * the site six years too old. capos.json derives the season from the actual
 * season calendar, so this reads that rather than re-deriving it differently.
 */
function currentSeasonFromSections() {
  const f = path.join(ROOT, 'data', 'site', 'capos.json')
  if (fs.existsSync(f)) {
    const s = JSON.parse(fs.readFileSync(f, 'utf8')).current_season
    if (Number.isFinite(s)) return s
  }
  // Fallback: the highest season that actually holds a meaningful population,
  // which ignores the handful of impossible rows.
  const rows = db.prepare(`SELECT season_created s, COUNT(*) n FROM capos_daily
    WHERE day = ? AND season_created IS NOT NULL GROUP BY s ORDER BY s`).all(day)
  const real = rows.filter((r) => r.n >= 100)
  return real.length ? real.at(-1).s : null
}
const currentSeason = currentSeasonFromSections()

const rows = db.prepare(`
  SELECT owner_ref, name, character_name, rarity, tier, role, specialty,
         season_created, total_racket_invested, status, is_founder, capo_id,
         created_at
  FROM capos_daily
  WHERE day = ? AND owner_ref IS NOT NULL
  ORDER BY owner_ref`).all(day)

// Age comes from the API where the archive has ever measured it, and is derived
// only where it has not. See derive/age.js: the old birth-season derivation aged
// every founder by eleven years.
const ages = buildAgeResolver(db, day)

/**
 * Lifetime RACKET earned, per capo, from the newest /capos/production snapshot.
 *
 * Read from raw rather than SQLite for the same reason players.js does: one
 * snapshot is 52k rows answering a question about now, and a daily table would
 * cost 19M rows a year to answer nothing extra.
 */
function earningsByCapo() {
  const dir = path.join(ROOT, 'data', 'raw', 'capos_production')
  if (!fs.existsSync(dir)) return new Map()
  const files = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name)
      if (e.isDirectory()) walk(f); else files.push(f)
    }
  })(dir)
  if (!files.length) return new Map()
  let j
  try { j = JSON.parse(zlib.gunzipSync(fs.readFileSync(files.sort().at(-1)))) } catch { return new Map() }
  while (j.data) j = j.data
  const out = new Map()
  for (const r of j.capos || []) {
    out.set(r.capo_id, {
      earned: r.total_racket_earned || 0,
      per_day: r.avg_racket_per_day || 0,
      last_7d: r.racket_last_7d || 0,
    })
  }
  return out
}
const earned = earningsByCapo()

const RARITY_ORDER = ['god', 'founder', 'legendary', 'epic', 'rare', 'uncommon', 'common']
const RANK_ORDER = ['boss', 'underboss', 'lieutenant', 'captain', 'soldier', 'recruit']
const idx = (arr, v) => { const i = arr.indexOf(v); return i === -1 ? arr.length : i }

// Positional arrays, not objects: repeating eleven key names 95,000 times cost
// 16.9MB against 3MB for the same data. Field order is published in the payload
// so the page decodes it without a hardcoded contract.
const FIELDS = ['name', 'rarity', 'tier', 'age', 'invested', 'active', 'earned', 'per_day', 'last_7d', 'age_basis']
const byRef = {}
// Basis codes travel as small integers rather than strings: repeating a word
// like "measured" 96,000 times costs more than the whole earnings column.
const BASIS = ['measured', 'measured+seasons', 'founder_base', 'derived', 'unknown']
for (const r of rows) {
  const a = ages.resolve(r)
  const age = a.age
  ;(byRef[r.owner_ref] ||= []).push([
    r.name || 'unnamed',
    idx(RARITY_ORDER, r.rarity),
    idx(RANK_ORDER, r.tier),
    age,
    r.total_racket_invested || 0,
    r.status === 'active' ? 1 : 0,
    earned.has(r.capo_id) ? earned.get(r.capo_id).earned : null,
    earned.has(r.capo_id) ? earned.get(r.capo_id).per_day : null,
    earned.has(r.capo_id) ? earned.get(r.capo_id).last_7d : null,
    Math.max(0, BASIS.indexOf(a.basis)),
  ])
}
// Best first: rarity, then rank, then the most invested in.
for (const list of Object.values(byRef)) list.sort((a, b) => a[1] - b[1] || a[2] - b[2] || b[4] - a[4])

fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR, { recursive: true })

const shards = {}
for (const [ref, list] of Object.entries(byRef)) {
  const key = ref.slice(0, 2)
  ;(shards[key] ||= {})[ref] = list
}
let bytes = 0
for (const [key, payload] of Object.entries(shards)) {
  const json = JSON.stringify({
    as_of: day, current_season: currentSeason,
    fields: FIELDS, rarities: RARITY_ORDER, ranks: RANK_ORDER, age_bases: BASIS,
    players: payload,
  })
  fs.writeFileSync(path.join(OUT_DIR, key + '.json'), json)
  bytes += Buffer.byteLength(json)
}

console.log('rosters:', rows.length, 'capos for', Object.keys(byRef).length, 'players')
console.log('  ' + earned.size.toLocaleString() + ' of them have an earnings row')
console.log('  ' + Object.keys(shards).length + ' shards,',
  (bytes / 1048576).toFixed(2) + ' MB total,',
  Math.round(bytes / Object.keys(shards).length / 1024) + ' KB average')
console.log('  current season', currentSeason, '(a capo born this season is 25)')
{
  const tally = {}
  for (const list of Object.values(byRef)) {
    for (const c of list) { const k = BASIS[c[9]]; tally[k] = (tally[k] || 0) + 1 }
  }
  console.log('  age basis:', Object.entries(tally)
    .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v.toLocaleString()}`).join(', '))
}
db.close()
