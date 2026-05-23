---
name: reputation-intelligence-pipeline
description: Monthly reputation management pipeline for local businesses. Pulls all Google reviews via DataForSEO/Apify → sentiment analysis by theme and rating → drafts responses to every unresponded review (healthcare/dental-safe — never confirms patient identity) → generates review request templates for follow-up → delivers reputation score, sentiment trend, and action plan. Runs monthly for retainer clients. Handles multi-location and multilingual review sets.
domain: reputation-intelligence
tools: Read, Write, Edit, Bash, Skill, mcp__dataforseo__business_data_reviews, mcp__dataforseo__business_data_info, mcp__apify__apify_google_reviews, mcp__dataforseo__serp_google_maps
model: sonnet
thinking:
  enabled: true
  budget: 5000
color: purple
---

Monthly reputation pipeline. Pulls reviews → sentiment → responses → request templates → report. One run = complete monthly reputation deliverable.
