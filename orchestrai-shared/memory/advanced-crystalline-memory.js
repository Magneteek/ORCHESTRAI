/**
 * Advanced Crystalline Memory System
 *
 * Unified memory system integrating:
 * - Phase 2.2: Hexagonal Memory Lattice (geometric storage)
 * - Phase 2.1: Co-Learning Memory Pool (collaborative learning)
 * - Phase 1.1: Original Crystalline Memory (MCP + Redis + In-Memory)
 *
 * This creates a complete, self-improving memory architecture where
 * agents collaborate through shared knowledge stored in geometrically-
 * optimized hexagonal structures.
 */

const EventEmitter = require('events');
const CoLearningMemoryPool = require('./co-learning-memory-pool');
const CrystallineMemoryManager = require('./crystalline-memory-manager');

class AdvancedCrystallineMemory extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      enableCoLearning: config.enableCoLearning !== false,
      enableHexagonalStorage: config.enableHexagonalStorage !== false,
      enableLegacyIntegration: config.enableLegacyIntegration !== false,
      ...config
    };

    // Initialize subsystems
    this.coLearningPool = null;
    this.legacyMemory = null;

    // Integration layer
    this.integration = {
      legacyToHexMapping: new Map(), // Legacy memory ID → Hex node ID
      agentToLegacyMapping: new Map() // Agent ID → Legacy memory keys
    };

    // Performance tracking
    this.metrics = {
      hexagonalRetrievals: 0,
      coLearningRetrievals: 0,
      legacyRetrievals: 0,
      crossSystemQueries: 0,
      averageRetrievalTime: 0
    };

    this.initialize();
  }

  // ============ INITIALIZATION ============

  async initialize() {
    console.log('🔷 Initializing Advanced Crystalline Memory System...');

    // Initialize Co-Learning Pool (includes Hexagonal Lattice)
    if (this.config.enableCoLearning) {
      this.coLearningPool = new CoLearningMemoryPool({
        enableCrossAgentLearning: true,
        enablePatternRecognition: true,
        learningThreshold: 0.7
      });

      console.log('✅ Co-Learning Memory Pool initialized');
    }

    // Initialize Legacy Memory (Phase 1.1)
    if (this.config.enableLegacyIntegration) {
      try {
        this.legacyMemory = new CrystallineMemoryManager();
        await this.legacyMemory.initialize();
        console.log('✅ Legacy Crystalline Memory integrated');
      } catch (error) {
        console.warn('⚠️  Legacy memory integration failed:', error.message);
        this.config.enableLegacyIntegration = false;
      }
    }

    console.log('🔷 Advanced Crystalline Memory System ready');

    this.emit('initialized', {
      coLearning: !!this.coLearningPool,
      legacy: !!this.legacyMemory
    });
  }

  // ============ AGENT MANAGEMENT ============

  /**
   * Register agent in all memory systems
   * @param {string} agentId - Agent identifier
   * @param {Object} metadata - Agent metadata
   */
  async registerAgent(agentId, metadata = {}) {
    // Register in Co-Learning Pool
    if (this.coLearningPool) {
      this.coLearningPool.registerAgent(agentId, metadata);
    }

    // Store mapping for legacy system
    if (this.legacyMemory) {
      this.integration.agentToLegacyMapping.set(agentId, new Set());
    }

    console.log(`🤖 Agent ${agentId} registered in Advanced Memory`);
  }

  /**
   * Unregister agent
   * @param {string} agentId - Agent identifier
   */
  async unregisterAgent(agentId) {
    if (this.coLearningPool) {
      this.coLearningPool.unregisterAgent(agentId);
    }

    this.integration.agentToLegacyMapping.delete(agentId);
  }

  // ============ LEARNING STORAGE ============

  /**
   * Store learning from agent execution
   * @param {string} agentId - Agent identifier
   * @param {Object} learning - Learning data
   * @returns {Object} Storage result with node IDs
   */
  async storeLearning(agentId, learning) {
    const result = {
      hexNodeId: null,
      legacyKeys: [],
      success: false
    };

    const startTime = Date.now();

    try {
      // Store in Co-Learning Pool (Hexagonal Lattice)
      if (this.coLearningPool) {
        result.hexNodeId = this.coLearningPool.contributeLearning(agentId, learning);
      }

      // Store in Legacy Memory (if enabled)
      if (this.legacyMemory && learning.legacyCompatible !== false) {
        const legacyKey = await this.storeLegacyCompatible(agentId, learning);
        if (legacyKey) {
          result.legacyKeys.push(legacyKey);

          // Map hex node to legacy key
          if (result.hexNodeId) {
            this.integration.legacyToHexMapping.set(legacyKey, result.hexNodeId);
          }
        }
      }

      result.success = !!(result.hexNodeId || result.legacyKeys.length > 0);

      const duration = Date.now() - startTime;
      this.updateMetrics('store', duration);

      this.emit('learning-stored', {
        agentId,
        hexNodeId: result.hexNodeId,
        legacyKeys: result.legacyKeys,
        duration
      });

      return result;

    } catch (error) {
      console.error('❌ Error storing learning:', error.message);
      throw error;
    }
  }

  /**
   * Store learning in legacy-compatible format
   * @param {string} agentId - Agent identifier
   * @param {Object} learning - Learning data
   * @returns {string} Legacy memory key
   */
  async storeLegacyCompatible(agentId, learning) {
    if (!this.legacyMemory) return null;

    const key = `learning:${agentId}:${Date.now()}`;

    await this.legacyMemory.store(key, {
      agentId,
      timestamp: Date.now(),
      data: learning,
      qualityScore: learning.qualityScore,
      domain: learning.domain
    }, {
      tier: 'redis', // Store in Redis for fast access
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Track legacy key for agent
    const agentKeys = this.integration.agentToLegacyMapping.get(agentId);
    if (agentKeys) {
      agentKeys.add(key);
    }

    return key;
  }

  // ============ LEARNING RETRIEVAL ============

  /**
   * Retrieve relevant learnings for agent
   * @param {string} agentId - Agent identifier
   * @param {Object} context - Retrieval context
   * @returns {Array} Combined learnings from all systems
   */
  async retrieveLearnings(agentId, context = {}) {
    const startTime = Date.now();
    const results = {
      hexagonal: [],
      legacy: [],
      combined: []
    };

    try {
      // Retrieve from Co-Learning Pool (Hexagonal)
      if (this.coLearningPool) {
        results.hexagonal = this.coLearningPool.retrieveLearnings(agentId, context);
        this.metrics.hexagonalRetrievals++;
      }

      // Retrieve from Legacy Memory
      if (this.legacyMemory && context.includeLegacy !== false) {
        results.legacy = await this.retrieveLegacyLearnings(agentId, context);
        this.metrics.legacyRetrievals++;
      }

      // Combine and deduplicate
      results.combined = this.combineLearnings(results.hexagonal, results.legacy);

      // Sort by relevance
      results.combined.sort((a, b) => b.relevanceScore - a.relevanceScore);

      const duration = Date.now() - startTime;
      this.updateMetrics('retrieve', duration);

      this.metrics.coLearningRetrievals++;

      this.emit('learnings-retrieved', {
        agentId,
        hexCount: results.hexagonal.length,
        legacyCount: results.legacy.length,
        totalCount: results.combined.length,
        duration
      });

      return results.combined;

    } catch (error) {
      console.error('❌ Error retrieving learnings:', error.message);
      return [];
    }
  }

  /**
   * Retrieve learnings from legacy system
   * @param {string} agentId - Agent identifier
   * @param {Object} context - Retrieval context
   * @returns {Array} Legacy learnings
   */
  async retrieveLegacyLearnings(agentId, context) {
    if (!this.legacyMemory) return [];

    const agentKeys = this.integration.agentToLegacyMapping.get(agentId);
    if (!agentKeys || agentKeys.size === 0) return [];

    const learnings = [];

    for (const key of agentKeys) {
      const data = await this.legacyMemory.retrieve(key);
      if (data) {
        learnings.push({
          source: 'legacy',
          key,
          learning: data.data,
          relevanceScore: 0.5, // Default relevance for legacy
          contributedBy: data.agentId,
          qualityScore: data.qualityScore
        });
      }
    }

    return learnings;
  }

  /**
   * Combine learnings from different sources
   * @param {Array} hexLearnings - Hexagonal learnings
   * @param {Array} legacyLearnings - Legacy learnings
   * @returns {Array} Combined learnings
   */
  combineLearnings(hexLearnings, legacyLearnings) {
    const combined = [];
    const seenHashes = new Set();

    // Add hexagonal learnings (prioritized)
    for (const item of hexLearnings) {
      const hash = this.hashLearning(item.learning);
      if (!seenHashes.has(hash)) {
        combined.push({ ...item, source: 'hexagonal' });
        seenHashes.add(hash);
      }
    }

    // Add unique legacy learnings
    for (const item of legacyLearnings) {
      const hash = this.hashLearning(item.learning);
      if (!seenHashes.has(hash)) {
        combined.push(item);
        seenHashes.add(hash);
      }
    }

    return combined;
  }

  /**
   * Hash learning for deduplication
   * @param {Object} learning - Learning data
   * @returns {string} Hash
   */
  hashLearning(learning) {
    const key = JSON.stringify({
      type: learning.type,
      domain: learning.domain,
      timestamp: Math.floor((learning.contributedAt || Date.now()) / 60000) // 1-minute buckets
    });
    return key;
  }

  // ============ CONTEXT SYNCHRONIZATION ============

  /**
   * Subscribe agent to learning updates
   * @param {string} agentId - Agent identifier
   * @param {Array<string>} topics - Topics to subscribe to
   */
  subscribe(agentId, topics = ['*']) {
    if (!this.coLearningPool) return;

    topics.forEach(topic => {
      this.coLearningPool.subscribe(agentId, topic);
    });

    console.log(`🔔 Agent ${agentId} subscribed to updates`);
  }

  /**
   * Unsubscribe agent from updates
   * @param {string} agentId - Agent identifier
   * @param {Array<string>} topics - Topics to unsubscribe
   */
  unsubscribe(agentId, topics = ['*']) {
    if (!this.coLearningPool) return;

    topics.forEach(topic => {
      this.coLearningPool.unsubscribe(agentId, topic);
    });
  }

  // ============ PATTERN RECOGNITION ============

  /**
   * Get recognized patterns across all agents
   * @param {number} minSuccessCount - Minimum successes
   * @returns {Array} Recognized patterns
   */
  getRecognizedPatterns(minSuccessCount = 3) {
    if (!this.coLearningPool) return [];

    return this.coLearningPool.getRecognizedPatterns(minSuccessCount);
  }

  // ============ STATISTICS & MONITORING ============

  /**
   * Update performance metrics
   * @param {string} operation - Operation type
   * @param {number} duration - Duration in ms
   */
  updateMetrics(operation, duration) {
    const totalOps = this.metrics.hexagonalRetrievals +
                     this.metrics.coLearningRetrievals +
                     this.metrics.legacyRetrievals;

    this.metrics.averageRetrievalTime =
      (this.metrics.averageRetrievalTime * totalOps + duration) / (totalOps + 1);
  }

  /**
   * Get comprehensive statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const stats = {
      ...this.metrics,
      coLearningStats: this.coLearningPool?.getStatistics() || null,
      legacyStats: this.legacyMemory?.getStatistics?.() || null
    };

    return stats;
  }

  /**
   * Get system status
   * @returns {Object} Status
   */
  getStatus() {
    return {
      subsystems: {
        coLearning: !!this.coLearningPool,
        legacy: !!this.legacyMemory
      },
      coLearningStatus: this.coLearningPool?.getStatus() || null,
      metrics: this.metrics,
      integration: {
        legacyMappings: this.integration.legacyToHexMapping.size,
        agentMappings: this.integration.agentToLegacyMapping.size
      }
    };
  }

  /**
   * Visualize entire memory system
   * @returns {string} Visualization
   */
  visualize() {
    let output = '\n🔷 Advanced Crystalline Memory System\n';
    output += '=' .repeat(60) + '\n\n';

    if (this.coLearningPool) {
      output += this.coLearningPool.lattice.visualize(3);
      output += '\n';
      output += this.coLearningPool.visualizeAccessGraph();
    }

    output += '\n📊 System Statistics:\n';
    output += JSON.stringify(this.getStatistics(), null, 2);

    return output;
  }

  /**
   * Shutdown entire system
   */
  async shutdown() {
    console.log('🔷 Shutting down Advanced Crystalline Memory...');

    if (this.coLearningPool) {
      this.coLearningPool.shutdown();
    }

    if (this.legacyMemory) {
      await this.legacyMemory.shutdown();
    }

    this.integration.legacyToHexMapping.clear();
    this.integration.agentToLegacyMapping.clear();

    console.log('✅ Advanced Crystalline Memory shutdown complete');
  }
}

module.exports = AdvancedCrystallineMemory;
