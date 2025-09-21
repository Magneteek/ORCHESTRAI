/**
 * LinkedIn Executive Email Extractor
 * Integrates with existing Apify infrastructure to find executive emails
 * Cost: $0.01 per lead - highly cost-effective
 */

const https = require('https');

class LinkedInExecutiveEmailExtractor {
    constructor() {
        this.apiToken = process.env.APIFY_API_TOKEN || 'apify_api_3YRIamVzIDjyqr948CnIW52ciuZ3cn2rttUe';
        this.baseUrl = 'https://api.apify.com/v2';
        this.linkedinActorId = 'bhansalisoft/linkedin-email-scraper'; // LinkedIn Email Scraper
    }

    async findExecutiveEmails(businessData) {
        console.log(`🔍 LinkedIn Executive Email Extraction`);
        console.log(`Business: ${businessData.name}`);
        console.log(`Location: ${businessData.location}`);
        console.log(`=====================================\n`);

        try {
            // Step 1: Generate LinkedIn search queries for executives
            const searchQueries = this.generateExecutiveSearchQueries(businessData);
            console.log(`📝 Generated ${searchQueries.length} executive search queries`);

            const allExecutives = [];

            for (const query of searchQueries) {
                try {
                    console.log(`\n🎯 Searching: "${query}"`);
                    const executives = await this.searchLinkedInExecutives(query, businessData);
                    allExecutives.push(...executives);
                    console.log(`   ✅ Found ${executives.length} potential executives`);

                    // Rate limiting - be respectful to Apify
                    await this.delay(3000);
                } catch (error) {
                    console.log(`   ❌ Search failed: ${error.message}`);
                }
            }

            // Step 2: Filter and deduplicate executives
            const filteredExecutives = this.filterExecutives(allExecutives, businessData);

            // Step 3: Generate executive contact report
            const report = this.generateExecutiveReport(filteredExecutives, businessData);

            return {
                business: businessData,
                executives: filteredExecutives,
                totalFound: filteredExecutives.length,
                emailsFound: filteredExecutives.filter(exec => exec.email).length,
                searchQueries: searchQueries,
                extractionDate: new Date(),
                report
            };

        } catch (error) {
            console.error(`❌ LinkedIn extraction failed:`, error);
            throw error;
        }
    }

    generateExecutiveSearchQueries(business) {
        const businessName = business.name || business.title || '';
        const location = business.location || business.address || '';

        // Clean business name - remove common suffixes
        const cleanBusinessName = businessName
            .replace(/\b(B\.V\.|BV|Ltd|Limited|Inc|Corp|Corporation|GmbH|Hotel|Restaurant)\b/gi, '')
            .trim();

        const queries = [];

        // Executive titles to search for
        const executiveTitles = [
            'Owner', 'CEO', 'Managing Director', 'General Manager',
            'Director', 'Founder', 'President', 'Manager',
            'Eigenaar', 'Directeur', 'Bedrijfsleider' // Dutch titles
        ];

        // Generate queries combining business name + titles + location
        executiveTitles.forEach(title => {
            if (cleanBusinessName) {
                queries.push(`${title} ${cleanBusinessName} ${location}`);
                queries.push(`${title} at ${cleanBusinessName}`);
            }
        });

        // Industry-specific queries
        if (businessName.toLowerCase().includes('hotel')) {
            queries.push(`Hotel Manager ${cleanBusinessName}`);
            queries.push(`Hotel Director ${cleanBusinessName}`);
        }

        if (businessName.toLowerCase().includes('restaurant')) {
            queries.push(`Restaurant Owner ${cleanBusinessName}`);
            queries.push(`Chef Owner ${cleanBusinessName}`);
        }

        // Return top 5 most promising queries to stay within budget
        return queries.slice(0, 5);
    }

    async searchLinkedInExecutives(query, businessData) {
        const input = {
            searchTerms: [query],
            maxResults: 10, // Limit to control costs - $0.01 per result
            location: businessData.location || 'Netherlands',
            includeEmails: true,
            includePhones: true
        };

        const runId = await this.runApifyActor(this.linkedinActorId, input);
        const results = await this.getApifyResults(runId, this.linkedinActorId);

        return results || [];
    }

