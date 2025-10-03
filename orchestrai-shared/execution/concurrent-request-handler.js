// Concurrent Request Handler - True simultaneous multi-agent processing
// Replaces single-threaded orchestrator with concurrent pipeline architecture

const EventEmitter = require('events');
const crypto = require('crypto');

class ConcurrentRequestHandler extends EventEmitter {
  constructor(orchestrator, crystallineMemory, mcpManager) {
    super();

    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.mcpManager = mcpManager;

    // Concurrent processing configuration
    this.config = {
      maxConcurrentPipelines: 16, // Maximum simultaneous processing pipelines
      maxPipelineCapacity: 4,     // Maximum tasks per pipeline
      pipelineTimeout: 120000,    // 2 minutes timeout per pipeline
      queueTimeout: 30000,        // 30 seconds max wait in queue
      priorityLevels: 5,          // Number of priority levels (0-4)
      adaptiveScaling: true,      // Auto-adjust pipeline count based on load
      loadBalancingStrategy: 'intelligent' // 'round-robin', 'weighted', 'intelligent'
    };

    // Processing pipelines
    this.processingPipelines = new Map();
    this.availablePipelines = [];
    this.requestQueue = [];
    this.activeRequests = new Map();

    // Performance metrics
    this.metrics = {
      totalRequestsProcessed: 0,
      concurrentRequestsProcessed: 0,
      averageResponseTime: 0,
      throughputPerSecond: 0,
      pipelineUtilization: 0,
      queuedRequests: 0,
      rejectedRequests: 0,
      lastThroughputCheck: Date.now(),
      requestsInLastSecond: 0
    };

    // Priority queues for different request types
    this.priorityQueues = Array.from({ length: this.config.priorityLevels }, () => []);

    // Pipeline lifecycle management
    this.pipelineLifecycle = {
      created: 0,
      destroyed: 0,
      activeTime: 0,
      idleTime: 0
    };

    // Initialization state
    this.isInitialized = false;
    this.isShuttingDown = false;

    console.log('🚀 ConcurrentRequestHandler initialized - Supporting up to', this.config.maxConcurrentPipelines, 'simultaneous pipelines');

    this.initializePipelines();
    this.startMetricsCollection();
  }

  /**
   * Initialize processing pipelines
   */
  async initializePipelines() {
    // Create initial set of processing pipelines
    const initialPipelineCount = Math.min(4, this.config.maxConcurrentPipelines);

    for (let i = 0; i < initialPipelineCount; i++) {
      await this.createProcessingPipeline(`pipeline-${i}`);
    }

    console.log(`✅ Initialized ${initialPipelineCount} processing pipelines`);
  }

  /**
   * Create a new processing pipeline
   */
  async createProcessingPipeline(pipelineId) {
    const pipeline = {
      id: pipelineId,
      status: 'idle',
      currentRequest: null,
      activeTasks: new Map(),
      taskQueue: [],
      created: Date.now(),
      lastActivity: Date.now(),
      processedRequests: 0,
      totalProcessingTime: 0,
      averageResponseTime: 0,
      capability: 'general', // Can be specialized: 'content', 'seo', 'web', etc.
      maxCapacity: this.config.maxPipelineCapacity,
      currentLoad: 0
    };

    this.processingPipelines.set(pipelineId, pipeline);
    this.availablePipelines.push(pipelineId);
    this.pipelineLifecycle.created++;

    console.log(`📦 Created processing pipeline: ${pipelineId}`);

    this.emit('pipeline-created', { pipelineId, pipeline });

    return pipeline;
  }

