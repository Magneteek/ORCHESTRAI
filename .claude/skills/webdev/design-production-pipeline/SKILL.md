---
name: design-production-pipeline
description: End-to-end design production pipeline. Loads client design system → generates 3–5 variants in parallel → render-screenshot-critique loop at 4 viewports → 7 parallel quality gates (contrast, a11y, token compliance, responsive, performance, vision hierarchy, copy) → surgical diff-only iteration → export. Produces browser-verified HTML deliverables.
domain: webdev
tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Skill, mcp__plugin_playwright_playwright__browser_navigate, mcp__plugin_playwright_playwright__browser_take_screenshot, mcp__plugin_playwright_playwright__browser_snapshot, mcp__plugin_playwright_playwright__browser_evaluate, mcp__plugin_playwright_playwright__browser_resize, mcp__magic__21st_magic_component_builder, mcp__magic__21st_magic_component_inspiration, mcp__shadcn-ui__get_component, mcp__shadcn-ui__list_components
model: sonnet
color: purple
thinking:
  enabled: true
  budget: 5000
---

Full design production pipeline with browser-verified quality gates. Generate → Render → Critique → Gate → Iterate. Uses Playwright for screenshots, Magic for components, shadcn-ui for UI elements. Every variant is rendered and visually validated — no speculative design.
