/**
 * VectorMemoryAdapter
 *
 * Implements MemoryRepository.searchSimilar() using pgvector + the ML
 * service embedding endpoint. All other abstract methods delegate to no-ops
 * (the main memory store for entity CRUD is still MCP/Redis).
 *
 * Usage:
 *   const { VectorMemoryAdapter } = require('./vector-memory-adapter');
 *   const adapter = new VectorMemoryAdapter({ autoInitialize: false });
 *   await adapter.initialize();
 *
 *   const results = await adapter.searchSimilar(
 *     'find skills for dental local SEO',
 *     5,
 *     { domain: 'seo' }
 *   );
 *   // → [{ entity: { skill_id, description, ... }, similarity: 0.87 }, ...]
 */

'use strict';

const axios = require('axios');
const { MemoryRepository } = require('../repository/memory-repository');
const { VectorStore } = require('../../database/vector-store');

const EMBED_URL = process.env.ML_SERVICE_URL
  ? `${process.env.ML_SERVICE_URL}/embed`
  : 'http://localhost:8000/embed';

class VectorMemoryAdapter extends MemoryRepository {
  constructor(config = {}) {
    super({ ...config, autoInitialize: false });
    this.vectorStore = new VectorStore();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Initialize: run schema DDL (idempotent) and mark ready.
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.vectorStore.initSchema();
    this.initialized = true;
    this.logger.info('VectorMemoryAdapter initialized', {
      embedUrl: EMBED_URL,
    });
  }

  // ── Core: searchSimilar ────────────────────────────────────────────────────

  /**
   * Find skills semantically similar to queryText.
   *
   * Steps:
   *   1. Embed queryText via POST /embed
   *   2. Search skill_embeddings with cosine similarity
   *   3. Return results shaped as { entity, similarity }
   *
   * @param {string} queryText        - Natural language query
   * @param {number} [maxResults=10]  - Maximum skills to return
   * @param {Object} [filters={}]     - Optional filters: { domain }
   * @returns {Promise<Array<{ entity: Object, similarity: number }>>}
   */
  async searchSimilar(queryText, maxResults = 10, filters = {}) {
    if (!queryText || typeof queryText !== 'string') {
      return [];
    }

    // 1. Embed the query
    let queryEmbedding;
    try {
      const response = await axios.post(
        EMBED_URL,
        { texts: [queryText.trim()] },
        { timeout: 15_000 }
      );
      queryEmbedding = response.data.embeddings[0];
    } catch (err) {
      this.logger.error('Failed to embed query for searchSimilar', {
        error: err.message,
        queryText,
      });
      return [];
    }

    // 2. Search pgvector
    let rows;
    try {
      rows = await this.vectorStore.searchSimilarSkills(
        queryEmbedding,
        maxResults,
        filters.domain || null
      );
    } catch (err) {
      this.logger.error('Vector search failed', {
        error: err.message,
        queryText,
      });
      return [];
    }

    // 3. Shape results
    return rows.map(row => ({
      entity: {
        skill_id:     row.skill_id,
        skill_domain: row.skill_domain,
        skill_name:   row.skill_name,
        description:  row.description,
        tools:        row.tools,
        triggers:     row.triggers,
        name:         row.skill_id,       // MemoryRepository convention
        type:         'skill',
        domain:       row.skill_domain,
      },
      similarity: row.similarity,
    }));
  }

  // ── Phase 2: searchSimilarProjects ────────────────────────────────────────

  /**
   * Find past projects semantically similar to queryText.
   *
   * @param {string} queryText        - Natural language query
   * @param {number} [maxResults=5]   - Maximum projects to return
   * @returns {Promise<Array<{ project: Object, similarity: number }>>}
   */
  async searchSimilarProjects(queryText, maxResults = 5) {
    if (!queryText || typeof queryText !== 'string') return [];

    let queryEmbedding;
    try {
      const response = await axios.post(
        EMBED_URL,
        { texts: [queryText.trim()] },
        { timeout: 15_000 }
      );
      queryEmbedding = response.data.embeddings[0];
    } catch (err) {
      this.logger.error('Failed to embed query for searchSimilarProjects', { error: err.message });
      return [];
    }

    let rows;
    try {
      rows = await this.vectorStore.searchSimilarProjects(queryEmbedding, maxResults);
    } catch (err) {
      this.logger.error('Project vector search failed', { error: err.message });
      return [];
    }

    return rows.map(row => ({
      project: {
        project_id:        row.project_id,
        client_name:       row.client_name,
        industry:          row.industry,
        project_type:      row.project_type,
        summary:           row.summary,
        deliverable_count: row.deliverable_count,
      },
      similarity: row.similarity,
    }));
  }

  // ── Phase 2: searchSimilarDeliverables ────────────────────────────────────

  /**
   * Find past deliverables semantically similar to queryText.
   *
   * @param {string} queryText        - Natural language query
   * @param {number} [maxResults=5]   - Maximum deliverables to return
   * @param {Object} [filters={}]     - Optional: { projectId, domain }
   * @returns {Promise<Array<{ deliverable: Object, similarity: number }>>}
   */
  async searchSimilarDeliverables(queryText, maxResults = 5, filters = {}) {
    if (!queryText || typeof queryText !== 'string') return [];

    let queryEmbedding;
    try {
      const response = await axios.post(
        EMBED_URL,
        { texts: [queryText.trim()] },
        { timeout: 15_000 }
      );
      queryEmbedding = response.data.embeddings[0];
    } catch (err) {
      this.logger.error('Failed to embed query for searchSimilarDeliverables', { error: err.message });
      return [];
    }

    let rows;
    try {
      rows = await this.vectorStore.searchSimilarDeliverables(queryEmbedding, maxResults, filters);
    } catch (err) {
      this.logger.error('Deliverable vector search failed', { error: err.message });
      return [];
    }

    return rows.map(row => ({
      deliverable: {
        deliverable_id: row.deliverable_id,
        project_id:     row.project_id,
        client_name:    row.client_name,
        domain:         row.domain,
        file_path:      row.file_path,
        title:          row.title,
        excerpt:        row.excerpt,
        word_count:     row.word_count,
      },
      similarity: row.similarity,
    }));
  }

  // ── No-op stubs for abstract methods ──────────────────────────────────────
  // These keep the contract satisfied without throwing. The canonical
  // entity CRUD path remains MCP/Redis (see mcp-adapter.js).

  async store(_data)                        { return null; }
  async retrieve(_query)                    { return { entities: [], relationships: [] }; }
  async createRelation(_relation)           { return { success: false }; }
  async addObservations(_entityId, _obs)    { return { success: false, observationCount: 0 }; }
}

module.exports = { VectorMemoryAdapter };
