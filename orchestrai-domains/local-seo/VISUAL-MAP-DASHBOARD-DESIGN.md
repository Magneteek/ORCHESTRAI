# Visual Map Dashboard - Design Specification

## Executive Summary

Interactive Google Maps-based dashboard visualizing local pack rankings using geographic radius circles, color-coded by position strength, with real-time competitor intelligence and click-through insights.

**Key Features:**
- Geographic ranking visualization with radius circles
- Color-coded position strength (green = top 3, yellow = 4-10, red = 11+)
- Competitor locations and strength scores
- Quick win identification overlay
- Distance-based ranking decay visualization
- Historical trend animations
- Click-to-drill-down keyword analysis

---

## Visual Concept

### Map Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🗺️  Local Pack Ranking Dashboard - Amsterdam Dental Clinic         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────┐  ┌──────────────────────────┐│
│  │                                   │  │  📊 RANKING SUMMARY      ││
│  │         INTERACTIVE MAP           │  │                          ││
│  │                                   │  │  Top 3:     18 keywords  ││
│  │    🟢 (Your Business)            │  │  Pos 4-10:  20 keywords  ││
│  │    Concentric circles showing     │  │  Pos 11+:   12 keywords  ││
│  │    ranking strength by distance   │  │                          ││
│  │                                   │  │  Avg Position:  5.2      ││
│  │    🔴 Competitor A (Position 1)  │  │  Visibility:    68/100   ││
│  │    🟠 Competitor B (Position 2)  │  │                          ││
│  │    🟡 Competitor C (Position 3)  │  │  ⚡ Quick Wins: 15       ││
│  │                                   │  │                          ││
│  │    [Hover reveals ranking data]   │  └──────────────────────────┘│
│  │                                   │                              ││
│  │                                   │  ┌──────────────────────────┐│
│  │                                   │  │  🎯 QUICK WIN KEYWORDS   ││
│  │                                   │  │                          ││
│  │                                   │  │  1. tandarts Amsterdam   ││
│  │                                   │  │     Pos 5→3 (Est. 3wks) ││
│  │                                   │  │                          ││
│  │                                   │  │  2. dental implants      ││
│  │                                   │  │     Pos 7→3 (Est. 4wks) ││
│  │                                   │  │                          ││
│  │                                   │  │  [View All 15 →]         ││
│  └──────────────────────────────────┘  └──────────────────────────┘│
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  🔍 KEYWORD FILTER                                               ││
│  │  [All Keywords ▼] [Top 3 Only] [Quick Wins] [Position 4-10]    ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📈 RANKING TRENDS (Last 30 Days)                               ││
│  │  [Interactive line chart showing position changes over time]     ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Ranking Circle Visualization

### Concept: Distance-Based Ranking Strength

Your business is at the center with concentric circles representing ranking radius:

```
        ┌─────────────────────────────────────┐
        │                                     │
        │        20km (Position 15)           │
        │    ┌─────────────────────────┐     │
        │    │                         │     │
        │    │   10km (Position 8)     │     │
        │    │ ┌─────────────────────┐ │     │
        │    │ │                     │ │     │
        │    │ │  5km (Position 4)   │ │     │
        │    │ │ ┌─────────────────┐ │ │     │
        │    │ │ │                 │ │ │     │
        │    │ │ │ 2km (Pos 2)     │ │ │     │
        │    │ │ │  ┌──────────┐   │ │ │     │
        │    │ │ │  │ 🟢 YOU   │   │ │ │     │
        │    │ │ │  │ Position 1│   │ │ │     │
        │    │ │ │  └──────────┘   │ │ │     │
        │    │ │ └─────────────────┘ │ │     │
        │    │ └─────────────────────┘ │     │
        │    └─────────────────────────┘     │
        └─────────────────────────────────────┘

Color Legend:
🟢 Green  = Top 3 (High visibility)
🟡 Yellow = Positions 4-10 (Medium visibility, quick wins)
🟠 Orange = Positions 11-15 (Low visibility)
🔴 Red    = Positions 16+ (Very low visibility)
```

### Circle Properties

