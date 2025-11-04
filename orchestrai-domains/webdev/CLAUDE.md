# Web Development Domain

## Domain Overview

The Web Development Domain provides comprehensive web application development, from wireframes and UI/UX design through frontend/backend implementation to deployment and testing. This domain emphasizes the **Principle of Appropriate Complexity** - always choosing the simplest technology solution that meets requirements.

**Domain Focus**: Static-first development, progressive enhancement, and production-ready web applications

---

## Specialized Agents

This domain leverages the following specialized Claude Code agents via the **Universal Agent Delegation Pattern**:

### Design & Architecture Agents
- **`wireframe-creation-specialist`** - Information architecture, user flows, component hierarchy
- **`ui-component-developer`** - Reusable React components with Tailwind CSS and ShadCN UI
- **`frontend-architect-specialist`** - Scalable React/Next.js architecture with TypeScript
- **`api-architect`** - RESTful and GraphQL APIs with OpenAPI documentation
- **`design-system-architect`** - Design system creation and component libraries

### Development Agents
- **`backend-development-specialist`** - Node.js/TypeScript backend with Prisma ORM and PostgreSQL
- **`api-integration-specialist`** - REST/GraphQL API integration with retry logic and error handling
- **`third-party-service-connector`** - External SDK integration (Stripe, Twilio, etc.)
- **`responsive-layout-optimizer`** - Responsive design optimization

### Quality & Deployment Agents
- **`e2e-test-automator`** - Playwright and Cypress end-to-end testing
- **`unit-test-generator`** - Unit test suite generation with Jest
- **`functional-testing-specialist`** - User workflow and form validation testing
- **`devops-deployment-specialist`** - CI/CD pipelines, Docker, GitHub Actions, Vercel
- **`kubernetes-deployment-expert`** - Production Kubernetes deployments with scaling

### Optimization Agents
- **`performance-monitoring-agent`** - Core Web Vitals and Lighthouse monitoring
- **`accessibility-agent`** - WCAG 2.1 Level AA/AAA validation
- **`security-testing-specialist`** - OWASP Top 10, vulnerability scanning
- **`code-quality-agent`** - ESLint, Prettier, TypeScript validation

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## CRITICAL: Technology Choice Principles

### Principle of Appropriate Complexity

**RULE: Always choose the simplest solution that meets the project requirements**

```
Static Content = Static HTML + Tailwind CSS + Modern Libraries
Dynamic Content = Next.js/React + ShadCN UI + TypeScript
Server Logic = Node.js + Express + Database Integration
```

### Technology Decision Matrix

| Project Type | Recommended Stack | Avoid Over-Engineering |
|-------------|------------------|----------------------|
| **Landing Pages** | Static HTML + Tailwind + MagicUI + D3.js | ❌ Next.js unless SSR needed |
| **Marketing Sites** | Static HTML or Gatsby | ❌ Full-stack frameworks |
| **Web Applications** | Next.js + ShadCN UI + TypeScript | ✅ Appropriate complexity |
| **Dashboards** | Next.js + Real-time features | ✅ Justified framework use |

### Static-First Development Rules

1. **Default to Static**: Start with static HTML unless dynamic features are explicitly required
2. **No Server for Static**: Static HTML files work perfectly without development servers
3. **Library Integration**: Use Tailwind CSS, MagicUI components, D3.js, Paper.js for rich interactions
4. **Progressive Enhancement**: Add complexity only when business requirements demand it

### Anti-Patterns to Avoid

```
❌ WRONG: "I'll use Next.js for this landing page"
✅ CORRECT: "This landing page works perfectly with static HTML"

❌ WRONG: "We need a development server to view this static site"
✅ CORRECT: "Static HTML opens directly in browsers"

❌ WRONG: "Let's add React components for simple content"
✅ CORRECT: "Static HTML with JavaScript libraries handles this"
```

---

## Web Development Workflows

### 1. Static Landing Page Development

**Recommended Stack**: Static HTML + Tailwind CSS + MagicUI

```
Task tool → wireframe-creation-specialist → Wireframes
  ↓
Task tool → ui-component-developer → Static HTML Components
  ↓
Integration:
  - Tailwind CSS for styling
  - MagicUI components (orbiting, ripples, animated beams)
  - D3.js for data visualization
  - Paper.js for canvas effects
  ↓
Deliverable: /projects/[uuid]/deliverables/development/landing-page/
  - index.html
  - styles.css (Tailwind compiled)
  - scripts.js
  - assets/
```

**Use When**: Marketing sites, landing pages, portfolios, documentation

