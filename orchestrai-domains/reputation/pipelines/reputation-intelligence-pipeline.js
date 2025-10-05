/**
 * ORCHESTRAI Reputation Intelligence Pipeline - Executable Implementation
 *
 * Complete reputation monitoring and intelligence workflow for Google Business Profile reviews.
 * Implements negative review monitoring, sentiment analysis, and competitive reputation intelligence.
 *
 * Stages:
 * 1. Business Discovery & Profiling - Find and profile businesses
 * 2. Review Collection & Filtering - Collect and filter reviews (1-3 stars)
 * 3. Sentiment Analysis & Categorization - Analyze sentiment and categorize issues
 * 4. Competitive Intelligence - Compare reputation metrics
 * 5. Action Recommendation Generation - Generate response strategies
 * 6. Memory Integration & Alerting - Store intelligence and create alerts
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class ReputationIntelligencePipeline extends EventEmitter {
  constructor(
    coordinationPatterns,
    dynamicAgentSelection,
    crystallineMemory,
    redis = null
  ) {
    super();

    this.coordinationPatterns = coordinationPatterns;
    this.dynamicAgentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;

    // Pipeline metadata
    this.pipelineId = 'reputation-intelligence';
    this.pipelineName = 'Reputation Intelligence Pipeline';
    this.version = '1.0.0';

    // Stage configuration
    this.stages = [
      'business_discovery',
      'review_collection',
      'sentiment_analysis',
      'competitive_intelligence',
      'action_recommendations',
      'memory_alerting'
    ];

    // Required agents
    this.requiredAgents = {
      'business_discovery': 'reviews-intelligence-specialist',
      'review_collection': 'reviews-intelligence-specialist',
      'sentiment_analysis': 'reviews-intelligence-specialist',
      'competitive_intelligence': 'reviews-intelligence-specialist',
      'action_recommendations': 'general-purpose',
      'memory_alerting': 'general-purpose'
    };

    // Netherlands location code (default)
    this.defaultLocationCode = 2528;

    console.log('⭐ Reputation Intelligence Pipeline initialized');
  }

  /**
   * Execute complete reputation intelligence pipeline
   */
  async execute(projectSpec, options = {}) {
    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();

    console.log(`\n🚀 Starting Reputation Intelligence Pipeline Execution: ${executionId}`);
    console.log(`   Client: ${projectSpec.clientName}`);
    console.log(`   Target Market: ${projectSpec.targetMarket || 'Netherlands'}`);
    console.log(`   Days Back: ${projectSpec.daysBack || 30}`);
    console.log(`   Review Filter: 1-3 stars (negative reviews)`);

    const execution = {
      executionId,
      pipelineId: this.pipelineId,
      projectSpec,
      options,
      startTime,
      currentStage: null,
      stageResults: {},
      deliverablePaths: {},
      performance: {
        stageTimings: {},
        agentPerformance: {}
      }
    };

    try {
      // Stage 1: Business Discovery & Profiling
      execution.currentStage = 'business_discovery';
      this.emit('stage-started', { executionId, stage: 'business_discovery' });
      const businessData = await this.executeBusinessDiscovery(execution, projectSpec);
      execution.stageResults.business_discovery = businessData;
      this.emit('stage-completed', { executionId, stage: 'business_discovery', result: businessData });

      // Stage 2: Review Collection & Filtering (1-3 stars)
      execution.currentStage = 'review_collection';
      this.emit('stage-started', { executionId, stage: 'review_collection' });
      const reviewData = await this.executeReviewCollection(execution, businessData, projectSpec);
      execution.stageResults.review_collection = reviewData;
      this.emit('stage-completed', { executionId, stage: 'review_collection', result: reviewData });

      // Stage 3: Sentiment Analysis & Categorization
      execution.currentStage = 'sentiment_analysis';
      this.emit('stage-started', { executionId, stage: 'sentiment_analysis' });
      const sentimentData = await this.executeSentimentAnalysis(execution, reviewData, projectSpec);
      execution.stageResults.sentiment_analysis = sentimentData;
      this.emit('stage-completed', { executionId, stage: 'sentiment_analysis', result: sentimentData });

      // Stage 4: Competitive Intelligence
      execution.currentStage = 'competitive_intelligence';
      this.emit('stage-started', { executionId, stage: 'competitive_intelligence' });
      const competitiveData = await this.executeCompetitiveIntelligence(execution, businessData, sentimentData, projectSpec);
      execution.stageResults.competitive_intelligence = competitiveData;
      this.emit('stage-completed', { executionId, stage: 'competitive_intelligence', result: competitiveData });

      // Stage 5: Action Recommendation Generation
      execution.currentStage = 'action_recommendations';
      this.emit('stage-started', { executionId, stage: 'action_recommendations' });
      const actionData = await this.executeActionRecommendations(execution, sentimentData, competitiveData, projectSpec);
      execution.stageResults.action_recommendations = actionData;
      this.emit('stage-completed', { executionId, stage: 'action_recommendations', result: actionData });

      // Stage 6: Memory Integration & Alerting
      execution.currentStage = 'memory_alerting';
      this.emit('stage-started', { executionId, stage: 'memory_alerting' });
      const alertingData = await this.executeMemoryAlerting(execution, actionData, projectSpec);
      execution.stageResults.memory_alerting = alertingData;
      this.emit('stage-completed', { executionId, stage: 'memory_alerting', result: alertingData });

      // Calculate execution metrics
      const duration = Date.now() - startTime;
      execution.duration = duration;
      execution.status = 'completed';

      console.log(`\n✅ Reputation Intelligence Pipeline Completed: ${executionId}`);
      console.log(`   Duration: ${Math.round(duration / 1000 / 60)} minutes`);
      console.log(`   Negative Reviews Analyzed: ${reviewData.negativeReviewCount || 0}`);
      console.log(`   Sentiment Categories: ${sentimentData.categoryCount || 0}`);

      this.emit('pipeline-completed', {
        executionId,
        duration,
        results: execution.stageResults,
        deliverables: execution.deliverablePaths
      });

      return {
        success: true,
        executionId,
        duration,
        results: execution.stageResults,
        deliverablePaths: execution.deliverablePaths,
        performance: execution.performance,
        reputationMetrics: {
          negativeReviewCount: reviewData.negativeReviewCount,
          averageRating: businessData.averageRating,
          sentimentCategories: sentimentData.categoryCount,
          urgentIssues: actionData.urgentIssueCount
        }
      };

    } catch (error) {
      console.error(`\n❌ Reputation Intelligence Pipeline Failed: ${executionId}`);
      console.error(`   Stage: ${execution.currentStage}`);
      console.error(`   Error:`, error.message);

      execution.status = 'failed';
      execution.error = error;

      this.emit('pipeline-failed', {
        executionId,
        stage: execution.currentStage,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Stage 1: Business Discovery & Profiling
   */
  async executeBusinessDiscovery(execution, projectSpec) {
    console.log('\n🔍 Stage 1: Business Discovery & Profiling');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.business_discovery,
      domain: 'reputation',
      capabilities: ['business-search', 'profile-analysis', 'gmb-data'],
      context: {
        businessName: projectSpec.clientName,
        location: projectSpec.targetMarket
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const businessPrompt = this.buildBusinessDiscoveryPrompt(projectSpec);

    const businessResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-business-discovery`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: businessPrompt,
      context: {
        businessName: projectSpec.clientName,
        location: projectSpec.targetMarket,
        locationCode: this.defaultLocationCode
      }
    });

    // Save business profile deliverables
    const deliverablePath = await this.saveBusinessProfileDeliverables(
      execution,
      businessResult,
      projectSpec
    );

    execution.deliverablePaths.businessProfile = deliverablePath;
    execution.performance.stageTimings.business_discovery = Date.now() - stageStart;

    console.log(`   ✅ Business profile created`);
    console.log(`   CID: ${businessResult.cid || 'N/A'}`);
    console.log(`   Rating: ${businessResult.rating || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      businessProfile: businessResult.businessProfile,
      cid: businessResult.cid,
      rating: businessResult.rating,
      reviewCount: businessResult.reviewCount,
      averageRating: businessResult.rating,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 2: Review Collection & Filtering (1-3 stars)
   */
  async executeReviewCollection(execution, businessData, projectSpec) {
    console.log('\n📊 Stage 2: Review Collection & Filtering (1-3 stars)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.review_collection,
      domain: 'reputation',
      capabilities: ['review-collection', 'review-filtering', 'negative-review-analysis'],
      context: {
        cid: businessData.cid,
        daysBack: projectSpec.daysBack || 30
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const reviewPrompt = this.buildReviewCollectionPrompt(
      businessData,
      projectSpec
    );

    const reviewResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-review-collection`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: reviewPrompt,
      context: {
        cid: businessData.cid,
        daysBack: projectSpec.daysBack || 30,
        maxRating: 3, // Filter for 1-3 star reviews
        locationCode: this.defaultLocationCode
      }
    });

    // Save review collection deliverables
    const deliverablePath = await this.saveReviewDeliverables(
      execution,
      reviewResult,
      projectSpec
    );

    execution.deliverablePaths.reviews = deliverablePath;
    execution.performance.stageTimings.review_collection = Date.now() - stageStart;

    console.log(`   ✅ Reviews collected and filtered`);
    console.log(`   Negative Reviews (1-3 stars): ${reviewResult.negativeReviewCount || 0}`);
    console.log(`   Date Range: ${reviewResult.dateRange || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      reviews: reviewResult.reviews,
      negativeReviewCount: reviewResult.negativeReviewCount,
      dateRange: reviewResult.dateRange,
      ratingDistribution: reviewResult.ratingDistribution,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 3: Sentiment Analysis & Categorization
   */
  async executeSentimentAnalysis(execution, reviewData, projectSpec) {
    console.log('\n🔬 Stage 3: Sentiment Analysis & Categorization');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.sentiment_analysis,
      domain: 'reputation',
      capabilities: ['sentiment-analysis', 'issue-categorization', 'trend-detection'],
      context: {
        reviews: reviewData.reviews,
        language: projectSpec.language || 'Dutch'
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const sentimentPrompt = this.buildSentimentAnalysisPrompt(
      reviewData,
      projectSpec
    );

    const sentimentResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-sentiment-analysis`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: sentimentPrompt,
      context: {
        reviews: reviewData.reviews,
        language: projectSpec.language || 'Dutch'
      }
    });

    // Save sentiment analysis deliverables
    const deliverablePath = await this.saveSentimentDeliverables(
      execution,
      sentimentResult,
      projectSpec
    );

    execution.deliverablePaths.sentiment = deliverablePath;
    execution.performance.stageTimings.sentiment_analysis = Date.now() - stageStart;

    console.log(`   ✅ Sentiment analysis completed`);
    console.log(`   Categories: ${sentimentResult.categoryCount || 0}`);
    console.log(`   Recurring Issues: ${sentimentResult.recurringIssueCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      sentimentCategories: sentimentResult.sentimentCategories,
      recurringIssues: sentimentResult.recurringIssues,
      emotionalTriggers: sentimentResult.emotionalTriggers,
      categoryCount: sentimentResult.categoryCount,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 4: Competitive Intelligence
   */
  async executeCompetitiveIntelligence(execution, businessData, sentimentData, projectSpec) {
    console.log('\n🏆 Stage 4: Competitive Reputation Intelligence');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.competitive_intelligence,
      domain: 'reputation',
      capabilities: ['competitive-analysis', 'reputation-benchmarking', 'market-intelligence'],
      context: {
        businessProfile: businessData.businessProfile,
        industry: projectSpec.industry
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Search for competitor businesses
    const competitors = await this.findCompetitorBusinesses(businessData, projectSpec);

    const competitivePrompt = this.buildCompetitiveIntelligencePrompt(
      businessData,
      sentimentData,
      competitors,
      projectSpec
    );

    const competitiveResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-competitive-intelligence`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: competitivePrompt,
      context: {
        businessProfile: businessData.businessProfile,
        sentimentData,
        competitors
      }
    });

    // Save competitive intelligence deliverables
    const deliverablePath = await this.saveCompetitiveDeliverables(
      execution,
      competitiveResult,
      projectSpec
    );

    execution.deliverablePaths.competitive = deliverablePath;
    execution.performance.stageTimings.competitive_intelligence = Date.now() - stageStart;

    console.log(`   ✅ Competitive intelligence completed`);
    console.log(`   Competitors Analyzed: ${competitiveResult.competitorCount || 0}`);
    console.log(`   Market Position: ${competitiveResult.marketPosition || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      competitorAnalysis: competitiveResult.competitorAnalysis,
      benchmarkMetrics: competitiveResult.benchmarkMetrics,
      marketPosition: competitiveResult.marketPosition,
      competitiveAdvantages: competitiveResult.competitiveAdvantages,
      competitorCount: competitiveResult.competitorCount,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 5: Action Recommendation Generation
   */
  async executeActionRecommendations(execution, sentimentData, competitiveData, projectSpec) {
    console.log('\n💡 Stage 5: Action Recommendation Generation');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.action_recommendations,
      domain: 'reputation',
      capabilities: ['response-strategy', 'action-planning', 'crisis-management'],
      context: {
        sentimentCategories: sentimentData.sentimentCategories,
        competitorAnalysis: competitiveData.competitorAnalysis
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const actionPrompt = this.buildActionRecommendationPrompt(
      sentimentData,
      competitiveData,
      projectSpec
    );

    const actionResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-action-recommendations`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: actionPrompt,
      context: {
        sentimentData,
        competitiveData,
        language: projectSpec.language || 'Dutch'
      }
    });

    // Save action recommendations deliverables
    const deliverablePath = await this.saveActionDeliverables(
      execution,
      actionResult,
      projectSpec
    );

    execution.deliverablePaths.actions = deliverablePath;
    execution.performance.stageTimings.action_recommendations = Date.now() - stageStart;

    console.log(`   ✅ Action recommendations generated`);
    console.log(`   Response Templates: ${actionResult.responseTemplateCount || 0}`);
    console.log(`   Urgent Issues: ${actionResult.urgentIssueCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      responseTemplates: actionResult.responseTemplates,
      urgentActions: actionResult.urgentActions,
      preventiveMeasures: actionResult.preventiveMeasures,
      responseTemplateCount: actionResult.responseTemplateCount,
      urgentIssueCount: actionResult.urgentIssueCount,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 6: Memory Integration & Alerting
   */
  async executeMemoryAlerting(execution, actionData, projectSpec) {
    console.log('\n🔔 Stage 6: Memory Integration & Alerting');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.memory_alerting,
      domain: 'reputation',
      capabilities: ['memory-integration', 'alert-configuration', 'knowledge-graph'],
      context: {
        urgentActions: actionData.urgentActions,
        clientName: projectSpec.clientName
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Store reputation intelligence in crystalline memory
    await this.storeReputationIntelligence(execution, projectSpec);

    // Create memory relations
    await this.createReputationMemoryRelations(execution, projectSpec);

    const alertingPrompt = this.buildMemoryAlertingPrompt(
      execution.stageResults,
      projectSpec
    );

    const alertingResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-memory-alerting`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: alertingPrompt,
      context: {
        stageResults: execution.stageResults,
        clientName: projectSpec.clientName
      }
    });

    // Save alerting configuration deliverables
    const deliverablePath = await this.saveAlertingDeliverables(
      execution,
      alertingResult,
      projectSpec
    );

    execution.deliverablePaths.alerting = deliverablePath;
    execution.performance.stageTimings.memory_alerting = Date.now() - stageStart;

    console.log(`   ✅ Memory integration and alerting completed`);
    console.log(`   Alert Rules: ${alertingResult.alertRuleCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      alertConfiguration: alertingResult.alertConfiguration,
      memoryEntities: alertingResult.memoryEntities,
      alertRuleCount: alertingResult.alertRuleCount,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Helper: Find competitor businesses
   */
  async findCompetitorBusinesses(businessData, projectSpec) {
    // In production, this would use DataForSEO business_data_search MCP
    // For now, return mock competitor data
    return {
      competitors: [
        {
          name: `Competitor 1 in ${projectSpec.targetMarket}`,
          rating: 4.2,
          reviewCount: 150
        },
        {
          name: `Competitor 2 in ${projectSpec.targetMarket}`,
          rating: 4.5,
          reviewCount: 200
        },
        {
          name: `Competitor 3 in ${projectSpec.targetMarket}`,
          rating: 3.8,
          reviewCount: 120
        }
      ]
    };
  }

  /**
   * Helper: Store reputation intelligence in crystalline memory
   */
  async storeReputationIntelligence(execution, projectSpec) {
    if (!this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeMemory({
        entity_type: 'reputation-intelligence',
        entity_name: `${projectSpec.clientName}-reputation-${Date.now()}`,
        content: execution.stageResults,
        semantic_tags: ['reputation', 'reviews', 'sentiment-analysis', 'competitive-intelligence'],
        metadata: {
          executionId: execution.executionId,
          timestamp: Date.now(),
          targetMarket: projectSpec.targetMarket,
          daysBack: projectSpec.daysBack,
          negativeReviewCount: execution.stageResults.review_collection?.negativeReviewCount || 0
        }
      });

      console.log('   💾 Reputation intelligence stored in crystalline memory');
    } catch (error) {
      console.warn('Could not store reputation intelligence in memory:', error.message);
    }
  }

  /**
   * Helper: Create reputation memory relations
   */
  async createReputationMemoryRelations(execution, projectSpec) {
    if (!this.crystallineMemory) return;

    try {
      // Create relation to business profile
      await this.crystallineMemory.createRelation({
        from: `${projectSpec.clientName}-reputation-${Date.now()}`,
        to: projectSpec.clientName,
        relationType: 'reputation-analysis-for'
      });

      // Create relations to sentiment categories
      const categories = execution.stageResults.sentiment_analysis?.sentimentCategories || [];
      for (const category of categories) {
        await this.crystallineMemory.createRelation({
          from: `${projectSpec.clientName}-reputation-${Date.now()}`,
          to: category.name,
          relationType: 'identifies-sentiment-category'
        });
      }

      console.log('   🔗 Reputation memory relations created');
    } catch (error) {
      console.warn('Could not create reputation memory relations:', error.message);
    }
  }

  /**
   * Prompt Builders
   */
  buildBusinessDiscoveryPrompt(projectSpec) {
    return `Discover and profile Google Business Profile for ${projectSpec.clientName} in ${projectSpec.targetMarket || 'Netherlands'}.

**Search Parameters:**
- Business Name: ${projectSpec.clientName}
- Location: ${projectSpec.targetMarket || 'Netherlands'}
- Language: ${projectSpec.language || 'Dutch'}

**Required Business Profile Data:**
1. **Core Information**:
   - Business CID (Client ID)
   - Business name
   - Address and location
   - Phone number
   - Website URL
   - Business category

2. **Reputation Metrics**:
   - Overall rating (1-5 stars)
   - Total review count
   - Rating distribution (5-star, 4-star, 3-star, 2-star, 1-star)
   - Recent rating trend

3. **Business Attributes**:
   - Hours of operation
   - Service areas
   - Business type
   - Verification status

4. **Review Summary**:
   - Most recent reviews preview
   - Common topics mentioned
   - Review response rate

Use DataForSEO business_data_search and business_data_info MCPs to gather this data.`;
  }

  buildReviewCollectionPrompt(businessData, projectSpec) {
    return `Collect and filter negative reviews (1-3 stars) for ${projectSpec.clientName}.

**Business Profile:**
${JSON.stringify(businessData.businessProfile, null, 2)}

**Collection Parameters:**
- CID: ${businessData.cid}
- Days Back: ${projectSpec.daysBack || 30}
- Rating Filter: 1-3 stars (negative reviews only)
- Sort: Most recent first
- Language: ${projectSpec.language || 'Dutch'}

**Required Review Data:**
1. **Review Details** (for each review):
   - Review ID
   - Author name and profile
   - Rating (1-3 stars)
   - Review text (full content)
   - Review date
   - Response status (replied/not replied)
   - Response text (if exists)

2. **Review Statistics**:
   - Total negative reviews collected
   - Date range coverage
   - Rating distribution (1-star count, 2-star count, 3-star count)
   - Average rating of negative reviews
   - Response rate percentage

3. **Review Metadata**:
   - Language detection
   - Review length (word count)
   - Verified purchase status
   - Review helpfulness metrics

Use DataForSEO business_data_reviews_filtered MCP with max_rating=3 and days_back=${projectSpec.daysBack || 30}.`;
  }

  buildSentimentAnalysisPrompt(reviewData, projectSpec) {
    return `Analyze sentiment and categorize issues from negative reviews for ${projectSpec.clientName}.

**Negative Reviews:**
${JSON.stringify(reviewData.reviews, null, 2)}

**Analysis Requirements:**
1. **Sentiment Categorization**:
   - Service quality issues
   - Product quality issues
   - Staff behavior concerns
   - Pricing complaints
   - Wait time/availability issues
   - Facility/cleanliness issues
   - Communication problems
   - Other recurring themes

2. **Issue Frequency Analysis**:
   - Count mentions per category
   - Identify top 5 recurring issues
   - Track issue severity (critical, moderate, minor)
   - Detect emerging patterns

3. **Emotional Trigger Analysis**:
   - Primary emotions expressed (anger, frustration, disappointment, etc.)
   - Emotional intensity per category
   - Pain point identification
   - Unmet expectations

4. **Temporal Patterns**:
   - Issue trends over time period
   - Day-of-week patterns
   - Seasonal variations
   - Recent spikes or drops

5. **Response Gap Analysis**:
   - Reviews without responses
   - Response time analysis
   - Response quality assessment
   - Engagement opportunities

Provide detailed sentiment analysis with actionable insights for reputation management.`;
  }

  buildCompetitiveIntelligencePrompt(businessData, sentimentData, competitors, projectSpec) {
    return `Conduct competitive reputation intelligence analysis for ${projectSpec.clientName}.

**Business Profile:**
${JSON.stringify(businessData.businessProfile, null, 2)}

**Sentiment Analysis:**
${JSON.stringify(sentimentData.sentimentCategories, null, 2)}

**Competitor Data:**
${JSON.stringify(competitors, null, 2)}

**Competitive Analysis Requirements:**
1. **Reputation Benchmarking**:
   - Compare overall ratings
   - Compare review counts
   - Compare rating distributions
   - Compare response rates
   - Identify reputation leaders

2. **Issue Comparison**:
   - Compare common complaint categories
   - Identify unique issues (client-specific vs. industry-wide)
   - Benchmark issue frequency
   - Competitive pain point analysis

3. **Market Position Assessment**:
   - Reputation ranking in market
   - Competitive advantages (what client does better)
   - Competitive gaps (where competitors excel)
   - Reputation improvement opportunities

4. **Best Practice Identification**:
   - Competitor response strategies
   - Issue resolution approaches
   - Customer engagement tactics
   - Service differentiation insights

5. **Strategic Recommendations**:
   - Quick wins (easy reputation improvements)
   - Long-term reputation strategies
   - Competitive differentiation opportunities
   - Market positioning refinement

Provide comprehensive competitive reputation intelligence.`;
  }

  buildActionRecommendationPrompt(sentimentData, competitiveData, projectSpec) {
    return `Generate actionable recommendations and response strategies for ${projectSpec.clientName}.

**Sentiment Analysis:**
${JSON.stringify(sentimentData, null, 2)}

**Competitive Intelligence:**
${JSON.stringify(competitiveData, null, 2)}

**Language:** ${projectSpec.language || 'Dutch'}

**Required Action Recommendations:**
1. **Response Templates** (in ${projectSpec.language}):
   - Template for service quality complaints
   - Template for pricing concerns
   - Template for staff behavior issues
   - Template for wait time complaints
   - Template for facility/cleanliness concerns
   - General empathy-based response template

2. **Urgent Action Items**:
   - Critical issues requiring immediate attention
   - Reviews requiring urgent responses
   - Crisis management priorities
   - Escalation procedures

3. **Preventive Measures**:
   - Root cause analysis for recurring issues
   - Process improvement recommendations
   - Staff training suggestions
   - Quality control enhancements
   - Communication protocol improvements

4. **Response Strategy**:
   - Prioritization framework (which reviews to respond to first)
   - Response timing recommendations
   - Tone and voice guidelines
   - Escalation criteria

5. **Long-term Reputation Strategy**:
   - Review generation campaigns
   - Customer satisfaction initiatives
   - Service excellence programs
   - Competitive differentiation tactics

Provide complete action plan ready for immediate implementation.`;
  }

  buildMemoryAlertingPrompt(stageResults, projectSpec) {
    return `Configure memory integration and alerting system for ${projectSpec.clientName} reputation intelligence.

**Pipeline Results:**
${JSON.stringify(stageResults, null, 2)}

**Required Configuration:**
1. **Memory Entity Documentation**:
   - Reputation intelligence entity details
   - Sentiment category entities
   - Issue tracking entities
   - Competitive benchmark entities

2. **Memory Relation Mapping**:
   - Business profile relations
   - Sentiment category relations
   - Competitor relations
   - Issue category relations

3. **Alert Rule Configuration**:
   - New negative review alert (1-3 stars)
   - Critical issue alert (severity-based)
   - Response SLA breach alert
   - Competitive benchmark change alert
   - Rating drop alert (threshold-based)

4. **Alert Delivery Settings**:
   - Alert channel configuration (email, SMS, dashboard)
   - Alert frequency (real-time, daily digest, weekly summary)
   - Alert recipient configuration
   - Alert priority levels

5. **Monitoring Dashboard Setup**:
   - Key metrics to track
   - Visualization recommendations
   - Report automation schedule
   - Data refresh intervals

Provide complete alerting and monitoring configuration.`;
  }

  /**
   * Deliverable Savers
   */
  async saveBusinessProfileDeliverables(execution, businessResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/reputation/business-profiles'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const businessFile = path.join(deliverablePath, 'business-profile.json');
    await fs.writeFile(
      businessFile,
      JSON.stringify(businessResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Business profile saved: ${businessFile}`);
    return deliverablePath;
  }

  async saveReviewDeliverables(execution, reviewResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/reputation/reviews'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const reviewFile = path.join(deliverablePath, 'negative-reviews.json');
    await fs.writeFile(
      reviewFile,
      JSON.stringify(reviewResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Reviews saved: ${reviewFile}`);
    return deliverablePath;
  }

  async saveSentimentDeliverables(execution, sentimentResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/reputation/sentiment-analysis'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const sentimentFile = path.join(deliverablePath, 'sentiment-analysis.json');
    await fs.writeFile(
      sentimentFile,
      JSON.stringify(sentimentResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Sentiment analysis saved: ${sentimentFile}`);
    return deliverablePath;
  }

  async saveCompetitiveDeliverables(execution, competitiveResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/reputation/competitive-intelligence'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const competitiveFile = path.join(deliverablePath, 'competitive-analysis.json');
    await fs.writeFile(
      competitiveFile,
      JSON.stringify(competitiveResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Competitive intelligence saved: ${competitiveFile}`);
    return deliverablePath;
  }

  async saveActionDeliverables(execution, actionResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/reputation/action-recommendations'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const actionFile = path.join(deliverablePath, 'action-recommendations.json');
    await fs.writeFile(
      actionFile,
      JSON.stringify(actionResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Action recommendations saved: ${actionFile}`);
    return deliverablePath;
  }

  async saveAlertingDeliverables(execution, alertingResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/reputation/alerting'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const alertingFile = path.join(deliverablePath, 'alert-configuration.json');
    await fs.writeFile(
      alertingFile,
      JSON.stringify(alertingResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Alerting configuration saved: ${alertingFile}`);
    return deliverablePath;
  }

  /**
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      pipelineId: this.pipelineId,
      pipelineName: this.pipelineName,
      version: this.version,
      stages: this.stages,
      estimatedDuration: 60, // minutes (1 hour)
      requiredAgents: this.requiredAgents,
      coordinationPattern: 'event-driven' // Reactive to review monitoring
    };
  }
}

module.exports = ReputationIntelligencePipeline;
