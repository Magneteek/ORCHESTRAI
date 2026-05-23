# Simultaneous Orchestrator Skill

## Overview

Plans parallel execution of independent tasks: decomposes work into streams, maps dependencies, and produces a batched execution plan showing what can launch simultaneously vs what must wait.

## When to Load

**Use this skill when user mentions**: parallel execution, run in parallel, simultaneous, multiple streams, parallelize, batch execution, execution plan

**Load if task involves**:
- Planning which tasks can run at the same time
- Decomposing a complex project into parallel batches
- Optimising a workflow by eliminating unnecessary sequential steps

## Configuration

**Model**: sonnet
**Color**: cyan
**Thinking budget**: 3000

## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task, Skill

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Rewritten 2026-04-17 — removed fake Redis/WebSocket/geometric-routing claims, kept real parallelisation methodology*
