// Reviews Monitor Agent - Node.js Orchestrator Agent
// Automated monitoring and intelligence coordination for Google Business reviews
// Specializes in Netherlands businesses with 1-3 star review detection

const EventEmitter = require('events');

class ReviewsMonitor extends EventEmitter {
  constructor(clientIntelligenceHub, orchestrator, crystallineMemory, mcpManager) {
    super();

    this.clientIntelligenceHub = clientIntelligenceHub;
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.mcpManager = mcpManager;

    this.agentId = 'reviews-monitor';
    this.status = 'initializing';

    // Monitoring configuration for Netherlands businesses
    this.monitoringConfig = {
      targetLocationCode: 2528, // Netherlands
      targetLanguage: 'Dutch',
      maxRating: 3, // Monitor 1-3 star reviews only
      daysBack: 10, // Last 10 days
      monitoringInterval: 6 * 60 * 60 * 1000, // Check every 6 hours
      alertThreshold: 3, // Alert if 3+ negative reviews found
      businessCategories: [
        'tandarts', 'zahnarzt', 'dentist', // Dental practices
        'restaurant', 'cafe', 'eetcafe', // Food & beverage
        'kapper', 'hair salon', 'beauty salon', // Beauty services
        'garage', 'auto repair', 'autowerkplaats', // Auto services
        'huisarts', 'medical clinic', 'dokter', // Medical practices
        'apotheek', 'pharmacy', 'drogisterij' // Pharmacies
      ]
    };

    // Active monitoring sessions
    this.monitoringSessions = new Map();
    this.alertHistory = [];

    // Performance metrics
    this.metrics = {
      businessesMonitored: 0,
      reviewsAnalyzed: 0,
      alertsGenerated: 0,
      negativeReviewsFound: 0,
      monitoringSessionsActive: 0,
      lastMonitoringRun: null,
      averageProcessingTime: 0
    };

    // Review intelligence patterns
    this.intelligencePatterns = {
      urgentKeywords: {
        dutch: ['slecht', 'verschrikkelijk', 'nooit meer', 'geld terug', 'klacht'],
        english: ['terrible', 'awful', 'never again', 'refund', 'complaint']
      },
      serviceIssues: {
        dutch: ['slechte service', 'onvriendelijk', 'lang wachten', 'niet professioneel'],
        english: ['poor service', 'unfriendly', 'long wait', 'unprofessional']
      },
      qualityIssues: {
        dutch: ['slechte kwaliteit', 'niet goed', 'teleurgesteld', 'fout'],
        english: ['poor quality', 'not good', 'disappointed', 'mistake']
      }
    };
  }

  async initialize() {
    try {
      console.log('📊 Initializing Reviews Monitor for Netherlands businesses...');

      // Setup DataForSEO MCP integration
      await this.setupDataForSEOIntegration();

      // Initialize crystalline memory for reviews
      await this.initializeReviewsMemory();

      // Setup monitoring scheduler
      this.setupMonitoringScheduler();

      // Setup alert systems
      this.setupAlertingSystems();

      // Start automatic monitoring for configured business types
      await this.startAutomaticMonitoring();

      this.status = 'active';
      console.log('✅ Reviews Monitor initialized and active');

    } catch (error) {
      console.error('❌ Reviews Monitor initialization failed:', error);
      this.status = 'error';
    }
  }

  async setupDataForSEOIntegration() {
    try {
      // Verify DataForSEO MCP connection
      const dataForSEOMCP = this.mcpManager.getServer('dataforseo');
      if (!dataForSEOMCP) {
        throw new Error('DataForSEO MCP server not available');
      }

      console.log('🔗 DataForSEO MCP integration established');

    } catch (error) {
      console.error('❌ DataForSEO integration setup failed:', error);
      throw error;
    }
  }

  async initializeReviewsMemory() {
    try {
      // Create reviews memory cluster in crystalline memory
      await this.crystallineMemory.createMemoryCluster('netherlands_reviews', {
        type: 'reviews_intelligence',
        location: 'netherlands',
        focusAreas: ['negative_reviews', 'business_reputation', 'competitive_intelligence'],
        retentionPolicy: '90_days',
        alertingEnabled: true
      });

      console.log('🧠 Reviews memory cluster initialized');

    } catch (error) {
      console.error('❌ Reviews memory initialization failed:', error);
      throw error;
    }
  }

