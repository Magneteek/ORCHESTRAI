# VS Code Crash Prevention Strategy
**Date**: 2025-11-28
**Incident**: Memory pressure crash during rapidcoldplunge project work

---

## Crash Analysis Summary

### Root Cause
**Memory exhaustion** in V8 JavaScript engine (Electron/Node.js runtime)

### Key Indicators from Crash Report
```
Exception Type: EXC_BREAKPOINT (SIGTRAP)
Crashed Thread: 7
Critical Function: v8::Isolate::MemoryPressureNotification(v8::MemoryPressureLevel)
Contributing Factor: c-ares DNS resolution thread contention
```

### System State at Crash Time
- **10+ MCP servers running**: Each consuming 50-200MB RAM
- **Multiple VS Code helper processes**: ~200-250MB each
- **Background services**: Hooks server, simultaneous server, Redis
- **Total estimated memory consumption**: 1.5-2GB+ just for MCP/Node.js processes

---

## Immediate Fixes

### 1. Reduce MCP Server Load
**Problem**: Too many MCP servers running simultaneously

**Solution**: Create lazy-loading MCP configuration
```json
{
  "mcpServers": {
    "filesystem": { "disabled": false },
    "memory": { "disabled": false },
    "sequential-thinking": { "disabled": false },
    "dataforseo": { "disabled": false },
    "ref-tools": { "disabled": true },  // Enable only when needed
    "notion": { "disabled": true },      // Enable only when needed
    "gsc": { "disabled": true }          // Enable only when needed
  }
}
```

**Action**: Edit `.mcp.json` to disable rarely-used servers by default

---

### 2. Increase VS Code Memory Limits
**Problem**: Default Node.js heap size too small for heavy workloads

**Solution**: Add to VS Code settings or launch args:
```json
{
  "terminal.integrated.env.osx": {
    "NODE_OPTIONS": "--max-old-space-size=4096"
  }
}
```

**Alternative**: Create VS Code launch script:
```bash
#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=4096"
open -a "Visual Studio Code"
```

---

### 3. File Watcher Optimization
**Problem**: ORCHESTRAI has 89 agents + templates + projects = thousands of files

