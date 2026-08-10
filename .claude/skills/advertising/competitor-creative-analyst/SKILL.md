---
description: "Scrapes Facebook Ads Library (and optionally Google search sponsored results) using Playwright to extract live competitor ad creative: hooks, body copy, CTAs, offer angles, format patterns, and creative themes. Primary tool for competitive advertising research."
---

# Competitor Creative Analyst Skill

## Overview

Scrapes Facebook Ads Library (and optionally Google search sponsored results) using Playwright to extract live competitor ad creative: hooks, body copy, CTAs, offer angles, format patterns, and creative themes. Primary tool for competitive advertising research.

## When to Load

**Use this skill when user mentions**: competitor ads, what ads are competitors running, facebook ads library, ad creative research, spy on ads, competitive ad analysis, what creatives work in [niche]

**Load if task involves**:
- Researching live competitor ads before building a campaign
- Identifying winning hooks, copy patterns, or offer angles in a niche
- Building creative briefs informed by what's already working in the market

## Configuration

**Model**: sonnet
**Color**: orange

## Tools Required

Read, Write, Edit, Glob, Grep, Bash, mcp__plugin_playwright_playwright__browser_navigate, mcp__plugin_playwright_playwright__browser_snapshot, mcp__plugin_playwright_playwright__browser_click, mcp__plugin_playwright_playwright__browser_fill_form, mcp__plugin_playwright_playwright__browser_type, mcp__plugin_playwright_playwright__browser_wait_for, mcp__plugin_playwright_playwright__browser_take_screenshot, mcp__plugin_playwright_playwright__browser_evaluate, mcp__plugin_playwright_playwright__browser_press_key, mcp__plugin_playwright_playwright__browser_select_option

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full prompt: ~1,800 characters
- This overview: ~210 characters (88% reduction)
- Loads full content only when needed
