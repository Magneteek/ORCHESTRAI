# ORCHESTRAI System

**Architecture**: Hybrid (Skills-first + Strategic Agents) + Personality Layer (SOUL.md)
**Skills**: 161 (137 domain + 24 commands) - Auto-discoverable, progressive disclosure
**Agents**: 12 Opus strategic orchestrators (master coordination, planning, forecasting)
**Personality**: SOUL.md (consistent voice across all 173 capabilities)
**MCP**: DataForSEO, Memory, Notion, GSC, Ref.tools, Magic, Sanity, Playwright
**Total**: 173 unique capabilities + 5 plugins + personality-infused outputs

---

## Invocation Strategy (Hybrid Architecture)

### **Use Skills First** (161 capabilities) - Primary Method

**Pattern**: `Skill(skill="domain:skill-name", args="...")`

**When**: 90% of tasks - single-purpose, auto-discovery, standard workflows

**Examples**:
- SEO: `Skill(skill="seo:seo-keyword-research")` - Auto-loads when mentioned
- Content: `Skill(skill="content:content-writer-specialist")` - Content creation
- WebDev: `Skill(skill="webdev:frontend-architect-specialist")` - UI architecture
- Quality: `Skill(skill="quality:e2e-test-automator")` - Testing
- Commands: `Skill(skill="commands:init-client-project", args="ClientName")`

**All 161 skills** in `.claude/skills/` with progressive disclosure (~4k tokens at startup).

### **Use Strategic Agents** (12 Opus orchestrators) - Complex Only

**Pattern**: `Task(subagent_type="agent-name", prompt="task")`

**When**: Multi-domain coordination, strategic planning, complex orchestration

**The 12 Strategic Agents**:
- `orchestrai-master-coordinator` - Multi-domain task coordination
- `strategic-plan-synthesizer` - Comprehensive strategic planning (OPSP, EOS)
- `financial-modeling-specialist` - Financial models, unit economics, pricing
- `client-project-orchestrator` - Full client engagement management
- `simultaneous-orchestrator` - Parallel execution coordination
- `vaibe-builder-orchestrator` - Proven parallel execution patterns (77.7% speed boost)
- `ai-project-predictor` - ML-based timeline forecasting (85-95% accuracy)
- `intelligent-risk-assessor` - AI-powered risk assessment
- `performance-forecasting-specialist` - LSTM performance prediction
- `advanced-performance-analyzer` - Multi-dimensional analysis (95% automation)
- `semantic-analysis-engine` - NLP and semantic understanding
- `crystalline-memory-optimizer` - Memory system optimization

### Decision Tree

| Task Type | Use | Example |
|-----------|-----|---------|
| Single-purpose task | `Skill(skill="domain:name")` | Keyword research, content QA |
| Multi-domain strategy | `Task(subagent_type="orchestrai-master-coordinator")` | Full SEO + Content + WebDev plan |
| Financial modeling | `Task(subagent_type="financial-modeling-specialist")` | 3-year revenue model |
| Workflow command | `Skill(skill="commands:name")` | Init project, start SEO audit |

**See**: [ORCHESTRATION-STRATEGY.md](ORCHESTRATION-STRATEGY.md) for complete decision tree

---

## Personality Integration (Automatic)

**CRITICAL**: For client deliverables, strategic documents, and content creation:

1. **Before generating output**, use Read tool to load:
   - `SOUL.md` (identity, values, decision patterns)
   - `STYLE.md` (communication style)
   - For client work: `souls/[client-name]/SOUL.md`

2. **Embody the personality**:
   - Use decision patterns from SOUL.md
   - Apply communication style from STYLE.md
   - Generate outputs that sound like the described personality

3. **Verify quality**:
   - Would the person/client actually say this?
   - Does it match the examples in SOUL.md?
   - Is it measurably different from generic AI?

**When NOT to use**: Internal technical work, code-only tasks, quick exploratory queries

---

## Core Principles

### 1. Static-First
Default to static HTML. Use frameworks only when dynamic features required.

| Type | Use | Avoid |
|------|-----|-------|
| Landing/Marketing | Static HTML + Tailwind + MagicUI | Next.js |
| Apps/Dashboards | Next.js + ShadCN UI | Overengineering |

