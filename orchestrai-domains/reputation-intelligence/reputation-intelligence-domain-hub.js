/**
 * ORCHESTRAI Reputation Intelligence Domain Hub
 * Advanced Google Business Profile negative review monitoring and analysis system
 *
 * Features:
 * - Business discovery with rating-based filtering
 * - Playwright-powered review scraping
 * - Real-time negative review monitoring (1-3 stars, <14 days)
 * - Sentiment analysis and trend detection
 * - Automated alerts and export capabilities
 */

const { EventEmitter } = require('events');
const path = require('path');

class ReputationIntelligenceDomainHub extends EventEmitter {
    constructor() {
        super();
        this.domainName = 'reputation-intelligence';
        this.agents = new Map();
        this.isActive = false;
        this.monitoringTasks = new Map();
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
        this.agents.set('review-scraper', require('./agents/review-scraper-agent'));
        this.agents.set('sentiment-analyzer', require('./agents/sentiment-analyzer-agent'));
        this.agents.set('trend-detector', require('./agents/trend-detector-agent'));
        this.agents.set('alert-manager', require('./agents/alert-manager-agent'));
        this.agents.set('export-coordinator', require('./agents/export-coordinator-agent'));
    }

    async initialize() {
        try {
            console.log(`🔍 Initializing Reputation Intelligence Domain Hub...`);

            // Initialize all agents
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

            // Trigger review scraping for discovered businesses
            await this.agents.get('review-scraper').processBusinesses(businesses);
        });

        // Review scraping events
        this.agents.get('review-scraper').on('negative-reviews-found', async (reviews) => {
            console.log(`⚠️ Found ${reviews.length} negative reviews`);
            this.emit('negative-reviews-detected', reviews);

            // Trigger sentiment analysis
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

            const monitoringId = `monitor_${Date.now()}`;
            this.monitoringTasks.set(monitoringId, {
                criteria: searchCriteria,
                startTime: new Date(),
                status: 'active'
            });

            // Start business discovery
            const discoveryResult = await this.agents.get('business-discovery').searchBusinesses(searchCriteria);

            return {
                success: true,
                monitoringId,
                initialResults: discoveryResult
            };
        } catch (error) {
            console.error(`❌ Failed to start monitoring:`, error);
            throw error;
        }
    }

    async getReputationReport(businessId) {
        try {
            const sentimentAgent = this.agents.get('sentiment-analyzer');
            const trendAgent = this.agents.get('trend-detector');

            const [sentimentData, trendData] = await Promise.all([
                sentimentAgent.getBusinessSentiment(businessId),
                trendAgent.getBusinessTrends(businessId)
            ]);

            return {
                businessId,
                sentiment: sentimentData,
                trends: trendData,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error(`❌ Failed to generate reputation report:`, error);
            throw error;
        }
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

            this.isActive = false;
            console.log(`✅ Reputation Intelligence Domain Hub shutdown complete`);

        } catch (error) {
            console.error(`❌ Error during shutdown:`, error);
            throw error;
        }
    }
}

module.exports = ReputationIntelligenceDomainHub;