/**
 * Apify Review Extractor Agent
 * Integrates with Apify's Google Maps Reviews Scraper for comprehensive review extraction
 * Bypasses Google's 5-review API limitation
 */

const { EventEmitter } = require('events');
const https = require('https');

class ApifyReviewExtractorAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'apify-review-extractor';
        this.isInitialized = false;
        this.config = null;
        this.baseUrl = 'https://api.apify.com/v2';
        this.actorId = 'compass/google-maps-reviews-scraper';
        this.actorMapsId = 'compass/crawler-google-places';
    }

    async initialize(config) {
        try {
            this.config = config;
            this.apiToken = process.env.APIFY_API_TOKEN;

            if (!this.apiToken) {
                console.log('⚠️ No Apify API token found, using mock data mode');
            }

            this.isInitialized = true;
            console.log(`✅ Apify Review Extractor Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize Apify Review Extractor Agent:`, error);
            throw error;
        }
    }

    async extractReviewsFromBusinesses(businesses, criteria = {}) {
        try {
            console.log(`🔍 Extracting reviews from ${businesses.length} businesses via Apify`);

            const allReviews = [];

            for (const business of businesses) {
                try {
                    // First, find the Google Maps data for this business
                    const googleMapsData = await this.findGoogleMapsData(business);

                    if (googleMapsData) {
                        // Extract reviews using the Google Maps data
                        const reviews = await this.extractBusinessReviews(googleMapsData, criteria);
                        allReviews.push(...reviews);

                        console.log(`✅ Found ${reviews.length} reviews for ${business.name}`);
                    } else {
                        console.log(`⚠️ Could not find Google Maps data for ${business.name}`);
                    }

                    // Rate limiting to respect Apify and Google's guidelines
                    await this.delay(2000);

                } catch (error) {
                    console.error(`❌ Error extracting reviews for ${business.name}:`, error);
                }
            }

            // Filter reviews based on criteria
            const filteredReviews = this.filterReviews(allReviews, criteria);

            console.log(`✅ Total reviews extracted: ${allReviews.length}, filtered: ${filteredReviews.length}`);

            this.emit('reviews-extracted', filteredReviews);
            return filteredReviews;

        } catch (error) {
            console.error(`❌ Failed to extract reviews:`, error);
            return this.generateMockReviews(businesses, criteria);
        }
    }

    async findGoogleMapsData(business) {
        try {
            if (!this.apiToken) {
                return this.generateMockGoogleMapsData(business);
            }

            const input = {
                searchQuery: business.searchQuery || `${business.name} ${business.address} ${business.city}`,
                maxItems: 1,
                language: 'nl',
                country: 'NL'
            };

            const runId = await this.runApifyActor(this.actorMapsId, input);
            const results = await this.getApifyResults(runId);

            if (results && results.length > 0) {
                const result = results[0];
                return {
                    placeId: result.placeId,
                    url: result.url,
                    name: result.title,
                    rating: result.totalScore,
                    reviewsCount: result.reviewsCount,
                    address: result.address,
                    phone: result.phone,
                    website: result.website,
                    cid: result.cid
                };
            }

            return null;

        } catch (error) {
            console.error(`❌ Error finding Google Maps data for ${business.name}:`, error);
            return this.generateMockGoogleMapsData(business);
        }
    }

    async extractBusinessReviews(googleMapsData, criteria) {
        try {
            if (!this.apiToken) {
                return this.generateMockBusinessReviews(googleMapsData, criteria);
            }

            const input = {
                placeIds: [googleMapsData.placeId],
                maxReviews: criteria.maxReviews || 100,
                language: 'nl',
                sort: 'newest'
            };

            const runId = await this.runApifyActor(this.actorId, input);
            const results = await this.getApifyResults(runId);

            return this.formatReviews(results, googleMapsData);

        } catch (error) {
            console.error(`❌ Error extracting reviews for ${googleMapsData.name}:`, error);
            return this.generateMockBusinessReviews(googleMapsData, criteria);
        }
    }

    async runApifyActor(actorId, input) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(input);
            const options = {
                hostname: 'api.apify.com',
                port: 443,
                path: `/v2/acts/${actorId}/runs?token=${this.apiToken}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        if (res.statusCode === 201) {
                            resolve(parsed.data.id);
                        } else {
                            reject(new Error(`Apify API error: ${res.statusCode} - ${parsed.error?.message || responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(data);
            req.end();
        });
    }

    async getApifyResults(runId) {
        // Wait for run to complete and get results
        await this.waitForRunCompletion(runId);

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.apify.com',
                port: 443,
                path: `/v2/acts/${this.actorId}/runs/${runId}/dataset/items?token=${this.apiToken}`,
                method: 'GET'
            };

            https.get(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            reject(new Error(`Apify results error: ${res.statusCode} - ${data}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    async waitForRunCompletion(runId, maxWaitTime = 60000) {
        const startTime = Date.now();
        const checkInterval = 3000; // Check every 3 seconds

        while (Date.now() - startTime < maxWaitTime) {
            const status = await this.getRunStatus(runId);

            if (status === 'SUCCEEDED') {
                return true;
            } else if (status === 'FAILED' || status === 'ABORTED') {
                throw new Error(`Apify run ${status.toLowerCase()}: ${runId}`);
            }

            await this.delay(checkInterval);
        }

        throw new Error(`Apify run timeout after ${maxWaitTime}ms: ${runId}`);
    }

    async getRunStatus(runId) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.apify.com',
                port: 443,
                path: `/v2/acts/${this.actorId}/runs/${runId}?token=${this.apiToken}`,
                method: 'GET'
            };

            https.get(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed.data.status);
                        } else {
                            reject(new Error(`Run status error: ${res.statusCode} - ${data}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    formatReviews(rawReviews, businessData) {
        if (!rawReviews || !Array.isArray(rawReviews)) {
            return [];
        }

        return rawReviews.map(review => ({
            id: `apify_${review.reviewId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            businessId: businessData.placeId,
            businessName: businessData.name,
            reviewerName: review.reviewerName || 'Anonymous',
            rating: review.stars || review.rating,
            text: review.text || review.reviewText,
            date: new Date(review.publishedAtDate || review.date),
            source: 'apify_google_maps',
            language: 'nl',
            url: review.reviewUrl,
            likesCount: review.likesCount || 0,
            reviewerTotalReviews: review.reviewerNumberOfReviews || 0,
            businessResponse: review.responseFromOwner || null,
            extractedAt: new Date()
        }));
    }

    filterReviews(reviews, criteria) {
        let filtered = reviews;

        // Filter by rating (1-3 stars for negative reviews)
        if (criteria.maxRating) {
            filtered = filtered.filter(review => review.rating <= criteria.maxRating);
        } else {
            // Default to negative reviews (1-3 stars)
            filtered = filtered.filter(review => review.rating <= 3);
        }

        // Filter by date (last N days)
        if (criteria.dayLimit || criteria.reviewAgeLimit) {
            const dayLimit = criteria.dayLimit || criteria.reviewAgeLimit || 14;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - dayLimit);

            filtered = filtered.filter(review => review.date >= cutoffDate);
        }

        // Filter by minimum text length
        if (criteria.minTextLength) {
            filtered = filtered.filter(review =>
                review.text && review.text.length >= criteria.minTextLength
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => b.date - a.date);

        // Limit results
        if (criteria.limit) {
            filtered = filtered.slice(0, criteria.limit);
        }

        return filtered;
    }

    generateMockGoogleMapsData(business) {
        return {
            placeId: `ChIJ_mock_${business.id}`,
            url: `https://maps.google.com/place/mock_${business.id}`,
            name: business.name,
            rating: 2.1 + Math.random() * 0.8, // Random rating between 2.1-2.9
            reviewsCount: 15 + Math.floor(Math.random() * 25), // 15-40 reviews
            address: business.address,
            phone: business.phone,
            website: business.website,
            cid: `mock_${business.kvkNumber}`
        };
    }

    generateMockBusinessReviews(businessData, criteria) {
        console.log(`🔧 Generating mock reviews for ${businessData.name}`);

        const mockReviews = [
            {
                id: `mock_${businessData.placeId}_001`,
                businessId: businessData.placeId,
                businessName: businessData.name,
                reviewerName: 'Sandra M.',
                rating: 1,
                text: 'Zeer teleurstellende ervaring. Wachttijd van meer dan een uur zonder uitleg. Personeel was onvriendelijk en de behandeling voelde gehaast aan.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                source: 'apify_mock',
                language: 'nl',
                likesCount: 3,
                reviewerTotalReviews: 12,
                extractedAt: new Date()
            },
            {
                id: `mock_${businessData.placeId}_002`,
                businessId: businessData.placeId,
                businessName: businessData.name,
                reviewerName: 'Mark van der Berg',
                rating: 2,
                text: 'Tandarts was technisch wel goed, maar de communicatie was slecht. Geen uitleg over de behandeling en veel te duur voor wat je krijgt.',
                date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
                source: 'apify_mock',
                language: 'nl',
                likesCount: 1,
                reviewerTotalReviews: 5,
                extractedAt: new Date()
            },
            {
                id: `mock_${businessData.placeId}_003`,
                businessId: businessData.placeId,
                businessName: businessData.name,
                reviewerName: 'Lisa K.',
                rating: 2,
                text: 'Praktijk ziet er netjes uit maar de service is ondermaats. Afspraken worden vaak geannuleerd op het laatste moment en assistente was onbeleefd.',
                date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
                source: 'apify_mock',
                language: 'nl',
                likesCount: 7,
                reviewerTotalReviews: 23,
                extractedAt: new Date()
            },
            {
                id: `mock_${businessData.placeId}_004`,
                businessId: businessData.placeId,
                businessName: businessData.name,
                reviewerName: 'Johan S.',
                rating: 1,
                text: 'Absolute ramp. Behandeling ging mis, tandarts gaf mij de schuld. Factuur was veel hoger dan geschat. Zoek een andere tandarts!',
                date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
                source: 'apify_mock',
                language: 'nl',
                likesCount: 5,
                reviewerTotalReviews: 8,
                extractedAt: new Date()
            }
        ];

        return this.filterReviews(mockReviews, criteria);
    }

    generateMockReviews(businesses, criteria) {
        console.log(`🔧 Generating mock reviews for ${businesses.length} businesses`);

        const allReviews = [];

        for (const business of businesses) {
            const googleMapsData = this.generateMockGoogleMapsData(business);
            const businessReviews = this.generateMockBusinessReviews(googleMapsData, criteria);
            allReviews.push(...businessReviews);
        }

        return this.filterReviews(allReviews, criteria);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async shutdown() {
        console.log(`🔄 Shutting down Apify Review Extractor Agent...`);
        this.isInitialized = false;
    }
}

module.exports = new ApifyReviewExtractorAgent();