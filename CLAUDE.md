# ORCHESTRAI - Advanced Multi-Agent System

## Project Overview

ORCHESTRAI is a cutting-edge self-iterating multi-agent orchestration system implementing crystalline memory architecture, pipeline sharing, and geometric orchestration patterns. This system creates a revolutionary approach to AI agent coordination with enterprise-grade file organization and advanced semantic visualization.

---

## Architecture Principles

### Crystalline Memory System
- **Hexagonal Memory Nodes**: Memory organized in efficient geometric patterns for optimal access
- **Self-Organizing Structure**: Memory automatically restructures based on usage patterns
- **Lattice-Based Traversal**: Geometric algorithms for efficient memory retrieval
- **Hierarchical Organization**: Core → Domain → Task-specific memory clusters

### Pipeline Sharing Architecture
- **Co-Learning Memory Pool**: Agents share experiences through Redis-based collaborative learning
- **Dynamic Access Control**: Bipartite graphs managing resource permissions
- **Context Synchronization**: Real-time contextual data sharing across domains
- **Parallel Processing**: Multiple agents working through shared computational workflows

### Geometric Orchestration
- **Hybrid Mesh Topology**: Central orchestrator with selective mesh connections
- **Dynamic Routing**: Geometric patterns evolving based on task complexity
- **Spatial Optimization**: Agent positioning for optimal communication efficiency
- **Emergent Coordination**: Complex behaviors from geometric relationships

---

## Universal Agent Delegation Pattern

### CRITICAL: Agent Invocation is Domain-Agnostic

**The Task tool + specialized agents pattern works for ALL domains, not just content creation.**

#### Two Execution Patterns

**Pattern 1: Direct Agent Invocation** (Simple tasks)
```
Task tool → Specialized Agent → Results
```

**Examples:**
- Content: `Task(subagent_type="content-writer-specialist")`
- SEO: `Task(subagent_type="seo-competitor-analysis")`
- Client Intelligence: `Task(subagent_type="client-icp-analyst")`
- Web Dev: `Task(subagent_type="frontend-architect-specialist")`

**Pattern 2: Hybrid Delegation** (Complex workflows)
```
orchestrai-master-coordinator → Node.js Infrastructure → Task tool → Agent → Synthesis
```

**Examples:**
- Client projects: Infrastructure setup + strategic analysis
- SEO strategies: Tracking setup + competitive analysis
- Content pipelines: Quality gates + multi-agent writing
- Web applications: CI/CD setup + architecture design

#### Key Principles

1. **No Hardcoding**: ANY agent in `.claude/agents/` can be invoked via Task tool
2. **Domain Flexibility**: Pattern works for content, SEO, client intelligence, web dev, healthcare, etc.
3. **Parallel Execution**: Independent tasks from ANY domain can run simultaneously
4. **Extensibility**: Add new agents by creating `.md` files - no code changes needed

**See [UNIVERSAL-AGENT-DELEGATION-PATTERN.md](UNIVERSAL-AGENT-DELEGATION-PATTERN.md) for complete details.**

---

## File Organization Rules

### CRITICAL: Clean File Structure
This system maintains zero file pollution through strict organizational rules:

#### Global Template System (READ-ONLY for Projects)
```
/orchestrai-system/templates/global/
├── wireframes/          # Web layouts, mobile patterns, dashboards
├── design-systems/      # Components, styles, brand templates
├── code-patterns/       # React components, APIs, schemas
└── content-templates/   # Copy frameworks, SEO, multi-language
```

#### Project Structure (Deliverables Only)
```
/projects/[project-uuid]/
├── client-intelligence/  # ICP profiles, branding, market research
├── deliverables/        # ONLY final outputs go here
│   ├── seo/            # Keyword research, competitor analysis
│   ├── content/        # Copy variations, multi-language content
│   ├── design/         # Wireframes, mockups, design systems
│   ├── development/    # Frontend, backend, deployment scripts
│   └── research/       # User insights, market analysis
├── project-metadata.json
└── crystalline-memory-index.json
```

#### Temporary Files (Safe to Delete)
```
/temp/
├── processing/         # Agent processing files (24h cleanup)
├── downloads/          # Downloaded files (7d cleanup)
└── cache/             # Performance cache (30d cleanup)
```

