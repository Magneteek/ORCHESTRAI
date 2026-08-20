#!/usr/bin/env node
/**
 * Rebuild the site's social card, touch icon and logo cut-out from the artwork.
 *
 * This is a one-off dev tool, deliberately NOT part of derive/refresh.sh. It is
 * the only thing in the repo that needs a dependency (playwright, resolved from
 * the parent workspace) and a network connection for Google Fonts, and the site
 * build must stay dependency-free. The outputs are committed; run this only when
 * the artwork or the card design changes.
 *
 *   node tools/make-assets.js
 *
 * The source is a screenshot of the artwork on textured cream paper, not an
 * original with transparency, so the cut-out is recovered rather than given:
 *
 *   1. Flood fill the paper inward from the border. Only bright pixels reachable
 *      from the edge are removed, which is what protects the pale watch face: it
 *      is walled in by the dark watch case and never reached.
 *   2. Keep the largest connected blob. The tops of the CAPOWATCH letters poke
 *      into the bottom of the crop as their own islands; the badge is one mass.
 *
 * The badge's lower arc is genuinely absent from the source, painted over by the
 * wordmark, so the cut-out has a flat base. The card hides it by bleeding the
 * mark off the bottom edge. An original PNG with alpha would remove the need for
 * all of this.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ASSETS = path.join(ROOT, 'web', 'assets')
const SRC = path.join(ASSETS, 'source', 'capowatch-artwork.jpg')

const require_ = createRequire(import.meta.url)
let chromium
try {
  ({ chromium } = require_('playwright'))
} catch {
  console.error('playwright not resolvable. This tool is not part of the build; ' +
    'run it from a checkout where playwright is installed.')
  process.exit(1)
}

// Chrome proper, because the playwright-managed headless shell is not installed.
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site', f)))
const nfmt = (n) => Number(n).toLocaleString('en-US')

const FACTS = () => {
  const capos = read('capos.json').total
  const fights = read('wars.json').odds.fights.n
  const players = read('players-index.json').players.length
  return { capos, fights, players }
}

async function main() {
  if (!fs.existsSync(SRC)) throw new Error('artwork missing: ' + SRC)
  const browser = await chromium.launch({ executablePath: CHROME })

  /* ---------------------------------------------------- 1. the cut-out --- */
  const page = await browser.newPage()
  await page.setContent('<img id="i" src="data:image/jpeg;base64,' +
    fs.readFileSync(SRC).toString('base64') + '">')
  await page.waitForFunction(() => document.getElementById('i').complete)
  const cut = await page.evaluate(() => {
    const img = document.getElementById('i')
    // TOP clears nothing above the hat; BOT stops just above the wordmark.
    const W = img.naturalWidth, TOP = 88, BOT = 919, H = BOT - TOP
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const x = c.getContext('2d'); x.drawImage(img, 0, TOP, W, H, 0, 0, W, H)
    const im = x.getImageData(0, 0, W, H), d = im.data
    const luma = (n) => (d[n*4] + d[n*4+1] + d[n*4+2]) / 3

    const bg = new Uint8Array(W * H), st = []
    const push = (px, py) => {
      if (px < 0 || py < 0 || px >= W || py >= H) return
      const n = py * W + px
      if (bg[n] || luma(n) < 200) return
      bg[n] = 1; st.push(n)
    }
    for (let px = 0; px < W; px++) { push(px, 0); push(px, H - 1) }
    for (let py = 0; py < H; py++) { push(0, py); push(W - 1, py) }
    while (st.length) {
      const n = st.pop(), px = n % W, py = (n - px) / W
      push(px+1,py); push(px-1,py); push(px,py+1); push(px,py-1)
    }

    const lab = new Int32Array(W * H).fill(-1)
    let best = -1, bestN = 0, id = 0
    for (let s = 0; s < W * H; s++) {
      if (bg[s] || lab[s] !== -1) continue
      let n = 0; const q = [s]; lab[s] = id
      while (q.length) {
        const p = q.pop(); n++
        const px = p % W, py = (p - px) / W
        for (const [ax, ay] of [[px+1,py],[px-1,py],[px,py+1],[px,py-1]]) {
          if (ax < 0 || ay < 0 || ax >= W || ay >= H) continue
          const m = ay * W + ax
          if (bg[m] || lab[m] !== -1) continue
          lab[m] = id; q.push(m)
        }
      }
      if (n > bestN) { bestN = n; best = id }
      id++
    }
    for (let n = 0; n < W * H; n++) {
      const i = n * 4
      if (bg[n] || lab[n] !== best) { d[i+3] = 0; continue }
      const L = luma(n)
      d[i+3] = L <= 205 ? 255 : L >= 236 ? 40 : Math.round(255 - (L - 205) * 7)
    }
    x.putImageData(im, 0, 0)
    let x0 = W, y0 = H, x1 = 0, y1 = 0
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++)
      if (d[(py*W+px)*4+3] > 10) { if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py }
    const w = x1 - x0 + 1, h = y1 - y0 + 1
    const t = document.createElement('canvas'); t.width = w; t.height = h
    t.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h)
    return { data: t.toDataURL('image/png'), w, h }
  })
  await page.close()
  const badgePng = Buffer.from(cut.data.split(',')[1], 'base64')
  // Into source/, not assets/. Everything directly in assets/ is copied to the
  // site root by the build, and the full-resolution cut-out is an intermediate
  // that no page links: it was shipping 1.4MB to the site for nothing.
  fs.mkdirSync(path.join(ASSETS, 'source'), { recursive: true })
  fs.writeFileSync(path.join(ASSETS, 'source', 'badge-full.png'), badgePng)
  console.log(`  source/badge-full.png ${cut.w}x${cut.h}  ${(badgePng.length/1024).toFixed(0)} KB  (not published)`)
  const badge64 = badgePng.toString('base64')

  const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' +
    'family=IBM+Plex+Mono:wght@400;500&family=Oswald:wght@400;500;600&display=swap">'

  /* ------------------------------------------------- 2. the social card --- */
  const f = FACTS()
  const card = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await card.setContent(`<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>
  :root { --ground:#060504; --ink:#e8e1d0; --ink-muted:#b6ad97; --ink-faint:#8a8269;
          --rule:#2a251c; --accent:#d2b974; }
  * { box-sizing: border-box; }
  body { margin:0; width:1200px; height:630px; background:var(--ground);
         font-family:"IBM Plex Mono",monospace; overflow:hidden; position:relative; }
  .frame { position:absolute; inset:40px; border:1px solid var(--rule); }
  .col { position:absolute; left:104px; top:100px; width:560px; }
  /* nowrap: the column is narrower than the eyebrow wants, and letting it wrap
     put "COMMUNITY" on its own line above the wordmark. */
  .eyebrow { font-size:17px; letter-spacing:.18em; text-transform:uppercase;
             color:var(--ink-faint); margin:0 0 26px; white-space:nowrap; }
  .mark { font-family:Oswald,sans-serif; font-weight:600; font-size:84px;
          line-height:.95; letter-spacing:.01em; margin:0; color:var(--ink); }
  .mark b { color:var(--accent); font-weight:600; }
  .tag { font-size:25px; color:var(--ink-muted); margin:20px 0 0; }
  .rule { border-top:1px solid var(--rule); margin:46px 0 24px; }
  .stats { display:flex; gap:44px; }
  .n { font-family:Oswald,sans-serif; font-weight:600; font-size:40px;
       color:var(--accent); line-height:1; }
  .l { font-size:14px; letter-spacing:.16em; text-transform:uppercase;
       color:var(--ink-faint); margin-top:9px; }
  /* The cut-out has a flat base where the wordmark painted over the badge's
     lower arc. Bleeding it past the bottom edge turns that into a crop. */
  .badge { position:absolute; right:44px; bottom:-72px; height:430px; }
  .url { position:absolute; left:104px; bottom:74px; font-size:17px;
         letter-spacing:.16em; color:var(--ink-faint); }
</style></head><body>
  <div class="frame"></div>
  <img class="badge" src="data:image/png;base64,${badge64}">
  <div class="col">
    <p class="eyebrow">The Syndicate &middot; kept by the community</p>
    <p class="mark">CAPO<b>WATCH</b></p>
    <p class="tag">The second set of books.</p>
    <div class="rule"></div>
    <div class="stats">
      <div><div class="n">${nfmt(f.capos)}</div><div class="l">Capos tracked</div></div>
      <div><div class="n">${nfmt(f.fights)}</div><div class="l">Fights analysed</div></div>
      <div><div class="n">${nfmt(f.players)}</div><div class="l">Players</div></div>
    </div>
  </div>
  <div class="url">CAPOWATCH.COM</div>
</body></html>`)
  await card.evaluate(() => document.fonts.ready)
  await card.waitForTimeout(600)
  await card.screenshot({ path: path.join(ASSETS, 'og.png') })
  await card.close()
  console.log(`  og.png               1200x630  ${(fs.statSync(path.join(ASSETS,'og.png')).size/1024).toFixed(0)} KB` +
    `   (${nfmt(f.capos)} capos, ${nfmt(f.fights)} fights, ${nfmt(f.players)} players)`)

  /* -------------------------------------------------- 3. the touch icon --- */
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } })
  await icon.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin:0; width:180px; height:180px; background:#060504;
           display:grid; place-items:center; overflow:hidden; }
    img { width:172px; }
  </style></head><body><img src="data:image/png;base64,${badge64}"></body></html>`)
  await icon.waitForTimeout(400)
  await icon.screenshot({ path: path.join(ASSETS, 'apple-touch-icon.png') })
  await icon.close()
  console.log(`  apple-touch-icon.png 180x180   ${(fs.statSync(path.join(ASSETS,'apple-touch-icon.png')).size/1024).toFixed(0)} KB`)

  /* --------------------------------------------- 4. the footer mark --- */
  // A small copy for the site footer. The full cut-out is 1.4MB, which is not a
  // thing to put on every page for a 96px mark; this is 2x that display size.
  const small = await browser.newPage({ viewport: { width: 192, height: 165 } })
  await small.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin:0; width:192px; height:165px; overflow:hidden; }
    img { width:192px; display:block; }
  </style></head><body><img src="data:image/png;base64,${badge64}"></body></html>`)
  await small.waitForTimeout(300)
  await small.screenshot({ path: path.join(ASSETS, 'badge-small.png'), omitBackground: true })
  await small.close()
  console.log(`  badge-small.png      192x165   ${(fs.statSync(path.join(ASSETS,'badge-small.png')).size/1024).toFixed(0)} KB`)

  // favicon.svg and favicon-32.png are deliberately left alone. A man, a hat and
  // a pocket watch at 16px is mud; the stroked gold C survives that size.
  console.log('  favicon.svg / favicon-32.png  left as they are (too small for the badge)')

  await browser.close()
}

main()
