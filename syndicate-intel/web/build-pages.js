#!/usr/bin/env node
/**
 * Generate the section pages: overview, money, wars, growth.
 *
 * Unlike the boards and players pages, these fetch their data at runtime from
 * /data/<section>.json and re-poll on an interval. That is what lets the site
 * refresh in about a minute without redeploying HTML: only the small JSON
 * moves. The API itself serves cache-control max-age=60, so ~60s is the
 * genuine floor and polling faster would just re-read their cache.
 *
 * Usage: node web/build-pages.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSS, NAV_CSS, FONTS, navHtml, SITE, metaHead, STAMP_JS } from './style.js'
import { CHART_CSS, CHART_JS } from './charts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_SRC = path.join(ROOT, 'data', 'site')
const SITE_DIR = path.join(__dirname, 'dist', 'site')
const DATA_OUT = path.join(SITE_DIR, 'data')

const POLL_MS = 60000

// NAV and navHtml now live in style.js so every builder shares one.

const CALC_CSS = String.raw`
/* The calculator is a form, and the site had no form styling because nothing
   before this took input beyond a search box and button rows. */
/* Attacker on the left, defender on the right, so the two sides read as
   opponents rather than as one long list of ten identical dropdowns. Collapses
   to a single column below 46rem, where side-by-side would squeeze both. */
.calc-sides { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4) var(--space-5);
  margin-bottom: var(--space-4); }
.calc-side-head { font-family: var(--mono); font-size: var(--step--1);
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent);
  border-bottom: 1px solid var(--rule-firm); padding-bottom: 0.4rem;
  margin-bottom: var(--space-3); }
.calc { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: var(--space-3) var(--space-4); }
/* Four fields a side reads better as a square than as three-then-one. */
.calc-sides .calc { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 26rem) { .calc-sides .calc { grid-template-columns: 1fr; } }
.calc-ground { margin-bottom: var(--space-5); }
@media (max-width: 46rem) { .calc-sides { grid-template-columns: 1fr; } }
.calc-field label { display: block; font-family: var(--mono); font-size: var(--step--2);
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint);
  margin-bottom: 0.35rem; }
.calc-field select { width: 100%; background: var(--surface); color: var(--ink);
  font-family: var(--mono); font-size: var(--step--1); padding: 0.5rem 0.55rem;
  border: 1px solid var(--rule-firm); border-radius: 0; }
.calc-field select:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.verdict { border-top: 2px solid var(--rule-firm); padding-top: var(--space-4); }
.verdict-num { font-family: var(--mono); font-size: var(--step-4); line-height: 1;
  color: var(--accent-bright); display: block; }
.verdict-word { font-family: var(--mono); font-size: var(--step-0);
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted);
  display: block; margin-top: 0.5rem; }
.verdict-basis { font-size: var(--step--1); color: var(--ink-faint);
  margin-top: var(--space-3); max-width: 60ch; }
/* Diagonal of the wheel is the mirror matchup, the reader's reference point. */
.ledger .mirror { color: var(--accent); }
`

const SHELL_CSS = String.raw`
/* The active-item rule now lives in NAV_CSS so every builder shares it. */
.stale { color: var(--debit); }
`

/** Shared client runtime: fetch, poll, render on change. */
const RUNTIME = String.raw`
let DATA = null
let lastStamp = null

function setStamp(ok) {
  paintStamp(DATA && DATA.generated_at, ok)
}

async function load(first) {
  try {
    const res = await fetch(SECTION_URL + '?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const next = await res.json()
    // Only re-render when the payload actually moved, so hover state and open
    // data tables survive a poll that changed nothing.
    if (next.generated_at !== lastStamp) {
      DATA = next
      lastStamp = next.generated_at
      render()
      ledesToTop()
    }
    setStamp(true)
  } catch (err) {
    if (first) {
      document.getElementById('main').innerHTML =
        '<p class="basis">Could not load data: ' + String(err.message) + '</p>'
    }
    setStamp(false)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  load(true)
  setInterval(() => load(false), ${POLL_MS})
  // The poll refreshes the data; this keeps the age honest between polls.
  tickStamp(() => DATA && DATA.generated_at)
})
`

function page({ file, title, description, heading, eyebrow, section, body, script }) {
  const indexable = process.env.SITE_INDEXABLE === '1'
  const robots = indexable ? '' : '\n<meta name="robots" content="noindex, nofollow">'
  const href = file === 'index.html' ? '/' : '/' + file
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">${robots}
${metaHead({ title, description, path: href })}
${FONTS}
<style>${CSS}${NAV_CSS}${CHART_CSS}${SHELL_CSS}${CALC_CSS}</style>
</head>
<body>
<div class="wrap">
  <header class="masthead">
    <span class="eyebrow">${eyebrow}</span>
    <h1>${heading}</h1>
    <span class="live">Updated <span id="generated">&hellip;</span></span>
    ${navHtml(href)}
  </header>
  <div id="main">${body}</div>
  <footer>
  </footer>
</div>
<script>
const SECTION_URL = '/data/${section}.json';
${STAMP_JS}
${CHART_JS}
${LEDGER_JS}
${script}
${RUNTIME}
</script>
</body>
</html>
`
}

/* ---------------------------------------------------------------- pages --- */

const LEDGER_JS = String.raw`
// Shared minimal ledger for the tabular sections added alongside the charts.
/**
 * Lift each block's trailing explainer to the top of that block.
 *
 * Written last in the source, where it reads naturally next to the table it
 * describes, but it belongs first on the page: a lede telling you what you are
 * about to read, not a footnote you reach after you have already puzzled it out.
 * The node itself is moved, so the keyboard and screen-reader order match what
 * is on screen. CSS order would have flipped one and not the other.
 */
function ledesToTop() {
  document.querySelectorAll('#main > div').forEach((el) => {
    // Data blocks only. A block with controls in it is interface, and its
    // trailing paragraph is status text ("showing 8 of 36"), which belongs under
    // the thing it reports on: lifting that above the label read as nonsense.
    if (el.querySelector('input, button, select, textarea')) return
    const last = el.lastElementChild
    if (!last || last.tagName !== 'P') return
    if (el.firstElementChild === last) return
    last.classList.add('lede')
    el.insertBefore(last, el.firstElementChild)
  })
}

/**
 * Proportions with the underlying count beside them.
 *
 * Not a pie: these distributions run from 60% to 0.1%, and at that spread the
 * smallest categories are a fraction of a degree of arc, which is to say
 * invisible. A bar per category stays readable however thin the tail gets, and
 * carrying the count as well answers "0.1% of what".
 */
function shareBars(items, color, opts) {
  const counted = !(opts && opts.counted === false)
  const total = items.reduce((a, i) => a + i.value, 0) || 1
  return '<div class="shares"' + (counted ? ' data-counted' : '') + '>' +
    items.map((i) => {
      const pct = (i.value / total) * 100
      return '<div class="share">' +
        '<span class="share-label">' + esc(i.label) + '</span>' +
        '<span class="share-track"><span class="share-fill" style="width:' +
          Math.max(0.6, pct).toFixed(1) + '%;background:' + color + '"></span></span>' +
        // The exact figure, not nfmt's abbreviation: "58k" is not the actual
        // number, and the point of showing a count beside a share is precision.
        (counted ? '<span class="share-count">' +
          Number(i.value).toLocaleString('en-US') + '</span>' : '') +
        '<span class="share-pct">' + (pct < 1 ? pct.toFixed(2) : pct.toFixed(1)) + '%</span>' +
        '</div>'
    }).join('') + '</div>'
}

function ledgerRows(rows, cols, opts) {
  if (!rows || !rows.length) return '<p class="basis">No rows yet.</p>'
  const ranked = !(opts && opts.rank === false)
  const head = '<div class="row head">' + (ranked ? '<span></span>' : '') +
    cols.map((c) => '<span class="' + (c.num ? 'num' : '') + '">' + esc(c.label) + '</span>').join('') + '</div>'
  const body = rows.map((r, i) => {
    const first = cols[0], rest = cols.slice(1)
    return '<div class="row">' + (ranked ? '<span class="rank">' + (i + 1) + '</span>' : '') +
      '<span class="name">' + esc(first.get(r)) +
      (first.sub ? '<br><span class="sub">' + esc(first.sub(r)) + '</span>' : '') + '</span>' +
      '<span class="extra">' + rest.map((c) =>
        '<span class="' + (c.num ? 'num' : '') + '">' +
        '<span class="cell-label">' + esc(c.label) + '</span>' + esc(c.get(r)) + '</span>').join('') +
      '</span></div>'
  }).join('')
  return '<div class="ledger" data-cols="' + (cols.length + (ranked ? 1 : 0)) + '"' +
    (ranked ? '' : ' data-rank="none"') + '>' + head + body + '</div>'
}
`

