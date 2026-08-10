---
description: Combines DataForSEO keyword data (CPC, volume, competition) with Playwright scraping of Google SERP sponsored results to produce a paid keyword strategy with real ad creative examples from live campaigns.
---

# Google Ads Keyword Planner Skill

## Overview

Combines DataForSEO keyword data (CPC, volume, competition) with Playwright scraping of Google SERP sponsored results to produce a paid keyword strategy with real ad creative examples from live campaigns.

## When to Load

**Use this skill when user mentions**: google ads keywords, CPC research, google ads keyword planning, paid search keywords, what keywords to bid on, google search ads research, PPC keyword research

**Load if task involves**:
- Building a Google Ads keyword strategy with CPC and volume data
- Researching what ad copy competitors use on Google for specific keywords
- Identifying high-intent search terms for a paid campaign

## Configuration

**Model**: sonnet
**Color**: blue

## Tools Required

Read, Write, Edit, Glob, Grep, Bash, mcp__dataforseo__keyword_overview, mcp__dataforseo__keyword_ideas, mcp__dataforseo__keyword_suggestions, mcp__dataforseo__search_intent, mcp__dataforseo__serp_google_organic, mcp__plugin_playwright_playwright__browser_navigate, mcp__plugin_playwright_playwright__browser_snapshot, mcp__plugin_playwright_playwright__browser_take_screenshot, mcp__plugin_playwright_playwright__browser_evaluate, mcp__plugin_playwright_playwright__browser_wait_for

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full prompt: ~1,600 characters
- This overview: ~195 characters (88% reduction)
