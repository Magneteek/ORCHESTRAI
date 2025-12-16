#!/bin/bash
#
# Stop Dual Semantic Intelligence Services
#

echo "🛑 Stopping Semantic Intelligence Services..."
echo ""

# Stop ORCHESTRAI ML Service (port 8000)
ML_PID=$(lsof -ti:8000)
if [ -n "$ML_PID" ]; then
    echo "🤖 Stopping ORCHESTRAI ML Service (PID: $ML_PID)..."
    kill $ML_PID
    echo "✅ ORCHESTRAI ML Service stopped"
else
    echo "⚠️  ORCHESTRAI ML Service not running"
fi

# Stop VAIBE-SEMANTIC (port 8001)
VAIBE_PID=$(lsof -ti:8001)
if [ -n "$VAIBE_PID" ]; then
    echo "🔬 Stopping VAIBE-SEMANTIC (PID: $VAIBE_PID)..."
    kill $VAIBE_PID
    echo "✅ VAIBE-SEMANTIC stopped"
else
    echo "⚠️  VAIBE-SEMANTIC not running"
fi

echo ""
echo "✅ All services stopped"