const OVERVIEW_JS = String.raw`
function render() {
  const h = DATA.headline
  document.getElementById('tiles').innerHTML = [
    ['Active in 24h', nfmt(h.active_24h), nfmt(h.active_7d) + ' in 7 days'],
    ['Seated in a city', nfmt(h.seated), 'current season'],
    ['RACKET in circulation', nfmt(h.racket_supply), h.wallets ? nfmt(h.wallets) + ' wallets' : ''],
    ['Capos in existence', nfmt(h.capos), nfmt(h.owners) + ' owners'],
    ['Net RACKET yesterday', (h.net_yesterday >= 0 ? '+' : '') + nfmt(h.net_yesterday),
      // Naming the day removes the ambiguity that hid the bug: this is the last
      // day that actually closed, never today's running total.
      h.net_yesterday_day ? 'minted less burned, ' + h.net_yesterday_day : 'minted less burned',
      h.net_yesterday >= 0 ? 'pos' : 'neg'],
    ['Secondary volume, 7d', h.sol_volume_7d.toFixed(1) + ' SOL', nfmt(h.sales_7d) + ' sales'],
  ].map(([l, v, n, cls]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value ' + (cls || '') + '">' + v + '</span>' +
    '</div>').join('')


  // Every number below lives on a page of its own. Repeating those charts here
  // just meant maintaining them twice and telling the reader the same thing in
  // two places, so this points at them instead.
  const f = DATA.facts || {}
  // Rarities are proper nouns in this world: a God, a Legendary. The API sends
  // them lowercase, so they are capitalised at the point of writing a sentence.
  const cap = (x) => (x ? String(x).charAt(0).toUpperCase() + String(x).slice(1) : x)
  const t = (label, value, note) =>
    '<div class="tile"><span class="tile-label">' + label + '</span>' +
    '<span class="tile-value">' + value + '</span>' +
    '</div>'

  document.getElementById('today').innerHTML =
    t('New players', nfmt(f.new_players_24h), 'first ever fight') +
    t('New capos', nfmt(f.new_capos_24h), 'minted into the world') +
    t('Promotions', nfmt(f.promotions_24h), 'capos moved up a rank') +
    t('Sales', nfmt(f.sales_24h), f.sol_24h + ' SOL traded') +
    t('Top sale', f.top_sale_24h ? f.top_sale_24h.sol + ' SOL' : '-',
      f.top_sale_24h ? cap(f.top_sale_24h.rarity) : 'nothing sold')

  // A table, not bars: the shares run from 59% to 0.115%, so a bar chart gives
  // one full-width column and a row of invisible slivers. The odds column is the
  // part people actually repeat to each other.
  document.getElementById('scarcity').innerHTML =
    ledgerRows(f.rarity_share || [], [
      { label: 'Rarity', get: (r) => cap(r.rarity) },
      { label: 'Capos', num: true, get: (r) => nfmt(r.capos) },
      { label: 'Share', num: true, get: (r) => r.share_pct + '%' },
      { label: 'Odds', num: true, get: (r) => '1 in ' + nfmt(r.one_in) },
    ], { rank: false }) +
    '<p class="basis">Just ' + nfmt(f.gods) + ' Gods exist, one in every ' +
    nfmt(f.gods_per) + ' capos. The last seven days turned up ' + nfmt(f.gods_7d) +
    ' more, and ' + nfmt(f.legendaries_7d) + ' new Legendaries.' +
    (f.top_sale_ever ? ' The most anyone has paid is ' + f.top_sale_ever.sol +
      ' SOL, for a ' + cap(f.top_sale_ever.rarity) + '.' : '') + '</p>'

  // The ladder narrows hard at the top, which is the whole story, so the ranks
  // are listed from boss down rather than sorted by count.
  document.getElementById('climbed').innerHTML =
    ledgerRows(f.promotions_by_rank || [], [
      { label: 'Promoted to', get: (r) => cap(r.rank) },
      { label: 'Capos', num: true, get: (r) => nfmt(r.promoted) },
    ], { rank: false }) +
    '<p class="basis">' + nfmt(f.promotions_24h) + ' promotions in the last day, paid for in ' +
    'RACKET. Recruit is excluded: it is the rank a capo is born at, not one it climbs to.</p>'

  document.getElementById('guide').className = 'guide'
  document.getElementById('guide').innerHTML = [
    ['Players', '/players.html', 'One page per player: roster, combat, trading and prizes, plus who arrives and who stays.'],
    ['Economy', '/money.html', 'Supply, what mints and burns it, secondary volume and how the market clears.'],
    ['Wars', '/wars.html', 'Takeover odds, the specialty wheel, win rates, cities and leagues.'],
    ['Capos', '/capos.html', 'Rarity, rank, age, promotion, supply, ownership, and which gear raises which stat.'],
    ['Trainers', '/trainers.html', 'The training market: who charges what, who delivers, and how much sits idle.'],
    ['Prizes', '/prizes.html', 'Every season prize paid on chain, and who won it.'],
  ].map(([name, href, what]) =>
    '<div class="guide-item">' +
    '<span class="name"><a href="' + href + '">' + name + '</a></span>' +
    '<span class="what">' + what + '</span></div>').join('')
}

/**
 * Player lookup. The index is fetched on first focus rather than on page load:
 * it is 165KB of names that most visitors never need, and the overview should
 * not pay for it up front.
 */
let PINDEX = null, pindexState = 'idle'

async function loadIndex() {
  if (pindexState !== 'idle') return
  pindexState = 'loading'
  pnote('Loading player list...')
  try {
    const res = await fetch('/data/players-index.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    PINDEX = (await res.json()).players
    pindexState = 'ready'
    pnote('')
    psearch(document.getElementById('psearch').value)
  } catch (err) {
    pindexState = 'idle'
    pnote('Could not load the player list. Try the Players page.')
  }
}

function pnote(msg) {
  const el = document.getElementById('psearch-note')
  if (el) el.textContent = msg
}

function psearch(q) {
  const box = document.getElementById('presults')
  q = (q || '').trim().toLowerCase()
  if (!q || !PINDEX) { box.innerHTML = ''; if (!q) pnote(''); return }
  // Names that START with what was typed come first: someone typing their own
  // name wants themselves, not everyone who happens to contain those letters.
  const starts = [], has = []
  for (const p of PINDEX) {
    const n = p.n.toLowerCase()
    if (n.startsWith(q)) starts.push(p)
    else if (n.includes(q)) has.push(p)
  }
  const hits = starts.concat(has).slice(0, 8)
  box.innerHTML = hits.map((p) =>
    '<a class="presult" href="/players.html#/p/' + encodeURIComponent(p.s) + '">' +
    esc(p.n) + '</a>').join('')
  const total = starts.length + has.length
  pnote(hits.length
    ? (total > hits.length ? 'Showing ' + hits.length + ' of ' + nfmt(total) + ' matches.' : '')
    : 'No player by that name.')
}

document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('psearch')
  if (!box) return
  box.addEventListener('focus', loadIndex, { once: true })
  box.addEventListener('input', (e) => { loadIndex(); psearch(e.target.value) })
  box.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return
    const first = document.querySelector('#presults .presult')
    if (first) location.href = first.getAttribute('href')
  })
})

`

