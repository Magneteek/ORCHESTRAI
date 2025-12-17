/**
 * Memory Repository Interface
 *
 * Abstract interface defining the contract for all memory operations in ORCHESTRAI.
 * Provides a uniform API for storing, retrieving, and managing memory entities
 * across different storage backends (hexagonal lattice, Redis, MCP).
 *
 * Design Pattern: Repository Pattern
 * - Abstracts data access logic from business logic
 * - Allows swapping implementations without changing consumers
 * - Enables easier testing with mock implementations
 *
 * All implementations MUST provide these methods.
 *
 * Usage:
 *   class MyMemoryStore extends MemoryRepository {
 *     async store(data) {
 *       // Implementation specific logic
 *     }
 *     // ... implement other methods
 *   }
 */

const logger = require('../../logging/logger').forDomain('memory');
const { ValidationError, OrchestRAIError } = require('../../errors/typed-errors');
const { z } = require('../../validation/schemas');

/**
 * Memory Entity Schema
 * Validates structure of memory entities before storage
 */
const MemoryEntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  type: z.string().optional().default('memory'),
  entityType: z.string().optional().default('memory'),
  domain: z.string().optional().default('global'),
  observations: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().default({}),
  importance: z.number().min(0).max(1).optional().default(0.5),
  tags: z.array(z.string()).optional().default([])
});

/**
 * Memory Query Schema
 * Validates search query structure
 */
