/**
 * Shared visual system for every generated page.
 *
 * Ledger stock: the light palette is the complete set; dark redefines only
 * tokens, in both the un-stamped prefers-color-scheme state and the explicitly
 * stamped one, so all three viewer theme states resolve.
 */
/**
 * The site's name, in one place.
 *
 * The subject is the game, The Syndicate; the SITE is Capowatch. Those are
 * different things and the copy keeps them apart: the brand goes in the title
 * and the landing headline, while the eyebrows keep naming the game, because
 * that is what a reader needs to know the page is ABOUT.
 */
export const SITE = 'Capowatch'
export const SITE_URL = 'https://capowatch.com'

/**
 * Social and icon tags, shared by all three builders.
 *
 * og:image must be an absolute URL. Every scraper fetches it from its own
 * servers with no page context, so a relative path silently yields no preview
 * at all, which looks like the tags were never added.
 *
 * The SVG icon is listed first and PNG second: browsers that understand SVG
 * take the crisp one, and the rest fall through to the raster without a
 * separate media query or a .ico file.
 */
export const metaHead = ({ title, description, path = '/' }) => {
  const url = SITE_URL + path
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return `<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#060504">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Capowatch: community-kept data for The Syndicate">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE_URL}/og.png">`
}

/**
 * The three faces the game itself uses. Its display face is proprietary, so
 * Oswald - already part of the game's own stack - carries the headings.
 * display=swap so text paints immediately in the fallback rather than waiting.
 */
export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Oswald:wght@400;500;600&display=swap">`