const MONEY_JS = String.raw`
function render() {
  const t = DATA.totals || {}
  document.getElementById('tiles').innerHTML = [
    ['In circulation', nfmt(t.total_racket_supply), nfmt(t.wallet_count) + ' wallets'],
    ['Earned lifetime', nfmt(t.lifetime_earned_racket), ''],
    ['Spent lifetime', nfmt(t.lifetime_spent_racket), ''],
    ['Sales recorded', nfmt(DATA.market.volume.reduce((a, v) => a + v.sales, 0)),
      DATA.market.volume.reduce((a, v) => a + v.sol, 0).toFixed(1) + ' SOL'],
  ].map(([l, v, n]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span>' +
    '</div>').join('')

  // The mirrored minted/burned pair took 260px to show two quantities whose
  // difference was the actual question. This draws the difference.
  netColumns(document.getElementById('c-net'), {
    rows: DATA.emissions.map((e) => ({ label: e.day.slice(5), value: e.net })),
    height: 150,
    yFormat: nfmt,
    note: 'Green days grew the money supply, red days shrank it.',
  })

  // Absolute supply, reconstructed backwards from today's reported total by
  // unwinding each day's net. Anchored on a figure the API states outright,
  // rather than being a running sum from an arbitrary start.
  const em = DATA.emissions
  const supply = new Array(em.length)
  let running = t.total_racket_supply
  for (let i = em.length - 1; i >= 0; i--) { supply[i] = running; running -= em[i].net }
  lineChart(document.getElementById('c-supply'), {
    xs: em.map((e) => e.day.slice(5)),
    series: [{ name: 'In circulation', values: supply, color: 'var(--cat-5)' }],
    yFormat: nfmt,
    height: 170,
  })

  // Percentages, not the raw figures: these run to ten digits, and what the
  // reader wants is which drain dominates, not how many RACKET to the unit.
  // Everything past the top eight is one row, so the tail cannot be mistaken
  // for a rounding error.
  function shares(rows, color, topN) {
    const total = rows.reduce((a, r) => a + r.total, 0) || 1
    const top = rows.slice(0, topN)
    const rest = rows.slice(topN).reduce((a, r) => a + r.total, 0)
    const items = top.map((r) => ({ label: r.type.replace(/_/g, ' '), pct: (r.total / total) * 100 }))
    if (rest > 0) items.push({ label: 'everything else', pct: (rest / total) * 100 })
    return '<div class="shares">' + items.map((i) =>
      '<div class="share">' +
      '<span class="share-label">' + esc(i.label) + '</span>' +
      '<span class="share-track"><span class="share-fill" style="width:' +
        Math.max(1, i.pct).toFixed(1) + '%;background:' + color + '"></span></span>' +
      '<span class="share-pct">' + i.pct.toFixed(1) + '%</span>' +
      '</div>').join('') + '</div>'
  }
  document.getElementById('c-income').innerHTML = shares(DATA.sinks.income, 'var(--credit)', 8)
  document.getElementById('c-sinks').innerHTML = shares(DATA.sinks.spend, 'var(--debit)', 8)

  let vol = 0
  lineChart(document.getElementById('c-volume'), {
    xs: DATA.market.volume.map((v) => v.day.slice(5)),
    series: [{
      name: 'SOL traded, cumulative',
      values: DATA.market.volume.map((v) => { vol += v.sol; return +vol.toFixed(2) }),
      color: 'var(--cat-3)',
    }],
    yFormat: (n) => nfmt(n) + ' SOL',
    height: 170,
  })

  // Four numbers do not need an axis. Three decimals because the cheapest tier
  // averages 0.038 SOL, and at one decimal every rarity below legendary reads
  // as zero.
  const capr = (x) => x.charAt(0).toUpperCase() + x.slice(1)
  document.getElementById('c-price').innerHTML = '<div class="tiles">' +
    DATA.market.price_band.map((p) =>
      '<div class="tile"><span class="tile-label">' + capr(p.rarity) + '</span>' +
      '<span class="tile-value">' + p.avg_sol.toFixed(3) + ' SOL</span></div>').join('') +
    '</div>'

  // Liquidity is four numbers, not a shape. A chart of three percentiles is a
  // chart of three numbers, so this is a table.
  const q = DATA.liquidity
  document.getElementById('liquidity').innerHTML = ledgerRows([
    { k: 'Quickest quarter', sub: 'time from listing to sale', v: q.hours_to_sell.p25 + 'h' },
    { k: 'Typical', sub: 'median time on market', v: q.hours_to_sell.median + 'h' },
    { k: 'Slowest quarter', sub: 'still sold, just waited', v: q.hours_to_sell.p75 + 'h' },
    { k: 'Sold at or above ask', sub: 'share of matched sales', v: q.sold_at_or_above_ask_pct + '%' },
    { k: 'Discount when discounted', sub: 'lower quartile against ask', v: q.vs_ask_pct.p25 + '%' },
    { k: 'Listed right now', sub: 'average ask ' + q.avg_ask_sol + ' SOL', v: nfmt(q.listed_now) },
    { k: 'Sold in the last week', sub: 'clearing rate', v: nfmt(q.sold_7d) },
    { k: 'Weeks of inventory', sub: 'shelf against clearing rate', v: q.weeks_of_inventory },
  ], [
    { label: 'Measure', get: (x) => x.k, sub: (x) => x.sub },
    { label: 'Value', num: true, get: (x) => x.v },
  ])
}
`

