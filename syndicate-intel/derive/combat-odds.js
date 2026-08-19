#!/usr/bin/env node
/**
 * Build the combat odds model from archived fights, plus the gear and stat-cap
 * reference tables.
 *
 * Everything here is measured, not assumed. The community calculators floating
 * around encode a guessed specialty wheel and a guessed passion formula because
 * the game does not publish either. We do not have to guess: /combat/fights
 * names both capos, both specialties, both rarities, the district and the
 * league on every settled fight, so the wheel can simply be counted.
 *
 * Per-capo stats are only half-visible. /capos withholds them (it carries a
 * stats_updated_at field and no stats), so muscle/hustle/brains/rep/grit exist
 * only for capos that have passed through the marketplace. Just 24 fights have
 * a known power total on BOTH sides, but 549 know the attacker's and 708 know
 * the defender's, which is enough to measure each side on its own. Those
 * shifts are therefore taken against the powered subsample's own base rate,
 * not the global one, so the selection bias in that sample contributes level
 * rather than slope.
 *
 * Rank is measured as a PAIR, not as two independent shifts. Attackers pick
 * targets near their own rank (bosses take 54% of their fights against other
 * bosses, recruits 33% against recruits), so adding a separate attacker and
 * defender shift would misread heavily assortative matching as two independent
 * effects. The pair is used wherever a cell holds 50 fights, with the additive
 * marginals as fallback for the sparse corners like boss against recruit.
 *
 * The rank effect survives that control: against captain defenders alone, the
 * attacker win rate still runs 13.0% for a recruit up to 70.4% for an
 * underboss. It is not an artifact of who picks whom.
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW = path.join(ROOT, 'data', 'raw')
const SITE = path.join(ROOT, 'data', 'site')

/* ------------------------------------------------------------------ load --- */

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const readGz = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)))

/**
 * Fights arrive as overlapping pages: the feed is polled hourly with a window
 * wider than the poll interval, so the same fight_id appears in many files.
 * Dedupe on fight_id or every rate below is weighted by how often we happened
 * to re-fetch a given fight.
 */
function loadFights() {
  const seen = new Set()
  const out = []
  for (const f of walk(path.join(RAW, 'combat_fights'))) {
    let j
    try { j = readGz(f) } catch { continue }
    for (const pg of j.pages || [j]) {
      for (const ft of (pg.data && pg.data.fights) || pg.fights || []) {
        if (seen.has(ft.fight_id)) continue
        seen.add(ft.fight_id)
        out.push(ft)
      }
    }
  }
  return out
}

/** The equipment snapshot is a full-state dump, so only the newest one matters. */
function loadEquipment() {
  const files = walk(path.join(RAW, 'equipment')).sort()
  if (!files.length) return []
  try { return readGz(files.at(-1)).data.equipment || [] } catch { return [] }
}

/* ------------------------------------------------------------- counting --- */

const pct1 = (n) => Math.round(n * 1000) / 10

/**
 * Wilson score interval.
 *
 * A plain win rate hides how much it should be trusted, and these cells range
 * from ~900 fights down to a handful. Wilson is used rather than the textbook
 * normal interval because it stays inside 0..1 and stays sane at small n, which
 * is exactly where a reader is most likely to be misled.
 */
function wilson(wins, n) {
  if (!n) return [0, 0]
  const z = 1.96
  const p = wins / n
  const d = 1 + (z * z) / n
  const c = p + (z * z) / (2 * n)
  const s = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return [Math.max(0, (c - s) / d), Math.min(1, (c + s) / d)]
}

/** Attacker wins over a subset, with its interval attached. */
function rate(fights) {
  const n = fights.length
  const w = fights.filter((f) => f.winner === 'attacker').length
  const [lo, hi] = wilson(w, n)
  return { n, att_win_pct: n ? pct1(w / n) : null, lo: pct1(lo), hi: pct1(hi) }
}

/**
 * Log-odds shift of a subset against the whole corpus.
 *
 * The calculator needs to combine four factors (matchup, defender rarity,
 * district, league) and there are far too few fights to look up every
 * combination directly: 5 x 7 x 5 x 5 is 875 cells over 23k fights. So each
 * factor is measured on its own and combined additively in log-odds, which is
 * the standard independence assumption. It is an approximation, and the page
 * says so, but it degrades gracefully where a full cross-tab would just be
 * noise.
 */
function logit(p) { return Math.log(p / (1 - p)) }

function shift(fights, baseP) {
  const n = fights.length
  if (n < 30) return { n, delta: 0, thin: true }
  const w = fights.filter((f) => f.winner === 'attacker').length
  // Clamp away from 0 and 1 so a freak all-wins cell cannot produce infinity.
  const p = Math.min(0.98, Math.max(0.02, w / n))
  return { n, delta: logit(p) - logit(baseP), thin: false }
}

function byKey(fights, key) {
  const m = new Map()
  for (const f of fights) {
    const k = typeof key === 'function' ? key(f) : f[key]
    if (k == null) continue
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(f)
  }
  return m
}



