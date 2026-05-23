---
description: Initialize a new application project with standardized file structure and memory integration
args:
  - name: app-name
    description: Name of the application (kebab-case)
    required: true
  - name: app-type
    description: Type of application (web-app, dashboard, landing-page, api-service, mobile-app)
    required: false
    default: web-app
  - name: tech-stack
    description: Technology stack (nextjs, static-html, nodejs-api, react-native)
    required: false
    default: nextjs
---

# Initialize Application Project

You are initializing a new application in the ORCHESTRAI ecosystem.

## Task Overview

Create a new application with:
1. Standardized file structure based on app type
2. Initial configuration files
3. Memory system integration for tracking development decisions
4. Documentation structure
5. Agent coordination setup

## Parameters Received

- **App Name**: {{app-name}}
- **App Type**: {{app-type | default: "web-app"}}
- **Tech Stack**: {{tech-stack | default: "nextjs"}}

## Execution Steps

### 1. Validate and Prepare

Check if the application already exists:
- Search for `{{app-name}}` in `applications/` directory
- Search ORCHESTRAI memory for existing entities with this name
- If exists, ask user if they want to:
  - Resume development
  - Create new version
  - Abort

### 2. Create Memory Entities FIRST

Before creating any files, establish memory entities:

```javascript
mcp__memory__create_entities([
  {
    name: "{{app-name}}",
    entityType: "Application",
    observations: [
      "Application type: {{app-type}}",
      "Tech stack: {{tech-stack}}",
      "Created: {{current-date}}",
      "Status: Initialization",
      "Purpose: [Ask user to describe the app purpose]"
    ]
  },
  {
    name: "{{app-name}} Architecture",
    entityType: "Architecture",
    observations: [
      "Architecture decisions will be tracked here",
      "Initial stack: {{tech-stack}}",
      "Deployment target: TBD"
    ]
  },
  {
    name: "{{app-name}} Development History",
    entityType: "Timeline",
    observations: [
      "{{current-date}}: Project initialized",
      "Next steps: Requirements gathering and planning"
    ]
  }
])

mcp__memory__create_relations([
  {
    from: "{{app-name}}",
    to: "{{app-name}} Architecture",
    relationType: "has-architecture"
  },
  {
    from: "{{app-name}}",
    to: "{{app-name}} Development History",
    relationType: "tracked-by"
  }
])
```

### 3. Create Application File Structure

Based on `{{tech-stack}}`, create appropriate structure:

#### For Next.js Applications (web-app, dashboard)

```
applications/{{app-name}}/
├── planning/
│   ├── requirements.md              # Product requirements
│   ├── architecture.md              # System architecture
│   ├── user-stories.md             # User stories and personas
│   ├── technical-decisions.md      # ADR (Architecture Decision Records)
│   └── api-design.md               # API endpoint design
│
├── design/
│   ├── wireframes/                 # UI/UX wireframes
│   ├── design-system/              # Component library, tokens
│   ├── mockups/                    # High-fidelity designs
│   └── assets/                     # Images, icons, logos
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── sitemap.ts
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── route.ts
│   ├── features/                   # Feature-based organization
│   │   └── README.md
│   ├── components/                 # Shared UI components
│   │   ├── ui/                     # Basic UI elements
│   │   └── layout/                 # Layout components
│   ├── providers/                  # Context providers
│   ├── hooks/                      # Shared React hooks
│   ├── lib/                        # Shared utilities
│   │   └── validators/
│   ├── server/                     # Server-only code
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── env.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── tokens.css
│   ├── types/
│   │   └── index.d.ts
│   ├── config/
│   │   └── constants.ts
│   └── orchestrai/                 # ORCHESTRAI integration
│       ├── memory-integration.ts   # Memory helpers
│       └── agent-hooks.ts          # Agent coordination
│
├── public/
│   ├── images/
│   ├── fonts/
│   ├── favicon.ico
│   └── robots.txt
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── performance/
│
├── deployment/
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── ci-cd/
│       └── github-actions.yml
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── CHANGELOG.md
│
├── .env.example
├── .env.local                      # Git-ignored
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

#### For Static HTML Applications (landing-page)

```
applications/{{app-name}}/
├── planning/
│   ├── requirements.md
│   ├── content-strategy.md
│   └── seo-strategy.md
├── design/
│   ├── wireframes/
│   └── assets/
├── src/
│   ├── index.html
│   ├── css/
│   │   ├── tailwind.css
│   │   └── custom.css
│   ├── js/
│   │   ├── main.js
│   │   └── components/
│   └── assets/
│       ├── images/
│       └── fonts/
├── docs/
│   └── README.md
├── package.json
├── tailwind.config.js
└── README.md
```

#### For Node.js API Services (api-service)

```
applications/{{app-name}}/
├── planning/
│   ├── api-design.md
│   ├── data-models.md
│   └── security-requirements.md
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── types/
│   └── orchestrai/
│       └── memory-integration.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
├── deployment/
│   ├── docker/
│   └── kubernetes/
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### 4. Generate Initial Configuration Files

