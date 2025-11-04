// Parallel Task Engine - True concurrent execution for Claude Code subagents
// Replaces sequential TaskDelegationManager with parallel Promise.allSettled approach

const EventEmitter = require('events');

class ParallelTaskEngine extends EventEmitter {
  constructor(orchestrator) {
    super();
    
    this.orchestrator = orchestrator;
    this.maxConcurrentTasks = 8; // True parallel execution limit
    this.activeTasks = new Map();
    this.completedTasks = [];
    this.taskQueue = [];
    
    // Performance metrics
    this.metrics = {
      totalTasksExecuted: 0,
      parallelTasksExecuted: 0,
      averageExecutionTime: 0,
      concurrentExecutionSavings: 0,
      failureRate: 0
    };
    
    console.log('🚀 ParallelTaskEngine initialized - Maximum concurrent tasks:', this.maxConcurrentTasks);
  }

  /**
   * Execute multiple Claude Code subagent tasks in parallel
   * @param {Array} tasks - Array of task configurations
   * @returns {Array} Results from all tasks
   */
  async executeParallelTasks(tasks) {
    const startTime = Date.now();
    
    console.log(`🎯 Launching ${tasks.length} Claude Code subagent tasks in parallel`);
    
    // Validate tasks
    const validTasks = this.validateTasks(tasks);
    if (validTasks.length === 0) {
      throw new Error('No valid tasks to execute');
    }
    
    // Chunk tasks if exceeding concurrent limit
    const taskChunks = this.chunkTasks(validTasks, this.maxConcurrentTasks);
    let allResults = [];
    
    // Execute chunks sequentially, tasks within chunks in parallel
    for (let chunkIndex = 0; chunkIndex < taskChunks.length; chunkIndex++) {
      const chunk = taskChunks[chunkIndex];
      
      console.log(`🔄 Executing chunk ${chunkIndex + 1}/${taskChunks.length} with ${chunk.length} parallel tasks`);
      
      // Launch all tasks in current chunk simultaneously
      const chunkPromises = chunk.map(task => this.executeTaskNonBlocking(task));
      
      // Wait for all tasks in chunk to complete
      const chunkResults = await Promise.allSettled(chunkPromises);
      allResults.push(...chunkResults);
      
      // Brief pause between chunks to prevent overwhelming
      if (chunkIndex < taskChunks.length - 1) {
        await this.sleep(100);
      }
    }
    
    // Process and analyze results
    const processedResults = this.processResults(allResults, startTime);
    
    // Update metrics
    this.updateMetrics(validTasks.length, Date.now() - startTime, processedResults);
    
    console.log(`✅ Parallel execution completed: ${processedResults.successful}/${validTasks.length} successful`);
    
    return processedResults;
  }

