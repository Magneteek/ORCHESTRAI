# SEO Technical Audit Agent Prompt Template

## Purpose
This template ensures agents use MCP tools correctly without creating overengineered custom scripts.

## ✅ CORRECT Prompt Pattern

```
Use the seo-technical-analysis agent to perform a comprehensive SEO audit for [WEBSITE].

**CRITICAL INSTRUCTIONS - READ CAREFULLY:**

1. **Use MCP Tools ONLY** - Do NOT create custom Node.js scripts or use curl
2. **MCP tools are functions** - Call them directly like: mcp__dataforseo__onpage_task_post({...})
3. **No HTTP endpoints** - MCP uses stdio transport, not HTTP REST APIs

**Workflow:**

STEP 1: Check if crawl already exists
Task ID: [EXISTING_TASK_ID if any]
Tool: mcp__dataforseo__onpage_summary({ id: "task-id-here" })

STEP 2: If crawl complete (status_code: 20000), proceed to retrieve data
If still processing (40601/40602), inform user to wait

STEP 3: Retrieve comprehensive audit data using these MCP tools:
- mcp__dataforseo__onpage_summary({ id: taskId })
- mcp__dataforseo__onpage_pages({ id: taskId, limit: 300 })
- mcp__dataforseo__onpage_pages({ id: taskId, filters: ["status_code", "=", 404] })
- mcp__dataforseo__onpage_links({ id: taskId, filters: ["broken", "=", true] })
- mcp__dataforseo__onpage_redirect_chains({ id: taskId })
- mcp__dataforseo__onpage_duplicate_tags({ id: taskId })
- mcp__dataforseo__onpage_non_indexable({ id: taskId })
- mcp__dataforseo__onpage_links({ id: taskId, limit: 5000 })

STEP 4: Analyze findings
- Internal linking structure (orphaned pages, excessive links)
- 404 error inventory
- Broken link analysis
- Redirect optimization opportunities

STEP 5: Generate markdown report with:
- Executive summary
- Critical issues by severity
- Detailed findings
- Prioritized action items
- Technical recommendations

STEP 6: Save deliverables to project folder

**WHAT NOT TO DO:**
❌ Do NOT use: curl, axios, fetch, or HTTP requests
❌ Do NOT create: custom API integration scripts
❌ Do NOT hardcode: credentials or API keys
❌ Do NOT write: more than 50 lines of analysis code

**Expected Code Length:** ~30 lines of MCP tool calls + analysis
```

## 🔧 Usage Examples

### Example 1: New Audit
```
Use seo-technical-analysis agent following the template above for https://example.com
Start a new crawl with 200 pages, JavaScript enabled.
```

### Example 2: Check Existing Crawl
```
Use seo-technical-analysis agent following the template above.
Check crawl status for task ID: 10291318-8161-0216-0000-1d9d23d22aba
If complete, generate full audit report for deletereviews.nl
```

### Example 3: Focus Areas
```
Use seo-technical-analysis agent following the template above for deletereviews.nl
Task ID: 10291318-8161-0216-0000-1d9d23d22aba
Focus specifically on:
1. Internal linking structure
2. 404 broken links
3. Redirect chains
```

## 🎓 Teaching Agents The Right Way

### Bad Agent Behavior (Overengineered)
```javascript
// Agent creates custom script:
const axios = require('axios');
const DATAFORSEO_CONFIG = {
  username: 'hardcoded@email.com',  // ❌
  password: 'hardcoded-password'     // ❌
};
// ... 688 lines of code
```

### Good Agent Behavior (MCP)
```javascript
// Agent uses MCP tools:
const summary = await mcp__dataforseo__onpage_summary({ id: taskId }); // ✅
const pages = await mcp__dataforseo__onpage_pages({ id: taskId });     // ✅
// ... ~20 lines total
```

## 📋 Pre-Flight Checklist

Before executing SEO audit, verify:
- [ ] Using `mcp__*` tool syntax
- [ ] No curl/axios/fetch in code
- [ ] No hardcoded credentials
- [ ] Code length < 50 lines
- [ ] No custom API integration scripts

## 🚨 Red Flags

If you see an agent doing these, STOP and redirect:
- ❌ `curl -X POST http://localhost:3100/...`
- ❌ Creating files in `/tests/` with axios/fetch
- ❌ Hardcoding `username: 'email@domain.com'`
- ❌ Writing 500+ lines for simple audit
- ❌ Trying to implement custom polling logic

## ✅ Green Flags

Agent is doing it correctly if:
- ✅ Calls start with `mcp__dataforseo__*`
- ✅ Uses existing task IDs
- ✅ Total code < 50 lines
- ✅ No npm packages imported
- ✅ Focuses on analysis, not infrastructure

## 🎯 Success Metrics

A properly executed audit should:
- Take 1-2 minutes to write code (not 15 minutes)
- Use 20-30 lines of MCP calls (not 688 lines)
- Reuse infrastructure (not rebuild it)
- Produce identical results (same API, cleaner code)

---

**Remember:** If an agent starts writing more than 50 lines of code for an audit, something went wrong. MCP exists to eliminate this complexity!
