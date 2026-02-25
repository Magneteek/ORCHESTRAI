# Task Coordinator Skill

## Overview

UTID generation and comprehensive workflow orchestration with cross-agent coordination and dependency management.

## When to Load

**Use this skill when user mentions**: task, coordinator, utid, generation, comprehensive, workflow, orchestration, with, cross, agent, coordination, dependency

**Load if task involves**:
- UTID generation and comprehensive workflow orchestration with cross-agent coordination and dependency management
- Related shared domain work

## Configuration

**Model**: sonnet
**Color**: green


## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full agent definition: ~565 characters
- This overview: ~113 characters (**80% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/task-coordinator.md*
