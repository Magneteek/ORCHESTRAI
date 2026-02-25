#!/usr/bin/env node
/**
 * search-projects.js
 *
 * Semantic search across ORCHESTRAI project knowledge:
 *   - Finds similar past projects (by client profile / industry / strategy)
 *   - Finds relevant deliverables (keyword reports, content, audits, research)
 *
 * Usage:
 *   node scripts/search-projects.js "dental clinic local SEO strategy"
 *   node scripts/search-projects.js "B2B SaaS competitor analysis" --type deliverables
 *   node scripts/search-projects.js "keyword research" --domain seo --top 8
 *   node scripts/search-projects.js "UX wireframes" --type both
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { VectorMemoryAdapter } = require('../orchestrai-shared/memory/adapters/vector-memory-adapter');

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
Usage: node scripts/search-projects.js <query> [options]

Options:
  --type <projects|deliverables|both>   What to search (default: both)
  --domain <seo|content|research|...>   Filter deliverables by domain
  --top <n>                             Number of results per type (default: 5)

Examples:
  node scripts/search-projects.js "dental clinic SEO strategy"
  node scripts/search-projects.js "keyword research report" --type deliverables --domain seo
  node scripts/search-projects.js "SaaS competitor analysis" --top 8
`);
  process.exit(0);
}

let query  = '';
let type   = 'both';
let domain = null;
let top    = 5;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type'   && args[i + 1]) { type   = args[++i]; }
  else if (args[i] === '--domain' && args[i + 1]) { domain = args[++i]; }
  else if (args[i] === '--top'    && args[i + 1]) { top    = parseInt(args[++i], 10); }
  else if (!args[i].startsWith('--')) { query += (query ? ' ' : '') + args[i]; }
}

if (!query.trim()) {
  console.error('Error: provide a search query');
  process.exit(1);
}

// ── Colors ───────────────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';
const CYAN  = '\x1b[36m';
const YELLOW= '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE  = '\x1b[34m';

const DOMAIN_COLORS = {
  seo:         YELLOW,
  content:     CYAN,
  research:    GREEN,
  design:      '\x1b[35m',
  development: BLUE,
  intelligence:'\x1b[37m',
  general:     DIM,
};

function bar(pct) {
  const filled = Math.round(pct / 5);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

function domainColor(d) {
  return DOMAIN_COLORS[d] || DIM;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const adapter = new VectorMemoryAdapter({ autoInitialize: false });

  try {
    await adapter.initialize();
  } catch (err) {
    console.error(`\n❌ Cannot connect to database: ${err.message}`);
    console.error('   Make sure orchestrai-postgres is running: npm run system:start-all');
    process.exit(1);
  }

  console.log(`\n${BOLD}🔍 Project Knowledge Search${RESET}`);
  console.log(`   Query : "${query}"`);
  if (domain) console.log(`   Domain: ${domain}`);
  console.log(`   Type  : ${type}`);
  console.log('');

  const doProjects    = type === 'both' || type === 'projects';
  const doDeliverables = type === 'both' || type === 'deliverables';

  // ── Projects ────────────────────────────────────────────────────────────────
  if (doProjects) {
    let results;
    try {
      results = await adapter.searchSimilarProjects(query.trim(), top);
    } catch (err) {
      console.error(`❌ Project search failed: ${err.message}`);
      results = [];
    }

    console.log(`${BOLD}── Similar Projects (${results.length})${RESET}`);
    if (results.length === 0) {
      console.log(`   ${DIM}No projects indexed yet. Run: npm run projects:index${RESET}\n`);
    } else {
      results.forEach((r, i) => {
        const pct   = Math.round(r.similarity * 100);
        const p     = r.project;
        console.log(
          `${BOLD}${i + 1}. ${CYAN}${p.client_name}${RESET}  ` +
          `${BOLD}${pct}%${RESET}  ${DIM}${bar(pct)}${RESET}`
        );
        console.log(`   ${DIM}${p.industry || p.project_type || 'General project'}${RESET}`);
        if (p.summary) {
          const snippet = p.summary.replace(/^Client:[^.]+\.\s*/, '').slice(0, 100);
          console.log(`   ${DIM}${snippet}${RESET}`);
        }
        console.log(`   ${DIM}ID: ${p.project_id}${RESET}`);
        console.log('');
      });
    }
  }

  // ── Deliverables ───────────────────────────────────────────────────────────
  if (doDeliverables) {
    let results;
    try {
      results = await adapter.searchSimilarDeliverables(
        query.trim(),
        top,
        domain ? { domain } : {}
      );
    } catch (err) {
      console.error(`❌ Deliverable search failed: ${err.message}`);
      results = [];
    }

    console.log(`${BOLD}── Relevant Deliverables (${results.length})${RESET}`);
    if (results.length === 0) {
      console.log(`   ${DIM}No deliverables indexed yet. Run: npm run projects:index${RESET}\n`);
    } else {
      results.forEach((r, i) => {
        const pct   = Math.round(r.similarity * 100);
        const d     = r.deliverable;
        const color = domainColor(d.domain);
        console.log(
          `${BOLD}${i + 1}. ${color}${d.title || d.deliverable_id}${RESET}  ` +
          `${BOLD}${pct}%${RESET}  ${DIM}${bar(pct)}${RESET}`
        );
        console.log(`   ${DIM}Client: ${d.client_name}  Domain: ${d.domain}  Words: ~${d.word_count}${RESET}`);
        if (d.excerpt) {
          console.log(`   ${DIM}${d.excerpt.slice(0, 120).replace(/\n/g, ' ')}${RESET}`);
        }
        console.log(`   ${DIM}File: ${d.file_path}${RESET}`);
        console.log('');
      });
    }
  }

  process.exit(0);
})();
