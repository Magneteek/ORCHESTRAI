// Agent Availability Tracker - Real-time monitoring and capacity management
// Provides dynamic agent discovery, health monitoring, and intelligent capacity scaling

const EventEmitter = require('events');

class AgentAvailabilityTracker extends EventEmitter {
  constructor(mcpManager, crystallineMemory, dynamicAgentSelection) {
    super();

    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.dynamicAgentSelection = dynamicAgentSelection;

    // Tracking configuration
    this.config = {
      healthCheckInterval: 15000,        // 15 seconds between health checks
      capacityCheckInterval: 10000,     // 10 seconds between capacity assessments
      agentTimeoutThreshold: 45000,     // 45 seconds before marking agent as unavailable
      performanceWindowSize: 50,        // Track last 50 operations per agent
      autoScalingEnabled: true,          // Enable automatic agent scaling
      minAgentCapacity: 4,              // Minimum concurrent agents
      maxAgentCapacity: 32,             // Maximum concurrent agents
      scaleUpThreshold: 0.8,            // Scale up when 80% capacity utilized
      scaleDownThreshold: 0.3,          // Scale down when below 30% utilization
      emergencyScalingThreshold: 0.95,  // Emergency scaling at 95% capacity
      agentDiscoveryInterval: 30000,    // 30 seconds between agent discovery
      performanceAnalysisDepth: 100     // Analyze last 100 performance records
    };

    // Agent registry with real-time status
    this.agentRegistry = new Map();

    // Agent capabilities mapping
    this.capabilityMap = new Map();

    // Performance tracking
    this.performanceMetrics = new Map();

    // Capacity management
    this.capacityMetrics = {
      totalAgents: 0,
      availableAgents: 0,
      busyAgents: 0,
      overloadedAgents: 0,
      failedAgents: 0,
      averageUtilization: 0,
      peakUtilization: 0,
      currentLoad: 0,
      predictedLoad: 0,
      lastScalingAction: null,
      scalingHistory: []
    };

    // Health monitoring
    this.healthMetrics = {
      totalHealthChecks: 0,
      failedHealthChecks: 0,
      averageResponseTime: 0,
      healthyAgents: 0,
      degradedAgents: 0,
      criticalAgents: 0,
      lastFullHealthCheck: null,
      healthTrends: []
    };

    // Real-time monitoring intervals
    this.intervals = {
      healthCheck: null,
      capacityCheck: null,
      agentDiscovery: null,
      performanceAnalysis: null
    };

    // Agent lifecycle tracking
    this.lifecycleEvents = {
      discovered: 0,
      activated: 0,
      deactivated: 0,
      failed: 0,
      recovered: 0,
      scaled: 0
    };

    // Specialized agent pools
    this.agentPools = {
      'content-creation': new Set(),
      'seo-optimization': new Set(),
      'web-development': new Set(),
      'research-analysis': new Set(),
      'general-purpose': new Set(),
      'emergency-pool': new Set()
    };

    // Initialization state
    this.isInitialized = false;

    console.log('📊 AgentAvailabilityTracker initialized - Real-time monitoring active');

    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring systems
   */
  async initializeMonitoring() {
    try {
      // Discover existing agents
      await this.discoverAgents();

      // Start monitoring intervals
      this.startHealthMonitoring();
      this.startCapacityMonitoring();
      this.startAgentDiscovery();
      this.startPerformanceAnalysis();

      // Initialize agent pools
      await this.categorizeAgentsByCapability();

      console.log('✅ Agent monitoring systems initialized');
      console.log(`📈 Tracking ${this.agentRegistry.size} agents across ${Object.keys(this.agentPools).length} capability pools`);

      this.emit('monitoring-initialized', {
        totalAgents: this.agentRegistry.size,
        pools: Object.keys(this.agentPools).length,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Failed to initialize agent monitoring:', error.message);
      throw error;
    }
  }

  /**
   * Discover available agents
   */
  async discoverAgents() {
    console.log('🔍 Discovering available agents...');

    try {
      // Get MCP server status
      const mcpStatus = await this.mcpManager.getHealthStatus();

      // Register MCP-based agents
      Object.entries(mcpStatus).forEach(([serverName, status]) => {
        if (status.status === 'healthy') {
          this.registerAgent({
            id: `mcp-${serverName}`,
            name: serverName,
            type: 'mcp-server',
            capabilities: status.capabilities || ['general'],
            source: 'mcp-manager',
            healthStatus: 'healthy',
            lastSeen: Date.now()
          });
        }
      });

      // Discover Claude Code specialized agents
      const claudeCodeAgents = this.getClaudeCodeAgents();
      claudeCodeAgents.forEach(agent => this.registerAgent(agent));

      // Get agents from dynamic selection if available
      if (this.dynamicAgentSelection) {
        const registeredAgents = await this.dynamicAgentSelection.getAllAgents?.() || [];
        registeredAgents.forEach(agent => this.registerAgent(agent));
      }

      this.updateCapacityMetrics();
      this.lifecycleEvents.discovered += this.agentRegistry.size;

      console.log(`✅ Discovered ${this.agentRegistry.size} agents`);

    } catch (error) {
      console.error('❌ Agent discovery failed:', error.message);
    }
  }

  /**
   * Get Claude Code specialized agents
   */
  getClaudeCodeAgents() {
    return [
      {
        id: 'content-writer-specialist',
        name: 'Content Writer Specialist',
        type: 'claude-code',
        capabilities: ['content-creation', 'copywriting', 'article-writing'],
        specialization: 'content',
        maxConcurrentTasks: 3,
        averageResponseTime: 15000,
        source: 'claude-code'
      },
      {
        id: 'seo-keyword-research',
        name: 'SEO Keyword Research',
        type: 'claude-code',
        capabilities: ['seo-analysis', 'keyword-research', 'competitor-analysis'],
        specialization: 'seo',
        maxConcurrentTasks: 4,
        averageResponseTime: 10000,
        source: 'claude-code'
      },
      {
        id: 'seo-content-optimization',
        name: 'SEO Content Optimization',
        type: 'claude-code',
        capabilities: ['seo-optimization', 'content-optimization'],
        specialization: 'seo',
        maxConcurrentTasks: 3,
        averageResponseTime: 12000,
        source: 'claude-code'
      },
      {
        id: 'content-outline-architect',
        name: 'Content Outline Architect',
        type: 'claude-code',
        capabilities: ['content-strategy', 'outline-creation', 'structure-planning'],
        specialization: 'content',
        maxConcurrentTasks: 4,
        averageResponseTime: 8000,
        source: 'claude-code'
      },
      {
        id: 'general-purpose',
        name: 'General Purpose Agent',
        type: 'claude-code',
        capabilities: ['general', 'research', 'analysis', 'basic-tasks'],
        specialization: 'general',
        maxConcurrentTasks: 6,
        averageResponseTime: 12000,
        source: 'claude-code'
      },
      {
        id: 'multi-language-content-adapter',
        name: 'Multi-Language Content Adapter',
        type: 'claude-code',
        capabilities: ['translation', 'localization', 'cultural-adaptation'],
        specialization: 'multilingual',
        maxConcurrentTasks: 2,
        averageResponseTime: 18000,
        source: 'claude-code'
      }
    ];
  }

  /**
   * Register an agent in the tracking system
   */
  registerAgent(agentData) {
    const agentId = agentData.id;
    const timestamp = Date.now();

    const agent = {
      id: agentId,
      name: agentData.name || agentId,
      type: agentData.type || 'unknown',
      capabilities: Array.isArray(agentData.capabilities) ? agentData.capabilities : ['general'],
      specialization: agentData.specialization || 'general',
      source: agentData.source || 'unknown',

      // Availability tracking
      status: 'available',
      lastSeen: timestamp,
      lastHealthCheck: timestamp,
      healthStatus: 'unknown',

      // Capacity tracking
      currentLoad: 0,
      maxConcurrentTasks: agentData.maxConcurrentTasks || 3,
      averageResponseTime: agentData.averageResponseTime || 10000,
      utilizationPercentage: 0,

      // Performance tracking
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      totalProcessingTime: 0,
      successRate: 1.0,

      // Metadata
      registeredAt: timestamp,
      lastTaskAssignment: null,
      consecutiveFailures: 0,
      performanceHistory: [],

      // Real-time status
      isHealthy: true,
      isDegraded: false,
      isCritical: false,
      isOverloaded: false,
      emergencyStop: false
    };

    this.agentRegistry.set(agentId, agent);

    // Initialize performance tracking
    this.performanceMetrics.set(agentId, {
      recentTasks: [],
      averageResponseTime: agent.averageResponseTime,
      throughput: 0,
      errorRate: 0,
      lastUpdate: timestamp
    });

    // Add to capability pools
    this.addToCapabilityPools(agent);

    console.log(`📝 Agent registered: ${agentId} (${agent.capabilities.join(', ')})`);

    this.emit('agent-registered', {
      agentId,
      agent,
      timestamp
    });
  }

  /**
   * Add agent to appropriate capability pools
   */
  addToCapabilityPools(agent) {
    // Add to specific capability pools
    agent.capabilities.forEach(capability => {
      if (capability.includes('content') || capability.includes('writing')) {
        this.agentPools['content-creation'].add(agent.id);
      } else if (capability.includes('seo') || capability.includes('keyword')) {
        this.agentPools['seo-optimization'].add(agent.id);
      } else if (capability.includes('web') || capability.includes('frontend')) {
        this.agentPools['web-development'].add(agent.id);
      } else if (capability.includes('research') || capability.includes('analysis')) {
        this.agentPools['research-analysis'].add(agent.id);
      }
    });

    // Always add to general purpose pool
    this.agentPools['general-purpose'].add(agent.id);

    // Add high-capacity agents to emergency pool
    if (agent.maxConcurrentTasks >= 4) {
      this.agentPools['emergency-pool'].add(agent.id);
    }
  }

  /**
   * Categorize agents by capability
   */
  async categorizeAgentsByCapability() {
    for (const [agentId, agent] of this.agentRegistry) {
      // Update capability mapping
      agent.capabilities.forEach(capability => {
        if (!this.capabilityMap.has(capability)) {
          this.capabilityMap.set(capability, new Set());
        }
        this.capabilityMap.get(capability).add(agentId);
      });
    }

    console.log(`🏷️ Categorized agents into ${this.capabilityMap.size} capability groups`);
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.intervals.healthCheck = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    console.log('💚 Health monitoring started');
  }

  /**
   * Perform health checks on all agents
   */
  async performHealthChecks() {
    const startTime = Date.now();
    const healthCheckPromises = [];

    console.log(`🔍 Performing health checks on ${this.agentRegistry.size} agents...`);

    for (const [agentId, agent] of this.agentRegistry) {
      healthCheckPromises.push(this.checkAgentHealth(agentId, agent));
    }

    try {
      const results = await Promise.allSettled(healthCheckPromises);

      // Process health check results
      let healthyCount = 0;
      let degradedCount = 0;
      let criticalCount = 0;
      let totalResponseTime = 0;

      results.forEach((result, index) => {
        const agentId = Array.from(this.agentRegistry.keys())[index];

        if (result.status === 'fulfilled') {
          const healthData = result.value;
          const agent = this.agentRegistry.get(agentId);

          agent.healthStatus = healthData.status;
          agent.lastHealthCheck = Date.now();
          agent.isHealthy = healthData.status === 'healthy';
          agent.isDegraded = healthData.status === 'degraded';
          agent.isCritical = healthData.status === 'critical';

          totalResponseTime += healthData.responseTime || 0;

          switch (healthData.status) {
            case 'healthy':
              healthyCount++;
              agent.consecutiveFailures = 0;
              break;
            case 'degraded':
              degradedCount++;
              break;
            case 'critical':
              criticalCount++;
              agent.consecutiveFailures++;
              break;
          }

          // Update agent status based on health
          this.updateAgentStatusFromHealth(agent, healthData);

        } else {
          // Health check failed
          const agent = this.agentRegistry.get(agentId);
          agent.healthStatus = 'unknown';
          agent.consecutiveFailures++;

          if (agent.consecutiveFailures >= 3) {
            agent.status = 'unavailable';
            agent.isCritical = true;
          }
        }
      });

      // Update health metrics
      this.healthMetrics.totalHealthChecks += results.length;
      this.healthMetrics.failedHealthChecks += results.filter(r => r.status === 'rejected').length;
      this.healthMetrics.healthyAgents = healthyCount;
      this.healthMetrics.degradedAgents = degradedCount;
      this.healthMetrics.criticalAgents = criticalCount;
      this.healthMetrics.averageResponseTime = results.length > 0 ? totalResponseTime / results.length : 0;
      this.healthMetrics.lastFullHealthCheck = Date.now();

      // Add to health trends
      this.healthMetrics.healthTrends.push({
        timestamp: Date.now(),
        healthy: healthyCount,
        degraded: degradedCount,
        critical: criticalCount,
        totalResponseTime
      });

      // Keep only recent trends
      if (this.healthMetrics.healthTrends.length > 100) {
        this.healthMetrics.healthTrends.shift();
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Health checks completed in ${duration}ms - Healthy: ${healthyCount}, Degraded: ${degradedCount}, Critical: ${criticalCount}`);

      this.emit('health-check-completed', {
        duration,
        healthy: healthyCount,
        degraded: degradedCount,
        critical: criticalCount,
        totalAgents: this.agentRegistry.size
      });

      // Trigger scaling if needed
      await this.evaluateScalingNeeds();

    } catch (error) {
      console.error('❌ Health check batch failed:', error.message);
    }
  }

  /**
   * Check individual agent health
   */
  async checkAgentHealth(agentId, agent) {
    const startTime = Date.now();

    try {
      // Different health check strategies based on agent type
      let healthData;

      switch (agent.source) {
        case 'mcp-manager':
          healthData = await this.checkMCPAgentHealth(agentId, agent);
          break;
        case 'claude-code':
          healthData = await this.checkClaudeCodeAgentHealth(agentId, agent);
          break;
        default:
          healthData = await this.checkGenericAgentHealth(agentId, agent);
      }

      const responseTime = Date.now() - startTime;

      return {
        agentId,
        status: healthData.status,
        responseTime,
        details: healthData.details,
        timestamp: Date.now()
      };

    } catch (error) {
      return {
        agentId,
        status: 'critical',
        responseTime: Date.now() - startTime,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check MCP agent health
   */
  async checkMCPAgentHealth(agentId, agent) {
    try {
      const serverName = agentId.replace('mcp-', '');
      const mcpStatus = await this.mcpManager.getServerStatus(serverName);

      if (mcpStatus.status === 'running') {
        const uptime = mcpStatus.uptime || 0;
        const isHealthy = uptime > 5000; // Healthy if running for more than 5 seconds

        return {
          status: isHealthy ? 'healthy' : 'degraded',
          details: {
            uptime,
            pid: mcpStatus.pid,
            capabilities: mcpStatus.config?.capabilities || []
          }
        };
      } else {
        return {
          status: 'critical',
          details: { serverStatus: mcpStatus.status }
        };
      }

    } catch (error) {
      return {
        status: 'critical',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check Claude Code agent health
   */
  async checkClaudeCodeAgentHealth(agentId, agent) {
    // Claude Code agents are healthy if they haven't failed recently
    const recentFailures = agent.consecutiveFailures;
    const timeSinceLastTask = agent.lastTaskAssignment ? Date.now() - agent.lastTaskAssignment : 0;

    if (recentFailures === 0) {
      return {
        status: 'healthy',
        details: {
          consecutiveFailures: recentFailures,
          lastTaskAssignment: agent.lastTaskAssignment,
          successRate: agent.successRate
        }
      };
    } else if (recentFailures < 3) {
      return {
        status: 'degraded',
        details: {
          consecutiveFailures: recentFailures,
          timeSinceLastTask
        }
      };
    } else {
      return {
        status: 'critical',
        details: {
          consecutiveFailures: recentFailures,
          possibleCause: 'Multiple consecutive failures'
        }
      };
    }
  }

  /**
   * Check generic agent health
   */
  async checkGenericAgentHealth(agentId, agent) {
    const timeSinceLastSeen = Date.now() - agent.lastSeen;

    if (timeSinceLastSeen < this.config.agentTimeoutThreshold) {
      return {
        status: 'healthy',
        details: { lastSeen: agent.lastSeen }
      };
    } else {
      return {
        status: 'critical',
        details: {
          lastSeen: agent.lastSeen,
          timeout: timeSinceLastSeen
        }
      };
    }
  }

  /**
   * Update agent status based on health check
   */
  updateAgentStatusFromHealth(agent, healthData) {
    const previousStatus = agent.status;

    switch (healthData.status) {
      case 'healthy':
        if (agent.status === 'unavailable' && agent.consecutiveFailures === 0) {
          agent.status = 'available';
          this.lifecycleEvents.recovered++;
        }
        break;

      case 'degraded':
        if (agent.status === 'available') {
          agent.status = 'degraded';
        }
        break;

      case 'critical':
        agent.status = 'unavailable';
        if (previousStatus !== 'unavailable') {
          this.lifecycleEvents.failed++;
        }
        break;
    }

    // Emit status change event
    if (previousStatus !== agent.status) {
      this.emit('agent-status-changed', {
        agentId: agent.id,
        previousStatus,
        newStatus: agent.status,
        healthData,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Start capacity monitoring
   */
  startCapacityMonitoring() {
    this.intervals.capacityCheck = setInterval(() => {
      this.updateCapacityMetrics();
      this.analyzeCapacityTrends();
    }, this.config.capacityCheckInterval);

    console.log('📊 Capacity monitoring started');
  }

  /**
   * Update capacity metrics
   */
  updateCapacityMetrics() {
    let availableAgents = 0;
    let busyAgents = 0;
    let overloadedAgents = 0;
    let failedAgents = 0;
    let totalUtilization = 0;

    for (const [agentId, agent] of this.agentRegistry) {
      switch (agent.status) {
        case 'available':
          availableAgents++;
          break;
        case 'busy':
          busyAgents++;
          break;
        case 'overloaded':
          overloadedAgents++;
          break;
        case 'unavailable':
          failedAgents++;
          break;
      }

      // Calculate utilization
      if (agent.maxConcurrentTasks > 0) {
        const utilization = agent.currentLoad / agent.maxConcurrentTasks;
        agent.utilizationPercentage = utilization * 100;
        totalUtilization += utilization;
      }

      // Update agent status based on load
      if (agent.currentLoad === 0 && agent.status !== 'unavailable') {
        agent.status = 'available';
      } else if (agent.currentLoad > 0 && agent.currentLoad < agent.maxConcurrentTasks) {
        agent.status = 'busy';
      } else if (agent.currentLoad >= agent.maxConcurrentTasks) {
        agent.status = 'overloaded';
        agent.isOverloaded = true;
      }
    }

    // Update capacity metrics
    this.capacityMetrics.totalAgents = this.agentRegistry.size;
    this.capacityMetrics.availableAgents = availableAgents;
    this.capacityMetrics.busyAgents = busyAgents;
    this.capacityMetrics.overloadedAgents = overloadedAgents;
    this.capacityMetrics.failedAgents = failedAgents;
    this.capacityMetrics.averageUtilization = this.agentRegistry.size > 0 ? (totalUtilization / this.agentRegistry.size) * 100 : 0;

    // Update peak utilization
    if (this.capacityMetrics.averageUtilization > this.capacityMetrics.peakUtilization) {
      this.capacityMetrics.peakUtilization = this.capacityMetrics.averageUtilization;
    }

    // Calculate current load
    const totalCapacity = Array.from(this.agentRegistry.values())
      .filter(agent => agent.status !== 'unavailable')
      .reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);

    const currentLoad = Array.from(this.agentRegistry.values())
      .reduce((sum, agent) => sum + agent.currentLoad, 0);

    this.capacityMetrics.currentLoad = totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0;
  }

  /**
   * Analyze capacity trends and predict future needs
   */
  analyzeCapacityTrends() {
    // Simple trend analysis - can be enhanced with ML
    const recentCapacityHistory = this.capacityMetrics.scalingHistory
      .filter(event => event.timestamp > Date.now() - 300000) // Last 5 minutes
      .slice(-10); // Last 10 events

    if (recentCapacityHistory.length >= 3) {
      const utilizationTrend = recentCapacityHistory.map(event => event.utilization);
      const avgRecent = utilizationTrend.slice(-3).reduce((a, b) => a + b) / 3;
      const avgOlder = utilizationTrend.slice(0, 3).reduce((a, b) => a + b) / 3;

      if (avgRecent > avgOlder * 1.2) {
        this.capacityMetrics.predictedLoad = this.capacityMetrics.currentLoad * 1.3;
      } else if (avgRecent < avgOlder * 0.8) {
        this.capacityMetrics.predictedLoad = this.capacityMetrics.currentLoad * 0.7;
      } else {
        this.capacityMetrics.predictedLoad = this.capacityMetrics.currentLoad;
      }
    }

    // Record current state for history
    this.capacityMetrics.scalingHistory.push({
      timestamp: Date.now(),
      utilization: this.capacityMetrics.averageUtilization,
      totalAgents: this.capacityMetrics.totalAgents,
      availableAgents: this.capacityMetrics.availableAgents,
      currentLoad: this.capacityMetrics.currentLoad
    });

    // Keep history manageable
    if (this.capacityMetrics.scalingHistory.length > 200) {
      this.capacityMetrics.scalingHistory.shift();
    }
  }

  /**
   * Evaluate scaling needs
   */
  async evaluateScalingNeeds() {
    if (!this.config.autoScalingEnabled) {
      return;
    }

    const currentUtilization = this.capacityMetrics.averageUtilization / 100;
    const availableCapacity = this.capacityMetrics.availableAgents;

    // Emergency scaling
    if (currentUtilization >= this.config.emergencyScalingThreshold) {
      await this.emergencyScaleUp();
      return;
    }

    // Scale up conditions
    if (currentUtilization >= this.config.scaleUpThreshold && availableCapacity < 2) {
      await this.scaleUp('high-utilization');
      return;
    }

    // Scale down conditions
    if (currentUtilization <= this.config.scaleDownThreshold && availableCapacity > this.config.minAgentCapacity) {
      await this.scaleDown('low-utilization');
      return;
    }

    // Predictive scaling
    if (this.capacityMetrics.predictedLoad > this.config.scaleUpThreshold * 100) {
      await this.scaleUp('predictive');
    }
  }

  /**
   * Scale up agent capacity
   */
  async scaleUp(reason) {
    const currentAgents = this.capacityMetrics.totalAgents;

    if (currentAgents >= this.config.maxAgentCapacity) {
      console.warn('⚠️ Cannot scale up - maximum agent capacity reached');
      return false;
    }

    console.log(`📈 Scaling up agent capacity - Reason: ${reason}`);

    try {
      // Determine which type of agents to add
      const neededCapability = this.determineNeededCapability();

      // Create new agent instances (conceptual - implementation depends on system)
      const newAgentCount = Math.min(2, this.config.maxAgentCapacity - currentAgents);

      for (let i = 0; i < newAgentCount; i++) {
        await this.createVirtualAgent(neededCapability);
      }

      this.capacityMetrics.lastScalingAction = {
        action: 'scale-up',
        reason,
        agentsAdded: newAgentCount,
        timestamp: Date.now()
      };

      this.lifecycleEvents.scaled++;

      this.emit('agents-scaled-up', {
        reason,
        agentsAdded: newAgentCount,
        totalAgents: this.capacityMetrics.totalAgents,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      console.error('❌ Failed to scale up agents:', error.message);
      return false;
    }
  }

  /**
   * Scale down agent capacity
   */
  async scaleDown(reason) {
    const availableAgents = this.getAvailableAgents();

    if (availableAgents.length <= this.config.minAgentCapacity) {
      return false;
    }

    console.log(`📉 Scaling down agent capacity - Reason: ${reason}`);

    try {
      // Remove least utilized agents
      const agentsToRemove = availableAgents
        .filter(agent => agent.currentLoad === 0)
        .sort((a, b) => a.totalTasks - b.totalTasks)
        .slice(0, 2);

      for (const agent of agentsToRemove) {
        await this.deactivateAgent(agent.id, 'scaling-down');
      }

      this.capacityMetrics.lastScalingAction = {
        action: 'scale-down',
        reason,
        agentsRemoved: agentsToRemove.length,
        timestamp: Date.now()
      };

      this.emit('agents-scaled-down', {
        reason,
        agentsRemoved: agentsToRemove.length,
        totalAgents: this.capacityMetrics.totalAgents,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      console.error('❌ Failed to scale down agents:', error.message);
      return false;
    }
  }

  /**
   * Emergency scale up
   */
  async emergencyScaleUp() {
    console.warn('🚨 EMERGENCY SCALING - System at critical capacity');

    // Add emergency agents from the emergency pool
    const emergencyAgents = Array.from(this.agentPools['emergency-pool'])
      .map(id => this.agentRegistry.get(id))
      .filter(agent => agent && agent.status === 'available')
      .slice(0, 3);

    for (const agent of emergencyAgents) {
      // Boost emergency agent capacity
      agent.maxConcurrentTasks = Math.min(agent.maxConcurrentTasks * 1.5, 8);
      console.log(`⚡ Emergency boost for agent ${agent.id}: ${agent.maxConcurrentTasks} concurrent tasks`);
    }

    this.emit('emergency-scaling-activated', {
      boostedAgents: emergencyAgents.length,
      timestamp: Date.now()
    });
  }

  /**
   * Determine needed capability for scaling
   */
  determineNeededCapability() {
    // Analyze recent task distribution to determine what capability is most needed
    const capabilityDemand = {};

    // Count current utilization by capability
    for (const [capability, agentIds] of this.capabilityMap) {
      const agents = Array.from(agentIds).map(id => this.agentRegistry.get(id));
      const totalLoad = agents.reduce((sum, agent) => sum + agent.currentLoad, 0);
      const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);

      capabilityDemand[capability] = totalCapacity > 0 ? totalLoad / totalCapacity : 0;
    }

    // Return capability with highest demand
    const highestDemand = Object.entries(capabilityDemand)
      .sort(([, a], [, b]) => b - a)[0];

    return highestDemand ? highestDemand[0] : 'general';
  }

  /**
   * Create virtual agent (placeholder for actual agent creation)
   */
  async createVirtualAgent(capability) {
    const agentId = `virtual-${capability}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const virtualAgent = {
      id: agentId,
      name: `Virtual ${capability} Agent`,
      type: 'virtual-claude-code',
      capabilities: [capability, 'general'],
      specialization: capability,
      maxConcurrentTasks: 3,
      averageResponseTime: 12000,
      source: 'auto-scaling'
    };

    this.registerAgent(virtualAgent);
    this.lifecycleEvents.activated++;

    console.log(`🤖 Created virtual agent: ${agentId} (${capability})`);
  }

  /**
   * Deactivate agent
   */
  async deactivateAgent(agentId, reason) {
    const agent = this.agentRegistry.get(agentId);

    if (agent && agent.currentLoad === 0) {
      agent.status = 'deactivated';

      // Remove from capability pools
      for (const [, agentSet] of Object.entries(this.agentPools)) {
        agentSet.delete(agentId);
      }

      this.lifecycleEvents.deactivated++;

      console.log(`⏹️ Deactivated agent: ${agentId} (${reason})`);

      this.emit('agent-deactivated', {
        agentId,
        reason,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Start agent discovery
   */
  startAgentDiscovery() {
    this.intervals.agentDiscovery = setInterval(async () => {
      await this.discoverNewAgents();
    }, this.config.agentDiscoveryInterval);

    console.log('🔍 Agent discovery monitoring started');
  }

  /**
   * Discover new agents
   */
  async discoverNewAgents() {
    const previousAgentCount = this.agentRegistry.size;
    await this.discoverAgents();
    const newAgentCount = this.agentRegistry.size - previousAgentCount;

    if (newAgentCount > 0) {
      console.log(`🆕 Discovered ${newAgentCount} new agents`);
      this.emit('new-agents-discovered', {
        count: newAgentCount,
        totalAgents: this.agentRegistry.size,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Start performance analysis
   */
  startPerformanceAnalysis() {
    this.intervals.performanceAnalysis = setInterval(() => {
      this.analyzeAgentPerformance();
    }, this.config.healthCheckInterval * 2);

    console.log('📈 Performance analysis started');
  }

  /**
   * Analyze agent performance
   */
  analyzeAgentPerformance() {
    for (const [agentId, agent] of this.agentRegistry) {
      const performanceData = this.performanceMetrics.get(agentId);

      if (performanceData && performanceData.recentTasks.length > 0) {
        // Calculate current performance metrics
        const recentTasks = performanceData.recentTasks.slice(-this.config.performanceWindowSize);
        const successfulTasks = recentTasks.filter(task => task.success);

        const totalTime = recentTasks.reduce((sum, task) => sum + task.duration, 0);
        const avgResponseTime = recentTasks.length > 0 ? totalTime / recentTasks.length : 0;

        const successRate = recentTasks.length > 0 ? successfulTasks.length / recentTasks.length : 1;
        const throughput = recentTasks.length / (this.config.performanceWindowSize * 0.001); // tasks per second

        // Update agent performance
        agent.successRate = successRate;
        agent.averageResponseTime = avgResponseTime;

        // Update performance metrics
        performanceData.averageResponseTime = avgResponseTime;
        performanceData.throughput = throughput;
        performanceData.errorRate = 1 - successRate;
        performanceData.lastUpdate = Date.now();

        // Add to performance history
        agent.performanceHistory.push({
          timestamp: Date.now(),
          successRate,
          avgResponseTime,
          throughput,
          taskCount: recentTasks.length
        });

        // Keep history manageable
        if (agent.performanceHistory.length > 50) {
          agent.performanceHistory.shift();
        }
      }
    }
  }

  /**
   * Record task assignment to agent
   */
  async recordTaskAssignment(agentId, taskData) {
    const agent = this.agentRegistry.get(agentId);
    const performanceData = this.performanceMetrics.get(agentId);

    if (agent && performanceData) {
      agent.currentLoad++;
      agent.totalTasks++;
      agent.lastTaskAssignment = Date.now();

      // Update status
      this.updateCapacityMetrics();

      this.emit('task-assigned', {
        agentId,
        taskId: taskData.taskId,
        currentLoad: agent.currentLoad,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Record task completion
   */
  async recordTaskCompletion(agentId, taskResult) {
    const agent = this.agentRegistry.get(agentId);
    const performanceData = this.performanceMetrics.get(agentId);

    if (agent && performanceData) {
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);

      if (taskResult.success) {
        agent.successfulTasks++;
        agent.consecutiveFailures = 0;
      } else {
        agent.failedTasks++;
        agent.consecutiveFailures++;
      }

      agent.totalProcessingTime += taskResult.duration || 0;

      // Add to recent tasks
      performanceData.recentTasks.push({
        taskId: taskResult.taskId,
        success: taskResult.success,
        duration: taskResult.duration || 0,
        timestamp: Date.now(),
        error: taskResult.error || null
      });

      // Keep recent tasks manageable
      if (performanceData.recentTasks.length > this.config.performanceWindowSize) {
        performanceData.recentTasks.shift();
      }

      // Update status
      this.updateCapacityMetrics();

      this.emit('task-completed', {
        agentId,
        taskId: taskResult.taskId,
        success: taskResult.success,
        currentLoad: agent.currentLoad,
        timestamp: Date.now()
      });
    }
  }

  // Public API methods

  /**
   * Get available agents by capability
   */
  getAvailableAgentsByCapability(capability) {
    const agentIds = this.capabilityMap.get(capability) || new Set();

    return Array.from(agentIds)
      .map(id => this.agentRegistry.get(id))
      .filter(agent => agent && (agent.status === 'available' || agent.status === 'busy') && !agent.isOverloaded);
  }

  /**
   * Get all available agents
   */
  getAvailableAgents() {
    return Array.from(this.agentRegistry.values())
      .filter(agent => agent.status === 'available' || agent.status === 'busy');
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId) {
    return this.agentRegistry.get(agentId);
  }

  /**
   * Get capacity metrics
   */
  getCapacityMetrics() {
    return {
      ...this.capacityMetrics,
      timestamp: Date.now()
    };
  }

  /**
   * Get health metrics
   */
  getHealthMetrics() {
    return {
      ...this.healthMetrics,
      timestamp: Date.now()
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const agentPerformance = {};

    for (const [agentId, metrics] of this.performanceMetrics) {
      agentPerformance[agentId] = {
        ...metrics,
        agent: this.agentRegistry.get(agentId)
      };
    }

    return agentPerformance;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      totalAgents: this.capacityMetrics.totalAgents,
      availableAgents: this.capacityMetrics.availableAgents,
      healthyAgents: this.healthMetrics.healthyAgents,
      currentUtilization: this.capacityMetrics.averageUtilization,
      autoScalingEnabled: this.config.autoScalingEnabled,
      lastHealthCheck: this.healthMetrics.lastFullHealthCheck,
      lifecycleEvents: this.lifecycleEvents,
      agentPools: Object.fromEntries(
        Object.entries(this.agentPools).map(([name, pool]) => [name, pool.size])
      ),
      operational: this.healthMetrics.healthyAgents > 0,
      timestamp: Date.now()
    };
  }

  /**
   * Get detailed agent information
   */
  getAgentDetails(agentId) {
    const agent = this.agentRegistry.get(agentId);
    const performance = this.performanceMetrics.get(agentId);

    if (!agent) {
      return null;
    }

    return {
      agent,
      performance,
      capabilities: Array.from(this.capabilityMap.entries())
        .filter(([, agentSet]) => agentSet.has(agentId))
        .map(([capability]) => capability),
      pools: Object.entries(this.agentPools)
        .filter(([, pool]) => pool.has(agentId))
        .map(([poolName]) => poolName)
    };
  }

  /**
   * Update configuration
   */
  async updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ AgentAvailabilityTracker configuration updated');

    // Restart monitoring with new intervals if changed
    if (newConfig.healthCheckInterval || newConfig.capacityCheckInterval) {
      this.stopMonitoring();
      this.startHealthMonitoring();
      this.startCapacityMonitoring();
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    Object.values(this.intervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
  }

  /**
   * Initialize tracker
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialization already done in constructor, just mark as initialized
      this.isInitialized = true;
      console.log('✅ AgentAvailabilityTracker fully initialized');

    } catch (error) {
      console.error('❌ Failed to initialize AgentAvailabilityTracker:', error);
      throw error;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    return {
      status: this.healthMetrics.healthyAgents > 0 ? 'healthy' : 'critical',
      totalAgents: this.capacityMetrics.totalAgents,
      healthyAgents: this.healthMetrics.healthyAgents,
      availableAgents: this.capacityMetrics.availableAgents,
      utilizationRate: this.capacityMetrics.averageUtilization / 100,
      lastHealthCheck: this.healthMetrics.lastFullHealthCheck
    };
  }

  /**
   * Shutdown tracker
   */
  async shutdown() {
    console.log('🛑 AgentAvailabilityTracker shutting down...');

    this.stopMonitoring();
    this.removeAllListeners();

    console.log('✅ AgentAvailabilityTracker shutdown complete');
  }
}

module.exports = AgentAvailabilityTracker;