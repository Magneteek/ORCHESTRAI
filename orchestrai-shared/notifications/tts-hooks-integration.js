const TextToSpeechService = require('./text-to-speech-service');

/**
 * TTS Integration for Claude Code Hooks
 * 
 * Extends the existing hooks manager to provide voice notifications
 * for agent task events and system status changes
 */
class TTSHooksIntegration {
  constructor(hooksManager, orchestrator, options = {}) {
    this.hooksManager = hooksManager;
    this.orchestrator = orchestrator;
    
    // Initialize TTS service
    this.ttsService = new TextToSpeechService(orchestrator, {
      enabled: options.enabled !== false,
      voice: options.voice || 'Alex',
      speed: options.speed || 1.0,
      volume: options.volume || 0.8
    });
    
    // Track active workflows for context
    this.activeWorkflows = new Map();
    this.agentActivities = new Map(); // Track agent start/completion
    
    // Setup event listeners
    this.setupHookListeners();
    
    console.log('🔊 TTS Hooks Integration initialized');
  }

  /**
   * Setup event listeners for hook events
   */
  setupHookListeners() {
    if (!this.hooksManager) {
      console.warn('🔊 No hooks manager provided, TTS integration disabled');
      return;
    }
    
    // Listen to workflow events
    this.hooksManager.on('workflow-initiated', this.handleWorkflowInitiated.bind(this));
    this.hooksManager.on('task-started', this.handleTaskStarted.bind(this));
    this.hooksManager.on('tool-called', this.handleToolCalled.bind(this));
    this.hooksManager.on('mcp-called', this.handleMCPCalled.bind(this));
    this.hooksManager.on('workflow-completed', this.handleWorkflowCompleted.bind(this));
    this.hooksManager.on('workflow-failed', this.handleWorkflowFailed.bind(this));
    this.hooksManager.on('session-started', this.handleSessionStarted.bind(this));
    this.hooksManager.on('session-ended', this.handleSessionEnded.bind(this));
    
    // Listen to domain events from orchestrator
    if (this.orchestrator) {
      this.orchestrator.on('agent_registered', this.handleAgentRegistered.bind(this));
      this.orchestrator.on('qualityCheckFailed', this.handleQualityCheckFailed.bind(this));
    }
    
    console.log('🔊 TTS hook listeners configured');
  }

  /**
   * Handle workflow initiation
   */
  handleWorkflowInitiated(workflow) {
    this.activeWorkflows.set(workflow.id, {
      ...workflow,
      startedAgents: new Set(),
      completedAgents: new Set()
    });
    
    // Announce workflow start
    if (this.ttsService.notificationTypes.agent_start.enabled) {
      const agentType = this.inferAgentFromIntent(workflow.intent);
      this.ttsService.announceAgentStart(
        agentType,
        workflow.intent,
        {
          workflowId: workflow.id,
          prompt: workflow.prompt?.substring(0, 100) || 'task'
        }
      );
    }
  }

  /**
   * Handle task start
   */
  handleTaskStarted(workflow) {
    const storedWorkflow = this.activeWorkflows.get(workflow.id);
    if (!storedWorkflow) return;
    
    // Update workflow info
    storedWorkflow.task = workflow.task;
    storedWorkflow.complexity = workflow.complexity;
    storedWorkflow.recommendedAgents = workflow.recommendedAgents;
    
    // Announce specific agents starting if known
    if (workflow.recommendedAgents && workflow.recommendedAgents.length > 0) {
      workflow.recommendedAgents.forEach(agentName => {
        if (!storedWorkflow.startedAgents.has(agentName)) {
          storedWorkflow.startedAgents.add(agentName);
          
          this.ttsService.announceAgentStart(
            this.formatAgentName(agentName),
            workflow.task?.substring(0, 50) || workflow.intent,
            {
              complexity: workflow.complexity,
              workflowId: workflow.id
            }
          );
        }
      });
    }
  }