Create these files with proper defaults:

**package.json**:
```json
{
  "name": "{{app-name}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

**.env.example**:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/{{app-name}}

# Redis Cache (separate from ORCHESTRAI)
REDIS_CACHE_URL=redis://localhost:6379/1

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# API Keys
# Add your API keys here
```

**.gitignore**:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Next.js
.next/
out/
build/
dist/

# Environment
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.turbo/
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5. Create ORCHESTRAI Integration Files

**src/orchestrai/memory-integration.ts**:
```typescript
/**
 * ORCHESTRAI Memory Integration
 *
 * This module provides helpers to document architectural decisions
 * and component relationships using the project CLAUDE.md.
 *
 * IMPORTANT: This is for DEVELOPMENT tracking, not application runtime data!
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ArchitectureDecision {
  component: string;
  decision: string;
  rationale: string;
  alternatives: string[];
  timestamp: string;
}

interface ComponentMetadata {
  name: string;
  path: string;
  purpose: string;
  dependencies: string[];
  relatedFeatures: string[];
}

/**
 * Document an architectural decision in ORCHESTRAI memory
 * Only runs in development environment
 */
export async function documentArchitectureDecision(decision: ArchitectureDecision) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`📝 Documenting decision: ${decision.decision}`);

  // Call ORCHESTRAI MCP memory server
  // This would typically be done through the Claude Code interface
  // For now, log to a file that agents can read

  const record = {
    type: 'architecture_decision',
    app: '{{app-name}}',
    ...decision,
  };

  // TODO: Integrate with MCP memory server when available in runtime
  console.log('Architecture Decision:', JSON.stringify(record, null, 2));
}

/**
 * Register a new component in ORCHESTRAI memory
 */
export async function registerComponent(metadata: ComponentMetadata) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`📦 Registering component: ${metadata.name}`);

  const record = {
    type: 'component_registration',
    app: '{{app-name}}',
    ...metadata,
    timestamp: new Date().toISOString(),
  };

  console.log('Component Registration:', JSON.stringify(record, null, 2));
}

/**
 * Record what worked well (for agent learning)
 */
export async function recordSuccess(success: {
  context: string;
  action: string;
  outcome: string;
  lessons: string[];
}) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`✅ Recording success: ${success.action}`);

  const record = {
    type: 'success_pattern',
    app: '{{app-name}}',
    ...success,
    timestamp: new Date().toISOString(),
  };

  console.log('Success Pattern:', JSON.stringify(record, null, 2));
}

/**
 * Record what didn't work (for agent learning)
 */
export async function recordFailure(failure: {
  context: string;
  attemptedAction: string;
  problem: string;
  resolution: string;
  lessons: string[];
}) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`❌ Recording failure lesson: ${failure.attemptedAction}`);

  const record = {
    type: 'failure_pattern',
    app: '{{app-name}}',
    ...failure,
    timestamp: new Date().toISOString(),
  };

  console.log('Failure Pattern:', JSON.stringify(record, null, 2));
}

/**
 * Query ORCHESTRAI memory for similar past decisions
 */
export async function queryPastDecisions(context: string): Promise<ArchitectureDecision[]> {
  if (process.env.NODE_ENV !== 'development') return [];

  console.log(`🔍 Querying past decisions for: ${context}`);

  // TODO: Integrate with MCP memory search when available in runtime
  return [];
}

// Export singleton instance
export const orchestraiMemory = {
  documentDecision: documentArchitectureDecision,
  registerComponent,
  recordSuccess,
  recordFailure,
  queryPastDecisions,
};
```

