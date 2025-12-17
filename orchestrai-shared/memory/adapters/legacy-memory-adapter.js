/**
 * Legacy Memory Adapter
 *
 * Compatibility layer for orchestrator migration from old CrystallineMemoryManager
 * to new 3-layer memory architecture. Maps old method names to new API.
 *
 * Old API → New API:
 * - storeMemory(data) → store(entity)
 * - retrieveMemory(query) → retrieve({ searchTerm: query })
 * - getMemoryPoolStats() → getStats()
 * - memoryPools (direct access) → available via store.memoryPools
 * - lattice.getNode() → available via store.lattice.getNode()
 */

const HexagonalLatticeStore = require('../stores/hexagonal-lattice-store');
const RedisAdapter = require('./redis-adapter');
const MCPAdapter = require('./mcp-adapter');
const logger = require('../../logging/logger').forAgent('legacy-memory-adapter', 'memory');

class LegacyMemoryAdapter {
  constructor(redisClient = null, config = {}) {
    this.logger = logger;
    this.config = config;

    // Create adapters
    this.redisAdapter = redisClient ? new RedisAdapter(redisClient, config) : null;
    this.mcpAdapter = config.mcpManager ? new MCPAdapter(config.mcpManager, config) : null;

    // Create the actual store
    this.store = new HexagonalLatticeStore({
      namespace: config.namespace || 'orchestrai',
      maxRadius: config.maxRadius || 15,
      redis: this.redisAdapter,
      mcp: this.mcpAdapter,
      ...config
    });

    // Initialize on next tick to avoid constructor async issues
    setImmediate(() => {
      this.store.initialize().catch(error => {
        this.logger.error('Failed to initialize memory store', { error: error.message });
      });
    });

    this.logger.info('Legacy Memory Adapter created', {
      hasRedis: !!redisClient,
      hasMCP: !!config.mcpManager
    });
  }

  /**
   * Store memory (legacy method name)
   * Maps to store.store()
   *
   * @param {Object} data - Memory data
   * @returns {Promise<string>} Node ID
   */
  async storeMemory(data) {
    try {
      // Transform old data format to new entity format if needed
      const entity = {
        name: data.name || data.content || `memory-${Date.now()}`,
        type: data.type || 'memory',
        domain: data.domain || 'global',
        observations: data.observations || data.facts || [],
        metadata: data.metadata || {},
        importance: data.importance || 0.5
      };

      const nodeId = await this.store.store(entity);

      this.logger.debug('Memory stored via legacy adapter', {
        nodeId,
        domain: entity.domain
      });

      return nodeId;

    } catch (error) {
      this.logger.error('Failed to store memory (legacy adapter)', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Retrieve memory (legacy method name)
   * Maps to store.retrieve()
   *
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Search results
   */
  async retrieveMemory(query, options = {}) {
    try {
      const results = await this.store.retrieve({
        searchTerm: typeof query === 'string' ? query : query.query,
        domain: query.domain || options.domain,
        type: query.type || options.type,
        maxResults: options.maxResults || 10,
        ...options
      });

      this.logger.debug('Memory retrieved via legacy adapter', {
        query: typeof query === 'string' ? query : query.query,
        resultCount: results.entities?.length || 0
      });

      return results;

    } catch (error) {
      this.logger.error('Failed to retrieve memory (legacy adapter)', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get memory pool statistics (legacy method name)
   * Maps to store.getStats()
   *
   * @returns {Object} Statistics
   */
  async getMemoryPoolStats() {
    try {
      const stats = this.store.getStats();

      this.logger.debug('Memory stats retrieved via legacy adapter', {
        stores: stats.stores,
        retrieves: stats.retrieves,
        hitRate: stats.hitRate
      });

      return {
        ...stats,
        // Add legacy format fields for compatibility
        totalNodes: stats.totalNodes,
        domains: stats.memoryPools,
        latticeNodes: stats.totalNodes
      };

    } catch (error) {
      this.logger.error('Failed to get memory stats (legacy adapter)', {
        error: error.message
      });
      return {
        stores: 0,
        retrieves: 0,
        hitRate: '0.00%',
        totalNodes: 0,
        domains: 0
      };
    }
  }

  /**
   * Direct access to memory pools (for compatibility)
   * @returns {Map} Memory pools
   */
  get memoryPools() {
    return this.store.memoryPools;
  }

  /**
   * Direct access to lattice (for compatibility)
   * @returns {HexagonalMemoryLattice} Lattice instance
   */
  get lattice() {
    return this.store.lattice;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  get performance() {
    return this.store.performance;
  }
}

module.exports = LegacyMemoryAdapter;
