/**
 * Apify Orchestrator Agent - Full Implementation
 *
 * Infrastructure agent for managing Apify Facebook Ads Scraper actors
 * Handles global market ad scraping (US, Canada, Asia, etc.)
 *
 * Features:
 * - Launch and monitor Apify actors
 * - Fetch and transform results
 * - Handle rate limits and concurrent runs
 * - Integrate with performance scorer
 * - Cache results for efficiency
 */

const { EventEmitter } = require('events');
const axios = require('axios');

class ApifyOrchestratorAgent extends EventEmitter {
    constructor(config = {}) {
        super();

        this.name = 'apify-orchestrator';
        this.isInitialized = false;

        this.config = {
            apiToken: process.env.APIFY_API_TOKEN,
            actorId: config.actorId || process.env.APIFY_FACEBOOK_ACTOR_ID || 'apify/facebook-ads-scraper',
            concurrentActors: config.concurrentActors || parseInt(process.env.APIFY_CONCURRENT_ACTORS || '3'),
            maxRequestsPerRun: config.maxRequestsPerRun || parseInt(process.env.APIFY_MAX_REQUESTS_PER_RUN || '1000'),
            pollingInterval: config.pollingInterval || 10000, // Check run status every 10 seconds
            timeout: config.timeout || 600000, // 10 minute timeout per run
            ...config
        };

        this.apifyClient = null;
        this.activeRuns = new Map(); // Track active actor runs
        this.redis = config.redis || null; // Optional Redis caching
    }

    /**
     * Initialize the agent with Apify client
     */
    async initialize() {
        console.log(`🕷️  Initializing Apify Orchestrator Agent...`);

        if (!this.config.apiToken) {
            console.warn(`⚠️  APIFY_API_TOKEN not configured - Apify integration disabled`);
            console.warn(`   Add APIFY_API_TOKEN to .env to enable global market scraping`);
            this.isInitialized = false;
            return { success: false, reason: 'no_api_token' };
        }

        // Initialize Apify API client (using REST API directly, no SDK required)
        this.apifyClient = {
            baseURL: 'https://api.apify.com/v2',
            token: this.config.apiToken,
            headers: {
                'Authorization': `Bearer ${this.config.apiToken}`,
                'Content-Type': 'application/json'
            }
        };

        // Verify API token
        try {
            await this.verifyToken();
            this.isInitialized = true;
            console.log(`✅ Apify Orchestrator Agent initialized successfully`);
            console.log(`   Concurrent actors: ${this.config.concurrentActors}`);
            console.log(`   Max requests per run: ${this.config.maxRequestsPerRun}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to initialize Apify: ${error.message}`);
            this.isInitialized = false;
            return { success: false, reason: error.message };
        }
    }

    /**
     * Verify Apify API token
     */
    async verifyToken() {
        const response = await axios.get(`${this.apifyClient.baseURL}/users/me`, {
            headers: this.apifyClient.headers
        });

        if (response.status !== 200) {
            throw new Error('Invalid Apify API token');
        }

        console.log(`   Apify account: ${response.data.data.username}`);
        return response.data.data;
    }

