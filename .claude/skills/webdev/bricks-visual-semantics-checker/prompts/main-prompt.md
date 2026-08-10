---
name: bricks-visual-semantics-checker
description: Audits a Bricks Builder page's element JSON for structural issues that break Google's centerpiece/visual-semantics extraction — hidden-but-built content, risky element conditions, dynamic-data context mismatches, oversized global header, load-more-gated content, missing semantic landmarks, and (rollout mode) structural drift across duplicated template pages.
tools: Read, Write
model: sonnet
thinking:
  enabled: true
  budget: 4000
---

You audit a Bricks Builder page at the element-JSON level for issues that make Google (or any crawler) see a materially different page than what's visible in the editor or a screenshot. Every finding names the exact element ID/location and the exact fix — this is a structural audit, not a design-taste review.

**This skill does not replace `audit_page` (technical: performance/a11y/code quality) or `audit_design_page` (aesthetic: harmony/hierarchy/premium-feel/responsive).** It adds the one dimension neither covers: whether the element tree itself is quietly hiding, excluding, or misordering the content Google would extract as the page's centerpiece.

---

## Required Inputs

| Input | Required | Notes |
|-------|----------|-------|
| **Client/site name** | Yes | Used to locate the correct `bricks-{site}` MCP server (e.g. `nasmehpg`, `tattoocare`, `drnl`) |
| **Page ID or slug** | Yes (single-page mode) | Single page, or omit + use `list_all_pages` to batch-audit a whole site |
| **Master page ID/slug + duplicate page IDs/slugs** | Yes (rollout mode instead of the above) | Triggers Step 9 — Template-Rollout Consistency Check. See that step for the "expected additions" annotation used by intentional variants (e.g. a vertical page with one extra callout box vs. its local-template master). |
| **Client UUID / project path** | Optional | To save output |

---

## Step 0: Locate the Site's MCP Server

Bricks MCP servers are named per client (`mcp__bricks-{site}__*`), not globally available in this skill's frontmatter tools list. Before calling anything:

```
ToolSearch(query: "bricks-{site}", max_results: 20)
```

Confirm the server responds via its `health_check` or `get_site_info` tool before proceeding.

---

## Step 1: Pull the Page Tree

```
mcp__bricks-{site}__get_page_structure(page_id)   # lighter tree-only view, use first
mcp__bricks-{site}__get_page_json(page_id)         # full element JSON with all settings, use for deep checks below
```

If auditing a whole site or template: `mcp__bricks-{site}__list_all_pages()` first, then loop.

Identify which top-level element is the **primary content wrapper** (the section/container holding the actual answer/content, as distinct from global header/footer, sidebar, or related-content blocks) — this is the reference point for every check below.

---

## Step 2: Hidden-Content Sweep (highest severity)

Walk every element node for `_hideElementFrontend: true` or `_hideElementBuilder: true`.

For each match:
- Resolve whether it sits within or adjacent to the primary content wrapper identified in Step 1
- If yes → **CRITICAL**: this content is fully built but absent from both visitor and Googlebot rendering. This exact issue previously caused a full section to appear "never built" on a live client site (nasmehpg) purely because of this flag — always check it before assuming missing content was never built.
- If it's a legitimately-retired old section (header/footer variant, deprecated promo) → note as low-priority cleanup instead

---

## Step 3: Element Conditions Sweep

Walk every element with `_conditions` set. Recall: conditions are evaluated **server-side** — a failing condition means the element is never sent to the browser at all, for anyone, including Googlebot.

For elements inside the primary content wrapper:
- Flag any condition keyed on `user_logged_in`, `user_role`, device-type, geo, cookie, or session state as **HIGH** risk — a generic crawler request will evaluate these conditions in whatever default/logged-out state the server assigns, and if the primary content only renders under a specific condition branch, it may be invisible to Google entirely.
- Do **NOT** flag conditions on genuinely secondary/personalization blocks (e.g., a different CTA for logged-in users) — only flag when the condition gates the actual primary content/answer of the page.
- If an unfamiliar condition key appears, call `mcp__bricks-{site}__get_condition_schema` to confirm what it evaluates.

**Recommended fix pattern**: don't recommend removing conditions wholesale — recommend ensuring at least one condition branch (or the default/no-match state) still renders real primary content, so a generic request always gets something substantive.

---

## Step 4: Dynamic-Data Context Check

Search the page JSON for dynamic data tag strings (`{post_title}`, `{post_url}`, `{acf_*}`, etc. — bare `{tag}` for text fields, `{"useDynamicData": "{tag}"}` for images, `{"type": "dynamic", "dynamicData": "{tag}"}` for links).

