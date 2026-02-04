-- Reputation Intelligence Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: businesses
-- Stores discovered businesses with Google Maps data
-- ============================================================================
CREATE TABLE IF NOT EXISTS businesses (
    -- Primary identifiers
    id VARCHAR(255) PRIMARY KEY,                    -- Google Place ID
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,    -- Internal UUID

    -- Business information
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'NL',
    phone VARCHAR(50),
    website VARCHAR(255),
    category VARCHAR(100),

    -- Google Maps data
    place_id VARCHAR(255) UNIQUE NOT NULL,
    cid VARCHAR(255),                               -- Google CID
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Rating data
    overall_rating DECIMAL(2, 1),
    total_reviews INT DEFAULT 0,
    rating_distribution JSONB,                      -- {"1": 5, "2": 3, "3": 2, "4": 10, "5": 20}

    -- Workflow status flags
    status VARCHAR(50) DEFAULT 'discovered',        -- 'discovered' | 'reviews_scraped' | 'enriched'
    has_qualifying_reviews BOOLEAN DEFAULT FALSE,
    needs_enrichment BOOLEAN DEFAULT FALSE,
    is_enriched BOOLEAN DEFAULT FALSE,

    -- Review statistics
    qualifying_review_count INT DEFAULT 0,
    negative_review_count INT DEFAULT 0,
    recent_negative_count INT DEFAULT 0,            -- Last 14 days

    -- Cache management
    maps_data_cached BOOLEAN DEFAULT TRUE,
    cache_expires_at TIMESTAMP,
    cache_source VARCHAR(50) DEFAULT 'apify',       -- 'apify' | 'dataforseo'

    -- Metadata
    discovered_at TIMESTAMP DEFAULT NOW(),
    last_review_check TIMESTAMP,
    last_enrichment_check TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT valid_status CHECK (status IN ('discovered', 'reviews_scraped', 'enriched'))
);

-- Indexes for businesses table
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_qualifying ON businesses(has_qualifying_reviews);
CREATE INDEX IF NOT EXISTS idx_businesses_needs_enrichment ON businesses(needs_enrichment);
CREATE INDEX IF NOT EXISTS idx_businesses_place_id ON businesses(place_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city_category ON businesses(city, category);
CREATE INDEX IF NOT EXISTS idx_businesses_cache_expires ON businesses(cache_expires_at);

-- ============================================================================
-- TABLE: reviews
-- Stores Google reviews with filtering and sentiment data
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    -- Primary identifiers
    id VARCHAR(255) PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    business_id VARCHAR(255) NOT NULL,

    -- Review content
    reviewer_name VARCHAR(255),
    reviewer_profile_url TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    review_date TIMESTAMP NOT NULL,

    -- Review metadata
    likes_count INT DEFAULT 0,
    reviewer_total_reviews INT DEFAULT 0,
    business_response TEXT,
    business_response_date TIMESTAMP,

    -- Classification flags
    is_negative BOOLEAN GENERATED ALWAYS AS (rating <= 3) STORED,
    is_qualifying BOOLEAN DEFAULT FALSE,            -- Meets all criteria (negative + recent + min text)
    text_length INT,

    -- Sentiment analysis (populated by sentiment-analyzer-agent)
    sentiment_score DECIMAL(3, 2),                  -- -1.0 to 1.0
    sentiment_label VARCHAR(50),                    -- 'negative' | 'neutral' | 'positive'
    emotion_tags JSONB,                             -- ["anger", "frustration", "disappointment"]
    complaint_categories JSONB,                     -- ["service", "pricing", "quality"]

    -- Source metadata
    source VARCHAR(50) DEFAULT 'apify',
    language VARCHAR(10) DEFAULT 'nl',
    review_url TEXT,

    -- Timestamps
    extracted_at TIMESTAMP DEFAULT NOW(),
    analyzed_at TIMESTAMP,                          -- When sentiment analysis completed

    -- Foreign key
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Indexes for reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_qualifying ON reviews(business_id, is_qualifying);
CREATE INDEX IF NOT EXISTS idx_reviews_negative_recent ON reviews(is_negative, review_date);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment_label, sentiment_score);

