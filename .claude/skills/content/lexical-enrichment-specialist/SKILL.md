---
description: "Takes a PPR entity map and enriches each entity with four lexical relationship types sourced from Wikipedia: **synonyms** (variant names for keyword diversification), **hypernyms** (broader categories for topical framing), **hyponyms** (specific subtypes for depth coverage and long-tail targeting), and **semantic neighbors** (co-occurring concepts for entity salience). Maps every lexical relati..."
---

# Lexical Enrichment Specialist

## Overview

Takes a PPR entity map and enriches each entity with four lexical relationship types sourced from Wikipedia: **synonyms** (variant names for keyword diversification), **hypernyms** (broader categories for topical framing), **hyponyms** (specific subtypes for depth coverage and long-tail targeting), and **semantic neighbors** (co-occurring concepts for entity salience). Maps every lexical relationship to a concrete writing use case — not just "here are related words" but "here's exactly how to deploy this in the section that owns this entity." Output feeds directly into Phase 3 synthesis and Phase 4 section specs of `content:content-brief-generator`.

**Feeds into**: `content:content-brief-generator` Phase 3 (pattern synthesis) + Phase 4 (entity map field in section specs)

## When to Load

**Use this skill when user mentions**: lexical enrichment, entity synonyms, keyword variants, hyponyms, hypernyms, semantic neighbors, entity lexicon, related terms for SEO, semantic entity relationships, Wikipedia entity enrichment

**Load if task involves**:
- Enriching a PPR entity map with lexical/semantic relationships
- Finding keyword variants and related terms for entities before writing begins
- Building deeper entity coverage than competitors via hyponym targeting
- Improving entity salience in a content brief

## Configuration

**Model**: sonnet
**Color**: blue
**Thinking budget**: 3000

## Tools Required

Read, Write, WebFetch, WebSearch

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-20*
