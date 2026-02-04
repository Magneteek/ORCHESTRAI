# ORCHESTRAI Modernization Implementation Plan

## Project Context

**Repository:** https://github.com/Magneteek/ORCHESTRAI
**Current State:** 89+ specialized agents, Redis memory, MCP servers (DataForSEO, GSC, etc.), Python/Node hybrid, crystalline memory architecture
**Built:** September 2025
**Goal:** Modernize with Claude Code features released since September 2025

---

## Pre-Implementation Checklist

Before starting, verify the following:

```bash
# Check Claude Code version (need 2.1.19+ for TeammateTool)
claude --version

# Update if needed
claude update

# Verify MCP Tool Search is available
claude /context

# Check current MCP server token usage
claude /doctor
```

**Required minimum versions:**
- Claude Code: 2.1.19+
- Node.js: 18+
- Redis: 7+

---

## Phase 1: MCP Tool Search Optimization (Week 1)

### Priority: CRITICAL
### Impact: 50-85% context window recovery

### 1.1 Audit Current MCP Token Usage

Run this at session start to baseline:

```bash
# Start Claude Code and immediately run
/context
```

Document the token usage for each MCP server in `.mcp.json`.

### 1.2 Update .mcp.json with Server Instructions

Current `.mcp.json` location: `ORCHESTRAI/.mcp.json`

**Transform each server entry to include `serverInstructions`:**

```json
{
  "mcpServers": {
    "dataforseo": {
      "command": "node",
      "args": ["orchestrai-shared/mcp-servers/dataforseo-server.js"],
      "serverInstructions": "SEO data provider. Use for: keyword research, SERP analysis, competitor backlinks, domain metrics, rank tracking. Keywords: SEO, keywords, SERP, backlinks, domain authority, rankings, search volume."
    },
    "gsc": {
      "command": "node", 
      "args": ["orchestrai-shared/mcp-servers/gsc-server.js"],
      "serverInstructions": "Google Search Console data. Use for: search performance, impressions, clicks, CTR, position data, index coverage, sitemap status. Keywords: GSC, search console, impressions, clicks, indexing."
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-memory"],
      "serverInstructions": "Persistent memory and knowledge graphs. Use for: storing insights, cross-session context, entity relationships. Keywords: remember, recall, store, knowledge, context."
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem", "/path/to/orchestrai"],
      "serverInstructions": "File operations for ORCHESTRAI project. Use for: reading configs, writing outputs, managing deliverables. Keywords: file, read, write, directory, path."
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-sequential-thinking"],
      "serverInstructions": "Advanced multi-step reasoning. Use for: complex problem decomposition, planning, analysis chains. Keywords: think, plan, reason, analyze, decompose."
    }
  }
}
```

### 1.3 Verify Tool Search Activation

After updating `.mcp.json`:

```bash
# Restart Claude Code session
# Run context check
/context

# Should show significantly reduced token usage
# Tool Search activates when MCP tools > 10% of context
```

### 1.4 Create MCP Optimization Report

Create file: `orchestrai-shared/mcp-servers/MCP-OPTIMIZATION-REPORT.md`

Document:
- Before/after token usage per server
- Any servers that need `enable_tool_search: false` (high-frequency tools)
- Server instructions effectiveness

---

## Phase 2: TeammateTool Migration (Week 2)

### Priority: HIGH
### Impact: Native parallel execution, better coordination

### 2.1 Understand Current Delegation Pattern

Current pattern in `UNIVERSAL-AGENT-DELEGATION-PATTERN.md`:
- Task tool invocation
- Manual coordination via Redis
- Custom UTID generation

### 2.2 Create TeammateTool Wrapper

Create: `orchestrai-shared/coordination/teammate-wrapper.js`

