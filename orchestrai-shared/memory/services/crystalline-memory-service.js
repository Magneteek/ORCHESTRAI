/**
 * Crystalline Memory Service - Business Logic Layer
 *
 * Provides core business logic for memory operations including pattern recognition,
 * performance tracking, confidence scoring, and semantic analysis.
 *
 * Consolidates from:
 * - performance-memory-schema.js (schema definitions, pattern recognition)
 * - Parts of co-learning-memory-pool.js (pattern extraction)
 * - Business logic from crystalline-memory-system.js
 *
 * Design Pattern: Service Layer
 * - Business logic independent of data access implementation
 * - Reusable across different storage backends
 * - Testable with mock repositories
 *
 * Features:
 * - Performance node creation and tracking
 * - Learning pattern identification
 * - Success/failure factor extraction
 * - Context fingerprinting for matching
 * - Confidence and importance scoring
 * - Semantic keyword extraction
 */

const EventEmitter = require('events');
const logger = require('../../logging/logger').forAgent('crystalline-memory-service', 'memory');
const { ValidationError } = require('../../errors/typed-errors');
const { z } = require('../../validation/schemas');

/**
 * Task Context Schema
 */
const TaskContextSchema = z.object({
  type: z.string().optional().default('unknown'),
  domain: z.string().optional().default('general'),
  complexity: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  description: z.string().optional().default(''),
  clientContext: z.string().optional(),
  projectPhase: z.string().optional(),
  sessionId: z.string().optional(),
  workflowId: z.string().optional(),
  correlationIds: z.array(z.string()).optional().default([])
});

/**
 * Performance Metrics Schema
 */
const PerformanceMetricsSchema = z.object({
  successRate: z.number().min(0).max(1).optional().default(0),
  executionTime: z.number().min(0).optional().default(0),
  tokenUsage: z.number().min(0).optional().default(0),
  errorCount: z.number().int().min(0).optional().default(0),
  qualityScore: z.number().min(0).max(1).optional().default(0),
  userSatisfaction: z.number().min(0).max(1).optional(),
  resourceUtilization: z.number().min(0).max(1).optional().default(0)
});

/**
 * Outcome Analysis Schema
 */
const OutcomeAnalysisSchema = z.object({
  success: z.boolean(),
  completionStatus: z.enum(['complete', 'partial', 'failed']).optional().default('partial'),
  errorTypes: z.array(z.string()).optional().default([]),
  recoveryActions: z.array(z.string()).optional().default([]),
  qualityGates: z.array(z.string()).optional().default([]),
  userFeedback: z.string().optional()
});

class CrystallineMemoryService extends EventEmitter {
  constructor(repository, config = {}) {
    super();

    if (!repository) {
      throw new ValidationError(
        'Memory repository is required',
        [{ field: 'repository', message: 'Repository cannot be null or undefined' }]
      );
    }

    this.repository = repository;
    this.config = {
      confidenceThresholds: {
        high: 0.85,
        medium: 0.65,
        low: 0.45
      },
      minPatternFrequency: 3,
      maxPatternExamples: 10,
      ...config
    };

    // Pattern tracking
    this.patterns = {
      successful: new Map(), // pattern hash → { count, examples }
      failed: new Map(),
      emerging: []
    };

    // Performance buffer for aggregation
    this.performanceBuffer = new Map();

    this.logger = logger;

    this.logger.info('Crystalline Memory Service initialized', {
      confidenceThresholds: this.config.confidenceThresholds,
      minPatternFrequency: this.config.minPatternFrequency
    });
  }

  // ============ PERFORMANCE NODE CREATION ============

