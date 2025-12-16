# Service Persistence After VS Code Crash

## What Happens When VS Code Crashes?

```
┌─────────────────────────────────────────────────────┐
│ PROCESS HIERARCHY & CRASH BEHAVIOR                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│ macOS System (launchd)                              │
│   ├─ Redis (PID 2964)                               │
│   │   └─ INDEPENDENT ✅ Keeps Running               │
│   │                                                  │
│   ├─ Terminal Session                               │
│   │   ├─ Hooks Server (PID 7866)                    │
│   │   │   └─ INDEPENDENT ✅ Keeps Running           │
│   │   │                                             │
│   │   └─ Simultaneous Server (PID 7881)             │
│   │       └─ INDEPENDENT ✅ Keeps Running           │
│   │                                                  │
│   └─ VS Code (PID 1849) 💥 CRASHED                  │
│       ├─ MCP Servers (8 processes)                  │
│       │   └─ CHILD PROCESSES ❌ All Die             │
│       │                                             │
│       ├─ Extension Hosts                            │
│       │   └─ CHILD PROCESSES ❌ All Die             │
│       │                                             │
│       └─ Electron Helpers                           │
│           └─ CHILD PROCESSES ❌ All Die             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Service-by-Service Analysis

### Services That SURVIVE Crash ✅

#### 1. Redis
```bash
# Check if still running
redis-cli ping
# Response: PONG ✅

# Why it survives:
# - Started independently: npm run redis
# - Parent: Terminal shell (not VS Code)
# - Will run until you manually stop it
```

#### 2. Hooks Server (port 5501)
```bash
# Check status
lsof -ti:5501
# Response: PID 7866 ✅

# Why it survives:
# - Started in separate terminal: npm run hooks:server
# - Parent: bash/zsh shell (not VS Code)
# - Logs continue accumulating during crash
```

#### 3. Simultaneous Server
```bash
# Check status
ps aux | grep "start-simultaneous-server.js"
# Response: PID 7881 ✅

# Why it survives:
# - Started independently in terminal
# - Parent: shell process (not VS Code)
# - Queue and state remain intact
```

### Services That DIE with Crash ❌

#### 1. All MCP Servers (8 processes)
```bash
# Before crash:
mcp-server-filesystem     PID 18976
mcp-server-memory         PID 18961
mcp-server-gsc            PID 19015
mcp-server-notion         PID 19000
dataforseo-server         PID 18822
ref-tools-mcp             PID 18946
sequential-thinking       PID 18913
magic (shadcn-ui)         PID 18928

# After crash:
ALL TERMINATED ❌
```

**Why they die**:
- Parent process: VS Code (PID 1849)
- When parent crashes → OS kills all children
- Must restart with VS Code restart

#### 2. VS Code Extension Hosts
- Language servers (TypeScript, JSON, etc.)
- Extension processes
- Debugging sessions
- All terminate with VS Code

---

## What Happens to Your Data?

### ✅ SAFE (Persists Through Crash)

#### 1. Redis Data
```bash
# All crystalline memory intact
redis-cli DBSIZE
# Your knowledge graph remains

# Project metadata preserved
redis-cli GET "project:rapidcoldplunge"
```

#### 2. File System Data
```bash
# All project files safe
ls -lah projects/rapidcoldplunge-*/

# Deliverables intact
ls -R projects/rapidcoldplunge-*/deliverables/

# Temp files (if any) remain
ls -lah temp/processing/
```

#### 3. Hooks Log Data
```bash
# All webhook logs preserved
# Location: orchestrai-shared/claude-code/logs/

# Token usage tracking continues
# No data loss in analytics
```

### ⚠️ LOST (Needs Restart)

#### 1. MCP Server Connections
- Must reconnect when VS Code restarts
- No persistent state loss (data in Redis/files)
- Just connection overhead (~5-10 seconds)

#### 2. VS Code Session State
- Open files (VS Code remembers these)
- Terminal sessions within VS Code
- Running tasks in VS Code terminal

#### 3. In-Flight Agent Operations
- Agents mid-execution stop
- Must rerun from start
- **But**: Completed work is saved to files ✅

---

## Restart Behavior Comparison

### Scenario 1: VS Code Crash (What Just Happened)

```
BEFORE CRASH:
├─ Redis ✅ Running
├─ Hooks Server ✅ Running
├─ Simultaneous ✅ Running
├─ MCP Servers (8) ✅ Running
└─ VS Code ✅ Running

