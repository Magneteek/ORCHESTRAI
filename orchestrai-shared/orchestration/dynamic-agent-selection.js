// Dynamic Agent Selection System with Self-Learning Intelligence
// Adaptive agent selection based on performance patterns, context matching, and predictive analytics

const EventEmitter = require('events');

class DynamicAgentSelection extends EventEmitter {
  constructor(learningFoundation, performanceSchema, domainAgentManager) {
    super();
    this.learningFoundation = learningFoundation;
    this.performanceSchema = performanceSchema;
    this.domainAgentManager = domainAgentManager;
    
    // Available agents registry
    this.agentRegistry = new Map();
    this.agentCapabilities = new Map();
    this.agentAvailability = new Map();
    
    // Selection strategies
    this.selectionStrategies = {
      'performance-based': new PerformanceBasedStrategy(learningFoundation),
      'context-aware': new ContextAwareStrategy(learningFoundation),
      'risk-minimized': new RiskMinimizedStrategy(learningFoundation),
      'resource-optimized': new ResourceOptimizedStrategy(learningFoundation),
      'hybrid-intelligent': new HybridIntelligentStrategy(learningFoundation)
    };
    
    // Selection configuration
    this.config = {
      defaultStrategy: 'hybrid-intelligent',
      fallbackStrategy: 'context-aware',
      minConfidenceThreshold: 0.6,
      maxSelectionTime: 5000, // 5 seconds max for selection
      learningWeight: 0.7, // Weight given to learned patterns vs static rules
      diversityFactor: 0.1, // Factor for encouraging agent diversity
      riskTolerance: 'medium' // low, medium, high
    };
    
    // Selection metrics and tracking
    this.selectionMetrics = {
      totalSelections: 0,
      successfulSelections: 0,
      averageSelectionTime: 0,
      strategyUsage: {},
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      lastUpdate: Date.now()
    };
    
    this.initializeSelection();
    console.log('🎯 Dynamic Agent Selection system initialized');
  }

  // ============ INITIALIZATION ============

  async initializeSelection() {
    // Discover available agents
    await this.discoverAvailableAgents();
    
    // Initialize agent capabilities mapping
    await this.mapAgentCapabilities();
    
    // Load historical selection data for calibration
    await this.calibrateSelectionStrategies();
    
    console.log(`🔍 Agent selection initialized with ${this.agentRegistry.size} agents`);
  }

  async discoverAvailableAgents() {
    // Get agents from domain manager
    if (this.domainAgentManager) {
      const agents = await this.domainAgentManager.getAllAgents();
      
      for (const agentInfo of agents) {
        this.registerAgent({
          id: agentInfo.agentId,
          name: agentInfo.agentId,
          domain: agentInfo.domain,
          type: agentInfo.type || 'domain-agent',
          capabilities: agentInfo.capabilities || [],
          priority: agentInfo.priority || 'medium',
          loadCapacity: agentInfo.loadCapacity || 5,
          currentLoad: 0,
          available: true
        });
      }
    }
    
    // Register core system agents
    this.registerDefaultAgents();
  }

  registerAgent(agentInfo) {
    this.agentRegistry.set(agentInfo.id, {
      ...agentInfo,
      registrationTime: Date.now(),
      totalAssignments: 0,
      successfulAssignments: 0,
      averagePerformance: 0.5,
      lastAssignment: null
    });
    
    // Initialize availability tracking
    this.agentAvailability.set(agentInfo.id, {
      available: true,
      currentLoad: 0,
      maxLoad: agentInfo.loadCapacity || 5,
      lastHealthCheck: Date.now()
    });
    
    console.log(`📝 Agent registered: ${agentInfo.id} (${agentInfo.domain})`);
  }

