#!/usr/bin/env node
/**
 * The trainer market: capos are trained by other players for a fee.
 *
 * Two columns the API returns are deliberately NOT published, because they carry
 * no information:
 *   - `trainer_on_time_rate` is 100 for every trainer without exception.
 *   - `allowed_stats` is either null or all five stats in a shuffled order, so
 *     no trainer anywhere restricts what they will train. There is no
 *     specialisation in this market and a "specialisms" section would invent one.
 *
 * Everything here is a MEDIAN, not a mean. Two listings (0.5 and 0.1 SOL against
 * a 0.0057 median) drag every average far enough to reverse the conclusion: on
 * means, prestige level 5 looks like it charges 5x and level 6 looks unreliable;
 * on medians, price is flat across prestige and the typical trainer at every
 * level completes 100% of jobs. The outliers are reported separately rather than
 * quietly winsorised.
 *
 * Usage: node derive/trainers.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'data', 'site', 'trainers.json')
const LAMPORTS = 1e9

const db = new DatabaseSync(path.join(ROOT, 'data', 'syndicate.db'), { readOnly: true })
const day = db.prepare('SELECT MAX(day) d FROM trainers_daily').get().d
const rows = db.prepare('SELECT * FROM trainers_daily WHERE day = ?').all(day)

const num = (a) => a.filter((x) => x != null && !Number.isNaN(x)).sort((x, y) => x - y)
const median = (a) => { const s = num(a); return s.length ? s[Math.floor(s.length / 2)] : null }
const pct = (a, p) => { const s = num(a); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : null }
const sum = (a) => a.reduce((s, x) => s + (x || 0), 0)
const sol = (l) => (l == null ? null : +(l / LAMPORTS).toFixed(6))
const round = (n, d = 1) => (n == null ? null : +n.toFixed(d))

const rates = rows.map((r) => r.rate_lamports)
const jobsTotal = sum(rows.map((r) => r.trainer_jobs_settled))
const byJobs = rows.slice().sort((a, b) => (b.trainer_jobs_settled || 0) - (a.trainer_jobs_settled || 0))
const totalSlots = sum(rows.map((r) => r.max_concurrent_fills))
const activeFills = sum(rows.map((r) => r.active_fills))

// Trainer rows for the table. Tenure comes from the listing's own created_at,
// so it survives our short archive: it is the game's timestamp, not ours.
const trainers = rows.map((r) => ({
  name: r.trainer_display_name || 'unnamed',
  prestige: r.trainer_prestige_level,
  pass: r.trainer_season_pass_tier,
  rate_sol: sol(r.rate_lamports),
  jobs_settled: r.trainer_jobs_settled ?? 0,
  jobs_completed: r.trainer_jobs_completed ?? 0,
  completion: r.trainer_completion_rate,
  turnaround_h: round(r.trainer_avg_turnaround_hours),
  min_actions: r.min_actions,
  max_actions: r.max_actions,
  capacity: r.max_concurrent_fills,
  active: r.active_fills ?? 0,
  free: r.available_slots,
  available: !!r.is_available,
  listed_at: r.listed_at ? r.listed_at.slice(0, 10) : null,
  days_listed: r.listed_at
    ? Math.max(0, Math.round((Date.parse(day + 'T00:00:00Z') - Date.parse(r.listed_at)) / 864e5))
    : null,
})).sort((a, b) => b.jobs_settled - a.jobs_settled || a.rate_sol - b.rate_sol)

const groupBy = (key, label) => {
  const keys = [...new Set(rows.map((r) => r[key]))].filter((k) => k != null)
  keys.sort((a, b) => (typeof a === 'number' ? a - b : String(a).localeCompare(String(b))))
  return keys.map((k) => {
    const g = rows.filter((r) => r[key] === k)
    return {
      [label]: k,
      trainers: g.length,
      median_rate_sol: sol(median(g.map((r) => r.rate_lamports))),
      median_completion: median(g.map((r) => r.trainer_completion_rate)),
      median_turnaround_h: round(median(g.map((r) => r.trainer_avg_turnaround_hours))),
      jobs_settled: sum(g.map((r) => r.trainer_jobs_settled)),
    }
  })
}

// Does paying more buy anything? Quartiles by rate, compared on the two things a
// buyer actually cares about. Only trainers with a track record are compared;
// a trainer with no settled jobs has no quality to measure.
const priced = rows.filter((r) => r.trainer_jobs_settled > 0 && r.rate_lamports != null)
const sortedPriced = priced.slice().sort((a, b) => a.rate_lamports - b.rate_lamports)
const quartiles = [0, 1, 2, 3].map((i) => {
  const lo = Math.floor((sortedPriced.length * i) / 4)
  const hi = Math.floor((sortedPriced.length * (i + 1)) / 4)
  const g = sortedPriced.slice(lo, hi)
  if (!g.length) return null
  return {
    quartile: 'Q' + (i + 1),
    range_sol: [sol(g[0].rate_lamports), sol(g[g.length - 1].rate_lamports)],
    trainers: g.length,
    median_completion: median(g.map((r) => r.trainer_completion_rate)),
    median_turnaround_h: round(median(g.map((r) => r.trainer_avg_turnaround_hours))),
    jobs_settled: sum(g.map((r) => r.trainer_jobs_settled)),
  }
}).filter(Boolean)

// Demand side. Thin by nature: jobs are filled fast and few sit open at once, so
// this counts what we have ever seen open rather than pretending to a rate.
const jobs = db.prepare('SELECT * FROM open_jobs').all()
const lastSeen = db.prepare('SELECT MAX(last_seen_at) m FROM open_jobs').get().m
const openNow = jobs.filter((j) => j.last_seen_at === lastSeen)

const payload = {
  generated_at: new Date().toISOString(),
  as_of: day,
  market: {
    trainers: rows.length,
    available: rows.filter((r) => r.is_available).length,
    jobs_settled: jobsTotal,
    median_rate_sol: sol(median(rates)),
    median_turnaround_h: round(median(rows.map((r) => r.trainer_avg_turnaround_hours))),
    total_slots: totalSlots,
    active_fills: activeFills,
    free_slots: totalSlots - activeFills,
    utilisation_pct: totalSlots ? round((activeFills / totalSlots) * 100, 1) : null,
    zero_job_trainers: rows.filter((r) => !r.trainer_jobs_settled).length,
    top10_share_pct: jobsTotal
      ? round((sum(byJobs.slice(0, 10).map((r) => r.trainer_jobs_settled)) / jobsTotal) * 100, 1)
      : null,
  },
  rates: {
    min_sol: sol(Math.min(...rates)),
    p25_sol: sol(pct(rates, 0.25)),
    median_sol: sol(median(rates)),
    p75_sol: sol(pct(rates, 0.75)),
    max_sol: sol(Math.max(...rates)),
    distinct: new Set(rates).size,
    outliers: rows
      .filter((r) => r.rate_lamports > median(rates) * 5)
      .sort((a, b) => b.rate_lamports - a.rate_lamports)
      .map((r) => ({
        name: r.trainer_display_name || 'unnamed',
        rate_sol: sol(r.rate_lamports),
        jobs_settled: r.trainer_jobs_settled ?? 0,
      })),
  },
  by_prestige: groupBy('trainer_prestige_level', 'level'),
  by_pass: groupBy('trainer_season_pass_tier', 'tier'),
  quality_by_price: quartiles,
  trainers,
  demand: {
    open_now: openNow.length,
    seen_total: jobs.length,
    median_consideration_sol: sol(median(jobs.map((j) => j.consideration_lamports))),
    median_house_fee_sol: sol(median(jobs.map((j) => j.house_fee_lamports))),
    median_actions: median(jobs.map((j) => j.total_actions)),
    open: openNow.map((j) => ({
      capo: j.capo_name,
      rarity: j.capo_rarity,
      owner: j.owner_display_name,
      actions: j.total_actions,
      pay_sol: sol(j.consideration_lamports),
      fee_sol: sol(j.house_fee_lamports),
      deadline: j.deadline ? j.deadline.slice(0, 16).replace('T', ' ') : null,
    })),
  },
  notes: {
    on_time_rate: 'not shown: the API reports 100% for every trainer without exception, so it separates nobody',
    allowed_stats: 'not shown: every trainer accepts all five stats, so no trainer specialises',
    medians: 'every figure is a median. Two listings priced far above the market would otherwise reverse the conclusions',
  },
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(payload))

console.log('trainers:', rows.length, 'listed,', payload.market.available, 'available,',
  jobsTotal, 'jobs settled')
console.log('  median rate', payload.market.median_rate_sol, 'SOL, median turnaround',
  payload.market.median_turnaround_h + 'h')
console.log('  capacity', totalSlots, 'slots,', activeFills, 'active =',
  payload.market.utilisation_pct + '% utilisation')
console.log('  top 10 trainers take', payload.market.top10_share_pct + '% of all jobs;',
  payload.market.zero_job_trainers, 'have never been hired')
console.log('  rate outliers:', payload.rates.outliers.map((o) => o.name + ' ' + o.rate_sol).join(', ') || 'none')
console.log('  demand:', payload.demand.open_now, 'open now,', jobs.length, 'seen in total')
console.log('written', path.relative(ROOT, OUT))
db.close()