const WARS_JS = String.raw`
/* --- takeover calculator and specialty wheel, from derive/combat-odds.js --- */

// nfmt abbreviates above 10k, and "23k fights" undersells the sample size that
// is the whole argument for trusting these numbers. Counts here run in full.
const exactN = (n) => Number(n || 0).toLocaleString('en-US')
const cap1 = (v) => (v == null ? '-' : String(v).charAt(0).toUpperCase() + String(v).slice(1).replace(/_/g, ' '))
const invlogit = (x) => 1 / (1 + Math.exp(-x))
const tologit = (p) => Math.log(p / (1 - p))

let calcBuilt = false

function calcField(label, id, values, preferred, labeller) {
  const sel = values.includes(preferred) ? preferred : values[0]
  const text = labeller || cap1
  return '<div class="calc-field"><label for="' + id + '">' + esc(label) + '</label>' +
    '<select id="' + id + '">' +
    values.map((v) => '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') +
      '>' + esc(text(v)) + '</option>').join('') +
    '</select></div>'
}


/**
 * Built once, not on every poll.
 *
 * The shared runtime re-renders whenever the payload stamp moves, which is
 * every refresh. Rebuilding the form there would silently reset the reader's
 * six selections mid-thought, so the form is written once and only the verdict
 * is recomputed afterwards.
 */
function buildCalc() {
  const el = document.getElementById('calc')
  if (!el || !DATA.odds) return
  if (calcBuilt) { recalc(); return }
  const m = DATA.odds.model
  // "Not known" is first and default: most readers cannot see an opponent's
  // total, and a guessed bracket would move the answer by more than any other
  // input here. Choosing it applies no shift at all.
  const powerOpts = ['unknown'].concat(m.power_bands.map((b) => b.key))
  const powerLabel = (k) => (k === 'unknown' ? 'Not known'
    : (m.power_bands.find((b) => b.key === k) || {}).label || k)

  const side = (who, ids, spec) =>
    '<div><p class="calc-side-head">' + who + '</p><div class="calc">' +
    calcField('Specialty', ids.s, m.options.specialties, spec) +
    calcField('Rank', ids.r, m.ranks, 'captain') +
    calcField('Total stats', ids.p, powerOpts, 'unknown', powerLabel) +
    calcField('Rarity', ids.q, m.options.rarities, 'rare') +
    '</div></div>'

  el.innerHTML =
    '<div class="calc-sides">' +
      side('Attacker', { s: 'c-as', r: 'c-arank', p: 'c-apow', q: 'c-ar' }, 'enforcer') +
      side('Defender', { s: 'c-ds', r: 'c-drank', p: 'c-dpow', q: 'c-dr' }, 'survivor') +
    '</div>' +
    '<div class="calc calc-ground">' +
      calcField('District', 'c-res', m.options.districts, 'racket_hub') +
      calcField('League', 'c-lg', m.options.leagues, 'street') +
    '</div><div class="verdict" id="c-out"></div>'
  el.querySelectorAll('select').forEach((x) => x.addEventListener('change', recalc))
  calcBuilt = true
  recalc()
}

/**
 * Combine the measured matchup cell with the measured single-factor shifts.
 *
 * A direct lookup on all five inputs would need 5x5x7x5x5 cells over 23k
 * fights, so nearly every combination a reader picks would be empty or based
 * on three fights. Instead the specialty matchup carries the base rate (the
 * thinnest of those 25 cells still holds 254 fights, the fattest 2,198) and
 * the other factors are applied as log-odds shifts measured on their own. That
 * assumes the factors act independently, which is an approximation, and the
 * basis line below says so rather than presenting the number as a certainty.
 */
function recalc() {
  const out = document.getElementById('c-out')
  if (!out || !DATA.odds) return
  const g = (id) => { const e = document.getElementById(id); return e ? e.value : null }
  const m = DATA.odds.model
  const as = g('c-as'), ds = g('c-ds')
  const cell = DATA.odds.matrix[as] && DATA.odds.matrix[as][ds]
  if (!cell || cell.att_win_pct == null) {
    out.innerHTML = '<p class="basis">No fights recorded for that matchup yet.</p>'; return
  }
  // One score from one jointly fitted model. The previous version added each
  // factor's marginal effect separately, which double counted the overlap
  // between rank, rarity, district and league and ran away at the extremes:
  // fights it called 80-plus percent won 63% of the time. Coefficients are now
  // fitted together, so a missing combination simply contributes nothing and
  // lands on the base rate.
  const keys = [
    'm:' + as + '>' + ds,
    'rp:' + g('c-arank') + '>' + g('c-drank'),
    'ara:' + g('c-ar'),
    'dra:' + g('c-dr'),
    'dis:' + g('c-res'),
    'lg:' + g('c-lg'),
  ]
  // Rank is the largest single factor, so without it there is no answer worth
  // printing. Bosses never attack captains; that combination has no evidence at
  // all, and the honest output is to say so rather than quietly return the
  // population average dressed up as a prediction.
  const rankKey = 'rp:' + g('c-arank') + '>' + g('c-drank')
  if (m.coef[rankKey] == null) {
    out.innerHTML = '<span class="verdict-word">No fights on record</span>' +
      '<p class="verdict-basis">Nothing in ' + exactN(DATA.odds.fights.n) +
      ' settled fights has a ' + esc(cap1(g('c-arank'))) + ' attacking a ' +
      esc(cap1(g('c-drank'))) + '. Rank is the biggest factor in the outcome, so ' +
      'with none of it measured there is no honest number to give you here.</p>'
    return
  }

  let x = m.intercept
  const shaky = []
  for (const k of keys) {
    if (m.coef[k] == null) continue
    x += m.coef[k]
    if ((m.support[k] || 0) < m.thin_below) shaky.push(k.split(':')[0])
  }
  const LABEL = { m: 'this specialty matchup', rp: 'these two ranks', ara: 'that attacker rarity',
    dra: 'that defender rarity', dis: 'that district', lg: 'that league' }

  // Stats sit outside the fit, on far less evidence, so they are added only if
  // the reader actually knows them.
  const apow = g('c-apow'), dpow = g('c-dpow')
  const thin = []
  for (const [label, cell] of [['attacker stats', apow === 'unknown' ? null : m.attacker_power[apow]],
                               ['defender stats', dpow === 'unknown' ? null : m.defender_power[dpow]]]) {
    if (!cell) continue
    x += cell.delta
    if (cell.thin) thin.push(label)
  }

  const p = invlogit(x) * 100
  const base = DATA.odds.fights.attacker_win_pct

  let word = 'Long shot'
  if (p >= 55) word = 'Strong attack'
  else if (p >= 45) word = 'Toss-up'
  else if (p >= 35) word = 'Uphill'

  const v = m.validation
  out.innerHTML =
    '<span class="verdict-num">' + p.toFixed(1) + '%</span>' +
    '<span class="verdict-word">' + esc(word) + ' &middot; chance the attacker takes the district</span>' +
    '<p class="verdict-basis">' +
    (p >= base ? 'Better than the ' : 'Worse than the ') + base +
    '% an average attack wins. Every factor is fitted together on ' +
    exactN(DATA.odds.fights.n) + ' settled fights rather than measured one at a time, ' +
    'because rank, rarity, district and league overlap and counting them separately ' +
    'made the confident answers wrong.' +
    (v ? ' Checked against ' + exactN(v.tested_on) + ' fights the fit never saw: predictions ' +
      'land within ' + v.worst_gap_pp + ' points of what actually happened, and beat guessing ' +
      'the average by ' + v.better_than_guessing_pct + '%.' : '') +
    ' Stats are the one input measured separately, on a few hundred fights rather than ' +
    'thousands, so leaving them on Not known costs nothing.' +
    (shaky.length ? ' Thin evidence for ' +
      esc([...new Set(shaky)].map((k) => LABEL[k] || k).join(' and ')) +
      ', so treat this one loosely.' : '') +
    (thin.length ? ' Thin data for: ' + esc(thin.join(', ')) + '.' : '') + '</p>'
}

function renderWheel() {
  const el = document.getElementById('wheel')
  if (!el || !DATA.odds) return
  const specs = DATA.odds.specialties
  const cols = [{ label: 'Attacker', get: (r) => cap1(r.a) }].concat(
    specs.map((d) => ({
      label: cap1(d).slice(0, 4), num: true,
      get: (r) => {
        const c = DATA.odds.matrix[r.a][d]
        return c && c.att_win_pct != null ? c.att_win_pct + '%' : '-'
      },
    })))
  el.innerHTML = ledgerRows(specs.map((a) => ({ a: a })), cols, { rank: false })
}

function render() {
  buildCalc()
  renderWheel()
  const a = DATA.aggregate
  const atkRate = a.attacks ? (100 * a.attacks_won / a.attacks) : 0
  const defRate = a.defenses ? (100 * a.defenses_held / a.defenses) : 0
  document.getElementById('tiles').innerHTML = [
    ['Players with a record', nfmt(DATA.population), ''],
    ['Attacks resolved', nfmt(a.attacks), atkRate.toFixed(1) + '% succeeded'],
    ['Defences resolved', nfmt(a.defenses), defRate.toFixed(1) + '% held'],
    ['Active cities', nfmt(DATA.cities.length), nfmt(DATA.leagues.reduce((s, l) => s + l.players, 0)) + ' players'],
  ].map(([l, v, n]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span>' +
    '</div>').join('')

  // Shares, not counts: "358 players" means nothing without the denominator,
  // where "25% of the field" is immediately legible.
  const wr = DATA.win_rate_distribution
  const counted = wr.players_counted || 1
  document.getElementById('c-winrate').innerHTML = '<div class="shares">' +
    wr.buckets.map((b) => {
      const pct = (b.players / counted) * 100
      return '<div class="share">' +
        '<span class="share-label">' + b.from + ' to ' + b.to + '%</span>' +
        '<span class="share-track"><span class="share-fill" style="width:' +
          Math.max(0.6, pct).toFixed(1) + '%;background:var(--cat-1)"></span></span>' +
        '<span class="share-pct">' + pct.toFixed(1) + '%</span>' +
        '</div>'
    }).join('') + '</div>'

  hBars(document.getElementById('c-leagues'), {
    rows: DATA.leagues.map((l) => ({ label: l.league, value: l.players })),
    color: 'var(--cat-2)',
  })

  // Ten rows, not twenty, so the column matches the win-rate bands beside it
  // instead of leaving half a screen of dead space. Three measures, not five:
  // at half width the extra cells wrapped onto a second line and lost their
  // labels, leaving bare numbers nobody could identify.
  const rows = DATA.top_by_wins.slice(0, 10)
  document.getElementById('t-fighters').innerHTML =
    '<div class="ledger" data-cols="4">' +
    '<div class="row head"><span></span><span>Player</span>' +
    '<span class="num">Won</span><span class="num">Win rate</span></div>' +
    rows.map((r, i) =>
      '<div class="row"><span class="rank">' + (i + 1) + '</span>' +
      '<span class="name">' + esc(r.display_name) + '</span>' +
      '<span class="extra">' +
        '<span class="num"><span class="cell-label">Won</span>' + nfmt(r.fights_won) + '</span>' +
        '<span class="num"><span class="cell-label">Win rate</span>' +
          (r.fights_total ? (100 * r.fights_won / r.fights_total).toFixed(1) + '%' : '-') + '</span>' +
      '</span></div>').join('') + '</div>'

  renderBalance()
}

// Two rates that must sum to 100 are a sentence and a small table, never a
// chart: a two-slice pie of a known complement tells the reader nothing.
function renderBalance() {
  const b = DATA.balance
  if (!b) return
  document.getElementById('balance').innerHTML =
    ledgerRows([
      { k: 'Attacker wins', v: b.attack_win_rate + '%' },
      { k: 'Defender holds', v: b.defence_hold_rate + '%' },
      { k: 'Attacks recorded', v: nfmt(b.attacks) },
      { k: 'Passion flips for', v: nfmt(b.passion_flips_for) },
      { k: 'Passion flips against', v: nfmt(b.passion_flips_against) },
      { k: 'Opponents faced', v: b.avg_distinct_opponents, s: 'average per player' },
      { k: 'Districts contested', v: b.avg_districts_contested, s: 'average per player' },
    ], [
      { label: 'Measure', get: (x) => x.k, sub: (x) => x.s || '' },
      { label: 'Value', num: true, get: (x) => x.v },
    ])
}
`


