---
description: Specialized agent for organizational structure
---

# Client Business Context Analyzer Skill

## Overview

Specialized agent for organizational structure

## When to Load

**Use this skill when user mentions**: analyze client business, client business context, client company analysis, understand client business model, client onboarding analysis

**Load if task involves**:
- Business context and market analysis

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
- Full agent definition: ~7282 characters
- This overview: ~46 characters (**99% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/client-business-context-analyzer.md*
