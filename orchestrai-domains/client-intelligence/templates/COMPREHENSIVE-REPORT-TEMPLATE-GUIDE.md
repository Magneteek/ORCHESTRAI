# Comprehensive Intelligence Report Template Guide

**Last Updated:** 2025-12-07  
**Template Location:** `/orchestrai-domains/client-intelligence/templates/updated-no-gradients/comprehensive-shadcn-generator.js`  
**Template Type:** Dynamic JavaScript Generator

---

## Overview

The Comprehensive Intelligence Report Template is a **dynamic, data-driven generator** that creates complete client intelligence reports by loading data from multiple sources:

- `integrated-client-context.json` - Core client intelligence data (15+ sections)
- `comprehensive-keyword-database.json` - SEO keyword research (187+ keywords across 12 categories)
- `competitor-landscape-preliminary.md` - Competitive intelligence profiles
- Additional SEO markdown files (topic clusters, strategy, etc.)

**Report Features:**
- ✅ ShadCN UI component patterns
- ✅ NO GRADIENTS (solid colors: #667eea primary, #764ba2 secondary)
- ✅ Single-column keyword layout for easy scanning
- ✅ Per-segment psychographic analysis
- ✅ All 12 keyword categories displayed with metrics
- ✅ Competitor profiles with strengths/weaknesses
- ✅ Responsive design with sticky TOC
- ✅ Print-ready format (Cmd/Ctrl+P for PDF)

---

## How to Generate Reports

### For the Current Project (Rapid Cold Plunge)

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/client-intelligence/templates/updated-no-gradients

node comprehensive-shadcn-generator.js /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/client-intelligence/integrated-client-context.json
```

### For Any Other Project

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/client-intelligence/templates/updated-no-gradients

node comprehensive-shadcn-generator.js /Users/kris/CLAUDEtools/ORCHESTRAI/projects/[PROJECT-UUID]/client-intelligence/integrated-client-context.json
```

**Output Location:** `/projects/[PROJECT-UUID]/deliverables/client-intelligence/comprehensive-intelligence-report-shadcn-COMPLETE-[timestamp].html`

---

## Required Data Structure

For the generator to work, your project must have:

### 1. Core Intelligence Data (REQUIRED)
**Location:** `/projects/[uuid]/client-intelligence/integrated-client-context.json`

**Required Structure:**
```json
{
  "meta": {
    "clientName": "Client Name",
    "personaCount": 3,
    "projectId": "project-uuid"
  },
  "executiveSynthesis": { ... },
  "strategicContext": { ... },
  "icpSynthesis": {
    "segment1_performanceAthletes": {
      "name": "Performance Athletes",
      "revenueWeight": "60%",
      "psychographics": {
        "values": "...",
        "lifestyle": "...",
        "motivations": [...],
        "goals": [...]
      }
    },
    "segment2_...",
    "segment3_..."
  },
  "seoAndContentStrategy": { ... },
  "unitEconomicsAndFinancials": { ... },
  "goToMarketExecution": { ... },
  "marketIntelligence": { ... }
}
```

### 2. 24-Section ICP Copywriting Framework (MANDATORY)
**Location:** `/projects/[uuid]/client-intelligence/icp-24-section-framework.json`

**Structure:**
```json
{
  "meta": {
    "clientName": "Client Name",
    "generatedDate": "2025-12-09",
    "totalSegments": 5,
    "framework": "24-Section Copywriting ICP Framework"
  },
  "segments": {
    "segment1_key": {
      "name": "Segment Name",
      "revenueWeight": "35%",
      "avatar": "Meet [Name], [age], [occupation]...",
      "beforeState": "Current situation...",
      "afterState": "Desired outcome...",
      "decisionTriggers": "What makes them buy now...",
      "primaryGoals": "Main objectives...",
      "secondaryGoals": "Additional desires...",
      "dreams": "Ultimate aspirations...",
      "promises": "Expected outcomes...",
      "primaryComplaint": "Biggest frustration...",
      "secondaryComplaint": "Additional pain points...",
      "negativeStatistics": "Worrying data...",
      "objections": "Purchase hesitations...",
      "badHabits": "Harmful behaviors...",
      "consequences": "What happens without change...",
      "enemy": "External forces...",
      "ultimateFear": "Deepest anxiety...",
      "falseSolutionLie": "Myth believed...",
      "falseSolutionTruth": "Reality revealed...",
      "falseSolutionTip": "Better approach...",
      "mistakenBeliefTruth": "Core misconception...",
      "mistakenBeliefName": "Label for misconception...",
      "successMythLie": "Wrong success belief...",
      "successMythTruth": "Actual success path...",
      "whatTheyTried": "Previous solutions...",
      "whyItFailed": "Reasons for failure..."
    }
  }
}
```

**See [../24-SECTION-FRAMEWORK-GUIDE.md](../24-SECTION-FRAMEWORK-GUIDE.md) for complete generation instructions.**

### 3. SEO Keyword Database (Optional but Recommended)
**Location:** `/projects/[uuid]/deliverables/seo/comprehensive-keyword-database.json`

**Structure:**
```json
{
  "totalKeywords": 187,
  "keywordCategories": {
    "primaryLocalKeywords": {
      "keywords": [
        {
          "keyword": "cold plunge San Diego",
          "searchVolumeEstimate": "480/month",
          "searchVolumeActual": 480,
          "difficulty": "HIGH",
          "cpcEstimate": "$2.50",
          "priority": "Critical"
        }
      ]
    },
    "athleteRecoveryKeywords": { ... },
    "biohackingExecutiveKeywords": { ... },
    "wellnessHolisticKeywords": { ... },
    "serviceBenefitKeywords": { ... },
    "pricingMembershipKeywords": { ... },
    "neighborhoodSpecificKeywords": { ... },
    "longTailOpportunityKeywords": { ... },
    "voiceSearchKeywords": { ... },
    "competitiveAlternativeKeywords": { ... },
    "spanishLanguageKeywords": { ... },
    "wearablesIntegrationKeywords": { ... }
  }
}
```

### 3. Competitor Profiles (Optional)
**Location:** `/projects/[uuid]/deliverables/seo/competitor-landscape-preliminary.md`

**Format:** Markdown with sections using `#### 1. Competitor Name` headings

---

## What Gets Generated

### Complete Report Sections:

1. **Executive Dashboard** - Key metrics (LTV, CAC, Market Size)
2. **Business Context** - Vision, positioning, priorities
3. **ICP Profiles** - All customer segments with sub-segments
4. **Pain Points** - Detailed pain point analysis per segment
5. **Case Studies** - Success stories and testimonials
6. **Cultural Messaging** - Tone, voice, brand positioning
7. **Psychographic Analysis** - Per-segment psychographics with revenue weights
8. **ICP Copywriting Framework** - 24-section deep dive for conversion intelligence ✨ NEW MANDATORY
9. **SEO & Content Strategy** - All keyword categories with comprehensive data:
   - 📍 Primary Local Keywords
   - 🏃 Athlete Recovery Keywords
   - 🧬 Biohacking & Executive Keywords
   - 🧘 Wellness & Holistic Keywords
   - ✨ Service & Benefit Keywords
   - 💳 Pricing & Membership Keywords
   - 🏘️ Neighborhood-Specific Keywords
   - 🎯 Long-Tail Opportunity Keywords
   - 🎤 Voice Search Keywords
   - 🔄 Competitive Alternative Keywords
   - 🌎 Spanish Language Keywords
   - ⌚ Wearables & Tech Keywords
10. **Competitive Intelligence** - Market size, competitor profiles with strengths/weaknesses
11. **Go-To-Market Execution** - Implementation roadmap, channels, priorities

### Report Stats (Example from Rapid Cold Plunge):
- **File Size:** 182.56 KB
- **Lines:** 3,368
- **Keywords Displayed:** 50+ across all 12 categories
- **Competitor Profiles:** 10 detailed profiles
- **Generation Time:** ~17ms

---

## Customization Options

### Keyword Display Count

To show more/fewer keywords per category, edit line 717-728 in `comprehensive-shadcn-generator.js`:

```javascript
const categoryInfo = {
  primaryLocalKeywords: { ..., showTop: 8 },  // Change this number
  athleteRecoveryKeywords: { ..., showTop: 6 },
  // etc.
};
```

### Colors & Branding

Colors are defined as CSS variables in the template. Current solid colors (NO GRADIENTS):
- **Primary:** `#667eea` (purple)
- **Secondary:** `#764ba2` (dark purple)
- **Accent:** Translucent overlays only

### Layout Adjustments

- **Keyword Layout:** Currently single-column horizontal list (line 749-780)
- **Competitor Grid:** Currently 2-column grid (line 896)
- **TOC Position:** Sticky left sidebar

---

## Making This Your Standard Template

### Step 1: Test with Multiple Projects

Generate reports for 2-3 different client projects to verify compatibility:

```bash
node comprehensive-shadcn-generator.js /path/to/project1/client-intelligence/integrated-client-context.json
node comprehensive-shadcn-generator.js /path/to/project2/client-intelligence/integrated-client-context.json
```

### Step 2: Document Data Requirements

Ensure all projects follow the required `integrated-client-context.json` structure (see above).

### Step 3: Create Wrapper Script (Optional)

For easier project-based generation:

```bash
#!/bin/bash
# generate-intelligence-report.sh

PROJECT_UUID=$1
if [ -z "$PROJECT_UUID" ]; then
  echo "Usage: ./generate-intelligence-report.sh <project-uuid>"
  exit 1
fi

cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/client-intelligence/templates/updated-no-gradients

node comprehensive-shadcn-generator.js /Users/kris/CLAUDEtools/ORCHESTRAI/projects/$PROJECT_UUID/client-intelligence/integrated-client-context.json
```

### Step 4: Version Control

Tag the current working version:

```bash
git add orchestrai-domains/client-intelligence/templates/updated-no-gradients/comprehensive-shadcn-generator.js
git commit -m "✨ Standardize comprehensive intelligence report template v1.0"
git tag intelligence-report-v1.0
```

---

## Troubleshooting

### "Cannot find integrated-client-context.json"
- Verify the project has client intelligence data
- Check path: `/projects/[uuid]/client-intelligence/integrated-client-context.json`

### "SEO section showing minimal data"
- Add `comprehensive-keyword-database.json` to `/projects/[uuid]/deliverables/seo/`
- Generator gracefully falls back to basic keywords if comprehensive data not available

### "Competitor section empty"
- Add `competitor-landscape-preliminary.md` to `/projects/[uuid]/deliverables/seo/`
- Use markdown format with `#### N. Competitor Name` headings

### "Report missing psychographic data"
- Ensure `icpSynthesis` object has segments with `psychographics` property
- Verify each segment has: `values`, `lifestyle`, `motivations`, `goals`

---

## Future Enhancements

**Planned for v2.0:**
- ✅ Project-agnostic CLI (`node generate.js <project-uuid>`)
- ✅ Auto-detect project paths
- ✅ Support project name lookup
- ✅ Multiple output formats (HTML, PDF, JSON)
- ✅ Theme customization via config file
- ✅ Optional sections via flags

---

## Support

**Questions?** See:
- `/orchestrai-domains/client-intelligence/CLAUDE.md` - Domain documentation
- `/CLAUDE.md` - Main ORCHESTRAI architecture
- `/UNIVERSAL-AGENT-DELEGATION-PATTERN.md` - Agent patterns

**Updates:** This template is actively maintained. Check git log for latest changes.
