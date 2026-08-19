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
.live::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: var(--debit);
  border-radius: 50%;
}

/* ---------------------------------------------------------------- tiles --- */
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 1px;
  margin: var(--space-4) 0 0;
  background: var(--rule);
  border: 1px solid var(--rule);
}
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
export const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/players.html', label: 'Players' },
  { href: '/money.html', label: 'Economy' },
  { href: '/wars.html', label: 'Wars' },
  { href: '/capos.html', label: 'Capos' },
  { href: '/trainers.html', label: 'Trainers' },
  { href: '/prizes.html', label: 'Prizes' },
]

export const navHtml = (current) =>
  '<nav class="pagenav">' +
  NAV.map((n) => n.href === current
    ? '<span aria-current="page">' + n.label + '</span>'
    : '<a href="' + n.href + '">' + n.label + '</a>').join('') +
  '</nav>'
