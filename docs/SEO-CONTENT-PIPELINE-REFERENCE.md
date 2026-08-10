# SEO Content Pipeline: Complete Reference

**Scope**: the full chain from keyword strategy to WordPress-ready published content.
**Generated**: 2026-08-08 by reading the actual skill prompts, not from documentation summaries.

---

## 1. The chain at a glance

Three pipelines stack. Each one owns a different altitude and writes its own manifest.

```
seo-research-pipeline            (strategy)   -> content-brief-queue
        |
seo-to-content-pipeline          (batching)   -> per-article orchestration
        |
content-production-pipeline      (one article) -> validated markdown + WP HTML
        |
commands:publish-to-wordpress    (delivery)   -> WordPress drafts
```

| Layer | Skill | File | Model | Owns |
|---|---|---|---|---|
| 0 | `seo-research-pipeline` | `.claude/skills/seo/seo-research-pipeline/` | sonnet, thinking 8000 | Keywords, clusters, URL map, content queue |
| 1 | `seo-to-content-pipeline` | `.claude/skills/seo/seo-to-content-pipeline/` | sonnet, thinking 4000 | Queue reading, batch selection, per article loop |
| 2 | `content-production-pipeline` | `.claude/skills/content/content-production-pipeline/` | sonnet, thinking 3000 | Brief, Reddit voice, outline, frame gate, write, QA, language, medical, HTML, Notion |
| 2b | `seo-reddit-research` | `.claude/skills/seo/seo-reddit-research/` | sonnet | Real audience language via Apify thread scraping |
| 2a | `content-brief-generator` | `.claude/skills/content/content-brief-generator/` | sonnet, thinking 6000 | SERP research, PPR entities, lexical enrichment, 14 field section spec |
| 3 | `commands:publish-to-wordpress` | `.claude/skills/commands/publish-to-wordpress/` | sonnet | Bulk draft creation with SEOpress meta |

You can enter at any layer. Layer 2 runs standalone with a keyword plus a brief. Layer 1 only exists to avoid re-typing context for every article in a batch.

---

## 2. Universal protocols (apply to all three pipelines)

### 2.1 Manifest first

Before executing any phase:

1. Resolve `run_dir`.
2. `Read([run_dir]/manifest.json)` if it exists.
3. Per phase: if status is `completed` AND the checkpoint file exists, skip the phase and `Read()` the checkpoint. Otherwise run it.

Checkpoint files are the authoritative source of truth, not the conversation. Never re-run a completed phase.

Run directories:

```
/projects/[client_uuid]/pipeline-runs/seo-research/[domain_slug]-[date]/
/projects/[client_uuid]/pipeline-runs/content-production/[keyword_slug]-[date]/
/projects/[client_uuid]/pipeline-runs/content-brief/[keyword_slug]-[date]/   (standalone brief only)
/temp/pipeline-runs/...                                                      (no client_uuid)
```

`client_uuid` must be the **full project directory name** (`nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e`), not a bare UUID. If `/projects/[client_uuid]/` is missing, the content pipeline STOPS and tells you to run `Glob('projects/*')`.

### 2.2 Resume behaviour

Existing manifest found: display the phase status table, then ask **Resume** (skip completed phases, load their files) or **Start fresh** (append `-v2`, `-v3` to run_dir, never overwrite a previous run).

### 2.3 Failure protocol (differs by pipeline)

**content-production-pipeline (hard stop)**
1. Write `[run_dir]/phase-[N]-error.md` with phase name, error, missing data.
2. Manifest phase status becomes `failed` plus `failure_reason`.
3. Stop immediately. Do not advance.
4. `failed` is terminal. On resume it does NOT auto retry. Read the error file, show the reason, wait for the user.

**seo-research-pipeline (degrade, do not halt)**
1. Mark the phase `failed` with a timestamped `failure_reason`.
2. Continue downstream, substituting the literal placeholder `[DATA GAP - phase-Xn failed: reason]`. Never fabricate.
3. Blocking dependencies that DO force a stop:
   - 1a keywords failed, everything depends on KW_DATA
   - 2 synthesis failed, no unified keyword list
   - 3a / 3b / 3c failed, no URL map means Phase 7 has no inputs
4. Non blocking: 1b, 1c, 1d, 1e, 1f, 2b, 4a to 4e. Phase 5 and 6 retry once.

**seo-to-content-pipeline (per article isolation)**
Any step fails after 2 retries: mark that article `failed`, record the error, continue with the next article. One bad article never blocks the batch.

### 2.4 File path handoff rule

Skills pass **file paths**, never pasted text. Downstream skills `Read(path)`. This is what keeps a 4,000 word brief plus a 3,000 word outline plus a 3,500 word draft from exploding the context. Violating it is the single most common cause of a pipeline run degrading in quality near the end.

---

## 3. Layer 0: seo-research-pipeline

**Preflight**: read `LEARNINGS.md` and apply the SEO section. Never output JSON as a strategy document. Synthesis is always the pipeline's own job, never delegated to a subagent.

### Required inputs

| Input | Required | Note |
|---|---|---|
| Domain | Yes | `nasmehpg.si` |
| Niche / services | Yes | Drives specialisation routing |
| Target market | Yes | Country plus language. If missing, ASK. DataForSEO silently returns wrong data when defaulted |
| Local business | Yes | Gates Phase 4a |
| Healthcare / medical | Yes | Gates Phase 4b and forces 4d on |
| Seed keywords | Optional | 3 to 5 anchors |
| Known competitors | Optional | Otherwise discovered |
| client_uuid | Recommended | Determines save location |

### Phase order and execution mode