  registerDefaultAgents() {
    const defaultAgents = [
      {
        id: 'general-purpose-agent',
        name: 'General Purpose Agent',
        domain: 'general',
        type: 'claude-code',
        capabilities: ['research', 'analysis', 'writing', 'basic-coding'],
        priority: 'medium',
        loadCapacity: 10
      },
      {
        id: 'seo-specialist-agent',
        name: 'SEO Specialist',
        domain: 'seo',
        type: 'claude-code',
        capabilities: ['keyword-research', 'content-optimization', 'technical-seo'],
        priority: 'high',
        loadCapacity: 8
      },
      {
        id: 'content-writer-agent',
        name: 'Content Writer Specialist',
        domain: 'content',
        type: 'claude-code',
        capabilities: ['content-creation', 'copywriting', 'editing'],
        priority: 'high',
        loadCapacity: 6
      }
    ];

    defaultAgents.forEach(agent => this.registerAgent(agent));
  }

  async mapAgentCapabilities() {
    for (const [agentId, agentInfo] of this.agentRegistry) {
      const capabilities = new Set(agentInfo.capabilities);
      
      // Add domain-based capabilities
      switch (agentInfo.domain) {
        case 'seo':
          capabilities.add('search-optimization');
          capabilities.add('analytics');
          break;
        case 'content':
          capabilities.add('writing');
          capabilities.add('editing');
          break;
        case 'design':
          capabilities.add('visual-design');
          capabilities.add('ui-ux');
          break;
        case 'development':
          capabilities.add('coding');
          capabilities.add('debugging');
          break;
      }
      
      this.agentCapabilities.set(agentId, Array.from(capabilities));
    }
  }

  async calibrateSelectionStrategies() {
    // Get historical selection performance data
    const historicalSelections = await this.getHistoricalSelections();
    
    // Calibrate each strategy based on historical success
    for (const [strategyName, strategy] of Object.entries(this.selectionStrategies)) {
      if (strategy.calibrate) {
        await strategy.calibrate(historicalSelections);
      }
      this.selectionMetrics.strategyUsage[strategyName] = 0;
    }
  }

  // ============ CORE SELECTION LOGIC ============

  async selectAgent(taskContext, options = {}) {
    const selectionStartTime = Date.now();
    
    try {
      // Validate and prepare task context
      const normalizedContext = this.normalizeTaskContext(taskContext);
      
      // Determine selection strategy
      const strategy = this.determineSelectionStrategy(normalizedContext, options);
      
      // Get available agents matching basic requirements
      const candidateAgents = await this.getCandidateAgents(normalizedContext);
      
      if (candidateAgents.length === 0) {
        return this.handleNoAgentsAvailable(normalizedContext);
      }
      
      // Apply intelligent selection strategy
      const selectionResult = await strategy.selectAgent(candidateAgents, normalizedContext, options);
      
      // Validate and finalize selection
      const finalSelection = await this.validateAndFinalizeSelection(selectionResult, normalizedContext);
      
      // Update metrics and learning
      await this.updateSelectionMetrics(finalSelection, selectionStartTime);
      
      return finalSelection;
      
    } catch (error) {
      console.error('Error in agent selection:', error);
      return this.handleSelectionError(error, taskContext);
    }
  }

  normalizeTaskContext(taskContext) {
    return {
      type: taskContext.type || 'general',
      domain: taskContext.domain || 'general',
      complexity: taskContext.complexity || 'medium',
      priority: taskContext.priority || 'medium',
      keywords: Array.isArray(taskContext.keywords) ? taskContext.keywords : 
                 (taskContext.keywords || '').split(' ').filter(k => k.length > 2),
      requiredCapabilities: taskContext.requiredCapabilities || [],
      preferredAgents: taskContext.preferredAgents || [],
      excludedAgents: taskContext.excludedAgents || [],
      clientContext: taskContext.clientContext || null,
      projectPhase: taskContext.projectPhase || null,
      timeConstraints: taskContext.timeConstraints || null,
      qualityRequirements: taskContext.qualityRequirements || 'standard',
      resourceBudget: taskContext.resourceBudget || null,
      failureTolerance: taskContext.failureTolerance || 'medium'
    };
  }

  determineSelectionStrategy(taskContext, options) {
    // Strategy override from options
    if (options.strategy && this.selectionStrategies[options.strategy]) {
      return this.selectionStrategies[options.strategy];
    }
    
    // Context-based strategy determination
    if (taskContext.priority === 'high' && taskContext.failureTolerance === 'low') {
      return this.selectionStrategies['risk-minimized'];
    }
    
    if (taskContext.resourceBudget === 'limited') {
      return this.selectionStrategies['resource-optimized'];
    }
    
    if (taskContext.complexity === 'high') {
      return this.selectionStrategies['performance-based'];
    }
    
    // Default to hybrid intelligent strategy
    return this.selectionStrategies[this.config.defaultStrategy];
  }

