# Agent SDK Domain

## Domain Overview

The Agent SDK Domain provides standalone agent application development capabilities using Anthropic's official Agent SDK framework. This domain creates production-ready, deployable agent applications as client deliverables.

**Domain Focus**: Standalone agent products, SDK architecture, comprehensive documentation, and production deployment

---

## Specialized Agents

This domain leverages the following specialized Claude Code agents via the **Universal Agent Delegation Pattern**:

### Development Agents
- **`agent-sdk-architect`** - SDK architecture design, module structure, API surface
- **`agent-sdk-developer`** - SDK implementation following Agent SDK best practices
- **`agent-sdk-documentation-specialist`** - API reference, guides, integration docs

### Quality & Deployment Agents
- **`agent-sdk-integration-tester`** - Testing, Agent SDK verifier integration
- **`agent-sdk-packager`** - NPM/PyPI packaging, distribution preparation

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Agent SDK Workflows

### 1. Standalone Agent Application Development

**Hybrid Delegation Pattern** (Complete SDK deliverable - NEW applications)

```
orchestrai-master-coordinator
  ↓
POST /agent-sdk/create → agent-sdk-domain-hub.js
  ↓
Infrastructure Setup:
  - Create project structure
  - Execute /new-sdk-app scaffolding
  - Initialize crystalline memory
  ↓
Return Delegation Instructions → Task tool
  ↓
agent-sdk-deliverable-pipeline → Complete Implementation
  ↓
Deliverables saved to: /projects/[uuid]/deliverables/agent-sdk/
```

**Pipeline Duration**: ~155 minutes (6 stages with parallel optimization)

### 2. Agent Packaging for Distribution

**Hybrid Delegation Pattern** (Package EXISTING ORCHESTRAI agents as standalone SDK apps)

```
orchestrai-master-coordinator
  ↓
POST /agent-sdk/package → agent-sdk-packaging-pipeline.js
  ↓
Stage 1: Requirements Analysis (20 min)
  - Analyze source agent capabilities
  - Identify MCP server requirements
  - Define target market and pricing
  ↓
Stage 2: SDK Scaffolding (15 min)
  - Create TypeScript/Python project structure
  - Configure MCP integration
  - Set up development environment
  ↓
Stage 3: Agent Translation (60 min)
  - Transform agent logic to SDK format
  - Implement MCP tool integration
  - Preserve agent behavior and capabilities
  ↓
Stage 4: MCP Integration (30 min)
  - Configure required MCP servers
  - Set up optional MCP servers
  - Test MCP connections
  ↓
Stage 5: Testing & Validation (25 min)
  - Run agent SDK verifiers
  - Execute integration tests
  - Validate 90%+ test coverage
  ↓
Stage 6: Documentation (20 min)
  - Generate client README
  - Create API reference
  - Write deployment guide
  - Write quick start guide
  ↓
Stage 7: Distribution Packaging (10 min)
  - Configure NPM/PyPI package
  - Set up license and metadata
  - Generate release notes
  ↓
Deliverables saved to: /projects/[client-uuid]/deliverables/agent-sdk/[agent-name]/
```

**Pipeline Duration**: ~180 minutes (7 sequential stages)

**Tier 1 Agents for Packaging**:
- `content-writer-specialist` → ContentWriter Pro ($15K-$25K implementation)
- `seo-competitor-analysis` → SEO Competitor Intelligence ($20K-$35K implementation)
- `healthcare-content-specialist` → Healthcare Content Specialist ($25K-$40K implementation)
- `cold-email-copywriter` → Cold Email Outreach Agent ($15K-$25K implementation)

### 3. Direct Agent Invocation (Component-Level)

**Quick Architecture Design**
```
Task tool → agent-sdk-architect → Architecture Specification
```

**Use When**: Need architecture review without full implementation

**Quick Implementation**
```
Task tool → agent-sdk-developer → SDK Code
```

**Use When**: Have existing architecture, need implementation only

---

## Integration with Universal Agent Pattern

All Agent SDK agents follow the **Universal Agent Delegation Pattern** documented in [../../CLAUDE.md](../../CLAUDE.md):

