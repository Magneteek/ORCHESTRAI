# ORCHESTRAI Service Management Cheatsheet

Quick reference guide for starting, stopping, and managing all ORCHESTRAI services.

---

## 🚀 Quick Start - All Services

### Option 1: Using NPM Scripts (Recommended)
```bash
# Start all services at once
npm run services:start

# Check service status
npm run services:status

# View service logs
npm run services:logs
```

### Option 2: Manual Start (Step by Step)
```bash
# 1. Start Redis (Crystalline Memory)
npm run redis
# OR
redis-server

# 2. Start Webhook Server (Hooks & Analytics)
npm run hooks:server

# 3. Start Dashboard (Frontend UI)
npm run dev

# 4. Start Token Monitor (Optional)
npm run monitor:server
```

---

## 🔄 Restart Services

### Restart All Services
```bash
npm run services:restart
```

### Restart Individual Services
```bash
# Restart webhook server
pkill -f "hooks-server.js" && npm run hooks:server

# Restart dashboard
pkill -f "next dev" && npm run dev

# Restart Redis
brew services restart redis
# OR
pkill redis-server && redis-server

# Restart token monitor
pkill -f "token-monitor-server.js" && npm run monitor:server
```

---

## 🛑 Stop/Kill Services

### Stop All Services
```bash
npm run services:stop
```

### Kill Individual Services by Port
```bash
# Kill webhook server (port 5501)
lsof -ti:5501 | xargs kill -9

# Kill dashboard (port 3000)
lsof -ti:3000 | xargs kill -9

# Kill token monitor (port 5505)
lsof -ti:5505 | xargs kill -9

# Stop Redis (port 6379)
redis-cli shutdown
# OR
brew services stop redis
```

### Kill Services by Process Name
```bash
# Kill webhook server
pkill -f "hooks-server.js"

# Kill dashboard
pkill -f "next dev"

# Kill token monitor
pkill -f "token-monitor-server.js"

# Kill Redis
pkill redis-server

# Kill all MCP servers (CAREFUL!)
pkill -f "mcp-server"
```

### Emergency Stop - Kill Everything
```bash
# Nuclear option - stops all Node.js and Redis processes
pkill node
pkill redis-server

# More surgical approach - kill ORCHESTRAI only
pkill -f "orchestrai"
pkill -f "hooks-server"
pkill -f "token-monitor"
```

---

## 🔍 Service Status Checks

### Check All Services
```bash
npm run services:status
# OR
./scripts/check-services.sh
```

### Check Individual Services
```bash
# Redis
redis-cli ping
# Expected: PONG

# Webhook Server (port 5501)
curl http://localhost:5501/health
lsof -i :5501

# Dashboard (port 3000)
curl http://localhost:3000
lsof -i :3000

# Token Monitor (port 5505)
curl http://localhost:5505/metrics
lsof -i :5505

# PostgreSQL (if installed)
pg_isready
```

### Check Running Processes
```bash
# All ORCHESTRAI processes
ps aux | grep -E "(redis|hooks-server|token-monitor|next)" | grep -v grep

# MCP servers
ps aux | grep mcp-server | grep -v grep

# Port usage
lsof -i :5501  # Webhook server
lsof -i :3000  # Dashboard
lsof -i :5505  # Token monitor
lsof -i :6379  # Redis
```

---

## 🧹 Clean Up Duplicate/Zombie Processes

### Find and Kill Duplicate MCP Servers
```bash
# List all MCP server processes
ps aux | grep mcp-server | grep -v grep

# Kill specific duplicates (example PIDs)
kill 81515 81729 81746 81679 81696 81662 81642 81625

# Kill all MCP servers and let Claude Code restart them
pkill -f "mcp-server"
# Claude Code will automatically restart MCP servers when needed
```

### Find and Kill Zombie Processes
```bash
# Find zombie processes
ps aux | grep 'Z'

# Kill parent process of zombies (if safe)
# Note: Be careful with this command
ps -o ppid= -p <zombie_pid> | xargs kill -9
```

