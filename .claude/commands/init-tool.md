---
description: Initialize a new reusable tool/utility for agents to use across projects
args:
  - name: tool-name
    description: Name of the tool (kebab-case)
    required: true
  - name: tool-type
    description: Type of tool (npm-package, cli-tool, api-wrapper, data-processor, ui-library)
    required: false
    default: npm-package
  - name: language
    description: Primary language (typescript, javascript, python, rust)
    required: false
    default: typescript
---

# Initialize Reusable Tool

You are creating a reusable tool/utility that agents can use across multiple applications and projects.

## Task Overview

Create a new tool with:
1. Standardized structure based on tool type
2. Memory integration for tracking usage and effectiveness
3. Comprehensive documentation
4. Testing infrastructure
5. Publishing/distribution setup

## Parameters Received

- **Tool Name**: {{tool-name}}
- **Tool Type**: {{tool-type | default: "npm-package"}}
- **Language**: {{language | default: "typescript"}}

## Key Difference: Tools vs Applications

**Tools** = Reusable utilities used BY applications
**Applications** = End-user software products

Example:
- **Tool**: `@orchestrai/auth-helpers` (used by many apps)
- **Application**: `quartziq-dashboard` (uses auth-helpers)

## Execution Steps

### 1. Validate and Prepare

Check if tool already exists:
- Search for `{{tool-name}}` in `tools/` directory
- Search ORCHESTRAI memory for existing tool entities
- If exists, ask user:
  - Update existing tool
  - Create new version
  - Abort

### 2. Create Memory Entities FIRST

Establish tool metadata in memory:

```javascript
mcp__memory__create_entities([
  {
    name: "{{tool-name}}",
    entityType: "Tool",
    observations: [
      "Tool type: {{tool-type}}",
      "Language: {{language}}",
      "Created: {{current-date}}",
      "Status: Initialization",
      "Purpose: [Ask user to describe tool purpose]"
    ]
  },
  {
    name: "{{tool-name}} Usage Patterns",
    entityType: "Analytics",
    observations: [
      "Usage tracking will be recorded here",
      "Applications using this tool will be listed",
      "Performance metrics will be tracked"
    ]
  },
  {
    name: "{{tool-name}} Effectiveness Log",
    entityType: "Learning",
    observations: [
      "Success cases: TBD",
      "Failure cases: TBD",
      "Improvement suggestions: TBD"
    ]
  },
  {
    name: "{{tool-name}} Development History",
    entityType: "Timeline",
    observations: [
      "{{current-date}}: Tool initialized",
      "Next steps: Define API and implement core functionality"
    ]
  }
])

mcp__memory__create_relations([
  {
    from: "{{tool-name}}",
    to: "{{tool-name}} Usage Patterns",
    relationType: "tracks-usage"
  },
  {
    from: "{{tool-name}}",
    to: "{{tool-name}} Effectiveness Log",
    relationType: "learns-from"
  },
  {
    from: "{{tool-name}}",
    to: "{{tool-name}} Development History",
    relationType: "documented-by"
  }
])
```

### 3. Create Tool File Structure

Based on `{{tool-type}}` and `{{language}}`, create appropriate structure:

#### For NPM Package (npm-package)

```
tools/{{tool-name}}/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── core/                       # Core functionality
│   │   └── README.md
│   ├── utils/                      # Helper utilities
│   │   └── README.md
│   ├── types/                      # TypeScript types
│   │   └── index.d.ts
│   └── orchestrai/                 # ORCHESTRAI integration
│       ├── usage-tracker.ts        # Track tool usage in memory
│       └── effectiveness-logger.ts # Log success/failure patterns
│
├── tests/
│   ├── unit/                       # Unit tests
│   │   └── core.test.ts
│   ├── integration/                # Integration tests
│   │   └── integration.test.ts
│   └── fixtures/                   # Test data
│       └── README.md
│
├── examples/                       # Usage examples
│   ├── basic-usage.ts
│   ├── advanced-usage.ts
│   └── README.md
│
├── docs/
│   ├── README.md                   # Main documentation
│   ├── API.md                      # API reference
│   ├── GUIDE.md                    # Usage guide
│   ├── CONTRIBUTING.md             # Contribution guidelines
│   └── CHANGELOG.md                # Version history
│
├── .github/
│   └── workflows/
│       ├── test.yml                # CI testing
│       ├── publish.yml             # NPM publishing
│       └── release.yml             # Release automation
│
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── .npmignore
├── LICENSE
└── README.md
```

#### For CLI Tool (cli-tool)