  async getCandidateAgents(taskContext) {
    const candidates = [];
    
    for (const [agentId, agentInfo] of this.agentRegistry) {
      // Check basic availability
      const availability = this.agentAvailability.get(agentId);
      if (!availability?.available || availability.currentLoad >= availability.maxLoad) {
        continue;
      }
      
      // Check excluded agents
      if (taskContext.excludedAgents.includes(agentId)) {
        continue;
      }
      
      // Check domain compatibility
      if (taskContext.domain !== 'general' && 
          agentInfo.domain !== 'general' && 
          agentInfo.domain !== taskContext.domain) {
        continue;
      }
      
      // Check required capabilities
      if (taskContext.requiredCapabilities.length > 0) {
        const agentCapabilities = this.agentCapabilities.get(agentId) || [];
        const hasRequiredCapabilities = taskContext.requiredCapabilities.every(
          req => agentCapabilities.includes(req)
        );
        if (!hasRequiredCapabilities) {
          continue;
        }
      }
      
      candidates.push({
        agentId,
        agentInfo,
        availability,
        capabilities: this.agentCapabilities.get(agentId) || []
      });
    }
    
    return candidates;
  }

  async validateAndFinalizeSelection(selectionResult, taskContext) {
    if (!selectionResult || !selectionResult.selectedAgent) {
      throw new Error('Invalid selection result');
    }
    
    const { selectedAgent, confidence, reasoning, alternatives } = selectionResult;
    
    // Final availability check
    const availability = this.agentAvailability.get(selectedAgent.agentId);
    if (!availability?.available) {
      // Try first alternative
      if (alternatives && alternatives.length > 0) {
        return this.validateAndFinalizeSelection(
          { selectedAgent: alternatives[0], confidence: confidence * 0.8, reasoning: `Fallback: ${reasoning}` },
          taskContext
        );
      }
      throw new Error('Selected agent became unavailable');
    }
    
    // Update agent load
    availability.currentLoad += 1;
    
    // Update agent assignment tracking
    const agentInfo = this.agentRegistry.get(selectedAgent.agentId);
    agentInfo.totalAssignments += 1;
    agentInfo.lastAssignment = Date.now();
    
    return {
      agentId: selectedAgent.agentId,
      agentInfo: selectedAgent.agentInfo,
      confidence,
      reasoning,
      selectionStrategy: selectionResult.strategy,
      alternatives: alternatives || [],
      taskContext,
      assignmentTime: Date.now(),
      expectedPerformance: selectionResult.expectedPerformance || {}
    };
  }

  // ============ SELECTION STRATEGIES ============

  async selectBestAgentForTask(taskContext, options = {}) {
    // Main public interface for agent selection
    return await this.selectAgent(taskContext, options);
  }

  async selectMultipleAgents(taskContext, count, options = {}) {
    const selections = [];
    const usedAgents = new Set();
    
    for (let i = 0; i < count; i++) {
      const adjustedContext = {
        ...taskContext,
        excludedAgents: [...(taskContext.excludedAgents || []), ...usedAgents]
      };
      
      try {
        const selection = await this.selectAgent(adjustedContext, options);
        selections.push(selection);
        usedAgents.add(selection.agentId);
      } catch (error) {
        console.warn(`Could not select agent ${i + 1}/${count}:`, error.message);
        break;
      }
    }
    
    return {
      selections,
      requested: count,
      fulfilled: selections.length,
      taskContext
    };
  }

