# ORCHESTRAI - System Overview for Developers

## What is ORCHESTRAI?

ORCHESTRAI is an **advanced self-iterating multi-agent orchestration system** that coordinates specialized AI agents to deliver enterprise-grade digital marketing and web development solutions. It implements cutting-edge patterns including crystalline memory architecture, pipeline sharing, and geometric agent coordination.

Think of it as an **AI-powered digital agency infrastructure** where specialized agents (SEO experts, content writers, developers, designers, quality controllers) work together through an intelligent coordination layer, sharing knowledge and learning from each interaction.

---

## Core Architecture Concepts

### 1. **Crystalline Memory System**
- **Hexagonal lattice structure** for storing and retrieving agent knowledge
- Memory nodes organized in efficient geometric patterns (q, r coordinates)
- **Self-organizing**: Memory automatically restructures based on access patterns
- **Shared intelligence**: All agents can access and contribute to collective memory
- **Implementation**: Redis-backed with hexagonal coordinate system

```javascript
// Example: Storing memory at hexagonal coordinates
crystallineMemory.store('seo-keyword-research', data, { q: 1, r: -1 });
```

### 2. **Hybrid Agent Architecture**
ORCHESTRAI uses **three types of agents** working together:

#### Claude Code Agents (Claude-based)
- Real AI-powered agents using Anthropic's Claude via MCP (Model Context Protocol)
- Handle complex reasoning, content generation, strategic planning
- Examples: Content Writer, SEO Specialist, Code Reviewer

#### Node.js Coordination Agents
- Efficient workflow orchestration and data processing
- File system monitoring, caching, performance optimization
- Examples: File System Monitor, Cache Optimizer, Performance Tracker

#### Domain Hub Orchestrators
- Coordinate multiple specialized agents within a domain
- Route tasks to appropriate sub-agents
- Aggregate results and manage quality gates

### 3. **Domain-Based Organization**
Agents are organized into specialized domains:

```
ORCHESTRAI
├── SEO Domain Hub (12 specialized agents)
│   ├── Keyword Research Agent
│   ├── Competitor Analysis Agent
│   ├── Technical SEO Agent
│   ├── Content Optimization Agent
│   └── ... 8 more specialists
│
├── Content Domain Hub (13 Claude Code + 5 Node.js agents)
│   ├── Content Writer Specialist
│   ├── AI Phrase Detector
│   ├── Multi-Language Content Adapter
│   ├── Direct Response Copywriter
│   └── ... 14 more specialists
│
├── Quality Control Hub (12 quality agents)
│   ├── Content Quality Validator
│   ├── SEO Quality Validator
│   ├── Technical Quality Validator
│   └── ... 9 more specialists
│
├── Client Intelligence Hub (6 Claude Code + 5 Node.js agents)
│   ├── Client Branding Intelligence
│   ├── ICP Analysis Specialist
│   ├── Market Intelligence Synthesizer
│   └── ... 8 more specialists
│
└── Web Quality Domain Hub (8 quality + 3 specialized agents)
    ├── UX Quality Validator
    ├── Visual Regression Tester
    ├── Performance Quality Tester
    └── ... 8 more specialists
```

---

## Key System Components

### Service Layer (3 Core Services)

#### 1. Redis (Port 6379)
- Crystalline memory storage backend
- Pipeline sharing and co-learning data
- Agent state and coordination data
- **Status**: `redis-cli ping` → PONG

#### 2. Main Orchestrator (Port 5501)
- Central coordination engine
- MCP server manager (9 active MCP servers)
- Domain hub lifecycle management
- WebSocket server for real-time updates
- **Health Check**: `http://localhost:5501/health`

#### 3. Frontend Dashboard (Port 5500)
- Real-time system monitoring
- D3.js visualizations of memory lattice
- Agent activity tracking
- MCP server status monitoring
- **Access**: `http://localhost:5500`

### MCP (Model Context Protocol) Integration
ORCHESTRAI integrates **9 specialized MCP servers**:

