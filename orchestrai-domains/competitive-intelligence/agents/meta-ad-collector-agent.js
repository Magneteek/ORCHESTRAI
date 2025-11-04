/**
 * Meta Ad Library Collector Agent
 *
 * Infrastructure agent for collecting ads from Meta Ad Library API
 *
 * Responsibilities:
 * - Search ads by keywords and filters
 * - Track specific advertiser pages
 * - Handle API rate limiting and pagination
 * - Transform Meta API responses to internal format
 * - Cache results in Redis for performance
 *
 * Technical Details:
 * - Meta Ad Library API v18.0
 * - Rate limit: 200 requests/hour (configurable)
 * - Geographic coverage: EU (all ads), Global (political/social only)
 * - Data available: Creative, copy, targeting info, dates
 * - Data NOT available: Performance metrics, budgets (except EU political)
 */

const { EventEmitter } = require('events');
const axios = require('axios');

class MetaAdCollectorAgent extends EventEmitter {
    constructor(config = {}) {
        super();

        this.name = 'meta-ad-collector';
        this.isInitialized = false;

        this.config = {
            accessToken: process.env.META_ACCESS_TOKEN,
            apiVersion: process.env.META_API_VERSION || 'v18.0',
            baseUrl: 'https://graph.facebook.com',
            rateLimitPerHour: config.metaApiRateLimitPerHour || 200,
            requestsPerSecond: config.metaApiRequestsPerSecond || 5,
            timeout: 30000,
            retryAttempts: 3,
            retryDelayMs: 2000,
            ...config
        };

        // Rate limiting
        this.requestQueue = [];
        this.requestCount = 0;
        this.rateLimitResetTime = Date.now() + 3600000; // 1 hour from now

        // Redis cache (if available)
        this.redis = null;
        this.cacheTTL = config.redisCacheTTL || 3600; // 1 hour default
    }

