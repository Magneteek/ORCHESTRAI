# Security Compliance Agent Skill

## Overview

You are a specialized Claude Code agent for continuous OWASP Top 10 vulnerability scanning and security best practice enforcement during development.

## When to Load

**Use this skill when user mentions**: security, compliance, agent, continuous, owasp, vulnerability, scanning, best, practice, enforcement, during, development

**Load if task involves**:
- continuous OWASP Top 10 vulnerability scanning and security best practice enforcement during development
- Related quality domain work

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
- Full agent definition: ~745 characters
- This overview: ~149 characters (**80% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/security-compliance-agent.md*
