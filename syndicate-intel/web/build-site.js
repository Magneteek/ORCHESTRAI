#!/usr/bin/env node
/**
 * Generate the public site as a single self-contained HTML file.
 *
 * Board data is inlined at build time rather than fetched, so the output works
 * from a file:// URL, from any static host, and inside a sandboxed viewer with
 * no network access. Regenerate whenever the boards change.
 *
 * Usage: node web/build-site.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSS, NAV_CSS, FONTS, navHtml, SITE } from './style.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BOARDS_DIR = path.join(ROOT, 'data', 'boards')
const OUT_DIR = path.join(__dirname, 'dist')
const OUT_FILE = path.join(OUT_DIR, 'index.html')   // artifact fragment
const SITE_DIR = path.join(OUT_DIR, 'site')         // deployable document

const PERIODS = ['24h', '7d', '30d', 'all']

function loadBoards() {
  const out = {}
  for (const p of PERIODS) {
    const f = path.join(BOARDS_DIR, `boards-${p}.json`)
    if (fs.existsSync(f)) out[p] = JSON.parse(fs.readFileSync(f, 'utf8'))
  }
  if (Object.keys(out).length === 0) {
    throw new Error('no boards found; run `bash derive/refresh.sh` first')
  }
  return out
}


const CLIENT_JS = String.raw`
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('en-US'))

/**
 * Tiles are read at a glance, and RACKET totals run to ten digits, which
 * overflow the cell on a phone. Abbreviate the headline figure and keep the
 * exact number in the note beneath, so nothing is actually hidden.
 */
const abbr = (n) => {
  if (n == null) return '-'
  const v = Number(n)
  const sign = v < 0 ? '-' : ''
  const a = Math.abs(v)
  if (a >= 1e9) return sign + (a / 1e9).toFixed(2) + 'B'
  if (a >= 1e6) return sign + (a / 1e6).toFixed(1) + 'M'
  if (a >= 1e4) return sign + (a / 1e3).toFixed(1) + 'k'
  return fmt(v)
}
const esc = (s) =>
  String(s ?? '-').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

let period = '7d'

// A window is only meaningful once the archive is deep enough to fill it. Every
// window here is measured by differencing our own snapshots, so before we have
// 7 days of history the 7d, 30d and all-time boards are byte-for-byte the same
// data. Rather than offer selectors that silently do nothing, the unfillable
// ones are disabled with the reason shown, and they light up as history grows.
const NOMINAL_HOURS = { '24h': 24, '7d': 168, '30d': 720, all: 0 }

function archiveDepthHours() {
  const w = (DATA.all || DATA[Object.keys(DATA)[0]])?.capo?.top_earners_period?.actual_window
  if (!w) return 0
  if (w.hours != null) return w.hours
  return w.from && w.to ? (new Date(w.to) - new Date(w.from)) / 3.6e6 : 0
}

// 'all' is always valid; any bounded window needs at least its own span of
// recorded history, otherwise it just repeats the all-time board.
const periodUnlocked = (p) => p === 'all' || archiveDepthHours() >= NOMINAL_HOURS[p]

function fmtDepth(hours) {
  if (hours >= 48) return (hours / 24).toFixed(1) + ' days'
  return Math.round(hours) + 'h'
}

function ledger(rows, cols) {
  if (!rows || rows.length === 0) return '<p class="basis">No rows yet.</p>'
  const head =
    '<div class="row head"><span></span>' +
    cols.map((c) => '<span class="' + (c.num ? 'num' : '') + '">' + esc(c.label) + '</span>').join('') +
    '</div>'
  const body = rows
    .map((r, i) => {
      const first = cols[0]
      const rest = cols.slice(1)
      return (
        '<div class="row">' +
        '<span class="rank">' + (i + 1) + '</span>' +
        '<span class="name">' + esc(first.get(r)) +
          (first.sub ? '<br><span class="sub">' + esc(first.sub(r)) + '</span>' : '') +
        '</span>' +
        '<span class="extra">' +
          rest.map((c) =>
            '<span class="' + (c.num ? 'num' : '') + '">' +
            '<span class="cell-label">' + esc(c.label) + '</span>' +
            esc(c.get(r)) + '</span>').join('') +
        '</span>' +
        '</div>'
      )
    })
    .join('')
  return '<div class="ledger" data-cols="' + (cols.length + 1) + '">' + head + body + '</div>'
}

