// Autonomous Learning Engine
// Implements bounded self-improvement for ORCHESTRAI agents
// Learns from successful workflows and human feedback to continuously improve

const EventEmitter = require('events');

class AutonomousLearningEngine extends EventEmitter {
  constructor(crystallineMemory, validationGates, taskBatcher, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.validationGates = validationGates;
    this.taskBatcher = taskBatcher;
    this.redis = redis;
    
    // Learning configuration with safety bounds
    this.learningConfig = {
      learningRate: 0.1, // Conservative learning rate
      confidenceThreshold: 0.75, // Minimum confidence for pattern application
      maxPatternAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      minSuccessCount: 3, // Minimum successful executions before pattern acceptance
      safetyBounds: {
        maxRuleDeviations: 0, // Never deviate from CLAUDE.md rules
        maxFilePathChanges: 0, // Never change file organization rules
        allowedImprovements: ['performance', 'quality', 'efficiency'] // Only these aspects
      }
    };
    
    // Learning repositories
    this.successPatterns = new Map(); // Successful workflow patterns
    this.failurePatterns = new Map(); // Failure patterns to avoid
    this.humanFeedback = []; // Human corrections and preferences
    this.performanceMetrics = new Map(); // Agent performance tracking
    
    // Learning categories
    this.learningCategories = {
      workflow: {
        description: 'Task sequencing and coordination patterns',
        safetyLevel: 'medium',
        improvementAreas: ['sequence_optimization', 'parallel_coordination', 'dependency_resolution']
      },
      agent_selection: {
        description: 'Optimal agent selection for specific tasks',
        safetyLevel: 'high',
        improvementAreas: ['capability_matching', 'load_balancing', 'expertise_routing']
      },
      parameter_optimization: {
        description: 'Task parameter and prompt optimization',
        safetyLevel: 'medium',
        improvementAreas: ['prompt_enhancement', 'context_optimization', 'batch_sizing']
      },
      quality_prediction: {
        description: 'Predicting task success and quality outcomes',
        safetyLevel: 'high',
        improvementAreas: ['success_probability', 'quality_scoring', 'risk_assessment']
      },
      resource_optimization: {
        description: 'Optimizing resource usage and timing',
        safetyLevel: 'high',
        improvementAreas: ['execution_timing', 'memory_usage', 'api_efficiency']
      }
    };
    
    // Active learning processes
    this.learningProcesses = {
      pattern_recognition: { active: true, lastRun: 0, interval: 300000 }, // 5 minutes
      feedback_integration: { active: true, lastRun: 0, interval: 600000 }, // 10 minutes
      performance_analysis: { active: true, lastRun: 0, interval: 900000 }, // 15 minutes
      safety_validation: { active: true, lastRun: 0, interval: 180000 }     // 3 minutes
    };
    
    // Registered agents tracking
    this.registeredAgents = new Map();
    
    console.log('🧠 Autonomous Learning Engine initialized - Bounded self-improvement active');
  }

  /**
   * Register an agent with learning configuration
   */
  async registerAgent(agentId, config) {
    this.registeredAgents.set(agentId, {
      agentId,
      config,
      registeredAt: Date.now(),
      learningStats: {
        successesRecorded: 0,
        patternsLearned: 0,
        improvementsApplied: 0
      }
    });
    
    console.log(`🧠 Agent ${agentId} registered for learning with mode: ${config.learningMode || 'continuous'}`);
    return true;
  }

  /**
   * Start autonomous learning processes
   */
  startLearning() {
    // Start all learning processes
    Object.entries(this.learningProcesses).forEach(([processName, config]) => {
      if (config.active) {
        this.startLearningProcess(processName, config);
      }
    });
    
    console.log('🚀 Autonomous learning processes started');
    this.emit('learning-started');
  }

