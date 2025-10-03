# ORCHESTRAI - Advanced Multi-Agent System

## Project Overview

ORCHESTRAI is a cutting-edge self-iterating multi-agent orchestration system implementing crystalline memory architecture, pipeline sharing, and geometric orchestration patterns. This system creates a revolutionary approach to AI agent coordination with enterprise-grade file organization and advanced semantic visualization.

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

## Development Workflow

### Starting Development
1. Copy `.env.example` to `.env` and configure API keys
2. Run `npm install` to install dependencies
3. Start Redis: `npm run redis`
4. Start development server: `npm run dev`
5. Access dashboard at `http://localhost:3000`

### MANDATORY CONTENT CREATION WORKFLOW
**CRITICAL: All content creation MUST follow this exact sequence - NO EXCEPTIONS**

#### Phase 1: Research & Analysis (Always Required)
1. **Psychographic Research**: Review existing client psychographic data and segmentation
2. **Competitive Analysis**: Analyze existing cluster content and identify gaps
3. **Keyword Integration**: Identify target keywords and semantic relationships
4. **Memory System Review**: Check existing crystalline memory entities and relationships

#### Phase 2: Outline Creation (MANDATORY BEFORE WRITING)
1. **Create Comprehensive Outline**: Use `[topic]-comprehensive-outline.md` naming convention
2. **TodoWrite Checkpoint**: Mark "Create article outline" as IN_PROGRESS
3. **Psychographic Integration**: Specify targeting for each section (percentages and emotional tones)
4. **Keyword Mapping**: Define primary/secondary keyword placement and density
5. **Word Count Planning**: Specify exact word counts for each H2/H3 section
6. **Internal Linking Architecture**: Plan connections to existing cluster content
7. **CTA Strategy**: Define call-to-action placement and messaging per psychographic segment

#### Phase 3: Outline Approval (MANDATORY CHECKPOINT)
1. **TodoWrite Update**: Mark outline as COMPLETED only after explicit approval
2. **Review Requirements**: Outline must be reviewed and approved before proceeding
3. **Validation Check**: Ensure all psychographic targeting and keyword integration is planned
4. **STOP POINT**: DO NOT proceed to writing without explicit approval

#### Phase 4: Article Writing (Only After Approval) - MANDATORY AGENT USAGE
1. **TodoWrite Checkpoint**: Mark "Write full article" as IN_PROGRESS
2. **MANDATORY: Use Task Tool with content-writer-specialist**: Never write articles directly with Write tool
3. **Specialized Agent Instructions**: Provide comprehensive outline and requirements to content-writer-specialist
4. **Natural Flow First**: Agent writes conversationally, guiding readers through their concerns naturally
5. **Follow Outline Structure**: Agent implements planned sections while maintaining conversational flow
6. **Psychographic Integration**: Agent executes planned emotional tones through natural language
7. **Keyword Implementation**: Agent integrates keywords naturally within conversational flow
8. **CRITICAL Content Architecture**: Agent follows mandatory paragraph distribution and natural writing flow requirements

#### Phase 5: Content Flow Review & Optimization (NEW MANDATORY STEP)
1. **Natural Flow Audit**: Review entire article for conversational flow and natural transitions
2. **Quality Assurance Checklist**: Apply comprehensive readability and engagement checks
3. **SEO Optimization**: Final keyword placement within natural language flow
4. **Memory Integration**: Update crystalline memory with new content relationships
5. **Internal Linking**: Implement planned internal linking architecture
6. **Final Validation**: Ensure all psychographic, SEO, and natural writing requirements are met

#### Phase 6: Iterative Revision Process (WHEN NEEDED)
1. **Flow Assessment**: If content feels robotic or forced, apply iterative revision
2. **Transition Enhancement**: Strengthen paragraph connections and reader journey
3. **Voice Refinement**: Adjust tone for more natural, conversational feel
4. **Final Polish**: Ensure content sounds like expert conversation, not academic paper

### MANDATORY ITERATIVE REVISION PROCESS
**CRITICAL: NEVER consider any content "complete" without following this multi-stage revision process**

#### Stage 1: Initial Content Creation
1. **Write First Draft**: Focus on covering all Content Requirements in paragraph form
2. **IMMEDIATE PAUSE**: Do NOT call content complete after first draft
3. **Self-Assessment Checkpoint**: Does this feel natural and conversational?
4. **Flag Issues**: Note any sections that feel robotic or formulaic

