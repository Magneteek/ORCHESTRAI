---
description: ORCHESTRAI system commands and workflows
---

# Commands Domain

Legacy slash commands converted to modern skills format.

These skills preserve manual invocation semantics (via `disable-model-invocation: true`) but are now part of the unified skills system.

## Available Skills

- **init-client-project** - Initialize new client engagement
- **qa-content** - Content quality assurance
- **seo-audit** - Start technical SEO crawl
- **analyze-project** - Review existing client work
- **review-agent** - Validate agent implementation
- **create-agent** - Build new specialized agent
- **debug-pipeline** - Troubleshoot pipeline issues
- **status** - System health overview
- **init-app** - Initialize application project
- **init-tool** - Create reusable tool
- **intel-report** - Generate intelligence report
- **mini-report** - Generate mini report
- **seo-report** - Generate SEO audit report
- **seo-keyword** - Keyword analysis
- **seo-compare** - Domain comparison
- **seo-serp** - SERP analysis
- **seo-status** - SEO audit status
- **seo-strategy** - SEO strategy report
- **convert** - Convert markdown to WordPress HTML
- **client-report** - Monthly client performance report (interactive, data pasting)
- **ads-report** - Ads-only monthly report with Chart.js (Google + Meta)
- **monthly-report-pipeline** - Unified monthly HTML report pipeline (auto-reads stored pipeline outputs + API pulls for gaps)
- **content-map** - Interactive, live-verified content architecture / publish-status map (adapts shape: production tracker, technical health map, or pre-launch map)

## Migration Notes

All slash commands (`/command-name`) are now skills but retain manual invocation behavior.

Use: `Skill(skill="commands:command-name", args="...")`
Or: `/command-name` (legacy syntax still works)