```
tools/{{tool-name}}/
├── src/
│   ├── cli.ts                      # CLI entry point
│   ├── commands/                   # CLI commands
│   │   ├── init.ts
│   │   ├── build.ts
│   │   └── deploy.ts
│   ├── core/                       # Core logic
│   ├── utils/                      # Utilities
│   └── orchestrai/                 # Memory integration
│       └── usage-tracker.ts
│
├── bin/
│   └── {{tool-name}}              # Executable script
│
├── tests/
│   ├── commands/                   # Command tests
│   └── e2e/                        # End-to-end tests
│
├── examples/
│   └── README.md
│
├── docs/
│   ├── README.md
│   ├── COMMANDS.md                 # CLI command reference
│   └── GUIDE.md
│
└── [config files]
```

#### For API Wrapper (api-wrapper)

```
tools/{{tool-name}}/
├── src/
│   ├── index.ts                    # Main client
│   ├── client/                     # HTTP client setup
│   │   ├── base.ts
│   │   └── config.ts
│   ├── resources/                  # API resources
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   └── auth.ts
│   ├── types/                      # Type definitions
│   │   ├── requests.ts
│   │   └── responses.ts
│   ├── utils/                      # Helper utilities
│   │   ├── rate-limiter.ts
│   │   └── retry.ts
│   └── orchestrai/
│       ├── usage-tracker.ts        # Track API usage
│       └── performance-logger.ts   # Log API performance
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── mocks/                      # Mock API responses
│
├── examples/
│   ├── authentication.ts
│   ├── crud-operations.ts
│   └── advanced-queries.ts
│
├── docs/
│   ├── README.md
│   ├── API-REFERENCE.md
│   ├── AUTHENTICATION.md
│   └── RATE-LIMITING.md
│
└── [config files]
```

#### For Data Processor (data-processor)

```
tools/{{tool-name}}/
├── src/
│   ├── index.ts                    # Main processor
│   ├── processors/                 # Data processors
│   │   ├── transform.ts
│   │   ├── validate.ts
│   │   └── aggregate.ts
│   ├── parsers/                    # Data parsers
│   │   ├── json.ts
│   │   ├── csv.ts
│   │   └── xml.ts
│   ├── validators/                 # Data validators
│   ├── types/                      # Type definitions
│   └── orchestrai/
│       ├── usage-tracker.ts
│       └── performance-logger.ts   # Track processing speed
│
├── tests/
│   ├── processors/
│   ├── parsers/
│   └── fixtures/                   # Test data files
│
├── examples/
│   ├── csv-processing.ts
│   ├── json-transformation.ts
│   └── batch-processing.ts
│
├── docs/
│   ├── README.md
│   ├── PROCESSORS.md
│   ├── PARSERS.md
│   └── PERFORMANCE.md
│
└── [config files]
```

#### For UI Library (ui-library)

```
tools/{{tool-name}}/
├── src/
│   ├── index.ts                    # Component exports
│   ├── components/                 # UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Input/
│   │   └── Card/
│   ├── hooks/                      # React hooks
│   ├── utils/                      # Utilities
│   ├── styles/                     # Shared styles
│   │   ├── tokens.css
│   │   └── globals.css
│   ├── types/                      # Type definitions
│   └── orchestrai/
│       └── usage-tracker.ts        # Track component usage
│
├── .storybook/                     # Storybook config
│   ├── main.ts
│   └── preview.ts
│
├── tests/
│   ├── components/
│   └── visual/                     # Visual regression tests
│
├── examples/
│   └── demo-app/                   # Demo application
│
├── docs/
│   ├── README.md
│   ├── COMPONENTS.md
│   ├── THEMING.md
│   └── ACCESSIBILITY.md
│
└── [config files]
```

### 4. Generate Core Files

Create these files with proper configuration:

**package.json** (TypeScript NPM Package):
```json
{
  "name": "@orchestrai/{{tool-name}}",
  "version": "0.1.0",
  "description": "[User to provide description]",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": [
    "orchestrai",
    "tool",
    "utility",
    "{{tool-type}}"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "peerDependencies": {}
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**tsup.config.ts** (Build tool):
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
```

**.gitignore**:
```
# Dependencies
node_modules/

# Build output
dist/
build/
*.tsbuildinfo

# Testing
coverage/
.nyc_output/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Misc
.turbo/
```

**.npmignore**:
```
# Source files
src/
tests/
examples/

# Config files
tsconfig.json
tsup.config.ts
.eslintrc.cjs
.prettierrc

# Development
.github/
.vscode/
.git/
*.test.ts
*.spec.ts

# Docs (keep README, but not detailed docs)
docs/

# Misc
.DS_Store
*.log
```