function windowNote(board) {
  if (!board) return ''
  if (board.unavailable) return '<div class="window-note">Not yet: ' + esc(board.unavailable) + '</div>'
  if (!board.actual_window) return ''
  const w = board.actual_window
  const asked = board.requested_period
  const short = w.hours != null && asked !== 'all'
  return (
    '<div class="window-note">Covers ' +
    (w.hours != null ? w.hours + 'h' : esc(w.from) + ' to ' + esc(w.to)) +
    ' of collected history' +
    (short ? ', not the full ' + esc(asked) + '. This board only counts what we have recorded ourselves.' : '.') +
    '</div>'
  )
}

function render() {
  const d = DATA[period]
  const root = document.getElementById('boards')
  if (!d) { root.innerHTML = '<p class="basis">No data for this period.</p>'; return }

  const capo = d.capo, acct = d.account
  const parts = []

  // ---- capos
  parts.push('<section><div class="section-head"><h2>The capos</h2>' +
    '<span class="section-meta">per capo</span></div>')

  parts.push('<div class="book"><h3>Top earners, lifetime</h3>' +
    '<p class="basis">' + esc(capo.top_earners_lifetime.caveat || '') + '</p>' +
    ledger(capo.top_earners_lifetime.rows, [
      { label: 'Capo', get: (r) => r.capo_name, sub: (r) => r.owner_display_name },
      { label: 'Rank', get: (r) => r.tier },
      { label: 'RACKET earned', get: (r) => fmt(r.value), num: true },
    ]) + '</div>')

  parts.push('<div class="book"><h3>Top earners, this window</h3>' +
    '<p class="basis">' + esc(capo.top_earners_period.basis || '') + '</p>' +
    windowNote(capo.top_earners_period) +
    ledger(capo.top_earners_period.rows, [
      { label: 'Capo', get: (r) => r.capo_name, sub: (r) => r.owner_display_name },
      { label: 'Rank', get: (r) => r.tier },
      { label: 'RACKET gained', get: (r) => fmt(r.gained), num: true },
    ]) + '</div>')

  // Movement, not standing. The API only ever reports where a capo sits today,
  // so a climb is something only an archive can see. Climbers and fallers are
  // kept as two lists rather than one signed column, because "who is coming up"
  // and "who is sliding" are two different questions a reader has.
  const movement = (title, board) => {
    if (!board) return
    if (board.unavailable) {
      parts.push('<div class="book"><h3>' + title + '</h3>' +
        '<div class="window-note">Not yet: ' + esc(board.unavailable) + '</div></div>')
      return
    }
    const cols = (verb) => [
      { label: 'Capo', get: (r) => r.capo_name, sub: (r) => r.owner_display_name },
      { label: 'Was', get: (r) => '#' + r.was, num: true },
      { label: 'Now', get: (r) => '#' + r.rank, num: true },
      { label: verb, get: (r) => (r.moved > 0 ? '+' : '') + r.moved, num: true },
    ]
    parts.push('<div class="book"><h3>' + title + '</h3>' +
      '<p class="basis">' + esc(board.basis || '') + '. ' + esc(board.caveat || '') + '</p>' +
      '<h4>Climbing</h4>' + ledger(board.climbers, cols('Places up')) +
      '<h4>Sliding</h4>' + ledger(board.fallers, cols('Places down')) +
      '<p class="basis">' + fmt(board.unchanged) + ' capos held the same position across ' +
      'this window.</p></div>')
  }
  movement('Earnings board: who moved', capo.earners_movement)
  movement('Victories board: who moved', capo.fighters_movement)

  parts.push('<div class="book"><h3>Top fighters, lifetime net victories</h3>' +
    ledger(capo.top_fighters_lifetime.rows, [
      { label: 'Capo', get: (r) => r.capo_name, sub: (r) => r.owner_display_name },
      { label: 'Rank', get: (r) => r.tier },
      { label: 'Net victories', get: (r) => fmt(r.value), num: true },
    ]) + '</div></section>')

  // ---- accounts
  const c = acct.combat
  parts.push('<section><div class="section-head"><h2>The outfits</h2>' +
    '<span class="section-meta">per account &middot; ' + fmt(c.population) + ' players</span></div>')

  parts.push('<div class="book"><h3>Most fights won</h3>' +
    '<p class="basis">Full player population, not a truncated top list.</p>' +
    ledger(c.most_wins_lifetime, [
      { label: 'Player', get: (r) => r.display_name },
      { label: 'Won', get: (r) => fmt(r.fights_won), num: true },
      { label: 'Fought', get: (r) => fmt(r.fights_total), num: true },
      { label: 'Win %', get: (r) => r.win_rate_pct, num: true },
    ]) + '</div>')

  parts.push('<div class="book"><h3>Best win rate</h3>' +
    '<p class="basis">Minimum ' + fmt(c.best_win_rate.min_fights) +
    ' fights, so a three-fight record cannot top the board.</p>' +
    ledger(c.best_win_rate.rows, [
      { label: 'Player', get: (r) => r.display_name },
      { label: 'Win %', get: (r) => r.win_rate_pct, num: true },
      { label: 'Won', get: (r) => fmt(r.fights_won), num: true },
      { label: 'Fought', get: (r) => fmt(r.fights_total), num: true },
    ]) + '</div>')

  parts.push('<div class="book"><h3>Best defence</h3>' +
    '<p class="basis">Districts held against attack. Minimum ' +
    fmt(c.best_defence.min_defenses) + ' defences.</p>' +
    ledger(c.best_defence.rows, [
      { label: 'Player', get: (r) => r.display_name },
      { label: 'Hold %', get: (r) => r.hold_rate_pct, num: true },
      { label: 'Held', get: (r) => fmt(r.defenses_held), num: true },
      { label: 'Defended', get: (r) => fmt(r.defenses_total), num: true },
    ]) + '</div>')

  const t = acct.trainers
  parts.push('<div class="book"><h3>Trainers by jobs completed</h3>' +
    '<p class="basis">' + esc(t.caveat || '') + '</p>' +
    ledger(t.most_jobs_completed, [
      { label: 'Trainer', get: (r) => r.trainer_display_name },
      { label: 'Done', get: (r) => fmt(r.trainer_jobs_completed), num: true },
      { label: 'Complete %', get: (r) => r.trainer_completion_rate, num: true },
      { label: 'On time %', get: (r) => r.trainer_on_time_rate, num: true },
      { label: 'Turnaround', get: (r) => r.trainer_avg_turnaround_hours + 'h', num: true },
    ]) + '</div>')

  parts.push('<div class="book"><h3>Most reliable trainers</h3>' +
    '<p class="basis">Minimum ' + fmt(t.most_reliable.min_jobs_settled) +
    ' settled jobs, ranked on completion then punctuality then speed.</p>' +
    ledger(t.most_reliable.rows, [
      { label: 'Trainer', get: (r) => r.trainer_display_name },
      { label: 'Complete %', get: (r) => r.trainer_completion_rate, num: true },
      { label: 'On time %', get: (r) => r.trainer_on_time_rate, num: true },
      { label: 'Turnaround', get: (r) => r.trainer_avg_turnaround_hours + 'h', num: true },
    ]) + '</div>')

  const col = acct.collectors
  parts.push('<div class="book"><h3>Largest rosters</h3>' +
    '<p class="basis">' + esc(col.note) + '</p>' +
    ledger(col.largest_rosters, [
      { label: 'Player', get: (r) => r.display_name },
      { label: 'Capos', get: (r) => fmt(r.capos), num: true },
      { label: 'Top rarity', get: (r) => fmt(r.top_rarity), num: true },
      { label: 'RACKET spent', get: (r) => fmt(r.racket_invested), num: true },
    ]) + '</div>')

  parts.push('<div class="book"><h3>Rarest rosters</h3>' +
    ledger(col.rarest_rosters, [
      { label: 'Player', get: (r) => r.display_name },
      { label: 'God', get: (r) => fmt(r.god), num: true },
      { label: 'Legendary', get: (r) => fmt(r.legendary), num: true },
      { label: 'Founder', get: (r) => fmt(r.founder), num: true },
      { label: 'Capos', get: (r) => fmt(r.capos), num: true },
    ]) + '</div></section>')

  // ---- economy
  const e = d.economy
  const days = (e.recent_days || []).slice().reverse()
  const peak = Math.max(1, ...days.map((x) => Math.max(x.minted || 0, x.burned || 0)))
  parts.push('<section><div class="section-head"><h2>The take</h2>' +
    '<span class="section-meta">RACKET minted against burned</span></div>' +
    '<p class="basis">Green is minted into the economy, red is burned out of it. ' +
    'When red runs longer than green, the economy shrank that day.</p><div class="bars">' +
    days.map((x) => (
      '<div class="bar-row"><span>' + esc(x.day.slice(5)) + '</span>' +
      '<span class="bar-track">' +
        '<span class="bar-fill mint" style="width:' + ((x.minted / peak) * 100).toFixed(1) + '%;height:50%"></span>' +
        '<span class="bar-fill burn" style="width:' + ((x.burned / peak) * 100).toFixed(1) + '%;top:50%;height:50%"></span>' +
      '</span>' +
      '<span class="' + (x.net >= 0 ? 'pos' : 'neg') + '" style="text-align:right">' +
        (x.net >= 0 ? '+' : '') + fmt(x.net) + '</span></div>'
    )).join('') + '</div>')

  parts.push('<h3>Where RACKET goes</h3>' +
    '<p class="basis">The largest sinks pulling currency out of circulation, lifetime.</p>' +
    ledger((e.largest_sinks || []).map((s) => ({ ...s, abs: Math.abs(s.total) })), [
      { label: 'Sink', get: (r) => r.type.replace(/_/g, ' ') },
      { label: 'RACKET burned', get: (r) => fmt(Math.abs(r.total)), num: true },
    ]) + '</section>')

  // ---- absent
  parts.push('<section><div class="section-head"><h2>Not in these books</h2>' +
    '<span class="section-meta">and exactly why</span></div>' +
    '<p class="basis">These are the boards people ask for that cannot honestly be ' +
    'built from the public API today. Listing them beats quietly leaving them out.</p>' +
    '<div class="absent">' +
    d.unavailable.map((u) =>
      '<div class="absent-item"><div class="absent-name">' + esc(u.board) + '</div>' +
      '<p class="absent-why">' + esc(u.reason) + '</p>' +
      '<p class="absent-fix">Unblocked by: ' + esc(u.unblocks) + '</p></div>').join('') +
    '</div>')

  const ex = col.excluded_accounts || []
  if (ex.length) {
    parts.push('<h3>Accounts left out of the outfit boards</h3>' +
      '<div class="absent">' +
      ex.map((h) =>
        '<div class="absent-item"><div class="absent-name">' + esc(h.display_name) + '</div>' +
        '<p class="absent-why">' + esc(h.evidence) + '</p></div>').join('') +
      '</div>')
  }
  parts.push('</section>')

  root.innerHTML = parts.join('')
}

