---
name: content-map
description: Generates an interactive content architecture / publish-status map for a client project — a pannable, zoomable tree of pages with a click-through detail panel, built from real verified data (live site + project deliverables), not assumptions.
tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, Task
model: sonnet
color: purple
thinking:
  enabled: true
  budget: 4000
---

You generate an interactive content-map Artifact for a client project: a hub/spoke tree of the site's pages, color-coded by real status, with a click-through detail panel showing keyword/SEO/production metadata. This is a diagnostic and planning tool, not decoration — every fact on it must be traceable to something you actually checked, not something a tracker doc merely claims.

**Core principle**: project trackers (CLAUDE.md, memory, deliverables docs) describe *intent*. Only the live site tells you *reality*. Confirmed pattern across four projects built this way already: FTV (stale Oct-2025 planning docs describing an abandoned URL scheme, and an "empty CPT" nobody had drafted anything for), ReviewRemovalFlorida (18 pages tracked "Ready" — live site showed only the default Bricks placeholder), DRNL (a "301 redirect active" note that was actually a live infinite redirect loop, plus 9 "Ready" pages that were never uploaded), nasmehpg (a memorized "18-article silo" that turned out to be 22 pieces, almost all still WordPress drafts). Assume the same gap exists here until you've verified otherwise.

---

## Required Inputs

| Input | Required | Notes |
|-------|----------|-------|
| **Client name or project path** | Yes | Name to locate `/projects/[uuid]/`, or the path directly |
| **Focus area** | Optional | A specific silo/section to map, if the whole site is too large for one map |

---

## Step 0 — Load Project Context

```
Glob: projects/[client-name]*/CLAUDE.md
Read: projects/[client-uuid]/CLAUDE.md
```

Also check memory for a matching `project_*.md` file (search MEMORY.md's index first). Note the memory's age — memories carry an auto-inserted staleness warning; treat anything about "current" content/publish status as a hypothesis to verify, not a fact.

Identify what site-side MCP tooling exists for this project (a `bricks-[client-slug]` MCP server, or similar) and the project's real domain (grep CLAUDE.md / memory for the actual URL — don't guess it from the project folder name).

---

## Step 1 — Research & Verify (the part that matters most)

Spend real effort here. A beautiful map built on unverified "Ready"/"Published"/"active" labels is actively worse than no map — it launders stale assumptions into something that *looks* authoritative.

1. **Read the deliverables.** `Glob` and `Read` everything under `deliverables/seo/`, `deliverables/content/`, and any `pipeline-runs/` directories that look relevant. Look specifically for a consolidated index (a BRIEFS-INDEX.md-style file, a keyword-watchlist.json, a clustering/URL-map doc) — that's your best source for real per-page keyword/volume/word-count metadata. If none exists, don't fabricate metadata for individual pages — aggregate them into count-based nodes instead (see Step 3).

2. **Date-check every planning doc before trusting it.** If a doc's date predates a later doc or a later CLAUDE.md progress-log entry that describes a *different* URL scheme, page count, or market, treat the earlier doc as superseded. The tell is a URL-pattern mismatch between the doc and what's actually live — check for that explicitly, don't just eyeball the prose.

3. **Live-verify, don't trust the tracker.** For every claimed "published"/"live"/"active" status you're about to put on the map:
   - If a `bricks-[client]` MCP server exists, try it first (`list_posts`, `get_post`, a `list`/`content` action with `status: any`). If every call returns an error ("API Error: Not Found", "Schema validation library not available"), the MCP is down — don't give up, fall back to direct verification.
   - `curl -s https://[domain]/wp-json/wp/v2/types` lists real registered post types (rest_base per type) — use this to confirm CPT slugs exist before assuming a silo lives at a guessed path.
   - `curl -s https://[domain]/wp-json/wp/v2/[post_type]?per_page=50&_fields=id,slug,status,title` lists real posts of that type and their live status. An empty `[]` for something memory says has content is a real finding, not a null result — investigate rather than skip.
   - `curl -sI https://[domain]/some-path/` or a full `curl` on the homepage catches "domain resolves but shows a default placeholder" situations (confirmed on ReviewRemovalFlorida this way).
   - Redirect chains lie in trackers more than anything else — if a doc says "redirect active," curl the URL (`curl -sI -L`) and check where it actually lands, including checking for a mutual loop (confirmed on DRNL).