| Phase | Name | Mode | Output variable | Checkpoint |
|---|---|---|---|---|
| 0b | Ranking baseline snapshot | Inline | BASELINE_DATA | `phase-0b-baseline.md` |
| 1a | Keyword research | Subagent skill | KW_DATA | `phase-1a-keywords.md` |
| 1b | Competitor analysis | Parallel batch | COMP_DATA | `phase-1b-competitors.md` |
| 1c | Technical analysis | Parallel batch | TECH_DATA | `phase-1c-technical.md` |
| 1d | Intent mapping | Parallel batch | INTENT_DATA | `phase-1d-intent.md` |
| 1e | Psychographic research | Parallel batch | PSYCHO_DATA | `phase-1e-psychographics.md` |
| 1f | SERP feature analysis | Inline, after 1b to 1e | SERP_FEATURE_DATA | `phase-1f-serp-features.md` |
| 2 | Synthesis | Inline | merged opportunity set | `phase-2-synthesis.md` |
| 2b | Content inventory | Inline | INVENTORY_DATA | `phase-2b-inventory.md` |
| 3a | Semantic clustering | Skill plus pipeline merge | CLUSTER_DATA | `phase-3a-clusters.md` |
| 3b | Topical authority | Skill | AUTHORITY_DATA | `phase-3b-authority.md` |
| 3c | URL map | Inline | URL_MAP | `phase-3c-url-map.md` |
| 4a to 4e | Specialisations | Conditional, parallel | LOCAL / MEDICAL / ENTITY / AI_OVERVIEW / LINK_DATA | `phase-4x-*.md` |
| 5 | Validation gate | Inline | warnings only | `phase-5-validation.md` |
| 6 | Strategy report | Inline | deliverable | `phase-6-strategy-report.md` |
| 7 | Content brief queue | Inline | the handoff | `phase-7-content-queue.md` |

Execution: 1a alone first, then 1b + 1c + 1d + 1e simultaneously, then 1f alone (it is inline and needs KW_DATA).

### Phase specific rules that change the output

**0b Baseline**: this is the measurement anchor for the 90 day review. If DataForSEO returns nothing, record "New domain, no organic baseline" rather than skipping. Seed keyword positions become the explicit watch list.

**1f SERP features, the format override engine**. For the top 20 keywords by volume, record the dominant SERP feature and derive a format implication:

| Feature | Format implication |
|---|---|
| Local Pack | Local / Geographic page plus GBP work, not an article. Sets `local_seo: true` |
| Featured Snippet | Answer first, direct answer in the first 40 to 60 words, structured H2/H3 |
| PAA box | FAQ Node type, each answer 60 words maximum then elaborate |
| Shopping | Not targetable with content. **Remove from the queue**, flag as a paid channel opportunity |
| AI Overview | Sets `ai_overview_risk: true`, carried into Phase 4d and into the queue |
| Knowledge Panel | Entity Optimization, carried into Phase 4c |
| Video Carousel | Content alone insufficient, video asset needed |
| None | Standard organic long form opportunity |

**False quick win check**: a KD under 30 keyword sitting behind a Local Pack is not a content quick win. Reclassify as "Local Quick Win" and route to 4a.

**2 Synthesis** opportunity classes: Quick Win (vol > 0, KD < 30, commercial or transactional intent, not currently ranking), Strategic Play (high volume, KD 30 to 70, confirmed competitor gap), Long Game (KD > 70, 6 to 12 months), Informational Foundation (needed for topical authority).
Technical priority: P1 Fix Now (crawl blocks, indexation errors, broken canonicals, failing CWV), P2 Fix Soon (missing titles, duplicate H1, redirect chains over 2 hops), P3 Improve (schema, alt tags).
Phase 2d leaves the content gap line as `[TBD - updated after Phase 2b content inventory]`. Do not estimate it.

**2b Content inventory**: discovery order is sitemap.xml, then DataForSEO `domain_keywords`, then `site:` WebSearch as a last resort. Coverage status per URL is Covered, Partial, Missing, or Out of scope. Coverage score is reported as a range ("35 to 50 percent"), never false precision. Step 2b-5 patches the `[TBD]` line in phase-2-synthesis.md, and the manifest may only be marked complete **after** that patch is written, so a crash mid-patch re-runs cleanly.

**3a to 3b**: coverage fields are merged onto clusters by the pipeline, not by the clustering skill. Topical authority receives explicit instructions: do not put Already-Covered topics in the build sequence, mark Partial as Update rather than New, and honour SERP_FEATURE_DATA format overrides. Keywords marked "Shopping, skip" must not appear at all.

**3c URL map**: extract the live category structure and permalink pattern from TECH_DATA and INVENTORY_DATA first. New URLs must follow the existing taxonomy. Do not invent categories that already exist live.
Conflict checks: duplicate slugs, cannibalisation risk within a category, Hub Documents accidentally under a category path, existing URL conflict (becomes UPDATE not NEW), category mismatch (flag NEW CATEGORY, needs WordPress setup), and reserved WordPress slugs (`page`, `feed`, `author`, `category`, `tag`, `search`, `attachment`, `embed`, `wp-*` and friends) which must be renamed with a niche qualifier.

**5 Validation gate is WARN only, it never blocks delivery.** Checks include: confirmed (not estimated) volumes, at least 30 keywords, 3 or more competitor domains, page specific technical issues, inventory ran with a real source, 2 or more persona segments, 6 or more pain points with verbatim language, zero unresolved cannibalisation flags, NEW CATEGORY flags carried into the report, Phase 4d ran or was explicitly skipped with a reason, 1 pillar plus 3 clusters per major service, baseline exists, no phase marked failed, action plan is specific, every high priority queue item has complete inputs, and at least one UPDATE item if Partial coverage exists.

**7 Content brief queue, the actual handoff.** Per item it sets content type and word count band:

| Type | Word count | content_type label |
|---|---|---|
| Hub Document / Pillar | 3,000 to 4,500 | pillar page / comprehensive guide |
| Instructional / How to | 1,500 to 2,200 | instructional article |
| Comparative | 1,200 to 2,000 | comparison article |
| FAQ Node | 800 to 1,400 | FAQ article |
| Experience / Case study | 1,000 to 1,800 | experience / case study |
| Local / Geographic | 800 to 1,200 | local service page |
| Definitional | 600 to 1,200 | definitional / educational article |

Then it layers on: brief-first flag (Tier 1 Hubs and anything over 2,500 words), persona plus primary objection plus vocabulary rule plus decision trigger from PSYCHO_DATA, SERP format validation and override (recalculating `url_path` if post_type changes, marked URL PATH CORRECTED), and specialisation flags `local_seo`, `ymyl`, `entity_optimization`, or `standard`.

Every queue item emits a copy-paste pipeline input block containing `keyword, language, niche, word_count, content_type, brief_path, url_path, action, existing_url, existing_content_note, persona, primary_objection, vocabulary_note, decision_trigger, flags, ymyl_requirements, local_requirements, ai_overview_risk, ai_overview_note`.