  /**
   * Start individual learning process
   */
  startLearningProcess(processName, config) {
    const processor = this.getLearningProcessor(processName);
    
    const processInterval = setInterval(async () => {
      try {
        const startTime = Date.now();
        await processor();
        
        config.lastRun = Date.now();
        
        this.emit('learning-process-completed', {
          processName,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`Learning process ${processName} failed:`, error.message);
        
        this.emit('learning-process-failed', {
          processName,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, config.interval);
    
    // Store interval reference for cleanup
    config.intervalRef = processInterval;
  }

  /**
   * Get learning processor function for process name
   */
  getLearningProcessor(processName) {
    const processors = {
      'pattern_recognition': this.recognizePatterns.bind(this),
      'feedback_integration': this.integrateFeedback.bind(this),
      'performance_analysis': this.analyzePerformance.bind(this),
      'safety_validation': this.validateSafety.bind(this)
    };
    
    return processors[processName] || (() => Promise.resolve());
  }

  /**
   * Record successful workflow for learning
   */
  async recordSuccess(workflow, outcome, metrics = {}) {
    try {
      const successRecord = {
        workflowId: workflow.id || `workflow-${Date.now()}`,
        workflow,
        outcome,
        metrics,
        timestamp: Date.now(),
        context: this.extractWorkflowContext(workflow),
        quality: this.calculateQualityScore(outcome, metrics)
      };
      
      // Store in crystalline memory
      await this.crystallineMemory.storeMemory(
        'learning-success-patterns',
        successRecord,
        {
          importance: Math.min(0.9, successRecord.quality),
          semantic_tags: ['success', 'workflow', 'learning', ...this.extractSemanticTags(workflow)],
          retention: 'long-term'
        }
      );
      
      // Update success patterns
      const patternKey = this.generatePatternKey(workflow);
      const existingPattern = this.successPatterns.get(patternKey);
      
      if (existingPattern) {
        existingPattern.successCount++;
        existingPattern.totalQuality += successRecord.quality;
        existingPattern.avgQuality = existingPattern.totalQuality / existingPattern.successCount;
        existingPattern.lastSeen = Date.now();
      } else {
        this.successPatterns.set(patternKey, {
          pattern: workflow,
          successCount: 1,
          totalQuality: successRecord.quality,
          avgQuality: successRecord.quality,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          category: this.categorizeWorkflow(workflow)
        });
      }
      
      console.log(`✅ Success recorded: ${successRecord.workflowId} (Quality: ${successRecord.quality.toFixed(2)})`);
      
      this.emit('success-recorded', successRecord);
      
    } catch (error) {
      console.error('Failed to record success:', error.message);
    }
  }

  /**
   * Record failure for learning what to avoid
   */
  async recordFailure(workflow, error, context = {}) {
    try {
      const failureRecord = {
        workflowId: workflow.id || `workflow-${Date.now()}`,
        workflow,
        error: error.message || error,
        context,
        timestamp: Date.now(),
        severity: this.classifyErrorSeverity(error),
        category: this.categorizeFailure(error, workflow)
      };
      
      // Store in crystalline memory
      await this.crystallineMemory.storeMemory(
        'learning-failure-patterns',
        failureRecord,
        {
          importance: 0.7,
          semantic_tags: ['failure', 'error', 'learning', failureRecord.category],
          retention: 'medium-term'
        }
      );
      
      // Update failure patterns
      const patternKey = this.generatePatternKey(workflow);
      const existingPattern = this.failurePatterns.get(patternKey);
      
      if (existingPattern) {
        existingPattern.failureCount++;
        existingPattern.lastFailure = Date.now();
        existingPattern.errors.push(failureRecord.error);
      } else {
        this.failurePatterns.set(patternKey, {
          pattern: workflow,
          failureCount: 1,
          firstFailure: Date.now(),
          lastFailure: Date.now(),
          errors: [failureRecord.error],
          category: failureRecord.category
        });
      }
      
      console.log(`❌ Failure recorded: ${failureRecord.workflowId} (${failureRecord.category})`);
      
      this.emit('failure-recorded', failureRecord);
      
    } catch (error) {
      console.error('Failed to record failure:', error.message);
    }
  }

  /**
   * Record human feedback for learning preferences
   */
  async recordHumanFeedback(interaction, feedback, context = {}) {
    try {
      const feedbackRecord = {
        feedbackId: `feedback-${Date.now()}`,
        interaction,
        feedback,
        context,
        timestamp: Date.now(),
        feedbackType: this.classifyFeedback(feedback),
        learningValue: this.calculateFeedbackValue(feedback)
      };
      
      // Store in learning feedback array
      this.humanFeedback.push(feedbackRecord);
      
      // Keep only recent feedback (last 1000 entries)
      if (this.humanFeedback.length > 1000) {
        this.humanFeedback = this.humanFeedback.slice(-1000);
      }
      
      // Store in crystalline memory
      await this.crystallineMemory.storeMemory(
        'learning-human-feedback',
        feedbackRecord,
        {
          importance: feedbackRecord.learningValue,
          semantic_tags: ['feedback', 'human', 'learning', feedbackRecord.feedbackType],
          retention: 'long-term'
        }
      );
      
      console.log(`👤 Human feedback recorded: ${feedbackRecord.feedbackType} (Value: ${feedbackRecord.learningValue})`);
      
      this.emit('feedback-recorded', feedbackRecord);
      
    } catch (error) {
      console.error('Failed to record human feedback:', error.message);
    }
  }

  /**
   * Get learning recommendations for specific workflow
   */
  async getRecommendations(workflow, context = {}) {
    try {
      const recommendations = {
        workflow,
        suggestions: [],
        confidence: 0,
        reasoning: [],
        safetyCheck: { passed: true, warnings: [] }
      };
      
      // Analyze against success patterns
      const successMatches = this.findPatternMatches(workflow, this.successPatterns);
      
      for (const match of successMatches) {
        if (match.confidence > this.learningConfig.confidenceThreshold) {
          recommendations.suggestions.push({
            type: 'optimization',
            category: match.pattern.category,
            suggestion: this.generateOptimizationSuggestion(match),
            confidence: match.confidence,
            source: 'success-patterns'
          });
        }
      }
      
      // Check against failure patterns
      const failureMatches = this.findPatternMatches(workflow, this.failurePatterns);
      
      for (const match of failureMatches) {
        if (match.confidence > 0.5) {
          recommendations.suggestions.push({
            type: 'warning',
            category: match.pattern.category,
            suggestion: `Avoid: ${match.pattern.errors[0]} (seen ${match.pattern.failureCount} times)`,
            confidence: match.confidence,
            source: 'failure-patterns'
          });
        }
      }
      
      // Integrate human feedback
      const feedbackSuggestions = this.getFeedbackSuggestions(workflow, context);
      recommendations.suggestions.push(...feedbackSuggestions);
      
      // Calculate overall confidence
      recommendations.confidence = this.calculateRecommendationConfidence(recommendations.suggestions);
      
      // Safety validation
      recommendations.safetyCheck = this.validateRecommendationSafety(recommendations);
      
      return recommendations;
      
    } catch (error) {
      console.error('Failed to get learning recommendations:', error.message);
      return { suggestions: [], confidence: 0, error: error.message };
    }
  }

  /**
   * Apply learning improvements automatically (within safety bounds)
   */
  async applyImprovements(workflow, recommendations) {
    const appliedImprovements = [];
    
    try {
      // Only apply safe improvements
      const safeRecommendations = recommendations.suggestions.filter(s => 
        s.confidence > this.learningConfig.confidenceThreshold &&
        this.isSafeImprovement(s)
      );
      
      for (const recommendation of safeRecommendations) {
        const improvement = await this.applyIndividualImprovement(workflow, recommendation);
        
        if (improvement.applied) {
          appliedImprovements.push(improvement);
          
          // Record the improvement for future learning
          await this.recordImprovement(workflow, recommendation, improvement);
        }
      }
      
      console.log(`🎯 Applied ${appliedImprovements.length} learning improvements`);
      
      this.emit('improvements-applied', {
        workflow: workflow.id,
        count: appliedImprovements.length,
        improvements: appliedImprovements
      });
      
      return appliedImprovements;
      
    } catch (error) {
      console.error('Failed to apply learning improvements:', error.message);
      return appliedImprovements;
    }
  }

  // Learning process implementations

  async recognizePatterns() {
    // Analyze recent memory to identify new patterns
    const recentMemories = await this.crystallineMemory.searchMemories(
      'learning-success-patterns',
      {},
      { 
        timeRange: { start: Date.now() - (24 * 60 * 60 * 1000) }, // Last 24 hours
        limit: 100 
      }
    );
    
    if (!recentMemories || recentMemories.length === 0) return;
    
    // Group similar workflows
    const patternGroups = this.groupSimilarWorkflows(recentMemories);
    
    // Identify emerging patterns
    for (const group of patternGroups) {
      if (group.workflows.length >= this.learningConfig.minSuccessCount) {
        const pattern = this.extractCommonPattern(group.workflows);
        
        if (pattern.confidence > this.learningConfig.confidenceThreshold) {
          await this.promotePattern(pattern);
        }
      }
    }
    
    console.log(`🔍 Pattern recognition: Analyzed ${recentMemories.length} workflows, found ${patternGroups.length} groups`);
  }

  async integrateFeedback() {
    // Process recent human feedback
    const recentFeedback = this.humanFeedback.filter(f => 
      Date.now() - f.timestamp < (24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    if (recentFeedback.length === 0) return;
    
    // Group feedback by type
    const feedbackGroups = this.groupFeedbackByType(recentFeedback);
    
    // Update learning patterns based on feedback
    for (const [type, feedbacks] of Object.entries(feedbackGroups)) {
      const consensusFeedback = this.findFeedbackConsensus(feedbacks);
      
      if (consensusFeedback.strength > 0.6) {
        await this.updatePatternsFromFeedback(consensusFeedback);
      }
    }
    
    console.log(`👤 Feedback integration: Processed ${recentFeedback.length} feedback items`);
  }

  async analyzePerformance() {
    // Analyze agent and workflow performance trends
    const performanceData = await this.gatherPerformanceMetrics();
    
    // Identify performance improvements and degradations
    const trends = this.analyzePerformanceTrends(performanceData);
    
    // Update learning based on performance trends
    for (const trend of trends) {
      if (trend.significance > 0.7) {
        await this.updateLearningFromTrend(trend);
      }
    }
    
    console.log(`📊 Performance analysis: Analyzed ${Object.keys(performanceData).length} metrics`);
  }

  async validateSafety() {
    // Validate all learning patterns against safety bounds
    let violationCount = 0;
    
    // Check success patterns
    for (const [key, pattern] of this.successPatterns.entries()) {
      const safetyCheck = this.validatePatternSafety(pattern);
      
      if (!safetyCheck.safe) {
        console.warn(`🚨 Unsafe pattern detected: ${key} - ${safetyCheck.reason}`);
        
        // Remove or quarantine unsafe pattern
        this.successPatterns.delete(key);
        violationCount++;
      }
    }
    
    // Check failure patterns for safety lessons
    for (const [key, pattern] of this.failurePatterns.entries()) {
      const lessons = this.extractSafetyLessons(pattern);
      
      if (lessons.length > 0) {
        await this.reinforceSafetyLessons(lessons);
      }
    }
    
    console.log(`🛡️ Safety validation: Found ${violationCount} violations, corrected safety patterns`);
  }

  // Helper methods

  extractWorkflowContext(workflow) {
    return {
      agents: workflow.agents || [],
      sequence: workflow.sequence || [],
      resources: workflow.resources || [],
      complexity: this.calculateWorkflowComplexity(workflow),
      domain: workflow.domain || 'general'
    };
  }

  calculateQualityScore(outcome, metrics) {
    let quality = 0.5; // Base quality
    
    // Factor in success/failure
    if (outcome.success) quality += 0.3;
    
    // Factor in validation results
    if (outcome.validation && outcome.validation.passed) {
      quality += 0.2;
    }
    
    // Factor in performance metrics
    if (metrics.duration) {
      const speedBonus = Math.max(0, 1 - (metrics.duration / 30000)); // Bonus for under 30s
      quality += speedBonus * 0.2;
    }
    
    // Factor in human feedback if available
    if (outcome.feedback && outcome.feedback.rating) {
      quality += (outcome.feedback.rating / 5) * 0.3; // Normalize 5-star rating
    }
    
    return Math.min(1.0, quality);
  }

  extractSemanticTags(workflow) {
    const tags = [];
    
    if (workflow.agents) {
      tags.push(...workflow.agents.map(a => a.type || a));
    }
    
    if (workflow.domain) {
      tags.push(workflow.domain);
    }
    
    if (workflow.type) {
      tags.push(workflow.type);
    }
    
    return tags;
  }

  generatePatternKey(workflow) {
    // Create unique key for workflow pattern
    const keyComponents = [
      workflow.type || 'unknown',
      (workflow.agents || []).sort().join('-'),
      workflow.domain || 'general'
    ];
    
    return keyComponents.join('::');
  }

  categorizeWorkflow(workflow) {
    // Categorize workflow for learning purposes
    if (workflow.type) {
      return workflow.type;
    }
    
    if (workflow.domain) {
      return workflow.domain;
    }
    
    if (workflow.agents && workflow.agents.length > 0) {
      return workflow.agents[0].type || workflow.agents[0];
    }
    
    return 'general';
  }

  classifyErrorSeverity(error) {
    const errorStr = error.message || error.toString().toLowerCase();
    
    if (errorStr.includes('critical') || errorStr.includes('fatal')) {
      return 'critical';
    } else if (errorStr.includes('validation') || errorStr.includes('rule')) {
      return 'major';
    } else if (errorStr.includes('timeout') || errorStr.includes('network')) {
      return 'minor';
    }
    
    return 'medium';
  }

  categorizeFailure(error, workflow) {
    const errorStr = error.message || error.toString().toLowerCase();
    
    if (errorStr.includes('validation') || errorStr.includes('rule')) {
      return 'rule-violation';
    } else if (errorStr.includes('timeout')) {
      return 'performance';
    } else if (errorStr.includes('dependency') || errorStr.includes('sequence')) {
      return 'coordination';
    } else if (errorStr.includes('permission') || errorStr.includes('access')) {
      return 'permission';
    }
    
    return 'general';
  }

  classifyFeedback(feedback) {
    const feedbackStr = feedback.toString().toLowerCase();
    
    if (feedbackStr.includes('improve') || feedbackStr.includes('better')) {
      return 'improvement-suggestion';
    } else if (feedbackStr.includes('wrong') || feedbackStr.includes('incorrect')) {
      return 'correction';
    } else if (feedbackStr.includes('good') || feedbackStr.includes('excellent')) {
      return 'positive-reinforcement';
    } else if (feedbackStr.includes('slow') || feedbackStr.includes('fast')) {
      return 'performance-feedback';
    }
    
    return 'general-feedback';
  }

  calculateFeedbackValue(feedback) {
    // Calculate learning value of feedback (0-1)
    const type = this.classifyFeedback(feedback);
    
    const valueMap = {
      'correction': 0.9,
      'improvement-suggestion': 0.8,
      'performance-feedback': 0.6,
      'positive-reinforcement': 0.4,
      'general-feedback': 0.3
    };
    
    return valueMap[type] || 0.3;
  }

  findPatternMatches(workflow, patterns) {
    const matches = [];
    const workflowKey = this.generatePatternKey(workflow);
    
    for (const [patternKey, pattern] of patterns.entries()) {
      const similarity = this.calculatePatternSimilarity(workflow, pattern.pattern);
      
      if (similarity > 0.3) { // Minimum similarity threshold
        matches.push({
          patternKey,
          pattern,
          confidence: similarity,
          workflow
        });
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  calculatePatternSimilarity(workflow1, workflow2) {
    let similarity = 0;
    let comparisons = 0;
    
    // Compare workflow types
    if (workflow1.type && workflow2.type) {
      similarity += workflow1.type === workflow2.type ? 1 : 0;
      comparisons++;
    }
    
    // Compare domains
    if (workflow1.domain && workflow2.domain) {
      similarity += workflow1.domain === workflow2.domain ? 1 : 0;
      comparisons++;
    }
    
    // Compare agents
    if (workflow1.agents && workflow2.agents) {
      const agents1 = new Set(workflow1.agents.map(a => a.type || a));
      const agents2 = new Set(workflow2.agents.map(a => a.type || a));
      const intersection = new Set([...agents1].filter(x => agents2.has(x)));
      const union = new Set([...agents1, ...agents2]);
      
      similarity += intersection.size / union.size;
      comparisons++;
    }
    
    return comparisons > 0 ? similarity / comparisons : 0;
  }

  generateOptimizationSuggestion(match) {
    const pattern = match.pattern;
    
    switch (pattern.category) {
      case 'workflow':
        return `Optimize task sequence based on ${pattern.successCount} successful executions (avg quality: ${pattern.avgQuality.toFixed(2)})`;
      case 'agent_selection':
        return `Use agent combination that achieved ${pattern.avgQuality.toFixed(2)} average quality score`;
      case 'parameter_optimization':
        return `Apply parameter optimization that improved success rate by ${(pattern.avgQuality * 100).toFixed(1)}%`;
      default:
        return `Apply optimization pattern with ${pattern.successCount} successful uses`;
    }
  }

  getFeedbackSuggestions(workflow, context) {
    const suggestions = [];
    
    // Find relevant feedback for similar workflows
    const relevantFeedback = this.humanFeedback.filter(f => {
      const similarity = this.calculatePatternSimilarity(workflow, f.interaction);
      return similarity > 0.5;
    });
    
    // Group by feedback type and find consensus
    const feedbackGroups = this.groupFeedbackByType(relevantFeedback);
    
    for (const [type, feedbacks] of Object.entries(feedbackGroups)) {
      if (feedbacks.length >= 2) {
        const consensus = this.findFeedbackConsensus(feedbacks);
        
        if (consensus.strength > 0.6) {
          suggestions.push({
            type: 'feedback-based',
            category: type,
            suggestion: consensus.suggestion,
            confidence: consensus.strength,
            source: 'human-feedback'
          });
        }
      }
    }
    
    return suggestions;
  }

  calculateRecommendationConfidence(suggestions) {
    if (suggestions.length === 0) return 0;
    
    const totalConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0);
    return totalConfidence / suggestions.length;
  }

  validateRecommendationSafety(recommendations) {
    const safetyCheck = { passed: true, warnings: [] };
    
    for (const suggestion of recommendations.suggestions) {
      // Check against safety bounds
      if (suggestion.type === 'optimization' && !this.isSafeImprovement(suggestion)) {
        safetyCheck.warnings.push(`Unsafe optimization: ${suggestion.suggestion}`);
      }
      
      // Check for rule violations
      if (suggestion.suggestion.toLowerCase().includes('ignore') || 
          suggestion.suggestion.toLowerCase().includes('bypass')) {
        safetyCheck.passed = false;
        safetyCheck.warnings.push(`Potentially unsafe suggestion: ${suggestion.suggestion}`);
      }
    }
    
    return safetyCheck;
  }

  isSafeImprovement(suggestion) {
    // Check if improvement is within safety bounds
    const safeCategories = this.learningConfig.safetyBounds.allowedImprovements;
    
    // Check if suggestion type is in allowed improvements
    const suggestionCategory = suggestion.category || 'unknown';
    
    if (!safeCategories.some(category => suggestionCategory.includes(category))) {
      return false;
    }
    
    // Check for unsafe patterns
    const unsafePatterns = [
      'ignore rule', 'bypass validation', 'skip check', 'override safety',
      'change file structure', 'modify path rules', 'alter template access'
    ];
    
    const suggestionText = suggestion.suggestion.toLowerCase();
    
    return !unsafePatterns.some(pattern => suggestionText.includes(pattern));
  }

  calculateWorkflowComplexity(workflow) {
    let complexity = 0;
    
    if (workflow.agents) complexity += workflow.agents.length * 0.2;
    if (workflow.sequence) complexity += workflow.sequence.length * 0.1;
    if (workflow.dependencies) complexity += Object.keys(workflow.dependencies).length * 0.3;
    
    return Math.min(1.0, complexity);
  }

  // Cleanup and utility methods

  async cleanup() {
    // Clean up old patterns and data
    const now = Date.now();
    let cleanedCount = 0;
    
    // Remove old success patterns
    for (const [key, pattern] of this.successPatterns.entries()) {
      if (now - pattern.lastSeen > this.learningConfig.maxPatternAge) {
        this.successPatterns.delete(key);
        cleanedCount++;
      }
    }
    
    // Remove old failure patterns
    for (const [key, pattern] of this.failurePatterns.entries()) {
      if (now - pattern.lastFailure > this.learningConfig.maxPatternAge) {
        this.failurePatterns.delete(key);
        cleanedCount++;
      }
    }
    
    console.log(`🧹 Learning cleanup: Removed ${cleanedCount} outdated patterns`);
    
    return cleanedCount;
  }

  getLearningStatistics() {
    return {
      successPatterns: this.successPatterns.size,
      failurePatterns: this.failurePatterns.size,
      humanFeedback: this.humanFeedback.length,
      learningConfig: this.learningConfig,
      recentActivity: {
        patternsLearned: Array.from(this.successPatterns.values())
          .filter(p => Date.now() - p.lastSeen < 24 * 60 * 60 * 1000).length,
        feedbackProcessed: this.humanFeedback
          .filter(f => Date.now() - f.timestamp < 24 * 60 * 60 * 1000).length
      }
    };
  }

  async stopLearning() {
    // Stop all learning processes
    Object.entries(this.learningProcesses).forEach(([processName, config]) => {
      if (config.intervalRef) {
        clearInterval(config.intervalRef);
        config.intervalRef = null;
      }
    });
    
    console.log('⏹️ Autonomous learning processes stopped');
    this.emit('learning-stopped');
  }
}

module.exports = AutonomousLearningEngine;