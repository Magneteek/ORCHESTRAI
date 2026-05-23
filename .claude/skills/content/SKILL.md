---
description: Content creation, optimization, and quality assurance domain — writing, AI detection, multi-language content, content structure, and production pipelines.
---

# Content Domain

## Overview

Content creation, optimization, and quality assurance specialists for writing, AI detection, multi-language content, and content structure correction.

Keywords: content, writing, ai detection, optimization, language, article, blog, copy, multilingual

## Invocation

Individual content skills register as **flat skills** (not domain-prefixed).

| Task | Skill | Invocation |
|---|---|---|
| Full content production (brief → write → QA → deliver) | content-production-pipeline | `Skill(skill="content-production-pipeline")` |
| Research-backed content brief (SERP → PPR → lexical → brief) | content-brief-generator | `Skill(skill="content-brief-generator")` |
| Convert brief into H1→H2→H3 outline | content-outline-architect | `Skill(skill="content-outline-architect")` |
| Write article from outline + brief | content-writer-specialist | `Skill(skill="content-writer-specialist")` |
| Validate 9-frame coverage on brief/outline/article | semantic-frame-validator | `Skill(skill="semantic-frame-validator")` |
| Language purity + AI phrase check | language-validation-specialist | `Skill(skill="language-validation-specialist")` |
| QA scorecard (completeness, keyword, engagement, compliance) | content-quality-validator | `Skill(skill="content-quality-validator")` |
| Multi-language content adaptation | multi-language-content-adapter | `Skill(skill="multi-language-content-adapter")` |
| Healthcare/dental content with compliance | healthcare-content-specialist | `Skill(skill="healthcare-content-specialist")` |

## Pipeline Architecture

```
content-brief-generator
  → content-outline-architect
    → semantic-frame-validator (gate)
      → content-writer-specialist
        → content-quality-validator
          → language-validation-specialist
            → [medical-check if healthcare]
              → deliver
```

The `content-production-pipeline` skill orchestrates all phases above. Invoke it directly for end-to-end production.

## IMPORTANT: Do NOT invoke like this

```
# WRONG — loads domain overview only, args ignored
Skill(skill="content", args="content-production-pipeline")

# CORRECT — registers as flat skill
Skill(skill="content-production-pipeline")
```
