#!/bin/bash
#
# Master Startup Script for ORCHESTRAI
# Starts ALL services in the correct order
#

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║         ORCHESTRAI - Master Startup Script            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to ORCHESTRAI directory
cd /Users/kris/CLAUDEtools/ORCHESTRAI

# Step 1: Start Semantic Services (Python)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Starting Semantic Intelligence Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./scripts/start-semantic-services.sh

echo ""
echo -e "${YELLOW}⏳ Waiting 30 seconds for services to initialize...${NC}"
sleep 30

# Step 2: Verify Semantic Services
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Verifying Semantic Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check ML Service
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ORCHESTRAI ML Service (port 8000): Running${NC}"
else
    echo -e "${RED}❌ ORCHESTRAI ML Service (port 8000): Not responding${NC}"
    echo "   Check logs: tail -f /tmp/orchestrai-ml-service.log"
fi

# Check VAIBE-SEMANTIC
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VAIBE-SEMANTIC (port 8001): Running${NC}"
else
    echo -e "${RED}❌ VAIBE-SEMANTIC (port 8001): Not responding${NC}"
    echo "   Check logs: tail -f /tmp/vaibe-semantic.log"
fi

# Step 3: Check if Node.js services should be started
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Node.js Services Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if lsof -ti:5501 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ORCHESTRAI Core (port 5501): Already running${NC}"
else
    echo -e "${YELLOW}⚠️  ORCHESTRAI Core (port 5501): Not running${NC}"
    echo ""
    echo "   To start Node.js services, run:"
    echo "   npm run dev          (development mode)"
    echo "   OR"
    echo "   npm run orchestrator (production mode)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Startup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Semantic Intelligence Services: Running${NC}"
echo ""
echo "Next: Start your Node.js application"
echo "  • Development: npm run dev"
echo "  • Production:  npm run orchestrator"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
