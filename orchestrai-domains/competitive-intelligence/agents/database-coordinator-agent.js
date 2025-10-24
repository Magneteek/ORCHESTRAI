/**
 * Database Coordinator Agent
 *
 * Infrastructure agent for all PostgreSQL database operations
 *
 * Responsibilities:
 * - Manage PostgreSQL connection pool
 * - CRUD operations for ads, collections, competitors, templates
 * - Store AI analysis results
 * - Query ads by various filters
 * - Handle transactions for complex operations
 * - Emit events on data changes
 * - Use prepared statements (SQL injection prevention)
 *
 * Tables managed:
 * - ads: Core ad data
 * - ad_analysis: AI analysis results
 * - collections: Curated ad collections
 * - collection_ads: Many-to-many relationship
 * - competitors: Tracked advertiser pages
 * - templates: Generated ad templates
 * - clients: Multi-tenant client accounts (future)
 */

const { EventEmitter } = require('events');
const { Pool } = require('pg');

class DatabaseCoordinatorAgent extends EventEmitter {
    constructor(config = {}) {
        super();

        this.name = 'database-coordinator';
        this.isInitialized = false;

        this.config = {
            connectionString: process.env.DATABASE_URL,
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT || 5432,
            database: process.env.DATABASE_NAME || 'competitive_intelligence',
            user: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD,
            min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
            max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            ...config
        };

        this.pool = null;
    }

