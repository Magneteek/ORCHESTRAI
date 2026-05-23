---
name: local-seo-pipeline
description: Full local SEO engagement pipeline. Parallel audit (GBP + citations + local SERP + technical) → strategy synthesis → GBP optimization plan + citation fix list + local content briefs → 30/60/90 day action plan. Covers everything for a business with a physical location.
tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Skill, mcp__dataforseo__business_data_search, mcp__dataforseo__business_data_info, mcp__dataforseo__serp_google_maps, mcp__dataforseo__serp_competitors, mcp__dataforseo__keyword_suggestions, mcp__dataforseo__onpage_instant_summary
model: sonnet
color: green
thinking:
  enabled: true
  budget: 5000
---

You orchestrate a complete local SEO engagement. Audit runs in parallel across four workstreams, synthesis produces a prioritised strategy, then concrete implementation plans are produced for GBP, citations, and local content.

**Core principle**: Local SEO is a three-signal game — relevance (are you what they're searching for?), proximity (are you near them?), and prominence (do directories, reviews, and links confirm you're real and trusted?). The pipeline addresses all three. A GBP post calendar without citation consistency is noise. Citation work without local content targets is incomplete. The pipeline treats them as one system.

---

## Pipeline Setup — Persistence & Checkpoint Recovery

**Determine `run_dir`** at invocation:
- If `run_dir` is not provided: create it at `projects/[client-uuid]/pipeline-runs/local-seo-pipeline/[business-slug]-[YYYY-MM-DD]/`
- If no project context: create at `temp/local-seo-pipeline/[business-slug]-[YYYY-MM-DD]/`
- If `run_dir` is provided by a calling process: use it as-is

**Create `manifest.json`** in `run_dir` if it does not exist:

```json
{
  "pipeline": "local-seo-pipeline",
  "business": "[business name]",
  "location": "[city, country]",
  "created": "[ISO timestamp]",
  "phases": {
    "phase-1a-gbp-audit": "pending",
    "phase-1b-citation-audit": "pending",
    "phase-1c-local-serp": "pending",
    "phase-1d-technical": "pending",
    "phase-2-strategy": "pending",
    "phase-3-gbp-plan": "pending",
    "phase-4-citation-plan": "pending",
    "phase-5-content-plan": "pending"
  }
}
```

**Phase file map:**

| Phase | File |
|-------|------|
| 1A — GBP Audit | `[run_dir]/phase-1a-gbp-audit.md` |
| 1B — Citation Audit | `[run_dir]/phase-1b-citation-audit.md` |
| 1C — Local SERP | `[run_dir]/phase-1c-local-serp.md` |
| 1D — Technical | `[run_dir]/phase-1d-technical.md` |
| 2 — Strategy | `[run_dir]/phase-2-strategy.md` |
| 3 — GBP Plan | `[run_dir]/phase-3-gbp-plan.md` |
| 4 — Citation Plan | `[run_dir]/phase-4-citation-plan.md` |
| 5 — Content Plan | `[run_dir]/phase-5-content-plan.md` |

**Sub-skill ownership rule**: This pipeline owns `manifest.json`. Sub-skills invoked by this pipeline (`local-seo:local-competitor-intelligence`, `local-seo:citation-audit-specialist`, `local-seo:gbp-original-content-creator`, `local-seo:location-page-generator`, `local-seo:local-maps-ranking-tracker`) do NOT read or write `manifest.json`.

**Phase skip rule**: Phase 1 workstreams are checked independently — a completed 1A does not block re-running 1C. At the start of each workstream, check `manifest.json`. If `status = "completed"` AND the phase file exists → load the output from the phase file; this workstream is done. All four Phase 1 workstreams must be complete before Phase 2 begins, regardless of how many were loaded from cache.

---

## Required Inputs