-- ============================================================================
-- TABLE: contact_enrichments
-- Stores Apollo.io enrichment data (decision makers, contacts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_enrichments (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    business_id VARCHAR(255) NOT NULL,

    -- Organization data (from Apollo.io)
    org_domain VARCHAR(255),
    org_name VARCHAR(255),
    org_industry VARCHAR(100),
    org_employee_count VARCHAR(50),                 -- "11-50", "51-200", etc.
    org_revenue VARCHAR(50),                        -- "$1M-$10M", etc.
    org_tech_stack JSONB,                           -- ["WordPress", "Google Analytics", etc.]
    org_description TEXT,

    -- Decision maker contact
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_linkedin VARCHAR(255),
    contact_seniority VARCHAR(50),                  -- 'owner' | 'c_suite' | 'vp' | 'director' | 'manager'
    contact_department VARCHAR(100),

    -- Contact verification
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    contact_verified_at TIMESTAMP,

    -- Enrichment quality
    quality_score INT CHECK (quality_score >= 0 AND quality_score <= 100),
    confidence_level VARCHAR(50),                   -- 'high' | 'medium' | 'low'
    data_completeness INT,                          -- Percentage 0-100

    -- Cost tracking
    enrichment_source VARCHAR(50) DEFAULT 'apollo',
    enrichment_cost_credits DECIMAL(5, 2),          -- Apollo.io credits used
    api_request_id VARCHAR(255),                    -- Apollo.io request ID for tracking

    -- Metadata
    enriched_at TIMESTAMP DEFAULT NOW(),
    last_verified TIMESTAMP,

    -- Foreign key
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Indexes for contact_enrichments table
CREATE INDEX IF NOT EXISTS idx_enrichments_business_id ON contact_enrichments(business_id);
CREATE INDEX IF NOT EXISTS idx_enrichments_email ON contact_enrichments(contact_email);
CREATE INDEX IF NOT EXISTS idx_enrichments_quality ON contact_enrichments(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_enrichments_source ON contact_enrichments(enrichment_source);

-- ============================================================================
-- TABLE: api_cost_tracking
-- Tracks API costs for budget monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_cost_tracking (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,

    -- Operation details
    operation VARCHAR(100) NOT NULL,                -- 'google_maps_scraper' | 'reviews_scraper' | 'apollo_enrichment'
    business_id VARCHAR(255),

    -- Cost information
    cost_usd DECIMAL(10, 4),
    credits_used DECIMAL(5, 2),
    items_processed INT DEFAULT 1,

    -- API details
    api_provider VARCHAR(50),                       -- 'apify' | 'apollo' | 'dataforseo'
    api_request_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'success',           -- 'success' | 'failed' | 'partial'
    error_message TEXT,

    -- Timestamps
    executed_at TIMESTAMP DEFAULT NOW(),

    -- Foreign key (optional - business may not exist for some operations)
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
);

-- Indexes for api_cost_tracking table
CREATE INDEX IF NOT EXISTS idx_cost_tracking_operation ON api_cost_tracking(operation);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON api_cost_tracking(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_provider ON api_cost_tracking(api_provider);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_business ON api_cost_tracking(business_id);

-- ============================================================================
-- TABLE: workflow_executions
-- Tracks workflow runs for auditing and debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,

    -- Workflow details
    workflow_type VARCHAR(100) NOT NULL,            -- 'business_discovery' | 'review_analysis' | 'contact_enrichment'
    search_query TEXT,
    parameters JSONB,

    -- Execution results
    status VARCHAR(50) DEFAULT 'running',           -- 'running' | 'completed' | 'failed' | 'partial'
    businesses_processed INT DEFAULT 0,
    reviews_extracted INT DEFAULT 0,
    enrichments_completed INT DEFAULT 0,

    -- Cost summary
    total_cost_usd DECIMAL(10, 4),
    total_credits_used DECIMAL(5, 2),

    -- Timing
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INT,

    -- Error tracking
    error_message TEXT,
    error_stack TEXT
);

-- Indexes for workflow_executions table
CREATE INDEX IF NOT EXISTS idx_workflow_executions_type ON workflow_executions(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_date ON workflow_executions(started_at DESC);

-- ============================================================================
-- VIEWS
-- Useful views for querying
-- ============================================================================

-- View: Businesses needing enrichment
CREATE OR REPLACE VIEW businesses_needing_enrichment AS
SELECT
    b.id,
    b.name,
    b.city,
    b.category,
    b.overall_rating,
    b.qualifying_review_count,
    b.discovered_at,
    b.last_review_check,
    COUNT(r.id) as total_qualifying_reviews
FROM businesses b
LEFT JOIN reviews r ON r.business_id = b.id AND r.is_qualifying = true
WHERE b.needs_enrichment = true
  AND b.is_enriched = false
  AND b.has_qualifying_reviews = true
GROUP BY b.id
ORDER BY b.qualifying_review_count DESC, b.discovered_at DESC;

-- View: Enrichment summary by business
CREATE OR REPLACE VIEW enrichment_summary AS
SELECT
    b.id,
    b.name,
    b.city,
    b.website,
    b.is_enriched,
    COUNT(DISTINCT ce.id) as contact_count,
    AVG(ce.quality_score) as avg_quality_score,
    SUM(ce.enrichment_cost_credits) as total_credits_used,
    MAX(ce.enriched_at) as last_enrichment_date
FROM businesses b
LEFT JOIN contact_enrichments ce ON ce.business_id = b.id
GROUP BY b.id;

-- View: Daily cost tracking
CREATE OR REPLACE VIEW daily_cost_summary AS
SELECT
    DATE(executed_at) as date,
    operation,
    api_provider,
    COUNT(*) as total_operations,
    SUM(cost_usd) as total_cost_usd,
    SUM(credits_used) as total_credits,
    SUM(items_processed) as total_items
FROM api_cost_tracking
GROUP BY DATE(executed_at), operation, api_provider
ORDER BY date DESC, total_cost_usd DESC;

-- View: Business review statistics
CREATE OR REPLACE VIEW business_review_stats AS
SELECT
    b.id,
    b.name,
    b.overall_rating,
    COUNT(r.id) as total_reviews,
    COUNT(CASE WHEN r.is_negative THEN 1 END) as negative_reviews,
    COUNT(CASE WHEN r.is_qualifying THEN 1 END) as qualifying_reviews,
    COUNT(CASE WHEN r.review_date >= NOW() - INTERVAL '14 days' THEN 1 END) as recent_reviews,
    AVG(r.sentiment_score) as avg_sentiment,
    MAX(r.review_date) as latest_review_date
FROM businesses b
LEFT JOIN reviews r ON r.business_id = b.id
GROUP BY b.id;

-- ============================================================================
-- FUNCTIONS
-- Utility functions for workflow automation
-- ============================================================================

-- Function: Update business statistics after review extraction
CREATE OR REPLACE FUNCTION update_business_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses
    SET
        qualifying_review_count = (
            SELECT COUNT(*) FROM reviews
            WHERE business_id = NEW.business_id AND is_qualifying = true
        ),
        negative_review_count = (
            SELECT COUNT(*) FROM reviews
            WHERE business_id = NEW.business_id AND is_negative = true
        ),
        recent_negative_count = (
            SELECT COUNT(*) FROM reviews
            WHERE business_id = NEW.business_id
              AND is_negative = true
              AND review_date >= NOW() - INTERVAL '14 days'
        ),
        has_qualifying_reviews = (
            SELECT COUNT(*) > 0 FROM reviews
            WHERE business_id = NEW.business_id AND is_qualifying = true
        ),
        needs_enrichment = (
            SELECT COUNT(*) > 0 FROM reviews
            WHERE business_id = NEW.business_id AND is_qualifying = true
        ) AND NOT is_enriched,
        status = CASE
            WHEN status = 'discovered' THEN 'reviews_scraped'
            ELSE status
        END,
        last_review_check = NOW(),
        updated_at = NOW()
    WHERE id = NEW.business_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update business stats when reviews are added
CREATE TRIGGER trigger_update_business_stats
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_review_stats();

-- Function: Mark business as enriched after enrichment
CREATE OR REPLACE FUNCTION mark_business_enriched()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses
    SET
        is_enriched = true,
        needs_enrichment = false,
        status = 'enriched',
        last_enrichment_check = NOW(),
        updated_at = NOW()
    WHERE id = NEW.business_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update business enrichment status
CREATE TRIGGER trigger_mark_enriched
AFTER INSERT ON contact_enrichments
FOR EACH ROW
EXECUTE FUNCTION mark_business_enriched();

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Add sample cache expiration times (30 days default)
CREATE OR REPLACE FUNCTION set_default_cache_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cache_expires_at IS NULL THEN
        NEW.cache_expires_at := NOW() + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_cache_expiration
BEFORE INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION set_default_cache_expiration();

-- ============================================================================
-- GRANT PERMISSIONS (Adjust username as needed)
-- ============================================================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_businesses_city_status_qualifying
ON businesses(city, status, has_qualifying_reviews);

CREATE INDEX IF NOT EXISTS idx_reviews_business_qualifying_date
ON reviews(business_id, is_qualifying, review_date DESC);

CREATE INDEX IF NOT EXISTS idx_enrichments_business_quality
ON contact_enrichments(business_id, quality_score DESC);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE businesses IS 'Stores discovered businesses with Google Maps data and workflow status flags';
COMMENT ON TABLE reviews IS 'Stores Google reviews with sentiment analysis and qualification flags';
COMMENT ON TABLE contact_enrichments IS 'Stores Apollo.io enrichment data for decision makers';
COMMENT ON TABLE api_cost_tracking IS 'Tracks API costs for budget monitoring and reporting';
COMMENT ON TABLE workflow_executions IS 'Tracks workflow execution history for auditing';

COMMENT ON COLUMN businesses.status IS 'Workflow progress: discovered → reviews_scraped → enriched';
COMMENT ON COLUMN businesses.has_qualifying_reviews IS 'TRUE if business has negative reviews meeting criteria';
COMMENT ON COLUMN businesses.needs_enrichment IS 'TRUE if has qualifying reviews but not yet enriched';
COMMENT ON COLUMN reviews.is_qualifying IS 'TRUE if review meets all criteria: negative + recent + min text length';
COMMENT ON COLUMN contact_enrichments.quality_score IS 'Quality score 0-100 based on data completeness and verification';

-- ============================================================================
-- VACUUM AND ANALYZE
-- ============================================================================

-- Run after initial setup
-- VACUUM ANALYZE businesses;
-- VACUUM ANALYZE reviews;
-- VACUUM ANALYZE contact_enrichments;
-- VACUUM ANALYZE api_cost_tracking;
