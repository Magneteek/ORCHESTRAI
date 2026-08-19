#!/usr/bin/env node
/**
 * A strategist for one player, built only from what the archive measured.
 *
 * There is no model writing prose here and no advice that traces to a hunch.
 * Every line either comes out of 24k settled fights, out of a mapping the game
 * publishes deterministically, or it does not get printed. Where the data runs
 * out, the report says so rather than filling the gap, because a strategist
 * that guesses confidently is worse than one that stops.
 *
 * The division of labour matters. The archive can see things no single player
 * can: every fight anyone had, what every rarity sells for, which specialty
 * actually beats which. It cannot see the things only you can: your capos'
 * stats, your gear, your plans. /capos withholds muscle, hustle, brains, rep
 * and grit entirely; those exist only for capos that have passed through the
 * marketplace, 2,709 of 96,806. So this reports what the archive knows and is
 * explicit about the rest.
 *
 * Usage:
 *   node tools/advise.js "Don Krisleone"
 *   node tools/advise.js shadiego --target survivor/captain/rare --district racket_hub
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

/* ----------------------------------------------------------------- args --- */

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf('--' + name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
const who = argv.filter((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true)[0]

if (!who) {
  console.error('usage: node tools/advise.js "<player name>" [--target spec/rank/rarity] [--district <type>]')
  process.exit(1)
}

/* ----------------------------------------------------------------- data --- */

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'))
const players = readJson('data/boards/players.json')
const odds = readJson('data/site/wars.json').odds
const capos = readJson('data/site/capos.json')
const model = odds.model

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '')
const me = players.players.find((p) => norm(p.name) === norm(who))
  || players.players.find((p) => norm(p.name).includes(norm(who)))
if (!me) {
  console.error(`no player matching "${who}"`)
  process.exit(1)
}

const db = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'), { readOnly: true })
const day = db.prepare('SELECT MAX(day) d FROM capos_daily').get().d
const roster = db.prepare(
  `SELECT name, rarity, tier, specialty, personality, role, status,
          trait_greed AS greed, trait_finesse AS finesse, trait_passion AS passion,
          leash_level AS leash, total_racket_invested AS invested
   FROM capos_daily WHERE day = ? AND owner_ref = ?`).all(day, me.ref)

/* ---------------------------------------------------------------- fights --- */

/**
 * The raw fight archive, read here rather than through the site's JSON.
 *
 * The published model carries coefficients, which are the right thing for
 * combining factors and the wrong thing for showing a reader. Nobody wants to
 * be told a district has a coefficient of 0.31; they want to know it holds
 * 63.6% of the time. Those observed rates are only a pass over 24k rows, which
 * costs about a second locally and keeps this tool free of numbers the site
 * would also have to carry.
 */
function loadFights() {
  const dir = path.join(ROOT, 'data', 'raw', 'combat_fights')
  if (!fs.existsSync(dir)) return []
  const files = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name)
      if (e.isDirectory()) walk(f); else files.push(f)
    }
  })(dir)
  const seen = new Set()
  const out = []
  for (const f of files) {
    let j
    try { j = JSON.parse(zlib.gunzipSync(fs.readFileSync(f))) } catch { continue }
    for (const pg of j.pages || [j]) {
      for (const ft of (pg.data && pg.data.fights) || pg.fights || []) {
        if (!ft.winner || seen.has(ft.fight_id)) continue
        seen.add(ft.fight_id)
        out.push(ft)
      }
    }
  }
  return out
}

const FIGHTS = loadFights()

/** Defender hold rate over any subset, with its sample size. */
const holdRate = (pick) => {
  const s = FIGHTS.filter(pick)
  if (!s.length) return null
  return { pct: 100 * s.filter((f) => f.winner === 'defender').length / s.length, n: s.length }
}

/* ---------------------------------------------------------------- model --- */

const invlogit = (x) => 1 / (1 + Math.exp(-x))

/**
 * The same jointly-fitted model the site serves, applied here rather than
 * re-derived, so the advice and the public page can never disagree.
 *
 * Returns null where the archive has no fights between those two ranks. That
 * silence is the point: bosses never attack captains, and inventing a number
 * for it would be the one failure this tool exists to avoid.
 */
