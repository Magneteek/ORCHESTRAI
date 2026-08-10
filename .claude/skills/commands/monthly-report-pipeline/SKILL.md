---
name: monthly-report-pipeline
description: Unified monthly client performance report pipeline. Auto-reads stored project deliverable files (rankings snapshots, GSC data, local SEO snapshots, reputation reports, ads snapshots) — pulls API data only for what's missing — and produces a polished HTML report with Chart.js charts, period-over-period comparison, fixed-keyword-watchlist SERP tracking, AI visibility insights (Google AI Overview presence + A2A agent query logs where onboarded), and next-month priorities. One command generates the complete monthly client report. Complements client-report (interactive/manual) and ads-report (ads-only). Run at end of month for retainer clients.
domain: commands
tools: Read, Write, Edit, Glob, Grep, Bash, Skill, mcp__dataforseo__domain_keywords, mcp__dataforseo__traffic_estimation, mcp__dataforseo__business_data_reviews, mcp__dataforseo__business_data_info, mcp__dataforseo__serp_google_maps, mcp__dataforseo__serp_google_organic, mcp__google-search-console__search_analytics
model: sonnet
thinking:
  enabled: true
  budget: 6000
color: blue
---

Unified monthly performance report pipeline. Reads from stored pipeline output files first, pulls API data for any gaps, then generates a client-ready HTML report with inline charts, fixed-watchlist SERP tracking, AI visibility insights, and period-over-period comparisons. One run = complete monthly deliverable.
