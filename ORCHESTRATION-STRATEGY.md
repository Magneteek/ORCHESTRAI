# ORCHESTRAI Orchestration Strategy

**Architecture**: Hybrid (Skills-first + Strategic Agents)
**Effective Date**: February 17, 2026
**Status**: ✅ Production

---

## System Architecture

### **Total Capabilities**: 173

```
ORCHESTRAI Ecosystem
│
├── 🎯 Skills (161) - PRIMARY INVOCATION METHOD
│   ├── Domain Skills (137)
│   │   ├── SEO (15 skills)
│   │   ├── Content (12 skills)
│   │   ├── WebDev (8 skills)
│   │   ├── Quality (14 skills)
│   │   ├── Strategic Planning (12 skills)
│   │   ├── Client Intelligence (6 skills)
│   │   ├── DevOps (5 skills)
│   │   ├── Advertising (5 skills)
│   │   ├── Email Marketing (3 skills)
│   │   ├── Conversion Optimization (2 skills)
│   │   ├── Data Analytics (2 skills)
│   │   ├── Local SEO (2 skills)
│   │   ├── Agent SDK (5 skills)
│   │   ├── Reputation Intelligence (2 skills)
│   │   └── Shared (23 skills - unique, no agent equivalent)
│   │
│   └── Command Skills (24)
│       └── Workflow commands (init-client-project, qa-content, seo-audit, etc.)
│
└── 📊 Agents (12) - STRATEGIC ORCHESTRATION ONLY
    └── Opus-tier strategic orchestrators
        ├── orchestrai-master-coordinator
        ├── strategic-plan-synthesizer
        ├── financial-modeling-specialist
        ├── client-project-orchestrator
        ├── simultaneous-orchestrator
        ├── vaibe-builder-orchestrator
        ├── ai-project-predictor
        ├── intelligent-risk-assessor
        ├── performance-forecasting-specialist
        ├── advanced-performance-analyzer
        ├── semantic-analysis-engine
        └── crystalline-memory-optimizer
```

---

## Invocation Decision Tree

### **Use Skills (161 capabilities)**

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
Skill(skill="seo:seo-keyword-research", args="analyze healthcare keywords")

// Command workflows
Skill(skill="commands:init-client-project", args="Acme Corp")
```

**Examples**:
- `seo:seo-keyword-research` - Keyword analysis
- `content:content-writer-specialist` - Content creation
- `webdev:frontend-architect-specialist` - UI architecture
- `quality:e2e-test-automator` - End-to-end testing
- `commands:qa-content` - Quality assurance workflow
- `commands:seo-audit` - Start SEO crawl

---

### **Use Agents (12 strategic orchestrators)**

**When**:
- ✅ Complex multi-system orchestration
- ✅ Cross-domain strategic planning
- ✅ Advanced reasoning required (Opus-tier)
- ✅ Parallel execution coordination
- ✅ Financial modeling and forecasting
- ✅ Risk assessment and prediction

**Invocation**:
```javascript
Task(subagent_type="orchestrai-master-coordinator", prompt="Coordinate SEO + Content + WebDev pipeline")

Task(subagent_type="strategic-plan-synthesizer", prompt="Create comprehensive growth strategy")