  /**
   * Create performance memory node
   *
   * @param {string} agentId - Agent identifier
   * @param {Object} taskContext - Task context information
   * @param {Object} metrics - Performance metrics
   * @param {Object} outcome - Outcome analysis
   * @returns {Promise<Object>} Created node data
   */
  async createPerformanceNode(agentId, taskContext, metrics, outcome) {
    try {
      // Validate inputs
      const validatedContext = TaskContextSchema.parse(taskContext);
      const validatedMetrics = PerformanceMetricsSchema.parse(metrics);
      const validatedOutcome = OutcomeAnalysisSchema.parse(outcome);

      // Extract patterns
      const patterns = this.identifyPatterns(validatedContext, validatedMetrics, validatedOutcome);
      const successFactors = this.extractSuccessFactors(validatedContext, validatedMetrics, validatedOutcome);
      const failurePatterns = this.extractFailurePatterns(validatedContext, validatedMetrics, validatedOutcome);

      // Create performance node
      const nodeData = {
        name: `performance-${agentId}-${Date.now()}`,
        type: 'agent-performance',
        domain: validatedContext.domain,
        observations: [
          `Agent: ${agentId}`,
          `Task Type: ${validatedContext.type}`,
          `Complexity: ${validatedContext.complexity}`,
          `Success: ${validatedOutcome.success}`,
          `Execution Time: ${validatedMetrics.executionTime}ms`,
          `Quality Score: ${validatedMetrics.qualityScore}`,
          `Token Usage: ${validatedMetrics.tokenUsage}`,
          `Error Count: ${validatedMetrics.errorCount}`
        ],
        metadata: {
          agentId,
          taskContext: validatedContext,
          performanceMetrics: {
            ...validatedMetrics,
            costEfficiency: this.calculateCostEfficiency(validatedMetrics)
          },
          outcomeAnalysis: validatedOutcome,
          learningSignals: {
            patterns,
            successFactors,
            failurePatterns,
            contextFingerprint: this.generateContextFingerprint(validatedContext)
          },
          confidence: this.calculateConfidence(validatedMetrics, validatedOutcome),
          importance: this.calculateImportance(validatedMetrics, validatedOutcome),
          timestamp: Date.now()
        }
      };

      // Store in repository
      const nodeId = await this.repository.store(nodeData);

      // Update pattern tracking
      this.updatePatternTracking(patterns, validatedOutcome.success);

      // Emit event
      this.emit('performance-node-created', { nodeId, agentId });

      this.logger.info('Performance node created', {
        nodeId,
        agentId,
        success: validatedOutcome.success,
        confidence: nodeData.metadata.confidence
      });

      return { nodeId, ...nodeData };

    } catch (error) {
      this.logger.error('Failed to create performance node', {
        error: error.message,
        agentId
      });
      throw error;
    }
  }

  // ============ PATTERN RECOGNITION ============

  /**
   * Identify patterns in task execution
   *
   * @param {Object} taskContext - Task context
   * @param {Object} metrics - Performance metrics
   * @param {Object} outcome - Outcome analysis
   * @returns {Array<string>} Identified patterns
   */
  identifyPatterns(taskContext, metrics, outcome) {
    const patterns = [];

    // Execution time patterns
    if (metrics.executionTime < 10000) {
      patterns.push('fast-execution');
    } else if (metrics.executionTime > 60000) {
      patterns.push('slow-execution');
    }

    // Quality patterns
    if (metrics.qualityScore >= 0.9) {
      patterns.push('high-quality');
    } else if (metrics.qualityScore < 0.6) {
      patterns.push('low-quality');
    }

    // Success patterns
    if (outcome.success && metrics.errorCount === 0) {
      patterns.push('error-free-success');
    }

    // Domain-specific patterns
    if (taskContext.domain === 'seo' && metrics.successRate > 0.8) {
      patterns.push('seo-specialist');
    }

    // Complexity handling patterns
    if (taskContext.complexity === 'high' && outcome.success) {
      patterns.push('complex-task-success');
    }

    // Token efficiency patterns
    const costEfficiency = this.calculateCostEfficiency(metrics);
    if (costEfficiency > 0.8) {
      patterns.push('token-efficient');
    }

    return patterns;
  }

  /**
   * Extract success factors
   *
   * @param {Object} taskContext - Task context
   * @param {Object} metrics - Performance metrics
   * @param {Object} outcome - Outcome analysis
   * @returns {Array<string>} Success factors
   */
  extractSuccessFactors(taskContext, metrics, outcome) {
    if (!outcome.success) return [];

    const factors = [];

    if (metrics.qualityScore >= 0.9) {
      factors.push('High quality output');
    }

    if (metrics.executionTime < 30000) {
      factors.push('Fast execution');
    }

    if (metrics.errorCount === 0) {
      factors.push('Error-free execution');
    }

    if (taskContext.complexity === 'high') {
      factors.push('Successfully handled complex task');
    }

    return factors;
  }

  /**
   * Extract failure patterns
   *
   * @param {Object} taskContext - Task context
   * @param {Object} metrics - Performance metrics
   * @param {Object} outcome - Outcome analysis
   * @returns {Array<string>} Failure patterns
   */
  extractFailurePatterns(taskContext, metrics, outcome) {
    if (outcome.success) return [];

    const patterns = [];

    if (metrics.errorCount > 0) {
      patterns.push(`Errors encountered: ${outcome.errorTypes.join(', ')}`);
    }

    if (metrics.executionTime > 120000) {
      patterns.push('Execution timeout or slowness');
    }

    if (metrics.qualityScore < 0.5) {
      patterns.push('Low quality output');
    }

    if (taskContext.complexity === 'high') {
      patterns.push('Complex task difficulty');
    }

    return patterns;
  }

  // ============ CONTEXT ANALYSIS ============

  /**
   * Generate context fingerprint for similarity matching
   *
   * @param {Object} taskContext - Task context
   * @returns {string} Context fingerprint (hash)
   */
  generateContextFingerprint(taskContext) {
    const fingerprint = {
      type: taskContext.type,
      domain: taskContext.domain,
      complexity: taskContext.complexity,
      keywords: this.extractTaskKeywords(taskContext.description || '')
    };

    // Simple hash generation (in production, use crypto.createHash)
    return Buffer.from(JSON.stringify(fingerprint)).toString('base64');
  }