  async getAgentRecommendations(taskContext, maxRecommendations = 3) {
    const candidates = await this.getCandidateAgents(this.normalizeTaskContext(taskContext));
    
    if (candidates.length === 0) {
      return { recommendations: [], reasoning: 'No suitable agents available' };
    }
    
    // Get recommendations from performance schema
    const performanceRecommendations = await this.performanceSchema.getBestAgentForTask(
      taskContext,
      candidates.map(c => c.agentId)
    );
    
    // Enhance with selection intelligence
    const enhancedRecommendations = [];
    
    for (const rec of performanceRecommendations.recommendations.slice(0, maxRecommendations)) {
      const candidate = candidates.find(c => c.agentId === rec.agentId);
      if (candidate) {
        // Get additional predictions
        const failureRisk = await this.learningFoundation.predictTaskFailureRisk(taskContext, rec.agentId);
        const qualityPrediction = await this.learningFoundation.predictQualityScore(taskContext, rec.agentId);
        const resourcePrediction = await this.learningFoundation.predictResourceRequirements(taskContext);
        
        enhancedRecommendations.push({
          ...rec,
          agentInfo: candidate.agentInfo,
          predictions: {
            failureRisk,
            qualityScore: qualityPrediction,
            resourceRequirements: resourcePrediction
          },
          availability: candidate.availability,
          capabilities: candidate.capabilities
        });
      }
    }
    
    return {
      recommendations: enhancedRecommendations,
      reasoning: performanceRecommendations.queryContext,
      confidence: performanceRecommendations.confidence,
      memoriesAnalyzed: performanceRecommendations.memoriesAnalyzed
    };
  }

  // ============ AGENT LIFECYCLE MANAGEMENT ============

  async releaseAgent(agentId, taskResult = null) {
    const availability = this.agentAvailability.get(agentId);
    if (availability && availability.currentLoad > 0) {
      availability.currentLoad -= 1;
    }
    
    const agentInfo = this.agentRegistry.get(agentId);
    if (agentInfo && taskResult) {
      // Update success tracking
      if (taskResult.success) {
        agentInfo.successfulAssignments += 1;
      }
      
      // Update average performance
      if (taskResult.performanceScore !== undefined) {
        agentInfo.averagePerformance = (
          agentInfo.averagePerformance * (agentInfo.totalAssignments - 1) + taskResult.performanceScore
        ) / agentInfo.totalAssignments;
      }
    }
    
    console.log(`🔓 Agent released: ${agentId} (Load: ${availability?.currentLoad || 0})`);
  }

  async updateAgentAvailability(agentId, available = true, reason = null) {
    const availability = this.agentAvailability.get(agentId);
    if (availability) {
      availability.available = available;
      availability.lastHealthCheck = Date.now();
      
      if (reason) {
        availability.unavailableReason = reason;
      }
      
      console.log(`📊 Agent availability updated: ${agentId} - ${available ? 'Available' : 'Unavailable'}`);
    }
  }