Queue status protocol: Queued to In Progress to Published (with URL) or Blocked (with reason). Update the row by Read then Edit then Write. Never regenerate the queue.

**Deliverables promoted**: `/projects/[uuid]/deliverables/seo/strategy-[domain_slug]-[date].md` and `content-queue-[domain_slug]-[date].md`, plus an appended progress entry in the project `CLAUDE.md`.

---

## 4. Layer 1: seo-to-content-pipeline (the bridge)

`run_dir` = `pipeline-runs/seo-to-content-[client-slug]-[date]/`. Article level status is tracked individually: `pending, brief-done, drafted, validated, complete, failed`.

**Inputs**: client name, client UUID, seo run dir (all required); batch tier (default T1), batch size (default 3, max 5), content type override, language override, healthcare mode.

### Phase 0, queue reading and batch selection
Read `content-brief-queue.json`, falling back to `phase-4-content-briefs.json` then `phase-3-content-opportunities.json`. Read the client `CLAUDE.md` for brand voice. Filter by tier, sort by priority ascending, take the first `batch_size` items with status not complete.
Preflight: warn if no client CLAUDE.md exists ("brand voice will be generic"), and skip any article missing keyword, language, or content_type.

### Phase 1, per article, strictly sequential
Sequential, not parallel, to avoid context bleeding and to allow mid batch recovery.

- **1.1 Brief**: invoke `content-brief-generator` with `STANDALONE_MODE = false` so it consumes the SEO research context instead of repeating keyword research (avoids duplicate API spend).
- **1.2 Production**: route to `content-production-pipeline`, or `healthcare-content-pipeline` when `healthcare_mode = true`. Pass `run_dir: [bridge_run_dir]/articles/[keyword-slug]/` and `skip_keyword_research: true`.
- **1.3 SEO fit validation**: invoke `seo:seo-content-optimization`. Checks keyword in title, H1, first 100 words, 3 or more natural body occurrences; secondary keyword coverage; heading keyword distribution; word count vs SERP; intent match; schema confirmation; 2 to 3 internal links; title at or under 60 chars and meta description at or under 160 chars. **Threshold: 75. Below 75 returns to 1.2 with specific corrections.**
- **1.4 Package assembly**: build the WordPress ready deliverable with meta block, internal link map (link FROM and link TO), schema type and plugin-specific implementation note, full article, and a publication checklist tailored to the client's actual SEO plugin (SEOpress vs Yoast, read from client CLAUDE.md).

Saved to `projects/[uuid]/deliverables/content/[keyword-slug]-[YYYY-MM].md`.

### Phase 2, batch delivery report
Batch summary table, total words, average SEO score, next batch preview, failed articles with recommended fixes, **publication order recommendation** (pillar first so spokes have something to link to), and an internal linking web map. Then append to project `CLAUDE.md` and mark the completed items in the source queue so re-runs skip them.

**Explicitly out of scope here**: keyword research, competitor analysis, WordPress publishing, translation, social adaptation, image creation.

---

## 5. Layer 2: content-production-pipeline (per article, the core)

### 5.1 Required inputs

Hard required: brief, target keyword, language, content type, word count target, client or niche.
Recommended: `client_uuid`.
Optional but they materially change the output: secondary keywords, outline, run SERP research yes/no, `url_path`, `action` (NEW or UPDATE), `existing_url`, `persona`, `primary_objection`, `vocabulary_note`, `flags`, `ymyl_requirements`, `local_requirements`, `ai_overview_note`.

Rules attached to inputs:
- When persona, objection, and vocabulary_note are supplied they are **the audience brief**, not optional colour. They must shape the opening, tone, and lead vocabulary and must be passed explicitly to the writer.
- When `action = UPDATE`, WebFetch `existing_url` **before** Phase 0.5 and note what is thin, outdated, or missing. The outline architect enhances, it does not replace.
- When flags include YMYL, Phase 4 medical check is mandatory regardless of the niche setting.

### 5.2 Phase 0, SERP research (conditional)

Runs when "Run SERP research" is Yes, or when no outline or detailed brief was provided and a keyword exists.
Skipped when a human wrote the brief. Rationale: research layered on top of a client written brief wastes time and conflicts with client direction.
Side effect of skipping: lexical enrichment (brief generator Phase 2.75) does not run, so the writer relies on the user's vocabulary choices. That is intentional.

Invokes `content-brief-generator`. Returns the path `[run_dir]/phase-0-research-brief.md`. **Filename matters**: it is `phase-0-research-brief.md`, never `phase-4-brief.md`, so it does not collide with `phase-4-medical-check.md` in the same directory.

#### Inside content-brief-generator

| Sub phase | Work | Checkpoint |
|---|---|---|
| 1a | DataForSEO `keyword_overview`, `search_intent`, `related_keywords` (5 to 10 secondaries) | `phase-1-serp-research.md` |
| 1b | `serp_competitors` top 10, SERP features, select top 5 analysable pages | same |
| 1c | Query classification into 5 intent streams: Definitional, Procedural, Evaluative, Experiential, Transactional | same |
| 2 | Fetch and dissect 5 competitor pages: type, word count, H1, heading tree, sections, angle, E-E-A-T signals, CTA, standout elements, 10 to 25 entities each | `phase-2-competitor-analysis.md` |
| 2.5 | PPR entity extraction: Purpose, Property, Relationship per entity, plus frequency signal (4 to 5 of 5 = Core, 2 to 3 = Supporting, 1 = Peripheral), plus section assignment | `phase-2.5-entity-map.md` |
| 2.75 | `lexical-enrichment-specialist`: synonyms, hypernym, hyponyms, semantic neighbours from Wikipedia for up to 15 entities | `phase-2.75-lexical-enrichment.md` |
| 3 | Pattern matrix, format consensus, SERP feature opportunities, query to section mapping, 9 frame coverage check, pillar topical coverage audit | `phase-3-synthesis.md` |
| 4 | Build the brief | `phase-0-research-brief.md` |

**Pattern matrix classification** drives everything downstream: Must-include (3 to 5 of 5 pages), Differentiator (1 to 2 of 5), Gap (0 of 5).

