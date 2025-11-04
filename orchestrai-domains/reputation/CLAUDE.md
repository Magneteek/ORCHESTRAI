# Reputation Domain

**Note**: This domain duplicates [../reputation-intelligence/CLAUDE.md](../reputation-intelligence/CLAUDE.md). Please refer to the Reputation Intelligence domain for complete documentation.

## Domain Overview

The Reputation domain provides review management and reputation monitoring capabilities.

---

## Redirect

**For complete reputation management documentation, see:**
- **[../reputation-intelligence/CLAUDE.md](../reputation-intelligence/CLAUDE.md)** - Full reputation intelligence workflows
- **[../local-seo/CLAUDE.md](../local-seo/CLAUDE.md)** - Local SEO integration with reviews

---

## Quick Reference

### Reputation Intelligence Agents
- `reviews-intelligence-specialist` - Google reviews analysis, sentiment tracking
- `sentiment-analysis-specialist` - Multi-language sentiment analysis

### Key Workflows
1. Negative review monitoring (DATAforSEO Business Data API)
2. Competitive reputation analysis
3. Sentiment tracking and analysis

### Integration Pattern
```javascript
Task(subagent_type="reviews-intelligence-specialist", prompt="Monitor reviews...")
```

---

**See [../reputation-intelligence/CLAUDE.md](../reputation-intelligence/CLAUDE.md) for complete documentation.**