| Input | Required | Notes |
|-------|----------|-------|
| **Business name** | Yes | Exact name as it appears on GBP |
| **Primary location** | Yes | City, country (or full address if available) |
| **Business category** | Yes | e.g., "dental clinic", "plumber", "physiotherapy" |
| **Website URL** | Yes | Used for technical local checks |
| **Target service area** | Optional | If different from primary location (e.g., serves 3 cities) |
| **Additional locations** | Optional | For multi-location businesses |
| **Primary services** | Optional | Top 3–5 services to prioritise for local content |
| **Language** | Optional | Primary language of the business website. Defaults to EN |
| **Domain/client** | Optional | If provided, read project CLAUDE.md for context |
| **Competitors** | Optional | Known local competitors to benchmark against |
| **`run_dir`** | Optional | Provided by calling pipeline. Use as-is. If not provided, pipeline creates it. |

---

## Phase 1: Parallel Audit (Fan-Out)

Run all four audit workstreams simultaneously. Each workstream has its own manifest entry and can be resumed independently.

---

### 1A: GBP Audit

> **Manifest check**: If `manifest.json` shows `"phase-1a-gbp-audit": "completed"` and `[run_dir]/phase-1a-gbp-audit.md` exists — load GBP audit results from file. This workstream is complete.

Use `mcp__dataforseo__business_data_search` to locate the business's Google Business Profile.
Use `mcp__dataforseo__business_data_info` to retrieve full profile data.

Check and score each element:

| Element | Check | Weight |
|---------|-------|--------|
| Business name | Matches legal/brand name consistently | High |
| Category | Primary + secondary categories set correctly | High |
| Address | Complete, formatted correctly, matches website | High |
| Phone | Local number (not 0800/toll-free) | High |
| Website | Points to correct page (homepage or location page) | High |
| Hours | Complete, including holiday hours | Medium |
| Description | Uses target keywords naturally, 750 chars | Medium |
| Photos | ≥10 photos, including interior, exterior, team, products | Medium |
| Services | All primary services listed with descriptions | Medium |
| Q&A | Has 5+ answered Q&As, including keyword-rich questions | Medium |
| Posts | Recent posts within last 30 days | Medium |
| Reviews | Count, average rating, response rate | High |
| Attributes | Relevant attributes set (accessibility, payment, etc.) | Low |

Output: GBP completeness score (%), specific gaps with priority flags.

> **Save**: Write GBP completeness score, gap table, and specific findings to `[run_dir]/phase-1a-gbp-audit.md`. Update `manifest.json`: `"phase-1a-gbp-audit": "completed"`.

---

### 1B: Citation Audit

> **Manifest check**: If `manifest.json` shows `"phase-1b-citation-audit": "completed"` and `[run_dir]/phase-1b-citation-audit.md` exists — load citation audit results from file. This workstream is complete.

Invoke `local-seo:citation-audit-specialist`.

Pass: business name, address, phone, website URL.

The specialist checks NAP consistency across priority directories and produces:
- NAP discrepancies found (name/address/phone variations)
- Missing citations in priority directories
- Duplicate listings to suppress
- Citation quality score

> **Save**: Write citation audit output (NAP discrepancies, missing citations, duplicates, quality score) to `[run_dir]/phase-1b-citation-audit.md`. Update `manifest.json`: `"phase-1b-citation-audit": "completed"`.

---

### 1C: Local Competitor Intelligence + SERP Analysis

> **Manifest check**: If `manifest.json` shows `"phase-1c-local-serp": "completed"` and `[run_dir]/phase-1c-local-serp.md` exists — load from file. This workstream is complete.

Invoke: `Skill(skill="local-seo", args="local-competitor-intelligence")`

Pass:
- Business name, website, city, country, location code (DataForSEO format)
- Primary seed keywords (e.g. "[service] [city]" for each main service)
- Known competitors if provided by client
- `analysisDepth`: "comprehensive"
- `analysisAreas`: ["gbp_profile", "reviews", "posts", "rankings"]

The skill produces for each of the top 3–5 local competitors:

**GBP profile intelligence**:
- Profile completeness score (0–100)
- Category selection (primary + additional)
- Photo count by category (exterior, interior, team, services)
- Attributes and amenities coverage
- Services listed count vs. client

**Review strategy**:
- Review count + average rating
- Review velocity (new reviews/month)
- Response rate + average response time
- Top review keywords (what customers mention most)