```javascript
const rankingCircles = {
  // Center point (your business)
  center: {
    lat: 52.3676,
    lng: 4.9041,
    marker: {
      color: '#10B981',  // Emerald green
      size: 'large',
      icon: '🏢',
      pulse: true  // Animated pulse effect
    }
  },

  // Ranking radius circles
  circles: [
    {
      radius: 2000,  // 2km
      avgPosition: 2.1,
      color: '#10B981',  // Green (top 3)
      opacity: 0.2,
      strokeWeight: 2,
      strokeColor: '#059669',
      keywords: ['tandarts Amsterdam centrum', 'dental implants Amsterdam'],
      tooltip: "2km radius: Average position 2.1 (Top 3)"
    },
    {
      radius: 5000,  // 5km
      avgPosition: 4.3,
      color: '#F59E0B',  // Yellow (4-10)
      opacity: 0.15,
      strokeWeight: 2,
      strokeColor: '#D97706',
      keywords: ['tandarts Zuid', 'emergency dentist Amsterdam'],
      tooltip: "5km radius: Average position 4.3 (Quick Win Zone)"
    },
    {
      radius: 10000,  // 10km
      avgPosition: 8.7,
      color: '#EF4444',  // Orange-red (8-15)
      opacity: 0.1,
      strokeWeight: 2,
      strokeColor: '#DC2626',
      keywords: ['dental clinic Amstelveen', 'tandarts near me'],
      tooltip: "10km radius: Average position 8.7 (Needs optimization)"
    },
    {
      radius: 20000,  // 20km
      avgPosition: 15.2,
      color: '#991B1B',  // Dark red (15+)
      opacity: 0.05,
      strokeWeight: 1,
      strokeColor: '#7F1D1D',
      keywords: ['dentist Greater Amsterdam'],
      tooltip: "20km radius: Average position 15.2 (Major work needed)"
    }
  ],

  // Competitor markers
  competitors: [
    {
      name: "Dental Clinic Zuid",
      lat: 52.3450,
      lng: 4.8920,
      position: 1,
      strength: 92,
      color: '#DC2626',  // Red (strong competitor)
      reviews: 250,
      rating: 4.8,
      marker: {
        icon: '🏥',
        size: 'medium',
        label: '1'  // Their average position
      }
    },
    {
      name: "Amsterdam Smile Center",
      lat: 52.3800,
      lng: 4.9200,
      position: 2,
      strength: 85,
      color: '#F59E0B',  // Orange (medium)
      reviews: 180,
      rating: 4.7,
      marker: {
        icon: '🏥',
        size: 'medium',
        label: '2'
      }
    }
  ]
};
```

---

## Interactive Features

### 1. Hover Interactions

**Hover over your business marker:**
```
┌─────────────────────────────────────────┐
│  🏢 Amsterdam Dental Clinic             │
│                                          │
│  Overall Performance:                    │
│  • Average Position: 5.2                 │
│  • Top 3 Keywords: 18 (36%)             │
│  • Visibility Score: 68/100              │
│                                          │
│  Strongest Areas:                        │
│  • 0-2km: Position 2.1 avg              │
│  • 2-5km: Position 4.3 avg              │
│                                          │
│  Quick Win Opportunities: 15             │
│  [View Detailed Report →]                │
└─────────────────────────────────────────┘
```

**Hover over ranking circle:**
```
┌─────────────────────────────────────────┐
│  5km Radius Ranking Zone                │
│                                          │
│  Average Position: 4.3                   │
│  Keywords Tracked: 12                    │
│  Top 3: 3 keywords                       │
│  Positions 4-10: 7 keywords (Quick Wins)│
│  Positions 11+: 2 keywords               │
│                                          │
│  Top Keywords:                           │
│  1. tandarts Zuid (Position 4)          │
│  2. dental implants Amsterdam (Pos 5)   │
│  3. emergency dentist (Position 6)      │
│                                          │
│  [Click to filter keywords →]            │
└─────────────────────────────────────────┘
```

**Hover over competitor:**
```
┌─────────────────────────────────────────┐
│  🏥 Dental Clinic Zuid                  │
│                                          │
│  Competitive Strength: 92/100            │
│  Average Position: 1.8                   │
│                                          │
│  Profile Strength:                       │
│  • Reviews: 250 (↑ 12/month)            │
│  • Rating: 4.8 stars                    │
│  • Posts: 3.2 per week                  │
│  • Photos: 85                           │
│                                          │
│  Gap Analysis:                           │
│  • +230 more reviews than you           │
│  • Posts 6x more frequently             │
│  • 0.2 stars higher rating              │
│                                          │
│  [View Full Comparison →]                │
└─────────────────────────────────────────┘
```

### 2. Click Interactions

**Click on ranking circle:**
- Filter keywords to show only those in that radius
- Display keyword list with positions
- Show optimization recommendations

**Click on competitor:**
- Open competitive analysis panel
- Show head-to-head comparison
- Highlight gap opportunities

