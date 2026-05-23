# ORCHESTRAI System Learnings

> **This file is the living memory of what works, what doesn't, and decisions made.**
> All agents and skills check relevant sections before executing.
> Add new learnings via `/learn` command or directly edit this file.

Last updated: 2026-05-12 (pipeline-conductor dead refs fixed; external service dependency documented)

---

## HOW AGENTS USE THIS FILE

Every agent must read this file at session start and apply the relevant sections. Skills running in main context inherit these learnings automatically via CLAUDE.md.

---

## GLOBAL (applies to all domains and clients)

### Mistakes to Never Repeat

- **2026-03-05** | [SEO/Content] Plugin confusion: Always confirm which WordPress SEO plugin a client uses before giving instructions. Never assume Yoast — some clients use SEOpress, RankMath, etc.

### Established Decisions

- **2026-03-05** | Static-first default: Never suggest Next.js/React for landing pages or marketing sites. Use static HTML + Tailwind. Only use frameworks when dynamic features genuinely require it.

### User Preferences

- **2026-03-05** | No emojis unless explicitly requested
- **2026-03-05** | Keep responses concise and direct — skip preamble and filler

---

## SEO

### Mistakes to Never Repeat

- **2026-04-19** | seo-topical-authority was producing generic JSON output with no actionable strategy. Never output JSON as a strategy document — produce markdown tables, build sequences, and linking blueprints that a content team can execute directly.

### Established Decisions