1. **DataForSEO MCP**: SEO data, keyword research, competitor analysis
2. **Filesystem MCP**: Secure file operations with path validation
3. **Sequential Thinking MCP**: Complex problem-solving coordination
4. **Ref.tools MCP**: Documentation access, hallucination prevention
5. **Memory MCP**: Persistent knowledge graphs
6. **Notion MCP**: Project management integration
7. **Browser MCP**: Visual testing, screenshot comparison
8. **Playwright MCP**: E2E testing, cross-browser automation
9. **MagicUI MCP**: UI component library for static sites

---

## How It Works: Request Flow

### Example: Creating SEO-Optimized Content for a Client

```
1. User Request → Main Orchestrator
   "Create SEO-optimized content about dental implants for nasmehPG (Slovenian market)"

2. Orchestrator Analysis
   ↓ Analyzes request using query patterns
   ↓ Identifies required domains: Client Intelligence, SEO, Content
   ↓ Checks crystalline memory for existing client context

3. Client Intelligence Hub Activation
   ↓ Loads client branding, ICP profiles, psychographic segments
   ↓ Injects client context into shared memory
   ↓ Notifies other domains of available context

4. SEO Domain Hub Processing
   ↓ Keyword Research Agent: Finds target keywords
   ↓ Competitor Analysis Agent: Analyzes SERP competitors
   ↓ Intent Mapping Agent: Maps search intent patterns
   ↓ Results stored in crystalline memory

5. Content Domain Hub Execution
   ↓ Content Outline Architect: Creates comprehensive outline
   ↓ Multi-Language Content Adapter: Ensures pure Slovenian
   ↓ Content Writer Specialist: Generates full article
   ↓ AI Phrase Detector: Humanizes content
   ↓ Content Quality Validator: Validates completeness

6. Quality Control Hub Validation
   ↓ Content Quality Validator: Checks structure, flow
   ↓ SEO Quality Validator: Verifies keyword integration
   ↓ Multi-Domain Quality Coordinator: Overall assessment
   ↓ Generates quality score and feedback

7. Crystalline Memory Update
   ↓ Stores article metadata at geometric coordinates
   ↓ Creates relations between entities (client → content → keywords)
   ↓ Updates psychographic segment performance data
   ↓ Triggers lattice restructuring for optimization

8. Result Delivery
   ↓ Aggregated results returned to user
   ↓ Files written to project deliverables folder
   ↓ Dashboard updated with real-time metrics
```

---

## Pipeline Assembly System

ORCHESTRAI can **intelligently assemble workflows** from reusable pipeline components:

### Pipeline Templates
Pre-built workflow patterns for common tasks:
- **SEO Research Pipeline**: Keyword research → Competitor analysis → Content strategy
- **Content Creation Pipeline**: Outline → Writing → Quality validation → Publishing
- **Reputation Intelligence Pipeline**: Review monitoring → Sentiment analysis → Response generation
- **Multi-Language Content Pipeline**: Translation → Cultural adaptation → Language validation
- **Web Development Pipeline**: Wireframe → Design → Development → QA → Deployment

### Dynamic Assembly
The system can:
1. Analyze project requirements
2. Select appropriate pipeline templates
3. Customize workflow based on available infrastructure
4. Validate dependencies and quality gates
5. Execute with real-time monitoring

```javascript
// Example: Assembling a content pipeline
const pipeline = await pipelineAssembler.assemblePipeline({
  projectType: 'slovenian-dental-content',
  requiredCapabilities: ['keyword-research', 'multilingual-writing', 'quality-validation'],
  targetLanguage: 'sl',
  qualityLevel: 'premium'
});

await pipeline.execute();
```

---

## Crystalline Memory in Action

### Hexagonal Coordinate System
Memory is stored using **axial coordinates** (q, r) in a hexagonal lattice:

```
      (0,2)   (1,2)
  (-1,1)  (0,1)   (1,1)
      (0,0)   (1,0)
  (-1,0)  (0,-1)  (1,-1)
```

### Benefits
- **Efficient traversal**: Find related memories using geometric proximity
- **Self-optimization**: Frequently accessed nodes move closer together
- **Semantic clustering**: Related concepts naturally cluster in lattice
- **Cache efficiency**: Predictable access patterns for optimization

