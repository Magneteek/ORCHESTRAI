# Competitive Intelligence Domain

## Domain Overview

The Competitive Intelligence Domain provides competitor analysis, market intelligence synthesis, and competitive positioning analysis across SEO, content, and business strategy.

**Domain Focus**: Competitive analysis, market intelligence, positioning strategy

---

## Specialized Agents

- **`seo-competitor-analysis`** - Competitive SEO analysis and intelligence
- **`client-market-intelligence-synthesizer`** - Market research and competitive landscape
- **`backlink-strategy-architect`** - Strategic link building with competitive analysis

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Competitive Intelligence Workflows

### SEO Competitive Analysis
```
Task tool → seo-competitor-analysis → Competitive Intelligence

Analysis Coverage:
- Competitor domain keywords
- Ranking overlaps
- Content gap analysis
- Backlink profiles
- Technical SEO comparison
```

### Market Intelligence Synthesis
```
Task tool → client-market-intelligence-synthesizer → Market Research

Deliverables:
- Competitive landscape mapping
- Market positioning analysis
- Opportunity identification
- Threat assessment
```

---

## Integration with Universal Agent Pattern

```javascript
// SEO competitive analysis
Task(subagent_type="seo-competitor-analysis", prompt="Analyze competitors...")

// Market intelligence
Task(subagent_type="client-market-intelligence-synthesizer", prompt="Synthesize market data...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../seo/CLAUDE.md](../seo/CLAUDE.md)** - SEO competitive analysis
- **[../client-intelligence/CLAUDE.md](../client-intelligence/CLAUDE.md)** - Market intelligence integration

---

**This domain provides competitive intelligence that informs strategic positioning and opportunity identification.**
