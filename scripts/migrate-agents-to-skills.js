#!/usr/bin/env node

/**
 * Migrate high-frequency agents to skills format
 *
 * Start with top 20 most-used agents across key domains
 * This creates the skills system foundation
 */

const fs = require('fs');
const path = require('path');

// Top 20 agents to migrate first (highest usage frequency)
const TOP_AGENTS = [
  // SEO (5 agents)
  'seo-keyword-research',
  'seo-competitor-analysis',
  'seo-technical-analysis',
  'seo-content-optimization',
  'seo-local-seo',

  // Content (5 agents)
  'content-writer-specialist',
  'content-ai-phrase-detector',
  'content-structure-corrector',
  'content-outline-architect',
  'multi-language-content-adapter',

  // Client Intelligence (3 agents)
  'client-icp-analyst',
  'client-branding-intelligence',
  'client-business-context-analyzer',

  // Web Dev (4 agents)
  'frontend-architect-specialist',
  'ui-component-developer',
  'backend-development-specialist',
  'api-architect',

  // Quality (3 agents)
  'e2e-test-automator',
  'accessibility-agent',
  'security-testing-specialist'
];

// Domain mapping based on agent name prefix
const DOMAIN_MAP = {
  'seo-': 'seo',
  'content-': 'content',
  'client-': 'client-intelligence',
  'frontend-': 'webdev',
  'backend-': 'webdev',
  'ui-': 'webdev',
  'api-': 'webdev',
  'e2e-': 'quality',
  'accessibility-': 'quality',
  'security-': 'quality',
  'multi-language-': 'content'
};

/**
 * Determine domain from agent name
 */
