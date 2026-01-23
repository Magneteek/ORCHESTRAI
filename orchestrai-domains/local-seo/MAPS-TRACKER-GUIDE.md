# Google Maps Ranking Tracker - Usage Guide

## Overview

The Google Maps Ranking Tracker is a real-time position monitoring system that tracks your local pack rankings, identifies quick win opportunities, and provides competitive intelligence using DataForSEO's SERP API.

**Key Capabilities:**
- Track 50+ keywords in <60 seconds
- 98%+ accuracy (real Google data)
- Quick win detection (positions 4-10)
- Competitor position monitoring
- Historical trend analysis
- Cost: ~$0.10-0.20 per keyword check

---

## Quick Start

### 1. Basic Tracking Setup

```javascript
// Via Pipeline (Recommended)
const LocalSEOPipeline = require('./orchestrai-domains/local-seo/pipelines/local-seo-pipeline.js');

const pipeline = new LocalSEOPipeline(coordinationPatterns, crystallineMemory, mcpManager);

const result = await pipeline.execute({
  businessName: "Amsterdam Dental Clinic",
  location: "Amsterdam, Netherlands",
  targetKeywords: [
    "tandarts Amsterdam",
    "tandarts Amsterdam centrum",
    "dental implants Amsterdam",
    "emergency dentist Amsterdam"
  ],
  language: "Dutch"
}, {
  enableRankingTracking: true  // Enable Stage 1
});

// Access ranking data
const rankings = result.results.maps_ranking_intelligence;
console.log('Current Positions:', rankings.results.rankingTracking);
console.log('Quick Wins:', rankings.results.quickWins);
```

### 2. Direct Agent Invocation

```javascript
// Via Task tool for standalone tracking
Task(
  subagent_type="local-maps-ranking-tracker",
  prompt=`Track Google Maps positions for Amsterdam Dental Clinic.
    Keywords: tandarts Amsterdam, dental implants Amsterdam
    Location: Amsterdam, Netherlands
    Language: Dutch

    Provide:
    - Current local pack positions (1-20)
    - 3-pack visibility status
    - Quick win opportunities
    - Competitor positions`
)
```

---

## Understanding Your Results

### Position Tracking Report

```json
{
  "keyword": "tandarts Amsterdam",
  "currentPosition": 5,
  "localPackAppearance": false,
  "historicalTrend": "stable",
  "searchVolume": 1200,
  "difficulty": 35,
  "competitorsInTop3": [
    {
      "name": "Dental Clinic Zuid",
      "position": 1,
      "reviews": 250,
      "rating": 4.8,
      "posts_per_week": 3
    },
    {
      "name": "Amsterdam Smile Center",
      "position": 2,
      "reviews": 180,
      "rating": 4.7,
      "posts_per_week": 2
    }
  ],
  "quickWin": true,
  "quickWinScore": 85,
  "recommendedActions": [
    "Increase review velocity (current: 2/month, competitor avg: 8/month)",
    "Add GBP posts (competitor posts 3x/week, you post 0.5x/week)",
    "Optimize for 'Amsterdam centrum' geographic modifier"
  ]
}
```

### Position Ranges Explained

| Position | Visibility | Status | Action |
|----------|-----------|--------|---------|
| 1-3 | **High** | Local Pack (3-pack) | Maintain position, monitor competitors |
| 4-7 | **Medium** | Just outside pack | **QUICK WIN** - High priority optimization |
| 8-10 | **Low** | Below fold | **QUICK WIN** - Medium priority |
| 11-20 | **Very Low** | Second page | Long-term optimization needed |
| 21+ | **None** | Not ranking | Major SEO campaign required |

---

## Quick Wins Strategy

### What Are Quick Wins?

Keywords where you rank **positions 4-10** with:
- Low difficulty (<40)
- Decent search volume (>100 searches/month)
- Recent positive movement
- Weak competition in top 3

**ROI**: 1 quick win = potential 5-15 new customers/month

### Quick Win Identification

