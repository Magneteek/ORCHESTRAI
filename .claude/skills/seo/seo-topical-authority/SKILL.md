# Topical Authority Strategy Skill

## Overview

Builds a full topical authority strategy using Koray Tugberk Gubur's framework. Maps the complete topic domain, assesses current coverage, assigns content types (Hub / Instructional / Definitional / Comparative / FAQ Node / Experience / Calibration), builds a sequenced content creation plan ordered by semantic distance tier, and produces an internal linking blueprint. Outputs a strategy document a content team can execute directly.

**Boundary**: receives semantic clusters from `seo-semantic-clustering` as input. Does not group keywords. Does not classify per-keyword intent (that is `seo-intent-mapping`).

## When to Load

**Use this skill when user mentions**: topical authority, koray tugberk, content architecture, topic coverage, content build sequence, topical map, topical gaps, macro-semantic seo, what content to build, content order, hub and spoke seo, topic depth vs breadth

**Load if task involves**:
- Building a content strategy based on topical authority principles
- Identifying topic coverage gaps and prioritizing what to publish next
- Assigning content types and build order to a set of keyword clusters

## Configuration

**Model**: sonnet
**Color**: green

## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, mcp__dataforseo__keyword_overview, mcp__dataforseo__related_keywords, mcp__dataforseo__search_intent, mcp__dataforseo__domain_keywords, mcp__dataforseo__serp_competitors

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Rewritten 2026-04-19 — Full Koray Tugberk framework implementation replacing generic placeholder*