### File Path Validation Rules
1. **Templates**: Only accessed from `/orchestrai-system/templates/global/`
2. **Deliverables**: Only written to `/projects/[uuid]/deliverables/`
3. **Temp Files**: Only written to `/temp/` subdirectories
4. **No Cross-Contamination**: Templates never mixed with project files

### CRITICAL: Client Project Coherence Rules
All work for a single client MUST remain within the same project structure:

#### Project Continuity Principles
1. **Single Client = Single Project Folder**: All deliverables for one client belong in their existing `/projects/[client-uuid]/` directory
2. **No Separate Project Creation**: When adding new deliverables (SEO research, content, design) to an existing client, always use their established project folder
3. **Memory System Integration**: New deliverables must be integrated into the client's existing crystalline memory system, not create separate memory entities
4. **Asset Organization**: All related assets (branding, research, content) must be consolidated under the client's deliverables structure

#### Examples of CORRECT Behavior
- QuartzIQ keyword research → `/projects/quartziq-[uuid]/deliverables/seo/`
- QuartzIQ homepage content → `/projects/quartziq-[uuid]/deliverables/content/`
- QuartzIQ branding assets → `/projects/quartziq-[uuid]/client-intelligence/assets/`

#### Examples of INCORRECT Behavior
- Creating new project folder for keyword research when client project exists
- Separate memory entities for related client deliverables
- Multiple project UUIDs for the same client engagement

#### Crystalline Memory Integration Rules
1. **Existing Client Entities**: Always add observations to existing client memory entities
2. **Related Asset Connections**: Create proper memory relations between new deliverables and existing client intelligence
3. **Project Lifecycle Preservation**: Maintain the established memory pool architecture and access patterns
4. **Context Preservation**: Ensure all new deliverables reference and build upon existing client knowledge

---

## Domain Agents

### Web Development Domain
- **Wireframe Designer**: Creates layouts using global templates
- **UX Designer**: Designs interfaces with brand consistency
- **Frontend Developer**: Builds React components with TypeScript
- **Backend Developer**: Creates APIs and database schemas
- **QA Agent**: Tests and validates all deliverables

### Content & Research Domain
- **Multi-Language Writer**: Creates content in EN, ES, NL, DE, SL
- **SEO Specialist**: Keyword research and optimization
- **Research Agent**: Psychographic and semantic analysis
- **Content Strategist**: Plans and coordinates content workflows

### System Domains
- **Main Orchestrator**: Geometric coordination and task delegation
- **Memory Coordinator**: Crystalline memory management
- **Pipeline Manager**: Shared workflow optimization
- **Maintenance Agent**: System health and optimization

**See [.claude/agents/](.claude/agents/) for complete list of 89 specialized agents.**

---

## Technology Stack

### CRITICAL: Web Development Technology Choice Principles

#### Principle of Appropriate Complexity
**RULE: Always choose the simplest solution that meets the project requirements**

```
Static Content = Static HTML + Tailwind CSS + Modern Libraries
Dynamic Content = Next.js/React + ShadCN UI + TypeScript
Server Logic = Node.js + Express + Database Integration
```

#### Technology Decision Matrix

| Project Type | Recommended Stack | Avoid Over-Engineering |
|-------------|------------------|----------------------|
| **Landing Pages** | Static HTML + Tailwind + MagicUI + D3.js | ❌ Next.js unless SSR needed |
| **Marketing Sites** | Static HTML or Gatsby | ❌ Full-stack frameworks |
| **Web Applications** | Next.js + ShadCN UI + TypeScript | ✅ Appropriate complexity |
| **Dashboards** | Next.js + Real-time features | ✅ Justified framework use |

#### Static-First Development Rules
1. **Default to Static**: Start with static HTML unless dynamic features are explicitly required
2. **No Server for Static**: Static HTML files work perfectly without development servers
3. **Library Integration**: Use Tailwind CSS, MagicUI components, D3.js, Paper.js for rich interactions
4. **Progressive Enhancement**: Add complexity only when business requirements demand it