const CAPOS_JS = String.raw`
const RANK_LABELS = { recruit: 'Recruit', soldier: 'Soldier', captain: 'Captain',
  lieutenant: 'Lieutenant', underboss: 'Underboss', boss: 'Boss' }
const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic',
  legendary: 'Legendary', god: 'God', founder: 'Founder' }

/* ---- gear reference, from derive/combat-odds.js via capos.json ---- */

const SLOT_ORDER = ['head', 'chest', 'hands', 'feet', 'defense']
// The page's other exact() is scoped inside renderTraitPrice, not shared, so
// this needs its own. nfmt would abbreviate 25,132 items down to "25k".
const gexact = (n) => Number(n || 0).toLocaleString('en-US')
const gcap = (v) => {
  if (v == null) return '-'
  const t = String(v).charAt(0).toUpperCase() + String(v).slice(1).replace(/_/g, ' ')
  // One genuine acronym in the item list; title-casing it gives "Cctv".
  return t === 'Cctv' ? 'CCTV' : t
}

/**
 * Item type fixes the primary stat: every balaclava is muscle, every cctv is
 * brains, with no roll involved across all 39k items in circulation. That makes
 * this a lookup table rather than a probability, which is why it is worth
 * printing at all. The secondary stat IS rolled, uniformly across the other
 * four, so it is deliberately not shown as if it were choosable.
 */
/**
 * Supply and ownership, moved here from the retired growth page.
 *
 * They were always about capos rather than about growth: how many exist, what
 * they are made of, and who ends up holding them.
 */
function renderSupply() {
  lineChart(document.getElementById('c-supply'), {
    xs: DATA.supply.map((s) => s.date.slice(5)),
    series: [
      { name: 'In existence', values: DATA.supply.map((s) => s.total), color: 'var(--cat-1)' },
      { name: 'Burned', values: DATA.supply.map((s) => s.burned), color: 'var(--cat-5)' },
    ],
    height: 240,
  })

  // Rarity is ordinal, so it gets one hue stepped light to dark, never five
  // categorical hues that would imply unrelated identities.
  lineChart(document.getElementById('c-supply-rarity'), {
    xs: DATA.supply.map((s) => s.date.slice(5)),
    series: [
      { name: 'Common', values: DATA.supply.map((s) => s.common), color: '#BBD5C4' },
      { name: 'Uncommon', values: DATA.supply.map((s) => s.uncommon), color: '#8FBCA2' },
      { name: 'Rare', values: DATA.supply.map((s) => s.rare), color: '#5F9C7B' },
      { name: 'Epic', values: DATA.supply.map((s) => s.epic), color: '#3B7A57' },
      { name: 'Legendary', values: DATA.supply.map((s) => s.legendary), color: '#245239' },
    ],
    height: 240,
  })

  columns(document.getElementById('c-ownership'), {
    rows: DATA.ownership.map((b) => ({ label: b.label, value: b.owners })),
    color: 'var(--cat-2)',
  })

  columns(document.getElementById('c-season'), {
    rows: DATA.by_season.map((s) => ({ label: 'S' + s.season, value: s.capos })),
    color: 'var(--cat-3)',
  })
}

function renderGear() {
  const el = document.getElementById('gear')
  if (!el || !DATA.gear) return
  const stats = [...new Set(DATA.gear.items.map((i) => i.stat))].sort()
  const rows = stats.map((st) => {
    const row = { stat: st }
    SLOT_ORDER.forEach((sl) => {
      const hit = DATA.gear.items.find((i) => i.stat === st && i.slot === sl)
      row[sl] = hit ? gcap(hit.item_type) : '-'
    })
    return row
  })
  el.innerHTML = ledgerRows(rows, [{ label: 'To raise', get: (r) => gcap(r.stat) }].concat(
    SLOT_ORDER.map((sl) => ({ label: gcap(sl), get: (r) => r[sl] }))), { rank: false })

  const lad = document.getElementById('ladder')
  if (!lad) return
  // god and uncommon gear exist but carry a 0% bonus, so they are unfinished
  // content rather than a tier worth buying. Showing them as 0% would read as
  // a real choice.
  lad.innerHTML = ledgerRows(DATA.gear.ladder.filter((l) => l.primary_pct > 0), [
    { label: 'Item rarity', get: (r) => gcap(r.rarity) },
    { label: 'Primary stat', get: (r) => '+' + r.primary_pct + '%', num: true },
    { label: 'Secondary', get: (r) => '+' + r.secondary_pct + '%', num: true },
    { label: 'Uses before it breaks', get: (r) => r.max_durability, num: true },
    { label: 'In circulation', get: (r) => gexact(r.n), num: true },
  ], { rank: false })
}

function render() {
  renderGear()
  renderSupply()
  const rk = DATA.ranks
  const boss = (rk.pyramid.find((r) => r.rank === 'boss') || {}).capos || 0
  document.getElementById('tiles').innerHTML = [
    ['Capos in existence', nfmt(DATA.total), ''],
    ['Average age', DATA.avg_age_years + ' yrs', 'oldest ' + DATA.oldest_years + ', born at 25'],
    ['Bosses', nfmt(boss), 'the top of the ladder'],
    ['Promoted this week', nfmt(rk.promoted_last_7d), 'capos ranked up in 7 days'],
    ['Spent on promotions', (rk.promotion_spend_racket / 1e6).toFixed(0) + 'M $R',
      'RACKET, all capos, lifetime'],
    ['Founders', nfmt((DATA.by_rarity.find((r) => r.rarity === 'founder') || {}).capos || 0),
      'fixed supply'],
    // Existence is already the first tile, from the live capo count. Only the
    // burned figure is new, and it is what explains why the first number is not
    // simply everything ever minted.
    ['Capos burned', nfmt((DATA.supply.at(-1) || {}).burned), 'crafting and salvage'],
  ].map(([l, v, n]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span>' +
    '</div>').join('')

  // Rarity is ordered, so one hue stepped light to dark, never seven categoricals.
  const RARITY_HUE = { common: '#BBD5C4', uncommon: '#8FBCA2', rare: '#5F9C7B',
    epic: '#3B7A57', legendary: '#245239', god: '#12331F', founder: 'var(--cat-3)' }
  // Lifetime is the API's own board. The 24 hour column is ours: the API reports
  // a running total and never a delta, so a period figure exists only by
  // differencing snapshots we took.
  const ea = DATA.earners || {}
  const earnCols = (valueLabel, get) => [
    { label: 'Capo', get: (r) => r.capo_name, sub: (r) => r.owner_display_name },
    { label: 'Rank', get: (r) => r.tier },
    { label: valueLabel, num: true, get },
  ]
  // Exact figures, not nfmt's "56.6M": these are the earnings numbers people
  // came for, and rounding them to two significant figures throws away the
  // precision that makes them worth publishing.
  const exact = (n) => Number(n || 0).toLocaleString('en-US')
  document.getElementById('c-earn-life').innerHTML = ledgerRows(
    ea.lifetime || [], earnCols('RACKET earned', (r) => exact(r.value)))
  document.getElementById('c-earn-24h').innerHTML = (ea.last_24h || []).length
    ? ledgerRows(ea.last_24h, earnCols('RACKET gained', (r) => exact(r.gained)))
    : '<p class="basis">Not yet: this needs two snapshots to difference.</p>'

  const mv = ea.movement || {}
  const moveCols = (verb) => [
    { label: 'Capo', get: (r) => r.capo_name, sub: (r) => r.owner_display_name },
    { label: 'Was', num: true, get: (r) => '#' + r.was },
    { label: 'Now', num: true, get: (r) => '#' + r.rank },
    { label: verb, num: true, get: (r) => (r.moved > 0 ? '+' : '') + r.moved },
  ]
  const movePane = (rows, verb) => (mv.unavailable
    ? '<p class="basis">Not yet: ' + esc(mv.unavailable) + '</p>'
    : (rows || []).length
      ? ledgerRows(rows, moveCols(verb))
      : '<p class="basis">Nobody moved that way in this window.</p>')
  document.getElementById('c-climb').innerHTML = movePane(mv.climbers, 'Up')
  document.getElementById('c-slide').innerHTML = movePane(mv.fallers, 'Down')

  document.getElementById('c-rarity').innerHTML = shareBars(
    DATA.by_rarity.map((r) => ({ label: RARITY_LABELS[r.rarity], value: r.capos })),
    'var(--cat-2)')

  document.getElementById('c-ranks').innerHTML = shareBars(
    rk.pyramid.map((r) => ({ label: RANK_LABELS[r.rank], value: r.capos })),
    'var(--cat-1)')

  // Progression: promotion rate climbing with rarity is the story, so it leads.
  // Rarity against rank is a two-dimensional matrix. Collapsing it to one bar per
  // rarity threw away five of the six columns; bars cannot show a grid. The
  // promoted share stays as the last column so the headline is still readable
  // straight down.
  document.getElementById('c-progression').innerHTML = ledgerRows(DATA.crosstab, [
    { label: 'Rarity', get: (r) => RARITY_LABELS[r.rarity] },
    { label: 'Recruit', num: true, get: (r) => nfmt(r.recruit) },
    { label: 'Soldier', num: true, get: (r) => nfmt(r.soldier) },
    { label: 'Captain', num: true, get: (r) => nfmt(r.captain) },
    { label: 'Lieut.', num: true, get: (r) => nfmt(r.lieutenant) },
    { label: 'Underboss', num: true, get: (r) => nfmt(r.underboss) },
    { label: 'Boss', num: true, get: (r) => nfmt(r.boss) },
    { label: 'Promoted', num: true, get: (r) => r.promoted_pct + '%' },
  ], { rank: false })

  // Forty-four bars is not a chart anyone reads; it is a list with decoration.
  // As a table the supporting ranks fit alongside, which is the actual question:
  // is this a deep roster or one lucky boss?
  // Fifteen rows to match the list beside it, and three measures rather than
  // five: at half width the extra columns wrap and lose their headers, which is
  // exactly how the wars leaderboard broke.
  document.getElementById('c-rankleaders').innerHTML = ledgerRows(
    rk.rank_leaders.slice(0, 15), [
      { label: 'Player', get: (p) => p.name || p.owner_ref.slice(0, 8) },
      { label: 'Bosses', num: true, get: (p) => nfmt(p.boss) },
      { label: 'Capos', num: true, get: (p) => nfmt(p.capos) },
    ])

  // Fifteen names read faster as a list than as fifteen bars whose lengths are
  // nearly identical: the spread between first and fifteenth is small, so the
  // bar carries almost no information the number does not.
  document.getElementById('c-promoleaders').innerHTML = ledgerRows(
    rk.promotion_leaders.slice(0, 15), [
      { label: 'Player', get: (p) => p.name || p.owner_ref.slice(0, 8) },
      { label: 'Promotions', num: true, get: (p) => nfmt(p.promotions) },
    ])

  renderTraitPrice()
}

// Five rows against four rows, with the median and the mean side by side because
// the gap between them IS the finding. Bars would hide that the two measures
// disagree about how big the effect is.
function renderTraitPrice() {
  const tp = DATA.trait_price
  if (!tp) return
  const cols = (labelName) => [
    { label: labelName, get: (x) => x.key },
    { label: 'Sales', num: true, get: (x) => nfmt(x.sales) },
    { label: 'Median', num: true, get: (x) => x.median_sol + ' SOL' },
    { label: 'Average', num: true, get: (x) => x.avg_sol + ' SOL' },
  ]
  document.getElementById('traitprice').innerHTML =
    ledgerRows(tp.specialty, cols('Specialty')) +
    ledgerRows(tp.personality, cols('Personality'))
}
`

