# Hybrid Delegation Quick Start Guide
## Using ORCHESTRAI with Real Claude Code Agent Integration

---

## What Changed?

**Before (Simulation):**
```
User → Node.js API → Simulated Response
```

**After (Real Delegation):**
```
User → orchestrai-master-coordinator → Node.js API (infrastructure)
                                      ↓
                              Delegation Instructions
                                      ↓
                              Task Tool → Real Claude Code Agent
                                      ↓
                              Synthesized Results
```

---

## Quick Start: 3 Simple Steps

### Step 1: Start ORCHESTRAI Server

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI
npm run start
```

**Verify server is running:**
```bash
curl http://localhost:5501/client/status
```

### Step 2: Use orchestrai-master-coordinator in Claude Code

Instead of calling APIs directly, use the coordinator agent:

```
Use orchestrai-master-coordinator to create a client project for "My Company Name"
```

### Step 3: Watch the Magic Happen

The coordinator will:
1. ✅ Call Node.js API (infrastructure)
2. ✅ Receive delegation instructions
3. ✅ Invoke real Claude Code agent via Task tool
4. ✅ Synthesize complete results
5. ✅ Provide you with comprehensive response

---

## Example Usage Scenarios

### Scenario 1: Create New Client Project

**Your Message:**
```
Use orchestrai-master-coordinator to create a client project for "Ljubljana Dental Clinic"
```

**What Happens:**
1. Coordinator analyzes your request
2. Calls POST /client/create (creates folders, memory, files)
3. Receives delegation for client-project-orchestrator agent
4. Invokes agent via Task tool (you can see this happening!)
5. Agent provides strategic recommendations
6. You receive complete project setup + analysis

**You Get:**
- Project folder structure created
- Crystalline memory initialized
- Strategic recommendations from AI agent
- Next steps for content/SEO/web development

### Scenario 2: Get Client Context

**Your Message:**
```
Use orchestrai-master-coordinator to retrieve context for client "ljubljana-dental-clinic-xyz123"
```

**What Happens:**
1. Coordinator calls GET /client/{id}/context
2. Receives delegation for client-context-integration-coordinator
3. Invokes agent to synthesize complete context
4. You receive unified client profile

**You Get:**
- Complete client intelligence profile
- Branding information
- ICP analysis
- Market research summary
- Cross-domain context ready for use

### Scenario 3: SEO Analysis (Future)

**Your Message:**
```
Use orchestrai-master-coordinator to analyze SEO for "example.com"
```

**What Happens:**
1. Coordinator routes to SEO Domain Hub
2. Hub creates analysis infrastructure
3. Delegates to seo-competitor-analysis agent
4. You get comprehensive SEO report

---

## How to Tell It's Working

### ✅ Good Signs

1. **You see the coordinator thinking**
   ```
   Analyzing request... → Hybrid coordination required
   Calling Node.js API...
   Received delegation instructions
   Invoking Claude Code agent via Task tool...
   ```

2. **You see the agent executing**
   ```
   Using Task tool to invoke client-project-orchestrator...
   [Agent is visibly working and analyzing]
   Agent completed successfully
   ```

3. **You get synthesized results**
   ```
   Infrastructure Setup: ✅ Complete
   Strategic Analysis: ✅ Complete
   Next Steps: [Detailed list]
   ```

### ❌ Warning Signs

1. **Simulation warning in response**
   ```json
   {
     "simulationWarning": "This is a simulated response..."
   }
   ```
   **Fix:** Check that client-intelligence-domain-hub.js was updated correctly

2. **No Task tool invocation**
   ```
   Calling API... [done]
   [No agent execution visible]
   ```
   **Fix:** Verify orchestrai-master-coordinator recognizes delegation requirement

3. **Agent not found error**
   ```
   Error: Agent client-project-orchestrator not found
   ```
   **Fix:** Check agent exists in .claude/agents/ folder

---

## Comparison: Direct API vs. Coordinator

### ❌ Don't Do This (Direct API Call)

```bash
curl -X POST http://localhost:5501/client/create \
  -d '{"clientName": "My Company"}'
```

**Problems:**
- You only get delegation instructions (not final results)
- You have to manually invoke the agent
- No synthesis of infrastructure + analysis
- More work for you

### ✅ Do This Instead (Use Coordinator)

```
Use orchestrai-master-coordinator to create a client project for "My Company"
```

**Benefits:**
- Automatic delegation handling
- Real agent execution
- Complete synthesis
- One simple request

---

## Understanding the Response Structure

When the coordinator completes, you'll see responses like this:

```markdown
✅ Client Project Created: [Company Name]

## Infrastructure Setup: Complete
- Project ID: [uuid]
- Folder Structure: [details]
- Crystalline Memory: Initialized

## Strategic Analysis: Complete
- Strategic Recommendations: [AI-generated insights]
- Priority Actions: [Specific next steps]
- Cross-Domain Plan: [Integration strategy]

