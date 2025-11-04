# Local SEO Domain

## Domain Overview

The Local SEO Domain provides comprehensive local search optimization, Google Business Profile management, local citation building, and geographic targeting for businesses serving specific locations.

**Domain Focus**: Local search visibility, Google Maps optimization, NAP consistency, local citations

---

## Specialized Agents

### Local SEO Agents
- **`seo-local-seo`** - Local SEO optimization and Google Business Profile management
- **`seo-keyword-research`** - Local keyword research with geographic modifiers
- **`seo-serp-analysis`** - Local pack analysis and competitor tracking

**See [../../.claude/agents/](../../.claude/agents/) and [../seo/CLAUDE.md](../seo/CLAUDE.md) for complete agent definitions.**

---

## Local SEO Workflows

### 1. Google Business Profile Optimization

**Direct Agent Invocation**

```
Task tool → seo-local-seo → GBP Optimization

Optimization Areas:
- Business information accuracy (NAP)
- Category selection (primary + additional)
- Service area definition
- Business hours optimization
- Attributes and amenities
- Photo optimization (exterior, interior, team, products)
- Post creation strategy
```

**Use When**: Setting up or optimizing local business presence

### 2. Local Citation Building

**Direct Agent Invocation**

```
Task tool → seo-local-seo → Citation Strategy

Citation Sources:
- Core citations (Google, Bing, Apple Maps)
- Industry-specific directories
- Local business directories
- Chamber of Commerce listings
- Review platforms

NAP Consistency:
- Exact name format across all listings
- Address consistency (abbreviations, suite numbers)
- Phone number format standardization
```

**Use When**: Building local search authority and trust

### 3. Local Keyword Research

**Direct Agent Invocation with DATAforSEO**

```
Task tool → seo-keyword-research → Local Keywords

Geographic Modifiers:
- City name ("dentist Amsterdam")
- Neighborhood ("dental implants De Pijp")
- Near me ("tandarts in de buurt")
- Zip code targeting

Search Intent Mapping:
- Local pack triggers
- Maps vs. organic intent
- Service vs. location pages
```

**Use When**: Targeting specific geographic markets

---

## DATAforSEO Integration for Local SEO

### Local Business Data Tools
```javascript
// Search for businesses in location
mcp__dataforseo__business_data_search({
  keyword: "tandarts",
  location_name: "Amsterdam,Netherlands",
  language_name: "Dutch",
  limit: 50
})

// Get detailed business info
mcp__dataforseo__business_data_info({
  cid: "business-client-id",
  location_code: 2528  // Netherlands
})

// Analyze competitor reviews
mcp__dataforseo__business_data_reviews({
  cid: "competitor-cid",
  sort_by: "date",
  limit: 100
})
```

### Google Maps SERP Analysis
```javascript
// Analyze local pack results
mcp__dataforseo__serp_google_maps({
  keyword: "tandarts Amsterdam",
  location_name: "Amsterdam,Netherlands"
})
```

---

## Local SEO Best Practices

### NAP Consistency (Critical)
```
Name: Exact match across all platforms
  ✅ "Amsterdam Dental Clinic"
  ❌ "ADC" or "Amsterdam Dental"

Address: Consistent format
  ✅ "Hoofdstraat 123, 1234 AB Amsterdam"
  ❌ "Hoofdstr. 123" or "123 Hoofdstraat"

Phone: Same format everywhere
  ✅ "+31 20 123 4567"
  ❌ "(020) 123-4567" or "020-1234567"
```

### Google Business Profile Photos
```
Recommended Photos:
- Exterior (storefront, building)
- Interior (waiting area, treatment rooms)
- Team (staff photos, at work)
- Products/Services (before/after, procedures)
- Logo (high resolution)

Photo Requirements:
- Minimum 720px x 720px
- JPG or PNG format
- Good lighting, clear focus
- No watermarks or promotional text
```

### Google Posts Strategy
```
Post Types:
- Updates (news, announcements)
- Offers (promotions, special pricing)
- Events (open houses, community events)
- Products (new services, equipment)

Posting Frequency:
- Minimum: 1-2 posts per week
- Optimal: 3-4 posts per week
- Avoid: Long gaps (reduces visibility)
```

---

## Local Pack Optimization

