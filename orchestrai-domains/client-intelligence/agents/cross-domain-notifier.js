// Cross-Domain Context Notifier Agent - Node.js Coordination Agent
// Notifies domain agents of client context updates and changes

const EventEmitter = require('events');

class CrossDomainNotifier extends EventEmitter {
  constructor(clientIntelligenceHub, orchestrator, crystallineMemory) {
    super();
    
    this.clientIntelligenceHub = clientIntelligenceHub;
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    
    this.agentId = 'cross-domain-notifier';
    this.status = 'initializing';
    
    // Domain agent subscriptions
    this.domainSubscriptions = new Map();
    this.notificationQueue = [];
    this.processingQueue = false;
    
    // Notification metrics
    this.metrics = {
      notificationsSent: 0,
      subscriptions: 0,
      queuedNotifications: 0,
      failedNotifications: 0,
      averageNotificationTime: 0,
      lastNotification: null,
      domainResponseTimes: new Map()
    };
    
    // Notification configuration
    this.notificationConfig = {
      batchSize: 10,
      maxRetries: 3,
      retryDelay: 1000,
      queueProcessingInterval: 500,
      notificationTimeout: 5000
    };
  }

  async initialize() {
    try {
      console.log('📡 Initializing Cross-Domain Context Notifier...');
      
      // Setup domain agent discovery
      await this.discoverDomainAgents();
      
      // Setup event listeners for context updates
      this.setupContextEventListeners();
      
      // Start notification queue processor
      this.startQueueProcessor();
      
      // Setup domain agent monitoring
      this.setupDomainMonitoring();
      
      this.status = 'active';
      console.log('✅ Cross-Domain Context Notifier initialized and ready');
      
    } catch (error) {
      console.error('❌ Cross-Domain Context Notifier initialization failed:', error);
      this.status = 'error';
    }
  }

  async discoverDomainAgents() {
    try {
      // Get all registered domain agents from orchestrator
      const domainAgents = this.orchestrator.domains || new Map();
      
      for (const [domain, agent] of domainAgents) {
        await this.registerDomainAgent(domain, agent);
      }
      
      console.log(`🔍 Discovered ${domainAgents.size} domain agents for context notifications`);
      
    } catch (error) {
      console.error('❌ Error discovering domain agents:', error);
    }
  }

  async registerDomainAgent(domain, agent) {
    try {
      const subscription = {
        domain: domain,
        agent: agent,
        contextTypes: ['branding', 'icp', 'business', 'market', 'integrated'],
        lastNotified: null,
        responseTime: 0,
        successCount: 0,
        failureCount: 0,
        active: true
      };
      
      this.domainSubscriptions.set(domain, subscription);
      this.metrics.subscriptions++;
      
      console.log(`📋 Registered domain agent: ${domain}`);
      
    } catch (error) {
      console.error(`❌ Error registering domain agent ${domain}:`, error);
    }
  }

  setupContextEventListeners() {
    // Listen for client context updates
    this.clientIntelligenceHub.on('clientContextUpdated', async (event) => {
      await this.queueContextNotification(event);
    });
    
    // Listen for new client creation
    this.clientIntelligenceHub.on('clientCreated', async (event) => {
      await this.queueContextNotification({
        ...event,
        type: 'client-created',
        contextType: 'all'
      });
    });
    
    // Listen for client file changes
    this.clientIntelligenceHub.on('clientFileChanged', async (event) => {
      await this.queueContextNotification({
        ...event,
        type: 'file-changed'
      });
    });
    
    // Listen for orchestrator domain events
    this.orchestrator.on('domainAgentActivated', async (event) => {
      if (event.clientContext && event.clientId) {
        await this.notifyDomainAgentActivation(event);
      }
    });
  }

