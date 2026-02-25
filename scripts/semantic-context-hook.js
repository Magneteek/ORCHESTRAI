#!/usr/bin/env node
/**
 * semantic-context-hook.js
 *
 * Claude Code UserPromptSubmit hook.
 *
 * Fires before Claude processes each user message. Runs semantic searches
 * over skills + project deliverables in parallel and outputs the top matches
 * to stdout — Claude Code injects that output as context Claude sees first.
 *
 * Design constraints:
 *   - Must complete within 4.5s (hook timeout = 5s)
 *   - Must never crash or block — all errors are swallowed silently
 *   - Output must be compact (< 20 lines) to avoid context bloat
 *   - Short/conversational messages are skipped entirely
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const axios = require('axios');
const { VectorStore } = require('../orchestrai-shared/database/vector-store');

const EMBED_URL = process.env.ML_SERVICE_URL
  ? `${process.env.ML_SERVICE_URL}/embed`
  : 'http://localhost:8000/embed';

// ── Skip detection ─────────────────────────────────────────────────────────────
// Messages that don't warrant a semantic search (conversational, too short, etc.)

const SKIP_PREFIXES = [
  'ok', 'yes', 'no', 'sure', 'great', 'thanks', 'thank you', 'perfect',
  'got it', 'sounds good', 'done', 'noted', 'understood', 'agreed',
  'what is', 'what are', 'how do i', 'can you explain', 'why does',
];

function shouldSkip(prompt) {
  if (!prompt || prompt.length < 25) return true;
  const lower = prompt.trim().toLowerCase();
  return SKIP_PREFIXES.some(p => lower.startsWith(p));
}

// ── Embed helper ───────────────────────────────────────────────────────────────

async function embed(text) {
  const response = await axios.post(
    EMBED_URL,
    { texts: [text] },
    { timeout: 3_000 }
  );
  return response.data.embeddings[0];
}

// ── Format output ──────────────────────────────────────────────────────────────

function formatSkills(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = rows
    .filter(r => r.similarity > 0.25)  // only show relevant matches
    .slice(0, 3)
    .map(r => {
      const pct = Math.round(r.similarity * 100);
      return `  • ${pct}%  ${r.skill_id}  → Skill(skill="${r.skill_id}")`;
    });
  if (lines.length === 0) return '';
  return 'Relevant skills:\n' + lines.join('\n');
}

function formatDeliverables(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = rows
    .filter(r => r.similarity > 0.35)  // higher threshold for deliverables
    .slice(0, 3)
    .map(r => {
      const pct = Math.round(r.similarity * 100);
      const title = (r.title || r.deliverable_id).slice(0, 60);
      return `  • ${pct}%  "${title}" [${r.client_name} / ${r.domain}]\n    ${r.file_path}`;
    });
  if (lines.length === 0) return '';
  return 'Relevant past deliverables:\n' + lines.join('\n');
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  // Read stdin
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let prompt = '';
  try {
    const data = JSON.parse(input);
    prompt = data.prompt || '';
  } catch {
    return; // invalid JSON — exit silently
  }

  if (shouldSkip(prompt)) return;

  const store = new VectorStore();

  // Race all work against a 4-second hard timeout
  const work = async () => {
    // Single embed call for the prompt
    const queryEmbedding = await embed(prompt.slice(0, 500));

    // Run skill search + deliverable search in parallel
    const [skillRows, deliverableRows] = await Promise.all([
      store.searchSimilarSkills(queryEmbedding, 5).catch(() => []),
      store.searchSimilarDeliverables(queryEmbedding, 4).catch(() => []),
    ]);

    const skillsBlock       = formatSkills(skillRows);
    const deliverablesBlock = formatDeliverables(deliverableRows);

    if (!skillsBlock && !deliverablesBlock) return;

    const parts = ['[ORCHESTRAI Knowledge Context]'];
    if (skillsBlock)       parts.push(skillsBlock);
    if (deliverablesBlock) parts.push(deliverablesBlock);

    process.stdout.write(parts.join('\n\n') + '\n');
  };

  const timeout = new Promise(resolve => setTimeout(resolve, 4_000));

  try {
    await Promise.race([work(), timeout]);
  } catch {
    // Any error — exit silently, never block the conversation
  }
}

main().catch(() => {});
