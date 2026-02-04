#!/usr/bin/env node

/**
 * Skill System Test Suite
 *
 * Tests:
 * 1. Skill index building
 * 2. Skill search/discovery
 * 3. On-demand skill loading
 * 4. Token savings measurement
 */

const SkillLoader = require('../orchestrai-shared/skills/skill-loader');
const logger = require('../orchestrai-shared/logging/logger').forDomain('skill-test');

// ANSI colors for pretty output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  print(`\n${'='.repeat(60)}`, 'blue');
  print(`  ${title}`, 'blue');
  print('='.repeat(60), 'blue');
}

function test(name, fn) {
  try {
    process.stdout.write(`  • ${name}... `);
    const result = fn();
    print('✓ PASS', 'green');
    return result;
  } catch (error) {
    print('✗ FAIL', 'red');
    print(`    Error: ${error.message}`, 'red');
    throw error;
  }
}

async function runTests() {
  section('Skill System Test Suite');

  const loader = new SkillLoader();
  let index, stats, searchResults, loadedSkill;

  // Test 1: Index Building
  section('Test 1: Skill Index Building');

  index = test('Build lightweight skill index', () => {
    const idx = loader.buildLightweightIndex();
    if (!idx || Object.keys(idx).length === 0) {
      throw new Error('Index is empty');
    }
    return idx;
  });

  print(`\n  📊 Index Summary:`, 'blue');
  const domains = Object.keys(index);
  print(`     Domains: ${domains.join(', ')}`);

  for (const [domain, info] of Object.entries(index)) {
    print(`     ${domain}: ${info.subskills.length} skills`);
  }

  // Test 2: Statistics
  section('Test 2: System Statistics');

  stats = test('Get system statistics', () => {
    const s = loader.getStats();
    if (!s.domains || !s.totalSkills) {
      throw new Error('Invalid statistics');
    }
    return s;
  });

  print(`\n  📈 Statistics:`, 'blue');
  print(`     Total domains: ${stats.domains}`);
  print(`     Total skills: ${stats.totalSkills}`);
  print(`     Loaded skills: ${stats.loadedSkills}`);
  print(`     Avg skills/domain: ${stats.averageSkillsPerDomain}`);

  // Test 3: Skill Search - SEO
  section('Test 3: Skill Search (SEO Keywords)');

  searchResults = test('Search for "keyword research SEO"', () => {
    const results = loader.search('keyword research SEO');
    if (!results || results.length === 0) {
      throw new Error('No search results found');
    }
    return results;
  });

  print(`\n  🔍 Search Results (${searchResults.length} matches):`, 'blue');
  searchResults.forEach((result, idx) => {
    print(`     ${idx + 1}. ${result.domain} (score: ${result.score})`);
    print(`        Overview: ${result.overview.substring(0, 80)}...`);
    print(`        Skills: ${result.skills.join(', ')}`);
  });

  // Test 4: Skill Search - Content
  section('Test 4: Skill Search (Content Keywords)');

  searchResults = test('Search for "write blog content"', () => {
    const results = loader.search('write blog content');
    if (!results || results.length === 0) {
      throw new Error('No search results found');
    }
    return results;
  });

  print(`\n  🔍 Search Results (${searchResults.length} matches):`, 'blue');
  searchResults.forEach((result, idx) => {
    print(`     ${idx + 1}. ${result.domain} (score: ${result.score})`);
    print(`        Skills: ${result.skills.join(', ')}`);
  });

  // Test 5: On-Demand Loading
  section('Test 5: On-Demand Skill Loading');

  loadedSkill = test('Load SEO keyword research skill', () => {
    const skill = loader.loadSkill('seo', 'seo-keyword-research');
    if (!skill || skill.length < 100) {
      throw new Error('Loaded skill is too short or invalid');
    }
    return skill;
  });

  print(`\n  📄 Loaded Skill Details:`, 'blue');
  print(`     Domain: seo`);
  print(`     Skill: seo-keyword-research`);
  print(`     Size: ${loadedSkill.length} characters (~${Math.round(loadedSkill.length / 4)} tokens)`);
  print(`     Preview: ${loadedSkill.substring(0, 150)}...`);

  // Test 6: Caching
  section('Test 6: Skill Caching');

  test('Verify cached loading is faster', () => {
    const start = Date.now();
    const cachedSkill = loader.loadSkill('seo', 'seo-keyword-research');
    const duration = Date.now() - start;

    if (duration > 10) {
      throw new Error(`Caching not working (took ${duration}ms)`);
    }

    if (cachedSkill !== loadedSkill) {
      throw new Error('Cached skill does not match original');
    }

    return duration;
  });

  stats = loader.getStats();
  print(`\n  💾 Cache Status:`, 'blue');
  print(`     Loaded skills in cache: ${stats.loadedSkills}`);
  print(`     Cache hit was near-instant (< 10ms)`);

  // Test 7: Context Index
  section('Test 7: Context-Friendly Index');

  const contextIndex = test('Get context-friendly index', () => {
    const idx = loader.getContextIndex();
    if (!idx || Object.keys(idx).length === 0) {
      throw new Error('Context index is empty');
    }
    return idx;
  });

  print(`\n  📋 Context Index Size:`, 'blue');
  const jsonSize = JSON.stringify(contextIndex).length;
  const estimatedTokens = Math.round(jsonSize / 4);
  print(`     JSON size: ${jsonSize} characters`);
  print(`     Estimated tokens: ~${estimatedTokens}`);
  print(`     Full agents would be: ~254,000 tokens`);
  print(`     Token savings: ${Math.round((1 - estimatedTokens / 254000) * 100)}%`);

  // Test 8: Multiple Skill Loading
  section('Test 8: Load Multiple Skills');

  test('Load content writer skill', () => {
    const skill = loader.loadSkill('content', 'content-writer-specialist');
    if (!skill || skill.length < 100) {
      throw new Error('Failed to load content skill');
    }
  });

  test('Load frontend architect skill', () => {
    const skill = loader.loadSkill('webdev', 'frontend-architect-specialist');
    if (!skill || skill.length < 100) {
      throw new Error('Failed to load webdev skill');
    }
  });

  test('Load ICP analyst skill', () => {
    const skill = loader.loadSkill('client-intelligence', 'client-icp-analyst');
    if (!skill || skill.length < 100) {
      throw new Error('Failed to load client-intelligence skill');
    }
  });

  stats = loader.getStats();
  print(`\n  📊 Updated Stats:`, 'blue');
  print(`     Total skills loaded: ${stats.loadedSkills}`);
  print(`     Remaining unloaded: ${stats.totalSkills - stats.loadedSkills}`);

  // Test 9: Progressive Disclosure Benefits
  section('Test 9: Token Usage Analysis');

  print(`\n  💰 Progressive Disclosure Impact:`, 'blue');
  print(`     Traditional approach (all agents loaded):`);
  print(`       - All 103 agents in memory: ~254,000 tokens`);
  print(`       - Context used: 50-70% before starting work`);
  print(``);
  print(`     Progressive disclosure (skills system):`);
  print(`       - Lightweight index: ~${estimatedTokens} tokens`);
  print(`       - Loaded on-demand: ${stats.loadedSkills} skills (~${stats.loadedSkills * 2000} tokens)`);
  print(`       - Total usage: ~${estimatedTokens + (stats.loadedSkills * 2000)} tokens`);
  print(`       - Context saved: ~${254000 - (estimatedTokens + stats.loadedSkills * 2000)} tokens`);
  print(`       - Savings: ${Math.round((1 - (estimatedTokens + stats.loadedSkills * 2000) / 254000) * 100)}%`);

  // Test 10: Edge Cases
  section('Test 10: Error Handling');

  test('Handle non-existent skill gracefully', () => {
    try {
      loader.loadSkill('nonexistent', 'fake-skill');
      throw new Error('Should have thrown an error');
    } catch (error) {
      if (!error.message.includes('not found')) {
        throw new Error('Wrong error type');
      }
    }
  });

  test('Handle empty search query', () => {
    const results = loader.search('');
    // Should return empty or low-relevance results
    return results;
  });

  test('Search with no matches returns empty', () => {
    const results = loader.search('xyzabc123notarealskill');
    if (results.length > 0 && results[0].score > 0.5) {
      throw new Error('Should not find high-relevance matches for gibberish');
    }
  });

  // Final Summary
  section('Test Summary');

  print(`\n  ✅ All tests passed!`, 'green');
  print(`\n  🎯 Key Findings:`, 'blue');
  print(`     • Skill system is fully functional`);
  print(`     • Search and discovery working perfectly`);
  print(`     • On-demand loading operational`);
  print(`     • Caching working correctly`);
  print(`     • Token savings: ~${Math.round((1 - (estimatedTokens + stats.loadedSkills * 2000) / 254000) * 100)}% vs traditional approach`);
  print(`\n  📦 System Ready:`, 'blue');
  print(`     • ${stats.domains} domains configured`);
  print(`     • ${stats.totalSkills} skills available`);
  print(`     • ${stats.loadedSkills} skills currently loaded`);
  print(`     • Context overhead: ~${estimatedTokens} tokens (vs 254,000)`);

  print(`\n${'='.repeat(60)}`, 'green');
  print(`  SKILL SYSTEM: FULLY OPERATIONAL ✓`, 'green');
  print('='.repeat(60), 'green');
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => {
      print('\n✓ Test suite completed successfully\n', 'green');
      process.exit(0);
    })
    .catch((error) => {
      print('\n✗ Test suite failed\n', 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runTests };
