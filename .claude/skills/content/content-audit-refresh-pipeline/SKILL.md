---
name: content-audit-refresh-pipeline
description: Content audit and refresh pipeline. Inventories all content pages → scores each page using GSC performance data + DataForSEO rankings → detects keyword cannibalization → categorises every page (Keep / Refresh / Expand / Consolidate / Redirect / Delete) → prioritises by traffic recovery potential → produces a client-ready audit report + a refresh queue compatible with seo-to-content-pipeline. Run quarterly or when organic traffic drops.
domain: content
tools: Read, Write, Edit, Bash, Skill, mcp__dataforseo__domain_keywords, mcp__dataforseo__serp_google_organic, mcp__dataforseo__onpage_task_post, mcp__dataforseo__onpage_pages, mcp__dataforseo__onpage_summary, mcp__dataforseo__onpage_tasks_ready, mcp__firecrawl__firecrawl_map
model: sonnet
thinking:
  enabled: true
  budget: 6000
color: blue
---

Content audit + refresh prioritisation pipeline. Pulls all content URLs, scores them against GSC and DataForSEO ranking data, detects cannibalization, and categorises every page with a specific action. Outputs a prioritised audit report and a refresh queue that feeds directly into seo-to-content-pipeline.
