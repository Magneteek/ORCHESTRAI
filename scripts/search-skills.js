#!/usr/bin/env node
/**
 * search-skills.js
 *
 * Interactive semantic skill search — type what you want to do,
 * get back the most relevant ORCHESTRAI skills.
 *
 * Usage:
 *   node scripts/search-skills.js "write healthcare content in Dutch"
 *   node scripts/search-skills.js "dental SEO local ranking" --domain seo
 *   node scripts/search-skills.js "set up CI/CD pipeline" --top 5
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { VectorMemoryAdapter } = require('../orchestrai-shared/memory/adapters/vector-memory-adapter');

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
Usage: node scripts/search-skills.js <query> [options]

Options:
  --domain <name>   Restrict to a skill domain (seo, content, quality, devops, ...)
  --top <n>         Number of results (default: 5)

Examples:
  node scripts/search-skills.js "write healthcare blog post"
  node scripts/search-skills.js "competitor backlink analysis" --domain seo
  node scripts/search-skills.js "run e2e tests" --top 8
`);
  process.exit(0);
}

let query = '';
let domain = null;
let top = 5;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--domain' && args[i + 1]) { domain = args[++i]; }
  else if (args[i] === '--top' && args[i + 1]) { top = parseInt(args[++i], 10); }
  else if (!args[i].startsWith('--')) { query += (query ? ' ' : '') + args[i]; }
}

if (!query.trim()) {
  console.error('Error: provide a search query');
  process.exit(1);
}

// ── Search ────────────────────────────────────────────────────────────────────

const DOMAIN_COLORS = {
  seo: '\x1b[33m',        // yellow
  content: '\x1b[36m',    // cyan
  quality: '\x1b[32m',    // green
  devops: '\x1b[34m',     // blue
  webdev: '\x1b[35m',     // magenta
  advertising: '\x1b[31m', // red
  default: '\x1b[37m',    // white
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function domainColor(domain) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
}

function bar(pct) {
  const filled = Math.round(pct / 5);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

(async () => {
  const adapter = new VectorMemoryAdapter({ autoInitialize: false });

  try {
    await adapter.initialize();
  } catch (err) {
    console.error(`\n❌ Cannot connect to database: ${err.message}`);
    console.error('   Make sure orchestrai-postgres is running: npm run system:start-all');
    process.exit(1);
  }

  console.log(`\n${BOLD}🔍 Semantic Skill Search${RESET}`);
  console.log(`   Query : "${query}"`);
  if (domain) console.log(`   Domain: ${domain}`);
  console.log('');

  let results;
  try {
    results = await adapter.searchSimilar(query.trim(), top, domain ? { domain } : {});
  } catch (err) {
    console.error(`❌ Search failed: ${err.message}`);
    console.error('   Is the ML service running? npm run system:start-all');
    process.exit(1);
  }

  if (results.length === 0) {
    console.log('   No results found.');
    process.exit(0);
  }

  results.forEach((r, i) => {
    const pct = Math.round(r.similarity * 100);
    const color = domainColor(r.entity.skill_domain);
    const desc = r.entity.description
      ? r.entity.description.replace(/^#+\s*/, '').slice(0, 90)
      : '(no description)';

    console.log(
      `${BOLD}${i + 1}. ${color}${r.entity.skill_id}${RESET}  ` +
      `${BOLD}${pct}%${RESET}  ${DIM}${bar(pct)}${RESET}`
    );
    console.log(`   ${DIM}${desc}${RESET}`);

    // Show how to invoke
    const [dom, name] = r.entity.skill_id.split(':');
    if (name && dom !== 'skills' && dom !== 'commands') {
      console.log(`   ${DIM}→ Skill(skill="${dom}:${name}")${RESET}`);
    }
    console.log('');
  });

  process.exit(0);
})();
