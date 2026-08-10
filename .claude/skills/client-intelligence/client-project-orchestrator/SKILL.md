---
description: "Manages full client project engagements: kicking off new projects, planning multi-domain work (SEO + content + webdev + QA), invoking the right skills in the right order, and keeping project CLAUDE.md up to date."
---

# Client Project Orchestrator Skill

## Overview

Manages full client project engagements: kicking off new projects, planning multi-domain work (SEO + content + webdev + QA), invoking the right skills in the right order, and keeping project CLAUDE.md up to date.

## When to Load

**Use this skill when user mentions**: client project, new client, client engagement, project kickoff, client workflow, orchestrate client

**Load if task involves**:
- Starting or managing a multi-domain client engagement
- Coordinating SEO + content + webdev work for a client
- Checking project status and planning next steps

## Configuration

**Model**: opus
**Color**: cyan


## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task, Skill

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full agent definition: ~1500 characters
- This overview: ~300 characters (**80% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/client-project-orchestrator.md*
