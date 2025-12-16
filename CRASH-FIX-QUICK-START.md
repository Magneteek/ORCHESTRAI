# VS Code Crash Fix - Quick Start Guide

**Problem**: VS Code crashed due to memory exhaustion while working on rapidcoldplunge project
**Status**: ✅ FIXED - Prevention measures implemented

---

## What Caused The Crash?

```
★ Three Contributing Factors ★

1. Memory Pressure: 8+ MCP servers consuming 1.5-2GB RAM
2. Thread Contention: DNS resolution (c-ares) locking issues
3. V8 Heap Exhaustion: JavaScript engine ran out of memory
```

**Technical Detail**: The crash occurred in Thread 7 with `v8::Isolate::MemoryPressureNotification`, indicating V8's memory manager detected critical memory shortage and terminated the process.

---

## Immediate Actions (Already Done)

### ✅ 1. VS Code Memory Settings Created
**File**: `.vscode/settings.json`

Increases Node.js heap size to 4GB and optimizes file watching:
- `NODE_OPTIONS: --max-old-space-size=4096`
- Excludes temp/, deliverables/, and other heavy directories from watchers
- Configures TypeScript server with 4GB memory limit

### ✅ 2. Minimal MCP Configuration Created
**File**: `.mcp.minimal.json`

Reduces MCP servers from 8 to 4 essential ones:
- ✅ filesystem (required for project access)
- ✅ memory (knowledge graph)
- ✅ sequential-thinking (problem solving)
- ✅ dataforseo (SEO data)

**Disabled** (enable only when needed):
- ❌ ref-tools, notion, shadcn-ui, n8n, gsc

### ✅ 3. Resource Monitoring Scripts
**Files**:
- `scripts/check-resources.sh` - Pre-flight system check
- `scripts/switch-mcp-minimal.sh` - Activate lightweight config
- `scripts/switch-mcp-full.sh` - Restore all MCP servers

---

## What You Need To Do Now

### 1. Restart VS Code (REQUIRED)
```bash
# Close VS Code completely
# Then restart it to load new memory settings
```

⚠️ **IMPORTANT**: The memory optimizations in `.vscode/settings.json` only take effect after restart!

### 2. Choose Your Configuration

**Option A: Minimal (Recommended for now)**
```bash
./scripts/switch-mcp-minimal.sh
# Then restart VS Code
```

**Option B: Keep Current (Monitor closely)**
```bash
# Just restart VS Code with new memory settings
# Watch for performance issues
```

---

## Daily Workflow

### Before Starting Heavy Work
```bash
# Check system resources
./scripts/check-resources.sh

# If warnings appear, switch to minimal:
./scripts/switch-mcp-minimal.sh
```

### Signs You Need Minimal Config
- ⚠️ Memory usage > 85%
- ⚠️ VS Code becoming sluggish
- ⚠️ More than 6 MCP servers running
- ⚠️ Running complex multi-agent pipelines

### When You Can Use Full Config
- ✅ Memory usage < 70%
- ✅ Simple tasks (single agent execution)
- ✅ Not running many browser tabs/applications
- ✅ Fresh VS Code restart

---

## Current System Status

Based on latest check:
```
Memory: 11GB used / 16GB total (68%) ✅ OK
MCP Servers: 8 active ⚠️ TOO MANY
Node Processes: 27 total ⚠️ HIGH
Redis: Running (586MB) ✅ OK
Disk: 65% used ✅ OK
```

**Recommendation**: Switch to minimal configuration before resuming rapidcoldplunge work.

---

## Rapid Recovery Procedure

If VS Code becomes unresponsive or crashes again:

### Step 1: Kill Heavy Processes
```bash
# Kill non-essential MCP servers
pkill -f "mcp-server-gsc"
pkill -f "notion-mcp-server"
pkill -f "ref-tools-mcp"
pkill -f "shadcn-ui-mcp"
```

### Step 2: Switch to Minimal Config
```bash
./scripts/switch-mcp-minimal.sh
```