---

## 📊 Service Management Commands

### Redis Commands
```bash
# Start Redis
redis-server
# OR (macOS with Homebrew)
brew services start redis

# Stop Redis
redis-cli shutdown
# OR
brew services stop redis

# Check Redis status
brew services info redis
redis-cli ping

# Monitor Redis activity
redis-cli monitor

# Check Redis memory usage
redis-cli info memory
```

### Webhook Server Commands
```bash
# Start in background
npm run hooks:server &

# Start with logs
npm run hooks:server | tee logs/hooks-server.log

# Check webhook metrics
curl http://localhost:5501/hooks/metrics

# View active workflows
curl http://localhost:5501/hooks/workflows

# Check hook configuration
curl http://localhost:5501/hooks/config
```

### Dashboard Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
cd Orchestrai-frontend && npm start

# Check build errors
npm run typecheck
```

### Token Monitor Commands
```bash
# Start token monitor server
npm run monitor:server

# Start full monitoring (hooks + tokens)
npm run monitor:full

# Test token monitor
npm run monitor:test-data

# Inject current token usage
npm run monitor:inject
```

---

## 🔧 Common Service Issues & Fixes

### Redis Not Starting
```bash
# Check if Redis is already running
ps aux | grep redis-server

# Kill existing Redis processes
pkill redis-server

# Start fresh
redis-server
```

### Port Already in Use
```bash
# Find what's using the port (example: 5501)
lsof -i :5501

# Kill the process using the port
lsof -ti:5501 | xargs kill -9

# Start service again
npm run hooks:server
```

### MCP Servers Not Responding
```bash
# Kill all MCP servers
pkill -f "mcp-server"

# Claude Code will restart them automatically
# OR manually restart Claude Code
```

### Dashboard Won't Start
```bash
# Clean install
cd Orchestrai-frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Node Process Won't Die
```bash
# Force kill by PID
kill -9 <PID>

# Force kill by port
lsof -ti:<PORT> | xargs kill -9

# Nuclear option (kills ALL node processes)
killall -9 node
```

---

## 📝 Service Dependencies

```
┌─────────────────────────────────────────┐
│         ORCHESTRAI Services             │
└─────────────────────────────────────────┘
         │
         ├─ Redis (6379) ──────────────────── REQUIRED (Crystalline Memory)
         │
         ├─ Webhook Server (5501) ──────────── RECOMMENDED (Hooks & Analytics)
         │   └─ Token Monitor (5505) ────────── Optional (Cost tracking)
         │
         ├─ Dashboard (3000) ───────────────── Optional (Visualization)
         │
         ├─ PostgreSQL ─────────────────────── Optional (Data persistence)
         │
         └─ MCP Servers ────────────────────── AUTO-MANAGED (Claude Code)
             ├─ DataForSEO
             ├─ Notion
             ├─ Google Search Console
             ├─ Memory
             ├─ Filesystem
             ├─ Ref-tools
             ├─ Magic UI
             └─ Sequential Thinking
```

### Startup Order (Recommended)
1. **Redis** - Start first (core memory system)
2. **Webhook Server** - Start second (analytics & tracking)
3. **Dashboard** - Start third (visualization)
4. **Token Monitor** - Start last (optional metrics)

**Note:** MCP servers are automatically managed by Claude Code and don't need manual startup.

---

## 🎯 Production Deployment

### Start All Services for Production
```bash
# Build frontend
npm run build

# Start services (recommended order)
redis-server --daemonize yes
npm run hooks:server &
npm run monitor:server &
cd Orchestrai-frontend && npm start &

# Verify all running
npm run services:status
```

### Graceful Shutdown
```bash
# Stop services in reverse order
pkill -f "next start"
pkill -f "token-monitor-server"
pkill -f "hooks-server"
redis-cli shutdown
```

---

## 🧪 Testing & Debugging

