---
description: Convert a 9-field content brief into a full H1→H2→H3 outline with word targets, key points per section, CTA placements, entity annotations, and internal link map.
---

# Content Outline Architect Skill

## Overview

Fleshes out a content brief into a full heading structure with H3s, word counts per section, key points, CTA placement, and internal link annotations. Feeds from `content:content-brief-generator` and outputs into `content:semantic-frame-validator` (frame validation gate) before the content goes to the writer.

## When to Load

**Use this skill when user mentions**: create content outline, build article outline, content structure plan, outline for article, plan content structure, outline this piece, heading structure for

**Load if task involves**:
- Strategic content structure with topical authority planning and comprehensive outline architecture. Use proactively for outline creation, content strategy, and topical authority development.

## Configuration

**Model**: sonnet
**Color**: cyan


## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full agent definition: ~11495 characters
- This overview: ~239 characters (**98% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/content-outline-architect.md*
