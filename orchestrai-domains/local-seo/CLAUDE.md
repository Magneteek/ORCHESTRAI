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
- **`gbp-content-transformer`** - 🆕 Google Business Profile content transformation and creation
- **`reviews-intelligence-specialist`** - Google reviews analysis and reputation intelligence

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

---

## GBP Content Creation System 🆕

### GBP Post Types & Specifications

```
Post Type          | Optimal Range | Frequency  | Best For
-------------------|--------------|------------|---------------------------
What's New         | 300-500 chars| 1-2/week   | Updates, announcements
Events             | 400-600 chars| 1-2/month  | Open houses, workshops
Offers             | 250-400 chars| 2-3/month  | Promotions, discounts
Products           | 300-500 chars| As needed  | Service showcases

Universal Limit: 100-1500 characters (strict enforcement)
```

### Transformation Patterns

**Pattern 1: Blog Article → What's New Post**
```
SOURCE (2500 words): Comprehensive dental implant guide
↓ Transform
TARGET (400 chars): "New painless dental implant technology now available at Amsterdam Dental Clinic! Our advanced implant system reduces healing time by 40% and eliminates traditional surgery discomfort. Perfect for busy professionals in Zuid who need quick recovery. Free consultation this month—call 020-1234567 to schedule your smile transformation!"

Extraction Process:
1. Core value proposition (1 sentence, 20-30 words)
2. 3 key benefits (15-20 words each)
3. Local context (15-20 words)
4. Compelling CTA (15-20 words)
```

**Pattern 2: Landing Page → Offer Post**
```
SOURCE (1200 words): Teeth whitening landing page with pricing
↓ Transform
TARGET (320 chars): "Flash Sale: Professional teeth whitening €199 (normally €349)! Get Hollywood-white teeth in 60 minutes with our LED technology. Perfect for Amsterdam professionals with upcoming events. Valid for appointments booked by March 31st. Only 10 spots left this month! Call 020-1234567 now to claim your bright smile!"

Extraction Process:
1. Offer headline with value (15-20 words)
2. Offer details + validity (40-60 words)
3. Urgency/scarcity (12-18 words)
4. Location benefit (12-18 words)
5. Strong CTA (15-20 words)
```

**Pattern 3: Review Insights → Product Post**
```
SOURCE: Customer reviews mentioning anxiety about dental procedures
↓ Transform
TARGET (380 chars): "Anxiety-free dentistry for nervous patients in Amsterdam. Our gentle sedation options let you relax completely during procedures. Dr. Van der Berg specializes in calming anxious patients—over 500 stress-free treatments completed. Perfect if you've been avoiding dental work due to fear. Book a comfort consultation: 020-1234567. Zuid location, easy parking!"

Extraction Process:
1. Identify most-asked service from reviews
2. Address common concerns (2-3 points)
3. Explain benefits clearly
4. Social proof element
5. Clear next step CTA
```

### Multi-Language GBP Content 🌐

**Language Support**: EN, ES, NL, DE, SL (via multi-language-content-adapter)

**Dutch (NL) - Amsterdam Market**:
```
INCORRECT (too promotional):
"Experience our amazing revolutionary dental care!"

CORRECT (direct, practical):
"Nieuwe tandimplantaat technologie. 40% sneller herstel. Gratis consult beschikbaar."
(New dental implant technology. 40% faster recovery. Free consultation available.)
```

**German (DE) - Systematic Approach**:
```
INCORRECT (too casual):
"Check out our cool new service!"

CORRECT (thorough, quality-focused):
"Präzise Zahnimplantat-Behandlung mit zertifizierter Technologie. Über 500 erfolgreiche Behandlungen. Kostenlose Erstberatung."
(Precise dental implant treatment with certified technology. Over 500 successful treatments. Free initial consultation.)
```

### Quality Gates (Mandatory)

```
Gate 1: Character Limit Compliance ✅ BLOCKING
- Threshold: 100-1500 characters (ZERO tolerance)
- Status: Must pass to proceed

Gate 2: AI Detection Risk ✅ BLOCKING
- Threshold: <30% AI detection (target: 15-25%)
- Integration: content-ai-phrase-detector agent
- Status: Must pass to proceed

Gate 3: Language Purity ✅ BLOCKING (Multi-Language)
- Threshold: 100% target language (ZERO contamination)
- Integration: language-validation-specialist
- Status: Must pass for NL, ES, DE, SL posts

Gate 4: Mobile Readability ⚠️ WARNING
- Threshold: <15 word sentences, <3 sentence paragraphs
- Status: Advisory only (non-blocking)

Gate 5: Local SEO Integration ⚠️ WARNING
- Threshold: Location keyword in first 100 characters
- Status: Advisory only (non-blocking)
```

---

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

### 4. GBP Content Transformation 🆕

**Direct Agent Invocation**

```
Task tool → gbp-content-transformer → GBP Posts

Transformation Workflows:
1. Blog-to-GBP: Transform 2000+ word articles into 300-500 char posts
2. Landing Page-to-Offer: Extract promotions into compelling GBP offers
3. Review Insights-to-Product: Turn customer feedback into service showcases
4. Original Content: Create fresh GBP posts (What's New, Events, Offers, Products)

Quality Gates (BLOCKING):
- Character limit: 100-1500 chars (strict compliance)
- AI detection: <30% risk
- Language purity: 100% (multi-language)
- Mobile readability: <15 word sentences (warning)
```

**Use When**: Repurposing existing content or creating GBP posts for weekly schedule

**Example Invocation**:
```javascript
Task(
  subagent_type="gbp-content-transformer",
  prompt=`Transform blog article into 3 GBP posts:
    Source: /projects/uuid/deliverables/content/dental-implants-guide.md
    Create: 1 What's New, 1 Offer, 1 Product
    Language: Dutch (100% purity)
    Target: Anxious patients considering implants`
)
```

### 5. Full Local SEO Pipeline with GBP Content 🆕

**Pipeline Invocation**

```javascript
local-seo-pipeline.execute({
  projectSpec: {
    businessName: "Amsterdam Dental Clinic",
    location: "Amsterdam, Netherlands",
    industry: "dental_services",
    language: "Dutch",
    existingContent: [
      "dental-implants-guide.md",
      "teeth-whitening.md"
    ]
  },
  options: {
    includeGBPContent: true,  // Enable Stage 6
    postFrequency: "weekly",
    postTypes: ["whats_new", "offers", "events", "products"]
  }
})
```

**Pipeline Stages** (115 min total):
1. GBP Audit & Optimization (20 min)
2. Local Citation Building (25 min)
3. Review Management with DataForSEO (15 min)
4. Local Content Creation (20 min)
5. Local Link Building (10 min)
6. **GBP Post Generation (25 min)** ← NEW
   - Scan existing content
   - Transform 2-3 blogs → 6-9 GBP posts
   - Generate 3-4 original posts
   - Quality validation (all gates)
   - Create posting calendar

**Deliverables**:
- Complete local SEO optimization
- 9-13 GBP posts ready for scheduling
- 4-week posting calendar
- Quality validation reports

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
│           ├── schema-markup/
│           │   └── localbusiness-schema.json
│           └── gbp-posts/  🆕
│               ├── transformed/
│               │   ├── whatsnew-dental-implants.json
│               │   ├── offer-teeth-whitening.json
│               │   └── product-anxiety-free-dentistry.json
│               ├── original/
│               │   ├── event-open-house.json
│               │   ├── whatsnew-new-hygienist.json
│               │   └── offer-holiday-special.json
│               ├── posting-calendar.json
│               └── transformation-report.md
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