**Pillar Page Topical Coverage Audit** (runs for pillar, comprehensive guide, ultimate guide, hub page). Eleven universal sections: definition/anatomy, mechanism, types or variants, candidacy and contraindications, step by step procedure, costs and financing, **aftercare/maintenance/longevity**, risks and complications, comparison to alternatives, FAQ, CTA. Each is Covered (dedicated H2 or substantial H3 of 200 words or more), Thin, or Missing.
Every Thin or Missing item must be resolved by exactly one of three paths: add as H2, add as H3, or defer to a spoke with a named slug and anchor text. **There is no fourth option of silently omitting it.**
Why this exists: when all 5 competitors miss the same section, the pattern matrix calls it a Gap but the 9 frame check can pass it as Partial inside another frame, which produces a brief that tells the writer to "briefly touch on" something that deserves its own section.

**14 field section spec** (this is what makes the brief a production spec rather than a research document):
1. Semantic frame, 2. What to cover, 3. Recommended placement, 4. Format note, 5. Mapped queries, 6. Entity map (PPR plus lexical), 7. Conversion angle, 8. Dedup boundary, 9. Modality type, 10. Bold guidance (the exact extractable string for snippet and AI Overview capture), 11. Persona focus, 12. Trust signals, 13. Objection handled (conditional on Evaluative, Comparative, FAQ, or hard CTA), 14. Competitive context.

The brief also outputs: recommended heading structure with frame and queries per H2, target title tag and meta description, differentiator opportunities, gap analysis, keyword placement rules, SERP feature targeting (snippet format, PAA list, AI Overview structure requirements), E-E-A-T requirements, internal links, the editorial angle, and writer notes.

### 5.2b Phase 0.4, Reddit voice research (conditional)

**Added 2026-08-08.** The only stage in the chain that reads what real people actually wrote. Everything else infers audience language from competitor marketing copy and PAA boxes.

Invokes `seo:seo-reddit-research` with `save_path = [run_dir]/phase-0.4-reddit-voice.md`.

**Trigger**: `Run Reddit voice research?` is Yes, or Auto (the default) and the piece is 1,200 words or more, or the content type is pillar, comprehensive guide, ultimate guide, or hub page. Short-form skips it, the Apify cost (roughly $0.15 to $0.70 per topic) is not justified for an FAQ node.

**Output**: the skill's standard report plus a **Brief Field Overrides** table that maps directly onto three brief fields, every row evidenced by a quote or upvote count:

| Brief field | What the override supplies |
|---|---|
| Mapped queries | The exact question phrasing users type, used verbatim as H3s and FAQ entries instead of paraphrased PAA versions |
| Persona focus | Which persona actually dominates the discussion, and where the brief's assumption differs |
| Objection handled | The objections people actually voice, ranked by frequency, in their words |
| Vocabulary to lead with / avoid | The term real users type versus the clinical or marketing term |

**Conflict rule**: where the overrides contradict the brief, Reddit wins for **wording and ranking**, the brief wins for **structure, coverage, and section order**. Real phrasing beats inferred phrasing, but nothing here reorders an article that already passed the frame check.

**Failure handling**: non blocking, never halts the pipeline, one retry maximum. On failure or genuine absence of discussion the file is still written with an explicit "no usable data" body, so a downstream reader can distinguish "we looked and found nothing" from "we never looked". `reddit_voice_path` is then **not passed** to the architect or writer. Invented quotes substituted for a failed scrape are the one unacceptable outcome here, because downstream stages treat this file as evidence.

**Small market note**: for small-language markets the skill is instructed to search neighbouring-country and diaspora subreddits with cognate phrasing and to use `time_filter: "all"`. A single-country subreddit search is not complete for a 2M-speaker market.

### 5.3 Phase 0.5, outline

Invokes `content-outline-architect`. Skipped only when the user supplied a detailed outline, or the content type is FAQ or under 700 words.
Receives `reddit_voice_path` when Phase 0.4 produced usable data, and applies the Brief Field Overrides when naming H3s and FAQ entries.

Produces: full H1 to H4 structure, word count per major section (plus or minus 100), 2 to 3 key points per section, CTA placement, and the mandatory **Internal Links Summary** table.

**Conflict rule**: if the architect's structure differs significantly from the brief's recommended heading structure, **default to the brief**. It is grounded in SERP data. Treat the architect's word counts, H3s, and key points as enhancements, never overrides.

**Pillar Completeness Check** runs here too, independently, even when a brief is present (11 rows, same three resolution paths, no silent omission).

**Topic Cluster Interlinking Standard** (required output section, the writer links exactly what this table says):

| Content type | Link rules | Max links |
|---|---|---|
| Pillar / hub | Link out to every spoke, plus the service page. Never self link | one per spoke |
| Spoke | **Pillar link mandatory**, plus service/conversion page, plus 2 to 3 sister spokes | 5 |
| FAQ node or under 1,500 words | Pillar plus service page, 1 sister spoke maximum | 3 |

Anchor text: descriptive, 2 to 6 words, contains a keyword variant of the destination. Never "lees meer", "klik hier", "hier", "read more". Never inside a heading. Maximum 2 links per H2.
If the pillar slug is unknown, use `[PILLAR SLUG - confirm with client]` as a placeholder. **Never omit the row.**

### 5.4 Phase 0.75, frame validation GATE

Invokes `semantic-frame-validator` at pipeline stage "pre-writer". Skipped only for FAQ or under 700 words, or when the user confirms the brief already passed.

The 9 frames: Definitional, Mechanistic, Causal, Evaluative, Comparative, Experiential, Cost/Resource, Temporal, FAQ/Interrogative.

Verdicts per frame: Covered (dedicated block with depth), Partial (touched, buried, or one sided, for example benefits without risks), Missing.

Additional checks: **redundancy** (any frame appearing in 3 or more sections without dedup ownership gets a flag naming which section owns it), and **conversion flow** against the natural order Definitional to Mechanistic/Causal to Evaluative to Cost to Comparative to Experiential to Temporal to FAQ to Transactional. Flagged frictions: CTA before Evaluative (premature conversion pressure), Experiential before Definitional, Cost before Mechanistic.

**Gate logic**:

```
PASS              -> Phase 1 immediately
CONDITIONAL PASS  -> apply the stated enhancements to the outline, then Phase 1
BLOCK             -> remediation loop, do not send to the writer
```

