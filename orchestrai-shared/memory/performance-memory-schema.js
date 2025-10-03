// Performance Memory Schema for Self-Iterating Evaluation Loop
// Connects Claude Code Hooks data with Crystalline Memory for adaptive orchestration

const EventEmitter = require('events');

class PerformanceMemorySchema extends EventEmitter {
  constructor(crystallineMemory, hooksManager) {
    super();
    this.crystallineMemory = crystallineMemory;
    this.hooksManager = hooksManager;
    this.performanceDomain = 'agent-performance';
    this.learningDomain = 'orchestration-learning';
    this.contextDomain = 'context-patterns';
    
    // Performance metrics tracking
    this.performanceBuffer = new Map(); // Temporary storage before crystalline memory
    this.learningPatterns = new Map();
    this.contextMatchingCache = new Map();
    
    // Learning thresholds and confidence scoring
    this.confidenceThresholds = {
      high: 0.85,
      medium: 0.65,
      low: 0.45
    };
    
    this.setupPerformanceTracking();
    console.log('📊 Performance Memory Schema initialized');
  }

  // ============ PERFORMANCE MEMORY NODE STRUCTURE ============
  
  createPerformanceNode(agentId, taskContext, metrics, outcome) {
    return {
      nodeType: 'agent-performance',
      agentId,
      taskContext: {
        type: taskContext.type || 'unknown',
        domain: taskContext.domain || 'general',
        complexity: taskContext.complexity || 'medium',
        keywords: this.extractTaskKeywords(taskContext.description || ''),
        clientContext: taskContext.clientContext || null,
        projectPhase: taskContext.projectPhase || null
      },
      performanceMetrics: {
        successRate: metrics.successRate || 0,
        executionTime: metrics.executionTime || 0,
        tokenUsage: metrics.tokenUsage || 0,
        errorCount: metrics.errorCount || 0,
        qualityScore: metrics.qualityScore || 0,
        userSatisfaction: metrics.userSatisfaction || null,
        costEfficiency: this.calculateCostEfficiency(metrics),
        resourceUtilization: metrics.resourceUtilization || 0
      },
      outcomeAnalysis: {
        success: outcome.success || false,
        completionStatus: outcome.completionStatus || 'partial',
        errorTypes: outcome.errorTypes || [],
        recoveryActions: outcome.recoveryActions || [],
        qualityGates: outcome.qualityGates || [],
        userFeedback: outcome.userFeedback || null
      },
      learningSignals: {
        patterns: this.identifyPatterns(taskContext, metrics, outcome),
        successFactors: this.extractSuccessFactors(taskContext, metrics, outcome),
        failurePatterns: this.extractFailurePatterns(taskContext, metrics, outcome),
        contextSimilarity: this.generateContextFingerprint(taskContext)
      },
      metadata: {
        timestamp: Date.now(),
        confidence: this.calculateConfidence(metrics, outcome),
        importance: this.calculateImportance(metrics, outcome),
        sessionId: taskContext.sessionId || null,
        workflowId: taskContext.workflowId || null,
        correlationIds: taskContext.correlationIds || []
      }
    };
  }

  createLearningPatternNode(patternType, pattern, examples, confidence) {
    return {
      nodeType: 'learning-pattern',
      patternType, // 'success', 'failure', 'context-match', 'agent-preference'
      pattern: {
        conditions: pattern.conditions || {},
        outcomes: pattern.outcomes || {},
        frequency: pattern.frequency || 1,
        successRate: pattern.successRate || 0,
        contexts: pattern.contexts || []
      },
      examples: examples.slice(0, 10), // Keep recent examples
      insights: {
        keyFactors: this.identifyKeyFactors(pattern, examples),
        recommendations: this.generateRecommendations(pattern, examples),
        avoidances: this.generateAvoidances(pattern, examples),
        contextConstraints: this.extractContextConstraints(examples)
      },
      confidence,
      metadata: {
        timestamp: Date.now(),
        lastUpdated: Date.now(),
        usageCount: 0,
        validationResults: []
      }
    };
  }

