# MCP Usage Guide: STDIO vs HTTP Architecture

## Quick Answer: Why Your Curl Command Doesn't Work

```bash
# ❌ This DOESN'T work:
curl -X POST http://localhost:3100/mcp/dataforseo/onpage_task_post

# ✅ This DOES work:
# Ask Claude Code to execute:
mcp__dataforseo__onpage_task_post({ target: "https://example.com" })
```

**Reason:** MCP servers use **STDIO transport**, not HTTP REST APIs.

---

## MCP Architecture Comparison

| Feature | HTTP REST API | MCP STDIO Protocol |
|---------|--------------|-------------------|
| **Transport** | Network sockets (TCP) | Standard I/O streams (pipes) |
| **Communication** | HTTP requests/responses | JSON-RPC over stdin/stdout |
| **Server Location** | Network address (host:port) | Child process |
| **Access Method** | curl, fetch, axios | Claude Code tool system |
| **Security** | Network-based (needs auth) | Process-based (inherits permissions) |
| **Discovery** | Manual (documentation) | Automatic (MCP protocol) |
| **Startup** | Independent service | Spawned by Claude Code |
| **Port Binding** | ✅ Yes (e.g., :3000) | ❌ No port required |

---

## How MCP Actually Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code                              │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         MCP Client (Built into Claude Code)        │   │
│  └───────────────┬────────────────────────────────────┘   │
│                  │                                          │
│                  │ Spawns child process                     │
│                  │ Connects stdin/stdout pipes              │
│                  ↓                                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │              MCP Server Process                    │   │
│  │        (dataforseo-server.js)                      │   │
│  │                                                     │   │
│  │  • Runs as child process                           │   │
│  │  • Communicates via stdin/stdout                   │   │
│  │  • No network socket                               │   │
│  │  • No HTTP endpoints                               │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### What Happens When You Call an MCP Tool

**Step 1: Tool Invocation in Claude Code**
```javascript
// User asks Claude Code to execute:
mcp__dataforseo__onpage_task_post({
  target: "https://deletereviews.nl",
  max_crawl_pages: 300
})
```

**Step 2: JSON-RPC Request via STDIO**
```javascript
// Claude Code sends to MCP server's stdin:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "onpage_task_post",
    "arguments": {
      "target": "https://deletereviews.nl",
      "max_crawl_pages": 300
    }
  }
}
```

**Step 3: MCP Server Processes Request**
```javascript
// Server (dataforseo-server.js) receives via stdin:
// 1. Parses JSON-RPC request
// 2. Calls DataForSEO API
// 3. Returns response via stdout
```

**Step 4: JSON-RPC Response via STDIO**
```javascript
// MCP server writes to stdout:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tasks": [{
      "id": "10291318-8161-0216-0000-1d9d23d22aba",
      "status_message": "Task Created."
    }]
  }
}
```

**Step 5: Claude Code Returns Result**
```javascript
// User receives formatted response:
// "Crawl Task Started: { ... }"
```

---

## Why STDIO Instead of HTTP?

### Advantages of STDIO Transport

**1. Security**
- No network exposure
- Process-level isolation
- Inherits parent process permissions
- No authentication complexity

**2. Simplicity**
- No port management
- No network configuration
- Automatic lifecycle (dies with parent)
- No CORS or network issues

**3. Efficiency**
- Lower latency (no network stack)
- Direct pipe communication
- No serialization overhead
- Automatic process cleanup

**4. Integration**
- Automatic tool discovery
- Type-safe tool schemas
- Built-in error handling
- Standardized protocol

### When HTTP Makes Sense

- **Multi-client access**: Many applications need the same tool
- **Remote access**: Tools on different machines
- **Web interfaces**: Browser-based UIs
- **Third-party integration**: External systems without MCP support

---

## Correct MCP Usage Patterns

### Pattern 1: Direct Tool Usage (Recommended)

**Use Case:** You're working in Claude Code and need SEO data

```javascript
// Just call the tool directly
const crawl = await mcp__dataforseo__onpage_task_post({
  target: "https://deletereviews.nl",
  max_crawl_pages: 300,
  enable_javascript: true
});

// Wait for completion
await sleep(600000); // 10 minutes

// Get results
const summary = await mcp__dataforseo__onpage_summary({
  id: crawl.tasks[0].id
});
```

**Pros:**
- ✅ Simple and direct
- ✅ Type-safe
- ✅ Automatic error handling
- ✅ No additional code needed

---

### Pattern 2: ORCHESTRAI Agent Delegation

