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

/* ------------------------------------------------------------------- fit --- */

/**
 * One logistic regression over every factor at once.
 *
 * The first version of this summed each factor's marginal effect, measured on
 * its own, and that was wrong in a way that only backtesting revealed. The
 * factors are correlated: attackers pick targets near their own rank, rarity
 * tracks rank, and districts sit inside leagues. Adding marginals counts the
 * same underlying advantage several times, so the extremes ran away. Fights it
 * called 80-plus percent actually won 63% out of sample, a 26 point error, and
 * confidently wrong is worse than absent.
 *
 * Fitting every coefficient in the presence of the others removes the double
 * counting by construction. The same backtest puts the worst band within about
 * 6 points, most within 2.
 *
 * L2 keeps thin cells from getting loud opinions, and an unseen combination
 * simply contributes nothing, which lands it on the population base rate
 * rather than on a coefficient invented from three fights.
 */
const L2 = 2.0
const LR = 0.5
const ITERS = 3000

function featureKeys(f, capo) {
  const a = capo.get(f.attacker_capo_id), d = capo.get(f.defender_capo_id)
  if (!a || !d || !a.tier || !d.tier) return null
  const k = ['m:' + f.attacker_specialty + '>' + f.defender_specialty,
             'rp:' + a.tier + '>' + d.tier]
  if (f.attacker_capo_rarity) k.push('ara:' + f.attacker_capo_rarity)
  if (f.defender_capo_rarity) k.push('dra:' + f.defender_capo_rarity)
  if (f.district_resource) k.push('dis:' + f.district_resource)
  if (f.city_league) k.push('lg:' + f.city_league)
  return k
}

function fitLogistic(rows, index) {
  const D = index.size
  const w = new Float64Array(D)
  const wins = rows.filter((r) => r.y).length
  let b = Math.log(Math.max(1, wins) / Math.max(1, rows.length - wins))

  // Resolve the string keys to column numbers once, not on every pass. Doing it
  // inside the loop meant three thousand iterations times twenty-four thousand
  // fights times six features of hash lookups, which took two minutes of CPU on
  // a box that also has to serve the site every twenty minutes.
  const N = rows.length
  const cols = new Int32Array(N * 6).fill(-1)
  const y = new Float64Array(N)
  rows.forEach((r, n) => {
    y[n] = r.y
    r.k.forEach((k, c) => { if (c < 6) cols[n * 6 + c] = index.has(k) ? index.get(k) : -1 })
  })

  const g = new Float64Array(D)
  for (let it = 0; it < ITERS; it++) {
    g.fill(0)
    let gb = 0
    for (let n = 0; n < N; n++) {
      const o = n * 6
      let z = b
      for (let c = 0; c < 6; c++) { const i = cols[o + c]; if (i >= 0) z += w[i] }
      const e = 1 / (1 + Math.exp(-z)) - y[n]
      gb += e
      for (let c = 0; c < 6; c++) { const i = cols[o + c]; if (i >= 0) g[i] += e }
    }
    for (let i = 0; i < D; i++) w[i] -= LR * (g[i] / N + (L2 * w[i]) / N)
    b -= (LR * gb) / N
  }
  return { w, b }
}

const scoreOf = (keys, coef, intercept) => {
  let z = intercept
  for (const k of keys) if (coef[k] != null) z += coef[k]
  return z
}

/**
 * Backtest on fights the fit never saw.
 *
 * Trained on the earlier three quarters, measured on the most recent quarter,
 * because in-sample calibration flatters any model and this one has already
 * been wrong once. The result is published on the page: a tool that states its
 * own error is one a reader can decide how far to trust.
 */