  setupMonitoringScheduler() {
    // Schedule regular review monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performScheduledMonitoring();
      } catch (error) {
        console.error('❌ Scheduled monitoring failed:', error);
      }
    }, this.monitoringConfig.monitoringInterval);

    console.log('⏰ Review monitoring scheduler started (6-hour intervals)');
  }

  setupAlertingSystems() {
    // Setup TTS notifications for urgent reviews
    this.on('urgentReviewAlert', (alert) => {
      this.orchestrator.emit('tts-notification', {
        message: `Urgent review alert: ${alert.businessName} received ${alert.negativeReviews} negative reviews in last ${alert.timeframe}`,
        priority: 'high',
        category: 'reputation_management'
      });
    });

    // Setup cross-domain notifications
    this.on('competitiveIntelligence', (intelligence) => {
      this.orchestrator.emit('cross-domain-notification', {
        domain: 'content-enhanced',
        type: 'reputation_opportunity',
        data: intelligence
      });
    });

    console.log('🚨 Alerting systems configured');
  }

  async startAutomaticMonitoring() {
    try {
      // Start monitoring for each business category
      for (const category of this.monitoringConfig.businessCategories) {
        await this.startCategoryMonitoring(category);
      }

      console.log(`📈 Automatic monitoring started for ${this.monitoringConfig.businessCategories.length} business categories`);

    } catch (error) {
      console.error('❌ Automatic monitoring startup failed:', error);
    }
  }

  async startCategoryMonitoring(category) {
    try {
      const sessionId = `${category}_${Date.now()}`;

      // Search for businesses in this category in Netherlands
      const businesses = await this.discoverBusinesses(category);

      if (businesses && businesses.length > 0) {
        this.monitoringSessions.set(sessionId, {
          category,
          businesses,
          startTime: Date.now(),
          status: 'active',
          reviewsFound: 0,
          alertsGenerated: 0
        });

        this.metrics.businessesMonitored += businesses.length;
        this.metrics.monitoringSessionsActive++;

        console.log(`📊 Started monitoring ${businesses.length} ${category} businesses`);
      }

    } catch (error) {
      console.error(`❌ Category monitoring failed for ${category}:`, error);
    }
  }

  async discoverBusinesses(keyword) {
    try {
      // Use DataForSEO to find businesses
      const dataForSEOMCP = this.mcpManager.getServer('dataforseo');

      const searchResults = await dataForSEOMCP.callTool('business_data_search', {
        keyword: keyword,
        location_code: this.monitoringConfig.targetLocationCode,
        language_name: this.monitoringConfig.targetLanguage,
        limit: 20
      });

      if (searchResults && searchResults.content && searchResults.content[0]) {
        const businessData = JSON.parse(searchResults.content[0].text.split('\n').slice(1).join('\n'));

        if (businessData.tasks && businessData.tasks[0] && businessData.tasks[0].result) {
          return businessData.tasks[0].result.map(business => ({
            name: business.title,
            cid: business.cid,
            address: business.address,
            rating: business.rating,
            reviews_count: business.reviews_count,
            category: keyword
          }));
        }
      }

      return [];

    } catch (error) {
      console.error(`❌ Business discovery failed for ${keyword}:`, error);
      return [];
    }
  }

  async performScheduledMonitoring() {
    const startTime = Date.now();
    console.log('🔍 Starting scheduled review monitoring...');

    try {
      let totalReviewsAnalyzed = 0;
      let totalAlertsGenerated = 0;

      for (const [sessionId, session] of this.monitoringSessions) {
        if (session.status === 'active') {
          const results = await this.monitorSessionBusinesses(session);
          totalReviewsAnalyzed += results.reviewsAnalyzed;
          totalAlertsGenerated += results.alertsGenerated;
        }
      }

      // Update metrics
      this.metrics.reviewsAnalyzed += totalReviewsAnalyzed;
      this.metrics.alertsGenerated += totalAlertsGenerated;
      this.metrics.lastMonitoringRun = new Date().toISOString();
      this.metrics.averageProcessingTime = Date.now() - startTime;

      console.log(`✅ Scheduled monitoring completed: ${totalReviewsAnalyzed} reviews analyzed, ${totalAlertsGenerated} alerts generated`);

    } catch (error) {
      console.error('❌ Scheduled monitoring failed:', error);
    }
  }

  async monitorSessionBusinesses(session) {
    let reviewsAnalyzed = 0;
    let alertsGenerated = 0;

    try {
      for (const business of session.businesses) {
        const businessResults = await this.analyzeBusiness(business);

        reviewsAnalyzed += businessResults.reviewsAnalyzed;

        if (businessResults.negativeReviews && businessResults.negativeReviews.length >= this.monitoringConfig.alertThreshold) {
          await this.generateReviewAlert(business, businessResults);
          alertsGenerated++;
        }

        // Store findings in crystalline memory
        await this.storeBusinessIntelligence(business, businessResults);
      }

    } catch (error) {
      console.error(`❌ Session monitoring failed for ${session.category}:`, error);
    }

    return { reviewsAnalyzed, alertsGenerated };
  }

  async analyzeBusiness(business) {
    try {
      const dataForSEOMCP = this.mcpManager.getServer('dataforseo');

      // Get filtered negative reviews (1-3 stars, last 10 days)
      const reviewsResults = await dataForSEOMCP.callTool('business_data_reviews_filtered', {
        cid: business.cid,
        max_rating: this.monitoringConfig.maxRating,
        days_back: this.monitoringConfig.daysBack,
        location_code: this.monitoringConfig.targetLocationCode,
        language_name: this.monitoringConfig.targetLanguage,
        limit: 50
      });

      let negativeReviews = [];
      let reviewsAnalyzed = 0;

      if (reviewsResults && reviewsResults.content && reviewsResults.content[0]) {
        const reviewData = JSON.parse(reviewsResults.content[0].text.split('\n').slice(1).join('\n'));

        if (reviewData.tasks && reviewData.tasks[0] && reviewData.tasks[0].result) {
          negativeReviews = reviewData.tasks[0].result;
          reviewsAnalyzed = negativeReviews.length;

          // Analyze review content for urgency and patterns
          negativeReviews = negativeReviews.map(review => ({
            ...review,
            urgencyScore: this.calculateUrgencyScore(review),
            issueCategories: this.categorizeIssues(review),
            sentiment: this.analyzeSentiment(review)
          }));

          this.metrics.negativeReviewsFound += negativeReviews.length;
        }
      }

      return {
        reviewsAnalyzed,
        negativeReviews,
        hasUrgentIssues: negativeReviews.some(r => r.urgencyScore > 0.7),
        commonIssues: this.identifyCommonIssues(negativeReviews)
      };

    } catch (error) {
      console.error(`❌ Business analysis failed for ${business.name}:`, error);
      return { reviewsAnalyzed: 0, negativeReviews: [] };
    }
  }

  calculateUrgencyScore(review) {
    let score = 0;
    const reviewText = (review.text || '').toLowerCase();

    // Check for urgent keywords
    const urgentWords = [...this.intelligencePatterns.urgentKeywords.dutch, ...this.intelligencePatterns.urgentKeywords.english];
    const foundUrgentWords = urgentWords.filter(word => reviewText.includes(word));
    score += foundUrgentWords.length * 0.3;

    // Rating weight (1-star = higher urgency)
    if (review.rating && review.rating.value) {
      score += (4 - review.rating.value) * 0.2; // 1-star=0.6, 2-star=0.4, 3-star=0.2
    }

    // Recent reviews are more urgent
    if (review.timestamp) {
      const daysAgo = (Date.now() - new Date(review.timestamp)) / (1000 * 60 * 60 * 24);
      if (daysAgo <= 3) score += 0.2; // Very recent
      if (daysAgo <= 1) score += 0.3; // Today/yesterday
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  categorizeIssues(review) {
    const reviewText = (review.text || '').toLowerCase();
    const categories = [];

    // Service issues
    const serviceWords = [...this.intelligencePatterns.serviceIssues.dutch, ...this.intelligencePatterns.serviceIssues.english];
    if (serviceWords.some(word => reviewText.includes(word))) {
      categories.push('service_quality');
    }

    // Quality issues
    const qualityWords = [...this.intelligencePatterns.qualityIssues.dutch, ...this.intelligencePatterns.qualityIssues.english];
    if (qualityWords.some(word => reviewText.includes(word))) {
      categories.push('product_quality');
    }

    // Pricing issues
    if (reviewText.includes('duur') || reviewText.includes('expensive') || reviewText.includes('prijs')) {
      categories.push('pricing');
    }

    // Staff issues
    if (reviewText.includes('personeel') || reviewText.includes('staff') || reviewText.includes('medewerker')) {
      categories.push('staff_behavior');
    }

    return categories;
  }

  analyzeSentiment(review) {
    const reviewText = (review.text || '').toLowerCase();

    // Simple sentiment analysis based on keyword counts
    const negativeWords = ['slecht', 'verschrikkelijk', 'terrible', 'awful', 'disappointing', 'poor'];
    const positiveWords = ['goed', 'excellent', 'great', 'fantastic', 'perfect', 'amazing'];

    const negativeCount = negativeWords.filter(word => reviewText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => reviewText.includes(word)).length;

    const sentimentScore = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);

    return {
      score: sentimentScore,
      confidence: Math.min((positiveCount + negativeCount) / 10, 1.0),
      classification: sentimentScore < -0.3 ? 'negative' : sentimentScore > 0.3 ? 'positive' : 'neutral'
    };
  }

  identifyCommonIssues(reviews) {
    const issueCount = {};

    reviews.forEach(review => {
      if (review.issueCategories) {
        review.issueCategories.forEach(category => {
          issueCount[category] = (issueCount[category] || 0) + 1;
        });
      }
    });

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 issues
      .map(([issue, count]) => ({ issue, count, percentage: (count / reviews.length * 100).toFixed(1) }));
  }

  async generateReviewAlert(business, analysis) {
    try {
      const alert = {
        timestamp: new Date().toISOString(),
        businessName: business.name,
        businessCID: business.cid,
        address: business.address,
        negativeReviews: analysis.negativeReviews.length,
        urgentReviews: analysis.negativeReviews.filter(r => r.urgencyScore > 0.7).length,
        timeframe: `last ${this.monitoringConfig.daysBack} days`,
        commonIssues: analysis.commonIssues,
        hasUrgentIssues: analysis.hasUrgentIssues,
        severity: analysis.hasUrgentIssues ? 'high' : 'medium'
      };

      // Store alert in history
      this.alertHistory.push(alert);

      // Emit urgent alert if needed
      if (alert.hasUrgentIssues) {
        this.emit('urgentReviewAlert', alert);
      }

      // Delegate to Reviews Intelligence Claude Code agent for detailed analysis
      await this.orchestrator.delegateToClaudeCode('reviews-intelligence-specialist', {
        task: 'analyze_negative_reviews',
        business: business,
        reviews: analysis.negativeReviews,
        alert: alert
      });

      console.log(`🚨 Generated alert for ${business.name}: ${analysis.negativeReviews.length} negative reviews`);

    } catch (error) {
      console.error(`❌ Alert generation failed for ${business.name}:`, error);
    }
  }

  async storeBusinessIntelligence(business, analysis) {
    try {
      // Store in crystalline memory for future analysis
      await this.crystallineMemory.storeMemoryNode('netherlands_reviews', {
        entityType: 'business_review_analysis',
        businessId: business.cid,
        businessName: business.name,
        analysisDate: new Date().toISOString(),
        negativeReviewCount: analysis.negativeReviews.length,
        commonIssues: analysis.commonIssues,
        urgencyLevel: analysis.hasUrgentIssues ? 'high' : 'low',
        location: business.address,
        category: business.category
      });

    } catch (error) {
      console.error(`❌ Memory storage failed for ${business.name}:`, error);
    }
  }

  // Public API methods for manual operations
  async searchBusinesses(keyword, location = 'Netherlands') {
    return await this.discoverBusinesses(keyword);
  }

  async analyzeBusinessReviews(cid) {
    const business = { cid };
    return await this.analyzeBusiness(business);
  }

  async getMonitoringStatus() {
    return {
      status: this.status,
      metrics: this.metrics,
      activeSessions: this.monitoringSessions.size,
      recentAlerts: this.alertHistory.slice(-10) // Last 10 alerts
    };
  }

  async stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.monitoringSessions.clear();
    this.status = 'stopped';

    console.log('⏹️ Reviews monitoring stopped');
  }
}

module.exports = ReviewsMonitor;