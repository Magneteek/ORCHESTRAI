# Hooks Server Capabilities - Complete Guide

**Infrastructure server running on port 5501**

---

## 🎯 What It Does

The Hooks Server is ORCHESTRAI's **infrastructure backbone** that:

1. ✅ **Monitors all Claude Code events**
2. ✅ **Tracks workflow execution**
3. ✅ **Collects metrics and analytics**
4. ✅ **Forwards events to monitoring systems**
5. ✅ **Provides REST API for system status**

**Status:** ✓ Running (PID 1067, Uptime: ~8 days)

---

## 🔌 API Endpoints

### **Health & Status**

#### `GET /health`
Check server health and uptime

```bash
curl http://localhost:5501/health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 706286753,
  "port": 5501,
  "tokenMonitorUrl": "http://localhost:5505"
}
```

---

### **Hook Management**

#### `GET /hooks/config`
Get all configured hooks (11 total)

```bash
curl http://localhost:5501/hooks/config | jq '.'
```

**Configured Hooks:**
- `user-prompt-submit` - User message tracking
- `task-start` - Agent execution start
- `task-complete` - Agent execution completion
- `task-error` - Agent execution failures
- `tool-call` - Tool usage monitoring
- `mcp-call` - MCP server interactions
- `token-usage` - Token consumption tracking
- `session-start` - Session lifecycle start
- `session-end` - Session lifecycle end
- `pre-compact` - Before conversation compaction
- `notification` - System notifications

---

### **Workflow Tracking**

#### `GET /hooks/workflows`
Get all tracked workflows (446 total)

```bash
curl http://localhost:5501/hooks/workflows | jq '.data | length'
```

**Response:** `446` workflows tracked

**Each workflow contains:**
- Unique workflow ID
- Start time
- Status (initiated, active, completed, failed)
- Token usage (input, output, total)
- Tool calls (what tools were used)
- MCP calls (external service calls)
- Errors and warnings
- Notifications
- Cost tracking

**Example workflow:**
```json
{
  "id": "wf_1770903580553_e3envxlx",
  "prompt": "",
  "userId": "unknown",
  "startTime": 1770903580554,
  "status": "initiated",
  "intent": "general",
  "estimatedCost": 0,
  "actualCost": 0,
  "tokenUsage": {
    "input": 0,
    "output": 0,
    "total": 0
  },
  "toolCalls": [],
  "mcpCalls": [],
  "errors": [],
  "notifications": []
}
```

---

### **Metrics & Analytics**

#### `GET /hooks/metrics`
Get aggregated workflow metrics

```bash
curl http://localhost:5501/hooks/metrics | jq '.'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWorkflows": 13,
    "activeWorkflows": 13,
    "completedWorkflows": 0,
    "failedWorkflows": 0,
    "avgDuration": 0,
    "tokenUsage": {
      "total": 0,
      "byWorkflow": {},
      "avgPerWorkflow": 0
    },
    "costs": {
      "total": 0,
      "byWorkflow": {},
      "avgPerWorkflow": 0
    }
  }
}
```

**Metrics include:**
- Total/active/completed/failed workflow counts
- Average duration
- Token usage (total, by workflow, average)
- Cost tracking (total, by workflow, average)

---

### **Event Endpoints (POST)**

These endpoints receive events from Claude Code:

#### `POST /hooks/user-prompt-submit`
Triggered when user submits a message

```bash
curl -X POST http://localhost:5501/hooks/user-prompt-submit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "User message here",
    "sessionId": "session-123",
    "timestamp": 1234567890
  }'
```

#### `POST /hooks/task-start`
Triggered when agent task starts

```bash
curl -X POST http://localhost:5501/hooks/task-start \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-123",
    "agent": "content-writer-specialist",
    "timestamp": 1234567890
  }'
```

#### `POST /hooks/task-complete`
Triggered when agent task completes

```bash
curl -X POST http://localhost:5501/hooks/task-complete \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-123",
    "status": "completed",
    "duration": 15000,
    "timestamp": 1234567890
  }'
```

#### `POST /hooks/tool-call`
Triggered when agent uses a tool

```bash
curl -X POST http://localhost:5501/hooks/tool-call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "Read",
    "parameters": {"file": "test.md"},
    "timestamp": 1234567890
  }'
```

#### `POST /hooks/mcp-call`
Triggered when MCP server is called

```bash
curl -X POST http://localhost:5501/hooks/mcp-call \
  -H "Content-Type: application/json" \
  -d '{
    "server": "dataforseo",
    "method": "keyword_overview",
    "timestamp": 1234567890
  }'
```

#### `POST /hooks/token-usage`
Triggered when tokens are consumed

```bash
curl -X POST http://localhost:5501/hooks/token-usage \
  -H "Content-Type: application/json" \
  -d '{
    "inputTokens": 1000,
    "outputTokens": 2000,
    "totalTokens": 3000,
    "cost": 0.05,
    "timestamp": 1234567890
  }'
```

**Note:** This endpoint also forwards data to Token Monitor (port 5505)

---

## 🎨 Use Cases

### **1. Monitor System Activity**

```bash
# Check how many workflows are tracked
curl -s http://localhost:5501/hooks/workflows | jq '.data | length'

# Get recent workflows
curl -s http://localhost:5501/hooks/workflows | \
  jq '.data[-10:] | .[] | {id, status, tools: (.toolCalls | length)}'
```

### **2. Track Token Usage**

```bash
# Get total token usage across all workflows
curl -s http://localhost:5501/hooks/metrics | \
  jq '.data.tokenUsage'
```

