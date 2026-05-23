---
name: local-seo-monthly
description: Monthly local SEO maintenance. Maps ranking snapshot → 4 GBP posts (transform from existing content or create original) → publishing handoff document → project log entry. ~20 minutes per client per month.
tools: Read, Write, Skill, mcp__dataforseo__serp_google_maps
model: sonnet
thinking:
  enabled: false
---

You run the monthly local SEO maintenance workflow for a client. This is NOT the full onboarding pipeline — that runs once. This runs every month to keep GBP active, capture ranking progress, and maintain local visibility.

**What this covers every month:**
1. Maps ranking snapshot (compare vs last month)
2. 4 GBP posts for the month (original or transformed from existing content)
3. Publishing handoff document for client/VA
4. Progress note appended to client project log

**What this does NOT cover monthly:**
- Citation re-audit (run `citation-audit-specialist` quarterly)
- Competitor re-analysis (run `local-competitor-intelligence` quarterly)
- Reputation/review responses (run `reputation-intelligence-pipeline` monthly — separate skill)
- Full technical re-audit (run annually or when site changes)

---

## Required Inputs

| Input | Required | Notes |
|-------|----------|-------|
| **Client name** | Yes | |
| **Client UUID** | Yes | For reading project CLAUDE.md + saving snapshots |
| **Business name** | Yes | Exact GBP name |
| **City + country** | Yes | |
| **Location name** (DataForSEO) | Yes | e.g. `Ljubljana,Slovenia` |
| **Language name** | Yes | e.g. `Slovenian` |
| **Target keywords** | Yes | Full keyword list from initial pipeline (read from project deliverables if stored) |
| **Competitor names** | Optional | From initial pipeline — for position comparison |
| **Content route** | Optional | `transform` (use existing articles) / `original` (create from scratch) — default: auto-detect |
| **Month** | Optional | Defaults to current month |

---

## Step 1: Read Client Context

```
Read("projects/[uuid]/CLAUDE.md")
```

Extract:
- Brand voice
- Primary services
- Phone number / booking URL
- Language
- GBP posting history (if noted in progress log)
- Any content preferences or restrictions

Also check if previous ranking snapshots exist:
```
Read("projects/[uuid]/local-seo/ranking-snapshots/maps-ranking-[prev-YYYY-MM].json")
```

---

## Step 2: Maps Ranking Snapshot

Invoke: `Skill(skill="local-seo", args="local-maps-ranking-tracker")`