function getDomain(agentName) {
  for (const [prefix, domain] of Object.entries(DOMAIN_MAP)) {
    if (agentName.startsWith(prefix)) {
      return domain;
    }
  }
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
 * Extract first meaningful paragraph from agent description
 */
function extractFirstParagraph(content) {
  const lines = content.split('\n');
  let collecting = false;
  let paragraph = [];

  for (const line of lines) {
    // Look for agent description start
    if (line.match(/^You are a specialized|^You are an|^# .*specialist|^# .*agent/i)) {
      collecting = true;
    }

    if (collecting) {
      if (line.trim() === '' && paragraph.length > 0) {
        break; // End of paragraph
      }
      if (line.trim()) {
        paragraph.push(line.trim());
      }
    }
  }

  const result = paragraph.join(' ').substring(0, 300);
  return result || `Specialized agent for ${extractAgentPurpose(content)}`;
}

/**
 * Extract agent purpose from content
 */
function extractAgentPurpose(content) {
  const match = content.match(/for (.*?)(?:\.|,|\n)/);
  return match ? match[1] : 'specialized tasks';
}

/**
 * Extract keywords from agent name and description
 */
function extractKeywords(name, description) {
  const keywords = new Set();

  // From name
  const nameParts = name.split('-');
  nameParts.forEach(part => {
    if (part.length > 3) { // Skip short words
      keywords.add(part);
    }
  });

  // Common important words
  const importantWords = [
    'seo', 'content', 'keyword', 'analysis', 'optimization', 'research',
    'frontend', 'backend', 'api', 'ui', 'component', 'test', 'quality',
    'client', 'branding', 'intelligence', 'security', 'accessibility'
  ];

  const descWords = description.toLowerCase().split(/\s+/);
  descWords.forEach(word => {
    const cleaned = word.replace(/[^a-z]/g, '');
    if (importantWords.includes(cleaned)) {
      keywords.add(cleaned);
    }
  });

  return Array.from(keywords).slice(0, 10);
}

/**
 * Format agent name for display
 */
function formatName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate lightweight SKILL.md file
 */
function generateSkillMd(name, metadata, content) {
  const overview = extractFirstParagraph(content);
  const keywords = extractKeywords(name, metadata.description || overview);

  return `# ${formatName(name)} Skill

## Overview

${overview}

## When to Load

**Use this skill when user mentions**: ${keywords.join(', ')}

**Load if task involves**:
- ${metadata.description || 'Specialized tasks requiring this expertise'}
- Related ${getDomain(name)} domain work

## Configuration

**Model**: ${metadata.model || 'sonnet'}
**Color**: ${metadata.color || 'green'}
${metadata.effort ? `**Effort**: ${metadata.effort}` : ''}

## Tools Required

${metadata.tools || 'Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task'}

## Full Prompt

\`\`\`
Load: prompts/main-prompt.md
\`\`\`

---

**Token Efficiency**:
- Full agent definition: ~${content.length} characters
- This overview: ~${overview.length} characters (**${Math.round((1 - overview.length/content.length) * 100)}% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/${name}.md*
`;
}

/**
 * Migrate a single agent to skill format
 */
function migrateAgent(agentName) {
  const agentPath = path.join(process.cwd(), '.claude/agents', `${agentName}.md`);

  if (!fs.existsSync(agentPath)) {
    console.log(`⚠️  Agent not found: ${agentName}`);
    return false;
  }

  const content = fs.readFileSync(agentPath, 'utf8');
  const domain = getDomain(agentName);

  // Create skill directory structure
  const skillDir = path.join(process.cwd(), 'orchestrai-skills', domain, agentName);
  const promptsDir = path.join(skillDir, 'prompts');

  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(promptsDir, { recursive: true });

  // Extract metadata
  const metadata = extractMetadata(content);

  // Create lightweight SKILL.md
  const skillMd = generateSkillMd(agentName, metadata, content);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);

  // Copy full prompt to prompts/main-prompt.md
  fs.writeFileSync(path.join(promptsDir, 'main-prompt.md'), content);

  console.log(`✅ Migrated: ${agentName} → ${domain}/${agentName}`);
  return true;
}

/**
 * Create domain-level SKILL.md files
 */
function createDomainSkillFiles() {
  const domains = {
    'seo': {
      overview: 'SEO research, analysis, and optimization specialists',
      keywords: ['seo', 'keyword', 'serp', 'backlink', 'ranking', 'optimization']
    },
    'content': {
      overview: 'Content creation, optimization, and quality assurance specialists',
      keywords: ['content', 'writing', 'ai detection', 'optimization', 'language']
    },
    'client-intelligence': {
      overview: 'Client analysis, ICP profiling, and business context specialists',
      keywords: ['client', 'icp', 'branding', 'business', 'analysis']
    },
    'webdev': {
      overview: 'Frontend, backend, and API development specialists',
      keywords: ['frontend', 'backend', 'api', 'ui', 'component', 'development']
    },
    'quality': {
      overview: 'Testing, accessibility, and security specialists',
      keywords: ['test', 'quality', 'accessibility', 'security', 'e2e']
    }
  };

  for (const [domain, info] of Object.entries(domains)) {
    const domainPath = path.join(process.cwd(), 'orchestrai-skills', domain);
    const skillMdPath = path.join(domainPath, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      const domainMd = `# ${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain

## Overview

${info.overview}

## Keywords

${info.keywords.join(', ')}

## Available Skills

See subdirectories for individual skills in this domain.
`;

      fs.writeFileSync(skillMdPath, domainMd);
      console.log(`📁 Created domain file: ${domain}/SKILL.md`);
    }
  }
}

// Main execution
console.log('🚀 Migrating high-frequency agents to skills system...\n');
console.log(`Target: ${TOP_AGENTS.length} agents\n`);

// Create domain files first
createDomainSkillFiles();
console.log();

// Migrate agents
let successCount = 0;
let failureCount = 0;

for (const agentName of TOP_AGENTS) {
  if (migrateAgent(agentName)) {
    successCount++;
  } else {
    failureCount++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Migration complete!`);
console.log('='.repeat(60));
console.log(`Success: ${successCount}/${TOP_AGENTS.length}`);
console.log(`Failed: ${failureCount}/${TOP_AGENTS.length}`);
console.log();

// Test skill loader
console.log('🧪 Testing SkillLoader...\n');

try {
  const SkillLoader = require('../orchestrai-shared/skills/skill-loader');
  const loader = new SkillLoader();

  const index = loader.buildLightweightIndex();
  const stats = loader.getStats();

  console.log('📊 Skill System Stats:');
  console.log(`   Domains: ${stats.domains}`);
  console.log(`   Total Skills: ${stats.totalSkills}`);
  console.log(`   Avg Skills/Domain: ${stats.averageSkillsPerDomain}`);
  console.log();

  // Test search
  console.log('🔍 Testing skill search:');
  const seoResults = loader.search('seo keyword research');
  console.log(`   Query: "seo keyword research"`);
  console.log(`   Results: ${seoResults.length} matches`);
  if (seoResults.length > 0) {
    console.log(`   Top match: ${seoResults[0].domain} (score: ${seoResults[0].score})`);
  }
  console.log();

  console.log('✅ SkillLoader is working correctly!\n');

} catch (error) {
  console.error('❌ SkillLoader test failed:', error.message);
}

console.log('Next steps:');
console.log('1. Review generated SKILL.md files in orchestrai-skills/');
console.log('2. Test skill loading: node -e "const SL = require(\'./orchestrai-shared/skills/skill-loader\'); const l = new SL(); console.log(l.search(\'seo\'));"');
console.log('3. Integrate with orchestrator (orchestrai-master/orchestrator/*.js)');
console.log('4. Measure token savings with /context command');
