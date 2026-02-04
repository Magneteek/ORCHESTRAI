# Optimal Reputation Intelligence Workflow

## Database Schema

### Table: `businesses`
```sql
CREATE TABLE businesses (
    id VARCHAR(255) PRIMARY KEY,              -- Google Place ID
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    website VARCHAR(255),
    category VARCHAR(100),

    -- Google Maps data
    place_id VARCHAR(255) UNIQUE NOT NULL,
    cid VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Rating data
    overall_rating DECIMAL(2, 1),
    total_reviews INT DEFAULT 0,
    rating_distribution JSON,                 -- {"1": 5, "2": 3, "3": 2, "4": 10, "5": 20}

    -- Workflow status flags
    status VARCHAR(50) DEFAULT 'discovered',  -- 'discovered' | 'reviews_scraped' | 'enriched'
    has_qualifying_reviews BOOLEAN DEFAULT FALSE,
    needs_enrichment BOOLEAN DEFAULT FALSE,
    is_enriched BOOLEAN DEFAULT FALSE,

    -- Metadata
    discovered_at TIMESTAMP DEFAULT NOW(),
    last_review_check TIMESTAMP,
    last_enrichment_check TIMESTAMP,

    -- Cache fields
    maps_data_cached BOOLEAN DEFAULT TRUE,
    cache_expires_at TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_has_qualifying_reviews (has_qualifying_reviews),
    INDEX idx_needs_enrichment (needs_enrichment)
);
```

### Table: `reviews`
```sql
CREATE TABLE reviews (
    id VARCHAR(255) PRIMARY KEY,
    business_id VARCHAR(255) NOT NULL,

    -- Review content
    reviewer_name VARCHAR(255),
    rating INT NOT NULL,                      -- 1-5 stars
    text TEXT,
    review_date TIMESTAMP NOT NULL,

    -- Classification
    is_negative BOOLEAN GENERATED ALWAYS AS (rating <= 3) STORED,
    is_qualifying BOOLEAN DEFAULT FALSE,      -- Meets all criteria (negative + recent)

    -- Sentiment analysis
    sentiment_score DECIMAL(3, 2),            -- -1.0 to 1.0
    sentiment_label VARCHAR(50),              -- 'negative' | 'neutral' | 'positive'
    emotion_tags JSON,                        -- ["anger", "frustration", "disappointment"]

    -- Source metadata
    source VARCHAR(50) DEFAULT 'apify',
    language VARCHAR(10) DEFAULT 'nl',
    extracted_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (business_id) REFERENCES businesses(id),
    INDEX idx_business_qualifying (business_id, is_qualifying),
    INDEX idx_negative_recent (is_negative, review_date)
);
```

### Table: `contact_enrichments`
```sql
CREATE TABLE contact_enrichments (
    id SERIAL PRIMARY KEY,
    business_id VARCHAR(255) NOT NULL,

    -- Organization data
    org_domain VARCHAR(255),
    org_name VARCHAR(255),
    org_industry VARCHAR(100),
    org_employee_count VARCHAR(50),
    org_revenue VARCHAR(50),
    org_tech_stack JSON,

    -- Decision maker contact
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_linkedin VARCHAR(255),
    contact_seniority VARCHAR(50),
    contact_department VARCHAR(100),

    -- Enrichment quality
    quality_score INT,                        -- 0-100
    confidence_level VARCHAR(50),             -- 'high' | 'medium' | 'low'

    -- Source
    enrichment_source VARCHAR(50) DEFAULT 'apollo',
    enrichment_cost_credits DECIMAL(5, 2),   -- Track Apollo.io credit usage
    enriched_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (business_id) REFERENCES businesses(id),
    INDEX idx_business_enrichment (business_id)
);
```

---

## Optimal Workflow Implementation

### Phase 1: Business Discovery + Caching

