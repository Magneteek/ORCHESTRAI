# Web Quality Domain

## Domain Overview

The Web Quality Domain provides comprehensive web application quality assurance including functional testing, visual regression, accessibility validation, and performance monitoring.

**Domain Focus**: Automated testing, quality assurance, accessibility, performance

---

## Specialized Agents

- **`e2e-test-automator`** - Playwright and Cypress end-to-end testing
- **`functional-testing-specialist`** - User workflow and form validation testing
- **`visual-regression-tester`** - Screenshot comparison and pixel diff testing
- **`accessibility-agent`** - Continuous WCAG 2.1 Level AA/AAA validation
- **`performance-monitoring-agent`** - Core Web Vitals and Lighthouse monitoring

**See [../../.claude/agents/](../../.claude/agents/) and [../webdev/CLAUDE.md](../webdev/CLAUDE.md) for details.**

---

## Web Quality Workflows

### Comprehensive Test Suite
```
Parallel Test Execution:
- E2E tests (Playwright)
- Functional tests (user workflows)
- Visual regression tests
- Accessibility tests (WCAG)
- Performance tests (Core Web Vitals)
```

### Continuous Quality Monitoring
```
Task tool → quality agents (parallel) → Quality Reports

Continuous Validation:
- Code quality (ESLint, TypeScript)
- Accessibility (WCAG)
- Performance (Lighthouse)
- Security (OWASP)
```

---

## Integration with Universal Agent Pattern

```javascript
// E2E testing
Task(subagent_type="e2e-test-automator", prompt="Create Playwright tests...")

// Accessibility validation
Task(subagent_type="accessibility-agent", prompt="Validate WCAG compliance...")

// Performance monitoring
Task(subagent_type="performance-monitoring-agent", prompt="Monitor Core Web Vitals...")
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../webdev/CLAUDE.md](../webdev/CLAUDE.md)** - Web development integration
- **[../quality/CLAUDE.md](../quality/CLAUDE.md)** - Quality coordination

---

**This domain ensures web application quality through comprehensive automated testing and continuous monitoring.**
