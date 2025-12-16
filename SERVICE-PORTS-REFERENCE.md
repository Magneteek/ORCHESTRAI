# ORCHESTRAI Service Ports & Duplicate Prevention

## 🔌 Service Port Map

| Service | Port | Status Check | Start Command | Stop Command |
|---------|------|--------------|---------------|--------------|
| **Redis** | 6379 | `redis-cli ping` | `npm run redis` | `redis-cli shutdown` |
| **Hooks Server** | 5501 | `lsof -i :5501` | `npm run hooks:server` | `lsof -i :5501 -t \| xargs kill -9` |
| **Simultaneous Execution** | 8080 | `lsof -i :8080` | `npm run simultaneous:start` | `npm run simultaneous:stop` |
| **Frontend** | 3000 | `lsof -i :3000` | `npm run dev` | `lsof -i :3000 -t \| xargs kill -9` |

---

## 🛡️ Prevent Duplicate Services

### **Method 1: Safe Start Script (Recommended)**

```bash
# Run this BEFORE starting any service
./scripts/safe-start.sh
```

**What it does:**
- ✅ Checks all ports for conflicts
- ✅ Shows what's already running
- ✅ Provides clear recommendations
- ✅ Prevents you from starting duplicates

**Example output:**
```
🔒 ORCHESTRAI Safe Startup Check
═══════════════════════════════════════════════════════════

1️⃣  Checking WebSocket/Simultaneous Execution Server (Port 8080)...
✓ Port 8080 is available for Simultaneous Execution Server

2️⃣  Checking Hooks Server (Port 5501)...
⚠️  Port 5501 is already in use by Hooks Server
   Process: node (PID: 87249)
   ℹ️  This is OK if you started it earlier

3️⃣  Checking Frontend (Port 3000)...
✓ Port 3000 is available for Frontend/Next.js Dev Server

4️⃣  Checking Redis...
✓ Redis is running (this is good!)

📋 Summary
═══════════════════════════════════════════════════════════
✅ SAFE TO START - No conflicts detected

Recommendation:
   npm run simultaneous:start
```

---

### **Method 2: Manual Port Checks**

**Check specific ports:**

```bash
# Check port 8080 (Simultaneous Execution)
lsof -i :8080

# Check port 5501 (Hooks Server)
lsof -i :5501

# Check port 3000 (Frontend)
lsof -i :3000

# Check Redis
redis-cli ping
```

**If a port is in use, you'll see:**
```
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    87249 kris   12u  IPv6  ...     0t0  TCP *:fcp-addr-srvr2 (LISTEN)
```

**To kill a specific process:**
```bash
# By port
lsof -i :8080 -t | xargs kill -9

# By PID
kill -9 87249
```

---

### **Method 3: System Status Check**

```bash
# Comprehensive check of all services
npm run system:status-all
```

**This shows:**
- Which services are running
- Their PIDs
- Which ports they're using
- Overall system health

---

## 🚦 Safe Startup Workflow

### **Step 1: Check Current State**

```bash
# Option A: Safe start script (recommended)
./scripts/safe-start.sh

# Option B: System status
npm run system:status-all
```

### **Step 2: Stop Any Duplicates (if needed)**

```bash
# Stop specific service
npm run simultaneous:stop

# Or stop ALL services
npm run system:stop-all
```

### **Step 3: Start Fresh**

```bash
# Start all services (checks for duplicates first)
npm run system:start-all

# Or start just what you need
npm run simultaneous:start
```

---

## 🔍 How to Identify Duplicates

### **Scenario 1: Multiple instances of same service**

**Problem:** You started `npm run simultaneous:start` twice

**Detection:**
```bash
lsof -i :8080
```

**Result:**
```
COMMAND   PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345 kris   12u  IPv6  ...     0t0  TCP *:http-alt (LISTEN)
node    12346 kris   12u  IPv6  ...     0t0  TCP *:http-alt (LISTEN)  ⚠️ DUPLICATE!
```

**Fix:**
```bash
# Stop all instances
npm run simultaneous:stop

# Or kill specific PID
kill -9 12346

# Verify
lsof -i :8080

# Start fresh
npm run simultaneous:start
```