  /**
   * Execute a single task without blocking other tasks
   */
  async executeTaskNonBlocking(taskConfig) {
    const taskId = this.generateTaskId();
    const startTime = Date.now();
    
    try {
      // Register active task
      this.activeTasks.set(taskId, {
        id: taskId,
        config: taskConfig,
        startTime,
        status: 'executing'
      });
      
      console.log(`⚡ Starting task ${taskId}: ${taskConfig.agent || taskConfig.subagent_type} (${taskConfig.description})`);
      
      // Execute Claude Code subagent task
      const result = await this.orchestrator.callTool('Task', {
        prompt: taskConfig.prompt,
        subagent_type: taskConfig.agent || taskConfig.subagent_type || 'general-purpose',
        description: taskConfig.description || `Task ${taskId}`
      });
      
      const duration = Date.now() - startTime;
      
      // Mark task as completed
      const completedTask = {
        taskId,
        success: true,
        result,
        duration,
        agent: taskConfig.agent || taskConfig.subagent_type,
        description: taskConfig.description
      };
      
      this.activeTasks.delete(taskId);
      this.completedTasks.push(completedTask);
      
      console.log(`✅ Task ${taskId} completed successfully in ${duration}ms`);
      
      this.emit('taskCompleted', completedTask);
      
      return completedTask;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ Task ${taskId} failed after ${duration}ms:`, error.message);
      
      const failedTask = {
        taskId,
        success: false,
        error: error.message,
        duration,
        agent: taskConfig.agent || taskConfig.subagent_type,
        description: taskConfig.description
      };
      
      this.activeTasks.delete(taskId);
      this.completedTasks.push(failedTask);
      
      this.emit('taskFailed', failedTask);
      
      return failedTask;
    }
  }

  /**
   * Validate task configurations
   */
  validateTasks(tasks) {
    if (!Array.isArray(tasks)) {
      console.error('❌ Tasks must be an array');
      return [];
    }
    
    return tasks.filter((task, index) => {
      if (!task.prompt) {
        console.warn(`⚠️ Task ${index} missing prompt, skipping`);
        return false;
      }
      
      if (!task.agent && !task.subagent_type) {
        console.warn(`⚠️ Task ${index} missing agent type, defaulting to general-purpose`);
        task.subagent_type = 'general-purpose';
      }
      
      return true;
    });
  }

  /**
   * Chunk tasks to respect concurrency limits
   */
  chunkTasks(tasks, chunkSize) {
    const chunks = [];
    for (let i = 0; i < tasks.length; i += chunkSize) {
      chunks.push(tasks.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Process Promise.allSettled results
   */
  processResults(settledResults, startTime) {
    const results = {
      successful: 0,
      failed: 0,
      totalDuration: Date.now() - startTime,
      tasks: [],
      errors: [],
      summary: {}
    };
    
    settledResults.forEach((settled, index) => {
      if (settled.status === 'fulfilled') {
        const task = settled.value;
        results.tasks.push(task);
        
        if (task.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({
            taskIndex: index,
            taskId: task.taskId,
            error: task.error
          });
        }
      } else {
        results.failed++;
        results.errors.push({
          taskIndex: index,
          error: settled.reason?.message || 'Unknown error'
        });
      }
    });
    
    // Generate summary
    results.summary = {
      successRate: (results.successful / settledResults.length * 100).toFixed(1),
      averageTaskDuration: results.tasks.length > 0 
        ? Math.round(results.tasks.reduce((sum, t) => sum + t.duration, 0) / results.tasks.length)
        : 0,
      parallelEfficiencyGain: this.calculateEfficiencyGain(results.tasks, results.totalDuration)
    };
    
    return results;
  }

  /**
   * Calculate efficiency gains from parallel execution
   */
  calculateEfficiencyGain(tasks, totalDuration) {
    if (tasks.length <= 1) return 0;
    
    const sequentialDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
    const parallelSavings = Math.max(0, sequentialDuration - totalDuration);
    const efficiencyGain = (parallelSavings / sequentialDuration * 100);
    
    return Math.round(efficiencyGain);
  }

  /**
   * Update performance metrics
   */
  updateMetrics(taskCount, totalDuration, results) {
    this.metrics.totalTasksExecuted += taskCount;
    this.metrics.parallelTasksExecuted += taskCount > 1 ? 1 : 0;
    
    // Rolling average for execution time
    const currentAvg = this.metrics.averageExecutionTime;
    const newAvg = currentAvg === 0 
      ? totalDuration 
      : (currentAvg + totalDuration) / 2;
    this.metrics.averageExecutionTime = Math.round(newAvg);
    
    // Update failure rate
    this.metrics.failureRate = (results.failed / (results.successful + results.failed)) * 100;
    
    // Track concurrent execution savings
    if (results.summary.parallelEfficiencyGain) {
      this.metrics.concurrentExecutionSavings += results.summary.parallelEfficiencyGain;
    }
  }

  /**
   * Create multiple tasks for parallel execution
   */
  createParallelTasks(basePrompt, agents, context = {}) {
    return agents.map((agent, index) => ({
      id: `task_${Date.now()}_${index}`,
      agent: agent.type || agent,
      subagent_type: agent.type || agent,
      prompt: this.buildAgentSpecificPrompt(basePrompt, agent, context),
      description: agent.description || `${agent.type || agent} task`,
      priority: agent.priority || 'medium',
      context: {
        ...context,
        agentSpecialization: agent.specialization || []
      }
    }));
  }

  /**
   * Build agent-specific prompts for better results
   */
  buildAgentSpecificPrompt(basePrompt, agent, context) {
    const agentType = agent.type || agent;
    
    let enhancedPrompt = basePrompt;
    
    // Add agent-specific context
    if (agent.specialization && agent.specialization.length > 0) {
      enhancedPrompt += `\n\nSpecialization focus: ${agent.specialization.join(', ')}`;
    }
    
    // Add context information
    if (context.domain) {
      enhancedPrompt += `\nDomain context: ${context.domain}`;
    }
    
    if (context.priority) {
      enhancedPrompt += `\nPriority level: ${context.priority}`;
    }
    
    return enhancedPrompt;
  }

  /**
   * Get current execution status
   */
  getExecutionStatus() {
    return {
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.length,
      metrics: this.metrics,
      recentTasks: this.completedTasks.slice(-5)
    };
  }

  /**
   * Utility functions
   */
  generateTaskId() {
    return `ptask_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    console.log('🛑 ParallelTaskEngine shutting down...');
    
    // Wait for active tasks to complete
    if (this.activeTasks.size > 0) {
      console.log(`⏳ Waiting for ${this.activeTasks.size} active tasks to complete`);
      
      const maxWait = 30000; // 30 seconds max wait
      const startWait = Date.now();
      
      while (this.activeTasks.size > 0 && (Date.now() - startWait) < maxWait) {
        await this.sleep(1000);
      }
    }
    
    this.removeAllListeners();
    console.log('✅ ParallelTaskEngine shutdown complete');
  }
}

module.exports = ParallelTaskEngine;