# Initialize New Client Project

**Usage**: `/init-client-project [client-name]`

You are initializing a new client project in the ORCHESTRAI system. Follow this workflow:

## Step 1: Project Setup
1. Generate a unique project UUID
2. Create project directory structure:
   ```
   /projects/[client-name]-[uuid]/
   ├── client-intelligence/
   ├── deliverables/
   │   ├── seo/
   │   │   └── kpo/           ← KPO baseline reports
   │   ├── content/
   │   ├── design/
   │   ├── development/
   │   └── research/
   ├── CLAUDE.md
   ├── project-metadata.json
   ```

## Step 2: Client Intelligence Gathering
Ask user for:
- Client name and industry
- Primary business objectives
- Target audience
- Is this a local business? (if yes: full GBP business name + city/country + language)
- Competitive landscape
- Existing website URL
- CMS / SEO plugin

## Step 3: Entity Baseline — KPO Audit (mandatory for local/brand clients)
Run `Skill(skill="seo", args="seo-kpo-analyzer")` with business name + location + language.
- Save full report to `deliverables/seo/kpo/kpo-baseline-[date].md`
- Store entity IDs (CID, Place ID, category_ids) and KPO score in CLAUDE.md
- List HIGH priority missing fields as action items in CLAUDE.md

**If Knowledge Panel not detected:** flag as critical — entity not established in Google KG.

## Step 4: Create CLAUDE.md
Include: client context, competitors, entity IDs, KPO score + priority fixes, technical decisions, progress log, what's done/next.

## Step 5: First Deliverable Planning
Ask: "What would you like to work on first?"
- SEO research → `Skill(skill="seo", args="seo-research-pipeline")`
- Content → `Skill(skill="content", args="content-writer-specialist")`
- Website → `Task(subagent_type="webdev-conductor")`
- Research → `Skill(skill="client-intelligence", args="competitor-analyzer")`

## Critical Rules
- **ALWAYS use the existing project folder** for all future client work
- **NEVER create separate projects** for the same client
- **KPO audit is mandatory for local businesses** — never skip
- **Entity IDs go in CLAUDE.md immediately** — needed by schema, local SEO, GBP tasks

## Output
```
✅ Project: [client-name]-[uuid]
🔑 CID: [cid] | Place ID: [place_id]
📊 KPO: [N]/100 — [label] | HIGH gaps: [N]
Next: Client fixes GBP gaps → then [next work item]
```