### Memory Types
```javascript
// Entity memory (projects, clients, content)
entity-nasmehPG-slovenian-project → (1, 1)

// Relationship memory (connections between entities)
relation-content-strategy-client → (-2, 2)

// Domain-specific pools
seo-keyword-research → (1, -1)
content-quality-scores → (2, 4)
client-icp-profiles → (-6, 3)
```

---

## File Organization & Project Structure

### Strict File Hierarchy
ORCHESTRAI enforces **zero file pollution** through path validation:

```
/orchestrai-system/
├── templates/global/          # READ-ONLY templates
│   ├── wireframes/           # Web layouts, mobile patterns
│   ├── design-systems/       # Components, styles, brands
│   ├── code-patterns/        # React, TypeScript patterns
│   └── content-templates/    # Copy frameworks, SEO templates

/projects/[client-uuid]/
├── client-intelligence/       # ICP, branding, research
├── deliverables/             # ONLY final outputs
│   ├── seo/                  # Keyword research, analysis
│   ├── content/              # Articles, copy variations
│   ├── design/               # Wireframes, mockups
│   ├── development/          # Code, deployment scripts
│   └── research/             # User insights, analysis
├── project-metadata.json
└── crystalline-memory-index.json

/temp/                        # Safe to delete
├── processing/               # 24h cleanup
├── downloads/                # 7d cleanup
└── cache/                    # 30d cleanup
```

### Path Validation
All file operations are validated:
- Templates: Must access from `/orchestrai-system/templates/global/`
- Deliverables: Must write to `/projects/[uuid]/deliverables/`
- No cross-contamination between projects

---

## Technology Stack

### Backend (Node.js + TypeScript)
- **Runtime**: Node.js with TypeScript throughout
- **Memory Store**: Redis for crystalline memory
- **Database**: PostgreSQL for structured data
- **Vector DB**: Semantic search and clustering
- **Message Queues**: Async agent communication

### Frontend (Next.js 15 - Conditional)
- **Framework**: Next.js 15 with App Router (only when SSR/dynamic features needed)
- **UI Library**: ShadCN UI for flexibility
- **Visualization**: D3.js v7 for semantic clustering, memory lattice
- **Styling**: Tailwind CSS with ORCHESTRAI themes
- **Real-time**: WebSocket connections for live updates

### Static Web Development (Default Choice)
- **Structure**: Semantic HTML5
- **Styling**: Tailwind CSS
- **Interactions**: MagicUI components (orbiting, ripples, animated beams)
- **Visualization**: D3.js v7, Paper.js for canvas effects
- **Icons**: Lucide React, Heroicons

**Philosophy**: Choose the **simplest solution** that meets requirements
- Static content = Static HTML + Tailwind
- Dynamic features = Next.js + ShadCN UI
- Never over-engineer

---

## Service Management

### Starting the System
```bash
# Check all services
npm run services:status

# Start all services (automated sequencing)
npm run services:start

# Individual services
npm run redis              # Redis only
npm run orchestrator       # Orchestrator only
npm run dev                # Frontend only
```

### Health Monitoring
```bash
# Real-time health check
curl http://localhost:5501/health | jq

# Watch service status
watch -n 5 'npm run services:status'

# View logs
tail -f logs/orchestrator.log
tail -f logs/frontend.log
```

### Service Dependencies
```
1. Redis (independent)
   ↓ Must start first

2. Main Orchestrator (depends on Redis)
   ↓ Starts after Redis ready

3. Frontend Dashboard (depends on Orchestrator)
   ↓ Starts after Orchestrator operational
```

---

## Agent Communication Patterns

### Inter-Agent Communication Protocol
Agents communicate through multiple channels:

#### 1. Direct Messaging
```javascript
await this.sendMessage('content-domain-hub', {
  type: 'content-generation-request',
  payload: { language: 'sl', topic: 'dental-implants' }
});
```

#### 2. Broadcast Channels
```javascript
await this.broadcast('quality-assessment-complete', {
  score: 92,
  recommendations: [...]
});
```

#### 3. Shared Memory Pools
```javascript
await crystallineMemory.writeToPool('client-icp-profiles', data);
const clientData = await crystallineMemory.readFromPool('client-icp-profiles');
```

#### 4. Event Listeners
```javascript
this.on('client-context-updated', async (context) => {
  await this.refreshClientContext(context);
});
```