```javascript
/**
 * TeammateTool Wrapper for ORCHESTRAI
 * Bridges existing agent definitions to native TeammateTool
 */

const AGENT_MAPPINGS = {
  // SEO Agents
  'seo-competitor-analysis': {
    subagentType: 'compound-seo:analysis:competitor',
    defaultPromptPrefix: 'Analyze competitor SEO metrics. '
  },
  'seo-keyword-research': {
    subagentType: 'compound-seo:research:keywords',
    defaultPromptPrefix: 'Research keywords for '
  },
  'seo-technical-analysis': {
    subagentType: 'compound-seo:audit:technical',
    defaultPromptPrefix: 'Run technical SEO audit on '
  },
  
  // Content Agents
  'content-writer-specialist': {
    subagentType: 'compound-content:write:specialist',
    defaultPromptPrefix: 'Write content following brand guidelines. '
  },
  'content-structure-corrector': {
    subagentType: 'compound-content:edit:structure',
    defaultPromptPrefix: 'Correct content structure for '
  },
  'content-ai-phrase-detector': {
    subagentType: 'compound-content:qa:ai-detection',
    defaultPromptPrefix: 'Check AI detection score. Target: <30%. '
  },
  
  // Client Intelligence
  'client-icp-analyst': {
    subagentType: 'compound-intelligence:client:icp',
    defaultPromptPrefix: 'Analyze ideal customer profile. '
  },
  
  // Add remaining 80+ agents...
};

/**
 * Convert legacy Task tool call to TeammateTool format
 */
function convertToTeammate(legacyTask) {
  const mapping = AGENT_MAPPINGS[legacyTask.agent];
  if (!mapping) {
    console.warn(`No mapping for agent: ${legacyTask.agent}`);
    return null;
  }
  
  return {
    operation: 'spawn',
    team_name: legacyTask.teamName || 'orchestrai-default',
    agent_id: legacyTask.taskId || `${legacyTask.agent}-${Date.now()}`,
    subagent_type: mapping.subagentType,
    prompt: mapping.defaultPromptPrefix + legacyTask.prompt,
    run_in_background: legacyTask.async !== false
  };
}

module.exports = { AGENT_MAPPINGS, convertToTeammate };
```

### 2.3 Create Native Team Templates

Create: `orchestrai-shared/coordination/team-templates/`

**SEO Audit Team Template:**
```javascript
// orchestrai-shared/coordination/team-templates/seo-audit-team.js

const SEO_AUDIT_TEAM = {
  name: 'seo-audit',
  description: 'Comprehensive SEO audit with parallel analysis',
  
  agents: [
    {
      id: 'technical',
      subagentType: 'compound-seo:audit:technical',
      prompt: 'Analyze Core Web Vitals, crawlability, indexation issues.',
      blockedBy: []
    },
    {
      id: 'content',
      subagentType: 'compound-seo:audit:content',
      prompt: 'Analyze on-page SEO, content quality, keyword optimization.',
      blockedBy: []
    },
    {
      id: 'backlinks',
      subagentType: 'compound-seo:audit:backlinks',
      prompt: 'Analyze backlink profile, toxic links, opportunities.',
      blockedBy: []
    },
    {
      id: 'competitor',
      subagentType: 'compound-seo:analysis:competitor',
      prompt: 'Compare against top 3 competitors in SERP.',
      blockedBy: ['technical', 'content']  // Wait for baseline data
    },
    {
      id: 'synthesizer',
      subagentType: 'compound-seo:report:synthesizer',
      prompt: 'Synthesize all findings into prioritized recommendations.',
      blockedBy: ['technical', 'content', 'backlinks', 'competitor']
    }
  ],
  
  // Execution function
  async execute(targetUrl, options = {}) {
    // 1. Create team
    Teammate({ operation: 'createTeam', name: this.name });
    
    // 2. Spawn parallel agents
    for (const agent of this.agents.filter(a => a.blockedBy.length === 0)) {
      Task({
        team_name: this.name,
        name: agent.id,
        subagent_type: agent.subagentType,
        prompt: `${agent.prompt} Target: ${targetUrl}`,
        run_in_background: true
      });
    }
    
    // 3. Handle dependencies via blockedBy
    // TeammateTool handles this natively
    
    // 4. Collect results from inbox
    // Results appear in ~/.claude/teams/{team_name}/inboxes/
  }
};

module.exports = SEO_AUDIT_TEAM;
```