const PRIZES_JS = String.raw`
function render() {
  const seasons = DATA.seasons || []
  const latest = seasons[0]
  const biggest = (DATA.all_time || [])[0]
  const sb = DATA.sol_bounties || {}
  document.getElementById('tiles').innerHTML = [
    ['Total cash given away', '$' + nfmt(Math.round(DATA.total_usdc_all)),
      'across ' + DATA.seasons_captured + ' seasons, plus daily prizes and bounties'],
    ['Latest season pool', latest ? '$' + nfmt(Math.round(latest.total_usdc)) : '-',
      latest ? 'season ' + latest.season + ', ' + latest.winners + ' winners' : ''],
    ['Daily prizes and bounties', '$' + nfmt(Math.round(DATA.total_usdc_other)),
      'outside the season pools'],
    ['SOL bounties', sb.total_sol ? sb.total_sol.toFixed(2) + ' SOL' : '-',
      sb.payouts ? nfmt(sb.payouts) + ' payouts, not converted to USD' : 'none captured'],
    ['Biggest all-time winner', biggest ? '$' + nfmt(Math.round(biggest.usd)) : '-',
      biggest ? biggest.name : ''],
    ['Seasons paid out', nfmt(DATA.seasons_captured), 'on-chain, recovered retroactively'],
  ].map(([l, v, n]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span>' +
    '</div>').join('')

  // Per season, not cumulative: a running total only ever climbs, so it hides
  // whether a given season paid more or less than the one before, which is the
  // movement worth seeing here.
  columns(document.getElementById('c-pools'), {
    rows: DATA.seasons.slice().reverse().map((x) => ({ label: 'S' + x.season, value: x.total_usdc })),
    color: 'var(--cat-5)',
    yFormat: (n) => '$' + nfmt(n),
    height: 200,
  })

  document.getElementById('c-seasons').innerHTML = ledgerRows(DATA.seasons, [
    { label: 'Season', get: (x) => 'S' + x.season, sub: (x) => x.date },
    { label: 'Winners', num: true, get: (x) => nfmt(x.winners) },
    { label: 'Paid', num: true, get: (x) => '$' + nfmt(Math.round(x.total_usdc)) },
  ], { rank: false })

  if (latest) {
    hBars(document.getElementById('c-latest'), {
      rows: latest.ledger.map((w) => ({ label: w.name, value: w.usd })),
      color: 'var(--cat-5)',
      unit: '',
      maxBars: 15,
    })
  }

  hBars(document.getElementById('c-alltime'), {
    rows: (DATA.all_time || []).map((w) => ({ label: w.name, value: w.usd })),
    color: 'var(--cat-1)',
    maxBars: 15,
  })
}
`

