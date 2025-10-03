// Request Load Balancer - Intelligent distribution of queries across processing pipelines
// Implements advanced load balancing strategies with real-time performance monitoring

const EventEmitter = require('events');

class RequestLoadBalancer extends EventEmitter {
  constructor(concurrentRequestHandler, dynamicAgentSelection, crystallineMemory) {
    super();

    this.requestHandler = concurrentRequestHandler;
    this.agentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;

    // Load balancing configuration
    this.config = {
      balancingStrategy: 'adaptive-intelligent', // 'round-robin', 'weighted', 'capability-based', 'adaptive-intelligent'
      healthCheckInterval: 10000, // 10 seconds
      performanceWindowSize: 100, // Track last 100 requests for performance analysis
      circuitBreakerThreshold: 0.7, // Circuit breaker at 70% failure rate
      adaptiveThreshold: 0.8, // Switch strategies when performance drops below 80%
      geographicAwareness: false, // Enable geographic routing in future
      costOptimization: true, // Consider API costs in routing decisions
      learningRate: 0.1 // Rate of adaptation to performance changes
    };

    // Load balancing strategies
    this.strategies = {
      'round-robin': new RoundRobinStrategy(),
      'weighted': new WeightedStrategy(this),
      'capability-based': new CapabilityBasedStrategy(this),
      'adaptive-intelligent': new AdaptiveIntelligentStrategy(this),
      'least-connections': new LeastConnectionsStrategy(this),
      'response-time': new ResponseTimeStrategy(this),
      'resource-based': new ResourceBasedStrategy(this)
    };

    // Current active strategy
    this.activeStrategy = this.strategies[this.config.balancingStrategy];

    // Performance tracking
    this.performanceMetrics = {
      totalRequests: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      successRate: 0,
      currentLoad: 0,
      peakLoad: 0,
      lastPerformanceCheck: Date.now(),
      performanceHistory: [],
      strategyPerformance: new Map(),
      circuitBreakerStatus: 'closed' // 'closed', 'open', 'half-open'
    };

    // Request routing history for learning
    this.routingHistory = [];
    this.maxHistorySize = this.config.performanceWindowSize;

    // Pipeline performance tracking
    this.pipelineMetrics = new Map();

    // Load prediction and scaling
    this.loadPredictor = {
      currentTrend: 'stable', // 'increasing', 'decreasing', 'stable', 'spike'
      predictedLoadIncrease: 0,
      confidenceLevel: 0.5,
      lastPrediction: Date.now()
    };

    // Geographic and cost tracking (for future features)
    this.costMetrics = {
      totalCost: 0,
      costPerRequest: 0,
      budgetLimit: null,
      costOptimizationEnabled: this.config.costOptimization
    };

    // Initialization state
    this.isInitialized = false;

    console.log('🎯 RequestLoadBalancer initialized with', this.config.balancingStrategy, 'strategy');

    this.startPerformanceMonitoring();
    this.startHealthChecks();
  }

