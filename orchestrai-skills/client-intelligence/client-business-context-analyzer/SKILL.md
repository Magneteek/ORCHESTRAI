# Client Business Context Analyzer Skill

## Overview

Specialized agent for organizational structure

## When to Load

**Use this skill when user mentions**: client, business, context, analyzer, analysis

**Load if task involves**:
- Business context and market analysis
- Related client-intelligence domain work

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