**Use Case:** Complex multi-step SEO analysis

```javascript
// Use specialized SEO agent via Task tool
Task({
  subagent_type: "seo-technical-analysis",
  prompt: `
    Conduct comprehensive technical SEO audit of deletereviews.nl

    Requirements:
    - Full site crawl (max 300 pages)
    - JavaScript rendering enabled
    - Identify technical issues
    - Provide actionable recommendations

    Use DataForSEO MCP tools for crawling and analysis.
  `
})
```

**Pros:**
- ✅ Automated workflow
- ✅ Expert analysis
- ✅ Comprehensive report
- ✅ Quality validation

---

### Pattern 3: Node.js Script with ORCHESTRAI Orchestrator

**Use Case:** Programmatic access from external scripts

**File: `scripts/crawl-deletereviews.js`**
```javascript
const axios = require('axios');

async function crawlSite() {
  // Call ORCHESTRAI orchestrator endpoint
  const response = await axios.post('http://localhost:5502/coordinator/api', {
    method: 'seo.technical-audit',
    params: {
      target: 'https://deletereviews.nl',
      max_crawl_pages: 300,
      enable_javascript: true
    }
  });

  console.log('Task ID:', response.data.taskId);
  return response.data;
}

crawlSite().then(console.log);
```

**Pros:**
- ✅ HTTP access (port 5502)
- ✅ Orchestrator handles MCP coordination
- ✅ Programmatic control
- ✅ External script integration

---

### Pattern 4: HTTP Wrapper (If Absolutely Needed)

**Use Case:** You MUST have HTTP REST API access

**File: `orchestrai-shared/api/mcp-http-wrapper.js`**
```javascript
const express = require('express');
const app = express();

app.use(express.json());

// HTTP endpoint that calls MCP tools internally
app.post('/api/dataforseo/crawl', async (req, res) => {
  try {
    // This would require integrating with Claude Code's MCP client
    // or creating a standalone MCP client

    const { target, max_crawl_pages } = req.body;

    // Call MCP tool through ORCHESTRAI orchestrator
    const result = await orchestrator.callMCPTool('onpage_task_post', {
      target,
      max_crawl_pages
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3100, () => {
  console.log('MCP HTTP wrapper listening on port 3100');
});
```

**Note:** This requires significant custom development and isn't the intended MCP usage pattern.

---

## Complete deletereviews.nl Audit Workflow

### Step 1: Start Crawl

```javascript
const taskId = "10291318-8161-0216-0000-1d9d23d22aba"; // Already started!
```

### Step 2: Monitor Progress (After 10-15 minutes)

```javascript
// Check if crawl is complete
const summary = await mcp__dataforseo__onpage_summary({
  id: taskId
});

console.log(`Pages crawled: ${summary.tasks[0].result[0].crawl_progress}`);
console.log(`Issues found: ${summary.tasks[0].result[0].total_problems}`);
```

### Step 3: Retrieve Detailed Results

```javascript
// Get all pages
const pages = await mcp__dataforseo__onpage_pages({
  id: taskId,
  limit: 300
});

// Get pages with errors
const errors = await mcp__dataforseo__onpage_pages({
  id: taskId,
  filters: ["status_code", ">=", 400]
});

// Get duplicate tags
const duplicates = await mcp__dataforseo__onpage_duplicate_tags({
  id: taskId
});

// Get redirect chains
const redirects = await mcp__dataforseo__onpage_redirect_chains({
  id: taskId
});

// Get non-indexable pages
const nonIndexable = await mcp__dataforseo__onpage_non_indexable({
  id: taskId
});
```

### Step 4: Automated Analysis

```javascript
// Use specialized agent for analysis
Task({
  subagent_type: "seo-technical-analysis",
  prompt: `
    Analyze the DataForSEO crawl results for deletereviews.nl

    Task ID: ${taskId}

    Please:
    1. Retrieve all audit data using MCP tools
    2. Identify critical technical SEO issues
    3. Prioritize fixes by impact
    4. Create actionable implementation plan
    5. Generate comprehensive audit report
  `
})
```

---

## Common Mistakes and Solutions

### ❌ Mistake 1: Trying to Use curl

```bash
# WRONG:
curl -X POST http://localhost:3100/mcp/dataforseo/...
```

**Problem:** MCP servers don't expose HTTP endpoints.

**Solution:** Use Claude Code's tool system:
```javascript
mcp__dataforseo__onpage_task_post({ ... })
```

---

### ❌ Mistake 2: Expecting Immediate Results

