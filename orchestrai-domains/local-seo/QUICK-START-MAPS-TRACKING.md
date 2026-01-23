# Quick Start: Maps Tracking for nasmehp (or Any Client)

## Step 1: Find Your Client's Project Information

First, let's locate the nasmehp project data:

```bash
# Search for nasmehp project folder
ls -la projects/ | grep -i nasmehp

# Or find by client intelligence
grep -r "nasmehp" projects/*/client-intelligence/
```

**You'll need:**
- Project UUID (folder name like `nasmehp-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)
- Business name
- Location (city, country)
- Target keywords (if already defined)
- Business CID from Google (optional, for reviews)

---

## Step 2: Run Maps Tracker Directly (Simplest Method)

### Option A: Using Task Tool (Quickest)

```javascript
// In Claude Code, just ask me to run this:
Task(
  subagent_type="local-maps-ranking-tracker",
  prompt=`Track Google Maps local pack positions for nasmehp.

Business Details:
- Business Name: [Business name from nasmehp project]
- Location: [City, Country]
- Target Keywords:
  * [keyword 1]
  * [keyword 2]
  * [keyword 3]
  * [etc...]
- Language: [Dutch/English/etc]

Track positions for all keywords and identify:
1. Current local pack positions (1-20)
2. Quick win opportunities (positions 4-10)
3. Top 3 competitors and their positions
4. Recommended optimization actions

Save results to: projects/nasmehp-{uuid}/deliverables/local-seo/maps-ranking-report.json`
)
```

**What happens:**
1. Agent calls DataForSEO API for each keyword
2. Gets real-time Google Maps positions
3. Identifies quick wins (keywords ranking 4-10)
4. Analyzes competitors in top 3
5. Saves comprehensive report to your project folder

**Time:** 2-3 minutes for 20-30 keywords

---

### Option B: Via Full Local SEO Pipeline

```javascript
// Ask me to run this for complete local SEO analysis:
const LocalSEOPipeline = require('./orchestrai-domains/local-seo/pipelines/local-seo-pipeline.js');

// Execute pipeline with tracking enabled
await pipeline.execute({
  projectId: "nasmehp-{uuid}",
  businessName: "[Business name]",
  location: "[City, Country]",
  industry: "[dental/legal/restaurant/etc]",
  language: "[Dutch/English]",
  targetKeywords: [
    "keyword 1",
    "keyword 2",
    "keyword 3"
  ],
  businessCID: "[Google CID if known]",
  locations: [  // If multi-location
    "Location 1",
    "Location 2"
  ]
}, {
  enableRankingTracking: true,  // ← This enables Stage 1
  exportCSV: true  // ← Creates HighLevel CSV
});
```

**What happens:**
- **Stage 1** (30 min): Maps tracking + competitor intelligence
- **Stage 2** (20 min): GBP audit
- **Stage 3** (25 min): Citation building strategy
- **Stage 4** (15 min): Review management
- **Stage 5** (35 min): Location pages + local content
- **Stage 6** (10 min): Link building
- **Stage 7** (25 min): GBP posts + CSV export

**Total:** ~160 minutes for complete local SEO optimization

---

## Step 3: Understanding Your Results

### A. Maps Ranking Report

**File:** `projects/nasmehp-{uuid}/deliverables/local-seo/maps-ranking-report.json`

```json
{
  "businessName": "Example Clinic",
  "location": "Amsterdam, Netherlands",
  "trackingDate": "2024-01-22",

  "overallMetrics": {
    "averagePosition": 5.2,
    "visibilityScore": 68,
    "top3Keywords": 18,
    "quickWins": 15,
    "needsWorkCount": 12
  },

  "keywordRankings": [
    {
      "keyword": "tandarts Amsterdam",
      "currentPosition": 5,
      "localPackAppearance": false,
      "searchVolume": 1200,
      "difficulty": 35,
      "quickWin": true,
      "quickWinScore": 85,
      "competitorsInTop3": [
        {
          "name": "Dental Clinic Zuid",
          "position": 1,
          "reviews": 250,
          "rating": 4.8,
          "postsPerWeek": 3
        }
      ],
      "recommendedActions": [
        "Increase review velocity to 8-10/month",
        "Add GBP posts 3x/week",
        "Build 5 local citations"
      ],
      "estimatedTimeToTop3": "3-4 weeks"
    }
  ],

  "quickWinOpportunities": [
    {
      "keyword": "tandarts Amsterdam",
      "currentPosition": 5,
      "potentialPosition": 3,
      "monthlyClicks": 40,
      "estimatedRevenue": 2400,
      "actions": [...]
    }
  ],

  "competitors": [
    {
      "name": "Dental Clinic Zuid",
      "averagePosition": 1.8,
      "strength": 92,
      "reviews": 250,
      "rating": 4.8,
      "postsPerWeek": 3.2,
      "gaps": [
        "230 more reviews than you",
        "Posts 6x more frequently",
        "0.2 stars higher rating"
      ]
    }
  ]
}
```

### B. Quick Wins Summary

**File:** `projects/nasmehp-{uuid}/deliverables/local-seo/quick-wins-opportunities.json`

```json
{
  "totalQuickWins": 15,
  "estimatedMonthlyRevenue": 36000,
  "prioritizedList": [
    {
      "priority": 1,
      "keyword": "tandarts Amsterdam",
      "currentPosition": 5,
      "estimatedClicks": 40,
      "conversionRate": 0.03,
      "avgCustomerValue": 800,
      "monthlyRevenue": 2400,
      "difficulty": "EASY",
      "timeframe": "3-4 weeks",
      "actionPlan": {
        "week1": "Request 8-10 reviews",
        "week2": "Add 3-4 GBP posts",
        "week3": "Create location page",
        "week4": "Monitor position changes"
      }
    }
  ]
}
```

---

## Step 4: Set Up Visual Dashboard

### Simple Setup (Next.js + React)

**1. Create Dashboard Project**

```bash
# Navigate to projects folder
cd projects/nasmehp-{uuid}/

# Create dashboard folder
mkdir deliverables/maps-dashboard
cd deliverables/maps-dashboard

# Initialize Next.js app
npx create-next-app@latest . --typescript --tailwind --app
```

**2. Install Dependencies**

```bash
npm install leaflet react-leaflet d3
npm install @tanstack/react-query zustand
npm install date-fns clsx tailwind-merge
npm install -D @types/leaflet @types/d3
```

**3. Create Dashboard Component**

Copy the code from `VISUAL-MAP-DASHBOARD-IMPLEMENTATION.md` section "Core Components" into:

```
deliverables/maps-dashboard/
├── app/
│   ├── page.tsx  ← Main dashboard page
│   └── layout.tsx
├── components/
│   ├── MapsRankingDashboard.tsx  ← Copy from guide
│   ├── BusinessMarker.tsx
│   ├── RankingCircle.tsx
│   ├── CompetitorMarker.tsx
│   ├── RankingSummaryPanel.tsx
│   └── QuickWinsPanel.tsx
├── hooks/
│   └── useRankingData.ts  ← Copy from guide
├── api/
│   └── ranking.ts  ← Copy from guide
└── public/
```

**4. Configure Data Source**

```typescript
// app/page.tsx
import { MapsRankingDashboard } from '@/components/MapsRankingDashboard';

export default function Home() {
  return (
    <MapsRankingDashboard
      businessLocation={{
        lat: 52.3676,  // ← Get from nasmehp project
        lng: 4.9041,
        name: "nasmehp Business Name"
      }}
      projectId="nasmehp-{uuid}"
    />
  );
}
```

**5. Load Real Data**

```typescript
// hooks/useRankingData.ts
import { useQuery } from '@tanstack/react-query';

export const useRankingData = (projectId: string) => {
  return useQuery({
    queryKey: ['ranking-data', projectId],
    queryFn: async () => {
      // Load from your saved JSON report
      const response = await fetch(`/api/ranking-data/${projectId}`);
      return response.json();
    },
    staleTime: 3600000, // 1 hour cache
  });
};
```

**6. Create API Route to Serve Data**

```typescript
// app/api/ranking-data/[projectId]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // Load the saved ranking report
    const reportPath = path.join(
      process.cwd(),
      `../../../deliverables/local-seo/maps-ranking-report.json`
    );

    const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    // Transform for frontend
    return NextResponse.json({
      overallAvgPosition: data.overallMetrics.averagePosition,
      visibilityScore: data.overallMetrics.visibilityScore,
      circles: transformToCircles(data.keywordRankings),
      competitors: data.competitors,
      quickWins: data.quickWinOpportunities,
      historicalTrends: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load ranking data' },
      { status: 500 }
    );
  }
}

