import fs from 'node:fs'

const runs = fs.readFileSync('data/runs.jsonl', 'utf8')
  .split('\n').filter(Boolean).map(JSON.parse)
  .filter(r => r.endpoint === 'leaderboards' && r.ok)
  .map(r => new Date(r.started_at))
  .sort((a, b) => a - b)

// Only look at the window since the launchd agents were installed.
const INSTALLED = new Date('2026-08-16T14:30:00Z')
const sched = runs.filter(d => d >= INSTALLED)

console.log('leaderboards successful runs since launchd install:', sched.length)
if (sched.length < 2) { console.log('not enough data yet'); process.exit(0) }

console.log('first:', sched[0].toISOString())
console.log('last: ', sched[sched.length - 1].toISOString())

const spanMin = (sched[sched.length - 1] - sched[0]) / 60000
console.log('span:', spanMin.toFixed(1), 'min')
console.log('expected runs at 5-min cadence:', Math.floor(spanMin / 5) + 1)
console.log('actual runs:', sched.length)

console.log('\ngaps longer than 8 min (a missed 5-min slot):')
let gaps = 0
for (let i = 1; i < sched.length; i++) {
  const mins = (sched[i] - sched[i - 1]) / 60000
  if (mins > 8) {
    gaps++
    console.log(`  ${sched[i - 1].toISOString()} -> ${sched[i].toISOString()}  (${mins.toFixed(1)} min)`)
  }
}
if (!gaps) console.log('  none')
