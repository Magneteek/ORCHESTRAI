# Code Delivery Pipeline Skill

## Overview

Pre-delivery quality gate for code: runs security (OWASP), code quality, test coverage, accessibility (frontend), and performance checks before shipping. Produces a consolidated delivery report with BLOCK/WARN/PASS status per gate.

## When to Load

**Use this skill when user mentions**: code delivery, pre-deploy check, ship code, code ready to deliver, delivery checklist, code review gate, ready to ship, pre-deployment review, code quality gate

**Load if task involves**:
- Running final quality checks before delivering or deploying code
- Validating code meets ORCHESTRAI quality gates (OWASP clean, ≥85% coverage, Lighthouse ≥90, WCAG 2.1 AA)

## Configuration

**Model**: sonnet
**Color**: cyan
**Thinking budget**: 4000

## Tools Required

Read, Write, Edit, Glob, Grep, Bash, Skill

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-19*
