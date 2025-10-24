-- ═══════════════════════════════════════════════════════════════════════
-- ORCHESTRAI Competitive Intelligence System - PostgreSQL Schema
-- ═══════════════════════════════════════════════════════════════════════
--
-- Database for Facebook/Instagram ad monitoring, analysis, and template generation
--
-- Tables:
-- 1. ads - Core ad data from Meta Ad Library + Apify
-- 2. ad_analysis - AI-powered creative analysis results
-- 3. collections - Curated sets of ads
-- 4. collection_ads - Many-to-many relationship between collections and ads
-- 5. competitors - Tracked advertiser pages
-- 6. templates - Generated ad templates
-- 7. clients - Multi-tenant client accounts (future)
--
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- Table: ads
-- Core ad data collected from Meta Ad Library API and Apify scrapers
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ads (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_library_id VARCHAR(255) UNIQUE NOT NULL,

    -- Advertiser Information
    advertiser_id VARCHAR(255) NOT NULL,
    advertiser_name VARCHAR(500) NOT NULL,
    advertiser_verified BOOLEAN DEFAULT false,

    -- Ad Copy
    headline TEXT,
    primary_text TEXT,
    description TEXT,
    cta_type VARCHAR(100),
    cta_text VARCHAR(255),

    -- Creative Assets
    creative_type VARCHAR(50) DEFAULT 'image', -- image, video, carousel, collection
    creative_urls JSONB DEFAULT '[]'::jsonb, -- Array of image/video URLs
    landing_page_url TEXT,

    -- Metadata
    platforms JSONB DEFAULT '[]'::jsonb, -- ["facebook", "instagram"]
    geographic_targeting JSONB DEFAULT '{}'::jsonb,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Performance Scoring (calculated by performance-scorer-agent)
    performance_score DECIMAL(5,2) DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
    longevity_score DECIMAL(5,2) DEFAULT 0,
    iteration_score DECIMAL(5,2) DEFAULT 0,
    advertiser_quality_score DECIMAL(5,2) DEFAULT 0,
    industry_relevance_score DECIMAL(5,2) DEFAULT 0,

    -- Classification
    industry VARCHAR(100), -- dental_b2c, dental_b2b, ai_saas
    sub_industry VARCHAR(100),
    offer_type VARCHAR(100), -- lead_gen, ecommerce, saas_trial
    target_audience VARCHAR(100), -- b2c, b2b

    -- Spend/Impressions (only available for EU political ads)
    impressions VARCHAR(100), -- Stored as range string
    spend VARCHAR(100), -- Stored as range string
    currency VARCHAR(10),

    -- Tracking
    data_source VARCHAR(50) DEFAULT 'meta', -- meta, apify
    collection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ads table
CREATE INDEX idx_ads_advertiser_id ON ads(advertiser_id);
CREATE INDEX idx_ads_advertiser_name ON ads(advertiser_name);
CREATE INDEX idx_ads_industry ON ads(industry);
CREATE INDEX idx_ads_sub_industry ON ads(sub_industry);
CREATE INDEX idx_ads_performance_score ON ads(performance_score DESC);
CREATE INDEX idx_ads_start_date ON ads(start_date DESC);
CREATE INDEX idx_ads_active ON ads(is_active) WHERE is_active = true;
CREATE INDEX idx_ads_data_source ON ads(data_source);
CREATE INDEX idx_ads_collection_date ON ads(collection_date DESC);

-- Full-text search on ad copy
CREATE INDEX idx_ads_copy_search ON ads USING gin(
    to_tsvector('english',
        COALESCE(headline, '') || ' ' ||
        COALESCE(primary_text, '') || ' ' ||
        COALESCE(description, '')
    )
);

COMMENT ON TABLE ads IS 'Core ad data from Meta Ad Library and Apify scrapers';
COMMENT ON COLUMN ads.performance_score IS 'Calculated 0-100 score predicting ad performance';
COMMENT ON COLUMN ads.ad_library_id IS 'Unique ID from Meta Ad Library API';

-- ─────────────────────────────────────────────────────────────────────────
-- Table: ad_analysis
-- AI-powered analysis results from Claude Code specialized agents
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_analysis (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL UNIQUE REFERENCES ads(id) ON DELETE CASCADE,

    -- Copy Analysis (from direct-response-copywriter, content-writer-specialist)
    hook TEXT,
    value_proposition TEXT,
    emotional_trigger VARCHAR(255),
    social_proof_type VARCHAR(255),
    offer_structure VARCHAR(255),
    target_psychographic VARCHAR(255),
    copy_tone VARCHAR(255),
    objection_handling JSONB DEFAULT '{}'::jsonb,

    -- Visual Analysis (from GPT-4 Vision or visual-analysis-agent)
    color_palette JSONB DEFAULT '[]'::jsonb,
    layout_type VARCHAR(255),
    text_overlay JSONB DEFAULT '{}'::jsonb,
    branding_presence JSONB DEFAULT '{}'::jsonb,
    emotional_tone VARCHAR(255),
    visual_quality DECIMAL(3,2), -- 0-10 scale
    mobile_optimized BOOLEAN,

    -- Pattern Detection
    hook_pattern VARCHAR(255),
    cta_pattern VARCHAR(255),
    creative_pattern VARCHAR(255),

    -- Metadata
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_version VARCHAR(50) DEFAULT 'v1.0'
);

-- Indexes for ad_analysis table
CREATE INDEX idx_ad_analysis_ad_id ON ad_analysis(ad_id);
CREATE INDEX idx_ad_analysis_hook_pattern ON ad_analysis(hook_pattern);
CREATE INDEX idx_ad_analysis_cta_pattern ON ad_analysis(cta_pattern);
CREATE INDEX idx_ad_analysis_emotional_trigger ON ad_analysis(emotional_trigger);

COMMENT ON TABLE ad_analysis IS 'AI-powered creative analysis from Claude Code agents';
COMMENT ON COLUMN ad_analysis.hook IS 'Opening line or attention-grabbing element';
COMMENT ON COLUMN ad_analysis.emotional_trigger IS 'Primary emotional appeal (fear, desire, urgency, trust)';

-- ─────────────────────────────────────────────────────────────────────────
-- Table: collections
-- Curated collections of ads (auto-generated or custom)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS collections (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Collection Info
    name VARCHAR(500) NOT NULL,
    description TEXT,
    collection_type VARCHAR(100) NOT NULL DEFAULT 'custom', -- auto_generated, custom, client

    -- Filters used to create collection
    industry VARCHAR(100),
    offer_type VARCHAR(100),
    min_performance_score DECIMAL(5,2),
    date_range_days INT,

    -- Statistics
    ad_count INT DEFAULT 0,
    average_score DECIMAL(5,2),

    -- Timestamps
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ownership
    created_by VARCHAR(255),
    client_id UUID, -- REFERENCES clients(id) - future

    -- Visibility
    is_public BOOLEAN DEFAULT false
);

-- Indexes for collections table
CREATE INDEX idx_collections_type ON collections(collection_type);
CREATE INDEX idx_collections_industry ON collections(industry);
CREATE INDEX idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX idx_collections_client_id ON collections(client_id);

COMMENT ON TABLE collections IS 'Curated collections of ads for easy browsing and export';
COMMENT ON COLUMN collections.collection_type IS 'auto_generated: System-created, custom: User-created, client: Client-specific';

-- ─────────────────────────────────────────────────────────────────────────
-- Table: collection_ads
-- Many-to-many relationship between collections and ads
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS collection_ads (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    position INT, -- Order within collection
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (collection_id, ad_id)
);

-- Indexes for collection_ads table
CREATE INDEX idx_collection_ads_collection ON collection_ads(collection_id);
CREATE INDEX idx_collection_ads_ad ON collection_ads(ad_id);
CREATE INDEX idx_collection_ads_position ON collection_ads(collection_id, position);

COMMENT ON TABLE collection_ads IS 'Many-to-many relationship between collections and ads';

-- ─────────────────────────────────────────────────────────────────────────
-- Table: competitors
-- Tracked Facebook/Instagram advertiser pages for monitoring
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitors (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Competitor Info
    name VARCHAR(500) NOT NULL,
    facebook_page_id VARCHAR(255) UNIQUE NOT NULL,
    instagram_handle VARCHAR(255),

    -- Tracking Configuration
    industry VARCHAR(100),
    tracking_enabled BOOLEAN DEFAULT true,
    last_checked TIMESTAMP,
    next_check_at TIMESTAMP,
    check_frequency_hours INT DEFAULT 24,

    -- Statistics
    total_ads INT DEFAULT 0,
    active_ads INT DEFAULT 0,
    average_performance_score DECIMAL(5,2),

    -- Alerts
    alert_on_new_campaign BOOLEAN DEFAULT true,
    alert_threshold_ads INT DEFAULT 3, -- Alert if X+ new ads in single check

    -- Metadata
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(255),
    notes TEXT
);

-- Indexes for competitors table
CREATE INDEX idx_competitors_facebook_page_id ON competitors(facebook_page_id);
CREATE INDEX idx_competitors_industry ON competitors(industry);
CREATE INDEX idx_competitors_tracking ON competitors(tracking_enabled) WHERE tracking_enabled = true;
CREATE INDEX idx_competitors_next_check ON competitors(next_check_at) WHERE tracking_enabled = true;

COMMENT ON TABLE competitors IS 'Tracked advertiser pages for competitive monitoring';
COMMENT ON COLUMN competitors.check_frequency_hours IS 'How often to check for new ads (hours)';

-- ─────────────────────────────────────────────────────────────────────────
-- Table: templates
-- Generated ad templates from top-performing ads
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS templates (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template Info
    name VARCHAR(500) NOT NULL,
    description TEXT,

    -- Source
    source_ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,

    -- Template Content (JSONB for flexibility)
    copy_template JSONB DEFAULT '{}'::jsonb, -- {headline, primaryText, cta}
    creative_guidelines JSONB DEFAULT '{}'::jsonb, -- {colorPalette, layout, imageStyle}
    targeting_recommendations JSONB DEFAULT '{}'::jsonb, -- {age, location, interests}
    budget_strategy JSONB DEFAULT '{}'::jsonb, -- {dailyBudget, cpc, scaling}
    ab_test_variations JSONB DEFAULT '[]'::jsonb, -- Array of variation objects

    -- Classification
    industry VARCHAR(100),
    offer_type VARCHAR(100),
    ad_format VARCHAR(100), -- image, video, carousel

    -- Usage Tracking
    usage_count INT DEFAULT 0,
    last_used TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_public BOOLEAN DEFAULT false
);

-- Indexes for templates table
CREATE INDEX idx_templates_source_ad ON templates(source_ad_id);
CREATE INDEX idx_templates_industry ON templates(industry);
CREATE INDEX idx_templates_offer_type ON templates(offer_type);
CREATE INDEX idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);

