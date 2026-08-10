---
description: "Development-phase testing pipeline. Inventories existing tests, generates missing unit/integration/e2e tests to reach the coverage threshold (default 85%), runs security (OWASP) and accessibility (WCAG, frontend only) scans, and produces a consolidated QA report with BLOCK/WARN/PASS verdict. **Distinct from `webdev:code-delivery-pipeline`**: this pipeline *generates* missing tests during develo..."
---

# QA Pipeline Skill

## Overview

Development-phase testing pipeline. Inventories existing tests, generates missing unit/integration/e2e tests to reach the coverage threshold (default 85%), runs security (OWASP) and accessibility (WCAG, frontend only) scans, and produces a consolidated QA report with BLOCK/WARN/PASS verdict.

**Distinct from `webdev:code-delivery-pipeline`**: this pipeline *generates* missing tests during development. The delivery pipeline only *validates* — it does not write new tests. Use this during development; use code-delivery-pipeline before shipping.

**Callable from other pipelines** as a mid-process quality step before delivery.

## When to Load

**Use this skill when user mentions**: run qa pipeline, generate missing tests, test coverage check, build test suite, qa this code, write tests and check coverage, test this codebase, qa check before pr, development quality check

**Load if task involves**:
- Getting a codebase test-ready during development (generating + validating tests)
- Running a full quality check (tests + security + accessibility) mid-development
- Being invoked as a quality step from another pipeline before delivery

## Configuration

**Model**: sonnet
**Color**: orange
**Thinking budget**: 3000

## Tools Required

Read, Write, Edit, Glob, Grep, Bash, Skill

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-19*
