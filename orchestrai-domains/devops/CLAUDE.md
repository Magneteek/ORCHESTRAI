# DevOps Domain

## Domain Overview

The DevOps Domain provides CI/CD pipeline creation, Docker containerization, deployment automation, and infrastructure management with emphasis on reliability and automation.

**Domain Focus**: CI/CD pipelines, containerization, deployment automation, monitoring

---

## Specialized Agents

- **`devops-deployment-specialist`** - CI/CD pipelines, Docker, GitHub Actions, Vercel
- **`cicd-pipeline-architect`** - Enterprise CI/CD for GitHub Actions, GitLab CI, Jenkins
- **`kubernetes-deployment-expert`** - Production Kubernetes deployments with scaling
- **`docker-container-specialist`** - Docker optimization, multi-stage builds, security

**See [../../.claude/agents/](../../.claude/agents/) and [../webdev/CLAUDE.md](../webdev/CLAUDE.md) for details.**

---

## DevOps Workflows

### CI/CD Pipeline Creation
```
Task tool → devops-deployment-specialist → CI/CD Pipeline

Pipeline Stages:
- Code quality (ESLint, TypeScript)
- Security scanning
- Build process
- Automated testing
- Deployment (staging/production)
- Monitoring setup
```

### Docker Containerization
```
Task tool → docker-container-specialist → Production Container

Optimization:
- Multi-stage builds
- Layer optimization
- Security hardening
- Size reduction
- Cache strategies
```

---

## Integration with Universal Agent Pattern

```javascript
// CI/CD setup
Task(subagent_type="devops-deployment-specialist", prompt="Setup GitHub Actions...")

// Docker optimization
Task(subagent_type="docker-container-specialist", prompt="Optimize container...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../webdev/CLAUDE.md](../webdev/CLAUDE.md)** - Web development integration
- **[../../CLAUDE-CODE-HOOKS.md](../../CLAUDE-CODE-HOOKS.md)** - Workflow tracking

---

**This domain focuses on deployment automation and infrastructure reliability. Zero-downtime deployments are the standard.**
