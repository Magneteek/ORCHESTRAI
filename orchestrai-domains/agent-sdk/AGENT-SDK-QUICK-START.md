# Agent SDK Domain - Quick Start Guide

## Quick Command Reference

### Create Standalone Agent Application
```bash
# Using Agent SDK CLI directly
/new-sdk-app [app-name]

# Via orchestrai-master-coordinator (full pipeline)
POST http://localhost:5501/agent-sdk/create
{
  "projectName": "Customer Support Agent",
  "agentType": "business",
  "language": "typescript",
  "features": ["chat", "memory", "tools"]
}
```

### Verify Agent SDK Application
```bash
# TypeScript verification
"Verify my TypeScript Agent SDK application at [path]"

# Python verification
"Verify my Python Agent SDK application at [path]"
```

### Direct Agent Invocation
```bash
# Architecture design only
Task(subagent_type="agent-sdk-architect", prompt="Design SDK for...")

# Implementation only
Task(subagent_type="agent-sdk-developer", prompt="Implement SDK for...")

# Documentation only
Task(subagent_type="agent-sdk-documentation-specialist", prompt="Document SDK at...")

# Testing only
Task(subagent_type="agent-sdk-integration-tester", prompt="Test SDK at...")

# Packaging only
Task(subagent_type="agent-sdk-packager", prompt="Package SDK at...")
```

---

## Common Use Cases

### 1. Customer Support Chatbot
**Duration**: 155 minutes
**Language**: TypeScript
**Deliverables**: Complete SDK with chat, memory, ticket creation

```javascript
projectSpec = {
  projectName: 'Customer Support Agent',
  clientName: 'Acme Corp',
  agentType: 'business',
  language: 'typescript',
  features: ['chat', 'memory', 'ticket-creation', 'sentiment-analysis']
}
```

### 2. Code Review Automator
**Duration**: 155 minutes
**Language**: Python
**Deliverables**: GitHub integration, PR analysis, automated suggestions

```javascript
projectSpec = {
  projectName: 'Code Review Agent',
  clientName: 'DevTeam Inc',
  agentType: 'coding',
  language: 'python',
  features: ['github-integration', 'pr-analysis', 'code-suggestions']
}
```

### 3. Content Generation Agent
**Duration**: 155 minutes
**Language**: TypeScript
**Deliverables**: SEO optimization, multi-language, CMS integration

```javascript
projectSpec = {
  projectName: 'Blog Post Generator',
  clientName: 'Content Co',
  agentType: 'business',
  language: 'typescript',
  features: ['seo-optimization', 'multi-language', 'cms-integration']
}
```

---

## Pipeline Stages Overview

| Stage | Agent | Duration | Blocking |
|-------|-------|----------|----------|
| 1. Requirements & Architecture | agent-sdk-architect | 20 min | Yes |
| 2. SDK Scaffolding | agent-sdk-developer | 15 min | Yes |
| 3. Core Implementation | agent-sdk-developer | 40 min | Yes |
| 4. Documentation | agent-sdk-documentation-specialist | 30 min | No |
| 5a. Testing (parallel) | agent-sdk-integration-tester | 30 min | Yes |
| 5b. Examples (parallel) | agent-sdk-developer | 30 min | No |
| 6. Packaging | agent-sdk-packager | 20 min | Yes |

**Total**: ~155 minutes with parallel optimization

---

## Quality Gates Checklist

### Blocking Gates (Must Pass)
- ✅ Architecture completeness (Stage 1)
- ✅ Project structure validation (Stage 2)
- ✅ Implementation completeness (Stage 3)
- ✅ Test coverage ≥90% (Stage 5)
- ✅ Verifier agent pass (Stage 5)
- ✅ Package validation (Stage 6)

### Non-Blocking Gates (Recommended)
- ⚠️ Documentation completeness (Stage 4)
- ⚠️ Example applications (Stage 5)
- ⚠️ Performance benchmarks (Stage 6)

---

## Deliverable Paths

### Project Structure
```
/projects/[client-uuid]/deliverables/agent-sdk/[app-name]/
├── src/              # Source code
├── tests/            # Test suite (90%+ coverage)
├── examples/         # Working examples
├── docs/             # API reference + guides
├── package.json      # NPM configuration
├── tsconfig.json     # TypeScript config
└── README.md         # Getting started
```

### Documentation
```
/projects/[client-uuid]/deliverables/agent-sdk/documentation/
├── api-reference.md
├── getting-started.md
└── integration-guide.md
```

### Quality Reports
```
/projects/[client-uuid]/deliverables/agent-sdk/quality-reports/
├── test-coverage.json
├── verifier-report.json
└── performance-benchmarks.json
```

---

## Agent SDK CLI Integration

### Available Commands
```bash
# Create new SDK app
/new-sdk-app [app-name]

# Interactive prompts:
# - Language: TypeScript or Python
# - Agent type: business, coding, or custom
# - Starting point: minimal, basic, or example
# - Package manager: npm, yarn, pnpm
```

### Verifier Agents
```bash
# TypeScript verification
agent-sdk-verifier-ts

# Python verification
agent-sdk-verifier-py

# Checks:
# - SDK best practices compliance
# - Type safety
# - Documentation completeness
# - Test coverage
```

---

## Technology Stack

### TypeScript SDK
```json
{
  "runtime": "Node.js 18+",
  "language": "TypeScript",
  "framework": "@anthropic-ai/sdk",
  "testing": "Jest",
  "linting": "ESLint",
  "formatting": "Prettier"
}
```

### Python SDK
```json
{
  "runtime": "Python 3.10+",
  "language": "Python",
  "framework": "anthropic",
  "testing": "pytest",
  "linting": "pylint",
  "formatting": "black"
}
```

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Agent SDK CLI not found | Install agent-sdk-dev plugin |
| Verifier agent fails | Check type coverage ≥90% |
| Test timeout | Increase timeout, mock dependencies |
| Package distribution error | Validate package.json, check license |
| Integration test failure | Use test fixtures, check mocks |

---

## Financial Quick Reference

### Service Offering
- **Project Value**: $35K-$50K per standalone agent
- **Typical Duration**: 155 minutes (2.5 hours)
- **Year 1 Target**: 4-5 projects
- **Annual Revenue**: $140K-$200K

### Client Benefits
- ✅ Production-ready code
- ✅ Complete API documentation
- ✅ 90%+ test coverage
- ✅ Example applications
- ✅ Deployment guide
- ✅ Maintenance plan

---

## Next Steps

1. **Review Documentation**: Read [CLAUDE.md](CLAUDE.md) for complete domain overview
2. **Test Pipeline**: Create test project with sample spec
3. **Define Agents**: Create 5 specialized agent definitions (Phase 2)
4. **Implement Pipeline**: Build `agent-sdk-deliverable-pipeline.js` (Phase 3)
5. **Register Domain**: Integrate with orchestrator-stable.js (Phase 6)

---

## Related Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete domain documentation
- **[../../AGENT-SDK-PLUGIN-GUIDE.md](../../AGENT-SDK-PLUGIN-GUIDE.md)** - Agent SDK plugin guide
- **[../../PLUGIN-BENEFITS-ANALYSIS.md](../../PLUGIN-BENEFITS-ANALYSIS.md)** - Financial analysis
- **[../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md](../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md)** - Agent patterns

---

**Last Updated**: December 2025
**Status**: Phase 1 Complete - Domain Structure Established