function validate(rows) {
  const cut = Math.floor(rows.length * 0.75)
  const tr = rows.slice(0, cut), te = rows.slice(cut)
  if (te.length < 500) return null
  const idx = new Map()
  for (const r of tr) for (const k of r.k) if (!idx.has(k)) idx.set(k, idx.size)
  const { w, b } = fitLogistic(tr, idx)
  const coef = {}
  for (const [k, i] of idx) coef[k] = w[i]

  const p = (r) => 1 / (1 + Math.exp(-scoreOf(r.k, coef, b)))
  const bands = [[0, 0.15], [0.15, 0.25], [0.25, 0.35], [0.35, 0.45],
                 [0.45, 0.55], [0.55, 0.65], [0.65, 0.8], [0.8, 1]]
  let worst = 0
  const table = []
  for (const [lo, hi] of bands) {
    const s = te.map((r) => ({ p: p(r), y: r.y })).filter((r) => r.p >= lo && r.p < hi)
    if (s.length < 25) continue
    const pr = 100 * s.reduce((t, r) => t + r.p, 0) / s.length
    const ac = 100 * s.filter((r) => r.y).length / s.length
    worst = Math.max(worst, Math.abs(ac - pr))
    table.push({ band: Math.round(lo * 100) + '-' + Math.round(hi * 100), n: s.length,
                 predicted: pct1(pr / 100), actual: pct1(ac / 100) })
  }
  const brier = te.reduce((t, r) => t + Math.pow(p(r) - r.y, 2), 0) / te.length
  const base = tr.filter((r) => r.y).length / tr.length
  const bb = te.reduce((t, r) => t + Math.pow(base - r.y, 2), 0) / te.length
  return {
    tested_on: te.length, trained_on: tr.length,
    worst_gap_pp: Math.round(worst * 10) / 10,
    brier: Math.round(brier * 1e4) / 1e4,
    baseline_brier: Math.round(bb * 1e4) / 1e4,
    better_than_guessing_pct: Math.round(1000 * (1 - brier / bb)) / 10,
    bands: table,
  }
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

  // ---- single-factor shifts used by the calculator
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'god', 'founder']
  const present = (list, m) => list.filter((k) => m.has(k))

  const RANKS = ['recruit', 'soldier', 'captain', 'lieutenant', 'underboss', 'boss']

  // ---- the model proper: one joint fit, then a backtest of it
  const sorted = F.slice().sort((x, y) =>
    String(x.resolved_at).localeCompare(String(y.resolved_at)))
  const rows = sorted.map((f) => ({ k: featureKeys(f, capo), y: f.winner === 'attacker' ? 1 : 0 }))
    .filter((r) => r.k)
  if (rows.length < 500) throw new Error('too few usable fights to fit a model')

  const index = new Map()
  for (const r of rows) for (const k of r.k) if (!index.has(k)) index.set(k, index.size)
  const fitted = fitLogistic(rows, index)
  const coef = {}
  for (const [k, i] of index) coef[k] = Math.round(fitted.w[i] * 1e4) / 1e4

  // How many fights stand behind each coefficient. Published because the page
  // has to be able to tell "we measured this" apart from "we have nothing":
  // bosses never attack captains, so that pair has no coefficient at all, and
  // silently falling back to the average would print a confident number with
  // nothing behind it.
  const support = {}
  for (const r of rows) for (const k of r.k) support[k] = (support[k] || 0) + 1

  const validation = validate(rows)

  /**
   * Total stats, applied on top of the fit rather than inside it.
   *
   * Only 549 fights know the attacker's power and 708 the defender's, against
   * 24k that know everything else. Folding it into the joint fit would throw
   * away 97% of the evidence to keep one column. Instead each band is measured
   * as the residual the fit does not already explain, on the rows where it is
   * known, which is why the reader can leave it on Not known and lose nothing.
   */
  const powerShifts = (side) => {
    const known = sorted.filter((f) => featureKeys(f, capo) && pband(f[side]) != null)
    if (known.length < 100) return {}
    const out = {}
    for (const band of POWER_BANDS) {
      const cells = known.filter((f) => pband(f[side]) === band.key)
      if (cells.length < 30) { out[band.key] = { n: cells.length, delta: 0, thin: true }; continue }
      // Mean residual in log-odds: how far the fit is off for this band.
      let obs = 0, exp = 0
      for (const f of cells) {
        obs += f.winner === 'attacker' ? 1 : 0
        exp += 1 / (1 + Math.exp(-scoreOf(featureKeys(f, capo), coef, fitted.b)))
      }
      const o = Math.min(0.98, Math.max(0.02, obs / cells.length))
      const e = Math.min(0.98, Math.max(0.02, exp / cells.length))
      out[band.key] = {
        n: cells.length, thin: false,
        delta: Math.round((Math.log(o / (1 - o)) - Math.log(e / (1 - e))) * 1e4) / 1e4,
      }
    }
    const keys = POWER_BANDS.map((b) => b.key)
    const fit = isotonic(keys.map((k) => out[k].delta), keys.map((k) => Math.max(1, out[k].n)),
      side === 'attacker_capo_id')
    keys.forEach((k, i) => {
      out[k].raw_delta = out[k].delta
      out[k].delta = Math.round(fit[i] * 1e4) / 1e4
    })
    return out
  }

  // The form's dropdowns come from the data, not from a list in the page, so a
  // rarity or league the game adds later appears without a code change.
  const seen = (get, order) => {
    const found = new Set(F.map(get).filter(Boolean))
    const known = (order || []).filter((k) => found.has(k))
    return known.concat([...found].filter((k) => !known.includes(k)).sort())
  }

  const model = {
    base_att_win_pct: pct1(baseP),
    ranks: RANKS,
    options: {
      specialties: specs,
      rarities: seen((f) => f.attacker_capo_rarity, rarities),
      districts: seen((f) => f.district_resource),
      leagues: seen((f) => f.city_league,
        ['street', 'borough', 'district', 'metro', 'kingpin']),
    },
    intercept: Math.round(fitted.b * 1e4) / 1e4,
    coef,
    support,
    // Below this the pair is treated as measured but shaky, not as fact.
    thin_below: 30,
    power_bands: POWER_BANDS.map((b) => ({ key: b.key, label: b.label })),
    attacker_power: powerShifts('attacker_capo_id'),
    defender_power: powerShifts('defender_capo_id'),
    validation,
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
  // Gear belongs beside the odds it moves, not on the capo census page.
  patch('wars.json', 'gear', gear)

  console.log(
    `merged combat model into wars.json (${F.length} fights, ${specs.length} specialties) ` +
    `and gear (${items.size} types)`)
}

main()