export const CSS = String.raw`
/* Ledger stock. The light palette is the complete set; dark redefines only
   tokens, in both the un-stamped prefers-color-scheme state and the explicitly
   stamped one, so all three viewer theme states resolve. */
:root {
  /* Ground, paper and gold, taken from the game's own front page so the two
     read as one property. The game is dark only, so dark is the base here and
     light is an explicit opt-in rather than an OS-driven flip. */
  --ground:    #060504;
  --surface:   #0f0d0a;
  --band:      #1a170f;
  --ink:       #e8e1d0;
  --ink-muted: #b6ad97;
  /* The game's faintest paper step is #6d6652, which measures 3.56:1 here and
     fails AA at the label sizes this token is used for. Lifted to 5.31:1. */
  --ink-faint: #8a8269;
  --rule:      #2a251c;
  --rule-firm: #3d3629;
  --accent:        #d2b974;
  --accent-bright: #e4cf8e;
  --accent-deep:   #8f7a3a;
  --debit:     #d97066;
  --credit:    #7fb894;
  --shadow:    rgba(0, 0, 0, 0.55);

  /* One scale, no exceptions. Every font-size on the site resolves to a step:
     the previous sheet carried twenty ad-hoc sizes between 0.66 and 0.85rem
     that no longer had any relationship to each other. */
  --step--2: 0.68rem;
  --step--1: 0.78rem;
  --step-0:  0.90rem;
  --step-1:  1.10rem;
  --step-2:  1.40rem;
  --step-3:  1.90rem;
  --step-4:  2.60rem;

  /* Spacing, from the game's own screen padding and card gap. One scale, used
     for every vertical gap on the site. Before this the gap after a heading
     depended on what happened to follow it: 1rem before a chart, 1.75rem before
     a tile row, 0.25rem before a table. The rhythm now lives in one place. */
  --gap:     16px;
  --pad:     24px;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;    /* heading to its content, and between stacked blocks */
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.5rem;  /* before a new section heading */

  /* The game pairs a condensed face for headings with Inter for text and a
     mono for figures. Its display face is proprietary, so Oswald (already in
     the game's own stack) carries the headings here. */
  --display: Oswald, "Haettenschweiler", "Arial Narrow", system-ui, sans-serif;
  --sans: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
/* Light is deliberately opt-in only: the game has no light mode, and following
   the OS would put half our readers on a palette the game never uses. */
:root[data-theme="light"] {
  --ground:    #E7E8DF;
  --surface:   #F3F4EE;
  --band:      #DCE4D8;
  --ink:       #1A1C16;
  --ink-muted: #585D50;
  --ink-faint: #6C7161;
  --rule:      #BFC3B4;
  --rule-firm: #9AA08C;
  --accent:        #7a6420;
  --accent-bright: #8f7a3a;
  --accent-deep:   #5d4c18;
  --debit:     #8C2F26;
  --credit:    #2E5C43;
  --shadow:    rgba(26, 28, 22, 0.10);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  /* Explicit: the viewer paints its own ground behind the page. */
  background: var(--ground);
  color: var(--ink);
  font-family: var(--sans);
  font-size: var(--step-0);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.wrap {
  max-width: 78rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 5rem;
}

/* ------------------------------------------------------------- masthead --- */
.masthead {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid var(--rule-firm);
}
.eyebrow {
  font-family: var(--mono);
  font-size: var(--step--1);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent-deep);
}
h1 {
  margin: 0;
  font-family: var(--display);
  font-size: var(--step-4);
  line-height: 0.98;
  font-weight: 600;
  /* The game tracks its display face tight and negative; Oswald is already
     condensed, so it wants less of that than their face does. */
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
  text-wrap: balance;
}
.live {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--mono);
  font-size: var(--step--1);
  color: var(--ink-muted);
}
/* Three states, and until now there was only one: the dot was hardcoded to the
   debit red whatever the data was doing, so a site updating perfectly on time
   looked like a site that had fallen over. Green means the last rebuild landed
   when it should have, gold means it is late, red means the fetch actually
   failed. The .stale class existed and had no rule attached to it at all. */
.live::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: var(--credit);
  border-radius: 50%;
}
.live:has(.stale)::before { background: var(--accent); }
.live:has(.failed)::before { background: var(--debit); }
.live .stale { color: var(--accent); }
.live .failed { color: var(--debit); }
/* :has() is the whole mechanism above, so browsers without it would show a
   green dot on a dead feed. This keeps the text colour carrying the state. */
@supports not selector(:has(*)) {
  .live::before { background: var(--ink-faint); }
}

/* ---------------------------------------------------------------- tiles --- */
/* The strip drew its grid lines by letting a --rule coloured background show
   through 1px gaps, which meant any row the tiles did not fill showed that
   colour as a solid dead block. The column count changes continuously with
   viewport width, so no tile count avoids it at every size: six fills a phone
   and a desktop and still leaves a gap at 900px.
   Each tile now draws its own rule as a box-shadow, which takes no layout space
   and blends where tiles meet, so an unfilled cell is simply the page. */
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 1px;
  margin: var(--space-4) 0 0;
  background: transparent;
  border: none;
}
.tiles > * { box-shadow: 0 0 0 1px var(--rule); }
.tile {
  background: var(--surface);
  padding: 0.75rem 0.9rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  /* Grid children default to min-width:auto, which lets a long figure push the
     cell wider than its track instead of wrapping. */
  min-width: 0;
}
.tile-label {
  font-family: var(--mono);
  font-size: var(--step--2);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.tile-value {
  font-family: var(--mono);
  /* Sized to hold a signed SOL figure on one line inside the narrowest tile
     track: at heading size "+34.727 SOL" wrapped, which read as two numbers. */
  font-size: clamp(var(--step-0), 3.6vw, var(--step-1));
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: 1.1;
  overflow-wrap: anywhere;
}
.pos { color: var(--credit); }
.neg { color: var(--debit); }

/* -------------------------------------------------------------- section --- */
section { margin: 0 0 var(--space-7); }
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--rule-firm);
  /* Air above a new heading, a single consistent gap below it. Every block that
     can follow a heading zeroes its own top margin so this is the only rule
     deciding the distance. */
  margin: var(--space-7) 0 var(--space-4);
}
/* A heading that opens a page or a section does not push off the thing above it. */
#main > .section-head:first-child,
section > .section-head:first-child,
.book > .section-head:first-child { margin-top: 0; }
h2 {
  margin: 0;
  font-family: var(--display);
  font-size: var(--step-2);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--accent);
}
.section-meta {
  font-family: var(--mono);
  font-size: var(--step--1);
  color: var(--ink-muted);
}
.book { margin: 0 0 var(--space-7); }
h3 {
  margin: var(--space-6) 0 var(--space-3);
  font-family: var(--display);
  font-size: var(--step-1);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--ink);
}
/* A lede sits between the heading and the thing it introduces, so it carries
   space below rather than above and reads a touch larger than a footnote. */
.lede {
  margin: 0 0 var(--space-4);
  font-size: var(--step-0);
  color: var(--ink-muted);
  max-width: 72ch;
}
.basis {
  margin: var(--space-3) 0 0;
  font-size: var(--step--1);
  color: var(--ink-muted);
  max-width: 68ch;
}

/* ---- the packs calculator ---- */
/* Six tiers, so a fixed three-across grid lands as two clean rows rather than
   the ragged wrap auto-fit would give. */
.packgrid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1px; background: var(--rule); border: 1px solid var(--rule);
}
@media (min-width: 58rem) { .packgrid { grid-template-columns: repeat(3, 1fr); } }
.packcard { background: var(--surface); padding: var(--pad); display: flex; flex-direction: column; gap: var(--space-3); }
.packcard .pname {
  display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3);
  border-bottom: 1px solid var(--rule); padding-bottom: var(--space-2);
}
.packcard .pname b {
  font-family: var(--display); font-size: var(--step-1); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink);
}
.packcard .price { font-family: var(--mono); font-size: var(--step-0); color: var(--accent); text-align: right; }
.packcard .price span { display: block; font-size: var(--step--2); color: var(--ink-faint); }
.packrow { display: flex; justify-content: space-between; gap: var(--space-3); font-family: var(--mono); font-size: var(--step--1); font-variant-numeric: tabular-nums; }
.packrow span:first-child { color: var(--ink-faint); }
/* The number the page exists to compare. It gets the size and the colour; the
   rows above it stay quiet so this is what the eye lands on. */
.packback {
  margin-top: auto; border-top: 1px solid var(--rule); padding-top: var(--space-3);
  display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3);
}
.packback b { font-family: var(--mono); font-size: var(--step-2); font-variant-numeric: tabular-nums; }
.packback .lbl { font-family: var(--mono); font-size: var(--step--2); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); }
.packback .tag { font-family: var(--mono); font-size: var(--step--2); letter-spacing: 0.08em; text-transform: uppercase; }

/* The overview opens with the two things somebody actually arrives to do: look
   up a player, or work out what to spend. Side by side, matching panels. */
.topduo {
  display: grid; grid-template-columns: 1fr; gap: var(--gap);
  margin: var(--space-5) 0 0;
}
@media (min-width: 46rem) { .topduo { grid-template-columns: 1fr 1fr; } }
/* Both panels own their spacing through the grid, so the search panel drops the
   top margin it carries when it stands alone.
   Both children are named explicitly rather than matched with a universal child
   selector: .psearch sets its own margin and is defined ~180 lines further down
   this sheet, so a single-class selector loses the tie on source order and the
   search panel sat lower than its neighbour. */
.topduo > .psearch, .topduo > .toolcard { margin-top: 0; }
.toolcard {
  padding: var(--space-4);
  border: 1px solid var(--accent-deep);
  background: var(--surface);
  display: flex; flex-direction: column; gap: var(--space-4);
  text-decoration: none;
  /* Not stretched. The search panel beside it grows tall the moment results
     open, and a stretching card became a mostly-empty box with its button
     stranded at the bottom of the screen. */
  align-self: start;
}
.toolcard:hover { border-color: var(--accent); }
.toolcard:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* Mirrors .psearch-label exactly, so the two headings sit on one line. */
.toolcard .q {
  font-family: var(--display); font-size: var(--step-1); font-weight: 500;
  letter-spacing: 0.03em; text-transform: uppercase; color: var(--accent);
}
.toolcard .go {
  align-self: flex-start;
  font-family: var(--mono); font-size: var(--step--1); letter-spacing: 0.08em;
  text-transform: uppercase; border: 1px solid var(--rule-firm);
  padding: var(--space-3) var(--space-4); color: var(--accent-bright);
}
.toolcard:hover .go { border-color: var(--accent); }


/* Two text columns and six numbers is wider than any other table here, so it
   gets its own template rather than bending the shared nine-column one. */
@media (min-width: 46rem) {
  .ledger[data-cols="9"] .row {
    grid-template-columns: 2.25rem minmax(6rem, 1fr) 4.5rem 6rem 6rem 5rem 6.5rem 5.5rem 4.5rem;
  }
}
.baskets {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1px; background: var(--rule); border: 1px solid var(--rule);
  margin-top: var(--space-4);
}
.basket { background: var(--surface); padding: var(--pad); display: flex; flex-direction: column; gap: var(--space-3); }
/* The winner is marked with a rail rather than a fill, so the three panels keep
   the same weight and only one edge changes. */
.basket.win { background: var(--band); box-shadow: inset 3px 0 0 var(--accent); }
.basket h3 { margin: 0; font-family: var(--display); font-size: var(--step-1); text-transform: uppercase; letter-spacing: 0.04em; }
.bhead { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); border-bottom: 1px solid var(--rule); padding-bottom: var(--space-2); }
.bcost { font-family: var(--mono); font-size: var(--step--1); color: var(--accent); text-align: right; font-variant-numeric: tabular-nums; }
.bcost .sub { display: block; color: var(--ink-faint); }
.picks { display: grid; gap: 0.2rem; }
.pick { display: grid; grid-template-columns: 1fr 4.4rem; align-items: center; gap: var(--space-3); }
.pick label { font-family: var(--mono); font-size: var(--step--1); color: var(--ink-muted); }
.pick label small { color: var(--ink-faint); }
.pick input {
  background: var(--band); border: 1px solid var(--rule-firm); color: var(--accent);
  font-family: var(--mono); font-size: var(--step-0); padding: 0.25rem 0.5rem;
  width: 100%; text-align: right; font-variant-numeric: tabular-nums;
}
.pick input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.bout { border-top: 1px solid var(--rule); padding-top: var(--space-3); display: grid; gap: var(--space-2); }
.bout .stat { display: flex; justify-content: space-between; gap: var(--space-3); font-family: var(--mono); font-size: var(--step--1); font-variant-numeric: tabular-nums; }
.bout .stat span:first-child { color: var(--ink-faint); }
.bout .stat.big { font-size: var(--step-0); }
.callout { border: 1px solid var(--accent-deep); background: var(--surface); padding: var(--pad); margin-top: var(--space-4); }
.calltitle { font-family: var(--display); font-size: var(--step-2); text-transform: uppercase; color: var(--accent-bright); margin: 0 0 var(--space-2); }
.callout p { margin: 0; color: var(--ink-muted); max-width: 66ch; }

/* Window disclosure: the actual coverage, never the requested period. */
.window-note {
  font-family: var(--mono);
  font-size: var(--step--2);
  color: var(--debit);
  /* A full border and a fill, not a left rule: single-sided borders as accents
     are out across this system. */
  border: 1px solid var(--debit);
  background: var(--surface);
  padding: var(--space-2) var(--space-3);
  margin: var(--space-3) 0 0;
}

/* ---------------------------------------------------------------- ledger --- */
.ledger { border: 1px solid var(--rule); border-top: none; }
.row {
  display: grid;
  gap: 0.15rem 0.75rem;
  padding: 0.55rem 0.75rem;
  border-top: 1px solid var(--rule);
  align-items: baseline;
}
/* Greenbar banding: alternating tint is how ruled ledger paper kept the eye on
   one row across a wide spread. Functional, not decorative. */
.row:nth-child(even) { background: var(--band); }
.row.head {
  background: var(--surface);
  font-family: var(--mono);
  font-size: var(--step--2);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
  border-top: none;
}
.rank {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  color: var(--ink-faint);
  font-size: var(--step--1);
}
.name { font-weight: 600; overflow-wrap: anywhere; }
.sub { color: var(--ink-muted); font-size: var(--step--1); overflow-wrap: anywhere; }
.num {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.row.head .num { text-align: right; }

/* Mobile-first: single column of stacked label/value pairs. Wider viewports
   opt into true ledger columns. */
.row { grid-template-columns: 2rem 1fr auto; }
.ledger[data-rank="none"] .row { grid-template-columns: 1fr auto; }
.ledger[data-rank="none"] .extra { grid-column: 1 / -1; }
.cell-label {
  display: inline;
  font-family: var(--mono);
  font-size: var(--step--2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-right: 0.35rem;
}
.row.head { display: none; }
.extra {
  grid-column: 2 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.9rem;
  font-family: var(--mono);
  font-size: var(--step--2);
  font-variant-numeric: tabular-nums;
  color: var(--ink-muted);
}
@media (min-width: 46rem) {
  .row.head { display: grid; }
  .cell-label { display: none; }
  .extra {
    display: contents;
  }
  .ledger[data-cols="4"] .row { grid-template-columns: 2.25rem minmax(8rem, 1.6fr) minmax(6rem, 1fr) 8rem; }
  .ledger[data-cols="5"] .row { grid-template-columns: 2.25rem minmax(8rem, 1.5fr) minmax(5rem, 1fr) 7rem 7rem; }
  .ledger[data-cols="6"] .row { grid-template-columns: 2.25rem minmax(8rem, 1.4fr) 6rem 6rem 6rem 6rem; }
  /* The trainer roster carries more measures than any other table on the site.
     Mobile still stacks these into labelled pairs, so the extra width is a
     desktop-only affordance, not a horizontal scroll. */
  .ledger[data-cols="7"] .row { grid-template-columns: 2.25rem minmax(7rem, 1.3fr) 5.5rem 5rem 5rem 5rem 5rem; }
  /* Tables with no ordinal column: every template above opens with a 2.25rem
     slot for the rank number, so dropping that cell squeezed the first REAL
     column into 2.25rem and wrapped "Uncommon" down four lines. These start at
     the label instead. */
  .ledger[data-rank="none"][data-cols="2"] .row { grid-template-columns: minmax(8rem, 1fr) 8rem; }
  .ledger[data-rank="none"][data-cols="3"] .row { grid-template-columns: minmax(8rem, 1.5fr) 1fr 1fr; }
  .ledger[data-rank="none"][data-cols="4"] .row { grid-template-columns: minmax(8rem, 1.6fr) 1fr 1fr 1fr; }
  .ledger[data-rank="none"][data-cols="5"] .row { grid-template-columns: minmax(8rem, 1.5fr) 1fr 1fr 1fr 1fr; }
  .ledger[data-rank="none"][data-cols="6"] .row { grid-template-columns: minmax(7rem, 1.4fr) repeat(5, 1fr); }
  .ledger[data-rank="none"][data-cols="7"] .row { grid-template-columns: minmax(7rem, 1.3fr) repeat(6, 1fr); }
  .ledger[data-rank="none"][data-cols="8"] .row { grid-template-columns: minmax(7rem, 1.2fr) repeat(7, minmax(3.5rem, 1fr)); }
  .ledger[data-cols="8"] .row { grid-template-columns: 2.25rem minmax(6rem, 1.2fr) 5rem 4.5rem 5rem 5rem 4.5rem 5rem; }
}

/* ------------------------------------------------------------ psearch --- */
/* The overview is where a player lands, and looking up their own name is the
   most common thing they will do, so the box sits above everything else. */
/* The most common thing a visitor does is look themselves up, so this is built
   as the page's primary action rather than a field they have to hunt for: its
   own panel, a gold rule around it, and an input at heading size. */
.psearch {
  margin: var(--space-5) 0 0;
  padding: var(--space-4);
  border: 1px solid var(--accent-deep);
  background: var(--surface);
}
.psearch-label {
  display: block;
  font-family: var(--display);
  font-size: var(--step-1);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 var(--space-3);
}
.psearch input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--ground);
  color: var(--ink);
  border: 1px solid var(--rule-firm);
  font-family: var(--sans);
  font-size: var(--step-1);
}
.psearch input::placeholder { color: var(--ink-faint); }
/* type="search" ships a native clear button that renders in the UA's own blue.
   It is the one piece of chrome the rest of the palette cannot reach, so it is
   restyled explicitly rather than left as the only blue on the page. */
.psearch input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  height: 0.85em;
  width: 0.85em;
  background: var(--ink-faint);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 3l10 10M13 3L3 13' stroke='black' stroke-width='2' fill='none'/%3E%3C/svg%3E") center / contain no-repeat;
  cursor: pointer;
}
.psearch input::-webkit-search-cancel-button:hover { background: var(--accent); }
.psearch input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
  border-color: var(--accent);
}
.presults { border: 1px solid var(--rule); border-top: none; }
.psearch .presults { margin-top: 0; }
.presults:empty { border: none; }
.presult {
  display: block;
  padding: 0.55rem 0.85rem;
  border-top: 1px solid var(--rule);
  color: var(--ink);
  text-decoration: none;
}
.presult:nth-child(even) { background: var(--band); }
.presult:hover, .presult:focus-visible { background: var(--band); color: var(--accent-bright); }
.psearch-note { color: var(--ink-faint); font-size: var(--step--1); margin: var(--space-2) 0 0; }

/* ---------------------------------------------------------------- guide --- */
/* Name and gloss belong beside each other. The ledger row grid pushes its last
   cell to the right edge, which on a wide page left a chasm between the link
   and the sentence explaining it. */
.guide { border: 1px solid var(--rule); border-top: none; }
.guide-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.1rem 1.25rem;
  padding: 0.6rem 0.75rem;
  border-top: 1px solid var(--rule);
  align-items: baseline;
}
.guide-item:nth-child(even) { background: var(--band); }
.guide-item .what { color: var(--ink-muted); font-size: var(--step--1); }
@media (min-width: 46rem) {
  .guide-item { grid-template-columns: 9rem 1fr; }
}

/* ---------------------------------------------------------------- duo --- */
/* Two blocks that answer halves of one question belong beside each other, not
   stacked a screen apart. Income and spend are the case that prompted it. */
.duo { display: grid; gap: var(--space-4); }
.duo > * { min-width: 0; }
@media (min-width: 52rem) { .duo { grid-template-columns: 1fr 1fr; } }
/* A control that follows a table, e.g. the roster's show-all toggle. The chart
   toggles get their spacing from the chart wrapper; a bare table has none. */
.table-more { margin-top: var(--space-3); }

/* Price ticker. Sits in the masthead's top right, above the nav, and is the one
   number on the site that is not the game's. */
.tick {
  position: absolute; top: 0; right: 0;
  display: inline-flex; align-items: baseline; gap: 0.45rem;
  font-family: var(--mono); font-size: var(--step--1);
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--rule-firm);
}
/* The SOL amount under a converted figure: the number the game charges in. */
.insol { display: block; font-size: var(--step--2); color: var(--ink-faint); }
.tick-label { color: var(--ink-faint); letter-spacing: 0.12em; }
.tick-value { color: var(--ink); font-variant-numeric: tabular-nums; }
.tick-arrow.up { color: var(--credit); }
.tick-arrow.down { color: var(--debit); }
@keyframes tick-up   { from { background: color-mix(in oklab, var(--credit) 28%, transparent); } to { background: transparent; } }
@keyframes tick-down { from { background: color-mix(in oklab, var(--debit) 28%, transparent); } to { background: transparent; } }
.tick.flash-up   { animation: tick-up 1.1s ease-out; }
.tick.flash-down { animation: tick-down 1.1s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .tick.flash-up, .tick.flash-down { animation: none; }
}
/* The masthead becomes the ticker's positioning context. */
.masthead { position: relative; }
@media (max-width: 34rem) {
  /* On a phone the masthead is tall and the top right corner is beside the
     eyebrow, which is where it would collide. Put it under the nav instead. */
  .tick { position: static; align-self: flex-start; margin-top: var(--space-3); }
}

/* A converted figure sits beside its source figure, not in place of it: the SOL
   amount is the fact, the dollar amount is a reading of it at today's rate. */
.approx { color: var(--ink-faint); font-variant-numeric: tabular-nums; }

/* Skip link. Off screen until focused, then anchored top-left. Without it a
   keyboard user tabs through the whole nav on every page before reaching a
   table, which on the tabbed pages is a lot of stops. */
.skip {
  position: absolute; left: -9999px; top: 0; z-index: 20;
  font-family: var(--mono); font-size: var(--step--1);
  padding: 0.7rem 1.1rem;
  background: var(--accent); color: var(--ground); text-decoration: none;
}
.skip:focus { left: 0; }

/* Share row. Quiet by design: it sits at the end of the page for the reader who
   already decided they liked something, not as a banner asking them to. */
.sharebar {
  display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;
  margin-top: var(--space-6);
  font-family: var(--mono); font-size: var(--step--2); letter-spacing: 0.1em;
  text-transform: uppercase;
}
.sharelabel { color: var(--ink-faint); }
.sharelink {
  color: var(--ink-muted); text-decoration: none;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--rule-firm);
}
.sharelink:hover { color: var(--ground); background: var(--accent); border-color: var(--accent); }
.sharelink:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* The one-line answer at the top of the does-it-pay page. */
.answer {
  margin: 0 0 var(--space-3);
  font-family: var(--display); font-weight: 600;
  font-size: var(--step-3); line-height: 1.05; color: var(--accent-bright);
}

/* Referral block. Sits quietly at the end of a page: almost every visitor
   already plays, and pushing a signup pitch above the data would be aimed at
   the wrong ninety-nine percent. */
.joinbox {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-5); flex-wrap: wrap;
  margin-top: var(--space-6);
  padding: var(--space-5);
  border: 1px solid var(--rule-firm);
  background: var(--band, transparent);
}
.joinhead {
  margin: 0; font-family: var(--display); font-weight: 600;
  font-size: var(--step-1); color: var(--ink);
}
.joinsub {
  margin: var(--space-2) 0 0; max-width: 54ch;
  font-size: var(--step--1); color: var(--ink-muted);
}
.joinlink {
  flex: 0 0 auto;
  font-family: var(--mono); font-size: var(--step--1);
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.7rem 1.4rem;
  color: var(--ground); background: var(--accent);
  text-decoration: none; white-space: nowrap;
}
.joinlink:hover { background: var(--accent-bright); }
.joinlink:focus-visible { outline: 2px solid var(--accent-bright); outline-offset: 3px; }

/* One bar, one segment per season.
   Seasons are ordinal, so this is a single hue stepped light to dark, never
   eleven categorical colours implying eleven unrelated things. The gaps are
   the page ground showing through, which is how the tile strips draw their
   rules too, so the segments read as divisions of one quantity. */
.seasonbar {
  display: flex;
  gap: 2px;
  height: 3.25rem;
  margin: var(--space-4) 0 var(--space-3);
  background: var(--ground);
}
.seasonbar > button {
  /* flex is set inline per season; min-width 0 lets a small one shrink instead
     of forcing the row wider than the page */
  min-width: 0;
  border: 0; padding: 0; margin: 0;
  cursor: pointer;
  transition: filter 140ms ease-out;
}
.seasonbar > button:hover,
.seasonbar > button[aria-current="true"] { filter: brightness(1.35); }
.seasonbar > button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.seasonbar-ends {
  display: flex; justify-content: space-between;
  font-family: var(--mono); font-size: var(--step--2);
  letter-spacing: 0.1em; color: var(--ink-faint);
}
.seasontotal { display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }
.seasontotal .big {
  font-family: var(--display); font-weight: 600;
  font-size: var(--step-4); line-height: 1; color: var(--accent-bright);
  /* the digits change every frame while counting; tabular figures stop the
     number jittering wider and narrower as it climbs */
  font-variant-numeric: tabular-nums;
}
.seasontotal .of { font-size: var(--step--1); color: var(--ink-muted); }
/* The caption is the part that moves, so it is sized to be read at a glance
   rather than squinted at. Rendered as separated fields instead of one long
   sentence: the amount is what people are scanning for, and a run of middots
   buries it in the middle of a line. */
.seasonpick {
  display: flex; flex-wrap: wrap; align-items: baseline;
  gap: 0.35rem var(--space-4);
  margin: var(--space-3) 0;
  font-family: var(--mono); font-size: var(--step--1); color: var(--ink-faint);
}
.seasonpick b {
  font-family: var(--display); font-weight: 600; font-size: var(--step-1);
  letter-spacing: 0.01em; color: var(--ink);
}
.seasonpick b.amt { color: var(--accent-bright); font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .seasonbar > button { transition: none; } }

/* Scroll reveal.
   The hidden state only exists on elements JS has marked, so a page whose
   script never runs, or a browser without IntersectionObserver, shows
   everything immediately rather than a blank column.
   .shown clears the transform entirely rather than zeroing it: a lingering
   transform makes the element a containing block, which would reposition the
   absolutely-placed chart tooltips inside it. */
.reveal { opacity: 0; transform: translateY(8px); }
.reveal.shown {
  opacity: 1;
  transform: none;
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal.shown { opacity: 1; transform: none; transition: none; }
}

/* League boards: as many columns as fit, so five leagues land 3+2 on a desktop
   and stack on a phone without a media query per breakpoint. */
.leaguegrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: var(--space-5) var(--space-6);
  margin-top: var(--space-4);
}
.leaguehead {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--space-3); margin: 0 0 var(--space-2);
  border-bottom: 1px solid var(--rule-firm); padding-bottom: 0.35rem;
}
.leaguehead .nm {
  font-family: var(--mono); font-size: var(--step--1); letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent-bright);
}
.leaguehead .sub { font-family: var(--mono); font-size: var(--step--2); color: var(--ink-faint); }

/* Tab bar. Lived in build-players.js until the capos page needed one too. */
/* Tabs, not a button row.
   They previously borrowed .controls, which is what the period selectors and
   the capo sort bar use, so four section switches read as four filter chips at
   0.68rem. Underlined tabs are the one pattern nobody has to decode, and the
   active underline points down at the content it belongs to.

   The bar carries the rule; each tab carries a 2px bottom border pulled down
   1px so the active one sits ON the rule rather than above it. */
.tabbar {
  display: flex;
  gap: var(--space-5);
  margin: var(--space-5) 0;
  border-bottom: 1px solid var(--rule-firm);
  /* Tabs belong on one line. Four of them at this size overflow a narrow
     phone, so the bar scrolls rather than wrapping into a second row that
     stops looking like a tab bar at all. */
  overflow-x: auto;
  scrollbar-width: none;
}
.tabbar::-webkit-scrollbar { display: none; }

.tabbar button {
  flex: 0 0 auto;
  font-family: var(--mono);
  font-size: var(--step-0);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0 0 0.55rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--ink-faint);
  cursor: pointer;
  white-space: nowrap;
}
.tabbar button:hover { color: var(--ink); }
.tabbar button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.tabbar button[aria-selected="true"] {
  color: var(--accent-bright);
  border-bottom-color: var(--accent);
}

.duo-head {
  font-family: var(--mono);
  font-size: var(--step--2);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 var(--space-2);
}

/* -------------------------------------------------------------- shares --- */
/* Share of a whole, as a percentage. The raw RACKET figures ran to ten digits
   and told the reader nothing they could hold in their head; the proportion is
   the entire point of the breakdown. */
.shares { border: 1px solid var(--rule); border-top: none; }
.share {
  display: grid;
  grid-template-columns: minmax(6rem, 1fr) 1fr 2.6rem;
}
/* With the raw count alongside the share. A percentage alone hides how thin the
   tail really is: 0.1% of 96,806 capos is a specific, small number of things. */
.shares[data-counted] .share {
  /* The count column holds a full thousands-separated figure such as 57,846. */
  grid-template-columns: minmax(4.5rem, 1fr) 1fr 4.4rem 3rem;
}
.share-count {
  font-family: var(--mono);
  font-size: var(--step--1);
  font-variant-numeric: tabular-nums;
  text-align: right;
  gap: 0.6rem;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-top: 1px solid var(--rule);
}
.share:nth-child(even) { background: var(--band); }
.share-label {
  font-size: var(--step--1);
  overflow-wrap: anywhere;
}
.share-track { height: 0.55rem; background: var(--band); }
.share:nth-child(even) .share-track { background: var(--ground); }
/* Must be block: a span is inline by default and silently ignores width and
   height, so the fill measured 0x0 and no bar ever drew on any page. The track
   only rendered because it is a grid item, which blockifies it. */
.share-fill { display: block; height: 100%; }
.share-pct {
  font-family: var(--mono);
  font-size: var(--step--1);
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--ink-muted);
}

/* ------------------------------------------------------------- sortable --- */
/* Column headers double as sort controls on wide screens. Below 46rem the head
   row is hidden entirely, which is why a button row exists as well: sorting
   cannot depend on a control that disappears on a phone. */
.sortable { cursor: pointer; }
.sortable:hover { color: var(--accent); }
.sortable:focus-visible {
  outline: 2px solid var(--accent-bright);
  outline-offset: 2px;
}

/* ------------------------------------------------------------- controls --- */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-5) 0 0;
}
.controls button {
  font-family: var(--mono);
  font-size: var(--step--2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.7rem;
  background: var(--surface);
  color: var(--ink-muted);
  border: 1px solid var(--rule-firm);
  cursor: pointer;
}
/* Period buttons use aria-pressed, the profile tabs use aria-selected (the
   correct role for a tablist). Both mean "this one is active", so both get the
   active treatment: styling only one left the tabs looking identical. */
.controls button[aria-pressed="true"],
.controls button[aria-selected="true"] {
  background: var(--ink);
  color: var(--ground);
  border-color: var(--ink);
}
.controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-style: dashed;
}
.period-note { margin: var(--space-3) 0 0; max-width: 60ch; }
.controls button:focus-visible,
/* Links wear the brand gold. There was no rule for them at all, so they fell
   through to the user agent's blue and visited purple - two hues that appear
   nowhere else in the system and read as broken against this ground. Gold
   measures 10.6:1 here, so it carries an underline rather than needing weight. */
a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  text-decoration-color: var(--accent-deep);
}
a:visited { color: var(--accent); }
a:hover {
  color: var(--accent-bright);
  text-decoration-color: var(--accent-bright);
}
a:focus-visible {
  outline: 2px solid var(--accent-bright);
  outline-offset: 2px;
  color: var(--accent-bright);
}

/* --------------------------------------------------------------- absent --- */
.absent { border: 1px solid var(--rule); border-top: none; }
.absent-item { padding: 0.8rem 0.85rem; border-top: 1px solid var(--rule); }
.absent-item:nth-child(even) { background: var(--band); }
.absent-name { font-weight: 700; }
.absent-why { margin: var(--space-2) 0 0; color: var(--ink-muted); font-size: var(--step--1); max-width: 72ch; }
.absent-fix {
  margin: var(--space-2) 0 0;
  font-family: var(--mono);
  font-size: var(--step--2);
  color: var(--credit);
}

/* ------------------------------------------------------------ sparkbars --- */
.bars { display: flex; flex-direction: column; gap: 1px; border: 1px solid var(--rule); }
.bar-row {
  display: grid;
  grid-template-columns: 5.5rem 1fr 7rem;
  gap: 0.6rem;
  align-items: center;
  padding: 0.35rem 0.7rem;
  background: var(--surface);
  font-family: var(--mono);
  font-size: var(--step--1);
  font-variant-numeric: tabular-nums;
}
.bar-track { height: 0.7rem; background: var(--band); position: relative; }
.bar-fill { position: absolute; top: 0; bottom: 0; }
.bar-fill.mint { background: var(--credit); left: 0; }
.bar-fill.burn { background: var(--debit); left: 0; }

footer {
  margin-top: var(--space-7);
  padding-top: 1.25rem;
  border-top: 2px solid var(--rule-firm);
  color: var(--ink-muted);
  font-size: var(--step--1);
}
footer p { max-width: 74ch; }
footer p + p { margin-top: var(--space-3); }
/* The mark sits beside the text on a wide screen and above it on a phone, where
   a 96px image in a flex row leaves the paragraph about twenty characters wide. */
footer { display: flex; gap: var(--space-5); align-items: flex-start; flex-wrap: wrap; }
.footmark { flex: 0 0 auto; width: 96px; height: auto; opacity: 0.9; }
/* PROTOTYPE: masthead logo. Sized to the eyebrow+h1 block so it costs no
   vertical space; if it is taller than that block it pushes the data down. */
.brandrow { display: flex; align-items: center; gap: var(--space-4); }
.brandmark { flex: 0 0 auto; width: 72px; height: auto; }
.brandlink { flex: 0 0 auto; display: block; line-height: 0; }
.brandlink:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
@media (max-width: 34rem) { .brandmark { width: 52px; } }
.foottext { flex: 1 1 22rem; min-width: 0; }
/* The legal line sits under the data notes and reads quieter than them: it is
   there to be found, not to be the first thing anyone reads in a footer. */
.colophon {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--rule);
  font-size: var(--step--2);
  color: var(--ink-faint);
}
.colophon .copy { white-space: nowrap; }
@media (max-width: 34rem) { .footmark { width: 64px; } }
code {
  font-family: var(--mono);
  font-size: var(--step--1);
  background: var(--band);
  padding: 0.1em 0.3em;
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`