- **2026-05-21** | seo-proposal-generator skill built at `.claude/skills/seo/seo-proposal-generator/`. Two modes: Mode 1 (full pipeline) reads phase-1a/1b/1c/3b + manifest + strategy file. Mode 2 (quick pitch) runs 4 live DataForSEO queries on the domain. Auto-detects mode by checking for pipeline run manifest. Pricing formula: Low market (avg KD <20) EUR 550/720/1,050 — Medium (KD 20-40) EUR 695/895/1,310 — High (KD >40) EUR 850/1,050/1,550. Currency: EUR ×1.0, CHF ×1.05, GBP ×0.88. Plan depth: tiered — Option A gets summary table, Options B/C get full month-by-month detail. HTML uses QuartzIQ brand colours (#1A2944 primary, #357494 accent). Calibration: notfallhandling 180→1,100/mo at medium KD; kriznar 78→1,500+/mo at low KD.

- **2026-04-19** | SEO research pipeline phase order: Parallel (keyword research + competitor analysis + technical analysis + intent mapping) → Synthesis (pipeline does this directly, no subagent) → Semantic clustering → Topical authority → Conditional specialisations (local / medical / entity) → Validate → Deliver. Synthesis is always the pipeline's job — do not delegate it to a subagent.

- **2026-04-19** | seo-topical-authority skill follows Koray Tugberk framework: semantic distance tiers (Core → Adjacent → Expansion), content type taxonomy, build sequence logic, internal linking as topical signal. See the skill prompt for the complete framework — do not improvise topical authority strategy outside of this skill.

- **2026-04-19** | seo-topical-authority uses mcp__dataforseo__domain_keywords to read the domain's current topical footprint BEFORE making any recommendations. What Google currently associates the domain with is the starting point — not what the client says they do.

---

## CONTENT

### Mistakes to Never Repeat

- **2026-04-22** | Content brief output filename: the research brief produced by content-brief-generator is `phase-0-research-brief.md` (NOT `phase-4-brief.md`). Stored in `[run_dir]/phase-0-research-brief.md`. The manifest key is `"phase-0-research-brief"`. This naming aligns with its position in the pipeline (Phase 0 = research) and avoids collision with `phase-4-medical-check.md` in the same run directory.

- **2026-04-21** | Skill routing: `Skill(skill="content", args="content-production-pipeline")` loads the domain overview SKILL.md only — `args` is passed to the domain skill, NOT used for routing. Individual content skills (content-production-pipeline, content-brief-generator, etc.) must be invoked as flat skills: `Skill(skill="content-production-pipeline")`. Root cause: subdirectory SKILL.md files were missing YAML frontmatter — without `---` frontmatter, the skill doesn't register as individually invocable. Fixed 2026-04-21 by adding frontmatter to all pipeline skill SKILL.md files. Effective from next session start.

- **2026-04-21** | Bash `cp` on `/projects/` is blocked by the `protect-critical-directories` hookify rule. To promote a file from pipeline-runs to deliverables, use Read + Write tools instead of Bash cp.

- **2026-04-21** | 9-frame semantic coverage check (Definitional/Mechanistic/Causal/Evaluative/Comparative/Experiential/Cost-Resource/Temporal/FAQ) verifies *conceptual* completeness — it does NOT guarantee topical section completeness for pillar pages. A section like aftercare/maintenance can "pass" because it touches Temporal or Evaluative frames, while never getting its own H2 or H3. Fix: (1) content-brief-generator Phase 3 now includes a Pillar Page Topical Coverage Audit (11-section checklist with explicit resolution paths: Add as H2 / Add as H3 / Defer to spoke). (2) content-outline-architect now runs a Pillar Completeness Check even when working from a brief. Rule: both checks are mandatory for content_type = pillar / comprehensive guide / ultimate guide / hub page.

- **2026-04-19** | dutch-ai-phrase-detector had word-soup trigger ("dutch, phrase, detector, specialized..."). Fixed to specific multi-word phrases like "dutch ai detection", "dutch content check". Same class of error as the 27-skill trigger cleanup — always use specific phrases, never comma-separated single words.

- **2026-04-19** | content-outline-architect was not connected to the content production pipeline — writers were receiving briefs without structure, making structural decisions during the writing phase. Outline is now Phase 0.5 in content-production-pipeline. Always produce an outline before invoking the writer.

- **2026-04-19** | Content briefs written from internal logic (generic templates, "skyscraper technique") without SERP research miss what's actually ranking. Always run content-brief-generator first for any new content piece. The brief's format and heading structure come from analysing what the top 5 ranking pages actually do.

### Established Decisions

- **2026-04-19** | Full content production stack (in order): content-brief-generator → content-outline-architect → content-writer-specialist → content-quality-validator → language AI detector (SL/DE/NL) → medical-terminology-validator (healthcare only) → deliver. Each phase has a distinct responsibility and must not perform the work of the previous phase.

- **2026-04-19** | Multilanguage content pipeline phase order: Source content (create or accept) → Language strategy per language (local keyword research — not just translation of EN keyword) → Parallel adaptation via multi-language-content-adapter → Parallel AI detection per language (route to correct detector: SL/DE/NL/EN) → Language purity validation → Healthcare check (conditional) → Deliver with hreflang map + CMS instructions. Each language gets its own SERP research — words, word counts, and structure differ per market.

- **2026-04-19** | content-brief-generator pattern matrix (Phase 3): must-include (3+/5 pages) / differentiator (1-2/5) / gap (0/5). This classification drives every section instruction in the brief. Never skip writing the pattern matrix before producing the brief — it is the analytical foundation, not optional.

- **2026-04-19** | Word count targets in content briefs must come from SERP data (median of top 5 ranking pages), not arbitrary numbers. "Write 1500 words" with no SERP basis is noise. Always state the source: "top 5 median = N words, recommend matching/exceeding by X% to cover gaps identified."

---

## EMAIL MARKETING

### Established Decisions

- **2026-04-21** | Email pipeline pattern mirrors content pipeline: sequence-brief-generator (research-backed, per-email brief cards) → copy production → email-quality-validator (PASS/WARN/BLOCK, revision loop up to 2 cycles) → deliver. Never write email copy without a brief. Never deliver without validation.

- **2026-04-21** | Email pipelines now have full persistence (manifest.json + phase files). Sub-skill ownership: pass `run_dir` to sequence-brief-generator (STANDALONE_MODE = false → writes phase-0-sequence-brief.md, skips own manifest). Pass `validation_report_path` to email-quality-validator so the validation report is saved to disk, not just output to chat. Both pipelines own their own manifest.json exclusively.

- **2026-04-21** | campaign-copy-manifest STANDALONE_MODE: when invoked from paid-advertising-pipeline with run_dir, writes BOTH to `[run_dir]/phase-3.5-campaign-copy-manifest.md` (pipeline crash recovery) AND `projects/[uuid]/deliverables/advertising/campaign-copy-manifest-[YYYY-MM].md` (client deliverable). Standalone invocation writes deliverable only. Pattern matches content-brief-generator.

- **2026-04-21** | sequence-brief-generator pulls industry sequence patterns via WebSearch first (teardowns, examples, case studies for the niche), then builds ICP profile + emotional journey map + objection stack + message architecture + per-email brief cards. Pattern matrix classifies elements as must-include / differentiator / gap — same logic as content-brief-generator's SERP pattern matrix.

- **2026-04-21** | email-quality-validator enforces different rule sets per sequence type: cold-outreach has strict word count (≤150), opener rules (no "I", no filler), plain text only; automation sequences have CTA progression rules and personalisation field fallbacks. Both block on: fabricated proof, missing unsubscribe, contradictions between emails.

- **2026-04-21** | GHL platform specifics: Campaigns = one-off broadcasts. Workflows = automated sequences. Always set a Workflow Goal (Appointment Booked / Payment Received) — contacts who convert exit automatically without receiving remaining emails. Reply detection requires a separate always-on workflow. Tag naming convention: [type]-[campaign]-[state] (e.g., cold-dental-enrolled, nurture-implants-goal-met).

---

## ADVERTISING

### Mistakes to Never Repeat

- **2026-04-19** | `landing-page-optimizer` had dead references to `/orchestrai-system/templates/global/wireframes/landing-pages/` (path doesn't exist) and "Crystalline Memory Integration" (deprecated system). Both removed. LP optimizer is now a copy brief specialist invoked from the campaign-copy-manifest.

### Established Decisions

- **2026-04-19** | Ad copy and landing page copy must be produced from a shared brief — `advertising:campaign-copy-manifest`. The manifest runs AFTER offer architecture (Phase 3) and BEFORE copy production (Phase 4) in paid-advertising-pipeline. Without the manifest, ad copy and LP copy are produced independently and use different language, making different promises (message mismatch = primary conversion killer in paid campaigns).

- **2026-04-19** | Message match is a hard constraint, not a suggestion: Ad headline ≡ LP H1. The same specific claim, framed for the same reader. Google Ads Headline 1 must mirror the LP H1. Meta hook must set up the promise the LP H1 delivers. Validated via message match checklist before delivery.

- **2026-04-19** | campaign-copy-manifest phases: Competitor creative research (Facebook Ad Library via WebFetch URL — NOT site: search — + Google SERP ads + competitor LP WebFetch) → Audience language mining (DataForSEO search_intent + related_keywords + review scraping for verbatim customer phrases) → Offer competitive position audit → Message architecture (primary claim, proof hierarchy, objection stack, CTA hierarchy) → Per-asset brief cards (LP, Google, Meta, LinkedIn, Reddit) → Copy Compliance Checklist. Saves to projects/[uuid]/deliverables/advertising/. Invoked as Phase 3.5 in paid-advertising-pipeline — checks for existing manifest before regenerating.

- **2026-04-19** | The best ad copy uses the customer's exact words — mined from reviews, forums, Reddit threads, competitor testimonials. Phase 2 of campaign-copy-manifest (audience language research) is not optional. Copywriter language loses to customer language every time.

---

## WEBDEV

### Mistakes to Never Repeat

*(Add mistakes here when they occur)*

### Established Decisions

*(Add decisions here when made)*

---

## QUALITY

### Mistakes to Never Repeat

*(Add mistakes here when they occur)*

---

## CLIENT-SPECIFIC

### proffshop (project: proffshop-B44E4D66-D62C-4318-8EE6-D487729B76E3)

- **CRITICAL — Distribution claims**: Proffshop.eu is the OFFICIAL distributor of Theodent for the EU with a direct supply agreement with Theodent LLC. But other retailers also sell Theodent in Slovenia (Lekarnar.com, Lumden.si, VBO Dental). Never write "edini distributer" or "dostopen izključno prek Proffshop.eu" or "V lekarnah ni dostopen". Correct framing: "uradni distributer z neposredno dobavno verigo od Theodent LLC" — differentiate on authenticity guarantee, direct supply chain, EU legal responsibility, Slovenian-speaking support. Acknowledge other retailers exist.
- **Uses SEOpress** (not Yoast, not RankMath) — always reference SEOpress for WordPress SEO instructions.
- **Theodent SL cluster**: 18 articles (`/deliverables/content/theodent-sl/`), all QA-passed, ready to publish. Hub v2 is `01-hub-pillar-article-v2.md`. Article 02 requires 301 redirect before publish: `/adijo-fluorid/` → `/sl/fluorid-v-zobni-pasti/`.
- **SERP reality (2026-05-22)**: Proffshop only ranks for `teobromin zobna pasta` (#2) and `theodent zobna pasta` (#9). All other cluster keywords: zero impressions. Content cluster never deployed — 7+ weeks of ready content sitting unpublished.

### nasmehpg (project: nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e)

- **CRITICAL — Beljenje zob**: nasmehpg does NOT offer laser whitening. Does NOT offer in-office chair whitening. Method is **professional TAKE-HOME gel system (LumiWhite)**: patient visits clinic for consultation + digital scan + custom trays fitting + technique instruction, then whitens at home with syringes. Day gel: 6% vodikov peroksid 1.5h. Night gel: 16% karbamidni peroksid overnight. Active offer is **LumiWhite Paket €279** (whitening system €250 + free hygiene €70 + Theodent pasta €20 = €340+ value). Full details in project CLAUDE.md under "Services & Pricing". Never invent procedures or prices — always check project CLAUDE.md first.
- **Plugin**: Uses **SEOpress** (NOT Yoast, NOT RankMath). All SEO plugin instructions must reference SEOpress.
- **WordPress permalink structure**: `/%category%/%postname%/`
- **Zobni vsadki silo**: 18 articles, all in `/deliverables/content/wordpress-html/`. Category slug: `zobni-implantati`. Posts use Category + Posts structure.
- **Technical SEO doc**: `/deliverables/seo/zobni-vsadki-silo-technical-seo-2025.html`
- **Legal entity**: Dentro d.o.o. (multi-division: tech lab, dental, B2B supplies, education). Dental brand = "Hiša Lepega Nasmeha" (no "PG" — informal shorthand only).
- **GMB name change DENIED**: Google rejected "Hiša lepega nasmeha Polhov Gradec" after ~1 month review. Do NOT recommend GMB name changes with location keywords — focus on service area, services, Q&A, location pages, citations instead.

### quartziq (project: quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010)

*(Add client-specific learnings here)*

### notfallhandling (project: notfallhandling-a088c0b9-6f35-4da9-ad99-3ce58fb04502)

- **Website**: https://notfallhandling.ch/ — Swiss emergency/Notfall services, German language
- **Planned work**: Initial SEO audit, SEO content plan, local SEO audit + plan, client text evaluation
- **WordPress plugin**: TBD — confirm before giving plugin instructions

---

## ARCHITECTURE & SYSTEM

### Mistakes to Never Repeat

- **2026-04-17** | Never add fake ML/infrastructure claims to agents or skills. No LSTM, gradient boosting, neural networks, Redis state sync, WebSocket coordination, LRU eviction, or fabricated accuracy percentages (85-95%). Claude doesn't run these systems. Use "structured reasoning", "pattern analysis", "systematic framework" instead. Fake claims cause the agent to produce fabricated outputs confidently.

- **2026-04-17** | Never leave one-time Bash commands in settings.local.json. After a one-off operation (cp, sed, perl, dig for a specific domain), delete the permission entry. Use wildcards (`Bash(cp:*)`, `Bash(dig:*)`) for operations that recur.

- **2026-04-17** | Session capture (orchestrai-session-manager) is NOT active. Hooks in `settings-hooks-enhanced.json` fire to localhost:5501 but: (1) that file is the wrong name so Claude Code never loads it, (2) the Node.js server at :5501 isn't running. Zero sessions ever captured. Do not reference session capture as working in any agent prompt.

### Established Decisions

- **2026-04-19** | Content pipeline phase order is fixed: SERP research (content-brief-generator) → Outline (content-outline-architect) → Write (content-writer-specialist) → QA → Language check → Medical check → Deliver. Never send the writer a brief without a structured outline. Never let the writer make structural decisions — that belongs to the outline phase.

- **2026-04-19** | Content briefs must be research-backed from SERP data, not internal logic. content-brief-generator fetches and reads top 5 ranking pages for the target keyword before producing the brief. Generic templates without SERP grounding consistently produce content that doesn't match what's ranking.

- **2026-04-19** | When a content brief exists, the outline architect fleshes it out (H3s, word counts per section, key points) rather than replacing it. The brief's heading structure comes from SERP research and is authoritative. Outline architect enhancements — never overrides.

- **2026-04-19** | Pipeline vs gate distinction: Content production = LOOP (writer can revise up to 2 cycles based on quality score). Code delivery = GATE (one-pass validation, BLOCK/WARN/PASS verdict, no revision loop). SEO research = FAN-OUT/FAN-IN (parallel research streams, synthesised into one strategy). Each domain requires its own pipeline type.

- **2026-04-19** | Topical authority = WHAT to build, in WHAT ORDER, at WHAT DEPTH (strategic layer). Semantic clustering = HOW to group keywords into clusters (mechanical layer). These are distinct skills that feed each other — seo-semantic-clustering output → seo-topical-authority input. Do not confuse them or collapse them into one step.

- **2026-04-19** | Koray Tugberk's content type taxonomy is the correct assignment framework for content gaps: Hub Document / Instructional / Definitional / Comparative / FAQ Node / Experience / Calibration / Local. Never default to "long-form article" — always assign the correct type first, as it determines format, depth, length, and linking role. See seo-topical-authority skill for full taxonomy.

- **2026-04-19** | Macro-semantic SEO principle: breadth before depth. Do not recommend deepening existing topics until coverage gaps are filled. A domain with 80% topic coverage at moderate depth outranks one with 30% coverage at high depth on individual pages. Build sequence: Hub Documents first → Tier 1 gaps → FAQ nodes → Tier 2 expansion → Calibration.

- **2026-04-19** | Dynamic `!` backtick injection in skill prompt files is an official Claude Code feature. Syntax: `` !`command` ``. Runs as preprocessing BEFORE Claude sees the skill content. Works in SKILL.md and skill prompt files loaded via `Load:` directive. Does NOT work in CLAUDE.md. Can be disabled via `"disableSkillShellExecution": true` in settings. Our 3 skills using this (`init-client-project`, `client-project-orchestrator`, `content-calendar-planner`) are correctly implemented.

- **2026-04-19** | Skill trigger keywords: word-soup (comma-separated single words like "technical, analysis, seo, optimization, api") causes false-positive triggers that fire on unrelated conversations. All triggers must be specific multi-word phrases that unambiguously indicate this skill is needed. Fixed 27 skills with word-soup triggers in this session. Rule: if any individual word in the trigger could appear in a non-related message, the trigger is too broad.

- **2026-05-12** | `search-skills.js` requires the `orchestrai-postgres` service to be running. If the service is down, the script exits with a connection error — it does NOT fall back silently. The orchestrai-master-coordinator depends on this for skill discovery. Workaround when postgres is unavailable: use `Glob(pattern=".claude/skills/[domain]/*")` to browse skill directories directly and match by name. Always verify the service is up before delegating complex multi-domain tasks through the master coordinator.

- **2026-02-17** | Skills-first architecture: 161 skills via progressive disclosure (~4k tokens startup). Originally 12 Opus strategic agents as Task subagents. Everything else is a skill. (Updated 2026-04-17: now 4 agents — see agent cull entry below.)
- **2026-02-17** | Agent backup at `.claude/agents-backup-20260217/` — do not delete.
- **2026-04-17** | Agent cull: Reduced from 12 → 4 strategic agents. Deleted 8 that were dormant, redundant, or had fake ML claims. All 8 still exist as skills in `strategic-planning:` domain. Rule: Opus agents only when the task genuinely requires isolated subagent context with full separate reasoning. If a skill can do it, use a skill.
- **2026-04-17** | Agent descriptions must use routing-first format: "Use this agent when [specific trigger conditions]..." — not capability marketing copy. Claude Code uses the description field to decide whether to delegate; vague descriptions mean the agent never gets invoked.
- **2026-04-17** | Thinking budgets should match actual task complexity — not all set to max. Complex synthesis (strategic plan, financial model): 10000. Multi-domain analysis: 6000. Single-domain analysis: 4000. Coordination/planning: 3000. Simple audits: 2000. Max on everything wastes tokens and slows responses.
- **2026-04-17** | Skill trigger keywords must be user-facing phrases, not words from the description. Bad: "lstm, neural, networks, real, time". Good: "performance forecast, web vitals trend, proactive performance". The skill loads when a user's message contains these words.
- **2026-04-17** | client-project-orchestrator agent must always: (1) read LEARNINGS.md at session start, (2) read project CLAUDE.md, (3) append a progress entry when work is done. Abstract capability descriptions in agent prompts are useless — only operational protocols with real file paths and skill names matter.

- **2026-04-22** | Skills invocation canonical pattern: `Skill(skill="domain", args="skill-name")` is the ONLY correct form for domain skills. The colon namespace form `Skill(skill="domain:skill-name")` is BROKEN — do not use it in any agent file, skill prompt, or documentation. Exception: commands/ namespace uses colon correctly: `Skill(skill="commands:init-client-project")`. This distinction is documented in SKILLS-SYSTEM-INTEGRATION-ISSUE.md.

---

## HOW TO ADD A LEARNING

Use `/learn` command or add directly to this file. Format:

```
- **[date]** | [brief description of mistake or decision and correct approach]
```

Put it in the most specific section: client-specific > domain > global.

---

## PRUNING PROTOCOL

This file is loaded at every session start. Keep it lean.

**Prune when:**
- An entry is superseded by a newer entry on the same topic — delete the old one
- A client project is closed/archived — move client-specific entries to the project CLAUDE.md and remove from here
- An entry describes a one-time fix already baked into code/agent — delete it
- The file exceeds ~250 lines — review and cull entries older than 90 days that are no longer load-bearing

**Never prune:**
- Hard constraints (plugin preferences, legal/compliance rules, client service facts)
- Architectural decisions still in effect
- Mistakes that are easy to repeat (keep the reminder)