  // ============ HOOKS INTEGRATION ============
  
  setupPerformanceTracking() {
    // Listen to hooks manager events for performance data
    if (this.hooksManager) {
      this.hooksManager.on('workflow-complete', (workflowData) => {
        this.processWorkflowPerformance(workflowData);
      });
      
      this.hooksManager.on('agent-performance', (performanceData) => {
        this.processAgentPerformance(performanceData);
      });
      
      this.hooksManager.on('task-failure', (failureData) => {
        this.processTaskFailure(failureData);
      });
    }
  }

  async processWorkflowPerformance(workflowData) {
    try {
      const {
        workflowId,
        agentSequence,
        totalDuration,
        tokenUsage,
        success,
        qualityScores,
        userFeedback,
        context
      } = workflowData;

      // Create performance nodes for each agent in the workflow
      for (const agentExecution of agentSequence) {
        const performanceNode = this.createPerformanceNode(
          agentExecution.agentId,
          {
            ...context,
            type: agentExecution.taskType,
            workflowId,
            sessionId: workflowData.sessionId
          },
          {
            successRate: agentExecution.success ? 1 : 0,
            executionTime: agentExecution.duration,
            tokenUsage: agentExecution.tokenUsage,
            errorCount: agentExecution.errors?.length || 0,
            qualityScore: qualityScores?.[agentExecution.agentId] || 0,
            userSatisfaction: userFeedback?.[agentExecution.agentId] || null
          },
          {
            success: agentExecution.success,
            completionStatus: agentExecution.completionStatus,
            errorTypes: agentExecution.errors?.map(e => e.type) || [],
            recoveryActions: agentExecution.recoveryActions || []
          }
        );

        // Store in crystalline memory
        await this.storePerformanceMemory(performanceNode);
      }

      // Analyze workflow-level patterns
      await this.analyzeWorkflowPatterns(workflowData);
      
      console.log(`📊 Processed workflow performance: ${workflowId} (${agentSequence.length} agents)`);
    } catch (error) {
      console.error('Error processing workflow performance:', error);
    }
  }

  async processAgentPerformance(performanceData) {
    try {
      const performanceNode = this.createPerformanceNode(
        performanceData.agentId,
        performanceData.taskContext,
        performanceData.metrics,
        performanceData.outcome
      );

      await this.storePerformanceMemory(performanceNode);
      
      // Update learning patterns
      await this.updateLearningPatterns(performanceNode);
      
      console.log(`📊 Processed agent performance: ${performanceData.agentId}`);
    } catch (error) {
      console.error('Error processing agent performance:', error);
    }
  }

  async processTaskFailure(failureData) {
    try {
      // Enhanced failure analysis for learning
      const failureNode = this.createPerformanceNode(
        failureData.agentId,
        failureData.taskContext,
        {
          successRate: 0,
          executionTime: failureData.duration || 0,
          errorCount: failureData.errors?.length || 1,
          qualityScore: 0
        },
        {
          success: false,
          completionStatus: 'failed',
          errorTypes: failureData.errors?.map(e => e.type) || ['unknown'],
          recoveryActions: failureData.attemptedRecovery || []
        }
      );

      await this.storePerformanceMemory(failureNode);
      
      // Create specific failure pattern learning
      await this.createFailurePattern(failureData);
      
      console.log(`❌ Processed task failure: ${failureData.agentId} - Learning from failure`);
    } catch (error) {
      console.error('Error processing task failure:', error);
    }
  }

  // ============ CRYSTALLINE MEMORY INTEGRATION ============
  