/** Cross-page navigation, shared by the boards and players pages. */
export const NAV_CSS = String.raw`
/* Wraps rather than overflowing: six items do not fit one line at 375px. */
.pagenav { display: flex; gap: 0.5rem 1rem; flex-wrap: wrap; }
.pagenav a {
  font-family: var(--mono); font-size: var(--step--1);
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ink-muted); text-decoration: none;
  border-bottom: 1px solid var(--rule-firm); padding-bottom: 2px;
}
.pagenav a:hover { color: var(--accent-bright); border-color: var(--accent-bright); }
.pagenav a { text-decoration: none; }
/* The active item is a <span>, not an <a>, so none of the rules above reach it.
   Giving it only a colour left it in the body font and mixed case while every
   link beside it was uppercase mono: "Boards" sitting among "OVERVIEW MONEY".
   It carries the same typography as its siblings, differing only in colour. */
.pagenav [aria-current="page"] {
  font-family: var(--mono); font-size: var(--step--1);
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--accent);
  border-bottom: 1px solid var(--accent); padding-bottom: 2px;
}
`

/**
 * One navigation for every page.
 *
 * Books and Players were built by different scripts and each had grown its own
 * nav: two links on one, a single back-link on the other, while the rest of the
 * site carried the full set. Same for the masthead stamp, which said "Last
 * posted" on those two and "Updated" everywhere else. Defined once here so a new
 * page can never quietly ship a different one.
 */
