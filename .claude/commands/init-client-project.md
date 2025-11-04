# Initialize New Client Project

**Usage**: `/init-client-project [client-name]`

You are initializing a new client project in the ORCHESTRAI system. Follow this workflow:

## Step 1: Project Setup
1. Generate a unique project UUID
2. Create project directory structure:
   ```
   /projects/[client-name]-[uuid]/
   ├── client-intelligence/
   ├── deliverables/
   │   ├── seo/
   │   ├── content/
   │   ├── design/
   │   ├── development/
   │   └── research/
   ├── project-metadata.json
   └── crystalline-memory-index.json
   ```

## Step 2: Client Intelligence Gathering
1. Ask user for:
   - Client name and industry
   - Primary business objectives
   - Target audience
   - Competitive landscape

## Step 3: Memory System Initialization
1. Create client entity in crystalline memory
2. Set up memory relations for:
   - Business context
   - Competitive intelligence
   - Target audience insights

## Step 4: First Deliverable Planning
Ask the user: "What would you like to work on first?"
- SEO research and strategy
- Content creation
- Website development
- Market research

## Critical Rules
- **ALWAYS use the existing project folder** for all future client work
- **NEVER create separate projects** for the same client
- **UPDATE memory entities** rather than creating new ones
- **MAINTAIN coherent file structure** per CLAUDE.md rules

Generate a project summary showing:
- Project UUID
- Directory structure created
- Memory entities initialized
- Next recommended steps