  async storePerformanceMemory(performanceNode) {
    try {
      const nodeId = await this.crystallineMemory.storeMemory(
        this.performanceDomain,
        JSON.stringify(performanceNode),
        {
          importance: performanceNode.metadata.confidence,
          agentId: performanceNode.agentId,
          taskType: performanceNode.taskContext.type,
          success: performanceNode.outcomeAnalysis.success,
          semantic_tags: [
            `agent:${performanceNode.agentId}`,
            `domain:${performanceNode.taskContext.domain}`,
            `complexity:${performanceNode.taskContext.complexity}`,
            performanceNode.outcomeAnalysis.success ? 'outcome:success' : 'outcome:failure',
            ...performanceNode.taskContext.keywords.map(k => `keyword:${k}`)
          ]
        }
      );

      if (nodeId) {
        // Create cross-references
        await this.createPerformanceCrossReferences(performanceNode, nodeId);
      }

      return nodeId;
    } catch (error) {
      console.error('Error storing performance memory:', error);
      return null;
    }
  }

  async createPerformanceCrossReferences(performanceNode, nodeId) {
    // Link to similar contexts
    const similarContexts = await this.findSimilarContexts(performanceNode.taskContext);
    for (const context of similarContexts) {
      await this.crystallineMemory.lattice.createConnection(nodeId, context.nodeId, 'similar-context');
    }

    // Link to same agent performance history
    const agentHistory = await this.getAgentPerformanceHistory(performanceNode.agentId);
    for (const historyNode of agentHistory.slice(0, 5)) { // Last 5 performances
      await this.crystallineMemory.lattice.createConnection(nodeId, historyNode.nodeId, 'agent-history');
    }
  }

  // ============ PATTERN RECOGNITION & LEARNING ============
  
  async updateLearningPatterns(performanceNode) {
    // Success pattern recognition
    if (performanceNode.outcomeAnalysis.success && performanceNode.metadata.confidence > this.confidenceThresholds.medium) {
      await this.updateSuccessPattern(performanceNode);
    }
    
    // Failure pattern recognition
    if (!performanceNode.outcomeAnalysis.success) {
      await this.updateFailurePattern(performanceNode);
    }
    
    // Context matching patterns
    await this.updateContextPatterns(performanceNode);
  }

  async updateSuccessPattern(performanceNode) {
    const patternKey = this.generatePatternKey('success', performanceNode);
    
    if (!this.learningPatterns.has(patternKey)) {
      this.learningPatterns.set(patternKey, {
        type: 'success',
        conditions: this.extractConditions(performanceNode),
        outcomes: this.extractOutcomes(performanceNode),
        examples: [performanceNode],
        frequency: 1,
        successRate: 1.0
      });
    } else {
      const pattern = this.learningPatterns.get(patternKey);
      pattern.examples.push(performanceNode);
      pattern.frequency++;
      pattern.successRate = pattern.examples.filter(e => e.outcomeAnalysis.success).length / pattern.examples.length;
      
      // Store updated pattern in crystalline memory when it becomes significant
      if (pattern.frequency >= 3 && pattern.successRate >= this.confidenceThresholds.medium) {
        const learningNode = this.createLearningPatternNode('success', pattern, pattern.examples, pattern.successRate);
        await this.crystallineMemory.storeMemory(this.learningDomain, JSON.stringify(learningNode));
      }
    }
  }

  // ============ HELPER METHODS ============

  extractTaskKeywords(description) {
    if (!description) return [];
    return description.toLowerCase()
      .match(/\b\w{3,}\b/g)
      ?.filter(word => !['the', 'and', 'for', 'with', 'this', 'that'].includes(word))
      ?.slice(0, 10) || [];
  }

  calculateCostEfficiency(metrics) {
    if (!metrics.tokenUsage || !metrics.executionTime) return 0;
    return (metrics.successRate || 0) / (metrics.tokenUsage * 0.001 + metrics.executionTime * 0.0001);
  }

