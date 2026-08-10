---
description: Knowledge Panel Optimization (KPO) auditor. Pulls live GBP data and Google Knowledge Panel for any business, scores 18 KPO fields (0–100), identifies missing fields by priority, and produces a complete actionable optimization report.
---

# SEO KPO Analyzer Skill

## Overview

Knowledge Panel Optimization (KPO) auditor. Pulls live GBP data and Google Knowledge Panel for any business, scores 18 KPO fields (0–100), identifies missing fields by priority, and produces a complete actionable optimization report.

## When to Load

**Use this skill when user mentions**: knowledge panel, KPO, Google Knowledge Panel, GBP optimization, entity optimization, knowledge panel missing fields, Google Business Profile audit, entity completeness, sameAs links, local entity SEO

**Load if task involves**:
- Auditing a client's Google Knowledge Panel completeness
- Identifying missing GBP fields that affect local SEO and entity authority
- Extracting Google entity IDs (CID, Place ID, category gcids)
- Pre-work for entity SEO or schema markup with real KP data

## Configuration

**Model**: sonnet
**Color**: cyan

## Tools Required

Read, Write, Edit, mcp__dataforseo__kpo_analyzer, mcp__dataforseo__entity_ids, mcp__dataforseo__serp_google_organic

## Full Prompt

```
Load: prompts/main-prompt.md
```