  /**
   * Main entry point for concurrent request processing
   */
  async processRequest(requestData, options = {}) {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    // Prepare request object
    const request = {
      id: requestId,
      data: requestData,
      options,
      priority: options.priority || 2, // Default medium priority
      createdAt: startTime,
      timeout: options.timeout || this.config.pipelineTimeout,
      requiredCapability: options.capability || 'general',
      dependencies: options.dependencies || [],
      callback: options.callback || null,
      metadata: options.metadata || {}
    };

    console.log(`🎯 Processing concurrent request: ${requestId} (Priority: ${request.priority})`);

    try {
      // Add to active requests tracking
      this.activeRequests.set(requestId, request);

      // Queue request based on priority
      await this.queueRequest(request);

      // Process queued requests
      await this.processQueuedRequests();

      // Wait for request completion or timeout
      const result = await this.waitForRequestCompletion(requestId, request.timeout);

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);

      console.log(`✅ Request ${requestId} completed in ${responseTime}ms`);

      return {
        success: true,
        requestId,
        result,
        processingTime: responseTime,
        pipelineId: result.pipelineId,
        metadata: {
          ...result.metadata,
          concurrent: true,
          totalProcessingTime: responseTime
        }
      };

    } catch (error) {
      console.error(`❌ Request ${requestId} failed:`, error.message);

      // Update metrics for failure
      this.updateMetrics(Date.now() - startTime, false);
      this.metrics.rejectedRequests++;

      return {
        success: false,
        requestId,
        error: error.message,
        processingTime: Date.now() - startTime,
        metadata: {
          concurrent: true,
          failed: true
        }
      };
    } finally {
      // Cleanup
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Queue request based on priority
   */
  async queueRequest(request) {
    const priorityLevel = Math.min(request.priority, this.config.priorityLevels - 1);

    // Insert request maintaining order within priority level
    this.priorityQueues[priorityLevel].push(request);
    this.metrics.queuedRequests++;

    // Sort by creation time within priority level
    this.priorityQueues[priorityLevel].sort((a, b) => a.createdAt - b.createdAt);

    console.log(`📥 Request ${request.id} queued at priority level ${priorityLevel}`);

    this.emit('request-queued', {
      requestId: request.id,
      priorityLevel,
      queuePosition: this.getQueuePosition(request.id),
      estimatedWait: this.estimateWaitTime(priorityLevel)
    });
  }

  /**
   * Process all queued requests
   */
  async processQueuedRequests() {
    // Process highest priority requests first
    for (let priorityLevel = this.config.priorityLevels - 1; priorityLevel >= 0; priorityLevel--) {
      const queue = this.priorityQueues[priorityLevel];

      while (queue.length > 0 && this.hasAvailableCapacity()) {
        const request = queue.shift();
        this.metrics.queuedRequests--;

        // Find best available pipeline
        const pipeline = await this.selectOptimalPipeline(request);

        if (pipeline) {
          // Assign request to pipeline
          await this.assignRequestToPipeline(request, pipeline);
        } else {
          // No available pipeline, requeue or create new pipeline
          if (this.config.adaptiveScaling && this.canCreateNewPipeline()) {
            const newPipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
            const newPipeline = await this.createProcessingPipeline(newPipelineId);
            await this.assignRequestToPipeline(request, newPipeline);
          } else {
            // Requeue request
            queue.unshift(request);
            this.metrics.queuedRequests++;
            break;
          }
        }
      }
    }
  }

  /**
   * Select optimal pipeline for request
   */
  async selectOptimalPipeline(request) {
    const availablePipelines = this.getAvailablePipelines();

    if (availablePipelines.length === 0) {
      return null;
    }

    // Strategy-based pipeline selection
    switch (this.config.loadBalancingStrategy) {
      case 'round-robin':
        return this.selectRoundRobinPipeline(availablePipelines);

      case 'weighted':
        return this.selectWeightedPipeline(availablePipelines, request);

      case 'intelligent':
        return await this.selectIntelligentPipeline(availablePipelines, request);

      default:
        return availablePipelines[0];
    }
  }

  /**
   * Intelligent pipeline selection based on capability matching and performance
   */
  async selectIntelligentPipeline(availablePipelines, request) {
    let bestPipeline = null;
    let bestScore = -1;

    for (const pipelineId of availablePipelines) {
      const pipeline = this.processingPipelines.get(pipelineId);

      if (!pipeline || pipeline.currentLoad >= pipeline.maxCapacity) {
        continue;
      }

      // Calculate selection score
      let score = 0;

      // Capability match bonus
      if (pipeline.capability === request.requiredCapability || pipeline.capability === 'general') {
        score += 50;
      }

      // Performance bonus (higher average = better score)
      if (pipeline.processedRequests > 0) {
        const performanceRatio = 1 / (pipeline.averageResponseTime / 1000); // Invert response time
        score += Math.min(performanceRatio * 10, 30);
      }

      // Load penalty (lower load = better score)
      const loadPenalty = (pipeline.currentLoad / pipeline.maxCapacity) * 20;
      score -= loadPenalty;

      // Idle time bonus (recently active pipelines are better)
      const idleTime = Date.now() - pipeline.lastActivity;
      const idlePenalty = Math.min(idleTime / 1000, 10); // Max 10 second penalty
      score -= idlePenalty;

      if (score > bestScore) {
        bestScore = score;
        bestPipeline = pipeline;
      }
    }

    return bestPipeline;
  }

  /**
   * Assign request to specific pipeline
   */
  async assignRequestToPipeline(request, pipeline) {
    try {
      // Update pipeline state
      pipeline.status = 'processing';
      pipeline.currentRequest = request;
      pipeline.currentLoad++;
      pipeline.lastActivity = Date.now();

      // Remove from available pipelines if at capacity
      if (pipeline.currentLoad >= pipeline.maxCapacity) {
        this.availablePipelines = this.availablePipelines.filter(id => id !== pipeline.id);
      }

      console.log(`🔄 Assigned request ${request.id} to pipeline ${pipeline.id} (Load: ${pipeline.currentLoad}/${pipeline.maxCapacity})`);

      // Execute request in pipeline (async)
      setImmediate(async () => {
        try {
          const result = await this.executePipelineRequest(request, pipeline);
          await this.completePipelineRequest(request, pipeline, result);
        } catch (error) {
          await this.handlePipelineError(request, pipeline, error);
        }
      });

      this.emit('request-assigned', {
        requestId: request.id,
        pipelineId: pipeline.id,
        pipelineLoad: pipeline.currentLoad
      });

    } catch (error) {
      console.error(`Failed to assign request ${request.id} to pipeline ${pipeline.id}:`, error);
      throw error;
    }
  }

  /**
   * Execute request within pipeline
   */
  async executePipelineRequest(request, pipeline) {
    const startTime = Date.now();

    try {
      console.log(`⚡ Executing request ${request.id} in pipeline ${pipeline.id}`);

      // Determine execution strategy based on request data
      const executionStrategy = this.determineExecutionStrategy(request.data);

      let result;

      switch (executionStrategy) {
        case 'parallel-tasks':
          result = await this.executeParallelTasks(request, pipeline);
          break;

        case 'sequential-with-dependencies':
          result = await this.executeSequentialTasks(request, pipeline);
          break;

        case 'single-agent':
          result = await this.executeSingleAgent(request, pipeline);
          break;

        default:
          result = await this.executeGenericRequest(request, pipeline);
      }

      // Add execution metadata
      result.pipelineId = pipeline.id;
      result.executionTime = Date.now() - startTime;
      result.strategy = executionStrategy;

      return result;

    } catch (error) {
      console.error(`Pipeline execution failed for request ${request.id}:`, error);
      throw error;
    }
  }

  /**
   * Execute parallel tasks within pipeline
   */
  async executeParallelTasks(request, pipeline) {
    const { query, context = {}, tasks = [] } = request.data;

    if (tasks.length === 0) {
      // Auto-generate tasks from query
      const generatedTasks = await this.generateTasksFromQuery(query, context);
      tasks.push(...generatedTasks);
    }

    // Execute tasks in parallel using orchestrator's parallel engine
    const taskPromises = tasks.map(async (task, index) => {
      const taskId = `${request.id}-task-${index}`;

      // Track task in pipeline
      pipeline.activeTasks.set(taskId, {
        id: taskId,
        task,
        startTime: Date.now(),
        status: 'executing'
      });

      try {
        const result = await this.orchestrator.callTool('Task', {
          subagent_type: task.subagent_type || task.agent || 'general-purpose',
          prompt: task.prompt || query,
          description: task.description || `Pipeline task ${index + 1}`
        });

        pipeline.activeTasks.get(taskId).status = 'completed';
        pipeline.activeTasks.get(taskId).result = result;

        return {
          taskId,
          taskIndex: index,
          success: true,
          result,
          agent: task.subagent_type || task.agent
        };

      } catch (error) {
        pipeline.activeTasks.get(taskId).status = 'failed';
        pipeline.activeTasks.get(taskId).error = error.message;

        return {
          taskId,
          taskIndex: index,
          success: false,
          error: error.message,
          agent: task.subagent_type || task.agent
        };
      }
    });

    // Wait for all tasks to complete
    const results = await Promise.allSettled(taskPromises);

    // Process results
    const successfulTasks = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => r.value);

    const failedTasks = results
      .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
      .map(r => r.status === 'fulfilled' ? r.value : { error: r.reason.message });

    return {
      success: successfulTasks.length > 0,
      totalTasks: tasks.length,
      successfulTasks: successfulTasks.length,
      failedTasks: failedTasks.length,
      results: successfulTasks,
      errors: failedTasks,
      executionMode: 'parallel'
    };
  }

