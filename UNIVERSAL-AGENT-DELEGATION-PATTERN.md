# Universal Agent Delegation Pattern
## How ORCHESTRAI Works Across ALL Domains

---

## Core Principle

**The Task tool + specialized agents pattern is UNIVERSAL, not content-specific.**

Any domain can use this pattern:
- Content Domain → content-writer-specialist
- SEO Domain → seo-competitor-analysis, seo-keyword-research
- Client Intelligence → client-project-orchestrator, client-icp-analyst
- Healthcare → healthcare-content-specialist, medical-terminology-validator
- Web Development → frontend-architect-specialist, backend-development-specialist
- **Any specialized agent in `.claude/agents/`**

---

## Two Execution Patterns

### Pattern 1: Direct Agent Invocation (Simple Tasks)

**When to use:**
- Single, focused task
- No infrastructure setup needed
- Immediate results required

**How it works:**
```
You → Task tool → Specialized Agent → Results
```

**Examples:**

```markdown
**Content Creation:**
Use Task tool:
- subagent_type: "content-writer-specialist"
- prompt: "Write article about dental implants..."

**SEO Analysis:**
Use Task tool:
- subagent_type: "seo-competitor-analysis"
- prompt: "Analyze competitors for keyword X..."

**Code Review:**
Use Task tool:
- subagent_type: "code-quality-agent"
- prompt: "Review this React component..."
```

### Pattern 2: Hybrid Delegation (Complex Workflows)

**When to use:**
- Requires infrastructure (folders, memory, APIs)
- Multi-step workflow
- Cross-domain coordination needed

**How it works:**
```
You → orchestrai-master-coordinator
              ↓
       Node.js API (infrastructure setup)
              ↓
       Delegation Instructions
              ↓
       Task tool → Specialized Agent
              ↓
       Infrastructure + Analysis = Complete Solution
```

**Examples:**

```markdown
**Client Project:**
"Use orchestrai-master-coordinator to create client project for X"
→ Infrastructure: folders, memory, files
→ Agent: client-project-orchestrator
→ Result: Complete project setup + strategic analysis

**SEO Strategy:**
"Use orchestrai-master-coordinator to create SEO strategy for domain.com"
→ Infrastructure: tracking setup, data collection
→ Agent: seo-comprehensive-analysis
→ Result: Complete SEO report + implementation plan

**Content Pipeline:**
"Use orchestrai-master-coordinator to execute healthcare content pipeline"
→ Infrastructure: file management, quality gates
→ Agents: content-writer-specialist, content-quality-validator, content-ai-phrase-detector
→ Result: Complete content creation workflow
```

---

## Universal Agent Registry

All agents in `.claude/agents/` can be invoked via Task tool:

### Content & SEO (18 agents)
```
content-writer-specialist
content-outline-architect
content-quality-validator
content-ai-phrase-detector
seo-keyword-research
seo-competitor-analysis
seo-content-optimization
... (see .claude/agents/ for complete list)
```

### Client Intelligence (6 agents)
```
client-project-orchestrator
client-icp-analyst
client-branding-intelligence
client-business-context-analyzer
client-market-intelligence-synthesizer
client-context-integration-coordinator
```

### Web Development (15+ agents)
```
frontend-architect-specialist
backend-development-specialist
ui-component-developer
api-architect
devops-deployment-specialist
... (see .claude/agents/ for complete list)
```

### Quality & Testing (10+ agents)
```
code-quality-agent
accessibility-agent
performance-monitoring-agent
security-compliance-agent
e2e-test-automator
... (see .claude/agents/ for complete list)
```

**ANY agent can be invoked - there is NO hardcoding.**

---

## How Domain Hubs Work

Each domain hub follows the same pattern:

### 1. Infrastructure Setup (Node.js)

**What Node.js does:**
- Creates necessary files/folders
- Initializes crystalline memory
- Sets up API endpoints
- Prepares workflow state

**Examples:**
```javascript
// Client Intelligence Hub
await createClientProject(data);  // Folders, memory, files

// SEO Hub
await initializeSEOTracking(domain);  // Analytics, crawl setup

// Content Hub
await setupContentPipeline(config);  // Outline validation, quality gates
```