COMMENT ON TABLE templates IS 'Launch-ready ad templates generated from top performers';
COMMENT ON COLUMN templates.copy_template IS 'Fill-in-the-blank copy with placeholders';

-- ─────────────────────────────────────────────────────────────────────────
-- Table: clients (Multi-Tenant Support - Future)
-- Client accounts for service offering
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Client Info
    name VARCHAR(500) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(500),

    -- Subscription
    subscription_tier VARCHAR(50) DEFAULT 'professional', -- starter, professional, agency
    monthly_export_limit INT DEFAULT 100,
    exports_used INT DEFAULT 0,

    -- Preferences
    industries JSONB DEFAULT '[]'::jsonb, -- ["dental_b2c", "ai_saas"]
    email_alerts_enabled BOOLEAN DEFAULT true,
    webhook_url TEXT,

    -- Authentication
    password_hash VARCHAR(255),
    api_key VARCHAR(255) UNIQUE,
    last_login TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for clients table
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_api_key ON clients(api_key);
CREATE INDEX idx_clients_subscription_tier ON clients(subscription_tier);

COMMENT ON TABLE clients IS 'Multi-tenant client accounts (future feature)';

-- ─────────────────────────────────────────────────────────────────────────
-- Functions and Triggers
-- ─────────────────────────────────────────────────────────────────────────

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ads table
CREATE TRIGGER update_ads_last_updated
    BEFORE UPDATE ON ads
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for collections table
CREATE TRIGGER update_collections_last_updated
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for clients table
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- ─────────────────────────────────────────────────────────────────────────
-- Views for Common Queries
-- ─────────────────────────────────────────────────────────────────────────

