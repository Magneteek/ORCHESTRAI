#!/usr/bin/env node
/**
 * Generate the player directory and profile page.
 *
 * One page, hash-routed (#/p/<slug>), so a profile is a shareable URL while the
 * whole thing stays a single static file with no fetch. Data is inlined at
 * build time for the same reason the boards page is.
 *
 * Usage: node web/build-players.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSS, NAV_CSS, navHtml, FONTS, SITE } from './style.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const IN = path.join(ROOT, 'data', 'boards', 'players.json')
const OUT_DIR = path.join(__dirname, 'dist')
const SITE_DIR = path.join(OUT_DIR, 'site')

const TITLE = 'Players · ' + SITE
const DESCRIPTION =
  'Per-player rosters, combat records and realized SOL trading for The Syndicate.'

const slugify = (s) =>
  String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'player'

/** Names are not unique and are mutable, so collisions get a ref suffix. */
function assignSlugs(players) {
  const seen = {}
  for (const p of players) {
    const base = slugify(p.name)
    seen[base] = (seen[base] || 0) + 1
    p.slug = seen[base] === 1 ? base : `${base}-${p.ref.slice(0, 6)}`
  }
  return players
}

/**
 * A name-and-slug index for the search box on the overview page.
 *
 * The players page embeds every profile and runs to ~3.8MB, which is far too
 * much to load on a landing page just to answer "is my name in here". Slugs are
 * assigned here, collisions and all, so emitting the index from the same place
 * guarantees the two can never drift apart.
 */
function writeSearchIndex(players) {
  const out = path.join(ROOT, 'data', 'site', 'players-index.json')
  const payload = {
    generated_at: new Date().toISOString(),
    players: players.map((p) => ({ n: p.name, s: p.slug })),
  }
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(payload))
  console.log('written data/site/players-index.json (' +
    Math.round(Buffer.byteLength(JSON.stringify(payload)) / 1024) + ' KB, ' +
    players.length + ' names)')
}

const PAGE_CSS = String.raw`
/* The search panel itself is defined once in style.js and shared with the
   overview, so the two cannot drift apart again. */
.count { font-family: var(--mono); font-size: var(--step--1); color: var(--ink-muted); }

.plist { border: 1px solid var(--rule); border-top: none; margin-top: 0.5rem; }
/* Mobile-first single column. A two-track "1fr auto" grid here squeezes the
   name track to near-zero whenever the stats are wide, and overflow-wrap then
   breaks the name one character per line. Two columns only once there is room. */
.pitem {
  display: grid; gap: 0.15rem 0.75rem;
  grid-template-columns: 1fr;
  padding: 0.55rem 0.75rem;
  border-top: 1px solid var(--rule);
  cursor: pointer; text-align: left; width: 100%;
  background: none; color: inherit; font: inherit;
}
.pitem > * { min-width: 0; }
@media (min-width: 34rem) {
  .pitem { grid-template-columns: minmax(7rem, 1fr) auto; align-items: baseline; }
}
.pitem:nth-child(even) { background: var(--band); }
.pitem:hover { background: var(--rule); }
.pitem:focus-visible { outline: 2px solid var(--debit); outline-offset: -2px; }
.pitem .pname { font-weight: 600; overflow-wrap: anywhere; }
.pitem .pstats {
  font-family: var(--mono); font-size: 0.76rem;
  font-variant-numeric: tabular-nums; color: var(--ink-muted);
  display: flex; gap: 0.9rem; flex-wrap: wrap;
}

.back {
  font-family: var(--mono); font-size: 0.75rem;
  letter-spacing: 0.08em; text-transform: uppercase;
  background: var(--surface); color: var(--ink-muted);
  border: 1px solid var(--rule-firm); padding: 0.4rem 0.7rem;
  cursor: pointer; margin-bottom: 1.25rem;
}
.back:hover { color: var(--ink); }

/* .controls carries a top margin and no bottom one, which is right for a button
   row sitting above a chart. These tabs switch everything beneath them, and the
   first heading inside each pane zeroes its own top margin because it counts as
   a section opener, so without this the tab bar sits flush against it. */
#ptabs { margin-bottom: var(--space-6); }

.former {
  font-family: var(--mono); font-size: 0.78rem; color: var(--ink-muted);
}
/* Where the player actually stands, directly under their name: the league is
   the competition they are in, the place is how they are doing in it. */
.standing {
  display: block; margin-top: 0.35rem;
  font-family: var(--mono); font-size: 0.78rem;
  letter-spacing: 0.04em; color: var(--ink-muted);
}
.standing .league { color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
.standing .place { color: var(--ink); }
/* Sits inside the h1, so it has to opt out of the display face and the heading
   size it would otherwise inherit. */
.wallet {
  display: inline-block;
  margin-left: 0.6rem;
  vertical-align: middle;
  font-family: var(--mono);
  font-size: var(--step--1);
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ink-faint);
}
`