**Click on keyword in list:**
- Highlight corresponding circle zone on map
- Show SERP analysis for that keyword
- Display ranking history chart

### 3. Filter Controls

```javascript
const filters = {
  positionRange: {
    all: 'All Positions',
    top3: 'Top 3 Only (🟢)',
    quickWins: 'Positions 4-10 (🟡)',
    needsWork: 'Positions 11+ (🟠)'
  },

  distanceRadius: {
    all: 'All Distances',
    near: '0-2km',
    medium: '2-5km',
    far: '5-10km',
    extended: '10-20km'
  },

  competitors: {
    all: 'All Competitors',
    stronger: 'Stronger Than You',
    weaker: 'Weaker Than You',
    topThree: 'Top 3 Competitors Only'
  },

  keywords: {
    searchInput: 'Search keywords...',
    sortBy: ['Position (Best First)', 'Volume (High→Low)', 'Quick Win Score']
  }
};
```

---

## Technical Architecture

### Technology Stack

```javascript
const techStack = {
  mapping: {
    library: 'Leaflet.js',
    version: '1.9.4',
    why: 'Lightweight, flexible, great circle support'
  },

  visualization: {
    library: 'D3.js v7',
    version: '7.8.5',
    why: 'Data binding, animations, custom overlays'
  },

  frontend: {
    framework: 'React 18',
    stateManagement: 'Zustand',
    styling: 'Tailwind CSS + ORCHESTRAI themes'
  },

  dataFetching: {
    source: 'DataForSEO MCP Server',
    api: 'mcp__dataforseo__serp_google_maps',
    caching: 'Redis (1-hour cache)',
    realtime: 'WebSocket updates (optional)'
  },

  backend: {
    runtime: 'Node.js',
    framework: 'Express',
    database: 'PostgreSQL (ranking history)',
    vectorDB: 'For keyword clustering'
  }
};
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DATA COLLECTION                                              │
│    DataForSEO API → Maps Ranking Tracker Agent                 │
│    • 50 keywords checked in parallel                           │
│    • Competitor positions collected                            │
│    • Distance-based position data                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. DATA PROCESSING                                              │
│    Node.js Backend Pipeline                                     │
│    • Calculate average positions per radius                     │
│    • Identify quick wins (positions 4-10)                       │
│    • Score competitor strength                                  │
│    • Calculate visibility metrics                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. DATA STORAGE                                                 │
│    PostgreSQL + Redis                                           │
│    • Store ranking history (PostgreSQL)                         │
│    • Cache current positions (Redis 1hr)                        │
│    • Index keyword metadata                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND RENDERING                                           │
│    React + Leaflet + D3.js                                     │
│    • Render map with business center                            │
│    • Draw concentric ranking circles                            │
│    • Plot competitor markers                                    │
│    • Add interactive tooltips                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. USER INTERACTION                                             │
│    Event Handlers                                               │
│    • Hover → Show ranking details                               │
│    • Click → Filter keywords                                    │
│    • Drag → Explore different areas                            │
│    • Zoom → Adjust circle granularity                          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Structure

```javascript
// Main Dashboard Component
<MapsRankingDashboard>
  <Header>
    <BusinessInfo />
    <RankingSummary />
    <DateRangePicker />
  </Header>

  <MainContent>
    <MapVisualization>
      <LeafletMap center={businessLocation} zoom={12}>
        {/* Your business marker */}
        <BusinessMarker
          position={[52.3676, 4.9041]}
          avgPosition={5.2}
          visibility={68}
        />

        {/* Ranking circles */}
        {rankingCircles.map(circle => (
          <RankingCircle
            key={circle.radius}
            radius={circle.radius}
            avgPosition={circle.avgPosition}
            color={getColorByPosition(circle.avgPosition)}
            onHover={showCircleTooltip}
            onClick={filterKeywordsByRadius}
          />
        ))}

        {/* Competitor markers */}
        {competitors.map(comp => (
          <CompetitorMarker
            key={comp.id}
            position={[comp.lat, comp.lng]}
            name={comp.name}
            avgPosition={comp.position}
            strength={comp.strength}
            onHover={showCompetitorTooltip}
            onClick={openCompetitorAnalysis}
          />
        ))}

        {/* Quick win highlights */}
        {quickWins.map(keyword => (
          <QuickWinIndicator
            key={keyword.id}
            position={keyword.targetLocation}
            keyword={keyword.term}
            currentPosition={keyword.position}
            estimatedTimeToTop3={keyword.timeEstimate}
          />
        ))}
      </LeafletMap>
    </MapVisualization>

    <Sidebar>
      <RankingSummaryPanel />
      <QuickWinsPanel />
      <CompetitorsList />
      <KeywordFilters />
    </Sidebar>
  </MainContent>

  <BottomPanel>
    <RankingTrendsChart />
    <KeywordPerformanceTable />
  </BottomPanel>
