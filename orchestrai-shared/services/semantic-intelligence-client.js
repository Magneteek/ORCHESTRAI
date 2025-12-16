/**
 * Semantic Intelligence Client
 *
 * Unified client for accessing both semantic intelligence services:
 * - ORCHESTRAI ML Service (port 8000): Agent selection & prediction
 * - VAIBE-SEMANTIC (port 8001): NLP & semantic analysis
 *
 * This client provides a single interface for all semantic operations,
 * automatically routing requests to the appropriate service.
 */

const axios = require('axios');

// Simple console logger
const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
};

class SemanticIntelligenceClient {
  constructor() {
    // Service URLs
    this.mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.vaibeSemanticURL = process.env.VAIBE_SEMANTIC_URL || 'http://localhost:8001';

    // Timeouts
    this.defaultTimeout = 30000; // 30 seconds
    this.mlTimeout = 10000; // 10 seconds for ML predictions
    this.nlpTimeout = 45000; // 45 seconds for heavy NLP tasks

    // Health check cache
    this.healthStatus = {
      mlService: null,
      vaibeEngine: null,
      lastCheck: null
    };

    logger.info('Semantic Intelligence Client initialized', {
      mlServiceURL: this.mlServiceURL,
      vaibeSemanticURL: this.vaibeSemanticURL
    });
  }

  // ========================================
  // Health & Status
  // ========================================

  /**
   * Check health of both services
   */
  async checkHealth() {
    try {
      const [mlHealth, vaibeHealth] = await Promise.allSettled([
        axios.get(`${this.mlServiceURL}/health`, { timeout: 5000 }),
        axios.get(`${this.vaibeSemanticURL}/health`, { timeout: 5000 })
      ]);

      this.healthStatus = {
        mlService: mlHealth.status === 'fulfilled' ? mlHealth.value.data : null,
        vaibeEngine: vaibeHealth.status === 'fulfilled' ? vaibeHealth.value.data : null,
        lastCheck: new Date().toISOString()
      };

      const isHealthy = mlHealth.status === 'fulfilled' && vaibeHealth.status === 'fulfilled';

      logger.info('Semantic services health check', {
        mlService: mlHealth.status,
        vaibeEngine: vaibeHealth.status,
        healthy: isHealthy
      });

      return {
        healthy: isHealthy,
        services: this.healthStatus
      };
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      throw new Error(`Semantic services health check failed: ${error.message}`);
    }
  }

  /**
   * Check if services are available
   */
  async isAvailable() {
    const health = await this.checkHealth();
    return health.healthy;
  }

  // ========================================
  // ORCHESTRAI ML Service (Port 8000)
  // ========================================

  /**
   * Select best agent for a task using ML prediction
   *
   * @param {Object} taskContext - Task information
   * @param {string} taskContext.task - Task description
   * @param {string} taskContext.domain - Domain (e.g., 'client-intelligence')
   * @param {string} taskContext.complexity - Complexity level
   * @param {Array<string>} taskContext.required_capabilities - Required capabilities
   * @returns {Promise<Object>} Agent selection with confidence scores
   */
  async selectAgent(taskContext) {
    try {
      logger.debug('ML Agent Selection', { taskContext });

      const response = await axios.post(
        `${this.mlServiceURL}/api/v1/agent-selection`,
        taskContext,
        { timeout: this.mlTimeout }
      );

      logger.info('Agent selected by ML', {
        agent: response.data.agent_id,
        confidence: response.data.confidence
      });

      return response.data;
    } catch (error) {
      logger.error('ML agent selection failed', { error: error.message });

      // Fallback: Return null to let caller handle gracefully
      return null;
    }
  }

  /**
   * Predict performance for an agent on a task
   */
  async predictPerformance(agentId, taskContext) {
    try {
      const response = await axios.post(
        `${this.mlServiceURL}/api/v1/performance-prediction`,
        { agent_id: agentId, task_context: taskContext },
        { timeout: this.mlTimeout }
      );

      return response.data;
    } catch (error) {
      logger.error('Performance prediction failed', { error: error.message });
      return null;
    }
  }

  // ========================================
  // VAIBE-SEMANTIC (Port 8001)
  // ========================================

