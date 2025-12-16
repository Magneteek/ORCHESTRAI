#!/bin/bash
#
# Stop ALL ORCHESTRAI services
#

echo "╔════════════════════════════════════════════════════════╗"
echo "║         ORCHESTRAI - Stop All Services                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Stop Semantic Services (Python)
echo "🛑 Stopping Semantic Intelligence Services..."
cd /Users/kris/CLAUDEtools/ORCHESTRAI
./scripts/stop-semantic-services.sh

echo ""

# Stop Node.js Core (if running)
if lsof -ti:5501 > /dev/null 2>&1; then
    PID=$(lsof -ti:5501)
    echo "🛑 Stopping ORCHESTRAI Node.js Core (PID: $PID)..."
    kill $PID 2>/dev/null || true
    echo -e "${GREEN}✅ Node.js Core stopped${NC}"
else
    echo "⚠️  ORCHESTRAI Node.js Core was not running"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All services stopped"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