  async performHealthChecks() {
    const healthCheckPromises = [];
    
    for (const [agentId, availability] of this.agentAvailability) {
      healthCheckPromises.push(this.checkAgentHealth(agentId, availability));
    }
    
    const results = await Promise.allSettled(healthCheckPromises);
    const healthySummary = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`💚 Health checks completed: ${healthySummary}/${results.length} agents healthy`);
    return { healthy: healthySummary, total: results.length };
  }

  async checkAgentHealth(agentId, availability) {
    try {
      // Implement actual health check logic here
      // For now, assume agents are healthy if recently active
      const timeSinceLastCheck = Date.now() - availability.lastHealthCheck;
      const isHealthy = timeSinceLastCheck < 300000; // 5 minutes
      
      if (!isHealthy) {
        availability.available = false;
        availability.unavailableReason = 'Health check timeout';
      }
      
      availability.lastHealthCheck = Date.now();
      return isHealthy;
    } catch (error) {
      console.error(`Health check failed for agent ${agentId}:`, error);
      availability.available = false;
      availability.unavailableReason = error.message;
      return false;
    }
  }

  // ============ ERROR HANDLING ============

  handleNoAgentsAvailable(taskContext) {
    return {
      error: 'No agents available',
      errorType: 'no-agents-available',
      taskContext,
      suggestions: [
        'Reduce task complexity',
        'Expand agent search criteria',
        'Wait for agent availability',
        'Consider task decomposition'
      ],
      fallback: null
    };
  }

  handleSelectionError(error, taskContext) {
    return {
      error: error.message,
      errorType: 'selection-error',
      taskContext,
      suggestions: [
        'Retry with different parameters',
        'Use fallback agent selection',
        'Check agent registry status'
      ],
      fallback: this.getFallbackAgent(taskContext)
    };
  }

  getFallbackAgent(taskContext) {
    // Return the most reliable general-purpose agent
    for (const [agentId, agentInfo] of this.agentRegistry) {
      if (agentInfo.domain === 'general' || agentId === 'general-purpose-agent') {
        const availability = this.agentAvailability.get(agentId);
        if (availability?.available) {
          return {
            agentId,
            agentInfo,
            confidence: 0.3,
            reasoning: 'Fallback agent due to selection error',
            isFallback: true
          };
        }
      }
    }
    
    return null;
  }

  // ============ METRICS & MONITORING ============

  async updateSelectionMetrics(selectionResult, startTime) {
    const selectionTime = Date.now() - startTime;
    
    this.selectionMetrics.totalSelections += 1;
    this.selectionMetrics.averageSelectionTime = 
      (this.selectionMetrics.averageSelectionTime * (this.selectionMetrics.totalSelections - 1) + selectionTime) / 
      this.selectionMetrics.totalSelections;
    
    // Update strategy usage
    if (selectionResult.selectionStrategy) {
      this.selectionMetrics.strategyUsage[selectionResult.selectionStrategy] = 
        (this.selectionMetrics.strategyUsage[selectionResult.selectionStrategy] || 0) + 1;
    }
    
    // Update confidence distribution
    if (selectionResult.confidence >= 0.8) {
      this.selectionMetrics.confidenceDistribution.high += 1;
    } else if (selectionResult.confidence >= 0.6) {
      this.selectionMetrics.confidenceDistribution.medium += 1;
    } else {
      this.selectionMetrics.confidenceDistribution.low += 1;
    }
    
    this.selectionMetrics.lastUpdate = Date.now();
  }

  async getSelectionMetrics() {
    return {
      ...this.selectionMetrics,
      agentRegistrySize: this.agentRegistry.size,
      availableAgents: Array.from(this.agentAvailability.values()).filter(a => a.available).length,
      averageAgentLoad: this.calculateAverageAgentLoad(),
      topPerformingAgents: this.getTopPerformingAgents(5)
    };
  }

  calculateAverageAgentLoad() {
    const loads = Array.from(this.agentAvailability.values()).map(a => a.currentLoad);
    return loads.length > 0 ? loads.reduce((a, b) => a + b) / loads.length : 0;
  }

  getTopPerformingAgents(count = 5) {
    return Array.from(this.agentRegistry.entries())
      .filter(([, info]) => info.totalAssignments >= 3)
      .sort(([, a], [, b]) => b.averagePerformance - a.averagePerformance)
      .slice(0, count)
      .map(([agentId, info]) => ({
        agentId,
        name: info.name,
        domain: info.domain,
        averagePerformance: info.averagePerformance,
        successRate: info.totalAssignments > 0 ? info.successfulAssignments / info.totalAssignments : 0,
        totalAssignments: info.totalAssignments
      }));
  }

  // ============ API METHODS ============

  async getSystemStatus() {
    return {
      active: true,
      registeredAgents: this.agentRegistry.size,
      availableAgents: Array.from(this.agentAvailability.values()).filter(a => a.available).length,
      selectionStrategies: Object.keys(this.selectionStrategies),
      defaultStrategy: this.config.defaultStrategy,
      metrics: this.selectionMetrics,
      configuration: this.config
    };
  }

  async getHistoricalSelections() {
    // This would typically query crystalline memory for historical selection data
    // For now, return empty array - this would be implemented based on actual storage
    return [];
  }
}

// ============ SELECTION STRATEGY CLASSES ============

class PerformanceBasedStrategy {
  constructor(learningFoundation) {
    this.learningFoundation = learningFoundation;
    this.name = 'performance-based';
  }

