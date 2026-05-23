# ORCHESTRAI Orchestration Strategy

**Architecture**: Hybrid (Skills-first + Strategic Agents)
**Effective Date**: February 17, 2026
**Status**: ✅ Production

---

## System Architecture

### **Total Capabilities**: 194

```
ORCHESTRAI Ecosystem
│
├── 🎯 Skills (187) - PRIMARY INVOCATION METHOD
│   ├── Domain Skills (159)
│   │   ├── SEO (23 skills)
│   │   ├── Content (21 skills)
│   │   ├── WebDev (13 skills)
│   │   ├── Quality (18 skills)
│   │   ├── Strategic Planning (12 skills)
│   │   ├── Client Intelligence (6 skills)
│   │   ├── DevOps (5 skills)
│   │   ├── Advertising (16 skills)
│   │   ├── Email Marketing (8 skills)
│   │   ├── Conversion Optimization (3 skills)
│   │   ├── Data Analytics (3 skills)
│   │   ├── Local SEO (9 skills)
│   │   ├── Agent SDK (5 skills)
│   │   ├── Reputation Intelligence (4 skills)
│   │   ├── Healthcare (6 skills)
│   │   └── Shared (7 skills - utility/cross-domain)
│   │
│   └── Command Skills (28)
│       └── Workflow commands (init-client-project, qa-content, seo-audit, etc.)
│
└── 📊 Agents (7) - EXECUTION + STRATEGIC ORCHESTRATION
    ├── Sonnet execution conductors
    │   ├── pipeline-conductor        (stateful pipeline execution)
    │   ├── campaign-conductor        (end-to-end ad campaign execution)
    │   └── webdev-conductor          (full-stack web build execution)
    └── Opus strategic orchestrators
        ├── orchestrai-master-coordinator
        ├── strategic-plan-synthesizer
        ├── financial-modeling-specialist
        └── client-project-orchestrator
```

---

## Invocation Decision Tree

### **Use Skills (185 capabilities)**

**When**:
- ✅ Single-purpose tasks
- ✅ Auto-discovery desired (Claude loads when mentioned)
- ✅ Standard workflows (SEO, content, development, testing)
- ✅ Workflow commands (init project, QA, debugging)

**Invocation**:
```javascript
// Auto-discovery (recommended)
"I need keyword research" → Claude auto-loads seo:seo-keyword-research

// Manual invocation
Skill(skill="seo", args="seo-keyword-research")

// Command workflows
Skill(skill="commands:init-client-project", args="Acme Corp")
```

**Examples**:
- `Skill(skill="seo", args="seo-keyword-research")` - Keyword analysis
- `Skill(skill="content", args="content-writer-specialist")` - Content creation
- `Skill(skill="webdev", args="frontend-architect-specialist")` - UI architecture
- `Skill(skill="quality", args="e2e-test-automator")` - End-to-end testing
- `Skill(skill="commands:qa-content")` - Quality assurance workflow
- `Skill(skill="commands:seo-audit")` - Start SEO crawl

---

### **Use Agents (5 strategic agents)**

**When**:
- ✅ Multi-phase pipeline (120m+) needing checkpointing and retry
- ✅ Cross-domain strategic planning
- ✅ Advanced reasoning required (Opus-tier)
- ✅ Full client engagement lifecycle management
- ✅ Financial modeling and forecasting

**Invocation**:
```javascript
// Stateful pipeline execution (Sonnet — execution, not strategy)
Task(subagent_type="pipeline-conductor", prompt=`
  pipeline: seo-research-pipeline
  client: nasmehpg
  params:
    domain: nasmehpg.si
    language: sl
`)

Task(subagent_type="strategic-plan-synthesizer", prompt="Create comprehensive growth strategy")

Task(subagent_type="financial-modeling-specialist", prompt="Build 3-year revenue model")

Task(subagent_type="client-project-orchestrator", prompt="Manage full client engagement for Acme Corp")
```

