#!/usr/bin/env node

/**
 * Create Ultra-Minimal Agent Proxies
 *
 * Replace full agent files with minimal proxies that:
 * 1. Have only essential frontmatter (~5-10 tokens each)
 * 2. Point to orchestrai-skills/ for full content
 * 3. Reduce .claude/agents/ overhead from 3.7k to ~500 tokens
 *
 * This achieves TRUE on-demand loading at the agent level.
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '../.claude/agents');
const AGENTS_BACKUP = path.join(__dirname, '../.claude/agents.backup');
const SKILLS_DIR = path.join(__dirname, '../orchestrai-skills');

// Create backup first
function backupAgents() {
  if (!fs.existsSync(AGENTS_BACKUP)) {
    console.log('📦 Creating backup: .claude/agents.backup/');
    fs.mkdirSync(AGENTS_BACKUP, { recursive: true });

    const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));

    for (const file of files) {
      fs.copyFileSync(
        path.join(AGENTS_DIR, file),
        path.join(AGENTS_BACKUP, file)
      );
    }

    console.log(`✅ Backed up ${files.length} agent files\n`);
  } else {
    console.log('✅ Backup already exists\n');
  }
}

/**
 * Find agent in skills directory
 */
function findSkillPath(agentName) {
  // Search all domains for this agent
  const domains = fs.readdirSync(SKILLS_DIR).filter(d => {
    const stat = fs.statSync(path.join(SKILLS_DIR, d));
    return stat.isDirectory() && !d.startsWith('.');
  });

  for (const domain of domains) {
    const skillDir = path.join(SKILLS_DIR, domain, agentName);
    const promptFile = path.join(skillDir, 'prompts/main-prompt.md');

    if (fs.existsSync(promptFile)) {
      return { domain, skillDir, promptFile };
    }
  }

  return null;
}

/**
 * Read metadata from original agent file
 */
function extractMetadata(agentFile) {
  const content = fs.readFileSync(agentFile, 'utf8');
  const match = content.match(/^---\n(.*?)\n---/s);

  if (!match) return {};

  const metadata = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.substring(0, idx).trim();
    const value = line.substring(idx + 1).trim();

    if (key && value) {
      metadata[key] = value;
    }
  }

  return metadata;
}

/**
 * Create minimal proxy agent
 */
function createMinimalProxy(agentName) {
  const agentFile = path.join(AGENTS_DIR, `${agentName}.md`);

  // Find in skills directory
  const skill = findSkillPath(agentName);

  if (!skill) {
    console.warn(`⚠️  Skill not found for ${agentName}, keeping original`);
    return { skipped: true };
  }

  // Read original metadata
  const metadata = extractMetadata(agentFile);

  // Create ultra-minimal proxy
  const minimalProxy = `---
name: ${metadata.name || agentName}
skill: orchestrai-skills/${skill.domain}/${agentName}
---

Load full agent from: \`orchestrai-skills/${skill.domain}/${agentName}/prompts/main-prompt.md\`
`;

  // Write minimal proxy
  fs.writeFileSync(agentFile, minimalProxy);

  return { success: true, domain: skill.domain };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating Minimal Agent Proxies\n');
  console.log('This will reduce .claude/agents/ from 3.7k to ~500 tokens\n');

  // Step 1: Backup
  backupAgents();

  // Step 2: Get all agents
  const agents = fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  console.log(`📊 Processing ${agents.length} agents\n`);

  const stats = {
    total: agents.length,
    proxied: 0,
    skipped: 0,
    errors: 0
  };

  // Step 3: Create minimal proxies
  for (const agentName of agents) {
    try {
      const result = createMinimalProxy(agentName);

      if (result.skipped) {
        stats.skipped++;
        continue;
      }

      if (result.success) {
        stats.proxied++;
        console.log(`✅ ${agentName} → minimal proxy (${result.domain})`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${agentName}:`, error.message);
      stats.errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Proxy Creation Summary');
  console.log('='.repeat(60));
  console.log(`Total agents: ${stats.total}`);
  console.log(`✅ Proxied: ${stats.proxied}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);

  console.log('\n💡 Next Steps:');
  console.log('1. Restart Claude Code session');
  console.log('2. Run /context to verify token reduction');
  console.log('3. Test agent invocation to ensure it works');
  console.log('\n🔄 To rollback: mv .claude/agents.backup/* .claude/agents/');
  console.log('\n✨ Done!\n');
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = { createMinimalProxy };
