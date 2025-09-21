/**
 * Universal Business Review Extractor
 * Standardized system for extracting negative reviews from any business category
 * Works with restaurants, hotels, clinics, retail stores, services, etc.
 *
 * Enhanced with LinkedIn Executive Email Extraction
 */

const https = require('https');
const { LinkedInExecutiveEmailExtractor } = require('./linkedin-executive-email-extractor');

class UniversalBusinessReviewExtractor {
    constructor() {
        this.apiToken = process.env.APIFY_API_TOKEN || 'apify_api_3YRIamVzIDjyqr948CnIW52ciuZ3cn2rttUe';
        this.baseUrl = 'https://api.apify.com/v2';
        this.actorMapsId = 'compass~crawler-google-places';
        this.actorReviewsId = 'compass~google-maps-reviews-scraper';

        // Initialize LinkedIn extractor
        this.linkedinExtractor = new LinkedInExecutiveEmailExtractor();
    }

    async extractBusinessReviews(searchCriteria) {
        try {
            console.log(`🚀 Universal Business Review Extraction`);
            console.log(`Category: ${searchCriteria.category}`);
            console.log(`Location: ${searchCriteria.location}`);
            console.log(`=======================================\n`);

            // Step 1: Find businesses
            console.log(`🔍 STEP 1: Finding ${searchCriteria.category} businesses`);
            console.log(`================================================`);

            const businesses = await this.findBusinesses(searchCriteria);
            console.log(`✅ Found ${businesses.length} businesses`);

            // Step 2: Extract reviews
            console.log(`\n🔍 STEP 2: Extracting Reviews`);
            console.log(`=============================`);

            const targetBusinesses = businesses
                .filter(business =>
                    business.totalScore &&
                    business.totalScore <= (searchCriteria.maxRating || 4.6) &&
                    business.reviewsCount > (searchCriteria.minReviews || 10)
                )
                .slice(0, searchCriteria.businessLimit || 5);

            console.log(`🎯 Targeting ${targetBusinesses.length} businesses for review extraction`);

            const allReviews = [];
            for (const business of targetBusinesses) {
                try {
                    console.log(`\n📍 Extracting from: ${business.title}`);
                    const reviews = await this.extractReviewsFromBusiness(business, searchCriteria);
                    const negativeReviews = reviews.filter(review =>
                        review.stars <= (searchCriteria.maxStars || 3)
                    );

                    console.log(`   ✅ Found ${reviews.length} total, ${negativeReviews.length} negative`);
                    allReviews.push(...negativeReviews);

                    await this.delay(3000); // Rate limiting
                } catch (error) {
                    console.log(`   ❌ Error: ${error.message}`);
                }
            }

            // Step 3: Filter and format results
            const filteredReviews = this.filterAndFormatReviews(allReviews, searchCriteria);

            // Step 4: Generate standardized output
            this.generateStandardizedReport(filteredReviews, businesses, searchCriteria);

            return {
                businesses,
                reviews: filteredReviews,
                searchCriteria,
                extractionDate: new Date(),
                linkedinEnrichmentAvailable: true
            };

        } catch (error) {
            console.error(`❌ Extraction failed:`, error);
            throw error;
        }
    }

    async findBusinesses(searchCriteria) {
        const searchQueries = this.generateSearchQueries(searchCriteria);
        const allBusinesses = [];

        for (const query of searchQueries) {
            try {
                console.log(`   Searching: "${query}"`);
                const businesses = await this.searchGoogleMaps(query, searchCriteria.resultsPerQuery || 5);
                allBusinesses.push(...businesses);
                console.log(`   Found ${businesses.length} results`);
                await this.delay(2000);
            } catch (error) {
                console.log(`   ❌ Search failed: ${error.message}`);
            }
        }

        // Remove duplicates
        const uniqueBusinesses = allBusinesses.filter((business, index, self) =>
            index === self.findIndex(b => b.placeId === business.placeId)
        );

        return uniqueBusinesses;
    }

    generateSearchQueries(criteria) {
        const { category, location, language = 'en' } = criteria;

        // Multi-language search queries for better coverage
        const queries = [];

        if (language === 'nl' || location.toLowerCase().includes('netherlands')) {
            queries.push(
                `${category} ${location}`,
                `${category} Nederland`,
                `${category} Dutch`,
                `beste ${category} ${location}`
            );
        } else {
            queries.push(
                `${category} ${location}`,
                `${category} near ${location}`,
                `best ${category} ${location}`,
                `top ${category} ${location}`
            );
        }

        return queries.slice(0, criteria.maxQueries || 4);
    }

