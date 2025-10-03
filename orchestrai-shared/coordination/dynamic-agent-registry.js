// Dynamic Agent Registry - Auto-scaling agent management with intelligent lifecycle control
// Provides advanced agent spawning, load balancing, and resource optimization

const EventEmitter = require('events');
const crypto = require('crypto');

class DynamicAgentRegistry extends EventEmitter {
  constructor(agentAvailabilityTracker, crystallineMemory, mcpManager) {
    super();

    this.availabilityTracker = agentAvailabilityTracker;
    this.crystallineMemory = crystallineMemory;
    this.mcpManager = mcpManager;

    // Registry configuration
    this.config = {
      autoScalingEnabled: true,
      maxAgentInstances: 64,           // Maximum total agent instances
      minAgentInstances: 8,            // Minimum agent instances to maintain
      scaleUpCooldown: 30000,          // 30 seconds between scale-up operations
      scaleDownCooldown: 60000,        // 60 seconds between scale-down operations
      agentLifespanLimit: 3600000,     // 1 hour maximum lifespan for virtual agents
      performanceBasedScaling: true,   // Scale based on performance metrics
      predictiveScaling: true,         // Enable predictive scaling
      resourceOptimization: true,      // Optimize resource usage
      emergencyScalingMultiplier: 2.0, // Emergency scaling factor
      capabilityBasedScaling: true,    // Scale specific capabilities
      costOptimization: true           // Consider cost in scaling decisions
    };

    // Agent registry with enhanced metadata
    this.registry = new Map();

    // Agent templates for different capabilities
    this.agentTemplates = new Map([
      ['content-creation', {
        baseConfig: {
          type: 'claude-code',
          capabilities: ['content-creation', 'copywriting', 'article-writing'],
          maxConcurrentTasks: 3,
          averageResponseTime: 15000,
          specialization: 'content'
        },
        scalingProfile: {
          priority: 'high',
          costPerHour: 0.1,
          resourceIntensity: 'medium',
          demandPattern: 'variable'
        }
      }],
      ['seo-optimization', {
        baseConfig: {
          type: 'claude-code',
          capabilities: ['seo-analysis', 'keyword-research', 'optimization'],
          maxConcurrentTasks: 4,
          averageResponseTime: 10000,
          specialization: 'seo'
        },
        scalingProfile: {
          priority: 'high',
          costPerHour: 0.08,
          resourceIntensity: 'low',
          demandPattern: 'steady'
        }
      }],
      ['web-development', {
        baseConfig: {
          type: 'claude-code',
          capabilities: ['web-development', 'frontend', 'ui-design'],
          maxConcurrentTasks: 2,
          averageResponseTime: 20000,
          specialization: 'web'
        },
        scalingProfile: {
          priority: 'medium',
          costPerHour: 0.12,
          resourceIntensity: 'high',
          demandPattern: 'burst'
        }
      }],
      ['research-analysis', {
        baseConfig: {
          type: 'claude-code',
          capabilities: ['research', 'analysis', 'data-processing'],
          maxConcurrentTasks: 5,
          averageResponseTime: 12000,
          specialization: 'research'
        },
        scalingProfile: {
          priority: 'medium',
          costPerHour: 0.06,
          resourceIntensity: 'low',
          demandPattern: 'predictable'
        }
      }],
      ['general-purpose', {
        baseConfig: {
          type: 'claude-code',
          capabilities: ['general', 'multi-task', 'adaptive'],
          maxConcurrentTasks: 4,
          averageResponseTime: 12000,
          specialization: 'general'
        },
        scalingProfile: {
          priority: 'medium',
          costPerHour: 0.05,
          resourceIntensity: 'medium',
          demandPattern: 'baseline'
        }
      }]
    ]);

    // Scaling metrics and history
    this.scalingMetrics = {
      totalScalingOperations: 0,
      successfulScaleUps: 0,
      successfulScaleDowns: 0,
      failedScalingOperations: 0,
      emergencyScalingEvents: 0,
      predictiveScalingAccuracy: 0,
      lastScalingOperation: null,
      scalingHistory: [],
      costSavings: 0,
      performanceGains: 0
    };

    // Resource optimization
    this.resourceOptimizer = {
      cpuUtilization: 0,
      memoryUtilization: 0,
      networkBandwidth: 0,
      apiQuotaUsage: 0,
      costEfficiencyScore: 1.0,
      optimizationSuggestions: []
    };

    // Predictive scaling engine
    this.predictiveEngine = {
      demandPredictions: new Map(),
      loadPatterns: new Map(),
      seasonalFactors: new Map(),
      predictionAccuracy: 0.5,
      learningEnabled: true,
      lastPredictionUpdate: Date.now()
    };

    // Performance tracking
    this.performanceTracker = {
      agentEfficiency: new Map(),
      capabilityPerformance: new Map(),
      scalingEffectiveness: new Map(),
      resourceUtilization: new Map(),
      qualityMetrics: new Map()
    };

    // Cost management
    this.costManager = {
      totalCost: 0,
      hourlyRate: 0,
      budgetLimit: null,
      costPerCapability: new Map(),
      optimizationEnabled: this.config.costOptimization,
      lastCostAnalysis: Date.now()
    };

    // Initialization state
    this.isInitialized = false;

    console.log('🤖 DynamicAgentRegistry initialized with auto-scaling capabilities');

    this.initializeRegistry();
  }

