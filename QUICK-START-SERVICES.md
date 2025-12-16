# ORCHESTRAI Services - Quick Start Guide

**Date**: 2025-11-28
**Status**: Dual Semantic Intelligence Services Active

---

## What Changed?

### Before (Single Service)
```bash
npm run dev          # Start Node.js and you're done
```

### Now (Three Services)
```bash
./scripts/start-all.sh    # Start Python services (ML + NLP)
npm run dev               # Start Node.js application
```

---

## Complete Startup Process

### Option 1: Using Shell Scripts (Recommended)

```bash
# 1. Start all Python semantic services
cd /Users/kris/CLAUDEtools/ORCHESTRAI
./scripts/start-all.sh

# Wait for "Startup Complete!" message (~30-40 seconds)

# 2. Start your Node.js application
npm run dev              # Development mode
# OR
npm run orchestrator     # Production mode
```

### Option 2: Using NPM Scripts (Convenient)

```bash
# 1. Start Python services
npm run services:start

# 2. Start Node.js application
npm run dev
```

---

## Verify Everything is Running

```bash
# Check status of all services
./scripts/status-all.sh

# OR
npm run services:status
```

**Expected Output:**
```
✅ ORCHESTRAI ML Service (port 8000): Running
✅ VAIBE-SEMANTIC (port 8001): Running
✅ ORCHESTRAI Node.js Core (port 5501): Running
```

---

## Stop All Services

```bash
# Stop everything cleanly
./scripts/stop-all.sh

# OR
npm run services:stop
```

---

## The Three Services Explained

### 1. ORCHESTRAI ML Service (Port 8000)
- **Technology**: FastAPI + RandomForest + XGBoost
- **Purpose**: ML-based agent selection and performance prediction
- **Startup Time**: ~3 seconds
- **Logs**: `/tmp/orchestrai-ml-service.log`

### 2. VAIBE-SEMANTIC (Port 8001)
- **Technology**: Flask + spaCy + BERT + Gensim
- **Purpose**: Advanced NLP and semantic analysis
- **Startup Time**: 10-15 seconds (75 seconds first time due to font cache)
- **Logs**: `/tmp/vaibe-semantic.log`

### 3. ORCHESTRAI Node.js Core (Port 5501)
- **Technology**: Node.js + TypeScript
- **Purpose**: Main orchestration system
- **Startup Time**: Varies based on mode
- **Logs**: Console output

---

## Troubleshooting

### Services Not Starting?

1. **Check if ports are in use:**
   ```bash
   lsof -ti:8000    # ML Service
   lsof -ti:8001    # VAIBE-SEMANTIC
   lsof -ti:5501    # Node.js Core
   ```

2. **Check service logs:**
   ```bash
   tail -f /tmp/orchestrai-ml-service.log
   tail -f /tmp/vaibe-semantic.log
   ```

3. **Restart services:**
   ```bash
   ./scripts/stop-all.sh
   ./scripts/start-all.sh
   npm run dev
   ```

### Health Check Failing?

```bash
# Test ML Service
curl http://localhost:8000/health

# Test VAIBE-SEMANTIC
curl http://localhost:8001/health
```

---

## Daily Workflow

### Morning Startup
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI
./scripts/start-all.sh    # Start Python services
npm run dev               # Start Node.js
```

### Evening Shutdown
```bash
./scripts/stop-all.sh     # Stop everything
```

### Quick Status Check
```bash
./scripts/status-all.sh   # See what's running
```

---

## Important Notes

✅ **Python services run in background** - They persist after you close the terminal
✅ **Node.js runs in foreground** - Stops when you close the terminal
✅ **First startup takes longer** - Font cache building (one-time ~60s)
✅ **Subsequent startups are fast** - Usually 10-15 seconds total

---

## Summary

**Yes, there IS something extra to run now:**

- **Extra Step**: Start Python semantic services BEFORE Node.js
- **Why**: Node.js application depends on these services for ML and NLP capabilities
- **How Long**: Add ~30-40 seconds to your startup time
- **Benefit**: Powerful dual semantic intelligence at your disposal

**New Normal:**
```bash
./scripts/start-all.sh && npm run dev
```

That's it! Two commands instead of one.

---

*For detailed architecture and API documentation, see DUAL-SEMANTIC-SERVICES-GUIDE.md*
