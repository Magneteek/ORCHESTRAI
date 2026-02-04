# Content Structure Corrector Skill

## Overview

You are a specialized Claude Code agent for **automated content architecture correction**. You fix structural and formatting issues in articles while preserving the excellent writing quality, language purity, and conversational tone.

## When to Load

**Use this skill when user mentions**: content, structure, corrector, quality

**Load if task involves**:
- Automated content architecture correction agent that fixes structural issues (excessive tables, wrong paragraph distribution, length problems) while preserving writing quality and language purity
- Related content domain work

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
- Full agent definition: ~12120 characters
- This overview: ~233 characters (**98% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/content-structure-corrector.md*