#### Anti-Patterns to Avoid
```
❌ WRONG: "I'll use Next.js for this landing page"
✅ CORRECT: "This landing page works perfectly with static HTML"

❌ WRONG: "We need a development server to view this static site"
✅ CORRECT: "Static HTML opens directly in browsers"

❌ WRONG: "Let's add React components for simple content"
✅ CORRECT: "Static HTML with JavaScript libraries handles this"
```

### System Architecture Stack

#### Frontend (For Dynamic Applications Only)
- **Framework**: Next.js 15 with App Router (when SSR/dynamic features needed)
- **UI Library**: ShadCN UI for flexibility and customization
- **Visualization**: D3.js v7 for advanced semantic clustering
- **Styling**: Tailwind CSS with custom ORCHESTRAI themes
- **Real-time**: WebSocket connections for live updates

#### Static Web Development (Default Choice)
- **Structure**: Semantic HTML5 with proper accessibility
- **Styling**: Tailwind CSS with custom brand configurations
- **Interactions**: MagicUI components (orbiting, ripples, animated beams)
- **Visualization**: D3.js v7 for data visualization and charts
- **Animation**: Paper.js for advanced canvas effects and particles
- **Icons**: Lucide React or Heroicons for consistent iconography

#### Backend (Node.js + TypeScript)
- **Runtime**: Node.js with TypeScript throughout
- **Memory**: Redis for crystalline memory and pipeline sharing
- **Database**: PostgreSQL for structured data
- **Vector DB**: For semantic search and clustering
- **Queues**: Message queues for async agent communication

#### MCP Server Integration
- **Sequential Thinking**: Advanced problem-solving coordination
- **Ref.tools**: Documentation access for hallucination prevention
- **Custom DATAforSEO**: SEO data integration
- **Memory MCP**: Persistent knowledge graphs
- **Template MCP**: Global template access and analytics
- **MagicUI MCP**: Component library for static sites

---

## Development Workflow

### Starting Development
1. Copy `.env.example` to `.env` and configure API keys
2. Run `npm install` to install dependencies
3. Start Redis: `npm run redis`
4. Start development server: `npm run dev`
5. Access dashboard at `http://localhost:3000`

### Content Creation Workflow

**MANDATORY: All content creation must use specialized agents via Task tool**

#### Quick Reference:
1. **Research & Analysis**: Review psychographic data, competitive analysis, keywords
2. **Outline Creation**: Create comprehensive outline with TodoWrite tracking
3. **Outline Approval**: STOP POINT - get explicit approval before proceeding
4. **Article Writing**: Use Task tool with appropriate specialized agent:
   - `content-writer-specialist` (general content)
   - `healthcare-content-specialist` (healthcare)
   - `technical-documentation-specialist` (technical)
5. **Quality Assurance**: Run content-ai-phrase-detector (<30% detection threshold)
6. **Iterative Revision**: Apply natural flow validation and compliance checks

**See [CONTENT-CREATION-GUIDE.md](CONTENT-CREATION-GUIDE.md) for complete workflow details, quality checklists, and agent prompting strategies.**

### Agent Development Guidelines
1. **Use Global Templates**: Always reference global templates, never duplicate
2. **Write to Deliverables**: Only write final outputs to project deliverables
3. **Respect File Structure**: Follow strict path validation rules
4. **Leverage Crystalline Memory**: Store and retrieve context efficiently
5. **Coordinate Geometrically**: Use spatial positioning for communication
6. **Apply Appropriate Complexity**: Choose the simplest technology solution that meets requirements
7. **Static-First Development**: Default to static HTML unless dynamic features are explicitly needed
8. **Avoid Over-Engineering**: Never suggest servers, frameworks, or backend systems for static content
9. **Universal Agent Pattern**: Use Task tool for ANY specialized agent, not just content

### CRITICAL: Agent Orchestration File Handling Rules
When orchestrating agents for client work, these rules are MANDATORY:

#### Pre-Orchestration Checks
1. **Client Project Search**: ALWAYS search for existing client projects before creating new ones
2. **UUID Verification**: Use existing client project UUID for all related deliverables
3. **Memory System Check**: Verify existing crystalline memory entities for the client
4. **Asset Inventory**: Review existing deliverables to understand project context