### Test Service Connectivity
```bash
# Test Redis
redis-cli ping

# Test Webhook Server
curl -X POST http://localhost:5501/hooks/user-prompt-submit \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "userId": "test", "sessionId": "test"}'

# Test Dashboard
curl http://localhost:3000

# Test Token Monitor
curl http://localhost:5505/metrics
```

### View Service Logs
```bash
# Webhook server logs (if running in background)
npm run services:logs

# Redis logs
tail -f /opt/homebrew/var/log/redis.log

# Dashboard logs
cd Orchestrai-frontend && npm run dev 2>&1 | tee logs/dashboard.log
```

### Debug Mode
```bash
# Start webhook server with debug output
DEBUG=* npm run hooks:server

# Start dashboard with verbose logging
cd Orchestrai-frontend && npm run dev -- --debug
```

---

## 💡 Pro Tips

### Create Aliases (Add to ~/.zshrc or ~/.bashrc)
```bash
# Quick service management
alias orch-start="cd /Users/kris/CLAUDEtools/ORCHESTRAI && npm run services:start"
alias orch-stop="cd /Users/kris/CLAUDEtools/ORCHESTRAI && npm run services:stop"
alias orch-restart="cd /Users/kris/CLAUDEtools/ORCHESTRAI && npm run services:restart"
alias orch-status="cd /Users/kris/CLAUDEtools/ORCHESTRAI && npm run services:status"

# Individual services
alias orch-redis="redis-server"
alias orch-hooks="cd /Users/kris/CLAUDEtools/ORCHESTRAI && npm run hooks:server"
alias orch-dash="cd /Users/kris/CLAUDEtools/ORCHESTRAI && npm run dev"

# Clean slate
alias orch-clean="pkill redis-server; pkill -f hooks-server; pkill -f token-monitor; pkill -f 'next dev'"
```

### Background Process Management
```bash
# Start all services in background with logs
npm run redis > logs/redis.log 2>&1 &
npm run hooks:server > logs/hooks.log 2>&1 &
npm run dev > logs/dashboard.log 2>&1 &
npm run monitor:server > logs/monitor.log 2>&1 &

# View all background jobs
jobs

# Bring job to foreground
fg %1

# Kill all background jobs
kill $(jobs -p)
```

### Service Health Monitoring Script
```bash
#!/bin/bash
# Save as: check-health.sh

echo "🔍 ORCHESTRAI Health Check"
echo "=========================="
echo ""

# Redis
if redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis: ONLINE"
else
  echo "❌ Redis: OFFLINE"
fi

# Webhook Server
if curl -s http://localhost:5501/health > /dev/null 2>&1; then
  echo "✅ Webhook Server: ONLINE"
else
  echo "❌ Webhook Server: OFFLINE"
fi

# Dashboard
if lsof -i :3000 > /dev/null 2>&1; then
  echo "✅ Dashboard: ONLINE"
else
  echo "❌ Dashboard: OFFLINE"
fi

# Token Monitor
if lsof -i :5505 > /dev/null 2>&1; then
  echo "✅ Token Monitor: ONLINE"
else
  echo "⚠️  Token Monitor: OFFLINE (optional)"
fi

echo ""
echo "=========================="
```

---

## 🆘 Emergency Recovery

### Complete Reset
```bash
# 1. Kill everything
pkill node
pkill redis-server

# 2. Clean temporary files
rm -rf temp/*
rm -rf Orchestrai-frontend/.next
rm -rf node_modules/.cache

# 3. Restart services
redis-server &
sleep 2
npm run hooks:server &
sleep 2
npm run dev
```

### If Nothing Works
```bash
# Full system reset
npm run services:stop
pkill node
pkill redis-server
npm run setup
npm run services:start
```

---

**Last Updated:** 2025-11-28
**ORCHESTRAI Version:** 1.0.0

**See also:**
- [CLAUDE.md](CLAUDE.md) - Main system documentation
- [CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md) - Webhook integration guide
- [scripts/check-services.sh](scripts/check-services.sh) - Automated health checks
