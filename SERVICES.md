# ORCHESTRAI Service Management Guide

Complete guide for managing ORCHESTRAI services on your development machine.

## Quick Start

### Check All Services
```bash
npm run services:status
```

### Start All Services
```bash
npm run services:start
```

### Stop All Services
```bash
npm run services:stop
```

### Restart All Services
```bash
npm run services:restart
```

---

## Service Architecture

ORCHESTRAI consists of three core services that work together:

### 1. **Redis** (Port 6379)
- **Purpose**: Crystalline memory storage and pipeline sharing
- **Required**: Yes - Core dependency for memory architecture
- **Dependencies**: None

### 2. **Main Orchestrator** (Port 5501)
- **Purpose**: Central coordination, MCP management, domain hubs
- **Required**: Yes - Core orchestration engine
- **Dependencies**: Redis must be running
- **Endpoints**:
  - Health: `http://localhost:5501/health`
  - MCP Status: `http://localhost:5501/mcp/status`
  - WebSocket: `ws://localhost:5501/ws`

### 3. **Frontend Dashboard** (Port 5500)
- **Purpose**: Real-time monitoring and system visualization
- **Required**: Optional - For visual monitoring
- **Dependencies**: Orchestrator must be running
- **URL**: `http://localhost:5500`

---

## Service Management Commands

### NPM Scripts (Recommended)

```bash
# Service Management
npm run services:status    # Check service health
npm run services:start     # Start all services
npm run services:stop      # Stop all services
npm run services:restart   # Restart all services
npm run services:logs      # View all logs

# MCP Server Management
npm run mcp:status         # Check MCP server status
npm run mcp:start          # Start all MCP servers
npm run mcp:logs           # View MCP logs

# Individual Services
npm run redis              # Start Redis only
npm run orchestrator       # Start orchestrator only
npm run dev                # Start frontend only
```

### Direct Script Usage

```bash
# Check service status
./scripts/check-services.sh

# Start specific services
./scripts/manage-services.sh start redis
./scripts/manage-services.sh start orchestrator
./scripts/manage-services.sh start frontend
./scripts/manage-services.sh start all

# Stop specific services
./scripts/manage-services.sh stop redis
./scripts/manage-services.sh stop orchestrator
./scripts/manage-services.sh stop frontend
./scripts/manage-services.sh stop all

# Restart services
./scripts/manage-services.sh restart all
./scripts/manage-services.sh restart orchestrator

# View logs
./scripts/manage-services.sh logs orchestrator
./scripts/manage-services.sh logs frontend
./scripts/manage-services.sh logs all
```

---

## Service Health Indicators

### ✅ Healthy System
```
Core Services:
─────────────────
✓ Redis (port 6379)         - RUNNING
✓ Main Orchestrator (5501)  - RUNNING + HEALTHY
✓ Frontend Dashboard (5500) - RUNNING

Domain Hubs:
─────────────────
✓ SEO Domain        - active
✓ Quality Domain    - active
✓ Content Domain    - active
✓ Client Intel      - active
✓ Web Quality       - active
```

### ⚠️ Partial System
```
Core Services:
─────────────────
✓ Redis (port 6379)         - RUNNING
✓ Main Orchestrator (5501)  - RUNNING + HEALTHY
⚠ Frontend Dashboard (5500) - SLOW/TIMEOUT
```
**Action**: Frontend may be building - wait 30s and check again

### ❌ Service Down
```
Core Services:
─────────────────
✗ Redis (port 6379)         - NOT RUNNING
✗ Main Orchestrator (5501)  - NOT RUNNING
```
**Action**: Run `npm run services:start`

---

## Startup Sequence

The correct startup order is critical for system stability:

1. **Redis** (Independent)
   ```bash
   npm run redis
   ```
   Wait 2-3 seconds for Redis to initialize

2. **Main Orchestrator** (Depends on Redis)
   ```bash
   npm run orchestrator
   ```
   Wait 5-10 seconds for full initialization

3. **Frontend Dashboard** (Depends on Orchestrator)
   ```bash
   npm run dev
   ```
   Wait 10-15 seconds for Next.js build