#### Stage 2: Paragraph Distribution Analysis (MANDATORY)
**Must perform this analysis on every article:**

1. **Count All Paragraphs**: Systematically count every paragraph in the article
2. **Categorize by Length**:
   - **Short**: 1-2 sentences (15-30 words)
   - **Medium**: 3-5 sentences (30-70 words)  
   - **Long**: 6+ sentences (70+ words)
3. **Calculate Distribution**:
   - Target: 40% short, 40% medium, 20% long
   - If distribution is off by >10%, MUST revise
4. **Break Up Long Paragraphs**: Split overly long paragraphs into shorter, punchier segments
5. **Add Engagement Elements**: Insert tables, boxes, bullet points for variety

#### Stage 3: Content Type Variety Check (MANDATORY)
**Every article must include diverse content types:**

1. **Paragraph Text**: Main narrative content ✓
2. **Engagement Elements**: 
   - Comparison tables (at least 1)
   - Information boxes or callouts (2-3)
   - Occasional bullet point lists (maximum 16-20 total)
   - Timeline elements or step-by-step boxes
3. **Visual Breaks**: Ensure no more than 3-4 paragraphs in a row without variety
4. **Bold Text Audit**: Remove structural bold text, keep only true emphasis

#### Stage 4: Natural Flow Validation (MANDATORY)
1. **Read-Aloud Test**: Does it sound conversational when spoken?
2. **Transition Check**: Does each paragraph connect naturally to the next?
3. **Reader Journey**: Would someone feel guided and informed, not overwhelmed?
4. **Psychographic Alignment**: Does tone match target audience expectations?

#### Stage 5: Final Compliance Verification (MANDATORY)
**Complete this checklist before marking ANY content as "done":**

□ **LANGUAGE CONSISTENCY**: Pure target language throughout, no mixing or English words
□ All Content Requirements covered in paragraph form (not lists)
□ Paragraph distribution: 40% short, 40% medium, 20% long (±5% tolerance)
□ Content variety: Tables, boxes, engagement elements included
□ Bold text: Used sparingly for emphasis only
□ Natural transitions between all sections
□ Conversational tone throughout
□ Psychographic targeting properly implemented
□ Word count within target range
□ Supporting keywords naturally integrated

**IF ANY BOX UNCHECKED = CONTENT IS NOT COMPLETE**

#### Enforcement Protocol:
- **No exceptions**: Every piece of content follows this process
- **TodoWrite tracking**: Each stage must be tracked as separate todo items
- **Quality over speed**: Better to take time for proper revision than publish poor content
- **Document issues**: When revisions are needed, clearly explain what was wrong

### COMPREHENSIVE QUALITY ASSURANCE CHECKLIST
**MANDATORY: Apply this checklist to every article before marking as complete**

#### ✅ Natural Flow and Readability Assessment
- **Paragraph Flow Test**: Does each paragraph naturally lead to the next?
- **Transition Quality**: Are there smooth bridges between topics and sections?
- **Conversational Tone**: Does it sound like a knowledgeable friend explaining the topic?
- **Reader Journey**: Can you follow the logical progression without confusion?
- **Voice Consistency**: Does the tone remain consistent and engaging throughout?

#### ✅ Content Architecture Compliance
- **Paragraph Distribution**: 40% short / 40% medium / 20% long paragraphs achieved?
- **Bold Text Usage**: Used sparingly (max 10-15 instances) for true emphasis only?
- **List Limitations**: Maximum 16-20 bulleted lists total across entire article?
- **Table Integration**: 4-6 tables maximum, used for comparison or data presentation?
- **Visual Breaks**: Adequate spacing and formatting variety for readability?

#### ✅ Language and Engagement Quality
- **Natural Sentence Variety**: Mix of short, medium, and long sentences throughout?
- **Question Integration**: Rhetorical questions used to engage readers naturally?
- **Reader Address**: Direct "you" language used appropriately throughout?
- **Relatable Examples**: Real-world scenarios and situations included?
- **Empathy Expression**: Reader concerns and emotions acknowledged and addressed?

#### ✅ Structural and SEO Requirements
- **Keyword Integration**: Primary keywords integrated naturally, not forced?
- **Semantic Flow**: Related terms and concepts woven naturally into text?
- **Internal Linking**: Planned connections to other cluster content included?
- **Psychographic Targeting**: Content addresses specific segment concerns naturally?
- **Call-to-Action**: CTAs integrated naturally within content flow?