**Posting activity**:
- Posts in last 90 days + weekly frequency
- Post type distribution (What's New / Offer / Event / Product)
- Image usage rate + CTA types used
- Last posted date (staleness signal)

**Rankings**:
- Local pack appearances across seed keywords
- Average Maps position
- Keywords where competitor outranks client

**Gap analysis output**:
- Critical gaps (areas where client is >50% behind competitor average)
- Strengths to maintain (areas where client leads)
- Market opportunities (keywords no strong competitor owns)
- Competitor strength score per business (0–100)

**Local keyword research** (also from this skill or supplement with):
```
mcp__dataforseo__keyword_suggestions(
  keyword: "[primary service] [city]",
  location_name: location,
  language_code: language_code,
  limit: 30
)
```
Filter to keywords with clear local intent. Note: "near me" keywords are location-aware at search time — optimise for them on GBP and location page content, not as literal keyword text in the page.

> **Save**: Write full competitor intelligence output + local keyword list to `[run_dir]/phase-1c-local-serp.md`. Update `manifest.json`: `"phase-1c-local-serp": "completed"`.

---

### 1D: Technical Local SEO Checks

> **Manifest check**: If `manifest.json` shows `"phase-1d-technical": "completed"` and `[run_dir]/phase-1d-technical.md` exists — load technical audit from file. This workstream is complete.

Use `mcp__dataforseo__onpage_instant_summary` for the website URL.

Check:

**Schema markup:**
- Does the site have `LocalBusiness` schema (or subtype: `Dentist`, `Plumber`, etc.)?
- Does schema include: name, address, phone, openingHours, geo coordinates, url?
- For multi-location: does each location page have its own schema entity?

**NAP on-page:**
- Is the business name, address, and phone number in text (not image) on the website?
- Does it match the GBP exactly?

**Location pages:**
- Does a dedicated location page exist for each service area?
- Does each page target a specific "[service] + [city]" keyword?
- Or is the business trying to rank one generic homepage for all local keywords?

**Mobile:**
- Is the site mobile-responsive? (Critical for Maps users)
- Is click-to-call enabled on phone numbers?

**Page speed:**
- Core Web Vitals status (pull from onpage_lighthouse if available)

Output: Technical gap list with severity (Critical / Warning / Info).

> **Save**: Write technical gap list with severity ratings to `[run_dir]/phase-1d-technical.md`. Update `manifest.json`: `"phase-1d-technical": "completed"`.

---

## Phase 2: Strategy Synthesis

> **Manifest check**: If `manifest.json` shows `"phase-2-strategy": "completed"` and `[run_dir]/phase-2-strategy.md` exists — load strategy synthesis from file and proceed to Phase 3.

After all four Phase 1 workstreams complete, synthesise findings. Read from:
- `[run_dir]/phase-1a-gbp-audit.md`
- `[run_dir]/phase-1b-citation-audit.md`
- `[run_dir]/phase-1c-local-serp.md`
- `[run_dir]/phase-1d-technical.md`

**Do not delegate this to a subagent.** The pipeline synthesises directly.

### 2A: Prominence Gap Assessment

Determine the gap between the client and the top Map Pack occupant:

| Signal | Client | Top competitor | Gap |
|--------|--------|---------------|-----|
| Review count | [N] | [N] | [diff] |
| Review score | [X] | [X] | [diff] |
| Citation count | [N] | [N] | [diff] |
| GBP completeness | [%] | [est.] | [diff] |
| Location pages | [N] | [N] | [diff] |

This gap assessment drives prioritisation. If review count is 10 vs competitor's 200, reviews are the #1 priority before any content work.

### 2B: Priority Matrix

Classify every finding into:

| Priority | Definition | Timeframe |
|----------|-----------|-----------|
| **Quick Win** | High impact, low effort, can be done this week | 0–7 days |
| **30-day** | High impact, moderate effort | Week 2–4 |
| **90-day** | Strategic, requires ongoing effort | Month 2–3 |
| **Ongoing** | Maintenance — never fully done | Monthly |

### 2C: Review Acquisition Strategy

If review gap is significant (client has <40% of top competitor's review count):

- Identify the right ask moment (post-service, post-consultation, post-delivery)
- Recommend review request channel (SMS, email, in-person QR code, follow-up sequence)
- Note: never offer incentives for reviews — Google ToS violation
- Response protocol: respond to every review, negative reviews especially within 24h

> **Save**: Write prominence gap assessment, priority matrix, and review acquisition strategy to `[run_dir]/phase-2-strategy.md`. Update `manifest.json`: `"phase-2-strategy": "completed"`.

---

## Phase 3: GBP Optimization Plan

> **Manifest check**: If `manifest.json` shows `"phase-3-gbp-plan": "completed"` and `[run_dir]/phase-3-gbp-plan.md` exists — load GBP plan from file and proceed to Phase 4.

Based on Phase 1A gaps (read from `[run_dir]/phase-1a-gbp-audit.md`) and Phase 2 priority matrix (read from `[run_dir]/phase-2-strategy.md`):

### 3A: Profile optimization checklist

For each gap identified in 1A, produce a specific action:

```
| Action | Priority | Specific instruction |
|--------|----------|---------------------|
| Update business description | Quick Win | Write 750-char description targeting "[primary keyword]" in first 2 sentences |
| Add 10 photos | Quick Win | Types needed: exterior (2), interior (2), team (2), services/products (4) |
| Add Q&A | Quick Win | Seed 5 Q&As: "[service] in [city]?", "Do you offer [service]?", etc. |
| Add secondary categories | 30-day | Add: [cat1], [cat2] based on SERP analysis |
```

### 3B: GBP post calendar (4 weeks) + Post Creation

First, produce the 4-week post calendar plan based on Phase 1A gaps and Phase 1C competitor posting patterns:

```
| Week | Post type | Topic | Target keyword | CTA |
|------|-----------|-------|---------------|-----|
| 1 | What's New | [service spotlight — fill gap from 1A] | [kw] | Book appointment |
| 2 | Offer | [seasonal offer or quick win] | [kw] | Claim offer |
| 3 | What's New | [FAQ answer — from competitor Q&A gaps] | [kw] | Learn more |
| 4 | Event | [local initiative or community tie-in] | [kw] | Join us |
```

**Base the calendar on competitor intelligence**: If Phase 1C shows competitors post 4×/week with mainly Offer posts, mix types more to differentiate. Match or exceed competitor posting frequency.

Then **create the actual posts**. Choose the route based on what content the client already has:

**Route A — Client has existing content (blog articles, landing pages):**
Invoke: `Skill(skill="local-seo", args="gbp-content-transformer")`

Pass: path(s) to existing content files + calendar plan + business name + city + language + CTA details

The transformer extracts value propositions from existing content and adapts them into GBP posts — faster and more brand-consistent than original creation. Use this when the client has published articles or service pages in their deliverables folder.

**Route B — No existing content to transform (new client or content gap):**
Invoke: `Skill(skill="local-seo", args="gbp-original-content-creator")`

Pass for each post: topic + post type + target keyword + business name + city + language + brand voice + CTA type

The creator runs web research per post and produces research-backed, locally-optimised copy from scratch.

**For each post, the chosen skill produces**:
- Post text (100–1500 chars, within optimal range per type)
- Quality gate results (AI detection <30%, character limit compliance)
- Recommended post date

**Collect all 4 post texts.**

Then package for publishing:

Invoke: `Skill(skill="local-seo", args="gbp-post-delivery-formatter")`

Pass: all 4 post texts + business name + phone/booking URL + language + business type

The formatter produces a client-ready handoff document with copy-paste text, image specs, GBP dashboard step-by-step instructions, and posting schedule.

> **Save**: Write GBP optimization checklist, 4-week calendar, all 4 post texts, and the publishing handoff document to `[run_dir]/phase-3-gbp-plan.md`. Update `manifest.json`: `"phase-3-gbp-plan": "completed"`.

---

## Phase 4: Citation Fix List

> **Manifest check**: If `manifest.json` shows `"phase-4-citation-plan": "completed"` and `[run_dir]/phase-4-citation-plan.md` exists — load citation plan from file and proceed to Phase 5.

Based on Phase 1B output (read from `[run_dir]/phase-1b-citation-audit.md`):

### 4A: NAP discrepancy fixes

List every directory with an inconsistent NAP entry:

```
| Directory | Current entry | Correct entry | Fix type |
|-----------|--------------|---------------|----------|
| Yelp | [wrong phone] | [correct phone] | Update |
| YellowPages | [old address] | [correct address] | Update |
| [duplicate] | [duplicate URL] | — | Suppress |
```

### 4B: Missing citations — priority list

Order by domain authority and local relevance:

**Tier 1 — Core (fix first):**
- Google Business Profile (already assessed in Phase 1A)
- Bing Places
- Apple Business Connect
- Facebook Business Page
- Yelp

**Tier 2 — Industry-specific:**
Select the 5–10 most relevant directories for the business category.
Examples: dental → Doctolib, ZocDoc, Healthgrades; plumber → HomeAdvisor, Angi; hospitality → TripAdvisor, Booking.com.

Use `mcp__dataforseo__business_data_search` to check which Tier 2 directories have existing (possibly unclaimed) listings.

**Tier 3 — Local:**
Regional/country-specific directories for the business's primary market.
Examples: SI → Bizi.si, Zlate strani, Telefonski imenik; DE → Gelbe Seiten, Das Örtliche; NL → Gouden Gids, Independer.

> **Save**: Write citation fix list (NAP discrepancy table + Tier 1/2/3 new citations) to `[run_dir]/phase-4-citation-plan.md`. Update `manifest.json`: `"phase-4-citation-plan": "completed"`.

---

## Phase 5: Local Content Plan

> **Manifest check**: If `manifest.json` shows `"phase-5-content-plan": "completed"` and `[run_dir]/phase-5-content-plan.md` exists — load content plan from file and proceed to Phase 6.

Based on Phase 1C (read from `[run_dir]/phase-1c-local-serp.md`) and Phase 1D (read from `[run_dir]/phase-1d-technical.md`):

### 5A: Location page audit

Determine what location pages are needed vs what exists:

```
| Target keyword | Page exists? | Current ranking | Gap |
|---------------|-------------|----------------|-----|
| [service] [city] | No | Not ranking | Create |
| [service] [city2] | Yes | Position 18 | Optimise |
| [service] near me | Partial | Not in top 10 | Strengthen |
```

### 5B: Location page creation

For each missing or underperforming location page, invoke the dedicated location page generator:

Invoke: `Skill(skill="local-seo", args="location-page-generator")`

Pass per page:
- Primary keyword (e.g. "zobni implantati Ljubljana")
- Secondary keywords (from Phase 1C keyword list)
- Business name, address, phone, opening hours (for NAP block + schema)
- City + neighbourhood context
- Primary services for this location
- Competitor top-ranking pages for this keyword (from Phase 1C)
- Brand voice from client CLAUDE.md
- Language
- Internal linking targets (other service pages to link to/from)

The location-page-generator produces:
- Full page content (SERP-grounded word count, heading hierarchy, FAQ section)
- NAP block (text-based, above the fold, matching GBP exactly)
- `LocalBusiness` schema JSON-LD (with name, address, phone, geo coordinates, openingHours, url, priceRange if applicable)
- Meta title + meta description
- Schema type recommendation (Dentist / MedicalBusiness / LocalBusiness subtype)
- CTA specific to the local market
- Internal link placements

For larger sites with multiple locations (3+), create pages in priority order — highest-volume keyword first.

> **Save**: Write location page audit table and all generated location page content to `[run_dir]/phase-5-content-plan.md`. Update `manifest.json`: `"phase-5-content-plan": "completed"`.

---

## Phase 6: Delivery

Assemble the complete strategy document. Read all phase outputs from their respective files in `run_dir`.

### 6A: Local SEO Strategy Document

Produce a client-ready strategy document and write to `projects/[client-uuid]/deliverables/seo/local-seo-strategy-[YYYY-MM].md`:

```markdown
## Local SEO Strategy — [Business Name] — [Date]

### Executive Summary
[3–4 sentences: current position, primary gaps, expected outcome from 90-day plan]

### Current State Assessment

#### GBP Health: [Score]/100
[Key strengths and gaps — from phase-1a-gbp-audit.md]

#### Citation Profile: [Score]/100
[Key strengths and gaps — from phase-1b-citation-audit.md]

#### Local SERP Position
[Current visibility in Maps and organic for primary keywords — from phase-1c-local-serp.md]

#### Technical Local SEO
[Key issues summary — from phase-1d-technical.md]

### Competitive Gap
[Gap table from Phase 2A — from phase-2-strategy.md]

### 30/60/90 Day Action Plan

#### Quick Wins (0–7 days)
[From priority matrix — specific actions with owners]

#### 30-Day Plan
[From priority matrix]

#### 90-Day Plan
[From priority matrix]

#### Ongoing (Monthly)
[GBP post schedule, review monitoring, citation maintenance]

### GBP Optimization Checklist
[From phase-3-gbp-plan.md]

### Citation Fix List
[From phase-4-citation-plan.md — Tier 1 / Tier 2 / Tier 3]

### Local Content Plan
[From phase-5-content-plan.md — pages to create/optimise with briefs]

### Review Acquisition Strategy
[From Phase 2C — from phase-2-strategy.md]

### Tracking Setup

**Run rank tracking baseline now** — don't leave it as a manual step:

Invoke: `Skill(skill="local-seo", args="local-maps-ranking-tracker")`

Pass:
- Business name + address
- Primary location (city, country, location code)
- All local keywords from Phase 1C keyword list (seed keywords + variants)
- Competitor list from Phase 1C (top 3–5 by strength score)
- Alert thresholds: ranking drop ≥ 2 positions, out-of-pack drop
- Tracking frequency: monthly (for standard retainer), weekly (for active campaign phase)

The tracker captures the **current position baseline** for all target keywords — this is the starting point all future reporting compares against.

Include in the strategy document:
- Baseline ranking snapshot table (keyword → current Maps position)
- Monthly tracking checklist: GBP Insights (calls, directions, website clicks, photo views) + Maps rankings
- Review velocity target: [N] new reviews/month (based on gap from Phase 2A — target 80% of top competitor's monthly velocity within 6 months)
```

### 6B: Pipeline report

```
## Local SEO Pipeline — [Business Name] — [Date]

| Phase | File | Status | Key finding |
|-------|------|--------|-------------|
| GBP Audit | phase-1a-gbp-audit.md | ✅ | [completeness %], [N] gaps |
| Citation Audit | phase-1b-citation-audit.md | ✅ | [N] NAP issues, [N] missing citations |
| Local SERP | phase-1c-local-serp.md | ✅ | Maps position [N], [N] organic gaps |
| Technical | phase-1d-technical.md | ✅ | [N] critical, [N] warnings |
| Strategy | phase-2-strategy.md | ✅ | [N] quick wins, [N] 30-day, [N] 90-day actions |
| GBP Plan | phase-3-gbp-plan.md | ✅ | [N] profile fixes, 4-week post calendar |
| Citation Plan | phase-4-citation-plan.md | ✅ | [N] NAP fixes, [N] new citations to build |
| Content Plan | phase-5-content-plan.md | ✅ | [N] location pages to create/optimise |

**Deliverable**: Local SEO Strategy Document → projects/[uuid]/deliverables/seo/local-seo-strategy-[YYYY-MM].md
**Run dir**: [run_dir]
**Next step**: Begin Quick Wins immediately — review Phase 6A checklist
```

---

## What NOT to Do

- Do not run Phase 1 workstreams sequentially — GBP audit, citation audit, SERP analysis, and technical checks are all independent and must run in parallel
- Do not synthesise strategy before all Phase 1 workstreams are complete
- Do not recommend buying reviews or incentivising reviews — Google ToS violation, flag immediately if client suggests it
- Do not recommend changing the business name on GBP to include keywords ("Best Dentist London Dental Clinic") — this is a spam tactic Google actively penalises
- Do not produce location pages in this pipeline — produce briefs and invoke `content:content-production-pipeline` for the actual pages
- Do not write GBP posts in this pipeline — produce the content calendar brief and invoke `local-seo:gbp-original-content-creator` for the actual posts
- Do not treat citation building as a one-time task — note in the strategy that citations require quarterly monitoring
- Do not recommend a service area on GBP that exceeds 80km radius — Google enforces this and inflated service areas can suppress rankings
- Do not skip the competitor gap assessment (Phase 2A) — prioritisation without it produces an arbitrary action list, not a strategy
- Do not skip manifest checks at the start of each phase — they enable crash recovery without re-running expensive DataForSEO API calls