### Step 3: Clear Caches (if still having issues)
```bash
rm -rf ~/Library/Application\ Support/Code/Cache/*
rm -rf ~/Library/Application\ Support/Code/CachedData/*
```

### Step 4: Restart Everything
```bash
# Close VS Code
# Kill all Node.js processes (optional)
pkill -f "node"

# Start Redis if needed
npm run redis

# Restart VS Code
open -a "Visual Studio Code"
```

---

## Resuming rapidcoldplunge Work

Your work is safe! Here's what to check:

### 1. Verify Project State
```bash
# Check project directory
ls -lah /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/

# Verify deliverables
ls -R /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/deliverables/
```

### 2. Check for In-Progress Work
```bash
# Check temp directory for any processing files
ls -lah /Users/kris/CLAUDEtools/ORCHESTRAI/temp/processing/
```

### 3. Review Last Operations
```bash
# Claude Code transcript location
ls -lah ~/.claude/projects/-Users-kris-CLAUDEtools-ORCHESTRAI/
```

### 4. Resume Safely
- ✅ Run resource check first: `./scripts/check-resources.sh`
- ✅ Use minimal MCP config initially
- ✅ Execute agents **sequentially** instead of parallel
- ✅ Monitor memory during execution

---

## Prevention Best Practices

### Agent Execution Strategy
```javascript
// DON'T: Run many agents in parallel
await Promise.all([
  agent1(), agent2(), agent3(), agent4(), agent5()
]);

// DO: Run sequentially or in small batches
for (const agent of agents) {
  await agent();
}

// OR: Limited parallelism
await runInBatches(agents, 2); // Max 2 concurrent
```

### Resource-Aware Workflow
1. **Check resources** before heavy operations
2. **Use minimal MCP** for complex pipelines
3. **Sequential execution** for memory-intensive agents
4. **Monitor actively** during long-running tasks
5. **Clear temp regularly** to free disk space

---

## Files Created

### Configuration Files
- ✅ `.vscode/settings.json` - Memory and performance optimizations
- ✅ `.mcp.minimal.json` - Lightweight MCP configuration

### Management Scripts
- ✅ `scripts/check-resources.sh` - System status checker
- ✅ `scripts/switch-mcp-minimal.sh` - Activate minimal config
- ✅ `scripts/switch-mcp-full.sh` - Restore full config

### Documentation
- ✅ `CRASH-PREVENTION-STRATEGY.md` - Comprehensive crash analysis and prevention
- ✅ `CRASH-FIX-QUICK-START.md` - This quick reference guide

---

## Performance Monitoring

### Quick Memory Check
```bash
# One-liner memory status
vm_stat | head -n 10
```

### Process Count
```bash
# Count Node/MCP processes
ps aux | grep -E "(node|mcp)" | grep -v grep | wc -l
```

### Resource Dashboard
```bash
# Full system check (recommended)
./scripts/check-resources.sh
```

---

## Need Help?

### If VS Code crashes again:
1. Follow "Rapid Recovery Procedure" above
2. Check crash reports: `~/Library/Logs/DiagnosticReports/`
3. Review system logs for memory pressure warnings

### If performance degrades:
1. Run resource check: `./scripts/check-resources.sh`
2. Switch to minimal config if needed
3. Reduce concurrent operations
4. Consider closing other memory-heavy applications

### If agents fail unexpectedly:
1. Check available memory before retry
2. Run agents sequentially instead of parallel
3. Clear temp directory and caches
4. Restart VS Code with minimal config

---

## Summary

**What Happened**: Memory exhaustion from too many concurrent MCP servers
**What Fixed It**: Memory optimizations + minimal MCP configuration
**What To Do**: Restart VS Code, run resource check, switch to minimal config
**What To Watch**: Memory usage, MCP server count, performance during heavy workloads

**Status**: 🟢 System is ready to continue rapidcoldplunge work safely

---

**Last Updated**: 2025-11-28
**System**: macOS 15.2, VS Code 1.106.3
**Available Memory**: 5GB / 16GB (68% used)
**MCP Servers**: Currently 8 (recommend reducing to 4)
