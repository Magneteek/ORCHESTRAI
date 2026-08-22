# ORCHESTRAI System Learnings

> **This file is the living memory of what works, what doesn't, and decisions made.**
> All agents and skills check relevant sections before executing.
> Add new learnings via `/learn` command or directly edit this file.

Last updated: 2026-08-21 (content-integrity gate added: fabrication check before publishing any pipeline-generated article; WP search-endpoint false-positive caveat)

---

## HOW AGENTS USE THIS FILE

Every agent must read this file at session start and apply the relevant sections. Skills running in main context inherit these learnings automatically via CLAUDE.md.

---

## GLOBAL (applies to all domains and clients)

### Mistakes to Never Repeat

- **2026-06-20** | [WordPress/MCP] **NEVER make parallel WordPress MCP calls.** 14 simultaneous REST API write requests crashed fuerteventura.page (OOM-killed PHP-FPM/MySQL, took the site down). Each WP REST API write boots the full PHP runtime + all plugins — 14 concurrent = ~500MB–1.8GB RAM spike on a small VPS. Always create/update WordPress posts **sequentially**, one at a time, regardless of how many there are.

- **2026-03-05** | [SEO/Content] Plugin confusion: Always confirm which WordPress SEO plugin a client uses before giving instructions. Never assume Yoast — some clients use SEOpress, RankMath, etc.

- **2026-07-04** | [Advertising/Landing Pages] **NEVER build an ad landing page whose primary CTA redirects off-domain to a separate booking page.** Built the nasmehpg protetika LP with every CTA pointing to `nasmehpg.si/termin/` instead of an embedded form — a basic paid-traffic CRO mistake (every extra hop loses conversions, breaks UTM/attribution continuity) that the client's own prior LP (whitening campaign) had already correctly avoided with a native embedded form. Caught only when the client reviewed the page directly. The primary conversion action on any ad LP must be an on-page form; `tel:` links are fine as a secondary channel only. Codified as a hard rule in `campaign-conductor.md`.

- **2026-07-04** | [Advertising/Landing Pages] Don't ship a "thin" landing page — a hero + price table + 2-3 FAQs is not launch-ready. Check against an LP completeness checklist (trust/differentiation signal beyond star rating, process/how-it-works section, financing section if price triggers cost objection, 4-6 FAQ items covering real objections) before marking ready, and if the client has an existing proven LP for a prior campaign, use it as the structural floor — don't ship something visibly thinner than their own precedent. Codified in `campaign-conductor.md`.

- **2026-07-04** | [System/Agent Architecture] `campaign-conductor` was reimplementing a thinner, unsafe version of what `advertising:paid-advertising-pipeline` already did properly (no copy manifest, no compliance gate, no checkpointing) — this duplication is what produced the LP redirect/thin-page mistakes, not a one-off writing error. Fixed by rewriting `campaign-conductor` as a thin cross-domain coordinator: it now invokes `paid-advertising-pipeline` for strategy/offer/copy/compliance/LP-brief, and only handles what that skill explicitly does not (physical LP build via webdev, independent LP audit, client tracking-ID registry, final delivery). **Lesson for this system generally**: before building agent logic inside a conductor, check whether a more rigorous skill for that exact job already exists elsewhere — this system has had at least two instances now (`cro-page-auditor` sitting unused while a bespoke audit was hand-rolled; `paid-advertising-pipeline` sitting unused while `campaign-conductor` reimplemented it) of duplicate/parallel capability where the better one wasn't discovered because nothing routes to it. Fixed the routing in `CLAUDE.md`'s decision tree for advertising; worth periodically auditing other domains (SEO, content, webdev) for the same pattern.

