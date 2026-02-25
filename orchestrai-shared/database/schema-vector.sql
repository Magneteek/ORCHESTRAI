-- schema-vector.sql
-- Idempotent DDL for pgvector skill embeddings.
-- Run via VectorStore.initSchema() — safe to re-run at any time.

-- Requires pgvector extension (install with: CREATE EXTENSION vector)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── skill_embeddings ──────────────────────────────────────────────────────────
-- One row per ORCHESTRAI skill. Upserted by scripts/index-skills.js.
CREATE TABLE IF NOT EXISTS skill_embeddings (
  id           SERIAL PRIMARY KEY,
  skill_id     TEXT NOT NULL UNIQUE,        -- e.g. "seo:seo-keyword-research"
  skill_domain TEXT NOT NULL,               -- e.g. "seo"
  skill_name   TEXT NOT NULL,               -- e.g. "seo-keyword-research"
  description  TEXT,                        -- SKILL.md Overview paragraph
  full_prompt  TEXT,                        -- prompts/main-prompt.md content
  tools        TEXT[],                      -- required MCP/CLI tools
  triggers     TEXT[],                      -- when-to-load keywords
  embedding    vector(384),                 -- all-MiniLM-L6-v2 output
  indexed_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat cosine-similarity index
-- lists = 10  (floor(sqrt(161)) ≈ 12; 10 is conservative, suitable for <1k rows)
-- NOTE: index build is skipped if table is empty (handled in VectorStore.initSchema)
CREATE INDEX IF NOT EXISTS skill_embeddings_embedding_idx
  ON skill_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- Domain filter index for domainFilter support in searchSimilarSkills()
CREATE INDEX IF NOT EXISTS skill_embeddings_domain_idx
  ON skill_embeddings (skill_domain);

-- Trigger to keep updated_at current on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skill_embeddings_updated_at ON skill_embeddings;
CREATE TRIGGER skill_embeddings_updated_at
  BEFORE UPDATE ON skill_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
