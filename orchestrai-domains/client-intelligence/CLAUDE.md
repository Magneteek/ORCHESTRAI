# Client Intelligence Domain

## Domain Overview

The Client Intelligence Domain provides comprehensive client analysis, psychographic profiling, market research, and business context intelligence. This domain orchestrates specialized agents to build deep understanding of client businesses, their ideal customer profiles (ICP), competitive positioning, and market opportunities.

**Domain Hub**: [client-intelligence-domain-hub.js](client-intelligence-domain-hub.js)

---

## Specialized Agents

This domain leverages the following specialized Claude Code agents via the **Universal Agent Delegation Pattern**:

### Strategic Analysis Agents
- **`client-project-orchestrator`** - Coordinates entire client intelligence workflows
- **`client-icp-analyst`** - Deep psychographic profiling and ICP analysis
- **`client-branding-intelligence`** - Brand identity, positioning, and voice analysis
- **`client-business-context-analyzer`** - Business model, operations, and context analysis

### Market Intelligence Agents
- **`client-market-intelligence-synthesizer`** - Market research and competitive landscape
- **`client-context-integration-coordinator`** - Synthesizes all intelligence into cohesive strategy

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Domain Workflows

### 1. New Client Project Creation

**Hybrid Delegation Pattern** (Node.js Infrastructure + Claude Code Intelligence)

```
POST /client/create → client-intelligence-domain-hub.js
  ↓
Infrastructure Setup:
  - Create project folder: /projects/[client-uuid]/
  - Initialize crystalline memory entities
  - Setup filesystem structure
  ↓
Return Delegation Instructions → orchestrai-master-coordinator
  ↓
Task tool → client-project-orchestrator → Complete Analysis
  ↓
Deliverables saved to: /projects/[client-uuid]/client-intelligence/
```

**API Endpoint**: `POST http://localhost:5501/client/create`

**Payload**:
```json
{
  "clientName": "Company Name",
  "industry": "Technology/Healthcare/etc",
  "domain": "example.com",
  "targetMarket": "Primary market segment",
  "additionalContext": "Any specific requirements"
}
```

### 2. ICP Analysis Workflow

**Direct Agent Invocation** (Simple psychographic analysis)

```
Task tool → client-icp-analyst → Psychographic Profile
```

**Use When**: Need detailed ideal customer profile with psychographic segmentation

**Deliverables**:
- `/projects/[uuid]/client-intelligence/icp-analysis.json`
- Psychographic segments with percentages
- Pain points, motivations, objections
- Communication preferences

### 3. Brand Intelligence Workflow

**Direct Agent Invocation**

```
Task tool → client-branding-intelligence → Brand Analysis
```

**Use When**: Need brand voice, positioning, and identity analysis

**Deliverables**:
- `/projects/[uuid]/client-intelligence/brand-profile.json`
- Brand voice guidelines
- Visual identity preferences
- Competitive differentiation

### 4. Comprehensive Client Intelligence

**Hybrid Delegation Pattern** (Full orchestration)

```
orchestrai-master-coordinator
  ↓
POST /client/comprehensive-analysis
  ↓
Parallel Execution:
  - ICP Analysis (client-icp-analyst)
  - Brand Intelligence (client-branding-intelligence)
  - Business Context (client-business-context-analyzer)
  - Market Research (client-market-intelligence-synthesizer)
  ↓
Integration (client-context-integration-coordinator)
  ↓
Complete Client Intelligence Package
```

---

## Integration with Universal Agent Pattern

All agents in this domain follow the **Universal Agent Delegation Pattern** documented in [../../CLAUDE.md](../../CLAUDE.md):

### Pattern 1: Direct Invocation
```javascript
// For simple, single-agent tasks
Task(subagent_type="client-icp-analyst", prompt="Analyze ICP for [client]...")
```

### Pattern 2: Hybrid Delegation
```javascript
// For complex workflows requiring infrastructure
orchestrai-master-coordinator → Domain Hub API → Task tool → Agent
```

### Parallel Execution
```javascript
// Launch multiple client intelligence agents simultaneously
Task(subagent_type="client-icp-analyst", ...)
Task(subagent_type="client-branding-intelligence", ...)
Task(subagent_type="client-market-intelligence-synthesizer", ...)
// All execute in parallel, 60-70% time savings
```

---

## File Organization

### Project Structure
All client intelligence deliverables are saved to:

```
/projects/[client-uuid]/
├── client-intelligence/
│   ├── icp-analysis.json              # Psychographic profiles
│   ├── icp-24-section-framework.json  # 24-section copywriting framework (MANDATORY)
│   ├── brand-profile.json             # Brand identity analysis
│   ├── business-context.json          # Business model analysis
│   ├── market-intelligence.json       # Competitive landscape
│   ├── comprehensive-analysis.json    # Integrated intelligence
│   └── assets/                        # Logos, brand assets
├── deliverables/
│   ├── client-intelligence/          # Comprehensive HTML reports
│   ├── seo/                          # SEO research referencing ICP
│   ├── content/                      # Content based on psychographics
│   └── research/                     # Additional research
├── project-metadata.json
└── crystalline-memory-index.json
```

### CRITICAL: 24-Section ICP Framework is MANDATORY

**Every client intelligence project MUST include the 24-section copywriting framework.**

This framework provides:
- Named avatar personas with emotional depth
- Complete customer psychology (24 sections per segment)
- Conversion-focused messaging insights
- High-converting copywriting intelligence

**See [24-SECTION-FRAMEWORK-GUIDE.md](24-SECTION-FRAMEWORK-GUIDE.md) for complete documentation.**