- **2026-07-04** | [System/Skills] **The 2026-04-21 SKILL.md frontmatter fix was incomplete — 123 of 208 skills (59%) across the whole system were still missing the YAML frontmatter required for `Skill()` auto-invocation**, discovered only because a specific skill (`slovenian-ai-phrase-detector`) silently failed with "Unknown skill" mid-session. The 2026-04-21 fix note claimed "all pipeline skill SKILL.md files" were fixed — it was scoped to pipeline skills only, not individual skills across content/advertising/conversion-optimization/etc. Fixed system-wide via a script (walks all `*/*/SKILL.md`, extracts the `## Overview` paragraph, prepends it as `description` frontmatter) rather than by hand. **Important caveat discovered the hard way**: editing a SKILL.md file's frontmatter mid-session does NOT make it invocable in that same session — skill metadata loads once at session start, so a fix only takes effect on the next session. Don't waste time re-testing `Skill()` calls against a just-patched file in the same conversation. **Prevention**: any newly created skill's SKILL.md must include `---\ndescription: ...\n---` frontmatter from creation — this is apparently easy to forget and has now regressed twice.

- **2026-07-05** | [Writing/Global] **NEVER use em-dashes (—) or double-dashes (--) in any generated content, in any project — this is an absolute rule, escalated emphatically before, and it was still violated wholesale in a single session.** Drafted 11 full articles + 9 CPT entries + 20 SEOPress meta fields for the FTV project with hundreds of em-dashes throughout (18–42 per article), only caught when the client spotted them in the SEO title/description fields — the actual body copy was far more affected than what triggered the catch. Root cause: the rule lives in memory but isn't checked as an explicit gate before or during drafting; it's easy to write fluent prose with em-dashes as a stylistic default and never re-scan for the banned character. Fix applied: grep every generated file for `—` and `--` before considering content "done," not just before publishing. If any are found, rewrite per-sentence with the punctuation that actually fits (period, comma, colon, semicolon, parentheses, connecting word) — never a blind find-replace, which produces broken grammar. **Prevention**: treat "grep for em-dash, zero results" as a hard completion criterion for any content deliverable, the same way a build must pass before it ships.

- **2026-08-21** | [Content/Integrity] **Never publish content from a generation pipeline without a fabrication check first — AI-written "case studies" invent named clients and results that read as real testimonials.** Attempting a routine merge on deletereviews.nl (expand the live kosten page with a prepared 4,459-word ROI article) triggered a recon pass that found the source article contained fabricated named client success stories — "Van der Berg Schoenen" (rating 2.1→4.6, "ROI van 10.515%"), "Legal Partners Rotterdam" ("€1.620.000 extra omzet", "ROI van 85.347%") — presented as genuine DeleteReviews.nl clients, plus a tiered pricing model that never existed (€297–€2.997 packages, versus the real €295–€495 No Cure No Pay), money-back guarantees the business does not offer ("geld-terug-garantie zonder vragen", "resultaatgarantie van 90 dagen"), and invented Dutch market statistics stated as fact. The article had been sitting in `deliverables/` since 2026-05-04 marked "READY FOR PUBLICATION" and would have been published as a routine task. Nothing reached the site. **The defect was batch-wide, not one bad file**: scanning the other nine articles from the same pipeline run for the signature (invented % claims, ROI figures, emoji-headed widget stubs with literal `____` blanks) disqualified three more outright. **How to apply**: (1) before publishing ANY pipeline-generated article, grep for invented-authority markers — `ROI van [0-9]`, `[0-9]{3,}%`, quoted company names, "succesverhaal"/"case study" — and read every hit; (2) treat a "ready for publication" status file as a claim to verify, never as a fact ([[feedback_verify_live_status_before_trusting_tracker]]); (3) any commercial specifics (pricing, guarantees, refund terms, client results) must come from the client, never from the model — if the fact isn't supplied, the correct output is a question, not a plausible number; (4) the risk scales with the client's own positioning — here the business sells *fake-review removal* and cites the Wet oneerlijke handelspraktijken and the ACM's €2m fines on its own live pages, so publishing invented testimonials would have been the exact practice it sells a remedy for.

- **2026-08-21** | [WordPress/Audit] **`wp-json/wp/v2/search` matches partial words independently — do not use it to check whether a phrase is live.** Searching deletereviews.nl for "Legal Partners Rotterdam" and "Professional pakket" returned apparent hits on two live pages; both were false positives (the endpoint matched "Partners"/"Rotterdam"/"pakket" separately). Direct inspection of the post content via `wp-json/wp/v2/posts/<id>?context=edit` found neither phrase. When auditing whether specific copy leaked onto a live site, always fetch and grep the actual post content — a search-endpoint hit is a lead to verify, not evidence.

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