// The filename stays money.html while the label reads Economy: renaming the
// file would break the one thing a URL is for. Growth is gone; its supply and
// ownership blocks moved to Capos and its player blocks to Players, which is
// where each of them was always about.
/**
 * The "Updated" stamp, shared by every builder.
 *
 * Relative rather than UTC, because the question a reader actually has is "is
 * this current?", and a UTC clock makes them do timezone arithmetic to answer
 * it. That cost real confusion once: a page four minutes old read as an hour
 * stale to someone on UTC+1 comparing it against their own clock.
 *
 * It also makes a broken pipeline obvious. "Updated 3 hours ago" is alarming
 * on sight in a way that a timestamp never is, so anything older than four
 * missed rebuilds marks itself stale. The exact UTC time stays on hover for
 * when precision matters.
 */
export const STAMP_JS = String.raw`
function relTime(iso) {
  const secs = Math.max(0, (Date.now() - new Date(iso)) / 1000)
  const mins = Math.round(secs / 60)
  if (secs < 45) return 'just now'
  if (mins < 2) return 'a minute ago'
  if (mins < 60) return mins + ' minutes ago'
  const hrs = Math.round(mins / 60)
  if (hrs < 2) return 'an hour ago'
  if (hrs < 24) return hrs + ' hours ago'
  const days = Math.round(hrs / 24)
  return days < 2 ? 'a day ago' : days + ' days ago'
}

// Four missed rebuilds at the ten minute cadence. Past that something is wrong
// rather than merely slow, and the stamp should say so without being asked.
const STALE_AFTER_MS = 45 * 60 * 1000

function paintStamp(iso, ok) {
  const el = document.getElementById('generated')
  if (!el) return
  if (!ok || !iso) {
    el.textContent = 'update failed'
    el.classList.remove('stale')
    el.classList.add('failed')
    return
  }
  el.classList.remove('failed')
  const age = Date.now() - new Date(iso)
  el.textContent = relTime(iso)
  el.title = new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
  el.classList.toggle('stale', age > STALE_AFTER_MS)
}

/**
 * Keep it truthful on a tab left open. Without this a page opened at
 * "just now" still says "just now" an hour later, which is worse than the
 * absolute timestamp it replaced.
 */
function tickStamp(getIso) {
  setInterval(() => paintStamp(getIso(), true), 30000)
}
`