    /**
     * Scrape Facebook/Instagram ads using Apify
     *
     * @param {Object} criteria - Scraping criteria
     * @param {Array} criteria.keywords - Search keywords
     * @param {Array} criteria.markets - Target markets (e.g., ['US', 'CA'])
     * @param {Number} criteria.limit - Max ads to collect
     * @param {String} criteria.industry - Industry classification
     * @returns {Promise<Array>} Scraped ads
     */
    async scrapeAds(criteria) {
        if (!this.isInitialized) {
            console.warn(`⚠️  Apify not initialized - skipping scraping`);
            return [];
        }

        console.log(`🕷️  Starting Apify scraping...`);
        console.log(`   Keywords: ${criteria.keywords?.join(', ')}`);
        console.log(`   Markets: ${criteria.markets?.join(', ')}`);
        console.log(`   Limit: ${criteria.limit || 'default'}`);

        try {
            // Check cache first
            if (this.redis && criteria.keywords) {
                const cacheKey = `apify:${criteria.keywords.join(',')}:${criteria.markets?.join(',') || 'all'}`;
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    console.log(`✅ Retrieved ${JSON.parse(cached).length} ads from cache`);
                    return JSON.parse(cached);
                }
            }

            // Launch Apify actor
            const runId = await this.launchActor(criteria);

            // Monitor actor run
            const results = await this.monitorRun(runId);

            // Transform results to internal format
            const transformedAds = results.map(ad => this.transformApifyAd(ad, criteria.industry));

            // Cache results
            if (this.redis && criteria.keywords) {
                const cacheKey = `apify:${criteria.keywords.join(',')}:${criteria.markets?.join(',') || 'all'}`;
                await this.redis.setEx(cacheKey, 3600, JSON.stringify(transformedAds)); // 1 hour cache
            }

            console.log(`✅ Apify scraping complete: ${transformedAds.length} ads collected`);
            this.emit('scraping-complete', transformedAds);

            return transformedAds;

        } catch (error) {
            console.error(`❌ Apify scraping failed: ${error.message}`);
            this.emit('scraping-error', error);
            return [];
        }
    }

    /**
     * Launch Apify actor with specified input
     */
    async launchActor(criteria) {
        console.log(`🚀 Launching Apify actor: ${this.config.actorId}`);

        // Build actor input based on Facebook Ads Scraper requirements
        const actorInput = {
            searchQueries: criteria.keywords || [],
            countries: criteria.markets || ['US'], // Default to US if not specified
            maxItems: criteria.limit || this.config.maxRequestsPerRun,
            proxyConfiguration: {
                useApifyProxy: true
            },
            // Additional scraper-specific options
            includeImages: true,
            includeVideos: true,
            includeText: true,
            maxConcurrency: this.config.concurrentActors
        };

        const response = await axios.post(
            `${this.apifyClient.baseURL}/acts/${this.config.actorId}/runs`,
            actorInput,
            { headers: this.apifyClient.headers }
        );

        const runId = response.data.data.id;
        const runStatus = response.data.data.status;

        console.log(`   Run ID: ${runId}`);
        console.log(`   Status: ${runStatus}`);

        this.activeRuns.set(runId, {
            startTime: Date.now(),
            criteria,
            status: runStatus
        });

        return runId;
    }

    /**
     * Monitor actor run until completion
     */
    async monitorRun(runId) {
        console.log(`⏳ Monitoring actor run: ${runId}`);

        const startTime = Date.now();
        let attempts = 0;

        while (true) {
            attempts++;

            // Check timeout
            if (Date.now() - startTime > this.config.timeout) {
                throw new Error(`Actor run timeout after ${this.config.timeout}ms`);
            }

            // Get run status
            const response = await axios.get(
                `${this.apifyClient.baseURL}/actor-runs/${runId}`,
                { headers: this.apifyClient.headers }
            );

            const status = response.data.data.status;
            const stats = response.data.data.stats;

            console.log(`   Status: ${status} (attempt ${attempts})`);
            if (stats) {
                console.log(`   Progress: ${stats.requestsFinished}/${stats.requestsTotal} requests`);
            }

            // Check if run completed
            if (status === 'SUCCEEDED') {
                console.log(`✅ Actor run completed successfully`);
                return await this.fetchResults(runId);
            }

            if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
                throw new Error(`Actor run ${status}: ${response.data.data.statusMessage || 'Unknown error'}`);
            }

            // Wait before next check
            await this.sleep(this.config.pollingInterval);
        }
    }

    /**
     * Fetch results from completed actor run
     */
    async fetchResults(runId) {
        console.log(`📥 Fetching results from run: ${runId}`);

        // Get default dataset ID from run
        const runResponse = await axios.get(
            `${this.apifyClient.baseURL}/actor-runs/${runId}`,
            { headers: this.apifyClient.headers }
        );

        const datasetId = runResponse.data.data.defaultDatasetId;

        if (!datasetId) {
            console.warn(`⚠️  No dataset found for run ${runId}`);
            return [];
        }

        // Fetch dataset items
        const datasetResponse = await axios.get(
            `${this.apifyClient.baseURL}/datasets/${datasetId}/items`,
            { headers: this.apifyClient.headers }
        );

        const items = datasetResponse.data;
        console.log(`   Retrieved ${items.length} items from dataset`);

        this.activeRuns.delete(runId);

        return items;
    }

    /**
     * Transform Apify ad data to internal format
     */
    transformApifyAd(apifyAd, industry) {
        // Apify Facebook Ads Scraper returns different format than Meta Ad Library
        // Transform to match internal schema

        return {
            // Source identifiers
            adLibraryId: apifyAd.id || `apify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: 'apify',
            dataSource: 'facebook_scraper',

            // Advertiser info
            advertiserName: apifyAd.advertiserName || apifyAd.pageName || 'Unknown Advertiser',
            advertiserPageId: apifyAd.pageId || null,
            advertiserVerified: apifyAd.isVerified || false,

            // Ad content
            headline: apifyAd.headline || apifyAd.title || null,
            primaryText: apifyAd.body || apifyAd.text || apifyAd.description || null,
            linkDescription: apifyAd.linkDescription || null,
            ctaType: apifyAd.callToAction || this.extractCTA(apifyAd.body),

            // Creative assets
            creativeUrls: this.extractCreativeUrls(apifyAd),
            creativeType: this.detectCreativeType(apifyAd),

            // Metadata
            industry: industry || 'unknown',
            subIndustry: null,
            markets: apifyAd.countries || [],

            // Dates (Apify may not have all date data)
            startDate: apifyAd.startDate || new Date().toISOString(),
            endDate: apifyAd.endDate || null,
            firstSeenDate: new Date().toISOString(),
            lastSeenDate: new Date().toISOString(),
            isActive: apifyAd.isActive !== undefined ? apifyAd.isActive : true,

            // Platform
            platform: apifyAd.platform || 'facebook',
            placements: apifyAd.placements || ['feed'],

            // Additional data
            targetingData: apifyAd.targeting || {},
            impressions: apifyAd.impressions || null,
            spend: apifyAd.spend || null,

            // Raw data for reference
            rawData: apifyAd
        };
    }

    /**
     * Extract creative URLs from Apify ad data
     */
    extractCreativeUrls(apifyAd) {
        const urls = [];

        if (apifyAd.imageUrl) urls.push(apifyAd.imageUrl);
        if (apifyAd.videoUrl) urls.push(apifyAd.videoUrl);
        if (apifyAd.images && Array.isArray(apifyAd.images)) {
            urls.push(...apifyAd.images);
        }
        if (apifyAd.videos && Array.isArray(apifyAd.videos)) {
            urls.push(...apifyAd.videos);
        }
        if (apifyAd.media && Array.isArray(apifyAd.media)) {
            urls.push(...apifyAd.media.map(m => m.url).filter(Boolean));
        }

        return urls;
    }

    /**
     * Detect creative type from ad data
     */
    detectCreativeType(apifyAd) {
        if (apifyAd.videoUrl || (apifyAd.videos && apifyAd.videos.length > 0)) {
            return 'video';
        }
        if (apifyAd.images && apifyAd.images.length > 1) {
            return 'carousel';
        }
        if (apifyAd.imageUrl || (apifyAd.images && apifyAd.images.length > 0)) {
            return 'image';
        }
        return 'text';
    }

    /**
     * Extract CTA from ad body text
     */
    extractCTA(text) {
        if (!text) return null;

        const ctaPatterns = [
            { pattern: /learn more/i, cta: 'LEARN_MORE' },
            { pattern: /sign up/i, cta: 'SIGN_UP' },
            { pattern: /shop now/i, cta: 'SHOP_NOW' },
            { pattern: /book now/i, cta: 'BOOK_NOW' },
            { pattern: /get quote/i, cta: 'GET_QUOTE' },
            { pattern: /contact us/i, cta: 'CONTACT_US' },
            { pattern: /download/i, cta: 'DOWNLOAD' },
            { pattern: /watch/i, cta: 'WATCH_VIDEO' }
        ];

        for (const { pattern, cta } of ctaPatterns) {
            if (pattern.test(text)) {
                return cta;
            }
        }

        return null;
    }

    /**
     * Get active runs status
     */
    getActiveRuns() {
        const runs = [];
        for (const [runId, runData] of this.activeRuns) {
            runs.push({
                runId,
                status: runData.status,
                duration: Date.now() - runData.startTime,
                criteria: runData.criteria
            });
        }
        return runs;
    }

    /**
     * Cancel an active run
     */
    async cancelRun(runId) {
        console.log(`🛑 Cancelling actor run: ${runId}`);

        try {
            await axios.post(
                `${this.apifyClient.baseURL}/actor-runs/${runId}/abort`,
                {},
                { headers: this.apifyClient.headers }
            );

            this.activeRuns.delete(runId);
            console.log(`✅ Run cancelled successfully`);
            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to cancel run: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Utility: Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Shutdown agent
     */
    async shutdown() {
        console.log(`🛑 Shutting down Apify Orchestrator Agent...`);

        // Cancel any active runs
        const activeRunIds = Array.from(this.activeRuns.keys());
        if (activeRunIds.length > 0) {
            console.log(`   Cancelling ${activeRunIds.length} active runs...`);
            await Promise.all(activeRunIds.map(runId => this.cancelRun(runId)));
        }

        this.isInitialized = false;
        console.log(`✅ Apify Orchestrator Agent shutdown complete`);
    }
}

module.exports = ApifyOrchestratorAgent;
