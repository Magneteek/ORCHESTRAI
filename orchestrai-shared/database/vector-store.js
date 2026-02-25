/**
 * VectorStore
 *
 * Wraps pg-pool-manager with pgvector skill-embedding operations.
 * Provides upsert + cosine-similarity search for the skill_embeddings table.
 *
 * Usage:
 *   const { VectorStore } = require('./vector-store');
 *   const store = new VectorStore();
 *   await store.initSchema();
 *   await store.upsertSkillEmbedding(skillData, embeddingVector);
 *   const results = await store.searchSimilarSkills(queryVector, 5);
 */

const fs = require('fs');
const path = require('path');
const { getPoolManager } = require('./pg-pool-manager');

const POOL_NAME = 'vector';
const SCHEMA_SQL_PATH = path.join(__dirname, 'schema-vector.sql');
const SCHEMA_PROJECT_SQL_PATH = path.join(__dirname, 'schema-project.sql');

class VectorStore {
  constructor() {
    this.poolManager = getPoolManager();
  }

  // ── Schema ─────────────────────────────────────────────────────────────────

  /**
   * Initialize the vector schema (idempotent — safe to call on every startup).
   * Reads schema-vector.sql and executes it against the configured database.
   *
   * If the IVFFlat index cannot be built (empty table), the error is logged
   * and swallowed — the index will be created automatically on next run
   * once rows exist.
   *
   * @returns {Promise<void>}
   */
  async initSchema() {
    const sql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');

    // Execute the entire SQL file as one query.
    // pg supports multiple statements in a single query() call when no params
    // are used. Splitting on ";" is wrong for PL/pgSQL — function bodies
    // contain semicolons inside $$ delimiters.
    try {
      await this.poolManager.query(POOL_NAME, sql);
    } catch (err) {
      // IVFFlat index build fails on an empty table — non-fatal, index will
      // be created on the next initSchema() call once rows exist.
      if (
        err.message.includes('ivfflat') ||
        err.message.includes('does not contain') ||
        err.message.includes('already exists')
      ) {
        console.warn(`[VectorStore] Schema warning (non-fatal): ${err.message}`);
      } else {
        throw err;
      }
    }
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Upsert a skill embedding row.
   * On conflict (same skill_id), all fields are updated.
   *
   * @param {Object} skillData
   * @param {string}   skillData.skill_id       - "domain:skill-name"
   * @param {string}   skillData.skill_domain   - e.g. "seo"
   * @param {string}   skillData.skill_name     - e.g. "seo-keyword-research"
   * @param {string}   [skillData.description]  - SKILL.md overview paragraph
   * @param {string}   [skillData.full_prompt]  - main-prompt.md content
   * @param {string[]} [skillData.tools]        - required tools
   * @param {string[]} [skillData.triggers]     - when-to-load keywords
   * @param {number[]} embedding               - 384-dim float vector
   * @returns {Promise<void>}
   */
  async upsertSkillEmbedding(skillData, embedding) {
    const {
      skill_id,
      skill_domain,
      skill_name,
      description = null,
      full_prompt = null,
      tools = [],
      triggers = [],
    } = skillData;

    const vectorLiteral = `[${embedding.join(',')}]`;

    const sql = `
      INSERT INTO skill_embeddings
        (skill_id, skill_domain, skill_name, description, full_prompt, tools, triggers, embedding)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8::vector)
      ON CONFLICT (skill_id) DO UPDATE SET
        skill_domain = EXCLUDED.skill_domain,
        skill_name   = EXCLUDED.skill_name,
        description  = EXCLUDED.description,
        full_prompt  = EXCLUDED.full_prompt,
        tools        = EXCLUDED.tools,
        triggers     = EXCLUDED.triggers,
        embedding    = EXCLUDED.embedding,
        updated_at   = NOW()
    `;

    await this.poolManager.query(POOL_NAME, sql, [
      skill_id,
      skill_domain,
      skill_name,
      description,
      full_prompt,
      tools,
      triggers,
      vectorLiteral,
    ]);
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Find the top-N most similar skills to a query embedding.
   * Uses cosine distance (<=>), so lower distance = higher similarity.
   *
   * @param {number[]} queryEmbedding   - 384-dim query vector
   * @param {number}   [limit=5]        - max results to return
   * @param {string}   [domainFilter]   - restrict to a specific domain
   * @returns {Promise<Array<{skill_id, skill_domain, skill_name, description, tools, triggers, similarity}>>}
   */
  async searchSimilarSkills(queryEmbedding, limit = 5, domainFilter = null) {
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    // Use a dedicated client so SET is scoped to this session.
    // IVFFlat probes=lists gives near-perfect recall for small datasets;
    // for >10k rows, lower probes to ~sqrt(lists) for speed.
    const client = await this.poolManager.getClient(POOL_NAME);
    try {
      await client.query('SET ivfflat.probes = 10');

      let sql = `
        SELECT
          skill_id,
          skill_domain,
          skill_name,
          description,
          tools,
          triggers,
          1 - (embedding <=> $1::vector) AS similarity
        FROM skill_embeddings
        WHERE embedding IS NOT NULL
      `;
      const params = [vectorLiteral];

      if (domainFilter) {
        params.push(domainFilter);
        sql += ` AND skill_domain = $${params.length}`;
      }

      sql += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await client.query(sql, params);
      return result.rows.map(row => ({
        ...row,
        similarity: parseFloat(row.similarity),
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Return all skill IDs currently indexed (for incremental re-indexing).
   *
   * @returns {Promise<string[]>}
   */
  async getAllSkillIds() {
    const result = await this.poolManager.query(
      POOL_NAME,
      'SELECT skill_id FROM skill_embeddings ORDER BY skill_id'
    );
    return result.rows.map(r => r.skill_id);
  }

  /**
   * Return all skills in a specific domain.
   *
   * @param {string} domain - e.g. "seo"
   * @returns {Promise<Array<{skill_id, skill_name, description}>>}
   */
  async getSkillsByDomain(domain) {
    const result = await this.poolManager.query(
      POOL_NAME,
      `SELECT skill_id, skill_name, description
       FROM skill_embeddings
       WHERE skill_domain = $1
       ORDER BY skill_name`,
      [domain]
    );
    return result.rows;
  }

  /**
   * Delete a skill embedding by skill_id.
   *
   * @param {string} skillId
   * @returns {Promise<boolean>} true if a row was deleted
   */
  async deleteSkill(skillId) {
    const result = await this.poolManager.query(
      POOL_NAME,
      'DELETE FROM skill_embeddings WHERE skill_id = $1',
      [skillId]
    );
    return result.rowCount > 0;
  }

  /**
   * Count total indexed skills.
   *
   * @returns {Promise<number>}
   */
  async count() {
    const result = await this.poolManager.query(
      POOL_NAME,
      'SELECT COUNT(*) AS cnt FROM skill_embeddings'
    );
    return parseInt(result.rows[0].cnt, 10);
  }

  // ── Phase 2: Project Schema ────────────────────────────────────────────────

  /**
   * Initialize the project schema (idempotent).
   * Runs schema-project.sql — assumes schema-vector.sql already ran.
   *
   * @returns {Promise<void>}
   */
  async initProjectSchema() {
    const sql = fs.readFileSync(SCHEMA_PROJECT_SQL_PATH, 'utf8');
    try {
      await this.poolManager.query(POOL_NAME, sql);
    } catch (err) {
      if (
        err.message.includes('ivfflat') ||
        err.message.includes('does not contain') ||
        err.message.includes('already exists')
      ) {
        console.warn(`[VectorStore] Project schema warning (non-fatal): ${err.message}`);
      } else {
        throw err;
      }
    }
  }

  // ── Phase 2: Project Write ────────────────────────────────────────────────

  /**
   * Upsert a project embedding row.
   *
   * @param {Object} projectData
   * @param {string}   projectData.project_id       - UUID-based project folder name
   * @param {string}   projectData.client_name       - Human-readable client name
   * @param {string}   [projectData.industry]        - e.g. "Business Intelligence & SaaS"
   * @param {string}   [projectData.project_type]    - e.g. "saas", "dental"
   * @param {string}   [projectData.summary]         - Text used as embedding source
   * @param {number}   [projectData.deliverable_count]
   * @param {number[]} embedding                     - 384-dim float vector
   * @returns {Promise<void>}
   */
  async upsertProjectEmbedding(projectData, embedding) {
    const {
      project_id,
      client_name,
      industry = null,
      project_type = null,
      summary = null,
      deliverable_count = 0,
    } = projectData;

    const vectorLiteral = `[${embedding.join(',')}]`;

    const sql = `
      INSERT INTO project_embeddings
        (project_id, client_name, industry, project_type, summary, deliverable_count, embedding)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7::vector)
      ON CONFLICT (project_id) DO UPDATE SET
        client_name       = EXCLUDED.client_name,
        industry          = EXCLUDED.industry,
        project_type      = EXCLUDED.project_type,
        summary           = EXCLUDED.summary,
        deliverable_count = EXCLUDED.deliverable_count,
        embedding         = EXCLUDED.embedding,
        updated_at        = NOW()
    `;

    await this.poolManager.query(POOL_NAME, sql, [
      project_id,
      client_name,
      industry,
      project_type,
      summary,
      deliverable_count,
      vectorLiteral,
    ]);
  }

  /**
   * Upsert a deliverable embedding row.
   *
   * @param {Object} data
   * @param {string}   data.deliverable_id  - Relative path from projects/ root
   * @param {string}   data.project_id      - Parent project ID
   * @param {string}   [data.client_name]
   * @param {string}   [data.domain]        - "seo", "content", "research", "design", "development"
   * @param {string}   data.file_path       - Absolute filesystem path
   * @param {string}   [data.title]         - First # heading
   * @param {string}   [data.excerpt]       - First 500 chars of body
   * @param {number}   [data.word_count]
   * @param {number[]} embedding            - 384-dim float vector
   * @returns {Promise<void>}
   */
  async upsertDeliverableEmbedding(data, embedding) {
    const {
      deliverable_id,
      project_id,
      client_name = null,
      domain = null,
      file_path,
      title = null,
      excerpt = null,
      word_count = 0,
    } = data;

    const vectorLiteral = `[${embedding.join(',')}]`;

    const sql = `
      INSERT INTO deliverable_embeddings
        (deliverable_id, project_id, client_name, domain, file_path, title, excerpt, word_count, embedding)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::vector)
      ON CONFLICT (deliverable_id) DO UPDATE SET
        project_id   = EXCLUDED.project_id,
        client_name  = EXCLUDED.client_name,
        domain       = EXCLUDED.domain,
        file_path    = EXCLUDED.file_path,
        title        = EXCLUDED.title,
        excerpt      = EXCLUDED.excerpt,
        word_count   = EXCLUDED.word_count,
        embedding    = EXCLUDED.embedding,
        updated_at   = NOW()
    `;

    await this.poolManager.query(POOL_NAME, sql, [
      deliverable_id,
      project_id,
      client_name,
      domain,
      file_path,
      title,
      excerpt,
      word_count,
      vectorLiteral,
    ]);
  }

  // ── Phase 2: Project Read ─────────────────────────────────────────────────

  /**
   * Find the top-N most similar projects to a query embedding.
   *
   * @param {number[]} queryEmbedding   - 384-dim query vector
   * @param {number}   [limit=5]
   * @returns {Promise<Array<{project_id, client_name, industry, summary, similarity}>>}
   */
  async searchSimilarProjects(queryEmbedding, limit = 5) {
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;
    const client = await this.poolManager.getClient(POOL_NAME);
    try {
      await client.query('SET ivfflat.probes = 10');
      const sql = `
        SELECT
          project_id,
          client_name,
          industry,
          project_type,
          summary,
          deliverable_count,
          1 - (embedding <=> $1::vector) AS similarity
        FROM project_embeddings
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $2
      `;
      const result = await client.query(sql, [vectorLiteral, limit]);
      return result.rows.map(row => ({
        ...row,
        similarity: parseFloat(row.similarity),
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Find the top-N most similar deliverables to a query embedding.
   *
   * @param {number[]} queryEmbedding   - 384-dim query vector
   * @param {number}   [limit=5]
   * @param {Object}   [filters={}]     - { projectId, domain }
   * @returns {Promise<Array<{deliverable_id, project_id, client_name, domain, title, excerpt, similarity}>>}
   */
  async searchSimilarDeliverables(queryEmbedding, limit = 5, filters = {}) {
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;
    const client = await this.poolManager.getClient(POOL_NAME);
    try {
      await client.query('SET ivfflat.probes = 10');

      let sql = `
        SELECT
          deliverable_id,
          project_id,
          client_name,
          domain,
          file_path,
          title,
          excerpt,
          word_count,
          1 - (embedding <=> $1::vector) AS similarity
        FROM deliverable_embeddings
        WHERE embedding IS NOT NULL
      `;
      const params = [vectorLiteral];

      if (filters.projectId) {
        params.push(filters.projectId);
        sql += ` AND project_id = $${params.length}`;
      }
      if (filters.domain) {
        params.push(filters.domain);
        sql += ` AND domain = $${params.length}`;
      }

      sql += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await client.query(sql, params);
      return result.rows.map(row => ({
        ...row,
        similarity: parseFloat(row.similarity),
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Return all project IDs currently indexed.
   * @returns {Promise<string[]>}
   */
  async getAllProjectIds() {
    const result = await this.poolManager.query(
      POOL_NAME,
      'SELECT project_id FROM project_embeddings ORDER BY project_id'
    );
    return result.rows.map(r => r.project_id);
  }

  /**
   * Return all deliverable IDs currently indexed.
   * @returns {Promise<string[]>}
   */
  async getAllDeliverableIds() {
    const result = await this.poolManager.query(
      POOL_NAME,
      'SELECT deliverable_id FROM deliverable_embeddings ORDER BY deliverable_id'
    );
    return result.rows.map(r => r.deliverable_id);
  }

  /**
   * Delete deliverable embeddings whose IDs are NOT in the given valid set.
   * Used after re-indexing to prune stale rows (e.g. deleted files, node_modules).
   *
   * @param {string[]} validIds  - The deliverable_ids that should stay
   * @returns {Promise<number>}  - Number of rows deleted
   */
  async pruneDeliverables(validIds) {
    if (!validIds || validIds.length === 0) return 0;
    // Use a temporary table approach for large sets — pg has a 65535 param limit
    // For datasets < 10k, passing as array is fine.
    const result = await this.poolManager.query(
      POOL_NAME,
      `DELETE FROM deliverable_embeddings
       WHERE deliverable_id != ALL($1::text[])`,
      [validIds]
    );
    return result.rowCount;
  }

  /**
   * Count indexed projects and deliverables.
   * @returns {Promise<{projects: number, deliverables: number}>}
   */
  async countProjectData() {
    const [p, d] = await Promise.all([
      this.poolManager.query(POOL_NAME, 'SELECT COUNT(*) AS cnt FROM project_embeddings'),
      this.poolManager.query(POOL_NAME, 'SELECT COUNT(*) AS cnt FROM deliverable_embeddings'),
    ]);
    return {
      projects:     parseInt(p.rows[0].cnt, 10),
      deliverables: parseInt(d.rows[0].cnt, 10),
    };
  }
}

module.exports = { VectorStore };