function winChance({ as, ar, ara, ds, dr, dra, district, league }) {
  const rank = 'rp:' + ar + '>' + dr
  if (model.coef[rank] == null) return null
  const keys = ['m:' + as + '>' + ds, rank, 'ara:' + ara, 'dra:' + dra,
    'dis:' + district, 'lg:' + league]
  let x = model.intercept
  for (const k of keys) if (model.coef[k] != null) x += model.coef[k]
  const support = model.support?.[rank] ?? 0
  return { p: 100 * invlogit(x), support, thin: support < (model.thin_below ?? 30) }
}

/**
 * Rank a roster, keeping thinly-evidenced capos out of the ordering.
 *
 * A coefficient fitted on a handful of fights gets shrunk almost to zero by
 * the regularisation, which reads as "rank does not matter here" rather than
 * "we do not know". That produced a real absurdity in testing: an underboss
 * ranked 18th against a recruit, below captains, on the strength of 7 fights.
 * Sorting a badly estimated number in with well estimated ones corrupts the
 * whole list, so they come out and get reported separately.
 */
function rankRoster(list, build, better) {
  const scored = list.map((x) => ({ x, r: build(x) })).filter((s) => s.r)
  const solid = scored.filter((s) => !s.r.thin).sort(better)
  const thin = scored.filter((s) => s.r.thin).sort(better)
  return { solid, thin, dropped: list.length - scored.length }
}

/* ---------------------------------------------------------------- print --- */

const W = 74
const rule = (c = '-') => console.log(c.repeat(W))
const head = (t) => { console.log(''); rule('='); console.log('  ' + t.toUpperCase()); rule('=') }
const sub = (t) => { console.log(''); console.log('  ' + t); console.log('  ' + '-'.repeat(t.length)) }
const n = (v) => Number(v || 0).toLocaleString('en-US')
const pct = (v) => (v == null ? '   -  ' : v.toFixed(1).padStart(5) + '%')

/* --------------------------------------------------------------- report --- */

const league = me.territory?.league || 'street'
const [tSpec, tRank, tRare] = (flag('target', 'survivor/captain/rare')).split('/')
const tDistrict = flag('district', 'racket_hub')

console.log('')
rule('=')
console.log('  ' + me.name.toUpperCase())
console.log('  read from ' + n(odds.fights.n) + ' settled fights, ' + n(capos.total) + ' capos, on ' + day)
rule('=')

/* ---- standing */
head('where you stand')
const c = me.combat
if (me.territory) {
  const t = me.territory
  console.log(`  ${t.city} (${t.league} league) — ${t.place} of ${t.of} on ${t.districts} district${t.districts === 1 ? '' : 's'}`)
} else {
  console.log('  You hold no territory, so you have no league standing.')
}
if (c) {
  console.log(`  ${n(c.won)} of ${n(c.fights)} fights won (${c.win_rate}%)`)
  console.log(`  attacking ${n(c.attacks_won)}/${n(c.attacks)}` +
    (c.attacks ? ` (${(100 * c.attacks_won / c.attacks).toFixed(1)}%)` : '') +
    `   defending ${n(c.defenses_held)}/${n(c.defenses)}` +
    (c.defenses ? ` (${c.hold_rate}%)` : ''))
  // The population baselines, so a number has something to be good or bad against.
  console.log(`  the field averages ${odds.fights.attacker_win_pct}% attacking, ${odds.fights.defender_hold_pct}% holding`)
}

/* ---- the roster, which is capped */
head('your twenty')
/**
 * The roster is capped at 20. Everything else a player owns sits outside it as
 * a collectible and cannot act until it is swapped in.
 *
 * This tool originally read the unassigned pile as idle capacity and called it
 * the largest free gain on the page. That was backwards: those capos are not
 * idle, they are benched, and for a player already at 20 of 20 there is no free
 * gain at all. The cap is visible in the archive once you look for it, with
 * 1,043 players sitting at exactly 20 and the count falling off a cliff above.
 */