function transformToCircles(rankings: any[]) {
  // Group keywords by estimated radius
  return [
    {
      radius: 2000,
      avgPosition: calculateAvg(rankings.filter(r => isNearby(r.keyword))),
      keywords: rankings.filter(r => isNearby(r.keyword))
    },
    // ... more circles
  ];
}
```

**7. Run Dashboard**

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Step 5: Practical Example - nasmehp Tracking

Let me help you track nasmehp positions right now. Here's what I need from you:

### Information Needed:

**1. Business Details:**
- Full business name: _____________
- City/Location: _____________
- Industry: _____________
- Language: _____________

**2. Keywords to Track (10-20 recommended):**
```
Example for dental clinic in Amsterdam:
- tandarts Amsterdam
- tandarts Amsterdam centrum
- dental implants Amsterdam
- emergency dentist Amsterdam
- teeth whitening Amsterdam
- tandarts De Pijp
- tandarts Zuid
```

Your keywords:
- _____________
- _____________
- _____________

**3. Competitor Info (optional but helpful):**
- Competitor 1 name: _____________
- Competitor 2 name: _____________

---

## Immediate Action Plan

### Right Now:

**Tell me:**
1. What's the full business name for nasmehp?
2. What city/location should I track?
3. What are 5-10 main keywords you want to track?

**I will:**
1. Find the nasmehp project UUID
2. Run the maps-ranking-tracker agent
3. Generate the ranking report
4. Identify quick wins
5. Save all results to your project folder

### This Week:

**Day 1:** Get ranking baseline (we do this together now)
**Day 2-3:** Review quick wins and prioritize
**Day 4-7:** Begin optimization (reviews, posts, citations)

### Next Week:

**Optional:** Set up visual dashboard
- I can guide you through each step
- Or we can keep using JSON reports
- Dashboard adds visual insights but not required

---

## Simple Dashboard Alternative (No Coding)

If you don't want to build the React dashboard, you can visualize data with:

**Option 1: Google Sheets Visualization**

I can format the ranking data into a Google Sheets-compatible CSV with:
- Keyword list with positions
- Color-coded by rank (green/yellow/red)
- Quick wins highlighted
- Competitor comparison table

**Option 2: Simple HTML Report**

I can generate a static HTML file with:
- Interactive tables (sortable, filterable)
- Charts (D3.js embedded)
- No server required - just open in browser
- Auto-refreshes from JSON file

**Option 3: Notion/Airtable Integration**

Export data to Notion or Airtable with:
- Automated views and filters
- Kanban boards for quick wins
- Progress tracking
- Team collaboration

---

## Cost Estimate

**For 20 keywords tracked daily for nasmehp:**

```
DataForSEO API Costs:
- 20 keywords × $0.15 average = $3 per check
- Daily tracking = $3 × 30 days = $90/month
- Weekly tracking = $3 × 4 weeks = $12/month