### 2. File Organization
```
/projects/[uuid]/
├── client-intelligence/  # ICP, branding
├── deliverables/        # Final outputs only
│   ├── seo/ content/ design/ development/ research/
└── crystalline-memory-index.json

/temp/  # Auto-cleanup, safe to delete
```

**Rules**: One client = One folder. Search before creating. Final outputs only in deliverables.

### 3. Quality Gates (Blocking)
- Test coverage ≥ 85%
- Zero OWASP vulnerabilities
- Lighthouse ≥ 90
- WCAG 2.1 AA
- AI detection < 30% (content)

---

## Domain Quick Links

| Domain | Agents | Guide |
|--------|--------|-------|
| **SEO** | 14 agents | [orchestrai-domains/seo/CLAUDE.md](orchestrai-domains/seo/CLAUDE.md) |
| **Content** | 12 agents | [orchestrai-domains/content/CLAUDE.md](orchestrai-domains/content/CLAUDE.md) |
| **WebDev** | 8 agents | [orchestrai-domains/webdev/CLAUDE.md](orchestrai-domains/webdev/CLAUDE.md) |
| **Quality** | 14 agents | [orchestrai-domains/quality/CLAUDE.md](orchestrai-domains/quality/CLAUDE.md) |
| **Strategic** | 12 Opus agents | [orchestrai-domains/strategic-planning/CLAUDE.md](orchestrai-domains/strategic-planning/CLAUDE.md) |
| **Client Intel** | 6 agents | [orchestrai-domains/client-intelligence/CLAUDE.md](orchestrai-domains/client-intelligence/CLAUDE.md) |
| **DevOps** | 5 agents | [orchestrai-domains/devops/CLAUDE.md](orchestrai-domains/devops/CLAUDE.md) |
| **Advertising** | 5 agents | [orchestrai-domains/advertising-enhanced/CLAUDE.md](orchestrai-domains/advertising-enhanced/CLAUDE.md) |

---

## Key Pipelines

| Pipeline | Time | Domain |
|----------|------|--------|
| seo-research-pipeline | 120m | SEO |
| multilanguage-content-pipeline | 180m | Content |
| design-development-pipeline | 240m | WebDev |
| comprehensive-testing-pipeline | 180m | Quality |
| strategic-planning-pipeline | 90m | Strategy |
| api-development-pipeline | 390m | API |

**Full workflows**: [docs/WORKFLOWS-REFERENCE.md](docs/WORKFLOWS-REFERENCE.md)

---

## Technology Stack

**Static** (default): HTML5, Tailwind, MagicUI, D3.js, Paper.js
**Dynamic**: Next.js 15, ShadCN UI, TypeScript, Prisma, PostgreSQL, Redis

---

## Strategic Orchestrators (12 Opus Agents)

**Only agents in system** - Use for complex multi-domain coordination

All use `claude-opus-4.5` for advanced reasoning:
- `orchestrai-master-coordinator` - Multi-system coordination
- `strategic-plan-synthesizer` - Strategic planning (OPSP, EOS)
- `financial-modeling-specialist` - Financial models & forecasting
- `client-project-orchestrator` - Full client management
- `simultaneous-orchestrator` - Parallel execution
- `vaibe-builder-orchestrator` - Proven parallel patterns
- `ai-project-predictor` - ML timeline forecasting
- `intelligent-risk-assessor` - AI risk assessment
- `performance-forecasting-specialist` - LSTM prediction
- `advanced-performance-analyzer` - Multi-dimensional analysis
- `semantic-analysis-engine` - NLP & semantics
- `crystalline-memory-optimizer` - Memory optimization

**All other capabilities** (161) available as skills. See [ORCHESTRATION-STRATEGY.md](ORCHESTRATION-STRATEGY.md)

---

## Hybrid Architecture (Skills-First + Strategic Agents)

**Effective**: February 17, 2026

**Skills System** (161 capabilities):
- Location: `.claude/skills/` (17 domains)
- Metadata: ~4k tokens at startup
- Full prompts: ~1.2k tokens (on-demand)
- Token savings: 99% (4k vs 193k if all loaded)
- Auto-discovery: Enabled
- Progressive disclosure: Active

**Strategic Agents** (12 orchestrators):
- Location: `.claude/agents/` (Opus-tier only)
- All loaded: ~14k tokens at startup
- Complex reasoning: Advanced multi-domain coordination
- Explicit invocation: Required (no auto-discovery)