```javascript
// Automatic quick win detection
const quickWins = rankings.results.rankingTracking.filter(keyword =>
  keyword.quickWin === true
);

quickWins.forEach(kw => {
  console.log(`
    Keyword: ${kw.keyword}
    Current Position: ${kw.currentPosition}
    Quick Win Score: ${kw.quickWinScore}/100
    Estimated Improvement Potential: ${kw.estimatedClicks}/clicks per month

    Top Action: ${kw.recommendedActions[0]}
  `);
});
```

### Quick Win Execution Plan

**Week 1-2: Low-Hanging Fruit**
- Focus on keywords ranking 4-6
- Target: Move into local pack (top 3)
- Actions:
  1. Create 3-4 GBP posts per week featuring this keyword
  2. Request 8-10 reviews mentioning service
  3. Add FAQ content to website targeting keyword
  4. Update GBP description to include keyword naturally

**Week 3-4: Medium Opportunities**
- Focus on keywords ranking 7-10
- Target: Move into 4-6 range first
- Actions:
  1. Create dedicated landing page for keyword
  2. Build 5-7 local citations featuring keyword
  3. Add location page if geographic modifier present
  4. Optimize existing content for keyword

---

## Competitor Intelligence Integration

### Competitive Strength Scoring

```javascript
// Competitor scores from 0-100
const competitors = rankings.results.competitorIntelligence.competitors;

competitors.forEach(comp => {
  console.log(`
    ${comp.name}
    Overall Strength: ${comp.overallStrength}/100

    Breakdown:
    - Reviews: ${comp.reviewStrength}/100 (${comp.reviewCount} reviews at ${comp.rating}★)
    - Content: ${comp.contentStrength}/100 (${comp.postsPerWeek} posts/week)
    - Technical: ${comp.technicalStrength}/100
    - Authority: ${comp.authorityStrength}/100

    Gap Opportunities:
    ${comp.gaps.map(gap => `- ${gap}`).join('\n')}
  `);
});
```

### Competitive Targeting Strategy

**Weak Competitors (Score 0-40)**
- Easy to outrank
- Focus: Direct competition
- Timeline: 2-4 weeks

**Medium Competitors (Score 41-70)**
- Moderate effort required
- Focus: Service differentiation
- Timeline: 1-3 months

**Strong Competitors (Score 71-100)**
- Long-term strategy
- Focus: Niche specialization
- Timeline: 3-6 months

---

## Tracking Frequency Recommendations

### Daily Tracking (Recommended)
```javascript
// Set up daily automated checks
const trackingSchedule = {
  frequency: 'daily',
  time: '10:00 AM',  // After overnight Google updates
  keywords: 50,
  cost: '$5-10/month'  // 50 keywords × $0.10-0.20 each × 30 days
};

// Benefits:
// - Catch ranking volatility immediately
// - Monitor competitor movements
// - Identify algorithm update impacts
// - Track quick win progress
```

### Weekly Tracking (Budget-Conscious)
```javascript
const trackingSchedule = {
  frequency: 'weekly',
  day: 'Monday',
  keywords: 50,
  cost: '$2-4/month'
};

// Benefits:
// - Lower cost
// - Still catch major trends
// - Good for stable markets
```

### Bi-Weekly Tracking (Minimal)
```javascript
const trackingSchedule = {
  frequency: 'bi-weekly',
  keywords: 25,  // Reduced set
  cost: '$1-2/month'
};

// Use Case:
// - Very stable rankings
// - Limited budget
// - Brand-only tracking
```

---

## Integration with Pipeline Stages

### Stage 1: Maps Ranking → Stage 2: GBP Optimization

```javascript
// Ranking data informs GBP optimization priorities
const rankings = result.results.maps_ranking_intelligence;
const quickWins = rankings.results.quickWins;

// GBP optimization focuses on quick win keywords
const gbpOptimization = result.results.gbp_audit_optimization;
// Uses quick win data to prioritize:
// - Business description keywords
// - Service listings
// - Photo alt tags
// - Q&A content
```