  async queueContextNotification(event) {
    try {
      const notification = {
        id: `notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientId: event.clientId,
        type: event.type || 'context-update',
        contextType: event.contextType || 'integrated',
        changeType: event.changeType || 'updated',
        data: event.analysis || event.data || {},
        timestamp: event.timestamp || new Date().toISOString(),
        retries: 0,
        targetDomains: this.getTargetDomains(event.contextType)
      };
      
      this.notificationQueue.push(notification);
      this.metrics.queuedNotifications++;
      
      console.log(`📨 Queued notification: ${notification.id} for client ${event.clientId}`);
      
    } catch (error) {
      console.error('❌ Error queuing context notification:', error);
    }
  }

  getTargetDomains(contextType) {
    // Determine which domains should receive specific context types
    // Using correct domain names as registered in stable orchestrator
    const contextDomainMapping = {
      'branding': ['content-enhanced', 'quality'],
      'icp': ['content-enhanced', 'seo'],
      'business': ['content-enhanced', 'seo', 'quality'],
      'market': ['content-enhanced', 'seo'],
      'integrated': ['content-enhanced', 'seo', 'quality'],
      'all': ['content-enhanced', 'seo', 'quality', 'client-intelligence']
    };
    
    return contextDomainMapping[contextType] || ['content-enhanced', 'seo'];
  }

  startQueueProcessor() {
    this.queueProcessor = setInterval(async () => {
      if (!this.processingQueue && this.notificationQueue.length > 0) {
        await this.processNotificationQueue();
      }
    }, this.notificationConfig.queueProcessingInterval);
  }

  async processNotificationQueue() {
    if (this.processingQueue || this.notificationQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      const batch = this.notificationQueue.splice(0, this.notificationConfig.batchSize);
      
      await Promise.all(
        batch.map(notification => this.processNotification(notification))
      );
      
      this.metrics.queuedNotifications -= batch.length;
      
    } catch (error) {
      console.error('❌ Error processing notification queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  async processNotification(notification) {
    try {
      const startTime = Date.now();
      
      // Send notification to target domains
      const results = await Promise.allSettled(
        notification.targetDomains.map(domain => 
          this.notifyDomainAgent(domain, notification)
        )
      );
      
      // Process results
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const domain = notification.targetDomains[i];
        
        if (result.status === 'fulfilled') {
          successCount++;
          this.updateDomainSuccess(domain, Date.now() - startTime);
        } else {
          failureCount++;
          this.updateDomainFailure(domain, result.reason);
          console.error(`❌ Failed to notify ${domain}:`, result.reason);
        }
      }
      
      // Update metrics
      this.metrics.notificationsSent++;
      this.metrics.lastNotification = new Date().toISOString();
      this.updateAverageNotificationTime(Date.now() - startTime);
      
      if (failureCount > 0 && notification.retries < this.notificationConfig.maxRetries) {
        // Retry failed notifications
        notification.retries++;
        setTimeout(() => {
          this.notificationQueue.push(notification);
        }, this.notificationConfig.retryDelay * notification.retries);
      }
      
      console.log(`📤 Notification ${notification.id}: ${successCount} success, ${failureCount} failed`);
      
    } catch (error) {
      console.error(`❌ Error processing notification ${notification.id}:`, error);
      this.metrics.failedNotifications++;
    }
  }

  async notifyDomainAgent(domain, notification) {
    const subscription = this.domainSubscriptions.get(domain);
    
    if (!subscription || !subscription.active) {
      throw new Error(`Domain agent ${domain} not available`);
    }
    
    try {
      const contextData = await this.prepareContextForDomain(domain, notification);
      
      // Create notification payload
      const payload = {
        type: 'client-context-update',
        clientId: notification.clientId,
        contextType: notification.contextType,
        changeType: notification.changeType,
        context: contextData,
        timestamp: notification.timestamp,
        notificationId: notification.id
      };
      
      // Send notification to domain agent
      if (subscription.agent.receiveContextUpdate) {
        await Promise.race([
          subscription.agent.receiveContextUpdate(payload),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Notification timeout')), 
            this.notificationConfig.notificationTimeout)
          )
        ]);
      } else {
        // Fallback: emit event for domain agent to catch
        this.orchestrator.emit(`${domain}ContextUpdate`, payload);
      }
      
      subscription.lastNotified = new Date().toISOString();
      
    } catch (error) {
      throw new Error(`Failed to notify ${domain}: ${error.message}`);
    }
  }

  async prepareContextForDomain(domain, notification) {
    try {
      // Get domain-specific context formatting
      const contextFormatter = this.getDomainContextFormatter(domain);
      
      // Retrieve full client context if needed
      let contextData = notification.data;
      
      if (!contextData || Object.keys(contextData).length === 0) {
        // Retrieve from crystalline memory
        const memoryKey = `client-${notification.clientId}-${notification.contextType}`;
        contextData = await this.crystallineMemory.retrieve(memoryKey);
      }
      
      // Format context for specific domain
      return contextFormatter ? contextFormatter(contextData) : contextData;
      
    } catch (error) {
      console.error(`❌ Error preparing context for ${domain}:`, error);
      return notification.data || {};
    }
  }

  getDomainContextFormatter(domain) {
    const formatters = {
      'content-enhanced': (context) => ({
        brandVoice: context.brandVoice,
        targetAudience: context.primaryPersona,
        messagingThemes: context.keyMessages,
        contentGuidelines: context.contentStrategy
      }),
      
      'seo': (context) => ({
        keywordStrategy: context.seoStrategy,
        targetAudience: context.primaryPersona,
        competitivePositioning: context.competitiveAdvantages,
        localOptimization: context.geographicFocus
      }),
      
      'quality': (context) => ({
        brandSystem: context.visualSystem,
        userExperience: context.customerJourney,
        conversionGoals: context.businessObjectives,
        designGuidelines: context.designPrinciples
      }),

      'client-intelligence': (context) => ({
        clientProfile: context.clientProfile,
        businessContext: context.businessContext,
        marketPosition: context.marketPosition,
        strategicObjectives: context.strategicObjectives
      })
    };
    
    return formatters[domain];
  }

  async notifyDomainAgentActivation(event) {
    try {
      const notification = {
        id: `activation-${Date.now()}`,
        clientId: event.clientId,
        type: 'agent-activation',
        contextType: 'integrated',
        targetDomains: [event.domain],
        data: event.contextData || {},
        timestamp: new Date().toISOString(),
        retries: 0
      };
      
      await this.processNotification(notification);
      
    } catch (error) {
      console.error('❌ Error notifying domain agent activation:', error);
    }
  }

  setupDomainMonitoring() {
    // Monitor domain agent health and responsiveness
    this.domainMonitor = setInterval(() => {
      this.checkDomainAgentHealth();
    }, 30000); // Check every 30 seconds
  }

  checkDomainAgentHealth() {
    for (const [domain, subscription] of this.domainSubscriptions) {
      // Check response times and success rates
      const successRate = subscription.successCount / 
        (subscription.successCount + subscription.failureCount);
      
      if (successRate < 0.8 && subscription.successCount + subscription.failureCount > 10) {
        console.warn(`⚠️ Domain agent ${domain} has low success rate: ${(successRate * 100).toFixed(1)}%`);
      }
      
      // Check if agent is still responsive
      const lastNotified = subscription.lastNotified ? 
        Date.now() - new Date(subscription.lastNotified).getTime() : Infinity;
      
      if (lastNotified > 300000) { // 5 minutes
        console.warn(`⚠️ Domain agent ${domain} hasn't been notified in ${Math.round(lastNotified / 60000)} minutes`);
      }
    }
  }