const TRAINERS_JS = String.raw`
/**
 * Tables, not charts, almost everywhere on this page.
 *
 * The rate spread is two wild outliers and 36 distinct values, so a histogram
 * would be one tall bar and a lot of white space. Prestige and season pass are
 * five and three rows. Comparing completion against turnaround needs both
 * numbers read exactly, not estimated off an axis. The one genuinely ranked
 * magnitude, who actually gets hired, is the one thing drawn as bars.
 */
function tbl(rows, cols) {
  if (!rows || !rows.length) return '<p class="basis">No rows yet.</p>'
  const head = '<div class="row head"><span></span>' +
    cols.map((c) => '<span class="' + (c.num ? 'num' : '') + '">' + esc(c.label) + '</span>').join('') +
    '</div>'
  const body = rows.map((r, i) => {
    const first = cols[0], rest = cols.slice(1)
    return '<div class="row"><span class="rank">' + (i + 1) + '</span>' +
      '<span class="name">' + esc(first.get(r)) +
      (first.sub ? '<br><span class="sub">' + esc(first.sub(r)) + '</span>' : '') + '</span>' +
      '<span class="extra">' + rest.map((c) =>
        '<span class="' + (c.num ? 'num' : '') + '">' +
        '<span class="cell-label">' + esc(c.label) + '</span>' + esc(c.get(r)) + '</span>').join('') +
      '</span></div>'
  }).join('')
  return '<div class="ledger" data-cols="' + (cols.length + 1) + '">' + head + body + '</div>'
}

const dash = (v, suffix) => (v == null ? '-' : v + (suffix || ''))

function render() {
  const m = DATA.market, r = DATA.rates

  document.getElementById('tiles').innerHTML = [
    ['Trainers listed', nfmt(m.trainers), m.available + ' taking work'],
    ['Jobs settled', nfmt(m.jobs_settled), 'lifetime, all trainers'],
    ['Median rate', m.median_rate_sol + ' SOL', 'per job'],
    ['Median turnaround', m.median_turnaround_h + 'h', 'typical trainer'],
    ['Slot utilisation', m.utilisation_pct + '%', nfmt(m.active_fills) + ' of ' + nfmt(m.total_slots) + ' slots busy'],
    // Replaces the "never hired" count. Removing the rate-spread section took
    // away the only figure a player could actually act on, and the middle half
    // is the number you want before deciding what to pay.
    ['Typical rate', DATA.rates.p25_sol + ' to ' + DATA.rates.p75_sol, 'SOL, middle half'],
  ].map(([l, v, n]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span>' +
    '</div>').join('')


  hBars(document.getElementById('c-busiest'), {
    rows: DATA.trainers.filter((t) => t.jobs_settled > 0)
      .map((t) => ({ label: t.name, value: t.jobs_settled })),
    color: 'var(--cat-1)',
    maxBars: 10,
    bare: true,
  })

  renderRoster()
}

/**
 * The roster, sorted on demand.
 *
 * Sort controls live in a button row as well as on the column headers, because
 * the headers are hidden below 46rem where the table stacks into labelled pairs.
 * Header-only sorting would have left every phone with no way to reorder it.
 */
const ROSTER_SORTS = [
  { key: 'jobs_settled', label: 'Jobs', dir: -1 },
  { key: 'rate_sol', label: 'Rate', dir: 1 },
  { key: 'turnaround_h', label: 'Turnaround', dir: 1 },
  { key: 'prestige', label: 'Prestige', dir: -1 },
  { key: 'completion', label: 'Completion', dir: -1 },
  { key: 'days_listed', label: 'Listed', dir: 1 },
]
let rosterKey = 'jobs_settled'
let rosterDir = -1

function sortRoster(rows) {
  return rows.slice().sort((a, b) => {
    const x = a[rosterKey], y = b[rosterKey]
    // Missing values sort to the bottom whichever way the column is pointing,
    // so a trainer with no record never displaces one with a real figure.
    if (x == null && y == null) return 0
    if (x == null) return 1
    if (y == null) return -1
    if (x === y) return b.jobs_settled - a.jobs_settled
    return (x < y ? -1 : 1) * rosterDir
  })
}

function renderRoster() {
  const bar = document.getElementById('rostersort')
  if (bar) bar.innerHTML = ROSTER_SORTS.map((s) =>
    '<button type="button" data-sort="' + s.key + '" aria-pressed="' +
    (s.key === rosterKey) + '">' + esc(s.label) +
    (s.key === rosterKey ? (rosterDir === 1 ? ' \u2191' : ' \u2193') : '') + '</button>').join('')

  const arrow = (k) => (k === rosterKey ? (rosterDir === 1 ? ' \u2191' : ' \u2193') : '')
  const cols = [
    { label: 'Trainer', key: 'name',
      get: (t) => t.name,
      sub: (t) => (t.available ? t.free + ' of ' + dash(t.capacity) + ' slots free' : 'not available') },
    { label: 'Rate', key: 'rate_sol', num: true, get: (t) => t.rate_sol },
    { label: 'Jobs', key: 'jobs_settled', num: true, get: (t) => nfmt(t.jobs_settled) },
    { label: 'Done', key: 'completion', num: true, get: (t) => dash(t.completion, '%') },
    { label: 'Turnaround', key: 'turnaround_h', num: true, get: (t) => dash(t.turnaround_h, 'h') },
    { label: 'Prestige', key: 'prestige', num: true, get: (t) => dash(t.prestige) },
    { label: 'Listed', key: 'days_listed', num: true, get: (t) => dash(t.days_listed, 'd') },
  ]
  const rows = sortRoster(DATA.trainers)
  const head = '<div class="row head"><span></span>' + cols.map((c) =>
    '<span class="' + (c.num ? 'num ' : '') + 'sortable" data-sort="' + c.key + '" role="button" tabindex="0">' +
    esc(c.label) + arrow(c.key) + '</span>').join('') + '</div>'
  const body = rows.map((t, i) => {
    const first = cols[0], rest = cols.slice(1)
    return '<div class="row"><span class="rank">' + (i + 1) + '</span>' +
      '<span class="name">' + esc(first.get(t)) +
      '<br><span class="sub">' + esc(first.sub(t)) + '</span></span>' +
      '<span class="extra">' + rest.map((c) =>
        '<span class="' + (c.num ? 'num' : '') + '">' +
        '<span class="cell-label">' + esc(c.label) + '</span>' + esc(c.get(t)) + '</span>').join('') +
      '</span></div>'
  }).join('')
  document.getElementById('roster').innerHTML =
    '<div class="ledger" data-cols="' + (cols.length + 1) + '">' + head + body + '</div>'
}

function pickSort(key) {
  if (!key) return
  if (key === rosterKey) rosterDir = -rosterDir
  else {
    rosterKey = key
    rosterDir = (ROSTER_SORTS.find((s) => s.key === key) || { dir: -1 }).dir
  }
  renderRoster()
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-sort]')
  if (el) pickSort(el.dataset.sort)
})
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const el = e.target.closest('.sortable[data-sort]')
  if (el) { e.preventDefault(); pickSort(el.dataset.sort) }
})
`