**BLOCK protocol**, exactly four things go back to the outline architect:
1. `outline_path` (path, not text)
2. The remediation report path or the specific Missing frame instructions
3. `brief_path`, with the instruction to preserve heading structure for sections that passed
4. The explicit instruction: do not reorganise or remove passing sections, add only the missing frame coverage, save as `phase-0.5-outline-v2.md`

Then re-run Phase 0.75 **once**. Still BLOCK after one remediation cycle: escalate to the user with the specific missing frames. Do not loop.

Rationale for the gate: a BLOCK means structural gaps the writer cannot fix. Sending it forward produces content that underperforms regardless of writing quality.

### 5.5 Phase 1, write

Invokes `content-writer-specialist`. Everything is passed as paths. Revision cycle starts at 1, **hard maximum 2**.

Two file workflow: `Read(outline_path)` for what and how much, `Read(brief_path)` for which words, which entities, where not to repeat, and whether a CTA belongs there.

Writer hard rules worth knowing, because they are what the QA gate measures:

**Keyword integration**: primary in H1, in the first 100 words, in at least 2 H2s. Density 1 to 2 percent. Never stuff.

**Content mix ratios per article**: prose 60 to 70 percent, lists 15 to 25 percent, tables 10 to 20 percent.
Lists need at least 3 items (2 item lists become prose) and at most 8. Numbered only for sequences or rankings. Tables need a header row and are used when comparing 3 or more options across 3 or more criteria.
**Consecutive format rule**: never 3 or more consecutive sections in the same format. After a list heavy section, open with at least 2 prose paragraphs. After a table, prose before the next list or table.

**Paragraph architecture**: every paragraph of 3 or more sentences needs at least one short sentence (under 10 words), at least one medium (10 to 20), and at most one long (20 plus). Never 4 or more consecutive sentences of the same length, that is an AI detection signal. Lead sentences must be standalone readable, specific, and the main point.
Length by section: intro 2 to 3 sentences, opening paragraph of any H2 2 to 3, standard body 3 to 4 (50 to 80 words), complex mechanism up to 5, FAQ answer 2 to 4 (40 to 80 words), closing 2 to 3 total.

**Section anatomy**:
- Intro must contain hook, problem framing, scope signal, primary keyword within 100 words, bridge to the first H2. Must NOT contain "in this article we will", price information, CTAs, or unproven claims.
- Every body H2: direct opening sentence (no throat clearing), 2 to 5 body paragraphs, and a closing bridge forward or a conversion trigger. Never end an H2 with a summary of itself.
- Outro: 1 to 2 sentence value summary (not a recap), one clear next step, nothing new, no hedging, one CTA direction only.

**Transitions**: no transition sentences between H3s within the same H2, the heading handles the shift. The intro must pull rather than announce.

**Healthcare and compliance** (dental, medical, healthcare clients): no absolute claims, contraindications must be present in the evaluative section (pregnancy/breastfeeding, active caries, periodontitis, under 18 for the dental case), medical disclaimer at the bottom, only describe services the client actually offers, cite regulatory facts accurately and never invent them. Anything marked COMPLIANCE NOTE in the brief is a hard constraint that may not be softened.

The writer ends with a **Writer Self-Assessment** covering volume, structure, content mix, paragraph quality, vocabulary and voice, linking, compliance, and (added 2026-08-08) the **Claims Register**: every checkable claim with its type, its source, and whether it is traceable. This whole block is stripped before HTML conversion, so it costs nothing in the published output.

### 5.6 Phase 2, quality GATE

Invokes `content-quality-validator` with `draft_path`, `target_word_count`, `brief_path`, `ymyl` flag, and the revision cycle.

**Pipeline runs an interlinking pre-check before the validator**:
1. Determine content type (pillar, spoke, FAQ node)
2. Read the Internal Links Summary from the outline
3. Verify every listed link is present in the draft
4. **Spoke and FAQ: confirm the pillar link exists. Absent is a failing issue regardless of the overall score.**
5. Anchor text check for non descriptive anchors
Then add the line `Internal links: [N present] / [N required] - pillar link: yes/no` to the QA report.

**Scoring model**: each dimension starts at 100 and takes deductions, floored at 0.

```
Overall = Completeness x 0.40 + Readability x 0.25 + Engagement x 0.20 + Technical x 0.15
```

| Dimension | Deductions |
|---|---|
| Completeness (40%) | Word count: 2 points per 5 percent deviation. Missing required section: 10. Shallow section: 5. Missing required element (CTA, example, statistic, link): 5 |
| Readability (25%) | Grade level outside 8 to 10: 5 per grade. Repetitive sentence pattern: 3 each. Awkward transition: 2 each. Unclear concept: 1 each |
| Engagement (20%) | Hook weakness 0 to 25. Thin value 0 to 25. Poor pacing 0 to 25. Weak or absent CTA 0 to 25 |
| Technical (15%) | Grammar or spelling error type: 3 each. Keyword absent from every H2: 5. Keyword stuffing: 5. Brand voice deviation: 3 per section. Missing brief-required internal link: 5 each |

**Claims verification** (added 2026-08-08). Runs before Technical Quality is scored. The validator reads the draft's **Claims Register** and traces every statistic, regulatory reference, clinical figure, price, timeframe, and comparative assertion back to one of exactly three legitimate sources in the brief: an entity map **Property** field, a **Trust signals** field, or an explicitly named source. Each claim is classified Traceable, Untraceable, or **Distorted** (present in the brief but restated in a way that changes the figure or its scope, which counts as untraceable).

Deductions: 10 points per untraceable or distorted claim, or a flat 25 points once if the register is absent or partial (the two are not stacked). Claims the writer marked `[UNVERIFIED: ...]` inline still deduct, the marking only records honesty.

**Fabrication override**: on YMYL content, any untraceable or distorted claim forces `QA VERDICT: REVISE` regardless of the score. A weighted average must never absorb an invented medical, legal, or financial figure, and without the override the other three dimensions can carry a fabricated statistic over the threshold. Non-YMYL content deducts normally without a forced verdict.

**Degraded mode**: with no `brief_path` there is nothing to trace against, so per-claim deductions are skipped entirely and every claim is listed as requiring a manual fact-check. The validator must never report a claim as traceable when it had nothing to trace it against.

