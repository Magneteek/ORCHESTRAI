/**
 * Contact Enrichment Agent
 * Uses Apollo.io API to enrich business data with decision-maker contact information
 * Phase 2: Database integration for persistent storage and cost tracking
 *
 * Features:
 * - Organization enrichment (company details, tech stack, employee count)
 * - Decision-maker discovery (titles, emails, phone numbers)
 * - Bulk enrichment capabilities
 * - Enrichment quality scoring
 * - Integration with business discovery workflow
 * - Persistent database storage
 * - Apollo.io cost tracking
 */

const { EventEmitter } = require('events');
const ApolloClient = require('../lib/apollo-client');
const db = require('../database/db-client');

class ContactEnrichmentAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'contact-enrichment';
        this.isInitialized = false;
        this.apolloClient = null;
        this.db = db;
        this.config = null;
        this.workflowId = null;

        // Decision-maker persona configurations
        this.decisionMakerProfiles = {
            dental: {
                titles: ['Owner', 'Practice Manager', 'Director', 'Partner', 'Principal Dentist'],
                seniorities: ['owner', 'partner', 'director', 'manager'],
                departments: ['management', 'operations']
            },
            medical: {
                titles: ['Practice Manager', 'Medical Director', 'Office Manager', 'Administrator'],
                seniorities: ['director', 'manager', 'owner'],
                departments: ['management', 'operations', 'administration']
            },
            restaurant: {
                titles: ['Owner', 'General Manager', 'Restaurant Manager', 'Operations Manager'],
                seniorities: ['owner', 'manager', 'director'],
                departments: ['management', 'operations']
            },
            default: {
                titles: ['Owner', 'CEO', 'Managing Director', 'General Manager', 'Operations Manager'],
                seniorities: ['owner', 'c_suite', 'vp', 'director', 'manager'],
                departments: ['management', 'operations', 'executive']
            }
        };
    }

    async initialize(config, workflowId = null) {
        try {
            this.config = config;
            this.workflowId = workflowId;

            // Connect to database for persistent storage
            await this.db.connect();
            console.log(`🗄️  Database connected for enrichment storage`);

            // Initialize Apollo.io client
            const apolloApiKey = process.env.APOLLO_API_KEY;
            if (!apolloApiKey) {
                throw new Error('APOLLO_API_KEY environment variable not set');
            }

            this.apolloClient = new ApolloClient(apolloApiKey);

            // Set up Apollo client event listeners
            this.apolloClient.on('request-success', (data) => {
                console.log(`✅ Apollo API request successful: ${data.endpoint}`);
            });

            this.apolloClient.on('request-error', (error) => {
                console.error(`❌ Apollo API request failed: ${error.endpoint} - ${error.message}`);
            });

            this.apolloClient.on('bulk-enrichment-progress', (progress) => {
                this.emit('enrichment-progress', progress);
            });

            // Verify API connectivity
            const healthCheck = await this.apolloClient.healthCheck();
            if (!healthCheck.healthy) {
                throw new Error(`Apollo API health check failed: ${healthCheck.message}`);
            }

            this.isInitialized = true;
            console.log(`✅ Contact Enrichment Agent initialized with Apollo.io`);

        } catch (error) {
            console.error(`❌ Failed to initialize Contact Enrichment Agent:`, error);
            throw error;
        }
    }

    /**
     * Enrich a single business with contact and organization data
     * @param {Object} business - Business object from discovery agent
     * @returns {Promise<Object>} Enriched business data
     */
    async enrichBusiness(business) {
        try {
            if (!this.isInitialized) {
                throw new Error('Agent not initialized');
            }

            console.log(`🔍 Enriching business: ${business.name}`);

            // PHASE 2: Check database cache first
            const cachedEnrichment = await this.db.getEnrichmentByBusinessId(business.id);
            if (cachedEnrichment) {
                console.log(`📦 Using cached enrichment for ${business.name}`);

                return {
                    ...business,
                    organizationData: cachedEnrichment.organization_data,
                    decisionMakers: cachedEnrichment.decision_makers,
                    decisionMakerCount: cachedEnrichment.decision_makers?.length || 0,
                    enrichment: {
                        status: 'success',
                        qualityScore: cachedEnrichment.quality_score,
                        hasOrganizationData: !!cachedEnrichment.organization_data,
                        hasDecisionMakers: cachedEnrichment.decision_makers?.length > 0,
                        decisionMakerCount: cachedEnrichment.decision_makers?.length || 0,
                        completedAt: cachedEnrichment.enriched_at,
                        fromCache: true
                    }
                };
            }

            const enrichedBusiness = {
                ...business,
                enrichment: {
                    status: 'processing',
                    attemptedAt: new Date()
                }
            };

            // Extract domain from business data
            const domain = this.apolloClient.extractDomain(business);

            if (!domain) {
                console.warn(`⚠️ No domain found for business ${business.name}`);
                enrichedBusiness.enrichment = {
                    status: 'failed',
                    reason: 'no_domain_found',
                    attemptedAt: new Date()
                };
                return enrichedBusiness;
            }

            // Enrich organization
            const orgEnrichment = await this.apolloClient.enrichOrganization(domain);

            if (!orgEnrichment.success) {
                console.warn(`⚠️ Organization enrichment failed for ${domain}: ${orgEnrichment.error}`);
                enrichedBusiness.enrichment = {
                    status: 'failed',
                    reason: orgEnrichment.error,
                    domain,
                    attemptedAt: new Date()
                };
                return enrichedBusiness;
            }

            // Add organization data
            enrichedBusiness.organizationData = orgEnrichment.data;

            // Determine decision-maker profile based on business category
            const category = this.categorizeBusiness(business);
            const decisionMakerProfile = this.decisionMakerProfiles[category] || this.decisionMakerProfiles.default;

            // Search for decision makers
            const decisionMakers = await this.apolloClient.searchPeople({
                organizationDomain: domain,
                titles: decisionMakerProfile.titles,
                seniorities: decisionMakerProfile.seniorities,
                departments: decisionMakerProfile.departments,
                limit: 10
            });

            if (decisionMakers.success) {
                enrichedBusiness.decisionMakers = decisionMakers.contacts;
                enrichedBusiness.decisionMakerCount = decisionMakers.totalResults;
            }

            // Calculate enrichment quality score
            const qualityScore = this.calculateEnrichmentQuality(enrichedBusiness);

            enrichedBusiness.enrichment = {
                status: 'success',
                qualityScore: qualityScore,
                hasOrganizationData: !!orgEnrichment.success,
                hasDecisionMakers: decisionMakers.success && decisionMakers.contacts.length > 0,
                decisionMakerCount: decisionMakers.contacts?.length || 0,
                completedAt: new Date()
            };

            // PHASE 2: Store in database for persistence
            const enrichmentData = await this.db.createEnrichment({
                business_id: business.id,
                organization_data: enrichedBusiness.organizationData || null,
                decision_makers: enrichedBusiness.decisionMakers || [],
                quality_score: qualityScore,
                metadata: {
                    category: this.categorizeBusiness(business),
                    domain: domain
                }
            });

            // Track Apollo.io cost (approximate - varies by plan)
            const estimatedCost = 0.20; // Base cost for org + people search
            await this.db.trackApiCost({
                workflow_execution_id: this.workflowId,
                api_service: 'apollo_enrichment',
                endpoint: 'organization_enrichment',
                cost_amount: estimatedCost,
                requests_count: 1,
                metadata: {
                    businessId: business.id,
                    businessName: business.name,
                    decisionMakersFound: enrichedBusiness.decisionMakers?.length || 0,
                    qualityScore: qualityScore
                }
            });

            // Emit enrichment event
            this.emit('business-enriched', enrichedBusiness);

            console.log(`✅ Enriched ${business.name}: ${enrichedBusiness.decisionMakers?.length || 0} decision makers found (quality: ${qualityScore})`);

            return enrichedBusiness;

        } catch (error) {
            console.error(`❌ Failed to enrich business ${business.name}:`, error);
            return {
                ...business,
                enrichment: {
                    status: 'error',
                    error: error.message,
                    attemptedAt: new Date()
                }
            };
        }
    }

    /**
     * Bulk enrich multiple businesses
     * @param {Array<Object>} businesses - Array of business objects
     * @returns {Promise<Array>} Array of enriched businesses
     */
    async enrichBusinesses(businesses) {
        try {
            console.log(`🔍 Bulk enriching ${businesses.length} businesses`);

            const enrichedBusinesses = [];

            for (const business of businesses) {
                const enriched = await this.enrichBusiness(business);
                enrichedBusinesses.push(enriched);

                // Emit progress
                this.emit('bulk-enrichment-progress', {
                    current: enrichedBusinesses.length,
                    total: businesses.length,
                    businessName: business.name
                });
            }

            // Emit completion
            this.emit('bulk-enrichment-complete', {
                total: enrichedBusinesses.length,
                successful: enrichedBusinesses.filter(b => b.enrichment.status === 'success').length,
                failed: enrichedBusinesses.filter(b => b.enrichment.status !== 'success').length
            });

            console.log(`✅ Bulk enrichment complete: ${enrichedBusinesses.length} businesses processed`);

            return enrichedBusinesses;

        } catch (error) {
            console.error(`❌ Bulk enrichment failed:`, error);
            throw error;
        }
    }

    /**
     * Find the best contact for outreach based on title and seniority
     * @param {Object} enrichedBusiness - Enriched business object
     * @returns {Object|null} Best contact or null
     */
    findBestContact(enrichedBusiness) {
        if (!enrichedBusiness.decisionMakers || enrichedBusiness.decisionMakers.length === 0) {
            return null;
        }

        // Seniority priority: owner > c_suite > vp > director > manager
        const seniorityPriority = {
            'owner': 10,
            'c_suite': 9,
            'partner': 8,
            'vp': 7,
            'director': 6,
            'manager': 5,
            'senior': 4,
            'entry': 3
        };

        // Score each contact
        const scoredContacts = enrichedBusiness.decisionMakers.map(contact => {
            let score = seniorityPriority[contact.seniority] || 1;

            // Bonus for having email
            if (contact.email) score += 5;

            // Bonus for specific titles
            const title = (contact.title || '').toLowerCase();
            if (title.includes('owner')) score += 3;
            if (title.includes('ceo') || title.includes('managing director')) score += 3;
            if (title.includes('manager')) score += 2;

            return { ...contact, score };
        });

        // Return highest scored contact
        return scoredContacts.sort((a, b) => b.score - a.score)[0];
    }

    /**
     * Calculate enrichment quality score (0-100)
     * @param {Object} enrichedBusiness - Enriched business data
     * @returns {number} Quality score
     */
    calculateEnrichmentQuality(enrichedBusiness) {
        let score = 0;

        // Organization data (40 points)
        if (enrichedBusiness.organizationData) {
            if (enrichedBusiness.organizationData.industry) score += 10;
            if (enrichedBusiness.organizationData.employeeCount) score += 10;
            if (enrichedBusiness.organizationData.revenue) score += 10;
            if (enrichedBusiness.organizationData.socialMedia?.linkedin) score += 10;
        }

        // Decision makers (40 points)
        if (enrichedBusiness.decisionMakers) {
            const dmCount = enrichedBusiness.decisionMakers.length;
            if (dmCount > 0) score += 10;
            if (dmCount >= 3) score += 10;

            const withEmail = enrichedBusiness.decisionMakers.filter(dm => dm.email).length;
            if (withEmail > 0) score += 10;
            if (withEmail >= 2) score += 10;
        }

        // Tech stack (10 points)
        if (enrichedBusiness.organizationData?.techStack?.length > 0) score += 10;

        // Social proof (10 points)
        if (enrichedBusiness.organizationData?.socialMedia) {
            const socialCount = Object.values(enrichedBusiness.organizationData.socialMedia)
                .filter(url => url).length;
            score += Math.min(socialCount * 3, 10);
        }

        return Math.min(score, 100);
    }

    /**
     * Categorize business based on available data
     * @param {Object} business - Business object
     * @returns {string} Category identifier
     */
    categorizeBusiness(business) {
        const category = (business.category || '').toLowerCase();
        const name = (business.name || '').toLowerCase();

        if (category.includes('dental') || category.includes('tandarts') || name.includes('dental')) {
            return 'dental';
        }

        if (category.includes('medical') || category.includes('clinic') || category.includes('doctor')) {
            return 'medical';
        }

        if (category.includes('restaurant') || category.includes('food')) {
            return 'restaurant';
        }

        return 'default';
    }

    /**
     * Get enrichment statistics from database
     * @returns {Promise<Object>} Enrichment statistics
     */
    async getEnrichmentStats() {
        const stats = await this.db.query(`
            SELECT
                COUNT(*) as total_enriched,
                AVG(quality_score) as average_quality_score,
                SUM((decision_makers::jsonb ? 'length')::int) as decision_makers_found
            FROM contact_enrichments
        `);

        return {
            totalEnriched: parseInt(stats.rows[0]?.total_enriched || 0),
            averageQualityScore: parseFloat(stats.rows[0]?.average_quality_score || 0),
            decisionMakersFound: parseInt(stats.rows[0]?.decision_makers_found || 0)
        };
    }

    async shutdown() {
        console.log(`🔄 Shutting down Contact Enrichment Agent...`);
        await this.db.disconnect();
        this.isInitialized = false;
    }
}

module.exports = new ContactEnrichmentAgent();