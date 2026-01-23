# ORCHESTRAI - Multi-Agent Orchestration System

## Quick Reference

| Capability | Details |
|-----------|---------|
| **Agents** | 103 total (89 specialized + 12 Opus-tier + 2 coordination) |
| **Pipelines** | 19 production pipelines across 10+ domains |
| **MCP Servers** | DataForSEO, Memory, Notion, GSC, Ref.tools, MagicUI |
| **Plugins** | frontend-design, playwright, hookify, agent-sdk-dev, plugin-dev |
| **Languages** | EN, ES, NL, DE, SL |

---

## Core Rules

### 1. Agent Invocation Pattern
**All specialized agents are invoked via Task tool - this is domain-agnostic.**

```
Task tool → Specialized Agent → Results
```

Examples:
- `Task(subagent_type="content-writer-specialist")` - Content
- `Task(subagent_type="seo-competitor-analysis")` - SEO
- `Task(subagent_type="frontend-architect-specialist")` - Web Dev
- `Task(subagent_type="client-icp-analyst")` - Client Intelligence

**Key**: ANY agent in `.claude/agents/` can be invoked via Task tool.

### 2. Static-First Development
**Default to static HTML unless dynamic features are explicitly required.**

| Project Type | Use | Avoid |
|-------------|-----|-------|
| Landing Pages | Static HTML + Tailwind + MagicUI | Next.js |
| Marketing Sites | Static HTML or Gatsby | Full-stack frameworks |
| Web Applications | Next.js + ShadCN UI | Appropriate |
| Dashboards | Next.js + Real-time | Appropriate |

### 3. File Organization
**Clean file structure with zero pollution.**

```
/projects/[project-uuid]/
├── client-intelligence/    # ICP profiles, branding
├── deliverables/          # ONLY final outputs
│   ├── seo/
│   ├── content/
│   ├── design/
│   ├── development/
│   └── research/
└── crystalline-memory-index.json

/temp/                      # Safe to delete (auto-cleanup)
```

**Rules**:
- Single client = Single project folder
- Always search for existing client projects before creating new
- Write only final outputs to deliverables
- Integrate with existing crystalline memory entities

### 4. Quality Gates (Blocking)
All pipelines enforce:
- Test coverage ≥ 85%
- Zero OWASP vulnerabilities
- Lighthouse ≥ 90 all metrics
- WCAG 2.1 AA compliant
- AI detection < 30% (content)

---

## Domain Navigation

| Domain | CLAUDE.md | Key Agents |
|--------|-----------|------------|
| Web Development | [orchestrai-domains/webdev/CLAUDE.md](orchestrai-domains/webdev/CLAUDE.md) | frontend-architect-specialist, backend-development-specialist, ui-component-developer |
| API Development | [orchestrai-domains/api/CLAUDE.md](orchestrai-domains/api/CLAUDE.md) | api-architect, api-integration-specialist |
| Content | [orchestrai-domains/content/CLAUDE.md](orchestrai-domains/content/CLAUDE.md) | content-writer-specialist, multi-language-content-adapter |
| SEO | [orchestrai-domains/seo/CLAUDE.md](orchestrai-domains/seo/CLAUDE.md) | seo-keyword-research, seo-technical-analysis, seo-topical-authority |
| Local SEO | [orchestrai-domains/local-seo/CLAUDE.md](orchestrai-domains/local-seo/CLAUDE.md) | seo-local-seo, gbp-content-transformer, reviews-intelligence-specialist |
| Strategic Planning | [orchestrai-domains/strategic-planning/CLAUDE.md](orchestrai-domains/strategic-planning/CLAUDE.md) | strategic-plan-synthesizer (Opus), financial-modeling-specialist (Opus) |
| Client Intelligence | [orchestrai-domains/client-intelligence/CLAUDE.md](orchestrai-domains/client-intelligence/CLAUDE.md) | client-icp-analyst, client-branding-intelligence |
| DevOps | [orchestrai-domains/devops/CLAUDE.md](orchestrai-domains/devops/CLAUDE.md) | devops-deployment-specialist, kubernetes-deployment-expert |
| Quality | [orchestrai-domains/quality/CLAUDE.md](orchestrai-domains/quality/CLAUDE.md) | e2e-test-automator, security-testing-specialist, accessibility-agent |
| Advertising | [orchestrai-domains/advertising-enhanced/CLAUDE.md](orchestrai-domains/advertising-enhanced/CLAUDE.md) | google-ads-specialist, meta-ads-specialist, linkedin-ads-specialist |
| Email Marketing | [orchestrai-domains/email-marketing/CLAUDE.md](orchestrai-domains/email-marketing/CLAUDE.md) | email-marketing-automator, nurture-email-copywriter |