### 5. Create ORCHESTRAI Integration Files

**src/orchestrai/usage-tracker.ts**:
```typescript
/**
 * Tool Usage Tracker
 *
 * Tracks when and how this tool is used across applications.
 * Helps agents learn which tools are most effective.
 */

interface ToolUsage {
  application: string;
  feature: string;
  method: string;
  timestamp: string;
  success: boolean;
  duration?: number;
}

interface ToolEffectiveness {
  toolName: string;
  usageCount: number;
  successRate: number;
  avgDuration: number;
  commonUseCases: string[];
  knownIssues: string[];
}

/**
 * Track tool usage in ORCHESTRAI memory
 */
export async function trackUsage(usage: ToolUsage) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`📊 Tool usage tracked: ${usage.method} in ${usage.application}`);

  // In development, this integrates with ORCHESTRAI memory MCP
  const record = {
    type: 'tool_usage',
    tool: '{{tool-name}}',
    ...usage,
  };

  // TODO: Integrate with MCP memory server
  console.log('Usage Record:', JSON.stringify(record, null, 2));
}

/**
 * Record successful tool usage (what worked)
 */
export async function recordSuccess(success: {
  application: string;
  useCase: string;
  implementation: string;
  outcome: string;
  performanceNotes?: string;
}) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`✅ Success recorded: ${success.useCase}`);

  const record = {
    type: 'tool_success',
    tool: '{{tool-name}}',
    ...success,
    timestamp: new Date().toISOString(),
  };

  console.log('Success Record:', JSON.stringify(record, null, 2));
}

/**
 * Record tool usage failure (what didn't work)
 */
export async function recordFailure(failure: {
  application: string;
  attemptedUseCase: string;
  problem: string;
  workaround?: string;
  suggestedImprovement: string;
}) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`❌ Failure recorded: ${failure.attemptedUseCase}`);

  const record = {
    type: 'tool_failure',
    tool: '{{tool-name}}',
    ...failure,
    timestamp: new Date().toISOString(),
  };

  console.log('Failure Record:', JSON.stringify(record, null, 2));
}

/**
 * Query tool effectiveness from ORCHESTRAI memory
 */
export async function queryEffectiveness(): Promise<ToolEffectiveness | null> {
  if (process.env.NODE_ENV !== 'development') return null;

  console.log(`🔍 Querying effectiveness for {{tool-name}}`);

  // TODO: Integrate with MCP memory search
  return null;
}

// Export singleton
export const usageTracker = {
  track: trackUsage,
  recordSuccess,
  recordFailure,
  queryEffectiveness,
};
```

**src/orchestrai/effectiveness-logger.ts**:
```typescript
/**
 * Tool Effectiveness Logger
 *
 * Logs performance metrics and effectiveness patterns
 * for agent learning and optimization.
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  memoryUsage?: number;
  inputSize?: number;
  outputSize?: number;
}

interface EffectivenessPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  avgDuration: number;
  notes: string[];
}

/**
 * Log performance metrics
 */
export async function logPerformance(metric: PerformanceMetric) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`⚡ Performance: ${metric.operation} took ${metric.duration}ms`);

  const record = {
    type: 'performance_metric',
    tool: '{{tool-name}}',
    ...metric,
    timestamp: new Date().toISOString(),
  };

  console.log('Performance Record:', JSON.stringify(record, null, 2));
}

/**
 * Log effectiveness pattern
 */
export async function logPattern(pattern: EffectivenessPattern) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`📈 Pattern identified: ${pattern.pattern}`);

  const record = {
    type: 'effectiveness_pattern',
    tool: '{{tool-name}}',
    ...pattern,
    timestamp: new Date().toISOString(),
  };

  console.log('Pattern Record:', JSON.stringify(record, null, 2));
}

/**
 * Log optimization suggestion
 */
export async function logOptimization(optimization: {
  area: string;
  currentPerformance: string;
  suggestedImprovement: string;
  expectedImpact: string;
}) {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`💡 Optimization suggested: ${optimization.area}`);

  const record = {
    type: 'optimization_suggestion',
    tool: '{{tool-name}}',
    ...optimization,
    timestamp: new Date().toISOString(),
  };

  console.log('Optimization Record:', JSON.stringify(record, null, 2));
}

// Export singleton
export const effectivenessLogger = {
  logPerformance,
  logPattern,
  logOptimization,
};
```

### 6. Create Starter Code

