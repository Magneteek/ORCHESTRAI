#!/bin/bash

##
# ORCHESTRAI System Shutdown
# Gracefully stops all ORCHESTRAI services
##

echo "═══════════════════════════════════════════════════════════"
echo "🛑 ORCHESTRAI System Shutdown"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop service on port
stop_service_on_port() {
    local PORT=$1
    local SERVICE=$2

    if lsof -i :$PORT -sTCP:LISTEN > /dev/null 2>&1; then
        PID=$(lsof -i :$PORT -sTCP:LISTEN -t)
        echo -e "   ${YELLOW}Stopping $SERVICE (PID: $PID)...${NC}"

        # Try graceful shutdown first (SIGTERM)
        kill -TERM $PID 2>/dev/null

        # Wait up to 10 seconds for graceful shutdown
        for i in {1..10}; do
            if ! kill -0 $PID 2>/dev/null; then
                echo -e "   ${GREEN}✅ $SERVICE stopped gracefully${NC}"
                return 0
            fi
            sleep 1
        done

        # Force kill if still running
        if kill -0 $PID 2>/dev/null; then
            echo -e "   ${YELLOW}⚠️  Forcing shutdown of $SERVICE...${NC}"
            kill -KILL $PID 2>/dev/null
            sleep 1
            echo -e "   ${GREEN}✅ $SERVICE stopped (forced)${NC}"
        fi
    else
        echo -e "   ${GREEN}✓${NC} $SERVICE not running"
    fi
}

# Stop services in reverse order of startup

echo "1️⃣  Stopping Frontend..."
stop_service_on_port 3000 "Frontend"
echo ""

echo "2️⃣  Stopping Simultaneous Execution Server..."
stop_service_on_port 8080 "Simultaneous Execution Server"
echo ""

echo "3️⃣  Stopping Hooks Server..."
stop_service_on_port 5501 "Hooks Server"
echo ""

echo "4️⃣  Stopping Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "   ${YELLOW}Shutting down Redis...${NC}"
    redis-cli shutdown > /dev/null 2>&1
    sleep 2

    if redis-cli ping > /dev/null 2>&1; then
        echo -e "   ${RED}❌ Redis still running${NC}"
    else
        echo -e "   ${GREEN}✅ Redis stopped${NC}"
    fi
else
    echo -e "   ${GREEN}✓${NC} Redis not running"
fi
echo ""

# Clean up log files (optional)
echo "5️⃣  Cleaning up..."
if [ -f /tmp/orchestrai-hooks.log ]; then
    rm /tmp/orchestrai-hooks.log
    echo "   Removed hooks log"
fi

if [ -f /tmp/orchestrai-simultaneous.log ]; then
    rm /tmp/orchestrai-simultaneous.log
    echo "   Removed simultaneous execution log"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ All ORCHESTRAI services stopped${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 To restart: npm run system:start-all"
echo ""
