# Content Strategy Domain

## Domain Overview

The Content Strategy Domain provides strategic content planning, cluster architecture, topical authority development, and content network optimization.

**Domain Focus**: Strategic planning, content clusters, topical authority, internal linking

---

## Specialized Agents

- **`content-outline-architect`** - Strategic content structure and topical authority planning
- **`content-cluster-suggester`** - Semantic content clustering and topical relationships
- **`seo-topical-authority`** - Topical authority development (Koray Gubur frameworks)
- **`seo-semantic-clustering`** - Semantic keyword clustering and topic modeling

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Content Strategy Workflows

### Content Cluster Planning
```
Task tool → content-cluster-suggester → Cluster Architecture

Deliverables:
- Topic cluster maps
- Pillar content identification
- Supporting content architecture
- Internal linking strategy
```

### Topical Authority Development
```
Task tool → seo-topical-authority → Authority Framework

Framework Components:
- Semantic topic networks
- Entity relationships
- Content depth requirements
- Authority signals
```

---

## Integration with Universal Agent Pattern

```javascript
// Cluster planning
Task(subagent_type="content-cluster-suggester", prompt="Map content clusters...")

// Topical authority
Task(subagent_type="seo-topical-authority", prompt="Develop topical authority for...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../content/CLAUDE.md](../content/CLAUDE.md)** - Content creation integration
- **[../seo/CLAUDE.md](../seo/CLAUDE.md)** - SEO strategy integration

---

**This domain provides strategic content planning that builds topical authority and search visibility.**
