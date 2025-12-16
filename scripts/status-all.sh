#!/bin/bash
#
# Check status of ALL ORCHESTRAI services
#

echo "╔════════════════════════════════════════════════════════╗"
echo "║         ORCHESTRAI - System Status Check              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Service Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check ORCHESTRAI ML Service (port 8000)
if lsof -ti:8000 > /dev/null 2>&1; then
    PID=$(lsof -ti:8000)
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ORCHESTRAI ML Service${NC}"
        echo "   Port: 8000 | PID: $PID | Status: Healthy"
    else
        echo -e "${YELLOW}⚠️  ORCHESTRAI ML Service${NC}"
        echo "   Port: 8000 | PID: $PID | Status: Running but not responding"
    fi
else
    echo -e "${RED}❌ ORCHESTRAI ML Service${NC}"
    echo "   Port: 8000 | Status: Not running"
fi

echo ""

# Check VAIBE-SEMANTIC (port 8001)
if lsof -ti:8001 > /dev/null 2>&1; then
    PID=$(lsof -ti:8001)
    if curl -s http://localhost:8001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ VAIBE-SEMANTIC${NC}"
        echo "   Port: 8001 | PID: $PID | Status: Healthy"
    else
        echo -e "${YELLOW}⚠️  VAIBE-SEMANTIC${NC}"
        echo "   Port: 8001 | PID: $PID | Status: Running but not responding"
    fi
else
    echo -e "${RED}❌ VAIBE-SEMANTIC${NC}"
    echo "   Port: 8001 | Status: Not running"
fi

echo ""

# Check ORCHESTRAI Node.js Core (port 5501)
if lsof -ti:5501 > /dev/null 2>&1; then
    PID=$(lsof -ti:5501)
    echo -e "${GREEN}✅ ORCHESTRAI Node.js Core${NC}"
    echo "   Port: 5501 | PID: $PID | Status: Running"
else
    echo -e "${RED}❌ ORCHESTRAI Node.js Core${NC}"
    echo "   Port: 5501 | Status: Not running"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Quick Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Start all:     ./scripts/start-all.sh"
echo "Stop all:      ./scripts/stop-all.sh"
echo "View ML logs:  tail -f /tmp/orchestrai-ml-service.log"
echo "View NLP logs: tail -f /tmp/vaibe-semantic.log"
echo ""