**Benefits**:
- ✅ No build process required
- ✅ Opens directly in browser
- ✅ Fast loading, excellent SEO
- ✅ Easy to maintain

### 2. Dynamic Web Application Development

**Recommended Stack**: Next.js 15 + ShadCN UI + TypeScript

```
Task tool → frontend-architect-specialist → Application Architecture
  ↓
Parallel Execution:
  - ui-component-developer → React components
  - backend-development-specialist → API routes
  - api-architect → API design
  ↓
Integration & Testing:
  - e2e-test-automator → Playwright tests
  - accessibility-agent → WCAG validation
  - performance-monitoring-agent → Core Web Vitals
  ↓
Deployment:
  - devops-deployment-specialist → CI/CD pipeline
  ↓
Deliverables: /projects/[uuid]/deliverables/development/web-app/
```

**Use When**: Interactive dashboards, SaaS applications, real-time features

**Features**:
- SSR/SSG with Next.js App Router
- Type-safe with TypeScript
- Reusable ShadCN UI components
- Production-ready architecture

### 3. Full-Stack Application with Backend

**Recommended Stack**: Next.js + Node.js + Prisma + PostgreSQL

```
Parallel Agent Launch:
  - frontend-architect-specialist → Frontend architecture
  - backend-development-specialist → Backend API
  - api-architect → API design & documentation
  - ui-component-developer → Component library
  ↓
Database Setup:
  - Prisma schema design
  - PostgreSQL configuration
  - Database migrations
  ↓
Testing Suite:
  - unit-test-generator → Jest unit tests
  - e2e-test-automator → Playwright E2E tests
  - security-testing-specialist → Security audit
  ↓
Deployment:
  - devops-deployment-specialist → Docker + CI/CD
  - kubernetes-deployment-expert → K8s production (if needed)
```

**Use When**: Complex business logic, database requirements, authentication

### 4. Design System Creation

**Agent**: `design-system-architect`

```
Task tool → design-system-architect → Design System

Components:
  - Typography system
  - Color palette
  - Component library (buttons, forms, cards)
  - Layout patterns
  - Spacing & sizing scales
  ↓
Implementation:
  - Tailwind config
  - ShadCN UI customization
  - Storybook documentation
  ↓
Deliverable: /projects/[uuid]/deliverables/development/design-system/
```

**Use When**: Building scalable multi-page applications, maintaining brand consistency

---

## Integration with Universal Agent Pattern

All webdev agents follow the **Universal Agent Delegation Pattern** documented in [../../CLAUDE.md](../../CLAUDE.md):

### Direct Invocation Pattern
```javascript
// For single component or feature
Task(
  subagent_type="ui-component-developer",
  prompt="Create responsive navigation component with mobile menu..."
)
```

### Parallel Execution Pattern
```javascript
// For complete application development
// Launch ALL simultaneously in ONE message
Task(subagent_type="frontend-architect-specialist", prompt="Design architecture...")
Task(subagent_type="backend-development-specialist", prompt="Create API...")
Task(subagent_type="ui-component-developer", prompt="Build components...")
Task(subagent_type="e2e-test-automator", prompt="Create test suite...")
// All execute in parallel, massive productivity gain
```

### Progressive Enhancement Pattern
```javascript
// Start simple, add complexity as needed
Phase 1: Static HTML prototype
Phase 2: Add interactivity with vanilla JS
Phase 3: Upgrade to React if state management needed
Phase 4: Add backend if data persistence required
```

---

## File Organization

### Web Development Deliverables Structure
```
/projects/[client-uuid]/
├── deliverables/
│   └── development/
│       ├── static-sites/
│       │   ├── landing-page/
│       │   │   ├── index.html
│       │   │   ├── styles.css
│       │   │   ├── scripts.js
│       │   │   └── assets/
│       │   └── marketing-site/
│       ├── web-apps/
│       │   ├── dashboard/
│       │   │   ├── src/
│       │   │   ├── public/
│       │   │   ├── package.json
│       │   │   └── next.config.js
│       │   └── admin-panel/
│       ├── design-systems/
│       │   ├── components/
│       │   ├── tokens/
│       │   └── tailwind.config.js
│       ├── backend-apis/
│       │   ├── src/
│       │   ├── prisma/
│       │   └── openapi.yaml
│       └── tests/
│           ├── e2e/
│           ├── unit/
│           └── integration/
├── client-intelligence/
│   └── brand-profile.json         # Used for design system
└── crystalline-memory-index.json
```

---

## Technology Stack Details