Or use automated startup:
```bash
npm run services:start  # Handles timing automatically
```

---

## Troubleshooting

### Redis Won't Start
```bash
# Check if Redis is already running
lsof -i :6379

# Kill existing Redis
pkill redis-server

# Restart
npm run redis
```

### Orchestrator Fails to Start
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"

# Check logs
tail -f logs/orchestrator.log

# Restart with fresh start
npm run services:restart orchestrator
```

### Frontend Timeout/Slow
This is normal during initial Next.js build. Wait 30-60 seconds.

If persistent:
```bash
# Rebuild frontend
cd Orchestrai-frontend
rm -rf .next
npm run build
cd ..

# Restart
npm run services:restart frontend
```

### Multiple Redis Instances
```bash
# Check all Redis processes
ps aux | grep redis-server

# Kill all Redis
pkill -9 redis-server

# Start single instance
npm run redis
```

### Port Already in Use
```bash
# Find process on port 5501
lsof -i :5501

# Kill specific process
kill -9 [PID]

# Restart service
npm run services:start
```

---

## System Monitoring

### Real-Time Health Check
```bash
watch -n 5 'npm run services:status'
```

### Detailed System Metrics
```bash
curl http://localhost:5501/health | jq
```

Key metrics to monitor:
- **Uptime**: System stability indicator
- **Memory Nodes**: Crystalline memory growth
- **Active Agents**: Current workload
- **Redis Status**: Core infrastructure health
- **Domain Hubs**: All should be "active"

### MCP Server Status
```bash
npm run mcp:status
```

All MCP servers should show:
- DataForSEO: `running`
- Sequential Thinking: `running`
- Filesystem: `running`
- Memory: `running`
- Notion: `running`

---

## Service Logs

Logs are stored in the `logs/` directory:

```
logs/
├── redis.log          # Redis server logs
├── orchestrator.log   # Main orchestrator logs
└── frontend.log       # Next.js frontend logs
```

### View Logs
```bash
# Real-time log monitoring
npm run services:logs

# Specific service
tail -f logs/orchestrator.log
tail -f logs/frontend.log

# Search logs
grep "error" logs/orchestrator.log
grep "MCP" logs/orchestrator.log
```

---

## Production Considerations

### Auto-Start on Boot
Add to your system's startup scripts:
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI
npm run services:start
```

### Process Management
For production use, consider using PM2:
```bash
npm install -g pm2

# Start with PM2
pm2 start npm --name "orchestrai-redis" -- run redis
pm2 start npm --name "orchestrai-orchestrator" -- run orchestrator
pm2 start npm --name "orchestrai-frontend" -- run dev

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup
```

### Health Monitoring
Set up automated health checks:
```bash
# Add to crontab
*/5 * * * * curl -s http://localhost:5501/health > /dev/null || npm run services:restart
```

---

## Performance Optimization

### Redis Memory Optimization
Check memory usage:
```bash
redis-cli INFO memory
```

### Orchestrator Metrics
View performance metrics:
```bash
curl http://localhost:5501/health | jq '.metrics'
```

### Frontend Performance
Monitor Next.js build times and optimize as needed:
```bash
cd Orchestrai-frontend
npm run build -- --profile
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Check all services | `npm run services:status` |
| Start all services | `npm run services:start` |
| Stop all services | `npm run services:stop` |
| Restart all | `npm run services:restart` |
| View logs | `npm run services:logs` |
| Check MCP status | `npm run mcp:status` |
| Full health check | `curl http://localhost:5501/health \| jq` |
| Redis ping | `redis-cli ping` |
| Kill all services | `npm run services:stop` |

---

## Getting Help

If you encounter issues:

1. Check service status: `npm run services:status`
2. Review logs: `npm run services:logs`
3. Restart services: `npm run services:restart`
4. Check health endpoint: `curl http://localhost:5501/health | jq`
5. Verify Redis: `redis-cli ping`

For persistent issues, check:
- [logs/orchestrator.log](logs/orchestrator.log) - Orchestrator errors
- [logs/frontend.log](logs/frontend.log) - Frontend build issues
- System resources (memory, CPU)
- Port conflicts (5500, 5501, 6379)