    async searchGoogleMaps(query, maxItems = 10) {
        const input = {
            searchStringsArray: [query],
            maxCrawledPlacesPerSearch: maxItems,
            language: 'nl',
            countryCode: 'nl',
            includeImages: false,
            includeReviews: false
        };

        const runId = await this.runApifyActor(this.actorMapsId, input);
        const results = await this.getApifyResults(runId, this.actorMapsId);
        return results || [];
    }

    async extractReviewsFromBusiness(business, criteria) {
        if (!business.placeId) {
            throw new Error('No place ID available');
        }

        const input = {
            placeIds: [business.placeId],
            maxReviews: criteria.maxReviewsPerBusiness || 50,
            language: criteria.language || 'nl',
            sort: 'newest'
        };

        const runId = await this.runApifyActor(this.actorReviewsId, input);
        const results = await this.getApifyResults(runId, this.actorReviewsId);
        return results || [];
    }

    filterAndFormatReviews(reviews, criteria) {
        let filtered = reviews;

        // Filter by rating
        if (criteria.maxStars) {
            filtered = filtered.filter(review => review.stars <= criteria.maxStars);
        }

        // Filter by date
        if (criteria.dayLimit) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - criteria.dayLimit);
            filtered = filtered.filter(review =>
                new Date(review.publishedAtDate) >= cutoffDate
            );
        }

        // Filter by minimum text length
        if (criteria.minTextLength) {
            filtered = filtered.filter(review =>
                review.text && review.text.length >= criteria.minTextLength
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.publishedAtDate) - new Date(a.publishedAtDate));

        // Limit results
        if (criteria.reviewLimit) {
            filtered = filtered.slice(0, criteria.reviewLimit);
        }

        return filtered;
    }

    generateStandardizedReport(reviews, businesses, criteria) {
        console.log(`\n📊 STANDARDIZED REVIEW EXTRACTION REPORT`);
        console.log(`========================================`);
        console.log(`Category: ${criteria.category}`);
        console.log(`Location: ${criteria.location}`);
        console.log(`Extraction Date: ${new Date().toLocaleDateString()}`);
        console.log(`\n📈 SUMMARY STATISTICS:`);
        console.log(`• Businesses Found: ${businesses.length}`);
        console.log(`• Negative Reviews: ${reviews.length}`);
        console.log(`• Rating Filter: ≤${criteria.maxStars || 3} stars`);
        console.log(`• Time Range: Last ${criteria.dayLimit || 30} days`);
        console.log(`\n📋 REVIEW LIST:`);
        console.log(`==============`);

        if (reviews.length === 0) {
            console.log(`⚠️ No reviews found matching criteria`);
            return;
        }

        reviews.forEach((review, index) => {
            const reviewDate = new Date(review.publishedAtDate);
            const daysAgo = Math.floor((new Date() - reviewDate) / (1000 * 60 * 60 * 24));

            console.log(`\n${index + 1}. ═══════════════════════════════════════`);
            console.log(`Business: ${review.title || 'Unknown'}`);
            console.log(`Address: ${review.address || 'Not provided'}`);
            console.log(`Reviewer: ${review.name || 'Anonymous'}`);
            console.log(`Rating: ${review.stars}/5 ⭐`);
            console.log(`Date: ${reviewDate.toLocaleDateString()} (${daysAgo} days ago)`);
            console.log(`Reviewer Stats: ${review.reviewerNumberOfReviews || 0} reviews, Local Guide: ${review.isLocalGuide ? 'Yes' : 'No'}`);
            console.log(`Language: ${review.originalLanguage || 'Unknown'}`);
            console.log(`\nReview Text:`);
            console.log(`"${review.text || 'No text provided'}"`);
            console.log(`\nDirect Review URL:`);
            console.log(`${review.reviewUrl || 'Not available'}`);
            console.log(`\nReviewer Profile:`);
            console.log(`${review.reviewerUrl || 'Not available'}`);
            console.log(`\nBusiness Profile:`);
            console.log(`${review.url || 'Not available'}`);
        });

        console.log(`\n🎯 EXTRACTION COMPLETE!`);
        console.log(`Found ${reviews.length} negative reviews for ${criteria.category} in ${criteria.location}`);
    }

    // Apify API helper methods
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
                res.on('data', (chunk) => { responseData += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        if (res.statusCode === 201) {
                            resolve(parsed.data.id);
                        } else {
                            reject(new Error(`Apify API error: ${res.statusCode}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => reject(error));
            req.write(data);
            req.end();
        });
    }

    async getApifyResults(runId, actorId) {
        await this.waitForRunCompletion(runId, actorId);
        const runDetails = await this.getRunDetails(runId, actorId);
        const datasetId = runDetails.defaultDatasetId;

        if (!datasetId) {
            throw new Error('No dataset ID found');
        }

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.apify.com',
                port: 443,
                path: `/v2/datasets/${datasetId}/items?token=${this.apiToken}`,
                method: 'GET'
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            reject(new Error(`Results error: ${res.statusCode}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            }).on('error', (error) => reject(error));
        });
    }

    async getRunDetails(runId, actorId) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.apify.com',
                port: 443,
                path: `/v2/acts/${actorId}/runs/${runId}?token=${this.apiToken}`,
                method: 'GET'
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed.data);
                        } else {
                            reject(new Error(`Run details error: ${res.statusCode}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            }).on('error', (error) => reject(error));
        });
    }

    async waitForRunCompletion(runId, actorId, maxWaitTime = 120000) {
        const startTime = Date.now();
        const checkInterval = 5000;

        while (Date.now() - startTime < maxWaitTime) {
            const status = await this.getRunStatus(runId, actorId);
            if (status === 'SUCCEEDED') return true;
            if (status === 'FAILED' || status === 'ABORTED') {
                throw new Error(`Run ${status.toLowerCase()}: ${runId}`);
            }
            await this.delay(checkInterval);
        }
        throw new Error(`Run timeout: ${runId}`);
    }

    async getRunStatus(runId, actorId) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.apify.com',
                port: 443,
                path: `/v2/acts/${actorId}/runs/${runId}?token=${this.apiToken}`,
                method: 'GET'
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed.data.status);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => reject(error));
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enrich businesses with LinkedIn executive emails
     * This is the game-changer that finds 10-15x more executive emails
     */
    async enrichWithLinkedInExecutives(businesses, options = {}) {
        console.log(`\n🔗 LINKEDIN EXECUTIVE EMAIL ENRICHMENT`);
        console.log(`======================================`);
        console.log(`Enriching ${businesses.length} businesses with executive emails...`);

        const {
            maxBusinesses = 5,
            includePhones = true,
            prioritizeEmails = true
        } = options;

        const businessesToEnrich = businesses.slice(0, maxBusinesses);
        const enrichedBusinesses = [];

        for (const business of businessesToEnrich) {
            try {
                console.log(`\n🎯 Finding executives for: ${business.title}`);

                // Prepare business data for LinkedIn search
                const linkedinSearchData = {
                    name: business.title,
                    location: business.address || business.location,
                    industry: this.detectIndustry(business.title)
                };

                // Extract executives using LinkedIn
                const linkedinResult = await this.linkedinExtractor.findExecutiveEmails(linkedinSearchData);

                // Combine original business data with LinkedIn findings
                const enrichedBusiness = {
                    ...business,
                    // Original contact info
                    originalEmail: business.email,
                    originalPhone: business.phone,
                    originalWebsite: business.website,

                    // LinkedIn executive data
                    linkedinExecutives: linkedinResult.executives,
                    linkedinEmailsFound: linkedinResult.emailsFound,
                    linkedinTotalFound: linkedinResult.totalFound,
                    linkedinEnrichmentDate: new Date(),

                    // Best executive email (highest relevance score)
                    executiveEmail: linkedinResult.executives.find(exec => exec.email)?.email || business.email,
                    executivePhone: linkedinResult.executives.find(exec => exec.phone)?.phone || business.phone,
                    executiveName: linkedinResult.executives.find(exec => exec.email)?.name,
                    executiveTitle: linkedinResult.executives.find(exec => exec.email)?.title,

                    // Enhanced flags
                    linkedinEnriched: true,
                    hasExecutiveEmail: linkedinResult.emailsFound > 0,
                    emailImprovement: linkedinResult.emailsFound > (business.email ? 1 : 0)
                };

                enrichedBusinesses.push(enrichedBusiness);

                console.log(`   ✅ Found ${linkedinResult.emailsFound} executive emails, ${linkedinResult.totalFound} total executives`);

                // Rate limiting for LinkedIn API
                await this.delay(4000);

            } catch (error) {
                console.log(`   ❌ LinkedIn enrichment failed: ${error.message}`);
                // Keep original business data if LinkedIn fails
                enrichedBusinesses.push({
                    ...business,
                    linkedinEnriched: false,
                    linkedinError: error.message
                });
            }
        }

        // Generate enrichment summary
        const summary = this.generateEnrichmentSummary(businesses, enrichedBusinesses);

        return {
            originalBusinesses: businesses,
            enrichedBusinesses,
            enrichmentSummary: summary,
            enrichmentDate: new Date()
        };
    }

    detectIndustry(businessName) {
        const name = businessName.toLowerCase();
        if (name.includes('hotel') || name.includes('resort')) return 'hospitality';
        if (name.includes('restaurant') || name.includes('cafe') || name.includes('bar')) return 'food service';
        if (name.includes('tandarts') || name.includes('dental') || name.includes('clinic')) return 'healthcare';
        if (name.includes('retail') || name.includes('shop') || name.includes('store')) return 'retail';
        return 'business services';
    }

    generateEnrichmentSummary(original, enriched) {
        const originalEmails = original.filter(b => b.email).length;
        const enrichedEmails = enriched.filter(b => b.hasExecutiveEmail).length;
        const improvementCount = enriched.filter(b => b.emailImprovement).length;

        const summary = {
            totalBusinesses: original.length,
            originalEmailCount: originalEmails,
            enrichedEmailCount: enrichedEmails,
            newExecutiveEmails: improvementCount,
            improvementRatio: originalEmails > 0 ? Math.round((enrichedEmails / originalEmails) * 100) : 0,
            successRate: Math.round((enrichedEmails / enriched.length) * 100),
            avgExecutivesPerBusiness: Math.round(enriched.reduce((acc, b) => acc + (b.linkedinTotalFound || 0), 0) / enriched.length),
            costEstimate: enriched.length * 0.05 // Rough estimate: $0.05 per business for LinkedIn searches
        };

        console.log(`\n📊 LINKEDIN ENRICHMENT SUMMARY:`);
        console.log(`================================`);
        console.log(`• Original Email Count: ${summary.originalEmailCount}`);
        console.log(`• Enriched Email Count: ${summary.enrichedEmailCount}`);
        console.log(`• New Executive Emails: ${summary.newExecutiveEmails}`);
        console.log(`• Improvement Ratio: ${summary.improvementRatio}%`);
        console.log(`• Success Rate: ${summary.successRate}%`);
        console.log(`• Avg Executives per Business: ${summary.avgExecutivesPerBusiness}`);
        console.log(`• Estimated Cost: $${summary.costEstimate.toFixed(2)}`);

        return summary;
    }
}

// Example usage functions for different business categories
async function extractRestaurantReviews(location = 'Amsterdam, Netherlands') {
    const extractor = new UniversalBusinessReviewExtractor();
    return await extractor.extractBusinessReviews({
        category: 'restaurant',
        location: location,
        maxRating: 4.0,
        maxStars: 3,
        dayLimit: 30,
        businessLimit: 5,
        reviewLimit: 10,
        language: 'nl'
    });
}

async function extractHotelReviews(location = 'Amsterdam, Netherlands') {
    const extractor = new UniversalBusinessReviewExtractor();
    return await extractor.extractBusinessReviews({
        category: 'hotel',
        location: location,
        maxRating: 4.2,
        maxStars: 3,
        dayLimit: 21,
        businessLimit: 3,
        reviewLimit: 15,
        language: 'nl'
    });
}

async function extractDentalReviews(location = 'Netherlands') {
    const extractor = new UniversalBusinessReviewExtractor();
    return await extractor.extractBusinessReviews({
        category: 'tandarts',
        location: location,
        maxRating: 4.6,
        maxStars: 3,
        dayLimit: 30,
        businessLimit: 5,
        reviewLimit: 10,
        language: 'nl'
    });
}

async function extractRetailReviews(location = 'Netherlands') {
    const extractor = new UniversalBusinessReviewExtractor();
    return await extractor.extractBusinessReviews({
        category: 'retail store',
        location: location,
        maxRating: 4.0,
        maxStars: 3,
        dayLimit: 14,
        businessLimit: 8,
        reviewLimit: 20,
        language: 'nl'
    });
}

// Main execution with category selection
async function runUniversalExtraction(category = 'tandarts', location = 'Netherlands') {
    const extractor = new UniversalBusinessReviewExtractor();

    try {
        const results = await extractor.extractBusinessReviews({
            category: category,
            location: location,
            maxRating: 4.6,          // Businesses with rating ≤ 4.6
            maxStars: 3,             // Reviews with ≤ 3 stars
            dayLimit: 30,            // Last 30 days
            businessLimit: 5,        // Max 5 businesses
            reviewLimit: 10,         // Max 10 reviews total
            minReviews: 10,          // Min 10 reviews per business
            maxReviewsPerBusiness: 50, // Max 50 reviews to analyze per business
            minTextLength: 20,       // Min 20 characters in review text
            language: 'nl'           // Dutch language preference
        });

        return results;
    } catch (error) {
        console.error(`❌ Universal extraction failed:`, error);
        throw error;
    }
}

// Export for use in other scripts
module.exports = {
    UniversalBusinessReviewExtractor,
    extractRestaurantReviews,
    extractHotelReviews,
    extractDentalReviews,
    extractRetailReviews,
    runUniversalExtraction
};

// Run extraction if this file is executed directly
if (require.main === module) {
    // Get category and location from command line arguments or use defaults
    const category = process.argv[2] || 'tandarts';
    const location = process.argv[3] || 'Netherlands';

    console.log(`Starting extraction for: ${category} in ${location}`);
    runUniversalExtraction(category, location);
}