### CRITICAL: Project Coherence Rule
**All work for a single client MUST remain in their existing project folder.**

❌ **INCORRECT**: Creating new project for additional client work
✅ **CORRECT**: Adding to existing `/projects/[client-uuid]/` structure

---

## Crystalline Memory Integration

### Memory Entities Created

The domain hub creates these memory entities for each client:

```javascript
{
  entityType: "Client",
  name: clientName,
  observations: [
    "Industry: [industry]",
    "Primary domain: [domain]",
    "Target market: [market]",
    "Project created: [timestamp]"
  ]
}

{
  entityType: "Project",
  name: `${clientName} Intelligence Project`,
  observations: [
    "Project type: Client Intelligence",
    "UUID: [uuid]",
    "Status: Active"
  ]
}
```

### Memory Relations
```javascript
{ from: clientName, to: projectName, relationType: "has_project" }
{ from: projectName, to: "Client Intelligence Domain", relationType: "managed_by" }
```

### Adding to Existing Memory
When working with existing clients:
```javascript
// ALWAYS add to existing entities
memory.addObservations(clientName, ["New analysis completed: [date]"])

// Create relations to new deliverables
memory.createRelation(clientName, "SEO Research Q4", "requires")
```

---

## Domain-Specific Best Practices

### 1. Always Check for Existing Projects
```bash
# Before creating new client project
curl http://localhost:5501/client/search?name=ClientName
```

### 2. Use Hybrid Delegation for Full Analysis
- Infrastructure setup (filesystem, memory) handled by domain hub
- Strategic analysis handled by Claude Code agents
- Best of both: Fast setup + Deep intelligence

### 3. Parallel Agent Execution
When gathering multiple intelligence types:
```javascript
// Launch all in ONE message for parallel execution
Task(subagent_type="client-icp-analyst", ...)
Task(subagent_type="client-branding-intelligence", ...)
Task(subagent_type="client-market-intelligence-synthesizer", ...)
```

### 4. Memory Integration
Always integrate new intelligence with existing client memory:
```javascript
// Reference existing intelligence
const existingICP = await memory.retrieve(`${clientName}-ICP`)

// Add new observations
memory.addObservations(clientName, ["Market expansion opportunity identified"])
```

### 5. Cross-Domain Coordination
Client intelligence informs other domains:
- **Content Domain**: Uses psychographic data for tone/messaging
- **SEO Domain**: Targets keywords matching ICP search behavior
- **Web Dev Domain**: Designs experiences for ICP preferences

---

## API Reference

### Domain Hub Endpoints

**Base URL**: `http://localhost:5501`

#### Create Client Project
```bash
POST /client/create
Content-Type: application/json

{
  "clientName": "QuartzIQ",
  "industry": "B2B SaaS",
  "domain": "quartziq.com",
  "targetMarket": "Enterprise data teams",
  "additionalContext": "Focus on AI-powered analytics"
}
```

**Response**:
```json
{
  "requiresClaudeCodeExecution": true,
  "delegationType": "task-tool",
  "agentType": "client-project-orchestrator",
  "taskPrompt": "Create comprehensive client intelligence project...",
  "infrastructureResults": {
    "projectUUID": "quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010",
    "filesystemReady": true,
    "memoryInitialized": true
  },
  "estimatedDuration": 60000
}
```

#### Search Existing Projects
```bash
GET /client/search?name=QuartzIQ
```

#### Comprehensive Analysis
```bash
POST /client/comprehensive-analysis
{
  "clientId": "quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010"
}
```

---

## Testing

### Manual Testing
```bash
# 1. Start domain hub
npm run orchestrator

# 2. Test client creation
curl -X POST http://localhost:5501/client/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "industry": "Technology",
    "domain": "testclient.com",
    "targetMarket": "SMB"
  }'

# 3. Verify delegation response
# Should return requiresClaudeCodeExecution: true

# 4. Use orchestrai-master-coordinator to complete
# Task tool will invoke client-project-orchestrator
```

### Integration Testing
See [../../tests/hybrid-delegation-test-workflow.md](../../tests/hybrid-delegation-test-workflow.md) for complete testing guide.

---

## HTML Reporting

The Client Intelligence Domain includes advanced HTML report generation for psychographic analysis.

**See [README-HTML-REPORTS.md](README-HTML-REPORTS.md) for:**
- Report generation pipeline
- Template customization
- Multi-format export (HTML, PDF, JSON)
- Interactive visualizations

---

## Troubleshooting

### Common Issues

**1. "Client project already exists" error**
```bash
# Check existing projects
curl http://localhost:5501/client/search?name=ClientName

# Use existing UUID instead of creating new
```

**2. Memory entities not found**
```bash
# Verify crystalline memory
curl http://localhost:5501/memory/search?query=ClientName
```

**3. Delegation not triggering agent**
- Ensure `orchestrai-master-coordinator` is being used
- Check delegation response has `requiresClaudeCodeExecution: true`
- Verify agent name matches `.claude/agents/[agent-name].md`

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture and universal patterns
- **[../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md](../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md)** - Complete delegation guide
- **[../../HYBRID-DELEGATION-QUICK-START.md](../../HYBRID-DELEGATION-QUICK-START.md)** - Quick start for hybrid delegation
- **[README-HTML-REPORTS.md](README-HTML-REPORTS.md)** - HTML report generation guide

---

**This domain follows the Universal Agent Delegation Pattern. See main [CLAUDE.md](../../CLAUDE.md) for system-wide architecture principles.**