/**
 * The game first, then the money.
 *
 * Trainers and Prizes were pages of two sections each holding a nav slot apiece,
 * while Capos carried ten sections across four unrelated subjects. Trainers
 * joined the capo marketplace under Market, because both answer what someone
 * will pay you; Prizes joined Economy, because both are where value ends up.
 */
/**
 * Site footer, shared by the section pages and the players page. Both shipped an
 * empty <footer> element; only the standalone artifact carried any provenance.
 *
 * The mark is the one place the artwork appears on the site itself. It is small
 * and at the bottom on purpose: the H1 wordmark is the brand up top, and a
 * detailed illustration beside it competes with the type rather than supporting
 * it. width/height are set so the row does not reflow when the image lands.
 */

/**
 * Reveal blocks as they scroll into view.
 *
 * Deliberately small: a 400ms fade and an 8px rise, once per element, never on
 * the way back out. This is a reference archive, and content that keeps moving
 * while you read a table is an irritation rather than a flourish.
 *
 * Not an IntersectionObserver, which was the first attempt and was wrong. An
 * observer only fires when an element crosses the viewport edge, so jumping the
 * scroll past a block never fires for it and it stays invisible forever. Press
 * End, drag the scrollbar, or open a deep link and eight blocks on the wars page
 * were simply gone. A sweep on scroll cannot stand content up late: anything at
 * or above the fold is revealed on the next frame, however you arrived there.
 *
 * Three further refusals. Nothing happens at all under prefers-reduced-motion.
 * Elements are marked from script, so nothing is hidden unless something is
 * guaranteed to unhide it. And a block with no layout box yet, which means it
 * sits in a closed tab panel, is left pending rather than revealed blind, so it
 * still animates when that panel is opened.
 */