---

### **Scenario 2: Service won't start - port in use**

**Problem:** Getting "Port already in use" error

**Detection:**
```bash
./scripts/safe-start.sh
```

**Result:**
```
⚠️  Port 8080 is already in use by Simultaneous Execution Server
   Process: node (PID: 12345)

   Options:
   a) Stop it: npm run simultaneous:stop
   b) Kill manually: kill -9 12345
   c) Use different port: export WEBSOCKET_PORT=8081
```

**Fix:**
```bash
# Option A: Stop the existing one
npm run simultaneous:stop

# Option B: Use different port
export WEBSOCKET_PORT=8081
npm run simultaneous:start
```

---

### **Scenario 3: Unknown processes on ORCHESTRAI ports**

**Problem:** Something is using your ports but you don't know what

**Detection:**
```bash
# Find all processes on ORCHESTRAI ports
lsof -i :8080 -i :5501 -i :3000 -sTCP:LISTEN
```

**Detailed investigation:**
```bash
# Get process details
ps aux | grep <PID>

# Get full command
ps -p <PID> -o command=
```

**Fix:**
```bash
# If it's an old ORCHESTRAI process
kill -9 <PID>

# If it's something else (e.g., another app using port 8080)
# Either stop that app or use a different port
export WEBSOCKET_PORT=8081
```

---

## 📊 Quick Reference: "Is it running?"

```bash
# One-line checks for each service

# Redis
redis-cli ping && echo "✅ Running" || echo "❌ Not running"

# Hooks Server (Port 5501)
lsof -i :5501 > /dev/null && echo "✅ Running" || echo "❌ Not running"

# Simultaneous Execution (Port 8080)
lsof -i :8080 > /dev/null && echo "✅ Running" || echo "❌ Not running"

# Frontend (Port 3000)
lsof -i :3000 > /dev/null && echo "✅ Running" || echo "❌ Not running"
```

---

## 🎯 Best Practices

### **Before Starting Services:**

```bash
# 1. Always check first
./scripts/safe-start.sh

# 2. If conflicts, clean up
npm run system:stop-all

# 3. Start fresh
npm run system:start-all
```

### **Daily Workflow:**

```bash
# Morning: Check what's running
npm run system:status-all

# If nothing running, start everything
npm run system:start-all

# End of day: Stop everything
npm run system:stop-all
```

### **Troubleshooting:**

```bash
# If things seem weird, nuclear option:
npm run system:stop-all
sleep 5
npm run system:start-all

# Or even more aggressive:
killall node
redis-cli shutdown
sleep 5
npm run system:start-all
```

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't do this:**
```bash
# Starting same service twice
npm run simultaneous:start
npm run simultaneous:start  # ❌ Creates duplicate!
```

✅ **Do this instead:**
```bash
# Check first
npm run simultaneous:status

# If not running, start it
npm run simultaneous:start
```

❌ **Don't do this:**
```bash
# Starting without checking
npm run system:start-all  # Might create duplicates!
```

✅ **Do this instead:**
```bash
# Safe check first
./scripts/safe-start.sh

# Then start
npm run system:start-all
```

---

## 🆘 Emergency Cleanup

**If everything is messed up:**

```bash
# Nuclear option - kill all ORCHESTRAI services
./scripts/stop-all-services.sh

# Wait a moment
sleep 5

# Verify everything stopped
npm run system:status-all

# Start fresh
./scripts/safe-start.sh
npm run system:start-all
```

---

## 💡 Pro Tips

1. **Always use the safe-start script before starting services**
   ```bash
   ./scripts/safe-start.sh
   ```

2. **Keep a terminal tab for status checks**
   ```bash
   watch -n 5 npm run system:status-all
   ```

3. **Add aliases to your shell profile**
   ```bash
   alias orch-check='npm run system:status-all'
   alias orch-start='./scripts/safe-start.sh && npm run system:start-all'
   alias orch-stop='npm run system:stop-all'
   ```

4. **If in doubt, stop and restart**
   ```bash
   npm run system:stop-all && npm run system:start-all
   ```