  /**
   * Execute single agent request
   */
  async executeSingleAgent(request, pipeline) {
    const { query, context = {}, subagent_type = 'general-purpose' } = request.data;

    const taskId = `${request.id}-single`;

    pipeline.activeTasks.set(taskId, {
      id: taskId,
      startTime: Date.now(),
      status: 'executing'
    });

    try {
      const result = await this.orchestrator.callTool('Task', {
        subagent_type,
        prompt: query,
        description: `Single agent task for request ${request.id}`
      });

      pipeline.activeTasks.get(taskId).status = 'completed';
      pipeline.activeTasks.get(taskId).result = result;

      return {
        success: true,
        result,
        agent: subagent_type,
        executionMode: 'single'
      };

    } catch (error) {
      pipeline.activeTasks.get(taskId).status = 'failed';
      pipeline.activeTasks.get(taskId).error = error.message;

      return {
        success: false,
        error: error.message,
        agent: subagent_type,
        executionMode: 'single'
      };
    }
  }

  /**
   * Complete pipeline request
   */
  async completePipelineRequest(request, pipeline, result) {
    try {
      // Update pipeline metrics
      const processingTime = Date.now() - request.createdAt;
      pipeline.processedRequests++;
      pipeline.totalProcessingTime += processingTime;
      pipeline.averageResponseTime = pipeline.totalProcessingTime / pipeline.processedRequests;

      // Update pipeline state
      pipeline.currentLoad--;
      pipeline.status = pipeline.currentLoad > 0 ? 'processing' : 'idle';
      pipeline.lastActivity = Date.now();

      // Clear completed tasks
      pipeline.activeTasks.clear();

      // Make pipeline available again if not at capacity
      if (pipeline.currentLoad < pipeline.maxCapacity && !this.availablePipelines.includes(pipeline.id)) {
        this.availablePipelines.push(pipeline.id);
      }

      // Notify request completion
      this.emit('request-completed', {
        requestId: request.id,
        pipelineId: pipeline.id,
        result,
        processingTime
      });

      console.log(`✅ Pipeline ${pipeline.id} completed request ${request.id} in ${processingTime}ms`);

    } catch (error) {
      console.error(`Error completing pipeline request ${request.id}:`, error);
    }
  }

