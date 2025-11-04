# Research Domain

## Domain Overview

The Research Domain provides comprehensive research workflows, data analysis, psychographic profiling, and semantic analysis with integration across all ORCHESTRAI domains.

**Domain Focus**: Research methodology, data analysis, psychographic insights, semantic patterns

---

## Specialized Agents

- **`semantic-analysis-engine`** - NLP and semantic understanding
- **`data-analytics-specialist`** - KPI tracking and business metrics
- **`client-icp-analyst`** - Psychographic profiling and ICP analysis

**See [../../.claude/agents/](../../.claude/agents/) and [../client-intelligence/CLAUDE.md](../client-intelligence/CLAUDE.md) for details.**

---

## Research Workflows

### Psychographic Research
```
Task tool → client-icp-analyst → ICP Analysis

Research Areas:
- Demographic segmentation
- Psychographic profiling
- Pain points identification
- Motivation mapping
- Decision-making patterns
```

### Semantic Analysis
```
Task tool → semantic-analysis-engine → Semantic Patterns

Analysis Coverage:
- NLP pattern recognition
- Topic modeling
- Entity relationships
- Semantic clustering
```

---

## Integration with Universal Agent Pattern

```javascript
// Psychographic research
Task(subagent_type="client-icp-analyst", prompt="Analyze ICP for...")

// Semantic analysis
Task(subagent_type="semantic-analysis-engine", prompt="Analyze patterns in...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../client-intelligence/CLAUDE.md](../client-intelligence/CLAUDE.md)** - ICP analysis integration
- **[../seo/CLAUDE.md](../seo/CLAUDE.md)** - Semantic SEO integration

---

**This domain provides research intelligence that informs strategy across all ORCHESTRAI domains.**