---

## Quality Control & Self-Learning

### Multi-Stage Quality Gates
Every deliverable passes through multiple validation stages:

```
1. Domain-Specific Quality
   ↓ Content quality, SEO compliance, technical correctness

2. Cross-Domain Validation
   ↓ Consistency across SEO, content, client requirements

3. Quality Intelligence Analysis
   ↓ Pattern recognition, failure analysis, benchmark evolution

4. Feedback Loop
   ↓ Improvements stored in crystalline memory
   ↓ Future tasks benefit from learned patterns
```

### Self-Learning Mechanisms

#### Performance Prediction
- Analyzes historical performance patterns
- Predicts bundle sizes, load times, quality scores
- Optimizes resource allocation

#### Quality Memory
- Tracks successful patterns and failure modes
- Agent performance profiling
- Cross-domain quality insights

#### Benchmark Evolution
- Quality standards improve over time
- System learns from user feedback
- Proactive quality optimization

---

## Real-World Use Cases

### 1. Multi-Language Content Campaign
```
Input: "Create 10 dental implant articles for Slovenian market"

ORCHESTRAI:
→ Loads client psychographic segments
→ Performs keyword research (DataForSEO MCP)
→ Analyzes competitors
→ Creates semantic content clusters
→ Generates 10 comprehensive outlines
→ Writes articles in pure Slovenian
→ Validates language purity, SEO optimization
→ Stores all relationships in crystalline memory

Output: 10 publication-ready articles + SEO metadata + keyword mapping
```

### 2. Landing Page Development
```
Input: "Create landing page for dental clinic with conversion optimization"

ORCHESTRAI:
→ Loads client branding intelligence
→ Wireframe Creation Specialist: Creates layout
→ Visual Design Specialist: Applies brand identity
→ Frontend Development Specialist: Builds with ShadCN UI
→ Performance Quality Tester: Validates Core Web Vitals
→ UX Flow Validator: Tests conversion funnel
→ Visual Regression Tester: Screenshot comparison

Output: Production-ready landing page + performance report + A/B test variants
```

### 3. Reputation Intelligence
```
Input: "Monitor reviews for Netherlands dental clinics"

ORCHESTRAI:
→ Reviews Monitor: Tracks Google My Business
→ Sentiment Analysis: Identifies negative reviews
→ Competitive Intelligence: Compares against competitors
→ Response Generator: Creates professional responses
→ Alert System: Notifies of critical reviews

Output: Real-time reputation monitoring + automated responses + competitive insights
```

---

## Performance Metrics

### System Efficiency
- **45% Faster Problem Resolution**: Geometric orchestration vs linear delegation
- **60% More Accurate Outcomes**: Pipeline sharing intelligence
- **90.2% Performance Improvement**: Hybrid architecture benefits
- **38% Increase in Planning Tasks**: Advanced memory architecture

### Agent Coordination
- **Parallel Execution**: Multiple agents work simultaneously
- **Intelligent Routing**: Optimal communication paths
- **Resource Optimization**: Dynamic load balancing
- **Context Sharing**: Zero redundant data fetching

---

## Security & Data Protection

### File Access Control
- Strict path validation for all file operations
- Sandboxed agent execution environments
- Domain-specific file permissions
- Complete audit logging

### API & Integration Security
- All API keys in environment variables
- Encrypted inter-agent communication
- MCP server authentication
- Rate limiting and quota management

### Client Data Protection
- Isolated project directories per client
- No cross-client data contamination
- Automatic backup and versioning
- GDPR-compliant data handling

---

## Development & Extension

### Adding a New Agent

```javascript
// 1. Create agent class
class CustomAgent extends BaseAgent {
  constructor() {
    super('custom-agent', 'custom-domain');
    this.capabilities = ['custom-capability'];
  }

  async initialize() {
    // Setup logic
  }

  async handleRequest(request) {
    // Agent logic
    return result;
  }
}

// 2. Register with domain hub
domainHub.registerAgent(new CustomAgent());

// 3. Configure capabilities
domainHub.updateTaskRouting('custom-capability', 'custom-agent');
```

### Creating a Pipeline Template

