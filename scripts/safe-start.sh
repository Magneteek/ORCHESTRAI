#!/bin/bash

##
# ORCHESTRAI Safe Startup Script
# Prevents duplicate services and ensures clean startup
##

echo "═══════════════════════════════════════════════════════════"
echo "🔒 ORCHESTRAI Safe Startup Check"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use and show what's using it
check_port_detailed() {
    local PORT=$1
    local SERVICE=$2

    if lsof -i :$PORT -sTCP:LISTEN > /dev/null 2>&1; then
        local PROCESS=$(lsof -i :$PORT -sTCP:LISTEN | tail -n +2)
        local PID=$(lsof -i :$PORT -sTCP:LISTEN -t)
        local COMMAND=$(ps -p $PID -o comm= 2>/dev/null)

        echo -e "${YELLOW}⚠️  Port $PORT is already in use by $SERVICE${NC}"
        echo "   Process: $COMMAND (PID: $PID)"
        echo ""
        echo "   Full details:"
        echo "   $PROCESS"
        echo ""
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $PORT is available for $SERVICE"
        return 0
    fi
}

# Check all ORCHESTRAI service ports
echo "🔍 Checking for existing ORCHESTRAI services..."
echo ""

# Track issues
ISSUES=0

# Check WebSocket/Simultaneous Execution (Port 8080)
echo "1️⃣  Checking WebSocket/Simultaneous Execution Server (Port 8080)..."
if ! check_port_detailed 8080 "Simultaneous Execution Server"; then
    ISSUES=$((ISSUES + 1))
    echo "   Options:"
    echo "   a) Stop it: npm run simultaneous:stop"
    echo "   b) Kill manually: kill -9 $PID"
    echo "   c) Use different port: export WEBSOCKET_PORT=8081"
fi
echo ""

# Check Hooks Server (Port 5501)
echo "2️⃣  Checking Hooks Server (Port 5501)..."
if ! check_port_detailed 5501 "Hooks Server"; then
    HOOKS_RUNNING=true
    echo "   ℹ️  This is OK if you started it earlier"
    echo "   Options:"
    echo "   a) Keep it running (recommended)"
    echo "   b) Stop it: lsof -i :5501 -t | xargs kill -9"
else
    HOOKS_RUNNING=false
fi
echo ""

# Check Frontend (Port 3000)
echo "3️⃣  Checking Frontend (Port 3000)..."
if ! check_port_detailed 3000 "Frontend/Next.js Dev Server"; then
    FRONTEND_RUNNING=true
    echo "   ℹ️  This is optional, can keep running"
    echo "   Options:"
    echo "   a) Keep it running (recommended)"
    echo "   b) Stop it: lsof -i :3000 -t | xargs kill -9"
else
    FRONTEND_RUNNING=false
fi
echo ""

# Check Redis
echo "4️⃣  Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis is running (this is good!)"
    REDIS_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Redis is NOT running${NC}"
    REDIS_RUNNING=false
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check for multiple Node processes that might be duplicates
echo "5️⃣  Checking for duplicate Node.js processes..."
echo ""

# Count orchestrai-related processes
ORCHESTRAI_PROCESSES=$(ps aux | grep -E "simultaneous|hooks-server|orchestrator" | grep -v grep | wc -l | tr -d ' ')

if [ "$ORCHESTRAI_PROCESSES" -gt 0 ]; then
    echo -e "${BLUE}Found $ORCHESTRAI_PROCESSES ORCHESTRAI-related Node.js processes:${NC}"
    echo ""
    ps aux | grep -E "simultaneous|hooks-server|orchestrator" | grep -v grep | awk '{printf "   PID: %s | %s\n", $2, substr($0, index($0,$11))}'
    echo ""
fi

# Summary and recommendations
echo "═══════════════════════════════════════════════════════════"
echo "📋 Summary"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $ISSUES -eq 0 ] && [ "$REDIS_RUNNING" = true ]; then
    echo -e "${GREEN}✅ SAFE TO START - No conflicts detected${NC}"
    echo ""
    echo "Recommendation:"
    echo "   npm run simultaneous:start"
    echo ""
    exit 0
elif [ $ISSUES -eq 1 ] && [ "$REDIS_RUNNING" = false ]; then
    echo -e "${YELLOW}⚠️  REDIS NOT RUNNING${NC}"
    echo ""
    echo "Quick fix:"
    echo "   1. Start Redis first: npm run redis"
    echo "   2. Then start simultaneous: npm run simultaneous:start"
    echo ""
    exit 1
else
    echo -e "${RED}⚠️  CONFLICTS DETECTED - $ISSUES issue(s) found${NC}"
    echo ""
    echo "Recommendations:"
    echo ""

    if lsof -i :8080 -sTCP:LISTEN > /dev/null 2>&1; then
        echo "1. Simultaneous Execution Server already running:"
        echo "   Option A: Stop it first"
        echo "      npm run simultaneous:stop"
        echo "   Option B: Don't start another instance"
        echo "      (it's already running!)"
        echo ""
    fi

    if [ "$REDIS_RUNNING" = false ]; then
        echo "2. Start Redis:"
        echo "   npm run redis"
        echo ""
    fi

    echo "3. After fixing issues, run this check again:"
    echo "   ./scripts/safe-start.sh"
    echo ""
    exit 1
fi