#### Agent Deployment Protocol
1. **Target Directory Specification**: Always specify the existing client project directory in agent prompts
2. **Memory Integration Instructions**: Instruct agents to integrate with existing client memory entities
3. **Context Preservation**: Ensure agents reference existing client intelligence and deliverables
4. **Relationship Mapping**: Create proper memory relations between new and existing assets

#### Examples of Correct Agent Instructions
```
CORRECT: "Create SEO research for QuartzIQ and save to /projects/quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010/deliverables/seo/"

CORRECT: "Integrate findings into existing QuartzIQ memory entities and create relations to ICP analysis"

INCORRECT: "Create new project for QuartzIQ SEO research"

INCORRECT: "Create separate memory entities for this research"
```

#### Agent Instruction Templates
- Always include existing project path in file creation instructions
- Always specify memory integration requirements
- Always reference existing client intelligence for context
- Always create proper entity relationships in memory system

### Code Standards
- **TypeScript**: All code must be typed
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Testing**: Jest for unit tests, comprehensive coverage
- **Documentation**: JSDoc comments for all functions

---

## Dashboard Features

### Real-Time Monitoring
- **Agent Status**: Live view of all agent activities
- **Crystalline Memory**: 3D visualization of memory lattice
- **Pipeline Flow**: Visual representation of shared workflows
- **Geometric Positions**: Real-time agent spatial mapping

### Analytics & Insights
- **Token Usage**: Per-agent, per-session, and cumulative tracking
- **Performance Metrics**: Speed, accuracy, efficiency measurements
- **Template Analytics**: Usage patterns and optimization opportunities
- **ROI Visualization**: Business value and efficiency gains

### Interactive Features
- **Memory Exploration**: Click through crystalline memory nodes
- **Agent Communication**: View inter-agent message flows
- **Template Browsing**: Explore and analyze global templates
- **Project Tracking**: Monitor deliverable progress

---

## Semantic Visualization (D3.js)

### Topic Clustering
- **LSA Integration**: Latent Semantic Analysis for content clustering
- **Interactive Exploration**: Click and drill-down capabilities
- **Multi-dimensional Mapping**: Complex semantic relationships
- **Real-time Updates**: Live clustering as agents work

### Psychographic Visualization
- **ICP Mapping**: Interactive customer profile relationships
- **Cultural Clustering**: Multi-language content analysis
- **Intent Networks**: User intent and behavior visualization
- **Demographic Segmentation**: Market analysis visualization

---

## Performance Optimization

### Crystalline Memory Benefits
- **45% Faster Problem Resolution**: Geometric orchestration efficiency
- **60% More Accurate Outcomes**: Pipeline sharing intelligence
- **90.2% Performance Improvement**: Hybrid architecture benefits
- **38% Increase in Planning Tasks**: Advanced memory architecture

### System Efficiency
- **Template Reuse**: 70% reduction in duplicate work
- **Clean Organization**: Zero file pollution and confusion
- **Parallel Processing**: Multiple agents working simultaneously
- **Intelligent Routing**: Optimal communication paths

---

## Security & Compliance

### Data Protection
- **Environment Variables**: All API keys in environment configuration
- **Path Validation**: Strict file access controls
- **Sandboxed Execution**: Isolated agent environments
- **Encrypted Communication**: Secure inter-agent messaging

### File Safety
- **Temp Folder**: Safe deletion without data loss
- **Backup Systems**: Automatic project backup and versioning
- **Access Controls**: Domain-specific file permissions
- **Audit Logging**: Complete file operation tracking

---

## Troubleshooting

### Common Issues
1. **File Not Found**: Check path validation rules
2. **Template Access**: Ensure using global template paths
3. **Memory Issues**: Verify Redis connection and configuration
4. **Agent Communication**: Check geometric orchestration setup

### Debug Tools
- **Dashboard Logs**: Real-time error monitoring
- **Memory Inspector**: Crystalline memory visualization
- **Pipeline Debugger**: Shared workflow analysis
- **Agent Tracer**: Individual agent activity tracking

---

