/**
 * ORCHESTRAI Reputation Intelligence Domain Hub
 * Advanced Google Business Profile negative review monitoring and analysis system
 * Phase 2: Database integration for persistent storage and cost tracking
 *
 * Features:
 * - Business discovery with rating-based filtering
 * - Playwright-powered review scraping
 * - Real-time negative review monitoring (1-3 stars, <14 days)
 * - Sentiment analysis and trend detection
 * - Automated alerts and export capabilities
 * - Persistent PostgreSQL storage
 * - API cost tracking
 * - Workflow execution history
 */

const { EventEmitter } = require('events');
const path = require('path');
const db = require('./database/db-client');

class ReputationIntelligenceDomainHub extends EventEmitter {
    constructor() {
        super();
        this.domainName = 'reputation-intelligence';
        this.agents = new Map();
        this.isActive = false;
        this.monitoringTasks = new Map();
        this.db = db;
        this.currentWorkflowId = null;
        this.config = {
            maxConcurrentScrapes: 5,
            reviewAnalysisDepth: 100,
            negativeRatingThreshold: 3,
            recentReviewDays: 14,
            proxyRotationEnabled: true,
            rateLimitDelay: 2000
        };

        this.setupAgents();
    }

    setupAgents() {
        // Core reputation intelligence agents
        this.agents.set('business-discovery', require('./agents/business-discovery-agent'));
        this.agents.set('contact-enrichment', require('./agents/contact-enrichment-agent'));
        this.agents.set('review-scraper', require('./agents/review-scraper-agent'));
        this.agents.set('sentiment-analyzer', require('./agents/sentiment-analyzer-agent'));
        this.agents.set('trend-detector', require('./agents/trend-detector-agent'));
        this.agents.set('alert-manager', require('./agents/alert-manager-agent'));
        this.agents.set('export-coordinator', require('./agents/export-coordinator-agent'));
    }

    async initialize() {
        try {
            console.log(`🔍 Initializing Reputation Intelligence Domain Hub...`);

            // PHASE 2: Connect to database
            await this.db.connect();
            console.log(`🗄️  Database connected for domain hub`);

            // Initialize all agents (pass workflowId during startMonitoring)
            for (const [name, agent] of this.agents) {
                await agent.initialize(this.config);
                console.log(`✅ Agent ${name} initialized`);
            }

            // Set up event listeners
            this.setupEventListeners();

            this.isActive = true;
            console.log(`🚀 Reputation Intelligence Domain Hub active`);

            return { success: true, domain: this.domainName };
        } catch (error) {
            console.error(`❌ Failed to initialize Reputation Intelligence Domain Hub:`, error);
            throw error;
        }
    }