**Solution**: Exclude non-critical directories from watching:
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/temp/**": true,
    "**/projects/**/deliverables/**": true,
    "**/.git/**": true
  },
  "files.exclude": {
    "**/temp/**": true
  }
}
```

---

### 4. Agent Execution Patterns
**Problem**: Running too many agents in parallel

**Solution**: Implement resource-aware orchestration:

```javascript
// Limit concurrent agents
const MAX_CONCURRENT_AGENTS = 3;

// Queue-based execution
const agentQueue = [];
const activeAgents = new Set();

async function executeAgentWithLimit(agentConfig) {
  while (activeAgents.size >= MAX_CONCURRENT_AGENTS) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  activeAgents.add(agentConfig.id);
  try {
    return await executeAgent(agentConfig);
  } finally {
    activeAgents.delete(agentConfig.id);
  }
}
```

---

## Long-Term Solutions

### 1. Resource Monitoring System
**Goal**: Prevent crashes before they happen

**Implementation**:
```javascript
// orchestrai-shared/monitoring/resource-monitor.js
const os = require('os');

class ResourceMonitor {
  constructor() {
    this.memoryThreshold = 0.85; // 85% of available memory
    this.checkInterval = 30000;  // Check every 30s
  }

  async checkMemoryPressure() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = (totalMem - freeMem) / totalMem;

    if (usedPercent > this.memoryThreshold) {
      console.warn('⚠️  Memory pressure detected:', usedPercent.toFixed(2));
      await this.releaseResources();
    }
  }

  async releaseResources() {
    // Clear caches, pause non-critical agents, etc.
    if (global.gc) {
      global.gc();
    }
  }
}

module.exports = new ResourceMonitor();
```

---

### 2. MCP Server Connection Pooling
**Goal**: Reuse MCP server connections instead of creating new ones

```javascript
// orchestrai-shared/mcp-servers/connection-pool.js
class MCPConnectionPool {
  constructor(maxConnections = 5) {
    this.pool = new Map();
    this.maxConnections = maxConnections;
  }

  async getConnection(serverName) {
    if (!this.pool.has(serverName)) {
      if (this.pool.size >= this.maxConnections) {
        // Release oldest connection
        const oldest = this.pool.keys().next().value;
        await this.releaseConnection(oldest);
      }

      this.pool.set(serverName, await this.createConnection(serverName));
    }

    return this.pool.get(serverName);
  }
}
```

---

### 3. Smart Agent Scheduling
**Goal**: Distribute workload based on system resources

```javascript
// orchestrai-shared/orchestration/smart-scheduler.js
class SmartScheduler {
  async scheduleAgents(agents) {
    const systemLoad = await this.getSystemLoad();

    if (systemLoad > 0.8) {
      // High load: sequential execution
      for (const agent of agents) {
        await this.executeAgent(agent);
      }
    } else if (systemLoad > 0.5) {
      // Medium load: limited parallelism
      await this.executeInBatches(agents, 2);
    } else {
      // Low load: full parallelism
      await Promise.all(agents.map(a => this.executeAgent(a)));
    }
  }
}
```

---

## Emergency Recovery Procedures

### If VS Code Becomes Unresponsive

**Step 1: Kill heavy MCP servers**
```bash
pkill -f "mcp-server-gsc"
pkill -f "notion-mcp-server"
pkill -f "ref-tools-mcp"
```

**Step 2: Clear VS Code cache**
```bash
rm -rf ~/Library/Application\ Support/Code/Cache/*
rm -rf ~/Library/Application\ Support/Code/CachedData/*
```

**Step 3: Restart with minimal MCP servers**
```bash
# Temporarily rename .mcp.json
mv .mcp.json .mcp.json.backup

# Create minimal config
echo '{
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["mcp-server-filesystem"] },
    "memory": { "command": "npx", "args": ["mcp-server-memory"] }
  }
}' > .mcp.json

# Restart VS Code
```

---

## Monitoring Checklist

Before starting heavy workloads:

- [ ] Check system memory: `vm_stat | head -n 10`
- [ ] Check running processes: `ps aux | grep -E "(node|mcp)" | wc -l`
- [ ] Verify Redis is running: `redis-cli ping`
- [ ] Check disk space: `df -h`
- [ ] Review active agents: `ls -la orchestrai-shared/orchestration/active-agents/`

---

## Performance Benchmarks

### Optimal Configuration
- **MCP Servers**: 4-6 active simultaneously
- **Concurrent Agents**: 2-3 maximum
- **Memory Usage**: < 70% of available RAM
- **File Watchers**: < 10,000 files

### Warning Signs
- Memory usage > 85%
- More than 8 MCP servers active
- VS Code becoming sluggish
- Frequent "Out of Memory" warnings

---

## Rapid Recovery Checklist

If crash happens during client work:

1. **Save work state**: Check `/temp/processing/` for active work
2. **Check project integrity**: Verify latest deliverables in `/projects/[uuid]/deliverables/`
3. **Review last operations**: Check Claude Code transcript in `~/.claude/projects/`
4. **Restart services safely**: Use `scripts/safe-start.sh`
5. **Resume with reduced load**: Enable only essential MCP servers

---

## Configuration Files to Create

1. `.vscode/settings.json` - Memory and watcher settings
2. `scripts/start-minimal.sh` - Minimal service startup
3. `scripts/check-resources.sh` - Pre-flight resource check
4. `orchestrai-shared/monitoring/resource-monitor.js` - Active monitoring

---

## References

- **Crash Report Location**: Provided by user (Thread 7 crashed)
- **V8 Memory Management**: https://v8.dev/docs/memory
- **Electron Performance**: https://www.electronjs.org/docs/latest/tutorial/performance
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## Next Steps

1. ✅ Document crash analysis
2. ⏳ Implement VS Code memory settings
3. ⏳ Create MCP server lazy-loading config
4. ⏳ Add resource monitoring
5. ⏳ Test with rapidcoldplunge project workload