**The 5 Strategic Agents**:

| Agent | Model | Purpose | When to Use |
|-------|-------|---------|-------------|
| `pipeline-conductor` | Sonnet | Stateful pipeline execution | Long pipelines (120m+), checkpointing, retry on failure |
| `strategic-plan-synthesizer` | Opus | Comprehensive strategic planning | Business strategy, growth plans, OPSP frameworks |
| `financial-modeling-specialist` | Opus | Financial models and forecasting | Revenue models, unit economics, pricing strategy |
| `client-project-orchestrator` | Opus | Client project coordination | Full client engagement management |
| `orchestrai-master-coordinator` | Opus | Complex task decomposition | Opus-tier reasoning in isolated context (rarely needed — harness handles most orchestration) |

---

## Migration Summary

### **What Changed**:

**Before** (Feb 16, 2026):
- ❌ 114 agents (all capabilities)
- ❌ 114 duplicate skills (100% duplication)
- ❌ 23 unique skills
- ❌ 25 slash commands (legacy)

**After** (Feb 17, 2026):
- ✅ 7 strategic agents (3 Sonnet conductors + 4 Opus orchestrators)
- ✅ 185 skills (158 domain + 27 commands)
- ✅ Zero duplication
- ✅ Clear orchestration strategy

### **Consolidation**:
- **Removed**: 102 duplicate agents (now skills)
- **Culled**: 8 redundant/overlapping agents (Apr 2026)
- **Kept**: 4 Opus strategic orchestrators
- **Migrated**: All capabilities to skills-first
- **Backup**: `.claude/agents-backup-20260217/` (removed agents)

---

## Usage Patterns

### **Pattern 1: Simple Task (Use Skill)**

```javascript
// User mentions: "I need to research keywords for healthcare"
// Claude auto-loads: seo:seo-keyword-research skill
// No explicit invocation needed!

// Or manual:
Skill(skill="seo", args="seo-keyword-research")
```

### **Pattern 2: Workflow Command (Use Skill)**

```javascript
// Initialize new client
Skill(skill="commands:init-client-project", args="Acme Healthcare Corp")

// Quality assurance
Skill(skill="commands:qa-content", args="article.md")

// Start SEO audit
Skill(skill="commands:seo-audit", args="https://example.com")
```

### **Pattern 3: Complex Multi-Domain Task (Use Agent)**

```javascript
// Comprehensive SEO + Content + WebDev strategy
Task(subagent_type="orchestrai-master-coordinator", prompt=`
  Create comprehensive digital strategy for Acme Healthcare:
  1. SEO keyword research and competitive analysis
  2. Content strategy and creation plan
  3. Website architecture recommendations
  4. Implementation roadmap with timeline
`)
```

### **Pattern 4: Strategic Planning (Use Agent)**

```javascript
// Business strategy with Scaling Up framework
Task(subagent_type="strategic-plan-synthesizer", prompt=`
  Synthesize ICP, SEO, competitive, and branding intelligence into
  comprehensive strategic plan using Scaling Up OPSP framework
`)

// Financial modeling
Task(subagent_type="financial-modeling-specialist", prompt=`
  Create 3-year revenue model with:
  - Unit economics
  - Pricing scenarios
  - Cash flow projections
`)
```

### **Pattern 5: Parallel Execution (Use Coordinator)**

```javascript
// Coordinate multiple skills simultaneously via master coordinator
Task(subagent_type="orchestrai-master-coordinator", prompt=`
  Execute in parallel:
  - seo-keyword-research (10 target keywords)
  - seo-competitor-analysis (top 5 competitors)
  - content-outline-architect (5 articles)

  Coordinate results into unified strategy
`)

// Or invoke parallel skills directly in one message:
Skill(skill="seo", args="seo-keyword-research")
Skill(skill="seo", args="seo-competitor-analysis")
Skill(skill="content", args="content-outline-architect")
```