**src/index.ts** (NPM Package Example):
```typescript
/**
 * {{tool-name}}
 *
 * [Description to be provided]
 */

import { usageTracker } from './orchestrai/usage-tracker';

export interface {{tool-name}}Options {
  // Configuration options
}

export class {{tool-name}} {
  private options: {{tool-name}}Options;

  constructor(options: {{tool-name}}Options = {}) {
    this.options = options;
  }

  /**
   * Main method - implement your tool's core functionality
   */
  public async execute(input: any): Promise<any> {
    const startTime = performance.now();

    try {
      // Track usage
      await usageTracker.track({
        application: 'unknown',  // Will be filled by consuming app
        feature: 'execute',
        method: 'execute',
        timestamp: new Date().toISOString(),
        success: true,
        duration: 0,
      });

      // TODO: Implement core functionality

      const duration = performance.now() - startTime;

      // Record success
      await usageTracker.recordSuccess({
        application: 'unknown',
        useCase: 'execute operation',
        implementation: 'core execute method',
        outcome: 'successful execution',
        performanceNotes: `Completed in ${duration.toFixed(2)}ms`,
      });

      return null;  // Replace with actual result
    } catch (error) {
      // Record failure
      await usageTracker.recordFailure({
        application: 'unknown',
        attemptedUseCase: 'execute operation',
        problem: error instanceof Error ? error.message : 'Unknown error',
        suggestedImprovement: 'Add error handling and validation',
      });

      throw error;
    }
  }
}

// Export default instance
export default {{tool-name}};
```

### 7. Create Documentation Files

**README.md**:
```markdown
# @orchestrai/{{tool-name}}

> [Brief description of tool]

Part of the ORCHESTRAI ecosystem - tools that agents use to build better applications.

## Installation

\`\`\`bash
npm install @orchestrai/{{tool-name}}
\`\`\`

## Quick Start

\`\`\`typescript
import { {{tool-name}} } from '@orchestrai/{{tool-name}}';

const tool = new {{tool-name}}();
const result = await tool.execute(input);
\`\`\`

## Features

- Feature 1
- Feature 2
- ORCHESTRAI memory integration
- Usage tracking and learning

## Documentation

- [API Reference](docs/API.md)
- [Usage Guide](docs/GUIDE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)

## ORCHESTRAI Integration

This tool tracks its usage in ORCHESTRAI's crystalline memory system:

\`\`\`typescript
import { usageTracker } from '@orchestrai/{{tool-name}}/orchestrai';

// Track usage
await usageTracker.track({
  application: 'my-app',
  feature: 'data-processing',
  method: 'execute',
  timestamp: new Date().toISOString(),
  success: true,
  duration: 150,
});

// Record what worked
await usageTracker.recordSuccess({
  application: 'my-app',
  useCase: 'CSV processing',
  implementation: 'Used streaming parser',
  outcome: 'Processed 1M rows in 30s',
  performanceNotes: 'Memory usage stayed under 100MB',
});
\`\`\`

## Learning System

This tool participates in ORCHESTRAI's learning system:
- Usage patterns stored in memory
- Success/failure cases documented
- Performance metrics tracked
- Agents learn optimal usage patterns

Query effectiveness:
\`\`\`
Search ORCHESTRAI memory for: "{{tool-name}} effectiveness"
\`\`\`

## License

MIT
```

**docs/API.md**:
```markdown
# API Reference - {{tool-name}}

## Classes

### {{tool-name}}

Main class for [description].

#### Constructor

\`\`\`typescript
new {{tool-name}}(options?: {{tool-name}}Options)
\`\`\`

#### Methods

##### execute(input: any): Promise<any>

[Method description]

**Parameters:**
- \`input\`: [Description]

**Returns:**
- Promise<any>: [Description]

**Example:**
\`\`\`typescript
const result = await tool.execute(data);
\`\`\`

## Functions

[Document exported functions]

## Types

[Document exported types]

## ORCHESTRAI Integration API

### usageTracker

Track tool usage in ORCHESTRAI memory.

[Document tracking methods]
```

**docs/GUIDE.md**:
```markdown
# Usage Guide - {{tool-name}}

## Overview

[Detailed usage guide]

## Basic Usage

[Examples]

## Advanced Usage

[Advanced examples]

## Best Practices

[Best practices for using this tool]

## Common Patterns

[Common usage patterns from ORCHESTRAI memory]

## Performance Tips

[Performance optimization tips]

## Troubleshooting

[Common issues and solutions]
```

### 8. Update ORCHESTRAI Memory

