/**
 * Hexagonal Lattice Store - Data Access Layer
 *
 * Implements MemoryRepository interface using hexagonal memory lattice for
 * geometric memory storage. Coordinates between lattice structure and
 * persistence adapters (Redis, MCP).
 *
 * Design Pattern: Repository Implementation + Facade
 * - Implements MemoryRepository contract
 * - Wraps HexagonalMemoryLattice with clean interface
 * - Coordinates persistence through adapters
 * - Handles geometric memory operations
 *
 * Features:
 * - Hexagonal geometric memory structure
 * - Multi-layer organization (Core → Domain → Task)
 * - Path optimization and caching
 * - Self-organization and restructuring
 * - Dual persistence (Redis + MCP)
 * - Graceful degradation when adapters unavailable
 */

const { MemoryRepository } = require('../repository/memory-repository');
const HexagonalMemoryLattice = require('../hexagonal-memory-lattice');
const logger = require('../../logging/logger').forAgent('hexagonal-lattice-store', 'memory');
const { RecoverableError, OrchestRAIError } = require('../../errors/typed-errors');

class HexagonalLatticeStore extends MemoryRepository {
  constructor(config = {}) {
    // Initialize instance variables BEFORE super() to avoid issues with auto-initialization
    // Memory pools by domain (must be initialized before super call)
    const memoryPools = new Map();

    // Disable auto-initialization to prevent race conditions
    const safeConfig = {
      ...config,
      autoInitialize: false
    };

    super(safeConfig);

    // Now safe to assign instance variables
    this.memoryPools = memoryPools;

    // Hexagonal lattice configuration
    this.latticeConfig = {
      maxRadius: config.maxRadius || 15,
      autoOrganize: config.autoOrganize !== false,
      organizationInterval: config.organizationInterval || 120000, // 2 minutes
      enablePathCaching: config.enablePathCaching !== false,
      ...config.latticeConfig
    };

    // Hexagonal memory lattice (core data structure)
    this.lattice = new HexagonalMemoryLattice(this.latticeConfig);

    // Persistence adapters
    this.redisAdapter = config.redis || null;
    this.mcpAdapter = config.mcp || null;

    // Performance tracking
    this.performance = {
      stores: 0,
      retrieves: 0,
      hits: 0,
      misses: 0,
      avgStoreTime: 0,
      avgRetrieveTime: 0,
      lastRestructure: Date.now()
    };

    this.logger = logger;

    this.logger.info('Hexagonal Lattice Store initialized', {
      maxRadius: this.latticeConfig.maxRadius,
      autoOrganize: this.latticeConfig.autoOrganize,
      redisAvailable: !!this.redisAdapter,
      mcpAvailable: !!this.mcpAdapter
    });
  }

  // ============ REPOSITORY INTERFACE IMPLEMENTATION ============

  /**
   * Store memory entity
   *
   * @param {Object} data - Entity data
   * @returns {Promise<string>} Entity ID (nodeId)
   */
  async store(data) {
    const timer = this.logger.time('Store operation');
    const startTime = Date.now();

    try {
      // Validate entity
      const validated = this.validateEntity(data);

      // Generate coordinates for new node
      const coordinates = this.generateSpiralCoordinates(
        this.memoryPools.get(validated.domain)?.length || 0
      );

      // Create node in lattice
      const memoryData = {
        domain: validated.domain,
        content: validated.name,
        type: validated.type,
        observations: validated.observations,
        metadata: {
          ...validated.metadata,
          importance: validated.importance,
          lastAccess: Date.now(),
          accessCount: 0,
          tags: validated.tags
        }
      };

      const nodeId = await this.lattice.createNode(
        coordinates.q,
        coordinates.r,
        memoryData,
        'memory'
      );

      if (!nodeId) {
        throw new OrchestRAIError(
          'Failed to create node in hexagonal lattice',
          { coordinates, data: validated }
        );
      }

      // Track in memory pool (defensive pattern to avoid race conditions)
      let pool = this.memoryPools.get(validated.domain);
      if (!pool) {
        pool = [];
        this.memoryPools.set(validated.domain, pool);
      }
      pool.push(nodeId);

      // Persist to Redis if available
      if (this.redisAdapter?.isAvailable()) {
        const key = this.generateKey(validated.domain, validated.type, nodeId);
        await this.redisAdapter.set(key, {
          nodeId,
          coordinates,
          ...memoryData
        }).catch(error => {
          this.logger.warn('Redis persistence failed (non-fatal)', {
            nodeId,
            error: error.message
          });
        });
      }

      // Persist to MCP if available
      if (this.mcpAdapter?.isAvailable()) {
        await this.mcpAdapter.createEntities([{
          name: validated.name,
          entityType: validated.type,
          observations: validated.observations
        }]).catch(error => {
          this.logger.warn('MCP persistence failed (non-fatal)', {
            nodeId,
            error: error.message
          });
        });
      }

      // Update performance metrics
      const duration = Date.now() - startTime;
      this.performance.stores++;
      this.performance.avgStoreTime =
        (this.performance.avgStoreTime * (this.performance.stores - 1) + duration) /
        this.performance.stores;

      timer();

      this.logger.info('Memory entity stored', {
        nodeId,
        domain: validated.domain,
        type: validated.type,
        coordinates,
        duration
      });

      return nodeId;

    } catch (error) {
      this.logger.error('Failed to store memory entity', {
        error: error.message,
        data
      });
      throw error;
    }
  }

