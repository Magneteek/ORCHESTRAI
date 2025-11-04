// Inter-Agent Communication Protocol - ORCHESTRAI Phase 3
// Advanced communication system enabling seamless coordination between domain agents
// Supports message routing, broadcast channels, shared contexts, and collaborative workflows

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class InterAgentProtocol extends EventEmitter {
  constructor(crystallineMemory, domainAgentManager) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.domainAgentManager = domainAgentManager;
    
    // Communication infrastructure
    this.messageChannels = new Map(); // agentId -> MessageChannel
    this.broadcastChannels = new Map(); // channelName -> Set<agentId>
    this.sharedContexts = new Map(); // contextId -> SharedContext
    this.messageHistory = new Map(); // conversationId -> Message[]
    
    // Protocol configurations
    this.protocolConfig = {
      messageTimeout: 30000, // 30 seconds
      maxRetries: 3,
      maxHistorySize: 1000,
      enableEncryption: false, // Future feature
      priorityLevels: ['low', 'normal', 'high', 'urgent'],
      messageTypes: {
        DIRECT: 'direct',
        BROADCAST: 'broadcast', 
        CONTEXT_SHARE: 'context_share',
        TASK_REQUEST: 'task_request',
        TASK_RESPONSE: 'task_response',
        COORDINATION: 'coordination',
        KNOWLEDGE_SHARE: 'knowledge_share',
        STATUS_UPDATE: 'status_update'
      }
    };
    
    // Communication patterns for different scenarios
    this.communicationPatterns = {
      'seo-writer-collaboration': {
        participants: ['seo', 'writer'],
        workflow: [
          { from: 'seo', to: 'writer', type: 'KNOWLEDGE_SHARE', data: 'keyword_research' },
          { from: 'seo', to: 'writer', type: 'TASK_REQUEST', data: 'content_optimization' },
          { from: 'writer', to: 'seo', type: 'TASK_RESPONSE', data: 'optimized_content' },
          { from: 'seo', to: 'writer', type: 'STATUS_UPDATE', data: 'performance_metrics' }
        ]
      },
      'research-writer-pipeline': {
        participants: ['research', 'writer'],
        workflow: [
          { from: 'research', to: 'writer', type: 'KNOWLEDGE_SHARE', data: 'research_findings' },
          { from: 'writer', to: 'research', type: 'TASK_REQUEST', data: 'additional_data' },
          { from: 'research', to: 'writer', type: 'TASK_RESPONSE', data: 'supplemental_research' }
        ]
      },
      'webdev-maintenance-coordination': {
        participants: ['webdev', 'maintenance'],
        workflow: [
          { from: 'webdev', to: 'maintenance', type: 'STATUS_UPDATE', data: 'deployment_status' },
          { from: 'maintenance', to: 'webdev', type: 'COORDINATION', data: 'monitoring_setup' }
        ]
      }
    };
    
    // Message routing and delivery
    this.messageQueue = [];
    this.processingInterval = null;
    
    // Metrics and analytics
    this.communicationMetrics = {
      totalMessages: 0,
      messagesByType: {},
      messagesByAgent: {},
      successfulDeliveries: 0,
      failedDeliveries: 0,
      avgResponseTime: 0,
      activeConversations: 0
    };
    
    this.initialize();
  }

  async initialize() {
    console.log('🔗 Initializing Inter-Agent Communication Protocol...');
    
    try {
      // Set up message processing
      this.startMessageProcessor();
      
      // Initialize broadcast channels for common topics
      await this.initializeBroadcastChannels();
      
      // Set up domain agent listeners
      this.setupDomainAgentListeners();
      
      // Initialize shared contexts
      this.initializeSharedContexts();
      
      console.log('✅ Inter-Agent Communication Protocol initialized');
      this.emit('initialized', {
        messageChannels: this.messageChannels.size,
        broadcastChannels: this.broadcastChannels.size,
        patterns: Object.keys(this.communicationPatterns).length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Inter-Agent Communication Protocol:', error);
      throw error;
    }
  }

  async initializeBroadcastChannels() {
    const standardChannels = [
      'project-updates',
      'task-coordination', 
      'knowledge-sharing',
      'performance-alerts',
      'system-announcements',
      'cross-domain-insights'
    ];
    
    for (const channelName of standardChannels) {
      this.broadcastChannels.set(channelName, new Set());
    }
    
    console.log(`📡 Initialized ${standardChannels.length} broadcast channels`);
  }

  setupDomainAgentListeners() {
    if (!this.domainAgentManager) return;
    
    // Listen for agent registrations to set up communication channels
    this.domainAgentManager.on('agentRegistered', (agentInfo) => {
      this.setupAgentCommunicationChannel(agentInfo.agentId, agentInfo.domain);
    });
    
    // Listen for task events to facilitate coordination
    this.domainAgentManager.on('taskAssigned', (task) => {
      this.handleTaskCoordination(task, 'assigned');
    });
    
    this.domainAgentManager.on('taskCompleted', (taskEvent) => {
      this.handleTaskCoordination(taskEvent.task, 'completed');
    });
  }

  setupAgentCommunicationChannel(agentId, domain) {
    const messageChannel = {
      agentId,
      domain,
      inbox: [],
      outbox: [],
      subscriptions: new Set(),
      preferences: {
        priority: 'normal',
        autoAck: true,
        maxInboxSize: 100
      },
      metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        lastActivity: new Date().toISOString()
      }
    };
    
    this.messageChannels.set(agentId, messageChannel);
    
    // Auto-subscribe to relevant broadcast channels
    const relevantChannels = this.getRelevantChannelsForDomain(domain);
    for (const channelName of relevantChannels) {
      this.subscribeAgentToBroadcast(agentId, channelName);
    }
    
    console.log(`📡 Communication channel established for ${agentId} (${domain})`);
    
    this.emit('channelEstablished', { agentId, domain, timestamp: new Date().toISOString() });
  }

  getRelevantChannelsForDomain(domain) {
    const domainChannelMapping = {
      'seo': ['project-updates', 'task-coordination', 'knowledge-sharing', 'cross-domain-insights'],
      'writer': ['project-updates', 'task-coordination', 'knowledge-sharing', 'cross-domain-insights'],
      'research': ['knowledge-sharing', 'cross-domain-insights', 'project-updates'],
      'webdev': ['task-coordination', 'performance-alerts', 'system-announcements'],
      'maintenance': ['performance-alerts', 'system-announcements', 'task-coordination']
    };
    
    return domainChannelMapping[domain] || ['project-updates'];
  }

  subscribeAgentToBroadcast(agentId, channelName) {
    if (!this.broadcastChannels.has(channelName)) {
      this.broadcastChannels.set(channelName, new Set());
    }
    
    this.broadcastChannels.get(channelName).add(agentId);
    
    const channel = this.messageChannels.get(agentId);
    if (channel) {
      channel.subscriptions.add(channelName);
    }
  }

  initializeSharedContexts() {
    // Create shared contexts for common collaboration scenarios
    const standardContexts = [
      {
        id: 'project-coordination',
        type: 'project',
        participants: [],
        data: {},
        permissions: { read: 'all', write: 'participants', admin: 'orchestrator' }
      },
      {
        id: 'knowledge-repository',
        type: 'knowledge',
        participants: [],
        data: {},
        permissions: { read: 'all', write: 'all', admin: 'orchestrator' }
      }
    ];
    
    for (const context of standardContexts) {
      this.sharedContexts.set(context.id, {
        ...context,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      });
    }
    
    console.log(`🤝 Initialized ${standardContexts.length} shared contexts`);
  }

  async sendMessage(fromAgentId, toAgentId, messageData, options = {}) {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const message = {
      id: messageId,
      from: fromAgentId,
      to: toAgentId,
      type: options.type || this.protocolConfig.messageTypes.DIRECT,
      priority: options.priority || 'normal',
      data: messageData,
      timestamp,
      conversationId: options.conversationId || messageId,
      requiresAck: options.requiresAck || false,
      timeout: options.timeout || this.protocolConfig.messageTimeout,
      retryCount: 0,
      maxRetries: options.maxRetries || this.protocolConfig.maxRetries,
      status: 'pending'
    };
    
    console.log(`📨 Sending message ${messageId}: ${fromAgentId} → ${toAgentId} (${message.type})`);
    
    try {
      const deliveryResult = await this.deliverMessage(message);
      
      if (deliveryResult.success) {
        this.updateMetrics('message_sent', { from: fromAgentId, to: toAgentId, type: message.type });
        this.storeMessageHistory(message);
        
        this.emit('messageSent', {
          messageId,
          from: fromAgentId,
          to: toAgentId,
          type: message.type,
          timestamp
        });
        
        return { success: true, messageId, deliveredAt: deliveryResult.deliveredAt };
      } else {
        throw new Error(deliveryResult.error);
      }
      
    } catch (error) {
      console.error(`❌ Failed to send message ${messageId}:`, error);
      this.updateMetrics('message_failed', { from: fromAgentId, to: toAgentId });
      
      return { success: false, messageId, error: error.message };
    }
  }

  async deliverMessage(message) {
    const targetChannel = this.messageChannels.get(message.to);
    
    if (!targetChannel) {
      return { success: false, error: `Target agent ${message.to} not found` };
    }
    
    // Add to target agent's inbox
    targetChannel.inbox.push(message);
    targetChannel.metrics.messagesReceived++;
    targetChannel.metrics.lastActivity = new Date().toISOString();
    
    // Enforce inbox size limits
    if (targetChannel.inbox.length > targetChannel.preferences.maxInboxSize) {
      targetChannel.inbox.shift(); // Remove oldest message
    }
    
    // Update sender's outbox
    const senderChannel = this.messageChannels.get(message.from);
    if (senderChannel) {
      senderChannel.outbox.push({ ...message, status: 'delivered' });
      senderChannel.metrics.messagesSent++;
      senderChannel.metrics.lastActivity = new Date().toISOString();
    }
    
    // Notify target agent if they're active
    await this.notifyAgentOfMessage(message.to, message);
    
    return { success: true, deliveredAt: new Date().toISOString() };
  }

  async notifyAgentOfMessage(agentId, message) {
    try {
      const agent = this.domainAgentManager?.agents?.get(agentId);
      
      if (agent && agent.instance) {
        // Emit message event to the agent
        agent.instance.emit('messageReceived', message);
        
        // Handle automatic responses for certain message types
        await this.handleAutomaticResponse(agentId, message);
      }
      
    } catch (error) {
      console.error(`Error notifying agent ${agentId}:`, error);
    }
  }

  async handleAutomaticResponse(agentId, message) {
    // Handle automatic acknowledgments
    if (message.requiresAck) {
      const ackMessage = {
        type: 'acknowledgment',
        originalMessageId: message.id,
        timestamp: new Date().toISOString()
      };
      
      await this.sendMessage(agentId, message.from, ackMessage, {
        type: this.protocolConfig.messageTypes.STATUS_UPDATE
      });
    }
    
    // Handle coordination responses based on message type
    switch (message.type) {
      case this.protocolConfig.messageTypes.TASK_REQUEST:
        await this.handleTaskRequestResponse(agentId, message);
        break;
        
      case this.protocolConfig.messageTypes.KNOWLEDGE_SHARE:
        await this.handleKnowledgeShareResponse(agentId, message);
        break;
    }
  }

  async broadcastMessage(fromAgentId, channelName, messageData, options = {}) {
    const subscribers = this.broadcastChannels.get(channelName);
    
    if (!subscribers || subscribers.size === 0) {
      console.warn(`No subscribers found for broadcast channel: ${channelName}`);
      return { success: false, error: 'No subscribers' };
    }
    
    const broadcastId = uuidv4();
    const timestamp = new Date().toISOString();
    
    console.log(`📡 Broadcasting message ${broadcastId} to ${channelName} (${subscribers.size} subscribers)`);
    
    const deliveryPromises = Array.from(subscribers).map(async (subscriberId) => {
      if (subscriberId === fromAgentId) return; // Don't send to self
      
      const message = {
        ...messageData,
        broadcastId,
        channel: channelName,
        type: options.type || this.protocolConfig.messageTypes.BROADCAST
      };
      
      return await this.sendMessage(fromAgentId, subscriberId, message, {
        ...options,
        conversationId: broadcastId
      });
    });
    
    const deliveryResults = await Promise.allSettled(deliveryPromises);
    const successfulDeliveries = deliveryResults.filter(result => 
      result.status === 'fulfilled' && result.value?.success
    ).length;
    
    this.emit('messagesBroadcast', {
      broadcastId,
      channelName,
      fromAgent: fromAgentId,
      subscriberCount: subscribers.size,
      successfulDeliveries,
      timestamp
    });
    
    return {
      success: true,
      broadcastId,
      subscriberCount: subscribers.size,
      successfulDeliveries
    };
  }

  async createCollaborativeWorkflow(patternName, participants, contextData = {}) {
    const pattern = this.communicationPatterns[patternName];
    
    if (!pattern) {
      throw new Error(`Communication pattern '${patternName}' not found`);
    }
    
    const workflowId = uuidv4();
    const sharedContextId = `workflow-${workflowId}`;
    
    console.log(`🤝 Creating collaborative workflow: ${patternName} (${workflowId})`);
    
    // Create shared context for the workflow
    this.sharedContexts.set(sharedContextId, {
      id: sharedContextId,
      type: 'workflow',
      workflowId,
      pattern: patternName,
      participants,
      data: contextData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: { read: 'participants', write: 'participants', admin: 'orchestrator' },
      version: 1
    });
    
    // Execute workflow steps
    const executionResults = [];
    
    for (let i = 0; i < pattern.workflow.length; i++) {
      const step = pattern.workflow[i];
      
      try {
        const stepResult = await this.executeWorkflowStep(step, sharedContextId, workflowId);
        executionResults.push(stepResult);
        
        // Update shared context with step result
        await this.updateSharedContext(sharedContextId, {
          [`step_${i}_result`]: stepResult,
          lastStep: i,
          updatedAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`Error executing workflow step ${i}:`, error);
        executionResults.push({ success: false, error: error.message });
        break;
      }
    }
    
    const workflowResult = {
      workflowId,
      pattern: patternName,
      participants,
      sharedContextId,
      executionResults,
      status: executionResults.every(r => r.success) ? 'completed' : 'failed',
      completedAt: new Date().toISOString()
    };
    
    // Store workflow result in crystalline memory
    await this.storeWorkflowMemory(workflowResult);
    
    this.emit('workflowCompleted', workflowResult);
    
    return workflowResult;
  }

  async executeWorkflowStep(step, sharedContextId, workflowId) {
    const { from, to, type, data } = step;
    
    // Find actual agent IDs for the domain types
    const fromAgentId = this.findAgentByDomain(from);
    const toAgentId = this.findAgentByDomain(to);
    
    if (!fromAgentId || !toAgentId) {
      throw new Error(`Agent not found for workflow step: ${from} -> ${to}`);
    }
    
    const stepMessage = {
      workflowId,
      sharedContextId,
      step: data,
      context: this.sharedContexts.get(sharedContextId)
    };
    
    const result = await this.sendMessage(fromAgentId, toAgentId, stepMessage, {
      type,
      priority: 'high',
      requiresAck: true,
      conversationId: workflowId
    });
    
    return result;
  }

  findAgentByDomain(domain) {
    if (!this.domainAgentManager?.agents) return null;
    
    for (const [agentId, agentInfo] of this.domainAgentManager.agents) {
      if (agentInfo.domain === domain) {
        return agentId;
      }
    }
    
    return null;
  }

  async updateSharedContext(contextId, updates) {
    const context = this.sharedContexts.get(contextId);
    
    if (!context) {
      throw new Error(`Shared context ${contextId} not found`);
    }
    
    // Merge updates into context data
    context.data = { ...context.data, ...updates };
    context.updatedAt = new Date().toISOString();
    context.version++;
    
    // Store in crystalline memory
    if (this.crystallineMemory) {
      await this.crystallineMemory.storeMemory('shared-contexts', {
        contextId,
        data: context.data,
        version: context.version,
        updatedAt: context.updatedAt
      }, {
        domain: 'inter-agent-protocol',
        category: 'contexts',
        retention: 'medium-term'
      });
    }
    
    // Notify participants of context update
    this.emit('contextUpdated', {
      contextId,
      participants: context.participants,
      version: context.version,
      timestamp: context.updatedAt
    });
  }

  async handleTaskCoordination(task, event) {
    // Facilitate coordination when tasks are assigned or completed
    switch (event) {
      case 'assigned':
        await this.notifyRelevantAgents(task, 'task_assigned');
        break;
        
      case 'completed':
        await this.shareTaskResults(task);
        await this.notifyRelevantAgents(task, 'task_completed');
        break;
    }
  }

  async notifyRelevantAgents(task, event) {
    // Find agents that might be interested in this task
    const relevantAgents = this.findRelevantAgents(task);
    
    const notification = {
      event,
      taskId: task.id,
      taskType: task.type,
      assignedTo: task.assignedTo,
      projectUUID: task.projectUUID,
      timestamp: new Date().toISOString()
    };
    
    for (const agentId of relevantAgents) {
      if (agentId !== task.assignedTo) {
        await this.sendMessage('system', agentId, notification, {
          type: this.protocolConfig.messageTypes.COORDINATION,
          priority: 'normal'
        });
      }
    }
  }

  findRelevantAgents(task) {
    const relevantAgents = [];
    
    // Logic to determine which agents should be notified about this task
    // Based on domain relationships, project involvement, etc.
    
    if (!this.domainAgentManager?.agents) return relevantAgents;
    
    for (const [agentId, agentInfo] of this.domainAgentManager.agents) {
      // Include agents working on the same project
      if (task.projectUUID && this.isAgentInvolvedInProject(agentId, task.projectUUID)) {
        relevantAgents.push(agentId);
      }
      
      // Include agents with complementary capabilities
      if (this.hasComplementaryCapabilities(agentInfo.domain, task.type)) {
        relevantAgents.push(agentId);
      }
    }
    
    return [...new Set(relevantAgents)]; // Remove duplicates
  }

  isAgentInvolvedInProject(agentId, projectUUID) {
    // Check if agent has tasks in this project
    // This would typically check against project management system
    return false; // Placeholder implementation
  }

  hasComplementaryCapabilities(agentDomain, taskType) {
    const complementaryPairs = {
      'seo': ['content-optimization', 'keyword-research'],
      'writer': ['content-creation', 'content-optimization'],
      'research': ['data-analysis', 'content-creation'],
      'webdev': ['technical-audit', 'deployment'],
      'maintenance': ['performance-optimization', 'technical-audit']
    };
    
    return complementaryPairs[agentDomain]?.includes(taskType) || false;
  }

  async shareTaskResults(task) {
    if (!task.result || !task.shareResult) return;
    
    // Share task results through knowledge sharing broadcast
    await this.broadcastMessage(task.assignedTo, 'knowledge-sharing', {
      taskId: task.id,
      taskType: task.type,
      results: task.result,
      projectUUID: task.projectUUID,
      insights: this.extractInsights(task.result),
      timestamp: new Date().toISOString()
    }, {
      type: this.protocolConfig.messageTypes.KNOWLEDGE_SHARE,
      priority: 'normal'
    });
  }

  extractInsights(taskResult) {
    // Extract key insights from task results for sharing
    const insights = [];
    
    if (taskResult.type === 'keyword-research' && taskResult.data) {
      insights.push({
        type: 'keyword_opportunities',
        data: taskResult.data.relatedKeywords?.slice(0, 5) || []
      });
    }
    
    if (taskResult.type === 'competitor-analysis' && taskResult.data) {
      insights.push({
        type: 'market_insights',
        data: taskResult.data.analysis || {}
      });
    }
    
    return insights;
  }

  startMessageProcessor() {
    this.processingInterval = setInterval(async () => {
      await this.processMessageQueue();
      await this.cleanupExpiredMessages();
      this.updateCommunicationMetrics();
    }, 5000); // Process every 5 seconds
    
    console.log('⚡ Message processor started');
  }

  async processMessageQueue() {
    // Process pending messages, retries, etc.
    const currentTime = Date.now();
    
    for (const [agentId, channel] of this.messageChannels) {
      // Process pending acknowledgments
      const pendingMessages = channel.outbox.filter(msg => 
        msg.requiresAck && 
        msg.status === 'delivered' && 
        currentTime - new Date(msg.timestamp).getTime() < msg.timeout
      );
      
      // Handle timeouts and retries
      for (const message of pendingMessages) {
        if (currentTime - new Date(message.timestamp).getTime() >= message.timeout) {
          if (message.retryCount < message.maxRetries) {
            await this.retryMessage(message);
          } else {
            this.handleMessageFailure(message);
          }
        }
      }
    }
  }

  async retryMessage(message) {
    message.retryCount++;
    message.timestamp = new Date().toISOString();
    message.status = 'retrying';
    
    console.log(`🔄 Retrying message ${message.id} (attempt ${message.retryCount})`);
    
    await this.deliverMessage(message);
  }

  handleMessageFailure(message) {
    message.status = 'failed';
    this.updateMetrics('message_failed', { 
      from: message.from, 
      to: message.to, 
      reason: 'timeout' 
    });
    
    this.emit('messageTimeout', {
      messageId: message.id,
      from: message.from,
      to: message.to,
      retryCount: message.retryCount
    });
  }

  async cleanupExpiredMessages() {
    // Clean up old messages from inboxes and outboxes
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const currentTime = Date.now();
    
    for (const channel of this.messageChannels.values()) {
      channel.inbox = channel.inbox.filter(msg => 
        currentTime - new Date(msg.timestamp).getTime() < maxAge
      );
      
      channel.outbox = channel.outbox.filter(msg => 
        currentTime - new Date(msg.timestamp).getTime() < maxAge
      );
    }
  }

  updateMetrics(event, data) {
    this.communicationMetrics.totalMessages++;
    
    switch (event) {
      case 'message_sent':
        this.communicationMetrics.successfulDeliveries++;
        this.communicationMetrics.messagesByType[data.type] = 
          (this.communicationMetrics.messagesByType[data.type] || 0) + 1;
        this.communicationMetrics.messagesByAgent[data.from] = 
          (this.communicationMetrics.messagesByAgent[data.from] || 0) + 1;
        break;
        
      case 'message_failed':
        this.communicationMetrics.failedDeliveries++;
        break;
    }
  }

  updateCommunicationMetrics() {
    // Update active conversation count
    this.communicationMetrics.activeConversations = this.messageHistory.size;
    
    // Calculate average response time (placeholder)
    this.communicationMetrics.avgResponseTime = 1500; // ms
  }

  storeMessageHistory(message) {
    const conversationId = message.conversationId;
    
    if (!this.messageHistory.has(conversationId)) {
      this.messageHistory.set(conversationId, []);
    }
    
    const conversation = this.messageHistory.get(conversationId);
    conversation.push(message);
    
    // Limit conversation history
    if (conversation.length > this.protocolConfig.maxHistorySize) {
      conversation.shift();
    }
  }

  async storeWorkflowMemory(workflowResult) {
    if (!this.crystallineMemory) return;
    
    try {
      await this.crystallineMemory.storeMemory('inter-agent-workflows', {
        workflowId: workflowResult.workflowId,
        pattern: workflowResult.pattern,
        participants: workflowResult.participants,
        status: workflowResult.status,
        executionResults: workflowResult.executionResults,
        completedAt: workflowResult.completedAt
      }, {
        domain: 'inter-agent-protocol',
        category: 'workflows',
        retention: 'long-term'
      });
    } catch (error) {
      console.error('Failed to store workflow memory:', error);
    }
  }

  getProtocolStatus() {
    return {
      initialized: true,
      messageChannels: this.messageChannels.size,
      broadcastChannels: this.broadcastChannels.size,
      sharedContexts: this.sharedContexts.size,
      communicationPatterns: Object.keys(this.communicationPatterns).length,
      metrics: this.communicationMetrics,
      timestamp: new Date().toISOString()
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Inter-Agent Communication Protocol...');
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Clear all data structures
    this.messageChannels.clear();
    this.broadcastChannels.clear();
    this.sharedContexts.clear();
    this.messageHistory.clear();
    
    console.log('✅ Inter-Agent Communication Protocol shut down gracefully');
  }
}

module.exports = InterAgentProtocol;