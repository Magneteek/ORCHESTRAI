# ORCHESTRAI Workflow Reference

Detailed workflow examples for common use cases. Referenced from main CLAUDE.md.

---

## Workflow 1: SaaS Product Launch (6-10 hours)
**Complete end-to-end product ecosystem from strategy to market**

```yaml
orchestrai-master-coordinator
  ↓
Phase 1: Strategic Foundation (90 min)
  Parallel Execution (Opus-tier orchestration):
    - strategic-plan-synthesizer (Opus) → Market analysis, OPSP framework
    - financial-modeling-specialist (Opus) → Revenue projections, pricing
    - client-icp-analyst → Psychographic profiling
    - seo-competitor-analysis → Competitive landscape

  Deliverables:
    - Strategic plan (Scaling Up OPSP format)
    - Financial models (3-year projections)
    - ICP profiles with psychographics
    - Competitive analysis report

  ↓
Phase 2: Product Development (240-390 min)
  Parallel Pipeline Execution:
    - design-development-pipeline → Frontend (Next.js + ShadCN UI)
    - api-development-pipeline → Backend (Node.js + Prisma + PostgreSQL)

  Agents in parallel:
    - frontend-architect-specialist → Application architecture
    - backend-development-specialist → API implementation
    - ui-component-developer → Component library
    - api-architect → OpenAPI specification

  Deliverables:
    - Production Next.js application (60+ components)
    - RESTful API (20+ endpoints, documented)
    - PostgreSQL database (optimized schema)
    - Design system (30+ reusable components)

  ↓
Phase 3: Quality & Deployment (180 min)
  Parallel Pipeline Execution:
    - comprehensive-testing-pipeline → E2E + unit + security
    - cicd-pipeline → GitHub Actions + deployment

  Quality gates (blocking):
    - E2E test coverage ≥ 85%
    - Security: Zero OWASP vulnerabilities
    - Performance: Lighthouse ≥ 90 all metrics
    - Accessibility: WCAG 2.1 AA compliant

  Deliverables:
    - Comprehensive test suite (90%+ coverage)
    - CI/CD pipeline configuration
    - Production deployment (Vercel/K8s)
    - Monitoring and alerting setup

  ↓
Phase 4: Go-to-Market (180 min)
  Parallel Pipeline Execution:
    - multilanguage-content-pipeline → Blog posts, landing pages
    - seo-research-pipeline → Keyword research (100+ keywords)
    - advertising-campaign-pipeline → Multi-channel campaigns

  Deliverables:
    - 20-30 optimized blog posts (multi-language)
    - Complete SEO strategy
    - Email nurture sequences
    - Advertising campaigns (Google, Meta, LinkedIn)

Total Output: 100+ production-ready files
Total Value: $125K-$185K professional service equivalent
Time to Market: 6-10 hours vs 8-12 weeks traditional
```

---

## Workflow 2: Landing Page Development (2-4 hours)
**Static-first approach for marketing websites**

```yaml
Task tool → wireframe-creation-specialist → Information Architecture
  ↓
Task tool → design-system-architect → Design Tokens + Components
  ↓
Task tool → ui-component-developer → Static HTML Implementation
  ↓
Integration:
  - Tailwind CSS styling
  - MagicUI components (animations, interactions)
  - D3.js visualizations (if needed)
  - Paper.js canvas effects (if needed)
  ↓
Task tool → accessibility-agent → WCAG 2.1 AA validation
  ↓
Task tool → seo-technical-analysis → Performance optimization

Deliverables:
  - Production-ready static HTML
  - Tailwind CSS configuration
  - Interactive components
  - 90+ Lighthouse scores
  - Zero accessibility violations
```

---

## Workflow 3: API Development Only (6-8 hours)
**RESTful/GraphQL API with full documentation**