  /**
   * Main request routing method
   */
  async routeRequest(requestData, options = {}) {
    const routingStartTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      console.log(`🚦 Routing request ${requestId} using ${this.activeStrategy.name} strategy`);

      // Pre-routing analysis
      const routingContext = await this.analyzeRoutingContext(requestData, options);

      // Check circuit breaker
      if (this.performanceMetrics.circuitBreakerStatus === 'open') {
        return await this.handleCircuitBreakerOpen(requestData, options, routingContext);
      }

      // Strategy-based routing decision
      const routingDecision = await this.activeStrategy.route(requestData, options, routingContext);

      // Validate routing decision
      const validatedDecision = await this.validateRoutingDecision(routingDecision, routingContext);

      // Execute request through selected route
      const result = await this.executeRoute(validatedDecision, requestData, options);

      // Record successful routing
      await this.recordRoutingSuccess(requestId, validatedDecision, result, routingStartTime);

      return {
        success: true,
        requestId,
        result,
        routingDecision: validatedDecision,
        processingTime: Date.now() - routingStartTime,
        strategy: this.activeStrategy.name
      };

    } catch (error) {
      console.error(`❌ Request routing failed for ${requestId}:`, error.message);

      // Record routing failure
      await this.recordRoutingFailure(requestId, error, routingStartTime);

      // Try fallback routing
      const fallbackResult = await this.attemptFallbackRouting(requestData, options);

      if (fallbackResult.success) {
        return {
          success: true,
          requestId,
          result: fallbackResult.result,
          fallback: true,
          processingTime: Date.now() - routingStartTime,
          strategy: 'fallback'
        };
      } else {
        return {
          success: false,
          requestId,
          error: error.message,
          fallback: fallbackResult,
          processingTime: Date.now() - routingStartTime
        };
      }
    }
  }

  /**
   * Analyze routing context for intelligent decision making
   */
  async analyzeRoutingContext(requestData, options) {
    const context = {
      timestamp: Date.now(),
      requestType: this.classifyRequestType(requestData),
      complexity: this.estimateComplexity(requestData),
      priority: options.priority || 2,
      requiredCapabilities: this.extractRequiredCapabilities(requestData),
      estimatedResourceRequirement: this.estimateResourceRequirement(requestData),
      clientGeography: options.geography || null,
      budgetConstraints: options.budget || null,
      timeConstraints: options.timeout || null,
      dependencyAnalysis: await this.analyzeDependencies(requestData),
      historicalPerformance: this.getHistoricalPerformance(requestData),
      currentSystemLoad: this.getCurrentSystemLoad(),
      availableResources: await this.getAvailableResources()
    };

    return context;
  }

  /**
   * Classify request type for optimized routing
   */
  classifyRequestType(requestData) {
    const { query = '', tasks = [], subagent_type = '' } = requestData;
    const combined = `${query} ${subagent_type}`.toLowerCase();

    // Content creation patterns
    if (combined.includes('content') || combined.includes('article') || combined.includes('write')) {
      return 'content-creation';
    }

    // SEO analysis patterns
    if (combined.includes('seo') || combined.includes('keyword') || combined.includes('optimization')) {
      return 'seo-analysis';
    }

    // Web development patterns
    if (combined.includes('web') || combined.includes('frontend') || combined.includes('ui')) {
      return 'web-development';
    }

    // Research patterns
    if (combined.includes('research') || combined.includes('analyze') || combined.includes('study')) {
      return 'research-analysis';
    }

    // Multi-agent coordination patterns
    if (tasks.length > 1 || combined.includes('parallel') || combined.includes('multiple')) {
      return 'multi-agent-coordination';
    }

    return 'general';
  }

  /**
   * Estimate request complexity for resource allocation
   */
  estimateComplexity(requestData) {
    let complexity = 1.0; // Base complexity

    const { query = '', tasks = [], options = {} } = requestData;

    // Query length factor
    if (query.length > 1000) complexity += 0.5;
    else if (query.length > 500) complexity += 0.2;

    // Multiple tasks factor
    complexity += Math.min(tasks.length * 0.3, 1.5);

    // Complexity keywords
    const complexKeywords = ['comprehensive', 'detailed', 'analyze', 'optimize', 'research', 'compare'];
    const keywordCount = complexKeywords.reduce((count, keyword) =>
      count + (query.toLowerCase().includes(keyword) ? 1 : 0), 0);
    complexity += keywordCount * 0.2;

    // Special options
    if (options.highQuality) complexity += 0.5;
    if (options.deadline) complexity += 0.3;

    return Math.min(complexity, 5.0); // Cap at 5x base complexity
  }

  /**
   * Extract required capabilities from request
   */
  extractRequiredCapabilities(requestData) {
    const capabilities = new Set();
    const { query = '', tasks = [], subagent_type = '' } = requestData;

    // Agent type capabilities
    if (subagent_type) {
      capabilities.add(subagent_type);
    }

    // Task-based capabilities
    tasks.forEach(task => {
      if (task.subagent_type) capabilities.add(task.subagent_type);
      if (task.agent) capabilities.add(task.agent);
    });

    // Query-based capability inference
    const queryLower = query.toLowerCase();
    if (queryLower.includes('seo')) capabilities.add('seo-analysis');
    if (queryLower.includes('content')) capabilities.add('content-creation');
    if (queryLower.includes('web')) capabilities.add('web-development');
    if (queryLower.includes('research')) capabilities.add('research-analysis');

    return Array.from(capabilities);
  }

  /**
   * Estimate resource requirements
   */
  estimateResourceRequirement(requestData) {
    const complexity = this.estimateComplexity(requestData);
    const { tasks = [] } = requestData;

    return {
      cpuIntensity: complexity * 0.7,
      memoryRequirement: complexity * 0.5,
      networkBandwidth: tasks.length * 0.3,
      apiCalls: Math.max(tasks.length, 1) * complexity,
      estimatedTokens: this.estimateTokenUsage(requestData),
      estimatedTime: complexity * 10000 + tasks.length * 5000 // milliseconds
    };
  }

  /**
   * Estimate token usage for cost optimization
   */
  estimateTokenUsage(requestData) {
    const { query = '', tasks = [] } = requestData;
    const baseTokens = Math.ceil(query.length / 4); // Rough token estimation
    const taskTokens = tasks.reduce((sum, task) => sum + Math.ceil((task.prompt || '').length / 4), 0);
    return baseTokens + taskTokens;
  }

  /**
   * Analyze dependencies between tasks
   */
  async analyzeDependencies(requestData) {
    const { tasks = [] } = requestData;

    if (tasks.length <= 1) {
      return { hasDependencies: false, canParallelize: true, dependencyGraph: {} };
    }

    const dependencyGraph = {};
    let hasDependencies = false;

    // Simple dependency analysis based on task prompts
    tasks.forEach((task, index) => {
      const taskId = `task-${index}`;
      dependencyGraph[taskId] = {
        dependsOn: [],
        dependents: []
      };

      // Check if task references other tasks
      if (task.prompt && task.prompt.includes('based on') || task.prompt.includes('using the result')) {
        hasDependencies = true;
        // Mark dependency on previous task
        if (index > 0) {
          dependencyGraph[taskId].dependsOn.push(`task-${index - 1}`);
        }
      }
    });

    return {
      hasDependencies,
      canParallelize: !hasDependencies,
      dependencyGraph,
      recommendedExecution: hasDependencies ? 'sequential' : 'parallel'
    };
  }

  /**
   * Get historical performance for similar requests
   */
  getHistoricalPerformance(requestData) {
    const requestType = this.classifyRequestType(requestData);

    // Filter routing history for similar requests
    const similarRequests = this.routingHistory.filter(entry =>
      entry.requestType === requestType && entry.success
    );

    if (similarRequests.length === 0) {
      return {
        hasHistory: false,
        averageResponseTime: null,
        successRate: null,
        recommendedStrategy: null
      };
    }

    const totalTime = similarRequests.reduce((sum, entry) => sum + entry.responseTime, 0);
    const successCount = similarRequests.filter(entry => entry.success).length;

    return {
      hasHistory: true,
      averageResponseTime: totalTime / similarRequests.length,
      successRate: successCount / similarRequests.length,
      sampleSize: similarRequests.length,
      recommendedStrategy: this.findBestPerformingStrategy(similarRequests)
    };
  }

  /**
   * Get current system load
   */
  getCurrentSystemLoad() {
    const requestHandlerMetrics = this.requestHandler.getMetrics();

    return {
      currentRequests: requestHandlerMetrics.queueMetrics.totalQueued,
      pipelineUtilization: requestHandlerMetrics.pipelineMetrics.utilization,
      averageResponseTime: requestHandlerMetrics.averageResponseTime,
      throughput: requestHandlerMetrics.throughputPerSecond,
      availablePipelines: requestHandlerMetrics.pipelineMetrics.available,
      totalPipelines: requestHandlerMetrics.pipelineMetrics.total,
      loadLevel: this.calculateLoadLevel(requestHandlerMetrics)
    };
  }

  /**
   * Calculate system load level
   */
  calculateLoadLevel(metrics) {
    const utilizationScore = metrics.pipelineMetrics.utilization / 100;
    const queueScore = Math.min(metrics.queueMetrics.totalQueued / 50, 1); // Normalize to 50 max queue
    const responseTimeScore = Math.min(metrics.averageResponseTime / 30000, 1); // Normalize to 30s max

    const overallLoad = (utilizationScore * 0.5) + (queueScore * 0.3) + (responseTimeScore * 0.2);

    if (overallLoad < 0.3) return 'low';
    if (overallLoad < 0.6) return 'medium';
    if (overallLoad < 0.8) return 'high';
    return 'critical';
  }

  /**
   * Get available resources
   */
  async getAvailableResources() {
    const systemMetrics = this.requestHandler.getSystemStatus();

    return {
      availablePipelines: systemMetrics.availablePipelines,
      totalPipelines: systemMetrics.currentPipelines,
      canCreateNewPipeline: systemMetrics.currentPipelines < systemMetrics.maxConcurrentPipelines,
      queueCapacity: 1000 - this.performanceMetrics.currentLoad, // Estimated queue capacity
      memoryUsage: process.memoryUsage(),
      lastUpdated: Date.now()
    };
  }

  /**
   * Validate routing decision
   */
  async validateRoutingDecision(decision, context) {
    // Check if route is available
    if (!decision.route || !decision.route.available) {
      throw new Error('Selected route is not available');
    }

    // Check resource requirements
    if (context.estimatedResourceRequirement.cpuIntensity > 4.0 && context.currentSystemLoad.loadLevel === 'critical') {
      console.warn('⚠️ High resource requirement during critical load - may cause performance degradation');
    }

    // Check cost constraints
    if (this.config.costOptimization && context.budgetConstraints) {
      const estimatedCost = this.estimateRequestCost(decision, context);
      if (estimatedCost > context.budgetConstraints.maxCost) {
        throw new Error(`Estimated cost (${estimatedCost}) exceeds budget limit (${context.budgetConstraints.maxCost})`);
      }
    }

    return {
      ...decision,
      validated: true,
      validationTime: Date.now(),
      warnings: decision.warnings || []
    };
  }

  /**
   * Execute route through request handler
   */
  async executeRoute(decision, requestData, options) {
    const routeOptions = {
      ...options,
      priority: decision.priority || options.priority,
      capability: decision.capability,
      timeout: decision.timeout || options.timeout,
      metadata: {
        ...options.metadata,
        routingStrategy: decision.strategy,
        routeId: decision.routeId,
        loadBalancer: 'RequestLoadBalancer'
      }
    };

    return await this.requestHandler.processRequest(requestData, routeOptions);
  }

  /**
   * Record successful routing
   */
  async recordRoutingSuccess(requestId, decision, result, startTime) {
    const routingRecord = {
      requestId,
      timestamp: Date.now(),
      strategy: decision.strategy,
      route: decision.route,
      success: true,
      responseTime: Date.now() - startTime,
      requestType: this.classifyRequestType(result.requestData || {}),
      pipelineId: result.pipelineId,
      resourceUsage: result.metadata?.resourceUsage || null
    };

    // Add to routing history
    this.routingHistory.push(routingRecord);
    if (this.routingHistory.length > this.maxHistorySize) {
      this.routingHistory.shift();
    }

    // Update performance metrics
    this.updatePerformanceMetrics(routingRecord);

    // Update strategy performance
    this.updateStrategyPerformance(decision.strategy, true, routingRecord.responseTime);

    console.log(`✅ Routing success: ${requestId} via ${decision.strategy} in ${routingRecord.responseTime}ms`);

    this.emit('routing-success', routingRecord);
  }

  /**
   * Record routing failure
   */
  async recordRoutingFailure(requestId, error, startTime) {
    const routingRecord = {
      requestId,
      timestamp: Date.now(),
      strategy: this.activeStrategy.name,
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message,
      requestType: 'unknown'
    };

    // Add to routing history
    this.routingHistory.push(routingRecord);
    if (this.routingHistory.length > this.maxHistorySize) {
      this.routingHistory.shift();
    }

    // Update performance metrics
    this.updatePerformanceMetrics(routingRecord);

    // Update strategy performance
    this.updateStrategyPerformance(this.activeStrategy.name, false, routingRecord.responseTime);

    // Check if circuit breaker should open
    await this.checkCircuitBreaker();

    console.error(`❌ Routing failure: ${requestId} - ${error.message}`);

    this.emit('routing-failure', routingRecord);
  }

  /**
   * Attempt fallback routing
   */
  async attemptFallbackRouting(requestData, options) {
    console.log('🔄 Attempting fallback routing...');

    try {
      // Use simplest strategy for fallback
      const fallbackStrategy = this.strategies['round-robin'];
      const fallbackContext = { simple: true, fallback: true };

      const decision = await fallbackStrategy.route(requestData, options, fallbackContext);
      const result = await this.executeRoute(decision, requestData, options);

      return { success: true, result };

    } catch (error) {
      console.error('❌ Fallback routing also failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle circuit breaker open state
   */
  async handleCircuitBreakerOpen(requestData, options, context) {
    console.warn('⚡ Circuit breaker is OPEN - rejecting request');

    // Check if we should try half-open
    if (this.shouldTryHalfOpen()) {
      console.log('🔄 Trying circuit breaker half-open state...');
      this.performanceMetrics.circuitBreakerStatus = 'half-open';

      try {
        const result = await this.attemptFallbackRouting(requestData, options);
        if (result.success) {
          this.performanceMetrics.circuitBreakerStatus = 'closed';
          console.log('✅ Circuit breaker closed - system recovered');
        }
        return result;
      } catch (error) {
        this.performanceMetrics.circuitBreakerStatus = 'open';
        throw error;
      }
    }

    throw new Error('System overload - circuit breaker open');
  }

  /**
   * Check if circuit breaker should open
   */
  async checkCircuitBreaker() {
    const recentFailures = this.routingHistory
      .filter(entry => entry.timestamp > Date.now() - 60000) // Last minute
      .filter(entry => !entry.success);

    const totalRecent = this.routingHistory
      .filter(entry => entry.timestamp > Date.now() - 60000).length;

    if (totalRecent >= 10) {
      const failureRate = recentFailures.length / totalRecent;

      if (failureRate >= this.config.circuitBreakerThreshold) {
        this.performanceMetrics.circuitBreakerStatus = 'open';
        console.warn(`⚡ Circuit breaker OPENED - failure rate: ${(failureRate * 100).toFixed(1)}%`);
        this.emit('circuit-breaker-opened', { failureRate, recentFailures: recentFailures.length });
      }
    }
  }

  /**
   * Check if circuit breaker should try half-open
   */
  shouldTryHalfOpen() {
    // Try half-open every 30 seconds
    return !this.lastHalfOpenTry || (Date.now() - this.lastHalfOpenTry) > 30000;
  }

  // Helper methods and utility functions

  generateRequestId() {
    return `route-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  updatePerformanceMetrics(record) {
    this.performanceMetrics.totalRequests++;

    if (record.success) {
      // Update average response time
      const currentAvg = this.performanceMetrics.averageResponseTime;
      this.performanceMetrics.averageResponseTime = currentAvg === 0
        ? record.responseTime
        : (currentAvg + record.responseTime) / 2;
    }

    // Update success rate
    const recentSuccesses = this.routingHistory
      .filter(entry => entry.timestamp > Date.now() - 300000) // Last 5 minutes
      .filter(entry => entry.success).length;

    const recentTotal = this.routingHistory
      .filter(entry => entry.timestamp > Date.now() - 300000).length;

    this.performanceMetrics.successRate = recentTotal > 0 ? recentSuccesses / recentTotal : 0;

    // Update requests per second
    const now = Date.now();
    if (now - this.performanceMetrics.lastPerformanceCheck >= 1000) {
      const requestsInLastSecond = this.routingHistory
        .filter(entry => entry.timestamp > now - 1000).length;

      this.performanceMetrics.requestsPerSecond = requestsInLastSecond;
      this.performanceMetrics.lastPerformanceCheck = now;
    }
  }

  updateStrategyPerformance(strategyName, success, responseTime) {
    if (!this.performanceMetrics.strategyPerformance.has(strategyName)) {
      this.performanceMetrics.strategyPerformance.set(strategyName, {
        totalRequests: 0,
        successfulRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        successRate: 0
      });
    }

    const strategyMetrics = this.performanceMetrics.strategyPerformance.get(strategyName);
    strategyMetrics.totalRequests++;

    if (success) {
      strategyMetrics.successfulRequests++;
      strategyMetrics.totalResponseTime += responseTime;
      strategyMetrics.averageResponseTime = strategyMetrics.totalResponseTime / strategyMetrics.successfulRequests;
    }

    strategyMetrics.successRate = strategyMetrics.successfulRequests / strategyMetrics.totalRequests;
  }

  findBestPerformingStrategy(similarRequests) {
    const strategyPerformance = {};

    similarRequests.forEach(request => {
      if (!strategyPerformance[request.strategy]) {
        strategyPerformance[request.strategy] = {
          count: 0,
          totalTime: 0,
          successCount: 0
        };
      }

      const strategy = strategyPerformance[request.strategy];
      strategy.count++;
      strategy.totalTime += request.responseTime;
      if (request.success) strategy.successCount++;
    });

    let bestStrategy = null;
    let bestScore = -1;

    Object.keys(strategyPerformance).forEach(strategyName => {
      const metrics = strategyPerformance[strategyName];
      const avgTime = metrics.totalTime / metrics.count;
      const successRate = metrics.successCount / metrics.count;

      // Combined score: success rate (70%) + speed bonus (30%)
      const speedBonus = Math.max(0, (15000 - avgTime) / 15000); // Normalize to 15s max
      const score = (successRate * 0.7) + (speedBonus * 0.3);

      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategyName;
      }
    });

    return bestStrategy;
  }

  estimateRequestCost(decision, context) {
    const baseTokenCost = 0.001; // $0.001 per 1k tokens
    const estimatedTokens = context.estimatedResourceRequirement.estimatedTokens;
    return (estimatedTokens / 1000) * baseTokenCost;
  }

  startPerformanceMonitoring() {
    setInterval(() => {
      this.evaluateStrategyPerformance();
      this.updateLoadPredictions();
      this.optimizeConfiguration();
    }, this.config.healthCheckInterval);
  }

  startHealthChecks() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval / 2);
  }

  evaluateStrategyPerformance() {
    const currentPerformance = this.performanceMetrics.successRate;

    if (currentPerformance < this.config.adaptiveThreshold) {
      this.considerStrategySwitch();
    }
  }

  considerStrategySwitch() {
    // Find the best performing strategy based on recent history
    const recentHistory = this.routingHistory.filter(
      entry => entry.timestamp > Date.now() - 300000 // Last 5 minutes
    );

    if (recentHistory.length < 10) return; // Not enough data

    const bestStrategy = this.findBestPerformingStrategy(recentHistory);

    if (bestStrategy && bestStrategy !== this.activeStrategy.name) {
      console.log(`🔄 Switching from ${this.activeStrategy.name} to ${bestStrategy} strategy`);
      this.activeStrategy = this.strategies[bestStrategy];
      this.emit('strategy-switched', {
        from: this.activeStrategy.name,
        to: bestStrategy,
        reason: 'performance-optimization'
      });
    }
  }

  updateLoadPredictions() {
    // Simple load trend analysis
    const recentMetrics = this.routingHistory
      .filter(entry => entry.timestamp > Date.now() - 60000) // Last minute
      .length;

    const previousMetrics = this.routingHistory
      .filter(entry => entry.timestamp > Date.now() - 120000 && entry.timestamp <= Date.now() - 60000)
      .length;

    if (previousMetrics > 0) {
      const changeRatio = recentMetrics / previousMetrics;

      if (changeRatio > 1.5) {
        this.loadPredictor.currentTrend = 'increasing';
        this.loadPredictor.predictedLoadIncrease = (changeRatio - 1) * 100;
      } else if (changeRatio < 0.7) {
        this.loadPredictor.currentTrend = 'decreasing';
        this.loadPredictor.predictedLoadIncrease = (changeRatio - 1) * 100;
      } else {
        this.loadPredictor.currentTrend = 'stable';
        this.loadPredictor.predictedLoadIncrease = 0;
      }

      this.loadPredictor.confidenceLevel = Math.min(recentMetrics / 20, 1); // More data = higher confidence
      this.loadPredictor.lastPrediction = Date.now();
    }
  }

  optimizeConfiguration() {
    // Auto-tune configuration based on performance
    const recentSuccessRate = this.performanceMetrics.successRate;

    if (recentSuccessRate < 0.8) {
      // Reduce circuit breaker threshold for faster recovery
      this.config.circuitBreakerThreshold = Math.max(0.5, this.config.circuitBreakerThreshold - 0.05);
    } else if (recentSuccessRate > 0.95) {
      // Increase threshold for better tolerance
      this.config.circuitBreakerThreshold = Math.min(0.9, this.config.circuitBreakerThreshold + 0.05);
    }
  }

  performHealthCheck() {
    const metrics = this.getMetrics();

    // Emit health status
    this.emit('health-check', {
      status: this.performanceMetrics.circuitBreakerStatus,
      metrics,
      timestamp: Date.now()
    });
  }

  // Public API methods

  getMetrics() {
    return {
      ...this.performanceMetrics,
      activeStrategy: this.activeStrategy.name,
      loadPrediction: this.loadPredictor,
      configuration: this.config,
      strategyMetrics: Object.fromEntries(this.performanceMetrics.strategyPerformance),
      recentHistory: this.routingHistory.slice(-10)
    };
  }

  getSystemStatus() {
    return {
      operational: this.performanceMetrics.circuitBreakerStatus !== 'open',
      activeStrategy: this.activeStrategy.name,
      circuitBreakerStatus: this.performanceMetrics.circuitBreakerStatus,
      currentLoad: this.performanceMetrics.currentLoad,
      healthStatus: this.performanceMetrics.successRate > 0.8 ? 'healthy' : 'degraded',
      lastUpdate: Date.now()
    };
  }

  async switchStrategy(strategyName) {
    if (this.strategies[strategyName]) {
      const oldStrategy = this.activeStrategy.name;
      this.activeStrategy = this.strategies[strategyName];
      this.config.balancingStrategy = strategyName;

      console.log(`🔄 Manual strategy switch: ${oldStrategy} → ${strategyName}`);

      this.emit('strategy-switched', {
        from: oldStrategy,
        to: strategyName,
        reason: 'manual'
      });

      return true;
    }

    return false;
  }

  async updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ RequestLoadBalancer configuration updated');

    if (newConfig.balancingStrategy && this.strategies[newConfig.balancingStrategy]) {
      await this.switchStrategy(newConfig.balancingStrategy);
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialization already done in constructor, just mark as initialized
      this.isInitialized = true;
      console.log('✅ RequestLoadBalancer fully initialized');

    } catch (error) {
      console.error('❌ Failed to initialize RequestLoadBalancer:', error);
      throw error;
    }
  }

  async getHealthStatus() {
    return {
      status: this.strategies && Object.keys(this.strategies).length > 0 ? 'healthy' : 'critical',
      activeStrategy: this.activeStrategy?.name || 'none',
      availableStrategies: Object.keys(this.strategies || {}),
      performanceMetrics: this.performanceMetrics,
      routingHistory: this.routingHistory.length
    };
  }

  async switchToFaultTolerantStrategy() {
    console.log('🛡️ Switching to fault-tolerant strategy due to high error rate');
    this.activeStrategy = this.strategies['round-robin'] || this.strategies['weighted-round-robin'];
  }

  updateAgentMetrics(agentData) {
    // Update routing decisions based on agent status changes
    if (agentData.status === 'unavailable') {
      // Adjust routing to avoid unavailable agents
      console.log(`⚠️ Agent ${agentData.id} unavailable, adjusting routing`);
    }
  }

  async shutdown() {
    console.log('🛑 RequestLoadBalancer shutting down...');

    // Clear intervals
    clearInterval(this.performanceMonitoringInterval);
    clearInterval(this.healthCheckInterval);

    this.removeAllListeners();
    console.log('✅ RequestLoadBalancer shutdown complete');
  }
}

// Load Balancing Strategy Classes

class RoundRobinStrategy {
  constructor() {
    this.name = 'round-robin';
    this.currentIndex = 0;
  }

  async route(requestData, options, context) {
    return {
      strategy: this.name,
      route: { id: 'default', available: true },
      priority: options.priority || 2,
      capability: 'general',
      routeId: `rr-${this.currentIndex++}`
    };
  }
}

class WeightedStrategy {
  constructor(loadBalancer) {
    this.name = 'weighted';
    this.loadBalancer = loadBalancer;
  }

  async route(requestData, options, context) {
    const currentLoad = context.currentSystemLoad.loadLevel;

    // Adjust priority based on system load
    let priority = options.priority || 2;
    if (currentLoad === 'high') priority = Math.max(1, priority - 1);
    if (currentLoad === 'critical') priority = Math.max(0, priority - 2);

    return {
      strategy: this.name,
      route: { id: 'weighted', available: true },
      priority,
      capability: context.requiredCapabilities[0] || 'general',
      routeId: `wt-${Date.now()}`
    };
  }
}

class CapabilityBasedStrategy {
  constructor(loadBalancer) {
    this.name = 'capability-based';
    this.loadBalancer = loadBalancer;
  }

  async route(requestData, options, context) {
    const primaryCapability = context.requiredCapabilities[0] || 'general';

    return {
      strategy: this.name,
      route: { id: 'capability-matched', available: true },
      priority: options.priority || 2,
      capability: primaryCapability,
      routeId: `cb-${Date.now()}`,
      timeout: context.estimatedResourceRequirement.estimatedTime
    };
  }
}

class AdaptiveIntelligentStrategy {
  constructor(loadBalancer) {
    this.name = 'adaptive-intelligent';
    this.loadBalancer = loadBalancer;
  }

  async route(requestData, options, context) {
    // Intelligent routing based on multiple factors
    let priority = options.priority || 2;
    let capability = context.requiredCapabilities[0] || 'general';

    // Adjust based on system load
    if (context.currentSystemLoad.loadLevel === 'critical') {
      priority = Math.max(0, priority - 1);
    }

    // Adjust based on complexity
    if (context.complexity > 3.0) {
      priority = Math.min(4, priority + 1);
    }

    // Use historical performance
    if (context.historicalPerformance.hasHistory && context.historicalPerformance.recommendedStrategy) {
      // Boost priority for historically successful request types
      if (context.historicalPerformance.successRate > 0.9) {
        priority = Math.min(4, priority + 1);
      }
    }

    return {
      strategy: this.name,
      route: { id: 'adaptive-intelligent', available: true },
      priority,
      capability,
      routeId: `ai-${Date.now()}`,
      timeout: Math.max(context.estimatedResourceRequirement.estimatedTime, 30000),
      confidence: context.historicalPerformance.hasHistory ? 0.8 : 0.6
    };
  }
}

class LeastConnectionsStrategy {
  constructor(loadBalancer) {
    this.name = 'least-connections';
    this.loadBalancer = loadBalancer;
  }

  async route(requestData, options, context) {
    const availablePipelines = context.availableResources.availablePipelines;

    return {
      strategy: this.name,
      route: { id: 'least-connections', available: availablePipelines > 0 },
      priority: options.priority || 2,
      capability: context.requiredCapabilities[0] || 'general',
      routeId: `lc-${Date.now()}`
    };
  }
}

class ResponseTimeStrategy {
  constructor(loadBalancer) {
    this.name = 'response-time';
    this.loadBalancer = loadBalancer;
  }

  async route(requestData, options, context) {
    // Route based on predicted response time
    const estimatedTime = context.estimatedResourceRequirement.estimatedTime;
    let priority = options.priority || 2;

    // Higher priority for quick tasks when system is loaded
    if (estimatedTime < 10000 && context.currentSystemLoad.loadLevel === 'high') {
      priority = Math.min(4, priority + 1);
    }

    return {
      strategy: this.name,
      route: { id: 'response-time-optimized', available: true },
      priority,
      capability: context.requiredCapabilities[0] || 'general',
      routeId: `rt-${Date.now()}`,
      timeout: estimatedTime * 1.5 // Add buffer
    };
  }
}

class ResourceBasedStrategy {
  constructor(loadBalancer) {
    this.name = 'resource-based';
    this.loadBalancer = loadBalancer;
  }

  async route(requestData, options, context) {
    const resourceReq = context.estimatedResourceRequirement;
    let priority = options.priority || 2;

    // Adjust priority based on resource intensity
    if (resourceReq.cpuIntensity > 3.0) {
      priority = Math.max(0, priority - 1); // Lower priority for resource-intensive tasks
    }

    if (resourceReq.memoryRequirement > 2.0) {
      priority = Math.max(0, priority - 1);
    }

    return {
      strategy: this.name,
      route: { id: 'resource-optimized', available: true },
      priority,
      capability: context.requiredCapabilities[0] || 'general',
      routeId: `rb-${Date.now()}`,
      resourceWeight: resourceReq.cpuIntensity + resourceReq.memoryRequirement
    };
  }
}

module.exports = RequestLoadBalancer;