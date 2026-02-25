# ORCHESTRAI Service Architecture

**Current Services & Startup Requirements**

---

## 📊 Service Overview

### **✅ Currently Required Services**

| Service | Status | Port | Purpose | Startup Required |
|---------|--------|------|---------|------------------|
| **Claude Code** | Active | - | Main interface & agent execution | ✅ Already running |
| **Session Manager** | Integrated | - | Automatic session capture via hooks | ❌ No separate server |
| **Trigger System** | Optional | 5502 | Autonomous agent execution | ⚠️ Only if using triggers |

### **🔮 Future Services (Not Yet Implemented)**

| Service | Status | Port | Purpose |
|---------|--------|------|---------|
| Node.js Infrastructure | Planned | 5501 | System operations (memory, MCP, monitoring) |
| Team Dashboard | Phase 3 | 5503 | Web UI for team collaboration |
| Analytics Dashboard | Phase 4 | 5504 | Performance metrics & insights |

---

## 🚀 What Needs to Run?

### **Scenario 1: Basic ORCHESTRAI Usage** (Current Setup)
**Start: Nothing extra!**

```bash
# Just use Claude Code normally
# All agents work via Task tool
# Sessions captured automatically via hooks
```

✅ **Requirements:**
- Claude Code running (you're using it now)
- Session capture hooks in `.claude/hooks/` (already installed)

✅ **What works:**
- All 114 agents via Task tool
- Automatic session capture
- Session viewing via CLI
- All skills and commands

❌ **What doesn't work:**
- Event-based triggers (GitHub, webhooks)
- Cron scheduling
- Autonomous agent execution

---

### **Scenario 2: With Autonomous Triggers** (Phase 2)
**Start: Trigger System server**

```bash
# Terminal 1: Start trigger system
cd orchestrai-trigger-system
npm start
```

✅ **Requirements:**
- Claude Code running
- Trigger system server (port 5502)

✅ **What works:**
- Everything from Scenario 1
- GitHub webhook triggers
- Cron scheduling
- Filesystem watching
- Generic webhooks
- Autonomous agent execution

---

### **Scenario 3: Full Stack** (Future)
**Start: All infrastructure services**

```bash
# Not yet implemented - will be:
npm run start-all
# or
docker-compose up
```

---

## 🎯 Recommended Setup

### **For Most Users** (Current)

You're already set up! ORCHESTRAI works through Claude Code:

1. ✅ Claude Code is running (you're using it)
2. ✅ Session capture hooks are installed
3. ✅ All agents work via Task tool

**No additional services needed** unless you want autonomous triggers.

### **For Autonomous Execution** (Phase 2)

Only start trigger system if you need:
- Auto-review PRs when opened
- Scheduled daily/weekly tasks
- File processing automation
- Webhook integrations

```bash
cd orchestrai-trigger-system
npm start
```

---

## 🔧 Current Architecture

```
┌─────────────────────────────────────────────────┐
│              Claude Code (Always On)            │
│  - User interface                               │
│  - Agent execution via Task tool                │
│  - Session capture hooks (automatic)            │
└────────────────┬────────────────────────────────┘
                 │
                 ├─▶ Agents (114 available)
                 │   └─▶ Execute on demand
                 │
                 ├─▶ Session Manager (automatic)
                 │   └─▶ Captures all executions
                 │
                 └─▶ Trigger System (optional)
                     └─▶ Autonomous execution
                         - GitHub webhooks
                         - Cron scheduling
                         - File watching
```

---

## 📝 Status Summary

**What's Working Now:**
- ✅ All 114 agents
- ✅ Task tool invocation
- ✅ Automatic session capture
- ✅ Session viewing/search
- ✅ Resume/fork sessions
- ✅ Skills system
- ✅ MCP integrations

**What Requires Extra Server:**
- ⚠️ Event-based triggers (Trigger System)
- ⚠️ Cron scheduling (Trigger System)
- ⚠️ Autonomous execution (Trigger System)

**What's Planned:**
- 🔮 Node.js infrastructure server
- 🔮 Team dashboard
- 🔮 Analytics dashboard

---

## 🎯 Conclusion

**Most users don't need any extra services!**

ORCHESTRAI works fully through Claude Code with:
- All agents available
- Automatic session capture
- Full transparency and recoverability

**Only start Trigger System if you need autonomous agent execution.**
