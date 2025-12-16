# Client Intelligence - Standard Deliverables Checklist

**Last Updated:** 2025-12-09
**Status:** Official standard for all client intelligence projects

---

## ✅ Mandatory Deliverables

Every client intelligence project MUST include:

### 1. Core Intelligence Data
- **File:** `/client-intelligence/integrated-client-context.json`
- **Contents:** Complete client analysis (15+ sections)
- **Includes:** Executive synthesis, ICP segments, market intelligence, business context

### 2. 24-Section ICP Copywriting Framework
- **File:** `/client-intelligence/icp-24-section-framework.json`
- **Generator:** `client-icp-analyst` agent
- **Contents:** Avatar personas, emotional triggers, objections, conversion insights
- **Per Segment:** 24 psychological/emotional sections
- **Purpose:** High-converting copywriting, landing pages, email sequences

### 3. Comprehensive Intelligence Report (HTML)
- **File:** `/deliverables/client-intelligence/comprehensive-intelligence-report-shadcn-COMPLETE-[timestamp].html`
- **Generator:** `comprehensive-shadcn-generator.js`
- **Features:** Professional ShadCN UI design, print-ready PDF export, responsive
- **Includes:** All sections (Executive Dashboard, ICP Profiles, Psychographic Analysis, Copywriting Framework, SEO Strategy, Competitive Intelligence)

---

## 📊 Recommended Deliverables

Strongly recommended for complete intelligence:

### 4. SEO Keyword Research
- **File:** `/deliverables/seo/comprehensive-keyword-database.json` (or semantic/niche variants)
- **Contents:** Validated keyword data with search volumes, difficulty, CPC
- **Formats Supported:** Keyword Categories, Semantic Clusters, Niche Breakdown

### 5. Competitive Intelligence
- **File:** `/deliverables/seo/competitor-landscape-preliminary.md`
- **Contents:** 5-10 competitor profiles with strengths/weaknesses
- **Purpose:** Market positioning and differentiation strategy

### 6. Project Metadata
- **File:** `/project-metadata.json`
- **Contents:** Client info, project dates, deliverable inventory
- **Purpose:** Project tracking and organization

---

## 🎯 Quality Standards

### 24-Section Framework Quality Requirements

**Each Avatar Must Include:**
- ✅ Named persona (specific name, age, occupation)
- ✅ 3-5 sentences of rich detail
- ✅ Emotional context and motivations
- ✅ Specific scenarios with dollar amounts/metrics
- ✅ Lifestyle and behavioral description

**Each Section Must Include:**
- ✅ 2-4 sentences minimum
- ✅ Visceral, emotional language (not clinical)
- ✅ Specific details (not generic descriptions)
- ✅ Psychologically accurate (based on ICP data)
- ✅ Copywriting-focused (conversion triggers)

### Report Quality Requirements

**Comprehensive Report Must:**
- ✅ Display all available data sections
- ✅ Load and display 24-section framework (if available)
- ✅ Include SEO keywords with metrics (if available)
- ✅ Show competitor profiles (if available)
- ✅ Be print-ready (professional PDF export via Cmd/Ctrl+P)
- ✅ Use NO GRADIENTS design system (solid colors only)

---

## 🚀 Generation Workflow

### Step 1: ICP Analysis
```bash
# Use client-icp-analyst or comprehensive analysis agent
Task(subagent_type="client-icp-analyst", ...)
```

**Output:** `/client-intelligence/icp-analysis.json`

### Step 2: 24-Section Framework (MANDATORY)
```bash
# Use client-icp-analyst with framework prompt
Task(subagent_type="client-icp-analyst", prompt="Generate 24-section framework...")
```

**Output:** `/client-intelligence/icp-24-section-framework.json`

**Template:** See [24-SECTION-FRAMEWORK-GUIDE.md](24-SECTION-FRAMEWORK-GUIDE.md)

### Step 3: SEO Research (Recommended)
```bash
# Use seo-keyword-research agent
Task(subagent_type="seo-keyword-research", ...)
```

**Output:** `/deliverables/seo/comprehensive-keyword-database.json`

### Step 4: Competitive Analysis (Recommended)
```bash
# Use seo-competitor-analysis agent
Task(subagent_type="seo-competitor-analysis", ...)
```

**Output:** `/deliverables/seo/competitor-landscape-preliminary.md`

### Step 5: Generate Comprehensive Report
```bash
cd /orchestrai-domains/client-intelligence/templates/updated-no-gradients

node comprehensive-shadcn-generator.js /projects/[uuid]/client-intelligence/integrated-client-context.json
```

**Output:** `/deliverables/client-intelligence/comprehensive-intelligence-report-shadcn-COMPLETE-[timestamp].html`

---

## 📁 Complete File Structure

```
/projects/[client-uuid]/
│
├── client-intelligence/
│   ├── integrated-client-context.json         ✅ REQUIRED
│   ├── icp-24-section-framework.json          ✅ MANDATORY
│   ├── icp-analysis.json                      ✅ REQUIRED
│   ├── brand-profile.json                     📊 Recommended
│   ├── business-context.json                  📊 Recommended
│   └── market-intelligence.json               📊 Recommended
│
├── deliverables/
│   ├── client-intelligence/
│   │   └── comprehensive-intelligence-report-shadcn-COMPLETE-[timestamp].html  ✅ REQUIRED
│   │
│   ├── seo/
│   │   ├── comprehensive-keyword-database.json         📊 Recommended
│   │   ├── competitor-landscape-preliminary.md         📊 Recommended
│   │   └── [other SEO deliverables]
│   │
│   └── content/
│       └── [content based on copywriting framework]
│
└── project-metadata.json                      📊 Recommended
```