- **2026-07-05** | **Drafted 11 articles against briefs and self-certified them complete by checking H-tags and PAA coverage only — never invoked `content-quality-validator` against the actual brief files.** `content-quality-validator` already exists, already takes `brief_path` as an input, and already scores "Missing internal links (where brief required them): -5 points per absent link" under Technical Quality — it would have caught this immediately. Instead I informally judged "I added some plausible internal links" as sufficient, without checking those links against the specific list each brief's "Technical SEO" and "Monetisation Hooks" sections named. Result: 7 of 11 articles were missing their required `where-to-stay` monetisation link, 3 of 11 (Sotavento, Cofete, Diving) had **zero internal links at all**, and one explicit brief instruction ("don't force the shared FAQ into April, it's not in April's PAA set") was directly violated. This is the same class of mistake as the 2026-07-04 campaign-conductor entry: a more rigorous existing tool sat unused while a hand-rolled, weaker check was substituted. **Fix**: after drafting content against a brief, always run `content-quality-validator` with `brief_path` set to the real brief file before declaring the draft done — do not substitute an informal "looks compliant" read-through, especially for internal-linking/monetisation-hook specs, which are mechanical presence/absence checks that a careful read-through systematically under-weights against narrative-quality checks (tone, PAA coverage, headings) that are more visually obvious while reading.

