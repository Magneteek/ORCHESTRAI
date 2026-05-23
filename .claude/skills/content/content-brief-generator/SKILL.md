---
description: Research-backed 9-field content brief from live SERP data — 6-phase pipeline covering competitor analysis, PPR entity extraction, lexical enrichment, pattern synthesis, and section-level production specs.
---

# Content Brief Generator Skill

## Overview

Research-backed content brief from live SERP data. Runs a 6-phase pipeline: (1) SERP intelligence — keyword data, related queries classified into 5 intent streams; (2) competitor page analysis — top 5 pages read for structure, angle, entities, E-E-A-T; (2.5) PPR entity extraction — all entities classified by Purpose/Property/Relationship, assigned to sections by frequency signal; (2.75) lexical enrichment — Core and Supporting entities enriched with synonyms, hypernyms, hyponyms, and semantic neighbors from Wikipedia; (3) pattern synthesis — must-include/differentiator/gap matrix, query-to-section mapping, 9-frame coverage check, lexical opportunities integrated; (4) brief output — 9-field production spec per section (semantic frame, mapped queries, entity map with PPR + lexical data, conversion angle, dedup boundary, modality type, what to cover, format, placement). Produces a writer-ready brief with verified semantic, entity, and lexical coverage, not a research document.

**Feeds into**: `content:content-outline-architect` → `content:semantic-frame-validator` → `content:content-writer-specialist` → `content:content-production-pipeline`

## When to Load

**Use this skill when user mentions**: content brief, write a brief, brief for keyword, what should I write, how should I structure this article, content instructions, competitor content analysis, what's ranking for, analyze top results, content research

**Load if task involves**:
- Producing a research-backed content brief before writing begins
- Analyzing what's currently ranking for a keyword to inform content structure
- Understanding competitor content patterns for a specific query

## Configuration

**Model**: sonnet
**Color**: cyan
**Thinking budget**: 6000

## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Skill, mcp__dataforseo__keyword_overview, mcp__dataforseo__related_keywords, mcp__dataforseo__search_intent, mcp__dataforseo__serp_competitors

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-19*