const ROSTER_CAP = 20
const active = roster.filter((x) => x.status === 'active')
const bench = roster.filter((x) => x.status !== 'active')
const activeRoles = {}
for (const x of active) activeRoles[x.role || 'unassigned'] = (activeRoles[x.role || 'unassigned'] || 0) + 1

console.log(`  ${active.length} of ${ROSTER_CAP} slots in play, ${n(bench.length)} on the bench`)
console.log('')
for (const [k, v] of Object.entries(activeRoles).sort((a2, b2) => b2[1] - a2[1])) {
  console.log(`    ${String(k).padEnd(14)}${String(v).padStart(4)}`)
}
if (active.length < ROSTER_CAP) {
  console.log('')
  console.log(`  ${ROSTER_CAP - active.length} slot${ROSTER_CAP - active.length === 1 ? '' : 's'} empty. Filling them costs nothing.`)
} else if (bench.length) {
  console.log('')
  console.log('  Full. Nothing improves without swapping somebody out, so the')
  console.log('  question below is whether these are the right twenty.')
}

/* ---- is the bench stronger than the roster? */
if (bench.length && active.length) {
  const strength = (x) => winChance({
    as: x.specialty, ar: x.tier, ara: x.rarity,
    ds: 'survivor', dr: 'captain', dra: 'rare', district: 'racket_hub', league,
  })
  const rate = (list) => list.map((x) => ({ x, r: strength(x) }))
    .filter((s) => s.r && !s.r.thin)
    .sort((a2, b2) => b2.r.p - a2.r.p)
  const inPlay = rate(active)
  const benched = rate(bench)

  if (inPlay.length && benched.length) {
    const weakest = inPlay.at(-1)
    const upgrades = benched.filter((s) => s.r.p > weakest.r.p)
    sub('your bench against your roster')
    console.log('  ranked as attackers, so this is about fighting, not earning')
    console.log('')
    console.log(`   in play, weakest:  ${pct(weakest.r.p)}  ${weakest.x.name} (${weakest.x.tier})`)
    console.log(`   benched, strongest:${pct(benched[0].r.p)}  ${benched[0].x.name} (${benched[0].x.tier})`)
    console.log('')
    if (upgrades.length) {
      console.log(`  ${upgrades.length} benched capo${upgrades.length === 1 ? '' : 's'} out-rank your weakest active one.`)
      for (const s of upgrades.slice(0, 4)) {
        console.log(`   ${pct(s.r.p)}  ${s.x.name.padEnd(22)}${s.x.specialty.padEnd(11)}${s.x.tier.padEnd(11)}${s.x.rarity}`)
      }
      console.log('')
      console.log('  Worth knowing before you swap: a capo earns while it hustles,')
      console.log('  and nothing in the archive reports what hustling pays. This')
      console.log('  ranks them as fighters only.')
    } else {
      console.log('  Nobody on the bench out-ranks your weakest active capo as a')
      console.log('  fighter. Your twenty are already your twenty.')
    }
  }
}

/* ---- attack */
head('who to send')
console.log(`  against a ${tRare} ${tSpec} at ${tRank}, holding a ${tDistrict.replace(/_/g, ' ')}`)
console.log(`  in a ${league} league city`)
const line = (s) => `   ${pct(s.r.p)}  ${s.x.name.padEnd(22)}${s.x.specialty.padEnd(11)}${s.x.tier.padEnd(11)}${s.x.rarity}`
const att = rankRoster(roster,
  (x) => winChance({ as: x.specialty, ar: x.tier, ara: x.rarity, ds: tSpec, dr: tRank, dra: tRare, district: tDistrict, league }),
  (a, b) => b.r.p - a.r.p)
const ranked = att.solid

if (!ranked.length) {
  console.log('')
  console.log('  No fights on record between your ranks and that target.')
} else {
  sub('your best')
  for (const s of ranked.slice(0, 5)) console.log(line(s))
  sub('your worst')
  for (const s of ranked.slice(-2)) console.log(line(s))
  console.log('')
  console.log(`  Spread across your roster: ${ranked.at(-1).r.p.toFixed(1)}% to ${ranked[0].r.p.toFixed(1)}%.`)
  console.log('  Picking the right capo matters more than anything else you control.')
}
if (att.thin.length) {
  sub('not placed')
  console.log('  Too few fights on record at these ranks to rank them honestly.')
  console.log('  The model would shrink them toward the average, which for a high')
  console.log('  rank against a low one reads far worse than the truth.')
  console.log('')
  for (const s of att.thin.slice(0, 4)) {
    console.log(`   ${s.x.name.padEnd(22)}${s.x.tier.padEnd(12)}${String(s.r.support).padStart(4)} fights on record`)
  }
}