  /**
   * Extract entities from text using spaCy
   *
   * @param {string} text - Text to analyze
   * @param {Object} options - Analysis options
   * @param {Array<string>} options.entityTypes - Entity types to extract
   * @param {boolean} options.includeSentiment - Include sentiment analysis
   * @returns {Promise<Object>} Extracted entities with confidence scores
   */
  async extractEntities(text, options = {}) {
    try {
      logger.debug('Entity extraction', { textLength: text.length });

      const response = await axios.post(
        `${this.vaibeSemanticURL}/api/analyze/entities`,
        {
          text,
          entity_types: options.entityTypes || ['PERSON', 'ORG', 'PRODUCT', 'GPE', 'CONCEPT'],
          include_sentiment: options.includeSentiment !== false
        },
        { timeout: this.nlpTimeout }
      );

      logger.info('Entities extracted', {
        count: response.data.entities?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Entity extraction failed', { error: error.message });
      throw new Error(`Entity extraction failed: ${error.message}`);
    }
  }

  /**
   * Perform topic modeling on documents
   *
   * @param {Array<string>} documents - Documents to analyze
   * @param {Object} options - Modeling options
   * @param {number} options.numTopics - Number of topics to extract
   * @param {string} options.method - Method: 'lsa', 'lda', or 'nmf'
   * @returns {Promise<Object>} Identified topics with keywords
   */
  async modelTopics(documents, options = {}) {
    try {
      logger.debug('Topic modeling', {
        documentCount: documents.length,
        method: options.method || 'lsa'
      });

      const response = await axios.post(
        `${this.vaibeSemanticURL}/api/analyze/topics`,
        {
          documents,
          num_topics: options.numTopics || 5,
          method: options.method || 'lsa',
          include_keywords: true,
          coherence_score: true
        },
        { timeout: this.nlpTimeout }
      );

      logger.info('Topics modeled', {
        topicCount: response.data.topics?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Topic modeling failed', { error: error.message });
      throw new Error(`Topic modeling failed: ${error.message}`);
    }
  }

  /**
   * Classify search intent
   *
   * @param {string} query - Search query
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Intent classification with confidence
   */
  async classifyIntent(query, context = {}) {
    try {
      logger.debug('Intent classification', { query });

      const response = await axios.post(
        `${this.vaibeSemanticURL}/api/analyze/intent`,
        {
          query,
          context,
          include_confidence: true,
          multi_label: false
        },
        { timeout: this.nlpTimeout }
      );

      logger.info('Intent classified', {
        intent: response.data.intent,
        confidence: response.data.confidence
      });

      return response.data;
    } catch (error) {
      logger.error('Intent classification failed', { error: error.message });
      throw new Error(`Intent classification failed: ${error.message}`);
    }
  }

  /**
   * Detect content gaps compared to competitors
   *
   * @param {string} myContent - Your content
   * @param {string} competitorContent - Competitor's content
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Identified gaps and recommendations
   */
  async detectGaps(myContent, competitorContent, options = {}) {
    try {
      logger.debug('Gap detection', {
        myContentLength: myContent.length,
        competitorContentLength: competitorContent.length
      });

      const response = await axios.post(
        `${this.vaibeSemanticURL}/api/analyze/gaps`,
        {
          my_content: myContent,
          competitor_content: competitorContent,
          gap_types: options.gapTypes || ['topics', 'entities', 'depth'],
          include_recommendations: true
        },
        { timeout: this.nlpTimeout }
      );

      logger.info('Gaps detected', {
        topicGaps: response.data.topic_gaps?.length || 0,
        entityGaps: response.data.entity_gaps?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Gap detection failed', { error: error.message });
      throw new Error(`Gap detection failed: ${error.message}`);
    }
  }

  /**
   * Get semantic dashboard metrics
   *
   * @param {string} topic - Topic to analyze
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardMetrics(topic) {
    try {
      const response = await axios.get(
        `${this.vaibeSemanticURL}/api/dashboard/metrics`,
        {
          params: { topic },
          timeout: this.defaultTimeout
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Dashboard metrics failed', { error: error.message });
      throw new Error(`Dashboard metrics failed: ${error.message}`);
    }
  }

  // ========================================
  // High-Level Semantic Operations
  // ========================================

  /**
   * Complete semantic psychographic analysis
   * Combines ML agent selection with VAIBE semantic analysis
   *
   * @param {Object} segmentData - Psychographic segment data
   * @returns {Promise<Object>} Complete semantic profile
   */
  async analyzeSegmentSemantics(segmentData) {
    try {
      logger.info('Starting semantic segment analysis', {
        segment: segmentData.segmentName
      });

      // Step 1: Ask ML which agent would be best
      const agentSelection = await this.selectAgent({
        task: 'psychographic semantic analysis',
        domain: 'client-intelligence',
        complexity: 'high',
        required_capabilities: ['semantic-analysis', 'psychographic-profiling']
      });

      // Step 2: Use VAIBE for deep semantic analysis
      const [entities, topics, intentPatterns] = await Promise.all([
        this.extractEntities(
          [...segmentData.painPoints, ...segmentData.motivations].join('. ')
        ),
        this.modelTopics([
          ...segmentData.painPoints,
          ...segmentData.motivations,
          ...(segmentData.contentSamples || [])
        ]),
        Promise.all(
          segmentData.painPoints.map(pain => this.classifyIntent(pain))
        )
      ]);

      // Step 3: Synthesize results
      const semanticProfile = {
        segmentName: segmentData.segmentName,
        mlPrediction: agentSelection,
        entities: entities.entities || [],
        sentiment: entities.sentiment || {},
        topics: topics.topics || [],
        topicCoherence: topics.topics?.map(t => t.coherence).reduce((a, b) => a + b, 0) / (topics.topics?.length || 1),
        intentPatterns: {
          dominant: this._findDominantIntent(intentPatterns),
          distribution: this._calculateIntentDistribution(intentPatterns),
          all: intentPatterns
        },
        emotionalClusters: this._extractEmotionalClusters(entities.sentiment),
        generatedAt: new Date().toISOString()
      };

      logger.info('Semantic segment analysis complete', {
        segment: segmentData.segmentName,
        entityCount: semanticProfile.entities.length,
        topicCount: semanticProfile.topics.length
      });

      return semanticProfile;

    } catch (error) {
      logger.error('Segment semantic analysis failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Enhanced keyword research with semantic clustering
   */
  async enhanceKeywordResearch(keywords, context = {}) {
    try {
      logger.info('Semantic keyword enhancement', { keywordCount: keywords.length });

      // Extract topics from keyword set
      const topics = await this.modelTopics(keywords, { numTopics: 5 });

      // Classify intent for each keyword
      const intentAnalysis = await Promise.all(
        keywords.slice(0, 20).map(kw => this.classifyIntent(kw)) // Limit to 20 to avoid timeout
      );

      return {
        keywords,
        semanticClusters: topics.topics,
        intentDistribution: this._calculateIntentDistribution(intentAnalysis),
        recommendations: this._generateKeywordRecommendations(topics, intentAnalysis)
      };

    } catch (error) {
      logger.error('Keyword semantic enhancement failed', { error: error.message });
      throw error;
    }
  }

  // ========================================
  // Helper Methods
  // ========================================

  _findDominantIntent(intentPatterns) {
    if (!intentPatterns || intentPatterns.length === 0) return null;

    const intentCounts = {};
    intentPatterns.forEach(pattern => {
      if (pattern && pattern.intent) {
        intentCounts[pattern.intent] = (intentCounts[pattern.intent] || 0) + 1;
      }
    });

    return Object.keys(intentCounts).reduce((a, b) =>
      intentCounts[a] > intentCounts[b] ? a : b
    );
  }

  _calculateIntentDistribution(intentPatterns) {
    if (!intentPatterns || intentPatterns.length === 0) return {};

    const total = intentPatterns.length;
    const distribution = {};

    intentPatterns.forEach(pattern => {
      if (pattern && pattern.intent) {
        distribution[pattern.intent] = (distribution[pattern.intent] || 0) + 1;
      }
    });

    Object.keys(distribution).forEach(key => {
      distribution[key] = parseFloat((distribution[key] / total).toFixed(2));
    });

    return distribution;
  }

  _extractEmotionalClusters(sentiment) {
    if (!sentiment) return {};

    return {
      polarity: sentiment.polarity || 0,
      subjectivity: sentiment.subjectivity || 0,
      emotional_intensity: Math.abs(sentiment.polarity || 0) * (sentiment.subjectivity || 0)
    };
  }

  _generateKeywordRecommendations(topics, intentAnalysis) {
    const recommendations = [];

    // Recommend keywords based on topic coherence
    if (topics && topics.topics) {
      const highCoherenceTopics = topics.topics
        .filter(t => t.coherence > 0.7)
        .slice(0, 3);

      if (highCoherenceTopics.length > 0) {
        recommendations.push({
          type: 'topic-cluster',
          message: `Focus on high-coherence topics: ${highCoherenceTopics.map(t => t.keywords?.slice(0, 2).join(', ')).join('; ')}`,
          priority: 'high'
        });
      }
    }

    // Recommend based on intent distribution
    const intentDist = this._calculateIntentDistribution(intentAnalysis);
    const dominantIntent = Object.keys(intentDist).reduce((a, b) =>
      intentDist[a] > intentDist[b] ? a : b, null
    );

    if (dominantIntent) {
      recommendations.push({
        type: 'intent-optimization',
        message: `Primary search intent is "${dominantIntent}" (${(intentDist[dominantIntent] * 100).toFixed(0)}%)`,
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
let instance = null;

module.exports = {
  getSemanticClient: () => {
    if (!instance) {
      instance = new SemanticIntelligenceClient();
    }
    return instance;
  },
  SemanticIntelligenceClient
};
