#!/bin/bash
#
# Start Dual Semantic Intelligence Services
# - ORCHESTRAI ML Service (port 8000): Agent selection & prediction
# - VAIBE-SEMANTIC (port 8001): NLP & semantic analysis
#

set -e  # Exit on error

echo "🧠 Starting ORCHESTRAI Semantic Intelligence Services"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ports are available
echo "📊 Checking port availability..."

if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 8000 already in use!${NC}"
    echo "   Kill process: kill \$(lsof -ti:8000)"
    exit 1
else
    echo -e "${GREEN}✅ Port 8000 available (ORCHESTRAI ML Service)${NC}"
fi

if lsof -ti:8001 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 8001 already in use!${NC}"
    echo "   Kill process: kill \$(lsof -ti:8001)"
    exit 1
else
    echo -e "${GREEN}✅ Port 8001 available (VAIBE-SEMANTIC)${NC}"
fi

echo ""
echo "=========================================="
echo "Starting Services"
echo "=========================================="
echo ""

# Start ORCHESTRAI ML Service (port 8000)
echo "🤖 Starting ORCHESTRAI ML Service on port 8000..."
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-ml-service

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚙️  Creating Python virtual environment...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start ML Service in background
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/orchestrai-ml-service.log 2>&1 &
ML_PID=$!
echo -e "${GREEN}✅ ORCHESTRAI ML Service started (PID: $ML_PID)${NC}"
echo "   Logs: tail -f /tmp/orchestrai-ml-service.log"

sleep 2  # Wait for service to start

# Start VAIBE-SEMANTIC (port 8001)
echo ""
echo "🔬 Starting VAIBE-SEMANTIC on port 8001..."
cd /Users/kris/CLAUDEtools/VAIBE-SEMANTIC

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚙️  Creating Python virtual environment...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
else
    source venv/bin/activate
fi

# Start VAIBE-SEMANTIC in background
nohup python semantic_api_server.py > /tmp/vaibe-semantic.log 2>&1 &
VAIBE_PID=$!
echo -e "${GREEN}✅ VAIBE-SEMANTIC started (PID: $VAIBE_PID)${NC}"
echo "   Logs: tail -f /tmp/vaibe-semantic.log"

sleep 3  # Wait for services to initialize

echo ""
echo "=========================================="
echo "Health Checks"
echo "=========================================="
echo ""

# Health check for ORCHESTRAI ML Service
echo "🏥 Checking ORCHESTRAI ML Service health..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ORCHESTRAI ML Service healthy${NC}"
    curl -s http://localhost:8000/health | python3 -m json.tool
else
    echo -e "${RED}❌ ORCHESTRAI ML Service not responding${NC}"
fi

echo ""

# Health check for VAIBE-SEMANTIC
echo "🏥 Checking VAIBE-SEMANTIC health..."
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VAIBE-SEMANTIC healthy${NC}"
    curl -s http://localhost:8001/health | python3 -m json.tool
else
    echo -e "${RED}❌ VAIBE-SEMANTIC not responding${NC}"
fi

echo ""
echo "=========================================="
echo "Services Running"
echo "=========================================="
echo ""
echo "🤖 ORCHESTRAI ML Service"
echo "   URL: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   PID: $ML_PID"
echo ""
echo "🔬 VAIBE-SEMANTIC"
echo "   URL: http://localhost:8001"
echo "   Health: http://localhost:8001/health"
echo "   PID: $VAIBE_PID"
echo ""
echo "=========================================="
echo "Useful Commands"
echo "=========================================="
echo ""
echo "# View logs"
echo "tail -f /tmp/orchestrai-ml-service.log"
echo "tail -f /tmp/vaibe-semantic.log"
echo ""
echo "# Stop services"
echo "./scripts/stop-semantic-services.sh"
echo ""
echo "# Test integration"
echo "curl http://localhost:8000/health  # ML Service"
echo "curl http://localhost:8001/health  # VAIBE-SEMANTIC"
echo ""
echo "✅ Semantic Intelligence Services Ready!"