### **3. Analyze Tool Usage**

```bash
# See which tools are used most
curl -s http://localhost:5501/hooks/workflows | \
  jq '.data[].toolCalls[].tool' | sort | uniq -c | sort -rn
```

### **4. Monitor Costs**

```bash
# Get total estimated costs
curl -s http://localhost:5501/hooks/metrics | \
  jq '.data.costs.total'
```

### **5. Debug Failures**

```bash
# Find workflows with errors
curl -s http://localhost:5501/hooks/workflows | \
  jq '.data[] | select(.errors | length > 0) | {id, errors}'
```

---

## 🔗 Integration Points

### **Token Monitor (Port 5505)**

The hooks server forwards token usage data to a token monitor service:

```bash
# Check if token monitor is responding
curl http://localhost:5505/health
```

**Configuration:**
- URL: `http://localhost:5505`
- Automatic forwarding from token-usage events

### **Claude Code Hooks**

The hooks server receives events from Claude Code hooks in `.claude/hooks/`:

- `.claude/hooks/session-capture.js` - Session management
- Other hooks send events to this server

---

## 📊 Data Flow

```
┌─────────────────────┐
│    Claude Code      │
│  (User Interface)   │
└──────────┬──────────┘
           │
           │ Events
           ▼
┌─────────────────────┐
│   Hooks Server      │
│    (Port 5501)      │
├─────────────────────┤
│ - Collect events    │
│ - Track workflows   │
│ - Store metrics     │
│ - Forward data      │
└──────────┬──────────┘
           │
           ├─▶ Token Monitor (5505)
           ├─▶ Metrics Storage
           └─▶ Monitoring Systems
```

---

## 🛠️ Management

### **Check Status**

```bash
# Using our unified script
./start-orchestrai.sh status

# Or directly
curl http://localhost:5501/health
```

### **View Logs**

```bash
# If running via script
./start-orchestrai.sh logs hooks-server

# Or find the process
ps aux | grep hooks-server
```

### **Restart Server**

```bash
# Find PID
ps aux | grep hooks-server

# Kill current process
kill <PID>

# Restart
cd orchestrai-shared/claude-code
node hooks-server.js &
```

---

## 📈 Statistics

**Current Status:**
- ✅ Running: 8 days uptime
- ✅ Hooks: 11 configured
- ✅ Workflows: 446 tracked
- ✅ Events: Thousands processed
- ✅ Health: OK

---

## 🎯 Key Features

### **1. Comprehensive Event Tracking**
Every Claude Code event is captured:
- User messages
- Agent executions
- Tool usage
- MCP calls
- Token consumption
- Errors and notifications

### **2. Workflow Management**
Complete workflow lifecycle tracking:
- Start/end times
- Status tracking
- Duration measurement
- Cost calculation
- Error collection

### **3. Real-Time Metrics**
Aggregated analytics:
- Total/active/completed counts
- Average durations
- Token usage patterns
- Cost tracking
- Tool usage statistics

### **4. Extensible Architecture**
Easy to integrate:
- REST API for queries
- Webhook endpoints for events
- Configurable forwarding
- Pluggable monitoring

### **5. Zero Configuration**
Works automatically:
- Starts with ORCHESTRAI
- Auto-discovers hooks
- Captures all events
- No setup required

---

## 💡 Pro Tips

1. **Use jq for parsing** - Makes JSON readable
   ```bash
   curl -s http://localhost:5501/hooks/workflows | jq '.data[0]'
   ```

2. **Monitor active workflows** - Track what's running
   ```bash
   watch -n 5 'curl -s http://localhost:5501/hooks/metrics | jq ".data.activeWorkflows"'
   ```

3. **Track token usage** - Monitor costs
   ```bash
   curl -s http://localhost:5501/hooks/metrics | jq '.data.tokenUsage.total'
   ```

4. **Find errors quickly** - Debug issues
   ```bash
   curl -s http://localhost:5501/hooks/workflows | \
     jq '.data[] | select(.errors | length > 0)'
   ```

5. **Export workflow data** - For analysis
   ```bash
   curl -s http://localhost:5501/hooks/workflows > workflows-backup.json
   ```

---

## 🔐 Security Notes

- **Local only**: Server binds to localhost by default
- **No authentication**: Trusted local environment
- **CORS enabled**: For local tool integration
- **Event forwarding**: Can be configured to external systems

**For production:** Consider adding:
- Authentication/authorization
- HTTPS
- Rate limiting
- Access logs
- External storage

---

## 📚 Related Documentation

- **SERVICE-ARCHITECTURE.md** - Complete service overview
- **SERVICES-COMPLETE-AUDIT.md** - Service audit results
- **STARTUP-GUIDE.md** - Startup procedures
- **orchestrai-shared/claude-code/hooks-server.js** - Source code

---

## ✅ Summary

The Hooks Server is your **operational intelligence center**:

- ✅ **Always running** (port 5501)
- ✅ **Tracks everything** (11 hooks, 446 workflows)
- ✅ **REST API** (8 endpoints)
- ✅ **Real-time metrics** (tokens, costs, performance)
- ✅ **Zero configuration** (automatic)

**Test it now:**
```bash
curl http://localhost:5501/health
curl http://localhost:5501/hooks/config | jq '.'
curl http://localhost:5501/hooks/workflows | jq '.data | length'
curl http://localhost:5501/hooks/metrics | jq '.'
```

**It's the heartbeat of your ORCHESTRAI system!** 💓