const CLIENT_JS = String.raw`
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('en-US'))
const sol = (n) => (n == null ? '-' : (n >= 0 ? '+' : '') + n.toFixed(3) + ' SOL')
const esc = (s) => String(s ?? '-').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const bySlug = {}
for (const p of DATA.players) bySlug[p.slug] = p

function tile(label, value, note, cls) {
  return '<div class="tile"><span class="tile-label">' + esc(label) + '</span>' +
    '<span class="tile-value ' + (cls || '') + '">' + value + '</span>' +
    '</div>'
}

function rows(pairs) {
  return '<div class="ledger">' + pairs.filter(Boolean).map(([k, v]) =>
    '<div class="row" style="grid-template-columns:1fr auto">' +
    '<span class="name">' + esc(k) + '</span>' +
    '<span class="num">' + v + '</span></div>').join('') + '</div>'
}

/**
 * League, city and placing, or nothing at all.
 *
 * Only players currently holding a district have a league: the game gives no
 * home city to anyone who controls no ground, and guessing one from where they
 * have been fighting would be wrong about half the time, since raids cross city
 * lines. So this renders nothing rather than an invented standing.
 */
function ordinal(n) {
  const t = n % 100
  if (t >= 11 && t <= 13) return n + 'th'
  return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th')
}

function standingLine(t) {
  if (!t) return ''
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
  return '<span class="standing"><span class="league">' + esc(cap(t.league)) +
    ' league</span> &middot; ' + esc(t.city) + ' &middot; <span class="place">' +
    ordinal(t.place) + ' of ' + t.of + '</span> on ' + t.districts +
    (t.districts === 1 ? ' district' : ' districts') + '</span>'
}

function renderProfile(p) {
  const c = p.combat, t = p.trading, r = p.roster, h = p.holdings, q = p.position
  let parts = []
  const chrome = parts
  const position = [], portfolio = [], trading = [], prizes = []
  const ranks = [], roster = [], combat = [], training = []

  parts.push('<button class="back" type="button" id="back">&larr; All players</button>')
  // Wallets are shown the way wallets are normally shown: enough to recognise one
  // you already know, not enough to read off the page. Anyone holding the full
  // address can still match it, so this is a display convention, not anonymity.
  const maskWallet = (w) => (w && w.length > 12 ? w.slice(0, 4) + '****' + w.slice(-4) : w)
  parts.push('<header class="masthead"><span class="eyebrow">Player ledger</span>' +
    '<h1>' + esc(p.name) +
    ((p.wallets && p.wallets.length)
      ? '<span class="wallet">' + p.wallets.map((w) => esc(maskWallet(w))).join(' ') + '</span>'
      : '') + '</h1>' +
    standingLine(p.territory) +
    (p.names ? '<span class="former">Also seen as ' +
      p.names.map(n => esc(n.name)).join(', ') + '</span>' : '') +
    '</header>')

  parts.push('<div class="tiles">' +
    tile('Net SOL', q ? sol(q.net_sol) : '-',
      q ? 'traded + held' : 'no position',
      q ? (q.net_sol >= 0 ? 'pos' : 'neg') : '') +
    tile('Realized SOL', t ? sol(t.realized_sol) : '-',
      t ? t.sells + ' sold, ' + t.buys + ' bought' : 'has not traded',
      t ? (t.realized_sol >= 0 ? 'pos' : 'neg') : '') +
    tile('Portfolio SOL', h && h.priced_capos ? h.portfolio_sol.toFixed(2) : '-',
      h && h.priced_capos ? fmt(h.priced_capos) + ' tradeable' : 'nothing tradeable') +
    tile('Capos held', fmt(r.capos), fmt(r.active) + ' active') +
    tile('Fights won', c ? fmt(c.won) : '-', c ? 'of ' + fmt(c.fights) : 'no combat record') +
    tile('Win rate', c && c.win_rate != null ? c.win_rate + '%' : '-', c ? '' : 'no combat record') +
    tile('Prize winnings', p.prizes ? '$' + fmt(Math.round(p.prizes.total_usd)) : '-',
      p.prizes ? (p.prizes.seasons_won
        ? p.prizes.seasons_won + (p.prizes.seasons_won === 1 ? ' season' : ' seasons') + ' won'
        : 'daily and bounty prizes') : 'no prizes',
      p.prizes ? 'pos' : '') +
    '</div>')

  // Two views over the same player. The roster is thousands of rows for the
  // biggest holders, so it lives behind a tab and loads only when asked for.
  parts.push('<div class="controls" id="ptabs" role="tablist">' +
    '<button type="button" data-tab="profile" aria-selected="true">Money</button>' +
    '<button type="button" data-tab="outfit" aria-selected="false">Crew</button>' +
    '<button type="button" data-tab="prizes" aria-selected="false">Prizes</button>' +
    '<button type="button" data-tab="capos" aria-selected="false">Capos (' +
      fmt(r.capos) + ')</button>' +
    '</div>')

  // The headline number, stated with the thing that would otherwise be read into
  // it. Almost every player prices out positive here purely because packs cost
  // real money that never appears, so the skew is explained where it is shown
  // rather than in a footnote further down the page.
  if (q) {
    // Prize money is shown here rather than only further down because reading the
    // net position alone misleads badly for a prize winner: a player can be a few
    // tenths of a SOL under water on trading while holding thousands of dollars of
    // banked prizes. It is listed as its own line in its own currency and is never
    // added into net_sol. There is no SOL/USD feed anywhere in this data, so the
    // two are stated side by side and the reader does the comparing.
    // Every SOL figure carries its unit for the same reason: with a $ row in the
    // same ledger, a bare number would be the one thing left to misread.
    parts = position
    parts.push('<section><div class="section-head"><h2>Position</h2>' +
      '<span class="section-meta">' +
      (q.prize_usd ? 'SOL position and USD prizes' : 'SOL, secondary market') +
      '</span></div>' +
      rows([
        ['Realized on trades', sol(q.realized_sol)],
        ['Value of capos held', q.portfolio_sol.toFixed(3) + ' SOL'],
        ['Net position', sol(q.net_sol)],
        q.prize_usd ? ['Prize winnings', '$' + fmt(Math.round(q.prize_usd))] : null,
      ]) +
      '</section>')
  }

  // Prize winnings: money actually received, read off chain. Three streams, kept
  // apart because they are different prizes: season league placement, the daily
  // prize, and bounties. SOL bounties get their own line and are never converted
  // into the USD total, because there is no price feed here to convert on.
  if (p.prizes) {
    const pz = p.prizes
    const usd = (n) => '$' + fmt(Math.round(n))
    parts = prizes
    // The total is lifted out of the ledger entirely. Sitting as the first row of
    // a list whose remaining rows are its own components, it read as one item
    // among equals rather than as their sum.
    parts.push('<section><div class="section-head"><h2>Prize winnings</h2>' +
      '<span class="section-meta">received, on chain</span></div>' +
      '<div class="tiles"><div class="tile">' +
        '<span class="tile-label">Total won</span>' +
        '<span class="tile-value pos">' + usd(pz.total_usd) + '</span>' +
      '</div></div>' +
      rows([
        pz.daily_usd ? ['Daily prizes', usd(pz.daily_usd)] : null,
        pz.bounty_usd ? ['Bounties', usd(pz.bounty_usd)] : null,
        pz.sol_bounties ? ['SOL bounties', pz.sol_bounties.toFixed(3) + ' SOL'] : null,
      ].concat((pz.by_season || []).map((s) =>
        ['Season ' + s.season, usd(s.usd)]))) +
      '</section>')
  }

  // Rank ladder. Rank is earned by promotion and is a different axis from rarity,
  // so it gets its own section rather than being folded into the roster.
  if (p.ranks) {
    const rk = p.ranks
    const ladder = [
      ['Boss', rk.boss], ['Underboss', rk.underboss], ['Lieutenant', rk.lieutenant],
      ['Captain', rk.captain], ['Soldier', rk.soldier], ['Recruit', rk.recruit],
    ].filter(([, n]) => n > 0)
    parts = ranks
    parts.push('<section><div class="section-head"><h2>Ranks</h2>' +
      '<span class="section-meta">' + (rk.promoted_7d ? fmt(rk.promoted_7d) + ' promoted this week' : 'no promotions this week') +
      '</span></div>' +
      rows(ladder.map(([l, n]) => [l, fmt(n)])) +
      '</section>')
  }

  parts = roster
  parts.push('<section><div class="section-head"><h2>Roster</h2>' +
    '<span class="section-meta">' + fmt(r.capos) + ' capos</span></div>' +
    rows([
      r.god ? ['God', fmt(r.god)] : null,
      r.legendary ? ['Legendary', fmt(r.legendary)] : null,
      r.founder ? ['Founder', fmt(r.founder)] : null,
      r.epic ? ['Epic', fmt(r.epic)] : null,
      r.rare ? ['Rare', fmt(r.rare)] : null,
      ['Active on hustles', fmt(r.active)],
      ['Minted on chain', fmt(r.minted)],
    ]) + '</section>')

  if (c) {
    parts = combat
    parts.push('<section><div class="section-head"><h2>Combat</h2>' +
      '<span class="section-meta">lifetime</span></div>' +
      rows([
        ['Fights', fmt(c.fights)],
        ['Won', fmt(c.won)],
        ['Win rate', c.win_rate != null ? c.win_rate + '%' : '-'],
        ['Attacks won', fmt(c.attacks_won) + ' of ' + fmt(c.attacks)],
        ['Defences held', fmt(c.defenses_held) + ' of ' + fmt(c.defenses)],
        ['Hold rate', c.hold_rate != null ? c.hold_rate + '%' : '-'],
        ['Distinct opponents', fmt(c.opponents)],
        ['Districts contested', fmt(c.districts)],
        ['First fight', c.first_fight_at ? c.first_fight_at.slice(0, 10) : '-'],
        ['Last fight', c.last_fight_at ? c.last_fight_at.slice(0, 10) : '-'],
      ]) + '</section>')
  }

  if (p.trainer) {
    const tr = p.trainer
    parts = training
    parts.push('<section><div class="section-head"><h2>Training</h2>' +
      '<span class="section-meta">prestige ' + fmt(tr.prestige) + '</span></div>' +
      rows([
        ['Jobs completed', fmt(tr.jobs_completed)],
        ['Jobs settled', fmt(tr.jobs_settled)],
        ['Completion rate', tr.completion_rate + '%'],
        ['On time rate', tr.on_time_rate + '%'],
        ['Average turnaround', tr.turnaround_hours + 'h'],
        tr.rate_sol ? ['Rate', tr.rate_sol.toFixed(4) + ' SOL'] : null,
      ]) + '</section>')
  }

  parts = trading
  parts.push('<section><div class="section-head"><h2>Trading</h2>' +
    '<span class="section-meta">SOL, secondary market</span></div>')
  if (t) {
    parts.push(rows([
      ['Sold', fmt(t.sells) + ' for ' + t.sol_received.toFixed(3) + ' SOL'],
      ['Bought', fmt(t.buys) + ' for ' + t.sol_spent.toFixed(3) + ' SOL'],
      ['Realized', sol(t.realized_sol)],
    ]))
  }
  parts.push('</section>')

  if (h) {
    const M = (DATA.market && DATA.market.capo_medians_sol) || {}
    const order = ['god', 'founder', 'legendary', 'epic', 'rare']
    const held = order.filter((k) => h.by_rarity[k])
    parts = portfolio
    parts.push('<section><div class="section-head"><h2>Portfolio</h2>' +
      '<span class="section-meta">' +
      (h.priced_capos ? h.portfolio_sol.toFixed(2) + ' SOL' : 'nothing tradeable') +
      '</span></div>')
    if (held.length) {
      parts.push(rows(held.map((k) => {
        const b = h.by_rarity[k]
        const at = M[k] && M[k].median_sol != null ? ' at ' + M[k].median_sol + ' each' : ''
        return [k.charAt(0).toUpperCase() + k.slice(1),
          fmt(b.n) + ' ×' + at + ' = ' + b.sol.toFixed(2) + ' SOL']
      })))
    }
    // The untradeable count is the whole story for most players, so it is stated
    // as a fact about the asset rather than buried as a caveat.
    parts.push('</section>')
  }


  // Two blocks that answer halves of one question sit side by side; a pane
  // with only one of them still renders cleanly as a single column.
  const pair = (a, b) => {
    if (!a.length && !b.length) return ''
    // One side missing is common: a player with no trades, or who is not a
    // trainer. Half a duo would leave a column of dead space, so a lone section
    // takes the full width instead.
    if (!a.length) return b.join('')
    if (!b.length) return a.join('')
    return '<div class="duo"><div>' + a.join('') + '</div><div>' + b.join('') + '</div></div>'
  }
  return [
    ...chrome,
    '<div id="tab-profile">', pair(position, trading), ...portfolio, '</div>',
    '<div id="tab-outfit" hidden>', pair(ranks, roster), pair(combat, training), '</div>',
    '<div id="tab-prizes" hidden>', ...prizes, '</div>',
    '<div id="tab-capos" hidden><p class="basis">Loading roster...</p></div>',
  ].join('')
}

/**
 * The player's capos, fetched on demand.
 *
 * NOT included: RACKET collected per capo. The API only ever exposes per-capo
 * earnings through /leaderboards, which is capped at 50 rows and has named 106
 * capos in total, belonging to 17 owners, out of 95,000+ alive. There is no
 * honest earnings column to draw, so the money column here is what the owner has
 * SPENT promoting each capo.
 */
const rosterCache = {}

async function loadRoster(ref) {
  const key = ref.slice(0, 2)
  if (!rosterCache[key]) {
    rosterCache[key] = fetch('/data/rosters/' + key + '.json')
      .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json() })
      .catch((err) => { rosterCache[key] = null; throw err })
  }
  return rosterCache[key]
}

/**
 * The player's capos, sortable.
 *
 * Rarity and rank arrive as indices into the ordered arrays the shard carries,
 * with 0 meaning best, so sorting on the index ascending puts gods and bosses
 * first without needing a lookup table on the client.
 *
 * The RACKET column is gone. It measured spend on the capo rather than anything
 * it earned, and it was not purely promotion either: summed across every living
 * capo it exceeds the economy's promotion sink by about 7%, which points at stat
 * training being folded in. A money column nobody can define precisely is worse
 * than no money column.
 */
const CAPO_SORTS = [
  { key: 1, label: 'Rarity', dir: 1 },
  { key: 2, label: 'Rank', dir: 1 },
  { key: 3, label: 'Age', dir: -1 },
  { key: 0, label: 'Name', dir: 1 },
]
let capoList = []
let capoShard = null
let capoKey = 1
let capoDir = 1

function drawRoster(pane) {
  const RAR = capoShard.rarities, RNK = capoShard.ranks
  const cap = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x)
  const sorted = capoList.slice().sort((a, b) => {
    const x = a[capoKey], y = b[capoKey]
    if (x == null && y == null) return 0
    if (x == null) return 1
    if (y == null) return -1
    // Ties fall back to the canonical best-first order so the list never
    // reshuffles arbitrarily between renders.
    if (x === y) return (a[1] - b[1]) || (a[2] - b[2])
    return (x < y ? -1 : 1) * capoDir
  })
  const arrow = (k) => (k === capoKey ? (capoDir === 1 ? ' \u2191' : ' \u2193') : '')
  const bar = '<div class="controls" id="caposort" role="group" aria-label="Sort the roster">' +
    CAPO_SORTS.map((c) =>
      '<button type="button" data-capo-sort="' + c.key + '" aria-pressed="' +
      (c.key === capoKey) + '">' + c.label + arrow(c.key) + '</button>').join('') + '</div>'
  const head = '<div class="row head"><span></span>' +
    '<span class="sortable" data-capo-sort="0" role="button" tabindex="0">Capo' + arrow(0) + '</span>' +
    '<span class="sortable" data-capo-sort="1" role="button" tabindex="0">Rarity' + arrow(1) + '</span>' +
    '<span class="sortable" data-capo-sort="2" role="button" tabindex="0">Rank' + arrow(2) + '</span>' +
    '<span class="num sortable" data-capo-sort="3" role="button" tabindex="0">Age' + arrow(3) + '</span>' +
    '</div>'
  const rows = sorted.map((c, i) =>
    '<div class="row"><span class="rank">' + (i + 1) + '</span>' +
    '<span class="name">' + esc(c[0]) + (c[5] ? '' : '<br><span class="sub">inactive</span>') + '</span>' +
    '<span class="extra">' +
    '<span><span class="cell-label">Rarity</span>' + cap(RAR[c[1]] || '-') + '</span>' +
    '<span><span class="cell-label">Rank</span>' + cap(RNK[c[2]] || '-') + '</span>' +
    '<span class="num"><span class="cell-label">Age</span>' + (c[3] == null ? '-' : c[3]) + '</span>' +
    '</span></div>').join('')
  pane.innerHTML = bar + '<div class="ledger" data-cols="5">' + head + rows + '</div>'

  pane.querySelectorAll('[data-capo-sort]').forEach((el) => {
    const pick = () => {
      const k = Number(el.dataset.capoSort)
      if (k === capoKey) capoDir = -capoDir
      else {
        capoKey = k
        capoDir = (CAPO_SORTS.find((c) => c.key === k) || { dir: 1 }).dir
      }
      drawRoster(pane)
    }
    el.addEventListener('click', pick)
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick() }
    })
  })
}

function renderRoster(pane, ref) {
  loadRoster(ref).then((shard) => {
    const list = (shard.players || {})[ref] || []
    if (!list.length) { pane.innerHTML = '<p class="basis">No capos on record.</p>'; return }
    capoShard = shard
    capoList = list
    capoKey = 1
    capoDir = 1
    drawRoster(pane)
  }).catch(() => {
    pane.innerHTML = '<p class="basis">Could not load the roster just now.</p>'
  })
}

// The shape of the whole set, stated before the reader starts scrolling it.
// Deliberately not filtered by the search box: these describe the population,
// and recomputing them per keystroke would make them look like search results.
function renderDirTiles() {
  const ps = DATA.players
  const prized = ps.filter((p) => p.prizes).length
  const el = document.getElementById('dirtiles')
  if (!el) return
  el.innerHTML =
    tile('Players tracked', fmt(DATA.player_count), 'with at least one capo') +
    tile('Wallets resolved', fmt(DATA.wallets_resolved), 'linked to an on-chain wallet') +
    tile('With a SOL position', fmt(DATA.position_players),
      fmt(DATA.position_net_positive) + ' of them net positive') +
    tile('Prize winners', fmt(prized), 'have been paid on chain')
}

function renderList(filter) {
  const q = (filter || '').toLowerCase().trim()
  const list = q
    ? DATA.players.filter((p) => (p.name || '').toLowerCase().includes(q))
    : DATA.players
  const shown = list.slice(0, 250)
  document.getElementById('count').textContent =
    list.length + ' player' + (list.length === 1 ? '' : 's') +
    (list.length > shown.length ? ', showing first ' + shown.length : '')
  document.getElementById('list').innerHTML = shown.map((p) =>
    '<button class="pitem" type="button" data-slug="' + esc(p.slug) + '">' +
    '<span class="pname">' + esc(p.name) + '</span>' +
    '<span class="pstats">' +
      '<span>' + fmt(p.roster.capos) + ' capos</span>' +
      (p.combat ? '<span>' + fmt(p.combat.won) + ' won</span>' : '') +
      (p.combat && p.combat.win_rate != null ? '<span>' + p.combat.win_rate + '%</span>' : '') +
      (p.position ? '<span class="' + (p.position.net_sol >= 0 ? 'pos' : 'neg') + '">' +
        sol(p.position.net_sol) + '</span>' : '') +
    '</span></button>').join('')
}

function wireTabs(player) {
  const bar = document.getElementById('ptabs')
  if (!bar) return
  // Driven off the pane ids rather than a hardcoded pair, so adding a tab is a
  // change in one place instead of two that can fall out of step.
  const names = ['profile', 'outfit', 'prizes', 'capos']
  const panes = {}
  names.forEach((n) => { panes[n] = document.getElementById('tab-' + n) })
  let loaded = false
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]')
    if (!btn) return
    const want = btn.dataset.tab
    bar.querySelectorAll('button').forEach((b) =>
      b.setAttribute('aria-selected', String(b.dataset.tab === want)))
    names.forEach((n) => { if (panes[n]) panes[n].hidden = n !== want })
    if (want === 'capos' && !loaded) { loaded = true; renderRoster(panes.capos, player.ref) }
  })
}

function route() {
  const m = location.hash.match(/^#\/p\/(.+)$/)
  const dir = document.getElementById('directory')
  const prof = document.getElementById('profile')
  if (m && bySlug[decodeURIComponent(m[1])]) {
    dir.hidden = true
    prof.hidden = false
    prof.innerHTML = renderProfile(bySlug[decodeURIComponent(m[1])])
    document.getElementById('back').addEventListener('click', () => { location.hash = '' })
    wireTabs(bySlug[decodeURIComponent(m[1])])
    window.scrollTo(0, 0)
  } else {
    prof.hidden = true
    dir.hidden = false
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generated').textContent =
    new Date(DATA.generated_at).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
  renderDirTiles()
  renderList('')
  document.getElementById('q').addEventListener('input', (e) => renderList(e.target.value))
  document.getElementById('list').addEventListener('click', (e) => {
    const b = e.target.closest('.pitem')
    if (b) location.hash = '#/p/' + encodeURIComponent(b.dataset.slug)
  })
  window.addEventListener('hashchange', route)
  route()
})
`