---

## 🔍 Validation Checklist

Before delivering to client, verify:

### File Existence
- [ ] `/client-intelligence/integrated-client-context.json` exists
- [ ] `/client-intelligence/icp-24-section-framework.json` exists
- [ ] `/deliverables/client-intelligence/comprehensive-intelligence-report-*.html` exists

### Framework Completeness
- [ ] All customer segments have framework data
- [ ] Each segment has all 24 sections populated
- [ ] Each avatar has named persona with 3+ sentences
- [ ] Emotional language is visceral and specific

### Report Display
- [ ] Framework section appears in report TOC
- [ ] All segments display with 6 grouped sections
- [ ] SEO keywords display with metrics
- [ ] Competitor profiles show strengths/weaknesses
- [ ] Report exports to PDF cleanly (test print)

### Quality Verification
- [ ] No "N/A" placeholders in framework sections
- [ ] Avatar personas are culturally appropriate
- [ ] Dollar amounts and metrics are realistic
- [ ] Emotional triggers are specific (not generic)
- [ ] Report size is 150KB+ (indicates comprehensive data)

---

## 📈 Expected Report Metrics

### With Framework vs Without Framework

| Metric | Without Framework | With Framework | Improvement |
|--------|------------------|----------------|-------------|
| **File Size** | ~130 KB | ~240 KB | +82% |
| **Line Count** | ~2,300 lines | ~3,300 lines | +43% |
| **ICP Sections** | 7 sections | 11 sections | +57% |
| **Copywriting Insights** | Basic | 120+ data points | Comprehensive |

### Minimum Requirements

- **Report Size:** 150 KB minimum (indicates complete data)
- **Sections:** 10+ major sections
- **Framework Data:** 24 sections × all customer segments
- **Keywords:** 50+ keywords with metrics (if SEO research done)

---

## 🎓 Training & Resources

### Documentation
- **[24-SECTION-FRAMEWORK-GUIDE.md](24-SECTION-FRAMEWORK-GUIDE.md)** - Complete framework generation guide
- **[COMPREHENSIVE-REPORT-TEMPLATE-GUIDE.md](templates/COMPREHENSIVE-REPORT-TEMPLATE-GUIDE.md)** - Report template documentation
- **[CLAUDE.md](CLAUDE.md)** - Client Intelligence Domain overview

### Agent References
- **client-icp-analyst** - ICP analysis and framework generation
- **client-branding-intelligence** - Brand voice and positioning
- **client-market-intelligence-synthesizer** - Market research

### Templates
- **comprehensive-shadcn-generator.js** - Report generation template (supports framework)

---

## 💡 Best Practices

### 1. Generate Framework Early
Don't wait until the end of the project. Generate the 24-section framework immediately after ICP analysis is complete.

### 2. Use Agent Delegation
Always use `client-icp-analyst` agent for framework generation. Manual creation produces lower quality emotional insights.

### 3. Reference Existing Research
Point the agent to existing ICP data, customer interviews, and psychographic research for accuracy.

### 4. Validate with Team
Share framework with copywriting/marketing teams to validate completeness and usefulness.

### 5. Keep Framework Updated
Regenerate framework when:
- New customer insights discovered
- Revenue weights shift significantly
- Product positioning changes
- Quarterly intelligence refresh

---

## 🚨 Common Issues

### Issue: Framework Section Not Displaying

**Cause:** Framework file doesn't exist or wrong location

**Solution:**
```bash
# Check file exists
ls -la /projects/[uuid]/client-intelligence/icp-24-section-framework.json

# Regenerate if missing
Task(subagent_type="client-icp-analyst", prompt="Generate 24-section framework...")
```

### Issue: Framework Data Looks Generic

**Cause:** Agent prompt didn't include enough context

**Solution:** Provide more context in prompt:
- Include existing ICP analysis file
- Reference specific customer research
- Request emotional/visceral language explicitly
- Specify minimum sentence requirements

### Issue: Report Size Too Small

**Cause:** Missing framework or SEO data

**Expected:** 240KB+ with framework, 130KB+ without

**Solution:** Generate missing deliverables and regenerate report

---

## 📊 Success Metrics

### Project Completion Criteria

A client intelligence project is **complete** when:

1. ✅ All mandatory files exist and are populated
2. ✅ Comprehensive report generates without errors
3. ✅ Framework section displays with all segments
4. ✅ Report size is 150KB+ (indicates comprehensive data)
5. ✅ PDF export works cleanly (professional formatting)
6. ✅ All avatars have named personas with emotional depth
7. ✅ Client receives complete intelligence package

### Client Value Delivered

The 24-section framework provides:
- **Conversion Intelligence:** Emotional triggers for high-converting copy
- **Campaign Foundation:** Ready-to-use messaging for landing pages, emails, ads
- **Sales Enablement:** Deep customer psychology for discovery and objection handling
- **Content Strategy:** Personas and emotional triggers for targeted content

---

## Summary

**Every client intelligence project now includes the 24-section ICP copywriting framework as a mandatory deliverable.**

The comprehensive intelligence report template automatically detects and displays this framework when the data file exists. Simply:

1. Generate ICP analysis
2. Generate 24-section framework
3. Generate comprehensive report
4. Framework automatically appears with professional display

**Impact:** +82% report content, complete conversion intelligence, high-quality copywriting foundation for all marketing campaigns.
