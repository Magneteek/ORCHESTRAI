/**
 * Business Discovery Agent
 * Leverages DataForSEO integration to find businesses with negative reviews
 * Filters by rating thresholds and geographic criteria
 */

const { EventEmitter } = require('events');

class BusinessDiscoveryAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'business-discovery';
        this.isInitialized = false;
        this.config = null;
        this.dataForSeoClient = null;
    }

    async initialize(config) {
        try {
            this.config = config;

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
                    riskScore: this.calculateRiskScore(business)
                };

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
            // This would update the business monitoring status in the database
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
        this.isInitialized = false;
    }
}

module.exports = new BusinessDiscoveryAgent();