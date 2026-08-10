# ORCHESTRAI System

**Architecture**: Hybrid (Skills-first + Strategic Agents) + Personality Layer (SOUL.md)
**Skills**: 225 (196 domain + 29 commands) - Auto-discoverable, progressive disclosure
**Agents**: 7 strategic agents (3 Sonnet conductors + 4 Opus orchestrators) — Fable unavailable (US ban)
**Personality**: SOUL.md (consistent voice across all 192 capabilities)
**MCP**: DataForSEO, Memory, Notion, GSC, Ref.tools, Magic, Sanity, Playwright
**Total**: 190 unique capabilities + 5 plugins + personality-infused outputs

## LEARNING SYSTEM (Read This First)

**CRITICAL**: At the start of every session, read `LEARNINGS.md` before doing any significant work. It contains mistakes we've fixed, decisions made, and client preferences. Ignoring it means repeating mistakes.

```
Read("LEARNINGS.md")  // Always do this first
```

To capture a new learning: `/learn [description]` or `Skill(skill="commands:learn")`

## PROJECT TRACKING (Required for Client Work)

Every client project has a `CLAUDE.md` at `/projects/[client-name]-[uuid]/CLAUDE.md`.

**When doing client work, agents MUST:**
1. Read the project `CLAUDE.md` at session start (client context + decisions)
2. Append a progress entry when work is completed:
   ```
   ### [date] — [What was done]
   - [Deliverable created/updated]
   - [Decision made]
   ```
3. If a client-specific decision or mistake is discovered, add it to the project `CLAUDE.md` AND run `/learn`

**Pattern**:
```
// Start of client session
Read("projects/[client-uuid]/CLAUDE.md")

// End of client session
Edit("projects/[client-uuid]/CLAUDE.md") // append progress entry
```

---

## Invocation Strategy (Hybrid Architecture)

### **Use Skills First** (183 capabilities) - Primary Method

**Pattern**: `Skill(skill="domain", args="skill-name")`
**Commands pattern**: `Skill(skill="commands:skill-name", args="...")` (commands/ namespace uses colon — domain namespaces do not)

**When**: 90% of tasks - single-purpose, auto-discovery, standard workflows

**Examples**:
- SEO: `Skill(skill="seo", args="seo-keyword-research")`
- Content: `Skill(skill="content", args="content-writer-specialist")`
- WebDev: `Skill(skill="webdev", args="frontend-architect-specialist")`
- Quality: `Skill(skill="quality", args="e2e-test-automator")`
- Commands: `Skill(skill="commands:init-client-project", args="ClientName")`

**All 185 skills** in `.claude/skills/` with progressive disclosure (~4k tokens at startup).

### **Use Strategic Agents** (7 agents: 3 Sonnet conductors + 4 Opus orchestrators)

**Pattern**: `Task(subagent_type="agent-name", prompt="task")`

**When**: Multi-phase execution, multi-domain coordination, full strategic planning

**Sonnet Conductors** (execution — sequence skills, manage state):
- `pipeline-conductor` - Stateful multi-phase pipeline execution with checkpointing + retry
- `campaign-conductor` - Cross-domain ad campaign delivery: takes the LP copy brief from `Skill(skill="advertising", args="paid-advertising-pipeline")`, coordinates the physical webdev build, runs the independent LP audit, maintains the client tracking-ID registry. Does NOT run strategy/offer/copy/compliance itself — that's the skill's job.
- `webdev-conductor` - Full-stack web build: architecture → parallel streams → QA gates

**Deep Reasoning Orchestrators** (Opus — strategic planning, financial modeling):
- `strategic-plan-synthesizer` - Comprehensive strategic planning (OPSP, EOS)
- `financial-modeling-specialist` - Financial models, unit economics, pricing

**Opus Orchestrators** (complex reasoning, cross-domain planning):
- `client-project-orchestrator` - Full client engagement management
- `orchestrai-master-coordinator` - Complex multi-domain task decomposition (use sparingly)

### Decision Tree

| Task Type | Use | Example |
|-----------|-----|---------|
| Single-purpose task | `Skill(skill="domain", args="skill-name")` | Keyword research, content QA |
| Multi-phase pipeline (120m+) | `Task(subagent_type="pipeline-conductor")` | seo-research-pipeline, content pipeline |
| Ad campaign strategy/copy/compliance (full build) | `Skill(skill="advertising", args="paid-advertising-pipeline")` | Research → offer → **mandatory copy manifest (message-match gate)** → copy → **compliance gate** → LP copy brief → campaign structure spec. Manifest-checkpointed, resumable. **Use this, not campaign-conductor, for the strategy/copy/compliance chain** — it has gates campaign-conductor does not. |
| Ad campaign — physical LP build + cross-domain delivery | `Task(subagent_type="campaign-conductor")` | Only after `paid-advertising-pipeline` has produced the LP copy brief — coordinates the actual webdev build, runs the independent LP audit (Phase 4.6), and maintains the client tracking-ID registry. Does not reimplement offer/copy/compliance logic itself. |
| Web project (full build) | `Task(subagent_type="webdev-conductor")` | Static site or full-stack app |
| Strategic planning | `Task(subagent_type="strategic-plan-synthesizer")` | OPSP, EOS growth plan |
| Financial modeling | `Task(subagent_type="financial-modeling-specialist")` | 3-year revenue model |
| Client engagement | `Task(subagent_type="client-project-orchestrator")` | Full client lifecycle |
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
└── deliverables/        # Final outputs only
    └── seo/ content/ design/ development/ research/

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
| **Strategic** | 4 Opus agents | [orchestrai-domains/strategic-planning/CLAUDE.md](orchestrai-domains/strategic-planning/CLAUDE.md) |
| **Client Intel** | 6 agents | [orchestrai-domains/client-intelligence/CLAUDE.md](orchestrai-domains/client-intelligence/CLAUDE.md) |
| **DevOps** | 5 agents | [orchestrai-domains/devops/CLAUDE.md](orchestrai-domains/devops/CLAUDE.md) |
| **Advertising** | 5 agents | [orchestrai-domains/advertising-enhanced/CLAUDE.md](orchestrai-domains/advertising-enhanced/CLAUDE.md) |
| **Healthcare** | 6 skills | `Skill(skill="healthcare", args="skill-name")` |