function renderTiles() {
  const d = DATA[period]
  const t = d.economy.totals || {}
  const days = d.economy.recent_days || []
  const latest = days[0] || {}
  const el = document.getElementById('tiles')
  const tile = (label, value, note, cls) =>
    '<div class="tile"><span class="tile-label">' + esc(label) + '</span>' +
    '<span class="tile-value ' + (cls || '') + '">' + esc(value) + '</span>' +
    '</div>'

  const signed = (n) => (n >= 0 ? '+' : '') + abbr(n)

  el.innerHTML =
    tile('RACKET in circulation', abbr(t.total_racket_supply),
      fmt(t.total_racket_supply) + ' across ' + fmt(t.wallet_count) + ' wallets') +
    tile('Net yesterday', signed(latest.net),
      (latest.net >= 0 ? '+' : '') + fmt(latest.net) + (latest.day ? ' on ' + latest.day : ''),
      latest.net >= 0 ? 'pos' : 'neg') +
    tile('Lifetime earned', abbr(t.lifetime_earned_racket),
      fmt(t.lifetime_earned_racket) + ' by all players') +
    tile('Lifetime spent', abbr(t.lifetime_spent_racket),
      fmt(t.lifetime_spent_racket) + ' burned back out') +
    tile('Players with a fight record', fmt(d.account.combat.population), 'full population') +
    tile('Owners holding capos', fmt(d.account.collectors.population), 'excludes the treasury')
}