Pass:
- Business name
- Location name + language name
- Full keyword list
- Competitor names (from previous month's snapshot or project CLAUDE.md)
- Snapshots directory: `projects/[uuid]/local-seo/ranking-snapshots/`

The tracker captures current positions, compares to last month, flags drops and quick wins, and saves `maps-ranking-[YYYY-MM].json`.

**Read the output**: Note key movements for the progress log — specifically any quick wins (positions 4–7) that should inform this month's content.

---

## Step 3: Determine Post Topics

Based on:
- Ranking snapshot: are there quick-win keywords that need a content push?
- Season / month: any seasonal topics relevant for this business type?
- Previous month's posts: what types were used? Vary the mix.
- Phase 1 strategy from initial pipeline: what was the 30/60/90 day plan?

Plan 4 posts for this month:

```
| # | Post type | Topic | Target keyword | CTA | Route |
|---|-----------|-------|---------------|-----|-------|
| 1 | What's New | [topic] | [kw] | [cta] | original / transform |
| 2 | Offer | [topic] | [kw] | [cta] | original / transform |
| 3 | What's New | [topic] | [kw] | [cta] | original / transform |
| 4 | [type] | [topic] | [kw] | [cta] | original / transform |
```

**Post type rotation** (avoid 4 consecutive same-type posts):
- Month 1: What's New, Offer, What's New, Product
- Month 2: What's New, Event, Offer, What's New
- Month 3: Product, What's New, Offer, What's New

---

## Step 4: Create GBP Posts

### Route A: Transform (client has existing articles)

Check if articles exist to transform:
```
Glob("projects/[uuid]/deliverables/content/*.md")
```

If articles exist and haven't been transformed yet:

Invoke: `Skill(skill="local-seo", args="gbp-content-transformer")`

Pass: 1–2 most relevant article paths + this month's 4 post topics + business context

The transformer produces 4 posts by extracting key value propositions from existing content — faster, more brand-consistent, and surfaces content the client already invested in.

### Route B: Original creation (no existing content, or all articles already transformed)

Invoke: `Skill(skill="local-seo", args="gbp-original-content-creator")`

Pass for each of the 4 posts:
- Topic + post type
- Target keyword
- Business name, city, language
- Brand voice from CLAUDE.md
- CTA type + contact details

Run 4 times (once per post) or pass all 4 topics in one call if the skill supports batch input.

---

## Step 5: Package for Publishing

Invoke: `Skill(skill="local-seo", args="gbp-post-delivery-formatter")`

Pass:
- All 4 post texts
- Business name
- Phone + booking URL
- Language
- Business type (for timing recommendations)

Output: client-ready publishing handoff document with copy-paste text, image specs, dashboard instructions, and posting schedule.

Save to: `projects/[uuid]/deliverables/local-seo/gbp-posts-[YYYY-MM].md`

---

## Step 6: Update Project Log

Append to `projects/[uuid]/CLAUDE.md`:

```
### [YYYY-MM-DD] — Monthly Local SEO: [Month Year]

**Maps rankings** ([N] keywords tracked):
- In top 3: [N] ([+/-N] vs last month)
- In top 10: [N] ([+/-N] vs last month)  
- Average position: [X.X] ([+/-X.X])
- Notable: [any significant drops or gains]
- Quick wins to pursue: [keywords at position 4-7]

**GBP posts created**: 4 ([route: transform / original])
- Post 1: [type] — "[topic]"
- Post 2: [type] — "[topic]"
- Post 3: [type] — "[topic]"
- Post 4: [type] — "[topic]"

**Deliverable**: projects/[uuid]/deliverables/local-seo/gbp-posts-[YYYY-MM].md
**Ranking snapshot**: projects/[uuid]/local-seo/ranking-snapshots/maps-ranking-[YYYY-MM].json
**Next month**: [any specific focus based on this month's data]
```

---

## Monthly Output Summary

After this skill runs, the following are ready:

| Output | Location |
|--------|----------|
| Maps ranking snapshot | `projects/[uuid]/local-seo/ranking-snapshots/maps-ranking-[YYYY-MM].json` |
| GBP post publishing package | `projects/[uuid]/deliverables/local-seo/gbp-posts-[YYYY-MM].md` |
| Project log entry | Appended to `projects/[uuid]/CLAUDE.md` |

**Time estimate**: 15–25 minutes per client per month (mostly API wait time for ranking pulls).

**Cost estimate**:
- DataForSEO Maps SERP calls (10–20 keywords): < $0.10
- Content creation API calls: negligible (Claude inference)
- **Total: < $0.15 per monthly run**

---

## Quarterly additions (not monthly)

Run these every 3 months in addition to the monthly workflow:

| Task | Skill | Why quarterly |
|------|-------|--------------|
| Citation re-check | `citation-audit-specialist` | Citations change slowly; monthly is overkill |
| Competitor re-analysis | `local-competitor-intelligence` | Competitor profiles change quarterly, not monthly |
| GBP profile review | `local-seo-pipeline` Phase 1A only | Check for new profile gaps after Google changes |

---

## Integration with Other Monthly Workflows

Run in this order each month per local business client:

```
1. local-seo-monthly          → GBP posts + ranking snapshot
2. reputation-intelligence-pipeline → Review responses + sentiment report
```

These two together cover the full monthly local SEO retainer deliverables.