    setupEventListeners() {
        // Business discovery events
        this.agents.get('business-discovery').on('businesses-found', async (businesses) => {
            console.log(`📊 Found ${businesses.length} businesses for monitoring`);
            this.emit('businesses-discovered', businesses);

            // PHASE 1: Extract reviews FIRST (before enrichment)
            console.log(`🔍 Phase 1: Extracting reviews for ${businesses.length} businesses...`);
            await this.agents.get('review-scraper').processBusinesses(businesses);

            // Note: Enrichment happens AFTER reviews are analyzed
            // See 'negative-reviews-found' event handler below
        });

        // Contact enrichment events
        const enrichmentAgent = this.agents.get('contact-enrichment');
        if (enrichmentAgent) {
            enrichmentAgent.on('business-enriched', (enrichedBusiness) => {
                console.log(`✅ Enriched ${enrichedBusiness.name}: ${enrichedBusiness.decisionMakers?.length || 0} decision makers`);
            });

            enrichmentAgent.on('enrichment-progress', (progress) => {
                this.emit('enrichment-progress', progress);
            });

            enrichmentAgent.on('bulk-enrichment-complete', (stats) => {
                console.log(`✅ Bulk enrichment complete: ${stats.successful}/${stats.total} successful`);
                this.emit('bulk-enrichment-complete', stats);
            });
        }

        // Review scraping events
        this.agents.get('review-scraper').on('negative-reviews-found', async (reviews) => {
            console.log(`⚠️ Found ${reviews.length} qualifying negative reviews`);
            this.emit('negative-reviews-detected', reviews);

            // PHASE 2: Conditional enrichment (ONLY for businesses with qualifying reviews)
            const uniqueBusinessIds = [...new Set(reviews.map(r => r.businessId))];
            console.log(`💼 Phase 2: Conditional enrichment for ${uniqueBusinessIds.length}/${this.currentBusinessCount || '?'} businesses`);

            // Get businesses that need enrichment
            const enrichmentAgent = this.agents.get('contact-enrichment');
            if (enrichmentAgent && enrichmentAgent.isInitialized && uniqueBusinessIds.length > 0) {
                const savingsPercent = this.currentBusinessCount > 0
                    ? ((this.currentBusinessCount - uniqueBusinessIds.length) / this.currentBusinessCount * 100).toFixed(0)
                    : 0;

                console.log(`   Enriching ONLY businesses with qualifying reviews (saving ${savingsPercent}% on Apollo.io credits)`);

                this.emit('enrichment-needed', { businessIds: uniqueBusinessIds, reviewCount: reviews.length });

                // PHASE 2: Fetch businesses from database and enrich them
                const businessesToEnrich = await this.db.getBusinessesByIds(uniqueBusinessIds);
                if (businessesToEnrich && businessesToEnrich.length > 0) {
                    console.log(`   Retrieved ${businessesToEnrich.length} businesses from database for enrichment`);
                    await enrichmentAgent.enrichBusinesses(businessesToEnrich);
                } else {
                    console.log(`   ⚠️ No businesses found in database for enrichment`);
                }
            } else {
                console.log(`   Skipping enrichment (${enrichmentAgent ? 'no qualifying businesses' : 'enrichment not initialized'})`);
            }

            // PHASE 3: Sentiment analysis
            await this.agents.get('sentiment-analyzer').analyzeReviews(reviews);
        });

        // Sentiment analysis events
        this.agents.get('sentiment-analyzer').on('analysis-complete', async (analysisResults) => {
            console.log(`🧠 Sentiment analysis completed for ${analysisResults.length} reviews`);
            this.emit('sentiment-analysis-complete', analysisResults);

            // Trigger trend detection
            await this.agents.get('trend-detector').detectTrends(analysisResults);
        });

        // Trend detection events
        this.agents.get('trend-detector').on('negative-trend-detected', async (trendData) => {
            console.log(`📈 Negative trend detected: ${trendData.type}`);
            this.emit('negative-trend-alert', trendData);

            // Trigger alerts
            await this.agents.get('alert-manager').sendAlert(trendData);
        });
    }

    async startMonitoring(searchCriteria) {
        try {
            console.log(`🔍 Starting reputation monitoring for:`, searchCriteria);

            // PHASE 2: Create workflow execution record
            const workflow = await this.db.createWorkflowExecution({
                workflow_type: 'reputation_monitoring',
                status: 'running',
                input_parameters: searchCriteria
            });

            this.currentWorkflowId = workflow.id;
            console.log(`📝 Workflow execution created: ${workflow.id}`);

            const monitoringId = `monitor_${Date.now()}`;
            this.monitoringTasks.set(monitoringId, {
                criteria: searchCriteria,
                startTime: new Date(),
                status: 'active',
                workflowId: workflow.id
            });

            // Start business discovery
            this.currentBusinessCount = searchCriteria.limit || 50; // Store for percentage calculation
            const discoveryResult = await this.agents.get('business-discovery').searchBusinesses(searchCriteria);

            // Update workflow status
            await this.db.updateWorkflowExecution(workflow.id, {
                status: 'running',
                metadata: {
                    businessesFound: discoveryResult.total
                }
            });

            return {
                success: true,
                monitoringId,
                workflowId: workflow.id,
                initialResults: discoveryResult
            };
        } catch (error) {
            console.error(`❌ Failed to start monitoring:`, error);

            // Update workflow as failed
            if (this.currentWorkflowId) {
                await this.db.updateWorkflowExecution(this.currentWorkflowId, {
                    status: 'failed',
                    error_message: error.message
                });
            }

            throw error;
        }
    }

