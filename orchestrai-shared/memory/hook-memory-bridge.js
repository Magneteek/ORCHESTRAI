// Hook-to-Memory Data Pipeline
// Real-time bridge connecting Claude Code hooks to Crystalline Memory for self-learning orchestration

const EventEmitter = require('events');
const PerformanceMemorySchema = require('./performance-memory-schema');

class HookMemoryBridge extends EventEmitter {
  constructor(crystallineMemory, hooksManager) {
    super();
    this.crystallineMemory = crystallineMemory;
    this.hooksManager = hooksManager;
    this.performanceSchema = new PerformanceMemorySchema(crystallineMemory, hooksManager);
    
    // Active workflow tracking for performance correlation
    this.activeWorkflows = new Map();
    this.agentExecutions = new Map();
    this.contextCorrelations = new Map();
    
    // Real-time processing queues
    this.processingQueue = [];
    this.batchSize = 10;
    this.batchTimeout = 5000; // 5 seconds
    
    // Performance optimization
    this.processingStats = {
      totalProcessed: 0,
      successfulIntegrations: 0,
      failedIntegrations: 0,
      avgProcessingTime: 0,
      lastBatchProcess: Date.now()
    };
    
    this.setupHookIntegration();
    this.startBatchProcessor();
    console.log('🌉 Hook-Memory Bridge initialized');
  }

  // ============ HOOK INTEGRATION SETUP ============

  setupHookIntegration() {
    if (!this.hooksManager) {
      console.warn('⚠️ Hooks Manager not available - Bridge will operate in simulation mode');
      return;
    }

    // Extend hooks manager with memory integration
    this.extendHooksManager();
    
    // Setup real-time event listeners
    this.setupRealTimeListeners();
    
    console.log('🔗 Hook integration established');
  }