/**
 * Pool-adjacent-violators, weighted by sample size.
 *
 * Used ONLY on the power bands, where the direction is not in question: more
 * total stats is a stronger capo, on either side of a fight. The bands mostly
 * agree already; the one inversion is the defender's 300-plus cell resting on
 * 65 fights, which is noise the reader would rightly read as nonsense. This is
 * the least-squares monotone fit, so it changes nothing where the data agrees.
 *
 * It is deliberately NOT used on traits. Finesse and passion invert direction
 * between ranks with intervals that do not overlap, which is a real result,
 * not something to be fitted away.
 */
function isotonic(deltas, weights, increasing) {
  const sgn = increasing ? 1 : -1
  const b = deltas.map((d, i) => ({ sum: sgn * d * weights[i], w: weights[i], len: 1 }))
  for (let i = 1; i < b.length; i++) {
    while (i > 0 && b[i - 1].sum / b[i - 1].w > b[i].sum / b[i].w) {
      b[i - 1].sum += b[i].sum; b[i - 1].w += b[i].w; b[i - 1].len += b[i].len
      b.splice(i, 1); i--
    }
  }
  const out = []
  for (const blk of b) for (let k = 0; k < blk.len; k++) out.push(sgn * blk.sum / blk.w)
  return out
}

/* ---------------------------------------------------------------- build --- */