    async getReputationReport(businessId) {
        try {
            const sentimentAgent = this.agents.get('sentiment-analyzer');
            const trendAgent = this.agents.get('trend-detector');
            const enrichmentAgent = this.agents.get('contact-enrichment');

            const reportData = await Promise.all([
                sentimentAgent.getBusinessSentiment(businessId),
                trendAgent.getBusinessTrends(businessId)
            ]);

            const report = {
                businessId,
                sentiment: reportData[0],
                trends: reportData[1],
                generatedAt: new Date()
            };

            // Add enrichment data if available
            if (enrichmentAgent && enrichmentAgent.isInitialized) {
                const stats = enrichmentAgent.getEnrichmentStats();
                report.enrichment = stats;
            }

            return report;
        } catch (error) {
            console.error(`❌ Failed to generate reputation report:`, error);
            throw error;
        }
    }

    /**
     * Get enriched business data with decision-maker contacts
     * PHASE 2: Query from database instead of in-memory cache
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} Enriched business data
     */
    async getEnrichedBusinessData(businessId) {
        try {
            // PHASE 2: Query database for enrichment data
            const business = await this.db.getBusinessById(businessId);
            if (!business) {
                throw new Error(`Business ${businessId} not found`);
            }

            const enrichment = await this.db.getEnrichmentByBusinessId(businessId);
            if (!enrichment) {
                return {
                    ...business,
                    enrichment: {
                        status: 'not_enriched',
                        message: 'No enrichment data available for this business'
                    }
                };
            }

            return {
                ...business,
                organizationData: enrichment.organization_data,
                decisionMakers: enrichment.decision_makers,
                enrichment: {
                    status: 'success',
                    qualityScore: enrichment.quality_score,
                    enrichedAt: enrichment.enriched_at
                }
            };
        } catch (error) {
            console.error(`❌ Failed to get enriched business data:`, error);
            throw error;
        }
    }

    /**
     * Get enrichment statistics across all businesses
     * PHASE 2: Now async to query database
     * @returns {Promise<Object>} Enrichment statistics
     */
    async getEnrichmentStats() {
        const enrichmentAgent = this.agents.get('contact-enrichment');

        if (!enrichmentAgent || !enrichmentAgent.isInitialized) {
            return {
                enabled: false,
                message: 'Contact enrichment not available'
            };
        }

        const stats = await enrichmentAgent.getEnrichmentStats();

        return {
            enabled: true,
            ...stats
        };
    }

    async exportNegativeReviews(criteria, format = 'json') {
        try {
            console.log(`📤 Exporting negative reviews in ${format} format`);

            const exportAgent = this.agents.get('export-coordinator');
            const exportResult = await exportAgent.exportReviews(criteria, format);

            return exportResult;
        } catch (error) {
            console.error(`❌ Failed to export reviews:`, error);
            throw error;
        }
    }

    async stopMonitoring(monitoringId) {
        try {
            if (this.monitoringTasks.has(monitoringId)) {
                const task = this.monitoringTasks.get(monitoringId);
                task.status = 'stopped';
                task.endTime = new Date();

                console.log(`⏹️ Stopped monitoring task: ${monitoringId}`);
                return { success: true, monitoringId };
            } else {
                throw new Error(`Monitoring task ${monitoringId} not found`);
            }
        } catch (error) {
            console.error(`❌ Failed to stop monitoring:`, error);
            throw error;
        }
    }

    getActiveMonitoringTasks() {
        const activeTasks = Array.from(this.monitoringTasks.entries())
            .filter(([_, task]) => task.status === 'active')
            .map(([id, task]) => ({ id, ...task }));

        return activeTasks;
    }

    async shutdown() {
        try {
            console.log(`🔄 Shutting down Reputation Intelligence Domain Hub...`);

            // Update workflow status if active
            if (this.currentWorkflowId) {
                await this.db.updateWorkflowExecution(this.currentWorkflowId, {
                    status: 'completed',
                    completed_at: new Date()
                });
            }

            // Stop all monitoring tasks
            for (const [id, _] of this.monitoringTasks) {
                await this.stopMonitoring(id);
            }

            // Shutdown all agents
            for (const [name, agent] of this.agents) {
                if (agent.shutdown) {
                    await agent.shutdown();
                }
                console.log(`✅ Agent ${name} shutdown`);
            }

            // PHASE 2: Disconnect from database
            await this.db.disconnect();
            console.log(`🗄️  Database disconnected`);

            this.isActive = false;
            console.log(`✅ Reputation Intelligence Domain Hub shutdown complete`);

        } catch (error) {
            console.error(`❌ Error during shutdown:`, error);
            throw error;
        }
    }
}

module.exports = ReputationIntelligenceDomainHub;