// Intelligent Task Batcher
// Optimizes Claude Code Task tool usage by grouping compatible tasks for parallel execution
// Works with Claude Code's "wait for all tasks" limitation to maximize throughput

const EventEmitter = require('events');

class IntelligentTaskBatcher extends EventEmitter {
  constructor(orchestrator, contextPreservation, validationGates) {
    super();
    
    this.orchestrator = orchestrator;
    this.contextPreservation = contextPreservation;
    this.validationGates = validationGates;
    
    // Task batching configuration
    this.batchConfig = {
      maxBatchSize: 4, // Claude Code optimal parallel execution limit
      maxBatchWaitTime: 2000, // Maximum time to wait for batch completion (ms)
      compatibilityThreshold: 0.7, // Minimum compatibility score for batching
      priorityWeighting: 0.3 // How much to weight task priority in batching decisions
    };
    
    // Task queue with priority and compatibility tracking
    this.taskQueue = [];
    this.activeBatches = new Map();
    this.batchHistory = [];
    
    // Task compatibility patterns learned from execution history
    this.compatibilityPatterns = new Map([
      // Content generation tasks are highly compatible
      ['content-writer-specialist', {
        compatible: ['content-outline-architect', 'content-quality-validator', 'seo-content-optimization'],
        incompatible: ['web-frontend-developer', 'web-performance-optimizer'],
        score: 0.9
      }],
      
      // SEO tasks batch well together
      ['seo-keyword-research', {
        compatible: ['seo-competitor-analysis', 'seo-serp-analysis', 'seo-content-optimization'],
        incompatible: ['web-frontend-developer'],
        score: 0.85
      }],
      
      // Web development tasks require sequential execution often
      ['web-frontend-developer', {
        compatible: ['web-performance-optimizer', 'web-responsive-design-agent'],
        incompatible: ['content-writer-specialist', 'seo-keyword-research'],
        score: 0.6,
        preferSequential: true
      }],
      
      // General purpose agents are flexible
      ['general-purpose', {
        compatible: ['*'], // Compatible with everything
        incompatible: [],
        score: 0.8
      }]
    ]);
    
    // Performance tracking
    this.metrics = {
      totalTasks: 0,
      batchedTasks: 0,
      sequentialTasks: 0,
      averageBatchSize: 0,
      averageBatchTime: 0,
      throughputImprovement: 0,
      compatibilityAccuracy: 0
    };
    
    // Registered agents tracking
    this.registeredAgents = new Map();
    
    console.log('⚡ Intelligent Task Batcher initialized - Optimizing Claude Code parallel execution');
  }

  /**
   * Register an agent with task batching configuration
   */
  async registerAgent(agentId, config) {
    this.registeredAgents.set(agentId, {
      agentId,
      config,
      registeredAt: Date.now(),
      batchingStats: {
        tasksSubmitted: 0,
        batchesCreated: 0,
        averageBatchSize: 0
      }
    });
    
    console.log(`⚡ Agent ${agentId} registered for task batching with priority: ${config.priority || 'normal'}`);
    return true;
  }

  /**
   * Add task to batching queue
   */
  async queueTask(task, priority = 0.5, context = {}) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedTask = {
      taskId,
      task,
      priority,
      context,
      queuedAt: Date.now(),
      estimatedDuration: this.estimateTaskDuration(task),
      compatibility: this.calculateTaskCompatibility(task),
      dependencies: this.extractTaskDependencies(task, context)
    };
    
    // Insert task in priority order
    this.insertTaskByPriority(queuedTask);
    
    console.log(`📥 Task queued: ${task.subagent_type || task.type} (${taskId}) - Priority: ${priority}`);
    
    this.emit('task-queued', {
      taskId,
      queueSize: this.taskQueue.length,
      estimatedWait: this.estimateWaitTime(queuedTask)
    });
    
    // Attempt to process batch if conditions are met
    await this.processBatchIfReady();
    
