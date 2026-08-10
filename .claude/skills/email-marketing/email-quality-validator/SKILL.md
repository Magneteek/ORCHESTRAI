---
description: Post-copy quality gate for email sequences. Validates every email in the sequence against its brief card — checking purpose alignment, word count, single CTA, opener quality, AI phrase patterns, proof usage, and sequence coherence. Scores each email and the sequence as a whole. Returns PASS, WARN, or BLOCK with specific revision instructions. Supports a revision loop up to 2 cycles before escal...
---

# Email Quality Validator Skill

## Overview

Post-copy quality gate for email sequences. Validates every email in the sequence against its brief card — checking purpose alignment, word count, single CTA, opener quality, AI phrase patterns, proof usage, and sequence coherence. Scores each email and the sequence as a whole. Returns PASS, WARN, or BLOCK with specific revision instructions. Supports a revision loop up to 2 cycles before escalating to human review.

## When to Load

**Use this skill when user mentions**: validate email sequence, check email quality, email sequence review, quality check emails, review email copy, email qa, validate email copy against brief

**Load if task involves**:
- Validating email copy against a sequence brief before delivery
- Checking for AI phrase patterns, word count violations, CTA problems in email copy
- Running the quality gate step in an email pipeline

## Configuration

**Model**: sonnet
**Color**: orange
**Thinking budget**: 2000

## Tools Required

Read, Write, Edit, Glob, Grep

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-21*
