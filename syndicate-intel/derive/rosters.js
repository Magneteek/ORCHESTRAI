#!/usr/bin/env node
/**
 * Per-player capo rosters, sharded for on-demand loading.
 *
 * WHAT IS NOT HERE: RACKET collected per capo. The API exposes per-capo earnings
 * only through /leaderboards, which is capped at 50 rows and has ever named 106
 * capos belonging to 17 owners, out of 95k+ alive. There is no honest way to put
 * an earnings column on a roster, so this carries `invested` instead, which is
 * the RACKET the owner has SPENT promoting that capo. It is a cost, not income,
 * and the page says so.
 *
 * Sharded on the first two characters of owner_ref: 256 files of ~11KB rather
 * than one 2.9MB blob nobody needs all of, or 4,700 tiny files. A profile fetches
 * exactly one shard, and players who share a prefix share a cache hit.
 *
 * Usage: node derive/rosters.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

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
         season_created, total_racket_invested, status, is_founder
  FROM capos_daily
  WHERE day = ? AND owner_ref IS NOT NULL
  ORDER BY owner_ref`).all(day)

const RARITY_ORDER = ['god', 'founder', 'legendary', 'epic', 'rare', 'uncommon', 'common']
const RANK_ORDER = ['boss', 'underboss', 'lieutenant', 'captain', 'soldier', 'recruit']
// Alphabetical, because no order is meaningful: specialty is a matchup
// property, and averaged across opponents the five sit within 1.6 points of
// each other. Ranking them would imply a hierarchy the fights do not support.
const SPEC_ORDER = ['enforcer', 'fixer', 'hustler', 'negotiator', 'survivor']
const ROLE_ORDER = ['garrison', 'hustler', 'unassigned']
const idx = (arr, v) => { const i = arr.indexOf(v); return i === -1 ? arr.length : i }

// Positional arrays, not objects: repeating eleven key names 95,000 times cost
// 16.9MB against 3MB for the same data. Field order is published in the payload
// so the page decodes it without a hardcoded contract.
// specialty and role are carried so the profile can rank a roster against the
// combat model without a second request: the model keys on the specialty
// matchup, and role is what separates a capo that is working from one that is
// merely in the twenty.
const FIELDS = ['name', 'rarity', 'tier', 'age', 'invested', 'active', 'specialty', 'role']
const byRef = {}
for (const r of rows) {
  const age = r.season_created != null && currentSeason != null
    ? 25 + Math.max(0, currentSeason - r.season_created)
    : null
  ;(byRef[r.owner_ref] ||= []).push([
    r.name || 'unnamed',
    idx(RARITY_ORDER, r.rarity),
    idx(RANK_ORDER, r.tier),
    age,
    r.total_racket_invested || 0,
    r.status === 'active' ? 1 : 0,
    idx(SPEC_ORDER, r.specialty),
    idx(ROLE_ORDER, r.role || 'unassigned'),
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
    fields: FIELDS, rarities: RARITY_ORDER, ranks: RANK_ORDER,
    specialties: SPEC_ORDER, roles: ROLE_ORDER,
    // The roster is capped at 20; everything above that is held but cannot act.
    roster_cap: 20,
    players: payload,
  })
  fs.writeFileSync(path.join(OUT_DIR, key + '.json'), json)
  bytes += Buffer.byteLength(json)
}

console.log('rosters:', rows.length, 'capos for', Object.keys(byRef).length, 'players')
console.log('  ' + Object.keys(shards).length + ' shards,',
  (bytes / 1048576).toFixed(2) + ' MB total,',
  Math.round(bytes / Object.keys(shards).length / 1024) + ' KB average')
console.log('  current season', currentSeason, '(a capo born this season is 25)')
db.close()