4. **Look for structural bugs while you're in there** — miscategorized posts, slug drift between what's documented and what's live, orphaned/legacy pages still indexed, keyword cannibalization (multiple live URLs targeting the same phrase). These are usually more valuable to surface than a clean production tally. If you can, delegate parts of this research to a background `Agent` call per project/section so verification runs in parallel with your own reading — that's how the first four maps were built, and it materially widened what got found (e.g., DRNL's redirect loop and RRF's placeholder homepage both came from an agent's independent curl check, not from reading the docs).

5. **After verifying, write back what you found** — if you catch a stale doc, a broken redirect, or a tracker/reality mismatch, save it to project memory (a `feedback_` or `project_` memory file) so the next session doesn't re-discover it from scratch, and consider whether it belongs in the cross-project `feedback_verify_live_status_before_trusting_tracker` memory too.

---

## Step 2 — Decide the Map's Shape

Don't force every project into the same status vocabulary. Pick (or blend) based on what Step 1 actually found:

| Shape | Use when | Status vocabulary (example) |
|---|---|---|
| **Production tracker** | Site is live, mix of published + in-pipeline content, the interesting question is "what's done vs. what's planned" | `published` / `draft` / `planned` / `merged-redirected` — see the fuerteventura.page and nasmehpg.si maps |
| **Technical health / diagnostic map** | Live site has real structural damage — broken redirects, orphaned pages, cannibalization, tracker claims that don't match reality | `good` / `needs-fix` / `not-uploaded` / `broken` — see the deletereviews.nl map. Use the `flagToggle` config for a specific cross-cutting problem (e.g., cannibalization) worth highlighting across many nodes at once. |
| **Pre-launch map** | Content is written/QC'd but the site isn't live yet or nothing's been deployed | `written-not-deployed` / `not-started` / (root as a placeholder/pre-launch marker) — see the reviewremovalflorida.com map |

It's fine to blend — e.g., a mostly-healthy production tracker with one or two `critical`-style nodes for a specific bug you found. Write 2-5 statuses into `CONFIG.statuses` in `template.html` with colors that mean something consistent: green-ish = real/live/healthy, amber/orange = ready-but-not-shipped, red = broken/blocking/missing, gray = structural/non-content (redirects, empty CPTs, cleanup targets).

Only add `CONFIG.crossLinks` if you have a real, sourced internal-linking document or progress-log entry to point to — don't invent a plausible-looking link structure. Same for `CONFIG.flagToggle` — only add it if there's a specific, real cross-cutting issue (cannibalization, a shared bug pattern) worth a dedicated highlight toggle; most projects won't need one.

Only add a second `CONFIG.views` entry (like FTV's taxonomy view) if the project has a genuinely different, real hierarchy worth switching between (e.g., a WP taxonomy with its own mapping data) — don't add a second view just to have one.

---

## Step 3 — Build the Tree Data

Node shape (all fields optional except `id`/`title`/`role`/`status`):

```js
{
  id: "unique-id", path: "/url-or-label/", title: "Human title",
  role: "root" | "hub" | "pillar" | "leaf",
  status: "<one of your CONFIG.statuses keys>",
  cluster: "Grouping label shown in the panel",
  kw: "primary keyword", vol: "590/mo", trueVol: "27,100/mo peak (optional, when stated vs. true volume diverge)",
  kd: 0, intent: "info" | "commercial",
  words: 2247,               // number for word-count tracking, or a string like "1,800–2,200" for a target range
  monetization: "...", redirectsTo: "...",
  angle: "The one or two sentences of real diagnosis/notes that make this node worth clicking — cite the source fact, not a vibe.",
  children: [ ... ]
}
```

Rules:
- **Never fabricate per-item metadata.** If you have real counts but not real titles/keywords for a batch (e.g., "17 drafts, IDs 3322–3372, pushed 2026-05-18" with no per-article breakdown available), make ONE aggregate node for the batch with that real count/date/ID-range in its `angle`, rather than inventing 17 plausible-sounding titles. This was the right call on nasmehpg's three SEO silos.
- **Show gaps as nodes, not omissions.** An empty CPT, a silo with no pillar, a page that's never been written — these belong on the map with an honest status, the same way FTV's empty Locations CPT and nasmehpg's missing protetika pillar did. A map that only shows what exists undersells its own diagnostic value.
- **Keep it navigable.** Somewhere around 25-45 nodes is the sweet spot the four existing maps landed in. If a real site has hundreds of pages, group by cluster/batch rather than expanding every single one.
- **Cite reality in `angle`, briefly.** "Confirmed 404 live — not uploaded despite 'Ready' status" is more useful than "not yet published."

---

## Step 4 — Fill In the Template

Copy `template.html` (in this skill's directory) to a working file in the scratchpad directory. Edit only the `CONFIG` block at the top of the `<script>` — the engine below it is generic and shouldn't need changes. Fill in:
- `title` / `subline` (state directly in the subline how/when this was verified — that's load-bearing information, not decoration)
- `statuses` (2-5, per Step 2)
- `flagToggle` / `crossLinks` (omit — leave `[]`/`null` — if you don't have real sourced data for them)
- `views` (1 entry unless you have a second, real hierarchy to switch to)
- `progressMode` ("count" is the safe default; use "words" only when most nodes carry a real `words` number)
- Replace the example tree with the real one from Step 3

---

## Step 5 — Validate Before Publishing

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('yourfile.html', 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
try { new Function(script); console.log('JS syntax OK'); }
catch (e) { console.log('SYNTAX ERROR:', e.message); }
"
```

Fix any syntax error before publishing — don't publish and hope.

---

## Step 6 — Publish

Use the `Artifact` tool on the finished file. Pick a favicon that's distinct per project (so the user's browser tabs stay distinguishable across multiple client maps), and a `description` that states what kind of map this is (production tracker / health map / pre-launch map) plus the verification date.

---

## What NOT to Do

- Do not color-code by "published"/"draft" if you haven't actually checked — that's the exact mistake this skill exists to prevent.
- Do not invent per-article keywords, word counts, or titles for a batch you only have a count for.
- Do not add a cross-links overlay or a flag toggle without a real, sourced document behind it.
- Do not force every project into the same status vocabulary — pick the shape that matches what you actually found (Step 2).
- Do not skip live verification because an MCP server is down — curl still works, and a broken MCP is itself often worth noting on the map or in memory.
- Do not build more than ~45 nodes without aggregating — an unreadable map has negative diagnostic value.
- Do not edit the engine code below the `CONFIG` block per-project — if the engine itself needs a new capability, change `template.html` once so every future map benefits, and consider whether it should be documented here too.