/* ---- defence */
head('who to garrison')
/**
 * Ranked by how badly a typical attacker does against them, so lower is better.
 * The result is counterintuitive and worth stating plainly: rarity defends
 * WORSE, consistently, at every rank. Gods hold 59.4% against uncommons at
 * 73.5%. Most likely they are posted to contested ground rather than the trait
 * weakening them, but either way the archive is clear about what happens.
 */
const def = rankRoster(roster,
  (x) => winChance({ as: 'enforcer', ar: 'captain', ara: 'rare', ds: x.specialty, dr: x.tier, dra: x.rarity, district: 'safe_house', league }),
  (a, b) => a.r.p - b.r.p)
const asDefender = def.solid

if (asDefender.length) {
  console.log('  attacker win rate against each, so lower is better')
  console.log('  measured against a rare captain enforcer, in a safe house')
  sub('hardest to take')
  for (const s of asDefender.slice(0, 5)) console.log(line(s))
}
const garrisoned = roster.filter((x) => x.role === 'garrison').length
console.log('')
console.log(`  You currently garrison ${garrisoned} capo${garrisoned === 1 ? '' : 's'}.`)

sub('and where')
console.log('  how often a defender holds, by district type')
const districts = [...new Set(FIGHTS.map((f) => f.district_resource).filter(Boolean))]
  .map((d) => ({ d, r: holdRate((f) => f.district_resource === d) }))
  .filter((x) => x.r)
  .sort((a, b) => b.r.pct - a.r.pct)
for (const x of districts) {
  console.log(`   ${x.r.pct.toFixed(1).padStart(5)}%  ${x.d.replace(/_/g, ' ').padEnd(20)}${n(x.r.n)} fights`)
}
if (districts.length > 1) {
  console.log('')
  console.log(`  A ${districts[0].d.replace(/_/g, ' ')} holds ${(districts[0].r.pct - districts.at(-1).r.pct).toFixed(1)} points better than a ${districts.at(-1).d.replace(/_/g, ' ')}.`)
}

sub('and in which league')
const leagues = [...new Set(FIGHTS.map((f) => f.city_league).filter(Boolean))]
  .map((l) => ({ l, r: holdRate((f) => f.city_league === l) }))
  .filter((x) => x.r)
  .sort((a, b) => b.r.pct - a.r.pct)
for (const x of leagues) {
  const mine = x.l === league ? '  <- you' : ''
  console.log(`   ${x.r.pct.toFixed(1).padStart(5)}%  ${x.l.padEnd(20)}${n(x.r.n)} fights${mine}`)
}

/* ---- roster shape */
head('the shape of your roster')
/**
 * Specialty is a matchup property, not a flat stat, so a mix is only good or
 * bad relative to what it is used for. Attacking it matters: enforcer into
 * survivor is 25.9% and enforcer into enforcer is 35.3%. Defending, the whole
 * spread is under three points, so a defensive tilt is worth far less than it
 * sounds.
 */
const specAtt = {}
const specDef = {}
for (const sp of odds.specialties) {
  let w = 0, t = 0
  for (const d of odds.specialties) {
    const cell = odds.matrix[sp]?.[d]
    if (cell?.n) { w += cell.att_win_pct * cell.n; t += cell.n }
  }
  specAtt[sp] = t ? w / t : null
  let dw = 0, dt = 0
  for (const a2 of odds.specialties) {
    const cell = odds.matrix[a2]?.[sp]
    if (cell?.n) { dw += cell.att_win_pct * cell.n; dt += cell.n }
  }
  specDef[sp] = dt ? 100 - dw / dt : null
}
const mix = {}
for (const x of roster) mix[x.specialty] = (mix[x.specialty] || 0) + 1
console.log('  yours, against how that specialty performs across the whole game')
console.log('')
console.log('   count  specialty      attacking  defending')
for (const [k, v] of Object.entries(mix).sort((a2, b2) => b2[1] - a2[1])) {
  const at = specAtt[k] != null ? specAtt[k].toFixed(1) + '%' : '   -'
  const df = specDef[k] != null ? specDef[k].toFixed(1) + '%' : '   -'
  console.log(`   ${String(v).padStart(5)}  ${k.padEnd(14)}${at.padStart(8)}${df.padStart(11)}`)
}

