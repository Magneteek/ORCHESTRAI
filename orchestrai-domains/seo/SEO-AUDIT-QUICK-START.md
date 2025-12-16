# SEO Audit Report - Quick Start Guide

## Generate New SEO Audit Report in 90 Minutes

### Option 1: Execute Parallelized Pipeline (Recommended)

**Command**:
```
I need a comprehensive SEO audit for [CLIENT NAME] website: [SITE URL]

Industry: [INDUSTRY]
Target Market: [LOCATION]
Primary Products: [PRODUCTS/SERVICES]

Competitors:
- competitor1.com
- competitor2.com
- competitor3.com
- competitor4.com
- competitor5.com

Seed Keywords:
- primary keyword 1
- primary keyword 2
- primary keyword 3

Execute using parallelized seo-research-pipeline.js following the Theodent template structure.
```

**Execution Time**: ~90 minutes
**Deliverables**: Complete markdown report (2000+ lines) + JSON data files

---

### Option 2: Manual Template Fill-In

**Steps**:
1. Copy template: `/orchestrai-system/templates/global/seo-audit-report-template.md`
2. Create new file: `/projects/[client-uuid]/deliverables/seo/[CLIENT-NAME]-COMPREHENSIVE-SEO-AUDIT-REPORT.md`
3. Fill in all bracketed placeholders: `[CLIENT NAME]`, `[WEBSITE]`, etc.
4. Use DATAforSEO MCP tools for live data

**Time**: 4-6 hours (manual research + filling)

---

## Required Information Checklist

Before starting, gather:

- [ ] **Client Details**
  - [ ] Business name
  - [ ] Website URL
  - [ ] Industry/niche
  - [ ] Primary products/services
  - [ ] Target geographic market

- [ ] **Competitor Information**
  - [ ] 5-10 competitor domains
  - [ ] Verified competitors are active/relevant

- [ ] **Target Keywords**
  - [ ] 5-10 seed keywords
  - [ ] Primary products/services keywords
  - [ ] Industry-specific terms

- [ ] **Business Context**
  - [ ] Target audience description
  - [ ] Customer pain points (3-5)
  - [ ] Unique value proposition
  - [ ] Monthly SEO budget (if known)

- [ ] **Technical Access**
  - [ ] Website is live and accessible
  - [ ] No authentication required for crawling
  - [ ] robots.txt allows crawling

---

## Quick Reference: Pipeline Stages

**Stage 1**: Project Setup (10 min)
- Initialize project structure
- Load client intelligence

**Stage 2**: Parallel Research (30 min)
- ✅ Keyword research (100+ keywords)
- ✅ Competitor analysis (5-10 competitors)
- ✅ Search intent mapping
- ✅ Technical SEO audit

**Stage 3**: Parallel Semantic Analysis (25 min)
- ✅ Semantic clustering
- ✅ Topical authority framework
- ✅ Query network analysis

**Stage 4**: Parallel Content Strategy (20 min)
- ✅ Content outline architecture
- ✅ Backlink strategy

**Stage 5**: Report Synthesis (5 min)
- Aggregate all data
- Generate comprehensive report
- Calculate ROI projections

**Total**: ~90 minutes

---

## Output File Structure

```
/projects/[client-uuid]/deliverables/seo/
├── [CLIENT-NAME]-COMPREHENSIVE-SEO-AUDIT-REPORT.md
├── keyword-research/
│   ├── primary-keywords.json
│   ├── secondary-keywords.json
│   └── keyword-clusters.json
├── competitor-analysis/
│   ├── top-competitors.json
│   └── content-gaps.json
├── technical-audit/
│   ├── critical-issues.json
│   └── core-web-vitals.json
└── content-strategy/
    └── topic-clusters.json
```

---

## Quality Validation Checklist

After generation, verify:

- [ ] **Executive Summary**: Quantified opportunity ($X monthly value)
- [ ] **Keyword Research**: 100+ keywords across 5 tiers
- [ ] **Competitive Analysis**: 5-10 competitors profiled
- [ ] **Technical SEO**: 3-5 critical issues identified
- [ ] **Search Intent**: 4 user personas with journey mapping
- [ ] **Content Strategy**: Topic clusters with pillar/supporting structure
- [ ] **ROI Projections**: Year 1 + 3-year forecast
- [ ] **Implementation Roadmap**: 12-month plan with milestones

---

## Performance Benchmarks

**Theodent Case Study**:
- Execution: 90 minutes ⚡
- Keywords: 188 analyzed
- Competitors: 10 profiled
- Report Length: 2,230 lines
- Opportunity: $10K-$28K monthly search value
- ROI Projection: $268,500 Year 1 increase (33% ROI)

---

## File Locations

**Templates**:
- `/orchestrai-system/templates/global/seo-audit-report-template.md`

**Documentation**:
- `/orchestrai-domains/seo/SEO-AUDIT-REPORT-GENERATION-GUIDE.md` (full guide)
- `/orchestrai-domains/seo/CLAUDE.md` (domain documentation)

**Pipeline**:
- `/orchestrai-domains/seo/pipelines/seo-research-pipeline.js`

**Example Report**:
- `/projects/theodent-[uuid]/deliverables/seo/THEODENT-COMPREHENSIVE-SEO-AUDIT-REPORT.md`

---

## Common Issues

**DATAforSEO API Not Working**:
```bash
# Check credentials in .env
grep DATAFORSEO .env

# Verify MCP server is active in Claude Code
```

**Missing Competitor Data**:
- Ensure domains are active and have 50+ ranking keywords
- Verify location code matches target market (default: 2840 = USA)

**Technical Audit Incomplete**:
- Website must be publicly accessible (no auth)
- Check robots.txt allows crawling
- Verify site is live (no dev/staging servers)

---

## Next Steps After Report

1. **Week 1**: Client presentation (executive summary)
2. **Week 2**: Implementation planning (prioritize quick wins)
3. **Week 3**: Content calendar creation
4. **Weeks 3-6**: Technical SEO fixes (critical issues)
5. **Months 2-12**: Ongoing execution and monitoring

---

**For detailed instructions, see**: [SEO-AUDIT-REPORT-GENERATION-GUIDE.md](SEO-AUDIT-REPORT-GENERATION-GUIDE.md)
