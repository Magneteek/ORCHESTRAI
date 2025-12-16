#!/bin/bash

##
# ORCHESTRAI System Startup
# Starts all required services for simultaneous execution
##

echo "═══════════════════════════════════════════════════════════"
echo "🚀 ORCHESTRAI System Startup"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running on a port
check_port() {
    lsof -i :$1 -sTCP:LISTEN > /dev/null 2>&1
    return $?
}

# Function to wait for service to start
wait_for_service() {
    local PORT=$1
    local SERVICE=$2
    local MAX_WAIT=30
    local WAITED=0

    echo -e "   ${BLUE}⏳ Waiting for $SERVICE to start on port $PORT...${NC}"

    while [ $WAITED -lt $MAX_WAIT ]; do
        if check_port $PORT; then
            echo -e "   ${GREEN}✅ $SERVICE is ready${NC}"
            return 0
        fi
        sleep 1
        WAITED=$((WAITED + 1))
    done

    echo -e "   ${RED}❌ Timeout waiting for $SERVICE${NC}"
    return 1
}

# 1. Check and start Redis
echo "1️⃣  Starting Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Redis already running${NC}"
else
    echo "   Starting Redis server..."
    redis-server --daemonize yes > /dev/null 2>&1

    sleep 2

    if redis-cli ping > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Redis started successfully${NC}"
    else
        echo -e "   ${RED}❌ Failed to start Redis${NC}"
        echo "      Try manually: redis-server"
        exit 1
    fi
fi
echo ""

# 2. Start Hooks Server (optional but recommended)
echo "2️⃣  Starting Hooks Server..."
if check_port 5501; then
    echo -e "   ${GREEN}✅ Hooks Server already running${NC}"
else
    echo "   Starting Hooks Server on port 5501..."
    npm run hooks:server > /tmp/orchestrai-hooks.log 2>&1 &
    HOOKS_PID=$!

    if wait_for_service 5501 "Hooks Server"; then
        echo "   PID: $HOOKS_PID"
        echo "   Logs: /tmp/orchestrai-hooks.log"
    else
        echo -e "   ${YELLOW}⚠️  Hooks Server failed to start (optional service)${NC}"
        echo "      Check logs: cat /tmp/orchestrai-hooks.log"
    fi
fi
echo ""

# 3. Start Simultaneous Execution Server (REQUIRED)
echo "3️⃣  Starting Simultaneous Execution Server..."
if check_port 8080; then
    echo -e "   ${GREEN}✅ Simultaneous Execution Server already running${NC}"
else
    echo "   Starting Simultaneous Execution Server on port 8080..."
    npm run simultaneous:start > /tmp/orchestrai-simultaneous.log 2>&1 &
    SIMULTANEOUS_PID=$!

    if wait_for_service 8080 "Simultaneous Execution Server"; then
        echo "   PID: $SIMULTANEOUS_PID"
        echo "   Logs: /tmp/orchestrai-simultaneous.log"
        echo -e "   ${GREEN}✅ Parallel execution is now available${NC}"
    else
        echo -e "   ${RED}❌ Simultaneous Execution Server failed to start${NC}"
        echo "      Check logs: cat /tmp/orchestrai-simultaneous.log"
        exit 1
    fi
fi
echo ""

# 4. Optionally start Frontend
echo "4️⃣  Frontend (Optional)..."
if check_port 3000; then
    echo -e "   ${GREEN}✅ Frontend already running${NC}"
else
    echo -e "   ${YELLOW}ℹ️  Frontend not started (optional)${NC}"
    echo "      To start: npm run dev"
fi
echo ""

# Final status check
echo "═══════════════════════════════════════════════════════════"
echo "✅ ORCHESTRAI System Startup Complete"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Service Status:"
echo ""

redis-cli ping > /dev/null 2>&1 && echo -e "   ${GREEN}✅ Redis${NC} (Port: 6379)" || echo -e "   ${RED}❌ Redis${NC}"

if check_port 5501; then
    PID=$(lsof -i :5501 -sTCP:LISTEN -t)
    echo -e "   ${GREEN}✅ Hooks Server${NC} (Port: 5501, PID: $PID)"
else
    echo -e "   ${YELLOW}⚠️  Hooks Server${NC} (Not running)"
fi

if check_port 8080; then
    PID=$(lsof -i :8080 -sTCP:LISTEN -t)
    echo -e "   ${GREEN}✅ Simultaneous Execution Server${NC} (Port: 8080, PID: $PID)"
else
    echo -e "   ${RED}❌ Simultaneous Execution Server${NC} (Not running)"
fi

if check_port 3000; then
    PID=$(lsof -i :3000 -sTCP:LISTEN -t)
    echo -e "   ${GREEN}✅ Frontend${NC} (Port: 3000, PID: $PID)"
else
    echo -e "   ${YELLOW}⚠️  Frontend${NC} (Not running)"
fi

echo ""
echo "🔗 Access Points:"
echo "   WebSocket Coordination: ws://localhost:8080"
echo "   Hooks Server: http://localhost:5501"
echo "   Frontend Dashboard: http://localhost:3000 (if started)"
echo ""
echo "📋 Useful Commands:"
echo "   Check status: npm run system:status-all"
echo "   Stop all: npm run system:stop-all"
echo "   View logs:"
echo "     - Hooks: cat /tmp/orchestrai-hooks.log"
echo "     - Simultaneous: cat /tmp/orchestrai-simultaneous.log"
echo ""
echo "═══════════════════════════════════════════════════════════"