**Follow-up same day**: attempted to actually invoke this fix and hit a second, separate bug — `Skill(skill="content-quality-validator")` (the flat invocation the content domain's own README prescribes) returns `Unknown skill: content-quality-validator`, i.e. the skill is not discoverable/invocable this session despite its SKILL.md having correct frontmatter. This is the same failure class as the 2026-04-19/04-21 skill-registration entries above — a skill that should be invocable per its own domain documentation, isn't. **Until this is fixed and verified working**, treat `content-quality-validator` as unavailable and do NOT assume citing it in a process fix is sufficient — internal-link/monetisation-hook compliance for brief-driven content must be checked with a mechanical grep of each brief's "Internal links out" list against the draft's actual `<a href>` tags (fast, reliable, no LLM judgment needed for presence/absence) until the skill invocation is confirmed working again.

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

- **2026-07-04** | Never gate a Meta Pixel's `Lead` (or any) event behind Google Consent Mode's `ad_storage` signal (e.g. `fbq('consent','revoke')` by default, only granting when GCM reports `ad_storage: granted`). Found on nasmehpg.si — silently dropped real Lead events for over a week during a live campaign because the two consent systems don't need to be coupled and the coupling adds a second failure point. Fix: drive `fbq('consent', ...)` from the site's own CMP's marketing-cookie category directly, not from Google's derived signal, and add Meta Conversions API (server-side) as a backstop for the true conversion event so it's captured independent of browser consent state. Check this pattern on every client site before trusting Meta ad performance numbers for budget decisions.

- **2026-07-04** | Campaign audience validation must include a clinic-hours/availability check, not just demographic targeting — a "professionals 20–60" audience failed on nasmehpg's whitening campaign in part because the clinic is only open 07:00–14:00 on 3 of 5 weekdays (no evening access those days), which a standard 9-to-5 worker can't accommodate without taking time off. Always cross-check the target audience's realistic schedule against the actual business hours before finalizing targeting, and state the finding explicitly (even a partial mismatch) rather than assuming demographic fit implies scheduling fit.

### Established Decisions

- **2026-04-19** | Ad copy and landing page copy must be produced from a shared brief — `advertising:campaign-copy-manifest`. The manifest runs AFTER offer architecture (Phase 3) and BEFORE copy production (Phase 4) in paid-advertising-pipeline. Without the manifest, ad copy and LP copy are produced independently and use different language, making different promises (message mismatch = primary conversion killer in paid campaigns).

- **2026-04-19** | Message match is a hard constraint, not a suggestion: Ad headline ≡ LP H1. The same specific claim, framed for the same reader. Google Ads Headline 1 must mirror the LP H1. Meta hook must set up the promise the LP H1 delivers. Validated via message match checklist before delivery.

- **2026-04-19** | campaign-copy-manifest phases: Competitor creative research (Facebook Ad Library via WebFetch URL — NOT site: search — + Google SERP ads + competitor LP WebFetch) → Audience language mining (DataForSEO search_intent + related_keywords + review scraping for verbatim customer phrases) → Offer competitive position audit → Message architecture (primary claim, proof hierarchy, objection stack, CTA hierarchy) → Per-asset brief cards (LP, Google, Meta, LinkedIn, Reddit) → Copy Compliance Checklist. Saves to projects/[uuid]/deliverables/advertising/. Invoked as Phase 3.5 in paid-advertising-pipeline — checks for existing manifest before regenerating.

- **2026-04-19** | The best ad copy uses the customer's exact words — mined from reviews, forums, Reddit threads, competitor testimonials. Phase 2 of campaign-copy-manifest (audience language research) is not optional. Copywriter language loses to customer language every time.

---

## WEBDEV

### Mistakes to Never Repeat

- **2026-07-27** | [WebDev/SEO] **A layout check that only passes on desktop proves nothing — Google indexes mobile-first, meaning Googlebot Smartphone's mobile render is the authoritative one for ranking, not desktop.** Built an embedded lead-capture form into a homepage hero (ReviewRemovalFlorida) and verified it looked correct — but only checked desktop (1280×800), where the form rendered fully in-viewport at `top: 334px`. A real mobile measurement (375×812) found the same form landing at `top: 1201px`, fully below the fold, because the two-column hero collapsed to a single stacked column and all the hero copy ran its length above the form first. The bug was invisible unless mobile was checked specifically — desktop passing gave false confidence. **Always resize to mobile viewport (375×812) first for any above-fold/hero layout check, and treat it as the pass/fail viewport; desktop is secondary confirmation only.**

- **2026-07-27** | [WebDev] **Never fix a mobile-viewport layout-order problem with CSS `order`/`grid-area`/`grid-row` — reorder the actual HTML/element source instead.** The instinct when a component renders too low on mobile is to reposition it with CSS, but that just moves the same DOM-order-vs-visual-order mismatch to a different form (now the DOM sequence a crawler reads doesn't match what a human sees, exactly the defect `seo-visual-semantics-auditor`/`bricks-visual-semantics-checker` are built to catch). Correct fix: split the wrapping container so the element that needs to appear earlier is genuinely earlier in the source on every breakpoint (e.g. extract secondary/supporting copy out of a hero-text block into a sibling that comes after the functional element in source order). Fixed this way on ReviewRemovalFlorida's homepage — form moved from 1201px to a container starting at 693px on mobile, confirmed by re-measuring, not by re-reading the diff.

### Established Decisions

- **2026-07-27** | [WebDev] **Primary conversion actions (lead forms, booking, purchase) must be embedded on-page elements, never a link/redirect to a separate page — generalized beyond the original ad-LP-only scope.** This rule already existed in `campaign-conductor.md` for ad landing pages specifically (after a 2026-07-04 redirect-instead-of-form mistake). Extended to `webdev-conductor.md` as a general "Conversion Element Rule" for any web build, since every extra page hop is an avoidable drop-off point regardless of traffic source. Where the same form needs to appear on many pages without a bespoke section on each, use a shared modal/popup triggered on-page (e.g. Bricks `_interactions`, never a link) rather than duplicating markup per page.

- **2026-07-27** | [WebDev/SEO] **Two new skills codify Koray Tugberk Gubur's "visual semantics" framework** (distinct from, and complementary to, his textual/topical-authority framework already in `seo-topical-authority`): `seo-visual-semantics-auditor` (seo domain — platform-agnostic, Playwright-driven, mobile-first) and `bricks-visual-semantics-checker` (webdev domain — Bricks Builder element-JSON audit for hidden-content flags, risky element conditions, dynamic-data context mismatches). Both wired into `design-production-pipeline` as new Gate 4H and `webdev-conductor.md`'s Phase 2 Checkpoint 2. See `orchestrai-domains/seo/CLAUDE.md`'s "Visual Semantics" section and `orchestrai-domains/webdev/CLAUDE.md`'s best-practice #6 for the framework summary.

- **2026-07-27** | [WebDev/Localization] **WhatsApp field framing should not assume US-wide adoption the way it can for European markets.** Only ~32% of US adults use WhatsApp regularly (vs. ~90%+ in the Netherlands), so don't port a "WhatsApp / phone" field label from a European sister site directly. However, Hispanic Americans are the heaviest US WhatsApp users at 56% active (vs. 22% for White Americans) — relevant for any Florida-market client given the state's large Hispanic population, especially Miami-Dade. Pattern used: label the field "Phone Number" with helper text like "SMS or WhatsApp — we'll reach you either way" rather than leading with WhatsApp in the label itself.

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
- **CRITICAL — No Vincismile brand in content**: Never mention "Vincismile" by name in nasmehpg articles. Content must be evergreen — use "nevidni zobni aparat", "nevidne opornice", "nevidne ortodontske opornice", or "sistem nevidnih opornic" instead. In comparison tables/headings where the nasmehPG column was previously labelled "Vincismile (nasmehPG)", use "Nevidne opornice (nasmehPG)".
- **CRITICAL — No hardcoded Leanpay math**: Never hardcode a specific monthly Leanpay amount (e.g. "34,76 €/mes") in nasmehpg articles. Leanpay terms change with promos and pricing updates. Give it as an example range ("okvirno ~35 €/mes", "bistveno pod €50") and always add a note directing readers to check current terms at nasmehpg.si or at the first appointment.
- **CRITICAL — Correct clinic address**: **Podreber 14D, 1355 Polhov Gradec**. Never use "Polhov Gradec 6", "Polhov Gradec 56", "Polhov Gradec 65", or "Polhov Gradec 67" — all wrong. The village name is Podreber; the postal municipality is Polhov Gradec. Always use this exact form in schema JSON-LD streetAddress fields and any content references to the physical address.

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

- **2026-07-26** | [System/Skills] **CLAUDE.md's stated "canonical" invocation pattern for domain sub-skills — `Skill(skill="domain", args="skill-name")` — is unreliable and reproduced its documented failure mode a THIRD time this session, across two different skills and one commands/ skill.** `Skill(skill="seo", args="seo-reddit-research ...")` returned only the `seo` domain's overview SKILL.md text (with the args echoed back as a literal `ARGUMENTS:` block, unexecuted) instead of running the sub-skill. A pipeline-conductor subagent hit the identical failure independently on `content-brief-generator` and `lexical-enrichment-specialist` in the same session and had to fall back to reading each skill's `prompts/main-prompt.md` directly and executing it by hand. Separately, `Skill(skill="commands:learn", ...)` — the colon form CLAUDE.md documents as the one correct exception for the commands/ namespace — failed outright with `Unknown skill`, even though `commands/learn/SKILL.md` has valid `name:`+`description:` frontmatter (unlike most domain sub-skills, which have `description:` only, no `name:` field — a plausible but unconfirmed root-cause lead for why sub-skills don't register as independently invocable). This is the same failure class already logged under CONTENT (2026-04-21 line ~70, 2026-07-05 line ~84) but confirmed here as cross-domain (SEO + CONTENT + COMMANDS), not content-specific. **Do not trust either documented invocation pattern (domain+args, or commands: colon-form) as reliable** — before depending on a specific sub-skill's logic actually running, either test it with a trivial call first, or skip `Skill()` entirely and `Read()` the target skill's `prompts/main-prompt.md` directly, then execute its documented process by hand. This is the only workaround confirmed to work every time so far. **This needs an actual engineering fix** (likely: give every sub-skill's SKILL.md a `name:` frontmatter field and verify the routing logic actually reads it), not another per-skill patch — three separate "fixed it" entries already exist in this file for variations of the same underlying bug.

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