-- View: Top performing ads with analysis
CREATE OR REPLACE VIEW top_performing_ads AS
SELECT
    a.*,
    aa.hook,
    aa.emotional_trigger,
    aa.hook_pattern,
    aa.cta_pattern
FROM ads a
LEFT JOIN ad_analysis aa ON a.id = aa.ad_id
WHERE a.performance_score >= 80
ORDER BY a.performance_score DESC;

-- View: Active competitors with recent activity
CREATE OR REPLACE VIEW active_competitors AS
SELECT
    c.*,
    COUNT(DISTINCT a.id) as recent_ads_count
FROM competitors c
LEFT JOIN ads a ON c.facebook_page_id = a.advertiser_id
    AND a.start_date >= NOW() - INTERVAL '30 days'
WHERE c.tracking_enabled = true
GROUP BY c.id
ORDER BY recent_ads_count DESC;

-- View: Collection summaries with ad counts
CREATE OR REPLACE VIEW collection_summaries AS
SELECT
    c.*,
    COUNT(ca.ad_id) as actual_ad_count,
    AVG(a.performance_score) as current_average_score
FROM collections c
LEFT JOIN collection_ads ca ON c.id = ca.collection_id
LEFT JOIN ads a ON ca.ad_id = a.id
GROUP BY c.id
ORDER BY c.created_at DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- Initial Data / Seeds
-- ═══════════════════════════════════════════════════════════════════════

-- Sample auto-generated collections (to be created by system)
INSERT INTO collections (name, description, collection_type, industry, is_public)
VALUES
    ('Top 50 Dental Implant Ads', 'Best performing dental implant ads from last 30 days', 'auto_generated', 'dental_b2c', true),
    ('AI SaaS Signup Flows', 'High-converting AI SaaS free trial ads', 'auto_generated', 'ai_saas', true),
    ('Dental B2B Equipment Ads', 'Top performing ads for dental equipment and scanners', 'auto_generated', 'dental_b2b', true)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- Performance Optimization Recommendations
-- ═══════════════════════════════════════════════════════════════════════

-- Consider partitioning ads table by collection_date if > 1M rows:
-- CREATE TABLE ads_2024 PARTITION OF ads FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Consider adding partial indexes for specific queries:
-- CREATE INDEX idx_ads_high_performers ON ads(performance_score) WHERE performance_score >= 80;

-- ═══════════════════════════════════════════════════════════════════════
-- Schema Complete
-- ═══════════════════════════════════════════════════════════════════════
