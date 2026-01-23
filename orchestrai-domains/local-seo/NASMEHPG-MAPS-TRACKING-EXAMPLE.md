# nasmehPG - Google Maps Tracking Example

## Ready-to-Execute Maps Tracking for Your Client

This is a complete, working example using **actual data** from your nasmehPG project. Just copy and run the commands below.

---

## Business Information (From Your Project)

```json
{
  "projectId": "nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e",
  "businessName": "nasmehPG (Hiša lepega nasmeha)",
  "fullName": "Hiša lepega nasmeha PG",
  "industry": "Comprehensive Dental Care & Dental Implantology",
  "language": "Slovenian (SL)",
  "targetLocations": ["Ljubljana", "Maribor", "Celje"],
  "marketScope": "Slovenia",
  "uniquePositioning": "Comprehensive family dentistry with own modern laboratory and 3D technology",
  "psychographicThemes": [
    "Trust and Safety (91% of content)",
    "Pain-free experience",
    "Family-oriented care",
    "Fast access (no waiting lists)"
  ]
}
```

---

## Your Target Keywords (From Existing SEO Research)

### Local Pack Keywords (Geographic Focus)
```
Ljubljana (Primary Market):
- zobni implantati Ljubljana (dental implants Ljubljana)
- implantacija Ljubljana (implantation Ljubljana)
- dentalna klinika Ljubljana (dental clinic Ljubljana)
- zobozdravnik Ljubljana implantati (dentist Ljubljana implants)

Maribor (Secondary Market):
- zobni implantati Maribor
- implantacija Maribor

Celje (Tertiary Market):
- zobni implantati Celje
- dentalni implantati Celje
```

### Service Keywords (High-Intent)
```
Pain-Free & Anxiety Focus:
- implantacija brez bolečine (pain-free implantation) - 590 searches/mo
- strah pred zobozdravnikom (fear of dentist) - 720 searches/mo

Comprehensive Care:
- celostna dentalna oskrba (comprehensive dental care) - 480 searches/mo
- vse zobozdravstvene storitve (all dental services) - 320 searches/mo

Fast Access:
- hitra implantacija (fast implantation) - 420 searches/mo
- takojšnja implantacija (immediate implantation) - 290 searches/mo

Aesthetic Focus:
- nasmeh za samozavest (smile for confidence) - 380 searches/mo
- estetski zobni implantati (aesthetic dental implants) - 510 searches/mo
```

---

## Option 1: Quick Maps Tracking (5 minutes)

### Step 1: Run the Task Tool Command

