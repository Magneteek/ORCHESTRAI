# Create New Specialized Agent

**Usage**: `/create-agent [agent-purpose]`

Create a new specialized agent following ORCHESTRAI architecture principles.

## Agent Creation Workflow

### Step 1: Agent Planning
Ask the user:
1. **Agent Purpose**: What specific task does this agent handle?
2. **Domain**: Which domain does it belong to? (content, seo, webdev, research, etc.)
3. **Tools Needed**: What tools should it have access to?
4. **Integration**: How does it coordinate with other agents?

### Step 2: Name Generation
Create appropriate naming:
- **Filename**: `kebab-case-specialist.md`
- **Subagent Type**: `lowercase-with-hyphens`
- **Display Name**: `Proper Case Specialist`

### Step 3: Agent Definition Structure
```markdown
# [Agent Display Name]

[Clear 1-2 sentence description]

## Core Responsibilities
[Bulleted list of what agent does]

## Tools Available
[List of tools this agent can use]

## Integration Points
[How it works with other agents]

## Quality Standards
[Specific quality criteria]

## Output Requirements
[What deliverables it produces]
```

### Step 4: Validate Against Standards
Check compliance with:
- [ ] File organization rules (CLAUDE.md)
- [ ] Appropriate technology complexity
- [ ] Crystalline memory integration
- [ ] Universal delegation pattern compatibility
- [ ] No duplicate functionality with existing agents

### Step 5: Test Agent
1. Create test task for the new agent
2. Verify it follows architecture principles
3. Check deliverable quality
4. Confirm proper tool usage
5. Validate memory system integration

## Critical Principles to Follow

### Technology Appropriateness
- Static-first development for web content
- No over-engineering (avoid Next.js for static sites)
- Match complexity to actual requirements

### File Organization
- Use global templates (read-only)
- Write only to deliverables folders
- No file pollution in project root or temp

### Memory System
- Create entities appropriately
- Use existing entities when available
- Proper relation mapping

## Output
Provide:
1. **Agent file path**: Where it was created
2. **Agent definition**: Complete markdown content
3. **Test example**: How to invoke it via Task tool
4. **Integration notes**: How it fits with existing agents