#### ✅ Final Validation Checklist
- **Read-Aloud Test**: Does the content sound natural when read aloud?
- **Expert-Friend Balance**: Professional expertise delivered with approachable warmth?
- **Information Hierarchy**: Most important information emphasized naturally?
- **Reader Value**: Does every paragraph provide clear value to the target audience?
- **Conversion Optimization**: Does content guide readers toward desired actions naturally?

#### 🚨 Red Flags - IMMEDIATE REVISION REQUIRED
- Every paragraph starts with bold text
- Abrupt topic jumps without transitions
- Formulaic sentence structures repeated throughout
- Excessive lists dominating the content
- Robotic or academic tone instead of conversational
- Missing emotional connection or reader empathy
- Keyword stuffing or unnatural keyword placement
- Information presented without clear reader benefit

### MANDATORY CONTENT ARCHITECTURE STANDARDS

#### Content Formatting Rules - CRITICAL INTERPRETATION
**These rules prevent list over-usage and ensure proper paragraph flow:**

1. **Content Requirements vs. Engagement Elements in Outlines**:
   - **Content Requirements** = Information to cover in PARAGRAPH FORM (flowing text)
   - **Engagement Elements** = Optional formatting enhancements (tables, boxes, occasional lists)
   - **NEVER convert Content Requirements into bulleted lists**

2. **Paragraph Distribution (MANDATORY)**:
   - **40% Short Paragraphs** (1-2 sentences): Quick, punchy information
   - **40% Medium Paragraphs** (3-4 sentences): Main content flow, explanations
   - **20% Long Paragraphs** (5+ sentences): Detailed explanations, storytelling

3. **Content Element Limits (STRICT ENFORCEMENT)**:
   - **Bulleted Lists**: Maximum 16-20 total per article (2-3 per H2 section)
   - **Numbered Lists**: Maximum 8-12 total per article
   - **Tables**: 6-8 comparison tables maximum
   - **Callout Boxes**: 15-18 boxes for engagement
   - **Statistics Boxes**: 6-8 boxes for credibility

4. **List Usage Guidelines**:
   - Use lists ONLY for: step-by-step processes, feature comparisons, key takeaways
   - AVOID lists for: general information, explanations, benefits descriptions
   - Convert outline "Content Requirements" into flowing paragraph narrative
   - Reserve lists for genuine "Engagement Elements" enhancements

5. **Content Flow Principles**:
   - Each H3 section should read as natural, flowing text
   - Break up long paragraphs with occasional engagement elements
   - Maintain readability while avoiding choppy, list-heavy structure
   - Tell a story, don't just present information

### NATURAL WRITING FLOW REQUIREMENTS
**CRITICAL: These guidelines ensure human-like, conversational content that builds trust and engagement**

#### 1. Conversational Flow and Transitions
- **Seamless Paragraph Connections**: Each paragraph must flow naturally to the next using transition phrases
- **Bridge Sentences**: Use connecting thoughts like "Building on this...", "However, there's more to consider...", "This brings us to..."
- **Reader Journey**: Create a conversational path through topics, not abrupt topic jumps
- **Natural Progression**: Information should build logically, addressing reader concerns in sequence

#### 2. Varied and Natural Sentence Structure
- **Mixed Sentence Lengths**: Combine short punchy statements (3-6 words) with flowing explanations (15-25 words) and detailed descriptions (25+ words)
- **AVOID Formulaic Openings**: NEVER start every paragraph with bold text - this creates robotic reading
- **Question Integration**: Use rhetorical questions to engage readers: "But what does this mean for you?", "Why is this important?"
- **Conversational Markers**: Include natural speech patterns: "Here's what most people don't realize...", "The truth is...", "What's interesting is..."

#### 3. Authentic Paragraph Rhythm (Enhanced Distribution)
- **Short Paragraphs (1-2 sentences)**: For impact, emphasis, and attention-grabbing statements
- **Medium Paragraphs (3-5 sentences)**: For explanations, main content flow, and connecting ideas
- **Long Paragraphs (6+ sentences)**: For complex topics, storytelling, detailed analyses, and building rapport
- **NO Formulaic Patterns**: Avoid predictable paragraph structures that feel mechanical

