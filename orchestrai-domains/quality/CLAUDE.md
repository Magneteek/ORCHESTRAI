# Quality Domain

## Domain Overview

The Quality Domain provides comprehensive quality assurance coordination, cross-system validation, and multi-tier quality frameworks achieving 60% more accurate outcomes.

**Domain Focus**: Quality coordination, validation frameworks, cross-system testing

---

## Specialized Agents

- **`quality-assurance-coordinator`** - Cross-system quality validation
- **`content-quality-validator`** - Content completeness and readability validation
- **`code-quality-agent`** - Real-time ESLint, Prettier, TypeScript validation
- **`accessibility-validator`** - WCAG compliance and a11y testing

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Quality Workflows

### Cross-System Quality Validation
```
Task tool → quality-assurance-coordinator → Multi-Tier QA

Validation Layers:
- Code quality (syntax, standards)
- Content quality (readability, accuracy)
- Accessibility (WCAG compliance)
- Performance (Core Web Vitals)
- Security (OWASP Top 10)
```

### Content Quality Validation
```
Task tool → content-quality-validator → Quality Assessment

Assessment Areas:
- Paragraph distribution (40/40/20)
- Readability scores
- Engagement elements
- Language purity
- SEO compliance
```

---

## Integration with Universal Agent Pattern

```javascript
// Quality coordination
Task(subagent_type="quality-assurance-coordinator", prompt="Validate...")

// Content validation
Task(subagent_type="content-quality-validator", prompt="Assess quality...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md)** - Content quality standards
- **[../content/CLAUDE.md](../content/CLAUDE.md)** - Content domain integration

---

**This domain ensures quality across all ORCHESTRAI deliverables through multi-tier validation frameworks.**
