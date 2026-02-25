#!/usr/bin/env node
/**
 * index-projects.js
 *
 * Phase 2 indexer — crawls all client projects and indexes:
 *   1. project_embeddings  — one row per project (from crystalline-memory-index.json
 *                            + client-profile.json when available)
 *   2. deliverable_embeddings — one row per .md deliverable file
 *
 * Usage:
 *   node scripts/index-projects.js
 *   node scripts/index-projects.js --force     # re-index everything
 *   node scripts/index-projects.js --projects  # projects only (skip deliverables)
 *   node scripts/index-projects.js --deliverables # deliverables only
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs   = require('fs');
const path = require('path');
const axios = require('axios');
const { VectorStore } = require('../orchestrai-shared/database/vector-store');

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECTS_DIR = path.join(__dirname, '..', 'projects');
const EMBED_URL    = process.env.ML_SERVICE_URL
  ? `${process.env.ML_SERVICE_URL}/embed`
  : 'http://localhost:8000/embed';
const BATCH_SIZE   = 8; // texts per /embed call

// ── Deliverable domain detection ─────────────────────────────────────────────

const DOMAIN_PATTERNS = [
  { domain: 'seo',         patterns: ['/seo/', '/deliverables/seo/'] },
  { domain: 'content',     patterns: ['/content/', '/deliverables/content/'] },
  { domain: 'research',    patterns: ['/research/', '/deliverables/research/'] },
  { domain: 'design',      patterns: ['/design/', '/deliverables/design/'] },
  { domain: 'development', patterns: ['/development/', '/deliverables/development/'] },
  { domain: 'intelligence',patterns: ['/client-intelligence/'] },
];

function detectDomain(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  for (const { domain, patterns } of DOMAIN_PATTERNS) {
    if (patterns.some(p => normalized.includes(p))) return domain;
  }
  return 'general';
}

// ── Text extraction helpers ───────────────────────────────────────────────────

function extractTitle(content) {
  const match = content.match(/^#+\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractExcerpt(content, maxChars = 500) {
  // Strip markdown headings, code blocks, tables, blank lines
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '')     // remove code blocks
    .replace(/^#+\s+.+$/mg, '')         // remove headings
    .replace(/^\|.*\|$/mg, '')          // remove table rows
    .replace(/\n{3,}/g, '\n\n')         // collapse blank lines
    .trim();
  return cleaned.slice(0, maxChars).trim();
}

function countWords(content) {
  return content.split(/\s+/).filter(Boolean).length;
}

// ── Project metadata builder ──────────────────────────────────────────────────

function buildProjectData(projectDir) {
  const projectId  = path.basename(projectDir);
  const memoryPath = path.join(projectDir, 'crystalline-memory-index.json');

  if (!fs.existsSync(memoryPath)) return null;

  let memory;
  try {
    memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
  } catch {
    return null;
  }

  const root = memory.crystallineMemoryIndex || memory;
  const clientName = root.clientName || root.client_name || projectId;

  // Build summary from memory pool descriptions
  const pools = root.memoryPools || {};
  const poolDescriptions = Object.values(pools)
    .map(p => p.purpose || '')
    .filter(Boolean)
    .join('. ');

  // Load client-profile.json if available (richer ICP/brand data)
  let industry    = null;
  let projectType = null;
  let profileSummary = '';

  const profilePath = path.join(projectDir, 'client-intelligence', 'client-profile.json');
  if (fs.existsSync(profilePath)) {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
      const cp = profile.clientProfile || profile;

      industry    = cp.businessOverview?.industry || null;
      projectType = cp.profileType || null;

      const icp   = cp.idealCustomerProfile?.primaryPersona;
      const brand = cp.brandPersonality;
      const kws   = cp.contentStrategy?.keywordStrategy || [];

      profileSummary = [
        industry,
        cp.businessOverview?.valueProposition,
        icp ? `Target: ${icp.title}` : '',
        brand?.brandVoice?.tone,
        kws.length ? `Keywords: ${kws.slice(0, 5).join(', ')}` : '',
      ].filter(Boolean).join('. ');
    } catch {
      // profile parsing failed — use memory pools only
    }
  }

  // Infer project type from projectId when not in profile
  if (!projectType) {
    const id = projectId.toLowerCase();
    if (id.includes('dental') || id.includes('smile') || id.includes('nasme')) projectType = 'dental';
    else if (id.includes('seo') || id.includes('serp')) projectType = 'seo-research';
    else if (id.includes('saas') || id.includes('quartz')) projectType = 'saas';
  }

  const summary = [
    `Client: ${clientName}.`,
    profileSummary || poolDescriptions,
  ].filter(Boolean).join(' ').slice(0, 1500);

  return {
    project_id:   projectId,
    client_name:  clientName,
    industry,
    project_type: projectType,
    summary,
  };
}

// ── Deliverable discovery ─────────────────────────────────────────────────────

// Directories to never descend into
const SKIP_DIRS = new Set([
  'node_modules', '.next', '.git', '.cache', 'dist', 'build', '.turbo',
  'venv', '__pycache__', '.venv',
]);

// File name patterns to skip — system/template files that aren't real deliverables
const SKIP_FILENAME_PATTERNS = [
  'MASTER-REQUIREMENTS-DOCUMENT',
  'ORCHESTRAI-OUTLINE-INTEGRATION-METHODOLOGY',
  'ORCHESTRAI-Content-Creation-Process-Report',
  'ORCHESTRAI-v2.0-CORRECTED-IMPLEMENTATION-REPORT',
  'orchestrai-master-coordination-report',
];

function shouldSkip(filePath) {
  const name = path.basename(filePath, '.md');
  return SKIP_FILENAME_PATTERNS.some(p => name.includes(p));
}

function findDeliverables(projectDir) {
  const results = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md') && !shouldSkip(full)) {
        results.push(full);
      }
    }
  }

  walk(projectDir);
  return results;
}

/**
 * Collect all valid deliverable IDs across all project directories.
 * Used to compute the set of IDs that should remain in the DB.
 */