**Thresholds: 75 standard, 80 YMYL.** The verdict line is machine read by the pipeline and must state the threshold applied, for example `QA VERDICT: PASS (score 82/100, threshold 80 YMYL)`.

**Decision logic**:

```
PASS                                  -> Phase 3
REVISE and cycle < 2                  -> build Revision Brief, return to Phase 1
REVISE and cycle = 2 and not YMYL     -> proceed with a WARNING in the pipeline report
REVISE and cycle = 2 and YMYL         -> HUMAN REVIEW REQUIRED, halt, do not advance
```

**Revision Brief** is built from the validator's own "Issues to Fix" section, **copied verbatim**, plus "What Worked Well" so the writer does not break what already passed. Never paraphrase the validator and never write vague feedback like "improve it".

**YMYL human review block**, the only truly terminal state in this pipeline:
- Manifest phase status becomes `blocked_human_review` with the score
- Write `[run_dir]/phase-2-qa-block.md` containing the date, score, cycles, draft file, verbatim issues, and resume instructions
- The human must save corrections as exactly `[run_dir]/phase-1-draft-v2-corrected.md`. Any other filename is ignored and the uncorrected draft gets re-validated (the pipeline warns when the corrected file is missing)
- Only then re-run Phase 2 alone

**Degraded mode**: if `brief_path` is absent, the word count check still runs, section coverage is judged from H2/H3 structure alone, and the required-elements and topic-completeness checks are **skipped with no deductions**. This must be stated in the report. A high score in degraded mode is not the same as a high score against a brief.

### 5.7 Phase 3, language and AI check

Only the detector matching the content language runs.

| Language | Skill |
|---|---|
| SL | `slovenian-ai-phrase-detector` |
| DE / AT / CH | `german-ai-phrase-detector` |
| NL | `dutch-ai-phrase-detector` |
| EN / ES | None, covered by the writer's built in detection |

Never run the German detector on Slovenian content or the reverse.

Detector flags: CALQUE, FILLER, PASSIVE, REGISTER, RHYTHM, DASH.
Score: Low (0 to 2 minor patterns and zero DASH findings, acceptable), Medium (3 to 6, revise flagged sections), High (7 or more or a structural AI fingerprint, full rewrite).
**Em dash override: any em dash in client facing copy caps the score at Medium minimum regardless of how clean everything else is. It is zero tolerance, not a judgment call.**

If no detector applies (EN/ES), the Phase 3 file is a copy of the Phase 2 draft prefixed with an HTML comment marking it a deliberate no-op, so it is distinguishable from a corrupted copy.

### 5.8 Phase 4, medical terminology check (conditional)

Runs for dental, medical, healthcare, or any content with clinical procedure descriptions, and always when YMYL is flagged. Invokes `healthcare:medical-terminology-validator` on the Phase 3 draft. Non healthcare clients get an unchanged pass through.

### 5.9 Phase 5, WordPress HTML output

Five steps:

1. **Markdown to HTML inline conversion** (headings, strong/em, `<ul class="wp-block-list">`, `<table class="wp-block-table">` with the first row as thead, links, paragraphs). **Strips all pipeline metadata**: Writer Self-Assessment, Schema and Meta Notes, manifest headers, trailing separator blocks. Written to `phase-5-raw-convert.html`. The batch script `scripts/batch-convert-markdown-to-html.js` is for bulk directory conversion only.
2. **SEO meta header comment block**: title (60 char max), description (155 char max), slug, category, primary keyword, URL, schema list. Pillar URL is `/[category]/`, spokes are `/[category]/[slug]/`.
3. **SEO meta checkpoint** `phase-5-seo-meta.md`, the copy-paste sheet for SEOpress with focus keyword, SEO title, meta description, slug, canonical, post type, category, schema blocks, and character counts.
4. **Internal link resolution** against `/projects/[uuid]/slug-map.json`. Unmatched links stay as-is with a `<!-- TODO: resolve link: [slug] -->` comment appended.
5. **Schema blocks** from `/projects/[uuid]/client-schema-template.json`: static schemas embedded as is, template schemas with placeholders filled (`{{ARTICLE_TITLE}}`, `{{ARTICLE_URL}}`, `{{ARTICLE_DESCRIPTION}}`, `{{DATE_MODIFIED}}`, `{{PAGE_NAME}}`, `{{PAGE_PATH}}`), FAQPage populated by parsing H3 plus paragraph pairs under the FAQ H2 (fewer than 2 pairs leaves a TODO placeholder), and conditional schemas (MedicalProcedure for service/pillar, LocalBusiness_Location for location pages). With no template file, only a minimal MedicalWebPage schema plus a TODO comment.

Promoted to `/projects/[uuid]/deliverables/content/wordpress-html/[keyword_slug]-[date]-WORDPRESS.html`.

### 5.10 Phase 6, Notion sync (non blocking)

Resolve the DB id: `nasmehpg-` prefix uses `29257360-13b4-819f-84a4-000b46b4c501`, otherwise read `content_db_id` from `/projects/[uuid]/client-notion-config.json`. No config means log and skip, not error.
Search by primary keyword, then patch or create. Status is "Ready to Publish" if Phase 5 completed, else "Draft".
**Never overwrite a human edit**: meta title and meta description are only written when currently blank. Editor Notes, Publishing Priority, and Revenue Potential are human judgment fields and are never set.
Any failure is logged and the pipeline continues. The deliverable was already complete at Phase 5.

### 5.11 Final delivery

Final markdown to `[run_dir]/final-[keyword_slug]-[date].md`, promoted to `/projects/[uuid]/deliverables/content/[keyword_slug]-[date].md`. Manifest status becomes completed with both deliverable paths. Then the Pipeline Report table (phase, status, detail, file) with final score, revision cycles, language, word count, content type, client, run directory, deliverable, and publish-ready verdict.

---

## 6. Every gate and blocker in one table

