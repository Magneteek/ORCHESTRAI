// Context Preservation System
// Maintains agent context across Task tool calls and parallel executions
// Prevents context loss that leads to inconsistent decision-making

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class ContextPreservationSystem extends EventEmitter {
  constructor(crystallineMemory, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;
    
    // In-memory context cache for immediate access
    this.contextCache = new Map();
    
    // Context handoff queue for parallel executions
    this.contextHandoffs = new Map();
    
    // Context preservation patterns
    this.preservationPatterns = {
      project: {
        keys: ['projectUuid', 'clientName', 'projectType', 'deliverablePath', 'existingAssets'],
        persistence: 'session',
        priority: 'critical'
      },
      workflow: {
        keys: ['taskSequence', 'dependencies', 'completedSteps', 'nextSteps'],
        persistence: 'task-chain',
        priority: 'high'
      },
      domain: {
        keys: ['domainExpertise', 'capabilities', 'toolAccess', 'specialization'],
        persistence: 'agent-lifecycle',
        priority: 'medium'
      },
      memory: {
        keys: ['relevantMemories', 'memoryNodes', 'semanticConnections'],
        persistence: 'session',
        priority: 'high'
      },
      rules: {
        keys: ['injectedRules', 'complianceStatus', 'validationResults'],
        persistence: 'task',
        priority: 'critical'
      }
    };
    
    console.log('🔄 Context Preservation System initialized - Maintaining agent state across executions');
  }

  /**
   * Capture context before Task tool execution
   */
  async captureContext(agentId, contextData, options = {}) {
    const contextId = options.contextId || uuidv4();
    const timestamp = Date.now();
    
    try {
      // Structure context data according to preservation patterns
      const structuredContext = this.structureContext(contextData);
      
      // Create context snapshot
      const contextSnapshot = {
        contextId,
        agentId,
        timestamp,
        data: structuredContext,
        metadata: {
          captureReason: options.reason || 'task-execution',
          priority: this.calculateContextPriority(structuredContext),
          expiresAt: this.calculateExpiry(structuredContext),
          version: 1
        }
      };
      
      // Store in multiple persistence layers
      await this.storeContextSnapshot(contextSnapshot);
      
      console.log(`📸 Context captured for agent ${agentId}: ${contextId}`);
      
      this.emit('context-captured', {
        agentId,
        contextId,
        dataSize: JSON.stringify(structuredContext).length
      });
      
      return contextId;
      
    } catch (error) {
      console.error('❌ Failed to capture context:', error.message);
      throw error;
    }
  }

  /**
   * Restore context after Task tool execution
   */
  async restoreContext(contextId, agentId = null) {
    try {
      // Retrieve from fastest available source
      let contextSnapshot = this.contextCache.get(contextId);
      
      if (!contextSnapshot) {
        contextSnapshot = await this.retrieveContextSnapshot(contextId);
      }
      
      if (!contextSnapshot) {
        throw new Error(`Context ${contextId} not found`);
      }
      
      // Validate context is still valid
      const isValid = this.validateContextSnapshot(contextSnapshot);
      if (!isValid.valid) {
        throw new Error(`Context invalid: ${isValid.reason}`);
      }
      
      // Update access timestamp
      contextSnapshot.metadata.lastAccessed = Date.now();
      contextSnapshot.metadata.accessCount = (contextSnapshot.metadata.accessCount || 0) + 1;
      
      // Update cache
      this.contextCache.set(contextId, contextSnapshot);
      
      console.log(`🔄 Context restored for agent ${agentId || contextSnapshot.agentId}: ${contextId}`);
      
      this.emit('context-restored', {
        agentId: agentId || contextSnapshot.agentId,
        contextId,
        dataSize: JSON.stringify(contextSnapshot.data).length
      });
      
      return contextSnapshot.data;
      
    } catch (error) {
      console.error('❌ Failed to restore context:', error.message);
      
      // Return empty context rather than failing completely
      return this.getEmptyContext();
    }
  }

  /**
   * Create context handoff for parallel executions
   */
  async createContextHandoff(sourceContextId, targetAgentIds, sharedData = {}) {
    const handoffId = uuidv4();
    
    try {
      // Get source context
      const sourceContext = await this.restoreContext(sourceContextId);
      
      // Create filtered context for sharing (remove sensitive data)
      const sharedContext = this.filterContextForSharing(sourceContext, sharedData);
      
      // Create handoff record
      const handoff = {
        handoffId,
        sourceContextId,
        targetAgentIds,
        sharedContext,
        createdAt: Date.now(),
        status: 'active',
        accessLog: []
      };
      
      // Store handoff
      this.contextHandoffs.set(handoffId, handoff);
      
      // Store in Redis if available
      if (this.redis) {
        await this.redis.setex(
          `orchestrai:context-handoff:${handoffId}`,
          3600, // 1 hour expiry
          JSON.stringify(handoff)
        );
      }
      
      console.log(`🤝 Context handoff created: ${handoffId} for ${targetAgentIds.length} agents`);
      
      return handoffId;
      
    } catch (error) {
      console.error('❌ Failed to create context handoff:', error.message);
      throw error;
    }
  }

  /**
   * Access shared context from handoff
   */
  async accessSharedContext(handoffId, agentId) {
    try {
      let handoff = this.contextHandoffs.get(handoffId);
      
      // Try Redis if not in local cache
      if (!handoff && this.redis) {
        const handoffData = await this.redis.get(`orchestrai:context-handoff:${handoffId}`);
        if (handoffData) {
          handoff = JSON.parse(handoffData);
          this.contextHandoffs.set(handoffId, handoff);
        }
      }
      
      if (!handoff) {
        throw new Error(`Context handoff ${handoffId} not found`);
      }
      
      // Check if agent is authorized
      if (!handoff.targetAgentIds.includes(agentId)) {
        throw new Error(`Agent ${agentId} not authorized for handoff ${handoffId}`);
      }
      
      // Log access
      handoff.accessLog.push({
        agentId,
        accessTime: Date.now()
      });
      
      // Update handoff
      this.contextHandoffs.set(handoffId, handoff);
      
      console.log(`📥 Shared context accessed by agent ${agentId} from handoff ${handoffId}`);
      
      return handoff.sharedContext;
      
    } catch (error) {
      console.error('❌ Failed to access shared context:', error.message);
      return this.getEmptyContext();
    }
  }

  /**
   * Structure context data according to preservation patterns
   */
  structureContext(rawContext) {
    const structured = {};
    
    for (const [category, pattern] of Object.entries(this.preservationPatterns)) {
      structured[category] = {};
      
      // Extract relevant keys for this category
      for (const key of pattern.keys) {
        if (rawContext.hasOwnProperty(key)) {
          structured[category][key] = rawContext[key];
        }
      }
      
      // Add category metadata
      structured[category]._metadata = {
        priority: pattern.priority,
        persistence: pattern.persistence,
        keysFound: Object.keys(structured[category]).length - 1
      };
    }
    
    // Add any uncategorized data
    const allCategoryKeys = Object.values(this.preservationPatterns)
      .flatMap(pattern => pattern.keys);
    
    const uncategorized = {};
    for (const [key, value] of Object.entries(rawContext)) {
      if (!allCategoryKeys.includes(key)) {
        uncategorized[key] = value;
      }
    }
    
    if (Object.keys(uncategorized).length > 0) {
      structured.uncategorized = uncategorized;
    }
    
    return structured;
  }

  /**
   * Store context snapshot in appropriate persistence layers
   */
  async storeContextSnapshot(snapshot) {
    // Always store in memory cache for immediate access
    this.contextCache.set(snapshot.contextId, snapshot);
    
    // Store in Redis for distributed access
    if (this.redis) {
      const expiry = Math.ceil((snapshot.metadata.expiresAt - Date.now()) / 1000);
      await this.redis.setex(
        `orchestrai:context:${snapshot.contextId}`,
        Math.max(expiry, 300), // Minimum 5 minutes
        JSON.stringify(snapshot)
      );
    }
    
    // Store critical contexts in crystalline memory for long-term access
    if (snapshot.metadata.priority === 'critical' && this.crystallineMemory) {
      await this.crystallineMemory.storeMemory(
        'context-preservation',
        {
          contextId: snapshot.contextId,
          agentId: snapshot.agentId,
          contextData: snapshot.data,
          timestamp: snapshot.timestamp
        },
        {
          importance: 0.9,
          semantic_tags: ['context', 'agent-state', 'preservation'],
          retention: 'long-term'
        }
      );
    }
  }

  /**
   * Retrieve context snapshot from persistence layers
   */
  async retrieveContextSnapshot(contextId) {
    // Try Redis first
    if (this.redis) {
      try {
        const data = await this.redis.get(`orchestrai:context:${contextId}`);
        if (data) {
          return JSON.parse(data);
        }
      } catch (error) {
        console.warn('Failed to retrieve context from Redis:', error.message);
      }
    }
    
    // Try crystalline memory for critical contexts
    if (this.crystallineMemory) {
      try {
        const memories = await this.crystallineMemory.searchMemories(
          'context-preservation',
          { contextId },
          { limit: 1 }
        );
        
        if (memories && memories.length > 0) {
          const memory = memories[0];
          return {
            contextId: memory.data.contextId,
            agentId: memory.data.agentId,
            data: memory.data.contextData,
            timestamp: memory.data.timestamp,
            metadata: {
              priority: 'critical',
              source: 'crystalline-memory'
            }
          };
        }
      } catch (error) {
        console.warn('Failed to retrieve context from crystalline memory:', error.message);
      }
    }
    
    return null;
  }

  /**
   * Validate context snapshot is still valid
   */
  validateContextSnapshot(snapshot) {
    // Check expiry
    if (snapshot.metadata.expiresAt && Date.now() > snapshot.metadata.expiresAt) {
      return { valid: false, reason: 'Context expired' };
    }
    
    // Check data integrity
    if (!snapshot.data || typeof snapshot.data !== 'object') {
      return { valid: false, reason: 'Invalid context data' };
    }
    
    // Check agent ID
    if (!snapshot.agentId) {
      return { valid: false, reason: 'Missing agent ID' };
    }
    
    return { valid: true };
  }

  /**
   * Filter context for sharing between agents
   */
  filterContextForSharing(context, sharedData) {
    const shared = {};
    
    // Always share project context (with restrictions)
    if (context.project) {
      shared.project = {
        projectUuid: context.project.projectUuid,
        clientName: context.project.clientName,
        projectType: context.project.projectType,
        deliverablePath: context.project.deliverablePath
        // Exclude sensitive project data
      };
    }
    
    // Share workflow information
    if (context.workflow) {
      shared.workflow = {
        taskSequence: context.workflow.taskSequence,
        dependencies: context.workflow.dependencies
        // Exclude sensitive workflow state
      };
    }
    
    // Share relevant memory references (not full memories)
    if (context.memory) {
      shared.memory = {
        memoryNodes: context.memory.memoryNodes,
        // Exclude actual memory content for privacy
      };
    }
    
    // Add any explicitly shared data
    Object.assign(shared, sharedData);
    
    return shared;
  }

  /**
   * Calculate context priority based on content
   */
  calculateContextPriority(structuredContext) {
    let priority = 'low';
    
    // Check for critical patterns
    if (structuredContext.project && structuredContext.project.projectUuid) {
      priority = 'critical';
    } else if (structuredContext.rules && structuredContext.rules.injectedRules) {
      priority = 'high';
    } else if (structuredContext.workflow && structuredContext.workflow.taskSequence) {
      priority = 'medium';
    }
    
    return priority;
  }

  /**
   * Calculate context expiry time
   */
  calculateExpiry(structuredContext) {
    const now = Date.now();
    
    // Critical contexts last longer
    if (this.calculateContextPriority(structuredContext) === 'critical') {
      return now + (24 * 60 * 60 * 1000); // 24 hours
    }
    
    // Standard contexts
    return now + (4 * 60 * 60 * 1000); // 4 hours
  }

  /**
   * Get empty context template
   */
  getEmptyContext() {
    const empty = {};
    
    for (const category of Object.keys(this.preservationPatterns)) {
      empty[category] = {};
    }
    
    return empty;
  }

  /**
   * Clean up expired contexts
   */
  async cleanupExpiredContexts() {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Clean memory cache
    for (const [contextId, snapshot] of this.contextCache.entries()) {
      if (snapshot.metadata.expiresAt && now > snapshot.metadata.expiresAt) {
        this.contextCache.delete(contextId);
        cleanedCount++;
      }
    }
    
    // Clean handoffs
    for (const [handoffId, handoff] of this.contextHandoffs.entries()) {
      if (now - handoff.createdAt > 3600000) { // 1 hour
        this.contextHandoffs.delete(handoffId);
        cleanedCount++;
      }
    }
    
    console.log(`🧹 Context cleanup completed: ${cleanedCount} expired contexts removed`);
    
    return cleanedCount;
  }

  /**
   * Get context preservation statistics
   */
  getStatistics() {
    const stats = {
      totalContexts: this.contextCache.size,
      activeHandoffs: this.contextHandoffs.size,
      byPriority: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      memoryUsage: 0
    };
    
    // Analyze cached contexts
    for (const snapshot of this.contextCache.values()) {
      stats.byPriority[snapshot.metadata.priority]++;
      stats.memoryUsage += JSON.stringify(snapshot).length;
    }
    
    return stats;
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval(intervalMs = 300000) { // 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredContexts();
    }, intervalMs);
    
    console.log(`⏰ Context cleanup interval started: every ${intervalMs / 1000}s`);
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('⏹️ Context cleanup interval stopped');
    }
  }
}

module.exports = ContextPreservationSystem;