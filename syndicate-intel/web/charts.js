/**
 * Chart primitives, emitted into the page as inline SVG.
 *
 * Hand-rolled rather than a library because a strict CSP blocks every external
 * host, so a charting CDN is not an option and inlining one would dwarf the
 * data. Colors come from CSS custom properties so both themes work without the
 * chart code knowing which is active.
 *
 * Palette provenance: the categorical order below was validated with the
 * dataviz skill's checker against both surfaces. Worst adjacent CVD separation
 * is deltaE 16.0 (deutan) / 15.3 (tritan) and the normal-vision floor is 23.5,
 * all comfortably above thresholds. Assign in fixed order, never cycle.
 */
export const CHART_CSS = String.raw`
:root {
  /* Stepped for the dark surface and validated against it, not flipped from the
     light set. All six checks pass on #0f0d0a: chroma floor, lightness band,
     adjacent CVD separation (worst 8.4 protan), normal-vision floor (19.3) and
     3:1 contrast. The brand gold is deliberately NOT in here: at OKLCH chroma
     0.093 it reads gray as a data fill and fails the floor. Gold carries
     identity in the interface instead, where that floor does not apply. */
  --cat-1: #d95926;  /* orange  */
  --cat-2: #199e70;  /* aqua    */
  --cat-3: #3987e5;  /* blue    */
  --cat-4: #d55181;  /* magenta */
  --cat-5: #c98500;  /* amber   */
  --cat-6: #9085e9;  /* violet  */
  --cat-7: #008300;  /* green   */
  --cat-8: #e66767;  /* red     */
  --grid:  #C9CCBE;
  --axis:  #9AA08C;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --grid: #2C3025; --axis: #4B5140; }
}
:root[data-theme="dark"] { --grid: #2C3025; --axis: #4B5140; }

.chart { position: relative; margin: var(--space-4) 0 0; }
.chart svg { display: block; width: 100%; height: auto; overflow: visible; }
.chart .grid-line { stroke: var(--grid); stroke-width: 1; }
.chart .axis-line { stroke: var(--axis); stroke-width: 1; }
.chart text {
  font-family: var(--mono); font-size: var(--step--2);
  fill: var(--ink-faint); font-variant-numeric: tabular-nums;
}
.chart .axis-label { fill: var(--ink-muted); }
.chart .mark-line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
/* 2px surface ring keeps overlapping marks readable where series cross. */
.chart .dot { stroke: var(--surface); stroke-width: 2; }
.chart .hit { fill: transparent; cursor: crosshair; }
.chart .crosshair { stroke: var(--ink-muted); stroke-width: 1; stroke-dasharray: 2 2; }

.tip {
  position: absolute; pointer-events: none; z-index: 5;
  background: var(--surface); border: 1px solid var(--rule-firm);
  padding: 0.4rem 0.55rem; font-family: var(--mono); font-size: var(--step--2);
  font-variant-numeric: tabular-nums; color: var(--ink);
  box-shadow: 0 2px 8px var(--shadow); white-space: nowrap;
}
.tip-row { display: flex; align-items: center; gap: 0.4rem; }
.tip-key { width: 0.55rem; height: 0.55rem; flex: none; }
.tip-label { color: var(--ink-muted); }

.legend {
  display: flex; flex-wrap: wrap; gap: 0.3rem 0.9rem;
  margin: var(--space-3) 0 0; font-family: var(--mono); font-size: var(--step--2);
  color: var(--ink-muted);
}
.legend-item { display: flex; align-items: center; gap: 0.35rem; }
.legend-key { width: 0.7rem; height: 0.7rem; flex: none; }

.chart-head {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-5);
}
.chart-title { font-weight: 700; font-size: var(--step-0); }
.chart-note { font-size: var(--step--1); color: var(--ink-muted); max-width: 68ch; margin: var(--space-3) 0 0; }
.table-toggle {
  font-family: var(--mono); font-size: var(--step--2); letter-spacing: 0.06em;
  text-transform: uppercase; background: none; border: none;
  color: var(--ink-muted); cursor: pointer; padding: 0.2rem 0;
  border-bottom: 1px solid var(--rule-firm);
}
.table-toggle:hover { color: var(--ink); }
.chart-table { margin-top: var(--space-3); max-height: 24rem; overflow-y: auto; }
`