| # | Gate | Where | Threshold | Blocking? | On failure |
|---|---|---|---|---|---|
| 1 | SEO research validation | seo-research Phase 5 | Checklist | No, WARN only | Annotate DATA GAP in the report |
| 2 | Blocking phase dependencies | seo-research 1a, 2, 3a to 3c | n/a | Yes | Stop the pipeline |
| 3 | Pillar topical coverage audit | brief generator Phase 3 | 11 sections resolved | Yes, procedurally | Resolve as H2, H3, or deferred spoke. No silent omission |
| 4 | Pillar completeness check | outline architect | 11 rows resolved | Yes, procedurally | Same three paths |
| 5 | Semantic frame validation | production Phase 0.75 | 9 frames | **Yes, BLOCK** | One remediation cycle back to the architect, then escalate |
| 6 | Interlinking pre-check | production Phase 2 | Pillar link present | Yes for spokes | Failing issue regardless of score |
| 6b | Claims register pre-check | production Phase 2 | Register present and complete | No, informational | Validator builds the claim list itself, flat 25 point deduction |
| 7 | Content quality validator | production Phase 2 | 75, or 80 YMYL | Conditional | Revise, max 2 cycles |
| 7b | **Fabrication override** | production Phase 2, YMYL only | Zero untraceable or distorted claims | **Yes, forces REVISE at any score** | Revision Brief built from the Claims Detail table |
| 8 | YMYL human review | production Phase 2, cycle 2 | 80 | **Yes, terminal** | `blocked_human_review`, needs `phase-1-draft-v2-corrected.md` |
| 9 | AI phrase detection | production Phase 3 | Low, zero em dashes | Practically | Medium revises sections, High is a full rewrite |
| 10 | Medical terminology | production Phase 4 | n/a | Yes for healthcare | Apply corrections |
| 11 | SEO fit validation | bridge Step 1.3 | 75 | Yes | Return to production with corrections |
| 12 | Outline compliance auditor | standalone tool | 90 percent overall, 100 percent structure, 85 percent coverage | Yes when invoked | Not wired into the pipeline, invoke manually |
| 13 | AI detection rate | `/qa-content`, CLAUDE.md standard | under 30 percent | Yes | Rewrite flagged sections |

---

## 7. Hard rules that decide whether the output is good

**Structural**
- The writer never designs structure. The outline does. The brief validates it. Sending a brief to a writer without an outline is listed as a "do not do" in the pipeline.
- The brief's SERP derived heading structure always beats the outline architect's internal logic.
- Never add H2s not in the outline, never reorder sections. Frame coverage and conversion flow were already checked.

**Research grounded**
- Word counts come from the median of the top 5 ranking pages with the rationale stated. Arbitrary numbers are noise.
- Never fabricate keyword volumes. If DataForSEO returns nothing for the market, say so and suggest a broader query.
- Never invent heading content from a page you could not fetch. Mark it and work from what you have.
- Entity properties come from pages actually read. Lexical enrichment records only what Wikipedia explicitly states, never invented synonyms.
- Reddit quotes come from the actual scraped dataset. A failed scrape produces an explicit no-data file, never a plausible reconstruction.

**Claims discipline (writer)**
- Every statistic, regulatory reference, clinical figure, price, timeframe, and comparative assertion goes into the Claims Register with its source.
- A claim is traceable only when it came from the brief's entity map Property field, the brief's Trust signals field, or a source the brief names explicitly. Background knowledge, industry-plausible figures, and interpolations between two brief figures are all untraceable.
- When a claim cannot be traced there are exactly two options: cut the figure and keep the sentence, or keep it and mark it `[UNVERIFIED: claim]`. There is no third option.
- Never invent a specific figure to fill a gap the brief left. A precise-sounding fabrication is more credible to a reader and more likely to survive review than an obvious error, and in YMYL content that is the failure mode that causes real harm. Vagueness is recoverable, a fabricated number that reaches a patient is not.
- Restating a brief figure so its meaning changes (a 10 to 20 percent range becoming "roughly a quarter") is a new claim and scores as untraceable.

**Per section discipline**
- Dedup boundary must never be blank, or the writer produces overlapping content.
- Conversion angle must name the reader's psychological state and the specific micro action, not "move reader toward booking".
- Bold guidance must be an exact extractable string, not "bold the important phrase".
- Persona focus shifts per section as the reader moves from learning to deciding. A uniform tone across the article is a failure.
- Trust signals are distributed per section and deployed inline, never clustered into a "why us" block.
- Objections are handled inline in prose, never in a warning box or sidebar.
- Must-include sections are not safe to under deliver. Matching the strongest competitor is the floor.

**Linking**
- Pillar link is mandatory on every spoke. Never omit the row even if the slug is unknown.
- Maximum 2 internal links per H2, 3 to 5 per spoke, 2 to 3 per FAQ node.
- Anchor text is descriptive, 2 to 6 words, contains a destination keyword variant. Never in a heading, never in the first sentence of the intro.
- Every spoke in the Internal Links Summary must be linked at least once, or the reason noted in the self assessment.

**Language**
- **No em dashes and no double dashes, anywhere, in any project.** Grep every generated file for the characters before calling content done, and rewrite per sentence rather than blind find and replace. This has been violated at scale before, it is a completion criterion, not a preference.
- Route the correct language detector. Slovenian content never goes through the German detector.
- Slovenian specifics: active voice over passive, first person plural in clinical context, patient vocabulary over clinical vocabulary, "krona" never "kronka", avoid overusing "strokoven".

**Compliance**
- YMYL never auto proceeds below 80 after two cycles. The human review block is not optional.
- Never skip the medical check for dental or medical clients.
- Never truncate the final content.

---

## 8. Known failure modes and workarounds

| Issue | Reality | Workaround |
|---|---|---|
| `Skill()` sub-skill routing | Both documented patterns have failed repeatedly. `Skill(skill="content", args="content-production-pipeline")` loads only the domain overview, and flat invocation has returned "Unknown skill" | `Read()` the target skill's `prompts/main-prompt.md` and execute it by hand. Confirmed working path |
| SKILL.md frontmatter edits | Skill metadata loads once at session start. A mid session frontmatter fix does not take effect until the next session | Do not re-test in the same conversation |
| `content-quality-validator` unavailable | Recorded as returning "Unknown skill" in a prior session | Fall back to a mechanical grep of each brief's internal link list against the draft's actual href tags. Presence and absence checks need no LLM judgment |
| Bash `cp` into `/projects/` | Blocked by the `protect-critical-directories` hookify rule | Use Read plus Write to promote files from pipeline-runs to deliverables |
| WordPress MCP writes | 14 parallel REST writes OOM killed a live site | Strictly sequential, one post at a time, always |
| DataForSEO location handling | `keyword_overview` can silently resolve a non-US location to US English and drop keywords | Always check the echoed `location_code`. For Slovenia use `keyword_suggestions` rather than `keyword_overview`. Netherlands is `2528` plus Dutch |
| WebFetch for audits | Markdown conversion drops `<head>`, producing false "missing meta description" and "missing alt" findings | Use raw curl for meta and alt audits |
| Brief filename | It is `phase-0-research-brief.md`, not `phase-4-brief.md` | Collides with `phase-4-medical-check.md` otherwise |
| Self certifying a draft | Checking H tags and PAA coverage is not validation. It has previously shipped articles with zero internal links | Always validate against the real `brief_path` |

