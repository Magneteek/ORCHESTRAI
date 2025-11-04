#!/bin/bash

# ORCHESTRAI ML Service - Quick Start Test Script
# This script demonstrates the complete training data pipeline

set -e  # Exit on error

echo "=================================================="
echo "🚀 ORCHESTRAI ML Service - Quick Start Test"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DATA_DIR="./data"
MODELS_DIR="./models"
SYNTHETIC_DATA="$DATA_DIR/test_synthetic_data.csv"
VALIDATION_REPORT="$DATA_DIR/validation_report.json"

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p $DATA_DIR
mkdir -p $MODELS_DIR
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Step 1: Generate synthetic training data
echo "=================================================="
echo -e "${BLUE}Step 1: Generating Synthetic Training Data${NC}"
echo "=================================================="
echo ""

python training/generate_synthetic_data.py \
    --output $SYNTHETIC_DATA \
    --samples 500 \
    --add-noise \
    --seed 42

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Synthetic data generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate synthetic data${NC}"
    exit 1
fi
echo ""

# Step 2: Validate training data
echo "=================================================="
echo -e "${BLUE}Step 2: Validating Training Data${NC}"
echo "=================================================="
echo ""

python training/validate_data.py \
    --data $SYNTHETIC_DATA \
    --output-report $VALIDATION_REPORT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Data validation passed${NC}"
else
    echo -e "${YELLOW}⚠️  Data validation had warnings/errors${NC}"
    echo -e "   Review the validation report: $VALIDATION_REPORT"
fi
echo ""

# Step 3: Display data statistics
echo "=================================================="
echo -e "${BLUE}Step 3: Data Statistics${NC}"
echo "=================================================="
echo ""

if [ -f "${DATA_DIR}/test_synthetic_data_stats.json" ]; then
    echo -e "${BLUE}Dataset Statistics:${NC}"
    cat "${DATA_DIR}/test_synthetic_data_stats.json" | python -m json.tool | head -30
    echo ""
else
    echo -e "${YELLOW}⚠️  Statistics file not found${NC}"
fi

# Step 4: Preview training data
echo "=================================================="
echo -e "${BLUE}Step 4: Data Preview${NC}"
echo "=================================================="
echo ""

echo -e "${BLUE}First 5 rows of training data:${NC}"
head -6 $SYNTHETIC_DATA | column -t -s,
echo ""

# Step 5: Check Python dependencies
echo "=================================================="
echo -e "${BLUE}Step 5: Checking Dependencies${NC}"
echo "=================================================="
echo ""

python -c "
import sys
try:
    import pandas
    import numpy
    import sklearn
    import xgboost
    import redis
    print('✅ All required packages installed')
    print(f'   - pandas: {pandas.__version__}')
    print(f'   - numpy: {numpy.__version__}')
    print(f'   - scikit-learn: {sklearn.__version__}')
    print(f'   - xgboost: {xgboost.__version__}')
    sys.exit(0)
except ImportError as e:
    print(f'❌ Missing package: {e}')
    print('   Install with: pip install -r requirements.txt')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All dependencies available${NC}"
else
    echo -e "${RED}❌ Missing dependencies - install with: pip install -r requirements.txt${NC}"
    exit 1
fi
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}🎉 Quick Start Test Completed Successfully!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}Generated Files:${NC}"
echo "  📄 Training Data: $SYNTHETIC_DATA"
echo "  📊 Statistics: ${DATA_DIR}/test_synthetic_data_stats.json"
echo "  📝 Validation Report: $VALIDATION_REPORT"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1️⃣  Review the training data:"
echo "     head -20 $SYNTHETIC_DATA"
echo ""
echo "  2️⃣  Train the agent selection model:"
echo "     python training/train_agent_selector.py \\"
echo "         --data $SYNTHETIC_DATA \\"
echo "         --output ./models/agent_selector"
echo ""
echo "  3️⃣  Start the ML service:"
echo "     python -m app.main"
echo ""
echo "  4️⃣  Test predictions:"
echo "     curl -X POST http://localhost:8000/api/v1/agent-selection/predict \\"
echo "         -H 'Content-Type: application/json' \\"
echo "         -d '{\"type\": \"content-creation\", \"domain\": \"content\", \"complexity\": \"high\"}'"
echo ""
echo "=================================================="