    /**
     * Initialize database connection pool
     */
    async initialize() {
        try {
            console.log(`🗄️  Initializing Database Coordinator Agent...`);

            // Create connection pool
            this.pool = new Pool(this.config);

            // Test connection
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();

            console.log(`  ✅ Database connected: ${this.config.database}`);
            console.log(`  📊 Connection pool: ${this.config.min}-${this.config.max} connections`);

            // Set up error handling
            this.pool.on('error', (err) => {
                console.error('❌ Unexpected database error:', err);
                this.emit('database-error', err);
            });

            this.isInitialized = true;
            console.log(`✅ Database Coordinator Agent initialized`);

            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to initialize Database Coordinator Agent:`, error);
            throw error;
        }
    }

    /**
     * Save ads to database
     *
     * @param {Array} ads - Ads to save
     * @param {Object} options - Save options
     * @returns {Promise<number>} Number of ads saved
     */
    async saveAds(ads, options = {}) {
        try {
            if (!Array.isArray(ads) || ads.length === 0) {
                return 0;
            }

            console.log(`💾 Saving ${ads.length} ads to database...`);

            let savedCount = 0;

            for (const ad of ads) {
                try {
                    await this.saveAd(ad, options);
                    savedCount++;
                } catch (error) {
                    console.error(`  ⚠️ Failed to save ad ${ad.adLibraryId}:`, error.message);
                    // Continue with other ads
                }
            }

            console.log(`✅ Saved ${savedCount}/${ads.length} ads`);

            this.emit('ads-saved', savedCount);

            return savedCount;

        } catch (error) {
            console.error(`❌ Failed to save ads:`, error);
            throw error;
        }
    }

    /**
     * Save a single ad (INSERT or UPDATE if exists)
     *
     * @param {Object} ad - Ad data
     * @param {Object} options - Save options
     * @returns {Promise<Object>} Saved ad with ID
     */
    async saveAd(ad, options = {}) {
        const query = `
            INSERT INTO ads (
                ad_library_id,
                advertiser_id,
                advertiser_name,
                advertiser_verified,
                headline,
                primary_text,
                description,
                cta_type,
                cta_text,
                creative_type,
                creative_urls,
                landing_page_url,
                platforms,
                geographic_targeting,
                start_date,
                end_date,
                is_active,
                last_seen,
                performance_score,
                longevity_score,
                iteration_score,
                advertiser_quality_score,
                industry_relevance_score,
                industry,
                sub_industry,
                offer_type,
                target_audience,
                data_source,
                collection_date
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29
            )
            ON CONFLICT (ad_library_id)
            DO UPDATE SET
                last_seen = EXCLUDED.last_seen,
                end_date = EXCLUDED.end_date,
                is_active = EXCLUDED.is_active,
                performance_score = EXCLUDED.performance_score,
                longevity_score = EXCLUDED.longevity_score,
                iteration_score = EXCLUDED.iteration_score,
                advertiser_quality_score = EXCLUDED.advertiser_quality_score,
                industry_relevance_score = EXCLUDED.industry_relevance_score,
                last_updated = CURRENT_TIMESTAMP
            RETURNING id;
        `;

        const values = [
            ad.adLibraryId,
            ad.pageId || ad.advertiserName, // Use advertiser name as ID if no pageId
            ad.advertiserName,
            ad.advertiserVerified || false,
            ad.headline || '',
            ad.primaryText || '',
            ad.description || '',
            ad.ctaType || null,
            ad.ctaText || null,
            ad.creativeType || 'image',
            JSON.stringify(ad.creativeUrls || []),
            ad.landingPageUrl || null,
            JSON.stringify(ad.platforms || []),
            JSON.stringify(ad.geographicTargeting || {}),
            ad.startDate,
            ad.endDate || null,
            ad.isActive !== false,
            new Date(),
            ad.performanceScore || 0,
            ad.scoreComponents?.longevity || 0,
            ad.scoreComponents?.iteration || 0,
            ad.scoreComponents?.advertiserQuality || 0,
            ad.scoreComponents?.industryRelevance || 0,
            ad.industry || null,
            ad.subIndustry || null,
            ad.offerType || null,
            ad.targetAudience || null,
            ad.dataSource || 'meta',
            ad.collectedAt || new Date()
        ];

        const result = await this.pool.query(query, values);

        return { ...ad, id: result.rows[0].id };
    }

    /**
     * Get ad by ID
     *
     * @param {string} adId - Ad UUID
     * @returns {Promise<Object|null>} Ad object or null
     */
    async getAdById(adId) {
        const query = 'SELECT * FROM ads WHERE id = $1';
        const result = await this.pool.query(query, [adId]);

        return result.rows[0] || null;
    }

    /**
     * Get ads by filters
     *
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Array>} Matching ads
     */
    async getAdsByFilters(filters = {}) {
        const {
            industry,
            subIndustry,
            minPerformanceScore,
            maxPerformanceScore,
            dateRange,
            isActive,
            advertiserName,
            limit = 100,
            offset = 0
        } = filters;

        let query = 'SELECT * FROM ads WHERE 1=1';
        const values = [];
        let paramCount = 1;

        if (industry) {
            query += ` AND industry = $${paramCount++}`;
            values.push(industry);
        }

        if (subIndustry) {
            query += ` AND sub_industry = $${paramCount++}`;
            values.push(subIndustry);
        }

        if (minPerformanceScore !== undefined) {
            query += ` AND performance_score >= $${paramCount++}`;
            values.push(minPerformanceScore);
        }

        if (maxPerformanceScore !== undefined) {
            query += ` AND performance_score <= $${paramCount++}`;
            values.push(maxPerformanceScore);
        }

        if (isActive !== undefined) {
            query += ` AND is_active = $${paramCount++}`;
            values.push(isActive);
        }

        if (advertiserName) {
            query += ` AND advertiser_name ILIKE $${paramCount++}`;
            values.push(`%${advertiserName}%`);
        }

        if (dateRange) {
            const days = parseInt(dateRange.replace('last_', '').replace('_days', ''));
            query += ` AND start_date >= NOW() - INTERVAL '${days} days'`;
        }

        query += ` ORDER BY performance_score DESC`;
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
        values.push(limit, offset);

        const result = await this.pool.query(query, values);

        return result.rows;
    }

    /**
     * Get existing ad library IDs (for deduplication)
     *
     * @returns {Promise<Set>} Set of existing ad library IDs
     */
    async getExistingAdIds() {
        const query = 'SELECT ad_library_id FROM ads';
        const result = await this.pool.query(query);

        return new Set(result.rows.map(row => row.ad_library_id));
    }

    /**
     * Save ad analysis results
     *
     * @param {Array} analyses - Analysis results
     * @returns {Promise<number>} Number of analyses saved
     */
    async saveAdAnalyses(analyses) {
        try {
            console.log(`💾 Saving ${analyses.length} ad analyses...`);

            let savedCount = 0;

            for (const analysis of analyses) {
                try {
                    await this.saveAdAnalysis(analysis);
                    savedCount++;
                } catch (error) {
                    console.error(`  ⚠️ Failed to save analysis for ${analysis.adId}:`, error.message);
                }
            }

            console.log(`✅ Saved ${savedCount}/${analyses.length} analyses`);

            return savedCount;

        } catch (error) {
            console.error(`❌ Failed to save analyses:`, error);
            throw error;
        }
    }

    /**
     * Save a single ad analysis
     *
     * @param {Object} analysis - Analysis data
     * @returns {Promise<Object>} Saved analysis
     */
    async saveAdAnalysis(analysis) {
        const query = `
            INSERT INTO ad_analysis (
                ad_id,
                hook,
                value_proposition,
                emotional_trigger,
                social_proof_type,
                offer_structure,
                target_psychographic,
                copy_tone,
                objection_handling,
                color_palette,
                layout_type,
                text_overlay,
                branding_presence,
                emotional_tone,
                visual_quality,
                mobile_optimized,
                hook_pattern,
                cta_pattern,
                creative_pattern,
                analyzed_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            )
            ON CONFLICT (ad_id)
            DO UPDATE SET
                hook = EXCLUDED.hook,
                value_proposition = EXCLUDED.value_proposition,
                emotional_trigger = EXCLUDED.emotional_trigger,
                analyzed_at = EXCLUDED.analyzed_at
            RETURNING id;
        `;

        // Extract data from nested agent results
        const copyAnalysis = analysis.agents?.directResponseCopywriter?.result || {};
        const sentimentAnalysis = analysis.agents?.sentimentAnalysis?.result || {};
        const visualAnalysis = analysis.agents?.visualAnalysis?.result || {};

        const values = [
            analysis.adId,
            copyAnalysis.hook || null,
            copyAnalysis.valueProposition || null,
            sentimentAnalysis.primaryEmotion || null,
            copyAnalysis.socialProofType || null,
            copyAnalysis.offerStructure || null,
            copyAnalysis.targetPsychographic || null,
            copyAnalysis.copyTone || null,
            JSON.stringify(copyAnalysis.objectionHandling || {}),
            JSON.stringify(visualAnalysis.colorPalette || []),
            visualAnalysis.layoutType || null,
            JSON.stringify(visualAnalysis.textOverlay || {}),
            JSON.stringify(visualAnalysis.brandingPresence || {}),
            visualAnalysis.emotionalTone || null,
            visualAnalysis.visualQuality || null,
            visualAnalysis.mobileOptimized || null,
            copyAnalysis.hookPattern || null,
            copyAnalysis.ctaPattern || null,
            visualAnalysis.creativePattern || null,
            analysis.timestamp || new Date()
        ];

        const result = await this.pool.query(query, values);

        return { ...analysis, analysisId: result.rows[0].id };
    }

    /**
     * Save a collection
     *
     * @param {Object} collection - Collection data
     * @returns {Promise<Object>} Saved collection
     */
    async saveCollection(collection) {
        const query = `
            INSERT INTO collections (
                name,
                description,
                collection_type,
                industry,
                offer_type,
                min_performance_score,
                date_range_days,
                ad_count,
                average_score,
                is_public,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        const values = [
            collection.name,
            collection.description || null,
            collection.collectionType || 'custom',
            collection.industry || null,
            collection.offerType || null,
            collection.minPerformanceScore || null,
            collection.dateRangeDays || null,
            collection.adCount || 0,
            collection.averageScore || 0,
            collection.isPublic || false,
            collection.createdBy || null
        ];

        const result = await this.pool.query(query, values);

        return result.rows[0];
    }

    /**
     * Add ads to collection
     *
     * @param {string} collectionId - Collection UUID
     * @param {Array<string>} adIds - Ad UUIDs
     * @returns {Promise<number>} Number of ads added
     */
    async addAdsToCollection(collectionId, adIds) {
        if (!Array.isArray(adIds) || adIds.length === 0) {
            return 0;
        }

        const query = `
            INSERT INTO collection_ads (collection_id, ad_id, position)
            VALUES ($1, $2, $3)
            ON CONFLICT (collection_id, ad_id) DO NOTHING;
        `;

        let addedCount = 0;

        for (let i = 0; i < adIds.length; i++) {
            try {
                await this.pool.query(query, [collectionId, adIds[i], i + 1]);
                addedCount++;
            } catch (error) {
                console.error(`  ⚠️ Failed to add ad ${adIds[i]} to collection:`, error.message);
            }
        }

        // Update collection ad count
        await this.pool.query(
            'UPDATE collections SET ad_count = $1, last_updated = NOW() WHERE id = $2',
            [addedCount, collectionId]
        );

        return addedCount;
    }

    /**
     * Save a competitor
     *
     * @param {Object} competitor - Competitor data
     * @returns {Promise<Object>} Saved competitor
     */
    async saveCompetitor(competitor) {
        const query = `
            INSERT INTO competitors (
                name,
                facebook_page_id,
                instagram_handle,
                industry,
                tracking_enabled,
                check_frequency_hours,
                alert_on_new_campaign,
                alert_threshold_ads,
                next_check_at,
                added_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (facebook_page_id)
            DO UPDATE SET
                tracking_enabled = EXCLUDED.tracking_enabled,
                check_frequency_hours = EXCLUDED.check_frequency_hours
            RETURNING *;
        `;

        const values = [
            competitor.name,
            competitor.facebookPageId,
            competitor.instagramHandle || null,
            competitor.industry || null,
            competitor.trackingEnabled !== false,
            competitor.checkFrequencyHours || 24,
            competitor.alertOnNewCampaign !== false,
            competitor.alertThresholdAds || 3,
            competitor.nextCheckAt || new Date(),
            competitor.addedBy || null
        ];

        const result = await this.pool.query(query, values);

        return result.rows[0];
    }

    /**
     * Get competitor by ID
     *
     * @param {string} competitorId - Competitor UUID
     * @returns {Promise<Object|null>} Competitor or null
     */
    async getCompetitorById(competitorId) {
        const query = 'SELECT * FROM competitors WHERE id = $1';
        const result = await this.pool.query(query, [competitorId]);

        return result.rows[0] || null;
    }

    /**
     * Update competitor
     *
     * @param {string} competitorId - Competitor UUID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated competitor
     */
    async updateCompetitor(competitorId, updates) {
        const fields = Object.keys(updates);
        const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
        const values = [competitorId, ...fields.map(field => updates[field])];

        const query = `
            UPDATE competitors
            SET ${setClause}
            WHERE id = $1
            RETURNING *;
        `;

        const result = await this.pool.query(query, values);

        return result.rows[0];
    }

    /**
     * Get competitor ad IDs (for detecting new ads)
     *
     * @param {string} competitorId - Competitor UUID
     * @returns {Promise<Array<string>>} Ad library IDs
     */
    async getCompetitorAdIds(competitorId) {
        const query = `
            SELECT ad_library_id
            FROM ads
            WHERE advertiser_id = (
                SELECT facebook_page_id FROM competitors WHERE id = $1
            );
        `;

        const result = await this.pool.query(query, [competitorId]);

        return result.rows.map(row => row.ad_library_id);
    }

    /**
     * Save a template
     *
     * @param {Object} template - Template data
     * @returns {Promise<Object>} Saved template
     */
    async saveTemplate(template) {
        const query = `
            INSERT INTO templates (
                name,
                description,
                source_ad_id,
                copy_template,
                creative_guidelines,
                targeting_recommendations,
                budget_strategy,
                ab_test_variations,
                industry,
                offer_type,
                ad_format,
                created_by,
                is_public
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
        `;

        const values = [
            template.name || `Template from ${template.sourceAdId}`,
            template.description || null,
            template.sourceAdId,
            JSON.stringify(template.copyTemplate || {}),
            JSON.stringify(template.creativeGuidelines || {}),
            JSON.stringify(template.targetingRecommendations || {}),
            JSON.stringify(template.budgetStrategy || {}),
            JSON.stringify(template.abTestVariations || []),
            template.industry || null,
            template.offerType || null,
            template.adFormat || null,
            template.createdBy || null,
            template.isPublic || false
        ];

        const result = await this.pool.query(query, values);

        return result.rows[0];
    }

    /**
     * Execute raw SQL query (for complex operations)
     *
     * @param {string} query - SQL query
     * @param {Array} values - Query parameters
     * @returns {Promise<Object>} Query result
     */
    async executeQuery(query, values = []) {
        return await this.pool.query(query, values);
    }

    /**
     * Begin transaction
     *
     * @returns {Promise<Object>} Database client with transaction
     */
    async beginTransaction() {
        const client = await this.pool.connect();
        await client.query('BEGIN');
        return client;
    }

    /**
     * Commit transaction
     *
     * @param {Object} client - Database client
     */
    async commitTransaction(client) {
        await client.query('COMMIT');
        client.release();
    }

    /**
     * Rollback transaction
     *
     * @param {Object} client - Database client
     */
    async rollbackTransaction(client) {
        await client.query('ROLLBACK');
        client.release();
    }

    /**
     * Shutdown agent and close connection pool
     */
    async shutdown() {
        try {
            console.log(`🛑 Shutting down Database Coordinator Agent...`);

            if (this.pool) {
                await this.pool.end();
            }

            console.log(`✅ Database Coordinator Agent shutdown complete`);

        } catch (error) {
            console.error(`❌ Shutdown failed:`, error);
        }
    }
}

module.exports = DatabaseCoordinatorAgent;