---

## 9. Full artifact map for one article run

```
/projects/[uuid]/pipeline-runs/content-production/[keyword-slug]-[date]/
  manifest.json
  phase-0-research-brief.md          <- the deliverable of the brief generator
  phase-1-serp-research.md
  phase-2-competitor-analysis.md
  phase-2.5-entity-map.md
  phase-2.75-lexical-enrichment.md
  phase-3-synthesis.md
  phase-0.4-reddit-voice.md          <- real audience language, or an explicit no-data note
  phase-0.5-outline.md
  phase-0.5-outline-v2.md            <- only after a frame BLOCK remediation
  phase-0.75-frame-validation.md
  phase-1-draft-v1.md
  phase-1-draft-v2.md                <- only on revision
  phase-1-draft-v2-corrected.md      <- only on YMYL human review, exact filename required
  phase-2-qa.md
  phase-2-qa-block.md                <- only on YMYL block
  phase-3-language-check.md
  phase-4-medical-check.md
  phase-5-raw-convert.html
  phase-5-seo-meta.md
  phase-5-wp-html.html
  final-[keyword-slug]-[date].md
  phase-[N]-error.md                 <- only on failure

/projects/[uuid]/deliverables/
  content/[keyword-slug]-[date].md
  content/wordpress-html/[keyword-slug]-[date]-WORDPRESS.html
  seo/strategy-[domain-slug]-[date].md
  seo/content-queue-[domain-slug]-[date].md
```

Supporting client files the pipeline reads if present:
`/projects/[uuid]/CLAUDE.md`, `slug-map.json`, `client-schema-template.json`, `client-notion-config.json`.

---

## 10. Operator quickstart

**Full new client build**
```
1. seo-research-pipeline        (domain, niche, market, local?, healthcare?, uuid)
2. Review phase-7-content-queue.md, fix any cannibalisation and NEW CATEGORY flags
3. seo-to-content-pipeline      (tier T1, batch_size 1) -> pillar first
4. seo-to-content-pipeline      (tier T1, batch_size 4) -> remaining T1 spokes
5. seo-to-content-pipeline      (tier T2, batch_size 5)
6. commands:publish-to-wordpress
```

**Single article, keyword known**
```
1. content-brief-generator      (keyword, market, niche, uuid)
2. content-production-pipeline  (brief_path, keyword, language, type, word count, flags)
3. commands:publish-to-wordpress
```

**Single article, client supplied a brief**
```
content-production-pipeline with "Run SERP research: No"
Note: lexical enrichment will not run, the client's vocabulary choices stand
```

**Updating an existing page**
```
content-production-pipeline with action: UPDATE and existing_url set
The pipeline fetches the live page before outlining, and the architect enhances rather than replaces
```

**Healthcare client**
```
Add healthcare_mode: true at the bridge layer, or flags: YMYL at the article layer
Effects: 80 point QA threshold, mandatory medical check, human review block instead of auto proceed,
E-E-A-T requirements in the brief, smaller batches
```

---

## 11. Where the gaps are

Honest read of the current implementation, for whoever maintains this next.

1. **`content-outline-compliance-auditor` is orphaned.** It has the strictest numeric gates in the system (90 percent overall, 100 percent structure, 85 percent coverage, plus or minus 15 percent per section word count) and nothing calls it. The production pipeline's Phase 2 covers some of this through the completeness dimension, but not section level word count compliance or engagement element counts.
2. **`content-structure-corrector` is manual by design.** The pipeline explicitly says do not expect it to be called automatically. When a REVISE verdict is driven by structural problems (too many tables, bad paragraph distribution, bullet and bold overuse) rather than depth, invoke it directly.
3. **The bridge layer's SEO fit gate duplicates part of Phase 2.** Step 1.3 checks keyword placement and meta lengths, which the quality validator's Technical dimension also touches. Running both is not harmful, but a below-75 SEO score sends the article back into a pipeline that already passed its own QA, which can burn a revision cycle on a different rubric.
4. **`seo-content-optimization` has no scoring rubric in its own prompt.** The 0 to 100 score and the 75 threshold live in the bridge pipeline, not in the skill. The skill itself only defines a report format. Scores from it will be less reproducible than the content quality validator's arithmetic model.
5. **Phase 5 conversion is hand rolled per run.** The markdown to HTML rules are prose instructions rather than a script for the single file path, so output consistency depends on the model following them each time. The batch script exists but is scoped to directory conversion.
6. **`seo-serp-harvest` is still orphaned.** It parses the DataForSEO `forums[]` and `perspectives[]` blocks (Reddit, Quora, TikTok, Substack) and nothing invokes it. It would be a cheaper, zero-Apify-cost complement to Phase 0.4 for markets where scraping returns little, and it is the natural place to answer "which Reddit threads is Google itself surfacing for this query".
7. **The claims register verifies provenance, not truth.** It proves a figure came from the brief. It does not prove the brief was right. A wrong statistic on a competitor page that was fetched in brief Phase 2 becomes a traceable Property and will pass every gate in the chain. Closing that would need an external verification step against primary sources, which does not exist anywhere in the system today. Treat the register as a fabrication defence, not a fact check.
8. **`competitor-intelligence-pipeline` is still only a suggestion.** It is referenced by `seo-to-content-pipeline` under "does not cover" rather than being wired in, so its five stream competitive study runs only when someone remembers to run it first.

### Changelog

- **2026-08-08** Phase 0.4 Reddit voice research added to `content-production-pipeline`, with `save_path` and a Brief Field Overrides table added to `seo-reddit-research`. Claims Register added to `content-writer-specialist`, claims verification and the YMYL fabrication override added to `content-quality-validator`, claims pre-check added to pipeline Phase 2.
