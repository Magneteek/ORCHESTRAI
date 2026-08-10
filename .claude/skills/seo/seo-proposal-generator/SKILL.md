---
description: Generates a complete, data-backed SEO retainer proposal from either a full pipeline run (Mode 1) or a live domain query (Mode 2 — quick pitch). Reads phase files or runs DataForSEO queries, calculates 12-month traffic + revenue projections, computes tiered pricing, and outputs a polished Markdown + print-ready QuartzIQ-branded HTML proposal.
---

# SEO Proposal Generator Skill

## Overview

Generates a complete, data-backed SEO retainer proposal from either a full pipeline run (Mode 1) or a live domain query (Mode 2 — quick pitch). Reads phase files or runs DataForSEO queries, calculates 12-month traffic + revenue projections, computes tiered pricing, and outputs a polished Markdown + print-ready QuartzIQ-branded HTML proposal.

## When to Load

**Use this skill when user mentions**: seo proposal, generate proposal, create proposal, proposal for client, retainer proposal, client proposal, seo offering, quick pitch, cold pitch, sales document

**Load if task involves**:
- Generating a client-facing SEO proposal after a research pipeline run
- Creating a quick proposal for a cold prospect (no pipeline needed)
- Converting SEO research data into a sales document with traffic/revenue projections
- Producing a retainer proposal with 3 tiered pricing packages

## Configuration

**Model**: sonnet
**Color**: blue

## Tools Required

Read, Write, Edit, Glob, Grep, Bash, mcp__dataforseo__domain_keywords, mcp__dataforseo__keyword_suggestions, mcp__dataforseo__onpage_instant_summary, mcp__dataforseo__serp_competitors, mcp__dataforseo__serp_google_maps

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full prompt: ~15,000 characters
- This overview: ~220 characters (**98% reduction**)
- Full prompt loads on-demand only