### Frontend (Dynamic Applications)
- **Framework**: Next.js 15 with App Router
- **UI Library**: ShadCN UI for flexibility and customization
- **Styling**: Tailwind CSS with custom configurations
- **Type Safety**: TypeScript throughout
- **State Management**: React Context, Zustand, or Redux Toolkit
- **Real-time**: WebSocket connections, Server-Sent Events

### Static Web Development (Default Choice)
- **Structure**: Semantic HTML5 with proper accessibility
- **Styling**: Tailwind CSS with custom brand configurations
- **Interactions**: MagicUI components
  - `orbiting-circles` - Orbital animations
  - `ripple` - Interactive ripple effects
  - `animated-beam` - Connection visualizations
- **Visualization**: D3.js v7 for data visualization and charts
- **Animation**: Paper.js for advanced canvas effects and particles
- **Icons**: Lucide React or Heroicons for consistent iconography

### Backend (Node.js + TypeScript)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **ORM**: Prisma for type-safe database access
- **Database**: PostgreSQL for structured data
- **Authentication**: NextAuth.js or Passport.js
- **API Documentation**: OpenAPI/Swagger
- **Validation**: Zod or Joi

### Testing & Quality
- **E2E Testing**: Playwright (preferred) or Cypress
- **Unit Testing**: Jest with Testing Library
- **API Testing**: Supertest
- **Coverage**: Istanbul/NYC
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode

### Deployment & DevOps
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions, GitLab CI
- **Hosting**: Vercel (Next.js), Railway, DigitalOcean
- **Orchestration**: Kubernetes (production scale)
- **Monitoring**: Sentry, LogRocket, Datadog

---

## Domain-Specific Best Practices

### 1. Always Question Complexity
```javascript
// Before choosing Next.js
Questions to ask:
- Do we need SSR or SSG?
- Is there dynamic data fetching?
- Do we need API routes?
- Is this just static content?

// If all "no" → Use static HTML
```

### 2. Parallel Development Workflow
```javascript
// Launch all development agents in parallel
Task(subagent_type="frontend-architect-specialist", ...)
Task(subagent_type="backend-development-specialist", ...)
Task(subagent_type="ui-component-developer", ...)
Task(subagent_type="e2e-test-automator", ...)
// Complete stack developed simultaneously
```

### 3. Component Reusability First
```javascript
// Build design system before application
1. Task(subagent_type="design-system-architect", ...)
2. Create component library
3. Build application using library components
// Consistency and maintainability
```

### 4. Testing from Day One
```javascript
// Include testing agents in initial build
Parallel Execution:
  - Development agents (frontend + backend)
  - Testing agents (unit + E2E + accessibility)
  - Quality agents (code quality + performance)
// Production-ready from start
```

### 5. Accessibility is Mandatory
```javascript
// WCAG 2.1 Level AA minimum
Task(
  subagent_type="accessibility-agent",
  prompt="Validate WCAG 2.1 Level AA compliance for [component/page]..."
)
// Run on all components and pages
```

---

## Responsive Design Optimization

### Agent: `responsive-layout-optimizer`

**Capabilities**:
```
- Mobile-first design implementation
- Breakpoint optimization (sm, md, lg, xl, 2xl)
- Touch-friendly interactions
- Performance optimization for mobile
- Cross-browser compatibility
```

**Testing Matrix**:
```
Mobile: iPhone 12/13/14, Android (Chrome)
Tablet: iPad Pro, Samsung Galaxy Tab
Desktop: 1920x1080, 2560x1440, 4K
Browsers: Chrome, Firefox, Safari, Edge
```

**Use When**: All web applications (mobile-first is mandatory)

---

## Performance Optimization

### Agent: `performance-monitoring-agent`

**Core Web Vitals Targets**:
```
LCP (Largest Contentful Paint): <2.5s
FID (First Input Delay): <100ms
CLS (Cumulative Layout Shift): <0.1
```

**Optimization Strategies**:
```
- Image optimization (WebP, lazy loading)
- Code splitting and lazy loading
- CSS/JS minification
- CDN for static assets
- Caching strategies
- Bundle size analysis
```

**Continuous Monitoring**:
```javascript
Task(
  subagent_type="performance-monitoring-agent",
  prompt="Monitor Core Web Vitals and Lighthouse scores during development..."
)
```

---

## Security Best Practices

### Agent: `security-testing-specialist`

**OWASP Top 10 Coverage**:
```
1. Injection attacks (SQL, XSS)
2. Broken authentication
3. Sensitive data exposure
4. XML external entities (XXE)
5. Broken access control
6. Security misconfigurations
7. Cross-site scripting (XSS)
8. Insecure deserialization
9. Using components with known vulnerabilities
10. Insufficient logging & monitoring
```

