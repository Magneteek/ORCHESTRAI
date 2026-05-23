---
name: local-competitor-intelligence
description: Local competitor analysis using DataForSEO Business Data API. Finds top 5 local competitors, pulls their GBP profile data (rating, review count, categories, hours), calculates review velocity from recent reviews, checks Maps positions across target keywords, and produces a competitor strength comparison table with gap analysis and market opportunities.
domain: local-seo
tools: Read, Write, Bash, mcp__dataforseo__business_data_search, mcp__dataforseo__business_data_info, mcp__dataforseo__business_data_reviews, mcp__dataforseo__serp_google_maps, mcp__dataforseo__competitor_domains
model: sonnet
thinking:
  enabled: true
  budget: 4000
color: green
---

Local competitor GBP and Maps intelligence. Uses DataForSEO to pull competitor profiles, ratings, review velocity, Maps positions, and keyword overlap. Produces a ranked competitor comparison with strength scores, gap analysis, and market opportunities. All data from live API calls — no pseudocode, no fictional integrations.
