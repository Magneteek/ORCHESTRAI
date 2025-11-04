// Context Bridge System
// Enables seamless context sharing between parallel agent executions
// Implements dynamic context diffusion, conflict resolution, and awareness coordination

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class ContextBridgeSystem extends EventEmitter {
  constructor(crystallineMemory, contextPreservation, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.contextPreservation = contextPreservation;
    this.redis = redis;
    
    // Active context bridges
    this.activeBridges = new Map();
    
    // Context diffusion patterns
    this.diffusionPatterns = {
      broadcast: {
        name: 'Broadcast Diffusion',
        description: 'Share context updates with all connected agents',
        suitableFor: ['project-wide-updates', 'critical-insights', 'error-notifications'],
        latency: 'low',
        scope: 'global'
      },
      selective: {
        name: 'Selective Diffusion',
        description: 'Share context with agents based on relevance and expertise',
        suitableFor: ['domain-specific-insights', 'targeted-coordination', 'resource-optimization'],
        latency: 'medium',
        scope: 'filtered'
      },
      hierarchical: {
        name: 'Hierarchical Diffusion',
        description: 'Share context through orchestration hierarchy',
        suitableFor: ['task-dependencies', 'workflow-coordination', 'quality-gates'],
        latency: 'medium',
        scope: 'structured'
      },
      peer_to_peer: {
        name: 'Peer-to-Peer Diffusion',
        description: 'Direct agent-to-agent context sharing',
        suitableFor: ['collaborative-tasks', 'real-time-coordination', 'cross-domain-insights'],
        latency: 'low',
        scope: 'direct'
      },
      temporal: {
        name: 'Temporal Diffusion',
        description: 'Time-based context sharing for sequential awareness',
        suitableFor: ['pipeline-stages', 'iterative-refinement', 'learning-chains'],
        latency: 'high',
        scope: 'temporal'
      }
    };
    
    // Context conflict resolution strategies
    this.conflictResolution = {
      timestamp: 'Most recent context wins',
      priority: 'Highest priority agent context wins',
      consensus: 'Aggregate multiple agent contexts',
      expertise: 'Most expert agent context wins',
      hybrid: 'Combine strategies based on context type'
    };
    
    // Bridge performance metrics
    this.bridgeMetrics = {
      bridgesCreated: 0,
      contextUpdatesShared: 0,
      conflictsResolved: 0,
      averageLatency: 0,
      throughput: 0
    };
    
    console.log('🌉 Context Bridge System initialized - Enabling seamless agent context sharing');
  }

  /**
   * Create a context bridge between agents in a workflow
   */
  async createContextBridge(bridgeConfig, options = {}) {
    const bridgeId = uuidv4();
    const timestamp = Date.now();
    
    try {
      // Validate bridge configuration
      const validation = await this.validateBridgeConfig(bridgeConfig);
      if (!validation.valid) {
        throw new Error(`Invalid bridge config: ${validation.errors.join(', ')}`);
      }
      
      // Select optimal diffusion pattern
      const diffusionPattern = this.selectDiffusionPattern(bridgeConfig);
      
      // Create bridge instance
      const bridge = {
        bridgeId,
        config: bridgeConfig,
        diffusionPattern,
        status: 'active',
        createdAt: timestamp,
        participants: new Map(),
        contextChannels: new Map(),
        sharedContext: new Map(),
        conflictHistory: [],
        metrics: {
          contextUpdates: 0,
          participantJoins: 0,
          conflictsResolved: 0,
          latencyHistory: [],
          lastActivity: timestamp
        },
        rules: {
          maxContextSize: options.maxContextSize || 10000,
          maxParticipants: options.maxParticipants || 20,
          contextTTL: options.contextTTL || 3600000, // 1 hour
          conflictResolution: options.conflictResolution || 'hybrid'
        }
      };
      
      // Initialize diffusion channels
      await this.initializeDiffusionChannels(bridge);
      
      // Store bridge
      this.activeBridges.set(bridgeId, bridge);
      
      // Store in Redis for distributed access
      if (this.redis) {
        await this.redis.setex(
          `orchestrai:bridge:${bridgeId}`,
          Math.ceil(bridge.rules.contextTTL / 1000),
          JSON.stringify(bridge)
        );
      }
      
      console.log(`🌉 Context bridge created: ${bridgeId} using ${diffusionPattern.name} pattern`);
      
      this.bridgeMetrics.bridgesCreated++;
      
      this.emit('bridge-created', {
        bridgeId,
        pattern: diffusionPattern.name,
        participantCount: bridgeConfig.participants.length,
        workflowId: bridgeConfig.workflowId
      });
      
      return { bridgeId, pattern: diffusionPattern };
      
    } catch (error) {
      console.error('❌ Failed to create context bridge:', error.message);
      throw error;
    }
  }

  /**
   * Add agent to context bridge
   */
  async joinBridge(bridgeId, agentId, agentConfig = {}) {
    try {
      const bridge = await this.getBridge(bridgeId);
      if (!bridge) {
        throw new Error(`Bridge ${bridgeId} not found`);
      }
      
      if (bridge.participants.size >= bridge.rules.maxParticipants) {
        throw new Error(`Bridge ${bridgeId} is at maximum capacity`);
      }
      
      // Create participant record
      const participant = {
        agentId,
        joinedAt: Date.now(),
        agentType: agentConfig.agentType,
        expertise: agentConfig.expertise || [],
        priority: agentConfig.priority || 'normal',
        contextChannels: new Set(),
        lastContextUpdate: null,
        metrics: {
          contextUpdatesReceived: 0,
          contextUpdatesShared: 0,
          averageResponseTime: 0
        }
      };
      
      // Add to bridge
      bridge.participants.set(agentId, participant);
      bridge.metrics.participantJoins++;
      bridge.metrics.lastActivity = Date.now();
      
      // Initialize agent's context channels
      await this.initializeAgentChannels(bridge, participant);
      
      // Send current bridge context to new participant
      const bridgeContext = await this.aggregateBridgeContext(bridge, agentId);
      await this.sendContextToBridgeParticipant(bridgeId, agentId, bridgeContext, 'bridge-join');
      
      // Update bridge
      this.activeBridges.set(bridgeId, bridge);
      
      console.log(`👥 Agent ${agentId} joined bridge ${bridgeId}`);
      
      this.emit('participant-joined', {
        bridgeId,
        agentId,
        participantCount: bridge.participants.size
      });
      
      return {
        bridgeId,
        agentId,
        bridgeContext,
        diffusionPattern: bridge.diffusionPattern.name
      };
      
    } catch (error) {
      console.error('❌ Failed to join bridge:', error.message);
      throw error;
    }
  }

  /**
   * Share context update through bridge
   */
  async shareContextUpdate(bridgeId, agentId, contextUpdate, options = {}) {
    const startTime = Date.now();
    
    try {
      const bridge = await this.getBridge(bridgeId);
      if (!bridge) {
        throw new Error(`Bridge ${bridgeId} not found`);
      }
      
      const participant = bridge.participants.get(agentId);
      if (!participant) {
        throw new Error(`Agent ${agentId} not found in bridge ${bridgeId}`);
      }
      
      // Validate context update
      const validation = await this.validateContextUpdate(contextUpdate, bridge.rules);
      if (!validation.valid) {
        throw new Error(`Invalid context update: ${validation.errors.join(', ')}`);
      }
      
      // Create context update record
      const update = {
        updateId: uuidv4(),
        agentId,
        timestamp: Date.now(),
        contextType: contextUpdate.type || 'general',
        data: contextUpdate.data,
        priority: options.priority || participant.priority,
        scope: options.scope || 'bridge',
        metadata: {
          source: agentId,
          agentType: participant.agentType,
          expertise: participant.expertise,
          ...contextUpdate.metadata
        }
      };
      
      // Handle potential conflicts
      const conflictResult = await this.resolveContextConflicts(bridge, update);
      if (conflictResult.hasConflict) {
        console.log(`⚡ Context conflict resolved using ${conflictResult.strategy} strategy`);
        bridge.conflictHistory.push(conflictResult);
        this.bridgeMetrics.conflictsResolved++;
      }
      
      // Store update in bridge context
      const contextKey = `${update.contextType}:${update.agentId}`;
      bridge.sharedContext.set(contextKey, update);
      
      // Apply diffusion pattern to share update
      const diffusionResults = await this.diffuseContextUpdate(bridge, update);
      
      // Update metrics
      bridge.metrics.contextUpdates++;
      bridge.metrics.lastActivity = Date.now();
      participant.metrics.contextUpdatesShared++;
      
      const latency = Date.now() - startTime;
      bridge.metrics.latencyHistory.push(latency);
      this.bridgeMetrics.averageLatency = this.calculateAverageLatency();
      this.bridgeMetrics.contextUpdatesShared++;
      
      // Update participant's last update time
      participant.lastContextUpdate = update.timestamp;
      
      // Update bridge
      this.activeBridges.set(bridgeId, bridge);
      
      console.log(`📡 Context update shared through bridge ${bridgeId}: ${update.contextType} from ${agentId}`);
      
      this.emit('context-shared', {
        bridgeId,
        agentId,
        updateId: update.updateId,
        contextType: update.contextType,
        recipientCount: diffusionResults.recipientCount,
        latency
      });
      
      return {
        updateId: update.updateId,
        diffusionResults,
        latency,
        conflictResult: conflictResult.hasConflict ? conflictResult : null
      };
      
    } catch (error) {
      console.error('❌ Failed to share context update:', error.message);
      throw error;
    }
  }

  /**
   * Diffuse context update according to selected pattern
   */
  async diffuseContextUpdate(bridge, update) {
    const { diffusionPattern } = bridge;
    const recipients = [];
    
    try {
      switch (diffusionPattern.name) {
        case 'Broadcast Diffusion':
          return await this.broadcastDiffusion(bridge, update);
          
        case 'Selective Diffusion':
          return await this.selectiveDiffusion(bridge, update);
          
        case 'Hierarchical Diffusion':
          return await this.hierarchicalDiffusion(bridge, update);
          
        case 'Peer-to-Peer Diffusion':
          return await this.peerToPeerDiffusion(bridge, update);
          
        case 'Temporal Diffusion':
          return await this.temporalDiffusion(bridge, update);
          
        default:
          throw new Error(`Unknown diffusion pattern: ${diffusionPattern.name}`);
      }
    } catch (error) {
      console.error(`❌ Diffusion failed for pattern ${diffusionPattern.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Broadcast diffusion - share with all participants
   */
  async broadcastDiffusion(bridge, update) {
    const recipients = Array.from(bridge.participants.keys())
      .filter(agentId => agentId !== update.agentId);
    
    const results = [];
    
    for (const recipientId of recipients) {
      try {
        await this.sendContextToBridgeParticipant(bridge.bridgeId, recipientId, update, 'broadcast');
        results.push({ agentId: recipientId, status: 'sent' });
      } catch (error) {
        results.push({ agentId: recipientId, status: 'failed', error: error.message });
      }
    }
    
    return {
      pattern: 'broadcast',
      recipientCount: recipients.length,
      successCount: results.filter(r => r.status === 'sent').length,
      results
    };
  }

  /**
   * Selective diffusion - share based on relevance
   */
  async selectiveDiffusion(bridge, update) {
    const relevantAgents = this.findRelevantAgents(bridge, update);
    const results = [];
    
    for (const agentId of relevantAgents) {
      try {
        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(
          bridge.participants.get(agentId),
          update
        );
        
        if (relevanceScore > 0.3) { // Relevance threshold
          await this.sendContextToBridgeParticipant(bridge.bridgeId, agentId, update, 'selective');
          results.push({ agentId, status: 'sent', relevanceScore });
        } else {
          results.push({ agentId, status: 'filtered', relevanceScore });
        }
      } catch (error) {
        results.push({ agentId, status: 'failed', error: error.message });
      }
    }
    
    return {
      pattern: 'selective',
      candidateCount: relevantAgents.length,
      recipientCount: results.filter(r => r.status === 'sent').length,
      results
    };
  }

  /**
   * Send context update to specific bridge participant
   */
  async sendContextToBridgeParticipant(bridgeId, agentId, contextData, diffusionType) {
    try {
      // Create context handoff for the specific agent
      const handoffId = await this.contextPreservation.createContextHandoff(
        null, // No source context ID for bridge updates
        [agentId],
        {
          bridgeId,
          diffusionType,
          contextData,
          timestamp: Date.now()
        }
      );
      
      // Store context handoff reference
      if (this.redis) {
        await this.redis.setex(
          `orchestrai:bridge-handoff:${bridgeId}:${agentId}`,
          3600, // 1 hour
          JSON.stringify({ handoffId, contextData, diffusionType })
        );
      }
      
      return handoffId;
      
    } catch (error) {
      console.error(`❌ Failed to send context to participant ${agentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Resolve context conflicts using configured strategy
   */
  async resolveContextConflicts(bridge, newUpdate) {
    const conflictResult = {
      hasConflict: false,
      strategy: null,
      resolution: null,
      conflictingUpdates: []
    };
    
    // Find potentially conflicting updates
    const contextKey = `${newUpdate.contextType}:*`;
    const potentialConflicts = Array.from(bridge.sharedContext.entries())
      .filter(([key, update]) => 
        key.startsWith(newUpdate.contextType) && 
        key !== `${newUpdate.contextType}:${newUpdate.agentId}` &&
        this.detectContextConflict(update, newUpdate)
      );
    
    if (potentialConflicts.length === 0) {
      return conflictResult;
    }
    
    conflictResult.hasConflict = true;
    conflictResult.conflictingUpdates = potentialConflicts.map(([key, update]) => ({
      key,
      agentId: update.agentId,
      timestamp: update.timestamp
    }));
    
    // Apply resolution strategy
    const strategy = bridge.rules.conflictResolution;
    
    switch (strategy) {
      case 'timestamp':
        conflictResult.strategy = 'timestamp';
        conflictResult.resolution = 'newest-wins';
        // New update is always newest, so it wins
        break;
        
      case 'priority':
        const priorities = { high: 3, normal: 2, low: 1 };
        const newUpdatePriority = priorities[newUpdate.priority] || 2;
        const conflictPriorities = potentialConflicts.map(([_, update]) => 
          priorities[update.priority] || 2
        );
        
        conflictResult.strategy = 'priority';
        if (newUpdatePriority >= Math.max(...conflictPriorities)) {
          conflictResult.resolution = 'new-update-wins';
        } else {
          conflictResult.resolution = 'existing-update-wins';
          return conflictResult; // Don't update context
        }
        break;
        
      case 'expertise':
        const newAgentExpertise = bridge.participants.get(newUpdate.agentId)?.expertise || [];
        const isRelevantExpertise = this.checkExpertiseRelevance(newAgentExpertise, newUpdate.contextType);
        
        conflictResult.strategy = 'expertise';
        if (isRelevantExpertise) {
          conflictResult.resolution = 'expert-update-wins';
        } else {
          conflictResult.resolution = 'existing-update-retained';
          return conflictResult;
        }
        break;
        
      case 'consensus':
        conflictResult.strategy = 'consensus';
        conflictResult.resolution = 'aggregate-contexts';
        newUpdate.data = this.aggregateConflictingContexts(
          potentialConflicts.map(([_, update]) => update),
          newUpdate
        );
        break;
        
      case 'hybrid':
      default:
        // Use different strategies based on context type
        if (newUpdate.priority === 'high') {
          conflictResult.strategy = 'priority';
          conflictResult.resolution = 'high-priority-wins';
        } else if (newUpdate.contextType === 'project-critical') {
          conflictResult.strategy = 'expertise';
          conflictResult.resolution = 'expert-decision';
        } else {
          conflictResult.strategy = 'timestamp';
          conflictResult.resolution = 'newest-wins';
        }
        break;
    }
    
    return conflictResult;
  }

  /**
   * Detect if two context updates conflict
   */
  detectContextConflict(existingUpdate, newUpdate) {
    // Same context type and overlapping data keys
    if (existingUpdate.contextType !== newUpdate.contextType) {
      return false;
    }
    
    // Check for overlapping data keys
    const existingKeys = new Set(Object.keys(existingUpdate.data || {}));
    const newKeys = new Set(Object.keys(newUpdate.data || {}));
    
    const intersection = new Set([...existingKeys].filter(key => newKeys.has(key)));
    
    if (intersection.size === 0) {
      return false;
    }
    
    // Check if values actually conflict (different values for same keys)
    for (const key of intersection) {
      const existingValue = existingUpdate.data[key];
      const newValue = newUpdate.data[key];
      
      if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Find agents relevant to a context update
   */
  findRelevantAgents(bridge, update) {
    const relevantAgents = [];
    
    for (const [agentId, participant] of bridge.participants.entries()) {
      if (agentId === update.agentId) continue; // Don't send to originator
      
      // Check expertise relevance
      const expertiseMatch = participant.expertise.some(expertise =>
        update.contextType.includes(expertise) ||
        expertise.includes(update.contextType.split('-')[0])
      );
      
      // Check agent type relevance
      const agentTypeMatch = this.checkAgentTypeRelevance(participant.agentType, update.contextType);
      
      // Check recent activity
      const isActive = participant.lastContextUpdate && 
        (Date.now() - participant.lastContextUpdate) < 300000; // 5 minutes
      
      if (expertiseMatch || agentTypeMatch || isActive) {
        relevantAgents.push(agentId);
      }
    }
    
    return relevantAgents;
  }

  /**
   * Calculate relevance score between agent and context update
   */
  calculateRelevanceScore(participant, update) {
    let score = 0;
    
    // Expertise match (40% weight)
    const expertiseMatch = participant.expertise.some(expertise =>
      update.contextType.includes(expertise)
    );
    if (expertiseMatch) score += 0.4;
    
    // Agent type match (30% weight)
    if (this.checkAgentTypeRelevance(participant.agentType, update.contextType)) {
      score += 0.3;
    }
    
    // Priority match (20% weight)
    if (participant.priority === update.priority) {
      score += 0.2;
    }
    
    // Recent activity (10% weight)
    if (participant.lastContextUpdate && 
        (Date.now() - participant.lastContextUpdate) < 600000) { // 10 minutes
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Check if agent type is relevant to context type
   */
  checkAgentTypeRelevance(agentType, contextType) {
    const relevanceMap = {
      'seo-specialist': ['seo', 'keyword', 'content', 'optimization'],
      'content-writer': ['content', 'copy', 'writing', 'text'],
      'web-developer': ['frontend', 'backend', 'development', 'code'],
      'designer': ['design', 'ui', 'ux', 'visual', 'wireframe'],
      'research-agent': ['research', 'analysis', 'data', 'insights']
    };
    
    const relevantTerms = relevanceMap[agentType] || [];
    return relevantTerms.some(term => contextType.toLowerCase().includes(term));
  }

  /**
   * Select optimal diffusion pattern for bridge
   */
  selectDiffusionPattern(bridgeConfig) {
    const { participants, contextTypes, workflowPattern, performance } = bridgeConfig;
    
    // Pattern selection logic based on configuration
    if (performance?.requiresLowLatency) {
      return this.diffusionPatterns.peer_to_peer;
    } else if (participants.length > 10) {
      return this.diffusionPatterns.selective;
    } else if (workflowPattern === 'pipeline') {
      return this.diffusionPatterns.temporal;
    } else if (contextTypes?.includes('critical')) {
      return this.diffusionPatterns.broadcast;
    } else {
      return this.diffusionPatterns.selective; // Default
    }
  }

  /**
   * Initialize diffusion channels for bridge
   */
  async initializeDiffusionChannels(bridge) {
    const { diffusionPattern } = bridge;
    
    // Create channels based on pattern
    switch (diffusionPattern.name) {
      case 'Broadcast Diffusion':
        bridge.contextChannels.set('broadcast', {
          type: 'broadcast',
          subscribers: new Set(),
          messageHistory: [],
          created: Date.now()
        });
        break;
        
      case 'Selective Diffusion':
        bridge.contextChannels.set('selective', {
          type: 'selective',
          subscriptionRules: new Map(),
          relevanceCache: new Map(),
          created: Date.now()
        });
        break;
        
      case 'Hierarchical Diffusion':
        bridge.contextChannels.set('hierarchy', {
          type: 'hierarchical',
          levels: new Map(),
          parentChild: new Map(),
          created: Date.now()
        });
        break;
        
      case 'Peer-to-Peer Diffusion':
        bridge.contextChannels.set('p2p', {
          type: 'peer_to_peer',
          connections: new Map(),
          routing: new Map(),
          created: Date.now()
        });
        break;
        
      case 'Temporal Diffusion':
        bridge.contextChannels.set('temporal', {
          type: 'temporal',
          timeWindows: new Map(),
          scheduledUpdates: [],
          created: Date.now()
        });
        break;
    }
  }

  /**
   * Get bridge from local cache or Redis
   */
  async getBridge(bridgeId) {
    let bridge = this.activeBridges.get(bridgeId);
    
    if (!bridge && this.redis) {
      try {
        const data = await this.redis.get(`orchestrai:bridge:${bridgeId}`);
        if (data) {
          bridge = JSON.parse(data);
          this.activeBridges.set(bridgeId, bridge);
        }
      } catch (error) {
        console.warn('Failed to retrieve bridge from Redis:', error.message);
      }
    }
    
    return bridge;
  }

  /**
   * Validate bridge configuration
   */
  async validateBridgeConfig(config) {
    const errors = [];
    
    if (!config.participants || !Array.isArray(config.participants) || config.participants.length === 0) {
      errors.push('Participants array is required and must not be empty');
    }
    
    if (!config.workflowId) {
      errors.push('Workflow ID is required');
    }
    
    if (config.participants && config.participants.length > 50) {
      errors.push('Maximum 50 participants allowed per bridge');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate average latency across all bridges
   */
  calculateAverageLatency() {
    const allLatencies = Array.from(this.activeBridges.values())
      .flatMap(bridge => bridge.metrics.latencyHistory);
    
    if (allLatencies.length === 0) return 0;
    
    return allLatencies.reduce((sum, latency) => sum + latency, 0) / allLatencies.length;
  }

  /**
   * Get context bridge statistics
   */
  getBridgeStatistics() {
    const stats = {
      ...this.bridgeMetrics,
      activeBridges: this.activeBridges.size,
      totalParticipants: 0,
      patternDistribution: {},
      averageParticipantsPerBridge: 0
    };
    
    let totalParticipants = 0;
    
    for (const bridge of this.activeBridges.values()) {
      totalParticipants += bridge.participants.size;
      
      const patternName = bridge.diffusionPattern.name;
      stats.patternDistribution[patternName] = (stats.patternDistribution[patternName] || 0) + 1;
    }
    
    stats.totalParticipants = totalParticipants;
    stats.averageParticipantsPerBridge = this.activeBridges.size > 0 ? 
      totalParticipants / this.activeBridges.size : 0;
    
    return stats;
  }

  /**
   * Clean up inactive bridges
   */
  async cleanupInactiveBridges(maxInactivity = 3600000) { // 1 hour
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [bridgeId, bridge] of this.activeBridges.entries()) {
      if ((now - bridge.metrics.lastActivity) > maxInactivity) {
        this.activeBridges.delete(bridgeId);
        
        // Clean up Redis
        if (this.redis) {
          await this.redis.del(`orchestrai:bridge:${bridgeId}`);
        }
        
        cleanedCount++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleanedCount} inactive context bridges`);
    return cleanedCount;
  }
}

module.exports = ContextBridgeSystem;