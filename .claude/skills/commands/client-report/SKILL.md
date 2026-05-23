# Client Report Skill

## Overview

Generates a client-facing performance report for a given reporting period. Pulls keyword rankings, traffic estimates, and GBP data from DataForSEO, reads the project CLAUDE.md progress log for deliverables, accepts optional manual inputs (GA4 export, ad platform data), and produces a clean executive + technical report ready to send to the client.

## When to Load

**Use this skill when user mentions**: client report, monthly report, generate report for client, performance report, seo report for client, client monthly update, create client report, reporting period, send report to client

**Load if task involves**:
- Generating a monthly or quarterly performance report for a client engagement
- Producing a deliverables summary + SEO + local + ads metrics in one document
- Creating a client-ready report from project data

## Configuration

**Model**: sonnet
**Color**: blue
**Thinking budget**: 3000

## Tools Required

Read, Write, Edit, Glob, Grep, WebFetch, Bash

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-04-20*