---

## Pipelines

| Pipeline | Duration | Domain |
|----------|----------|--------|
| design-development-pipeline.js | 240 min | Web Dev |
| api-development-pipeline.js | 390 min | API |
| comprehensive-testing-pipeline.js | 180 min | Quality |
| cicd-pipeline.js | 60 min | DevOps |
| multilanguage-content-pipeline.js | 180 min | Content |
| seo-research-pipeline.js | 120 min | SEO |
| local-seo-pipeline.js | 115 min | Local SEO |
| strategic-planning-pipeline.js | 90 min | Strategy |
| advertising-campaign-pipeline.js | 150 min | Advertising |

**Detailed workflow examples**: [docs/WORKFLOWS-REFERENCE.md](docs/WORKFLOWS-REFERENCE.md)

---

## Technology Stack

### Static Sites (Default)
- Semantic HTML5
- Tailwind CSS
- MagicUI components
- D3.js for visualization
- Paper.js for canvas effects

### Dynamic Applications (When Required)
- Next.js 15 with App Router
- ShadCN UI
- TypeScript throughout
- Prisma ORM + PostgreSQL
- Redis for memory/caching

---

## Opus-Tier Agents (12)
Strategic agents with advanced reasoning for complex multi-domain tasks:

- `orchestrai-master-coordinator`
- `strategic-plan-synthesizer`
- `financial-modeling-specialist`
- `client-project-orchestrator`
- `simultaneous-orchestrator`
- `vaibe-builder-orchestrator`
- `ai-project-predictor`
- `intelligent-risk-assessor`
- `performance-forecasting-specialist`
- `advanced-performance-analyzer`
- `semantic-analysis-engine`
- `crystalline-memory-optimizer`

All use `claude-opus-4.5`, `effort: high`, color: `cyan`.

---

## hookify Rules (Active)

| Rule | Event | Action |
|------|-------|--------|
| pipeline-quality-gates | Stop | Checklist validation |
| static-first-check | File | Warn on framework overuse |
| no-console-log-production | File | Warn on console.log |
| protect-critical-directories | Bash | **BLOCK** rm/mv on /projects/ |
| warn-dangerous-commands | Bash | Warn on sudo, chmod 777 |
| git-commit-quality | Bash | Pre-commit checklist |

Commands: `/hookify:list`, `/hookify:configure`, `/hookify`

**Full guide**: [HOOKIFY-ORCHESTRAI-GUIDE.md](HOOKIFY-ORCHESTRAI-GUIDE.md)

---

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run orchestrator # Start orchestrator
npm run redis        # Start Redis
npm run test         # Run tests
```

---

## Additional Docs

| Document | Purpose |
|----------|---------|
| [CONTENT-CREATION-GUIDE.md](CONTENT-CREATION-GUIDE.md) | Content workflow, quality checklists |
| [UNIVERSAL-AGENT-DELEGATION-PATTERN.md](UNIVERSAL-AGENT-DELEGATION-PATTERN.md) | Agent invocation details |
| [FRONTEND-PLUGIN-INTEGRATION-GUIDE.md](FRONTEND-PLUGIN-INTEGRATION-GUIDE.md) | frontend-design skill usage |
| [CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md) | Hook configuration |
| [docs/WORKFLOWS-REFERENCE.md](docs/WORKFLOWS-REFERENCE.md) | Detailed workflow examples |
| [INSTALLED-PLUGINS-REFERENCE.md](INSTALLED-PLUGINS-REFERENCE.md) | All 5 Claude plugins |

---

## Architecture Summary

- **Crystalline Memory**: Hexagonal nodes with geometric traversal
- **Pipeline Sharing**: Redis-based co-learning memory pool
- **Geometric Orchestration**: Hybrid mesh topology with dynamic routing
- **Performance**: 45% faster resolution, 60% more accurate, 90.2% improvement

---

## Anti-Patterns (Avoid)

1. Using Next.js for static landing pages
2. Suggesting development servers for static HTML
3. Creating new project folders for existing clients
4. Separate memory entities for related deliverables
5. Over-engineering with features not required
6. Adding docstrings/comments to unchanged code