document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('periods')
  const depth = archiveDepthHours()

  // Start on the longest window the archive can actually distinguish, so the
  // first thing shown is a live selector rather than a locked one.
  if (!periodUnlocked(period)) {
    const usable = Object.keys(DATA).filter(periodUnlocked)
    period = usable.includes('24h') ? '24h' : (usable[usable.length - 1] || 'all')
  }

  bar.innerHTML = Object.keys(DATA)
    .map((p) => {
      const locked = !periodUnlocked(p)
      const label = p === 'all' ? 'All time' : p
      const title = locked
        ? 'Needs ' + (NOMINAL_HOURS[p] / 24) + ' days of recorded history; the archive holds ' +
          fmtDepth(depth) + ' so far, so this would show the same as All time.'
        : ''
      return '<button type="button" data-p="' + p + '"' +
        (locked ? ' disabled title="' + esc(title) + '"' : '') +
        ' aria-pressed="' + (p === period) + '">' + label + '</button>'
    })
    .join('')

  bar.addEventListener('click', (ev) => {
    const b = ev.target.closest('button')
    if (!b || b.disabled) return
    period = b.dataset.p
    bar.querySelectorAll('button').forEach((x) =>
      x.setAttribute('aria-pressed', String(x.dataset.p === period)))
    renderTiles()
    render()
  })

  // One honest line about why the longer windows may be dark, updated live as
  // the archive deepens and they unlock on their own.
  const note = document.getElementById('period-note')
  if (note) {
    const locked = Object.keys(DATA).filter((p) => !periodUnlocked(p))
    note.textContent = locked.length
      ? 'Windows are measured by differencing our own snapshots, so each one needs that much ' +
        'recorded history to mean anything. The archive holds about ' + fmtDepth(depth) +
        ' so far, so ' + locked.join(', ') + ' would repeat the all-time board and are disabled ' +
        'until we have logged enough. They unlock on their own as history builds.'
      : ''
  }

  const gen = DATA[period].generated_at
  document.getElementById('generated').textContent =
    new Date(gen).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
  renderTiles()
  render()
})
`

const TITLE = 'Boards · ' + SITE
const DESCRIPTION =
  'Community-kept earnings, combat and economy ledgers for The Syndicate.'

/**
 * `nav` is off for the artifact fragment: the artifact is published as a single
 * page, so a link to players.html there would be a dead end.
 */
function buildBody(boards, { nav = false } = {}) {
  return `<div class="wrap">
  <header class="masthead">
    <span class="eyebrow">The Syndicate &middot; kept by the community</span>
    <h1>The second set of books</h1>
    <span class="live">Updated <span id="generated">&hellip;</span></span>
    ${nav ? navHtml('/books.html') : ''}
  </header>

  <div class="tiles" id="tiles"></div>

  <div class="controls" id="periods" role="group" aria-label="Reporting window"></div>
  <p class="basis period-note" id="period-note"></p>

  <div id="boards"></div>

  <footer>
    <p>
      Built from the public Syndicate data API. Figures the API reports as lifetime
      totals are shown as lifetime totals; anything described as a window is measured
      by differencing our own snapshots, because the API cannot report a time range.
      Where our recorded history is shorter than the window you picked, the board says
      so rather than quietly showing you less than you asked for.
    </p>
    <p>
      RACKET figures are in-game currency. Amounts marked as spent or invested are
      spend, not profit, and no figure on this page is a profit or loss statement.
    </p>
  </footer>