---

## Reporting Tools — When to Use Which

| Tool | When | Output |
|------|------|--------|
| `commands:monthly-report-pipeline` | **Unified monthly report — auto-reads stored pipeline outputs (rankings, maps, reputation, ads snapshots), pulls API only for gaps. Run after local-seo-monthly + reputation-intelligence-pipeline + ads-report** | HTML + Chart.js |
| `commands:client-report` | Interactive monthly report — requires manual data pasting (GA4 export, ads data). Use when pipeline outputs not yet stored | Markdown |
| `commands:ads-report` | Ads-only monthly report from pasted Google/Meta platform data, with period-over-period comparison | HTML + Chart.js |
| `data-analytics:performance-dashboard-builder` | Multi-source executive dashboard — GA4 + ads + rankings + revenue in one visual view | HTML + Chart.js |

---

## Key Pipelines

| Pipeline | Time | Domain |
|----------|------|--------|
| seo-research-pipeline | 120m | SEO |
| multilanguage-content-pipeline | 180m | Content |
| design-production-pipeline | 240m | WebDev |
| comprehensive-testing-pipeline | 180m | Quality |
| advertising-audit-pipeline | 60m | Advertising |
| strategic-planning-pipeline | 90m | Strategy |
| api-development-pipeline | 390m | API |

**Full workflows**: [docs/WORKFLOWS-REFERENCE.md](docs/WORKFLOWS-REFERENCE.md)

---

## Technology Stack

**Static** (default): HTML5, Tailwind, MagicUI, D3.js, Paper.js
**Dynamic**: Next.js 15, ShadCN UI, TypeScript, Prisma, PostgreSQL, Redis

---

## Strategic Agents (5 Total)

**Conductor** (Sonnet — execution management):
- `pipeline-conductor` - Stateful pipeline execution, checkpointing, retry logic

**Opus Orchestrators** (complex reasoning only):
- `strategic-plan-synthesizer` - Strategic planning (OPSP, EOS)
- `financial-modeling-specialist` - Financial models & forecasting
- `client-project-orchestrator` - Full client management
- `orchestrai-master-coordinator` - Complex task decomposition (note: Claude Code harness handles most orchestration directly; use this only when you want Opus reasoning in an isolated subagent context). **Requires `orchestrai-postgres` running** for `search-skills.js` — if down, fall back to `Glob(pattern=".claude/skills/[domain]/*")` for manual skill lookup.

**All other capabilities** (169) available as skills. See [ORCHESTRATION-STRATEGY.md](ORCHESTRATION-STRATEGY.md)

---

## Hybrid Architecture (Skills-First + Strategic Agents)

**Effective**: February 17, 2026

**Skills System** (183 capabilities):
- Location: `.claude/skills/` (17 namespaces: 16 domains + commands)
- Metadata: ~4k tokens at startup
- Full prompts: ~1.2k tokens (on-demand)
- Token savings: 99% (4k vs 193k if all loaded)
- Auto-discovery: Enabled
- Progressive disclosure: Active

**Strategic Agents** (4 orchestrators: all Opus — Fable unavailable):
- Location: `.claude/agents/`
- All loaded: ~5k tokens at startup
- Complex reasoning: Advanced multi-domain coordination
- Explicit invocation: Required (no auto-discovery)

**Total startup**: ~9k tokens (96% context available for work)

**Consolidation**:
- Removed: 102 duplicate agents (now skills) — Feb 2026
- Culled: 8 redundant/overlapping agents — Apr 2026
- Kept: 7 strategic agents (3 Sonnet conductors + 4 Opus orchestrators)
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

**Purpose**: Consistent voice across 189 capabilities (not generic AI)

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
Skill(skill="seo", args="seo-keyword-research")
// Output will reflect SOUL.md values and STYLE.md patterns

// For client work:
Read("souls/client-healthcare/SOUL.md")  // Load client brand voice
Skill(skill="content", args="content-writer-specialist")
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

**Context Efficiency**: ~10k tokens at session start (SKILL.md metadata only). Full prompts load on-demand. Agent metadata minimal. 190k+ available for work.