### Direct Invocation Pattern
```javascript
// For single-agent tasks
Task(
  subagent_type="agent-sdk-architect",
  prompt="Design SDK architecture for customer support chatbot..."
)
```

### Hybrid Delegation Pattern
```javascript
// For complete deliverables
orchestrai-master-coordinator → Domain Hub API → Pipeline → Agents
```

### Parallel Execution Pattern
```javascript
// Stage 5 optimization (33% faster)
Promise.all([
  // Testing
  coordinationPatterns.executeTask({ agentType: 'agent-sdk-integration-tester', ... }),
  // Examples
  coordinationPatterns.executeTask({ agentType: 'agent-sdk-developer', ... })
])
```

---

## Agent SDK Deliverable Pipeline

### Pipeline Architecture (155 minutes total)

**Stage 1: Requirements & Architecture (20 min)**
- Agent: `agent-sdk-architect`
- Outputs: Architecture spec, module design, API interfaces
- Quality Gate: Architecture completeness (blocking)

**Stage 2: SDK Scaffolding (15 min)**
- Agent: `agent-sdk-developer`
- Action: Execute `/new-sdk-app` CLI command
- Outputs: Project structure, dependencies installed
- Quality Gate: Project structure validation (blocking)

**Stage 3: Core Implementation (40 min)**
- Agent: `agent-sdk-developer`
- Outputs: Agents, orchestration, memory integration, custom tools
- Quality Gate: Implementation completeness (blocking)

**Stage 4: Documentation Generation (30 min)**
- Agent: `agent-sdk-documentation-specialist`
- Outputs: API reference, getting started guide, integration examples
- Quality Gate: Documentation completeness (non-blocking)

**Stage 5: PARALLEL - Testing & Examples (30 min)**
- **Branch A**: `agent-sdk-integration-tester` - Integration testing, verifier agents
- **Branch B**: `agent-sdk-developer` - Example applications
- Quality Gate: Test coverage ≥90% (blocking)

**Stage 6: Packaging & Release Prep (20 min)**
- Agent: `agent-sdk-packager`
- Outputs: NPM/PyPI configuration, distribution setup, changelog
- Quality Gate: Package validation (blocking)

---

## Agent SDK Packaging Pipeline

### Pipeline Architecture (180 minutes total)

**Stage 1: Requirements Analysis (20 min)**
- Agent: `agent-sdk-architect`
- Inputs: Source agent file, target market analysis
- Outputs: Requirements specification, MCP server identification
- Quality Gate: Requirements completeness (blocking)

**Stage 2: SDK Scaffolding (15 min)**
- Agent: `agent-sdk-developer`
- Action: Use TypeScript/Python templates
- Outputs: Project structure, package configuration, MCP setup
- Quality Gate: Scaffolding validation (blocking)

**Stage 3: Agent Translation (60 min)**
- Agent: `agent-sdk-developer`
- Action: Transform ORCHESTRAI agent → standalone SDK agent
- Outputs: Core agent logic, tool integration, behavior preservation
- Quality Gate: Translation accuracy (blocking)

**Stage 4: MCP Integration (30 min)**
- Agent: `agent-sdk-developer`
- Action: Apply MCP integration patterns
- Outputs: MCP server configurations, environment templates
- Quality Gate: MCP connection tests (blocking)

**Stage 5: Testing & Validation (25 min)**
- Agent: `agent-sdk-integration-tester`
- Action: Run agent SDK verifiers + integration tests
- Outputs: Test suite, coverage reports
- Quality Gate: 90%+ test coverage (blocking)

**Stage 6: Documentation (20 min)**
- Agent: `agent-sdk-documentation-specialist`
- Action: Generate client deliverable documentation
- Outputs: CLIENT-README, API-REFERENCE, DEPLOYMENT-GUIDE, QUICK-START
- Quality Gate: Documentation completeness (non-blocking)

**Stage 7: Distribution Packaging (10 min)**
- Agent: `agent-sdk-packager`
- Action: NPM/PyPI package configuration
- Outputs: package.json/pyproject.toml, LICENSE, release notes
- Quality Gate: Package validation (blocking)

### Templates & Patterns

**Agent Templates** (`templates/` directory):
- `typescript-agent-template/` - Complete TypeScript SDK template
  - `package.json`, `tsconfig.json`, `src/index.ts`
  - `.env.example`, `README.md`
  - Full Agent SDK integration with MCP support