### 2. Delegation Instructions (Standard Format)

**All hubs return the same structure:**
```json
{
  "requiresClaudeCodeExecution": true,
  "delegationType": "task-tool",
  "delegationId": "deleg-...",
  "agentType": "specific-agent-name",
  "taskPrompt": "Complete enhanced prompt...",
  "infrastructureComplete": true,
  "infrastructureResults": { /* what Node.js did */ },
  "coordinationInstructions": "Human-readable guide"
}
```

### 3. Agent Execution (Claude Code via Task Tool)

**orchestrai-master-coordinator:**
1. Detects `requiresClaudeCodeExecution: true`
2. Invokes agent via Task tool
3. Monitors execution
4. Synthesizes results

### 4. Result Synthesis (Combined Output)

**Final response combines:**
- Infrastructure status (what was created/configured)
- Agent analysis (strategic insights/recommendations)
- Next steps (actionable items)

---

## Domain-Specific Examples

### Content Domain

**Direct Invocation:**
```
Use Task tool with content-writer-specialist to write article about X
```

**Hybrid Workflow:**
```
Use orchestrai-master-coordinator to execute content pipeline for article X
→ Infrastructure: Outline validation, file management
→ Agents: content-writer-specialist, content-quality-validator, content-ai-phrase-detector
→ Result: Complete article + quality report
```

### SEO Domain

**Direct Invocation:**
```
Use Task tool with seo-keyword-research to find keywords for topic X
```

**Hybrid Workflow:**
```
Use orchestrai-master-coordinator to create SEO strategy for domain.com
→ Infrastructure: Tracking setup, data collection
→ Agents: seo-keyword-research, seo-competitor-analysis, seo-content-optimization
→ Result: Complete SEO strategy + implementation plan
```

### Client Intelligence Domain

**Direct Invocation:**
```
Use Task tool with client-icp-analyst to analyze customer profile for X
```

**Hybrid Workflow:**
```
Use orchestrai-master-coordinator to create client project for Company X
→ Infrastructure: Folders, memory, files, templates
→ Agent: client-project-orchestrator
→ Result: Project setup + strategic recommendations
```

### Healthcare Domain

**Direct Invocation:**
```
Use Task tool with healthcare-content-specialist to write patient guide for X
```

**Hybrid Workflow:**
```
Use orchestrai-master-coordinator to execute healthcare content pipeline
→ Infrastructure: Medical validation, compliance checks
→ Agents: healthcare-content-specialist, medical-terminology-validator, hipaa-compliance-validator
→ Result: Compliant medical content + validation report
```

### Web Development Domain

**Direct Invocation:**
```
Use Task tool with frontend-architect-specialist to design component architecture
```

**Hybrid Workflow:**
```
Use orchestrai-master-coordinator to build full-stack application
→ Infrastructure: Project setup, CI/CD, deployment
→ Agents: frontend-architect-specialist, backend-development-specialist, devops-deployment-specialist
→ Result: Complete application + deployment pipeline
```

---

## Parallel Execution (Universal Pattern)

**ANY agents can run in parallel if tasks are independent:**

### Content Parallel Execution
```
Message 1: Launch ALL agents simultaneously
- Task 1: content-writer-specialist for Article #1
- Task 2: content-writer-specialist for Article #2
- Task 3: content-writer-specialist for Article #3

All execute in parallel → Complete together
```

### SEO Parallel Execution
```
Message 1: Launch ALL agents simultaneously
- Task 1: seo-keyword-research for Topic #1
- Task 2: seo-competitor-analysis for Domain #1
- Task 3: seo-content-optimization for Page #1

All execute in parallel → Complete together
```

### Multi-Domain Parallel Execution
```
Message 1: Launch agents from DIFFERENT domains
- Task 1: content-writer-specialist (Content)
- Task 2: seo-keyword-research (SEO)
- Task 3: client-icp-analyst (Intelligence)

All execute in parallel → Complete together
```

**Key principle: If tasks don't depend on each other, run them in parallel.**

---

## Implementation Across Domains

### Current Status

