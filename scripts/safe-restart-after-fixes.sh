#!/bin/bash
#
# Safe Restart After Crash Prevention Fixes
# Restarts ORCHESTRAI services cleanly to load new crash protections
#

set -e

echo "=============================================="
echo "ORCHESTRAI Safe Restart"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Step 1: Stop existing services
echo -e "${CYAN}Step 1: Stopping existing services...${NC}"

# Stop simultaneous server
if lsof -i :8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "  Stopping simultaneous execution server (port 8080)..."
  lsof -i :8080 -sTCP:LISTEN -t | xargs kill -TERM 2>/dev/null || true
  sleep 2

  # Force kill if still running
  if lsof -i :8080 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "  Force stopping..."
    lsof -i :8080 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
  fi
  echo -e "  ${GREEN}✓ Simultaneous server stopped${NC}"
else
  echo "  ℹ️  Simultaneous server not running"
fi

# Stop hooks server
if lsof -i :5501 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "  Stopping hooks server (port 5501)..."
  lsof -i :5501 -sTCP:LISTEN -t | xargs kill -TERM 2>/dev/null || true
  sleep 2

  # Force kill if still running
  if lsof -i :5501 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "  Force stopping..."
    lsof -i :5501 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
  fi
  echo -e "  ${GREEN}✓ Hooks server stopped${NC}"
else
  echo "  ℹ️  Hooks server not running"
fi

# Step 2: Verify services stopped
echo ""
echo -e "${CYAN}Step 2: Verifying clean shutdown...${NC}"
sleep 1

if lsof -i :8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo -e "${RED}✗ Port 8080 still in use!${NC}"
  exit 1
fi

if lsof -i :5501 -sTCP:LISTEN >/dev/null 2>&1; then
  echo -e "${RED}✗ Port 5501 still in use!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All services stopped cleanly${NC}"

# Step 3: Verify fixes applied
echo ""
echo -e "${CYAN}Step 3: Verifying crash prevention fixes...${NC}"

# Check orchestrator config
if grep -q "maxParallelStreams: 3" orchestrai-shared/orchestration/simultaneous-stream-orchestrator.js; then
  echo -e "${GREEN}✓ Orchestrator: maxParallelStreams = 3${NC}"
else
  echo -e "${RED}✗ Orchestrator: maxParallelStreams not updated!${NC}"
  exit 1
fi

# Check aggregator has p-limit
if grep -q "pLimit = require('p-limit')" orchestrai-domains/client-intelligence/pipelines/comprehensive-intelligence-aggregator.js; then
  echo -e "${GREEN}✓ Aggregator: p-limit rate limiting enabled${NC}"
else
  echo -e "${RED}✗ Aggregator: p-limit not added!${NC}"
  exit 1
fi

# Check p-limit installed
if npm list p-limit >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Dependency: p-limit installed${NC}"
else
  echo -e "${RED}✗ Dependency: p-limit not installed!${NC}"
  echo "  Run: npm install p-limit"
  exit 1
fi

# Step 4: Verify Redis is running
echo ""
echo -e "${CYAN}Step 4: Checking dependencies...${NC}"

if redis-cli ping >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Redis: Running${NC}"
else
  echo -e "${YELLOW}⚠️  Redis: Not running${NC}"
  echo "  Starting Redis..."
  redis-server --daemonize yes
  sleep 1
  if redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis: Started${NC}"
  else
    echo -e "${RED}✗ Redis: Failed to start${NC}"
    exit 1
  fi
fi

# Step 5: Create temp directory for logs
echo ""
echo -e "${CYAN}Step 5: Preparing environment...${NC}"

mkdir -p ./temp
echo -e "${GREEN}✓ Temp directory ready${NC}"

# Step 6: Restart services
echo ""
echo -e "${CYAN}Step 6: Starting services with crash protections...${NC}"
echo ""

# Start hooks server in background
echo "Starting hooks server..."
nohup node orchestrai-shared/claude-code/hooks-server.js > ./temp/hooks-server.log 2>&1 &
HOOKS_PID=$!
sleep 2

if lsof -i :5501 -sTCP:LISTEN >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Hooks server started (PID: $HOOKS_PID)${NC}"
else
  echo -e "${RED}✗ Hooks server failed to start${NC}"
  cat ./temp/hooks-server.log
  exit 1
fi

# Start simultaneous server in background
echo "Starting simultaneous execution server (with crash protections)..."
nohup node orchestrai-shared/initialization/start-simultaneous-server.js > ./temp/simultaneous-server.log 2>&1 &
SIMUL_PID=$!
sleep 3

if lsof -i :8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Simultaneous server started (PID: $SIMUL_PID)${NC}"
else
  echo -e "${RED}✗ Simultaneous server failed to start${NC}"
  cat ./temp/simultaneous-server.log
  exit 1
fi

# Step 7: Verify services responding
echo ""
echo -e "${CYAN}Step 7: Testing service health...${NC}"

sleep 2

# Test hooks server
if curl -s http://localhost:5501/health >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Hooks server: Responding${NC}"
else
  echo -e "${YELLOW}⚠️  Hooks server: Not responding to health check (may be normal)${NC}"
fi

# Test simultaneous server
if lsof -i :8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Simultaneous server: Port listening${NC}"
else
  echo -e "${RED}✗ Simultaneous server: Not listening${NC}"
  exit 1
fi

# Final summary
echo ""
echo "=============================================="
echo -e "${GREEN}Restart Complete - Crash Protections Active${NC}"
echo "=============================================="
echo ""
echo "Services running:"
echo "  • Hooks server:        PID $HOOKS_PID (port 5501)"
echo "  • Simultaneous server: PID $SIMUL_PID (port 8080)"
echo ""
echo "Crash protections enabled:"
echo "  ✓ File I/O rate limiting (max 5 concurrent)"
echo "  ✓ Parallel streams limited (max 3)"
echo "  ✓ Batch execution for large workloads"
echo ""
echo "Logs:"
echo "  Hooks:       ./temp/hooks-server.log"
echo "  Simultaneous: ./temp/simultaneous-server.log"
echo ""
echo "Next steps:"
echo "  1. Monitor resources: ./scripts/monitor-pipeline-resources.sh"
echo "  2. Run your pipelines normally"
echo "  3. Watch for green indicators (all safe)"
echo ""
echo "=============================================="