  /**
   * Initialize the registry
   */
  async initializeRegistry() {
    try {
      // Register existing agents from availability tracker
      await this.importExistingAgents();

      // Initialize predictive models
      await this.initializePredictiveModels();

      // Start monitoring and scaling loops
      this.startScalingMonitoring();
      this.startPerformanceMonitoring();
      this.startCostMonitoring();

      // Ensure minimum agent count
      await this.ensureMinimumAgents();

      console.log('✅ DynamicAgentRegistry initialization complete');
      console.log(`📊 Managing ${this.registry.size} agents with auto-scaling enabled`);

      this.emit('registry-initialized', {
        totalAgents: this.registry.size,
        capabilities: Array.from(this.agentTemplates.keys()),
        scalingEnabled: this.config.autoScalingEnabled
      });

    } catch (error) {
      console.error('❌ Failed to initialize DynamicAgentRegistry:', error.message);
      throw error;
    }
  }

  /**
   * Import existing agents from availability tracker
   */
  async importExistingAgents() {
    if (!this.availabilityTracker) {
      return;
    }

    const existingAgents = this.availabilityTracker.getAvailableAgents();

    for (const agent of existingAgents) {
      await this.registerExistingAgent(agent);
    }

    console.log(`📥 Imported ${existingAgents.length} existing agents`);
  }

  /**
   * Register existing agent in registry
   */
  async registerExistingAgent(agentData) {
    const registryEntry = {
      id: agentData.id,
      source: 'imported',
      template: this.inferAgentTemplate(agentData),
      instance: agentData,
      lifecycle: {
        created: agentData.registeredAt || Date.now(),
        lastActivity: agentData.lastTaskAssignment || Date.now(),
        totalUptime: 0,
        scalingEvents: []
      },
      performance: {
        efficiency: agentData.successRate || 1.0,
        throughput: 0,
        resourceUsage: 'medium',
        qualityScore: 1.0
      },
      cost: {
        hourlyRate: this.calculateAgentCost(agentData),
        totalCost: 0,
        costEfficiency: 1.0
      },
      metadata: {
        isVirtual: false,
        canScale: false,
        priority: 'medium',
        tags: []
      }
    };

    this.registry.set(agentData.id, registryEntry);
  }

  /**
   * Infer agent template from agent data
   */
  inferAgentTemplate(agentData) {
    const capabilities = agentData.capabilities || [];

    if (capabilities.some(cap => cap.includes('content') || cap.includes('writing'))) {
      return 'content-creation';
    } else if (capabilities.some(cap => cap.includes('seo') || cap.includes('keyword'))) {
      return 'seo-optimization';
    } else if (capabilities.some(cap => cap.includes('web') || cap.includes('frontend'))) {
      return 'web-development';
    } else if (capabilities.some(cap => cap.includes('research') || cap.includes('analysis'))) {
      return 'research-analysis';
    } else {
      return 'general-purpose';
    }
  }

  /**
   * Calculate agent cost
   */
  calculateAgentCost(agentData) {
    const template = this.agentTemplates.get(this.inferAgentTemplate(agentData));
    return template ? template.scalingProfile.costPerHour : 0.05;
  }

  /**
   * Initialize predictive models
   */
  async initializePredictiveModels() {
    // Initialize demand prediction for each capability
    for (const capability of this.agentTemplates.keys()) {
      this.predictiveEngine.demandPredictions.set(capability, {
        currentDemand: 0,
        predictedDemand: 0,
        confidence: 0.5,
        trend: 'stable',
        lastUpdate: Date.now()
      });

      this.predictiveEngine.loadPatterns.set(capability, {
        hourlyPattern: new Array(24).fill(0.5),
        dailyPattern: new Array(7).fill(0.5),
        seasonalFactors: { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 }
      });
    }

    console.log('🔮 Predictive scaling models initialized');
  }

  /**
   * Start scaling monitoring
   */
  startScalingMonitoring() {
    setInterval(async () => {
      await this.evaluateScalingNeeds();
    }, 15000); // Every 15 seconds

    setInterval(async () => {
      await this.updatePredictiveModels();
    }, 60000); // Every minute

    console.log('📈 Scaling monitoring started');
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000); // Every 30 seconds

