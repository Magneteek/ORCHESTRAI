# Quick Report Generation Reference

## One-Command Report Generation

```bash
npm run reports:generate [project-path] [client-name]
```

## Example: RUNCHICKEN

```bash
npm run reports:generate \
  /Users/kris/CLAUDEtools/ORCHESTRAI/projects/runchicken-F90DEDB5-25F0-4D32-8138-781C675F5BD3 \
  RUNCHICKEN
```

## What You Get (4 Reports + Index)

| Report | File | Size | Purpose |
|--------|------|------|---------|
| 📊 **Comprehensive Intelligence** | `comprehensive-intelligence-report.html` | ~80 KB | Complete overview with personas, ICP, market intelligence |
| 🎯 **ICP Deep Dive** | `icp-deep-dive-analysis.html` | ~45 KB | Detailed customer profile, pain points, objections |
| 🧠 **Psychographic Research** | `psychographic-research.html` | ~65 KB | Cultural values, behavioral patterns, emotional triggers |
| 🔍 **SEO Dashboard** | `seo-intelligence-dashboard.html` | ~25-60 KB | Keyword research, competitor analysis, opportunities |
| 📑 **Report Index** | `index.html` | - | Beautiful navigation hub for all reports |

## Opening Reports

```bash
# Open index (recommended - provides navigation to all reports)
open "[project-path]/deliverables/research/index.html"

# Or open individual reports directly
open "[project-path]/deliverables/research/comprehensive-intelligence-report.html"
```

## When to Regenerate

✅ After intelligence pipeline rebuild
✅ After major data updates
✅ After SEO research completion
✅ Before client deliverable preparation

## Workflow Integration

```bash
# 1. Run intelligence pipeline
Task(subagent_type="client-icp-analyst", ...)
Task(subagent_type="seo-keyword-research", ...)

# 2. Generate all reports
npm run reports:generate [project-path] [client-name]

# 3. Open and review
open "[project-path]/deliverables/research/index.html"
```

## Location

All reports saved to:
```
/projects/[client-uuid]/deliverables/research/
```

---

**See [BATCH-REPORT-GENERATION-GUIDE.md](BATCH-REPORT-GENERATION-GUIDE.md) for complete documentation.**
