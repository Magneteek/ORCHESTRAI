# ORCHESTRAI System

**Agents**: 114 (SEO, Content, WebDev, Quality, Strategic, Client Intelligence, DevOps, Advertising, Email)
**MCP**: DataForSEO, Memory, Notion, GSC, Ref.tools, Magic, Sanity, Playwright
**Skills**: Progressive disclosure (3.7k agent metadata, full prompts on-demand)

---

## Agent Invocation

**Pattern**: `Task(subagent_type="agent-name", prompt="task")`

**Examples**:
- SEO: `seo-keyword-research`, `seo-competitor-analysis`, `seo-technical-analysis`
- Content: `content-writer-specialist`, `content-ai-phrase-detector`, `multi-language-content-adapter`
- WebDev: `frontend-architect-specialist`, `backend-development-specialist`, `api-architect`
- Strategic: `orchestrai-master-coordinator`, `strategic-plan-synthesizer`, `financial-modeling-specialist`

**All 114 agents** in `.claude/agents/` invokable via Task tool.

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

## Opus-Tier Agents (12)

Strategic agents with advanced reasoning (`claude-opus-4.5`):
- `orchestrai-master-coordinator`, `strategic-plan-synthesizer`, `financial-modeling-specialist`
- `client-project-orchestrator`, `simultaneous-orchestrator`, `vaibe-builder-orchestrator`
- `ai-project-predictor`, `intelligent-risk-assessor`, `performance-forecasting-specialist`
- `advanced-performance-analyzer`, `semantic-analysis-engine`, `crystalline-memory-optimizer`

---

## Skills System (Progressive Disclosure)

**Architecture**:
- Agent metadata: 3.7k tokens (loaded at startup)
- Full prompts: ~1.2k tokens each (loaded on-demand when invoked)
- Total savings: 99% (3.7k vs 254k if all loaded upfront)

**Location**: `orchestrai-skills/` (15 domains, 114 skills)
**Status**: Fully migrated, on-demand loading operational

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

## Additional Resources

| Doc | Purpose |
|-----|---------|
| [CONTENT-CREATION-GUIDE.md](CONTENT-CREATION-GUIDE.md) | Content workflow, quality checklists |
| [UNIVERSAL-AGENT-DELEGATION-PATTERN.md](UNIVERSAL-AGENT-DELEGATION-PATTERN.md) | Agent invocation details |
| [FRONTEND-PLUGIN-INTEGRATION-GUIDE.md](FRONTEND-PLUGIN-INTEGRATION-GUIDE.md) | frontend-design skill usage |
| [CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md) | Hook configuration |
| [docs/WORKFLOWS-REFERENCE.md](docs/WORKFLOWS-REFERENCE.md) | Detailed workflow examples |
| [INSTALLED-PLUGINS-REFERENCE.md](INSTALLED-PLUGINS-REFERENCE.md) | All 5 Claude plugins |
| [SKILLS-SYSTEM-INTEGRATION-ISSUE.md](SKILLS-SYSTEM-INTEGRATION-ISSUE.md) | Skills system reality check |

---

**Context Efficiency**: 47k/200k tokens (24%) at session start. 153k available for work (76%). Agent metadata minimal, full prompts load on-demand.