```javascript
mcp__memory__add_observations({
  observations: [{
    entityName: "{{tool-name}}",
    contents: [
      "Tool structure created successfully",
      "Core functionality scaffolded",
      "ORCHESTRAI integration configured",
      "Documentation structure established",
      "Status: Ready for implementation",
      "Next step: Implement core functionality in src/"
    ]
  }]
})

mcp__memory__add_observations({
  observations: [{
    entityName: "{{tool-name}} Development History",
    contents: [
      "{{current-date}}: Tool initialized",
      "Structure based on {{tool-type}} pattern",
      "Language: {{language}}",
      "Ready for development"
    ]
  }]
})

// Create initial effectiveness baseline
mcp__memory__add_observations({
  observations: [{
    entityName: "{{tool-name}} Effectiveness Log",
    contents: [
      "Initial baseline: No usage data yet",
      "Tracking will begin when tool is used in applications",
      "Agents will learn optimal usage patterns over time"
    ]
  }]
})
```

### 9. Create Example Files

**examples/basic-usage.ts**:
```typescript
/**
 * Basic usage example for {{tool-name}}
 */

import { {{tool-name}} } from '../src';

async function basicExample() {
  console.log('Basic usage example for {{tool-name}}');

  // Initialize tool
  const tool = new {{tool-name}}();

  // Use tool
  const result = await tool.execute({ /* input */ });

  console.log('Result:', result);
}

// Run if called directly
if (require.main === module) {
  basicExample()
    .then(() => console.log('✅ Example completed'))
    .catch((error) => console.error('❌ Error:', error));
}

export default basicExample;
```

**examples/README.md**:
```markdown
# Examples - {{tool-name}}

## Running Examples

\`\`\`bash
# Basic usage
npm run example:basic

# Advanced usage
npm run example:advanced
\`\`\`

## Examples List

- [basic-usage.ts](./basic-usage.ts) - Basic usage patterns
- [advanced-usage.ts](./advanced-usage.ts) - Advanced features

## Learning from Examples

Examples also track usage in ORCHESTRAI memory, helping agents learn:
- Common usage patterns
- Performance characteristics
- Best practices
\`\`\`
```

### 10. Output Summary

After completing initialization, output:

```
✅ Tool "{{tool-name}}" initialized successfully!

📁 Location: /Users/kris/CLAUDEtools/ORCHESTRAI/tools/{{tool-name}}/

🧠 Memory Entities Created:
   - {{tool-name}} (Tool)
   - {{tool-name}} Usage Patterns (Analytics)
   - {{tool-name}} Effectiveness Log (Learning)
   - {{tool-name}} Development History (Timeline)

🛠️ Tool Type: {{tool-type}}
💻 Language: {{language}}

📋 Next Steps:

1. Install dependencies:
   cd tools/{{tool-name}}
   npm install

2. Implement core functionality:
   Edit src/index.ts

3. Write tests:
   npm test

4. Build:
   npm run build

5. Test in an application:
   # In an application's package.json
   "dependencies": {
     "@orchestrai/{{tool-name}}": "file:../../tools/{{tool-name}}"
   }

📚 Documentation:
   - README: tools/{{tool-name}}/README.md
   - API: tools/{{tool-name}}/docs/API.md
   - Guide: tools/{{tool-name}}/docs/GUIDE.md

🧩 ORCHESTRAI Integration:
   - Usage tracker: src/orchestrai/usage-tracker.ts
   - Effectiveness logger: src/orchestrai/effectiveness-logger.ts

💾 Track Usage in Applications:
   \`\`\`typescript
   import { usageTracker } from '@orchestrai/{{tool-name}}/orchestrai';
   await usageTracker.track({...});
   \`\`\`

🔍 Query Tool Effectiveness:
   Search ORCHESTRAI memory for: "{{tool-name}} effectiveness"
```

### 11. Prompt User for Next Action

Ask the user:

```
🎯 What would you like to do next?

1. Implement core functionality (I'll help you build the main features)
2. Write tests (Set up testing infrastructure)
3. Create examples (Build comprehensive usage examples)
4. Start using in an application (Link tool to an app)
5. Describe the tool's purpose (Define what this tool should do)

Choose 1-5 or describe what you want to work on.
```

## Important Notes

### Memory-First Approach
- Create memory entities before files
- Track usage from day one
- Document successes and failures
- Enable agent learning

### Tool vs Application
- **Tool**: Reusable utility used BY applications
- **Application**: End product that uses tools
- Tools should be framework-agnostic when possible
- Tools should have minimal dependencies

### Learning System Integration
- Every tool usage is tracked
- Success/failure patterns documented
- Performance metrics recorded
- Agents learn optimal tool usage

### Publishing Strategy
- Use @orchestrai scope for organization
- Publish to npm when stable
- Use semantic versioning
- Document breaking changes

---

**Command Created**: Use `/init-tool tool-name --tool-type=npm-package --language=typescript`
