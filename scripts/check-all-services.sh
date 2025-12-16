#!/bin/bash

##
# ORCHESTRAI System Health Check
# Checks the status of all required services for simultaneous execution
##

echo "═══════════════════════════════════════════════════════════"
echo "🔍 ORCHESTRAI System Health Check"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Redis
echo "📊 Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Redis is running${NC}"
    REDIS_STATUS="running"
else
    echo -e "   ${RED}❌ Redis is NOT running${NC}"
    echo "      Start with: npm run redis"
    REDIS_STATUS="stopped"
fi
echo ""

# Check Hooks Server (port 5501)
echo "🪝 Checking Hooks Server..."
if lsof -i :5501 -sTCP:LISTEN > /dev/null 2>&1; then
    PID=$(lsof -i :5501 -sTCP:LISTEN -t)
    echo -e "   ${GREEN}✅ Hooks Server is running${NC} (PID: $PID, Port: 5501)"
    HOOKS_STATUS="running"
else
    echo -e "   ${YELLOW}⚠️  Hooks Server is NOT running${NC}"
    echo "      Start with: npm run hooks:server"
    HOOKS_STATUS="stopped"
fi
echo ""

# Check Simultaneous Execution Server (port 8080)
echo "⚡ Checking Simultaneous Execution Server..."
if lsof -i :8080 -sTCP:LISTEN > /dev/null 2>&1; then
    PID=$(lsof -i :8080 -sTCP:LISTEN -t)
    echo -e "   ${GREEN}✅ Simultaneous Execution Server is running${NC} (PID: $PID, Port: 8080)"
    SIMULTANEOUS_STATUS="running"
else
    echo -e "   ${YELLOW}⚠️  Simultaneous Execution Server is NOT running${NC}"
    echo "      Start with: npm run simultaneous:start"
    SIMULTANEOUS_STATUS="stopped"
fi
echo ""

# Check Frontend (port 3000)
echo "🎨 Checking Frontend..."
if lsof -i :3000 -sTCP:LISTEN > /dev/null 2>&1; then
    PID=$(lsof -i :3000 -sTCP:LISTEN -t)
    echo -e "   ${GREEN}✅ Frontend is running${NC} (PID: $PID, Port: 3000)"
    FRONTEND_STATUS="running"
else
    echo -e "   ${YELLOW}⚠️  Frontend is NOT running${NC}"
    echo "      Start with: npm run dev"
    FRONTEND_STATUS="stopped"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "📋 Summary"
echo "═══════════════════════════════════════════════════════════"

if [ "$REDIS_STATUS" = "running" ]; then
    echo -e "${GREEN}✅${NC} Redis (Core)"
else
    echo -e "${RED}❌${NC} Redis (Core) - REQUIRED for simultaneous execution"
fi

if [ "$HOOKS_STATUS" = "running" ]; then
    echo -e "${GREEN}✅${NC} Hooks Server (Optional)"
else
    echo -e "${YELLOW}⚠️${NC}  Hooks Server (Optional) - Provides workflow tracking"
fi

if [ "$SIMULTANEOUS_STATUS" = "running" ]; then
    echo -e "${GREEN}✅${NC} Simultaneous Execution Server (Core)"
else
    echo -e "${RED}❌${NC} Simultaneous Execution Server (Core) - REQUIRED for parallel execution"
fi

if [ "$FRONTEND_STATUS" = "running" ]; then
    echo -e "${GREEN}✅${NC} Frontend (Optional)"
else
    echo -e "${YELLOW}⚠️${NC}  Frontend (Optional) - Dashboard and monitoring UI"
fi

echo ""

# Overall status
if [ "$REDIS_STATUS" = "running" ] && [ "$SIMULTANEOUS_STATUS" = "running" ]; then
    echo -e "${GREEN}🎉 System Status: READY for parallel execution${NC}"
    exit 0
elif [ "$REDIS_STATUS" = "running" ] && [ "$SIMULTANEOUS_STATUS" = "stopped" ]; then
    echo -e "${YELLOW}⚠️  System Status: PARTIAL - Start simultaneous execution server${NC}"
    echo ""
    echo "   Quick Start: npm run simultaneous:start"
    exit 1
else
    echo -e "${RED}❌ System Status: NOT READY - Missing required services${NC}"
    echo ""
    echo "   Quick Start:"
    echo "   1. npm run redis"
    echo "   2. npm run simultaneous:start"
    exit 1
fi
