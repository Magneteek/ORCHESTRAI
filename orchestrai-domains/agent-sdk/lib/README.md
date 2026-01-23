# Agent SDK Libraries

This directory contains shared utility libraries for Agent SDK domain operations.

## Planned Libraries

### sdk-validator.js
- Validates Agent SDK project structure
- Checks Agent SDK best practices compliance
- Type safety validation
- Test coverage verification

### sdk-scaffolder.js
- Automates `/new-sdk-app` CLI execution
- Project initialization helpers
- Dependency installation automation
- Configuration file generation

## Usage Pattern

```javascript
const { validateSDKStructure } = require('./sdk-validator');
const { scaffoldSDKProject } = require('./sdk-scaffolder');

// Validation
const validation = await validateSDKStructure(projectPath, language);
if (!validation.passed) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}

// Scaffolding
const project = await scaffoldSDKProject({
  name: 'customer-support-agent',
  language: 'typescript',
  agentType: 'business'
});
```

## Status

- ⏳ **Phase 4**: Library implementation (pending)
- 📋 **Dependencies**: Follows agent-sdk-developer patterns