**Total startup**: ~18k tokens (91% context available for work)

**Consolidation**:
- Removed: 102 duplicate agents (now skills)
- Kept: 12 strategic orchestrators
- Backup: `.claude/agents-backup-20260217/`

**See**: [ORCHESTRATION-STRATEGY.md](ORCHESTRATION-STRATEGY.md) | [SKILLS-MIGRATION-COMPLETE.md](SKILLS-MIGRATION-COMPLETE.md)

---

## hookify Rules

| Rule | Event | Action |
|------|-------|--------|
| pipeline-quality-gates | Stop | Validation checklist |
| static-first-check | File | Warn on framework overuse |
| no-console-log-production | File | Warn on console.log |
| protect-critical-directories | Bash | **BLOCK** rm/mv on /projects/ |
| warn-dangerous-commands | Bash | Warn on sudo, chmod 777 |
| git-commit-quality | Bash | Pre-commit checklist |

**Commands**: `/hookify:list`, `/hookify:configure`, `/hookify`

---

## Anti-Patterns (Avoid)

1. Next.js for static landing pages
2. Development servers for static HTML
3. New project folders for existing clients
4. Separate memory entities for related deliverables
5. Over-engineering with unused features
6. Docstrings/comments on unchanged code

---

## Personality Layer (SOUL.md)

**Purpose**: Consistent voice across 173 capabilities (not generic AI)

**Implementation**: Before generating significant outputs (content, strategies, reports), read these files:

**Files**:
- `SOUL.md` - Identity, values, decision patterns (read before major outputs)
- `STYLE.md` - Communication patterns, tone, format preferences
- `souls/[client]/SOUL.md` - Client-specific brand voices (for client deliverables)

**Usage Pattern**:
```javascript
// Step 1: Read personality files
Read("SOUL.md")  // Load identity & decision patterns
Read("STYLE.md") // Load communication style

// Step 2: Then generate output with personality
Skill(skill="seo:seo-keyword-research")
// Output will reflect SOUL.md values and STYLE.md patterns

// For client work:
Read("souls/client-healthcare/SOUL.md")  // Load client brand voice
Skill(skill="content:content-writer-specialist")
// Output will match client's brand personality
```

**When to Use**:
- ✅ Client deliverables (content, strategies, reports)
- ✅ Strategic planning documents
- ✅ External communications
- ❌ Internal technical work (not needed for pure code)

**Result**: Technical accuracy + recognizable personality (yours or client's)

**See**: [SOUL-USAGE-GUIDE.md](SOUL-USAGE-GUIDE.md) | [SOUL.md](SOUL.md) | [STYLE.md](STYLE.md)

---

## Additional Resources

| Doc | Purpose |
|-----|---------|
| [SOUL-USAGE-GUIDE.md](SOUL-USAGE-GUIDE.md) | Personality layer implementation |
| [ORCHESTRATION-STRATEGY.md](ORCHESTRATION-STRATEGY.md) | Hybrid architecture decision tree |
| [SKILLS-MIGRATION-COMPLETE.md](SKILLS-MIGRATION-COMPLETE.md) | Skills migration history |
| [CONTENT-CREATION-GUIDE.md](CONTENT-CREATION-GUIDE.md) | Content workflow, quality checklists |
| [UNIVERSAL-AGENT-DELEGATION-PATTERN.md](UNIVERSAL-AGENT-DELEGATION-PATTERN.md) | Agent invocation details |
| [FRONTEND-PLUGIN-INTEGRATION-GUIDE.md](FRONTEND-PLUGIN-INTEGRATION-GUIDE.md) | frontend-design skill usage |
| [CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md) | Hook configuration |
| [docs/WORKFLOWS-REFERENCE.md](docs/WORKFLOWS-REFERENCE.md) | Detailed workflow examples |
| [INSTALLED-PLUGINS-REFERENCE.md](INSTALLED-PLUGINS-REFERENCE.md) | All 5 Claude plugins |
| [SKILLS-SYSTEM-INTEGRATION-ISSUE.md](SKILLS-SYSTEM-INTEGRATION-ISSUE.md) | Skills system reality check |

---

**Context Efficiency**: 47k/200k tokens (24%) at session start. 153k available for work (76%). Agent metadata minimal, full prompts load on-demand.
