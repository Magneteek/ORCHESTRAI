# ORCHESTRAI Startup Guide

**Complete guide to starting and managing ORCHESTRAI services**

---

## 🎯 Quick Answer

### **For Most Users: Nothing to Start!**

ORCHESTRAI works through Claude Code:
- ✅ All 114 agents available
- ✅ Automatic session capture
- ✅ No extra services needed

**You're already running ORCHESTRAI if Claude Code is active.**

### **For Autonomous Execution: Start Trigger System**

Only if you need event-based triggers, cron scheduling, or autonomous agents:

```bash
./start-orchestrai.sh start
```

---

## 📋 What Needs to Run?

### **Always Running** (No Action Needed)

| Component | How It Runs | What It Does |
|-----------|-------------|--------------|
| **Claude Code** | Your current session | Main interface, agent execution |
| **Session Manager** | Hooks in `.claude/hooks/` | Automatic session capture |

### **Optional Services**

| Service | When to Start | Port | Purpose |
|---------|---------------|------|---------|
| **Trigger System** | For autonomous execution | 5502 | GitHub webhooks, cron, file watching |

---

## 🚀 Startup Methods

### **Method 1: Simple Script (Recommended)**

```bash
# Start all optional services
./start-orchestrai.sh start

# Check status
./start-orchestrai.sh status

# View logs
./start-orchestrai.sh logs

# Stop services
./start-orchestrai.sh stop
```

**Available commands:**
```bash
./start-orchestrai.sh start [service]   # Start services
./start-orchestrai.sh stop [service]    # Stop services
./start-orchestrai.sh restart [service] # Restart services
./start-orchestrai.sh status            # Show status
./start-orchestrai.sh logs [service]    # View logs
```

---

### **Method 2: Manual Startup**

```bash
# Start trigger system
cd orchestrai-trigger-system
npm start
```

Keep terminal open or use `nohup`:
```bash
cd orchestrai-trigger-system
nohup npm start > ../logs/triggers.log 2>&1 &
```

---

### **Method 3: PM2 (Production)**

**Install PM2:**
```bash
npm install -g pm2
```

**Start services:**
```bash
pm2 start ecosystem.config.js
```

**Manage services:**
```bash
pm2 status              # View status
pm2 logs                # View logs
pm2 monit               # Monitor resources
pm2 restart all         # Restart all
pm2 stop all            # Stop all
pm2 delete all          # Remove all

# Auto-start on boot
pm2 startup
pm2 save
```

---

### **Method 4: Docker Compose**

**Build and start:**
```bash
docker-compose up -d
```

**Manage containers:**
```bash
docker-compose ps       # Status
docker-compose logs -f  # Logs
docker-compose restart  # Restart
docker-compose down     # Stop and remove
```

---

## 🔍 Service Details

### **Trigger System** (Optional - Port 5502)

**When to start:**
- ✅ Auto-review PRs when opened
- ✅ Schedule daily/weekly tasks
- ✅ Process files as uploaded
- ✅ Respond to webhooks

**When NOT needed:**
- ❌ Just using agents via Task tool
- ❌ Manual agent invocation
- ❌ No automation needed

**Endpoints:**
- `http://localhost:5502/health` - Health check
- `http://localhost:5502/api/triggers` - Manage triggers
- `http://localhost:5502/api/cron/jobs` - Manage cron jobs
- `http://localhost:5502/webhooks/github` - GitHub webhooks
- `http://localhost:5502/webhooks/generic` - Generic webhooks

---

## 📊 Service Status

### **Check All Services**

```bash
./start-orchestrai.sh status
```

Output:
```
=== ORCHESTRAI Service Status ===

Core Services:
  Claude Code: ✓ Active (no separate process)
  Session Manager: ✓ Integrated via hooks

Optional Services:
  Trigger System: ✓ Running (http://localhost:5502)

Logs: /Users/kris/CLAUDEtools/ORCHESTRAI/logs/
Sessions: /Users/kris/CLAUDEtools/ORCHESTRAI/sessions/
```

### **Check Individual Ports**

```bash
# Check if trigger system is running
lsof -i :5502

# Or use curl
curl http://localhost:5502/health
```

---

## 🔧 Troubleshooting

### **"Port already in use"**

```bash
# Find what's using the port
lsof -i :5502

# Kill the process
kill <PID>

# Or use different port
TRIGGER_PORT=5503 npm start
```

