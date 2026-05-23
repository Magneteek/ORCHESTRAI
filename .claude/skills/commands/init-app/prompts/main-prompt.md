
### ADR-002: [Next Decision]

[To be filled as decisions are made]

---

## Decision Log

Query: "{{app-name}} architecture decisions"
```

### 9. Output Summary

After completing initialization, output:

```
✅ Application "{{app-name}}" initialized successfully!

📁 Location: /Users/kris/CLAUDEtools/ORCHESTRAI/applications/{{app-name}}/

🧠 Memory Entities Created:
   - {{app-name}} (Application)
   - {{app-name}} Architecture
   - {{app-name}} Development History

📋 Next Steps:

1. Define requirements:
   cd applications/{{app-name}}/planning
   # Edit requirements.md with product vision

2. Run planning agents:
   Task(subagent_type="client-icp-analyst", prompt="Analyze target users for {{app-name}}")
   Task(subagent_type="wireframe-creation-specialist", prompt="Create wireframes for {{app-name}}")

3. Design architecture:
   Task(subagent_type="frontend-architect-specialist", prompt="Design {{app-name}} frontend architecture")
   Task(subagent_type="api-architect", prompt="Design {{app-name}} API architecture")

4. Begin development:
   npm install
   npm run dev

📚 Documentation:
   - README: applications/{{app-name}}/README.md
   - Architecture: applications/{{app-name}}/docs/ARCHITECTURE.md
   - Development: applications/{{app-name}}/docs/DEVELOPMENT.md

🧩 ORCHESTRAI Integration:
   - Memory helpers: src/orchestrai/memory-integration.ts
   - Agent hooks: src/orchestrai/agent-hooks.ts

💾 Query Development History:
   Search ORCHESTRAI memory for: "{{app-name}}"
```

### 10. Prompt User for Next Action

Ask the user:

```
🎯 What would you like to do next?

1. Define requirements (I'll help you fill in planning/requirements.md)
2. Run planning agents (User research, wireframes, architecture)
3. Start coding immediately (if requirements are clear)
4. Set up development environment (install dependencies, configure tools)

Choose 1-4 or describe what you want to work on.
```

## Important Notes

### Memory-First Approach
- Always create memory entities BEFORE creating files
- Agents can query memory to understand project context
- Each significant decision should be documented in memory

### File Structure Flexibility
- Adjust structure based on app-type and tech-stack
- User can customize after initialization
- Structure follows industry best practices

### Agent Coordination
- Memory system enables agents to build on each other's work
- Each agent can query what previous agents decided
- Reduces redundant work and conflicting approaches

### Learning System
- Success/failure patterns stored in memory
- Future agents learn from past projects
- ORCHESTRAI becomes progressively smarter

---

**Command Created**: Use `/init-app app-name --app-type=web-app --tech-stack=nextjs`
