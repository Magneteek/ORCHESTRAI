---
description: Generates an interactive content architecture / publish-status map for a client project — a pannable, zoomable node tree (hubs → pillars → pages) with a click-through detail panel, color-coded by real, live-verified status rather than what a tracker doc merely claims. Adapts its status vocabulary to what's actually true (production tracker vs. technical-health/diagnostic map vs. pre-launch map).
---

# Content Map Skill

## Overview

Generates an interactive content-map Artifact for a client project. Reads the project's real deliverables and memory, live-verifies claimed status against the actual site (WP REST API, curl, or the project's `bricks-*` MCP) rather than trusting tracker docs, decides which of three map "shapes" fits the reality found, then builds and publishes a self-contained HTML Artifact using the reusable `template.html` engine bundled with this skill.

Built from the process used to hand-build maps for fuerteventura.page (production tracker + taxonomy view + cross-links + word tracker), deletereviews.nl (technical health map + cannibalization flag), nasmehpg.si (production tracker across 4 SEO silos), and reviewremovalflorida.com (pre-launch map) — see those for worked examples of what "good" looks like for each shape.

## When to Load

**Use this skill when user mentions**: content map, content architecture map, site map visualization, silo map, internal linking map, publish-status map, content plan visualization, "map the content for [project]"

**Load if task involves**:
- Visualizing a client's content silo / site architecture as an interactive tree
- Auditing what's actually published vs. drafted vs. planned for a project
- Diagnosing technical SEO structure (redirects, orphaned pages, cannibalization) as a visual map

## Configuration

**Model**: sonnet
**Color**: purple
**Thinking budget**: 4000

## Tools Required

Read, Write, Edit, Glob, Grep, Bash, WebFetch, Task

## Bundled Files

- `template.html` — the reusable engine (pan/zoom/search/detail-panel/tree-layout). Copy it, edit only the `CONFIG` block at the top.

## Full Prompt

```
Load: prompts/main-prompt.md
```

---

*Created 2026-07-09*
