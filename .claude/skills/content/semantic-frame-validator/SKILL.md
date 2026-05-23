---
description: Gate validator checking any brief, outline, or article against the 9 semantic frames. Produces scored Frame Coverage Report with remediation instructions, redundancy flags, and conversion flow check.
---

# Semantic Frame Validator

## Overview

Standalone verification gate that checks any document — content brief, outline, competitor page, or finished article — against the 9 semantic frames to confirm complete topic coverage. Produces a Frame Coverage Report with a scored card (✅ Covered / ⚠️ Partial / ❌ Missing per frame), specific remediation instructions for every gap, redundancy flags where the same frame bleeds across multiple sections, and a conversion flow check (are the frames in a logical reader-journey order?).

Run this between pipeline stages to catch gaps before they reach the writer.

**Sits between**: `content:content-brief-generator` → **[this]** → `content:content-outline-architect`
**Also valid at**: `content:content-outline-architect` → **[this]** → `content:content-writer-specialist`
**Also valid as**: post-publish audit of existing content or competitor page analysis

## When to Load

**Use this skill when user mentions**: validate brief, frame coverage check, semantic coverage check, check my brief, verify content completeness, frame audit, is my brief complete, coverage report, frame gaps, semantic frame, check coverage, content coverage audit, validate outline

**Load if task involves**:
- Validating a content brief before it goes to the outline architect
- Checking an outline before it goes to the writer
- Auditing existing published content for semantic gaps
- Checking competitor content to map their frame coverage

## Configuration

**Model**: sonnet
**Color**: cyan
**Thinking budget**: 4000

## Tools Required

Read, Write, WebFetch, Glob, Grep, mcp__dataforseo__search_intent, mcp__dataforseo__related_keywords

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-20*