**Content Creation Team Template:**
```javascript
// orchestrai-shared/coordination/team-templates/content-creation-team.js

const CONTENT_CREATION_TEAM = {
  name: 'content-creation',
  description: 'Full content pipeline with approval gates',
  
  agents: [
    {
      id: 'researcher',
      subagentType: 'compound-content:research:topic',
      prompt: 'Research topic, gather sources, identify key points.',
      blockedBy: []
    },
    {
      id: 'outliner',
      subagentType: 'compound-content:outline:architect',
      prompt: 'Create detailed content outline with H2/H3 structure.',
      blockedBy: ['researcher'],
      requiresApproval: true  // Human gate
    },
    {
      id: 'writer',
      subagentType: 'compound-content:write:specialist',
      prompt: 'Write full article following approved outline.',
      blockedBy: ['outliner']
    },
    {
      id: 'ai-detector',
      subagentType: 'compound-content:qa:ai-detection',
      prompt: 'Check AI detection score. Fail if >30%.',
      blockedBy: ['writer']
    },
    {
      id: 'seo-optimizer',
      subagentType: 'compound-content:optimize:seo',
      prompt: 'Optimize for target keywords without increasing AI score.',
      blockedBy: ['ai-detector']
    },
    {
      id: 'final-qa',
      subagentType: 'compound-content:qa:final',
      prompt: 'Final quality check: grammar, flow, brand voice.',
      blockedBy: ['seo-optimizer']
    }
  ]
};

module.exports = CONTENT_CREATION_TEAM;
```

### 2.4 Update Slash Commands

Migrate existing slash commands to use TeammateTool:

**Update:** `.claude/commands/seo-audit.md`

```markdown
---
name: seo-audit
description: Run comprehensive SEO audit using TeammateTool orchestration
arguments:
  - name: url
    description: Target URL to audit
    required: true
  - name: competitors
    description: Comma-separated competitor URLs
    required: false
---

# SEO Audit Command (TeammateTool Version)

## Execution

1. Create audit team:
   ```
   Teammate({ operation: "createTeam", name: "seo-audit-{{timestamp}}" })
   ```

2. Spawn parallel analysis agents:
   - Technical SEO (Core Web Vitals, crawl)
   - Content Analysis (on-page, keywords)
   - Backlink Analysis (profile, toxic)
   
3. Wait for Phase 1, then spawn:
   - Competitor Analysis (uses Phase 1 data)
   
4. Final synthesis agent creates report

## Output Location
`projects/{{client-uuid}}/deliverables/seo/audit-{{timestamp}}.md`
```

---

## Phase 3: Agent Skills Migration (Week 3-4)

### Priority: HIGH
### Impact: Dynamic loading, token efficiency, reusability

### 3.1 Skills Directory Structure

Create: `orchestrai-skills/`

```
orchestrai-skills/
├── seo/
│   ├── SKILL.md
│   ├── competitor-analysis/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   │   └── analysis-prompt.md
│   │   └── scripts/
│   │       └── fetch-competitors.js
│   ├── keyword-research/
│   │   ├── SKILL.md
│   │   └── prompts/
│   └── technical-audit/
│       ├── SKILL.md
│       └── scripts/
├── content/
│   ├── SKILL.md
│   ├── writing/
│   ├── ai-detection/
│   └── optimization/
├── client-intelligence/
│   ├── SKILL.md
│   ├── icp-analysis/
│   └── branding/
└── shared/
    ├── SKILL.md
    └── utilities/
```

### 3.2 Convert Agent to Skill Format

**Example conversion:** `seo-competitor-analysis.md` → Skill

**Before (agent .md file):**
```markdown
# SEO Competitor Analysis Agent

You are a specialized SEO competitor analyst...
[Full prompt in context always]
```

**After (Skill with progressive disclosure):**

Create: `orchestrai-skills/seo/competitor-analysis/SKILL.md`

```markdown
# SEO Competitor Analysis Skill

## Overview
Analyzes competitor SEO strategies including:
- Keyword gaps and opportunities
- Backlink profile comparison
- Content strategy analysis
- Technical SEO benchmarking

## When to Load
- User mentions "competitor", "competition", "vs", "compare"
- SEO audit requires competitive context
- Keyword research needs gap analysis

## Required Tools
- DataForSEO MCP (competitor keywords, backlinks)
- Web fetch (content analysis)
- File system (report output)

## Prompts

### Quick Analysis
For rapid competitor overview:
```
Load: prompts/quick-analysis.md
```

### Deep Dive
For comprehensive competitive audit:
```
Load: prompts/deep-analysis.md
```

## Scripts

### fetch-competitor-data.js
Fetches competitor metrics from DataForSEO:
- Domain authority
- Backlink count
- Top keywords
- Traffic estimates

## Output Format
Markdown report with:
1. Executive summary
2. Keyword gap table
3. Backlink comparison
4. Content opportunities
5. Prioritized recommendations
```