function main() {
  const F = loadFights().filter((f) => f.winner)
  if (!F.length) throw new Error('no fights archived; nothing to model')

  const times = F.map((f) => f.resolved_at || f.initiated_at).filter(Boolean).sort()
  const baseW = F.filter((f) => f.winner === 'attacker').length
  const baseP = baseW / F.length

  // ---- specialty wheel, the thing every community tool guesses at
  const specs = [...new Set(F.map((f) => f.attacker_specialty).filter(Boolean))].sort()
  const matrix = {}
  for (const a of specs) {
    matrix[a] = {}
    for (const d of specs) {
      matrix[a][d] = rate(
        F.filter((f) => f.attacker_specialty === a && f.defender_specialty === d))
    }
  }

  // ---- rank and finesse, read from the latest capo snapshot
  const db0 = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'), { readOnly: true })
  const day = db0.prepare('SELECT MAX(day) d FROM capos_daily').get().d
  const capo = new Map()
  for (const r of db0.prepare(
    'SELECT capo_id, tier, trait_finesse fi FROM capos_daily WHERE day = ?').all(day)) {
    capo.set(r.capo_id, r)
  }
  db0.close()

  // ---- power totals, from the marketplace sample
  const db1 = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'), { readOnly: true })
  const power = new Map()
  for (const r of db1.prepare(
    'SELECT capo_id, MAX(power_sum) p FROM listings WHERE power_sum IS NOT NULL GROUP BY capo_id',
  ).all()) power.set(r.capo_id, r.p)
  db1.close()

  const POWER_BANDS = [
    { key: 'under100', label: 'Under 100', lo: 0, hi: 99 },
    { key: '100_199', label: '100 to 199', lo: 100, hi: 199 },
    { key: '200_299', label: '200 to 299', lo: 200, hi: 299 },
    { key: '300plus', label: '300 or more', lo: 300, hi: Infinity },
  ]
  const pband = (id) => {
    const p = power.get(id)
    if (p == null) return null
    return (POWER_BANDS.find((b) => p >= b.lo && p <= b.hi) || {}).key || null
  }

  /**
   * Power shifts are measured against the powered subsample's own base rate.
   *
   * Capos that reach the marketplace are not a random draw, and it shows: the
   * weakest attacker band still wins 41.4% against a 30.7% population average.
   * Taking the shift against the global base would import that selection as if
   * it were an effect of power. Against the subsample base it carries only the
   * relative step from one band to the next, which is what the reader picks.
   */
  const powerShifts = (side) => {
    const known = F.filter((f) => pband(f[side]) != null)
    if (known.length < 100) return {}
    const kw = known.filter((f) => f.winner === 'attacker').length
    const kp = Math.min(0.98, Math.max(0.02, kw / known.length))
    const out = {}
    for (const b of POWER_BANDS) {
      const cells = known.filter((f) => pband(f[side]) === b.key)
      out[b.key] = shift(cells, kp)
    }
    // More power helps the attacker win and helps the defender hold, so the
    // attacker's deltas rise across the bands and the defender's fall.
    const keys = POWER_BANDS.map((b) => b.key)
    const fitted = isotonic(
      keys.map((k) => out[k].delta), keys.map((k) => Math.max(1, out[k].n)),
      side === 'attacker_capo_id')
    keys.forEach((k, i) => {
      out[k].raw_delta = out[k].delta
      out[k].delta = Math.round(fitted[i] * 1e4) / 1e4
    })
    return out
  }

  // ---- single-factor shifts used by the calculator
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'god', 'founder']
  const present = (list, m) => list.filter((k) => m.has(k))

  const rankPairM = byKey(F, (f) => {
    const a = capo.get(f.attacker_capo_id), d = capo.get(f.defender_capo_id)
    return a && d && a.tier && d.tier ? a.tier + '|' + d.tier : null
  })
  const attRankM = byKey(F, (f) => capo.get(f.attacker_capo_id)?.tier || null)
  const defRankM = byKey(F, (f) => capo.get(f.defender_capo_id)?.tier || null)
  const defRarM = byKey(F, 'defender_capo_rarity')
  const attRarM = byKey(F, 'attacker_capo_rarity')
  const resM = byKey(F, 'district_resource')
  const leagueM = byKey(F, 'city_league')
  const tierM = byKey(F, 'district_tier')

  const shiftsFor = (m, keys) => Object.fromEntries(
    keys.map((k) => [k, { ...shift(m.get(k), baseP), hold_pct: pct1(
      m.get(k).filter((f) => f.winner === 'defender').length / m.get(k).length) }]))

  const RANKS = ['recruit', 'soldier', 'captain', 'lieutenant', 'underboss', 'boss']
  // Only pairs with real support; the page falls back to the marginals below.
  const pairKeys = [...rankPairM.keys()].filter((k) => rankPairM.get(k).length >= 50).sort()

  const model = {
    base_att_win_pct: pct1(baseP),
    ranks: RANKS,
    rank_pair: shiftsFor(rankPairM, pairKeys),
    attacker_rank: shiftsFor(attRankM, present(RANKS, attRankM)),
    defender_rank: shiftsFor(defRankM, present(RANKS, defRankM)),
    power_bands: POWER_BANDS.map((b) => ({ key: b.key, label: b.label })),
    attacker_power: powerShifts('attacker_capo_id'),
    defender_power: powerShifts('defender_capo_id'),
    defender_rarity: shiftsFor(defRarM, present(rarities, defRarM)),
    attacker_rarity: shiftsFor(attRarM, present(rarities, attRarM)),
    district_resource: shiftsFor(resM, [...resM.keys()].sort()),
    city_league: shiftsFor(leagueM, [...leagueM.keys()].sort()),
    district_tier: shiftsFor(tierM, [...tierM.keys()].sort()),
  }

  // ---- passion, the other guessed formula
  const flips = F.filter((f) => f.passion_flip)
  const noflips = F.filter((f) => !f.passion_flip)
  const passion = {
    flip_rate_pct: pct1(flips.length / F.length),
    n_flips: flips.length,
    hold_pct_with_flip: pct1(flips.filter((f) => f.winner === 'defender').length / flips.length),
    hold_pct_without: pct1(noflips.filter((f) => f.winner === 'defender').length / noflips.length),
  }

  // ---- named gear effects, rare but real
  const flags = {
    bomb_suit_saved: F.filter((f) => f.bomb_suit_saved).length,
    brass_spared: F.filter((f) => f.brass_spared).length,
    extorted: F.filter((f) => f.extorted).length,
  }

  // ---- gear reference
  const eq = loadEquipment()
  const items = new Map()
  const ladder = new Map()
  for (const e of eq) {
    if (!e.primary_stat) continue          // haul_chest carries no stat
    const k = e.item_type
    if (!items.has(k)) items.set(k, { item_type: k, slot: e.slot, stat: e.primary_stat, n: 0 })
    items.get(k).n++
    if (!ladder.has(e.rarity)) {
      ladder.set(e.rarity, {
        rarity: e.rarity, primary_pct: e.primary_stat_pct,
        secondary_pct: e.secondary_stat_pct, max_durability: e.max_durability, n: 0,
      })
    }
    const l = ladder.get(e.rarity)
    l.n++
    // Durability is the headline difference between tiers, so keep the top of
    // the observed range rather than whichever item happened to be seen first.
    if (e.max_durability > l.max_durability) l.max_durability = e.max_durability
  }

  const odds = {
    fights: {
      n: F.length,
      from: times[0] || null,
      to: times.at(-1) || null,
      attacker_win_pct: pct1(baseP),
      defender_hold_pct: pct1(1 - baseP),
    },
    specialties: specs,
    matrix,
    model,
    passion,
    flags,
  }

  const gear = {
    items: [...items.values()].sort((a, b) =>
      a.stat.localeCompare(b.stat) || a.slot.localeCompare(b.slot)),
    ladder: [...ladder.values()].sort((a, b) => a.primary_pct - b.primary_pct),
    total_items: eq.length,
    broken_pct: eq.length
      ? pct1(eq.filter((e) => e.durability === 0).length / eq.length) : null,
  }

  // Patch, do not replace: sections.js owns these files and has already written
  // the rest of each page's data. Reading them back and merging keeps this step
  // additive, so a failure here leaves the pages working without the model
  // rather than emptying them.
  const patch = (name, key, value) => {
    const f = path.join(SITE, name)
    if (!fs.existsSync(f)) throw new Error(`${name} missing; run derive/sections.js first`)
    const j = JSON.parse(fs.readFileSync(f, 'utf8'))
    j[key] = value
    fs.writeFileSync(f, JSON.stringify(j))
  }
  patch('wars.json', 'odds', odds)
  patch('capos.json', 'gear', gear)

  console.log(
    `merged combat model into wars.json (${F.length} fights, ${specs.length} specialties) ` +
    `and gear into capos.json (${items.size} types)`)
}

main()