#### 4. Reader-Centric and Relatable Language
- **Direct Address**: Speak directly to the reader using "you", "your", "when you're considering..."
- **Relatable Scenarios**: Include realistic situations: "Imagine sitting in the dentist's chair wondering...", "Most people feel overwhelmed when..."
- **Empathy and Understanding**: Acknowledge reader concerns: "It's completely normal to worry about...", "Many patients tell us they feel..."
- **Expert-Friend Tone**: Balance professional expertise with approachable, conversational warmth

#### 5. Strategic Emphasis and Formatting
- **Minimal Bold Usage**: Use bold text ONLY for true emphasis and key takeaways, not paragraph starters
- **Natural Emphasis**: Let conversational language and story flow carry the content weight
- **Varied Formatting**: Mix paragraph text with occasional tables, quotes, or callouts for visual breaks
- **Organic Integration**: Formatting should feel natural, not forced or formulaic

#### 6. Storytelling and Engagement Elements
- **Patient Stories**: Include realistic scenarios and examples that readers can relate to
- **Problem-Solution Flow**: Start with reader concerns, build understanding, then provide solutions
- **Emotional Connection**: Address fears, hopes, and practical concerns with genuine understanding
- **Credible Expertise**: Demonstrate knowledge through experience sharing, not just facts listing

### ENHANCED AGENT PROMPTING STRATEGY
**CRITICAL: Use these improved prompting approaches for natural, conversational content creation**

#### Traditional Prompting (AVOID THESE)
❌ **"Write paragraphs covering these content requirements"**
❌ **"Create content about the following topics"**
❌ **"Cover these points in paragraph form"**
❌ **"Write about: topic A, topic B, topic C"**

#### Enhanced Conversational Prompting (USE THESE)
✅ **"Write a natural, conversational section that guides the reader through [topic]. Start with their main concerns about [specific worry], build understanding progressively, and connect each idea to the next. Make it sound like an expert friend explaining this over coffee."**

✅ **"Create content that addresses the reader's journey from [starting point] to [end goal]. Use varied sentence length, avoid formulaic bold text, and ensure each paragraph flows naturally to the next. Think of yourself as a trusted advisor having a conversation."**

✅ **"Develop this section as if you're answering questions from someone who is [psychographic description]. Address their specific concerns about [topic], use language they relate to, and guide them through the information in a way that builds confidence and trust."**

#### Specific Prompting Templates by Content Type

**For Explanatory Sections:**
*"Explain [topic] conversationally, starting with why the reader should care, then building understanding step-by-step. Use natural transitions, vary your sentence structure, and include relatable examples. Make complex information accessible without dumbing it down."*

**For Comparison Sections:**
*"Guide the reader through comparing [option A] vs [option B] as if you're helping a friend make this decision. Start with what they're probably wondering about, address their concerns naturally, and help them understand the real-world implications."*

**For Process/Procedure Sections:**
*"Walk the reader through [process] conversationally, addressing their likely anxieties and questions as you go. Don't just list steps - explain what each step means for them, why it matters, and what to expect."*

**For Cost/Pricing Sections:**
*"Help the reader understand [pricing topic] with the transparency and empathy they need when making financial decisions. Address their budget concerns, explain value naturally, and guide them toward informed choices without pressure."*

#### Content Review Prompting
**Instead of:** *"Review this content for errors"*
**Use:** *"Review this content for natural conversational flow. Does it sound like a knowledgeable friend explaining this topic? Are transitions smooth? Does each paragraph connect naturally to the next? Would someone feel comfortable and informed reading this?"*

#### Examples of CORRECT vs. INCORRECT Implementation:

**✅ CORRECT Approach**:
```
H3: Napredni keramični materiali (250 words)
Content Requirements: Cirkonij vs. titanij primerjava, materialne lastnosti

WRITE AS: 2-3 flowing paragraphs explaining materials, their properties, 
and recommendations, with 1 comparison table as engagement element.
```

**❌ INCORRECT Approach**:
```
AVOID: Converting everything into bulleted lists:
- Cirkonij prednosti
- Titanij lastnosti  
- Biokompatibilnost
- Priporočila
(This creates 4+ lists from what should be paragraph content)
```

### WORKFLOW ENFORCEMENT RULES
- **NEVER write an article without creating and approving an outline first**
- **ALWAYS use TodoWrite to track and enforce workflow phases**
- **STOP at each checkpoint until explicitly approved to proceed**
- **NO EXCEPTIONS**: Any content creation that skips outline phase must be restarted
- **MANDATORY**: Follow content architecture standards - paragraph distribution and element limits

