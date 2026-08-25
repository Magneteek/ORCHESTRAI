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
import { CSS, NAV_CSS, FONTS, navHtml, SITE, metaHead, STAMP_JS, FOOTER, REVEAL_JS, REFERRAL, shareBar, SITE_URL, PRICE_JS, PRICE_TICKER } from './style.js'
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
    // A page may draw on more than one section file. They are written by
    // different derive scripts and merged here rather than on disk, so each
    // script keeps sole ownership of the file it produces.
    const bust = '?t=' + Math.floor(Date.now() / 30000)
    const parts = await Promise.all(SECTION_URLS.map(async (u) => {
      const res = await fetch(u + bust, { cache: 'no-store' })
      if (!res.ok) throw new Error(u + ': HTTP ' + res.status)
      return res.json()
    }))
    // The first file named is the one whose timestamp the page reports; it is
    // the page's primary subject, and mixing stamps would make the age lie.
    const next = Object.assign({}, ...parts.slice().reverse(), 
      { generated_at: parts[0].generated_at })
    // Only re-render when the payload actually moved, so hover state and open
    // data tables survive a poll that changed nothing.
    if (next.generated_at !== lastStamp) {
      DATA = next
      lastStamp = next.generated_at
      render()
      ledesToTop()
      revealIn()
      // Dollar figures are quoted from window.SOL_USD, so a price move has to
      // repaint them. render() is idempotent, so re-running it is the whole fix.
      window.onSolPrice = () => { render(); ledesToTop(); revealIn() }
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

function page({ file, title, description, heading, eyebrow, section, body, script, share,
  isStatic }) {
  // Indexable unless explicitly switched off. It shipped noindex for months
  // while the site was unreleased, and leaving the default that way meant a
  // launch could quietly go out invisible.
  const indexable = process.env.SITE_INDEXABLE !== '0'
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
<a class="skip" href="#main">Skip to content</a>
<div class="wrap">
  <header class="masthead">
    <div class="brandrow">
      ${file === 'index.html'
        ? '<img class="brandmark" src="/badge-small.png" width="72" height="62" alt="Capowatch">'
        : '<a class="brandlink" href="/" aria-label="Capowatch home">' +
          '<img class="brandmark" src="/badge-small.png" width="72" height="62" alt="Capowatch"></a>'}
      <div>
        <span class="eyebrow">${eyebrow}</span>
        <h1>${heading}</h1>
      </div>
    </div>
    ${isStatic ? '' : '<span class="live">Updated <span id="generated">&hellip;</span></span>'}
    ${navHtml(href)}
  ${PRICE_TICKER}
  </header>
  <main id="main">${body}</main>
  ${shareBar(href, share || title.replace(' \u00b7 ' + SITE, '').replace(SITE + ': ', ''))}
  ${REFERRAL}
  ${FOOTER}
</div>
<script>
${isStatic
  // A static page ships the reveal and nothing else. RUNTIME calls render() on
  // load, so including it here would have the page fetch a payload it has no
  // use for and then blank itself when no render function turns up.
  ? PRICE_JS + REVEAL_JS + '\ndocument.addEventListener("DOMContentLoaded", () => revealIn())'
  : `const SECTION_URLS = ${JSON.stringify([].concat(section).map((n) => '/data/' + n + '.json'))};
${STAMP_JS}
${PRICE_JS}
${CHART_JS}
${LEDGER_JS}
${REVEAL_JS}
${script}
${RUNTIME}`}
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
  // Direct children of #main, plus one level inside a tab panel. Tabs put a
  // wrapper between #main and the data blocks, which silently stopped every
  // explainer on a tabbed page from being lifted.
  document.querySelectorAll('#main > div, #main > [id^="tab-"] > div').forEach((el) => {
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
    // Cells escape by default. A column opts into raw only when it deliberately
    // returns markup, such as a converted amount carrying its SOL figure in a
    // span. Everything else stays escaped: these rows carry player-chosen names.
    const cell = (c, v) => (c.raw ? v : esc(v))
    return '<div class="row">' + (ranked ? '<span class="rank">' + (i + 1) + '</span>' : '') +
      '<span class="name">' + cell(first, first.get(r)) +
      (first.sub ? '<br><span class="sub">' + esc(first.sub(r)) + '</span>' : '') + '</span>' +
      '<span class="extra">' + rest.map((c) =>
        '<span class="' + (c.num ? 'num' : '') + '">' +
        '<span class="cell-label">' + esc(c.label) + '</span>' + cell(c, c.get(r)) + '</span>').join('') +
      '</span></div>'
  }).join('')
  return '<div class="ledger" data-cols="' + (cols.length + (ranked ? 1 : 0)) + '"' +
    (ranked ? '' : ' data-rank="none"') + '>' + head + body + '</div>'
}
`

const OVERVIEW_JS = String.raw`
function render() {
  const h = DATA.headline
  renderPaid()
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
    ['Secondary volume, 7d', solAmount(h.sol_volume_7d, { bare: true }), nfmt(h.sales_7d) + ' sales'],
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
    t('Top sale', f.top_sale_24h ? solAmount(f.top_sale_24h.sol, { bare: true }) : '-',
      f.top_sale_24h ? cap(f.top_sale_24h.rarity) : 'nothing sold')

  document.getElementById('guide').className = 'guide'
  document.getElementById('guide').innerHTML = [
    ['Players', '/players.html', 'One page per player: roster, combat, trading and prizes, plus who arrives and who stays.'],
    ['Wars', '/wars.html', 'Takeover odds, the specialty wheel, what each gear item does, win rates, cities and leagues.'],
    ['Capos', '/capos.html', 'Who earns most, how capos rank up, and how many exist by rank, rarity and owner.'],
    ['Market', '/market.html', 'What capos sell for, how fast they sell, whether traits move the price, and every trainer for hire.'],
    ['Packs', '/packs.html', 'What a pack is really worth: the chance of a god per card, and which tier returns most per dollar.'],
    ['Economy', '/money.html', 'RACKET supply, what mints and burns it, and the USD prize pools paid out on chain.'],
  ].map(([name, href, what]) =>
    '<div class="guide-item">' +
    '<span class="name"><a href="' + href + '">' + name + '</a></span>' +
    '<span class="what">' + what + '</span></div>').join('')
}


/**
 * What the game has paid out, in money that leaves the game.
 *
 * RACKET earnings are a bigger number and a smaller fact: the token is minted
 * by the game and spent back into it. This is USD settled on chain, so it is
 * the one figure on the site that answers "does this pay anything".
 *
 * Three figures and no board. The per-player breakdown was cut, so all_time is
 * read here only for its length, which is the count of players ever paid.
 *
 * No backticks in this comment: it sits inside a String.raw template, and one
 * would close the literal early.
 */
function renderPaid() {
  const winners = DATA.all_time || []
  if (!winners.length) return
  // Same bar as the economy page, from the same prizes.json this page already
  // fetches for its tiles. It leads because it is the one figure on the site
  // that answers whether any of this pays anything.
  renderSeasonBar()
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US')

  // Every individual prize ever awarded, flattened out of the season ledgers.
  // These 794 rows sum to total_usdc_seasons exactly, so the average and the
  // maximum below are computed over the whole population and not a sample.
  //
  // The daily prizes and bounties are deliberately outside this: the feed gives
  // their total but never the individual awards, so folding that money in would
  // divide a known sum by an unknown count. Hence "season prize", not "prize".
  const prizes = (DATA.seasons || []).flatMap((x) => x.ledger || [])
  const avg = prizes.length
    ? prizes.reduce((a, x) => a + x.usd, 0) / prizes.length : 0
  const biggest = prizes.reduce((a, x) => (x.usd > a ? x.usd : a), 0)

  document.getElementById('paidtiles').innerHTML = [
    ['Players paid', nfmt(winners.length)],
    ['Average season prize', usd(avg)],
    ['Largest single prize', usd(biggest)],
  ].map(([l, v]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span></div>').join('')
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
  renderTiles()
  // Panels draw through the tab controller: a chart drawn into a hidden panel
  // measures zero width and comes out empty.
  tabsReset()
}

function renderTiles() {
  const t = DATA.totals || {}
  const pz = (DATA.seasons || [])[0]
  const big = (DATA.all_time || [])[0]
  document.getElementById('tiles').innerHTML = [
    ['In circulation', nfmt(t.total_racket_supply), nfmt(t.wallet_count) + ' wallets'],
    ['Earned lifetime', nfmt(t.lifetime_earned_racket), ''],
    ['Spent lifetime', nfmt(t.lifetime_spent_racket), ''],
    // Three prize figures, not six. The strip is an auto-fit grid: any count
    // that overflows one row leaves an orphan cell the width of the page. The
    // daily-prize and SOL-bounty totals were the two smallest, and the season
    // table below carries the per-season detail either way.
    ['Total cash given away', '$' + nfmt(Math.round(DATA.total_usdc_all)),
      'across ' + DATA.seasons_captured + ' seasons'],
    ['Latest season pool', pz ? '$' + nfmt(Math.round(pz.total_usdc)) : '-', ''],
    ['Biggest all-time winner', big ? '$' + nfmt(Math.round(big.usd)) : '-', ''],
  ].map(([l, v, n]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span>' +
    '</div>').join('')
}


/**
 * The latest season split by league.
 *
 * Worth its own section because the leagues are not scaled copies of each
 * other: kingpin paid 11 winners more than district paid 32, so a single
 * ranked board hides four leagues behind one. Ordered strongest first, from
 * the seat counts the cities feed publishes.
 *
 * Winners whose league could not be matched are counted in the note and given
 * no board of their own. They are a gap in the join, not a league, and the
 * money involved is large enough that quietly dropping them would mislead.
 */
function renderLeagueBoards(latest, usd, cap1) {
  const el = document.getElementById('c-leagues')
  if (!el || !latest) return
  // The heading names the season rather than saying "latest", which stops being
  // true the moment a new one closes. The markup ships a generic fallback so a
  // page whose script fails still has a sensible heading rather than a blank one.
  const h = document.getElementById('h-leagues')
  if (h && latest.season) h.textContent = 'Top players in season ' + latest.season
  const leagues = DATA.leagues || []
  const rows = latest.ledger || []
  const parts = []

  for (const lg of leagues) {
    const won = rows.filter((w) => w.league === lg.name)
    if (!won.length) continue
    const total = won.reduce((a, w) => a + w.usd, 0)
    parts.push('<div>' +
      '<p class="leaguehead"><span class="nm">' + esc(lg.name) + '</span>' +
      '<span class="sub">' + won.length + (won.length === 1 ? ' winner' : ' winners') +
      ' &middot; ' + usd(total) + '</span></p>' +
      ledgerRows(won.slice(0, 5), [
        { label: 'Player', get: (r) => r.name },
        { label: 'Won', num: true, get: (r) => usd(r.usd) },
      ]) + '</div>')
  }

  const unmatched = rows.filter((w) => !w.league)
  const note = unmatched.length
    ? '<p class="basis">' + unmatched.length + ' of ' + rows.length +
      ' winners held no ground when the season closed, so no league could be ' +
      'matched to them, ' + usd(unmatched.reduce((a, w) => a + w.usd, 0)) +
      ' between them. They appear ' +
      // Not "the boards above": ledesToTop lifts this paragraph to the head of
      // the block, so any wording that points at a direction ends up wrong.
      'in no league board here rather than being filed under a guess. Seat counts: ' +
      leagues.map((l) => esc(l.name) + ' ' + l.seats).join(', ') + '.</p>'
    : ''

  el.innerHTML = '<div class="leaguegrid">' + parts.join('') + '</div>' + note
}


/**
 * The reward streams that are not a season pool.
 *
 * Small money, 1.5% of everything paid, but it answers a question the season
 * boards cannot: what else is there to win, and does anyone actually win it.
 * The answer is 24 players, which is worth stating plainly rather than leaving
 * a reader to assume bounties are a meaningful second income.
 *
 * SOL bounties sit in their own row and are never folded into a dollar figure.
 * There is no rate in any feed, and inventing one to make the totals add up
 * would be the kind of tidy number that is simply wrong.
 */
function renderOtherRewards(usd) {
  const el = document.getElementById('c-streams')
  const who = document.getElementById('c-collectors')
  if (!el || !who) return
  const sb = DATA.sol_bounties || {}
  const collectors = (DATA.all_time || []).filter((w) => w.other_usd > 0)
    .slice().sort((a, b) => b.other_usd - a.other_usd)
  const solOnly = (DATA.all_time || []).filter((w) => w.sol_bounties > 0).length

  el.innerHTML = ledgerRows([
    { k: 'Daily prizes', sub: 'awarded every day, outside any season',
      v: usd(DATA.total_usdc_daily) },
    { k: 'Bounties, in USDC', sub: 'paid for specific targets',
      v: usd(DATA.total_usdc_bounty) },
    { k: 'Bounties, in SOL', sub: (sb.payouts || 0) + ' payouts to ' + (sb.wallets || 0) + ' wallets',
      v: (sb.total_sol != null ? solAmount(sb.total_sol) : '-') },
    // Computed, not written down: a share stated as a literal goes stale the
    // first week the split moves and nothing flags it.
    { k: 'Season pools, for scale',
      sub: 'the other ' + (100 * DATA.total_usdc_seasons / DATA.total_usdc_all).toFixed(1) +
        '% of the money',
      v: usd(DATA.total_usdc_seasons) },
  ], [
    { label: 'Stream', get: (x) => x.k, sub: (x) => x.sub },
    // raw: the SOL bounty row is a converted amount carrying its SOL figure
    { label: 'Paid', num: true, raw: true, get: (x) => x.v },
  ], { rank: false }) +
  '<p class="basis">SOL bounties are shown in SOL and left out of every dollar ' +
  'total on this page. No feed carries a conversion rate, and picking one to make ' +
  'the figures add up would invent money. Their capture also starts later than the ' +
  'USDC ledger' + (sb.span ? ', on ' + String(sb.span.from).slice(0, 10) : '') +
  ', so the SOL row is a floor rather than a lifetime total.</p>'

  who.innerHTML = ledgerRows(collectors.slice(0, 10), [
    { label: 'Player', get: (r) => r.name,
      sub: (r) => [r.daily_usd > 0 ? usd(r.daily_usd) + ' daily' : null,
                   r.bounty_usd > 0 ? usd(r.bounty_usd) + ' bounty' : null]
                   .filter(Boolean).join(' · ') },
    { label: 'Collected', num: true, get: (r) => usd(r.other_usd) },
  ]) +
  '<p class="basis">Top 10 of ' + collectors.length + ' players who have ever been ' +
  'paid outside a season pool, out of ' + (DATA.all_time || []).length + ' paid at all. ' +
  solOnly + ' players have taken a SOL bounty, listed separately because that money ' +
  'is not counted here.</p>'
}


/* ---- tab: racket ---- */
function renderRacket() {
  // Its own handle on totals: the cumulative supply below is reconstructed
  // backwards from the reported figure, and this used to share the const that
  // the tiles declared before the two were split into separate functions.
  const t = DATA.totals || {}
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
}


/**
 * Season payouts, folded in from the retired prizes page.
 * Real USD leaving the game is the other half of the money story: RACKET is
 * what the game mints, this is what it pays out to players.
 */
function renderPrizes() {
  const seasons = DATA.seasons || []
  const latest = seasons[0]
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US')
  const cap1 = (x) => (x ? String(x).charAt(0).toUpperCase() + String(x).slice(1) : x)

  /**
   * Ranked lists, not bars.
   *
   * These are standings: the question is who is first and by how much, and a
   * rank column answers it directly. Side by side each board is half width,
   * where fifteen bars and their labels would be squeezed into about 250px and
   * the shorter half of them become indistinguishable slivers. The site already
   * makes this call for the fight and promotion boards.
   */
  const board = (rows, el, secondary, note) => {
    const target = document.getElementById(el)
    if (!target || !rows.length) return
    target.innerHTML = ledgerRows(rows.slice(0, 15), [
      { label: 'Player', get: (r) => r.name, sub: secondary },
      { label: 'Won', num: true, get: (r) => usd(r.usd) },
    ]) + '<p class="basis">' + note + '</p>'
  }

  board(DATA.all_time || [], 'c-alltime',
    (r) => r.seasons_won + (r.seasons_won === 1 ? ' season' : ' seasons'),
    'Top 15 of ' + (DATA.all_time || []).length + ' players ever paid. A career total ' +
    'across every season, so the top of this board got there by winning repeatedly ' +
    'rather than once.')

  if (latest) {
    const known = latest.ledger.filter((w) => w.league).length
    board(latest.ledger, 'c-latest',
      (r) => (r.league ? cap1(r.league) + ' league' : 'no ground held'),
      'Season ' + latest.season + ', top 15 of ' + latest.winners + ' paid. The prize ' +
      'feed records no league, so it is read from the last territory snapshot before ' +
      'the season closed' + (latest.league_snapshot ? ' (' + latest.league_snapshot + ')' : '') +
      '. It has to be that one: players are promoted a league at the rollover, and a ' +
      'later snapshot shows most winners a rung above where they actually won. ' +
      known + ' of ' + latest.winners + ' matched; the rest held no ground at that moment.')
  }

  renderLeagueBoards(latest, usd, cap1)
  renderOtherRewards(usd)

  renderSeasonBar()
}

TAB_DRAW = {
  racket: renderRacket,
  prizes: renderPrizes,
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

/* ---- gear reference, from derive/combat-odds.js via wars.json ---- */

const SLOT_ORDER = ['head', 'chest', 'hands', 'feet', 'defense']
// Its own formatter rather than the shared one: nfmt would abbreviate 25,132 items down to "25k".
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
  buildCalc()
  renderWheel()
  renderGear()
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


const PAYS_JS = String.raw`
/**
 * The one page written for someone who does not play yet.
 *
 * Every other page assumes you are in the game. This one answers the question
 * that gets typed into a search box before signing up for anything: does it
 * actually pay, and how much, to how many.
 *
 * It is deliberately not a sales page. The concentration, the median prize and
 * the share of players who have never been paid all sit above the referral
 * link, not below it. A page that only listed the good numbers would be worth
 * nothing to the reader and, on a site whose entire value is being checkable,
 * worth less than nothing to us.
 */
function render() {
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US')
  const winners = DATA.all_time || []
  const prizes = (DATA.seasons || []).flatMap((x) => x.ledger || []).map((x) => x.usd)
    .sort((a, b) => a - b)
  const owners = (DATA.headline || {}).owners || 0
  const med = prizes.length ? prizes[Math.floor(prizes.length / 2)] : 0
  const top10 = winners.slice(0, 10).reduce((a, w) => a + w.usd, 0)
  const paidPct = owners ? (100 * winners.length / owners) : 0
  const under50 = prizes.length ? 100 * prizes.filter((x) => x < 50).length / prizes.length : 0

  document.getElementById('tiles').innerHTML = [
    ['Paid out so far', usd(DATA.total_usdc_all)],
    ['Players ever paid', nfmt(winners.length)],
    ['Typical prize', usd(med)],
    ['Largest single prize', usd(Math.max.apply(null, prizes))],
  ].map(([l, v]) =>
    '<div class="tile"><span class="tile-label">' + l + '</span>' +
    '<span class="tile-value">' + v + '</span></div>').join('')

  // The old opening said "the game" and never named it. On the one page written
  // for someone who has not arrived from inside the game, that left the subject
  // unstated in the body entirely.
  document.getElementById('short').innerHTML =
    '<p class="answer">Yes, and you can check it.</p>' +
    '<p class="basis">The Syndicate is a free to play crypto game on Solana. Since ' +
    String(DATA.captured_span.from).slice(0, 10) + ' it has paid ' +
    usd(DATA.total_usdc_all) + ' of USDC to players across ' + DATA.seasons_captured +
    ' weekly seasons, every payment settled on chain rather than promised. If you are ' +
    'trying to work out whether it is legit before signing up, what follows is the ' +
    'whole answer, including the parts that do not flatter it.</p>'

  renderSeasonBar()

  // The honest half. These are the figures a signup page would leave out.
  document.getElementById('odds').innerHTML = ledgerRows([
    { k: 'Players who have ever been paid', v: nfmt(winners.length) + ' of ' + nfmt(owners),
      sub: paidPct.toFixed(1) + '% of everyone holding capos' },
    { k: 'Typical prize', v: usd(med),
      sub: Math.round(under50) + '% of all prizes are under $50' },
    { k: 'Share taken by the top ten', v: Math.round(100 * top10 / DATA.total_usdc_all) + '%',
      sub: usd(top10) + ' between ten players' },
    { k: 'Biggest single payout', v: usd(Math.max.apply(null, prizes)),
      sub: 'one player, one season' },
    { k: 'Best career total', v: winners.length ? usd(winners[0].usd) : '-',
      sub: winners.length ? winners[0].name + ', ' + winners[0].seasons_won + ' seasons won' : '' },
  ], [
    { label: 'Measure', get: (x) => x.k, sub: (x) => x.sub },
    { label: 'Figure', num: true, get: (x) => x.v },
  ], { rank: false }) +
  // No commentary under this table. It used to carry a paragraph explaining that
  // prize money is concentrated, which the five rows above already demonstrate,
  // and it read as lecturing rather than reporting. The figures are the argument.
  '<p class="basis">The game is free to start, so the floor is nothing spent.</p>'

  document.getElementById('streams').innerHTML = ledgerRows([
    { k: 'Season pools', v: usd(DATA.total_usdc_seasons),
      sub: 'league placement, paid every week' },
    { k: 'Daily prizes', v: usd(DATA.total_usdc_daily), sub: 'outside the season pools' },
    { k: 'Bounties in USDC', v: usd(DATA.total_usdc_bounty), sub: 'paid for specific targets' },
    { k: 'Bounties in SOL', v: solAmount((DATA.sol_bounties || {}).total_sol || 0),
      sub: 'converted at the current rate' },
  ], [
    { label: 'Stream', get: (x) => x.k, sub: (x) => x.sub },
    // raw: same, the SOL bounty row carries markup
    { label: 'Paid', num: true, raw: true, get: (x) => x.v },
  ], { rank: false }) +
  '<p class="basis">Four ways money reaches a player, and one of them is most of it. ' +
  'Season pools are league placement, so where you finish in your league is what pays.</p>'

  // The treasury address was printed here and has been taken out. It is public
  // on chain either way, but naming the game's wallet on a page that exists to
  // recommend the game reads as pointing at it rather than vouching for it.
  // Kept, but short. It is the answer to "how do you know", which is the whole
  // basis of the page; three sentences is enough to give it.
  document.getElementById('verify').innerHTML =
    '<p class="basis">Prizes are paid as USDC transfers on Solana. We record those ' +
    'transfers as they happen and add them up, so nothing on this page is estimated ' +
    'or modelled. Figures start ' + String(DATA.captured_span.from).slice(0, 10) +
    ', which is when this archive begins rather than when the game did.</p>'
}
`

const SEASONBAR_JS = String.raw`
/**
 * Every season as one bar.
 *
 * This replaced a short column chart beside an eleven-row table, a pairing that
 * left roughly 500px of empty page under the chart and split one quantity
 * across two shapes. The seasons are parts of a whole, so they are drawn as a
 * whole: one bar, one segment each, width proportional to what that season paid.
 *
 * The eleven-row detail is not lost, it moves behind the same show-data-table
 * control every chart on the site already carries.
 *
 * The headline figure is the season total, not the all-in total, because it has
 * to be the sum of the bar underneath it. The difference is named in the note
 * rather than quietly folded in.
 */
function renderSeasonBar() {
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US')
  const el = document.getElementById('c-seasonbar')
  const seasons = (DATA.seasons || []).slice().reverse()   // oldest first, left to right
  if (!el || !seasons.length) return

  const total = seasons.reduce((a, x) => a + x.total_usdc, 0)
  // One hue, stepped: season order is a sequence, not a set of categories.
  const shade = (i) => {
    const t = seasons.length > 1 ? i / (seasons.length - 1) : 1
    const l = 34 + Math.round(t * 34)      // 34% -> 68% lightness
    return 'hsl(43 46% ' + l + '%)'
  }

  const bar = seasons.map((x, i) =>
    // flex-grow, not a width percentage. Percentages sum to 100% and the ten 2px
    // gaps are then added on top, which pushed the page sideways on a phone.
    // Growing from a zero basis divides whatever is left after the gaps.
    '<button type="button" data-season="' + i + '" aria-label="Season ' + x.season +
    ', ' + usd(x.total_usdc) + '" style="flex:' +
    (1000 * x.total_usdc / total).toFixed(2) + ' 1 0;background:' + shade(i) + '"></button>').join('')

  // The caption sits above the bar, not under it: it is the thing that changes
  // as you move across, so it belongs where the eye already is rather than
  // below the segments and the axis labels.
  el.innerHTML =
    '<p class="seasontotal"><span class="big">' + usd(total) + '</span>' +
    '<span class="of">paid out across ' + seasons.length + ' seasons</span></p>' +
    '<p class="seasonpick" id="seasonpick"></p>' +
    '<div class="seasonbar" role="group" aria-label="Prize money by season">' + bar + '</div>' +
    '<p class="seasonbar-ends"><span>S' + seasons[0].season + '</span>' +
    '<span>S' + seasons[seasons.length - 1].season + '</span></p>' +
    '<div class="table-more"><button type="button" class="table-toggle" data-seasontable="1">' +
    'Show season detail</button></div>' +
    '<div id="seasontable" hidden>' + ledgerRows(DATA.seasons, [
      { label: 'Season', get: (x) => 'S' + x.season, sub: (x) => x.date },
      { label: 'Winners', num: true, get: (x) => nfmt(x.winners) },
      { label: 'Paid', num: true, get: (x) => usd(x.total_usdc) },
    ], { rank: false }) + '</div>'

  // A caption rather than a floating tooltip: it cannot fall off a phone screen,
  // and it works for keyboard focus without any positioning maths.
  const pick = document.getElementById('seasonpick')
  const say = (i) => {
    const x = seasons[i]
    pick.innerHTML = '<b>Season ' + x.season + '</b>' +
      '<span>' + x.date + '</span>' +
      '<span>' + nfmt(x.winners) + ' winners</span>' +
      '<b class="amt">' + usd(x.total_usdc) + '</b>' +
      '<span>' + (100 * x.total_usdc / total).toFixed(1) + '% of the total</span>'
  }
  el.querySelectorAll('[data-season]').forEach((b) => {
    const i = +b.dataset.season
    b.addEventListener('mouseenter', () => say(i))
    b.addEventListener('focus', () => say(i))
  })
  // Rest on the newest season rather than blanking: an empty line at this size
  // is a hole in the layout, and the resting state doubles as the explanation
  // of what the bar is for.
  const rest = () => say(seasons.length - 1)
  el.addEventListener('mouseleave', rest)
  rest()

  animateSeasonBar(el, total, usd)
}

/**
 * The one flourish on the site: the bar wipes in and the total counts up to it.
 *
 * Once per page load, never on a refresh. render() re-runs whenever the payload
 * timestamp moves, which is every ten minutes, and replaying this under someone
 * reading the table below it would be an irritation rather than a flourish.
 *
 * The delay is a full second so it is not already over by the time the page has
 * settled and the reader has looked at it. During that second the segments are
 * scaled to zero, which leaves the bar's own strip visible rather than a gap
 * that collapses and shoves the page around when it fills.
 *
 * A failsafe forces the finished state after three seconds. If anything throws
 * mid-sequence the alternative is a permanently empty bar under a $0 headline,
 * which is worse than a chart that simply appears.
 */
let seasonBarPlayed = false

function animateSeasonBar(el, total, usd) {
  const big = el.querySelector('.seasontotal .big')
  const segs = [].slice.call(el.querySelectorAll('.seasonbar > button'))
  if (!big || !segs.length) return

  const settle = () => {
    big.textContent = usd(total)
    segs.forEach((sg) => {
      sg.style.transition = ''
      sg.style.transitionDelay = ''
      sg.style.transform = ''
    })
  }
  const reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (seasonBarPlayed || reduce) { settle(); return }
  seasonBarPlayed = true

  segs.forEach((sg) => {
    sg.style.transformOrigin = 'left center'
    sg.style.transform = 'scaleX(0)'
  })
  big.textContent = usd(0)

  const STEP = 70, GROW = 520, RUN = (segs.length - 1) * STEP + GROW
  const failsafe = setTimeout(settle, 3000)

  setTimeout(() => {
    segs.forEach((sg, i) => {
      sg.style.transition = 'transform ' + GROW + 'ms cubic-bezier(.22,.9,.25,1)'
      sg.style.transitionDelay = (i * STEP) + 'ms'
      sg.style.transform = 'scaleX(1)'
    })
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / RUN)
      // ease-out, so the number slows into its final value rather than stopping dead
      const eased = 1 - Math.pow(1 - p, 3)
      big.textContent = usd(total * eased)
      if (p < 1) requestAnimationFrame(tick)
      else { clearTimeout(failsafe); settle() }
    }
    requestAnimationFrame(tick)
  }, 1000)
}


// The detail toggle lives with the bar it opens rather than in the tab
// controller, because the overview has this section and no tabs at all.
document.addEventListener('click', (e) => {
  const st = e.target.closest('[data-seasontable]')
  if (!st) return
  const t = document.getElementById('seasontable')
  t.hidden = !t.hidden
  st.textContent = t.hidden ? 'Show season detail' : 'Hide season detail'
})
`

const TABS_JS = String.raw`
/**
 * Tab controller for the section pages.
 *
 * Panels are hidden with the hidden attribute, which is display:none, and the
 * chart code sizes every SVG off container.clientWidth. Drawing into a hidden
 * panel therefore produces a zero-width chart. So a panel is drawn the first
 * time it is shown and never before, and a fresh payload marks every panel
 * undrawn again so the ones nobody is looking at redraw when next opened.
 *
 * The chosen tab lives in the URL fragment, so a tab can be linked and survives
 * a reload. Anything unrecognised falls back to the first tab rather than
 * leaving the page blank.
 */
let TAB_DRAW = {}
let tabDrawn = {}
let tabCurrent = null

function tabNames() { return Object.keys(TAB_DRAW) }

function showTab(want, push) {
  const names = tabNames()
  if (!names.length) return
  if (names.indexOf(want) === -1) want = names[0]
  tabCurrent = want
  const bar = document.getElementById('tabs')
  if (bar) bar.querySelectorAll('button[data-tab]').forEach((b) =>
    b.setAttribute('aria-selected', String(b.dataset.tab === want)))
  names.forEach((n) => {
    const el = document.getElementById('tab-' + n)
    if (el) el.hidden = n !== want
  })
  if (!tabDrawn[want]) {
    tabDrawn[want] = true
    TAB_DRAW[want]()
    // A panel drawn on click has missed the ledesToTop() that follows render().
    // The lift is idempotent, so calling it again for the whole page is safe.
    ledesToTop()
    revealIn()
  }
  if (push && location.hash.slice(1) !== want) history.replaceState(null, '', '#' + want)
}

// Called by each page's render() once the payload has changed, before anything
// is drawn: everything on screen is now stale, including the panels that are
// currently hidden.
function tabsReset() {
  tabDrawn = {}
  showTab(tabCurrent || location.hash.slice(1) || tabNames()[0], false)
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('#tabs button[data-tab]')
  if (btn) showTab(btn.dataset.tab, true)
})
window.addEventListener('hashchange', () => showTab(location.hash.slice(1), false))
`

const CAPOS_JS = String.raw`
const RANK_LABELS = { recruit: 'Recruit', soldier: 'Soldier', captain: 'Captain',
  lieutenant: 'Lieutenant', underboss: 'Underboss', boss: 'Boss' }
const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic',
  legendary: 'Legendary', god: 'God', founder: 'Founder' }

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

function render() {
  renderTiles()
  // Panels are drawn by the tab controller, never here: a chart drawn into a
  // hidden panel measures zero width and comes out empty.
  tabsReset()
}

function renderTiles() {
  const rk = DATA.ranks
  const boss = (rk.pyramid.find((r) => r.rank === 'boss') || {}).capos || 0
  document.getElementById('tiles').innerHTML = [
    ['Capos in existence', nfmt(DATA.total), ''],
    // Average age removed 2026-08-22. It rested on the same birth-season
    // derivation as the roster column: a year too high for every capo that has
    // taken an elixir rewind, and eleven years out on founders. The mean landed
    // close by luck, but it averages figures we cannot stand behind one by one.
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
}

/* ---- tab: earnings ---- */
function renderEarnings() {
  renderEarnPower()
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
}

/* ---- tab: progression ---- */
function renderProgression() {
  const rk = DATA.ranks
  // No rarity census on this page. It came off the overview as well, so the
  // "1 in 864 for a God" odds table is not published anywhere at the moment; the
  // rarity composition chart under Capo supply is the nearest thing left.

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

  renderLadderCost()
  renderPayback()

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
}


/**
 * The price of each rung.
 *
 * Exact figures, not nfmt. The point of this table is that a player can check
 * whether they can afford the next step, and "1.9M" does not answer that.
 *
 * The promotion count is a column rather than a footnote because the top rung
 * rests on nineteen observations and the bottom on thirteen hundred, and a
 * reader deciding what to spend should see which is which.
 */
function renderLadderCost() {
  const el = document.getElementById('c-cost')
  const rows = DATA.promotion_cost || []
  if (!el || !rows.length) return
  const exact = (n) => Number(n || 0).toLocaleString('en-US')
  const top = rows[rows.length - 1]
  const before = rows.length > 1 ? rows[rows.length - 2].total : 0

  el.innerHTML = ledgerRows(rows, [
    { label: 'Rank', get: (r) => RANK_LABELS[r.tier] },
    { label: 'This step', num: true, get: (r) => exact(r.step) },
    { label: 'Total to here', num: true, get: (r) => exact(r.total) },
    { label: 'Promotions seen', num: true, get: (r) => exact(r.promotions) },
  ], { rank: false }) +
  '<p class="basis">Taking one capo to ' + RANK_LABELS[top.tier].toLowerCase() +
  ' costs about ' + exact(top.total) + ' RACKET. The last step alone is ' +
  exact(top.step) + ', which is ' + (top.step / (before || 1)).toFixed(1) +
  ' times everything spent getting there, and it rests on only ' +
  exact(top.promotions) + ' promotions anyone has made, ranging ' +
  exact(top.p25) + ' to ' + exact(top.p75) + ' across the middle half. ' +
  'Each figure is measured from the same capo either side of its promotion, ' +
  'not from what capos at that rank have spent in total. The price is close to ' +
  'fixed but not exactly: legendary, god and founder capos are seen paying ' +
  'about a tenth less at several rungs.</p>'
}


/**
 * What a capo actually earns, from /capos/production.
 *
 * Before that endpoint the only per-capo earnings available were the
 * leaderboard's top 50, which has named 109 capos in the whole archive against
 * 96,806 alive, so the site could never answer this at all. It now rests on
 * 51,673.
 *
 * Medians, because earnings are skewed hard enough that a mean describes a capo
 * nobody owns.
 */
function renderEarnPower() {
  const p = DATA.production
  if (!p) return
  const exact = (n) => Number(n || 0).toLocaleString('en-US')
  const board = (rows, el, label, key) => {
    const t = document.getElementById(el)
    if (!t) return
    t.innerHTML = ledgerRows(rows, [
      { label, get: (r) => (key === 'rarity' ? RARITY_LABELS[r.rarity] : RANK_LABELS[r.tier]) },
      { label: 'Per day', num: true, get: (r) => exact(r.per_day) },
      { label: 'Lifetime', num: true, get: (r) => exact(r.lifetime) },
      { label: 'Capos', num: true, get: (r) => exact(r.capos) },
    ], { rank: false })
  }
  board(p.by_rarity, 'c-earn-rarity', 'Rarity', 'rarity')
  board(p.by_tier, 'c-earn-tier', 'Rank', 'tier')

  const el = document.getElementById('c-earn-rarity')
  if (el) el.insertAdjacentHTML('beforeend',
    '<p class="basis">Median RACKET per active day across ' + exact(p.earning_capos) +
    ' capos that have ever earned anything, of ' + exact(p.capos_alive) + ' alive. ' +
    'Medians, not averages: the top of this distribution is far enough out that a ' +
    'mean would describe a capo nobody owns.</p>')
}

/**
 * Whether a promotion earns itself back, and how fast.
 *
 * Rarity is held fixed on every row. Comparing all bosses against all underbosses
 * mixes the promotion with the fact that rarer capos both earn more and get
 * promoted more, which flatters the top rungs. Rows thinner than 25 capos on
 * either side are dropped rather than shown with a wide error nobody can see.
 */
function renderPayback() {
  const el = document.getElementById('c-payback')
  const p = DATA.production
  if (!el || !p || !p.payback.length) return
  const exact = (n) => Number(n || 0).toLocaleString('en-US')
  const fastest = p.payback.slice().sort((a, b) => (a.days || 1e9) - (b.days || 1e9))[0]
  const slowest = p.payback.slice().sort((a, b) => (b.days || 0) - (a.days || 0))[0]

  el.innerHTML = ledgerRows(p.payback, [
    { label: 'Capo', get: (r) => RARITY_LABELS[r.rarity],
      // The counts either side are on the row. A rung resting on 35 capos and
      // one resting on 8,448 should not look equally solid.
      sub: (r) => RANK_LABELS[r.from] + ' to ' + RANK_LABELS[r.to] +
        '  ·  ' + exact(r.n_from) + ' and ' + exact(r.n_to) + ' capos' },
    { label: 'Costs', num: true, get: (r) => exact(r.cost) },
    { label: 'Earns extra', num: true, get: (r) => '+' + exact(r.gain_per_day) + '/day' },
    { label: 'Pays back in', num: true, get: (r) => (r.days ? r.days + ' days' : 'never') },
  ], { rank: false }) +
  '<p class="basis">The first two rungs pay for themselves almost at once: ' +
  RARITY_LABELS[fastest.rarity].toLowerCase() + ' ' + RANK_LABELS[fastest.from].toLowerCase() +
  ' to ' + RANK_LABELS[fastest.to].toLowerCase() + ' costs ' + exact(fastest.cost) +
  ' and is back in ' + fastest.days + ' days. The slowest here is ' +
  RARITY_LABELS[slowest.rarity].toLowerCase() + ' ' + RANK_LABELS[slowest.from].toLowerCase() +
  ' to ' + RANK_LABELS[slowest.to].toLowerCase() + ' at ' + slowest.days + ' days. ' +
  'Every row compares capos of the same rarity, so what changes between the two ' +
  'sides is the rank and not the capo. Rungs with fewer than 25 capos either side ' +
  'are left out rather than guessed at, which is why the highest ranks are missing ' +
  'for the commonest capos: not one common capo has ever reached boss. The two ' +
  'counts on each row are how many capos sit either side of that step, so a rung ' +
  'resting on a few dozen can be read with the caution it deserves.</p>'
}

/* ---- tab: population ---- */
function renderPopulation() {
  renderSupply()
}

TAB_DRAW = {
  earnings: renderEarnings,
  progression: renderProgression,
  population: renderPopulation,
}
`

const MARKET_JS = String.raw`
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
    // The SOL price used to be a tile here. It is in the masthead on every page
    // now, so a copy on this one page would be the same number twice.
    // The capo marketplace leads: it is the bigger of the two markets here, and
    // the one most readers came to ask about.
    ['Capo sales recorded', nfmt(DATA.sales.volume.reduce((a, v) => a + v.sales, 0)),
      solAmount(DATA.sales.volume.reduce((a, v) => a + v.sol, 0), { bare: true })],
    ['Trainers listed', nfmt(m.trainers), m.available + ' taking work'],
    ['Jobs settled', nfmt(m.jobs_settled), 'lifetime, all trainers'],
    ['Median rate', solAmount(m.median_rate_sol, { bare: true }), 'per job'],
    ['Median turnaround', m.median_turnaround_h + 'h', 'typical trainer'],
    ['Slot utilisation', m.utilisation_pct + '%', nfmt(m.active_fills) + ' of ' + nfmt(m.total_slots) + ' slots busy'],
    // The middle half of the rate spread: the figure to know before deciding
    // what to pay, which the median alone does not give you.
    ['Typical rate', solAmount(DATA.rates.p25_sol, { bare: true }) + ' to ' +
      solAmount(DATA.rates.p75_sol, { bare: true }), 'middle half'],
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
  renderMarket()
  renderTraitPrice()
}

/* ---- the capo marketplace, moved here from the economy page ---- */

/**
 * What a capo sells for, how long it takes to sell, and whether its traits
 * change the price. This sat under Economy beside RACKET emissions, where a
 * reader asking what their capo is worth had to walk past the token supply
 * first. The two markets on this page are unrelated in the data and related in
 * the question: both are what someone will pay you.
 */
function renderMarket() {
  let vol = 0
  lineChart(document.getElementById('c-volume'), {
    xs: DATA.sales.volume.map((v) => v.day.slice(5)),
    series: [{
      name: 'SOL traded, cumulative',
      values: DATA.sales.volume.map((v) => { vol += v.sol; return +vol.toFixed(2) }),
      color: 'var(--cat-3)',
    }],
    yFormat: (n) => nfmt(n) + ' SOL',
    height: 170,
  })

  /**
   * Floor, recent median, and how many are on the book.
   *
   * A table rather than tiles: three numbers per rarity that only mean anything
   * read across, and a tile can hold one. The floor is the lowest live ask, the
   * median is what actually sold in the last seven days, and the count is there
   * so a floor across nine listings is not read like a floor across a thousand.
   */
  const capr = (x) => x.charAt(0).toUpperCase() + x.slice(1)
  const band = DATA.sales.price_band || []
  document.getElementById('c-price').innerHTML = ledgerRows(band, [
    { label: 'Rarity', get: (p) => capr(p.rarity),
      sub: (p) => (p.listed ? nfmt(p.listed) + ' listed' : 'none listed') },
    { label: 'Floor', num: true, raw: true,
      get: (p) => (p.floor_sol != null ? solAmount(p.floor_sol) : '-') },
    { label: 'Sold, 7 days', num: true, raw: true,
      get: (p) => (p.median_7d_sol != null
        ? solAmount(p.median_7d_sol) + '<span class="insol">' + nfmt(p.sales_7d) +
          (p.sales_7d === 1 ? ' sale' : ' sales') + '</span>'
        : 'none') },
  ], { rank: false }) +
  '<p class="basis">Floor is the lowest ask on the book right now; the second ' +
  'column is the median of what actually changed hands in the last seven days. ' +
  'This section used to show the mean of every sale since January, which ran ' +
  '27% to 53% above the recent median on every rarity: a mean is dragged up by a ' +
  'few large sales, and a June price says little about today on a market that ' +
  'moved 71% in a fortnight. Note that common and uncommon capos are never ' +
  'listed at all, so the book starts at rare.</p>'

  // Liquidity is four numbers, not a shape. A chart of three percentiles is a
  // chart of three numbers, so this is a table.
  const q = DATA.liquidity
  if (window.SOL_USD) {
    const el = document.getElementById('c-volume')
    if (el) el.insertAdjacentHTML('beforeend',
      '<p class="basis">Dollar figures on this page are SOL converted at the ' +
      'current rate, shown in the masthead, with the SOL amount underneath. ' +
      'Lifetime and cumulative totals were traded at many different SOL prices, ' +
      'so read their dollar figure as today\'s value of that many SOL rather ' +
      'than as what anyone actually paid.</p>')
  }

  document.getElementById('liquidity').innerHTML = ledgerRows([
    { k: 'Quickest quarter', sub: 'time from listing to sale', v: q.hours_to_sell.p25 + 'h' },
    { k: 'Typical', sub: 'median time on market', v: q.hours_to_sell.median + 'h' },
    { k: 'Slowest quarter', sub: 'still sold, just waited', v: q.hours_to_sell.p75 + 'h' },
    { k: 'Sold at or above ask', sub: 'share of matched sales', v: q.sold_at_or_above_ask_pct + '%' },
    { k: 'Discount when discounted', sub: 'lower quartile against ask', v: q.vs_ask_pct.p25 + '%' },
    { k: 'Listed right now', sub: 'average ask ' + solAmount(q.avg_ask_sol, { bare: true }), v: nfmt(q.listed_now) },
    { k: 'Sold in the last week', sub: 'clearing rate', v: nfmt(q.sold_7d) },
    { k: 'Weeks of inventory', sub: 'shelf against clearing rate', v: q.weeks_of_inventory },
  ], [
    { label: 'Measure', get: (x) => x.k, sub: (x) => x.sub },
    { label: 'Value', num: true, get: (x) => x.v },
  ])
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
    { label: 'Median', num: true, get: (x) => solAmount(x.median_sol, { bare: true }) },
    { label: 'Average', num: true, get: (x) => solAmount(x.avg_sol, { bare: true }) },
  ]
  document.getElementById('traitprice').innerHTML =
    ledgerRows(tp.specialty, cols('Specialty')) +
    ledgerRows(tp.personality, cols('Personality'))
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

/**
 * The roster prints fifteen of sixty-two until asked for the rest.
 *
 * All sixty-two ran to 3,874px, which was 63% of this page on its own and made
 * everything below the roster effectively unreachable. Nobody reads trainer
 * forty-seven without sorting first, and the sort controls sit above the cut,
 * so the top fifteen of whatever column you chose is the useful view.
 */
const ROSTER_CAP = 15
let rosterAll = false

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
    { label: 'Rate', key: 'rate_sol', num: true, get: (t) => solAmount(t.rate_sol, { bare: true }) },
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
  const shown = rosterAll ? rows : rows.slice(0, ROSTER_CAP)
  const body = shown.map((t, i) => {
    const first = cols[0], rest = cols.slice(1)
    return '<div class="row"><span class="rank">' + (i + 1) + '</span>' +
      '<span class="name">' + esc(first.get(t)) +
      '<br><span class="sub">' + esc(first.sub(t)) + '</span></span>' +
      '<span class="extra">' + rest.map((c) =>
        '<span class="' + (c.num ? 'num' : '') + '">' +
        '<span class="cell-label">' + esc(c.label) + '</span>' + esc(c.get(t)) + '</span>').join('') +
      '</span></div>'
  }).join('')
  // data-roster is deliberately not data-sort: the page-wide click handler routes
  // anything carrying data-sort into pickSort, and this button must not re-sort.
  const more = rows.length > ROSTER_CAP
    ? '<div class="table-more"><button type="button" class="table-toggle" data-roster="1">' +
      (rosterAll ? 'Show top ' + ROSTER_CAP + ' only'
                 : 'Show all ' + rows.length + ' trainers') +
      '</button></div>'
    : ''
  document.getElementById('roster').innerHTML =
    '<div class="ledger" data-cols="' + (cols.length + 1) + '">' + head + body + '</div>' + more
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
  if (e.target.closest('[data-roster]')) {
    rosterAll = !rosterAll
    renderRoster()
    return
  }
  const el = e.target.closest('[data-sort]')
  if (el) pickSort(el.dataset.sort)
})
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const el = e.target.closest('.sortable[data-sort]')
  if (el) { e.preventDefault(); pickSort(el.dataset.sort) }
})
`


const PACKS_JS = String.raw`
/**
 * What a pack is worth, against what the cards actually sell for.
 *
 * The game publishes, per tier, the chance the whole three-card pack contains AT
 * LEAST ONE card of a rarity. That is not directly usable: it says nothing about
 * a pack holding two legendaries, which a Don does 13% of the time per slot.
 *
 * For any rarity ABOVE a pack's guarantee, flooring the guaranteed slot changes
 * nothing, so all three slots are independent draws at that rarity and the
 * published figure inverts exactly:
 *
 *     P(pack has >= 1 X) = 1 - (1 - d)^3   ->   d = 1 - (1-P)^(1/3)
 *
 * Everything above a guarantee is therefore derived, not assumed. Exactly one
 * number per tier is not recoverable: how often a free slot lands AT the
 * guaranteed rarity rather than below it. Three published chances, four
 * unknowns. That one is the filler input, and it defaults to zero because the
 * docs say a Rookie still turns up commons and uncommons, which are never
 * minted and cannot be sold at all.
 */
var ORDER = ['none', 'rare', 'epic', 'legendary', 'god']
/**
 * Straight from the game's own pack screens, not the docs site.
 *
 * The docs and the store disagreed, and the store is what people actually buy
 * from. Don was the worst of it: the docs said 35% legendary and 1% god, the
 * store says 50% and 2%, which moved Don from the worst value on the ladder to
 * the middle of it.
 *
 * guar  the floor on the guaranteed card
 * floor the floor on the other two, which the store states and the docs never did
 * pub   chance the PACK holds at least one of that rarity. Confirmed rather than
 *       assumed: every "~1 in N packs" the store prints equals 1/P, across all
 *       eleven of them.
 * boost one roll per pack; if it hits, every card in it starts with better stats.
 */
var PACKS = [
  { name: 'RACKET pack', usd: 2, guar: 'none', floor: 'none', pub: {},
    note: '$R, or $2', rolls: '70% common, 30% uncommon, each card' },
  { name: 'Rookie', usd: 4.99, cb: 100, guar: 'rare', floor: 'none',
    pub: { epic: 0.03, legendary: 0.002, god: 0.0006 }, boost: [0.10, 0.05] },
  { name: 'Made-Man', usd: 14.99, cb: 300, guar: 'rare', floor: 'rare',
    pub: { epic: 0.25, legendary: 0.004, god: 0.002 }, boost: [0.10, 0.05] },
  { name: 'Boss', usd: 49.99, cb: 1000, guar: 'epic', floor: 'rare',
    pub: { legendary: 0.08, god: 0.0075 }, boost: [0.10, 0.05] },
  { name: 'Don', usd: 149.99, cb: 3000, guar: 'epic', floor: 'epic',
    pub: { legendary: 0.50, god: 0.02 }, boost: [0.20, 0.10] },
  { name: 'Signature', usd: 299, cb: 3000, guar: 'legendary', floor: 'epic',
    pub: { god: 0.10 }, boost: [0.40, 0.20], half: true, list: 500 },
]
var perSlot = function (p) { return 1 - Math.pow(1 - p, 1 / 3) }
/**
 * What a pack costs in contraband.
 *
 * The four redeemable tiers have published, round costs, and they are not the
 * price times twenty: a Rookie is 100 even though it is $4.99. Deriving it gave
 * 2,994 for thirty Rookies when they really cost 3,000, which would tell someone
 * holding 2,995 that they could afford a basket they cannot.
 *
 * Signature has no published cost because it cannot be redeemed outright, only
 * discounted by half, so its figure IS derived: half the cash price at the
 * standard $0.05 a unit. It moves if the promotion does.
 */
var contrabandCost = function (p) {
  if (!p.cb && !p.half) return 0
  return p.half ? Math.round(p.usd * 0.5 * 20) : p.cb
}
var BUYABLE = PACKS.filter(function (p) { return p.usd !== null })
var KEYS = ['A', 'B', 'C']
var BASKETS = {
  A: { Rookie: 0, 'Made-Man': 4, Boss: 3, Don: 0, Signature: 0 },
  B: { Rookie: 0, 'Made-Man': 0, Boss: 0, Don: 0, Signature: 1 },
  C: { Rookie: 30, 'Made-Man': 0, Boss: 0, Don: 0, Signature: 0 }
}
var fillerShare = 0
var perSlot = function (p) { return 1 - Math.pow(1 - p, 1 / 3) }
var pctf = function (n) { return (n * 100).toFixed(n < 0.01 ? 2 : 1) + '%' }
var num = function (n) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }) }
// $4.99 is not $5, and a page about whether something is worth buying should not
// round the price it is judging.
var money = function (n) {
  return '$' + Number(n).toLocaleString('en-US',
    { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
}
// Local, not shared: cap1 and exactN live inside the wars page script and are
// undefined here. render() swallows anything it throws after the first load, so
// a missing helper does not error, it just silently blanks the section.
var capr = function (v) { return v == null ? '-' : String(v).charAt(0).toUpperCase() + String(v).slice(1) }
var exactr = function (n) { return Number(n || 0).toLocaleString('en-US') }

/** Card prices in SOL, from the same comps the player profiles value holdings with. */
function cardPrices() {
  var by = (DATA.comps && DATA.comps.by_rarity) || {}
  var out = { rare: 0, epic: 0, legendary: 0, god: 0 }
  for (var r in out) if (by[r] && by[r].median_sol != null) out[r] = by[r].median_sol
  // Common and uncommon are never minted on chain, so they cannot be sold and
  // are worth exactly nothing. That is the floor Rookie's spare cards sit on.
  out.none = 0
  return out
}
/**
 * Expected value of one pack, in SOL, counting all three cards.
 *
 * Each card is worth its floor unless it rolls higher. The store states both
 * floors, so for four of the five tiers there is nothing left to assume: a Don
 * is three epics or better, a Made-Man three rares or better. Only Rookie leaves
 * a gap, since its other two cards may be common or uncommon and neither is
 * minted on chain, so neither can be sold at all.
 */
function packEv(p, P) {
  var pubR = []
  for (var k = 0; k < ORDER.length; k++) if (p.pub[ORDER[k]] != null) pubR.push(ORDER[k])
  var d = {}
  for (var i = 0; i < pubR.length; i++) d[pubR[i]] = perSlot(p.pub[pubR[i]])
  var exact = function (r) {
    var j = pubR.indexOf(r), nx = pubR[j + 1]
    return d[r] - (nx ? d[nx] : 0)
  }
  var card = function (floor) {
    var v = 0, above = 0
    for (var m = 0; m < pubR.length; m++) {
      var r = pubR[m]
      if (ORDER.indexOf(r) <= ORDER.indexOf(floor)) continue
      v += exact(r) * P[r]; above += exact(r)
    }
    // Rookie's two spare cards are the only ones the store does not floor, so
    // they are the only place the filler figure applies.
    var base = floor === 'none' ? P.rare * fillerShare : P[floor]
    return v + (1 - above) * base
  }
  return card(p.guar) + 2 * card(p.floor)
}
/** Cash you would expect to spend at this tier before one god turns up. */
function godCost(p) {
  var r = solPerUsd()
  if (!p.pub.god || r == null) return null
  return (p.usd / p.pub.god) * r
}
var solPerUsd = function () { return window.SOL_USD ? 1 / window.SOL_USD : null }
/** A pack's price expressed in SOL, so EV and price compare in one unit. */
function packSol(p) { var r = solPerUsd(); return r == null ? null : p.usd * r }

function renderTiles(P) {
  var best = null, worst = null
  for (var i = 0; i < BUYABLE.length; i++) {
    var p = BUYABLE[i], s = packSol(p)
    if (s == null || !s || !p.pub.god) continue
    var ratio = packEv(p, P) / s
    if (!best || ratio > best.r) best = { p: p, r: ratio }
    if (!worst || ratio < worst.r) worst = { p: p, r: ratio }
  }
  var sig = PACKS.filter(function (p) { return p.name === 'Signature' })[0]
  var t = function (label, value, note) {
    return '<div class="tile"><span class="tile-label">' + label + '</span>' +
      '<span class="tile-value">' + value + '</span>' +
      (note ? '<span class="tile-note">' + note + '</span>' : '') + '</div>'
  }
  document.getElementById('tiles').innerHTML =
    t('Best value', best ? best.p.name : '-', best ? best.r.toFixed(2) + ' back per $1' : '') +
    t('Worst value', worst ? worst.p.name : '-', worst ? worst.r.toFixed(2) + ' back per $1' : '') +
    t('Best god odds', 'Signature', pctf(sig.pub.god) + ' a pack') +
    t('A god is worth', solAmount(P.god, { bare: true }), 'median sale') +
    (function () {
      var cheap = null
      for (var j = 0; j < BUYABLE.length; j++) {
        var q = BUYABLE[j]
        if (!q.pub.god) continue
        var per = q.usd / q.pub.god
        if (!cheap || per < cheap.per) cheap = { p: q, per: per }
      }
      return cheap
        ? t('Cheapest god', '$' + num(cheap.per), 'expected spend, via ' + cheap.p.name)
        : ''
    })()
}

function renderLadder(P) {
  var rows = [], rates = []
  for (var i = 0; i < PACKS.length; i++) {
    var p = PACKS[i]
    var sol = packSol(p), e = packEv(p, P)
    var ratio = (sol && p.usd !== null) ? e / sol : null
    rows.push({ p: p, e: e, ratio: ratio })
    // The RACKET pack is left out of best/worst: it is bought with in-game
    // currency for play, and ranking it against cash tiers on resale value is a
    // comparison it was never in.
    if (ratio != null && p.pub.god != null) rates.push(ratio)
  }
  var hi = Math.max.apply(null, rates), lo = Math.min.apply(null, rates)
  var line = function (k, v) {
    return '<div class="packrow"><span>' + k + '</span><span>' + v + '</span></div>'
  }
  document.getElementById('ladder').innerHTML = rows.map(function (r) {
    var p = r.p
    if (p.usd === null) {
      return '<div class="packcard dim">' +
        '<div class="pname"><b>' + esc(p.name) + '</b>' +
        '<span class="price">' + esc(p.note) + '<span>3 cards</span></span></div>' +
        line('Every card', esc(p.rolls)) +
        line('Sellable on chain', 'Neither rarity is minted') +
        line('Packs for a god', 'Never') +
        '<div class="packback"><span class="lbl">Back per $1</span><b>0.00</b></div></div>'
    }
    var tag = !p.pub.god ? ''
            : r.ratio === hi ? '<span class="tag pos">best value</span>'
            : r.ratio === lo ? '<span class="tag neg">worst value</span>' : ''
    var cb = !p.cb && !p.half ? 'bought with $R'
           : p.half ? num(contrabandCost(p)) + ' contraband, half off'
           : num(contrabandCost(p)) + ' contraband'
    return '<div class="packcard">' +
      '<div class="pname"><b>' + esc(p.name) + '</b>' +
      '<span class="price">' + money(p.usd) + '<span>' + cb + '</span></span></div>' +
      line('Guarantees', capr(p.guar)) +
      line('Other two cards', p.floor === 'none' ? 'Common or uncommon' : capr(p.floor) + ' or better') +
      line('God, per pack', pctf(packChance(p, 'god'))) +
      line('Packs for a god', p.pub.god
        ? num(Math.round(1 / p.pub.god)) + '  <span class="sub">' + solAmount(godCost(p), { bare: true }) + '</span>'
        : '&mdash;') +
      line('Legendary, per pack', pctf(packChance(p, 'legendary'))) +
      line('Boosted stats', p.boost
        ? pctf(p.boost[0]) + ' / ' + pctf(p.boost[1]) + ' double' : '&mdash;') +
      line('Value of the pack', solAmount(r.e, { bare: true })) +
      '<div class="packback"><span class="lbl">Back per $1</span>' +
      '<span>' + tag + ' <b class="' + (r.ratio === hi ? 'pos' : r.ratio === lo ? 'neg' : '') + '">' +
      (r.ratio == null ? '-' : r.ratio.toFixed(2)) + '</b></span></div></div>'
  }).join('')
}

function drawPicks() {
  document.getElementById('baskets').innerHTML = KEYS.map(function (k) {
    return '<div class="basket" id="basket' + k + '">' +
      '<div class="bhead"><h3>Basket ' + k + '</h3><span class="bcost" id="cost' + k + '"></span></div>' +
      '<div class="picks">' + BUYABLE.map(function (p) {
        return '<div class="pick"><label for="q' + k + p.name + '">' + esc(p.name) +
          ' <small>$' + num(p.usd) + '</small></label>' +
          '<input id="q' + k + p.name + '" type="number" min="0" step="1" inputmode="numeric" value="' +
          BASKETS[k][p.name] + '" data-b="' + k + '" data-p="' + esc(p.name) + '"></div>'
      }).join('') + '</div>' +
      '<div class="bout" id="out' + k + '"></div></div>'
  }).join('')
}
function readBasket(k) {
  var list = []
  for (var i = 0; i < BUYABLE.length; i++) {
    var p = BUYABLE[i]
    var el = document.getElementById('q' + k + p.name)
    var q = Math.max(0, parseInt(el && el.value, 10) || 0)
    BASKETS[k][p.name] = q
    if (q > 0) list.push([p.name, q])
  }
  return list
}
var findPack = function (n) {
  return PACKS.filter(function (p) { return p.name === n })[0]
}
/**
 * Chance a single pack holds at least one card of a rarity.
 *
 * The published table only lists rarities ABOVE the guarantee, because the
 * guarantee makes the rest certain. Reading pub[] straight reported a Signature
 * as 0% for legendary, which it guarantees.
 */
function packChance(p, rarity) {
  if (p.guar && ORDER.indexOf(rarity) <= ORDER.indexOf(p.guar)) return 1
  return p.pub[rarity] || 0
}
function anyOf(list, key) {
  return 1 - list.reduce(function (a, e) {
    return a * Math.pow(1 - packChance(findPack(e[0]), key), e[1])
  }, 1)
}
function renderBasket(k, P) {
  var list = readBasket(k)
  var packs = list.reduce(function (a, e) { return a + e[1] }, 0)
  var cash = 0, cb = 0, cashAfter = 0, ev = 0
  list.forEach(function (e) {
    var p = findPack(e[0]), q = e[1]
    cash += p.usd * q
    cb += contrabandCost(p) * q
    cashAfter += (p.half ? p.usd * 0.5 : 0) * q
    ev += q * packEv(p, P)
  })
  var r = { key: k, packs: packs, cash: cash, cb: cb, cashAfter: cashAfter, ev: ev,
    god: anyOf(list, 'god'), leg: anyOf(list, 'legendary') }
  document.getElementById('cost' + k).innerHTML = packs
    ? '$' + num(cash) + '<span class="sub">or ' + num(cb) + ' contraband' +
      (cashAfter ? ' + $' + num(cashAfter) : '') + '</span>'
    : ''
  var evSol = ev, price = solPerUsd() == null ? null : cash * solPerUsd()
  document.getElementById('out' + k).innerHTML = packs
    ? '<div class="stat big"><span>Chance of a god</span><span>' + pctf(r.god) + '</span></div>' +
      '<div class="stat"><span>Chance of a legendary</span><span>' + pctf(r.leg) + '</span></div>' +
      '<div class="stat"><span>Expected value</span><span>' + solAmount(evSol, { bare: true }) + '</span></div>' +
      '<div class="stat"><span>Back per $1</span><span>' +
        (price ? (evSol / price).toFixed(2) : '-') + '</span></div>' +
      '<div class="stat"><span>Cards opened</span><span>' + num(packs * 3) + '</span></div>'
    : '<p class="basis">Add a pack to see the odds.</p>'
  return r
}
function renderVerdict(all) {
  var live = all.filter(function (b) { return b.packs > 0 })
  KEYS.forEach(function (k) {
    var el = document.getElementById('basket' + k)
    if (el) el.classList.remove('win')
  })
  var box = document.getElementById('verdict')
  if (live.length < 2) {
    box.innerHTML = '<div class="callout"><p class="basis">Fill at least two baskets and this ' +
      'compares them on the chance of a god, the chance of a legendary, and value against real ' +
      'sale prices.</p></div>'
    return
  }
  var byGod = live.slice().sort(function (a, b) { return b.god - a.god })
  var byEv = live.slice().sort(function (a, b) { return b.ev - a.ev })
  var godTop = byGod[0], evTop = byEv[0]
  var tied = byGod.filter(function (b) { return b.god === godTop.god }).length > 1
  if (!tied) document.getElementById('basket' + godTop.key).classList.add('win')
  var split = !tied && evTop.key !== godTop.key
  var lines = byGod.map(function (b) {
    return 'Basket ' + b.key + ' ' + pctf(b.god) + ' for a god, ' +
      solAmount(b.ev, { bare: true }) + ' of value'
  })
  box.innerHTML = '<div class="callout">' +
    '<p class="calltitle">' + (tied ? 'Level on the god shot'
      : 'Basket ' + godTop.key + ' for the god shot') + '</p>' +
    '<p>' + lines.join('. ') + '.' +
    (split ? ' Value points the other way, so this is a real trade-off between one big pull and ' +
      'steadier return.' : '') + '</p></div>'
}
/**
 * Say where each rarity's price came from.
 *
 * The window is no longer the same for every card: a rarity is priced off the
 * last 7 days when that week holds enough sales to mean something, and widens
 * to 30 or 90 days when it does not. God is the case that matters -- it trades
 * a handful of times a week, so it is usually carrying a much older median than
 * rare is, and a reader deciding whether to spend $299 should be able to see
 * that rather than take one median on faith.
 */
function renderPriceBasis() {
  var by = (DATA.comps && DATA.comps.by_rarity) || {}
  var windows = { rarity_7d: 7, rarity_30d: 30, rarity_90d: 90 }
  var parts = []
  var order = ['rare', 'epic', 'legendary', 'god']
  for (var i = 0; i < order.length; i++) {
    var k = order[i], c = by[k]
    if (!c || c.median_sol == null) continue
    var days = windows[c.basis]
    parts.push(capr(k) + ' ' + c.median_sol + ' SOL, ' + exactr(c.sales) +
      (c.sales === 1 ? ' sale' : ' sales') +
      (days ? ' in ' + days + ' days' : ''))
  }
  if (!parts.length) return
  var el = document.getElementById('pricebasis')
  if (el) el.innerHTML = 'Every price here is the median of what capos of that rarity actually ' +
    'sold for, and the window widens when a week is too thin to trust: ' + parts.join('. ') +
    '. A card priced off a longer window is tracking the market with more lag, so the thinner ' +
    'the sample the more the figure above it should be read as a rough one.'
}
function render() {
  var P = cardPrices()
  renderTiles(P)
  renderLadder(P)
  renderPriceBasis()
  renderVerdict(KEYS.map(function (k) { return renderBasket(k, P) }))
}
document.addEventListener('DOMContentLoaded', function () {
  drawPicks()
  var f = document.getElementById('filler')
  f.addEventListener('input', function () {
    fillerShare = Math.min(1, Math.max(0, (parseFloat(f.value) || 0) / 100))
    if (DATA) render()
  })
  document.getElementById('baskets').addEventListener('input', function (e) {
    if (e.target.matches('input') && DATA) render()
  })
})
`

const PAGES = [
  {
    // The prize ledger joins the overview: what the game has actually paid
    // out is the single fact most worth putting on the front door.
    file: 'index.html', section: ['overview', 'prizes'],
    share: 'Capowatch tracks The Syndicate: every prize paid, on chain, plus live capo, combat and market data.',
    title: SITE + ': The Syndicate stats, prizes and economy', heading: SITE,
    eyebrow: 'The Syndicate &middot; kept by the community',
    description: 'Community-kept data for The Syndicate: what the game has paid out, ' +
      'who is winning, and live capo, combat and market figures. Unofficial, made by players.',
    body: `<div class="topduo">
    <div class="psearch">
      <label class="psearch-label" for="psearch">Look up a player</label>
      <input id="psearch" type="search" placeholder="Type a player name"
             autocomplete="off" aria-label="Look up a player by name">
      <div class="presults" id="presults"></div>
      <p class="psearch-note" id="psearch-note"></p>
    </div>
    <a class="toolcard" href="/packs.html">
      <span class="q">Plan how to spend your contraband</span>
      <span class="go">Open the pack planner &rarr;</span>
    </a>
  </div>
  <div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Last 24 hours</h2><span class="section-meta">what moved today</span></div>
  <div class="tiles" id="today"></div>
  <div class="section-head"><h2>What the game pays out</h2><span class="section-meta">real USD, on chain</span></div>
  <div id="c-seasonbar"></div>
  <div class="tiles" id="paidtiles"></div>
  <div class="section-head"><h2>Where to look</h2><span class="section-meta">the rest of the ledger</span></div>
  <div id="guide"></div>`,
    script: SEASONBAR_JS + OVERVIEW_JS,
  },
  {
    // Written for the visitor who has not played, which is the only search
    // intent in this category with any measurable volume behind it and the one
    // question this site can answer better than anybody: not "is it fun" but
    // "does it pay", settled against the chain rather than asserted.
    file: 'does-it-pay.html', section: ['prizes', 'overview'],
    share: 'Does The Syndicate actually pay? Every payout is on chain, and here is the full breakdown.',
    // No site suffix on this one. Every other title can afford the eleven
    // characters; this one is already at 54 and the query it answers has to
    // survive Google's truncation intact.
    title: 'Does The Syndicate actually pay? Every payout, on chain',
    // The heading names the game. "Does it actually pay?" reads fine to someone
    // already on the site and means nothing in a search result.
    heading: 'Does The Syndicate actually pay?',
    eyebrow: 'The honest answer, settled on chain',
    // Figure-free on purpose: a description with a dollar total in it goes stale
    // between rebuilds and Google caches the stale one.
    description: 'Does The Syndicate pay real money? Every prize is a USDC transfer ' +
      'on Solana. The exact total, how many players got any of it, and the typical prize.',
    body: `<div id="short"></div>
  <div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Every season, and what it paid</h2><span class="section-meta">USD on chain</span></div>
  <div id="c-seasonbar"></div>
  <div class="section-head"><h2>Your realistic odds</h2><span class="section-meta">what the record shows</span></div>
  <div id="odds"></div>
  <div class="section-head"><h2>The four ways money reaches a player</h2><span class="section-meta">where the prize pool actually goes</span></div>
  <div id="streams"></div>
  <div class="section-head"><h2>Where these numbers come from</h2><span class="section-meta">recorded, not reported</span></div>
  <div id="verify"></div>`,
    script: SEASONBAR_JS + PAYS_JS,
  },
  {
    // The one page that answers a question before money changes hands rather
    // than after. Pack odds are published by the game; what a pull is actually
    // worth is not, and that half comes from our own sale medians.
    file: 'packs.html', section: 'market',
    share: 'What a card pack in The Syndicate is really worth, priced against what capos actually sell for.',
    title: 'Which pack is worth buying? &middot; The Syndicate &middot; ' + SITE,
    heading: 'Packs',
    eyebrow: 'The Syndicate &middot; what a pull is worth',
    description: 'Pack odds for The Syndicate priced against real sale data: the chance of a god ' +
      'per card, expected value per tier, and a basket builder to compare what to buy.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Plan the spend</h2><span class="section-meta">up to three piles, side by side</span></div>
  <div class="controls">
    <label class="fillerctl" for="filler">Rookie spare cards
      <input id="filler" type="number" min="0" max="100" step="5" value="0">
      <span>% as often rare as worthless</span></label>
  </div>
  <div class="baskets" id="baskets"></div>
  <div id="verdict"></div>
  <p class="basis">Only Rookie leaves anything to assume. Every other tier floors all three cards at
  a rarity that can be sold, so their value needs no guesswork: a Don is three epics or better, a
  Made-Man three rares or better. Rookie's two spare cards may be common or uncommon, and neither is
  minted on chain, so at 0% they are worth nothing. That is the honest default and makes Rookie's
  figure a floor rather than an estimate.</p>
  <div class="section-head"><h2>Every tier</h2><span class="section-meta">priced against real sales</span></div>
  <div class="packgrid" id="ladder"></div>
  <p class="basis">Odds and prices are read off the game's own pack screens rather than its docs
  site, which disagreed with them. <b>Packs for a god</b> is one divided by the god chance, and
  matches the "~1 in N packs" the store prints on all eleven of its figures. <b>Value</b> counts all
  three cards at the median sale for their rarity, not just the best one. <b>Boosted stats</b> is a
  single roll per pack that lifts every card in it, and is real value this page does not attempt to
  price, so every tier is worth a little more than it says here, Signature most of all at 40%.</p>
  <p class="basis" id="pricebasis"></p>
  <p class="basis">Signature is priced at its current $299 promotion rather than its $500 list, so
  this goes stale if that ends. Daily supply caps are real and not modelled: four Signature packs a
  day, twenty Dons, and a limited slice of each tier redeemable with contraband, which bounds how
  fast any basket here can actually be bought.</p>`,
    script: PACKS_JS,
  },
  {
    // Two files: the RACKET economy this page has always covered, and the prize
    // ledger from the retired prizes page. They are now a tab each, because a
    // reader arrives wanting one or the other and never both at once.
    file: 'money.html', section: ['money', 'prizes'],
    share: 'Every USD prize The Syndicate has paid out on chain, season by season, with the winners of each.',
    title: 'Economy and prizes · The Syndicate · ' + SITE, heading: 'Economy',
    eyebrow: 'The Syndicate &middot; token supply and payouts',
    description: 'RACKET supply, what mints and burns it, and every USD prize pool The ' +
      'Syndicate has paid on chain, season by season, with the winners of each.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="tabbar" id="tabs" role="tablist">
    <button type="button" data-tab="racket" aria-selected="true">RACKET</button>
    <button type="button" data-tab="prizes" aria-selected="false">Prizes</button>
  </div>

  <div id="tab-racket">
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
  </div>

  <div id="tab-prizes" hidden>
    <div class="section-head"><h2>Prizes paid</h2><span class="section-meta">USD on chain, every season so far</span></div>
    <div id="c-seasonbar"></div>
    <div class="section-head"><h2>The money standings</h2><span class="section-meta">USD won, ranked</span></div>
    <div class="duo">
      <div><p class="duo-head">All time</p><div id="c-alltime"></div></div>
      <div><p class="duo-head">Latest season</p><div id="c-latest"></div></div>
    </div>
    <div class="section-head"><h2 id="h-leagues">Top players last season</h2><span class="section-meta">top five paid in each league</span></div>
    <div id="c-leagues"></div>
    <div class="section-head"><h2>Everything else that pays</h2><span class="section-meta">outside the season pools</span></div>
    <div class="duo">
      <div><p class="duo-head">By stream</p><div id="c-streams"></div></div>
      <div><p class="duo-head">Who collects it</p><div id="c-collectors"></div></div>
    </div>
  </div>`,
    script: TABS_JS + SEASONBAR_JS + MONEY_JS,
  },
  {
    // Two files again: the capo marketplace and the trainer hiring market. They
    // share no data, only the question. Both are what someone will pay you.
    file: 'market.html', section: ['market', 'trainers'],
    share: 'What capos sell for in The Syndicate, how fast they sell, and every trainer for hire.',
    title: 'Market and trainers · The Syndicate · ' + SITE, heading: 'Market',
    eyebrow: 'The Syndicate &middot; what things cost',
    description: 'What capos sell for in The Syndicate, how fast listings clear, whether ' +
      'traits move the price, and every trainer for hire with rates and turnaround.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Secondary market</h2><span class="section-meta">what trades, and at what price</span></div>
  <div class="duo">
    <div><p class="duo-head">SOL traded, cumulative</p><div class="chart" id="c-volume"></div></div>
    <div><p class="duo-head">What a capo costs</p><div id="c-price"></div></div>
  </div>
  <div class="section-head"><h2>How the market clears</h2><span class="section-meta">liquidity, not volume</span></div>
  <div id="liquidity"></div>
  <div class="section-head"><h2>Do traits move the price?</h2><span class="section-meta">specialty and personality, by what people paid</span></div>
  <div id="traitprice"></div>
  <div class="section-head"><h2>Every trainer</h2><span class="section-meta"><a href="https://thesyndicate.games/hiring?market=trainers&amp;tab=browse" target="_blank" rel="noopener">Hire on The Syndicate &rarr;</a></span></div>
  <div class="controls" id="rostersort" role="group" aria-label="Sort the roster"></div>
  <div id="roster"></div>
  <div class="section-head"><h2>Who actually gets hired</h2><span class="section-meta">jobs settled, lifetime</span></div>
  <div class="chart" id="c-busiest"></div>`,
    script: MARKET_JS,
  },
  {
    file: 'wars.html', section: 'wars',
    share: 'Takeover odds for The Syndicate, measured from recorded fights rather than guessed, plus what every gear item does.',
    title: 'Wars and gear · The Syndicate · ' + SITE, heading: 'Wars',
    eyebrow: 'The Syndicate &middot; combat and gear',
    description: 'Takeover odds for The Syndicate, measured from recorded fights rather ' +
      'than guessed: the specialty wheel, what each gear item does, and win rates by league.',
    body: `<div class="tiles" id="tiles"></div>
  <div class="section-head"><h2>Will this takeover land</h2><span class="section-meta">measured, not modelled from guesses</span></div>
  <div id="calc"></div>
  <div class="section-head"><h2>The specialty wheel</h2><span class="section-meta">attacker wins, by matchup</span></div>
  <div id="wheel"></div>
  <div class="section-head"><h2>Which item raises which stat</h2><span class="section-meta">fixed by item type, never rolled</span></div>
  <div id="gear"></div>
  <div class="section-head"><h2>What gear rarity buys you</h2><span class="section-meta">bonus against durability</span></div>
  <div id="ladder"></div>
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
    share: 'What it actually costs to take a capo to boss in The Syndicate, measured from real promotions.',
    title: 'Capos and promotion costs · The Syndicate · ' + SITE, heading: 'Capos',
    eyebrow: 'The Syndicate &middot; population and progression',
    description: 'Every capo in The Syndicate by rank, rarity and owner, who earns the most ' +
      'RACKET, and what each promotion actually costs, measured from real promotions.',
    // Three tabs, because ten screens of stacked duos on a phone is not a page
    // anyone reaches the bottom of. The sections are alternatives rather than an
    // argument, so nothing is lost by showing one group at a time.
    body: `<div class="tiles" id="tiles"></div>
  <div class="tabbar" id="tabs" role="tablist">
    <button type="button" data-tab="earnings" aria-selected="true">Earnings</button>
    <button type="button" data-tab="progression" aria-selected="false">Progression</button>
    <button type="button" data-tab="population" aria-selected="false">Population</button>
  </div>

  <div id="tab-earnings">
    <div class="section-head"><h2>Top earners</h2><span class="section-meta">RACKET, the API caps this board at 50 capos</span></div>
    <div class="duo">
      <div><p class="duo-head">Lifetime</p><div id="c-earn-life"></div></div>
      <div><p class="duo-head">Last 24 hours</p><div id="c-earn-24h"></div></div>
    </div>
    <div class="section-head"><h2>What a capo earns</h2><span class="section-meta">RACKET per active day</span></div>
    <div class="duo">
      <div><p class="duo-head">By rarity</p><div id="c-earn-rarity"></div></div>
      <div><p class="duo-head">By rank</p><div id="c-earn-tier"></div></div>
    </div>
    <div class="section-head"><h2>Board movement</h2><span class="section-meta">places changed in the last 24 hours</span></div>
    <div class="duo">
      <div><p class="duo-head">Climbing</p><div id="c-climb"></div></div>
      <div><p class="duo-head">Sliding</p><div id="c-slide"></div></div>
    </div>
  </div>

  <div id="tab-progression" hidden>
    <div class="section-head"><h2>The rank ladder</h2><span class="section-meta">what capos became, and how often they get there</span></div>
    <p class="duo-head">Capos by rank, earned by promotion</p>
    <div id="c-ranks"></div>
    <p class="duo-head">Promotion rate by rarity</p>
    <div id="c-progression"></div>
    <div class="section-head"><h2>What the ladder costs</h2><span class="section-meta">RACKET, typical spend per capo</span></div>
    <div id="c-cost"></div>
    <div class="section-head"><h2>Does promoting pay for itself?</h2><span class="section-meta">days to earn the promotion back</span></div>
    <div id="c-payback"></div>
    <div class="section-head"><h2>Who is climbing</h2><span class="section-meta">top 15 each</span></div>
    <div class="duo">
      <div><p class="duo-head">Most bosses held</p><div id="c-rankleaders"></div></div>
      <div><p class="duo-head">Most promotions, last 7 days</p><div id="c-promoleaders"></div></div>
    </div>
  </div>

  <div id="tab-population" hidden>
    <div class="section-head"><h2>Capo supply</h2><span class="section-meta">how many, and of what</span></div>
    <div class="duo">
      <div><p class="duo-head">Minted against burned</p><div class="chart" id="c-supply"></div></div>
      <div><p class="duo-head">Composition by rarity</p><div class="chart" id="c-supply-rarity"></div></div>
    </div>
    <div class="section-head"><h2>Who holds them</h2><span class="section-meta">concentration, and vintage</span></div>
    <div class="duo">
      <div><p class="duo-head">Owners by roster size</p><div class="chart" id="c-ownership"></div></div>
      <div><p class="duo-head">Capos by season created</p><div class="chart" id="c-season"></div></div>
    </div>
  </div>`,
    script: TABS_JS + CAPOS_JS,
  },
]

function main() {
  fs.mkdirSync(SITE_DIR, { recursive: true })
  fs.mkdirSync(DATA_OUT, { recursive: true })

  // growth.json is a build input, not a site payload: build-players.js reads it
  // from data/site at build time and no page ever fetches it.
  const NOT_PUBLISHED = new Set(['growth.json'])
  const published = new Set()
  for (const f of fs.readdirSync(DATA_SRC)) {
    if (!f.endsWith('.json') || NOT_PUBLISHED.has(f)) continue
    fs.copyFileSync(path.join(DATA_SRC, f), path.join(DATA_OUT, f))
    published.add(f)
  }
  /**
   * Sitemap, generated from PAGES so it cannot drift.
   *
   * A hand-kept list would have carried prizes.html and trainers.html into a
   * release that deleted them, and would be missing does-it-pay.html now. This
   * derives from the same array the build renders, plus players.html, which
   * build-players.js owns and this build never sees.
   *
   * lastmod is the data timestamp rather than the moment of the build: the site
   * rebuilds every ten minutes whether or not anything changed, and telling a
   * crawler every page changed six times an hour is a good way to be ignored.
   */
  const lastmod = (() => {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(DATA_SRC, 'overview.json'), 'utf8'))
      return String(o.generated_at).slice(0, 10)
    } catch { return new Date().toISOString().slice(0, 10) }
  })()
  const urls = PAGES.map((p) => (p.file === 'index.html' ? '/' : '/' + p.file))
    .concat(['/players.html'])
  fs.writeFileSync(path.join(SITE_DIR, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) =>
      '  <url><loc>' + SITE_URL + u + '</loc>' +
      '<lastmod>' + lastmod + '</lastmod></url>').join('\n') +
    '\n</urlset>\n')
  console.log(`  sitemap.xml   ${urls.length} urls`)

  /**
   * A 404 that belongs to the site.
   *
   * nginx was answering with its own white page, down to the version string.
   * Two retired URLs, prizes.html and trainers.html, are still linked from
   * elsewhere and bookmarked, so this is a page people actually reach.
   *
   * Static, with no script and no data: whatever went wrong to land here, this
   * page should not be able to fail too. Rendered through page() so it carries
   * the same masthead, nav and footer as everything else.
   */
  fs.writeFileSync(path.join(SITE_DIR, '404.html'), page({
    file: '404.html', section: 'overview',
    title: 'Page not found · ' + SITE,
    heading: 'Nothing here',
    eyebrow: 'The Syndicate &middot; wrong turn',
    description: 'That page does not exist on Capowatch.',
    share: 'Capowatch tracks The Syndicate: every prize paid, on chain.',
    body: `<p class="basis">That address does not exist here. It may have been a page
    that has since been retired: the old prizes and trainers pages were folded into
    <a href="/money.html">Economy</a> and <a href="/market.html">Market</a>.</p>
  <div class="section-head"><h2>Where to go instead</h2><span class="section-meta">everything on the site</span></div>
  <div class="guide" id="guide404">` +
      [['Overview', '/', 'What the game has paid out, and what moved today.'],
       ['Players', '/players.html', 'One page per player: roster, combat, trading and prizes.'],
       ['Wars', '/wars.html', 'Takeover odds, the specialty wheel and what gear does.'],
       ['Capos', '/capos.html', 'Who earns most, and what promotion costs.'],
       ['Market', '/market.html', 'What capos sell for, and every trainer for hire.'],
       ['Economy', '/money.html', 'RACKET supply, and every prize paid on chain.'],
       ['Does it pay?', '/does-it-pay.html', 'The honest answer, for anyone not playing yet.']]
        .map(([n, h, w]) => '<div class="guide-item"><span class="name"><a href="' + h +
          '">' + n + '</a></span><span class="what">' + w + '</span></div>').join('') +
    `</div>`,
    isStatic: true,
  }))
  console.log('  404.html      static, no data')

  // Retire payloads the same way pages are retired. Without this the build only
  // ever wrote files, so a derive script that stops producing one leaves the last
  // copy being served forever: territory.json outlived its own feature by a day
  // and 141KB, with nothing on the site fetching it and nothing looking wrong.
  for (const f of fs.readdirSync(DATA_OUT)) {
    if (!f.endsWith('.json') || published.has(f)) continue
    fs.rmSync(path.join(DATA_OUT, f))
    console.log(`  data/         retired ${f}`)
  }

  // Icons and the social card sit at the site root, because that is where the
  // <link> tags and every scraper look for them.
  // Retire pages that no longer exist. The build only ever wrote files, so a
  // page removed from PAGES kept being served from the last build that made it:
  // growth.html outlived its own removal this way, and a stale page is worse
  // than a missing one because nothing about it looks wrong.
  //
  // build-players.js runs before this one and owns players.html, so it is kept
  // explicitly rather than by accident. 404.html is written by this build but is
  // not in PAGES, since it is served by nginx on error rather than linked; without
  // it here the prune deletes it moments after it is written.
  const expected = new Set(PAGES.map((p) => p.file).concat(['players.html', '404.html']))
  for (const f of fs.readdirSync(SITE_DIR)) {
    if (!f.endsWith('.html') || expected.has(f)) continue
    fs.rmSync(path.join(SITE_DIR, f))
    console.log(`  retired      ${f}`)
  }

  const assetSrc = path.join(__dirname, 'assets')
  if (fs.existsSync(assetSrc)) {
    let n = 0
    // Files only. assets/source holds the original artwork the icons are cut
    // from, which is a build input rather than something to publish, and
    // copyFileSync throws ENOTSUP on a directory rather than skipping it.
    for (const e of fs.readdirSync(assetSrc, { withFileTypes: true })) {
      if (e.name.startsWith('.') || !e.isFile()) continue
      fs.copyFileSync(path.join(assetSrc, e.name), path.join(SITE_DIR, e.name))
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