- `python-agent-template/` - Complete Python SDK template
  - `pyproject.toml`, `requirements.txt`, `src/main.py`
  - `.env.example`, `README.md`
  - Full Agent SDK integration with MCP support

**MCP Integration Patterns** (`templates/mcp-integration-patterns/`):
- `dataforseo-pattern.json` - DataForSEO MCP configuration
- `memory-pattern.json` - Memory MCP configuration
- `sequential-thinking-pattern.json` - Sequential Thinking MCP configuration
- `ref-tools-pattern.json` - Reference Tools MCP configuration
- `notion-pattern.json` - Notion MCP configuration
- `filesystem-pattern.json` - Filesystem MCP configuration

**Client Deliverable Templates** (`deliverables-templates/`):
- `CLIENT-README-template.md` - Executive summary and package overview
- `DEPLOYMENT-GUIDE-template.md` - Production deployment instructions
- `API-REFERENCE-template.md` - Complete API documentation
- `QUICK-START-template.md` - 5-minute quick start guide

### MCP Integration Mappings

Complete MCP server requirements documented in [MCP-INTEGRATION-MAPPINGS.md](MCP-INTEGRATION-MAPPINGS.md):

**Tier 1 Agent Requirements**:
- **ContentWriter Pro**: dataforseo, memory, sequential-thinking (required); notion, filesystem (optional)
- **SEO Competitor Intelligence**: dataforseo, memory, sequential-thinking (required); google-search-console (optional)
- **Healthcare Content Specialist**: ref-tools, memory, sequential-thinking (required); HIPAA compliance required
- **Cold Email Outreach**: memory, sequential-thinking (required); notion (optional)

---

## File Organization

### Agent SDK Deliverables Structure

```
/projects/[client-uuid]/deliverables/agent-sdk/
├── [app-name]/
│   ├── src/
│   │   ├── agents/
│   │   ├── orchestration/
│   │   ├── memory/
│   │   ├── utils/
│   │   └── index.ts
│   ├── tests/
│   ├── examples/
│   ├── docs/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── documentation/
│   ├── api-reference.md
│   ├── getting-started.md
│   └── integration-guide.md
├── quality-reports/
│   ├── test-coverage.json
│   ├── verifier-report.json
│   └── performance-benchmarks.json
└── distribution/
    ├── package.json
    └── release-notes.md
```

---

## Technology Stack

### TypeScript SDK Applications
- **Runtime**: Node.js 18+
- **Language**: TypeScript with strict mode
- **Framework**: Anthropic Agent SDK (official)
- **Testing**: Jest, test coverage ≥90%
- **Validation**: Agent SDK verifier agents

### Python SDK Applications
- **Runtime**: Python 3.10+
- **Language**: Python with type hints
- **Framework**: Anthropic Agent SDK (official)
- **Testing**: pytest, test coverage ≥90%
- **Validation**: Agent SDK verifier agents
- **Standards**: PEP 8 compliant

---

## Agent SDK Best Practices

### 1. Architecture-First Approach
```javascript
// Always design architecture before implementation
Task(
  subagent_type="agent-sdk-architect",
  prompt="Design SDK architecture with clear module boundaries..."
)
```

### 2. Use Agent SDK CLI
```javascript
// Leverage official scaffolding
Execute /new-sdk-app [app-name]
  → Choose language (TypeScript/Python)
  → Select agent type (business/coding/custom)
  → Automatic project setup
```

### 3. Comprehensive Testing
```javascript
// Invoke verifier agents
Task(
  subagent_type="agent-sdk-integration-tester",
  prompt="Verify TypeScript Agent SDK application at [path]..."
)
```

### 4. Documentation as Code
```javascript
// Generate docs from implementation
Task(
  subagent_type="agent-sdk-documentation-specialist",
  prompt="Generate API reference from [path] codebase..."
)
```

### 5. Crystalline Memory Integration
```javascript
// Store SDK learnings for future projects
crystallineMemory.storeMemory('agent-sdk', {
  name: `${projectName}-SDK`,
  entityType: 'AgentSDKArchitecture',
  observations: [
    `Language: ${language}`,
    `Agent type: ${agentType}`,
    `Modules: ${modules.join(', ')}`
  ]
});
```

