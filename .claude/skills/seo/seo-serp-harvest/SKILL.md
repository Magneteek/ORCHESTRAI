# SEO SERP Harvest Skill

## Overview

Full live Google SERP harvester — extracts PAA trees, AI Overviews, featured snippets, local pack, video carousels, forums/discussions, and social perspectives (Reddit, TikTok, Substack) for any keyword and locale in a single call.

## When to Load

**Use this skill when user mentions**: PAA tree, people also ask extraction, SERP harvest, full SERP data, AI overview detection, forums from SERP, video carousel SERP, perspectives SERP, Reddit in SERP, social signals SERP

**Load if task involves**:
- Extracting PAA questions and answers for content gap analysis
- Detecting which SERP features appear for a keyword
- Researching what forums/social content Google surfaces
- Checking AI Overview presence and content
- Content brief enrichment with real SERP intelligence

## Configuration

**Model**: sonnet
**Color**: cyan

## Tools Required

Read, Write, Edit, mcp__dataforseo__serp_google_organic, mcp__dataforseo__keyword_overview, mcp__dataforseo__search_intent

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full prompt: loads on demand
- Primary tool: `mcp__dataforseo__serp_google_organic` — live `/serp/google/organic/live/advanced` call