```yaml
api-development-pipeline (390 min):
  Stage 1: API Design (70 min)
    - OpenAPI 3.0 specification
    - RESTful endpoint design
    - Authentication strategy (JWT/OAuth)

  Stage 2: Authentication (60 min)
    - JWT/OAuth 2.0 implementation
    - RBAC (role-based access control)
    - Security validation (OWASP)

  Stage 3: Implementation (95 min)
    - Endpoint implementation
    - Database integration (Prisma ORM)
    - Resilience patterns (circuit breakers, retry logic)

  Stage 4: Testing (75 min)
    - Integration tests
    - Contract testing (Pact)
    - Load testing (k6)

  Stage 5: Documentation (50 min)
    - Interactive API docs (Swagger UI)
    - Client SDK generation (TypeScript, Python)
    - Postman collection

  Stage 6: Deployment (40 min)
    - API gateway configuration
    - Monitoring and observability

Deliverables:
  - Production API with 20+ endpoints
  - Complete OpenAPI documentation
  - Client SDKs (3+ languages)
  - 85%+ test coverage
  - Monitoring dashboards
```

---

## Workflow 4: Content Marketing Campaign (3-5 hours)
**Multi-language content with SEO optimization**

```yaml
Parallel Execution:
  - seo-keyword-research → 100+ keywords analyzed
  - client-icp-analyst → Psychographic data for targeting
  ↓
content-outline-architect → Content structure planning
  ↓
Parallel Content Creation (5-10 articles simultaneously):
  - content-writer-specialist → EN articles
  - multi-language-content-adapter → ES, NL, DE, SL translations
  ↓
Quality Assurance (parallel):
  - content-ai-phrase-detector → AI detection (<30%)
  - content-quality-validator → Readability, completeness
  - seo-content-optimization → On-page optimization
  ↓
seo-topical-authority → Topic clustering, internal linking

Deliverables:
  - 20-30 optimized articles (multi-language)
  - Keyword targeting strategy
  - Internal linking structure
  - Topic cluster architecture
  - Publishing schedule
```

---

## Workflow 5: GBP Content Creation & Posting (30-60 minutes)
**Transform existing content into optimized Google Business Profile posts**

```yaml
Standalone GBP Post Creation (30 min):
  Task tool → gbp-content-transformer
    ↓
  Create 4-6 GBP Posts:
    - 1-2 What's New (business updates, announcements)
    - 1-2 Offers (promotions, special pricing)
    - 1-2 Events/Products (workshops, service showcases)
    ↓
  Quality Gates (BLOCKING):
    - Character limit: 100-1500 chars
    - AI detection: <30%
    - Language purity: 100% (multi-language)
    - Mobile readability: <15 word sentences
    ↓
  Deliverables:
    - 4-6 GBP-ready posts (JSON format)
    - Posting calendar (weekly/biweekly schedule)
    - Transformation report

Blog-to-GBP Transformation (45 min):
  Input: 2-3 existing blog articles (2000+ words each)
    ↓
  Task tool → gbp-content-transformer
    ↓
  Transform each article → 3 GBP posts:
    - Blog 1 → What's New + Offer + Product (9 posts total)
    - Blog 2 → What's New + Offer + Product
    - Blog 3 → What's New + Offer + Product
    ↓
  Quality Validation:
    - All BLOCKING gates enforced
    - 80% pass rate required
    - Iterative revision for failed posts
    ↓
  Deliverables:
    - 9 transformed GBP posts
    - Source attribution and mapping
    - 4-week posting calendar

Full Local SEO + GBP Pipeline (115 min):
  local-seo-pipeline (6 stages):
    - Stage 1-5: Complete local SEO optimization (90 min)
    - Stage 6: GBP post generation (25 min)
    ↓
  Deliverables:
    - Complete local SEO optimization
    - 9-13 GBP posts ready for scheduling
    - Posting calendar (weekly frequency recommended)
    - DataForSEO competitor insights

Multi-Language GBP Posts (60 min):
  Create source posts in EN (20 min)
    ↓
  Task tool → multi-language-content-adapter (40 min)
    - Translate to NL, ES, DE, SL
    - Cultural adaptation
    - 100% language purity validation
    ↓
  Deliverables:
    - Same posts in 5 languages
    - Cultural adaptation notes
    - Language-specific posting recommendations
```