    console.log('⚡ Performance monitoring started');
  }

  /**
   * Start cost monitoring
   */
  startCostMonitoring() {
    setInterval(() => {
      this.updateCostMetrics();
    }, 60000); // Every minute

    console.log('💰 Cost monitoring started');
  }

  /**
   * Ensure minimum agent count
   */
  async ensureMinimumAgents() {
    const currentAgentCount = this.registry.size;

    if (currentAgentCount < this.config.minAgentInstances) {
      const agentsNeeded = this.config.minAgentInstances - currentAgentCount;

      console.log(`⚡ Ensuring minimum agents: creating ${agentsNeeded} agents`);

      for (let i = 0; i < agentsNeeded; i++) {
        await this.createAgent('general-purpose', 'minimum-requirement');
      }
    }
  }

  /**
   * Evaluate scaling needs
   */
  async evaluateScalingNeeds() {
    if (!this.config.autoScalingEnabled) {
      return;
    }

    try {
      // Get current system metrics
      const capacityMetrics = this.availabilityTracker.getCapacityMetrics();
      const healthMetrics = this.availabilityTracker.getHealthMetrics();

      // Evaluate different scaling triggers
      await this.evaluateCapacityBasedScaling(capacityMetrics);
      await this.evaluatePerformanceBasedScaling();
      await this.evaluatePredictiveScaling();
      await this.evaluateEmergencyScaling(capacityMetrics);

      // Cost-based scaling adjustments
      if (this.config.costOptimization) {
        await this.evaluateCostOptimizedScaling();
      }

    } catch (error) {
      console.error('❌ Error evaluating scaling needs:', error.message);
    }
  }

  /**
   * Evaluate capacity-based scaling
   */
  async evaluateCapacityBasedScaling(capacityMetrics) {
    const utilization = capacityMetrics.averageUtilization / 100;
    const availableAgents = capacityMetrics.availableAgents;

    // Scale up conditions
    if (utilization > 0.8 && availableAgents < 2) {
      const capability = await this.identifyHighDemandCapability();
      await this.scaleUp(capability, 'capacity-threshold', {
        utilization,
        availableAgents,
        targetCapability: capability
      });
    }

    // Scale down conditions
    if (utilization < 0.3 && this.registry.size > this.config.minAgentInstances) {
      await this.scaleDown('capacity-low', {
        utilization,
        excessCapacity: this.registry.size - this.config.minAgentInstances
      });
    }
  }

  /**
   * Evaluate performance-based scaling
   */
  async evaluatePerformanceBasedScaling() {
    if (!this.config.performanceBasedScaling) {
      return;
    }

    // Analyze agent performance
    for (const [capability, agents] of this.getAgentsByCapability()) {
      const avgEfficiency = this.calculateAverageEfficiency(agents);
      const avgResponseTime = this.calculateAverageResponseTime(agents);

      // Scale up if performance is degrading
      if (avgEfficiency < 0.7 || avgResponseTime > 20000) {
        await this.scaleUp(capability, 'performance-degradation', {
          efficiency: avgEfficiency,
          responseTime: avgResponseTime,
          agentCount: agents.length
        });
      }
    }
  }

  /**
   * Evaluate predictive scaling
   */
  async evaluatePredictiveScaling() {
    if (!this.config.predictiveScaling) {
      return;
    }

    for (const [capability, prediction] of this.predictiveEngine.demandPredictions) {
      if (prediction.confidence > 0.7) {
        const currentAgents = this.getAgentCountByCapability(capability);
        const predictedNeed = Math.ceil(prediction.predictedDemand);

        if (predictedNeed > currentAgents + 1) {
          await this.scaleUp(capability, 'predictive-demand', {
            currentAgents,
            predictedNeed,
            confidence: prediction.confidence
          });
        } else if (predictedNeed < currentAgents - 2 && currentAgents > 2) {
          await this.scaleDown('predictive-surplus', {
            capability,
            currentAgents,
            predictedNeed
          });
        }
      }
    }
  }

  /**
   * Evaluate emergency scaling
   */
  async evaluateEmergencyScaling(capacityMetrics) {
    const utilization = capacityMetrics.averageUtilization / 100;
    const failedAgents = capacityMetrics.failedAgents;
    const overloadedAgents = capacityMetrics.overloadedAgents;

    // Emergency conditions
    if (utilization > 0.95 || overloadedAgents > 2 || failedAgents > 1) {
      await this.emergencyScale({
        utilization,
        failedAgents,
        overloadedAgents,
        severity: this.calculateEmergencySeverity(utilization, failedAgents, overloadedAgents)
      });
    }
  }

  /**
   * Evaluate cost-optimized scaling
   */
  async evaluateCostOptimizedScaling() {
    const costEfficiency = this.calculateSystemCostEfficiency();

    // Scale down expensive, underutilized agents
    if (costEfficiency < 0.6) {
      const expensiveAgents = this.identifyExpensiveUnderutilizedAgents();

      for (const agent of expensiveAgents.slice(0, 2)) {
        await this.decommissionAgent(agent.id, 'cost-optimization');
      }
    }
  }

  /**
   * Scale up agents
   */
  async scaleUp(capability, reason, context = {}) {
    // Check cooldown
    if (!this.canScaleUp()) {
      console.log('⏳ Scale-up on cooldown');
      return false;
    }

    // Check limits
    if (this.registry.size >= this.config.maxAgentInstances) {
      console.warn('⚠️ Cannot scale up - maximum agent limit reached');
      return false;
    }

    try {
      console.log(`📈 Scaling up: ${capability} (${reason})`);

      // Determine number of agents to create
      const agentsToCreate = this.calculateScaleUpCount(capability, reason, context);

      const createdAgents = [];

      for (let i = 0; i < agentsToCreate; i++) {
        const agent = await this.createAgent(capability, reason, context);
        if (agent) {
          createdAgents.push(agent);
        }
      }

      // Update metrics
      this.scalingMetrics.totalScalingOperations++;
      this.scalingMetrics.successfulScaleUps++;
      this.scalingMetrics.lastScalingOperation = {
        action: 'scale-up',
        capability,
        reason,
        agentsCreated: createdAgents.length,
        timestamp: Date.now(),
        context
      };

      // Add to history
      this.scalingMetrics.scalingHistory.push(this.scalingMetrics.lastScalingOperation);
      if (this.scalingMetrics.scalingHistory.length > 100) {
        this.scalingMetrics.scalingHistory.shift();
      }

      console.log(`✅ Scale-up completed: created ${createdAgents.length} ${capability} agents`);

      this.emit('scaled-up', {
        capability,
        reason,
        agentsCreated: createdAgents.length,
        totalAgents: this.registry.size,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      console.error(`❌ Scale-up failed for ${capability}:`, error.message);
      this.scalingMetrics.failedScalingOperations++;
      return false;
    }
  }

  /**
   * Scale down agents
   */
  async scaleDown(reason, context = {}) {
    // Check cooldown
    if (!this.canScaleDown()) {
      console.log('⏳ Scale-down on cooldown');
      return false;
    }

    // Check minimum limits
    if (this.registry.size <= this.config.minAgentInstances) {
      return false;
    }

    try {
      console.log(`📉 Scaling down (${reason})`);

      // Identify agents to remove
      const agentsToRemove = this.identifyAgentsForRemoval(context);
      const removedAgents = [];

      for (const agent of agentsToRemove) {
        if (await this.decommissionAgent(agent.id, reason)) {
          removedAgents.push(agent);
        }
      }

      // Update metrics
      this.scalingMetrics.totalScalingOperations++;
      this.scalingMetrics.successfulScaleDowns++;
      this.scalingMetrics.lastScalingOperation = {
        action: 'scale-down',
        reason,
        agentsRemoved: removedAgents.length,
        timestamp: Date.now(),
        context
      };

      console.log(`✅ Scale-down completed: removed ${removedAgents.length} agents`);

      this.emit('scaled-down', {
        reason,
        agentsRemoved: removedAgents.length,
        totalAgents: this.registry.size,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      console.error(`❌ Scale-down failed:`, error.message);
      this.scalingMetrics.failedScalingOperations++;
      return false;
    }
  }

  /**
   * Emergency scaling
   */
  async emergencyScale(context) {
    console.warn('🚨 EMERGENCY SCALING ACTIVATED');

    this.scalingMetrics.emergencyScalingEvents++;

    // Create multiple agents quickly
    const emergencyCapabilities = ['general-purpose', 'content-creation'];
    const agentsPerCapability = Math.ceil(this.config.emergencyScalingMultiplier);

    const emergencyPromises = [];

    for (const capability of emergencyCapabilities) {
      for (let i = 0; i < agentsPerCapability; i++) {
        emergencyPromises.push(this.createAgent(capability, 'emergency-scaling', context));
      }
    }

    try {
      const results = await Promise.allSettled(emergencyPromises);
      const successfulCreations = results.filter(r => r.status === 'fulfilled' && r.value).length;

      console.warn(`🚨 Emergency scaling completed: ${successfulCreations} agents created`);

      this.emit('emergency-scaling-completed', {
        agentsCreated: successfulCreations,
        severity: context.severity,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Emergency scaling failed:', error.message);
    }
  }

  /**
   * Create a new agent
   */
  async createAgent(capability, reason, context = {}) {
    try {
      const template = this.agentTemplates.get(capability);
      if (!template) {
        throw new Error(`Unknown capability template: ${capability}`);
      }

      // Generate unique agent ID
      const agentId = this.generateAgentId(capability);

      // Create agent configuration
      const agentConfig = {
        id: agentId,
        name: `Dynamic ${capability} Agent`,
        ...template.baseConfig,
        source: 'dynamic-registry',
        dynamicallyCreated: true,
        createdBy: reason,
        creationContext: context
      };

      // Register with availability tracker
      await this.availabilityTracker.registerAgent(agentConfig);

      // Create registry entry
      const registryEntry = {
        id: agentId,
        source: 'dynamic',
        template: capability,
        instance: agentConfig,
        lifecycle: {
          created: Date.now(),
          lastActivity: Date.now(),
          totalUptime: 0,
          scalingEvents: [{
            event: 'created',
            reason,
            timestamp: Date.now(),
            context
          }]
        },
        performance: {
          efficiency: 1.0,
          throughput: 0,
          resourceUsage: template.scalingProfile.resourceIntensity,
          qualityScore: 1.0
        },
        cost: {
          hourlyRate: template.scalingProfile.costPerHour,
          totalCost: 0,
          costEfficiency: 1.0
        },
        metadata: {
          isVirtual: true,
          canScale: true,
          priority: template.scalingProfile.priority,
          tags: [reason, capability],
          expiresAt: Date.now() + this.config.agentLifespanLimit
        }
      };

      this.registry.set(agentId, registryEntry);

      // Update cost tracking
      this.updateCostProjections(registryEntry);

      console.log(`🤖 Created dynamic agent: ${agentId} (${capability})`);

      this.emit('agent-created', {
        agentId,
        capability,
        reason,
        template: capability,
        timestamp: Date.now()
      });

      return agentConfig;

    } catch (error) {
      console.error(`❌ Failed to create ${capability} agent:`, error.message);
      return null;
    }
  }

  /**
   * Decommission an agent
   */
  async decommissionAgent(agentId, reason) {
    try {
      const registryEntry = this.registry.get(agentId);
      if (!registryEntry) {
        return false;
      }

      // Check if agent can be safely removed
      if (!this.canDecommissionAgent(registryEntry)) {
        return false;
      }

      // Graceful shutdown - wait for current tasks to complete
      await this.gracefulAgentShutdown(agentId);

      // Remove from availability tracker
      await this.availabilityTracker.deactivateAgent?.(agentId, reason);

      // Update registry entry
      registryEntry.lifecycle.scalingEvents.push({
        event: 'decommissioned',
        reason,
        timestamp: Date.now()
      });

      // Calculate final metrics
      const uptime = Date.now() - registryEntry.lifecycle.created;
      registryEntry.lifecycle.totalUptime = uptime;

      // Remove from registry
      this.registry.delete(agentId);

      console.log(`🗑️ Decommissioned agent: ${agentId} (${reason})`);

      this.emit('agent-decommissioned', {
        agentId,
        reason,
        uptime,
        template: registryEntry.template,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      console.error(`❌ Failed to decommission agent ${agentId}:`, error.message);
      return false;
    }
  }

  /**
   * Graceful agent shutdown
   */
  async gracefulAgentShutdown(agentId) {
    const agent = this.availabilityTracker.getAgent(agentId);

    if (agent && agent.currentLoad > 0) {
      console.log(`⏳ Waiting for agent ${agentId} to complete ${agent.currentLoad} tasks`);

      // Wait up to 2 minutes for tasks to complete
      const maxWait = 120000;
      const startTime = Date.now();

      while (agent.currentLoad > 0 && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (agent.currentLoad > 0) {
        console.warn(`⚠️ Agent ${agentId} still has ${agent.currentLoad} tasks - forcing shutdown`);
      }
    }
  }

  /**
   * Check if agent can be decommissioned
   */
  canDecommissionAgent(registryEntry) {
    // Don't remove critical agents
    if (registryEntry.metadata.priority === 'critical') {
      return false;
    }

    // Don't remove recently created agents
    const agentAge = Date.now() - registryEntry.lifecycle.created;
    if (agentAge < 300000) { // 5 minutes
      return false;
    }

    // Don't remove high-performing agents
    if (registryEntry.performance.efficiency > 0.9) {
      return false;
    }

    return true;
  }

  // Helper methods and utilities

  generateAgentId(capability) {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `dyn-${capability}-${timestamp}-${random}`;
  }

  canScaleUp() {
    const lastScaling = this.scalingMetrics.lastScalingOperation;
    if (!lastScaling || lastScaling.action !== 'scale-up') {
      return true;
    }
    return (Date.now() - lastScaling.timestamp) > this.config.scaleUpCooldown;
  }

  canScaleDown() {
    const lastScaling = this.scalingMetrics.lastScalingOperation;
    if (!lastScaling || lastScaling.action !== 'scale-down') {
      return true;
    }
    return (Date.now() - lastScaling.timestamp) > this.config.scaleDownCooldown;
  }

  calculateScaleUpCount(capability, reason, context) {
    if (reason === 'emergency-scaling') {
      return Math.ceil(this.config.emergencyScalingMultiplier);
    }

    if (reason === 'predictive-demand' && context.confidence > 0.8) {
      return Math.min(3, Math.ceil(context.predictedNeed - context.currentAgents));
    }

    // Default scale-up is 1-2 agents
    return context.utilization > 0.9 ? 2 : 1;
  }

  async identifyHighDemandCapability() {
    // Analyze current demand patterns
    const demandScores = new Map();

    for (const capability of this.agentTemplates.keys()) {
      const agents = this.getAgentsByCapability().get(capability) || [];
      const utilization = this.calculateCapabilityUtilization(agents);
      const queueLength = this.estimateCapabilityQueueLength(capability);

      demandScores.set(capability, utilization + queueLength * 0.5);
    }

    // Return capability with highest demand
    return Array.from(demandScores.entries())
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  calculateCapabilityUtilization(agents) {
    if (agents.length === 0) return 0;

    const totalLoad = agents.reduce((sum, agent) => {
      const agentData = this.availabilityTracker.getAgent(agent.id);
      return sum + (agentData ? agentData.currentLoad : 0);
    }, 0);

    const totalCapacity = agents.reduce((sum, agent) => {
      const agentData = this.availabilityTracker.getAgent(agent.id);
      return sum + (agentData ? agentData.maxConcurrentTasks : 3);
    }, 0);

    return totalCapacity > 0 ? totalLoad / totalCapacity : 0;
  }

  estimateCapabilityQueueLength(capability) {
    // This would integrate with request queue if available
    // For now, return estimated queue length based on system load
    const capacityMetrics = this.availabilityTracker.getCapacityMetrics();
    return Math.max(0, capacityMetrics.currentLoad - 50) / 10;
  }

  getAgentsByCapability() {
    const capabilityMap = new Map();

    for (const [agentId, entry] of this.registry) {
      const capability = entry.template;
      if (!capabilityMap.has(capability)) {
        capabilityMap.set(capability, []);
      }
      capabilityMap.get(capability).push(entry);
    }

    return capabilityMap;
  }

  getAgentCountByCapability(capability) {
    return Array.from(this.registry.values())
      .filter(entry => entry.template === capability).length;
  }

  calculateAverageEfficiency(agents) {
    if (agents.length === 0) return 1.0;

    const totalEfficiency = agents.reduce((sum, agent) => {
      return sum + agent.performance.efficiency;
    }, 0);

    return totalEfficiency / agents.length;
  }

  calculateAverageResponseTime(agents) {
    if (agents.length === 0) return 0;

    const totalTime = agents.reduce((sum, agent) => {
      const agentData = this.availabilityTracker.getAgent(agent.id);
      return sum + (agentData ? agentData.averageResponseTime : 12000);
    }, 0);

    return totalTime / agents.length;
  }

  calculateEmergencySeverity(utilization, failedAgents, overloadedAgents) {
    let severity = 0;

    severity += Math.max(0, (utilization - 0.8) * 5); // 0-1 points
    severity += failedAgents * 0.3; // 0.3 points per failed agent
    severity += overloadedAgents * 0.2; // 0.2 points per overloaded agent

    if (severity > 1.5) return 'critical';
    if (severity > 0.8) return 'high';
    if (severity > 0.4) return 'medium';
    return 'low';
  }

  calculateSystemCostEfficiency() {
    let totalCost = 0;
    let totalValue = 0;

    for (const [, entry] of this.registry) {
      totalCost += entry.cost.hourlyRate;
      totalValue += entry.performance.efficiency * entry.performance.throughput;
    }

    return totalCost > 0 ? totalValue / totalCost : 1.0;
  }

  identifyExpensiveUnderutilizedAgents() {
    return Array.from(this.registry.values())
      .filter(entry => {
        const agent = this.availabilityTracker.getAgent(entry.id);
        const utilization = agent ? agent.utilizationPercentage : 0;
        return entry.cost.hourlyRate > 0.08 && utilization < 30;
      })
      .sort((a, b) => b.cost.hourlyRate - a.cost.hourlyRate);
  }

  identifyAgentsForRemoval(context) {
    // Select agents for removal based on multiple factors
    const candidates = Array.from(this.registry.values())
      .filter(entry => this.canDecommissionAgent(entry));

    // Sort by removal priority (lowest performing, highest cost, least utilized)
    return candidates
      .sort((a, b) => {
        const scoreA = this.calculateRemovalScore(a);
        const scoreB = this.calculateRemovalScore(b);
        return scoreA - scoreB; // Lower score = higher removal priority
      })
      .slice(0, Math.min(2, candidates.length));
  }

  calculateRemovalScore(entry) {
    let score = 0;

    // Performance factor (higher performance = higher score)
    score += entry.performance.efficiency * 40;

    // Cost factor (higher cost = lower score)
    score -= entry.cost.hourlyRate * 50;

    // Utilization factor (higher utilization = higher score)
    const agent = this.availabilityTracker.getAgent(entry.id);
    if (agent) {
      score += agent.utilizationPercentage * 0.3;
    }

    // Age factor (newer agents = higher score)
    const age = Date.now() - entry.lifecycle.created;
    score += Math.max(0, 10 - (age / 60000)); // 10 points for new, 0 for 10+ minutes old

    return score;
  }

  updatePerformanceMetrics() {
    for (const [agentId, entry] of this.registry) {
      const agent = this.availabilityTracker.getAgent(agentId);

      if (agent) {
        // Update efficiency
        entry.performance.efficiency = agent.successRate || 1.0;

        // Update throughput (tasks per minute)
        const recentTasks = agent.totalTasks || 0;
        const uptime = (Date.now() - entry.lifecycle.created) / 60000; // minutes
        entry.performance.throughput = uptime > 0 ? recentTasks / uptime : 0;

        // Update quality score based on success rate and response time
        const responseTimeFactor = Math.max(0, 1 - (agent.averageResponseTime - 10000) / 20000);
        entry.performance.qualityScore = (agent.successRate * 0.7) + (responseTimeFactor * 0.3);
      }
    }
  }

  updateCostMetrics() {
    let totalHourlyRate = 0;
    let totalCost = 0;

    for (const [, entry] of this.registry) {
      const uptime = (Date.now() - entry.lifecycle.created) / 3600000; // hours
      const agentCost = entry.cost.hourlyRate * uptime;

      entry.cost.totalCost = agentCost;
      entry.cost.costEfficiency = entry.performance.throughput > 0
        ? entry.performance.throughput / entry.cost.hourlyRate
        : 0;

      totalHourlyRate += entry.cost.hourlyRate;
      totalCost += agentCost;
    }

    this.costManager.hourlyRate = totalHourlyRate;
    this.costManager.totalCost = totalCost;
    this.costManager.lastCostAnalysis = Date.now();
  }

  updateCostProjections(registryEntry) {
    const capability = registryEntry.template;

    if (!this.costManager.costPerCapability.has(capability)) {
      this.costManager.costPerCapability.set(capability, 0);
    }

    const currentCost = this.costManager.costPerCapability.get(capability);
    this.costManager.costPerCapability.set(capability, currentCost + registryEntry.cost.hourlyRate);
  }

  async updatePredictiveModels() {
    if (!this.predictiveEngine.learningEnabled) {
      return;
    }

    // Update demand predictions based on current system state
    const capacityMetrics = this.availabilityTracker.getCapacityMetrics();

    for (const [capability, prediction] of this.predictiveEngine.demandPredictions) {
      const currentAgents = this.getAgentCountByCapability(capability);
      const utilization = this.calculateCapabilityUtilization(
        this.getAgentsByCapability().get(capability) || []
      );

      // Simple prediction model - can be enhanced with ML
      const trend = utilization > 0.7 ? 'increasing' : utilization < 0.3 ? 'decreasing' : 'stable';

      let predictedDemand = currentAgents;
      if (trend === 'increasing') {
        predictedDemand = Math.ceil(currentAgents * 1.3);
      } else if (trend === 'decreasing') {
        predictedDemand = Math.max(1, Math.floor(currentAgents * 0.8));
      }

      prediction.currentDemand = utilization;
      prediction.predictedDemand = predictedDemand;
      prediction.trend = trend;
      prediction.confidence = Math.min(0.9, prediction.confidence + 0.1);
      prediction.lastUpdate = Date.now();
    }

    this.predictiveEngine.lastPredictionUpdate = Date.now();
  }

  // Public API methods

  getRegistryStatus() {
    return {
      totalAgents: this.registry.size,
      agentsByCapability: Object.fromEntries(
        Array.from(this.agentTemplates.keys()).map(capability => [
          capability,
          this.getAgentCountByCapability(capability)
        ])
      ),
      scalingMetrics: this.scalingMetrics,
      costMetrics: {
        totalCost: this.costManager.totalCost,
        hourlyRate: this.costManager.hourlyRate,
        costPerCapability: Object.fromEntries(this.costManager.costPerCapability)
      },
      configuration: this.config,
      lastUpdate: Date.now()
    };
  }

  getAgentDetails(agentId) {
    const entry = this.registry.get(agentId);
    if (!entry) {
      return null;
    }

    return {
      registry: entry,
      availability: this.availabilityTracker.getAgentDetails(agentId),
      template: this.agentTemplates.get(entry.template)
    };
  }

  getPredictiveInsights() {
    return {
      demandPredictions: Object.fromEntries(this.predictiveEngine.demandPredictions),
      loadPatterns: Object.fromEntries(this.predictiveEngine.loadPatterns),
      predictionAccuracy: this.predictiveEngine.predictionAccuracy,
      lastUpdate: this.predictiveEngine.lastPredictionUpdate
    };
  }

  getPerformanceAnalysis() {
    const analysis = {
      systemEfficiency: this.calculateSystemCostEfficiency(),
      capabilityPerformance: {},
      scalingEffectiveness: 0,
      recommendations: []
    };

    // Analyze performance by capability
    for (const [capability, agents] of this.getAgentsByCapability()) {
      analysis.capabilityPerformance[capability] = {
        agentCount: agents.length,
        averageEfficiency: this.calculateAverageEfficiency(agents),
        averageResponseTime: this.calculateAverageResponseTime(agents),
        utilization: this.calculateCapabilityUtilization(agents)
      };
    }

    // Calculate scaling effectiveness
    const recentScaling = this.scalingMetrics.scalingHistory.slice(-10);
    const successfulScaling = recentScaling.filter(op => true); // Assume successful if in history
    analysis.scalingEffectiveness = recentScaling.length > 0
      ? successfulScaling.length / recentScaling.length
      : 1.0;

    // Generate recommendations
    analysis.recommendations = this.generateOptimizationRecommendations(analysis);

    return analysis;
  }

  generateOptimizationRecommendations(analysis) {
    const recommendations = [];

    // Cost optimization recommendations
    if (this.costManager.hourlyRate > 5.0) {
      recommendations.push({
        type: 'cost-optimization',
        priority: 'medium',
        description: 'Consider scaling down expensive, underutilized agents',
        action: 'Review agent utilization and decommission low-performing agents'
      });
    }

    // Performance optimization recommendations
    for (const [capability, metrics] of Object.entries(analysis.capabilityPerformance)) {
      if (metrics.averageEfficiency < 0.7) {
        recommendations.push({
          type: 'performance-optimization',
          priority: 'high',
          description: `${capability} agents showing low efficiency`,
          action: `Scale up ${capability} agents or optimize existing ones`
        });
      }

      if (metrics.utilization > 0.8) {
        recommendations.push({
          type: 'capacity-scaling',
          priority: 'high',
          description: `${capability} agents at high utilization`,
          action: `Consider scaling up ${capability} agents`
        });
      }
    }

    // Scaling effectiveness recommendations
    if (analysis.scalingEffectiveness < 0.8) {
      recommendations.push({
        type: 'scaling-optimization',
        priority: 'medium',
        description: 'Scaling operations showing suboptimal effectiveness',
        action: 'Review scaling thresholds and cooldown periods'
      });
    }

    return recommendations;
  }

  async manualScale(capability, action, count = 1) {
    if (action === 'up') {
      return await this.scaleUp(capability, 'manual-request', { requestedCount: count });
    } else if (action === 'down') {
      return await this.scaleDown('manual-request', { capability, requestedCount: count });
    }

    return false;
  }

  async updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ DynamicAgentRegistry configuration updated');

    // Apply configuration changes
    if (newConfig.autoScalingEnabled !== undefined) {
      console.log(`🔧 Auto-scaling ${newConfig.autoScalingEnabled ? 'enabled' : 'disabled'}`);
    }

    if (newConfig.minAgentInstances || newConfig.maxAgentInstances) {
      await this.ensureMinimumAgents();
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialization already done in constructor, just mark as initialized
      this.isInitialized = true;
      console.log('✅ DynamicAgentRegistry fully initialized');

    } catch (error) {
      console.error('❌ Failed to initialize DynamicAgentRegistry:', error);
      throw error;
    }
  }

  async getHealthStatus() {
    return {
      status: this.registry.size > 0 ? 'healthy' : 'warning',
      totalAgents: this.registry.size,
      agentsByCapability: Object.fromEntries(
        Array.from(this.agentTemplates.keys()).map(capability => [
          capability,
          this.getAgentCountByCapability(capability)
        ])
      ),
      scalingMetrics: this.scalingMetrics,
      costMetrics: {
        hourlyRate: this.costManager.hourlyRate,
        totalCost: this.costManager.totalCost
      }
    };
  }

  async getAgentCount() {
    return this.registry.size;
  }

  async emergencyScale(request = {}) {
    console.log('🚨 Emergency scaling triggered');
    const capability = request.capability || 'general';
    return await this.scaleUp(capability, 'emergency-scaling', {
      urgency: 'critical',
      requestId: request.id
    });
  }

  async optimizeForSpeed() {
    console.log('⚡ Optimizing registry for speed');
    // Identify fastest agents and scale them
    const highPerformanceAgents = Array.from(this.registry.values())
      .filter(entry => entry.performance.efficiency > 0.8)
      .sort((a, b) => b.performance.throughput - a.performance.throughput);

    if (highPerformanceAgents.length > 0) {
      const bestCapability = highPerformanceAgents[0].template;
      await this.scaleUp(bestCapability, 'speed-optimization', { count: 2 });
    }
  }

  async shutdown() {
    console.log('🛑 DynamicAgentRegistry shutting down...');

    // Gracefully decommission all dynamic agents
    const dynamicAgents = Array.from(this.registry.values())
      .filter(entry => entry.source === 'dynamic');

    for (const entry of dynamicAgents) {
      await this.decommissionAgent(entry.id, 'system-shutdown');
    }

    this.removeAllListeners();
    console.log('✅ DynamicAgentRegistry shutdown complete');
  }
}

module.exports = DynamicAgentRegistry;