  /**
   * Extract keywords from task description
   *
   * @param {string} description - Task description
   * @returns {Array<string>} Extracted keywords
   */
  extractTaskKeywords(description) {
    if (!description) return [];

    // Simple keyword extraction (in production, use NLP)
    const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or']);

    return description
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10); // Top 10 keywords
  }

  // ============ SCORING ============

  /**
   * Calculate confidence score
   *
   * @param {Object} metrics - Performance metrics
   * @param {Object} outcome - Outcome analysis
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(metrics, outcome) {
    let confidence = 0.5; // Base confidence

    // Success increases confidence
    if (outcome.success) {
      confidence += 0.2;
    }

    // High quality increases confidence
    if (metrics.qualityScore >= 0.9) {
      confidence += 0.15;
    } else if (metrics.qualityScore >= 0.7) {
      confidence += 0.1;
    }

    // Low errors increase confidence
    if (metrics.errorCount === 0) {
      confidence += 0.1;
    }

    // User satisfaction increases confidence
    if (metrics.userSatisfaction && metrics.userSatisfaction >= 0.8) {
      confidence += 0.05;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Calculate importance score
   *
   * @param {Object} metrics - Performance metrics
   * @param {Object} outcome - Outcome analysis
   * @returns {number} Importance score (0-1)
   */
  calculateImportance(metrics, outcome) {
    let importance = 0.5; // Base importance

    // Successful outcomes are important
    if (outcome.success) {
      importance += 0.2;
    }

    // High quality is important
    if (metrics.qualityScore >= 0.9) {
      importance += 0.15;
    }

    // Complex tasks are important
    if (outcome.completionStatus === 'complete') {
      importance += 0.1;
    }

    // User feedback is important
    if (outcome.userFeedback) {
      importance += 0.05;
    }

    return Math.min(1.0, importance);
  }

  /**
   * Calculate cost efficiency
   *
   * @param {Object} metrics - Performance metrics
   * @returns {number} Cost efficiency (0-1)
   */
  calculateCostEfficiency(metrics) {
    if (!metrics.tokenUsage || !metrics.qualityScore) {
      return 0.5;
    }

    // Efficiency = quality / token usage (normalized)
    // Assuming 100k tokens is "normal" usage
    const normalizedTokens = Math.min(metrics.tokenUsage / 100000, 1.0);
    const efficiency = metrics.qualityScore / (normalizedTokens || 0.1);

    return Math.min(1.0, efficiency);
  }

  // ============ PATTERN TRACKING ============

  /**
   * Update pattern tracking
   *
   * @param {Array<string>} patterns - Identified patterns
   * @param {boolean} success - Whether outcome was successful
   */
  updatePatternTracking(patterns, success) {
    const targetMap = success ? this.patterns.successful : this.patterns.failed;

    for (const pattern of patterns) {
      if (!targetMap.has(pattern)) {
        targetMap.set(pattern, { count: 0, examples: [] });
      }

      const entry = targetMap.get(pattern);
      entry.count++;

      // Check if pattern is emerging (newly discovered)
      if (entry.count === this.config.minPatternFrequency) {
        this.patterns.emerging.push({
          pattern,
          success,
          firstSeen: Date.now(),
          count: entry.count
        });

        this.emit('pattern-emerged', { pattern, success });

        this.logger.info('New pattern emerged', {
          pattern,
          success,
          frequency: entry.count
        });
      }
    }
  }

  /**
   * Get pattern statistics
   *
   * @returns {Object} Pattern statistics
   */
  getPatternStats() {
    return {
      successful: {
        count: this.patterns.successful.size,
        patterns: Array.from(this.patterns.successful.entries())
          .map(([pattern, data]) => ({ pattern, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      },
      failed: {
        count: this.patterns.failed.size,
        patterns: Array.from(this.patterns.failed.entries())
          .map(([pattern, data]) => ({ pattern, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      },
      emerging: this.patterns.emerging.slice(-10) // Last 10 emerging patterns
    };
  }

  // ============ CONTEXT MATCHING ============

  /**
   * Find similar contexts from historical data
   *
   * @param {Object} taskContext - Current task context
   * @param {number} maxResults - Maximum results to return
   * @returns {Promise<Array>} Similar contexts with similarity scores
   */
  async findSimilarContexts(taskContext, maxResults = 5) {
    try {
      const fingerprint = this.generateContextFingerprint(taskContext);
      const keywords = this.extractTaskKeywords(taskContext.description || '');

      // Search repository
      const results = await this.repository.searchSimilar(
        keywords.join(' ') || taskContext.type,
        maxResults,
        {
          domain: taskContext.domain,
          type: 'agent-performance'
        }
      );

      this.logger.debug('Found similar contexts', {
        currentContext: taskContext.type,
        resultCount: results.entities?.length || 0
      });

      return results.entities || [];

    } catch (error) {
      this.logger.error('Failed to find similar contexts', {
        error: error.message,
        taskContext
      });
      return [];
    }
  }
}

module.exports = CrystallineMemoryService;