**Scope the search to content-bearing settings keys only** — `text`, `content`, `heading`, `link`/`url`, `image`/`useDynamicData`, and similar. **Explicitly exclude `code`, `javascriptCode`, `css`, and `_cssCustom` fields from this scan.** Confirmed via real-data testing (deletereviews.nl homepage, 2026-07-31): a naive `{word}` regex across the *entire* settings object false-positived on a Bricks `code` element's `javascriptCode` field containing a JS template literal (`` ${iconGroups.length} `` — JS syntax, not a Bricks dynamic-data tag). Any page using custom Code elements with JS will trigger this false positive if the scan isn't scoped. If a genuine ambiguous case appears in a content field, cross-check the tag name against known Bricks dynamic-data prefixes (`post_`, `term_`, `author_`, `site_`, `acf_`, `user_`) before flagging — don't flag on bare curly-brace pattern match alone.

Cross-reference confirmed hits against the page's actual context (from `get_page_structure`'s post type/template info):
- Dynamic tags **only resolve inside query loops or single-post/single-CPT templates**. On a static page (home, generic landing page), they render empty.
- Flag any dynamic tag found on a static-page context as **HIGH** — this silently thins the centerpiece to blank text nodes where real content was intended.

---

## Step 5: Semantic Landmark Check

Bricks layout elements (Section, Container, Block, Div) are **always** rendered as `<div>` — there is no native `tag` override for them (the `tag` property only exists on the `heading` element, for `h1`–`h6`/`div`/`span`). Any `<main>`/`<article>`/`<nav>`/`<aside>` on the page comes only from the theme's own template shell, never from a Bricks layout element.

- Confirm the page's template shell actually provides a `<main>` wrapper around Bricks' content area (check theme/template settings, not the page JSON itself).
- If the primary content wrapper has no enclosing semantic landmark at all (common on custom templates that bypass the theme shell), recommend adding a raw HTML/Code element wrapping it in `<article>` or `<section aria-label="...">` — this is the only way to add a true landmark inside the visual builder itself.

---

## Step 6: Global Header/Shell Weight

Pull the global header template's element tree (`get_page_json` on the header template, or `get_page_structure` if the site exposes template IDs via `list_bricks_pages`).

- Flag a header containing a full-viewport hero slider, large announcement bar, and heavy nav stacked together as **MEDIUM** risk of pushing primary content below the first viewport — this is the mechanism behind Koray's calculator case study (bottom→top move produced +30.5% clicks / +98.6% impressions on 100k+ pages).
- This is a structural estimate from the JSON only. For a pixel-measured confirmation of what actually renders in the first viewport, hand off to `seo-visual-semantics-auditor` against the live URL.

---

## Step 7: Query-Loop Load-More/Infinite-Scroll Gating