    /**
     * Initialize the agent
     */
    async initialize() {
        try {
            console.log(`🔌 Initializing Meta Ad Collector Agent...`);

            // Validate configuration
            if (!this.config.accessToken) {
                throw new Error('META_ACCESS_TOKEN not configured in environment');
            }

            // Initialize Redis if available
            try {
                const redis = require('redis');
                this.redis = redis.createClient({
                    url: process.env.REDIS_URL || 'redis://localhost:6379'
                });
                await this.redis.connect();
                console.log(`  ✅ Redis cache connected`);
            } catch (error) {
                console.warn(`  ⚠️ Redis not available, proceeding without cache`);
                this.redis = null;
            }

            // Start rate limit reset timer
            this.startRateLimitTimer();

            this.isInitialized = true;
            console.log(`✅ Meta Ad Collector Agent initialized`);

            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to initialize Meta Ad Collector Agent:`, error);
            throw error;
        }
    }

    /**
     * Reset rate limit counter every hour
     */
    startRateLimitTimer() {
        setInterval(() => {
            this.requestCount = 0;
            this.rateLimitResetTime = Date.now() + 3600000;
            console.log(`  🔄 Rate limit reset (0/${this.config.rateLimitPerHour} requests)`);
        }, 3600000); // Every hour
    }

    /**
     * Collect ads based on search criteria
     *
     * @param {Object} criteria - Search criteria
     * @param {string[]} criteria.keywords - Keywords to search
     * @param {string[]} criteria.markets - Geographic markets (ISO codes)
     * @param {number} criteria.limit - Max ads to collect
     * @returns {Promise<Array>} Collected ads
     */
    async collectAds(criteria) {
        try {
            if (!this.isInitialized) {
                throw new Error('Agent not initialized');
            }

            const { keywords, markets = ['NL'], limit = 100 } = criteria;

            console.log(`🔍 Collecting ads for keywords: ${keywords.join(', ')}`);
            console.log(`   Markets: ${markets.join(', ')}`);
            console.log(`   Limit: ${limit}`);

            const allAds = [];

            // Search for each keyword
            for (const keyword of keywords) {
                const keywordAds = await this.searchAdsByKeyword(keyword, {
                    markets,
                    limit: Math.ceil(limit / keywords.length)
                });

                allAds.push(...keywordAds);

                // Respect rate limiting between keywords
                await this.delay(1000 / this.config.requestsPerSecond);
            }

            // Remove duplicates
            const uniqueAds = this.deduplicateAds(allAds);

            console.log(`✅ Collected ${uniqueAds.length} unique ads`);

            // Emit event for domain hub
            this.emit('ads-collected', uniqueAds);

            return uniqueAds;

        } catch (error) {
            console.error(`❌ Failed to collect ads:`, error);
            throw error;
        }
    }

    /**
     * Search ads by keyword using Meta Ad Library API
     *
     * @param {string} keyword - Search keyword
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Found ads
     */
    async searchAdsByKeyword(keyword, options = {}) {
        try {
            const { markets = ['NL'], limit = 50 } = options;

            // Check cache first
            const cacheKey = `meta:search:${keyword}:${markets.join(',')}`;
            if (this.redis) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    console.log(`  💾 Cache hit for "${keyword}"`);
                    return JSON.parse(cached);
                }
            }

            // Prepare API request
            const params = {
                access_token: this.config.accessToken,
                search_terms: keyword,
                ad_reached_countries: markets.join(','),
                ad_active_status: 'ALL', // Include both active and inactive
                limit: Math.min(limit, 100), // Meta API max per request
                fields: [
                    'id',
                    'ad_creative_link_captions',
                    'ad_creative_link_descriptions',
                    'ad_creative_link_titles',
                    'ad_creative_bodies',
                    'ad_delivery_start_time',
                    'ad_delivery_stop_time',
                    'ad_snapshot_url',
                    'currency',
                    'page_id',
                    'page_name',
                    'publisher_platforms',
                    'funding_entity',
                    'impressions',
                    'spend'
                ].join(',')
            };

            // Make API request with rate limiting
            const response = await this.makeRateLimitedRequest(
                `/${this.config.apiVersion}/ads_archive`,
                { params }
            );

            // Transform to internal format
            const ads = response.data.data.map(ad => this.transformMetaAd(ad));

            // Cache results
            if (this.redis && ads.length > 0) {
                await this.redis.setEx(cacheKey, this.cacheTTL, JSON.stringify(ads));
            }

            console.log(`  📊 Found ${ads.length} ads for "${keyword}"`);

            return ads;

        } catch (error) {
            console.error(`❌ Search failed for "${keyword}":`, error.message);
            return [];
        }
    }

    /**
     * Get all ads from a specific advertiser page
     *
     * @param {string} pageId - Facebook Page ID
     * @param {Object} options - Options
     * @returns {Promise<Array>} Advertiser's ads
     */
    async getAdvertiserAds(pageId, options = {}) {
        try {
            const { limit = 100 } = options;

            console.log(`🔍 Fetching ads for advertiser page: ${pageId}`);

            // Check cache
            const cacheKey = `meta:advertiser:${pageId}`;
            if (this.redis) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    console.log(`  💾 Cache hit for advertiser ${pageId}`);
                    return JSON.parse(cached);
                }
            }

            const params = {
                access_token: this.config.accessToken,
                search_page_ids: pageId,
                ad_active_status: 'ALL',
                limit: Math.min(limit, 100),
                fields: [
                    'id',
                    'ad_creative_link_captions',
                    'ad_creative_link_descriptions',
                    'ad_creative_link_titles',
                    'ad_creative_bodies',
                    'ad_delivery_start_time',
                    'ad_delivery_stop_time',
                    'ad_snapshot_url',
                    'page_id',
                    'page_name',
                    'publisher_platforms'
                ].join(',')
            };

            const response = await this.makeRateLimitedRequest(
                `/${this.config.apiVersion}/ads_archive`,
                { params }
            );

            const ads = response.data.data.map(ad => this.transformMetaAd(ad));

            // Cache results (shorter TTL for advertiser tracking)
            if (this.redis && ads.length > 0) {
                await this.redis.setEx(cacheKey, 1800, JSON.stringify(ads)); // 30 min cache
            }

            console.log(`  📊 Found ${ads.length} ads for advertiser`);

            return ads;

        } catch (error) {
            console.error(`❌ Failed to get advertiser ads:`, error.message);
            return [];
        }
    }

    /**
     * Make API request with rate limiting and retry logic
     *
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async makeRateLimitedRequest(endpoint, options = {}) {
        // Check rate limit
        if (this.requestCount >= this.config.rateLimitPerHour) {
            const waitTime = this.rateLimitResetTime - Date.now();
            console.warn(`⚠️ Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
            await this.delay(waitTime);
        }

        // Respect requests per second limit
        const delay = 1000 / this.config.requestsPerSecond;
        await this.delay(delay);

        // Make request with retry logic
        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                this.requestCount++;

                const response = await axios({
                    method: 'GET',
                    baseURL: this.config.baseUrl,
                    url: endpoint,
                    timeout: this.config.timeout,
                    ...options
                });

                return response;

            } catch (error) {
                lastError = error;

                if (error.response?.status === 429) {
                    // Rate limit hit
                    console.warn(`  ⚠️ Rate limit hit, attempt ${attempt}/${this.config.retryAttempts}`);
                    await this.delay(this.config.retryDelayMs * attempt);
                    continue;
                }

                if (error.response?.status >= 500) {
                    // Server error, retry
                    console.warn(`  ⚠️ Server error, attempt ${attempt}/${this.config.retryAttempts}`);
                    await this.delay(this.config.retryDelayMs * attempt);
                    continue;
                }

                // Other errors, don't retry
                throw error;
            }
        }

        throw lastError;
    }

    /**
     * Transform Meta API ad response to internal format
     *
     * @param {Object} metaAd - Meta API ad object
     * @returns {Object} Transformed ad
     */
    transformMetaAd(metaAd) {
        return {
            // IDs
            adLibraryId: metaAd.id,
            pageId: metaAd.page_id,

            // Advertiser info
            advertiserName: metaAd.page_name,
            fundingEntity: metaAd.funding_entity,

            // Ad copy
            headline: metaAd.ad_creative_link_titles?.[0] || '',
            primaryText: metaAd.ad_creative_bodies?.[0] || '',
            description: metaAd.ad_creative_link_descriptions?.[0] || '',
            linkCaption: metaAd.ad_creative_link_captions?.[0] || '',

            // Creative
            snapshotUrl: metaAd.ad_snapshot_url,
            creativeUrls: [], // Would be extracted from snapshot

            // Metadata
            platforms: metaAd.publisher_platforms || [],
            startDate: metaAd.ad_delivery_start_time,
            endDate: metaAd.ad_delivery_stop_time,
            isActive: !metaAd.ad_delivery_stop_time,

            // Spend/impressions (only available for certain regions/categories)
            impressions: metaAd.impressions,
            spend: metaAd.spend,
            currency: metaAd.currency,

            // Collection metadata
            dataSource: 'meta',
            collectedAt: new Date(),
            lastSeen: new Date()
        };
    }

    /**
     * Remove duplicate ads from array
     *
     * @param {Array} ads - Ads to deduplicate
     * @returns {Array} Unique ads
     */
    deduplicateAds(ads) {
        const seen = new Set();
        return ads.filter(ad => {
            if (seen.has(ad.adLibraryId)) {
                return false;
            }
            seen.add(ad.adLibraryId);
            return true;
        });
    }

    /**
     * Delay helper
     *
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current rate limit status
     *
     * @returns {Object} Rate limit info
     */
    getRateLimitStatus() {
        return {
            requestsUsed: this.requestCount,
            requestsLimit: this.config.rateLimitPerHour,
            requestsRemaining: this.config.rateLimitPerHour - this.requestCount,
            resetTime: new Date(this.rateLimitResetTime),
            resetIn: Math.max(0, this.rateLimitResetTime - Date.now())
        };
    }

    /**
     * Shutdown agent and cleanup resources
     */
    async shutdown() {
        try {
            console.log(`🛑 Shutting down Meta Ad Collector Agent...`);

            if (this.redis) {
                await this.redis.quit();
            }

            console.log(`✅ Meta Ad Collector Agent shutdown complete`);

        } catch (error) {
            console.error(`❌ Shutdown failed:`, error);
        }
    }
}

module.exports = MetaAdCollectorAgent;