</MapsRankingDashboard>
```

---

## Color Palette & Visual Design

### Ranking Colors (Traffic Light System)

```css
:root {
  /* Position-based colors */
  --rank-top3: #10B981;      /* Emerald green - Top 3 */
  --rank-quickwin: #F59E0B;  /* Amber yellow - Pos 4-10 */
  --rank-medium: #F97316;    /* Orange - Pos 11-15 */
  --rank-low: #EF4444;       /* Red - Pos 16+ */

  /* Competitor strength colors */
  --competitor-strong: #DC2626;   /* Red - Strength 70+ */
  --competitor-medium: #F59E0B;   /* Orange - Strength 40-69 */
  --competitor-weak: #10B981;     /* Green - Strength 0-39 */

  /* UI colors */
  --map-background: #F9FAFB;
  --panel-background: #FFFFFF;
  --border-color: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}
```

### Circle Opacity & Stroke

```javascript
const circleStyles = {
  topThree: {
    fillOpacity: 0.2,    // 20% fill
    strokeWeight: 3,     // Bold stroke
    strokeOpacity: 0.8,  // Strong outline
    animation: 'pulse'   // Subtle pulse
  },

  quickWin: {
    fillOpacity: 0.15,   // 15% fill
    strokeWeight: 2,     // Medium stroke
    strokeOpacity: 0.6,  // Medium outline
    animation: 'glow'    // Subtle glow effect
  },

  needsWork: {
    fillOpacity: 0.08,   // 8% fill
    strokeWeight: 1,     // Thin stroke
    strokeOpacity: 0.4,  // Light outline
    animation: 'none'    // No animation
  }
};
```

---

## Advanced Features

### 1. Historical Trend Animation

```javascript
// Play ranking history as animation
const trendAnimation = {
  duration: 5000,  // 5 seconds
  frames: 30,      // 30 days

  onFrame: (day) => {
    // Update circle sizes based on historical positions
    circles.forEach(circle => {
      const historicalPosition = getPositionForDay(day);
      circle.setRadius(getRadiusForPosition(historicalPosition));
      circle.setColor(getColorForPosition(historicalPosition));
    });

    // Update competitor markers
    competitors.forEach(comp => {
      const historicalPosition = comp.getPositionForDay(day);
      comp.updateMarker(historicalPosition);
    });

    // Show date label
    dateLabel.setText(`${day} days ago`);
  },

  onComplete: () => {
    // Return to current day
    showCurrentPositions();
  }
};

// UI Controls
<AnimationControls>
  <PlayButton onClick={trendAnimation.play} />
  <PauseButton onClick={trendAnimation.pause} />
  <SpeedControl min={0.5} max={2.0} default={1.0} />
  <ProgressSlider min={0} max={30} />
</AnimationControls>
```

### 2. Heatmap Overlay

```javascript
// Show ranking density heatmap
const heatmapLayer = {
  data: keywordPositions.map(kw => ({
    lat: kw.targetLat,
    lng: kw.targetLng,
    intensity: getHeatIntensity(kw.position)
  })),

  gradient: {
    0.0: '#10B981',  // Green (strong)
    0.5: '#F59E0B',  // Yellow (medium)
    1.0: '#EF4444'   // Red (weak)
  },

  radius: 15,  // pixels
  blur: 25,    // blur radius

  toggle: true  // User can enable/disable
};

// UI Toggle
<LayerControls>
  <ToggleButton
    label="Show Heatmap"
    active={heatmapEnabled}
    onClick={toggleHeatmap}
  />
</LayerControls>
```

### 3. Keyword Clustering Visualization

```javascript
// Group similar keywords and show clusters
const keywordClusters = {
  'Emergency Services': {
    keywords: ['emergency dentist', 'urgent dental', '24-hour dentist'],
    avgPosition: 6.2,
    color: '#EF4444',
    center: [52.3700, 4.9000]
  },

  'Cosmetic Dentistry': {
    keywords: ['teeth whitening', 'dental veneers', 'smile makeover'],
    avgPosition: 4.1,
    color: '#F59E0B',
    center: [52.3650, 4.8950]
  },

  'General Dentistry': {
    keywords: ['tandarts Amsterdam', 'dental clinic', 'dentist'],
    avgPosition: 3.2,
    color: '#10B981',
    center: [52.3676, 4.9041]
  }
};