AFTER CRASH:
├─ Redis ✅ Still Running
├─ Hooks Server ✅ Still Running
├─ Simultaneous ✅ Still Running
├─ MCP Servers (8) ❌ All Dead
└─ VS Code ❌ Crashed

AFTER RESTART:
├─ Redis ✅ Still Running (from before)
├─ Hooks Server ✅ Still Running (from before)
├─ Simultaneous ✅ Still Running (from before)
├─ MCP Servers (4) ✅ New PIDs, fresh start
└─ VS Code ✅ New PID, loads .mcp.json
```

### Scenario 2: Full System Restart

```
BEFORE:
├─ Redis ✅ Running
├─ Hooks Server ✅ Running
├─ Simultaneous ✅ Running
├─ MCP Servers ✅ Running
└─ VS Code ✅ Running

AFTER SYSTEM RESTART:
├─ Redis ❌ Must start: npm run redis
├─ Hooks Server ❌ Must start: npm run hooks:server
├─ Simultaneous ❌ Must start manually
├─ MCP Servers ❌ Start with VS Code
└─ VS Code ❌ Must open manually
```

---

## Service Management Strategy

### Current Setup (Manual Start)

**Pros**:
- ✅ Full control over services
- ✅ Easy debugging
- ✅ No resource waste when not working

**Cons**:
- ❌ Must remember to start each service
- ❌ Multiple terminal windows
- ❌ Easy to forget hooks/simultaneous server

### Recommended: Auto-Start Script

Create `scripts/start-all-services.sh`:
```bash
#!/bin/bash
echo "🚀 Starting ORCHESTRAI Services..."
echo ""

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
  echo "📦 Starting Redis..."
  npm run redis > /dev/null 2>&1 &
  sleep 2
else
  echo "✅ Redis already running"
fi

# Check if Hooks server is running
if ! lsof -ti:5501 > /dev/null 2>&1; then
  echo "🪝 Starting Hooks server..."
  npm run hooks:server > /dev/null 2>&1 &
  sleep 1
else
  echo "✅ Hooks server already running"
fi

# Check if Simultaneous server is running
if ! ps aux | grep "start-simultaneous-server.js" | grep -v grep > /dev/null; then
  echo "⚡ Starting Simultaneous server..."
  node orchestrai-shared/initialization/start-simultaneous-server.js > /dev/null 2>&1 &
  sleep 1
else
  echo "✅ Simultaneous server already running"
fi

echo ""
echo "=========================================="
echo "All Services Running"
echo "=========================================="
echo ""
echo "Status:"
redis-cli ping > /dev/null 2>&1 && echo "  ✅ Redis (port 6379)"
lsof -ti:5501 > /dev/null 2>&1 && echo "  ✅ Hooks (port 5501)"
ps aux | grep "start-simultaneous-server.js" | grep -v grep > /dev/null && echo "  ✅ Simultaneous"
echo ""
echo "MCP servers will start when you open VS Code"
echo ""
echo "To stop all services: ./scripts/stop-all-services.sh"
echo "=========================================="
```

### Quick Stop Script

Create `scripts/stop-all-services.sh`:
```bash
#!/bin/bash
echo "🛑 Stopping ORCHESTRAI Services..."
echo ""

# Stop Redis
if redis-cli ping > /dev/null 2>&1; then
  echo "📦 Stopping Redis..."
  redis-cli SHUTDOWN
fi

# Stop Hooks server
HOOKS_PID=$(lsof -ti:5501)
if [ -n "$HOOKS_PID" ]; then
  echo "🪝 Stopping Hooks server (PID $HOOKS_PID)..."
  kill $HOOKS_PID
fi

# Stop Simultaneous server
SIMUL_PID=$(ps aux | grep "start-simultaneous-server.js" | grep -v grep | awk '{print $2}')
if [ -n "$SIMUL_PID" ]; then
  echo "⚡ Stopping Simultaneous server (PID $SIMUL_PID)..."
  kill $SIMUL_PID