## Support Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # TypeScript validation
npm run lint         # Code quality checks
npm run test         # Run test suite
```

### System Management
```bash
npm run orchestrator # Start main orchestrator
npm run redis       # Start Redis server
npm run setup       # Complete setup process
```

---

## Claude Code Hooks Integration

The ORCHESTRAI system provides comprehensive workflow tracking and analytics through Claude Code hooks integration.

### Available Webhook Endpoints
**Base URL**: `http://localhost:5501`

- `POST /hooks/user-prompt-submit` - User prompt submission
- `POST /hooks/task-start` - Task initiation
- `POST /hooks/task-complete` - Task completion
- `POST /hooks/tool-call` - Tool usage tracking
- `POST /hooks/token-usage` - AI model token consumption

### Workflow Analytics Features
1. **Intent Recognition**: Automatically categorizes tasks
2. **Agent Recommendations**: Suggests optimal agents based on task type
3. **Cost Projections**: Real-time cost estimates and projections
4. **Performance Tracking**: Efficiency metrics and optimization suggestions
5. **Resource Monitoring**: Agent health and usage patterns

**See [CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md) for complete hook configuration, management endpoints, and testing instructions.**

---

## Contributing Guidelines

1. **Follow Architecture**: Respect crystalline memory and geometric patterns
2. **Maintain Organization**: Keep files in designated folders
3. **Use Templates**: Leverage global templates for consistency
4. **Document Changes**: Update CLAUDE.md for significant changes
5. **Test Thoroughly**: Ensure all agent interactions work correctly

---

## Best Practices

### Agent Development
- **Specialized Focus**: Each agent handles one domain expertly
- **Memory Efficiency**: Use crystalline memory for context storage
- **Template Utilization**: Always use global templates
- **Clean Outputs**: Write only final deliverables to project folders
- **Technology Appropriateness**: Match complexity to actual requirements
- **Static-First Mindset**: Default to simple HTML unless dynamic features needed

### Web Development Anti-Patterns (AVOID THESE)
- **Over-Engineering Landing Pages**: Using React/Next.js for static content
- **Unnecessary Development Servers**: Suggesting servers for static HTML
- **Framework Addiction**: Choosing complex stacks for simple requirements
- **Backend for Static Content**: Adding server-side logic when client-side suffices
- **Premature Optimization**: Adding features not required by project scope

### Technology Selection Principles
- **Requirements Analysis First**: Understand what features are actually needed
- **Progressive Enhancement**: Start simple, add complexity only when justified
- **Static HTML Baseline**: Can this work with just HTML/CSS/JS? Start there.
- **Library vs Framework**: Prefer lightweight libraries over full frameworks when possible
- **No Server Unless Required**: Static files work fine without development servers

### System Integration
- **MCP Utilization**: Leverage all available MCP servers
- **Pipeline Sharing**: Share computational workflows where possible
- **Geometric Coordination**: Optimize agent positioning and communication
- **Continuous Learning**: Enable cross-agent knowledge sharing
- **Complexity Awareness**: Question every technology decision for appropriateness

---

## Additional Documentation

- **[UNIVERSAL-AGENT-DELEGATION-PATTERN.md](UNIVERSAL-AGENT-DELEGATION-PATTERN.md)** - Complete guide to domain-agnostic agent invocation
- **[CONTENT-CREATION-GUIDE.md](CONTENT-CREATION-GUIDE.md)** - Detailed content creation workflow, quality checklists, and prompting strategies
- **[CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md)** - Hook configuration and workflow analytics
- **[tests/hybrid-delegation-test-workflow.md](tests/hybrid-delegation-test-workflow.md)** - Testing guide for hybrid delegation system
- **[HYBRID-DELEGATION-QUICK-START.md](HYBRID-DELEGATION-QUICK-START.md)** - Quick start guide for orchestrai-master-coordinator
- **[ORCHESTRAI-IMPLEMENTATION-PLAN.md](ORCHESTRAI-IMPLEMENTATION-PLAN.md)** - Complete implementation roadmap

---

This documentation serves as the definitive guide for developing and maintaining ORCHESTRAI. Always refer to this document when working with the system to ensure consistency and optimal performance.