  updateDomainSuccess(domain, responseTime) {
    const subscription = this.domainSubscriptions.get(domain);
    if (subscription) {
      subscription.successCount++;
      subscription.responseTime = responseTime;
      this.metrics.domainResponseTimes.set(domain, responseTime);
    }
  }

  updateDomainFailure(domain, error) {
    const subscription = this.domainSubscriptions.get(domain);
    if (subscription) {
      subscription.failureCount++;
    }
    this.metrics.failedNotifications++;
  }

  updateAverageNotificationTime(notificationTime) {
    const current = this.metrics.averageNotificationTime;
    const total = this.metrics.notificationsSent;
    
    this.metrics.averageNotificationTime = 
      ((current * (total - 1)) + notificationTime) / total;
  }

  // Status and health methods
  getStatus() {
    const domainStats = Array.from(this.domainSubscriptions.entries()).map(([domain, sub]) => ({
      domain,
      active: sub.active,
      successRate: sub.successCount / (sub.successCount + sub.failureCount) || 0,
      lastNotified: sub.lastNotified,
      responseTime: sub.responseTime
    }));
    
    return {
      agentId: this.agentId,
      status: this.status,
      metrics: {
        ...this.metrics,
        averageNotificationTimeMs: Math.round(this.metrics.averageNotificationTime),
        queueLength: this.notificationQueue.length,
        activeDomains: this.domainSubscriptions.size
      },
      domainAgents: domainStats,
      notificationConfig: this.notificationConfig
    };
  }

  async shutdown() {
    try {
      console.log('🔄 Shutting down Cross-Domain Context Notifier...');
      
      if (this.queueProcessor) {
        clearInterval(this.queueProcessor);
      }
      
      if (this.domainMonitor) {
        clearInterval(this.domainMonitor);
      }
      
      // Process remaining notifications
      if (this.notificationQueue.length > 0) {
        console.log(`📤 Processing ${this.notificationQueue.length} remaining notifications...`);
        await this.processNotificationQueue();
      }
      
      this.status = 'shutdown';
      console.log('✅ Cross-Domain Context Notifier shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during Cross-Domain Context Notifier shutdown:', error);
    }
  }
}

module.exports = CrossDomainNotifier;