/**
 * Averaging a specialty across every opponent washes out the only thing that
 * makes it matter. Owning survivors instead of enforcers is worth about a
 * point; sending the right one at the right target is worth ten. Reporting the
 * averages without saying that would leave a reader optimising the wrong
 * decision.
 */
const attSpread = Math.max(...Object.values(specAtt)) - Math.min(...Object.values(specAtt))
const defSpread = Math.max(...Object.values(specDef)) - Math.min(...Object.values(specDef))
let bestCell = null, worstCell = null
for (const a2 of odds.specialties) {
  for (const d of odds.specialties) {
    const cell = odds.matrix[a2]?.[d]
    if (!cell || cell.att_win_pct == null || cell.n < 100) continue
    if (!bestCell || cell.att_win_pct > bestCell.p) bestCell = { p: cell.att_win_pct, a: a2, d, n: cell.n }
    if (!worstCell || cell.att_win_pct < worstCell.p) worstCell = { p: cell.att_win_pct, a: a2, d, n: cell.n }
  }
}
console.log('')
console.log(`  Those columns are nearly flat: ${attSpread.toFixed(1)} points across attacking,`)
console.log(`  ${defSpread.toFixed(1)} across defending. Which specialties you own barely matters.`)
if (bestCell && worstCell) {
  console.log('')
  console.log('  The matchup is where it lives:')
  console.log(`    ${bestCell.a} into ${bestCell.d}`.padEnd(34) + `${bestCell.p}%   best`)
  console.log(`    ${worstCell.a} into ${worstCell.d}`.padEnd(34) + `${worstCell.p}%   worst`)
  const swing = (bestCell.p - worstCell.p).toFixed(1)
  // "A 11.6" reads wrong; 8, 11 and 18 all take "an".
  const article = /^(8|11|18)/.test(swing) ? 'An' : 'A'
  console.log(`  ${article} ${swing} point swing, against ${attSpread.toFixed(1)} for owning the right one.`)
  console.log('  Pick your target, not your roster.')
}

/* ---- the conflict, if there is one */
if (ranked.length && asDefender.length && ranked[0].x.name === asDefender[0].x.name) {
  head('one capo, two jobs')
  console.log(`  ${ranked[0].x.name} is both your best attacker (${ranked[0].r.p.toFixed(1)}%) and`)
  console.log(`  your hardest capo to take (${asDefender[0].r.p.toFixed(1)}% against them).`)
  console.log('')
  console.log('  That is a choice, not an oversight. A capo on garrison is not')
  console.log('  attacking, and the archive cannot tell you which is worth more,')
  console.log('  because it does not record what a held district pays.')
}

/* ---- what this cannot tell you */
head('what this cannot tell you')
console.log('  Deliberately absent, because the data is not there:')
console.log('')
console.log('   - Your capos\' stats. /capos does not publish muscle, hustle,')
console.log('     brains, rep or grit. They exist only for capos that have been')
console.log('     listed for sale, 2,709 of ' + n(capos.total) + '.')
console.log('   - Your gear. Item supply is public; who holds what is not.')
console.log('   - Anything about hustling. No feed reports its outcome, so no')
console.log('     claim about hustle returns would be measured.')
console.log('   - Whether to prestige. 1,894 capos have been sacrificed to it,')
console.log('     and nothing reports what the sacrifice bought.')
console.log('')
console.log('  The odds above land within ' + model.validation.worst_gap_pp + ' points of what actually')
console.log('  happened, tested on ' + n(model.validation.tested_on) + ' fights the model never saw.')
console.log('')

db.close()
