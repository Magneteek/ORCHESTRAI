#!/usr/bin/env node

/**
 * Migrate ALL agents to skills format
 *
 * Takes all agents from .claude/agents/ and converts them to
 * the progressive disclosure skills format in orchestrai-skills/
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '../.claude/agents');
const SKILLS_DIR = path.join(__dirname, '../orchestrai-skills');

// Enhanced domain mapping with more patterns
const DOMAIN_MAP = {
  // SEO
  'seo-': 'seo',
  'backlink-': 'seo',

  // Content
  'content-': 'content',
  'multi-language-': 'content',
  'dutch-': 'content',
  'language-': 'content',

  // Client Intelligence
  'client-': 'client-intelligence',
  'icp-': 'client-intelligence',

  // Web Development
  'frontend-': 'webdev',
  'backend-': 'webdev',
  'ui-': 'webdev',
  'api-': 'webdev',
  'responsive-': 'webdev',
  'design-system-': 'webdev',

  // Quality & Testing
  'e2e-': 'quality',
  'accessibility-': 'quality',
  'security-': 'quality',
  'test-': 'quality',
  'testing-': 'quality',
  'quality-': 'quality',
  'performance-monitoring': 'quality',

  // DevOps
  'devops-': 'devops',
  'cicd-': 'devops',
  'docker-': 'devops',
  'kubernetes-': 'devops',
  'deployment-': 'devops',

  // Advertising
  'google-ads-': 'advertising',
  'meta-ads-': 'advertising',
  'linkedin-ads-': 'advertising',
  'reddit-ads-': 'advertising',
  'ad-copy-': 'advertising',

  // Email Marketing
  'email-': 'email-marketing',
  'nurture-': 'email-marketing',
  'cold-email-': 'email-marketing',

  // Strategic Planning (Opus-tier)
  'strategic-': 'strategic-planning',
  'orchestrai-': 'strategic-planning',
  'financial-': 'strategic-planning',
  'vaibe-': 'strategic-planning',
  'simultaneous-': 'strategic-planning',
  'ai-project-': 'strategic-planning',
  'intelligent-risk-': 'strategic-planning',
  'performance-forecasting-': 'strategic-planning',
  'advanced-performance-': 'strategic-planning',
  'semantic-analysis-': 'strategic-planning',
  'crystalline-': 'strategic-planning',

  // Agent SDK
  'agent-sdk-': 'agent-sdk',

  // Reviews & Reputation
  'reviews-': 'reputation-intelligence',
  'gbp-': 'local-seo',

  // Conversion & CRO
  'conversion-': 'conversion-optimization',
  'landing-page-': 'conversion-optimization',

  // Data & Analytics
  'data-': 'data-analytics'
};

/**
 * Determine domain from agent name
 */
function getDomain(agentName) {
  // Try exact prefix matches first
  for (const [prefix, domain] of Object.entries(DOMAIN_MAP)) {
    if (agentName.startsWith(prefix)) {
      return domain;
    }
  }

  // Fallback domain based on common patterns
  if (agentName.includes('seo')) return 'seo';
  if (agentName.includes('content')) return 'content';
  if (agentName.includes('test')) return 'quality';
  if (agentName.includes('performance')) return 'strategic-planning';

  return 'shared';
}

/**
 * Extract metadata from agent frontmatter
 */
function extractMetadata(content) {
  const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
  if (!frontmatterMatch) return {};

  const metadata = {};
  const lines = frontmatterMatch[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    if (key && value) {
      metadata[key] = value;
    }
  }

  return metadata;
}

/**
 * Extract overview from agent content
 */
function extractOverview(content) {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n.*?\n---\n/s, '');

  // Find first paragraph
  const lines = withoutFrontmatter.split('\n');
  let overview = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines at start
    if (overview.length === 0 && trimmed === '') continue;

    // Skip markdown headers
    if (trimmed.startsWith('#')) continue;

    // Collect lines until empty line
    if (trimmed === '' && overview.length > 0) break;

    if (trimmed) {
      overview.push(trimmed);
    }
  }

  return overview.join(' ').substring(0, 300);
}

/**
 * Extract keywords from agent name and description
 */
function extractKeywords(name, description) {
  const keywords = new Set();

  // From name
  const nameParts = name.split('-');
  nameParts.forEach(part => {
    if (part.length > 2) { // Skip very short words
      keywords.add(part.toLowerCase());
    }
  });

  // From description (common important words)
  const importantWords = description.toLowerCase().match(/\b\w{4,}\b/g) || [];
  importantWords.slice(0, 10).forEach(word => keywords.add(word));

  return Array.from(keywords).slice(0, 12).join(', ');
}