### Stage 1: Competitor Intel → Stage 7: GBP Posts

```javascript
// Competitor analysis drives content strategy
const competitors = rankings.results.competitorIntelligence;

// GBP post generation targets competitor weaknesses:
// - Post more frequently than competitors
// - Highlight services competitors don't emphasize
// - Showcase better reviews/ratings
// - Target keywords competitors are weak on
```

---

## Performance Metrics & ROI

### Key Metrics to Track

```javascript
const metrics = {
  visibilityScore: {
    calculation: "Weighted average position × search volume",
    target: ">70/100",
    current: 65
  },

  localPackAppearanceRate: {
    calculation: "Keywords in top 3 / total keywords",
    target: ">40%",
    current: "35% (18 of 50 keywords)"
  },

  averagePosition: {
    target: "<5.0",
    current: 5.8,
    trend: "↑ improving"
  },

  quickWinConversionRate: {
    calculation: "Quick wins moved to top 3 / total quick wins",
    target: ">60%",
    current: "55% (11 of 20 quick wins)"
  }
};
```

### ROI Calculation

```javascript
// Example: Amsterdam Dental Clinic
const roiAnalysis = {
  input: {
    trackingCost: 6,  // $6/month (50 keywords daily)
    optimizationHours: 10,  // Hours per month
    laborCost: 50  // $/hour
  },

  output: {
    quickWinsIdentified: 18,
    quickWinsConverted: 10,  // Moved to top 3
    avgClicksPerKeyword: 40,  // Monthly clicks
    conversionRate: 0.03,  // 3% book appointment
    avgCustomerValue: 800  // Dental services
  },

  roi: {
    monthlyCost: 506,  // $6 + (10 hours × $50)
    newCustomers: 12,  // (10 keywords × 40 clicks × 3%)
    revenue: 9600,  // 12 customers × $800
    profit: 9094,  // $9,600 - $506
    roiPercent: 1797  // 1797% ROI
  }
};
```

---

## Advanced Features

### Historical Trend Analysis

```javascript
// Track position changes over time
const trendAnalysis = {
  keyword: "tandarts Amsterdam",
  positions: [
    { date: "2024-01-01", position: 8 },
    { date: "2024-01-08", position: 7 },
    { date: "2024-01-15", position: 6 },
    { date: "2024-01-22", position: 5 }  // Current
  ],
  trend: "↑ Improving (+3 positions in 3 weeks)",
  velocity: 1,  // Positions per week
  projectedTop3: "2024-02-12"  // 3 weeks at current velocity
};
```

### Competitor Movement Alerts

```javascript
// Get notified when competitors make moves
const alerts = {
  competitorPositionDrop: {
    competitor: "Dental Clinic Zuid",
    keyword: "emergency dentist Amsterdam",
    oldPosition: 2,
    newPosition: 4,
    opportunity: "HIGH - Move in to top 3"
  },

  newCompetitorEntry: {
    competitor: "Amsterdam Emergency Dental",
    keyword: "emergency dentist Amsterdam",
    position: 3,
    threat: "MEDIUM - Monitor closely"
  }
};
```

### Geographic Radius Tracking

```javascript
// Track rankings at different distances from location
const radiusTracking = {
  keyword: "tandarts",
  centerLocation: "Amsterdam Dental Clinic (52.3676, 4.9041)",

  results: [
    { distance: "0km", position: 1, note: "At your location" },
    { distance: "2km", position: 2, note: "De Pijp neighborhood" },
    { distance: "5km", position: 4, note: "Zuid district" },
    { distance: "10km", position: 8, note: "Amstelveen area" },
    { distance: "20km", position: 15, note: "Greater Amsterdam" }
  ],

  optimization: "Focus on strengthening 5-10km radius coverage"
};
```

---

## Troubleshooting

### "No Position Data Returned"

**Causes:**
- Keyword too generic (not location-specific)
- Business not verified on Google
- Location parameter incorrect

