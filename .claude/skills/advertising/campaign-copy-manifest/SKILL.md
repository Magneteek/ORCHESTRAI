---
name: campaign-copy-manifest
description: Research-backed shared brief that drives both ad copy and landing page copy from one source. Competitor ad + LP research → audience language mining → message architecture → per-asset brief cards for LP, Google Ads, Meta, LinkedIn, Reddit. Enforces message match: ad headline ≡ LP H1. Saves to deliverables/. Invoked as Phase 3.5 in paid-advertising-pipeline.
triggers:
  - "campaign copy manifest"
  - "ad to landing page message match"
  - "create shared campaign brief"
  - "ad copy landing page alignment"
  - "message match brief"
---

# Campaign Copy Manifest Skill

## Overview

Produces a research-backed shared brief that drives both ad copy AND landing page copy from one source of truth. The manifest enforces message match at every layer — the ad headline promise must equal the landing page H1, the audience pain language used in ads must mirror the language used in LP sections.

## When to Load

**Use this skill when**: building a paid ad campaign where ad copy and landing page copy must align, creating a shared brief before writing any ad or LP copy, auditing why an existing campaign has low conversion rates (usually a message match failure).

**Load if task involves**:
- Building a paid advertising campaign (invoked by paid-advertising-pipeline after offer architecture)
- Writing ad copy that needs to match a landing page
- Diagnosing conversion rate failure on a paid landing page

## Configuration

**Model**: sonnet
**Color**: red
**Thinking budget**: 4000

## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, mcp__dataforseo__search_intent, mcp__dataforseo__related_keywords, mcp__dataforseo__serp_competitors

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-19*
