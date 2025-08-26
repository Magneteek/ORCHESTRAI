// Domain Agent Manager - ORCHESTRAI Phase 3
// Central coordination system for all domain-specific agents
// Manages registration, task routing, inter-agent communication

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const TemplateRecommendationEngine = require('../template-engine/template-recommendation-engine');
const InterAgentProtocol = require('../communication/inter-agent-protocol');

class DomainAgentManager extends EventEmitter {
  constructor(orchestrator, mcpManager, crystallineMemory) {
    super();
    
    this.orchestrator = orchestrator;
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    
    // Domain agent registry
    this.agents = new Map();
    this.agentConfigs = new Map();
    
    // Task routing and coordination
    this.taskRouter = new Map(); // capability -> agentId mapping
    this.taskQueue = [];
    this.coordinationMetrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgProcessingTime: 0,
      agentUtilization: {}
    };
    
    // Inter-agent communication
    this.communicationChannels = new Map();
    this.sharedResources = new Map();
    
    // Template Recommendation Engine
    this.templateEngine = new TemplateRecommendationEngine(crystallineMemory, this);
    
    // Inter-Agent Communication Protocol
    this.communicationProtocol = new InterAgentProtocol(crystallineMemory, this);
    
    console.log('🎯 Domain Agent Manager initialized');
  }

  async initialize() {
    console.log('🚀 Initializing Domain Agent Manager...');
    
    try {
      // Initialize Template Recommendation Engine
      await this.templateEngine.initialize();
      
      // Initialize Inter-Agent Communication Protocol
      await this.communicationProtocol.initialize();
      
      // Set up communication infrastructure
      await this.setupCommunicationChannels();
      
      // Initialize shared resources
      await this.initializeSharedResources();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start coordination services
      this.startCoordinationServices();
      
      console.log('✅ Domain Agent Manager fully initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Domain Agent Manager:', error);
      throw error;
    }
  }

  async registerDomainAgent(agentInfo) {
    const { agentId, domain, capabilities, status, instance } = agentInfo;
    
    console.log(`📝 Registering domain agent: ${agentId} (${domain})`);
    
    try {
      // Store agent instance and metadata
      this.agents.set(agentId, {
        instance,
        domain,
        capabilities,
        status,
        registeredAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metrics: {
          tasksAssigned: 0,
          tasksCompleted: 0,
          avgResponseTime: 0,
          utilization: 0
        }
      });
      
      // Load agent configuration if available
      await this.loadAgentConfiguration(agentId, domain);
      
      // Update capability routing
      this.updateTaskRouting(agentId, capabilities);
      
      // Initialize communication channels for this agent
      await this.setupAgentCommunication(agentId);
      
      // Set up agent event listeners
      this.setupAgentEventListeners(agentId, instance);
      
      // Initialize agent utilization tracking
      this.coordinationMetrics.agentUtilization[agentId] = 0;
      
      console.log(`✅ Domain agent registered: ${agentId} with ${capabilities.length} capabilities`);
      
      this.emit('agentRegistered', {
        agentId,
        domain,
        capabilities,
        timestamp: new Date().toISOString()
      });
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to register domain agent ${agentId}:`, error);
      throw error;
    }
  }

  async loadAgentConfiguration(agentId, domain) {
    try {
      const configPath = path.join(
        __dirname, 
        '../../orchestrai-domains', 
        domain, 
        `${domain}-agent-config.json`
      );
      
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      this.agentConfigs.set(agentId, config);
      console.log(`📄 Loaded configuration for ${agentId}`);
      
    } catch (error) {
      console.log(`⚠️  No configuration file found for ${agentId}, using defaults`);
      this.agentConfigs.set(agentId, this.getDefaultAgentConfig());
    }
  }

  updateTaskRouting(agentId, capabilities) {
    capabilities.forEach(capability => {
      if (!this.taskRouter.has(capability)) {
        this.taskRouter.set(capability, []);
      }
      
      const agents = this.taskRouter.get(capability);
      if (!agents.includes(agentId)) {
        agents.push(agentId);
      }
    });
    
    console.log(`🎯 Updated task routing for ${capabilities.length} capabilities`);
  }

  async setupAgentCommunication(agentId) {
    // Create dedicated communication channel for agent
    this.communicationChannels.set(agentId, {
      inbox: [],
      outbox: [],
      subscriptions: new Set(),
      lastActivity: new Date().toISOString()
    });
    
    console.log(`📡 Communication channel established for ${agentId}`);
  }

  setupAgentEventListeners(agentId, agentInstance) {
    // Listen to agent events
    agentInstance.on('taskCompleted', (task) => {
      this.handleAgentTaskCompletion(agentId, task);
    });
    
    agentInstance.on('taskFailed', (task) => {
      this.handleAgentTaskFailure(agentId, task);
    });
    
    agentInstance.on('metricsUpdate', (metrics) => {
      this.updateAgentMetrics(agentId, metrics);
    });
    
    agentInstance.on('communicationRequest', (request) => {
      this.handleCommunicationRequest(agentId, request);
    });
    
    console.log(`👂 Event listeners setup for ${agentId}`);
  }

  async assignTask(task) {
    console.log(`📋 Assigning task: ${task.type} (${task.priority || 'medium'} priority)`);
    
    try {
      // Find suitable agents for this task
      const suitableAgents = this.findSuitableAgents(task);
      
      if (suitableAgents.length === 0) {
        throw new Error(`No suitable agents found for task: ${task.type}`);
      }
      
      // Select best agent based on current load and capabilities
      const selectedAgent = this.selectOptimalAgent(suitableAgents, task);
      
      // Get template recommendations for the task
      const templateRecommendations = await this.getTemplateRecommendations(task, selectedAgent);
      
      // Prepare task for assignment
      const assignedTask = {
        ...task,
        id: task.id || this.generateTaskId(),
        assignedTo: selectedAgent,
        assignedAt: new Date().toISOString(),
        status: 'assigned',
        templateRecommendations
      };
      
      // Send task to selected agent
      const agent = this.agents.get(selectedAgent);
      agent.instance.addTask(assignedTask);
      
      // Update metrics
      agent.metrics.tasksAssigned++;
      this.coordinationMetrics.totalTasks++;
      
      console.log(`✅ Task ${assignedTask.id} assigned to ${selectedAgent}`);
      
      this.emit('taskAssigned', assignedTask);
      
      return assignedTask;
      
    } catch (error) {
      console.error(`❌ Failed to assign task:`, error);
      this.coordinationMetrics.failedTasks++;
      throw error;
    }
  }

  findSuitableAgents(task) {
    const requiredCapabilities = task.requiredCapabilities || [task.type];
    const suitableAgents = [];
    
    for (const capability of requiredCapabilities) {
      const capableAgents = this.taskRouter.get(capability) || [];
      
      for (const agentId of capableAgents) {
        const agent = this.agents.get(agentId);
        
        if (agent && 
            agent.status === 'active' && 
            !suitableAgents.includes(agentId)) {
          suitableAgents.push(agentId);
        }
      }
    }
    
    return suitableAgents;
  }

  selectOptimalAgent(suitableAgents, task) {
    // Simple load-balancing algorithm
    // TODO: Implement more sophisticated selection based on:
    // - Current queue size
    // - Agent performance metrics
    // - Task priority
    // - Agent specialization score
    
    let optimalAgent = suitableAgents[0];
    let lowestUtilization = Infinity;
    
    for (const agentId of suitableAgents) {
      const utilization = this.coordinationMetrics.agentUtilization[agentId] || 0;
      
      if (utilization < lowestUtilization) {
        lowestUtilization = utilization;
        optimalAgent = agentId;
      }
    }
    
    return optimalAgent;
  }

  handleAgentTaskCompletion(agentId, task) {
    console.log(`✅ Agent ${agentId} completed task ${task.id}`);
    
    // Update metrics
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.metrics.tasksCompleted++;
      agent.lastActivity = new Date().toISOString();
    }
    
    this.coordinationMetrics.completedTasks++;
    
    // Store task result in shared resources if needed
    this.storeSharedResult(task);
    
    // Notify other agents if task result should be shared
    this.propagateTaskResult(agentId, task);
    
    this.emit('taskCompleted', { agentId, task, timestamp: new Date().toISOString() });
  }

  handleAgentTaskFailure(agentId, task) {
    console.log(`❌ Agent ${agentId} failed task ${task.id}: ${task.error}`);
    
    this.coordinationMetrics.failedTasks++;
    
    // Attempt task reassignment if retries are available
    if ((task.retryCount || 0) < (task.maxRetries || 2)) {
      const retryTask = {
        ...task,
        retryCount: (task.retryCount || 0) + 1,
        previousAgent: agentId,
        retryReason: task.error
      };
      
      console.log(`🔄 Retrying task ${task.id} (attempt ${retryTask.retryCount})`);
      this.assignTask(retryTask);
    } else {
      console.log(`💥 Task ${task.id} exhausted all retry attempts`);
      this.emit('taskExhausted', { agentId, task, timestamp: new Date().toISOString() });
    }
    
    this.emit('taskFailed', { agentId, task, timestamp: new Date().toISOString() });
  }

  updateAgentMetrics(agentId, metrics) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.metrics = { ...agent.metrics, ...metrics };
      agent.lastActivity = new Date().toISOString();
      
      // Update utilization
      this.coordinationMetrics.agentUtilization[agentId] = 
        this.calculateAgentUtilization(agent.metrics);
    }
  }

  calculateAgentUtilization(agentMetrics) {
    // Simple utilization calculation based on task completion rate
    // TODO: Implement more sophisticated utilization tracking
    const { tasksAssigned, tasksCompleted } = agentMetrics;
    
    if (tasksAssigned === 0) return 0;
    return (tasksCompleted / tasksAssigned) * 100;
  }

  async facilitateInterAgentCommunication(sourceAgentId, targetAgentId, message, options = {}) {
    console.log(`📡 Inter-agent communication: ${sourceAgentId} → ${targetAgentId}`);
    
    // Use the new communication protocol for enhanced message handling
    const result = await this.communicationProtocol.sendMessage(
      sourceAgentId, 
      targetAgentId, 
      message, 
      options
    );
    
    if (result.success) {
      this.emit('interAgentCommunication', {
        messageId: result.messageId,
        from: sourceAgentId,
        to: targetAgentId,
        deliveredAt: result.deliveredAt
      });
    }
    
    return result;
  }

  async broadcastToAgents(fromAgentId, channelName, message, options = {}) {
    console.log(`📡 Broadcasting from ${fromAgentId} to ${channelName}`);
    
    return await this.communicationProtocol.broadcastMessage(
      fromAgentId,
      channelName, 
      message,
      options
    );
  }

  async createCollaborativeWorkflow(patternName, participants, contextData = {}) {
    console.log(`🤝 Creating collaborative workflow: ${patternName}`);
    
    return await this.communicationProtocol.createCollaborativeWorkflow(
      patternName,
      participants,
      contextData
    );
  }

  storeSharedResult(task) {
    // Store task results that should be shared across agents
    if (task.shareResult !== false) {
      const sharedResult = {
        taskId: task.id,
        agentId: task.assignedTo,
        type: task.type,
        result: task.result,
        timestamp: task.completedAt,
        tags: task.tags || []
      };
      
      const resourceKey = `${task.type}-${task.assignedTo}`;
      
      if (!this.sharedResources.has(resourceKey)) {
        this.sharedResources.set(resourceKey, []);
      }
      
      this.sharedResources.get(resourceKey).push(sharedResult);
      
      // Limit stored results to prevent memory issues
      const results = this.sharedResources.get(resourceKey);
      if (results.length > 100) {
        results.splice(0, results.length - 100);
      }
    }
  }

  propagateTaskResult(agentId, task) {
    // Propagate relevant task results to other agents
    const config = this.agentConfigs.get(agentId);
    
    if (config?.integrations?.crystallineMemory?.shareWith) {
      const shareWith = config.integrations.crystallineMemory.shareWith;
      
      shareWith.forEach(targetDomain => {
        const targetAgents = Array.from(this.agents.values())
          .filter(agent => agent.domain === targetDomain)
          .map(agent => Array.from(this.agents.entries())
            .find(([id, info]) => info === agent)?.[0])
          .filter(Boolean);
        
        targetAgents.forEach(targetAgentId => {
          this.facilitateInterAgentCommunication(agentId, targetAgentId, {
            type: 'taskResult',
            task: {
              id: task.id,
              type: task.type,
              result: task.result,
              relevantData: this.extractRelevantData(task, targetDomain)
            }
          }).catch(error => {
            console.error(`Failed to share result with ${targetAgentId}:`, error);
          });
        });
      });
    }
  }

  extractRelevantData(task, targetDomain) {
    // Extract data relevant to target domain
    // TODO: Implement intelligent data filtering based on domain relationships
    
    const relevanceMap = {
      seo: ['keywords', 'content', 'competitors'],
      writer: ['content', 'keywords', 'topics'],
      research: ['data', 'insights', 'trends'],
      webdev: ['technical', 'performance', 'structure']
    };
    
    const relevantKeys = relevanceMap[targetDomain] || [];
    const relevantData = {};
    
    if (task.result && task.result.data) {
      Object.keys(task.result.data).forEach(key => {
        if (relevantKeys.some(relevantKey => key.includes(relevantKey))) {
          relevantData[key] = task.result.data[key];
        }
      });
    }
    
    return relevantData;
  }

  setupCommunicationChannels() {
    console.log('📡 Setting up inter-agent communication channels...');
    // Communication infrastructure is now ready
  }

  async initializeSharedResources() {
    console.log('🔗 Initializing shared resources...');
    // Shared resources initialized
  }

  setupEventListeners() {
    // Listen for orchestrator events
    this.orchestrator?.on('taskRequest', (task) => {
      this.assignTask(task).catch(error => {
        console.error('Task assignment failed:', error);
      });
    });
  }

  startCoordinationServices() {
    // Start periodic coordination tasks
    setInterval(() => {
      this.updateCoordinationMetrics();
    }, 30000);
    
    setInterval(() => {
      this.cleanupOldResources();
    }, 300000); // 5 minutes
    
    console.log('⚡ Coordination services started');
  }

  updateCoordinationMetrics() {
    // Update overall coordination metrics
    const totalTasks = this.coordinationMetrics.completedTasks + this.coordinationMetrics.failedTasks;
    
    if (totalTasks > 0) {
      this.coordinationMetrics.successRate = 
        (this.coordinationMetrics.completedTasks / totalTasks) * 100;
    }
    
    this.emit('coordinationMetrics', this.coordinationMetrics);
  }

  cleanupOldResources() {
    // Clean up old shared resources and communication messages
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.communicationChannels.forEach((channel, agentId) => {
      channel.inbox = channel.inbox.filter(msg => 
        new Date(msg.timestamp).getTime() > cutoffTime
      );
    });
    
    this.sharedResources.forEach((results, key) => {
      this.sharedResources.set(key, results.filter(result => 
        new Date(result.timestamp).getTime() > cutoffTime
      ));
    });
  }

  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getDefaultAgentConfig() {
    return {
      taskProcessing: {
        maxConcurrentTasks: 1,
        queueSizeLimit: 10,
        processingInterval: 2000,
        taskTimeout: 300000
      }
    };
  }

  getAllAgents() {
    const agentList = [];
    
    this.agents.forEach((agentInfo, agentId) => {
      agentList.push({
        agentId,
        ...agentInfo,
        queueLength: agentInfo.instance?.taskQueue?.length || 0,
        activeTask: agentInfo.instance?.activeTask?.type || null
      });
    });
    
    return agentList;
  }

  getCoordinationMetrics() {
    return {
      ...this.coordinationMetrics,
      activeAgents: this.agents.size,
      totalCapabilities: this.taskRouter.size,
      communicationChannels: this.communicationChannels.size,
      sharedResources: this.sharedResources.size,
      timestamp: new Date().toISOString()
    };
  }

  async getTemplateRecommendations(task, agentId) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        console.warn(`Agent ${agentId} not found for template recommendations`);
        return null;
      }
      
      // Prepare task data for template engine
      const taskData = {
        domain: agent.domain,
        taskType: task.type,
        complexity: task.complexity || 'medium',
        context: {
          capabilities: task.requiredCapabilities || [],
          priority: task.priority || 'medium',
          deadline: task.deadline,
          ...task.context
        }
      };
      
      console.log(`🎯 Requesting template recommendations for ${agent.domain}:${task.type}`);
      
      // Get recommendations from template engine
      const recommendations = await this.templateEngine.recommendTemplates(taskData);
      
      if (recommendations.success) {
        console.log(`✅ Generated ${recommendations.recommendations.length} template recommendations`);
        return {
          success: true,
          recommendations: recommendations.recommendations,
          metadata: recommendations.metadata
        };
      } else {
        console.warn('⚠️ Template recommendation failed, using fallbacks');
        return {
          success: false,
          fallbackRecommendations: recommendations.fallbackRecommendations || []
        };
      }
      
    } catch (error) {
      console.error('❌ Error getting template recommendations:', error);
      return {
        success: false,
        error: error.message,
        fallbackRecommendations: []
      };
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down Domain Agent Manager...');
    
    // Shut down all agents
    for (const [agentId, agent] of this.agents) {
      try {
        if (agent.instance && typeof agent.instance.shutdown === 'function') {
          await agent.instance.shutdown();
        }
      } catch (error) {
        console.error(`Error shutting down agent ${agentId}:`, error);
      }
    }
    
    this.agents.clear();
    this.communicationChannels.clear();
    this.sharedResources.clear();
    
    console.log('✅ Domain Agent Manager shut down gracefully');
  }
}

module.exports = DomainAgentManager;