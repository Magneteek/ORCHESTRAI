---
description: Client project lifecycle manager. Reads a project folder and CLAUDE.md to determine current state (PROSPECT → ONBOARDING → RESEARCH → STRATEGY → PRODUCTION → REVIEW → DELIVERY → MAINTENANCE), what's completed, what's next, and what's blocking progress. Enforces guard conditions so phases can't be skipped. Can advance state and update CLAUDE.md when prerequisites are met.
---

# Project Lifecycle Skill

## Overview

Client project lifecycle manager. Reads a project folder and CLAUDE.md to determine current state (PROSPECT → ONBOARDING → RESEARCH → STRATEGY → PRODUCTION → REVIEW → DELIVERY → MAINTENANCE), what's completed, what's next, and what's blocking progress. Enforces guard conditions so phases can't be skipped. Can advance state and update CLAUDE.md when prerequisites are met.

## When to Load

**Use this skill when user mentions**: project status, what stage is this project, project lifecycle, where are we with this client, advance project state, what's next for this client, check project progress, project phase

**Load if task involves**:
- Checking the current state of a client engagement
- Understanding what must be completed before the next phase can start
- Advancing a project to the next lifecycle state

## Configuration

**Model**: sonnet
**Color**: blue

## Tools Required

Read, Write, Edit, Glob, Grep, Bash

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-19*
