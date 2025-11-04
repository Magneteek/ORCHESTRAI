/**
 * ORCHESTRAI Claude Code Execution Bridge
 * 
 * Replaces all broken delegation chains with proper Claude Code Task tool integration.
 * This bridge handles the actual execution of tasks through Claude Code agents,
 * replacing mock implementations and incomplete delegation structures.
 */

class ClaudeCodeExecutionBridge {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.activeTasks = new Map();
    this.executionMetrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      averageExecutionTime: 0,
      agentUtilization: new Map()
    };
  }

  /**
   * Execute task through Claude Code Task tool (REAL IMPLEMENTATION)
   * Replaces all mock implementations in the system
   */
  async executeClaudeCodeTask(taskSpec) {
    const {
      subagent_type,
      prompt,
      description,
      taskId = this.generateTaskId(),
      projectUUID = null,
      expectedOutputFormat = 'markdown'
    } = taskSpec;
    
    console.log(`🤖 Executing Claude Code task: ${description}`);
    console.log(`   Agent: ${subagent_type}`);
    console.log(`   Task ID: ${taskId}`);
    
    const startTime = Date.now();
    
    this.activeTasks.set(taskId, {
      id: taskId,
      agent: subagent_type,
      description,
      startTime,
      status: 'executing'
    });
    
    try {
      // THIS IS THE REAL CLAUDE CODE INTEGRATION POINT
      // The orchestrator.callTool method should delegate to Claude Code Task tool
      const taskResult = await this.orchestrator.callTool('Task', {
        subagent_type,
        prompt,
        description
      });
      
      const executionTime = Date.now() - startTime;
      
      // Process and validate the result
      const processedResult = await this.processTaskResult(taskResult, taskSpec, executionTime);
      
      // Update metrics
      this.updateExecutionMetrics(subagent_type, executionTime, true);
      this.activeTasks.delete(taskId);
      
      console.log(`✅ Claude Code task completed: ${description} (${executionTime}ms)`);
      
      return processedResult;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateExecutionMetrics(subagent_type, executionTime, false);
      this.activeTasks.delete(taskId);
      
      console.error(`❌ Claude Code task failed: ${description}`, error);
      throw new Error(`Claude Code execution failed: ${error.message}`);
    }
  }

  /**
   * Process and validate task result from Claude Code
   */
  async processTaskResult(taskResult, originalSpec, executionTime) {
    // Handle different types of Claude Code responses
    let content = '';
    let metadata = {};
    
    if (typeof taskResult === 'string') {
      content = taskResult;
    } else if (taskResult && typeof taskResult === 'object') {
      // Handle structured response from Claude Code
      content = taskResult.content || taskResult.result || taskResult.output || '';
      metadata = {
        success: taskResult.success !== false,
        agent: taskResult.agent || originalSpec.subagent_type,
        additionalData: taskResult.metadata || {}
      };
    }
    
    // Validate content quality
    const contentValidation = this.validateTaskResult(content, originalSpec);
    
    return {
      taskId: originalSpec.taskId,
      agent: originalSpec.subagent_type,
      content,
      executionTime,
      validation: contentValidation,
      metadata,
      timestamp: new Date().toISOString(),
      success: contentValidation.isValid
    };
  }

  /**
   * Validate task result quality
   */
  validateTaskResult(content, originalSpec) {
    const validation = {
      isValid: true,
      issues: [],
      score: 1.0
    };
    
    // Basic content validation
    if (!content || content.length < 100) {
      validation.isValid = false;
      validation.issues.push('Content too short or empty');
      validation.score = 0.2;
    }
    
    // Agent-specific validation
    switch (originalSpec.subagent_type) {
      case 'content-writer-specialist':
        if (content.length < originalSpec.wordCount * 5) { // Rough character estimate
          validation.issues.push('Content may be shorter than requested word count');
          validation.score *= 0.8;
        }
        break;
        
      case 'content-quality-validator':
        if (!content.includes('quality') && !content.includes('assessment')) {
          validation.issues.push('Quality validation should include assessment metrics');
          validation.score *= 0.7;
        }
        break;
    }
    
    return validation;
  }

  /**
   * Update execution metrics
   */
  updateExecutionMetrics(agentType, executionTime, success) {
    this.executionMetrics.totalExecutions++;
    
    if (success) {
      this.executionMetrics.successfulExecutions++;
    }
    
    // Update average execution time
    const currentAvg = this.executionMetrics.averageExecutionTime;
    const newAvg = (currentAvg * (this.executionMetrics.totalExecutions - 1) + executionTime) / this.executionMetrics.totalExecutions;
    this.executionMetrics.averageExecutionTime = Math.round(newAvg);
    
    // Update agent utilization
    const agentStats = this.executionMetrics.agentUtilization.get(agentType) || {
      totalCalls: 0,
      successfulCalls: 0,
      totalTime: 0
    };
    
    agentStats.totalCalls++;
    agentStats.totalTime += executionTime;
    if (success) {
      agentStats.successfulCalls++;
    }
    
    this.executionMetrics.agentUtilization.set(agentType, agentStats);
  }

  /**
   * Get execution bridge status
   */
  getExecutionStatus() {
    return {
      activeTasks: this.activeTasks.size,
      executionMetrics: {
        ...this.executionMetrics,
        agentUtilization: Object.fromEntries(this.executionMetrics.agentUtilization)
      },
      supportedAgents: [
        'content-writer-specialist',
        'content-quality-validator', 
        'multi-language-content-adapter',
        'content-outline-architect',
        'content-title-generator'
      ]
    };
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }
}

module.exports = ClaudeCodeExecutionBridge;