### **"Service won't start"**

```bash
# Check logs
./start-orchestrai.sh logs

# Or view log files directly
tail -f logs/trigger-system.log
```

### **"Session capture not working"**

```bash
# Verify hooks exist
ls -la .claude/hooks/session-capture.js

# Check session manager
cd orchestrai-session-manager
npm install

# Restart Claude Code session
# (hooks load at startup)
```

---

## 📁 Directory Structure

```
ORCHESTRAI/
├── start-orchestrai.sh           # ← Unified startup script
├── ecosystem.config.js            # ← PM2 configuration
├── docker-compose.yml             # ← Docker Compose
├── logs/                          # ← Service logs
│   ├── trigger-system.log
│   └── trigger-system.pid
├── sessions/                      # ← Captured sessions
│   └── 2026/02/ses-*/
├── .claude/
│   └── hooks/
│       └── session-capture.js     # ← Auto session capture
├── orchestrai-session-manager/    # ← Session system
└── orchestrai-trigger-system/     # ← Trigger system
    ├── server.js
    ├── Dockerfile
    └── package.json
```

---

## 🎯 Common Scenarios

### **Scenario 1: Just Using Agents**

**Required:** Nothing! Just use Claude Code.

```bash
# No services to start
# All agents work via Task tool
# Sessions captured automatically
```

### **Scenario 2: Development with Triggers**

**Required:** Trigger system

```bash
# Terminal 1: Claude Code (already running)

# Terminal 2: Trigger system
./start-orchestrai.sh start

# Or manually
cd orchestrai-trigger-system
npm start
```

### **Scenario 3: Production Deployment**

**Required:** Trigger system (with PM2 or Docker)

```bash
# Option A: PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Option B: Docker
docker-compose up -d
```

---

## 🚦 Startup Checklist

### **First Time Setup**

- [ ] Install dependencies
  ```bash
  cd orchestrai-trigger-system
  npm install
  ```

- [ ] Make scripts executable
  ```bash
  chmod +x start-orchestrai.sh
  chmod +x orchestrai-trigger-system/server.js
  ```

- [ ] Create logs directory
  ```bash
  mkdir -p logs
  ```

### **Every Time**

**For basic usage:**
- [x] Claude Code running (you're using it)
- [x] That's it!

**For autonomous execution:**
- [ ] Start trigger system
  ```bash
  ./start-orchestrai.sh start
  ```

- [ ] Verify status
  ```bash
  ./start-orchestrai.sh status
  ```

- [ ] Check logs if needed
  ```bash
  ./start-orchestrai.sh logs
  ```

---

## 💡 Pro Tips

1. **Use the unified script** - `./start-orchestrai.sh` handles everything

2. **Check status first** - Run `./start-orchestrai.sh status` before starting

3. **View logs for debugging** - `./start-orchestrai.sh logs` shows real-time output

4. **PM2 for production** - Auto-restart, monitoring, and log management

5. **Docker for isolation** - Containerized deployment with health checks

---

## 🔗 Related Documentation

- **SERVICE-ARCHITECTURE.md** - Complete service overview
- **SESSIONS-INTEGRATION-COMPLETE.md** - Session Manager guide
- **PHASE2-INTEGRATION-COMPLETE.md** - Trigger System guide
- **orchestrai-trigger-system/README.md** - Trigger System details
- **orchestrai-trigger-system/QUICKSTART.md** - 5-minute trigger guide

---

## ✅ Summary

### **Most Users (Current)**

**Start:** Nothing
**Services:** Claude Code (already running)
**Agents:** All 114 available
**Sessions:** Automatic capture

### **Power Users (Autonomous)**

**Start:** `./start-orchestrai.sh start`
**Services:** Claude Code + Trigger System
**Agents:** All 114 + autonomous execution
**Features:** GitHub webhooks, cron, file watching

### **Production (Future)**

**Start:** `pm2 start ecosystem.config.js` or `docker-compose up -d`
**Services:** All infrastructure
**Deployment:** PM2, Docker, or Kubernetes
**Monitoring:** Health checks, logs, metrics

---

**Quick Start:** `./start-orchestrai.sh start`
**Check Status:** `./start-orchestrai.sh status`
**View Logs:** `./start-orchestrai.sh logs`
**Stop All:** `./start-orchestrai.sh stop`