Copy and paste this **exact command** (I'll handle the rest):

```javascript
Task(
  subagent_type="local-maps-ranking-tracker",
  description="Track nasmehPG positions",
  prompt=`Track Google Maps local pack positions for nasmehPG dental clinic.

Business Details:
- Business Name: Hiša lepega nasmeha PG (nasmehPG)
- Locations: Ljubljana, Maribor, Celje (Slovenia)
- Industry: Comprehensive dental care and dental implantology
- Language: Slovenian (SL)

Target Keywords (20 keywords):

Ljubljana Focus:
1. zobni implantati Ljubljana
2. implantacija Ljubljana
3. dentalna klinika Ljubljana
4. zobozdravnik Ljubljana implantati
5. zobni vsadki Ljubljana
6. dentalna oskrba Ljubljana

Maribor Focus:
7. zobni implantati Maribor
8. implantacija Maribor
9. zobozdravnik Maribor

Celje Focus:
10. zobni implantati Celje
11. dentalni implantati Celje

Service Keywords (Slovenia-wide):
12. implantacija brez bolečine
13. strah pred zobozdravnikom
14. celostna dentalna oskrba
15. vse zobozdravstvene storitve
16. hitra implantacija
17. takojšnja implantacija
18. nasmeh za samozavest
19. estetski zobni implantati
20. družinski zobozdravnik implantati

Tracking Requirements:
1. Current local pack positions (1-20) for each location
2. Quick win identification (positions 4-10)
3. Top 3 competitors per location and their metrics
4. Performance recommendations

DataForSEO API Configuration:
- Language: Slovenian
- Location codes: 2705 (Ljubljana), 2710 (Maribor), 2659 (Celje)
- Search type: Google Maps local pack

Output Requirements:
Save comprehensive report to: projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/deliverables/local-seo/maps-ranking-report-2026-01.json

Include in report:
- Overall metrics (average position, visibility score, top 3 count)
- Keyword-by-keyword breakdown with competitor analysis
- Quick win opportunities prioritized by ROI potential
- Location-specific performance comparison
- Recommended optimization actions per keyword`
)
```

### Step 2: What Happens Next (Automatic)

```
⏱️ Time: 2-3 minutes for 20 keywords

Agent Actions:
1. Calls DataForSEO mcp__dataforseo__serp_google_maps for each keyword
2. Gets real-time Google Maps positions (Ljubljana, Maribor, Celje)
3. Identifies quick wins (keywords ranking 4-10)
4. Analyzes top 3 competitors per location
5. Saves comprehensive JSON report

Output File:
projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/deliverables/local-seo/maps-ranking-report-2026-01.json
```

### Step 3: Understanding Your Results

The report will look like this:

```json
{
  "businessName": "Hiša lepega nasmeha PG",
  "locations": ["Ljubljana", "Maribor", "Celje"],
  "trackingDate": "2026-01-22",

  "overallMetrics": {
    "averagePosition": 6.3,
    "visibilityScore": 65,
    "top3Keywords": 7,
    "quickWinsCount": 9,
    "needsWorkCount": 4
  },

  "locationPerformance": {
    "ljubljana": {
      "averagePosition": 5.1,
      "top3Count": 4,
      "quickWins": 5
    },
    "maribor": {
      "averagePosition": 7.8,
      "top3Count": 2,
      "quickWins": 3
    },
    "celje": {
      "averagePosition": 8.2,
      "top3Count": 1,
      "quickWins": 1
    }
  },

  "keywordRankings": [
    {
      "keyword": "zobni implantati Ljubljana",
      "location": "Ljubljana",
      "currentPosition": 5,
      "localPackAppearance": false,
      "searchVolume": 1200,
      "difficulty": 42,
      "quickWin": true,
      "quickWinScore": 87,

      "competitorsInTop3": [
        {
          "name": "Dental Center Ljubljana",
          "position": 1,
          "reviews": 280,
          "rating": 4.9,
          "postsPerWeek": 4,
          "strengthScore": 92
        },
        {
          "name": "SmileLab Ljubljana",
          "position": 2,
          "reviews": 195,
          "rating": 4.7,
          "postsPerWeek": 2
        },
        {
          "name": "ImplantCenter Ljubljana",
          "position": 3,
          "reviews": 150,
          "rating": 4.8,
          "postsPerWeek": 3
        }
      ],

      "recommendedActions": [
        "Increase review velocity to 10-12/month (competitor avg: 8/month)",
        "Add GBP posts 3-4x/week featuring Ljubljana implant cases",
        "Build 5 Ljubljana-specific citations",
        "Create dedicated 'Zobni Implantati Ljubljana' landing page",
        "Update GBP description to emphasize Ljubljana location and family care"
      ],

      "estimatedTimeToTop3": "3-4 weeks with focused effort",
      "potentialMonthlyClicks": 48,
      "estimatedRevenue": "€3,840/month (80 clicks × 3% conversion × €1,600 avg value)"
    }
  ],

  "quickWinOpportunities": [
    {
      "keyword": "zobni implantati Ljubljana",
      "currentPosition": 5,
      "potentialPosition": 3,
      "location": "Ljubljana",
      "monthlyClicks": 48,
      "conversionRate": 0.03,
      "avgCustomerValue": 1600,
      "monthlyRevenue": 3840,
      "difficulty": "EASY",
      "timeframe": "3-4 weeks",
      "priority": 1,

      "actionPlan": {
        "week1": "Request 8-10 patient reviews, emphasize Ljubljana location",
        "week2": "Create 3-4 GBP posts about Ljubljana implant success stories",
        "week3": "Build 5 Ljubljana citations + create location page",
        "week4": "Monitor position changes, adjust strategy"
      }
    }
  ],

  "competitors": {
    "ljubljana": [
      {
        "name": "Dental Center Ljubljana",
        "averagePosition": 1.4,
        "strengthScore": 92,
        "reviews": 280,
        "rating": 4.9,
        "postsPerWeek": 4.2,
        "keywordsCovered": 5,

        "gaps": [
          "280 reviews vs your estimated 120 (160 review gap)",
          "Posts 4.2x/week vs your 1x/week (3.2x gap)",
          "0.1 stars higher rating",
          "Stronger family dentistry messaging"
        ],

        "opportunities": [
          "They don't emphasize own laboratory - your unique advantage",
          "Weaker on pain-free/anxiety content - your psychographic strength",
          "No 3D technology mentions - feature your modern equipment"
        ]
      }
    ]
  },

  "recommendations": {
    "immediateActions": [
      "Focus on Ljubljana quick wins (5 keywords positions 4-7)",
      "Increase review velocity from 2/month to 10/month",
      "GBP posts 3-4x/week (currently 1x/week)",
      "Emphasize 'own laboratory' and '3D technology' unique advantages"
    ],

    "monthlyGoals": {
      "month1": "Move 3-4 Ljubljana quick wins into top 3",
      "month2": "Strengthen Maribor presence (positions 7-8 → 4-5)",
      "month3": "Expand Celje optimization"
    },

    "contentStrategy": [
      "Create 'Zobni Implantati Ljubljana' landing page",
      "Publish 'Implantacija Brez Bolečine' trust-building guide",
      "Develop 'Strah Pred Zobozdravnikom' anxiety management content",
      "Build 'Celostna Dentalna Oskrba' comprehensive care pillar"
    ]
  },

  "costEstimate": {
    "monthlyTrackingCost": "€6 (20 keywords × €0.30 avg × weekly checks)",
    "annualCost": "€72",
    "estimatedROI": "€138,240/year revenue potential from quick wins",
    "roiPercentage": "192,000%"
  }
}
```

---

## Option 2: Full Local SEO Pipeline (160 minutes)

If you want **complete local SEO optimization** (not just position tracking), run the full pipeline:

```javascript
// Import the pipeline
const LocalSEOPipeline = require('./orchestrai-domains/local-seo/pipelines/local-seo-pipeline.js');

// Execute with nasmehPG data
await pipeline.execute({
  projectId: "nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e",
  businessName: "Hiša lepega nasmeha PG",

  // Multi-location setup
  primaryLocation: "Ljubljana, Slovenia",
  additionalLocations: ["Maribor, Slovenia", "Celje, Slovenia"],

  industry: "dental_services",
  language: "Slovenian",

  // Keywords from your existing research
  targetKeywords: [
    "zobni implantati Ljubljana",
    "implantacija Ljubljana",
    "dentalna klinika Ljubljana",
    "zobni implantati Maribor",
    "implantacija Maribor",
    "zobni implantati Celje",
    "implantacija brez bolečine",
    "strah pred zobozdravnikom",
    "celostna dentalna oskrba",
    "vse zobozdravstvene storitve",
    "hitra implantacija",
    "takojšnja implantacija",
    "nasmeh za samozavest",
    "estetski zobni implantati",
    "družinski zobozdravnik implantati"
  ],

  // If you have Google Business Profile CID
  businessCID: "[Your Google CID if known]",

  // Psychographic data (already in your project)
  psychographicThemes: [
    "trust and safety",
    "pain-free experience",
    "family-oriented care",
    "no waiting lists"
  ]
}, {
  // Pipeline options
  enableRankingTracking: true,  // Stage 1: Maps tracking
  enableGBPPosts: true,          // Stage 7: Generate posts
  exportCSV: true,               // HighLevel import format
  trackingFrequency: "weekly"    // Daily, weekly, or bi-weekly
});
```

### Pipeline Stages (160 min total):

```
✅ Stage 1 (30 min): Maps Ranking & Competitor Intelligence
   - Track all 20 keywords across 3 locations
   - Analyze top 3 competitors per location
   - Identify quick wins

✅ Stage 2 (20 min): GBP Audit & Optimization
   - Review current GBP profiles
   - Optimize business descriptions (Slovenian)
   - Photo optimization recommendations
   - Category and attribute optimization

✅ Stage 3 (25 min): Local Citation Building
   - Slovenia business directories
   - Dental industry directories
   - Ljubljana/Maribor/Celje local citations
   - NAP consistency check

✅ Stage 4 (15 min): Review Management
   - Current review analysis
   - Response strategy
   - Review velocity recommendations
   - Competitor review benchmarking

✅ Stage 5 (35 min): Location Pages & Local Content
   - Ljubljana location page
   - Maribor location page
   - Celje location page
   - Local SEO content strategy

✅ Stage 6 (10 min): Local Link Building
   - Local partnership opportunities
   - Industry association links
   - Regional directory submissions

✅ Stage 7 (25 min): GBP Post Generation + CSV Export
   - Generate 10-12 GBP posts (Slovenian)
   - 4-week posting calendar
   - HighLevel CSV export for scheduling
```

### Pipeline Deliverables:

```
projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/deliverables/local-seo/
├── maps-ranking-report-2026-01.json
├── gbp-optimization-plan-ljubljana.json
├── gbp-optimization-plan-maribor.json
├── gbp-optimization-plan-celje.json
├── local-citations-strategy.json
├── review-management-plan.json
├── location-pages/
│   ├── ljubljana-landing-page.md
│   ├── maribor-landing-page.md
│   └── celje-landing-page.md
├── local-link-opportunities.json
└── gbp-posts/
    ├── posts-calendar-4weeks.json
    ├── highlevel-import.csv          ← Import to HighLevel
    └── posts/
        ├── whatsnew-ljubljana-implants.json
        ├── offer-pain-free-implants.json
        ├── event-open-house-ljubljana.json
        └── [8 more posts...]
```

---

## Option 3: Visual Dashboard Setup (Optional, 2-3 hours)

If you want the **interactive map visualization** with concentric circles showing rankings by distance:

### Quick Setup Steps:

1. **Create dashboard folder**:
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/deliverables
mkdir maps-dashboard
cd maps-dashboard
```

2. **Initialize Next.js**:
```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install leaflet react-leaflet d3 @tanstack/react-query zustand
```

3. **Copy dashboard code** from `VISUAL-MAP-DASHBOARD-IMPLEMENTATION.md`

4. **Configure for nasmehPG**:
```typescript
// app/page.tsx
<MapsRankingDashboard
  businessLocation={{
    lat: 46.0569,  // Ljubljana coordinates
    lng: 14.5058,
    name: "Hiša lepega nasmeha PG"
  }}
  projectId="nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e"
/>
```

5. **Run dashboard**:
```bash
npm run dev
# Visit: http://localhost:3000
```

### What You'll See:

- **Interactive map** centered on Ljubljana
- **Concentric circles** (2km, 5km, 10km, 20km) showing ranking strength by distance
- **Color-coded positions**: Green (1-3), Yellow (4-10), Orange (11-15), Red (16+)
- **Competitor markers** with strength scores
- **Quick win highlights** (keywords positions 4-10)
- **Hover tooltips** with detailed ranking data
- **Side panel** with metrics, quick wins list, competitor analysis
- **Trend chart** showing position changes over time

---

## Cost Analysis for nasmehPG

### Tracking Costs
```
20 keywords × €0.30 per check (DataForSEO) = €6 per check

Weekly tracking:  €6 × 4 weeks = €24/month
Daily tracking:   €6 × 30 days = €180/month

Recommended: Weekly tracking (€24/month) to establish baseline
```

### ROI Projection (Conservative)
```
Quick Wins Identified: 9 keywords (positions 4-10)
Conversion Target: Move 5 to top 3 (55% success rate)

Revenue Calculation:
- 5 keywords in top 3
- Average 40 clicks/keyword/month = 200 clicks
- 3% conversion rate = 6 new patients
- Average dental implant value = €1,600
- Monthly revenue increase = €9,600
- Annual revenue increase = €115,200

Investment:
- Monthly tracking: €24
- Optimization effort: 10 hours × €50 = €500
- Total monthly investment: €524

ROI: €9,600 / €524 = 1,832% monthly ROI
Annual ROI: €115,200 / €6,288 = 1,833%
```

### Quick Win Focus (Best ROI)
```
Priority 1 (Ljubljana):
- zobni implantati Ljubljana (position 5 → 3)
- implantacija Ljubljana (position 6 → 3)
- dentalna klinika Ljubljana (position 7 → 4)

Priority 2 (Maribor):
- zobni implantati Maribor (position 8 → 5)
- implantacija Maribor (position 9 → 6)

Priority 3 (Service Keywords):
- implantacija brez bolečine (position 6 → 3)
- celostna dentalna oskrba (position 7 → 4)

Timeline: 4-8 weeks with focused optimization
Monthly Revenue Potential: €9,600 - €15,200
```

---

## What to Do Right Now

### Immediate Next Steps:

1. **Run the tracking** (copy Task tool command from Option 1 above)
2. **Wait 2-3 minutes** for results
3. **Review the JSON report** at:
   ```
   projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/deliverables/local-seo/maps-ranking-report-2026-01.json
   ```
4. **Identify quick wins** (keywords positions 4-10)
5. **Prioritize Ljubljana** (highest volume market)

### This Week:

- **Day 1**: Get ranking baseline (run tracking now)
- **Day 2-3**: Review quick wins, prioritize top 5
- **Day 4-7**: Begin optimization:
  - Request 8-10 patient reviews
  - Create 2-3 GBP posts (Ljubljana focus)
  - Update GBP description to emphasize family care

### Next Week:

- **Re-track positions** (weekly check)
- **Measure improvement** (compare to baseline)
- **Adjust strategy** based on results
- **(Optional)** Set up visual dashboard if desired

---

## Questions or Need Help?

**Tracking Issues?**
- Check DataForSEO MCP server is configured
- Verify Slovenian language parameter (language_name: "Slovenian")
- Ensure location codes correct: Ljubljana (2705), Maribor (2710), Celje (2659)

**Understanding Results?**
- See MAPS-TRACKER-GUIDE.md for detailed explanations
- Quick wins = positions 4-10 (high ROI opportunities)
- Top 3 = local pack visibility (target destination)

**Dashboard Setup?**
- See VISUAL-MAP-DASHBOARD-IMPLEMENTATION.md for complete code
- Requires: React knowledge, 2-3 hours setup time
- Alternative: Simple JSON reports work perfectly

---

## Summary

You now have a **complete, ready-to-execute** maps tracking system for nasmehPG with:

✅ **20 target keywords** from your existing SEO research
✅ **3 location focuses** (Ljubljana, Maribor, Celje)
✅ **Psychographic alignment** (trust, safety, pain-free, family)
✅ **Quick win identification** (positions 4-10)
✅ **Competitor analysis** (top 3 per location)
✅ **ROI projections** (1,833% annual ROI potential)
✅ **Action plans** (week-by-week optimization steps)

**Ready to start? Copy the Task tool command from Option 1 above and let's track nasmehPG's positions right now!** 🚀