| Domain | Direct Invocation | Hybrid Delegation | Status |
|--------|------------------|-------------------|---------|
| **Content** | ✅ Working | ✅ Working | Fully operational |
| **Client Intelligence** | ✅ Working | ✅ Implemented (Priority 1) | Ready for testing |
| **SEO** | ✅ Working | ⚠️ Needs migration | Apply same pattern |
| **Healthcare** | ✅ Working | ⚠️ Needs migration | Apply same pattern |
| **Web Development** | ✅ Working | ⚠️ Needs migration | Apply same pattern |

### Migration Pattern (Apply to All Domains)

**Step 1: Update Domain Hub**
```javascript
// In domain-hub.js
async delegateToClaudeCodeAgent(agentType, taskPrompt, task) {
  // Return delegation instructions (not simulation)
  return {
    requiresClaudeCodeExecution: true,
    agentType: agentSpec.claudeCodeAgent,
    taskPrompt: enhancedPrompt,
    infrastructureComplete: true,
    // ... standard delegation format
  };
}
```

**Step 2: Test with orchestrai-master-coordinator**
```
Use orchestrai-master-coordinator to [domain-specific task]
```

**Step 3: Verify end-to-end**
- Infrastructure setup works ✓
- Delegation instructions returned ✓
- Agent execution visible ✓
- Results synthesized ✓

---

## Best Practices (Universal)

### ✅ DO

1. **Use appropriate agent for the task**
   - Content creation → content-writer-specialist
   - SEO analysis → seo-competitor-analysis
   - Code review → code-quality-agent

2. **Use hybrid pattern for complex workflows**
   - Multiple steps
   - Infrastructure required
   - Cross-domain coordination

3. **Run independent tasks in parallel**
   - Multiple articles
   - Multiple analyses
   - Different domains

4. **Let orchestrai-master-coordinator handle complexity**
   - It knows which agents to use
   - It coordinates infrastructure + intelligence
   - It synthesizes results

### ❌ DON'T

1. **Don't write content directly with Write tool**
   - Use content-writer-specialist instead
   - Better quality, AI detection prevention, structure compliance

2. **Don't call domain hub APIs directly**
   - Use orchestrai-master-coordinator
   - It handles delegation automatically

3. **Don't hardcode agent names in your workflow**
   - Let coordinator choose optimal agent
   - System can evolve without breaking workflows

4. **Don't run sequential tasks that could be parallel**
   - Wastes time
   - Reduces efficiency

---

## Adding New Agents (Extensibility)

### Create New Agent

1. **Create agent definition:**
```bash
.claude/agents/my-new-specialist.md
```

2. **Define agent:**
```yaml
---
name: my-new-specialist
description: Specialized task handler
tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task
model: sonnet
---

You are a specialized agent for [specific task].
[Agent system prompt here]
```

3. **Use immediately:**
```
Use Task tool with my-new-specialist to [task description]
```

**No code changes needed - just create the agent file!**

### Add to Domain Hub (Optional)

If agent needs infrastructure support:

1. **Add to domain hub registry:**
```javascript
this.subAgentSpecs = [
  // ... existing agents
  {
    id: 'my-new-specialist',
    name: 'My New Specialist',
    claudeCodeAgent: 'my-new-specialist',
    specialization: 'my-specialty'
  }
];
```

2. **Use via hybrid pattern:**
```
Use orchestrai-master-coordinator to [task requiring infrastructure + my-new-specialist]
```

---

## Summary

**★ Insight ─────────────────────────────────────**

The ORCHESTRAI agent delegation pattern is **universal and extensible**:

1. **ANY agent** can be invoked via Task tool (not hardcoded)
2. **ANY domain** can use hybrid delegation pattern
3. **ANY workflow** can combine infrastructure + intelligence
4. **Parallel execution** works across ALL domains
5. **New agents** can be added without code changes

The system is designed for maximum flexibility. The content-writer-specialist is just ONE example - the same pattern works for SEO, client intelligence, web development, healthcare, and ANY future domain you create.

─────────────────────────────────────────────────

**Key Takeaway:**

Nothing is hardcoded. The documentation may have been content-focused because that's where the most detailed workflows were defined, but the underlying architecture is domain-agnostic and agent-agnostic. You can use ANY agent with ANY workflow pattern.
