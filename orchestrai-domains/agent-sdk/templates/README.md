# Agent SDK Templates

This directory contains project templates and configuration templates for Agent SDK applications.

## Template Types

### Language Templates

#### typescript-sdk-template.json
- TypeScript project configuration
- TSConfig strict mode settings
- Jest test configuration
- Package.json structure
- ESLint and Prettier rules

#### python-sdk-template.json
- Python project structure
- Type hint requirements
- Pytest configuration
- Setup.py/pyproject.toml
- Pylint and Black settings

## Template Structure

```json
{
  "language": "typescript",
  "agentType": "business",
  "structure": {
    "src/": {
      "agents/": "Agent implementations",
      "orchestration/": "Coordination logic",
      "memory/": "Memory integration",
      "utils/": "Utility functions"
    },
    "tests/": "Test suite (90%+ coverage)",
    "examples/": "Working example applications",
    "docs/": "API reference and guides"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

## Usage

Templates are referenced by the `agent-sdk-developer` agent during implementation stages to ensure consistency and best practices.

## Status

- ⏳ **Phase 7**: Template definition (pending)
- 📋 **Based on**: Official Agent SDK scaffolding patterns
