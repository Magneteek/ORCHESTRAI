# Reviews Intelligence Specialist Skill

## Overview

Analyzes Google reviews for sentiment patterns, competitive reputation intelligence, and review-based market research. Works across all markets (SI, DE, CH, ES, NL, EN).

## When to Load

**Use this skill when user mentions**: reviews analysis, google reviews audit, reputation intelligence, review sentiment, competitor reviews, review monitoring, negative reviews report

**Load if task involves**:
- Analyzing a business's Google reviews for sentiment, patterns, and competitive intelligence
- Auditing competitor reviews to identify market opportunities

## Configuration

**Model**: sonnet
**Color**: green


## Tools Required

Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, mcp__dataforseo__business_data_search, mcp__dataforseo__business_data_info, mcp__dataforseo__business_data_reviews, mcp__dataforseo__business_data_reviews_filtered, mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__memory__create_entities, mcp__memory__add_observations, mcp__memory__create_relations

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

**Token Efficiency**:
- Full agent definition: ~1145 characters
- This overview: ~229 characters (**80% reduction**)
- Loads full content only when needed (progressive disclosure)

*Migrated from .claude/agents/reviews-intelligence-specialist.md*