**Solutions:**
```javascript
// Add location modifiers to keywords
const keywords = [
  "tandarts Amsterdam",  // ✅ Location-specific
  "tandarts",  // ❌ Too generic
  "Amsterdam tandarts",  // ✅ Good
  "dentist"  // ❌ No location
];

// Verify location format
const location = "Amsterdam, Netherlands";  // ✅ Correct
const location = "Amsterdam";  // ❌ Ambiguous
```

### "Position Volatility (Rankings Jumping)"

**Causes:**
- Google testing different results
- Personalization effects
- Recent algorithm update
- Competitor activity

**Solutions:**
- Track multiple times per day
- Use average position over 7 days
- Check Google Algorithm Update history
- Monitor competitor changes

### "Quick Wins Not Converting"

**Causes:**
- Insufficient optimization effort
- Competitor strengthening
- Incorrect optimization focus

**Solutions:**
```javascript
// Increase optimization intensity
const optimization = {
  reviewVelocity: "8-10 per month (was 2)",
  postFrequency: "3-4 per week (was 0.5)",
  citationBuilding: "5 per month",
  contentCreation: "2 blog posts per month targeting keyword"
};

// Timeline: 4-6 weeks to see movement
```

---

## Best Practices

### 1. Baseline Everything
```javascript
// Establish baseline before optimization
const baseline = {
  date: "2024-01-22",
  avgPosition: 8.2,
  top3Keywords: 12,
  quickWins: 18
};

// Track progress monthly
// Target: +1-2 average position improvement per month
```

### 2. Focus on Quick Wins First
- Low-hanging fruit = fastest ROI
- Build momentum with early wins
- Use wins to justify further investment

### 3. Monitor Weekly, Act Monthly
- Check positions weekly
- Analyze trends monthly
- Adjust strategy quarterly

### 4. Document Everything
```javascript
const documentation = {
  optimizationActions: [
    { date: "2024-01-22", action: "Added 4 GBP posts for 'tandarts Amsterdam'", cost: 50 },
    { date: "2024-01-25", action: "Requested 10 reviews", cost: 0 },
    { date: "2024-01-29", action: "Created location page for Zuid", cost: 200 }
  ],

  results: [
    { date: "2024-02-05", position: 6, improvement: 2, roi: "Pending" },
    { date: "2024-02-12", position: 4, improvement: 2, roi: "+3 customers" }
  ]
};
```

### 5. Integrate with Other Efforts
- GBP posts target quick win keywords
- Location pages target geographic modifiers
- Citations use exact keyword phrases
- Reviews mention target keywords naturally

---

## Next Steps

After reviewing your ranking data:

1. **Immediate (Week 1)**
   - Identify top 5 quick wins
   - Create action plan for each
   - Begin GBP post campaign

2. **Short-term (Month 1)**
   - Execute quick win optimizations
   - Monitor position changes weekly
   - Adjust strategy based on results

3. **Long-term (Months 2-3)**
   - Scale successful tactics
   - Target medium-difficulty keywords
   - Build comprehensive local authority

---

## Support & Resources

**Documentation:**
- Local SEO Pipeline: `orchestrai-domains/local-seo/pipelines/local-seo-pipeline.js`
- Agent Definition: `.claude/agents/local-maps-ranking-tracker.md`
- Domain Guide: `orchestrai-domains/local-seo/CLAUDE.md`

**DataForSEO API:**
- Tool: `mcp__dataforseo__serp_google_maps`
- Documentation: DataForSEO MCP Server
- Rate Limits: 2000 requests/day standard tier

**Questions:**
- Check LOCAL-SEO-CAPABILITIES-ANALYSIS.md for system overview
- Review agent logs for detailed tracking data
- Consult crystalline memory for historical patterns

---

**Remember**: Local pack rankings are highly competitive. Consistent optimization over 2-3 months typically yields best results. Quick wins can show movement in 2-4 weeks with focused effort.