  /**
   * Handle tool calls (important agent activity)
   */
  handleToolCalled({ workflow, toolCall }) {
    // Announce significant tool usage
    if (this.isSignificantTool(toolCall.tool)) {
      const agentName = this.inferAgentFromTool(toolCall.tool);
      
      if (toolCall.success) {
        // Don't announce every tool call, only significant ones
        if (this.shouldAnnounceToolCall(workflow.id, toolCall.tool)) {
          this.ttsService.announce(
            `${this.formatAgentName(agentName)} is using ${this.formatToolName(toolCall.tool)}`,
            { priority: 'low' }
          );
        }
      } else if (toolCall.error) {
        this.ttsService.announceAgentError(
          this.formatAgentName(agentName),
          this.formatToolName(toolCall.tool),
          toolCall.error
        );
      }
    }
  }

  /**
   * Handle MCP calls (agent coordination)
   */
  handleMCPCalled({ workflow, mcpCall }) {
    // Announce MCP agent activity
    if (mcpCall.success && this.isSignificantMCPCall(mcpCall.server)) {
      const agentName = this.formatAgentName(mcpCall.server);
      
      if (!this.activeWorkflows.get(workflow?.id)?.startedAgents?.has(mcpCall.server)) {
        this.activeWorkflows.get(workflow?.id)?.startedAgents?.add(mcpCall.server);
        
        this.ttsService.announceAgentStart(
          agentName,
          mcpCall.operation || 'specialized task',
          {
            server: mcpCall.server,
            workflowId: workflow?.id
          }
        );
      }
    } else if (!mcpCall.success && mcpCall.error) {
      this.ttsService.announceAgentError(
        this.formatAgentName(mcpCall.server),
        mcpCall.operation || 'task',
        mcpCall.error
      );
    }
  }

  /**
   * Handle workflow completion
   */
  handleWorkflowCompleted({ workflow, summary }) {
    const storedWorkflow = this.activeWorkflows.get(workflow.id);
    
    // Announce completion of agents that were started
    if (storedWorkflow && storedWorkflow.startedAgents.size > 0) {
      storedWorkflow.startedAgents.forEach(agentName => {
        if (!storedWorkflow.completedAgents.has(agentName)) {
          storedWorkflow.completedAgents.add(agentName);
          
          this.ttsService.announceAgentComplete(
            this.formatAgentName(agentName),
            workflow.task?.substring(0, 50) || workflow.intent,
            {
              duration: this.formatDuration(workflow.duration),
              efficiency: summary.efficiency,
              success: true
            }
          );
        }
      });
    } else {
      // Fallback: announce general completion
      const primaryAgent = this.inferAgentFromIntent(workflow.intent);
      this.ttsService.announceAgentComplete(
        primaryAgent,
        workflow.intent,
        {
          duration: this.formatDuration(workflow.duration),
          tokenUsage: workflow.tokenUsage.total,
          success: true
        }
      );
    }
    
    // Cleanup
    this.activeWorkflows.delete(workflow.id);
  }

  /**
   * Handle workflow failure
   */
  handleWorkflowFailed({ workflow, error }) {
    const storedWorkflow = this.activeWorkflows.get(workflow.id);
    
    if (storedWorkflow && storedWorkflow.startedAgents.size > 0) {
      // Announce failure for active agents
      storedWorkflow.startedAgents.forEach(agentName => {
        this.ttsService.announceAgentError(
          this.formatAgentName(agentName),
          workflow.task?.substring(0, 50) || workflow.intent,
          error
        );
      });
    } else {
      // Fallback: announce general error
      const primaryAgent = this.inferAgentFromIntent(workflow.intent);
      this.ttsService.announceAgentError(
        primaryAgent,
        workflow.intent,
        error
      );
    }
    
    // Cleanup
    this.activeWorkflows.delete(workflow.id);
  }

  /**
   * Handle session events
   */
  handleSessionStarted({ sessionId }) {
    this.ttsService.announceSystemStatus(
      'ORCHESTRAI system ready',
      { sessionId }
    );
  }

  handleSessionEnded(summary) {
    const completionMessage = `Session completed. ${summary.completedWorkflows} tasks finished successfully.`;
    
    this.ttsService.announceSystemStatus(
      completionMessage,
      {
        duration: this.formatDuration(summary.duration),
        successRate: Math.round(summary.successRate)
      }
    );
  }