// Render clusters as grouped circles
<ClusterLayer>
  {keywordClusters.map(cluster => (
    <ClusterCircle
      center={cluster.center}
      radius={cluster.keywords.length * 500}  // Size by keyword count
      color={cluster.color}
      label={cluster.name}
      avgPosition={cluster.avgPosition}
    />
  ))}
</ClusterLayer>
```

### 4. Competitor Path Analysis

```javascript
// Show the "path" to beat competitors
const competitorPath = {
  from: yourPosition,
  to: competitorPosition,

  steps: [
    {
      action: 'Increase review velocity to 10/month',
      impact: '+1.2 positions',
      cost: 'Low',
      time: '2-3 weeks'
    },
    {
      action: 'Add 3-4 GBP posts per week',
      impact: '+0.8 positions',
      cost: 'Medium',
      time: '3-4 weeks'
    },
    {
      action: 'Build 15 local citations',
      impact: '+0.5 positions',
      cost: 'Medium',
      time: '4-6 weeks'
    }
  ],

  totalImpact: '+2.5 positions',
  totalTime: '6-8 weeks',
  confidence: '85%'
};

// Visualize path as arrow from you to competitor
<CompetitorPathOverlay>
  <PathArrow
    from={yourMarker}
    to={competitorMarker}
    dashed={true}
    animated={true}
    color="#6366F1"
  />

  <PathSteps steps={competitorPath.steps} />

  <PathTooltip>
    <h3>Path to Position #{competitor.position}</h3>
    <p>Total Time: {competitorPath.totalTime}</p>
    <p>Confidence: {competitorPath.confidence}</p>
    <ActionList steps={competitorPath.steps} />
  </PathTooltip>
</CompetitorPathOverlay>
```

---

## Mobile Responsiveness

### Mobile Layout

```
┌─────────────────────────────┐
│ 🗺️ Amsterdam Dental Clinic │
├─────────────────────────────┤
│  📊 Summary (collapsible)   │
│  Avg Position: 5.2          │
│  Top 3: 18 keywords         │
│  Quick Wins: 15             │
├─────────────────────────────┤
│                             │
│    FULL SCREEN MAP          │
│    (touch to interact)      │
│                             │
│    🟢 You (Position 5.2)   │
│    🔴 Competitor A (1)     │
│    🟠 Competitor B (2)     │
│                             │
├─────────────────────────────┤
│  ⚡ Quick Wins (slide up)   │
│  1. tandarts Amsterdam      │
│  2. dental implants         │
│  [View All →]               │
└─────────────────────────────┘
```

### Touch Interactions

- **Tap marker**: Show tooltip
- **Double-tap circle**: Filter keywords
- **Pinch-zoom**: Adjust map zoom
- **Swipe up**: Open quick wins panel
- **Long-press**: Open detailed analysis

---

## Performance Optimization

### Rendering Optimization

```javascript
const performanceConfig = {
  // Limit rendered elements
  maxCircles: 6,  // Only show most relevant circles
  maxCompetitors: 10,  // Top 10 competitors only
  maxKeywords: 50,  // Batch load keywords

  // Lazy loading
  lazyLoadCircles: true,  // Load circles as user zooms
  lazyLoadCompetitors: true,  // Load competitors in viewport
  deferNonCritical: true,  // Defer trend charts until interaction

  // Caching
  cacheRadius: true,  // Cache calculated circle data
  cacheCompetitorData: true,  // Cache competitor info
  cacheDuration: 3600,  // 1 hour

  // Debouncing
  debounceHover: 150,  // ms
  debounceFilter: 300,  // ms
  debounceZoom: 200,  // ms
};
```

---

## Implementation Phases

### Phase 1: Basic Map (Week 1-2)
- Set up Leaflet.js map
- Plot business location
- Draw 3 concentric circles
- Add basic tooltips

### Phase 2: Rankings Integration (Week 3-4)
- Connect to Maps Ranking Tracker agent
- Display position data in circles
- Color-code by position strength
- Add keyword filtering

### Phase 3: Competitors (Week 5-6)
- Plot competitor markers
- Show competitive strength
- Add hover tooltips
- Implement comparison panel

### Phase 4: Advanced Features (Week 7-8)
- Historical trend animation
- Heatmap overlay
- Keyword clustering
- Mobile optimization

---

**Next Steps**: See VISUAL-MAP-DASHBOARD-IMPLEMENTATION.md for complete React code, API integration examples, and deployment guide.