### Agent Development Guidelines
1. **Use Global Templates**: Always reference global templates, never duplicate
2. **Write to Deliverables**: Only write final outputs to project deliverables
3. **Respect File Structure**: Follow strict path validation rules
4. **Leverage Crystalline Memory**: Store and retrieve context efficiently
5. **Coordinate Geometrically**: Use spatial positioning for communication
6. **Apply Appropriate Complexity**: Choose the simplest technology solution that meets requirements
7. **Static-First Development**: Default to static HTML unless dynamic features are explicitly needed
8. **Avoid Over-Engineering**: Never suggest servers, frameworks, or backend systems for static content
9. **MANDATORY OUTLINE-FIRST**: Always create comprehensive outlines before any article writing

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

## Contributing Guidelines

1. **Follow Architecture**: Respect crystalline memory and geometric patterns
2. **Maintain Organization**: Keep files in designated folders
3. **Use Templates**: Leverage global templates for consistency
4. **Document Changes**: Update CLAUDE.md for significant changes
5. **Test Thoroughly**: Ensure all agent interactions work correctly

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

## Claude Code Hooks Integration

The ORCHESTRAI system provides comprehensive workflow tracking and analytics through Claude Code hooks integration.

### Available Webhook Endpoints

**Base URL**: `http://localhost:5501`

#### Workflow Tracking Hooks
- `POST /hooks/user-prompt-submit` - User prompt submission
- `POST /hooks/task-start` - Task initiation
- `POST /hooks/task-complete` - Task completion
- `POST /hooks/task-error` - Task error handling

#### Real-time Monitoring Hooks  
- `POST /hooks/tool-call` - Tool usage tracking
- `POST /hooks/mcp-call` - MCP server call monitoring
- `POST /hooks/token-usage` - AI model token consumption

#### Session Management Hooks
- `POST /hooks/session-start` - Session initialization
- `POST /hooks/session-end` - Session termination

### Hook Configuration

Configure Claude Code hooks by adding these to your hooks configuration:

```json
{
  "user-prompt-submit-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/user-prompt-submit",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "X-ORCHESTRAI-Source": "claude-code"
    },
    "payload": {
      "prompt": "{{prompt}}",
      "userId": "{{user_id}}",
      "timestamp": "{{timestamp}}",
      "sessionId": "{{session_id}}"
    }
  },
  
  "task-start-hook": {
    "type": "http", 
    "url": "http://localhost:5501/hooks/task-start",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "task": "{{task}}",
      "timestamp": "{{timestamp}}"
    }
  },

  "tool-call-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/tool-call", 
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "tool": "{{tool_name}}",
      "parameters": "{{tool_parameters}}",
      "duration": "{{duration_ms}}",
      "success": "{{success}}",
      "result": "{{result}}",
      "error": "{{error}}"
    }
  },

  "token-usage-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/token-usage",
    "method": "POST", 
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "model": "{{model_name}}",
      "inputTokens": "{{input_tokens}}",
      "outputTokens": "{{output_tokens}}",
      "timestamp": "{{timestamp}}"
    }
  },

  "task-complete-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/task-complete",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "result": "{{task_result}}",
      "timestamp": "{{timestamp}}"
    }
  }
}
```

### Management Endpoints

#### Get Hooks Status
```bash
curl http://localhost:5501/hooks/status
```

#### View Active Workflows
```bash
curl http://localhost:5501/hooks/workflows
```

#### Update Hook Configuration
```bash
curl -X PUT http://localhost:5501/hooks/config/task-start \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Test Hook Integration
```bash
# Simulate user prompt submission
curl -X POST http://localhost:5501/hooks/user-prompt-submit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a React component",
    "userId": "test-user",
    "sessionId": "test-session"
  }'
```

### Workflow Analytics Features

1. **Intent Recognition**: Automatically categorizes tasks (coding, research, analysis, etc.)
2. **Agent Recommendations**: Suggests optimal MCP servers based on task type
3. **Cost Projections**: Real-time cost estimates and projections
4. **Performance Tracking**: Efficiency metrics and optimization suggestions
5. **Resource Monitoring**: MCP server health and usage patterns

---

This documentation serves as the definitive guide for developing and maintaining ORCHESTRAI. Always refer to this document when working with the system to ensure consistency and optimal performance.