const MemoryQuerySchema = z.object({
  searchTerm: z.string().optional(),
  query: z.string().optional(),
  domain: z.string().optional(),
  type: z.string().optional(),
  entityType: z.string().optional(),
  maxResults: z.number().int().positive().optional().default(10),
  minSimilarity: z.number().min(0).max(1).optional().default(0.5),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Memory Relation Schema
 * Validates relation structure between entities
 */
const MemoryRelationSchema = z.object({
  from: z.string().min(1, 'Source entity is required'),
  to: z.string().min(1, 'Target entity is required'),
  relationType: z.string().min(1, 'Relation type is required'),
  metadata: z.record(z.any()).optional().default({})
});

/**
 * Abstract Memory Repository
 *
 * Base class that all memory storage implementations must extend.
 * Enforces consistent interface across different storage backends.
 */
class MemoryRepository {
  constructor(config = {}) {
    if (new.target === MemoryRepository) {
      throw new OrchestRAIError(
        'MemoryRepository is abstract and cannot be instantiated directly',
        { expectedUsage: 'Extend MemoryRepository and implement all methods' }
      );
    }

    this.config = {
      namespace: config.namespace || 'orchestrai',
      autoInitialize: config.autoInitialize !== false,
      ...config
    };

    this.logger = logger.forAgent('memory-repository', 'memory');
    this.initialized = false;

    if (this.config.autoInitialize) {
      // Async initialization - caller should await initialize()
      this.initialize().catch(error => {
        this.logger.error('Auto-initialization failed', { error: error.message });
      });
    }
  }

  // ============ ABSTRACT METHODS (Must be implemented) ============

  /**
   * Store memory entity
   *
   * @param {Object} data - Entity data conforming to MemoryEntitySchema
   * @param {string} data.name - Entity name/identifier
   * @param {string} [data.type] - Entity type
   * @param {string} [data.domain] - Domain/category
   * @param {Array<string>} [data.observations] - Observations/facts
   * @param {Object} [data.metadata] - Additional metadata
   * @returns {Promise<string>} Entity ID
   * @throws {ValidationError} If data is invalid
   * @throws {OrchestRAIError} If storage fails
   *
   * @example
   *   const entityId = await repository.store({
   *     name: 'agent-seo-specialist',
   *     type: 'agent-performance',
   *     domain: 'seo',
   *     observations: ['Completed keyword research in 45s', 'Quality score: 0.95'],
   *     metadata: { taskId: 'task-123' }
   *   });
   */
  async store(data) {
    throw new OrchestRAIError(
      'store() must be implemented by subclass',
      { class: this.constructor.name, method: 'store' }
    );
  }

  /**
   * Retrieve memory by query
   *
   * @param {Object} query - Search criteria
   * @param {string} [query.searchTerm] - Text to search for
   * @param {string} [query.domain] - Filter by domain
   * @param {string} [query.type] - Filter by entity type
   * @param {number} [query.maxResults=10] - Maximum results to return
   * @param {number} [query.minSimilarity=0.5] - Minimum similarity score (0-1)
   * @returns {Promise<Object>} Search results { entities: [], relationships: [] }
   * @throws {ValidationError} If query is invalid
   *
   * @example
   *   const results = await repository.retrieve({
   *     searchTerm: 'keyword research',
   *     domain: 'seo',
   *     maxResults: 5,
   *     minSimilarity: 0.7
   *   });
   */
  async retrieve(query) {
    throw new OrchestRAIError(
      'retrieve() must be implemented by subclass',
      { class: this.constructor.name, method: 'retrieve' }
    );
  }

  /**
   * Create relation between entities
   *
   * @param {Object} relation - Relation data
   * @param {string} relation.from - Source entity ID or name
   * @param {string} relation.to - Target entity ID or name
   * @param {string} relation.relationType - Type of relationship
   * @param {Object} [relation.metadata] - Additional metadata
   * @returns {Promise<Object>} Relation result { success: boolean, relationId: string }
   * @throws {ValidationError} If relation is invalid
   *
   * @example
   *   await repository.createRelation({
   *     from: 'agent-seo-specialist',
   *     to: 'task-keyword-research-123',
   *     relationType: 'executed',
   *     metadata: { duration: 45000, quality: 0.95 }
   *   });
   */
  async createRelation(relation) {
    throw new OrchestRAIError(
      'createRelation() must be implemented by subclass',
      { class: this.constructor.name, method: 'createRelation' }
    );
  }

  /**
   * Add observations to existing entity
   *
   * @param {string} entityId - Entity identifier (ID or name)
   * @param {Array<string>} observations - Observations to add
   * @returns {Promise<Object>} Update result { success: boolean, observationCount: number }
   * @throws {OrchestRAIError} If entity not found or update fails
   *
   * @example
   *   await repository.addObservations('agent-seo-specialist', [
   *     'Improved speed by 20% using cache',
   *     'Successfully handled 10 concurrent tasks'
   *   ]);
   */
  async addObservations(entityId, observations) {
    throw new OrchestRAIError(
      'addObservations() must be implemented by subclass',
      { class: this.constructor.name, method: 'addObservations' }
    );
  }

  /**
   * Search for similar entities
   *
   * Uses semantic similarity to find related memories.
   *
   * @param {string} query - Search query text
   * @param {number} [maxResults=10] - Maximum results to return
   * @param {Object} [filters] - Additional filters (domain, type, etc.)
   * @returns {Promise<Array>} Similar entities with similarity scores
   *
   * @example
   *   const similar = await repository.searchSimilar(
   *     'keyword research optimization',
   *     5,
   *     { domain: 'seo' }
   *   );
   *   // Returns: [{ entity: {...}, similarity: 0.92 }, ...]
   */
  async searchSimilar(query, maxResults = 10, filters = {}) {
    throw new OrchestRAIError(
      'searchSimilar() must be implemented by subclass',
      { class: this.constructor.name, method: 'searchSimilar' }
    );
  }

  /**
   * Initialize repository
   *
   * Performs any necessary setup (connections, indexes, etc.)
   * Called automatically if autoInitialize is true.
   *
   * @returns {Promise<void>}
   * @throws {OrchestRAIError} If initialization fails
   */
  async initialize() {
    throw new OrchestRAIError(
      'initialize() must be implemented by subclass',
      { class: this.constructor.name, method: 'initialize' }
    );
  }

  // ============ HELPER METHODS (Can be overridden) ============

  /**
   * Validate entity data before storage
   *
   * @param {Object} data - Entity data to validate
   * @returns {Object} Validated and normalized data
   * @throws {ValidationError} If validation fails
   */
  validateEntity(data) {
    try {
      return MemoryEntitySchema.parse(data);
    } catch (error) {
      const errors = error.errors?.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })) || [{ field: 'unknown', message: error.message }];

      throw new ValidationError(
        'Memory entity validation failed',
        errors,
        { data }
      );
    }
  }

  /**
   * Validate query data
   *
   * @param {Object} query - Query to validate
   * @returns {Object} Validated and normalized query
   * @throws {ValidationError} If validation fails
   */
  validateQuery(query) {
    try {
      return MemoryQuerySchema.parse(query);
    } catch (error) {
      const errors = error.errors?.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })) || [{ field: 'unknown', message: error.message }];

      throw new ValidationError(
        'Memory query validation failed',
        errors,
        { query }
      );
    }
  }

  /**
   * Validate relation data
   *
   * @param {Object} relation - Relation to validate
   * @returns {Object} Validated and normalized relation
   * @throws {ValidationError} If validation fails
   */
  validateRelation(relation) {
    try {
      return MemoryRelationSchema.parse(relation);
    } catch (error) {
      const errors = error.errors?.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })) || [{ field: 'unknown', message: error.message }];

      throw new ValidationError(
        'Memory relation validation failed',
        errors,
        { relation }
      );
    }
  }

  /**
   * Generate namespaced key
   *
   * @param {string} domain - Domain/category
   * @param {string} type - Entity type
   * @param {string} id - Entity identifier
   * @returns {string} Namespaced key
   */
  generateKey(domain, type, id) {
    return `${this.config.namespace}:${domain}:${type}:${id}`;
  }

  /**
   * Check if repository is ready
   *
   * @returns {boolean} True if initialized and ready
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Get repository status
   *
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      namespace: this.config.namespace,
      implementation: this.constructor.name
    };
  }
}

module.exports = {
  MemoryRepository,
  MemoryEntitySchema,
  MemoryQuerySchema,
  MemoryRelationSchema
};