function buildBody(data) {
  return `<div class="wrap">
  <div id="directory">
    <header class="masthead">
      <span class="eyebrow">The Syndicate &middot; kept by the community</span>
      <h1>Players</h1>
      <span class="live">Updated <span id="generated">&hellip;</span></span>
      ${navHtml('/players.html')}
    </header>

    <div class="tiles" id="dirtiles"></div>
    <div class="psearch">
      <label class="psearch-label" for="q">Look up a player</label>
      <input id="q" type="search" placeholder="Type a player name" autocomplete="off"
             aria-label="Look up a player by name">
    </div>
    <span class="count" id="count"></span>
    <div class="plist" id="list"></div>
  </div>

  <div id="profile" hidden></div>

  <footer>

  </footer>
</div>

<script>
const DATA = ${JSON.stringify(data)};
${CLIENT_JS}
</script>
`
}

function main() {
  if (!fs.existsSync(IN)) {
    console.error('no players.json; run `node derive/players.js` first')
    process.exit(1)
  }
  const data = JSON.parse(fs.readFileSync(IN, 'utf8'))
  assignSlugs(data.players)
  writeSearchIndex(data.players)

  const indexable = process.env.SITE_INDEXABLE === '1'
  const robots = indexable ? '' : '\n<meta name="robots" content="noindex, nofollow">'

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">${robots}
${FONTS}
<style>${CSS}${NAV_CSS}${PAGE_CSS}</style>
</head>
<body>
${buildBody(data)}
</body>
</html>
`
  fs.mkdirSync(SITE_DIR, { recursive: true })
  fs.writeFileSync(path.join(SITE_DIR, 'players.html'), doc)
  console.log(
    `built web/dist/site/players.html (${(Buffer.byteLength(doc) / 1024).toFixed(0)} KB, ` +
      `${data.players.length} players, ${indexable ? 'INDEXABLE' : 'noindex'})`,
  )
}

main()