---

## Quality Targets

### Code Quality
- **Type Safety**: 100% (TypeScript strict mode, Python type hints)
- **Test Coverage**: ≥90%
- **Linting**: Zero ESLint/pylint errors
- **Documentation**: API reference + getting started guide

### Agent SDK Compliance
- **Verifier Pass Rate**: 100%
- **Best Practices**: Following official SDK patterns
- **Examples**: Working example applications included

### Performance
- **Build Time**: <30 seconds
- **Test Execution**: <60 seconds
- **Package Size**: Optimized for distribution

---

## Use Cases & Examples

### Customer Support Chatbot
```javascript
projectSpec = {
  projectName: 'Customer Support Agent',
  agentType: 'business',
  language: 'typescript',
  features: ['chat', 'memory', 'ticket-creation']
}

// Execute pipeline
pipeline.execute(projectSpec)

// Deliverables:
// - TypeScript SDK with chat agent
// - Memory integration for context
// - Tool for ticket creation
// - Complete documentation
```

### Code Review Agent
```javascript
projectSpec = {
  projectName: 'Code Review Automator',
  agentType: 'coding',
  language: 'python',
  features: ['github-integration', 'pr-analysis', 'suggestions']
}

// Deliverables:
// - Python SDK with GitHub integration
// - PR analysis tools
// - Automated review suggestions
// - CI/CD integration guide
```

### Content Creation Agent
```javascript
projectSpec = {
  projectName: 'Blog Post Generator',
  agentType: 'business',
  language: 'typescript',
  features: ['seo-optimization', 'multi-language', 'cms-integration']
}

// Deliverables:
// - TypeScript SDK with content generation
// - SEO optimization tools
// - Multi-language support
// - CMS integration examples
```

---

## Troubleshooting

### Common Issues

**1. Agent SDK CLI Not Found**
```bash
# Install Agent SDK plugin
# Verify with: /new-sdk-app --help
```

**2. Verifier Agent Failures**
```bash
# Check TypeScript strict mode enabled
# Verify type coverage ≥90%
# Ensure all exports documented
```

**3. Integration Test Timeouts**
```bash
# Increase test timeout
# Mock external dependencies
# Use test fixtures
```

**4. Package Distribution Issues**
```bash
# Validate package.json
# Check license compatibility
# Verify entry points
```

---

## Testing

### Manual Pipeline Test
```bash
# 1. Create test project spec
projectSpec = {
  projectId: 'test-uuid',
  projectName: 'Test Support Agent',
  clientName: 'Test Client',
  agentType: 'business',
  language: 'typescript',
  features: ['chat', 'memory']
}

# 2. Execute pipeline
pipeline = new AgentSDKDeliverablePipeline(
  coordinationPatterns,
  crystallineMemory,
  mcpManager
)

result = await pipeline.execute(projectSpec)

# 3. Verify deliverables
# Check files exist at expected paths
# Run verifier agents
# Test example applications
```

---

## Financial Impact

### Revenue Opportunity
- **Service Offering**: Standalone agent deliverables
- **Project Value**: $35K-$50K per agent
- **Year 1 Target**: 4-5 projects
- **Annual Revenue**: $140K-$200K

### Client Benefits
- **Deployment Ready**: Production-ready code
- **Documentation**: Complete API reference
- **Support**: Maintenance and updates
- **Integration**: Easy integration with existing systems

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md](../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md)** - Agent invocation patterns
- **[../../AGENT-SDK-PLUGIN-GUIDE.md](../../AGENT-SDK-PLUGIN-GUIDE.md)** - Complete Agent SDK plugin guide
- **[../../PLUGIN-BENEFITS-ANALYSIS.md](../../PLUGIN-BENEFITS-ANALYSIS.md)** - Financial analysis
- **[AGENT-SDK-QUICK-START.md](AGENT-SDK-QUICK-START.md)** - Quick reference guide

---

**This domain follows the Universal Agent Delegation Pattern with Agent SDK CLI integration. See main [CLAUDE.md](../../CLAUDE.md) for system-wide architecture principles.**