### Ranking Factors
```
1. Google Business Profile Optimization (25%)
   - Complete profile
   - Regular updates
   - Photo additions
   - Post frequency

2. Review Signals (15%)
   - Review quantity
   - Review velocity
   - Review diversity
   - Review responses

3. On-Page Signals (15%)
   - NAP consistency
   - Local keywords
   - Schema markup (LocalBusiness)
   - Location pages

4. Link Signals (15%)
   - Local citation quality
   - Local backlinks
   - Industry directory links

5. Behavioral Signals (10%)
   - Click-through rate
   - Directions requests
   - Phone calls
   - Website visits

6. Personalization (10%)
   - User location
   - Search history
   - Device type

7. Social Signals (10%)
   - Social media presence
   - Engagement metrics
   - Profile completeness
```

---

## Multi-Location SEO Strategy

### Location Page Structure
```
/locations/
  ├── amsterdam/
  │   ├── index.html  (Main Amsterdam page)
  │   ├── de-pijp/    (Neighborhood pages)
  │   ├── centrum/
  │   └── zuid/
  ├── rotterdam/
  └── utrecht/

Each Page Includes:
- Unique content (not templated)
- Local landmarks and references
- Local testimonials
- Location-specific services
- Embedded Google Map
- Local schema markup
```

### Schema Markup for Local Business
```json
{
  "@context": "https://schema.org",
  "@type": "Dentist",
  "name": "Amsterdam Dental Clinic",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Hoofdstraat 123",
    "addressLocality": "Amsterdam",
    "postalCode": "1234 AB",
    "addressCountry": "NL"
  },
  "telephone": "+31201234567",
  "openingHours": "Mo-Fr 09:00-18:00",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "52.3676",
    "longitude": "4.9041"
  },
  "priceRange": "€€",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

---

## Review Management Integration

### Reputation Intelligence Connection
```
Local SEO ← → Reputation Domain

Integration:
- Monitor new reviews (reputation-intelligence)
- Respond to reviews (local-seo strategy)
- Showcase positive reviews (local pages)
- Address negative reviews (reputation management)
```

**See [../reputation-intelligence/CLAUDE.md](../reputation-intelligence/CLAUDE.md) for review management.**

---

## Integration with Universal Agent Pattern

```javascript
// Google Business Profile optimization
Task(
  subagent_type="seo-local-seo",
  prompt="Optimize Google Business Profile for Amsterdam dental clinic..."
)

// Local keyword research
Task(
  subagent_type="seo-keyword-research",
  prompt="Research local keywords for dental services in Amsterdam with geographic modifiers..."
)

// Citation building strategy
Task(
  subagent_type="seo-local-seo",
  prompt="Create citation building strategy for Netherlands dental practice..."
)
```

---

## File Organization

```
/projects/[client-uuid]/
├── deliverables/
│   └── seo/
│       └── local-seo/
│           ├── gbp-optimization-plan.json
│           ├── local-keywords.json
│           ├── citation-sources.json
│           ├── location-page-content/
│           │   ├── amsterdam.md
│           │   ├── rotterdam.md
│           │   └── utrecht.md
│           └── schema-markup/
│               └── localbusiness-schema.json
```

---

## Performance Metrics

### Local Search Visibility
```
Local Pack Ranking:
- Top 3 (Highly visible)
- 4-10 (Visible with scroll)
- 11+ (Not in local pack)

Target: Top 3 for primary keywords

GBP Insights:
- Search queries (brand vs. discovery)
- Views (search vs. maps)
- Actions (website, directions, calls)
- Photo views and comparisons
```

### Citation Consistency
```
NAP Accuracy: 100% across all listings
Citation Count: 50+ quality citations
Core Citations: 100% (Google, Bing, Apple)
Industry Citations: 80%+ coverage
```

---

## Troubleshooting

### Not Appearing in Local Pack
```
Solutions:
- Complete GBP profile 100%
- Add more photos (minimum 10)
- Get more reviews (minimum 10)
- Build local citations
- Optimize for location keywords
- Ensure NAP consistency
```

### Low GBP Engagement
```
Solutions:
- Post more frequently (3-4x/week)
- Add compelling photos
- Respond to all reviews
- Update business hours
- Add Q&A content
- Enable messaging
```

### Inconsistent NAP Across Web
```
Solutions:
- Audit all citations
- Create spreadsheet tracking
- Update incorrect listings
- Remove duplicate listings
- Monitor with tools (Moz Local, BrightLocal)
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../seo/CLAUDE.md](../seo/CLAUDE.md)** - General SEO domain
- **[../reputation-intelligence/CLAUDE.md](../reputation-intelligence/CLAUDE.md)** - Review management integration
- **[../../.claude/agents/seo-local-seo.md](../../.claude/agents/seo-local-seo.md)** - Local SEO agent

---

**This domain focuses on local search visibility and Google Business Profile optimization. NAP consistency is critical for local SEO success.**
