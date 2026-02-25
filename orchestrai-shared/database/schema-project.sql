-- schema-project.sql
-- Idempotent DDL for pgvector project and deliverable embeddings (Phase 2).
-- Run via VectorStore.initProjectSchema() — safe to re-run at any time.
-- Assumes schema-vector.sql has already run (pgvector extension + update_updated_at_column fn).

-- ── project_embeddings ────────────────────────────────────────────────────────
-- One row per ORCHESTRAI client project.
-- Source: crystalline-memory-index.json + client-profile.json (when available).
-- Upserted by scripts/index-projects.js.
CREATE TABLE IF NOT EXISTS project_embeddings (
  id            SERIAL PRIMARY KEY,
  project_id    TEXT NOT NULL UNIQUE,  -- e.g. "quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010"
  client_name   TEXT NOT NULL,         -- e.g. "QuartzIQ"
  industry      TEXT,                  -- e.g. "Business Intelligence & SaaS"
  project_type  TEXT,                  -- e.g. "saas", "dental", "ecommerce"
  summary       TEXT,                  -- Human-readable summary used as embedding source
  deliverable_count INT DEFAULT 0,     -- Total indexed deliverables for this project
  embedding     vector(384),           -- all-MiniLM-L6-v2 output
  indexed_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index — lists=5 conservative for ~14 projects (will grow)
CREATE INDEX IF NOT EXISTS project_embeddings_embedding_idx
  ON project_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 5);

DROP TRIGGER IF EXISTS project_embeddings_updated_at ON project_embeddings;
CREATE TRIGGER project_embeddings_updated_at
  BEFORE UPDATE ON project_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── deliverable_embeddings ────────────────────────────────────────────────────
-- One row per deliverable file (markdown reports, research docs, content).
-- Source: .md files under projects/*/deliverables/, projects/*/seo/, etc.
-- Upserted by scripts/index-projects.js.
CREATE TABLE IF NOT EXISTS deliverable_embeddings (
  id              SERIAL PRIMARY KEY,
  deliverable_id  TEXT NOT NULL UNIQUE, -- relative path from projects/ root
  project_id      TEXT NOT NULL,        -- FK to project_embeddings.project_id
  client_name     TEXT,                 -- denormalised for query convenience
  domain          TEXT,                 -- "seo", "content", "research", "design", "development"
  file_path       TEXT NOT NULL,        -- absolute filesystem path
  title           TEXT,                 -- first # heading extracted from file
  excerpt         TEXT,                 -- first 500 chars of body content
  word_count      INT,                  -- approximate word count
  embedding       vector(384),          -- all-MiniLM-L6-v2 output
  indexed_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index — lists=10 (conservative for ~100 deliverables initially)
CREATE INDEX IF NOT EXISTS deliverable_embeddings_embedding_idx
  ON deliverable_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- Filter indexes for project-scoped and domain-scoped queries
CREATE INDEX IF NOT EXISTS deliverable_embeddings_project_idx
  ON deliverable_embeddings (project_id);

CREATE INDEX IF NOT EXISTS deliverable_embeddings_domain_idx
  ON deliverable_embeddings (domain);

DROP TRIGGER IF EXISTS deliverable_embeddings_updated_at ON deliverable_embeddings;
CREATE TRIGGER deliverable_embeddings_updated_at
  BEFORE UPDATE ON deliverable_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
