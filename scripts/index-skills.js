#!/usr/bin/env node
/**
 * index-skills.js
 *
 * Crawls .claude/skills/ and indexes every skill into PostgreSQL via pgvector.
 *
 * Usage:
 *   node scripts/index-skills.js          # incremental (skips unchanged skills)
 *   node scripts/index-skills.js --force  # re-index everything
 *
 * Prerequisites:
 *   1. orchestrai-ml-service running on port 8000 (POST /embed available)
 *   2. PostgreSQL accessible with env vars from .env
 *   3. pgvector extension installed in the target database
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs   = require('fs');
const path = require('path');
const axios = require('axios');

const { VectorStore } = require('../orchestrai-shared/database/vector-store');

// ── Configuration ─────────────────────────────────────────────────────────────

const SKILLS_ROOT  = path.join(__dirname, '..', '.claude', 'skills');
const EMBED_URL    = process.env.ML_SERVICE_URL
  ? `${process.env.ML_SERVICE_URL}/embed`
  : 'http://localhost:8000/embed';
const FORCE        = process.argv.includes('--force');
const BATCH_SIZE   = 16; // texts per /embed call

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Walk a directory tree and return all paths matching a filename predicate.
 * @param {string} dir
 * @param {(name: string) => boolean} predicate
 * @returns {string[]}
 */