## Next Steps
[Actionable items you can work on]
```

**Key Sections:**

1. **Infrastructure Setup**
   - What Node.js created (folders, files, memory)
   - Technical specifications
   - File paths and IDs

2. **Strategic Analysis**
   - What the Claude Code agent analyzed
   - Business insights
   - Strategic recommendations

3. **Next Steps**
   - Combined infrastructure + analysis
   - Actionable items
   - Clear path forward

---

## Common Workflows

### Workflow 1: New Client Onboarding

```
1. Create project
   → orchestrai-master-coordinator to create client project for "[Name]"

2. Upload branding materials
   → [Manually upload to client-intelligence/ folder]

3. Complete ICP
   → orchestrai-master-coordinator to analyze ICP for client "[id]"

4. Start SEO research
   → orchestrai-master-coordinator to create SEO strategy for client "[id]"

5. Begin content creation
   → Use content-writer-specialist for pillar pages
```

### Workflow 2: Existing Client - New Campaign

```
1. Retrieve context
   → orchestrai-master-coordinator to get context for "[client-id]"

2. Campaign planning
   → orchestrai-master-coordinator to plan content campaign for "[client-id]"

3. Execute campaign
   → Use content/SEO agents with client context
```

---

## Troubleshooting

### Problem: Server not responding

**Check:**
```bash
# Is server running?
ps aux | grep orchestrai

# Check server logs
npm run start
```

**Solution:** Start server if not running

### Problem: Delegation not working

**Check:**
```bash
# Verify API response structure
curl -X POST http://localhost:5501/client/create \
  -H "Content-Type: application/json" \
  -d '{"clientName": "Test"}'

# Look for: "requiresClaudeCodeExecution": true
```

**Solution:** If missing, check client-intelligence-domain-hub.js updates

### Problem: Coordinator not invoking agent

**Check:**
- orchestrai-master-coordinator.md has Hybrid Delegation Protocol section
- Response has `requiresClaudeCodeExecution: true`
- Agent name matches exactly

**Solution:** Review coordinator implementation, verify agent exists

---

## Best Practices

### ✅ DO

1. **Always use orchestrai-master-coordinator for domain hub tasks**
   - Client intelligence
   - SEO analysis
   - Content pipeline execution

2. **Use specialized agents directly for specific tasks**
   - content-writer-specialist for article writing
   - seo-keyword-research for keyword analysis

3. **Check server status before starting**
   ```bash
   curl http://localhost:5501/client/status
   ```

4. **Monitor agent execution**
   - Watch for Task tool invocation
   - Verify agent completes successfully

### ❌ DON'T

1. **Don't call domain hub APIs directly**
   - Use coordinator instead
   - Let it handle delegation

2. **Don't expect immediate results from API calls**
   - APIs return delegation instructions
   - Coordinator executes agents

3. **Don't skip the coordinator**
   - You'll miss the synthesis step
   - Results won't be complete

---

## Next Steps

### Immediate

1. **Test the system**
   - Follow [hybrid-delegation-test-workflow.md](tests/hybrid-delegation-test-workflow.md)
   - Verify delegation works end-to-end

2. **Create your first project**
   - Use coordinator to create client project
   - Verify all files and memory created
   - Check agent provides strategic analysis

### Near Term

1. **Apply to other domains**
   - SEO Domain Hub
   - Content Domain Hub
   - Healthcare Content Hub

2. **Add monitoring**
   - Track agent executions
   - Monitor performance
   - Analyze patterns

3. **Optimize workflows**
   - Identify common patterns
   - Create workflow templates
   - Improve efficiency

---

## Getting Help

### Documentation

- [ORCHESTRAI-ARCHITECTURE-ANALYSIS.md](ORCHESTRAI-ARCHITECTURE-ANALYSIS.md) - Architecture overview
- [ORCHESTRAI-IMPLEMENTATION-PLAN.md](ORCHESTRAI-IMPLEMENTATION-PLAN.md) - Implementation details
- [tests/hybrid-delegation-test-workflow.md](tests/hybrid-delegation-test-workflow.md) - Testing guide

### Testing

1. Start with simple client creation
2. Monitor console logs
3. Verify each step completes
4. Check final results

### Support

- Review agent definitions in `.claude/agents/`
- Check server logs for errors
- Verify API responses are correct
- Test delegation detection logic

---

**★ Insight ─────────────────────────────────────**

The hybrid delegation system bridges the gap between industrial-strength infrastructure (Node.js) and intelligent analysis (Claude Code agents). By using orchestrai-master-coordinator as your entry point, you get the best of both worlds: persistent state, APIs, and sophisticated infrastructure PLUS real AI agent execution with visible results.

Think of it as: **Infrastructure as a Service** (Node.js) + **Intelligence as a Service** (Claude Code) = **Complete AI Platform**

─────────────────────────────────────────────────