  /**
   * Retrieve memory by query
   *
   * @param {Object} query - Search criteria
   * @returns {Promise<Object>} Search results
   */
  async retrieve(query) {
    const timer = this.logger.time('Retrieve operation');
    const startTime = Date.now();

    try {
      // Validate query
      const validated = this.validateQuery(query);

      // Try MCP first (most comprehensive search)
      if (this.mcpAdapter?.isAvailable()) {
        const mcpResults = await this.mcpAdapter.searchNodes(
          validated.searchTerm || validated.query || ''
        ).catch(error => {
          this.logger.warn('MCP search failed, falling back to lattice', {
            error: error.message
          });
          return null;
        });

        if (mcpResults && mcpResults.nodes.length > 0) {
          const duration = Date.now() - startTime;
          this.performance.retrieves++;
          this.performance.hits++;
          timer();

          this.logger.debug('Retrieved from MCP', {
            resultCount: mcpResults.nodes.length,
            duration
          });

          return {
            entities: mcpResults.nodes,
            relationships: mcpResults.relations || [],
            source: 'mcp'
          };
        }
      }

      // Fallback to lattice search
      const searchData = {
        content: validated.searchTerm || validated.query,
        domain: validated.domain,
        type: validated.type,
        tags: validated.tags
      };

      const allPools = validated.domain
        ? [validated.domain]
        : Array.from(this.memoryPools.keys());

      const allResults = [];

      for (const domain of allPools) {
        const nodeIds = this.memoryPools.get(domain) || [];

        for (const nodeId of nodeIds) {
          const candidates = await this.lattice.findOptimalPath(
            nodeId,
            searchData,
            validated.maxResults
          );
          allResults.push(...candidates);
        }
      }

      // Deduplicate and sort by similarity
      const uniqueResults = this.deduplicateResults(allResults);
      const topResults = uniqueResults
        .filter(r => r.similarity >= validated.minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, validated.maxResults);

      // Reinforce successful paths
      if (topResults.length > 0) {
        await this.reinforcePaths(topResults);
        this.performance.hits++;
      } else {
        this.performance.misses++;
      }

      // Update performance metrics
      const duration = Date.now() - startTime;
      this.performance.retrieves++;
      this.performance.avgRetrieveTime =
        (this.performance.avgRetrieveTime * (this.performance.retrieves - 1) + duration) /
        this.performance.retrieves;

      timer();

      this.logger.debug('Retrieved from lattice', {
        resultCount: topResults.length,
        duration,
        source: 'lattice'
      });

      return {
        entities: topResults.map(r => ({
          nodeId: r.node.id,
          name: r.node.data.content,
          type: r.node.data.type,
          domain: r.node.data.domain,
          observations: r.node.data.observations || [],
          similarity: r.similarity,
          metadata: r.node.data.metadata,
          coordinates: { q: r.node.q, r: r.node.r }
        })),
        relationships: [],
        source: 'lattice'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve memory', {
        error: error.message,
        query
      });
      throw error;
    }
  }

  /**
   * Create relation between entities
   *
   * @param {Object} relation - Relation data
   * @returns {Promise<Object>} Relation result
   */
  async createRelation(relation) {
    try {
      // Validate relation
      const validated = this.validateRelation(relation);

      // Create in MCP if available (primary relations store)
      if (this.mcpAdapter?.isAvailable()) {
        const result = await this.mcpAdapter.createRelations([validated]);

        this.logger.info('Relation created in MCP', {
          from: validated.from,
          to: validated.to,
          relationType: validated.relationType
        });

        return result;
      }

      // Fallback: Store in Redis if available
      if (this.redisAdapter?.isAvailable()) {
        const key = this.generateKey('relations', validated.relationType, `${validated.from}-${validated.to}`);
        await this.redisAdapter.set(key, validated);

        this.logger.info('Relation created in Redis (fallback)', {
          from: validated.from,
          to: validated.to,
          relationType: validated.relationType
        });

        return { success: true, key };
      }

      // No persistence available
      this.logger.warn('Relation created in memory only (no persistence)', {
        from: validated.from,
        to: validated.to
      });

      return { success: true, stored: 'memory-only' };

    } catch (error) {
      this.logger.error('Failed to create relation', {
        error: error.message,
        relation
      });
      throw error;
    }
  }

  /**
   * Add observations to entity
   *
   * @param {string} entityId - Entity identifier (nodeId or name)
   * @param {Array<string>} observations - Observations to add
   * @returns {Promise<Object>} Update result
   */
  async addObservations(entityId, observations) {
    try {
      if (!Array.isArray(observations) || observations.length === 0) {
        throw new OrchestRAIError(
          'Observations must be a non-empty array',
          { entityId, observations }
        );
      }

      // Add to MCP if available
      if (this.mcpAdapter?.isAvailable()) {
        const result = await this.mcpAdapter.addObservations([{
          entityName: entityId,
          contents: observations
        }]);

        this.logger.info('Observations added in MCP', {
          entityId,
          observationCount: observations.length
        });

        return result;
      }

      // Fallback: Update in lattice
      const node = await this.lattice.getNode(entityId);
      if (node) {
        node.data.observations = node.data.observations || [];
        node.data.observations.push(...observations);

        this.logger.info('Observations added in lattice (fallback)', {
          entityId,
          observationCount: observations.length
        });

        return { success: true, count: observations.length };
      }

      throw new OrchestRAIError(
        'Entity not found',
        { entityId }
      );

    } catch (error) {
      this.logger.error('Failed to add observations', {
        error: error.message,
        entityId
      });
      throw error;
    }
  }

  /**
   * Search for similar entities
   *
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum results
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Similar entities
   */
  async searchSimilar(query, maxResults = 10, filters = {}) {
    return this.retrieve({
      searchTerm: query,
      maxResults,
      ...filters
    });
  }

  /**
   * Initialize repository
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger.info('Initializing Hexagonal Lattice Store');

    try {
      // Initialize adapters
      if (this.redisAdapter) {
        this.logger.info('Redis adapter available for persistence');
      }

      if (this.mcpAdapter) {
        this.logger.info('MCP adapter available for knowledge graph');
      }

      // Lattice is already initialized in constructor
      this.initialized = true;

      this.logger.info('Hexagonal Lattice Store ready', {
        maxRadius: this.latticeConfig.maxRadius,
        autoOrganize: this.latticeConfig.autoOrganize,
        adapters: {
          redis: !!this.redisAdapter,
          mcp: !!this.mcpAdapter
        }
      });

    } catch (error) {
      this.logger.error('Failed to initialize Hexagonal Lattice Store', {
        error: error.message
      });
      throw error;
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Generate spiral coordinates for new node
   *
   * @param {number} index - Node index
   * @returns {Object} { q, r, s }
   */
  generateSpiralCoordinates(index) {
    // Ulam spiral pattern for hexagonal grid
    const spiral = [];
    let q = 0, r = 0;

    spiral.push({ q, r, s: -q - r });

    for (let radius = 1; radius <= this.latticeConfig.maxRadius; radius++) {
      // Start at (radius, -radius)
      q = radius;
      r = -radius;

      // Six directions around hexagon
      const directions = [
        { dq: 0, dr: 1 },   // SE
        { dq: -1, dr: 1 },  // S
        { dq: -1, dr: 0 },  // SW
        { dq: 0, dr: -1 },  // NW
        { dq: 1, dr: -1 },  // N
        { dq: 1, dr: 0 }    // NE
      ];

      for (const dir of directions) {
        for (let i = 0; i < radius; i++) {
          spiral.push({ q, r, s: -q - r });
          q += dir.dq;
          r += dir.dr;
        }
      }
    }

    return spiral[index % spiral.length] || { q: 0, r: 0, s: 0 };
  }

  /**
   * Deduplicate search results
   *
   * @param {Array} results - Raw results
   * @returns {Array} Deduplicated results
   */
  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = result.node?.id || JSON.stringify(result);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Reinforce successful paths
   *
   * @param {Array} results - Successful results
   */
  async reinforcePaths(results) {
    // Update access counts and importance
    for (const result of results) {
      if (result.node && result.node.data.metadata) {
        result.node.data.metadata.lastAccess = Date.now();
        result.node.data.metadata.accessCount =
          (result.node.data.metadata.accessCount || 0) + 1;

        // Increase importance for frequently accessed nodes
        if (result.node.data.metadata.accessCount > 10) {
          result.node.data.metadata.importance = Math.min(
            1.0,
            (result.node.data.metadata.importance || 0.5) + 0.05
          );
        }
      }
    }
  }

  // ============ STATISTICS ============

  /**
   * Get store statistics
   *
   * @returns {Object} Statistics
   */
  getStats() {
    const hitRate = this.performance.retrieves > 0
      ? (this.performance.hits / this.performance.retrieves) * 100
      : 0;

    return {
      ...this.performance,
      hitRate: hitRate.toFixed(2) + '%',
      memoryPools: this.memoryPools.size,
      totalNodes: Array.from(this.memoryPools.values())
        .reduce((sum, pool) => sum + pool.length, 0),
      adapters: {
        redis: this.redisAdapter?.isAvailable() || false,
        mcp: this.mcpAdapter?.isAvailable() || false
      }
    };
  }
}

module.exports = HexagonalLatticeStore;