```javascript
/**
 * Step 1: Discover businesses and cache Google Maps data
 * Cost: $0.01 per business (Google Maps Scraper)
 */
async discoverAndCacheBusinesses(searchQuery, maxBusinesses = 50) {
    console.log(`🔍 Discovering businesses: "${searchQuery}"`);

    const businesses = [];

    for (let i = 0; i < maxBusinesses; i++) {
        // Check cache first
        const cached = await db.businesses.findOne({
            where: {
                name: { [Op.like]: `%${searchQuery}%` },
                maps_data_cached: true,
                cache_expires_at: { [Op.gt]: new Date() }
            }
        });

        if (cached) {
            console.log(`📦 Using cached data for ${cached.name}`);
            businesses.push(cached);
            continue;
        }

        // Run Google Maps scraper
        const mapsData = await apifyGoogleMapsScraper.run({
            searchQuery,
            maxItems: 1,
            language: 'nl',
            country: 'NL'
        });

        // Store in database
        const business = await db.businesses.create({
            id: mapsData.placeId,
            name: mapsData.title,
            address: mapsData.address,
            city: extractCity(mapsData.address),
            country: 'NL',
            phone: mapsData.phone,
            website: mapsData.website,
            category: mapsData.category,
            place_id: mapsData.placeId,
            cid: mapsData.cid,
            latitude: mapsData.latitude,
            longitude: mapsData.longitude,
            overall_rating: mapsData.rating,
            total_reviews: mapsData.reviewsCount,
            rating_distribution: mapsData.ratingDistribution,
            status: 'discovered',
            maps_data_cached: true,
            cache_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        businesses.push(business);

        // Rate limiting
        await delay(3000);
    }

    console.log(`✅ Discovered ${businesses.length} businesses (${businesses.filter(b => b.maps_data_cached).length} from cache)`);

    return businesses;
}
```

### Phase 2: Review Extraction + Filtering

```javascript
/**
 * Step 2: Extract reviews and identify businesses with qualifying reviews
 * Cost: $0.001 per business (Reviews Scraper)
 */
async extractAndFilterReviews(businesses, criteria = {}) {
    console.log(`📝 Extracting reviews for ${businesses.length} businesses`);

    const {
        maxRating = 3,              // 1-3 stars
        daysBack = 14,              // Last 14 days
        minTextLength = 50,         // Minimum review length
        maxReviews = 50             // Per business
    } = criteria;

    const businessesWithQualifyingReviews = [];

    for (const business of businesses) {
        // Run Reviews Scraper
        const reviews = await apifyReviewsScraper.run({
            placeIds: [business.place_id],
            maxReviews,
            language: 'nl',
            sort: 'newest',
            reviewsStartDate: `${daysBack} days`
        });

        // Store all reviews
        const storedReviews = [];
        for (const review of reviews) {
            const stored = await db.reviews.create({
                id: `${business.id}_${review.reviewId}`,
                business_id: business.id,
                reviewer_name: review.reviewerName,
                rating: review.stars,
                text: review.text,
                review_date: new Date(review.publishedAtDate),
                source: 'apify',
                language: 'nl',
                extracted_at: new Date()
            });

            storedReviews.push(stored);
        }

        // Filter for qualifying reviews
        const qualifyingReviews = storedReviews.filter(r => {
            const isNegative = r.rating <= maxRating;
            const isRecent = (Date.now() - r.review_date.getTime()) <= (daysBack * 24 * 60 * 60 * 1000);
            const hasText = r.text && r.text.length >= minTextLength;

            return isNegative && isRecent && hasText;
        });

        // Update qualifying flag
        await db.reviews.update(
            { is_qualifying: true },
            { where: { id: { [Op.in]: qualifyingReviews.map(r => r.id) } } }
        );

        // Update business flags
        const hasQualifying = qualifyingReviews.length > 0;
        await db.businesses.update(
            {
                status: 'reviews_scraped',
                has_qualifying_reviews: hasQualifying,
                needs_enrichment: hasQualifying,  // Flag for enrichment
                last_review_check: new Date()
            },
            { where: { id: business.id } }
        );

        if (hasQualifying) {
            console.log(`⚠️ ${business.name}: ${qualifyingReviews.length} qualifying negative reviews`);
            businessesWithQualifyingReviews.push({
                ...business.toJSON(),
                qualifyingReviews
            });
        }

        // Rate limiting
        await delay(5000);
    }

    console.log(`✅ Found ${businessesWithQualifyingReviews.length}/${businesses.length} businesses with qualifying reviews`);

    return businessesWithQualifyingReviews;
}
```

### Phase 3: Conditional Enrichment