  extendHooksManager() {
    // Enhance existing hook handlers with memory integration
    const originalHandlers = {
      handleUserPromptSubmit: this.hooksManager.handleUserPromptSubmit,
      handleTaskStart: this.hooksManager.handleTaskStart,
      handleToolCall: this.hooksManager.handleToolCall,
      handleTaskComplete: this.hooksManager.handleTaskComplete,
      handleTaskError: this.hooksManager.handleTaskError
    };

    // User Prompt Submit Enhancement
    this.hooksManager.handleUserPromptSubmit = async (req, res) => {
      const startTime = Date.now();
      
      try {
        // Call original handler
        if (originalHandlers.handleUserPromptSubmit) {
          await originalHandlers.handleUserPromptSubmit.call(this.hooksManager, req, res);
        }
        
        // Memory integration
        await this.processUserPromptSubmit(req.body, startTime);
        
      } catch (error) {
        console.error('Error in enhanced handleUserPromptSubmit:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    // Task Start Enhancement
    this.hooksManager.handleTaskStart = async (req, res) => {
      const startTime = Date.now();
      
      try {
        // Call original handler
        if (originalHandlers.handleTaskStart) {
          await originalHandlers.handleTaskStart.call(this.hooksManager, req, res);
        }
        
        // Memory integration
        await this.processTaskStart(req.body, startTime);
        
        if (!res.headersSent) {
          res.json({ status: 'Task started', memoryIntegration: 'active', timestamp: startTime });
        }
        
      } catch (error) {
        console.error('Error in enhanced handleTaskStart:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    // Tool Call Enhancement  
    this.hooksManager.handleToolCall = async (req, res) => {
      const startTime = Date.now();
      
      try {
        // Call original handler
        if (originalHandlers.handleToolCall) {
          await originalHandlers.handleToolCall.call(this.hooksManager, req, res);
        }
        
        // Memory integration
        await this.processToolCall(req.body, startTime);
        
        if (!res.headersSent) {
          res.json({ status: 'Tool call processed', memoryIntegration: 'active', timestamp: startTime });
        }
        
      } catch (error) {
        console.error('Error in enhanced handleToolCall:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    // Task Complete Enhancement
    this.hooksManager.handleTaskComplete = async (req, res) => {
      const startTime = Date.now();
      
      try {
        // Call original handler
        if (originalHandlers.handleTaskComplete) {
          await originalHandlers.handleTaskComplete.call(this.hooksManager, req, res);
        }
        
        // Memory integration
        await this.processTaskComplete(req.body, startTime);
        
        if (!res.headersSent) {
          res.json({ 
            status: 'Task completed', 
            memoryIntegration: 'active', 
            learningUpdate: 'processed',
            timestamp: startTime 
          });
        }
        
      } catch (error) {
        console.error('Error in enhanced handleTaskComplete:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    // Task Error Enhancement
    this.hooksManager.handleTaskError = async (req, res) => {
      const startTime = Date.now();
      
      try {
        // Call original handler
        if (originalHandlers.handleTaskError) {
          await originalHandlers.handleTaskError.call(this.hooksManager, req, res);
        }
        
        // Memory integration with failure learning
        await this.processTaskError(req.body, startTime);
        
        if (!res.headersSent) {
          res.json({ 
            status: 'Task error processed', 
            memoryIntegration: 'active',
            failureLearning: 'enabled',
            timestamp: startTime 
          });
        }
        
      } catch (error) {
        console.error('Error in enhanced handleTaskError:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    console.log('✅ Hook handlers enhanced with memory integration');
  }

  setupRealTimeListeners() {
    // Listen to hooks manager for workflow events
    this.hooksManager.on('workflow-start', (data) => this.onWorkflowStart(data));
    this.hooksManager.on('workflow-complete', (data) => this.onWorkflowComplete(data));
    this.hooksManager.on('agent-execution', (data) => this.onAgentExecution(data));
    this.hooksManager.on('quality-gate', (data) => this.onQualityGate(data));
  }

  // ============ HOOK DATA PROCESSORS ============

  async processUserPromptSubmit(hookData, startTime) {
    const {
      prompt,
      userId,
      sessionId,
      timestamp
    } = hookData;

    // Create workflow context
    const workflowId = this.generateWorkflowId(sessionId, timestamp);
    const workflowContext = {
      workflowId,
      sessionId,
      userId,
      startTime,
      prompt: prompt.substring(0, 500), // Limit for memory storage
      intent: this.analyzeUserIntent(prompt),
      complexity: this.estimateTaskComplexity(prompt),
      expectedAgents: this.predictRequiredAgents(prompt)
    };

    this.activeWorkflows.set(workflowId, workflowContext);
    
    // Store initial context in crystalline memory
    await this.crystallineMemory.storeMemory(
      'workflow-context',
      JSON.stringify(workflowContext),
      {
        importance: 0.7,
        workflowId,
        sessionId,
        semantic_tags: [`intent:${workflowContext.intent}`, `complexity:${workflowContext.complexity}`]
      }
    );

    console.log(`🎯 User prompt processed - Workflow: ${workflowId}`);
  }

  async processTaskStart(hookData, startTime) {
    const {
      workflowId,
      task,
      timestamp,
      context
    } = hookData;

    if (!workflowId) return; // Skip if no workflow ID

    const workflow = this.activeWorkflows.get(workflowId) || {};
    const taskExecution = {
      taskId: this.generateTaskId(workflowId, timestamp),
      workflowId,
      taskType: this.classifyTaskType(task),
      startTime,
      context: context || {},
      agentCandidates: this.identifyAgentCandidates(task),
      expectedDuration: this.estimateDuration(task),
      riskFactors: this.identifyRiskFactors(task, workflow)
    };

    this.agentExecutions.set(taskExecution.taskId, taskExecution);
    
    // Queue for batch processing
    this.addToProcessingQueue({
      type: 'task-start',
      data: taskExecution,
      timestamp: startTime
    });

    console.log(`🚀 Task start processed - Task: ${taskExecution.taskId}`);
  }

  async processToolCall(hookData, startTime) {
    const {
      workflowId,
      tool,
      parameters,
      duration,
      success,
      result,
      error
    } = hookData;

    const toolExecution = {
      workflowId,
      tool,
      parameters: JSON.stringify(parameters).substring(0, 200), // Truncate for memory
      duration,
      success,
      result: result ? result.substring(0, 100) : null, // Truncate result
      error: error ? error.substring(0, 100) : null,
      timestamp: startTime,
      efficiency: this.calculateToolEfficiency(tool, duration, success)
    };

    // Queue for batch processing
    this.addToProcessingQueue({
      type: 'tool-call',
      data: toolExecution,
      timestamp: startTime
    });
  }

  async processTaskComplete(hookData, startTime) {
    const {
      workflowId,
      result,
      timestamp,
      metrics
    } = hookData;

    const taskExecution = Array.from(this.agentExecutions.values())
      .find(exec => exec.workflowId === workflowId);

    if (taskExecution) {
      const completionData = {
        ...taskExecution,
        endTime: startTime,
        actualDuration: startTime - taskExecution.startTime,
        success: true,
        result: result ? result.substring(0, 200) : null,
        metrics: metrics || {},
        performanceRating: this.calculatePerformanceRating(taskExecution, startTime, true)
      };

      // Process immediately for learning
      await this.processCompletedTask(completionData);
      
      console.log(`✅ Task completed - Learning updated for: ${taskExecution.taskId}`);
    }
  }

  async processTaskError(hookData, startTime) {
    const {
      workflowId,
      error,
      context,
      timestamp
    } = hookData;

    const taskExecution = Array.from(this.agentExecutions.values())
      .find(exec => exec.workflowId === workflowId);

    if (taskExecution) {
      const failureData = {
        ...taskExecution,
        endTime: startTime,
        actualDuration: startTime - taskExecution.startTime,
        success: false,
        error: error ? error.substring(0, 200) : 'Unknown error',
        context: context || {},
        failureType: this.classifyFailureType(error),
        performanceRating: this.calculatePerformanceRating(taskExecution, startTime, false)
      };

      // Process immediately for failure learning
      await this.processFailedTask(failureData);
      
      console.log(`❌ Task failed - Failure pattern learned for: ${taskExecution.taskId}`);
    }
  }

  // ============ BATCH PROCESSING ============

  addToProcessingQueue(item) {
    this.processingQueue.push(item);
    
    if (this.processingQueue.length >= this.batchSize) {
      this.processBatch();
    }
  }

  startBatchProcessor() {
    setInterval(() => {
      if (this.processingQueue.length > 0) {
        this.processBatch();
      }
    }, this.batchTimeout);
  }

  async processBatch() {
    if (this.processingQueue.length === 0) return;

    const batchStartTime = Date.now();
    const batch = this.processingQueue.splice(0, this.batchSize);
    
    console.log(`⚡ Processing batch: ${batch.length} items`);

    for (const item of batch) {
      try {
        await this.processQueueItem(item);
        this.processingStats.successfulIntegrations++;
      } catch (error) {
        console.error('Error processing queue item:', error);
        this.processingStats.failedIntegrations++;
      }
      this.processingStats.totalProcessed++;
    }

    const batchDuration = Date.now() - batchStartTime;
    this.processingStats.avgProcessingTime = 
      (this.processingStats.avgProcessingTime * 0.8) + (batchDuration * 0.2);
    this.processingStats.lastBatchProcess = Date.now();

    console.log(`✅ Batch processed in ${batchDuration}ms`);
  }

  async processQueueItem(item) {
    switch (item.type) {
      case 'task-start':
        await this.storeTaskStartMemory(item.data);
        break;
      case 'tool-call':
        await this.storeToolCallMemory(item.data);
        break;
      default:
        console.warn(`Unknown queue item type: ${item.type}`);
    }
  }

  // ============ MEMORY STORAGE METHODS ============

  async storeTaskStartMemory(taskData) {
    await this.crystallineMemory.storeMemory(
      'task-execution',
      JSON.stringify(taskData),
      {
        importance: 0.6,
        workflowId: taskData.workflowId,
        taskType: taskData.taskType,
        semantic_tags: [
          `task:${taskData.taskType}`,
          `workflow:${taskData.workflowId}`,
          `complexity:${taskData.context.complexity || 'unknown'}`
        ]
      }
    );
  }

  async storeToolCallMemory(toolData) {
    await this.crystallineMemory.storeMemory(
      'tool-usage',
      JSON.stringify(toolData),
      {
        importance: toolData.success ? 0.5 : 0.7, // Higher importance for failures
        workflowId: toolData.workflowId,
        tool: toolData.tool,
        semantic_tags: [
          `tool:${toolData.tool}`,
          `workflow:${toolData.workflowId}`,
          toolData.success ? 'outcome:success' : 'outcome:failure'
        ]
      }
    );
  }

  async processCompletedTask(completionData) {
    // Create performance node
    const performanceData = {
      agentId: completionData.agentCandidates?.[0] || 'unknown',
      taskContext: {
        type: completionData.taskType,
        domain: this.extractDomain(completionData.context),
        complexity: completionData.context.complexity || 'medium',
        description: completionData.context.description || '',
        workflowId: completionData.workflowId,
        sessionId: completionData.sessionId
      },
      metrics: {
        successRate: 1,
        executionTime: completionData.actualDuration,
        tokenUsage: completionData.metrics?.tokenUsage || 0,
        errorCount: 0,
        qualityScore: completionData.performanceRating,
        costEfficiency: completionData.metrics?.costEfficiency || 0
      },
      outcome: {
        success: true,
        completionStatus: 'completed',
        errorTypes: [],
        recoveryActions: []
      }
    };

    await this.performanceSchema.processAgentPerformance(performanceData);
  }

  async processFailedTask(failureData) {
    // Create failure performance node for learning
    const performanceData = {
      agentId: failureData.agentCandidates?.[0] || 'unknown',
      taskContext: {
        type: failureData.taskType,
        domain: this.extractDomain(failureData.context),
        complexity: failureData.context.complexity || 'medium',
        description: failureData.context.description || '',
        workflowId: failureData.workflowId,
        sessionId: failureData.sessionId
      },
      metrics: {
        successRate: 0,
        executionTime: failureData.actualDuration,
        errorCount: 1,
        qualityScore: 0,
        costEfficiency: 0
      },
      outcome: {
        success: false,
        completionStatus: 'failed',
        errorTypes: [failureData.failureType],
        recoveryActions: []
      }
    };

    await this.performanceSchema.processTaskFailure({
      agentId: performanceData.agentId,
      taskContext: performanceData.taskContext,
      duration: failureData.actualDuration,
      errors: [{ type: failureData.failureType, message: failureData.error }]
    });
  }

  // ============ HELPER METHODS ============

  generateWorkflowId(sessionId, timestamp) {
    return `wf_${sessionId}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTaskId(workflowId, timestamp) {
    return `task_${workflowId}_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  }

  analyzeUserIntent(prompt) {
    const intentKeywords = {
      'create': ['create', 'build', 'make', 'generate', 'develop'],
      'analyze': ['analyze', 'review', 'examine', 'assess', 'evaluate'],
      'optimize': ['optimize', 'improve', 'enhance', 'fix', 'speed up'],
      'research': ['research', 'find', 'search', 'investigate', 'explore']
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  }

  estimateTaskComplexity(prompt) {
    const complexityIndicators = {
      high: ['comprehensive', 'advanced', 'complex', 'enterprise', 'full-stack', 'integration'],
      medium: ['analyze', 'implement', 'create', 'develop', 'optimize'],
      low: ['simple', 'basic', 'quick', 'help', 'explain']
    };

    for (const [complexity, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => prompt.toLowerCase().includes(indicator))) {
        return complexity;
      }
    }
    return 'medium';
  }

  predictRequiredAgents(prompt) {
    const agentKeywords = {
      'seo': ['seo', 'keywords', 'search', 'optimization', 'ranking'],
      'content': ['content', 'writing', 'copy', 'article', 'blog'],
      'design': ['design', 'ui', 'ux', 'interface', 'visual'],
      'development': ['code', 'develop', 'build', 'implement', 'programming']
    };

    const predictedAgents = [];
    for (const [agent, keywords] of Object.entries(agentKeywords)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        predictedAgents.push(agent);
      }
    }
    return predictedAgents.length > 0 ? predictedAgents : ['general'];
  }

  classifyTaskType(task) {
    if (typeof task === 'string') {
      if (task.includes('analyze')) return 'analysis';
      if (task.includes('create') || task.includes('generate')) return 'creation';
      if (task.includes('optimize') || task.includes('improve')) return 'optimization';
      if (task.includes('research') || task.includes('find')) return 'research';
    }
    return 'general';
  }

  identifyAgentCandidates(task) {
    // Simple agent identification based on task content
    const candidates = [];
    const taskStr = JSON.stringify(task).toLowerCase();
    
    if (taskStr.includes('seo')) candidates.push('seo-specialist');
    if (taskStr.includes('content') || taskStr.includes('writing')) candidates.push('content-writer');
    if (taskStr.includes('design')) candidates.push('design-specialist');
    if (taskStr.includes('code') || taskStr.includes('develop')) candidates.push('developer');
    
    return candidates.length > 0 ? candidates : ['general-agent'];
  }

  estimateDuration(task) {
    const taskStr = JSON.stringify(task).toLowerCase();
    
    if (taskStr.includes('comprehensive') || taskStr.includes('complete')) return 300000; // 5 minutes
    if (taskStr.includes('analyze') || taskStr.includes('research')) return 180000; // 3 minutes
    if (taskStr.includes('simple') || taskStr.includes('quick')) return 30000; // 30 seconds
    
    return 120000; // 2 minutes default
  }

  identifyRiskFactors(task, workflow) {
    const risks = [];
    const taskStr = JSON.stringify(task).toLowerCase();
    
    if (taskStr.includes('complex') || taskStr.includes('advanced')) risks.push('high-complexity');
    if (workflow.complexity === 'high') risks.push('workflow-complexity');
    if (taskStr.length > 1000) risks.push('large-scope');
    
    return risks;
  }

  calculateToolEfficiency(tool, duration, success) {
    const baselines = {
      'web-search': 5000,
      'file-read': 1000,
      'code-generation': 10000,
      'analysis': 15000
    };
    
    const baseline = baselines[tool] || 5000;
    const efficiencyScore = success ? baseline / Math.max(duration, 100) : 0;
    
    return Math.min(efficiencyScore, 10); // Cap at 10
  }

  calculatePerformanceRating(taskExecution, endTime, success) {
    let rating = success ? 0.7 : 0.2; // Base rating
    
    const expectedDuration = taskExecution.expectedDuration || 120000;
    const actualDuration = endTime - taskExecution.startTime;
    
    // Duration performance
    if (actualDuration < expectedDuration * 0.8) rating += 0.2; // Faster than expected
    else if (actualDuration > expectedDuration * 1.5) rating -= 0.2; // Slower than expected
    
    // Risk factor handling
    if (taskExecution.riskFactors.length === 0) rating += 0.1; // No risk factors encountered
    
    return Math.max(0, Math.min(1, rating));
  }

  classifyFailureType(error) {
    if (!error) return 'unknown';
    
    const errorStr = error.toString().toLowerCase();
    
    if (errorStr.includes('timeout')) return 'timeout';
    if (errorStr.includes('network') || errorStr.includes('connection')) return 'network';
    if (errorStr.includes('permission') || errorStr.includes('access')) return 'permission';
    if (errorStr.includes('syntax') || errorStr.includes('parse')) return 'syntax';
    if (errorStr.includes('memory') || errorStr.includes('limit')) return 'resource';
    
    return 'unknown';
  }

  extractDomain(context) {
    if (context.domain) return context.domain;
    
    const contextStr = JSON.stringify(context).toLowerCase();
    if (contextStr.includes('seo')) return 'seo';
    if (contextStr.includes('content')) return 'content';
    if (contextStr.includes('design')) return 'design';
    if (contextStr.includes('development')) return 'development';
    
    return 'general';
  }

  // ============ EVENT HANDLERS ============

  async onWorkflowStart(data) {
    console.log(`🌊 Workflow started: ${data.workflowId}`);
    // Additional workflow start processing if needed
  }

  async onWorkflowComplete(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (workflow) {
      const completionData = {
        ...workflow,
        endTime: Date.now(),
        totalDuration: Date.now() - workflow.startTime,
        success: data.success || true,
        metrics: data.metrics || {}
      };

      await this.performanceSchema.processWorkflowPerformance(completionData);
      this.activeWorkflows.delete(data.workflowId);
    }
    
    console.log(`🏁 Workflow completed: ${data.workflowId}`);
  }

  async onAgentExecution(data) {
    // Process agent-specific execution data
    await this.performanceSchema.processAgentPerformance(data);
    console.log(`🤖 Agent execution processed: ${data.agentId}`);
  }

  async onQualityGate(data) {
    // Process quality gate results for learning
    const qualityData = {
      workflowId: data.workflowId,
      qualityGate: data.gateName,
      passed: data.passed,
      score: data.score,
      recommendations: data.recommendations || []
    };

    await this.crystallineMemory.storeMemory(
      'quality-gate',
      JSON.stringify(qualityData),
      {
        importance: data.passed ? 0.6 : 0.8, // Higher importance for failures
        workflowId: data.workflowId,
        semantic_tags: [
          `gate:${data.gateName}`,
          `outcome:${data.passed ? 'pass' : 'fail'}`
        ]
      }
    );

    console.log(`🚧 Quality gate processed: ${data.gateName} - ${data.passed ? 'PASS' : 'FAIL'}`);
  }

  // ============ API METHODS ============

  async getBridgeStatus() {
    return {
      active: true,
      hooksManagerConnected: !!this.hooksManager,
      crystallineMemoryConnected: !!this.crystallineMemory,
      performanceSchemaActive: !!this.performanceSchema,
      processingStats: this.processingStats,
      activeWorkflows: this.activeWorkflows.size,
      processingQueueSize: this.processingQueue.length,
      lastActivity: this.processingStats.lastBatchProcess
    };
  }

  async getProcessingStats() {
    return {
      ...this.processingStats,
      memoryStats: await this.performanceSchema.getPerformanceStats(),
      queueSize: this.processingQueue.length,
      activeWorkflows: Array.from(this.activeWorkflows.keys())
    };
  }
}

module.exports = HookMemoryBridge;