```javascript
// WRONG:
const crawl = await mcp__dataforseo__onpage_task_post({ ... });
const summary = await mcp__dataforseo__onpage_summary({ id: crawl.tasks[0].id });
// ^ This will fail - crawl not complete yet
```

**Problem:** Crawling 300 pages takes 10-15 minutes.

**Solution:** Wait for crawl completion:
```javascript
const crawl = await mcp__dataforseo__onpage_task_post({ ... });
const taskId = crawl.tasks[0].id;

console.log(`Crawl started. Task ID: ${taskId}`);
console.log(`Check status in 10-15 minutes.`);

// Later (after waiting):
const summary = await mcp__dataforseo__onpage_summary({ id: taskId });
```

---

### ❌ Mistake 3: Not Using Task IDs

```javascript
// WRONG:
await mcp__dataforseo__onpage_task_post({ ... });
// How do I get results now? Task ID lost!
```

**Problem:** You need the task ID for all subsequent calls.

**Solution:** Store the task ID:
```javascript
const result = await mcp__dataforseo__onpage_task_post({ ... });
const taskId = result.tasks[0].id;

// Save to file or database
fs.writeFileSync('task-id.txt', taskId);
```

---

## MCP Server Status Check

Check if your MCP servers are running:

```bash
# Check ORCHESTRAI orchestrator (includes MCP manager)
curl http://localhost:5502/health

# Check MCP manager status via orchestrator
curl http://localhost:5502/coordinator/mcp/status
```

**Expected Response:**
```json
{
  "mcpServers": {
    "dataforseo": {
      "status": "running",
      "pid": 12345,
      "startTime": 1234567890
    }
  }
}
```

---

## Quick Reference: Available DataForSEO MCP Tools

### Crawling & Setup
- `mcp__dataforseo__onpage_task_post` - Start website crawl
- `mcp__dataforseo__onpage_tasks_ready` - Check completed tasks
- `mcp__dataforseo__onpage_force_stop` - Stop running crawl

### Results Retrieval
- `mcp__dataforseo__onpage_summary` - Overview and issues
- `mcp__dataforseo__onpage_pages` - All crawled pages
- `mcp__dataforseo__onpage_resources` - Images, scripts, CSS
- `mcp__dataforseo__onpage_links` - Link structure
- `mcp__dataforseo__onpage_redirect_chains` - Redirect issues
- `mcp__dataforseo__onpage_non_indexable` - Blocked pages
- `mcp__dataforseo__onpage_duplicate_tags` - Duplicate meta
- `mcp__dataforseo__onpage_duplicate_content` - Content duplication
- `mcp__dataforseo__onpage_keyword_density` - Keyword analysis
- `mcp__dataforseo__onpage_raw_html` - Source code
- `mcp__dataforseo__onpage_waterfall` - Page speed data

### Advanced Analysis
- `mcp__dataforseo__onpage_lighthouse` - Lighthouse audit
- `mcp__dataforseo__onpage_instant_summary` - Quick analysis
- `mcp__dataforseo__onpage_page_screenshot` - Visual capture

---

## Summary: MCP Usage Decision Tree

```
Do you need to use DataForSEO tools?
│
├─ YES, from Claude Code
│  └─ ✅ Use MCP tools directly: mcp__dataforseo__*
│
├─ YES, from Node.js script
│  └─ ✅ Call ORCHESTRAI orchestrator (port 5502)
│
├─ YES, complex SEO workflow
│  └─ ✅ Use Task tool with seo-technical-analysis agent
│
└─ YES, from external HTTP client
   └─ ⚠️  Build custom HTTP wrapper OR use ORCHESTRAI orchestrator
```

---

## Next Steps for deletereviews.nl Audit

**Your crawl is running with Task ID:**
```
10291318-8161-0216-0000-1d9d23d22aba
```

**In 10-15 minutes, retrieve results:**

```javascript
// Get summary
const summary = await mcp__dataforseo__onpage_summary({
  id: "10291318-8161-0216-0000-1d9d23d22aba"
});

// Or use automated analysis agent
Task({
  subagent_type: "seo-technical-analysis",
  prompt: `Analyze crawl results for deletereviews.nl
           Task ID: 10291318-8161-0216-0000-1d9d23d22aba`
})
```

---

**For more information:**
- MCP Protocol Specification: https://modelcontextprotocol.io
- ORCHESTRAI MCP Implementation: `orchestrai-shared/mcp-servers/`
- DataForSEO API Docs: https://docs.dataforseo.com
