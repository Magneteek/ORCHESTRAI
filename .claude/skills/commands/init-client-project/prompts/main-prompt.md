# Initialize New Client Project

**Usage**: `/init-client-project [client-name]`

## Existing Projects (check before creating)

Active client projects already in the system:
!`ls /Users/krisbal/CLAUDEtools/ORCHESTRAI/projects/ 2>/dev/null | head -30 || echo "No projects yet — this will be the first."`

**Before creating anything:** if the client already appears in the list above, use that existing project folder instead of creating a new one.

---

You are initializing a new client project in the ORCHESTRAI system. Follow this workflow exactly.

---

## Step 1: Project Setup

1. Generate a unique project UUID (format: `[client-name]-[8-char-hex]`)
2. Create project directory structure:
   ```
   /projects/[client-name]-[uuid]/
   ├── client-intelligence/
   ├── deliverables/
   │   ├── seo/
   │   │   └── kpo/           ← Knowledge Panel Optimization reports
   │   ├── content/
   │   ├── design/
   │   ├── development/
   │   └── research/
   ├── CLAUDE.md              ← Project context + progress log (CREATE THIS)
   ├── project-metadata.json
   ```

---

## Step 2: Client Intelligence Gathering

Ask the user for the following. Collect all answers before proceeding:

1. **Client name** and **industry**
2. **Primary business objectives** (what does success look like in 6 months?)
3. **Target audience** (who are their customers?)
4. **Is this a local business?** (yes/no — if yes, they have a physical location + Google Business Profile)
   - If yes: **Full business name as it appears on Google** (e.g. "Zobozdravstvo Križnar d.o.o.")
   - If yes: **Location** (city + country, e.g. "Kranj,Slovenia")
   - If yes: **Language** of the local market (e.g. "Slovenian", "English")
5. **Competitive landscape** — who are the main 2–3 competitors?
6. **Existing website URL** (if any)
7. **CMS / SEO plugin** (e.g. WordPress + SEOpress, Shopify, custom)

---

## Step 3: Entity Baseline — KPO Audit (local/brand clients only)

**Run this step if the client is a local business OR a brand with a Knowledge Panel.**

This is a mandatory first step — it establishes entity health before any SEO work begins.

### Why this comes first:
- Google needs to recognise the business as a verified entity before it will rank it confidently
- Knowledge Panel completeness directly affects local pack rankings
- Entity IDs (CID, Place ID) are needed for schema markup throughout the engagement
- Missing GBP fields are often the fastest client wins — fixable in 30 minutes with no content work

### Process:
1. Run `Skill(skill="seo", args="seo-kpo-analyzer")` with the business name + location + language
2. The skill calls `mcp__dataforseo__kpo_analyzer` — runs GBP listings lookup and branded SERP harvest in parallel
3. From the results, extract and store:
   - KPO score (0–100) and label
   - Entity IDs: CID, Place ID, category_ids, Google Maps URL
   - `fields_missing` list (HIGH priority items for the CLAUDE.md summary)
   - Knowledge Panel detection status
4. Save the full KPO report to: `deliverables/seo/kpo/kpo-baseline-[date].md`
5. Add entity IDs and KPO summary to the project `CLAUDE.md` (see template below)

**If Knowledge Panel is NOT detected:** flag this as a critical issue — the entity is not established in Google's Knowledge Graph. Add "entity building" as first-priority action.

---

## Step 4: Create Project CLAUDE.md

Create `CLAUDE.md` at the project root with this template (populate with real data from Steps 2–3):

```markdown
# [Client Name] Project

**Project ID**: [client-name]-[uuid]
**Industry**: [industry]
**Website**: [url]
**CMS / SEO plugin**: [e.g. WordPress + SEOpress]
**Started**: [date]

## Client Context
- **Business**: [brief description]
- **Target audience**: [who they serve]
- **Primary objectives**: [what success looks like]
- **Market**: [country / language]

## Competitors
- [competitor 1]
- [competitor 2]

## Entity IDs (Google)
- **CID**: [cid or "not found"]
- **Place ID**: [place_id or "not found"]
- **Category IDs (gcids)**: [list or "not found"]
- **Google Maps**: [url or "not found"]
- **Knowledge Panel**: [Detected / Not detected]
- **KPO Score**: [N]/100 — [label] (baseline [date])
- **KPO Report**: deliverables/seo/kpo/kpo-baseline-[date].md

## KPO Priority Fixes (HIGH — complete before SEO work)
[Only HIGH priority missing fields from kpo_analyzer]
- [ ] [field label] — [specific action]
- [ ] [field label] — [specific action]

## Technical Decisions
- [Stack/tool/plugin decisions — e.g., "Uses SEOpress not Yoast"]

## Progress Log

### [date] — Project Initialized
- Created project structure
- KPO baseline: [score]/100 — [N] HIGH priority gaps identified
- Entity IDs captured: CID [cid]

## What's Done
- [x] KPO baseline audit
- [ ] SEO research
- [ ] Content strategy
- [ ] Website
- [ ] Advertising

## What's Next
1. Client to fix HIGH priority GBP gaps (see KPO report)
2. [Next SEO/content step]

## Learnings (client-specific mistakes & decisions)
- [Any client-specific things to remember — sync to LEARNINGS.md via /learn]
```

---

## Step 5: First Deliverable Planning

Ask the user: "What would you like to work on first?"

- **SEO research and strategy** → `Skill(skill="seo", args="seo-research-pipeline")`
- **Content creation** → `Skill(skill="content", args="content-writer-specialist")`
- **Website development** → `Task(subagent_type="webdev-conductor")`
- **Market / competitor research** → `Skill(skill="client-intelligence", args="competitor-analyzer")`

---

## Critical Rules

- **ALWAYS use the existing project folder** for all future client work
- **NEVER create separate projects** for the same client
- **MAINTAIN coherent file structure** per CLAUDE.md rules
- **KPO audit is mandatory for local businesses** — never skip it, even if "we'll do it later"
- **Entity IDs go in CLAUDE.md immediately** — they are needed by schema, local SEO, and GBP management tasks throughout the engagement

---

## Project Summary Output

After completing all steps, output:

```
✅ Project initialized: [client-name]-[uuid]

📁 /projects/[client-name]-[uuid]/
🔑 CID: [cid] | Place ID: [place_id]
📊 KPO Score: [N]/100 — [label]
⚠️  HIGH priority GBP gaps ([N]): [top 3 field labels]

Next steps:
1. Client action: Fix GBP gaps → see deliverables/seo/kpo/kpo-baseline-[date].md
2. [Next recommended work item based on client objectives]
```