### 3.3 Create Skill Loader

Create: `orchestrai-shared/skills/skill-loader.js`

```javascript
/**
 * Dynamic Skill Loader for ORCHESTRAI
 * Implements progressive disclosure pattern
 */

const fs = require('fs');
const path = require('path');

const SKILLS_ROOT = path.join(__dirname, '../../orchestrai-skills');

class SkillLoader {
  constructor() {
    this.loadedSkills = new Map();
    this.skillIndex = this.buildIndex();
  }
  
  /**
   * Build lightweight index of all skills
   * Only loads SKILL.md overview, not full content
   */
  buildIndex() {
    const index = {};
    const domains = fs.readdirSync(SKILLS_ROOT);
    
    for (const domain of domains) {
      const domainPath = path.join(SKILLS_ROOT, domain);
      if (!fs.statSync(domainPath).isDirectory()) continue;
      
      const skillMd = path.join(domainPath, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        const content = fs.readFileSync(skillMd, 'utf8');
        index[domain] = {
          path: domainPath,
          overview: this.extractOverview(content),
          keywords: this.extractKeywords(content),
          subskills: this.indexSubskills(domainPath)
        };
      }
    }
    
    return index;
  }
  
  /**
   * Search for relevant skills based on query
   */
  search(query) {
    const queryLower = query.toLowerCase();
    const matches = [];
    
    for (const [domain, info] of Object.entries(this.skillIndex)) {
      const score = this.calculateRelevance(queryLower, info);
      if (score > 0.3) {
        matches.push({ domain, score, ...info });
      }
    }
    
    return matches.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Load full skill content on demand
   */
  loadSkill(domain, subskill = null) {
    const key = subskill ? `${domain}/${subskill}` : domain;
    
    if (this.loadedSkills.has(key)) {
      return this.loadedSkills.get(key);
    }
    
    const skillPath = subskill 
      ? path.join(SKILLS_ROOT, domain, subskill)
      : path.join(SKILLS_ROOT, domain);
    
    const skill = this.parseSkillDirectory(skillPath);
    this.loadedSkills.set(key, skill);
    
    return skill;
  }
  
  // Helper methods...
  extractOverview(content) { /* ... */ }
  extractKeywords(content) { /* ... */ }
  indexSubskills(domainPath) { /* ... */ }
  calculateRelevance(query, info) { /* ... */ }
  parseSkillDirectory(skillPath) { /* ... */ }
}

module.exports = SkillLoader;
```

### 3.4 Migration Script

Create: `scripts/migrate-agents-to-skills.js`

```javascript
#!/usr/bin/env node
/**
 * Migrate .claude/agents/*.md to orchestrai-skills/ format
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = '.claude/agents';
const SKILLS_DIR = 'orchestrai-skills';

// Domain mapping for agents
const DOMAIN_MAP = {
  'seo-': 'seo',
  'content-': 'content',
  'client-': 'client-intelligence',
  'frontend-': 'webdev/frontend',
  'backend-': 'webdev/backend',
  'quality-': 'quality',
  'devops-': 'devops',
  // Add all prefixes...
};

function migrateAgent(agentFile) {
  const content = fs.readFileSync(path.join(AGENTS_DIR, agentFile), 'utf8');
  const agentName = path.basename(agentFile, '.md');
  
  // Determine domain
  let domain = 'misc';
  for (const [prefix, domainName] of Object.entries(DOMAIN_MAP)) {
    if (agentName.startsWith(prefix)) {
      domain = domainName;
      break;
    }
  }
  
  // Create skill structure
  const skillDir = path.join(SKILLS_DIR, domain, agentName);
  fs.mkdirSync(skillDir, { recursive: true });
  
  // Generate SKILL.md with progressive disclosure format
  const skillMd = generateSkillMd(agentName, content);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  
  // Move detailed prompt to prompts/
  fs.mkdirSync(path.join(skillDir, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'prompts', 'main.md'), content);
  
  console.log(`Migrated: ${agentFile} → ${skillDir}`);
}

function generateSkillMd(name, content) {
  // Extract key info from agent content
  const overview = extractFirstParagraph(content);
  const keywords = extractKeywords(content);
  
  return `# ${formatName(name)} Skill