  calculateConfidence(metrics, outcome) {
    let confidence = 0.5; // Base confidence
    
    if (outcome.success) confidence += 0.3;
    if (metrics.qualityScore > 0.8) confidence += 0.2;
    if (metrics.userSatisfaction && metrics.userSatisfaction > 4) confidence += 0.15;
    if (metrics.errorCount === 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  calculateImportance(metrics, outcome) {
    let importance = 0.5; // Base importance
    
    if (outcome.success) importance += 0.2;
    if (metrics.tokenUsage > 10000) importance += 0.1; // High-complexity task
    if (metrics.userSatisfaction && metrics.userSatisfaction > 4.5) importance += 0.2;
    if (!outcome.success && metrics.errorCount > 0) importance += 0.3; // Learn from failures
    
    return Math.min(importance, 1.0);
  }

  identifyPatterns(taskContext, metrics, outcome) {
    const patterns = [];
    
    // Time-based patterns
    const hour = new Date().getHours();
    if (hour < 9 || hour > 17) patterns.push('off-hours-execution');
    
    // Complexity patterns
    if (metrics.tokenUsage > 15000) patterns.push('high-complexity');
    if (metrics.executionTime > 300000) patterns.push('long-duration'); // > 5 minutes
    
    // Success patterns
    if (outcome.success && metrics.qualityScore > 0.9) patterns.push('high-quality-success');
    
    return patterns;
  }

  extractSuccessFactors(taskContext, metrics, outcome) {
    if (!outcome.success) return [];
    
    const factors = [];
    
    if (metrics.qualityScore > 0.8) factors.push('high-quality-execution');
    if (metrics.executionTime < 60000) factors.push('fast-execution'); // < 1 minute
    if (metrics.errorCount === 0) factors.push('error-free');
    if (taskContext.complexity === 'low') factors.push('appropriate-complexity');
    
    return factors;
  }

  extractFailurePatterns(taskContext, metrics, outcome) {
    if (outcome.success) return [];
    
    const patterns = [];
    
    if (metrics.errorCount > 3) patterns.push('multiple-errors');
    if (metrics.executionTime > 600000) patterns.push('timeout-likely'); // > 10 minutes
    if (taskContext.complexity === 'high') patterns.push('complexity-overload');
    
    return patterns;
  }

  generateContextFingerprint(taskContext) {
    return {
      domain: taskContext.domain,
      type: taskContext.type,
      complexity: taskContext.complexity,
      keywordHash: this.hashKeywords(taskContext.keywords)
    };
  }

  hashKeywords(keywords) {
    return keywords.sort().join('|').substring(0, 50);
  }

  generatePatternKey(type, performanceNode) {
    return `${type}_${performanceNode.agentId}_${performanceNode.taskContext.domain}_${performanceNode.taskContext.complexity}`;
  }

  extractConditions(performanceNode) {
    return {
      agentId: performanceNode.agentId,
      domain: performanceNode.taskContext.domain,
      complexity: performanceNode.taskContext.complexity,
      keywords: performanceNode.taskContext.keywords.slice(0, 5)
    };
  }

  extractOutcomes(performanceNode) {
    return {
      successRate: performanceNode.outcomeAnalysis.success ? 1 : 0,
      avgExecutionTime: performanceNode.performanceMetrics.executionTime,
      avgTokenUsage: performanceNode.performanceMetrics.tokenUsage,
      qualityScore: performanceNode.performanceMetrics.qualityScore
    };
  }

  // ============ QUERY INTERFACE FOR ORCHESTRATOR ============
  
  async getBestAgentForTask(taskContext, availableAgents = []) {
    try {
      const contextFingerprint = this.generateContextFingerprint(taskContext);
      const queryString = `${taskContext.type} ${taskContext.domain} ${taskContext.keywords.join(' ')}`;
      
      const memories = await this.crystallineMemory.retrieveMemory(queryString, this.performanceDomain, 20);
      
      const agentScores = new Map();
      
      for (const memory of memories.results) {
        const performanceData = JSON.parse(memory.content);
        const agentId = performanceData.agentId;
        
        if (availableAgents.length === 0 || availableAgents.includes(agentId)) {
          const contextSimilarity = this.calculateContextSimilarity(contextFingerprint, performanceData.learningSignals.contextSimilarity);
          const performanceScore = this.calculatePerformanceScore(performanceData.performanceMetrics);
          const confidence = performanceData.metadata.confidence;
          
          const totalScore = (contextSimilarity * 0.4) + (performanceScore * 0.4) + (confidence * 0.2);
          
          if (!agentScores.has(agentId)) {
            agentScores.set(agentId, { totalScore, count: 1, performances: [performanceData] });
          } else {
            const current = agentScores.get(agentId);
            current.totalScore = (current.totalScore * current.count + totalScore) / (current.count + 1);
            current.count++;
            current.performances.push(performanceData);
          }
        }
      }
      
      const rankedAgents = Array.from(agentScores.entries())
        .sort(([,a], [,b]) => b.totalScore - a.totalScore)
        .map(([agentId, data]) => ({
          agentId,
          recommendationScore: data.totalScore,
          confidence: data.count >= 3 ? this.confidenceThresholds.high : 
                     data.count >= 2 ? this.confidenceThresholds.medium : this.confidenceThresholds.low,
          historicalPerformances: data.count,
          reasoning: this.generateRecommendationReasoning(data.performances, taskContext)
        }));
      
      return {
        recommendations: rankedAgents,
        queryContext: taskContext,
        memoriesAnalyzed: memories.results.length,
        confidence: rankedAgents[0]?.confidence || this.confidenceThresholds.low
      };
    } catch (error) {
      console.error('Error getting best agent for task:', error);
      return {
        recommendations: [],
        error: error.message,
        fallbackRequired: true
      };
    }
  }

  calculateContextSimilarity(fingerprint1, fingerprint2) {
    let similarity = 0;
    
    if (fingerprint1.domain === fingerprint2.domain) similarity += 0.3;
    if (fingerprint1.type === fingerprint2.type) similarity += 0.3;
    if (fingerprint1.complexity === fingerprint2.complexity) similarity += 0.2;
    
    // Keyword similarity using Jaccard index
    const keywords1 = new Set(fingerprint1.keywordHash.split('|'));
    const keywords2 = new Set(fingerprint2.keywordHash.split('|'));
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    const keywordSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    
    similarity += keywordSimilarity * 0.2;
    
    return Math.min(similarity, 1.0);
  }

  calculatePerformanceScore(metrics) {
    return (metrics.successRate * 0.4) + 
           (metrics.qualityScore * 0.3) + 
           (metrics.costEfficiency * 0.2) + 
           ((1 - Math.min(metrics.errorCount / 10, 1)) * 0.1);
  }

  generateRecommendationReasoning(performances, taskContext) {
    const successRate = performances.filter(p => p.outcomeAnalysis.success).length / performances.length;
    const avgQuality = performances.reduce((sum, p) => sum + p.performanceMetrics.qualityScore, 0) / performances.length;
    
    const reasons = [];
    
    if (successRate >= 0.8) reasons.push(`High success rate (${(successRate * 100).toFixed(0)}%)`);
    if (avgQuality >= 0.8) reasons.push(`Consistently high quality (${avgQuality.toFixed(2)})`);
    if (performances.length >= 5) reasons.push(`Extensive experience (${performances.length} tasks)`);
    
    return reasons.join(', ') || 'Limited data available';
  }

  // ============ API METHODS ============
  
  async getPerformanceStats() {
    const memoryStats = await this.crystallineMemory.getMemoryPoolStats();
    const performancePool = memoryStats.poolBreakdown[this.performanceDomain] || {};
    
    return {
      totalPerformanceNodes: performancePool.nodeCount || 0,
      averageImportance: performancePool.averageImportance || 0,
      activeMemories: performancePool.activeMemories || 0,
      learningPatterns: this.learningPatterns.size,
      confidenceDistribution: this.getConfidenceDistribution(),
      lastUpdate: Date.now()
    };
  }

  getConfidenceDistribution() {
    const distribution = { high: 0, medium: 0, low: 0 };
    
    for (const [, pattern] of this.learningPatterns) {
      if (pattern.confidence >= this.confidenceThresholds.high) distribution.high++;
      else if (pattern.confidence >= this.confidenceThresholds.medium) distribution.medium++;
      else distribution.low++;
    }
    
    return distribution;
  }
}

module.exports = PerformanceMemorySchema;