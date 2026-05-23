---
name: local-seo-monthly
description: Monthly local SEO maintenance workflow. Captures Maps ranking snapshot, generates 4 GBP posts for the month (original creation or content-transformer from existing articles), packages posts for publishing via gbp-post-delivery-formatter, and outputs a monthly progress note for the client project log. Lightweight — does not re-run the full local-seo-pipeline. Run once per month per client.
domain: local-seo
tools: Read, Write, Skill, mcp__dataforseo__serp_google_maps
model: sonnet
thinking:
  enabled: false
color: green
---

Monthly local SEO maintenance: Maps ranking snapshot + 4 new GBP posts + publishing handoff document. Designed to run in ~20 minutes per client each month. Does not repeat the full onboarding pipeline — builds on the strategy already set.
