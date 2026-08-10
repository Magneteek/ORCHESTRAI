---
description: Deep Reddit audience research using actual thread content — not just SERP snippets. Scrapes subreddits and search results to extract real user language, pain points, objections, questions, and sentiment. Feeds directly into content briefs and PAA strategy.
---

# SEO Reddit Research Skill

## Overview

Deep Reddit audience research using actual thread content — not just SERP snippets. Scrapes subreddits and search results to extract real user language, pain points, objections, questions, and sentiment. Feeds directly into content briefs and PAA strategy.

## When to Load

**Use this skill when user mentions**: Reddit research, what people say on Reddit, audience language, patient sentiment, customer pain points, social listening, Reddit scrape, forum research, what people ask about X

**Load if task involves**:
- Extracting real user language for content briefs
- Finding pain points and objections for a topic
- Researching what questions people actually ask (beyond PAA)
- Sentiment analysis on a product, procedure, or topic

## Configuration

**Model**: sonnet
**Color**: orange

## Tools Required

Read, Write, Edit, mcp__apify__apify_reddit, mcp__dataforseo__serp_google_organic

**Note**: `mcp__reddit__reddit_search` (Reddit's free direct API) has been unreliable (403 errors, confirmed 2026-07-25) — `mcp__apify__apify_reddit` (trudax/reddit-scraper-lite, pay-per-result ~$3.40/1000 items) is the primary, confirmed-working path. Try `reddit_search` first if you want the free option, but don't block on it.

## Full Prompt

```
Load: prompts/main-prompt.md
```
