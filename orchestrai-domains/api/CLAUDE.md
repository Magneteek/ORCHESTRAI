# API Domain

## Domain Overview

The API Domain provides RESTful and GraphQL API design, implementation, and integration patterns with emphasis on type safety, documentation, and production-ready architecture.

**Domain Focus**: API design, OpenAPI documentation, integration patterns, versioning strategies

---

## Specialized Agents

- **`api-architect`** - RESTful and GraphQL APIs with OpenAPI documentation
- **`api-integration-specialist`** - REST/GraphQL API integration with retry logic and error handling
- **`backend-development-specialist`** - Node.js/TypeScript backend implementation

**See [../../.claude/agents/](../../.claude/agents/) and [../webdev/CLAUDE.md](../webdev/CLAUDE.md) for details.**

---

## API Design Workflows

### RESTful API Design
```
Task tool → api-architect → API Specification

Deliverables:
- OpenAPI 3.0 specification
- Endpoint design (RESTful conventions)
- Request/response schemas
- Authentication strategy
- Rate limiting design
- Versioning strategy
```

### GraphQL API Design
```
Task tool → api-architect → GraphQL Schema

Deliverables:
- GraphQL schema definition
- Query and mutation design
- Type system
- Resolver architecture
- Subscription support
```

---

## Integration with Universal Agent Pattern

```javascript
// API design
Task(subagent_type="api-architect", prompt="Design RESTful API for...")

// API integration
Task(subagent_type="api-integration-specialist", prompt="Integrate with...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../webdev/CLAUDE.md](../webdev/CLAUDE.md)** - Web development domain

---

**This domain focuses on production-ready API design with comprehensive documentation and type safety.**