## Overview
${overview}

## When to Load
Keywords: ${keywords.join(', ')}

## Main Prompt
\`\`\`
Load: prompts/main.md
\`\`\`

## Required Tools
[Auto-detected from prompt content]

---
*Migrated from .claude/agents/${name}.md*
`;
}

// Run migration
const agents = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
console.log(`Migrating ${agents.length} agents to skills...`);
agents.forEach(migrateAgent);
console.log('Migration complete!');
```

---

## Phase 4: Context Management & Checkpoints (Week 4)

### Priority: MEDIUM
### Impact: Recovery, long-running task stability

### 4.1 Implement Checkpoint Strategy

Create: `orchestrai-shared/checkpoints/checkpoint-manager.js`

```javascript
/**
 * Checkpoint Manager for ORCHESTRAI
 * Integrates with Claude Code native checkpoints
 */

class CheckpointManager {
  constructor(projectId) {
    this.projectId = projectId;
    this.checkpointDir = `projects/${projectId}/.checkpoints`;
  }
  
  /**
   * Create checkpoint before critical operations
   */
  async createCheckpoint(name, metadata = {}) {
    const checkpoint = {
      id: `cp-${Date.now()}`,
      name,
      timestamp: new Date().toISOString(),
      projectId: this.projectId,
      metadata,
      // Claude Code handles actual state
    };
    
    // Trigger Claude Code checkpoint
    // This integrates with /checkpoint command
    console.log(`CHECKPOINT: ${name}`);
    
    return checkpoint;
  }
  
  /**
   * Suggested checkpoint points for ORCHESTRAI workflows
   */
  static CHECKPOINT_TRIGGERS = {
    'content-creation': [
      'after-research',
      'after-outline-approval',
      'after-first-draft',
      'after-ai-detection-pass'
    ],
    'seo-audit': [
      'after-data-collection',
      'after-analysis',
      'before-report-generation'
    ],
    'client-onboarding': [
      'after-icp-analysis',
      'after-branding-review',
      'before-deliverable-generation'
    ]
  };
}

module.exports = CheckpointManager;
```

### 4.2 Integrate with Content Pipeline

Update content creation workflow to use checkpoints:

```javascript
// In content creation pipeline
async function createContent(brief) {
  const cp = new CheckpointManager(brief.projectId);
  
  // Phase 1: Research
  await cp.createCheckpoint('pre-research');
  const research = await runAgent('researcher', brief);
  await cp.createCheckpoint('post-research', { sources: research.sources.length });
  
  // Phase 2: Outline (requires approval)
  const outline = await runAgent('outliner', research);
  await cp.createCheckpoint('outline-complete', { sections: outline.sections.length });
  
  // HUMAN APPROVAL GATE
  const approved = await requestApproval(outline);
  if (!approved) {
    // Can rollback to post-research checkpoint
    return { status: 'pending-approval', checkpoint: 'outline-complete' };
  }
  
  // Phase 3: Writing
  await cp.createCheckpoint('pre-writing');
  const draft = await runAgent('writer', { outline, research });
  
  // Phase 4: QA
  const aiScore = await runAgent('ai-detector', draft);
  if (aiScore > 30) {
    // Rollback to pre-writing, try different approach
    console.log('AI score too high, rolling back...');
    // Claude Code: /rollback pre-writing
  }
  
  await cp.createCheckpoint('qa-passed');
  
  return draft;
}
```

---

## Phase 5: Interleaved Thinking & Advanced Features (Week 5)

### Priority: MEDIUM
### Impact: Better reasoning in complex pipelines

### 5.1 Enable Interleaved Thinking

For API calls within ORCHESTRAI:

```javascript
// orchestrai-shared/api/claude-client.js

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

