/**
 * Business Discovery Agent
 * Leverages DataForSEO integration to find businesses with negative reviews
 * Filters by rating thresholds and geographic criteria
 * Phase 2: Database integration for persistent caching
 */

const { EventEmitter } = require('events');
const db = require('../database/db-client');

class BusinessDiscoveryAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'business-discovery';
        this.isInitialized = false;
        this.config = null;
        this.dataForSeoClient = null;
        this.db = db;
    }

    async initialize(config) {
        try {
            this.config = config;

            // Connect to database for persistent caching
            await this.db.connect();
            console.log(`🗄️  Database connected for business discovery`);

            // Import DataForSEO functions from existing MCP integration
            this.dataForSeoClient = {
                searchBusinesses: require('../../../orchestrai-shared/mcp-servers/dataforseo-server.js').businessDataSearch,
                getBusinessInfo: require('../../../orchestrai-shared/mcp-servers/dataforseo-server.js').businessDataInfo,
                getBusinessReviews: require('../../../orchestrai-shared/mcp-servers/dataforseo-server.js').businessDataReviews
            };

            this.isInitialized = true;
            console.log(`✅ Business Discovery Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize Business Discovery Agent:`, error);
            throw error;
        }
    }

    async searchBusinesses(searchCriteria) {
        try {
            if (!this.isInitialized) {
                throw new Error('Agent not initialized');
            }

            console.log(`🔍 Searching for businesses with criteria:`, searchCriteria);

            const {
                keyword,
                location,
                category,
                maxRating = this.config.negativeRatingThreshold,
                limit = 50
            } = searchCriteria;

            // Search for businesses using DataForSEO
            const searchResults = await this.searchWithDataForSEO({
                keyword: keyword || category,
                location_name: location,
                limit: limit * 2 // Get more results to filter
            });

            if (!searchResults || !searchResults.items) {
                console.log(`⚠️ No businesses found for search criteria`);
                return { businesses: [], total: 0 };
            }

            // Filter businesses by rating criteria
            const filteredBusinesses = this.filterBusinessesByRating(searchResults.items, maxRating);

            // Enrich business data with additional information
            const enrichedBusinesses = await this.enrichBusinessData(filteredBusinesses);

            console.log(`📊 Found ${enrichedBusinesses.length} businesses meeting criteria`);

            // Emit event for other agents to process
            this.emit('businesses-found', enrichedBusinesses);

            return {
                businesses: enrichedBusinesses,
                total: enrichedBusinesses.length,
                searchCriteria
            };

        } catch (error) {
            console.error(`❌ Failed to search businesses:`, error);
            throw error;
        }
    }

    async searchWithDataForSEO(params) {
        try {
            // This would integrate with the existing DataForSEO MCP server
            // For now, simulating the API call structure
            const response = await fetch('http://localhost:3000/mcp/dataforseo/business-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.status}`);
            }

            const data = await response.json();
            return data.result?.[0] || { items: [] };

        } catch (error) {
            console.error(`❌ DataForSEO search failed:`, error);

            // Fallback: Return mock data structure for testing
            return {
                items: [
                    {
                        cid: "test_business_123",
                        title: "Test Dental Practice",
                        address: "123 Main St, Amsterdam, Netherlands",
                        category: "Dental clinic",
                        rating: {
                            value: 2.1,
                            votes_count: 45
                        },
                        rating_distribution: {
                            "1": 15,
                            "2": 8,
                            "3": 5,
                            "4": 7,
                            "5": 10
                        },
                        phone: "+31-20-1234567",
                        url: "https://example-dental.nl",
                        place_id: "ChIJtest123",
                        latitude: 52.3676,
                        longitude: 4.9041
                    }
                ]
            };
        }
    }

    filterBusinessesByRating(businesses, maxRating) {
        return businesses.filter(business => {
            const rating = business.rating?.value;

            // Include businesses with ratings at or below threshold
            if (rating && rating <= maxRating) {
                return true;
            }

            // Include businesses with no rating (potential negative reviews not reflected)
            if (!rating && business.rating_distribution) {
                const totalReviews = Object.values(business.rating_distribution).reduce((sum, count) => sum + count, 0);
                const negativeReviews = (business.rating_distribution["1"] || 0) +
                                      (business.rating_distribution["2"] || 0) +
                                      (business.rating_distribution["3"] || 0);

                // Include if >30% negative reviews
                return totalReviews > 0 && (negativeReviews / totalReviews) > 0.3;
            }

            return false;
        });
    }

    async enrichBusinessData(businesses) {
        const enrichedBusinesses = [];

        for (const business of businesses) {
            try {
                // Check if business exists in cache (database)
                const cachedBusiness = await this.db.getBusinessById(business.cid);

                if (cachedBusiness && !this.isCacheExpired(cachedBusiness.cache_expires_at)) {
                    console.log(`📦 Using cached data for: ${cachedBusiness.name}`);

                    // Return cached business with enriched format
                    enrichedBusinesses.push({
                        id: cachedBusiness.id,
                        name: cachedBusiness.name,
                        address: cachedBusiness.address,
                        category: cachedBusiness.category,
                        phone: cachedBusiness.phone,
                        website: cachedBusiness.website,
                        placeId: cachedBusiness.place_id,
                        coordinates: {
                            latitude: cachedBusiness.latitude,
                            longitude: cachedBusiness.longitude
                        },
                        rating: {
                            overall: cachedBusiness.overall_rating,
                            totalReviews: cachedBusiness.total_reviews,
                            distribution: cachedBusiness.rating_distribution
                        },
                        discoveredAt: cachedBusiness.discovered_at,
                        isMonitored: cachedBusiness.is_monitored,
                        negativeReviewPercentage: this.calculateNegativePercentage(cachedBusiness.rating_distribution),
                        riskScore: this.calculateRiskScore(business),
                        fromCache: true
                    });
                    continue;
                }

                // Not in cache or expired - enrich from scratch
                const enrichedBusiness = {
                    // Core business information
                    id: business.cid,
                    name: business.title,
                    address: business.address,
                    category: business.category,
                    phone: business.phone,
                    website: business.url,
                    placeId: business.place_id,

                    // Location data
                    coordinates: {
                        latitude: business.latitude,
                        longitude: business.longitude
                    },

                    // Rating and review data
                    rating: {
                        overall: business.rating?.value || null,
                        totalReviews: business.rating?.votes_count || 0,
                        distribution: business.rating_distribution || {}
                    },

                    // Additional metadata
                    discoveredAt: new Date(),
                    isMonitored: false,

                    // Calculated metrics
                    negativeReviewPercentage: this.calculateNegativePercentage(business.rating_distribution),
                    riskScore: this.calculateRiskScore(business),
                    fromCache: false
                };

                // Upsert to database for future caching
                await this.db.upsertBusiness({
                    id: enrichedBusiness.id,
                    name: enrichedBusiness.name,
                    place_id: enrichedBusiness.placeId,
                    address: enrichedBusiness.address,
                    city: this.extractCity(enrichedBusiness.address),
                    country: this.extractCountry(enrichedBusiness.address),
                    category: enrichedBusiness.category,
                    phone: enrichedBusiness.phone,
                    website: enrichedBusiness.website,
                    latitude: enrichedBusiness.coordinates.latitude,
                    longitude: enrichedBusiness.coordinates.longitude,
                    overall_rating: enrichedBusiness.rating.overall,
                    total_reviews: enrichedBusiness.rating.totalReviews,
                    rating_distribution: enrichedBusiness.rating.distribution
                });

                console.log(`✅ Cached business: ${enrichedBusiness.name}`);
                enrichedBusinesses.push(enrichedBusiness);

            } catch (error) {
                console.error(`⚠️ Failed to enrich business ${business.cid}:`, error);
                // Still include the business with basic data
                enrichedBusinesses.push({
                    id: business.cid,
                    name: business.title,
                    address: business.address,
                    rating: business.rating,
                    discoveredAt: new Date(),
                    enrichmentError: error.message
                });
            }
        }

        return enrichedBusinesses;
    }

    isCacheExpired(cacheExpiresAt) {
        if (!cacheExpiresAt) return true;
        return new Date(cacheExpiresAt) < new Date();
    }

    extractCity(address) {
        if (!address) return null;
        // Simple extraction - assumes format "Street, City, Country"
        const parts = address.split(',');
        return parts.length >= 2 ? parts[parts.length - 2].trim() : null;
    }

    extractCountry(address) {
        if (!address) return null;
        // Simple extraction - assumes format "Street, City, Country"
        const parts = address.split(',');
        return parts.length >= 1 ? parts[parts.length - 1].trim() : null;
    }

    calculateNegativePercentage(distribution) {
        if (!distribution) return 0;

        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return 0;

        const negative = (distribution["1"] || 0) + (distribution["2"] || 0) + (distribution["3"] || 0);
        return Math.round((negative / total) * 100);
    }

    calculateRiskScore(business) {
        let riskScore = 0;

        // Rating-based risk
        const rating = business.rating?.value;
        if (rating) {
            if (rating <= 2) riskScore += 40;
            else if (rating <= 3) riskScore += 25;
            else if (rating <= 3.5) riskScore += 15;
        }

        // Volume-based risk (more reviews = more visibility of problems)
        const reviewCount = business.rating?.votes_count || 0;
        if (reviewCount > 100) riskScore += 20;
        else if (reviewCount > 50) riskScore += 15;
        else if (reviewCount > 20) riskScore += 10;

        // Distribution-based risk
        const negativePercentage = this.calculateNegativePercentage(business.rating_distribution);
        if (negativePercentage > 50) riskScore += 30;
        else if (negativePercentage > 30) riskScore += 20;
        else if (negativePercentage > 20) riskScore += 10;

        return Math.min(riskScore, 100); // Cap at 100
    }

    async getBusinessesByCategory(category, location, limit = 50) {
        return this.searchBusinesses({
            category,
            location,
            limit
        });
    }

    async getBusinessesByLocation(location, radius = '10km', limit = 50) {
        return this.searchBusinesses({
            keyword: 'business',
            location: `${location}, radius:${radius}`,
            limit
        });
    }

    async updateBusinessMonitoringStatus(businessId, isMonitored) {
        try {
            // Update the business monitoring status in database
            await this.db.query(
                'UPDATE businesses SET is_monitored = $1, updated_at = NOW() WHERE id = $2',
                [isMonitored, businessId]
            );

            console.log(`📝 Updated monitoring status for business ${businessId}: ${isMonitored}`);

            this.emit('business-monitoring-updated', {
                businessId,
                isMonitored,
                updatedAt: new Date()
            });

            return { success: true, businessId, isMonitored };
        } catch (error) {
            console.error(`❌ Failed to update business monitoring status:`, error);
            throw error;
        }
    }

    async shutdown() {
        console.log(`🔄 Shutting down Business Discovery Agent...`);
        await this.db.disconnect();
        this.isInitialized = false;
    }
}

module.exports = new BusinessDiscoveryAgent();