---

## Auto-Discovery Examples

**Skills auto-load when you mention relevant topics**:

| You say | Auto-loads |
|---------|------------|
| "keyword research" | `Skill(skill="seo", args="seo-keyword-research")` |
| "write blog post" | `Skill(skill="content", args="content-writer-specialist")` |
| "design landing page" | `Skill(skill="webdev", args="frontend-architect-specialist")` |
| "run tests" | `Skill(skill="quality", args="e2e-test-automator")` |
| "check quality" | `Skill(skill="commands:qa-content")` |
| "competitor analysis" | `Skill(skill="seo", args="seo-competitor-analysis")` |

**Agents require explicit invocation** (no auto-discovery):
```javascript
Task(subagent_type="orchestrai-master-coordinator", ...)
```

---

## Best Practices

### ✅ **Do**:
- Use skills for 90% of tasks (auto-discovery + progressive disclosure)
- Use strategic agents for complex orchestration
- Let Claude auto-load skills when relevant
- Explicitly invoke agents for multi-step planning
- Use command skills for workflow triggers

### ❌ **Don't**:
- Don't use agents for simple single-purpose tasks
- Don't manually invoke skills that auto-load
- Don't use skills for complex cross-domain orchestration
- Don't bypass the orchestration decision tree

---

## Token Efficiency

### **Skills (Progressive Disclosure)**:
- Metadata at startup: ~4k tokens (172 skills × 25 tokens)
- Full prompts on-demand: ~1.2k tokens each
- **Savings**: 99% (4k vs 193k if all loaded)

### **Agents (Strategic Only)**:
- All 7 loaded at startup: ~9k tokens (7 agents × ~1.2k tokens)
- Always available for complex tasks

**Total startup cost**: ~9k tokens (4k skills + 5k agents)
**Available for work**: 191k tokens (96% of 200k context)

---

## Verification

```bash
# Count skills (should be 172)
find .claude/skills -type d -depth 2 | wc -l

# Count agents (should be 7)
ls .claude/agents/*.md | wc -l

# List strategic agents
ls .claude/agents/

# Backup location
ls .claude/agents-backup-20260217/  # 102 removed agents
```

---

## Rollback (If Needed)

```bash
# Restore all 114 agents
rm -rf .claude/agents
cp -r .claude/agents-backup-20260217 .claude/agents

# Or keep backup for reference
# Backup will remain until manually deleted
```

---

## Quick Reference Card

### **When to Use Skills** (185 capabilities)

```
✓ Keyword research
✓ Content creation
✓ SEO analysis
✓ Website development
✓ Quality assurance
✓ Testing automation
✓ Workflow commands
✓ Single-purpose tasks
✓ Auto-discovery desired
```

**Invocation**: `Skill(skill="domain", args="skill-name")` or let Claude auto-load

---

### **When to Use Agents** (7 orchestrators)

```
✓ Multi-domain coordination
✓ Strategic planning
✓ Financial modeling
✓ Complex orchestration
✓ Parallel execution
✓ Risk assessment
✓ Performance prediction
✓ Advanced reasoning (Opus)
```

**Invocation**: `Task(subagent_type="name", prompt="...")`

---

## Summary

**Hybrid Strategy Benefits**:
- ✅ Clear separation: Skills for tasks, Agents for orchestration
- ✅ Auto-discovery enabled (skills load when relevant)
- ✅ Zero duplication (102 duplicate agents removed)
- ✅ Token efficiency (99% savings on skills)
- ✅ Strategic power (4 Opus orchestrators + 3 Sonnet conductors)
- ✅ Future-proof (skills-first = Claude Code 2026 best practice)

**Total Capabilities**: 194 (185 skills + 7 agents)
**Unique Capabilities**: 194 (zero duplication!)

---

**Effective Date**: February 17, 2026
**Architecture**: Hybrid (Skills-first + Strategic Agents)
**Status**: ✅ Production Ready