  async selectAgent(candidates, taskContext, options) {
    const agentScores = [];
    
    for (const candidate of candidates) {
      const prediction = await this.learningFoundation.predictAgentSuccess(
        candidate.agentId,
        taskContext
      );
      
      const qualityPrediction = await this.learningFoundation.predictQualityScore(
        taskContext,
        candidate.agentId
      );
      
      const score = (prediction.successProbability * 0.6) + 
                   ((qualityPrediction.quality || 0.5) * 0.4);
      
      agentScores.push({
        candidate,
        score,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning
      });
    }
    
    agentScores.sort((a, b) => b.score - a.score);
    
    return {
      selectedAgent: agentScores[0].candidate,
      confidence: agentScores[0].confidence,
      reasoning: `Performance-based: ${agentScores[0].reasoning}`,
      strategy: this.name,
      expectedPerformance: { score: agentScores[0].score },
      alternatives: agentScores.slice(1, 3).map(s => s.candidate)
    };
  }
}

class ContextAwareStrategy {
  constructor(learningFoundation) {
    this.learningFoundation = learningFoundation;
    this.name = 'context-aware';
  }

  async selectAgent(candidates, taskContext, options) {
    const contextScores = [];
    
    for (const candidate of candidates) {
      const similarContexts = await this.learningFoundation.findSimilarContexts(taskContext, 5);
      
      let contextScore = 0.5; // Base score
      
      // Domain match bonus
      if (candidate.agentInfo.domain === taskContext.domain) {
        contextScore += 0.2;
      }
      
      // Capability match bonus
      const capabilityMatches = candidate.capabilities.filter(cap => 
        taskContext.keywords.some(keyword => keyword.includes(cap.toLowerCase()))
      ).length;
      contextScore += Math.min(capabilityMatches * 0.1, 0.3);
      
      contextScores.push({
        candidate,
        score: contextScore,
        confidence: Math.min(0.8, 0.5 + (capabilityMatches * 0.1)),
        reasoning: `Context match: ${capabilityMatches} capability matches`
      });
    }
    
    contextScores.sort((a, b) => b.score - a.score);
    
    return {
      selectedAgent: contextScores[0].candidate,
      confidence: contextScores[0].confidence,
      reasoning: `Context-aware: ${contextScores[0].reasoning}`,
      strategy: this.name,
      alternatives: contextScores.slice(1, 3).map(s => s.candidate)
    };
  }
}

// Simplified implementations for other strategies
class RiskMinimizedStrategy {
  constructor(learningFoundation) {
    this.learningFoundation = learningFoundation;
    this.name = 'risk-minimized';
  }

  async selectAgent(candidates, taskContext, options) {
    // Select agent with lowest failure risk
    const riskAssessments = [];
    
    for (const candidate of candidates) {
      const failureRisk = await this.learningFoundation.predictTaskFailureRisk(
        taskContext,
        candidate.agentId
      );
      
      riskAssessments.push({
        candidate,
        riskLevel: failureRisk.riskLevel,
        score: this.convertRiskToScore(failureRisk.riskLevel),
        confidence: failureRisk.confidence
      });
    }
    
    riskAssessments.sort((a, b) => b.score - a.score);
    
    return {
      selectedAgent: riskAssessments[0].candidate,
      confidence: riskAssessments[0].confidence,
      reasoning: `Risk minimized: Lowest failure risk (${riskAssessments[0].riskLevel})`,
      strategy: this.name,
      alternatives: riskAssessments.slice(1, 3).map(r => r.candidate)
    };
  }
  
  convertRiskToScore(riskLevel) {
    const riskScores = { low: 0.9, medium: 0.6, high: 0.3 };
    return riskScores[riskLevel] || 0.5;
  }
}

class ResourceOptimizedStrategy {
  constructor(learningFoundation) {
    this.learningFoundation = learningFoundation;
    this.name = 'resource-optimized';
  }