    filterExecutives(executives, businessData) {
        const businessName = (businessData.name || businessData.title || '').toLowerCase();
        const businessWords = businessName.split(' ').filter(word => word.length > 2);

        return executives
            .filter(exec => {
                // Must have an email or phone
                if (!exec.email && !exec.phoneNumber) return false;

                // Must have relevant title
                const title = (exec.position || exec.title || '').toLowerCase();
                const relevantTitles = [
                    'owner', 'ceo', 'director', 'manager', 'founder', 'president',
                    'eigenaar', 'directeur', 'bedrijfsleider', 'manager'
                ];
                const hasRelevantTitle = relevantTitles.some(t => title.includes(t));

                // Must be connected to the business
                const profile = (exec.headline || exec.company || '').toLowerCase();
                const businessConnection = businessWords.some(word =>
                    profile.includes(word) || title.includes(word)
                );

                return hasRelevantTitle && businessConnection;
            })
            .map(exec => ({
                name: exec.name || exec.fullName,
                title: exec.position || exec.title,
                email: exec.email,
                phone: exec.phoneNumber,
                linkedinUrl: exec.profileUrl,
                company: exec.company,
                headline: exec.headline,
                location: exec.location,
                relevanceScore: this.calculateRelevanceScore(exec, businessData),
                extractedDate: new Date()
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 15); // Top 15 most relevant executives
    }

    calculateRelevanceScore(executive, businessData) {
        let score = 0;

        const businessName = (businessData.name || businessData.title || '').toLowerCase();
        const execProfile = `${executive.headline || ''} ${executive.company || ''} ${executive.position || ''}`.toLowerCase();

        // Email presence = high value
        if (executive.email) score += 50;

        // Phone presence = medium value
        if (executive.phoneNumber) score += 25;

        // Business name match = high relevance
        if (execProfile.includes(businessName)) score += 40;

        // Executive title = medium relevance
        const executiveTitles = ['owner', 'ceo', 'director', 'founder', 'manager'];
        if (executiveTitles.some(title => execProfile.includes(title))) score += 30;

        // Location match = low relevance
        const businessLocation = (businessData.location || '').toLowerCase();
        if (businessLocation && execProfile.includes(businessLocation)) score += 10;

        return score;
    }

    generateExecutiveReport(executives, businessData) {
        const emailCount = executives.filter(exec => exec.email).length;
        const phoneCount = executives.filter(exec => exec.phone).length;

        let report = `\n🎯 LINKEDIN EXECUTIVE EMAIL EXTRACTION REPORT\n`;
        report += `================================================\n`;
        report += `Business: ${businessData.name || businessData.title}\n`;
        report += `Location: ${businessData.location || businessData.address}\n`;
        report += `Extraction Date: ${new Date().toLocaleDateString()}\n\n`;

        report += `📊 SUMMARY STATISTICS:\n`;
        report += `• Total Executives Found: ${executives.length}\n`;
        report += `• Email Addresses Found: ${emailCount}\n`;
        report += `• Phone Numbers Found: ${phoneCount}\n`;
        report += `• Average Relevance Score: ${Math.round(executives.reduce((acc, exec) => acc + exec.relevanceScore, 0) / executives.length) || 0}\n\n`;

        if (executives.length === 0) {
            report += `⚠️ No executives found. Try adjusting search criteria or business name.\n`;
            return report;
        }

        report += `👥 EXECUTIVE CONTACTS:\n`;
        report += `=====================\n\n`;

        executives.forEach((exec, index) => {
            report += `${index + 1}. ═══════════════════════════════════════\n`;
            report += `Name: ${exec.name || 'Unknown'}\n`;
            report += `Title: ${exec.title || 'Not specified'}\n`;
            report += `Email: ${exec.email || 'Not found'}\n`;
            report += `Phone: ${exec.phone || 'Not found'}\n`;
            report += `Company: ${exec.company || 'Not specified'}\n`;
            report += `LinkedIn: ${exec.linkedinUrl || 'Not available'}\n`;
            report += `Relevance Score: ${exec.relevanceScore}/100\n`;
            report += `\n`;
        });

        report += `💰 COST ANALYSIS:\n`;
        report += `================\n`;
        report += `• Total LinkedIn searches: ${executives.length}\n`;
        report += `• Estimated cost: $${(executives.length * 0.01).toFixed(2)} (at $0.01 per result)\n`;
        report += `• Email success rate: ${emailCount > 0 ? Math.round((emailCount / executives.length) * 100) : 0}%\n`;
        report += `• Cost per email found: $${emailCount > 0 ? ((executives.length * 0.01) / emailCount).toFixed(3) : 'N/A'}\n\n`;

        report += `🎯 EXTRACTION COMPLETE!\n`;
        report += `Found ${emailCount} executive emails for ${businessData.name || 'business'}\n`;

        return report;
    }

    // Apify API helper methods (reused from existing system)
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
}

// Test function for standalone usage
async function testLinkedInExtraction() {
    const extractor = new LinkedInExecutiveEmailExtractor();

    // Test with sample business data
    const testBusiness = {
        name: 'Hotel de Gelderse Poort',
        location: 'Netherlands',
        address: 'Ooijse Bandijk 2, 6576 JZ Ooij, Netherlands'
    };

    console.log('🚀 Testing LinkedIn Executive Email Extraction...\n');

    try {
        const result = await extractor.findExecutiveEmails(testBusiness);
        console.log(result.report);

        return result;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return null;
    }
}

// Export for integration with existing system
module.exports = {
    LinkedInExecutiveEmailExtractor,
    testLinkedInExtraction
};

// Run test if executed directly
if (require.main === module) {
    testLinkedInExtraction();
}