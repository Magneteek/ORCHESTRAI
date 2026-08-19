#!/usr/bin/env node
/**
 * Archive health check.
 *
 * The failure mode that actually matters here is silent: a scheduled job stops
 * running, or an append-only feed outruns our polling window, and nobody
 * notices until someone asks for a week of history that was never captured.
 * This makes both loud.
 *
 * Exits non-zero when anything needs attention, so launchd/monitoring can act.
 *
 * Usage: node ingest/verify.js [--hours 48]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ENDPOINTS } from './endpoints.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RUNS_LOG = path.join(ROOT, 'data', 'runs.jsonl')

// How stale a tier is allowed to get before we call it a problem. Generous
// multiples of the schedule so one skipped run is not an alert.
const STALENESS_LIMIT_MS = {
  live: 20 * 60 * 1000, // 1m schedule, alert at 20m
  fast: 60 * 60 * 1000, // 5m schedule, alert at 1h
  hourly: 4 * 60 * 60 * 1000, // 1h schedule, alert at 4h
  daily: 36 * 60 * 60 * 1000, // 24h schedule, alert at 36h
}

function parseArgs(argv) {
  const args = { hours: 48 }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--hours') args.hours = Number(argv[++i])
  }
  return args
}

function readRuns() {
  if (!fs.existsSync(RUNS_LOG)) return []
  return fs
    .readFileSync(RUNS_LOG, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function fmtAge(ms) {
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function main() {
  const args = parseArgs(process.argv)
  const runs = readRuns()
  const now = Date.now()
  const windowStart = now - args.hours * 3600 * 1000

  if (runs.length === 0) {
    console.error('no runs recorded yet: the ingest has never run')
    process.exit(1)
  }

  const problems = []
  const recent = runs.filter((r) => new Date(r.started_at).getTime() >= windowStart)

  console.log(`Syndicate archive health  (window: last ${args.hours}h)`)
  console.log('='.repeat(72))

  // ------------------------------------------------ per-endpoint freshness ---
  const rows = []
  for (const ep of ENDPOINTS) {
    const mine = runs.filter((r) => r.endpoint === ep.name)
    const lastOk = [...mine].reverse().find((r) => r.ok)
    const lastAny = mine[mine.length - 1]

    if (!lastOk) {
      problems.push(`${ep.name}: has never completed successfully`)
      rows.push([ep.name, ep.tier, 'NEVER', '-', 'FAIL'])
      continue
    }

    const age = now - new Date(lastOk.started_at).getTime()
    const limit = STALENESS_LIMIT_MS[ep.tier]
    const stale = age > limit
    if (stale) {
      problems.push(
        `${ep.name}: last success ${fmtAge(age)} ago, over the ${fmtAge(limit)} limit for tier "${ep.tier}"`,
      )
    }
    const failingNow = lastAny && !lastAny.ok
    if (failingNow) {
      problems.push(`${ep.name}: most recent run failed (${lastAny.error})`)
    }

    rows.push([
      ep.name,
      ep.tier,
      fmtAge(age),
      String(mine.filter((r) => r.ok).length),
      stale ? 'STALE' : failingNow ? 'ERRORING' : 'ok',
    ])
  }

  const w = [22, 8, 8, 8, 10]
  const header = ['endpoint', 'tier', 'last ok', 'runs', 'status']
  console.log(header.map((h, i) => h.padEnd(w[i])).join(''))
  console.log('-'.repeat(72))
  for (const r of rows) console.log(r.map((c, i) => c.padEnd(w[i])).join(''))

  // ------------------------------------------------------- gaps + failures ---
  const gaps = recent.filter((r) => r.possible_gap)
  if (gaps.length) {
    console.log('\nPOSSIBLE DATA GAPS')
    for (const g of gaps) {
      console.log(
        `  ${g.endpoint} at ${g.started_at}: paged ${g.pages} pages ` +
          `(${g.rows} rows) without reaching known data`,
      )
      problems.push(
        `${g.endpoint}: possible gap at ${g.started_at}; raise maxPagesIncremental or poll more often`,
      )
    }
  }

  const failures = recent.filter((r) => !r.ok)
  if (failures.length) {
    console.log(`\nFAILURES IN WINDOW (${failures.length})`)
    const byEndpoint = {}
    for (const f of failures) {
      byEndpoint[f.endpoint] = byEndpoint[f.endpoint] || []
      byEndpoint[f.endpoint].push(f)
    }
    for (const [name, list] of Object.entries(byEndpoint)) {
      console.log(`  ${name}: ${list.length}x, latest: ${list[list.length - 1].error}`)
    }
  }

  // -------------------------------------------------------------- verdict ---
  console.log('')
  if (problems.length === 0) {
    console.log(`healthy: ${rows.length} endpoints, ${recent.length} runs in window`)
    process.exit(0)
  }
  console.log(`${problems.length} problem(s) need attention:`)
  for (const p of problems) console.log(`  - ${p}`)
  process.exit(1)
}

main()