</div>

<script>
const DATA = ${JSON.stringify(boards)};
${CLIENT_JS}
</script>
`
}

/**
 * Artifact variant: a fragment. The Artifact publisher supplies its own
 * doctype, html, head and body, so emitting our own would nest documents.
 */
function buildFragment(boards) {
  return `<title>${TITLE}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${DESCRIPTION}">
${FONTS}
<style>${CSS}${NAV_CSS}</style>

${buildBody(boards)}`
}

/**
 * Deploy variant: a complete standards-mode document. Without a doctype a
 * browser falls back to quirks mode, where legacy box-model and table-cell
 * rules can silently alter the layout. Fine for the Artifact wrapper, not for
 * a page served directly.
 */
function buildDocument(boards, { indexable }) {
  const robots = indexable
    ? ''
    : '\n<meta name="robots" content="noindex, nofollow">'
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">${robots}
${FONTS}
<!-- NAV_CSS belongs here too: this is the page that actually RENDERS a nav
     (nav: true below), while the artifact fragment carries the styles and no
     nav. Without it the links fell back to browser defaults and ran together
     as one unspaced mixed-case string. -->
<style>${CSS}${NAV_CSS}</style>
</head>
<body>
${buildBody(boards, { nav: true })}
</body>
</html>
`
}

function main() {
  const boards = loadBoards()
  // Safe by default: the page is only indexable when explicitly opted in, so
  // forgetting the flag can never accidentally expose it to search engines.
  const indexable = process.env.SITE_INDEXABLE === '1'

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const fragment = buildFragment(boards)
  fs.writeFileSync(OUT_FILE, fragment)

  // The boards page is retired: its earnings and rank-movement boards moved to
  // the capos page, and everything else on it duplicated money, wars, trainers
  // or growth. buildDocument is left in place so it can be brought back cheaply.
  fs.mkdirSync(SITE_DIR, { recursive: true })
  fs.writeFileSync(
    path.join(SITE_DIR, 'robots.txt'),
    indexable ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n',
  )

  const kb = (n) => (Buffer.byteLength(n) / 1024).toFixed(0)
  console.log(
    `built ${path.relative(ROOT, OUT_FILE)} (${kb(fragment)} KB, artifact fragment)`,
  )
}

main()