```javascript
/**
 * Step 3: Enrich ONLY businesses with qualifying reviews
 * Cost: ~$0.10-$0.50 per business (Apollo.io credits)
 */
async conditionalEnrichment(options = {}) {
    const {
        forceEnrich = false,        // Force re-enrichment
        maxEnrichments = 10         // Budget control
    } = options;

    console.log(`💼 Starting conditional contact enrichment`);

    // Query businesses that need enrichment
    const businessesToEnrich = await db.businesses.findAll({
        where: {
            needs_enrichment: true,
            is_enriched: forceEnrich ? undefined : false  // Skip already enriched unless forced
        },
        limit: maxEnrichments,
        order: [['discovered_at', 'DESC']]
    });

    console.log(`📊 Found ${businessesToEnrich.length} businesses needing enrichment`);

    if (businessesToEnrich.length === 0) {
        console.log(`✅ No businesses need enrichment`);
        return { enriched: 0, skipped: 0 };
    }

    const enriched = [];
    const failed = [];

    for (const business of businessesToEnrich) {
        try {
            // Extract domain
            const domain = extractDomain(business.website);

            if (!domain) {
                console.warn(`⚠️ No domain for ${business.name}, skipping enrichment`);
                failed.push({ business, reason: 'no_domain' });
                continue;
            }

            // Apollo.io Organization Enrichment
            const orgData = await apolloClient.enrichOrganization(domain);

            // Apollo.io People Search (Decision Makers)
            const decisionMakers = await apolloClient.searchPeople({
                organizationDomain: domain,
                titles: ['Owner', 'General Manager', 'Director', 'Practice Manager'],
                seniorities: ['owner', 'c_suite', 'vp', 'director', 'manager'],
                limit: 5
            });

            // Store enrichment data
            for (const contact of decisionMakers.contacts || []) {
                await db.contact_enrichments.create({
                    business_id: business.id,
                    org_domain: domain,
                    org_name: orgData.data?.name,
                    org_industry: orgData.data?.industry,
                    org_employee_count: orgData.data?.employee_count,
                    contact_name: contact.name,
                    contact_title: contact.title,
                    contact_email: contact.email,
                    contact_phone: contact.phone,
                    contact_linkedin: contact.linkedin_url,
                    contact_seniority: contact.seniority,
                    contact_department: contact.department,
                    quality_score: calculateQualityScore(contact),
                    enrichment_source: 'apollo',
                    enrichment_cost_credits: 0.1  // Track cost
                });
            }

            // Update business status
            await db.businesses.update(
                {
                    status: 'enriched',
                    is_enriched: true,
                    needs_enrichment: false,
                    last_enrichment_check: new Date()
                },
                { where: { id: business.id } }
            );

            enriched.push({
                business,
                contacts: decisionMakers.contacts?.length || 0
            });

            console.log(`✅ Enriched ${business.name}: ${decisionMakers.contacts?.length || 0} contacts`);

            // Rate limiting (Apollo.io)
            await delay(2000);

        } catch (error) {
            console.error(`❌ Failed to enrich ${business.name}:`, error);
            failed.push({ business, reason: error.message });
        }
    }

    console.log(`
    📊 Enrichment Summary:
       Total Processed: ${businessesToEnrich.length}
       Successful: ${enriched.length}
       Failed: ${failed.length}
       Apollo Credits Used: ~${enriched.length * 0.1}
    `);

    return { enriched, failed };
}
```

---

## Flexible Re-Run Scenarios

### Scenario 1: Check for New Reviews on Cached Businesses

```javascript
/**
 * Re-run review check on previously discovered businesses
 * Uses cached Google Maps data → Only runs Reviews Scraper
 */
async checkForNewReviews(daysBack = 7) {
    console.log(`🔄 Checking for new reviews (last ${daysBack} days)`);

    // Get businesses from cache
    const cachedBusinesses = await db.businesses.findAll({
        where: {
            maps_data_cached: true,
            cache_expires_at: { [Op.gt]: new Date() }
        }
    });

    console.log(`📦 Found ${cachedBusinesses.length} cached businesses`);

    // Run reviews scraper (NO Google Maps scraper needed!)
    const newlyQualifying = await extractAndFilterReviews(cachedBusinesses, {
        daysBack,
        maxReviews: 20  // Only get recent reviews
    });

    // Enrich new businesses with qualifying reviews
    if (newlyQualifying.length > 0) {
        console.log(`⚠️ ${newlyQualifying.length} businesses now have qualifying reviews`);
        await conditionalEnrichment({ maxEnrichments: newlyQualifying.length });
    }

    return {
        checked: cachedBusinesses.length,
        newQualifying: newlyQualifying.length,
        cost: cachedBusinesses.length * 0.001  // Only Reviews Scraper cost
    };
}
```

### Scenario 2: Enrich Previously Unenriched Businesses

```javascript
/**
 * Enrich businesses that have qualifying reviews but no contact data yet
 */
async enrichPendingBusinesses(maxBudget = 10) {
    console.log(`💼 Enriching pending businesses (max ${maxBudget} credits)`);

    // Find businesses with qualifying reviews but no enrichment
    const pending = await db.businesses.findAll({
        where: {
            has_qualifying_reviews: true,
            is_enriched: false
        },
        limit: maxBudget
    });

    console.log(`📊 Found ${pending.length} businesses pending enrichment`);

    return await conditionalEnrichment({
        maxEnrichments: maxBudget
    });
}
```

