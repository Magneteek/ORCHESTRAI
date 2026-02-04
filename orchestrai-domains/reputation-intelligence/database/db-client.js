/**
 * PostgreSQL Database Client for Reputation Intelligence
 * Handles all database operations with connection pooling
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class DatabaseClient {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    /**
     * Initialize database connection
     */
    async connect() {
        try {
            console.log('🔌 Connecting to PostgreSQL database...');

            // Database configuration from environment
            const config = {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'reputation_intelligence',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD,
                max: 20,                    // Maximum pool size
                idleTimeoutMillis: 30000,   // Close idle connections after 30s
                connectionTimeoutMillis: 5000, // Timeout for new connections
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
            };

            // Create connection pool
            this.pool = new Pool(config);

            // Test connection
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();

            this.isConnected = true;
            console.log(`✅ Database connected: ${config.database}@${config.host}:${config.port}`);
            console.log(`   Server time: ${result.rows[0].now}`);

            // Set up error handler
            this.pool.on('error', (err) => {
                console.error('❌ Unexpected database error:', err);
                this.isConnected = false;
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Initialize database schema (run migrations)
     */
    async initializeSchema() {
        try {
            console.log('📋 Initializing database schema...');

            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = await fs.readFile(schemaPath, 'utf-8');

            await this.pool.query(schema);

            console.log('✅ Database schema initialized successfully');
            return { success: true };

        } catch (error) {
            console.error('❌ Failed to initialize schema:', error.message);
            throw error;
        }
    }

    /**
     * Execute raw SQL query
     */
    async query(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        try {
            const result = await this.pool.query(sql, params);
            return result;
        } catch (error) {
            console.error('❌ Query error:', error.message);
            console.error('   SQL:', sql);
            throw error;
        }
    }

    // ========================================================================
    // BUSINESSES TABLE OPERATIONS
    // ========================================================================

    /**
     * Create or update business record
     */
    async upsertBusiness(businessData) {
        const {
            id,
            name,
            address,
            city,
            country = 'NL',
            phone,
            website,
            category,
            place_id,
            cid,
            latitude,
            longitude,
            overall_rating,
            total_reviews,
            rating_distribution,
            cache_expires_at
        } = businessData;

        const sql = `
            INSERT INTO businesses (
                id, name, address, city, country, phone, website, category,
                place_id, cid, latitude, longitude, overall_rating, total_reviews,
                rating_distribution, maps_data_cached, cache_expires_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                address = EXCLUDED.address,
                city = EXCLUDED.city,
                phone = EXCLUDED.phone,
                website = EXCLUDED.website,
                overall_rating = EXCLUDED.overall_rating,
                total_reviews = EXCLUDED.total_reviews,
                rating_distribution = EXCLUDED.rating_distribution,
                updated_at = NOW()
            RETURNING *
        `;

        const params = [
            id, name, address, city, country, phone, website, category,
            place_id, cid, latitude, longitude, overall_rating, total_reviews,
            JSON.stringify(rating_distribution),
            cache_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    /**
     * Get business by ID or Place ID
     */
    async getBusiness(identifier, byPlaceId = false) {
        const column = byPlaceId ? 'place_id' : 'id';
        const sql = `SELECT * FROM businesses WHERE ${column} = $1`;
        const result = await this.query(sql, [identifier]);
        return result.rows[0] || null;
    }

    /**
     * Get cached businesses (not expired)
     */
    async getCachedBusinesses(filters = {}) {
        let sql = `
            SELECT * FROM businesses
            WHERE maps_data_cached = true
              AND cache_expires_at > NOW()
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.city) {
            sql += ` AND city = $${paramIndex++}`;
            params.push(filters.city);
        }

        if (filters.category) {
            sql += ` AND category = $${paramIndex++}`;
            params.push(filters.category);
        }

        if (filters.has_qualifying_reviews !== undefined) {
            sql += ` AND has_qualifying_reviews = $${paramIndex++}`;
            params.push(filters.has_qualifying_reviews);
        }

        sql += ` ORDER BY discovered_at DESC`;

        if (filters.limit) {
            sql += ` LIMIT $${paramIndex++}`;
            params.push(filters.limit);
        }

        const result = await this.query(sql, params);
        return result.rows;
    }

    /**
     * Get businesses needing enrichment
     */
    async getBusinessesNeedingEnrichment(limit = 10) {
        const sql = `
            SELECT * FROM businesses
            WHERE needs_enrichment = true
              AND is_enriched = false
              AND has_qualifying_reviews = true
            ORDER BY qualifying_review_count DESC, discovered_at DESC
            LIMIT $1
        `;

        const result = await this.query(sql, [limit]);
        return result.rows;
    }

    // ========================================================================
    // REVIEWS TABLE OPERATIONS
    // ========================================================================

    /**
     * Create review record
     */
    async createReview(reviewData) {
        const {
            id,
            business_id,
            reviewer_name,
            reviewer_profile_url,
            rating,
            text,
            review_date,
            likes_count = 0,
            reviewer_total_reviews = 0,
            business_response,
            business_response_date,
            is_qualifying = false,
            source = 'apify',
            language = 'nl',
            review_url
        } = reviewData;

        const sql = `
            INSERT INTO reviews (
                id, business_id, reviewer_name, reviewer_profile_url, rating, text,
                review_date, likes_count, reviewer_total_reviews, business_response,
                business_response_date, is_qualifying, text_length, source, language, review_url
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            )
            ON CONFLICT (id) DO UPDATE SET
                text = EXCLUDED.text,
                is_qualifying = EXCLUDED.is_qualifying,
                business_response = EXCLUDED.business_response,
                business_response_date = EXCLUDED.business_response_date
            RETURNING *
        `;

        const params = [
            id, business_id, reviewer_name, reviewer_profile_url, rating, text,
            review_date, likes_count, reviewer_total_reviews, business_response,
            business_response_date, is_qualifying, text?.length || 0, source, language, review_url
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    /**
     * Bulk create reviews (more efficient)
     */
    async bulkCreateReviews(reviews) {
        if (!reviews || reviews.length === 0) return [];

        const results = [];
        for (const review of reviews) {
            try {
                const created = await this.createReview(review);
                results.push(created);
            } catch (error) {
                console.error(`⚠️ Failed to create review ${review.id}:`, error.message);
            }
        }

        return results;
    }

    /**
     * Get qualifying reviews for a business
     */
    async getQualifyingReviews(businessId) {
        const sql = `
            SELECT * FROM reviews
            WHERE business_id = $1
              AND is_qualifying = true
            ORDER BY review_date DESC
        `;

        const result = await this.query(sql, [businessId]);
        return result.rows;
    }

    /**
     * Update review sentiment data
     */
    async updateReviewSentiment(reviewId, sentimentData) {
        const {
            sentiment_score,
            sentiment_label,
            emotion_tags,
            complaint_categories
        } = sentimentData;

        const sql = `
            UPDATE reviews
            SET
                sentiment_score = $2,
                sentiment_label = $3,
                emotion_tags = $4,
                complaint_categories = $5,
                analyzed_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const params = [
            reviewId,
            sentiment_score,
            sentiment_label,
            JSON.stringify(emotion_tags),
            JSON.stringify(complaint_categories)
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    // ========================================================================
    // CONTACT_ENRICHMENTS TABLE OPERATIONS
    // ========================================================================

    /**
     * Create contact enrichment record
     */
    async createEnrichment(enrichmentData) {
        const {
            business_id,
            org_domain,
            org_name,
            org_industry,
            org_employee_count,
            org_revenue,
            org_tech_stack,
            org_description,
            contact_name,
            contact_title,
            contact_email,
            contact_phone,
            contact_linkedin,
            contact_seniority,
            contact_department,
            email_verified = false,
            phone_verified = false,
            quality_score,
            confidence_level,
            data_completeness,
            enrichment_source = 'apollo',
            enrichment_cost_credits,
            api_request_id
        } = enrichmentData;

        const sql = `
            INSERT INTO contact_enrichments (
                business_id, org_domain, org_name, org_industry, org_employee_count,
                org_revenue, org_tech_stack, org_description, contact_name, contact_title,
                contact_email, contact_phone, contact_linkedin, contact_seniority,
                contact_department, email_verified, phone_verified, quality_score,
                confidence_level, data_completeness, enrichment_source,
                enrichment_cost_credits, api_request_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23
            )
            RETURNING *
        `;

        const params = [
            business_id, org_domain, org_name, org_industry, org_employee_count,
            org_revenue, JSON.stringify(org_tech_stack), org_description,
            contact_name, contact_title, contact_email, contact_phone,
            contact_linkedin, contact_seniority, contact_department,
            email_verified, phone_verified, quality_score, confidence_level,
            data_completeness, enrichment_source, enrichment_cost_credits, api_request_id
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    /**
     * Get enrichments for a business
     */
    async getBusinessEnrichments(businessId) {
        const sql = `
            SELECT * FROM contact_enrichments
            WHERE business_id = $1
            ORDER BY quality_score DESC, enriched_at DESC
        `;

        const result = await this.query(sql, [businessId]);
        return result.rows;
    }

    // ========================================================================
    // API COST TRACKING
    // ========================================================================

    /**
     * Track API cost
     */
    async trackAPICost(costData) {
        const {
            operation,
            business_id,
            cost_usd,
            credits_used,
            items_processed = 1,
            api_provider,
            api_request_id,
            status = 'success',
            error_message
        } = costData;

        const sql = `
            INSERT INTO api_cost_tracking (
                operation, business_id, cost_usd, credits_used, items_processed,
                api_provider, api_request_id, status, error_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const params = [
            operation, business_id, cost_usd, credits_used, items_processed,
            api_provider, api_request_id, status, error_message
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    /**
     * Get cost summary
     */
    async getCostSummary(days = 30) {
        const sql = `
            SELECT
                operation,
                api_provider,
                COUNT(*) as total_operations,
                SUM(cost_usd) as total_cost_usd,
                SUM(credits_used) as total_credits,
                SUM(items_processed) as total_items
            FROM api_cost_tracking
            WHERE executed_at >= NOW() - INTERVAL '${days} days'
            GROUP BY operation, api_provider
            ORDER BY total_cost_usd DESC
        `;

        const result = await this.query(sql);
        return result.rows;
    }

    // ========================================================================
    // WORKFLOW EXECUTIONS
    // ========================================================================

    /**
     * Create workflow execution record
     */
    async createWorkflowExecution(workflowData) {
        const {
            workflow_type,
            search_query,
            parameters
        } = workflowData;

        const sql = `
            INSERT INTO workflow_executions (
                workflow_type, search_query, parameters
            ) VALUES ($1, $2, $3)
            RETURNING *
        `;

        const params = [
            workflow_type,
            search_query,
            JSON.stringify(parameters)
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    /**
     * Update workflow execution
     */
    async updateWorkflowExecution(id, updates) {
        const {
            status,
            businesses_processed,
            reviews_extracted,
            enrichments_completed,
            total_cost_usd,
            total_credits_used,
            error_message,
            error_stack
        } = updates;

        const sql = `
            UPDATE workflow_executions
            SET
                status = COALESCE($2, status),
                businesses_processed = COALESCE($3, businesses_processed),
                reviews_extracted = COALESCE($4, reviews_extracted),
                enrichments_completed = COALESCE($5, enrichments_completed),
                total_cost_usd = COALESCE($6, total_cost_usd),
                total_credits_used = COALESCE($7, total_credits_used),
                error_message = COALESCE($8, error_message),
                error_stack = COALESCE($9, error_stack),
                completed_at = CASE WHEN $2 IN ('completed', 'failed', 'partial') THEN NOW() ELSE completed_at END,
                duration_seconds = CASE WHEN $2 IN ('completed', 'failed', 'partial')
                    THEN EXTRACT(EPOCH FROM (NOW() - started_at))::INT
                    ELSE duration_seconds
                END
            WHERE id = $1
            RETURNING *
        `;

        const params = [
            id, status, businesses_processed, reviews_extracted, enrichments_completed,
            total_cost_usd, total_credits_used, error_message, error_stack
        ];

        const result = await this.query(sql, params);
        return result.rows[0];
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const result = await this.query('SELECT 1 as healthy');
            return { healthy: result.rows[0].healthy === 1, connected: this.isConnected };
        } catch (error) {
            return { healthy: false, connected: false, error: error.message };
        }
    }

    /**
     * Get database statistics
     */
    async getStatistics() {
        const sql = `
            SELECT
                (SELECT COUNT(*) FROM businesses) as total_businesses,
                (SELECT COUNT(*) FROM businesses WHERE has_qualifying_reviews = true) as businesses_with_qualifying_reviews,
                (SELECT COUNT(*) FROM businesses WHERE is_enriched = true) as enriched_businesses,
                (SELECT COUNT(*) FROM reviews) as total_reviews,
                (SELECT COUNT(*) FROM reviews WHERE is_qualifying = true) as qualifying_reviews,
                (SELECT COUNT(*) FROM contact_enrichments) as total_enrichments,
                (SELECT COALESCE(SUM(cost_usd), 0) FROM api_cost_tracking) as total_api_cost
        `;

        const result = await this.query(sql);
        return result.rows[0];
    }

    /**
     * Close database connection
     */
    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('🔌 Database connection closed');
        }
    }
}

// Export singleton instance
module.exports = new DatabaseClient();