async function callWithInterleavedThinking(messages, tools) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 16000,
    messages,
    tools,
    // Enable interleaved thinking
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14'
    }
  });
  
  return response;
}
```

### 5.2 Configure Extended Thinking for Complex Tasks

```javascript
// For planning and analysis tasks
async function runPlanningAgent(task) {
  return await client.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 32000,
    thinking: {
      type: 'enabled',
      budget_tokens: 10000  // Allow deep thinking
    },
    messages: [
      {
        role: 'user',
        content: `Plan the implementation for: ${task.description}`
      }
    ]
  });
}
```

---

## Phase 6: Redis Integration Updates (Week 5-6)

### Priority: MEDIUM
### Impact: Hybrid native + Redis coordination

### 6.1 Update Redis Schema for TeammateTool Compatibility

```javascript
// orchestrai-shared/redis/schema-v2.js

const REDIS_SCHEMAS = {
  // Team state (supplements native TeammateTool)
  team: {
    key: 'orchestrai:team:{teamId}',
    fields: {
      name: 'string',
      createdAt: 'timestamp',
      status: 'enum:active,paused,completed',
      agents: 'json',  // Array of agent IDs
      metadata: 'json'
    }
  },
  
  // Agent state (extends native)
  agent: {
    key: 'orchestrai:agent:{agentId}',
    fields: {
      teamId: 'string',
      type: 'string',
      status: 'enum:pending,running,completed,failed',
      startedAt: 'timestamp',
      completedAt: 'timestamp',
      result: 'json',
      checkpoints: 'json'  // Array of checkpoint refs
    }
  },
  
  // Pipeline execution tracking
  pipeline: {
    key: 'orchestrai:pipeline:{pipelineId}',
    fields: {
      name: 'string',
      teamId: 'string',
      stages: 'json',
      currentStage: 'number',
      startedAt: 'timestamp',
      estimatedCompletion: 'timestamp'
    }
  },
  
  // Crystalline memory (preserved)
  memory: {
    key: 'orchestrai:memory:{domain}:{key}',
    fields: {
      value: 'json',
      connections: 'json',  // Hexagonal lattice links
      accessCount: 'number',
      lastAccessed: 'timestamp',
      importance: 'float'
    }
  }
};
```

### 6.2 Create Hybrid Coordinator

```javascript
// orchestrai-shared/coordination/hybrid-coordinator.js

/**
 * Bridges native TeammateTool with Redis persistence
 */
class HybridCoordinator {
  constructor(redis) {
    this.redis = redis;
    this.nativeTeams = new Map();  // Track active native teams
  }
  
  /**
   * Create team using native TeammateTool + Redis tracking
   */
  async createTeam(name, metadata = {}) {
    // 1. Create native team
    // Teammate({ operation: 'createTeam', name })
    
    // 2. Track in Redis for persistence
    const teamId = `team-${Date.now()}`;
    await this.redis.hset(`orchestrai:team:${teamId}`, {
      name,
      createdAt: Date.now(),
      status: 'active',
      metadata: JSON.stringify(metadata)
    });
    
    this.nativeTeams.set(name, teamId);
    return teamId;
  }
  
  /**
   * Spawn agent with Redis tracking
   */
  async spawnAgent(teamName, agentConfig) {
    const teamId = this.nativeTeams.get(teamName);
    const agentId = `${agentConfig.id}-${Date.now()}`;
    
    // 1. Spawn via native TeammateTool
    // Task({ team_name: teamName, name: agentConfig.id, ... })
    
    // 2. Track in Redis
    await this.redis.hset(`orchestrai:agent:${agentId}`, {
      teamId,
      type: agentConfig.subagentType,
      status: 'running',
      startedAt: Date.now()
    });
    
    return agentId;
  }
  
  /**
   * Sync native inbox results to Redis
   */
  async syncResults(teamName) {
    // Read from native inbox: ~/.claude/teams/{teamName}/inboxes/
    // Write to Redis for persistence and cross-session access
  }
}
```

---

## Phase 7: Monitoring & Observability Updates (Week 6)

### Priority: LOW
### Impact: Better debugging, cost tracking

### 7.1 Update Token Monitor for Tool Search

Update: `orchestrai-shared/monitoring/token-monitor-cli.js`

```javascript
// Add Tool Search metrics
const METRICS = {
  // Existing
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  
  // New: Tool Search specific
  toolSearchQueries: 0,
  toolsLoadedOnDemand: 0,
  toolSearchTokensSaved: 0,  // Estimated savings vs preload
  
  // MCP breakdown
  mcpTokensByServer: {},
  mcpToolSearchHits: {},
};