  async selectAgent(candidates, taskContext, options) {
    const resourceScores = [];
    
    for (const candidate of candidates) {
      const resourcePrediction = await this.learningFoundation.predictResourceRequirements(taskContext);
      
      // Score based on efficiency (lower resource usage = higher score)
      const efficiencyScore = 1 / (resourcePrediction.tokens * 0.0001 + resourcePrediction.time * 0.000001);
      
      resourceScores.push({
        candidate,
        score: efficiencyScore,
        confidence: resourcePrediction.confidence,
        reasoning: `Predicted resources: ${resourcePrediction.tokens} tokens, ${resourcePrediction.time}ms`
      });
    }
    
    resourceScores.sort((a, b) => b.score - a.score);
    
    return {
      selectedAgent: resourceScores[0].candidate,
      confidence: resourceScores[0].confidence,
      reasoning: `Resource optimized: ${resourceScores[0].reasoning}`,
      strategy: this.name,
      alternatives: resourceScores.slice(1, 3).map(s => s.candidate)
    };
  }
}

class HybridIntelligentStrategy {
  constructor(learningFoundation) {
    this.learningFoundation = learningFoundation;
    this.name = 'hybrid-intelligent';
    
    // Initialize sub-strategies
    this.performanceStrategy = new PerformanceBasedStrategy(learningFoundation);
    this.contextStrategy = new ContextAwareStrategy(learningFoundation);
    this.riskStrategy = new RiskMinimizedStrategy(learningFoundation);
    this.resourceStrategy = new ResourceOptimizedStrategy(learningFoundation);
  }

  async selectAgent(candidates, taskContext, options) {
    // Get selections from all strategies
    const [performanceResult, contextResult, riskResult, resourceResult] = await Promise.all([
      this.performanceStrategy.selectAgent(candidates, taskContext, options),
      this.contextStrategy.selectAgent(candidates, taskContext, options),
      this.riskStrategy.selectAgent(candidates, taskContext, options),
      this.resourceStrategy.selectAgent(candidates, taskContext, options)
    ]);
    
    // Weight the results based on task characteristics
    const weights = this.calculateStrategyWeights(taskContext);
    
    // Score each candidate based on weighted strategy results
    const candidateScores = new Map();
    
    this.addStrategyScore(candidateScores, performanceResult, weights.performance);
    this.addStrategyScore(candidateScores, contextResult, weights.context);
    this.addStrategyScore(candidateScores, riskResult, weights.risk);
    this.addStrategyScore(candidateScores, resourceResult, weights.resource);
    
    // Find the highest scoring candidate
    const sortedScores = Array.from(candidateScores.entries())
      .sort(([, a], [, b]) => b.totalScore - a.totalScore);
    
    const winner = sortedScores[0];
    
    return {
      selectedAgent: winner[1].candidate,
      confidence: winner[1].avgConfidence,
      reasoning: `Hybrid intelligent selection: ${winner[1].reasoning}`,
      strategy: this.name,
      expectedPerformance: { hybridScore: winner[1].totalScore },
      alternatives: sortedScores.slice(1, 3).map(([, data]) => data.candidate)
    };
  }
  
  calculateStrategyWeights(taskContext) {
    const weights = { performance: 0.3, context: 0.3, risk: 0.2, resource: 0.2 };
    
    // Adjust weights based on task context
    if (taskContext.priority === 'high') {
      weights.performance += 0.1;
      weights.risk += 0.1;
      weights.resource -= 0.1;
      weights.context -= 0.1;
    }
    
    if (taskContext.complexity === 'high') {
      weights.performance += 0.1;
      weights.context += 0.1;
      weights.risk -= 0.1;
      weights.resource -= 0.1;
    }
    
    return weights;
  }
  
  addStrategyScore(candidateScores, strategyResult, weight) {
    const agentId = strategyResult.selectedAgent.agentId;
    
    if (!candidateScores.has(agentId)) {
      candidateScores.set(agentId, {
        candidate: strategyResult.selectedAgent,
        totalScore: 0,
        totalConfidence: 0,
        strategyCount: 0,
        reasoning: []
      });
    }
    
    const entry = candidateScores.get(agentId);
    entry.totalScore += (strategyResult.expectedPerformance?.score || 0.5) * weight;
    entry.totalConfidence += strategyResult.confidence * weight;
    entry.strategyCount += 1;
    entry.reasoning.push(strategyResult.reasoning);
    entry.avgConfidence = entry.totalConfidence / entry.strategyCount;
  }
}

module.exports = DynamicAgentSelection;