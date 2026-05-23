---
name: client-onboarding-pipeline
description: New client intelligence gathering pipeline. Runs parallel streams — business context analysis, ICP profiling, branding intelligence, and market intelligence — then synthesises all findings into a master client brief that populates the project CLAUDE.md. Creates the permanent client context that every other pipeline and agent reads at session start. Run once per new client at engagement start.
domain: client-intelligence
tools: Read, Write, Edit, Bash, WebSearch, WebFetch, Skill, mcp__dataforseo__serp_competitors, mcp__dataforseo__domain_keywords, mcp__dataforseo__domain_technologies, mcp__apify__apify_website_crawler, mcp__firecrawl__firecrawl_scrape
model: sonnet
thinking:
  enabled: true
  budget: 6000
color: teal
---

New client onboarding intelligence pipeline. Business context + ICP + branding + market intel → master client brief → populates project CLAUDE.md. Run once per new client.