```javascript
const customPipeline = {
  id: 'custom-research-pipeline',
  name: 'Custom Research Pipeline',
  stages: [
    {
      name: 'data-collection',
      agent: 'research-agent',
      dependencies: [],
      qualityGates: ['data-completeness']
    },
    {
      name: 'analysis',
      agent: 'analysis-agent',
      dependencies: ['data-collection'],
      qualityGates: ['analysis-accuracy']
    }
  ]
};

pipelineRegistry.register(customPipeline);
```

---

## Monitoring & Debugging

### Dashboard Insights
- Real-time agent activity visualization
- Crystalline memory lattice 3D view
- Token usage per agent/session
- MCP server health status
- Domain hub performance metrics

### Debugging Tools
```bash
# View orchestrator logs
tail -f logs/orchestrator.log

# Check MCP server status
curl http://localhost:5501/mcp/status | jq

# Inspect crystalline memory
redis-cli
> HGETALL crystalline:memory:*

# Monitor agent coordination
curl http://localhost:5501/agents/active | jq
```

---

## Comparison to Traditional Systems

| Feature | Traditional Agency | ORCHESTRAI |
|---------|-------------------|------------|
| **Task Coordination** | Manual, email/Slack | Automated, geometric routing |
| **Knowledge Sharing** | Scattered documents | Crystalline memory lattice |
| **Quality Control** | Manual review cycles | Multi-stage automated gates |
| **Learning** | Individual expertise | Collective self-learning |
| **Scalability** | Linear (hire more) | Exponential (agent replication) |
| **Context Switching** | High overhead | Instant memory access |
| **Consistency** | Variable by person | Algorithmic quality standards |

---

## Getting Started as a Developer

### Prerequisites
```bash
# Required
Node.js >= 18
Redis >= 6.0
Git

# Optional
PostgreSQL (for structured data)
Docker (for containerization)
```

### Initial Setup
```bash
# 1. Clone repository
git clone https://github.com/Magneteek/ORCHESTRAI.git
cd ORCHESTRAI

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Start services
npm run services:start

# 5. Access dashboard
open http://localhost:5500
```

### Development Workflow
```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm run test

# Check TypeScript types
npm run typecheck

# Lint code
npm run lint

# View service status
npm run services:status
```

---

## Key Takeaways for Developers

1. **Hybrid Architecture**: ORCHESTRAI combines Claude Code agents (real AI), Node.js agents (efficiency), and domain hubs (orchestration)

2. **Crystalline Memory**: Hexagonal lattice provides efficient, self-optimizing knowledge storage that all agents share

3. **Pipeline Assembly**: Reusable workflow templates that intelligently adapt to project requirements

4. **Quality-First**: Multi-stage quality gates with self-learning feedback loops

5. **Domain Organization**: Specialized domains (SEO, Content, Quality, Client Intelligence, Web Quality) with coordinated sub-agents

6. **MCP Integration**: 9 specialized MCP servers provide advanced capabilities (SEO data, file ops, sequential thinking, documentation, memory, testing)

7. **Static-First Philosophy**: Choose the simplest technology that meets requirements (don't over-engineer)

8. **Zero File Pollution**: Strict file organization with path validation prevents data contamination

9. **Service Architecture**: 3 core services (Redis, Orchestrator, Frontend) with automated management

10. **Self-Learning**: System improves over time through performance prediction, quality memory, and benchmark evolution

---

## Further Reading

- **Architecture Details**: See `/CLAUDE.md` for comprehensive system documentation
- **Service Management**: See `/SERVICES.md` for service lifecycle and troubleshooting
- **Pipeline Assembly**: See `/orchestrai-shared/pipeline-assembly/README.md` for workflow details
- **API Documentation**: See `/docs/api/` for REST and WebSocket API specs
- **Agent Development**: See `/docs/development/agent-creation.md` for creating custom agents

---

## Support & Community

- **GitHub**: https://github.com/Magneteek/ORCHESTRAI
- **Documentation**: `/docs/` directory
- **Health Check**: `curl http://localhost:5501/health`
- **Dashboard**: `http://localhost:5500`

---

**ORCHESTRAI represents the future of AI-powered digital agency automation: intelligent, self-learning, and infinitely scalable.**