function trackToolSearch(event) {
  if (event.type === 'tool_search') {
    METRICS.toolSearchQueries++;
    METRICS.toolsLoadedOnDemand += event.toolsLoaded;
    METRICS.toolSearchTokensSaved += event.estimatedSavings;
  }
}
```

### 7.2 Add OpenTelemetry Tracing

```javascript
// orchestrai-shared/monitoring/tracing.js

const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('orchestrai');

function traceAgentExecution(agentName, fn) {
  return tracer.startActiveSpan(`agent.${agentName}`, async (span) => {
    try {
      span.setAttribute('agent.name', agentName);
      const result = await fn();
      span.setAttribute('agent.status', 'success');
      return result;
    } catch (error) {
      span.setAttribute('agent.status', 'error');
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## Testing & Validation

### Test Checklist

#### Phase 1: MCP Tool Search
- [ ] `/context` shows <20% MCP token usage (was 50-70%)
- [ ] DataForSEO tools load on-demand when SEO task requested
- [ ] GSC tools load on-demand when search performance requested
- [ ] No regression in tool availability

#### Phase 2: TeammateTool
- [ ] `/seo-audit` creates team and spawns parallel agents
- [ ] Agent results appear in inbox
- [ ] `blockedBy` dependencies work correctly
- [ ] Background execution (`run_in_background: true`) works

#### Phase 3: Skills
- [ ] Skills index builds correctly
- [ ] Skill search returns relevant results
- [ ] On-demand skill loading works
- [ ] Token usage reduced vs always-loaded agents

#### Phase 4: Checkpoints
- [ ] Checkpoints create successfully
- [ ] Rollback restores previous state
- [ ] Long-running pipelines survive interruption

#### Phase 5: Integration
- [ ] Full SEO audit pipeline works end-to-end
- [ ] Full content creation pipeline works
- [ ] Redis persistence maintains state across sessions
- [ ] Token usage is significantly reduced overall

---

## Rollback Plan

If any phase causes issues:

### Quick Rollback
```bash
# Revert .mcp.json changes
git checkout HEAD~1 -- .mcp.json

# Disable Tool Search for specific server
# In .mcp.json, add:
# "enable_tool_search": false

# Revert to legacy agent invocation
# Keep .claude/agents/*.md files as fallback
```

### Full Rollback
```bash
# Tag current state before migration
git tag pre-modernization-$(date +%Y%m%d)

# If needed, revert all changes
git revert --no-commit HEAD~N..HEAD
```

---

## Success Metrics

### Week 1 (MCP Tool Search)
- Context usage at session start: <30% (from 50-70%)
- No tool availability regressions

### Week 2 (TeammateTool)
- Parallel agent execution working
- 30% reduction in sequential wait time

### Week 4 (Skills + Checkpoints)
- 50% reduction in agent definition token overhead
- Successful checkpoint/rollback in content pipeline

### Week 6 (Full Integration)
- End-to-end SEO audit: <5 minutes (was 8-10)
- End-to-end content creation: Checkpointed at each stage
- Overall token efficiency: 40%+ improvement

---

## Commands Reference

```bash
# Check context usage
/context

# Check MCP server health
/doctor

# View current session stats
/stats

# Create checkpoint
/checkpoint "checkpoint-name"

# Rollback to checkpoint
/rollback "checkpoint-name"

# View team status (if using TeammateTool)
cat ~/.claude/teams/*/status.json
```

---

## Next Steps After Implementation

1. **Document learnings** - Update CLAUDE.md with new patterns
2. **Create templates** - Standardize team templates for common workflows
3. **Train team** - If others use ORCHESTRAI, document new patterns
4. **Monitor costs** - Track token usage reduction over 30 days
5. **Contribute back** - Share useful patterns with Claude Code community

---

*Implementation Plan Version: 1.0*
*Created: February 2026*
*For: ORCHESTRAI Modernization*