export const CHART_JS = String.raw`
const CAT = ['var(--cat-1)','var(--cat-2)','var(--cat-3)','var(--cat-4)',
  'var(--cat-5)','var(--cat-6)','var(--cat-7)','var(--cat-8)']
const SVGNS = 'http://www.w3.org/2000/svg'

const el = (n, attrs = {}, parent) => {
  const e = document.createElementNS(SVGNS, n)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  if (parent) parent.appendChild(e)
  return e
}

const nfmt = (n, d = 0) => {
  if (n == null || !isFinite(n)) return '-'
  const a = Math.abs(n)
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (a >= 1e4) return (n / 1e3).toFixed(0) + 'k'
  return n.toLocaleString('en-US', { maximumFractionDigits: d })
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c])

/** Axis ticks on 1/2/5 x 10^n so labels land on readable numbers. */
function niceTicks(min, max, count = 5) {
  if (min === max) { min = Math.min(0, min); max = max || 1 }
  const span = max - min
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const out = []
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10))
  return out
}

function tooltip(container) {
  let node = null
  return {
    show(html, x, y) {
      if (!node) { node = document.createElement('div'); node.className = 'tip'; container.appendChild(node) }
      node.innerHTML = html
      const w = container.clientWidth
      const tw = node.offsetWidth
      node.style.left = Math.max(0, Math.min(w - tw, x - tw / 2)) + 'px'
      node.style.top = Math.max(0, y - node.offsetHeight - 10) + 'px'
      node.style.display = 'block'
    },
    hide() { if (node) node.style.display = 'none' },
  }
}

function frame(container, { height = 220, padL = 46, padR = 12, padT = 10, padB = 24 }) {
  container.innerHTML = ''
  const W = 720, H = height
  const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, container)
  return { svg, W, H, padL, padR, padT, padB, iw: W - padL - padR, ih: H - padT - padB }
}

function legend(container, series) {
  if (series.length < 2) return   // a lone series is named by the title
  const box = document.createElement('div')
  box.className = 'legend'
  box.innerHTML = series.map((s) =>
    '<span class="legend-item"><span class="legend-key" style="background:' + s.color + '"></span>' +
    esc(s.name) + '</span>').join('')
  container.appendChild(box)
}

/**
 * The explainer goes ABOVE the chart, not below it.
 *
 * Read after the fact it is a footnote nobody reaches; read first it tells you
 * what you are about to look at. Inserted at the front of the container rather
 * than reordered in CSS, so the reading order the keyboard and a screen reader
 * follow is the order on screen.
 */
function lede(container, text) {
  const p = document.createElement('p')
  p.className = 'chart-note lede'
  p.textContent = text
  container.insertBefore(p, container.firstChild)
}

/** Every chart ships a table view: identity must never be color-alone. */
function tableView(container, headers, rows) {
  const wrap = document.createElement('div')
  const btn = document.createElement('button')
  btn.type = 'button'; btn.className = 'table-toggle'; btn.textContent = 'Show data table'
  const tbl = document.createElement('div')
  tbl.className = 'chart-table ledger'; tbl.hidden = true
  tbl.innerHTML =
    '<div class="row head" style="grid-template-columns:repeat(' + headers.length + ',1fr)">' +
    headers.map((h) => '<span>' + esc(h) + '</span>').join('') + '</div>' +
    rows.map((r) => '<div class="row" style="grid-template-columns:repeat(' + headers.length + ',1fr)">' +
      r.map((c, i) => '<span class="' + (i ? 'num' : 'name') + '">' + esc(c) + '</span>').join('') +
      '</div>').join('')
  btn.addEventListener('click', () => {
    tbl.hidden = !tbl.hidden
    btn.textContent = tbl.hidden ? 'Show data table' : 'Hide data table'
  })
  wrap.appendChild(btn); wrap.appendChild(tbl)
  container.appendChild(wrap)
}

/* ------------------------------------------------------------------ line --- */
function lineChart(container, opts) {
  const { series, xs, yFormat = nfmt, height = 220, note } = opts
  const f = frame(container, { height })
  const tip = tooltip(container)
  const vals = series.flatMap((s) => s.values.filter((v) => v != null))
  const ymin = Math.min(0, ...vals), ymax = Math.max(...vals)
  const ticks = niceTicks(ymin, ymax)
  const lo = ticks[0], hi = ticks[ticks.length - 1]
  const X = (i) => f.padL + (xs.length === 1 ? f.iw / 2 : (i / (xs.length - 1)) * f.iw)
  const Y = (v) => f.padT + f.ih - ((v - lo) / (hi - lo || 1)) * f.ih

  for (const t of ticks) {
    el('line', { class: 'grid-line', x1: f.padL, x2: f.padL + f.iw, y1: Y(t), y2: Y(t) }, f.svg)
    const lbl = el('text', { x: f.padL - 6, y: Y(t) + 3, 'text-anchor': 'end' }, f.svg)
    lbl.textContent = yFormat(t)
  }
  const step = Math.max(1, Math.ceil(xs.length / 6))
  for (let i = 0; i < xs.length; i += step) {
    const lbl = el('text', { x: X(i), y: f.H - 6, 'text-anchor': 'middle' }, f.svg)
    lbl.textContent = xs[i]
  }

  series.forEach((s, si) => {
    const color = s.color || CAT[si % CAT.length]
    const d = s.values.map((v, i) => (v == null ? null : (i ? 'L' : 'M') + X(i) + ' ' + Y(v)))
      .filter(Boolean).join(' ')
    el('path', { class: 'mark-line', d, stroke: color }, f.svg)
    // Emphasised endpoint, per mark spec.
    const lastIdx = s.values.length - 1
    if (s.values[lastIdx] != null) {
      el('circle', { class: 'dot', cx: X(lastIdx), cy: Y(s.values[lastIdx]), r: 4, fill: color }, f.svg)
    }
  })

  const cross = el('line', { class: 'crosshair', y1: f.padT, y2: f.padT + f.ih, opacity: 0 }, f.svg)
  const hit = el('rect', { class: 'hit', x: f.padL, y: f.padT, width: f.iw, height: f.ih }, f.svg)
  const move = (ev) => {
    const r = f.svg.getBoundingClientRect()
    const px = ((ev.clientX - r.left) / r.width) * f.W
    let i = Math.round(((px - f.padL) / f.iw) * (xs.length - 1))
    i = Math.max(0, Math.min(xs.length - 1, i))
    cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); cross.setAttribute('opacity', 1)
    tip.show(
      '<div class="tip-label">' + esc(xs[i]) + '</div>' +
      series.map((s, si) =>
        '<div class="tip-row"><span class="tip-key" style="background:' +
        (s.color || CAT[si % CAT.length]) + '"></span>' + esc(s.name) + ' ' +
        yFormat(s.values[i]) + '</div>').join(''),
      (X(i) / f.W) * container.clientWidth,
      (Y(Math.max(...series.map((s) => s.values[i] ?? lo))) / f.H) * f.svg.getBoundingClientRect().height,
    )
  }
  hit.addEventListener('pointermove', move)
  hit.addEventListener('pointerleave', () => { cross.setAttribute('opacity', 0); tip.hide() })

  legend(container, series.map((s, i) => ({ name: s.name, color: s.color || CAT[i % CAT.length] })))
  if (note) lede(container, note)
  tableView(container, ['Period', ...series.map((s) => s.name)],
    xs.map((x, i) => [x, ...series.map((s) => yFormat(s.values[i]))]))
}

/* ------------------------------------------------------- diverging bars --- */
/**
 * Two opposed magnitudes around a shared baseline (minted above, burned below).
 * A diverging pair with a neutral baseline, not two arbitrary categorical hues:
 * the polarity is the message.
 */
function divergingBars(container, opts) {
  const { rows, height = 240, note, posLabel = 'Minted', negLabel = 'Burned' } = opts
  const f = frame(container, { height, padB: 26 })
  const tip = tooltip(container)
  const max = Math.max(...rows.map((r) => Math.max(r.pos, r.neg))) || 1
  const mid = f.padT + f.ih / 2
  const half = f.ih / 2
  const bw = Math.max(2, (f.iw / rows.length) - 2)   // 2px surface gap between bars
  const X = (i) => f.padL + (i + 0.5) * (f.iw / rows.length)

  el('line', { class: 'axis-line', x1: f.padL, x2: f.padL + f.iw, y1: mid, y2: mid }, f.svg)
  for (const frac of [0.5, 1]) {
    for (const dir of [-1, 1]) {
      const y = mid - dir * frac * half
      el('line', { class: 'grid-line', x1: f.padL, x2: f.padL + f.iw, y1: y, y2: y }, f.svg)
      const t = el('text', { x: f.padL - 6, y: y + 3, 'text-anchor': 'end' }, f.svg)
      t.textContent = nfmt(max * frac)
    }
  }

  rows.forEach((r, i) => {
    const hp = (r.pos / max) * half, hn = (r.neg / max) * half
    el('rect', { x: X(i) - bw / 2, y: mid - hp, width: bw, height: Math.max(1, hp),
      fill: 'var(--credit)', rx: 2 }, f.svg)
    el('rect', { x: X(i) - bw / 2, y: mid, width: bw, height: Math.max(1, hn),
      fill: 'var(--debit)', rx: 2 }, f.svg)
    const hit = el('rect', { class: 'hit', x: X(i) - (f.iw / rows.length) / 2, y: f.padT,
      width: f.iw / rows.length, height: f.ih }, f.svg)
    hit.addEventListener('pointerenter', () => tip.show(
      '<div class="tip-label">' + esc(r.label) + '</div>' +
      '<div class="tip-row"><span class="tip-key" style="background:var(--credit)"></span>' +
        posLabel + ' ' + nfmt(r.pos) + '</div>' +
      '<div class="tip-row"><span class="tip-key" style="background:var(--debit)"></span>' +
        negLabel + ' ' + nfmt(r.neg) + '</div>' +
      '<div class="tip-row">Net ' + (r.net >= 0 ? '+' : '') + nfmt(r.net) + '</div>',
      (X(i) / f.W) * container.clientWidth, (mid / f.H) * f.svg.getBoundingClientRect().height))
    hit.addEventListener('pointerleave', () => tip.hide())
  })

  const step = Math.max(1, Math.ceil(rows.length / 6))
  for (let i = 0; i < rows.length; i += step) {
    const t = el('text', { x: X(i), y: f.H - 6, 'text-anchor': 'middle' }, f.svg)
    t.textContent = rows[i].label
  }

  legend(container, [{ name: posLabel, color: 'var(--credit)' }, { name: negLabel, color: 'var(--debit)' }])
  if (note) lede(container, note)
  tableView(container, ['Day', posLabel, negLabel, 'Net'],
    rows.map((r) => [r.label, nfmt(r.pos), nfmt(r.neg), (r.net >= 0 ? '+' : '') + nfmt(r.net)]))
}

/* --------------------------------------------------------- net columns --- */
/**
 * One column per period, drawn from a zero baseline: above it for a surplus,
 * below for a deficit.
 *
 * The minted-against-burned pair answered "how much moved" but never "did the
 * economy grow today", which is the question people actually have. Two mirrored
 * bars force the reader to eyeball a difference; this draws the difference
 * itself, and takes half the height doing it.
 */
function netColumns(container, opts) {
  const { rows, height = 150, note, yFormat = nfmt } = opts
  const f = frame(container, { height, padB: 26 })
  const tip = tooltip(container)
  // The zero line sits where the data puts it, not at the halfway mark. Almost
  // every day here is a surplus, and a fixed centre line left the whole lower
  // half of the chart empty while squashing the bars into the top.
  const vals = rows.map((r) => r.value)
  const up = Math.max(0, ...vals)
  const down = Math.abs(Math.min(0, ...vals))
  const span = (up + down) || 1
  const zero = f.padT + f.ih * (up / span)
  const max = span
  const w = f.iw / rows.length
  const bw = Math.max(1, w * 0.72)

  // Marks are appended to f.svg via el()'s parent argument: frame() returns the
  // svg element itself and no group, which is the contract every other chart
  // here already follows.
  const scale = (v) => (Math.abs(v) / span) * f.ih

  // Zero line first, so every bar is read against it rather than the frame edge.
  el('line', { x1: f.padL, x2: f.padL + f.iw, y1: zero, y2: zero, class: 'axis-line' }, f.svg)

  rows.forEach((r, i) => {
    const h = scale(r.value)
    const isUp = r.value >= 0
    const top = isUp ? zero - h : zero
    el('rect', {
      x: f.padL + i * w + (w - bw) / 2,
      y: top,
      width: bw, height: Math.max(1, h),
      fill: isUp ? 'var(--credit)' : 'var(--debit)',
    }, f.svg)

    // A full-height hit target, as every other chart here uses: a one-pixel bar
    // on a flat day is impossible to hover. tip.show takes (html, x, y) and the
    // coordinates are viewBox units, so they scale to rendered pixels.
    const hit = el('rect', { class: 'hit',
      x: f.padL + i * w, y: f.padT, width: w, height: f.ih }, f.svg)
    hit.addEventListener('pointerenter', () => tip.show(
      '<div class="tip-label">' + esc(r.label) + '</div><div>' +
        (r.value >= 0 ? '+' : '') + yFormat(r.value) + '</div>',
      ((f.padL + i * w + w / 2) / f.W) * container.clientWidth,
      (top / f.H) * f.svg.getBoundingClientRect().height))
    hit.addEventListener('pointerleave', () => tip.hide())
  })

  // Only the ends are labelled: one tick per day is unreadable at this width.
  ;[0, rows.length - 1].forEach((i) => {
    if (!rows[i]) return
    el('text', {
      x: f.padL + i * w + w / 2, y: f.padT + f.ih + 18,
      'text-anchor': i === 0 ? 'start' : 'end',
    }, f.svg).textContent = rows[i].label
  })

  if (note) lede(container, note)
  tableView(container, ['Period', 'Net'], rows.map((r) => [r.label, yFormat(r.value)]))
}

/* ---------------------------------------------------------- horizontal --- */
/** Ranked magnitude. One hue: these are the same measure, not categories. */
function hBars(container, opts) {
  // The bare option drops the truncation caption and the data-table toggle.
  // Safe on a single-series chart where every bar is directly labelled with its
  // name and value: identity never rests on colour, so the table adds nothing.
  // NOTE: no backticks in comments here, this whole block lives inside a
  // String.raw template and a backtick would close it.
  const { rows, note, color = 'var(--cat-1)', unit = '', maxBars, bare } = opts
  container.innerHTML = ''
  const max = Math.max(...rows.map((r) => r.value)) || 1
  // Draw bars for a readable top slice; the full list still lives in the data
  // table below. A leaderboard of a few hundred rows is unreadable as bars but
  // legitimate as a scrollable table, so the two are separated deliberately.
  const barRows = maxBars ? rows.slice(0, maxBars) : rows
  const wrap = document.createElement('div')
  wrap.className = 'bars'
  wrap.innerHTML = barRows.map((r) =>
    '<div class="bar-row"><span>' + esc(r.label) + '</span>' +
    '<span class="bar-track"><span class="bar-fill" style="width:' +
      ((r.value / max) * 100).toFixed(1) + '%;background:' + color + ';border-radius:0 2px 2px 0"></span></span>' +
    '<span style="text-align:right">' + nfmt(r.value) + unit + '</span></div>').join('')
  container.appendChild(wrap)
  if (!bare && maxBars && rows.length > maxBars) {
    const more = document.createElement('p')
    more.className = 'chart-note'
    more.textContent = 'Top ' + maxBars + ' shown as bars; all ' + nfmt(rows.length) +
      ' in the table below.'
    container.appendChild(more)
  }
  if (note) lede(container, note)
  if (!bare) tableView(container, ['Item', 'Value'], rows.map((r) => [r.label, nfmt(r.value) + unit]))
}

/* -------------------------------------------------------------- columns --- */
/** Single-measure distribution. One hue, because there is one measure. */
function columns(container, opts) {
  const { rows, height = 200, note, color = 'var(--cat-4)', yFormat = nfmt } = opts
  const f = frame(container, { height, padB: 26 })
  const tip = tooltip(container)
  const max = Math.max(...rows.map((r) => r.value)) || 1
  const ticks = niceTicks(0, max, 4)
  const hi = ticks[ticks.length - 1]
  const bw = Math.max(3, (f.iw / rows.length) - 2)
  const X = (i) => f.padL + (i + 0.5) * (f.iw / rows.length)
  const Y = (v) => f.padT + f.ih - (v / hi) * f.ih

  for (const t of ticks) {
    el('line', { class: 'grid-line', x1: f.padL, x2: f.padL + f.iw, y1: Y(t), y2: Y(t) }, f.svg)
    const lb = el('text', { x: f.padL - 6, y: Y(t) + 3, 'text-anchor': 'end' }, f.svg)
    lb.textContent = yFormat(t)
  }
  rows.forEach((r, i) => {
    const h = f.padT + f.ih - Y(r.value)
    el('rect', { x: X(i) - bw / 2, y: Y(r.value), width: bw, height: Math.max(1, h),
      fill: color, rx: 2 }, f.svg)
    const hit = el('rect', { class: 'hit', x: X(i) - (f.iw / rows.length) / 2, y: f.padT,
      width: f.iw / rows.length, height: f.ih }, f.svg)
    hit.addEventListener('pointerenter', () => tip.show(
      '<div class="tip-label">' + esc(r.label) + '</div><div>' + yFormat(r.value) + '</div>',
      (X(i) / f.W) * container.clientWidth,
      (Y(r.value) / f.H) * f.svg.getBoundingClientRect().height))
    hit.addEventListener('pointerleave', () => tip.hide())
  })
  // Step the labels: a daily series runs to 70+ bars and labelling every one
  // produces an unreadable smear. Every bar still names itself on hover.
  const lstep = Math.max(1, Math.ceil(rows.length / 8))
  rows.forEach((r, i) => {
    if (i % lstep !== 0) return
    const lb = el('text', { x: X(i), y: f.H - 6, 'text-anchor': 'middle' }, f.svg)
    lb.textContent = r.label
  })
  if (note) lede(container, note)
  tableView(container, ['Bucket', 'Value'], rows.map((r) => [r.label, yFormat(r.value)]))
}

const Chart = { lineChart, divergingBars, hBars, columns, nfmt }
`