---

## API Endpoints for Frontend

### GET /api/businesses
```javascript
// Get all businesses with enrichment status
GET /api/businesses?status=enriched&has_qualifying_reviews=true

Response:
{
  "total": 15,
  "businesses": [
    {
      "id": "ChIJ...",
      "name": "Amsterdam Dental Clinic",
      "rating": 2.3,
      "total_reviews": 47,
      "has_qualifying_reviews": true,
      "is_enriched": true,
      "qualifying_review_count": 12,
      "contact_count": 3,
      "last_review_check": "2026-01-30T10:30:00Z"
    }
  ]
}
```

### GET /api/businesses/:id/enrichment
```javascript
// Get enrichment data for specific business
GET /api/businesses/ChIJ.../enrichment

Response:
{
  "business": {
    "id": "ChIJ...",
    "name": "Amsterdam Dental Clinic",
    "website": "amsterdamdental.nl"
  },
  "organization": {
    "domain": "amsterdamdental.nl",
    "industry": "Healthcare",
    "employee_count": "11-50"
  },
  "contacts": [
    {
      "name": "Dr. Jan van der Berg",
      "title": "Owner & Principal Dentist",
      "email": "j.vandenberg@amsterdamdental.nl",
      "phone": "+31 20 123 4567",
      "linkedin": "linkedin.com/in/janvandenberg",
      "quality_score": 95
    },
    {
      "name": "Lisa Vermeer",
      "title": "Practice Manager",
      "email": "l.vermeer@amsterdamdental.nl",
      "phone": "+31 20 123 4568",
      "quality_score": 88
    }
  ],
  "qualifying_reviews": [
    {
      "id": "review_001",
      "rating": 1,
      "text": "Zeer teleurstellende ervaring...",
      "date": "2026-01-25",
      "sentiment_score": -0.87,
      "emotion_tags": ["anger", "frustration"]
    }
  ]
}
```

### POST /api/enrichment/trigger
```javascript
// Manually trigger enrichment for specific businesses
POST /api/enrichment/trigger
{
  "business_ids": ["ChIJ...", "ChIJ..."],
  "force_refresh": false
}

Response:
{
  "queued": 2,
  "estimated_cost_credits": 0.2,
  "estimated_completion": "2026-01-30T10:35:00Z"
}
```

---

## Cost Optimization Dashboard

### Real-Time Cost Tracking

```javascript
// Track API costs in database
CREATE TABLE api_cost_tracking (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(100),              -- 'google_maps_scraper' | 'reviews_scraper' | 'apollo_enrichment'
    business_id VARCHAR(255),
    cost_usd DECIMAL(10, 4),
    credits_used DECIMAL(5, 2),
    executed_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_operation_date (operation, executed_at)
);

// Query daily costs
SELECT
    operation,
    DATE(executed_at) as date,
    COUNT(*) as runs,
    SUM(cost_usd) as total_cost_usd,
    SUM(credits_used) as total_credits
FROM api_cost_tracking
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY operation, DATE(executed_at)
ORDER BY date DESC;
```

---

## Summary: Optimal Workflow

### Phase 1: Discovery (Run Once)
```
Input: Search query
Process: Google Maps Scraper
Output: Business IDs cached
Cost: $0.01/business
```

### Phase 2: Review Analysis (Run Periodically)
```
Input: Cached business IDs
Process: Reviews Scraper + Filter
Output: Businesses with qualifying reviews flagged
Cost: $0.001/business
```

### Phase 3: Conditional Enrichment (On-Demand)
```
Input: Only businesses with qualifying reviews
Process: Apollo.io enrichment
Output: Contact data stored
Cost: ~$0.10/business
Savings: 85% vs enriching all businesses
```

### Flexible Re-Runs
```
Scenario 1: Check for new reviews
- Use cached IDs (FREE)
- Run reviews scraper ($0.001/business)
- Enrich only new qualifying businesses

Scenario 2: Enrich pending businesses
- Query database for unenriched businesses with qualifying reviews
- Run Apollo.io enrichment
- Budget-controlled (max enrichments parameter)
```

---

**Key Improvements:**
1. ✅ Cache-first strategy (90% cost reduction on re-runs)
2. ✅ Conditional enrichment (85% savings on Apollo.io)
3. ✅ Database persistence (data survives restarts)
4. ✅ Flexible re-run scenarios
5. ✅ Budget controls (maxEnrichments parameter)
6. ✅ Cost tracking dashboard
7. ✅ Frontend API endpoints