**src/orchestrai/agent-hooks.ts**:
```typescript
/**
 * Agent Coordination Hooks
 *
 * Provides callbacks for agent coordination during development
 */

interface AgentEvent {
  agent: string;
  action: string;
  context: Record<string, any>;
  timestamp: string;
}

/**
 * Called when an agent starts working on this application
 */
export function onAgentStart(event: AgentEvent) {
  console.log(`🤖 Agent ${event.agent} started: ${event.action}`);
}

/**
 * Called when an agent completes work on this application
 */
export function onAgentComplete(event: AgentEvent) {
  console.log(`✅ Agent ${event.agent} completed: ${event.action}`);
}

/**
 * Called when an agent encounters an error
 */
export function onAgentError(event: AgentEvent & { error: string }) {
  console.error(`❌ Agent ${event.agent} error: ${event.error}`);
}

export const agentHooks = {
  onStart: onAgentStart,
  onComplete: onAgentComplete,
  onError: onAgentError,
};
```

### 6. Create Initial Documentation

**README.md**:
```markdown
# {{app-name}}

> Created with ORCHESTRAI - Advanced Multi-Agent Development System

## Overview

[User to describe application purpose]

## Tech Stack

- **Type**: {{app-type}}
- **Framework**: {{tech-stack}}
- **Created**: {{current-date}}

## Getting Started

### Prerequisites

- Node.js 18+ (for Next.js apps)
- PostgreSQL (if using database)
- Redis (for caching)

### Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your values

# Run development server
npm run dev
\`\`\`

### Development

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run typecheck    # TypeScript validation
\`\`\`

## Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed structure explanation.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](docs/API.md) - API endpoints and usage
- [Development Guide](docs/DEVELOPMENT.md) - Developer setup and workflows
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions

## ORCHESTRAI Integration

This application tracks state in the project CLAUDE.md:
- Architecture decisions
- Component relationships
- Success/failure patterns
- Agent coordination

Memory helpers available in \`src/orchestrai/memory-integration.ts\`

## Memory Tracking

All architectural decisions are tracked in ORCHESTRAI memory:
- Entity: "{{app-name}}"
- Entity: "{{app-name}} Architecture"
- Entity: "{{app-name}} Development History"

Query memory: Search for "{{app-name}}" in ORCHESTRAI memory system

## License

[Specify license]
```

**docs/ARCHITECTURE.md**:
```markdown
# {{app-name}} Architecture

## Overview

[Architecture overview to be filled]

## Technology Decisions

### Why {{tech-stack}}?

[Document rationale - to be filled by planning agents]

## System Architecture

[Diagrams and detailed architecture - to be filled]

## Data Flow

[Data flow documentation - to be filled]

## Component Hierarchy

[Component structure - to be filled]

## Architecture Decision Records (ADR)

Architecture decisions are tracked in:
1. This document
2. Project CLAUDE.md
3. \`planning/technical-decisions.md\`

Query ORCHESTRAI memory with: "{{app-name}} architecture decisions"
```

**docs/DEVELOPMENT.md**:
```markdown
# Development Guide - {{app-name}}

## Setup

[Development setup instructions]

## Agent-Assisted Development

This project uses ORCHESTRAI agents for development:

### Planning Phase
\`\`\`bash
# Use these agents for planning
- client-icp-analyst
- wireframe-creation-specialist
- frontend-architect-specialist
\`\`\`

### Development Phase
\`\`\`bash
# Use these agents for implementation
- ui-component-developer
- backend-development-specialist
- api-integration-specialist
\`\`\`

### Testing Phase
\`\`\`bash
# Use these agents for QA
- unit-test-generator
- e2e-test-automator
- accessibility-validator
\`\`\`

## Memory Integration

Document decisions during development:

\`\`\`typescript
import { orchestraiMemory } from '@/orchestrai/memory-integration';

// Document decision
await orchestraiMemory.documentDecision({
  component: 'Authentication',
  decision: 'Using NextAuth.js',
  rationale: 'Faster implementation, battle-tested',
  alternatives: ['Custom JWT', 'Auth0', 'Clerk'],
  timestamp: new Date().toISOString()
});

// Record success pattern
await orchestraiMemory.recordSuccess({
  context: 'User authentication',
  action: 'Implemented NextAuth with credentials provider',
  outcome: 'Working auth in 2 hours',
  lessons: ['NextAuth documentation is excellent', 'Credentials provider easiest for MVP']
});

// Record failure lesson
await orchestraiMemory.recordFailure({
  context: 'Real-time updates',
  attemptedAction: 'Used polling instead of WebSockets',
  problem: 'Too many requests, poor performance',
  resolution: 'Migrated to Socket.io',
  lessons: ['WebSockets better for <1s updates', 'Polling acceptable for >30s intervals']
});
\`\`\`

## Coding Standards

[Coding standards to be defined]

## Git Workflow

[Git workflow to be defined]
```

### 7. Update ORCHESTRAI Memory with Created Structure