ROI Calculation (Conservative):
- 1 quick win converted = 1-3 new customers/month
- Average customer value = $500-$2000
- Monthly revenue increase = $500-$6000
- ROI = 416% to 6,567%
```

**Recommended:** Start with weekly tracking ($12/month) to establish baseline, then switch to daily if needed.

---

## Next Steps - Your Choice

**Path A: Full Dashboard (Visual + Advanced)**
→ I guide you through React/Next.js setup
→ Takes 2-3 hours
→ Interactive map, real-time updates
→ Best for multiple clients or ongoing use

**Path B: Simple Reports (Fast + Easy)**
→ Run tracker, get JSON reports
→ Takes 5 minutes
→ Review reports in text editor or convert to CSV
→ Best for single client or testing

**Path C: HTML Visualization (Middle Ground)**
→ I generate static HTML with charts
→ Takes 30 minutes
→ Interactive tables and graphs, no coding
→ Best for client presentations

---

## What Do You Want to Do?

**Tell me:**
1. nasmehp business name, location, and 5-10 keywords
2. Which path you prefer (A, B, or C)

**I'll immediately:**
- Find nasmehp project
- Run tracking for those keywords
- Generate results in your chosen format
- Show you exactly where you rank and quick wins available

Ready to start? Just give me the business details and I'll track positions for nasmehp in the next 2-3 minutes! 🚀