**Security Checks**:
```javascript
Task(
  subagent_type="security-testing-specialist",
  prompt="Run OWASP Top 10 security audit and vulnerability scan..."
)
```

**Automated Security**:
```
- Dependency scanning (npm audit, Snyk)
- Static analysis (SonarQube)
- Secret detection (git-secrets)
- SSL/TLS validation
- Content Security Policy (CSP)
```

---

## CI/CD Pipeline Integration

### Agent: `devops-deployment-specialist`

**Pipeline Stages**:
```
1. Code Quality
   - ESLint, Prettier, TypeScript check
   - Unit tests (Jest)

2. Security
   - Dependency audit
   - SAST scanning

3. Build
   - Production build
   - Bundle size check

4. Testing
   - E2E tests (Playwright)
   - Accessibility tests
   - Performance tests

5. Deployment
   - Staging deployment
   - Production deployment (manual approval)

6. Monitoring
   - Performance monitoring
   - Error tracking
   - Analytics
```

**GitHub Actions Example**:
```yaml
name: Web App CI/CD
on: [push, pull_request]
jobs:
  quality:
    - ESLint
    - TypeScript
    - Unit tests
  security:
    - npm audit
    - Snyk scan
  build:
    - Next.js build
  test:
    - Playwright E2E
  deploy:
    - Vercel deployment
```

---

## Troubleshooting

### Common Issues

**1. Over-Engineering Static Sites**
```bash
# Problem: Using Next.js for simple landing page
# Solution: Switch to static HTML + Tailwind
# Benefit: No build process, direct browser opening
```

**2. Component Re-render Issues (React)**
```bash
# Problem: Unnecessary re-renders causing performance issues
# Solution: Use React.memo, useMemo, useCallback
# Agent: performance-monitoring-agent can identify these
```

**3. API Integration Errors**
```bash
# Problem: Failed API calls, no retry logic
# Solution: Use api-integration-specialist for robust integration
# Features: Retry logic, circuit breakers, error handling
```

**4. Accessibility Violations**
```bash
# Problem: WCAG compliance failures
# Solution: Run accessibility-agent continuously
# Fix: Semantic HTML, ARIA labels, keyboard navigation
```

**5. Docker Build Failures**
```bash
# Problem: Multi-stage builds failing
# Solution: Use devops-deployment-specialist
# Optimizations: Layer caching, build context optimization
```

---

## Testing

### Manual Development Test
```bash
# 1. Wireframe creation
Task(
  subagent_type="wireframe-creation-specialist",
  prompt="Create wireframes for SaaS dashboard with user management..."
)

# 2. Component development (parallel)
Task(subagent_type="ui-component-developer", prompt="Build navigation...")
Task(subagent_type="ui-component-developer", prompt="Build user table...")
Task(subagent_type="ui-component-developer", prompt="Build forms...")

# 3. Backend API
Task(
  subagent_type="backend-development-specialist",
  prompt="Create REST API with Prisma ORM for user management..."
)

# 4. Testing suite
Task(
  subagent_type="e2e-test-automator",
  prompt="Create Playwright tests for user management workflows..."
)

# 5. Deployment
Task(
  subagent_type="devops-deployment-specialist",
  prompt="Setup CI/CD pipeline with GitHub Actions and Vercel..."
)
```

---

## Performance Metrics

### Development Efficiency
- **Parallel Agent Execution**: 60-70% faster development
- **Component Reusability**: 50% reduction in duplicate code
- **Static-First Approach**: 80% of projects don't need frameworks
- **Automated Testing**: 90%+ test coverage achievable

### Quality Metrics
- **Core Web Vitals**: All metrics in "Good" range
- **Accessibility**: WCAG 2.1 Level AA minimum
- **Security**: Zero OWASP Top 10 vulnerabilities
- **Type Safety**: 100% TypeScript strict mode

### Deployment Efficiency
- **CI/CD Pipeline**: Automated end-to-end
- **Build Time**: <5 minutes for typical projects
- **Zero-Downtime Deployments**: Blue-green or canary
- **Rollback Time**: <2 minutes if needed

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture and technology principles
- **[../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md](../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md)** - Agent invocation patterns
- **[../../.claude/agents/frontend-architect-specialist.md](../../.claude/agents/frontend-architect-specialist.md)** - Frontend architecture agent
- **[../../.claude/agents/backend-development-specialist.md](../../.claude/agents/backend-development-specialist.md)** - Backend development agent

---

**This domain follows the Universal Agent Delegation Pattern with strong emphasis on the Principle of Appropriate Complexity. See main [CLAUDE.md](../../CLAUDE.md) for system-wide architecture principles.**