  /**
   * Handle orchestrator events
   */
  handleAgentRegistered(agent) {
    if (this.ttsService.notificationTypes.system_status.enabled) {
      this.ttsService.announceSystemStatus(
        `Agent ${this.formatAgentName(agent.domain)} registered and ready`
      );
    }
  }

  handleQualityCheckFailed({ originalTask, qualityResult }) {
    this.ttsService.announceAgentError(
      'Quality Control',
      originalTask.type || 'content validation',
      `Quality score: ${qualityResult.score}`
    );
  }

  /**
   * Utility methods for agent inference and formatting
   */
  inferAgentFromIntent(intent) {
    const intentAgentMap = {
      'coding': 'Web Developer',
      'research': 'Research Agent',
      'analysis': 'Analysis Agent',
      'creation': 'Content Creator',
      'documentation': 'Documentation Writer',
      'seo': 'SEO Specialist',
      'design': 'Design Agent',
      'quality': 'Quality Controller'
    };
    
    return intentAgentMap[intent] || 'AI Agent';
  }

  inferAgentFromTool(tool) {
    const toolAgentMap = {
      'Edit': 'Code Editor',
      'Write': 'File Writer',
      'Read': 'File Reader',
      'Bash': 'System Agent',
      'WebFetch': 'Web Researcher',
      'Grep': 'Search Agent',
      'Glob': 'File Scanner',
      'TodoWrite': 'Task Manager'
    };
    
    return toolAgentMap[tool] || 'Tool Agent';
  }

  formatAgentName(name) {
    if (!name) return 'Agent';
    
    // Convert various formats to readable names
    const nameMap = {
      'mcp__sequential-thinking__sequentialthinking': 'Thinking Agent',
      'mcp__ref-tools__ref_search_documentation': 'Documentation Agent',
      'mcp__memory__search_nodes': 'Memory Agent',
      'mcp__dataforseo__keyword_overview': 'SEO Agent',
      'sequential-thinking': 'Thinking Agent',
      'ref-tools': 'Reference Agent',
      'memory': 'Memory Agent',
      'webdev': 'Web Developer',
      'writer': 'Content Writer',
      'research': 'Research Agent'
    };
    
    if (nameMap[name]) return nameMap[name];
    
    // Format kebab-case and snake_case to readable
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\bmcp\b/gi, '')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  formatToolName(tool) {
    return tool.replace(/([A-Z])/g, ' $1').trim();
  }

  formatDuration(ms) {
    if (!ms) return 'unknown time';
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} hours and ${minutes % 60} minutes`;
  }

  /**
   * Filter methods to avoid notification spam
   */
  isSignificantTool(tool) {
    const significantTools = [
      'Edit', 'Write', 'Bash', 'WebFetch', 'Task', 'TodoWrite'
    ];
    return significantTools.includes(tool);
  }

  isSignificantMCPCall(server) {
    // Ignore very frequent/low-level MCP calls
    const ignoredServers = ['mcp__memory__search_nodes'];
    return !ignoredServers.includes(server);
  }

  shouldAnnounceToolCall(workflowId, tool) {
    // Rate limiting: only announce tool calls if not announced recently
    const key = `${workflowId}_${tool}`;
    const lastAnnounced = this.agentActivities.get(key);
    const now = Date.now();
    
    if (!lastAnnounced || (now - lastAnnounced) > 30000) { // 30 second cooldown
      this.agentActivities.set(key, now);
      return true;
    }
    
    return false;
  }

  /**
   * API Methods
   */
  
  /**
   * Enable/disable TTS notifications
   */
  setEnabled(enabled) {
    if (enabled) {
      this.ttsService.enable();
    } else {
      this.ttsService.disable();
    }
  }

  /**
   * Configure notification types
   */
  configureNotifications(config) {
    Object.entries(config).forEach(([type, settings]) => {
      this.ttsService.configureNotificationType(type, settings);
    });
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      integration: 'active',
      ttsService: this.ttsService.getStatus(),
      activeWorkflows: this.activeWorkflows.size,
      agentActivities: this.agentActivities.size
    };
  }

  /**
   * Test TTS functionality
   */
  async testTTS() {
    return await this.ttsService.testTTS();
  }

  /**
   * Get TTS service directly for advanced configuration
   */
  getTTSService() {
    return this.ttsService;
  }
}

module.exports = TTSHooksIntegration;