const PAGES = [
  {
    file: 'index.html', section: 'overview',
    title: SITE, heading: SITE,
    eyebrow: 'The Syndicate &middot; kept by the community',
    description: 'Community-kept economy, combat and market data for The Syndicate.',
    body: `<div class="psearch">
    <label class="psearch-label" for="psearch">Look up a player</label>
    <input id="psearch" type="search" placeholder="Type a player name"
           autocomplete="off" aria-label="Look up a player by name">
    <div class="presults" id="presults"></div>
    <p class="psearch-note" id="psearch-note"></p>
  </div>
  <div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Last 24 hours</h2><span class="section-meta">what moved today</span></div>
  <div class="tiles" id="today"></div>
  <div class="section-head"><h2>How rare is rare</h2><span class="section-meta">every capo alive, by rarity</span></div>
  <div id="scarcity"></div>
  <div class="section-head"><h2>Who climbed today</h2><span class="section-meta">promotions in the last 24 hours</span></div>
  <div id="climbed"></div>
  <div class="section-head"><h2>Where to look</h2><span class="section-meta">the rest of the ledger</span></div>
  <div id="guide"></div>`,
    script: OVERVIEW_JS,
  },
  {
    file: 'money.html', section: 'money',
    title: 'Economy · ' + SITE, heading: 'Economy',
    eyebrow: 'The Syndicate &middot; economy',
    description: 'RACKET supply, emissions, sinks and secondary market volume.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Supply</h2><span class="section-meta">what changed, and where it stands</span></div>
  <div class="duo">
    <div><p class="duo-head">Net each day</p><div class="chart" id="c-net"></div></div>
    <div><p class="duo-head">In circulation, cumulative</p><div class="chart" id="c-supply"></div></div>
  </div>
  <div class="section-head"><h2>Where RACKET comes from and goes</h2><span class="section-meta">share of lifetime total</span></div>
  <div class="duo">
    <div><p class="duo-head">Created</p><div id="c-income"></div></div>
    <div><p class="duo-head">Destroyed</p><div id="c-sinks"></div></div>
  </div>
  <div class="section-head"><h2>Secondary market</h2><span class="section-meta">what trades, and at what price</span></div>
  <div class="duo">
    <div><p class="duo-head">SOL traded, cumulative</p><div class="chart" id="c-volume"></div></div>
    <div><p class="duo-head">Average price by rarity</p><div id="c-price"></div></div>
  </div>
  <div class="section-head"><h2>How the market clears</h2><span class="section-meta">liquidity, not volume</span></div>
  <div id="liquidity"></div>
`,
    script: MONEY_JS,
  },
  {
    file: 'wars.html', section: 'wars',
    title: 'Wars · ' + SITE, heading: 'Wars',
    eyebrow: 'The Syndicate &middot; territory and combat',
    description: 'Takeover odds, the specialty wheel, combat records and leagues.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Will this takeover land</h2><span class="section-meta">measured, not modelled from guesses</span></div>
  <div id="calc"></div>
  <div class="section-head"><h2>The specialty wheel</h2><span class="section-meta">attacker wins, by matchup</span></div>
  <div id="wheel"></div>
  <div class="section-head"><h2>The shape of the war</h2><span class="section-meta">who wins, and where they play</span></div>
  <div class="duo">
    <div><p class="duo-head">Attack against defence</p><div id="balance"></div></div>
    <div><p class="duo-head">Players by league</p><div class="chart" id="c-leagues"></div></div>
  </div>
  <div class="section-head"><h2>Who is winning</h2><span class="section-meta">the spread, and the top of it</span></div>
  <div class="duo">
    <div><p class="duo-head">Share of players by win rate</p><div id="c-winrate"></div></div>
    <div><p class="duo-head">Most fights won, lifetime</p><div id="t-fighters"></div></div>
  </div>`,
    script: WARS_JS,
  },
  {
    file: 'capos.html', section: 'capos',
    title: 'Capos · ' + SITE, heading: 'Capos',
    eyebrow: 'The Syndicate &middot; rarity, rank and progression',
    description: 'Every capo by rarity, rank and age, and how players promote them.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Top earners</h2><span class="section-meta">RACKET, the API caps this board at 50 capos</span></div>
  <div class="duo">
    <div><p class="duo-head">Lifetime</p><div id="c-earn-life"></div></div>
    <div><p class="duo-head">Last 24 hours</p><div id="c-earn-24h"></div></div>
  </div>
  <div class="section-head"><h2>Board movement</h2><span class="section-meta">places changed in the last 24 hours</span></div>
  <div class="duo">
    <div><p class="duo-head">Climbing</p><div id="c-climb"></div></div>
    <div><p class="duo-head">Sliding</p><div id="c-slide"></div></div>
  </div>
  <div class="section-head"><h2>What they are, and what they became</h2><span class="section-meta">count and share of all capos</span></div>
  <div class="duo">
    <div><p class="duo-head">By rarity, fixed at mint</p><div id="c-rarity"></div></div>
    <div><p class="duo-head">By rank, earned by promotion</p><div id="c-ranks"></div></div>
  </div>
  <div class="section-head"><h2>Promotion rate by rarity</h2><span class="section-meta">share promoted past recruit</span></div>
  <div id="c-progression"></div>
  <div class="section-head"><h2>Who is climbing</h2><span class="section-meta">top 15 each</span></div>
  <div class="duo">
    <div><p class="duo-head">Most bosses held</p><div id="c-rankleaders"></div></div>
    <div><p class="duo-head">Most promotions, last 7 days</p><div id="c-promoleaders"></div></div>
  </div>
  <div class="section-head"><h2>Do traits move the price?</h2><span class="section-meta">specialty and personality, by what people paid</span></div>
  <div id="traitprice"></div>
  <div class="section-head"><h2>Which item raises which stat</h2><span class="section-meta">fixed by item type, never rolled</span></div>
  <div id="gear"></div>
  <div class="section-head"><h2>What gear rarity buys you</h2><span class="section-meta">bonus against durability</span></div>
  <div id="ladder"></div>
  <div class="section-head"><h2>Capo supply</h2><span class="section-meta">how many, and of what</span></div>
  <div class="duo">
    <div><p class="duo-head">Minted against burned</p><div class="chart" id="c-supply"></div></div>
    <div><p class="duo-head">Composition by rarity</p><div class="chart" id="c-supply-rarity"></div></div>
  </div>
  <div class="section-head"><h2>Who holds them</h2><span class="section-meta">concentration, and vintage</span></div>
  <div class="duo">
    <div><p class="duo-head">Owners by roster size</p><div class="chart" id="c-ownership"></div></div>
    <div><p class="duo-head">Capos by season created</p><div class="chart" id="c-season"></div></div>
  </div>`,
    script: CAPOS_JS,
  },
  {
    file: 'prizes.html', section: 'prizes',
    title: 'Prizes · ' + SITE, heading: 'Prizes',
    eyebrow: 'The Syndicate &middot; season winnings, real USD',
    description: 'On-chain USD prize payouts by season, and who won them.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Prizes paid</h2><span class="section-meta">USD on chain, season by season</span></div>
  <div class="duo">
    <div><p class="duo-head">Paid each season</p><div class="chart" id="c-pools"></div></div>
    <div><p class="duo-head">Season detail</p><div id="c-seasons"></div></div>
  </div>
  <div class="section-head"><h2>Who won</h2><span class="section-meta">the latest payout, and all time</span></div>
  <div class="duo">
    <div><p class="duo-head">Latest season winners</p><div class="chart" id="c-latest"></div></div>
    <div><p class="duo-head">All-time winnings</p><div class="chart" id="c-alltime"></div></div>
  </div>`,
    script: PRIZES_JS,
  },
  {
    file: 'trainers.html', section: 'trainers',
    title: 'Trainers · ' + SITE, heading: 'Trainers',
    eyebrow: 'The Syndicate &middot; the training market',
    description: 'Who trains capos, what they charge, how fast they deliver and how much of the market sits idle.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Every trainer</h2><span class="section-meta"><a href="https://thesyndicate.games/hiring?market=trainers&amp;tab=browse" target="_blank" rel="noopener">Hire on The Syndicate &rarr;</a></span></div>
  <div class="controls" id="rostersort" role="group" aria-label="Sort the roster"></div>
  <div id="roster"></div>
  <div class="section-head"><h2>Who actually gets hired</h2><span class="section-meta">jobs settled, lifetime</span></div>
  <div class="chart" id="c-busiest"></div>
`,
    script: TRAINERS_JS,
  },
]

function main() {
  fs.mkdirSync(SITE_DIR, { recursive: true })
  fs.mkdirSync(DATA_OUT, { recursive: true })

  for (const f of fs.readdirSync(DATA_SRC)) {
    if (f.endsWith('.json')) fs.copyFileSync(path.join(DATA_SRC, f), path.join(DATA_OUT, f))
  }

  // Icons and the social card sit at the site root, because that is where the
  // <link> tags and every scraper look for them.
  // Retire pages that no longer exist. The build only ever wrote files, so a
  // page removed from PAGES kept being served from the last build that made it:
  // growth.html outlived its own removal this way, and a stale page is worse
  // than a missing one because nothing about it looks wrong.
  //
  // build-players.js runs before this one and owns players.html, so it is kept
  // explicitly rather than by accident.
  const expected = new Set(PAGES.map((p) => p.file).concat(['players.html']))
  for (const f of fs.readdirSync(SITE_DIR)) {
    if (!f.endsWith('.html') || expected.has(f)) continue
    fs.rmSync(path.join(SITE_DIR, f))
    console.log(`  retired      ${f}`)
  }

  const assetSrc = path.join(__dirname, 'assets')
  if (fs.existsSync(assetSrc)) {
    let n = 0
    for (const f of fs.readdirSync(assetSrc)) {
      if (f.startsWith('.')) continue
      fs.copyFileSync(path.join(assetSrc, f), path.join(SITE_DIR, f))
      n++
    }
    console.log(`  assets/       ${n} files`)
  }
  // Per-player rosters live in a subdirectory and are fetched on demand by the
  // profile page, so they have to be copied across too, not just the top level.
  const rosterSrc = path.join(DATA_SRC, 'rosters')
  if (fs.existsSync(rosterSrc)) {
    const rosterOut = path.join(DATA_OUT, 'rosters')
    fs.rmSync(rosterOut, { recursive: true, force: true })
    fs.mkdirSync(rosterOut, { recursive: true })
    let n = 0
    for (const f of fs.readdirSync(rosterSrc)) {
      if (!f.endsWith('.json')) continue
      fs.copyFileSync(path.join(rosterSrc, f), path.join(rosterOut, f))
      n++
    }
    console.log(`  data/rosters/ ${n} shards`)
  }

  for (const p of PAGES) {
    const html = page(p)
    fs.writeFileSync(path.join(SITE_DIR, p.file), html)
    console.log(`  ${p.file.padEnd(14)} ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`)
  }
  console.log(`  data/         ${fs.readdirSync(DATA_OUT).length} json files`)
}

main()