function findAllDeliverableIds(projectDirs) {
  const ids = [];
  for (const dir of projectDirs) {
    const memoryPath = path.join(dir, 'crystalline-memory-index.json');
    if (!fs.existsSync(memoryPath)) continue;
    const files = findDeliverables(dir);
    for (const file of files) {
      ids.push(path.relative(PROJECTS_DIR, file));
    }
  }
  return ids;
}

// ── Embed helper ──────────────────────────────────────────────────────────────

async function embedBatch(texts) {
  const response = await axios.post(
    EMBED_URL,
    { texts },
    { timeout: 30_000 }
  );
  return response.data.embeddings; // number[][]
}

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE       = args.includes('--force');
const ONLY_PROJ   = args.includes('--projects');
const ONLY_DEL    = args.includes('--deliverables');
const DO_PROJECTS = !ONLY_DEL;
const DO_DELIVER  = !ONLY_PROJ;

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  const store = new VectorStore();
  const t0 = Date.now();

  console.log('\n📚 ORCHESTRAI Project Indexer (Phase 2)');
  console.log('=========================================');

  // Initialize schemas
  try {
    await store.initSchema();
    await store.initProjectSchema();
  } catch (err) {
    console.error(`\n❌ Schema init failed: ${err.message}`);
    process.exit(1);
  }

  // Verify embed service
  try {
    await axios.get(`${EMBED_URL}/health`, { timeout: 5_000 });
  } catch {
    console.error(`\n❌ ML Service unreachable at ${EMBED_URL}`);
    console.error('   Run: npm run system:start-all');
    process.exit(1);
  }

  // Discover all project directories
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`\n❌ Projects directory not found: ${PROJECTS_DIR}`);
    process.exit(1);
  }

  const projectDirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(PROJECTS_DIR, e.name));

  console.log(`\nFound ${projectDirs.length} project directories`);

  // ── Phase 2a: Index projects ───────────────────────────────────────────────
  if (DO_PROJECTS) {
    console.log('\n── Projects ──────────────────────────────────────');

    const existingIds = FORCE ? [] : await store.getAllProjectIds();
    const existingSet = new Set(existingIds);

    const projectsToIndex = [];
    for (const dir of projectDirs) {
      const data = buildProjectData(dir);
      if (!data) {
        console.log(`   ⚠️  Skipped (no crystalline-memory-index.json): ${path.basename(dir)}`);
        continue;
      }
      if (!FORCE && existingSet.has(data.project_id)) {
        console.log(`   ○  Already indexed: ${data.client_name}`);
        continue;
      }
      projectsToIndex.push(data);
    }

    if (projectsToIndex.length === 0) {
      console.log('   All projects already indexed. Use --force to re-index.');
    } else {
      console.log(`   Embedding ${projectsToIndex.length} project(s)...`);
      // Embed in batches
      for (let i = 0; i < projectsToIndex.length; i += BATCH_SIZE) {
        const batch = projectsToIndex.slice(i, i + BATCH_SIZE);
        const texts = batch.map(p => p.summary);
        let embeddings;
        try {
          embeddings = await embedBatch(texts);
        } catch (err) {
          console.error(`   ❌ Embed failed for batch: ${err.message}`);
          continue;
        }
        for (let j = 0; j < batch.length; j++) {
          try {
            await store.upsertProjectEmbedding(batch[j], embeddings[j]);
            console.log(`   ✅ ${batch[j].client_name} (${batch[j].project_type || 'unknown type'})`);
          } catch (err) {
            console.error(`   ❌ Upsert failed for ${batch[j].project_id}: ${err.message}`);
          }
        }
      }
    }
  }

  // ── Phase 2b: Index deliverables ───────────────────────────────────────────
  if (DO_DELIVER) {
    console.log('\n── Deliverables ──────────────────────────────────');

    const existingIds  = FORCE ? [] : await store.getAllDeliverableIds();
    const existingSet  = new Set(existingIds);

    // Collect all deliverable files across all projects
    const allDeliverables = [];
    for (const dir of projectDirs) {
      const projectId  = path.basename(dir);
      const memoryPath = path.join(dir, 'crystalline-memory-index.json');
      if (!fs.existsSync(memoryPath)) continue;

      let clientName = projectId;
      try {
        const mem = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
        clientName = (mem.crystallineMemoryIndex || mem).clientName || projectId;
      } catch { /* use projectId as fallback */ }

      const files = findDeliverables(dir);
      for (const file of files) {
        // Use relative path from projects/ as stable deliverable_id
        const deliverableId = path.relative(PROJECTS_DIR, file);

        if (!FORCE && existingSet.has(deliverableId)) continue;

        allDeliverables.push({ file, deliverableId, projectId, clientName });
      }
    }

    // Always compute the full set of valid IDs from disk (used for pruning)
    const allCurrentIds = findAllDeliverableIds(projectDirs);

    if (allDeliverables.length === 0) {
      console.log('   All deliverables already indexed. Use --force to re-index.');
    } else {
      console.log(`   Found ${allDeliverables.length} deliverable(s) to index`);

      let indexed = 0, skipped = 0;
      for (let i = 0; i < allDeliverables.length; i += BATCH_SIZE) {
        const batch = allDeliverables.slice(i, i + BATCH_SIZE);

        // Read file contents
        const parsed = batch.map(({ file, deliverableId, projectId, clientName }) => {
          try {
            const content = fs.readFileSync(file, 'utf8');
            const title   = extractTitle(content);
            const excerpt = extractExcerpt(content);
            const wc      = countWords(content);
            const domain  = detectDomain(file);
            const embedSource = [title, excerpt].filter(Boolean).join('\n');
            return {
              embedSource,
              data: {
                deliverable_id: deliverableId,
                project_id:     projectId,
                client_name:    clientName,
                domain,
                file_path:      file,
                title:          title || path.basename(file, '.md'),
                excerpt,
                word_count:     wc,
              },
            };
          } catch {
            return null;
          }
        }).filter(Boolean);

        if (parsed.length === 0) continue;

        const texts = parsed.map(p => p.embedSource || p.data.title);
        let embeddings;
        try {
          embeddings = await embedBatch(texts);
        } catch (err) {
          console.error(`   ❌ Embed failed for batch at index ${i}: ${err.message}`);
          skipped += batch.length;
          continue;
        }

        for (let j = 0; j < parsed.length; j++) {
          try {
            await store.upsertDeliverableEmbedding(parsed[j].data, embeddings[j]);
            indexed++;
          } catch (err) {
            console.error(`   ❌ Upsert failed for ${parsed[j].data.deliverable_id}: ${err.message}`);
            skipped++;
          }
        }

        if ((i + BATCH_SIZE) % 16 === 0 || i + BATCH_SIZE >= allDeliverables.length) {
          process.stdout.write(`   ✅ ${indexed} indexed, ${skipped} failed\r`);
        }
      }

      console.log(`\n   Done: ${indexed} deliverables indexed, ${skipped} failed`);
    }

    // Always prune stale rows (deleted files, node_modules, etc.)
    const pruned = await store.pruneDeliverables(allCurrentIds);
    if (pruned > 0) {
      console.log(`   🧹 Pruned ${pruned} stale deliverable entries from DB`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const { projects, deliverables } = await store.countProjectData();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n=========================================');
  console.log(`✅ Phase 2 index complete in ${elapsed}s`);
  console.log(`   Projects:     ${projects}`);
  console.log(`   Deliverables: ${deliverables}`);
  console.log('\nSearch with: npm run projects:search -- "your query"');

  process.exit(0);
})();