export const REVEAL_JS = String.raw`
const REVEAL_ON = !(window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches)

let revealPending = []

function revealSweep() {
  if (!revealPending.length) return
  const fold = window.innerHeight * 0.94
  let i = 0
  revealPending = revealPending.filter((el) => {
    const r = el.getBoundingClientRect()
    // no box yet: in a closed panel, keep it for when that panel opens
    if (!r.height && !r.width) return true
    if (r.top > fold) return true
    // stagger only across what crossed together, so a lone block later on does
    // not sit behind a stale delay
    el.style.transitionDelay = Math.min(i++, 5) * 45 + 'ms'
    el.classList.add('shown')
    return false
  })
}

function revealIn(root) {
  if (!REVEAL_ON) return
  const scope = root || document.getElementById('main')
  if (!scope) return
  const targets = []
  for (const child of scope.children) {
    // a tab panel is a wrapper, not a block: reveal what is inside it so the
    // sections cascade rather than the panel appearing as one slab
    if (child.id && child.id.indexOf('tab-') === 0) targets.push(...child.children)
    else targets.push(child)
  }
  for (const el of targets) {
    if (el.classList.contains('reveal')) continue
    el.classList.add('reveal')
    revealPending.push(el)
  }
  revealSweep()
}

let revealTicking = false
window.addEventListener('scroll', () => {
  if (revealTicking) return
  revealTicking = true
  requestAnimationFrame(() => { revealTicking = false; revealSweep() })
}, { passive: true })
window.addEventListener('resize', revealSweep, { passive: true })
`

