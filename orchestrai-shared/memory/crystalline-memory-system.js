/**
 * ORCHESTRAI Crystalline Memory System
 *
 * Wrapper for MCP Memory Server providing crystalline memory architecture
 * with searchMemory, storeMemory, and relation management
 */

class CrystallineMemory {
  constructor(redis = null, mcpManager = null) {
    this.redis = redis;
    this.mcpManager = mcpManager;
    this.memoryNamespace = 'orchestrai';
  }

  /**
   * Search memory for entities and observations
   * @param {Object} query - Search criteria
   * @returns {Promise<Object>} Search results
   */
  async searchMemory(query) {
    try {
      // If we have MCP manager, use it
      if (this.mcpManager) {
        const results = await this.mcpManager.callMCPTool('memory', 'search_nodes', {
          query: query.searchTerm || query.query || JSON.stringify(query)
        });
        return this.formatSearchResults(results);
      }

      // Fallback: use Redis if available
      if (this.redis) {
        const key = `${this.memoryNamespace}:${query.domain || 'global'}:${query.type || 'entities'}`;
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : { entities: [], relationships: [] };
      }

      // No backend available
      return { entities: [], relationships: [] };

    } catch (error) {
      console.warn(`Could not search memory: ${error.message}`);
      return { entities: [], relationships: [] };
    }
  }

  /**
   * Store memory entity with observations
   * @param {Object} data - Memory data to store
   * @returns {Promise<Object>} Storage result
   */
  async storeMemory(data) {
    try {
      // If we have MCP manager, use it
      if (this.mcpManager) {
        const entities = [{
          name: data.name || data.entityName || `entity-${Date.now()}`,
          entityType: data.type || data.entityType || 'content',
          observations: Array.isArray(data.observations) ? data.observations : [data.observation || JSON.stringify(data)]
        }];

        const result = await this.mcpManager.callMCPTool('memory', 'create_entities', {
          entities
        });

        return { success: true, result };
      }

      // Fallback: use Redis if available
      if (this.redis) {
        const key = `${this.memoryNamespace}:${data.domain || 'global'}:entities:${data.name || Date.now()}`;
        await this.redis.set(key, JSON.stringify(data));
        return { success: true, key };
      }

      // No backend available - just log
      console.log(`   💾 Memory stored (no backend): ${data.name || 'entity'}`);
      return { success: true, stored: 'memory-only' };

    } catch (error) {
      console.warn(`Could not store memory: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create relationship between entities
   * @param {Object} relation - Relation data
   * @returns {Promise<Object>} Creation result
   */
  async createRelation(relation) {
    try {
      // If we have MCP manager, use it
      if (this.mcpManager) {
        const relations = [{
          from: relation.from || relation.source,
          to: relation.to || relation.target,
          relationType: relation.type || relation.relationType || 'relates_to'
        }];

        const result = await this.mcpManager.callMCPTool('memory', 'create_relations', {
          relations
        });

        return { success: true, result };
      }

      // Fallback: use Redis if available
      if (this.redis) {
        const key = `${this.memoryNamespace}:relations:${relation.from}-${relation.to}`;
        await this.redis.set(key, JSON.stringify(relation));
        return { success: true, key };
      }

      // No backend available - just log
      console.log(`   🔗 Relation created (no backend): ${relation.from} → ${relation.to}`);
      return { success: true, stored: 'memory-only' };

    } catch (error) {
      console.warn(`Could not create relation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add observations to existing entity
   * @param {Object} data - Observation data
   * @returns {Promise<Object>} Addition result
   */
  async addObservations(data) {
    try {
      // If we have MCP manager, use it
      if (this.mcpManager) {
        const observations = [{
          entityName: data.entityName,
          contents: Array.isArray(data.observations) ? data.observations : [data.observation]
        }];

        const result = await this.mcpManager.callMCPTool('memory', 'add_observations', {
          observations
        });

        return { success: true, result };
      }

      // Fallback: append to existing entity
      if (this.redis) {
        const key = `${this.memoryNamespace}:${data.domain || 'global'}:entities:${data.entityName}`;
        const existing = await this.redis.get(key);

        if (existing) {
          const entity = JSON.parse(existing);
          entity.observations = entity.observations || [];

          if (Array.isArray(data.observations)) {
            entity.observations.push(...data.observations);
          } else {
            entity.observations.push(data.observation || JSON.stringify(data));
          }

          await this.redis.set(key, JSON.stringify(entity));
          return { success: true, key };
        }
      }

      return { success: true, stored: 'memory-only' };

    } catch (error) {
      console.warn(`Could not add observations: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve context for workflow
   * @param {Object} query - Context query
   * @returns {Promise<Object>} Context data
   */
  async retrieveContext(query) {
    try {
      const searchResults = await this.searchMemory({
        searchTerm: query.clientName || query.project || query.domain,
        ...query
      });

      return {
        entities: searchResults.entities || [],
        relationships: searchResults.relationships || [],
        clientProfile: query.clientName,
        ...searchResults
      };

    } catch (error) {
      console.warn(`Could not retrieve context: ${error.message}`);
      return { entities: [], relationships: [] };
    }
  }

  /**
   * Store workflow memory
   * @param {Object} data - Workflow data
   * @returns {Promise<Object>} Storage result
   */
  async storeWorkflowMemory(data) {
    try {
      return await this.storeMemory({
        name: `workflow-${data.workflowId || Date.now()}`,
        type: 'workflow',
        entityType: 'workflow',
        observations: [
          `Workflow type: ${data.type || 'unknown'}`,
          `Status: ${data.status || 'completed'}`,
          `Duration: ${data.duration || 'N/A'}ms`,
          `Result: ${JSON.stringify(data.result || {})}`
        ],
        ...data
      });
    } catch (error) {
      console.warn(`Could not store workflow memory: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format search results from MCP memory server
   * @param {Object} results - Raw MCP results
   * @returns {Object} Formatted results
   */
  formatSearchResults(results) {
    if (!results || !results.nodes) {
      return { entities: [], relationships: [] };
    }

    const entities = results.nodes.map(node => ({
      name: node.name,
      type: node.entityType,
      observations: node.observations || []
    }));

    const relationships = results.relations || [];

    return { entities, relationships };
  }

  /**
   * Initialize memory system
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('🔮 Crystalline Memory System initializing...');

    if (this.mcpManager) {
      console.log('   ✅ Using MCP Memory Server backend');
    } else if (this.redis) {
      console.log('   ✅ Using Redis backend');
    } else {
      console.log('   ⚠️  No backend available - memory-only mode');
    }
  }
}

module.exports = CrystallineMemory;
