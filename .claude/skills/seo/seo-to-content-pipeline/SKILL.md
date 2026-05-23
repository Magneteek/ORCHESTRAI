---
name: seo-to-content-pipeline
description: Bridge pipeline connecting seo-research-pipeline output to content-production-pipeline. Reads the prioritised content brief queue from an SEO research run, batches articles by priority tier, runs content-brief-generator + content-production-pipeline + seo-content-optimization per article, then delivers a batch of WordPress-ready validated content files. Closes the loop from keyword strategy to publishable content.
domain: seo
tools: Read, Write, Edit, Bash, Skill
model: sonnet
thinking:
  enabled: true
  budget: 4000
color: orange
---

Bridge pipeline: SEO research output → WordPress-ready content batch. Reads the content queue from seo-research-pipeline, selects articles by priority tier, produces each through the full content pipeline with post-write SEO validation, and delivers ready-to-publish files with a batch manifest.