/**
 * Referral link to the game, for visitors who do not play it yet.
 *
 * Empty means the block does not render at all, so the site never ships a dead
 * "start here" button pointing nowhere. Put the referral URL here and it
 * appears on the next build.
 *
 * It is marked rel="sponsored nofollow" because it is a paid referral, which is
 * what Google asks for and what keeps the site honest about the arrangement.
 *
 * The copy leads with the $15 pack the visitor receives rather than with the
 * referral, because that is the part that is worth something to the person
 * reading it. The referral is still disclosed in the same breath, in plain
 * words, not buried in the rel attribute.
 */
/**
 * Share links for X, Telegram and WhatsApp.
 *
 * Plain intent URLs, not the platforms' embed scripts. Those scripts load
 * third-party JavaScript on every page and track the reader whether or not they
 * ever click, which is a strange thing to do on a site whose pitch is that you
 * can check everything it says. These are ordinary links: nothing runs until
 * someone chooses to share.
 *
 * The text is the page's own share line and the URL is absolute, because a
 * relative one pasted into Telegram goes nowhere.
 */
export const shareBar = (path, text) => {
  const url = encodeURIComponent(SITE_URL + (path === '/' ? '/' : path))
  const msg = encodeURIComponent(text)
  const links = [
    ['X', 'https://x.com/intent/post?url=' + url + '&text=' + msg],
    ['Telegram', 'https://t.me/share/url?url=' + url + '&text=' + msg],
    // WhatsApp takes one field, so the message carries the URL on its end.
    ['WhatsApp', 'https://wa.me/?text=' + msg + '%20' + url],
  ]
  return `<div class="sharebar">
    <span class="sharelabel">Share this</span>
    ${links.map(([name, href]) =>
      `<a class="sharelink" href="${href}" target="_blank" rel="noopener nofollow">${name}</a>`).join('')}
  </div>`
}