```javascript
mcp__memory__add_observations({
  observations: [{
    entityName: "{{app-name}}",
    contents: [
      "File structure created successfully",
      "Configuration files initialized",
      "Memory integration helpers added",
      "Documentation structure established",
      "Status: Ready for planning phase",
      "Next step: Define requirements in planning/requirements.md"
    ]
  }]
})

mcp__memory__add_observations({
  observations: [{
    entityName: "{{app-name}} Development History",
    contents: [
      "{{current-date}}: Project structure initialized",
      "File tree created based on {{tech-stack}} best practices",
      "ORCHESTRAI memory integration configured",
      "Ready for agent-assisted development"
    ]
  }]
})
```

### 8. Create Initial Planning Files

**planning/requirements.md**:
```markdown
# Requirements - {{app-name}}

## Product Vision

[To be filled by user and planning agents]

## User Personas

[To be filled by client-icp-analyst]

## Functional Requirements

### Must Have
- [ ] Requirement 1
- [ ] Requirement 2

### Should Have
- [ ] Requirement 3

### Could Have
- [ ] Requirement 4

## Non-Functional Requirements

### Performance
- [ ] Page load < 3s
- [ ] API response < 500ms

### Security
- [ ] Authentication required
- [ ] Data encryption at rest

### Scalability
- [ ] Support 10k concurrent users

## Success Metrics

[To be filled by data-analytics-specialist]
```

**planning/technical-decisions.md**:
```markdown
# Technical Decisions - {{app-name}}

## Architecture Decision Records (ADR)

### ADR-001: Technology Stack

**Date**: {{current-date}}
**Status**: Accepted
**Context**: Choosing primary technology stack
**Decision**: {{tech-stack}}
**Rationale**: [To be filled]
**Consequences**: [To be filled]
**Alternatives Considered**: [To be filled]

---

### ADR-002: [Next Decision]

[To be filled as decisions are made]

---

## Decision Log

All decisions are tracked in the project CLAUDE.md.
Query: "{{app-name}} architecture decisions"
```

### 9. Output Summary

After completing initialization, output:

```
✅ Application "{{app-name}}" initialized successfully!

📁 Location: /Users/kris/CLAUDEtools/ORCHESTRAI/applications/{{app-name}}/

🧠 Memory Entities Created:
   - {{app-name}} (Application)
   - {{app-name}} Architecture
   - {{app-name}} Development History

📋 Next Steps:

1. Define requirements:
   cd applications/{{app-name}}/planning
   # Edit requirements.md with product vision

2. Run planning agents:
   Task(subagent_type="client-icp-analyst", prompt="Analyze target users for {{app-name}}")
   Task(subagent_type="wireframe-creation-specialist", prompt="Create wireframes for {{app-name}}")

3. Design architecture:
   Task(subagent_type="frontend-architect-specialist", prompt="Design {{app-name}} frontend architecture")
   Task(subagent_type="api-architect", prompt="Design {{app-name}} API architecture")

4. Begin development:
   npm install
   npm run dev

📚 Documentation:
   - README: applications/{{app-name}}/README.md
   - Architecture: applications/{{app-name}}/docs/ARCHITECTURE.md
   - Development: applications/{{app-name}}/docs/DEVELOPMENT.md

🧩 ORCHESTRAI Integration:
   - Memory helpers: src/orchestrai/memory-integration.ts
   - Agent hooks: src/orchestrai/agent-hooks.ts

💾 Query Development History:
   Search ORCHESTRAI memory for: "{{app-name}}"
```

### 10. Prompt User for Next Action

Ask the user:

```
🎯 What would you like to do next?

1. Define requirements (I'll help you fill in planning/requirements.md)
2. Run planning agents (User research, wireframes, architecture)
3. Start coding immediately (if requirements are clear)
4. Set up development environment (install dependencies, configure tools)

Choose 1-4 or describe what you want to work on.
```

## Important Notes

### Memory-First Approach
- Always create memory entities BEFORE creating files
- Agents can query memory to understand project context
- Each significant decision should be documented in memory

### File Structure Flexibility
- Adjust structure based on app-type and tech-stack
- User can customize after initialization
- Structure follows industry best practices

### Agent Coordination
- Memory system enables agents to build on each other's work
- Each agent can query what previous agents decided
- Reduces redundant work and conflicting approaches

### Learning System
- Success/failure patterns stored in memory
- Future agents learn from past projects
- ORCHESTRAI becomes progressively smarter

---

**Command Created**: Use `/init-app app-name --app-type=web-app --tech-stack=nextjs`
