---
description: Execute a content outline into a fully written publish-ready article. Reads outline_path (structure) + brief_path (entity map, lexical enrichment, dedup boundaries, conversion angles). Human voice, SEO-integrated entities, healthcare compliance.
---

# Content Writer Specialist Skill

## Overview

Executes content outlines into fully written, publish-ready articles. Receives `outline_path` (structure) + `brief_path` (entity map, lexical enrichment, dedup boundaries, conversion angles) from the content-production-pipeline. Writes section by section in the target language with human voice, SEO-integrated entities, and compliance-aware copy. Includes built-in AI phrase detection and healthcare compliance rules.

## When to Load

**Use this skill when user mentions**: write content, create article, write blog post, write landing page, write copy for, create content piece, write a page about, execute outline, write from brief

**Load if task involves**:
- Writing a complete article or page from an outline + research brief
- Human voice optimization, AI phrase replacement, readability enhancement
- Healthcare/dental content requiring compliance checks
- Content production pipeline Phase 1

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
- Full agent definition: ~6032 characters
- This overview: ~214 characters (**96% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/content-writer-specialist.md*