/**
 * SOL price ticker, top right of the masthead on every page.
 *
 * It fetches /data/price.json itself rather than riding on a page's section
 * payload, because the players page embeds its data and never uses that runtime.
 * One small request, shared cache, and a page whose price never arrives simply
 * shows nothing where the ticker would be.
 *
 * Direction comes from the previous reading published beside the current one, so
 * a page knows which way the price moved on first paint rather than only after
 * sitting open long enough to see it change.
 *
 * Every USD figure on the site is derived from this number, so it is exported on
 * window for the page scripts to convert with, and it re-renders them when it
 * moves.
 */
export const PRICE_JS = String.raw`
window.SOL_USD = null

/**
 * A SOL amount, shown in dollars.
 *
 * The dollar figure leads because that is what people asked for, and the SOL
 * amount stays beside it in small type because SOL is what the game actually
 * denominates in: a trainer charges 0.0053 SOL, not $0.46, and a player about to
 * pay one needs the number they will actually be charged.
 *
 * Falls back to plain SOL when no rate has arrived, so a page whose price fetch
 * failed still shows every figure it always did.
 *
 * Everything here is converted at the current rate, including lifetime totals
 * that were transacted at many different rates. That is a deliberate choice and
 * the pages that carry such totals say so.
 */
function solAmount(sol, opts) {
  const o = opts || {}
  const n = Number(sol) || 0
  const dp = Math.abs(n) < 0.01 ? 4 : 3
  const solText = n.toFixed(dp) + ' SOL'
  if (!window.SOL_USD) return solText
  const usd = n * window.SOL_USD
  // Sign outside the symbol. "$-21,884" is not how anyone writes money.
  const neg = usd < 0
  const abs = Math.abs(usd)
  const money = (neg ? '-' : '') + (abs < 10 ? '$' + abs.toFixed(2)
    : '$' + Math.round(abs).toLocaleString('en-US'))
  const signed = o.sign && n > 0 ? '+' + money : money
  return signed + (o.bare ? '' : '<span class="insol">' + solText + '</span>')
}

function paintPrice(next, prev) {
  const el = document.getElementById('solprice')
  if (!el || !next) return
  const dir = prev == null || next === prev ? '' : (next > prev ? 'up' : 'down')
  el.innerHTML = '<span class="tick-label">SOL</span>' +
    '<span class="tick-value">$' + next.toFixed(2) + '</span>' +
    (dir ? '<span class="tick-arrow ' + dir + '">' + (dir === 'up' ? '\u25b2' : '\u25bc') + '</span>' : '')
  el.hidden = false
  if (!dir) return
  // Re-trigger rather than add: a class already present does not restart a CSS
  // animation, so two moves in the same direction would flash only once.
  el.classList.remove('flash-up', 'flash-down')
  void el.offsetWidth
  el.classList.add(dir === 'up' ? 'flash-up' : 'flash-down')
}

async function loadPrice(first) {
  try {
    const res = await fetch('/data/price.json?t=' + Math.floor(Date.now() / 30000), { cache: 'no-store' })
    if (!res.ok) return
    const j = await res.json()
    if (!j.sol_usd) return
    const was = window.SOL_USD
    window.SOL_USD = j.sol_usd.usd
    paintPrice(j.sol_usd.usd, first ? (j.previous && j.previous.usd) : was)
    // Figures elsewhere are quoted from this rate, so they move with it. This
    // fires on the first arrival too, not only on later changes: the page renders
    // before the fetch resolves, so without it every figure would keep the plain
    // SOL fallback it was drawn with and never pick the rate up.
    if (was !== j.sol_usd.usd && typeof window.onSolPrice === 'function') window.onSolPrice()
  } catch { /* no ticker, no dollar figures; the page is still the page */ }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPrice(true)
  setInterval(() => loadPrice(false), 60000)
})
`

export const PRICE_TICKER = '<div class="tick" id="solprice" hidden></div>'

export const REFERRAL_URL = 'https://thesyndicate.games?ref=aaaa'

export const REFERRAL = REFERRAL_URL ? `<div class="joinbox">
    <div>
      <p class="joinhead">Not playing yet? Start with a free $15 pack</p>
      <p class="joinsub">The Syndicate is free to play. Sign up through this link and
        you get a $15 pack once you reach Borough league, the second rung up from
        Street. It is a referral link, so it also pays this site a small amount.</p>
    </div>
    <a class="joinlink" href="${REFERRAL_URL}" target="_blank"
       rel="sponsored nofollow noopener">Start here</a>
  </div>` : ''

export const FOOTER = `<footer>
    <img class="footmark" src="/badge-small.png" width="96" height="83"
         alt="" loading="lazy" decoding="async">
    <div class="foottext">
      <p>
        Built from the public Syndicate data API. Figures the API reports as lifetime
        totals are shown as lifetime totals; anything described as a window is measured
        by differencing our own snapshots, because the API cannot report a time range.
      </p>
      <p>
        RACKET figures are in-game currency. Amounts marked as spent or invested are
        spend, not profit, and no figure here is a profit or loss statement.
      </p>
      <p class="colophon">
        ${SITE} is an unofficial fan project, created and sustained by the community.
        It is not affiliated with, endorsed by, or connected to The Syndicate or its
        developers, and all game names and trademarks belong to their owners.
        <span class="copy">&copy; ${new Date().getUTCFullYear()} ${SITE}</span>
      </p>
    </div>
  </footer>`

export const NAV = [
  { href: '/', label: 'Overview' },
  // Second, because it is the only page read BEFORE money changes hands. The
  // rest explain what already happened.
  { href: '/packs.html', label: 'Packs' },
  { href: '/players.html', label: 'Players' },
  { href: '/wars.html', label: 'Wars' },
  { href: '/capos.html', label: 'Capos' },
  { href: '/market.html', label: 'Market' },
  { href: '/money.html', label: 'Economy' },
  // Last, and named as a question, because it is the one page addressed to
  // someone who does not play rather than to the regulars.
  { href: '/does-it-pay.html', label: 'Does it pay?' },
]

export const navHtml = (current) =>
  '<nav class="pagenav">' +
  NAV.map((n) => n.href === current
    ? '<span aria-current="page">' + n.label + '</span>'
    : '<a href="' + n.href + '">' + n.label + '</a>').join('') +
  '</nav>'