    return taskId;
  }

  /**
   * Process batch when ready conditions are met
   */
  async processBatchIfReady() {
    // Check if we should process a batch
    const shouldProcess = this.shouldProcessBatch();
    
    if (shouldProcess.process) {
      const batch = this.createOptimalBatch();
      
      if (batch.tasks.length > 0) {
        await this.executeBatch(batch);
      }
    }
  }

  /**
   * Determine if batch should be processed now
   */
  shouldProcessBatch() {
    const queueSize = this.taskQueue.length;
    const oldestTask = this.taskQueue[0];
    
    // Process if queue is full
    if (queueSize >= this.batchConfig.maxBatchSize) {
      return { process: true, reason: 'queue-full' };
    }
    
    // Process if oldest task is waiting too long
    if (oldestTask && Date.now() - oldestTask.queuedAt > this.batchConfig.maxBatchWaitTime) {
      return { process: true, reason: 'wait-timeout' };
    }
    
    // Process if we have high-priority tasks that can batch well
    const highPriorityTasks = this.taskQueue.filter(t => t.priority > 0.8);
    if (highPriorityTasks.length >= 2) {
      const compatibility = this.calculateBatchCompatibility(highPriorityTasks.slice(0, 4));
      if (compatibility > this.batchConfig.compatibilityThreshold) {
        return { process: true, reason: 'high-priority-compatible' };
      }
    }
    
    // Process if we have perfect compatibility match
    const perfectBatch = this.findPerfectCompatibilityBatch();
    if (perfectBatch.length >= 2) {
      return { process: true, reason: 'perfect-compatibility' };
    }
    
    return { process: false };
  }

  /**
   * Create optimal batch from current queue
   */
  createOptimalBatch() {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxSize = this.batchConfig.maxBatchSize;
    
    // Start with highest priority task
    const batch = {
      batchId,
      tasks: [],
      totalPriority: 0,
      compatibilityScore: 0,
      estimatedDuration: 0,
      createdAt: Date.now(),
      strategy: 'priority-compatibility-balanced'
    };
    
    if (this.taskQueue.length === 0) {
      return batch;
    }
    
    // Algorithm: Balanced priority and compatibility optimization
    const candidates = [...this.taskQueue];
    const selected = new Set();
    
    // Step 1: Select anchor task (highest priority)
    const anchorTask = candidates[0];
    batch.tasks.push(anchorTask);
    selected.add(anchorTask.taskId);
    
    // Step 2: Find compatible tasks
    for (let i = 1; i < candidates.length && batch.tasks.length < maxSize; i++) {
      const candidate = candidates[i];
      
      if (selected.has(candidate.taskId)) continue;
      
      // Check compatibility with existing batch
      const compatibility = this.calculateTaskBatchCompatibility(candidate, batch.tasks);
      const dependencyConflict = this.checkDependencyConflicts(candidate, batch.tasks);
      
      if (compatibility >= this.batchConfig.compatibilityThreshold && !dependencyConflict) {
        batch.tasks.push(candidate);
        selected.add(candidate.taskId);
      }
    }
    
    // Update batch metrics
    batch.totalPriority = batch.tasks.reduce((sum, t) => sum + t.priority, 0);
    batch.compatibilityScore = this.calculateBatchCompatibility(batch.tasks);
    batch.estimatedDuration = Math.max(...batch.tasks.map(t => t.estimatedDuration));
    
    // Remove selected tasks from queue
    this.taskQueue = this.taskQueue.filter(t => !selected.has(t.taskId));
    
    console.log(`📦 Optimal batch created: ${batch.tasks.length} tasks, compatibility: ${batch.compatibilityScore.toFixed(2)}`);
    
    return batch;
  }

  /**
   * Execute batch using Claude Code Task tool
   */
  async executeBatch(batch) {
    const startTime = Date.now();
    
    try {
      this.activeBatches.set(batch.batchId, {
        ...batch,
        startTime,
        status: 'executing'
      });
      
      console.log(`🚀 Executing batch ${batch.batchId} with ${batch.tasks.length} tasks`);
      
      // Capture context for all tasks before execution
      const contextCaptures = await this.captureTaskContexts(batch.tasks);
      
      // Prepare tasks for Claude Code parallel execution
      const claudeCodeTasks = await this.prepareClaudeCodeTasks(batch.tasks, contextCaptures);
      
      // Execute tasks in parallel using orchestrator's Task tool
      const results = await this.executeClaudeCodeBatch(claudeCodeTasks);
      
      // Process results and restore contexts
      const processedResults = await this.processResults(results, batch.tasks, contextCaptures);
      
      // Update batch status
      const duration = Date.now() - startTime;
      const batchResult = {
        batchId: batch.batchId,
        tasks: batch.tasks.length,
        duration,
        success: processedResults.every(r => r.success),
        results: processedResults,
        throughputGain: this.calculateThroughputGain(batch.tasks.length, duration)
      };
      
      this.activeBatches.delete(batch.batchId);
      this.batchHistory.push(batchResult);
      
      // Update metrics
      this.updateMetrics(batchResult);
      
      // Learn from batch execution
      await this.learnFromBatch(batch, batchResult);
      
      console.log(`✅ Batch ${batch.batchId} completed in ${duration}ms - Success: ${batchResult.success}`);
      
      this.emit('batch-completed', batchResult);
      
      return batchResult;
      
    } catch (error) {
      console.error(`❌ Batch execution failed: ${batch.batchId}`, error.message);
      
      this.activeBatches.delete(batch.batchId);
      
      // Fallback: execute tasks sequentially
      const fallbackResults = await this.executeFallbackSequential(batch.tasks);
      
      this.emit('batch-failed', {
        batchId: batch.batchId,
        error: error.message,
        fallbackUsed: true,
        results: fallbackResults
      });
      
      return fallbackResults;
    }
  }

  /**
   * Capture contexts for all tasks in batch
   */
  async captureTaskContexts(tasks) {
    const captures = [];
    
    for (const task of tasks) {
      try {
        const contextId = await this.contextPreservation.captureContext(
          task.task.agentId || 'batch-agent',
          task.context,
          {
            reason: 'batch-execution',
            batchContext: true
          }
        );
        
        captures.push({
          taskId: task.taskId,
          contextId,
          success: true
        });
      } catch (error) {
        console.warn(`Failed to capture context for task ${task.taskId}:`, error.message);
        captures.push({
          taskId: task.taskId,
          contextId: null,
          success: false,
          error: error.message
        });
      }
    }
    
    return captures;
  }

  /**
   * Prepare tasks for Claude Code execution
   */
  async prepareClaudeCodeTasks(tasks, contextCaptures) {
    const claudeTasks = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const contextCapture = contextCaptures[i];
      
      // Enhance task with context restoration instructions
      const enhancedTask = {
        ...task.task,
        description: `${task.task.description} [BatchTask: ${i+1}/${tasks.length}]`,
        prompt: await this.enhancePromptForBatching(task, contextCapture),
        metadata: {
          originalTaskId: task.taskId,
          batchIndex: i,
          contextId: contextCapture.contextId,
          compatibility: task.compatibility
        }
      };
      
      claudeTasks.push(enhancedTask);
    }
    
    return claudeTasks;
  }

  /**
   * Execute tasks via Claude Code Task tool
   */
  async executeClaudeCodeBatch(claudeCodeTasks) {
    const results = [];
    
    // Execute tasks in parallel using orchestrator's callTool method
    const executionPromises = claudeCodeTasks.map(async (task, index) => {
      try {
        const result = await this.orchestrator.callTool('Task', {
          subagent_type: task.subagent_type,
          prompt: task.prompt,
          description: task.description
        });
        
        return {
          index,
          taskId: task.metadata.originalTaskId,
          success: result.success || true,
          result: result,
          metadata: task.metadata
        };
      } catch (error) {
        return {
          index,
          taskId: task.metadata.originalTaskId,
          success: false,
          error: error.message,
          metadata: task.metadata
        };
      }
    });
    
    // Wait for all tasks to complete (Claude Code limitation)
    const settledResults = await Promise.allSettled(executionPromises);
    
    // Process settled results
    settledResults.forEach((settled, index) => {
      if (settled.status === 'fulfilled') {
        results.push(settled.value);
      } else {
        results.push({
          index,
          taskId: claudeCodeTasks[index].metadata.originalTaskId,
          success: false,
          error: settled.reason.message,
          metadata: claudeCodeTasks[index].metadata
        });
      }
    });
    
    return results;
  }

  /**
   * Process results and restore contexts
   */
  async processResults(rawResults, originalTasks, contextCaptures) {
    const processedResults = [];
    
    for (const result of rawResults) {
      const originalTask = originalTasks.find(t => t.taskId === result.taskId);
      const contextCapture = contextCaptures.find(c => c.taskId === result.taskId);
      
      // Restore context if available
      let restoredContext = null;
      if (contextCapture && contextCapture.contextId) {
        try {
          restoredContext = await this.contextPreservation.restoreContext(contextCapture.contextId);
        } catch (error) {
          console.warn(`Failed to restore context for task ${result.taskId}:`, error.message);
        }
      }
      
      // Run validation gates
      let validation = null;
      if (this.validationGates && result.success) {
        try {
          validation = await this.validationGates.validateOperation(
            {
              type: originalTask.task.subagent_type,
              output: result.result,
              parameters: originalTask.task
            },
            'post-operation',
            originalTask.context
          );
        } catch (error) {
          console.warn(`Validation failed for task ${result.taskId}:`, error.message);
        }
      }
      
      processedResults.push({
        taskId: result.taskId,
        success: result.success && (!validation || validation.passed),
        result: result.result,
        error: result.error,
        context: restoredContext,
        validation,
        originalTask,
        processingTime: Date.now() - originalTask.queuedAt
      });
    }
    
    return processedResults;
  }

  /**
   * Execute tasks sequentially as fallback
   */
  async executeFallbackSequential(tasks) {
    const results = [];
    
    console.log(`🔄 Executing ${tasks.length} tasks sequentially as fallback`);
    
    for (const task of tasks) {
      try {
        const result = await this.orchestrator.callTool('Task', {
          subagent_type: task.task.subagent_type,
          prompt: task.task.prompt,
          description: task.task.description
        });
        
        results.push({
          taskId: task.taskId,
          success: result.success || true,
          result: result,
          fallback: true
        });
      } catch (error) {
        results.push({
          taskId: task.taskId,
          success: false,
          error: error.message,
          fallback: true
        });
      }
    }
    
    return results;
  }

  // Helper methods for optimization and learning

  calculateTaskCompatibility(task) {
    const agentType = task.subagent_type || task.type;
    const pattern = this.compatibilityPatterns.get(agentType);
    
    return pattern ? pattern.score : 0.5; // Default compatibility
  }

  calculateTaskBatchCompatibility(candidateTask, existingTasks) {
    const candidateType = candidateTask.task.subagent_type;
    let totalCompatibility = 0;
    
    for (const existingTask of existingTasks) {
      const existingType = existingTask.task.subagent_type;
      totalCompatibility += this.calculatePairwiseCompatibility(candidateType, existingType);
    }
    
    return existingTasks.length > 0 ? totalCompatibility / existingTasks.length : 1.0;
  }

  calculatePairwiseCompatibility(type1, type2) {
    const pattern1 = this.compatibilityPatterns.get(type1);
    const pattern2 = this.compatibilityPatterns.get(type2);
    
    if (!pattern1 || !pattern2) return 0.5;
    
    // Check if explicitly compatible
    if (pattern1.compatible.includes(type2) || pattern1.compatible.includes('*')) {
      return Math.min(pattern1.score, pattern2.score);
    }
    
    // Check if explicitly incompatible
    if (pattern1.incompatible.includes(type2)) {
      return 0.1;
    }
    
    // Default compatibility based on score averages
    return (pattern1.score + pattern2.score) / 2;
  }

  calculateBatchCompatibility(tasks) {
    if (tasks.length <= 1) return 1.0;
    
    let totalCompatibility = 0;
    let comparisons = 0;
    
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        totalCompatibility += this.calculatePairwiseCompatibility(
          tasks[i].task.subagent_type,
          tasks[j].task.subagent_type
        );
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalCompatibility / comparisons : 1.0;
  }

  checkDependencyConflicts(candidateTask, existingTasks) {
    // Check if candidate task has dependencies on existing tasks
    const candidateDeps = candidateTask.dependencies || [];
    const existingIds = existingTasks.map(t => t.taskId);
    
    // If candidate depends on a task in this batch, there's a conflict
    const hasInternalDependency = candidateDeps.some(dep => existingIds.includes(dep));
    
    return hasInternalDependency;
  }

  extractTaskDependencies(task, context) {
    const dependencies = [];
    
    // Check if task references specific files or resources that might be created by other tasks
    if (context.dependsOn) {
      dependencies.push(...context.dependsOn);
    }
    
    // Look for implicit dependencies in task parameters
    if (task.prompt && task.prompt.includes('using the result from')) {
      // This task depends on another task's output
      dependencies.push('previous-task-output');
    }
    
    return dependencies;
  }

  estimateTaskDuration(task) {
    // Estimate task duration based on agent type and complexity
    const durations = {
      'content-writer-specialist': 15000, // 15 seconds
      'seo-keyword-research': 10000,      // 10 seconds
      'web-frontend-developer': 20000,    // 20 seconds
      'general-purpose': 12000            // 12 seconds
    };
    
    const agentType = task.subagent_type || task.type;
    const baseDuration = durations[agentType] || 12000;
    
    // Adjust based on task complexity
    const complexity = this.estimateTaskComplexity(task);
    return baseDuration * complexity;
  }

  estimateTaskComplexity(task) {
    let complexity = 1.0;
    
    if (task.prompt) {
      // Longer prompts generally mean more complex tasks
      const promptLength = task.prompt.length;
      if (promptLength > 1000) complexity *= 1.5;
      else if (promptLength > 500) complexity *= 1.2;
      
      // Check for complex operations
      const complexTerms = ['research', 'analyze', 'comprehensive', 'detailed', 'optimize'];
      const complexTermCount = complexTerms.reduce((count, term) => 
        count + (task.prompt.toLowerCase().includes(term) ? 1 : 0), 0);
      
      complexity *= (1 + complexTermCount * 0.1);
    }
    
    return Math.min(complexity, 3.0); // Cap at 3x base duration
  }

  findPerfectCompatibilityBatch() {
    const perfectBatch = [];
    
    // Look for tasks with compatibility score > 0.9
    for (let i = 0; i < this.taskQueue.length && perfectBatch.length < this.batchConfig.maxBatchSize; i++) {
      const task = this.taskQueue[i];
      
      if (perfectBatch.length === 0) {
        perfectBatch.push(task);
      } else {
        const compatibility = this.calculateTaskBatchCompatibility(task, perfectBatch);
        if (compatibility > 0.9) {
          perfectBatch.push(task);
        }
      }
    }
    
    return perfectBatch;
  }

  insertTaskByPriority(task) {
    // Insert task maintaining priority order
    let inserted = false;
    
    for (let i = 0; i < this.taskQueue.length; i++) {
      if (task.priority > this.taskQueue[i].priority) {
        this.taskQueue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      this.taskQueue.push(task);
    }
  }

  estimateWaitTime(task) {
    // Estimate how long this task will wait in queue
    const position = this.taskQueue.findIndex(t => t.taskId === task.taskId);
    const tasksAhead = this.taskQueue.slice(0, position);
    
    // Estimate based on average batch processing time
    const avgBatchTime = this.metrics.averageBatchTime || 10000;
    const batchesAhead = Math.ceil(tasksAhead.length / this.batchConfig.maxBatchSize);
    
    return batchesAhead * avgBatchTime;
  }

  calculateThroughputGain(taskCount, actualDuration) {
    // Compare to sequential execution time
    const estimatedSequentialTime = taskCount * 15000; // Assume 15s per task sequentially
    const gain = ((estimatedSequentialTime - actualDuration) / estimatedSequentialTime) * 100;
    
    return Math.max(0, gain);
  }

  updateMetrics(batchResult) {
    this.metrics.totalTasks += batchResult.tasks;
    this.metrics.batchedTasks += batchResult.tasks;
    
    // Update averages
    const historyLength = this.batchHistory.length;
    this.metrics.averageBatchSize = this.metrics.batchedTasks / historyLength;
    this.metrics.averageBatchTime = (this.metrics.averageBatchTime * (historyLength - 1) + batchResult.duration) / historyLength;
    
    // Update throughput improvement
    const totalGain = this.batchHistory.reduce((sum, batch) => sum + batch.throughputGain, 0);
    this.metrics.throughputImprovement = totalGain / historyLength;
  }

  async enhancePromptForBatching(task, contextCapture) {
    let enhancedPrompt = task.task.prompt;
    
    // Add batch-specific instructions
    enhancedPrompt += `\n\n## Batch Execution Context\n`;
    enhancedPrompt += `This task is being executed as part of a parallel batch. `;
    enhancedPrompt += `Focus on your specific task and avoid dependencies on other concurrent tasks.\n`;
    
    // Add context restoration instructions if available
    if (contextCapture && contextCapture.contextId) {
      enhancedPrompt += `\n## Context Restoration\n`;
      enhancedPrompt += `Your previous context is preserved under ID: ${contextCapture.contextId}\n`;
    }
    
    return enhancedPrompt;
  }

  async learnFromBatch(batch, result) {
    // Update compatibility patterns based on actual results
    if (result.success && batch.tasks.length > 1) {
      // This batch was successful, reinforce compatibility patterns
      for (let i = 0; i < batch.tasks.length; i++) {
        for (let j = i + 1; j < batch.tasks.length; j++) {
          const type1 = batch.tasks[i].task.subagent_type;
          const type2 = batch.tasks[j].task.subagent_type;
          
          // Increase compatibility confidence
          this.reinforceCompatibility(type1, type2, 0.1);
        }
      }
    } else if (!result.success) {
      // Batch failed, learn what not to batch together
      for (let i = 0; i < batch.tasks.length; i++) {
        for (let j = i + 1; j < batch.tasks.length; j++) {
          const type1 = batch.tasks[i].task.subagent_type;
          const type2 = batch.tasks[j].task.subagent_type;
          
          // Decrease compatibility confidence
          this.reinforceCompatibility(type1, type2, -0.05);
        }
      }
    }
  }

  reinforceCompatibility(type1, type2, adjustment) {
    // Update compatibility patterns based on learning
    const pattern1 = this.compatibilityPatterns.get(type1);
    const pattern2 = this.compatibilityPatterns.get(type2);
    
    if (pattern1 && pattern2) {
      // Adjust scores within bounds
      pattern1.score = Math.max(0.1, Math.min(1.0, pattern1.score + adjustment));
      pattern2.score = Math.max(0.1, Math.min(1.0, pattern2.score + adjustment));
      
      // Update compatibility lists if adjustment is significant
      if (adjustment > 0.05 && !pattern1.compatible.includes(type2)) {
        pattern1.compatible.push(type2);
        pattern2.compatible.push(type1);
      } else if (adjustment < -0.05) {
        pattern1.incompatible = pattern1.incompatible.filter(t => t !== type2);
        pattern2.incompatible = pattern2.incompatible.filter(t => t !== type1);
        
        if (!pattern1.incompatible.includes(type2)) {
          pattern1.incompatible.push(type2);
          pattern2.incompatible.push(type1);
        }
      }
    }
  }

  // Public API methods

  getQueueStatus() {
    return {
      queuedTasks: this.taskQueue.length,
      activeBatches: this.activeBatches.size,
      avgWaitTime: this.estimateWaitTime({ taskId: 'estimate', priority: 0.5 }),
      metrics: this.metrics
    };
  }

  getBatchingStatistics() {
    return {
      ...this.metrics,
      compatibilityPatterns: Array.from(this.compatibilityPatterns.entries()),
      recentBatches: this.batchHistory.slice(-10),
      currentConfig: this.batchConfig
    };
  }

  updateBatchingConfig(newConfig) {
    this.batchConfig = { ...this.batchConfig, ...newConfig };
    console.log('⚙️ Task batching configuration updated');
  }
}

module.exports = IntelligentTaskBatcher;