function findFiles(dir, predicate) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, predicate));
    } else if (predicate(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Parse a SKILL.md file into structured metadata.
 * @param {string} content - Raw SKILL.md text
 * @returns {{ description: string, tools: string[], triggers: string[] }}
 */
function parseSkillMd(content) {
  // Overview paragraph: first non-heading paragraph after "## Overview"
  const overviewMatch = content.match(/##\s+Overview\s*\n+([\s\S]*?)(?=\n##|\n---|\z)/);
  const description = overviewMatch
    ? overviewMatch[1].trim().split('\n')[0].trim()
    : '';

  // When-to-load trigger keywords: "**Use this skill when user mentions**: kw1, kw2"
  const triggerMatch = content.match(
    /\*\*Use this skill when user mentions\*\*[:\s]+(.+)/i
  );
  const triggers = triggerMatch
    ? triggerMatch[1].split(',').map(t => t.trim()).filter(Boolean)
    : [];

  // Tools: "## Tools Required\n\nTool1, Tool2, ..."
  const toolsMatch = content.match(/##\s+Tools\s+Required\s*\n+([^\n]+)/);
  const tools = toolsMatch
    ? toolsMatch[1].split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return { description, tools, triggers };
}

/**
 * Discover all skills under SKILLS_ROOT.
 * Returns one descriptor per skill directory that contains a SKILL.md.
 *
 * @returns {Array<{
 *   skill_id: string,
 *   skill_domain: string,
 *   skill_name: string,
 *   description: string,
 *   full_prompt: string,
 *   tools: string[],
 *   triggers: string[]
 * }>}
 */
function discoverSkills() {
  const skills = [];

  const skillMdPaths = findFiles(SKILLS_ROOT, name => name === 'SKILL.md');

  for (const skillMdPath of skillMdPaths) {
    // Directory layout: .claude/skills/<domain>/<skill-name>/SKILL.md
    const skillDir    = path.dirname(skillMdPath);
    const skillName   = path.basename(skillDir);
    const domainDir   = path.dirname(skillDir);
    const skillDomain = path.basename(domainDir);
    const skillId     = `${skillDomain}:${skillName}`;

    // Parse SKILL.md for metadata
    const skillMdContent = fs.readFileSync(skillMdPath, 'utf8');
    const { description, tools, triggers } = parseSkillMd(skillMdContent);

    // Read main-prompt.md for the embedding source text
    const promptPath = path.join(skillDir, 'prompts', 'main-prompt.md');
    let full_prompt = '';
    if (fs.existsSync(promptPath)) {
      full_prompt = fs.readFileSync(promptPath, 'utf8').trim();
    } else {
      // Fallback: use the description from SKILL.md
      full_prompt = description;
    }

    // Skip skills with no embeddable content
    if (!full_prompt) {
      console.warn(`  ⚠  No prompt content for ${skillId} — skipping`);
      continue;
    }

    skills.push({
      skill_id: skillId,
      skill_domain: skillDomain,
      skill_name: skillName,
      description,
      full_prompt,
      tools,
      triggers,
    });
  }

  return skills;
}

/**
 * Call POST /embed with a batch of texts.
 * @param {string[]} texts
 * @returns {Promise<number[][]>} array of 384-dim vectors
 */
async function fetchEmbeddings(texts) {
  const response = await axios.post(
    EMBED_URL,
    { texts },
    { timeout: 60_000 }
  );
  return response.data.embeddings;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('🔍  ORCHESTRAI Skill Indexer');
  console.log(`    Skills root : ${SKILLS_ROOT}`);
  console.log(`    Embed URL   : ${EMBED_URL}`);
  console.log(`    Mode        : ${FORCE ? 'force (re-index all)' : 'incremental'}`);
  console.log('');

  // ── 1. Verify /embed is reachable ──────────────────────────────────────────
  try {
    await axios.get(`${EMBED_URL}/health`, { timeout: 5000 });
    console.log('✅  ML service /embed/health OK\n');
  } catch (err) {
    console.error(
      '❌  ML service not reachable at',
      EMBED_URL,
      '\n    Start it with: cd orchestrai-ml-service && uvicorn app.main:app --port 8000'
    );
    process.exit(1);
  }

  // ── 2. Initialize PostgreSQL schema ───────────────────────────────────────
  const store = new VectorStore();
  try {
    await store.initSchema();
    console.log('✅  Database schema ready\n');
  } catch (err) {
    console.error('❌  Failed to initialize schema:', err.message);
    process.exit(1);
  }

  // ── 3. Discover skills ────────────────────────────────────────────────────
  const allSkills = discoverSkills();
  console.log(`📚  Discovered ${allSkills.length} skill(s)\n`);

  // ── 4. Filter for incremental mode ────────────────────────────────────────
  let skillsToIndex = allSkills;
  if (!FORCE) {
    const indexed = new Set(await store.getAllSkillIds());
    skillsToIndex = allSkills.filter(s => !indexed.has(s.skill_id));
    const skipped = allSkills.length - skillsToIndex.length;
    if (skipped > 0) {
      console.log(`⏭️   Skipping ${skipped} already-indexed skill(s) (use --force to re-index all)\n`);
    }
  }

  if (skillsToIndex.length === 0) {
    console.log('✨  All skills already indexed. Nothing to do.');
    process.exit(0);
  }

  console.log(`⚡  Indexing ${skillsToIndex.length} skill(s)...\n`);

  // ── 5. Batch embed + upsert ───────────────────────────────────────────────
  let indexed = 0;
  let failed  = 0;

  for (let i = 0; i < skillsToIndex.length; i += BATCH_SIZE) {
    const batch = skillsToIndex.slice(i, i + BATCH_SIZE);
    const texts  = batch.map(s => s.full_prompt);

    let embeddings;
    try {
      embeddings = await fetchEmbeddings(texts);
    } catch (err) {
      console.error(
        `  ❌  Embedding batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
        err.message
      );
      failed += batch.length;
      continue;
    }

    for (let j = 0; j < batch.length; j++) {
      const skill     = batch[j];
      const embedding = embeddings[j];

      try {
        await store.upsertSkillEmbedding(skill, embedding);
        indexed++;
        console.log(`  ✅  ${skill.skill_id}`);
      } catch (err) {
        failed++;
        console.error(`  ❌  ${skill.skill_id}: ${err.message}`);
      }
    }
  }

  // ── 6. Summary ────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const total   = await store.count();

  console.log('');
  console.log('─'.repeat(48));
  console.log(`✅  Indexed  : ${indexed}`);
  if (failed > 0) {
    console.log(`❌  Failed   : ${failed}`);
  }
  console.log(`📊  Total in DB: ${total} skill(s)`);
  console.log(`⏱️   Time     : ${elapsed}s`);
  console.log('─'.repeat(48));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
