// Claude Code Hooks Integration Manager
// Provides seamless integration between Claude Code and ORCHESTRAI

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class ClaudeCodeHooksManager extends EventEmitter {
  constructor(usageTracker = null, mcpManager = null) {
    super();
    this.usageTracker = usageTracker;
    this.mcpManager = mcpManager;
    this.activeWorkflows = new Map();
    this.workflowMetrics = {
      totalWorkflows: 0,
      activeWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      avgDuration: 0,
      tokenUsage: {
        total: 0,
        byWorkflow: {},
        avgPerWorkflow: 0
      },
      costs: {
        total: 0,
        byWorkflow: {},
        avgPerWorkflow: 0
      }
    };
    
    this.hookConfigs = {
      // Pre-task hooks
      'user-prompt-submit': {
        enabled: true,
        description: 'Triggered when user submits a prompt',
        actions: ['track-request', 'analyze-intent', 'prepare-agents']
      },
      'task-start': {
        enabled: true,
        description: 'Triggered when Claude Code starts processing a task',
        actions: ['create-workflow', 'allocate-resources', 'start-timer']
      },
      
      // During-task hooks
      'tool-call': {
        enabled: true,
        description: 'Triggered on each tool call',
        actions: ['track-tool-usage', 'monitor-performance', 'update-costs']
      },
      'mcp-call': {
        enabled: true,
        description: 'Triggered on MCP server calls',
        actions: ['track-mcp-usage', 'monitor-server-health', 'log-operations']
      },
      'token-usage': {
        enabled: true,
        description: 'Triggered on AI model token usage',
        actions: ['calculate-costs', 'track-efficiency', 'update-projections']
      },
      
      // Post-task hooks
      'task-complete': {
        enabled: true,
        description: 'Triggered when task completes successfully',
        actions: ['finalize-workflow', 'calculate-metrics', 'generate-report']
      },
      'task-error': {
        enabled: true,
        description: 'Triggered on task errors',
        actions: ['log-error', 'analyze-failure', 'suggest-fixes']
      },
      
      // System hooks
      'session-start': {
        enabled: true,
        description: 'Triggered when Claude Code session starts',
        actions: ['initialize-tracking', 'prepare-dashboard', 'reset-metrics']
      },
      'session-end': {
        enabled: true,
        description: 'Triggered when Claude Code session ends',
        actions: ['save-session', 'generate-summary', 'cleanup-resources']
      },
      'notification': {
        enabled: true,
        description: 'Triggered on Claude Code notifications (permission requests, etc.)',
        actions: ['log-notification', 'evaluate-approval', 'track-requests']
      },
      'pre-compact': {
        enabled: true,
        description: 'Triggered before context window compaction',
        actions: ['save-context', 'preserve-critical-data', 'log-compaction']
      }
    };
    
    this.setupHookEndpoints();
    console.log('🎣 Claude Code Hooks Manager initialized');
  }
  
  // Webhook endpoint handlers
  setupHookEndpoints() {
    this.endpoints = {
      '/hooks/user-prompt-submit': this.handleUserPromptSubmit.bind(this),
      '/hooks/task-start': this.handleTaskStart.bind(this),
      '/hooks/tool-call': this.handleToolCall.bind(this),
      '/hooks/mcp-call': this.handleMCPCall.bind(this),
      '/hooks/token-usage': this.handleTokenUsage.bind(this),
      '/hooks/task-complete': this.handleTaskComplete.bind(this),
      '/hooks/task-error': this.handleTaskError.bind(this),
      '/hooks/notification': this.handleNotification.bind(this),
      '/hooks/pre-compact': this.handlePreCompact.bind(this),
      '/hooks/session-start': this.handleSessionStart.bind(this),
      '/hooks/session-end': this.handleSessionEnd.bind(this)
    };
  }
  
  // Hook Handlers
  async handleUserPromptSubmit(data) {
    const workflowId = this.generateWorkflowId();
    const workflow = {
      id: workflowId,
      prompt: data.prompt,
      userId: data.userId || 'unknown',
      startTime: Date.now(),
      status: 'initiated',
      intent: await this.analyzeIntent(data.prompt),
      estimatedCost: 0,
      actualCost: 0,
      tokenUsage: { input: 0, output: 0, total: 0 },
      toolCalls: [],
      mcpCalls: [],
      errors: []
    };
    
    this.activeWorkflows.set(workflowId, workflow);
    this.workflowMetrics.totalWorkflows++;
    this.workflowMetrics.activeWorkflows++;
    
    // Track with usage tracker
    if (this.usageTracker) {
      this.usageTracker.logEvent('claude_code_prompt', {
        workflowId,
        prompt: data.prompt,
        intent: workflow.intent,
        timestamp: Date.now()
      });
    }
    
    this.emit('workflow-initiated', workflow);
    return { workflowId, status: 'initiated', intent: workflow.intent };
  }
  
  async handleTaskStart(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (!workflow) return { error: 'Workflow not found' };
    
    workflow.status = 'processing';
    workflow.taskStartTime = Date.now();
    workflow.task = data.task;
    workflow.complexity = this.assessComplexity(data.task);
    
    // Prepare agents based on task type
    const recommendedAgents = this.recommendAgents(workflow.intent, data.task);
    workflow.recommendedAgents = recommendedAgents;
    
    // Start resource monitoring
    this.startResourceMonitoring(data.workflowId);
    
    this.emit('task-started', workflow);
    return { status: 'processing', recommendedAgents };
  }
  
  async handleToolCall(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (!workflow) return { error: 'Workflow not found' };
    
    const toolCall = {
      tool: data.tool,
      parameters: data.parameters,
      timestamp: Date.now(),
      duration: data.duration || 0,
      success: data.success !== false,
      result: data.result || null,
      error: data.error || null
    };
    
    workflow.toolCalls.push(toolCall);
    
    // Track tool usage patterns
    if (this.usageTracker) {
      this.usageTracker.trackFeatureUsage(data.tool, {
        workflowId: data.workflowId,
        success: toolCall.success,
        duration: toolCall.duration
      });
    }
    
    this.emit('tool-called', { workflow, toolCall });
    return { status: 'tracked', toolCall: toolCall.tool };
  }
  
  async handleMCPCall(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (workflow) {
      const mcpCall = {
        server: data.server,
        operation: data.operation,
        timestamp: Date.now(),
        duration: data.duration || 0,
        success: data.success !== false,
        error: data.error || null
      };
      
      workflow.mcpCalls.push(mcpCall);
    }
    
    // Track with MCP manager
    if (this.mcpManager && this.usageTracker) {
      this.usageTracker.trackMcpCall(
        data.server,
        data.operation,
        data.success !== false,
        data.duration || 0,
        data.error
      );
    }
    
    this.emit('mcp-called', { workflow, mcpCall: data });
    return { status: 'tracked', server: data.server };
  }
  
  async handleTokenUsage(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (workflow) {
      workflow.tokenUsage.input += data.inputTokens || 0;
      workflow.tokenUsage.output += data.outputTokens || 0;
      workflow.tokenUsage.total += (data.inputTokens || 0) + (data.outputTokens || 0);
    }
    
    // Track comprehensive token usage
    if (this.usageTracker) {
      this.usageTracker.trackTokenUsage(
        data.model,
        data.inputTokens || 0,
        data.outputTokens || 0,
        workflow?.intent || 'unknown',
        `claude-code-${data.workflowId}`,
        data.workflowId
      );
    }
    
    // Update workflow metrics
    this.updateWorkflowCosts(data.workflowId);
    
    this.emit('tokens-used', { workflow, tokenData: data });
    return { status: 'tracked', cost: workflow?.actualCost || 0 };
  }
  
  async handleTaskComplete(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (!workflow) return { error: 'Workflow not found' };
    
    workflow.status = 'completed';
    workflow.endTime = Date.now();
    workflow.duration = workflow.endTime - workflow.startTime;
    workflow.result = data.result || null;
    
    // Final cost calculation
    this.updateWorkflowCosts(data.workflowId);
    
    // Update metrics
    this.workflowMetrics.activeWorkflows--;
    this.workflowMetrics.completedWorkflows++;
    this.updateAverageMetrics();
    
    // Move to completed workflows
    this.activeWorkflows.delete(data.workflowId);
    
    // Generate workflow summary
    const summary = this.generateWorkflowSummary(workflow);
    
    this.emit('workflow-completed', { workflow, summary });
    return { status: 'completed', summary };
  }
  
  async handleTaskError(data) {
    const workflow = this.activeWorkflows.get(data.workflowId);
    if (workflow) {
      workflow.status = 'failed';
      workflow.endTime = Date.now();
      workflow.duration = workflow.endTime - workflow.startTime;
      workflow.errors.push({
        error: data.error,
        timestamp: Date.now(),
        context: data.context || null
      });
      
      this.workflowMetrics.activeWorkflows--;
      this.workflowMetrics.failedWorkflows++;
    }
    
    this.emit('workflow-failed', { workflow, error: data.error });
    return { status: 'error-logged', workflowId: data.workflowId };
  }
  
  async handleSessionStart(data) {
    this.sessionId = data.sessionId || this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    // Reset session metrics
    this.workflowMetrics.totalWorkflows = 0;
    this.workflowMetrics.activeWorkflows = 0;
    this.workflowMetrics.completedWorkflows = 0;
    this.workflowMetrics.failedWorkflows = 0;
    
    if (this.usageTracker) {
      this.usageTracker.registerAgent(
        'claude-code-hooks',
        'system',
        ['workflow-tracking', 'cost-monitoring', 'performance-analysis'],
        { sessionId: this.sessionId, startTime: this.sessionStartTime }
      );
    }
    
    this.emit('session-started', { sessionId: this.sessionId });
    return { status: 'session-initialized', sessionId: this.sessionId };
  }
  
  async handleSessionEnd(data) {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const sessionSummary = this.generateSessionSummary(sessionDuration);

    // Save session data
    await this.saveSessionData(sessionSummary);

    this.emit('session-ended', sessionSummary);
    return { status: 'session-ended', summary: sessionSummary };
  }

  async handleNotification(data) {
    const notificationData = {
      type: data.type || 'unknown',
      message: data.message || '',
      timestamp: data.timestamp || Date.now(),
      sessionId: this.sessionId
    };

    console.log(`🔔 Notification [${notificationData.type}]: ${notificationData.message}`);

    // Track notification in workflow if one is active
    const activeWorkflows = Array.from(this.activeWorkflows.values());
    if (activeWorkflows.length > 0) {
      const workflow = activeWorkflows[0];
      if (!workflow.notifications) {
        workflow.notifications = [];
      }
      workflow.notifications.push(notificationData);
    }

    this.emit('notification-received', notificationData);

    return {
      status: 'notification-logged',
      notification: notificationData
    };
  }

  async handlePreCompact(data) {
    const compactionData = {
      timestamp: data.timestamp || Date.now(),
      sessionId: data.sessionId || this.sessionId,
      activeWorkflows: this.activeWorkflows.size
    };

    console.log(`💾 Context compaction triggered - saving critical data`);

    // Save current workflow states before compaction
    const workflowStates = Array.from(this.activeWorkflows.entries()).map(([id, workflow]) => ({
      id: workflow.id,
      intent: workflow.intent,
      status: workflow.status,
      tokenUsage: workflow.tokenUsage,
      toolCalls: workflow.toolCalls.length,
      mcpCalls: workflow.mcpCalls.length,
      startTime: workflow.startTime
    }));

    // Preserve critical context
    const criticalContext = {
      compactionData,
      workflowStates,
      metrics: {
        totalWorkflows: this.workflowMetrics.totalWorkflows,
        completedWorkflows: this.workflowMetrics.completedWorkflows,
        failedWorkflows: this.workflowMetrics.failedWorkflows,
        totalCost: this.workflowMetrics.costs.total,
        totalTokens: this.workflowMetrics.tokenUsage.total
      }
    };

    // Save to file for persistence
    try {
      const filePath = path.join(__dirname, '../logs', `pre-compact-${Date.now()}.json`);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, JSON.stringify(criticalContext, null, 2));
      console.log(`✅ Critical context saved to ${filePath}`);
    } catch (error) {
      console.error('⚠️  Error saving pre-compact context:', error);
    }

    this.emit('pre-compact', criticalContext);

    return {
      status: 'context-preserved',
      data: compactionData,
      workflowsPreserved: workflowStates.length
    };
  }

  // Utility Methods
  analyzeIntent(prompt) {
    const keywords = {
      'coding': ['write', 'code', 'function', 'implement', 'debug', 'fix'],
      'analysis': ['analyze', 'examine', 'review', 'investigate', 'study'],
      'creation': ['create', 'build', 'make', 'design', 'generate'],
      'research': ['research', 'find', 'search', 'lookup', 'explore'],
      'documentation': ['document', 'explain', 'describe', 'readme', 'guide']
    };
    
    const promptLower = prompt.toLowerCase();
    let maxScore = 0;
    let intent = 'general';
    
    Object.entries(keywords).forEach(([category, words]) => {
      const score = words.reduce((sum, word) => {
        return sum + (promptLower.includes(word) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        intent = category;
      }
    });
    
    return intent;
  }
  
  assessComplexity(task) {
    const complexity = {
      simple: 0,
      moderate: 0,
      complex: 0
    };
    
    // Simple heuristics for complexity assessment
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('multi') || taskLower.includes('complex') || taskLower.includes('advanced')) {
      complexity.complex += 2;
    }
    
    if (taskLower.includes('simple') || taskLower.includes('quick') || taskLower.includes('basic')) {
      complexity.simple += 2;
    }
    
    // Length-based complexity
    if (task.length > 500) complexity.complex++;
    else if (task.length > 200) complexity.moderate++;
    else complexity.simple++;
    
    return Object.keys(complexity).reduce((a, b) => 
      complexity[a] > complexity[b] ? a : b
    );
  }
  
  recommendAgents(intent, task) {
    const agentMappings = {
      'coding': ['webdev', 'sequential-thinking'],
      'research': ['research', 'ref-tools', 'memory'],
      'analysis': ['sequential-thinking', 'memory'],
      'creation': ['webdev', 'writer'],
      'documentation': ['writer', 'ref-tools']
    };
    
    return agentMappings[intent] || ['sequential-thinking'];
  }
  
  updateWorkflowCosts(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow || !this.usageTracker) return;
    
    // Get cost estimation from usage tracker
    const summary = this.usageTracker.getUsageSummary('1h');
    workflow.actualCost = summary.costs?.session?.total || 0;
  }
  
  updateAverageMetrics() {
    const totalCompleted = this.workflowMetrics.completedWorkflows + this.workflowMetrics.failedWorkflows;
    if (totalCompleted > 0) {
      this.workflowMetrics.avgDuration = this.calculateAverageWorkflowDuration();
      this.workflowMetrics.tokenUsage.avgPerWorkflow = 
        this.workflowMetrics.tokenUsage.total / totalCompleted;
      this.workflowMetrics.costs.avgPerWorkflow = 
        this.workflowMetrics.costs.total / totalCompleted;
    }
  }
  
  generateWorkflowId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
  
  startResourceMonitoring(workflowId) {
    // Placeholder for resource monitoring implementation
    // Could monitor CPU, memory, API call frequency, etc.
  }
  
  calculateAverageWorkflowDuration() {
    // Implementation would calculate from completed workflows
    return 0;
  }
  
  generateWorkflowSummary(workflow) {
    return {
      id: workflow.id,
      intent: workflow.intent,
      duration: workflow.duration,
      tokenUsage: workflow.tokenUsage,
      actualCost: workflow.actualCost,
      toolCalls: workflow.toolCalls.length,
      mcpCalls: workflow.mcpCalls.length,
      success: workflow.status === 'completed',
      efficiency: this.calculateEfficiency(workflow)
    };
  }
  
  generateSessionSummary(duration) {
    return {
      sessionId: this.sessionId,
      duration: duration,
      totalWorkflows: this.workflowMetrics.totalWorkflows,
      completedWorkflows: this.workflowMetrics.completedWorkflows,
      failedWorkflows: this.workflowMetrics.failedWorkflows,
      successRate: this.workflowMetrics.totalWorkflows > 0 ? 
        (this.workflowMetrics.completedWorkflows / this.workflowMetrics.totalWorkflows) * 100 : 0,
      totalCost: this.workflowMetrics.costs.total,
      avgCostPerWorkflow: this.workflowMetrics.costs.avgPerWorkflow,
      totalTokens: this.workflowMetrics.tokenUsage.total,
      avgTokensPerWorkflow: this.workflowMetrics.tokenUsage.avgPerWorkflow
    };
  }
  
  calculateEfficiency(workflow) {
    // Simple efficiency calculation based on token usage vs duration
    if (workflow.duration === 0) return 0;
    
    const tokensPerSecond = workflow.tokenUsage.total / (workflow.duration / 1000);
    const costEfficiency = workflow.tokenUsage.total > 0 ? 
      workflow.actualCost / workflow.tokenUsage.total : 0;
    
    return Math.min(100, Math.max(0, 100 - (costEfficiency * 10000)));
  }
  
  async saveSessionData(summary) {
    try {
      const filePath = path.join(__dirname, '../logs', `claude-code-session-${this.sessionId}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(summary, null, 2));
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }
  
  // API Methods
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }
  
  getWorkflowMetrics() {
    return this.workflowMetrics;
  }
  
  getHookConfigurations() {
    return this.hookConfigs;
  }
  
  updateHookConfiguration(hookName, config) {
    if (this.hookConfigs[hookName]) {
      this.hookConfigs[hookName] = { ...this.hookConfigs[hookName], ...config };
      return true;
    }
    return false;
  }
}

module.exports = ClaudeCodeHooksManager;