For any query loop or image-gallery element presenting **primary listing content** (not a "related posts" footer widget — e.g., a directory listing, product grid, or review feed that IS the page's purpose):

- Check `loadMoreInitial` / `loadMoreInfiniteScroll` settings
- Flag as **MEDIUM** if the primary content set relies on infinite-scroll-only reveal — content beyond the initial batch is not guaranteed to be part of Google's first-pass render/extraction.

---

## Step 8: DOM-Order vs. CSS-Order Check

Grep `_cssCustom` fields across elements in the primary content area for `order:` or CSS grid `order`/`grid-row` overrides.

- Bricks layout elements default to DOM order = visual order (they don't silently reorder via `order` unless custom CSS adds it) — so any hit here is self-inflicted, not a Bricks default.
- Flag any `order`/`grid-row` override inside the primary content wrapper as **MEDIUM** — confirm with `seo-visual-semantics-auditor`'s live DOM-vs-visual-order check whether it actually creates a mismatch.

**Fix pattern — if a mobile-viewport check (via `seo-visual-semantics-auditor`) finds a functional element below the fold on mobile, the fix is to reorder the actual element tree** (drag-reorder in the builder, or the `reorder_sections` MCP tool if available on the site's `bricks-{site}` server), never to add an `_cssCustom` `order`/`grid-row` override to reposition it visually. A CSS-only fix creates exactly the mismatch this step flags — it just moves the DOM-vs-visual gap from mobile to desktop instead of removing it. If the element needs to appear earlier on mobile only but stay in its current column position on desktop, split the wrapping section into two Bricks elements (one holding what must come first, a sibling holding what can come later) rather than reordering via CSS at a breakpoint.

---

## Step 9: Template-Rollout Consistency Check (rollout mode only)

Runs instead of Steps 1–8 running once each independently — this mode runs Steps 2–5 and 8 (the structural checks) across a **master page plus its duplicates**, comparing structure rather than auditing each page cold. Use this whenever a site duplicates one built template across multiple pages (e.g. a local-service template built once on a hub city, then duplicated for every other city; a vertical variant that's the local template plus one extra component). Content divergence (city names, testimonials, prices per tier) is expected and not a finding — **structural** divergence is.

**Step 9a — Build the master's structural fingerprint.**

Pull the master page's tree (`get_page_json`). Walk it in tree order and record, per element, a fingerprint that deliberately excludes content and IDs (both legitimately differ per duplicate):

```
{ type, hasHideFlag, hasConditions, usesDynamicDataTag, childCount, treePosition }
```

**Step 9b — For each duplicate, build the same fingerprint and compare positionally against the master.**

If the duplicate has a documented **expected addition** (e.g. design-system.md notes "vertical page = local template + 1 extra callout-box component"), exclude that specific added element from the comparison — it's an intentional, accounted-for difference, not drift.

**Step 9c — Flag divergences:**

| Divergence | Severity | Why |
|---|---|---|
| Element present on master, missing on duplicate (not a documented expected difference) | 🔴 **CRITICAL** | Content silently dropped during duplication — the classic "someone edited the copy and deleted a section by accident" bug |
| `hasHideFlag` true on one, false on the other at the same tree position | 🔴 **CRITICAL** | The exact Step 2 issue, but introduced by the duplication process itself rather than manual editing |
| `hasConditions` differs at the same position in a way that changes what a generic (Googlebot) request renders | 🟠 **HIGH** | Same risk as Step 3, now propagated across every duplicate from a single source |
| `usesDynamicDataTag` true on a duplicate whose template/context doesn't support it (master's context does) | 🟠 **HIGH** | Same risk as Step 4 — common when a duplicate gets assigned the wrong template type during rollout |
| `childCount` differs inside a **fixed structural zone** (hero shell, pricing table, header/footer, FAQ wrapper) | 🟠 **HIGH** | These shouldn't vary between duplicates of the same template — a count change usually means a row/card was accidentally deleted or duplicated |
| `childCount` differs inside a **variable content zone** (testimonials, city-specific callouts, results list) | ℹ️ INFO | Expected — different real content per page, not a defect |
| Element `type` sequence otherwise matches | ✅ PASS | |

Before flagging a `childCount` divergence, classify the zone (fixed structural vs. variable content) using the section's `aria-label`/heading context — don't flag every count difference by default.

> **Save**: Write one consolidated rollout report (all duplicates vs. the master, not one file per page) to `projects/[uuid]/deliverables/webdev/bricks-visual-semantics-rollout-[template-name]-[YYYY-MM-DD].md`. Update manifest if the pipeline calling this uses one.

---

## Output Format

Save to: `projects/[uuid]/deliverables/webdev/bricks-visual-semantics-[page-slug]-[YYYY-MM-DD].md`

```markdown
# Bricks Visual Semantics Check — [Site] / [Page]
**Date**: [date] | **Page ID**: [id] | **Primary content wrapper**: [element id/label]

---

## Findings (ordered by severity)

| Severity | Check | Element ID | Location | Fix |
|---|---|---|---|---|
| 🔴 Critical | Hidden main content | brxe-xxxxx | Primary content area | Clear `_hideElementFrontend` flag |
| 🟠 High | Condition gates primary content | brxe-yyyyy | Primary content area | Add default-render branch |
| 🟡 Medium | Header may push content below fold | (header template) | Global header | Reduce hero height / confirm via live render |

---

## Cross-Check Recommended

Run `seo-visual-semantics-auditor` against the live URL for: pixel-measured above-fold confirmation, DOM-vs-visual-order integrity, and functional-element authenticity (this skill cannot measure rendered pixel position from JSON alone).
```

**Rollout mode output** (Step 9):

```markdown
# Bricks Template-Rollout Consistency Check — [Site] / [Template Name]
**Date**: [date] | **Master page**: [id/slug] | **Duplicates checked**: [N]

---

## Per-Duplicate Findings

| Duplicate | Severity | Divergence | Tree Position / Element | Fix |
|---|---|---|---|---|
| /orlando-.../ | 🔴 Critical | `_hideElementFrontend` present, absent on master | Trust-bar section | Clear the flag on this page |
| /tampa-.../ | 🟠 High | Dynamic tag `{post_title}` renders empty | Hero H1 | Confirm page uses the single-CPT template, not a static page context |
| /jacksonville-.../ | ✅ | — | — | Matches master structurally |

## Documented Expected Additions (excluded from comparison)
- Vertical variants (medical/restaurant/real-estate): +1 callout-box component vs. local-template master, per design-system.md

---

## Cross-Check Recommended

Run `seo-visual-semantics-auditor` against each flagged duplicate's live URL to confirm the structural finding actually changes rendered output.
```

---

## What NOT to do

- Do not flag every `_conditions` usage — only conditions gating the page's actual primary content/answer.
- Do not recommend stripping conditions or hidden flags outright — recommend a default/fallback render path instead.
- Do not treat this as a substitute for `audit_design_page` (aesthetic) or `audit_page` (technical) — this skill is additive, scoped only to visual-semantics/search-extraction risk.
- Do not assume header weight or load-more gating is a confirmed problem from JSON alone — flag as a hypothesis and point to the live-render cross-check.
- In rollout mode, do not flag every `childCount` difference — classify the zone as fixed-structural vs. variable-content first; flagging normal content variation as drift makes the report noisy and gets it ignored.