fi

echo ""
echo "✅ All services stopped"
```

---

## Your Workflow After Crash

### Option 1: Quick Resume (Services Running)

Since Redis, Hooks, and Simultaneous servers are STILL RUNNING:

```bash
# 1. Just restart VS Code
# That's it! MCP servers auto-start

# 2. Verify everything
./scripts/check-resources.sh
```

**Time**: 30 seconds (just VS Code restart)

### Option 2: Fresh Start (All Services)

If you want clean slate:

```bash
# 1. Stop everything
./scripts/stop-all-services.sh

# 2. Start everything
./scripts/start-all-services.sh

# 3. Open VS Code
open -a "Visual Studio Code"

# 4. Verify
./scripts/check-resources.sh
```

**Time**: 2 minutes (full restart)

---

## Monitoring Service Health

### Quick Health Check

```bash
#!/bin/bash
# Save as: scripts/check-services.sh

echo "🔍 ORCHESTRAI Service Health Check"
echo ""

# Redis
if redis-cli ping > /dev/null 2>&1; then
  REDIS_MEM=$(redis-cli INFO memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
  echo "✅ Redis: Running ($REDIS_MEM)"
else
  echo "❌ Redis: Not running - Start with: npm run redis"
fi

# Hooks
if lsof -ti:5501 > /dev/null 2>&1; then
  HOOKS_PID=$(lsof -ti:5501)
  echo "✅ Hooks: Running (PID $HOOKS_PID, port 5501)"
else
  echo "❌ Hooks: Not running - Start with: npm run hooks:server"
fi

# Simultaneous
if ps aux | grep "start-simultaneous-server.js" | grep -v grep > /dev/null; then
  SIMUL_PID=$(ps aux | grep "start-simultaneous-server.js" | grep -v grep | awk '{print $2}')
  echo "✅ Simultaneous: Running (PID $SIMUL_PID)"
else
  echo "❌ Simultaneous: Not running - Start manually"
fi

# MCP servers (count)
MCP_COUNT=$(ps aux | grep "mcp-server" | grep -v grep | wc -l)
if [ $MCP_COUNT -gt 0 ]; then
  echo "✅ MCP Servers: $MCP_COUNT active"
else
  echo "⚠️  MCP Servers: None running (start VS Code)"
fi

# VS Code
if ps aux | grep "Visual Studio Code.app" | grep -v grep > /dev/null; then
  VSCODE_PID=$(ps aux | grep "Visual Studio Code.app" | grep -v grep | head -n 1 | awk '{print $2}')
  echo "✅ VS Code: Running (PID $VSCODE_PID)"
else
  echo "⚠️  VS Code: Not running"
fi

echo ""
```

---

## Summary for Your Question

### "When VS Code crashes - do services keep running?"

**Answer**: **PARTIAL** - Core services YES, MCP servers NO

```
✅ KEEP RUNNING (No restart needed):
- Redis (your knowledge graph stays alive)
- Hooks server (webhook analytics continue)
- Simultaneous server (queue remains intact)

❌ DIE WITH VS CODE (Auto-restart with VS Code):
- All 8 MCP servers
- Extension hosts
- Language servers

✅ YOUR DATA (Always safe):
- Project files
- Deliverables
- Redis data
- Hooks logs
```

### "Do I need to initiate every time?"

**Answer**: **NO** - Only restart VS Code!

```bash
# Your current state (after crash):
Redis ✅ Still running
Hooks ✅ Still running
Simultaneous ✅ Still running
MCP Servers ❌ Dead (will auto-start with VS Code)

# What you need to do:
1. Open VS Code (Cmd+Space → "Visual Studio Code")
2. Wait 10 seconds (MCP servers initialize)
3. Continue work!

# That's it! No manual service starting needed.
```

---

**Pro Tip**: Create this alias in your `~/.zshrc`:
```bash
alias orchestrai-status='./scripts/check-services.sh'
alias orchestrai-start='./scripts/start-all-services.sh'
alias orchestrai-stop='./scripts/stop-all-services.sh'
```

Then just type `orchestrai-status` to check everything!

---

**Last Updated**: 2025-11-28
**Your Next Step**: Just restart VS Code - everything else is still running ✅