/**
 * Create skill SKILL.md file
 */
function createSkillMetadata(agentName, metadata, overview, keywords) {
  const { name, description = '', model = 'sonnet', color = 'green' } = metadata;

  return `# ${agentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Skill

## Overview

${overview}

## When to Load

**Use this skill when user mentions**: ${keywords}

**Load if task involves**:
- ${description}
- Related ${getDomain(agentName)} domain work

## Configuration

**Model**: ${model}
**Color**: ${color}


## Tools Required

${metadata.tools || 'Standard tools'}

## Full Prompt

\`\`\`
Load: prompts/main-prompt.md
\`\`\`

---

**Token Efficiency**:
- Full agent definition: ~${Math.round(overview.length * 5)} characters
- This overview: ~${overview.length} characters (**${Math.round((1 - overview.length / (overview.length * 5)) * 100)}% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/${agentName}.md*
`;
}

/**
 * Migrate a single agent to skills format
 */
function migrateAgent(agentName) {
  const agentFile = path.join(AGENTS_DIR, `${agentName}.md`);

  // Check if already migrated
  const domain = getDomain(agentName);
  const skillDir = path.join(SKILLS_DIR, domain, agentName);

  if (fs.existsSync(path.join(skillDir, 'prompts/main-prompt.md'))) {
    console.log(`⏭️  Skipping ${agentName} (already migrated)`);
    return { skipped: true };
  }

  // Read agent content
  if (!fs.existsSync(agentFile)) {
    console.warn(`⚠️  Agent file not found: ${agentFile}`);
    return { error: 'File not found' };
  }

  const content = fs.readFileSync(agentFile, 'utf8');
  const metadata = extractMetadata(content);
  const overview = extractOverview(content);
  const keywords = extractKeywords(agentName, metadata.description || '');

  // Create skill directory structure
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(path.join(skillDir, 'prompts'), { recursive: true });

  // Create SKILL.md
  const skillMd = createSkillMetadata(agentName, metadata, overview, keywords);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);

  // Copy full prompt to prompts/main-prompt.md
  fs.writeFileSync(path.join(skillDir, 'prompts/main-prompt.md'), content);

  console.log(`✅ Migrated ${agentName} → ${domain}/${agentName}`);
  return { success: true, domain };
}

/**
 * Ensure domain SKILL.md exists
 */
function ensureDomainSkillMd(domain) {
  const domainDir = path.join(SKILLS_DIR, domain);
  const domainSkillMd = path.join(domainDir, 'SKILL.md');

  if (fs.existsSync(domainSkillMd)) return;

  // Create domain directory
  fs.mkdirSync(domainDir, { recursive: true });

  // Create basic domain SKILL.md
  const content = `# ${domain.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Domain

## Overview

Specialized agents for ${domain} tasks.

Keywords: ${domain.replace('-', ', ')}

## Available Skills

See subdirectories for individual skills in this domain.
`;

  fs.writeFileSync(domainSkillMd, content);
  console.log(`📁 Created domain: ${domain}/`);
}

/**
 * Main migration function
 */
async function migrateAll() {
  console.log('🚀 Starting agent migration to skills format\n');

  // Get all agent files
  const agentFiles = fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  console.log(`📊 Found ${agentFiles.length} agents to process\n`);

  const stats = {
    total: agentFiles.length,
    migrated: 0,
    skipped: 0,
    errors: 0,
    byDomain: {}
  };

  // Migrate each agent
  for (const agentName of agentFiles) {
    const result = migrateAgent(agentName);

    if (result.skipped) {
      stats.skipped++;
    } else if (result.error) {
      stats.errors++;
    } else if (result.success) {
      stats.migrated++;

      // Track by domain
      const domain = result.domain;
      stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;

      // Ensure domain SKILL.md exists
      ensureDomainSkillMd(domain);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total agents: ${stats.total}`);
  console.log(`✅ Migrated: ${stats.migrated}`);
  console.log(`⏭️  Skipped (already done): ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log('\nBy Domain:');

  Object.entries(stats.byDomain)
    .sort(([, a], [, b]) => b - a)
    .forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} skills`);
    });

  console.log('\n✨ Migration complete!');
  console.log(`\n📦 Skills are now in: ${SKILLS_DIR}/`);
  console.log('💡 Run test-skill-system.js to verify the migration\n');
}

// Run migration
if (require.main === module) {
  migrateAll()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAgent, migrateAll };
