/**
 * MCP (Model Context Protocol) Adapter for Memory Integration
 *
 * Integrates with MCP Memory Server for persistent knowledge graph storage.
 * Provides entity management, relation creation, and observation tracking.
 *
 * Design Pattern: Adapter Pattern
 * - Wraps MCP Manager with memory-specific operations
 * - Translates between ORCHESTRAI memory model and MCP protocol
 * - Provides fallback handling when MCP unavailable
 *
 * Features:
 * - Entity lifecycle management (create, search, delete)
 * - Relation management between entities
 * - Observation tracking and accumulation
 * - Graceful degradation when MCP unavailable
 * - Result formatting and normalization
 */

const logger = require('../../logging/logger').forAgent('mcp-adapter', 'memory');
const { NetworkError, RecoverableError } = require('../../errors/typed-errors');

class MCPAdapter {
  constructor(mcpManager = null, config = {}) {
    this.mcpManager = mcpManager;
    this.config = {
      serverName: config.serverName || 'memory',
      enableFallback: config.enableFallback !== false,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.available = !!mcpManager;

    // Statistics
    this.stats = {
      operations: 0,
      entities: {
        created: 0,
        searched: 0,
        deleted: 0
      },
      relations: {
        created: 0,
        deleted: 0
      },
      observations: {
        added: 0
      },
      errors: 0
    };

    this.logger = logger;

    if (!this.mcpManager) {
      this.logger.warn('MCP Manager not provided - adapter will operate in fallback mode', {
        mode: 'memory-only',
        fallbackEnabled: this.config.enableFallback
      });
    } else {
      this.logger.info('MCP Adapter initialized', {
        serverName: this.config.serverName,
        available: this.available
      });
    }
  }

  // ============ AVAILABILITY CHECKS ============

  /**
   * Check if MCP is available
   *
   * @returns {boolean} True if MCP Manager available
   */
  isAvailable() {
    return this.available && this.mcpManager;
  }

  /**
   * Ensure MCP connection is available
   *
   * @throws {NetworkError} If MCP unavailable and fallback disabled
   */
  ensureConnection() {
    if (!this.isAvailable()) {
      if (this.config.enableFallback) {
        throw new RecoverableError(
          'MCP Memory Server unavailable',
          null, // No fallback value
          {
            service: 'MCP',
            serverName: this.config.serverName,
            fallbackEnabled: true
          },
          false // Not retryable immediately
        );
      } else {
        throw new NetworkError(
          'MCP Memory Server unavailable',
          {
            service: 'MCP',
            serverName: this.config.serverName,
            retryable: false
          }
        );
      }
    }
  }

  // ============ ENTITY OPERATIONS ============

  /**
   * Create entities in MCP memory
   *
   * @param {Array<Object>} entities - Array of entities to create
   * @param {string} entities[].name - Entity name
   * @param {string} entities[].entityType - Entity type
   * @param {Array<string>} entities[].observations - Entity observations
   * @returns {Promise<Object>} Creation result
   * @throws {NetworkError} If MCP unavailable
   *
   * @example
   *   await adapter.createEntities([{
   *     name: 'agent-seo-specialist',
   *     entityType: 'agent-performance',
   *     observations: ['Completed task in 45s', 'Quality score: 0.95']
   *   }]);
   */
  async createEntities(entities) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      // Validate entities structure
      const validatedEntities = entities.map(entity => ({
        name: entity.name || entity.entityName || `entity-${Date.now()}`,
        entityType: entity.entityType || entity.type || 'memory',
        observations: Array.isArray(entity.observations)
          ? entity.observations
          : entity.observation
            ? [entity.observation]
            : [JSON.stringify(entity)]
      }));

      const timer = this.logger.time('MCP create_entities', {
        entityCount: validatedEntities.length
      });

      const result = await this.mcpManager.callMCPTool(
        this.config.serverName,
        'create_entities',
        { entities: validatedEntities }
      );

      timer();

      this.stats.entities.created += validatedEntities.length;

      this.logger.info('Entities created in MCP', {
        count: validatedEntities.length,
        names: validatedEntities.map(e => e.name)
      });

      return { success: true, result, count: validatedEntities.length };

    } catch (error) {
      this.stats.errors++;

      if (error instanceof RecoverableError || error instanceof NetworkError) {
        this.logger.warn('MCP entity creation failed (recoverable)', {
          error: error.message,
          entityCount: entities.length
        });
        throw error;
      }

      this.logger.error('Failed to create entities in MCP', {
        error: error.message,
        entityCount: entities.length
      });

      throw new NetworkError(
        'MCP entity creation failed',
        {
          service: 'MCP',
          operation: 'create_entities',
          error: error.message,
          retryable: true
        }
      );
    }
  }

  /**
   * Search for nodes in MCP memory
   *
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results { nodes: [], relations: [] }
   * @throws {NetworkError} If MCP unavailable
   */
  async searchNodes(query) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      const timer = this.logger.time('MCP search_nodes', { query });

      const result = await this.mcpManager.callMCPTool(
        this.config.serverName,
        'search_nodes',
        { query: typeof query === 'string' ? query : JSON.stringify(query) }
      );

      timer();

      this.stats.entities.searched++;

      const formatted = this.formatSearchResults(result);

      this.logger.debug('MCP search completed', {
        query,
        resultCount: formatted.nodes?.length || 0
      });

      return formatted;

    } catch (error) {
      this.stats.errors++;

      if (error instanceof RecoverableError || error instanceof NetworkError) {
        this.logger.warn('MCP search failed (recoverable)', {
          error: error.message,
          query
        });
        return { nodes: [], relations: [] };
      }

      this.logger.error('Failed to search MCP memory', {
        error: error.message,
        query
      });

      return { nodes: [], relations: [] };
    }
  }

  /**
   * Open specific nodes by names
   *
   * @param {Array<string>} names - Entity names to retrieve
   * @returns {Promise<Array>} Retrieved entities
   */
  async openNodes(names) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      const result = await this.mcpManager.callMCPTool(
        this.config.serverName,
        'open_nodes',
        { names }
      );

      this.logger.debug('MCP nodes opened', {
        requestedCount: names.length,
        retrievedCount: result?.nodes?.length || 0
      });

      return result?.nodes || [];

    } catch (error) {
      this.stats.errors++;
      this.logger.warn('Failed to open MCP nodes', {
        error: error.message,
        names
      });
      return [];
    }
  }

  // ============ RELATION OPERATIONS ============

  /**
   * Create relations between entities
   *
   * @param {Array<Object>} relations - Array of relations
   * @param {string} relations[].from - Source entity
   * @param {string} relations[].to - Target entity
   * @param {string} relations[].relationType - Relation type
   * @returns {Promise<Object>} Creation result
   */
  async createRelations(relations) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      // Validate relations structure
      const validatedRelations = relations.map(rel => ({
        from: rel.from || rel.source,
        to: rel.to || rel.target,
        relationType: rel.relationType || rel.type || 'relates_to'
      }));

      const timer = this.logger.time('MCP create_relations', {
        relationCount: validatedRelations.length
      });

      const result = await this.mcpManager.callMCPTool(
        this.config.serverName,
        'create_relations',
        { relations: validatedRelations }
      );

      timer();

      this.stats.relations.created += validatedRelations.length;

      this.logger.info('Relations created in MCP', {
        count: validatedRelations.length
      });

      return { success: true, result, count: validatedRelations.length };

    } catch (error) {
      this.stats.errors++;

      this.logger.error('Failed to create relations in MCP', {
        error: error.message,
        relationCount: relations.length
      });

      throw new NetworkError(
        'MCP relation creation failed',
        {
          service: 'MCP',
          operation: 'create_relations',
          error: error.message,
          retryable: true
        }
      );
    }
  }

  // ============ OBSERVATION OPERATIONS ============

  /**
   * Add observations to existing entities
   *
   * @param {Array<Object>} observations - Observations to add
   * @param {string} observations[].entityName - Entity name
   * @param {Array<string>} observations[].contents - Observation contents
   * @returns {Promise<Object>} Addition result
   */
  async addObservations(observations) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      // Validate observations structure
      const validatedObservations = observations.map(obs => ({
        entityName: obs.entityName,
        contents: Array.isArray(obs.contents)
          ? obs.contents
          : obs.observation
            ? [obs.observation]
            : [JSON.stringify(obs)]
      }));

      const timer = this.logger.time('MCP add_observations', {
        observationCount: validatedObservations.length
      });

      const result = await this.mcpManager.callMCPTool(
        this.config.serverName,
        'add_observations',
        { observations: validatedObservations }
      );

      timer();

      const totalObservations = validatedObservations.reduce(
        (sum, obs) => sum + obs.contents.length,
        0
      );

      this.stats.observations.added += totalObservations;

      this.logger.info('Observations added in MCP', {
        entityCount: validatedObservations.length,
        observationCount: totalObservations
      });

      return { success: true, result, count: totalObservations };

    } catch (error) {
      this.stats.errors++;

      this.logger.error('Failed to add observations in MCP', {
        error: error.message,
        observationCount: observations.length
      });

      throw new NetworkError(
        'MCP observation addition failed',
        {
          service: 'MCP',
          operation: 'add_observations',
          error: error.message,
          retryable: true
        }
      );
    }
  }

  // ============ RESULT FORMATTING ============

  /**
   * Format search results from MCP
   *
   * @param {Object} results - Raw MCP results
   * @returns {Object} Formatted results { nodes: [], relations: [] }
   */
  formatSearchResults(results) {
    if (!results || !results.nodes) {
      return { nodes: [], relations: [] };
    }

    const nodes = results.nodes.map(node => ({
      name: node.name,
      type: node.entityType,
      entityType: node.entityType,
      observations: node.observations || []
    }));

    const relations = results.relations || [];

    return { nodes, relations };
  }

  // ============ STATISTICS ============

  /**
   * Get adapter statistics
   *
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      available: this.available,
      serverName: this.config.serverName
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      operations: 0,
      entities: {
        created: 0,
        searched: 0,
        deleted: 0
      },
      relations: {
        created: 0,
        deleted: 0
      },
      observations: {
        added: 0
      },
      errors: 0
    };

    this.logger.debug('Statistics reset');
  }
}

module.exports = MCPAdapter;
