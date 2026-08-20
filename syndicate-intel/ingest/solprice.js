#!/usr/bin/env node
/**
 * SOL spot price in USD, appended to a JSONL ledger.
 *
 * The only data on this site that does not come from the game. The game's own
 * feed carries usd_price_locked and treasury_fee_usd on every sale and leaves
 * both null: 0 of 6,000 sales checked had either, so there is no rate to read
 * out of the archive and a price has to come from outside.
 *
 * Two keyless sources, tried in order, because a single free endpoint that
 * rate-limits or goes down would silently stop the whole thing. They agreed to
 * the cent when this was written. A run that reaches neither writes nothing and
 * exits clean: the site treats a missing price as "show SOL only", which is a
 * worse page rather than a broken one.
 *
 * Append-only, one line per run, so the history is there if a later feature
 * needs the rate as of a past date rather than today's.
 *
 * Usage: node ingest/solprice.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'data', 'prices', 'sol-usd.jsonl')

const SOURCES = [
  {
    name: 'coinbase',
    url: 'https://api.coinbase.com/v2/prices/SOL-USD/spot',
    read: (j) => Number(j?.data?.amount),
  },
  {
    name: 'kraken',
    url: 'https://api.kraken.com/0/public/Ticker?pair=SOLUSD',
    read: (j) => {
      const first = Object.values(j?.result || {})[0]
      return Number(first?.c?.[0])
    },
  },
]

async function fetchPrice() {
  for (const s of SOURCES) {
    try {
      const ctl = AbortSignal.timeout(10_000)
      const res = await fetch(s.url, { signal: ctl, headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const usd = s.read(await res.json())
      // A price of zero, NaN or something absurd is a bad response dressed as a
      // good one. The band is wide on purpose; it is here to catch garbage, not
      // to have an opinion about what SOL is worth.
      if (!Number.isFinite(usd) || usd <= 0 || usd > 100_000) throw new Error('implausible: ' + usd)
      return { usd: +usd.toFixed(4), source: s.name }
    } catch (err) {
      console.error(`  ${s.name}: ${err.message}`)
    }
  }
  return null
}

/**
 * Skip if the last reading is still fresh.
 *
 * refresh.sh runs every ten minutes and calls this each time. A spot price does
 * not need six readings an hour, and hammering a free endpoint 144 times a day
 * for data that moves in cents is how free endpoints stop being free.
 */
const MAX_AGE_MS = 30 * 60 * 1000
function lastReading() {
  try {
    const lines = fs.readFileSync(OUT, 'utf8').trim().split('\n')
    return JSON.parse(lines[lines.length - 1])
  } catch { return null }
}

/**
 * The site reads price.json, not the ledger.
 *
 * It is rewritten on every run, including the runs that skip the fetch, so the
 * published file is never older than the newest reading. The ledger stays
 * append-only underneath for anything that later needs the rate as of a past
 * date rather than today's.
 */
function publish(reading) {
  const site = path.join(ROOT, 'data', 'site', 'price.json')
  fs.mkdirSync(path.dirname(site), { recursive: true })
  fs.writeFileSync(site, JSON.stringify({
    generated_at: new Date().toISOString(),
    sol_usd: reading ? { usd: reading.usd, source: reading.source, at: reading.at } : null,
  }))
}

const last = lastReading()
if (last && Date.now() - new Date(last.at).getTime() < MAX_AGE_MS) {
  publish(last)
  console.log(`sol-usd: $${last.usd} still fresh, not refetched`)
  process.exit(0)
}

const got = await fetchPrice()
if (!got) {
  // Republish whatever we already had rather than blanking the file. The site
  // decides for itself whether a reading is too old to quote.
  publish(last)
  console.error('no price source answered; kept the previous reading')
  process.exit(0)
}

const reading = { at: new Date().toISOString(), usd: got.usd, source: got.source }
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.appendFileSync(OUT, JSON.stringify(reading) + '\n')
publish(reading)
console.log(`sol-usd: $${got.usd} from ${got.source}`)