Task(subagent_type="financial-modeling-specialist", prompt="Build 3-year revenue model")
```

**The 12 Strategic Agents**:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `orchestrai-master-coordinator` | Master coordination for multi-domain tasks | Complex projects requiring multiple specialist skills |
| `strategic-plan-synthesizer` | Comprehensive strategic planning | Business strategy, growth plans, OPSP frameworks |
| `financial-modeling-specialist` | Financial models and forecasting | Revenue models, unit economics, pricing strategy |
| `client-project-orchestrator` | Client project coordination | Full client engagement management |
| `simultaneous-orchestrator` | Parallel execution coordination | Multiple agents running simultaneously |
| `vaibe-builder-orchestrator` | Proven simultaneous execution patterns | 77.7% speed improvement through parallel streams |
| `ai-project-predictor` | ML-based timeline forecasting | Project timeline prediction (85-95% accuracy) |
| `intelligent-risk-assessor` | AI-powered risk assessment | Risk identification and mitigation planning |
| `performance-forecasting-specialist` | LSTM neural networks for prediction | Real-time performance prediction |
| `advanced-performance-analyzer` | Multi-dimensional performance analysis | 95% automated analytics, pattern recognition ML |
| `semantic-analysis-engine` | NLP and semantic understanding | Deep semantic analysis and relationship mapping |
| `crystalline-memory-optimizer` | Memory performance optimization | Memory system optimization and tuning |

---

## Migration Summary

### **What Changed**:

**Before** (Feb 16, 2026):
- ❌ 114 agents (all capabilities)
- ❌ 114 duplicate skills (100% duplication)
- ❌ 23 unique skills
- ❌ 25 slash commands (legacy)

**After** (Feb 17, 2026):
- ✅ 12 strategic agents (Opus-tier orchestrators only)
- ✅ 161 skills (137 domain + 24 commands)
- ✅ Zero duplication
- ✅ Clear orchestration strategy

### **Consolidation**:
- **Removed**: 102 duplicate agents (now skills)
- **Kept**: 12 Opus strategic orchestrators
- **Migrated**: All capabilities to skills-first
- **Backup**: `.claude/agents-backup-20260217/` (102 removed agents)

---

## Usage Patterns

### **Pattern 1: Simple Task (Use Skill)**

```javascript
// User mentions: "I need to research keywords for healthcare"
// Claude auto-loads: seo:seo-keyword-research skill
// No explicit invocation needed!

// Or manual:
Skill(skill="seo:seo-keyword-research", args="healthcare industry")
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

### **Pattern 5: Parallel Execution (Use Agent)**

```javascript
// Coordinate multiple skills simultaneously
Task(subagent_type="vaibe-builder-orchestrator", prompt=`
  Execute in parallel:
  - seo:seo-keyword-research (10 target keywords)
  - seo:seo-competitor-analysis (top 5 competitors)
  - content:content-outline-architect (5 articles)

  Coordinate results into unified strategy
`)
```

---

## Auto-Discovery Examples

**Skills auto-load when you mention relevant topics**:

| You say | Auto-loads |
|---------|------------|
| "keyword research" | `seo:seo-keyword-research` |
| "write blog post" | `content:content-writer-specialist` |
| "design landing page" | `webdev:frontend-architect-specialist` |
| "run tests" | `quality:e2e-test-automator` |
| "check quality" | `commands:qa-content` |
| "competitor analysis" | `seo:seo-competitor-analysis` |

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
- Metadata at startup: ~4k tokens (161 skills × 25 tokens)
- Full prompts on-demand: ~1.2k tokens each
- **Savings**: 99% (4k vs 193k if all loaded)

### **Agents (Strategic Only)**:
- All 12 loaded at startup: ~14k tokens (12 agents × 1.2k tokens)
- Always available for complex tasks

**Total startup cost**: ~18k tokens (4k skills + 14k agents)
**Available for work**: 182k tokens (91% of 200k context)

---

## Verification

```bash
# Count skills (should be 161)
find .claude/skills -type d -depth 2 | wc -l

# Count agents (should be 12)
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

### **When to Use Skills** (161 capabilities)

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

**Invocation**: `Skill(skill="domain:name")` or let Claude auto-load

---

### **When to Use Agents** (12 orchestrators)

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
- ✅ Strategic power (12 Opus orchestrators)
- ✅ Future-proof (skills-first = Claude Code 2026 best practice)

**Total Capabilities**: 173 (161 skills + 12 agents)
**Unique Capabilities**: 173 (zero duplication!)

---

**Effective Date**: February 17, 2026
**Architecture**: Hybrid (Skills-first + Strategic Agents)
**Status**: ✅ Production Ready