  /**
   * Handle pipeline execution errors
   */
  async handlePipelineError(request, pipeline, error) {
    console.error(`❌ Pipeline ${pipeline.id} error for request ${request.id}:`, error.message);

    // Update pipeline state
    pipeline.currentLoad--;
    pipeline.status = pipeline.currentLoad > 0 ? 'processing' : 'idle';
    pipeline.lastActivity = Date.now();

    // Clear failed tasks
    pipeline.activeTasks.clear();

    // Make pipeline available again
    if (!this.availablePipelines.includes(pipeline.id)) {
      this.availablePipelines.push(pipeline.id);
    }

    // Emit error event
    this.emit('request-failed', {
      requestId: request.id,
      pipelineId: pipeline.id,
      error: error.message
    });
  }

  /**
   * Wait for request completion with timeout
   */
  async waitForRequestCompletion(requestId, timeout) {
    return new Promise((resolve, reject) => {
      let completed = false;

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error(`Request ${requestId} timed out after ${timeout}ms`));
        }
      }, timeout);

      // Listen for completion
      const onCompleted = (event) => {
        if (event.requestId === requestId && !completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          this.removeListener('request-completed', onCompleted);
          this.removeListener('request-failed', onFailed);
          resolve(event.result);
        }
      };

      const onFailed = (event) => {
        if (event.requestId === requestId && !completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          this.removeListener('request-completed', onCompleted);
          this.removeListener('request-failed', onFailed);
          reject(new Error(event.error));
        }
      };

      this.on('request-completed', onCompleted);
      this.on('request-failed', onFailed);
    });
  }

  // Helper methods

  generateRequestId() {
    return `req-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  hasAvailableCapacity() {
    return this.availablePipelines.length > 0;
  }

  canCreateNewPipeline() {
    return this.processingPipelines.size < this.config.maxConcurrentPipelines;
  }

  getAvailablePipelines() {
    return this.availablePipelines.filter(id => {
      const pipeline = this.processingPipelines.get(id);
      return pipeline && pipeline.currentLoad < pipeline.maxCapacity;
    });
  }

  determineExecutionStrategy(requestData) {
    if (requestData.tasks && requestData.tasks.length > 1) {
      return 'parallel-tasks';
    }

    if (requestData.dependencies && requestData.dependencies.length > 0) {
      return 'sequential-with-dependencies';
    }

    if (requestData.subagent_type || requestData.agent) {
      return 'single-agent';
    }

    return 'generic';
  }

  async generateTasksFromQuery(query, context) {
    // Simple task generation - can be enhanced with ML
    const tasks = [];

    const queryLower = query.toLowerCase();

    if (queryLower.includes('seo') || queryLower.includes('keyword')) {
      tasks.push({
        subagent_type: 'seo-keyword-research',
        prompt: query,
        description: 'SEO keyword research'
      });
    }

    if (queryLower.includes('content') || queryLower.includes('article')) {
      tasks.push({
        subagent_type: 'content-writer-specialist',
        prompt: query,
        description: 'Content creation'
      });
    }

    if (queryLower.includes('web') || queryLower.includes('site')) {
      tasks.push({
        subagent_type: 'general-purpose',
        prompt: query,
        description: 'Web development'
      });
    }

    // Default general task if no specific patterns detected
    if (tasks.length === 0) {
      tasks.push({
        subagent_type: 'general-purpose',
        prompt: query,
        description: 'General task'
      });
    }

    return tasks;
  }

  executeGenericRequest(request, pipeline) {
    return this.executeSingleAgent(request, pipeline);
  }

  executeSequentialTasks(request, pipeline) {
    // For now, treat as parallel - can be enhanced for true sequential execution
    return this.executeParallelTasks(request, pipeline);
  }

  getQueuePosition(requestId) {
    let position = 0;
    for (let i = this.config.priorityLevels - 1; i >= 0; i--) {
      const queue = this.priorityQueues[i];
      const index = queue.findIndex(r => r.id === requestId);
      if (index !== -1) {
        return position + index + 1;
      }
      position += queue.length;
    }
    return -1;
  }

  estimateWaitTime(priorityLevel) {
    // Estimate wait time based on queue position and pipeline performance
    let tasksAhead = 0;
    for (let i = this.config.priorityLevels - 1; i > priorityLevel; i--) {
      tasksAhead += this.priorityQueues[i].length;
    }

    const avgProcessingTime = this.metrics.averageResponseTime || 10000;
    const availablePipelineCount = Math.max(this.availablePipelines.length, 1);

    return Math.ceil(tasksAhead / availablePipelineCount) * avgProcessingTime;
  }

  selectRoundRobinPipeline(availablePipelines) {
    // Simple round-robin selection
    const pipeline = this.processingPipelines.get(availablePipelines[0]);
    return pipeline;
  }

  selectWeightedPipeline(availablePipelines, request) {
    // Weighted selection based on pipeline performance
    let bestPipeline = null;
    let lowestLoad = Infinity;

    for (const pipelineId of availablePipelines) {
      const pipeline = this.processingPipelines.get(pipelineId);
      if (pipeline && pipeline.currentLoad < lowestLoad) {
        lowestLoad = pipeline.currentLoad;
        bestPipeline = pipeline;
      }
    }

    return bestPipeline;
  }

  updateMetrics(responseTime, success) {
    this.metrics.totalRequestsProcessed++;

    if (success) {
      // Update average response time
      const currentAvg = this.metrics.averageResponseTime;
      this.metrics.averageResponseTime = currentAvg === 0
        ? responseTime
        : (currentAvg + responseTime) / 2;
    }

    // Update throughput metrics
    this.metrics.requestsInLastSecond++;
    const now = Date.now();
    if (now - this.metrics.lastThroughputCheck >= 1000) {
      this.metrics.throughputPerSecond = this.metrics.requestsInLastSecond;
      this.metrics.requestsInLastSecond = 0;
      this.metrics.lastThroughputCheck = now;
    }

    // Update pipeline utilization
    const totalPipelines = this.processingPipelines.size;
    const activePipelines = totalPipelines - this.availablePipelines.length;
    this.metrics.pipelineUtilization = totalPipelines > 0 ? (activePipelines / totalPipelines) * 100 : 0;
  }

  startMetricsCollection() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
  }

  collectSystemMetrics() {
    const now = Date.now();

    // Update pipeline lifecycle metrics
    let totalActiveTime = 0;
    let totalIdleTime = 0;

    for (const [, pipeline] of this.processingPipelines) {
      if (pipeline.status === 'processing') {
        totalActiveTime += now - pipeline.lastActivity;
      } else {
        totalIdleTime += now - pipeline.lastActivity;
      }
    }

    this.pipelineLifecycle.activeTime = totalActiveTime;
    this.pipelineLifecycle.idleTime = totalIdleTime;

    // Emit metrics update
    this.emit('metrics-updated', this.getMetrics());
  }

  // Public API methods

  getMetrics() {
    return {
      ...this.metrics,
      pipelineMetrics: {
        total: this.processingPipelines.size,
        available: this.availablePipelines.length,
        active: this.processingPipelines.size - this.availablePipelines.length,
        utilization: this.metrics.pipelineUtilization
      },
      queueMetrics: {
        totalQueued: this.metrics.queuedRequests,
        byPriority: this.priorityQueues.map((queue, index) => ({
          level: index,
          count: queue.length
        }))
      },
      lifecycle: this.pipelineLifecycle
    };
  }

  getSystemStatus() {
    return {
      operational: true,
      concurrentProcessing: true,
      maxConcurrentPipelines: this.config.maxConcurrentPipelines,
      currentPipelines: this.processingPipelines.size,
      availablePipelines: this.availablePipelines.length,
      queuedRequests: this.metrics.queuedRequests,
      configuration: this.config,
      lastUpdate: Date.now()
    };
  }

  async updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ ConcurrentRequestHandler configuration updated');

    // Adjust pipeline count if needed
    if (newConfig.maxConcurrentPipelines) {
      await this.adjustPipelineCount(newConfig.maxConcurrentPipelines);
    }
  }

  async adjustPipelineCount(targetCount) {
    const currentCount = this.processingPipelines.size;

    if (targetCount > currentCount) {
      // Create additional pipelines
      for (let i = currentCount; i < targetCount; i++) {
        await this.createProcessingPipeline(`pipeline-${i}`);
      }
    } else if (targetCount < currentCount) {
      // Remove excess pipelines (only idle ones)
      const excessCount = currentCount - targetCount;
      const idlePipelines = this.availablePipelines.slice(0, excessCount);

      for (const pipelineId of idlePipelines) {
        await this.destroyPipeline(pipelineId);
      }
    }
  }

  async destroyPipeline(pipelineId) {
    const pipeline = this.processingPipelines.get(pipelineId);

    if (pipeline && pipeline.status === 'idle' && pipeline.currentLoad === 0) {
      this.processingPipelines.delete(pipelineId);
      this.availablePipelines = this.availablePipelines.filter(id => id !== pipelineId);
      this.pipelineLifecycle.destroyed++;

      console.log(`🗑️ Destroyed idle pipeline: ${pipelineId}`);
      this.emit('pipeline-destroyed', { pipelineId });
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialization is done in constructor, just mark as initialized
      this.isInitialized = true;
      console.log('✅ ConcurrentRequestHandler fully initialized');

    } catch (error) {
      console.error('❌ Failed to initialize ConcurrentRequestHandler:', error);
      throw error;
    }
  }

  async getHealthStatus() {
    return {
      status: this.availablePipelines.length > 0 ? 'healthy' : 'critical',
      availablePipelines: this.availablePipelines.length,
      totalPipelines: this.processingPipelines.size,
      activeRequests: this.activeRequests.size,
      queuedRequests: this.requestQueue.length,
      metrics: this.metrics
    };
  }

  async optimizePipelineDistribution() {
    // Optimize pipeline distribution based on current load
    const averageLoad = this.activeRequests.size / Math.max(this.processingPipelines.size, 1);

    if (averageLoad > 3 && this.processingPipelines.size < this.config.maxConcurrentPipelines) {
      await this.createProcessingPipeline();
      console.log('📈 Added pipeline due to high load');
    }
  }

  async shutdown() {
    console.log('🛑 ConcurrentRequestHandler shutting down...');

    // Wait for active requests to complete (with timeout)
    const activeRequestCount = this.activeRequests.size;
    if (activeRequestCount > 0) {
      console.log(`⏳ Waiting for ${activeRequestCount} active requests to complete`);

      const maxWait = 30000; // 30 seconds max wait
      const startWait = Date.now();

      while (this.activeRequests.size > 0 && (Date.now() - startWait) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Clear all pipelines
    this.processingPipelines.clear();
    this.availablePipelines = [];

    // Clear queues
    this.priorityQueues.forEach(queue => queue.length = 0);

    this.removeAllListeners();
    console.log('✅ ConcurrentRequestHandler shutdown complete');
  }
}

module.exports = ConcurrentRequestHandler;