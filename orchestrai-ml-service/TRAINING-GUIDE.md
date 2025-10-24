# ORCHESTRAI ML Service - Practical Training Guide

## Step-by-Step Training Process

### Prerequisites Check

Before training, ensure you have:

```bash
# 1. Python 3.11+ installed
python3 --version

# 2. Virtual environment activated
source venv/bin/activate  # On Mac/Linux
# or
venv\Scripts\activate     # On Windows

# 3. Dependencies installed
pip install -r requirements.txt

# 4. Training data prepared
ls -lh data/*.csv
```

## Training Methods

### Method 1: Quick Start Training (Synthetic Data)

**Best for**: Initial testing, development, learning the system

**Time**: 5-10 minutes

**Steps**:

```bash
# Step 1: Generate synthetic training data (2-3 minutes)
python3 training/generate_synthetic_data.py \
    --output ./data/training_synthetic.csv \
    --samples 2000 \
    --add-noise \
    --seed 42

# Step 2: Validate the data (30 seconds)
python3 training/validate_data.py \
    --data ./data/training_synthetic.csv

# Step 3: Train the models (5-7 minutes)
python3 training/train_agent_selector.py \
    --data ./data/training_synthetic.csv \
    --output ./models/agent_selector \
    --test-size 0.15 \
    --cv-folds 5

# Step 4: Verify model files were created
ls -lh models/agent_selector/
```

**Expected Output**:
```
models/agent_selector/
├── agent_classifier.pkl         (~30MB)
├── performance_predictor.pkl    (~10MB)
├── duration_predictor.pkl       (~10MB)
├── label_encoder.pkl            (~1KB)
└── metadata.pkl                 (~10KB)
```

### Method 2: Production Training (Real Data)

**Best for**: Production deployment with real ORCHESTRAI data

**Prerequisites**: ORCHESTRAI system running with historical data

**Steps**:

```bash
# Step 1: Extract real data from ORCHESTRAI Redis
python3 training/extract_training_data.py \
    --redis-url redis://localhost:6379 \
    --output ./data/training_real.csv \
    --min-samples 500 \
    --min-performance 0.6 \
    --lookback-days 90

# Step 2: Review extraction statistics
cat ./data/training_real_stats.json | python3 -m json.tool

# Step 3: Validate data quality
python3 training/validate_data.py \
    --data ./data/training_real.csv \
    --output-report ./data/validation_report.json

# Step 4: Train production models
python3 training/train_agent_selector.py \
    --data ./data/training_real.csv \
    --output ./models/agent_selector_production \
    --test-size 0.15 \
    --cv-folds 10

# Step 5: Deploy models
cp -r ./models/agent_selector_production/* ./models/agent_selector/
```

### Method 3: Hybrid Training (Combined Data)

**Best for**: Production with limited real data, or bootstrapping

**Steps**:

```bash
# Step 1: Generate synthetic data
python3 training/generate_synthetic_data.py \
    --output ./data/synthetic.csv \
    --samples 1500

# Step 2: Extract real data (if available)
python3 training/extract_training_data.py \
    --output ./data/real.csv \
    --min-samples 50

# Step 3: Combine datasets
python3 << EOF
import pandas as pd

# Load both datasets
synthetic = pd.read_csv('./data/synthetic.csv')
real = pd.read_csv('./data/real.csv')

# Combine (real data first for priority)
combined = pd.concat([real, synthetic], ignore_index=True)

# Remove duplicates if any
combined = combined.drop_duplicates(subset=['agent_id', 'timestamp'], keep='first')

# Save combined dataset
combined.to_csv('./data/training_combined.csv', index=False)

print(f"✅ Combined dataset: {len(combined)} samples")
print(f"   - Real: {len(real)} samples")
print(f"   - Synthetic: {len(synthetic)} samples")
EOF

# Step 4: Validate combined data
python3 training/validate_data.py \
    --data ./data/training_combined.csv

# Step 5: Train on combined data
python3 training/train_agent_selector.py \
    --data ./data/training_combined.csv \
    --output ./models/agent_selector
```

## Understanding Training Parameters

### train_agent_selector.py Parameters

```bash
python3 training/train_agent_selector.py \
    --data ./data/training.csv \      # Required: path to training CSV
    --output ./models/agent_selector \ # Output directory for models
    --test-size 0.15 \                # Test set size (15% default)
    --cv-folds 5                      # Cross-validation folds (5 default)
```

**Parameter Tuning**:

| Parameter | Default | Recommendation |
|-----------|---------|----------------|
| `--test-size` | 0.15 | Use 0.15-0.20 (15-20% test data) |
| `--cv-folds` | 5 | Use 5 for quick, 10 for production |

**Data Size Guidelines**:
- **Minimum**: 100 samples (for testing only)
- **Recommended**: 500-1000 samples (good baseline)
- **Production**: 2000+ samples (optimal performance)
- **Per Agent**: Aim for 20+ samples per agent

## Training Process Explained

### What Happens During Training

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Data Loading & Validation (10 seconds)         │
│ • Load CSV                                              │
│ • Validate required columns                            │
│ • Check data quality                                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ Step 2: Feature Engineering (30 seconds)               │
│ • Extract 23 features per sample                       │
│ • Encode categorical variables                         │
│ • Normalize numeric features                           │
│ • Create feature matrix (n_samples × 23)               │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ Step 3: Train/Val/Test Split (5 seconds)               │
│ • Training: 70% of data                                │
│ • Validation: 15% of data                              │
│ • Test: 15% of data                                    │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
┌────────▼─────────┐           ┌─────────▼─────────┐
│ Step 4a:         │           │ Step 4b:          │
│ Train Agent      │           │ Train Performance │
│ Classifier       │           │ Predictors        │
│ (3 minutes)      │           │ (2 minutes each)  │
│                  │           │                   │
│ RandomForest:    │           │ XGBoost:          │
│ • 200 trees      │           │ • Performance     │
│ • max_depth=15   │           │ • Duration        │
│ • balanced       │           │ • 100 estimators  │
└────────┬─────────┘           └─────────┬─────────┘
         │                               │
         └───────────┬───────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Step 5: Cross-Validation (1 minute)                    │
│ • 5-fold CV for agent classifier                       │
│ • Calculate mean accuracy and std                      │
│ • Verify model stability                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Step 6: Test Set Evaluation (30 seconds)              │
│ • Predict on held-out test set                        │
│ • Calculate accuracy metrics                          │
│ • Generate classification report                      │
│ • Compute confusion matrix                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Step 7: Save Models (10 seconds)                      │
│ • Save all 3 trained models (.pkl)                    │
│ • Save label encoder                                  │
│ • Save training metadata                              │
│ • Save evaluation metrics                             │
└─────────────────────────────────────────────────────────┘

Total Time: ~7-10 minutes (for 2000 samples)
```

## Reading Training Output

### Expected Console Output

```bash
📊 Loading training data from ./data/training.csv
   Loaded 2000 training samples
   Columns: ['task_type', 'domain', 'complexity', ...]
   Unique agents: 10

🔧 Preparing features and targets...
   Extracting features for 2000 samples...
   Feature extraction complete: (2000, 23)

✂️ Splitting data (train/val/test: 70/15/15)...
   Training set: 1400 samples
   Validation set: 300 samples
   Test set: 300 samples

🌲 Training agent classifier (RandomForest)...
   Fitting RandomForest with 200 trees...
   Training complete!

📈 Cross-validation (5 folds)...
   CV Scores: [0.857, 0.871, 0.843, 0.864, 0.850]
   Mean CV Accuracy: 0.857 (±0.010)
   ✅ Model is stable!

📊 Training performance predictor (XGBoost)...
   Fitting performance model...
   Validation MAE: 0.082
   Validation R²: 0.791
   ✅ Performance prediction looks good!

⏱️ Training duration predictor (XGBoost)...
   Fitting duration model...
   Validation MAPE: 16.3%
   Validation MAE: 4521ms
   ✅ Duration prediction looks good!

🎯 Evaluating on test set...
   Agent Classification:
   • Accuracy: 85.3%
   • Top-3 Accuracy: 96.7%

   Performance Prediction:
   • MAE: 0.078
   • R²: 0.803

   Duration Prediction:
   • MAPE: 15.8%
   • MAE: 4203ms

💾 Saving models to ./models/agent_selector/...
   ✅ agent_classifier.pkl
   ✅ performance_predictor.pkl
   ✅ duration_predictor.pkl
   ✅ label_encoder.pkl
   ✅ metadata.pkl

🎉 Training completed successfully!
```

### Understanding the Metrics

#### Agent Classification Metrics

**Accuracy (Target: >80%)**
- Percentage of correct agent selections
- Example: 85.3% = correct agent selected 85.3% of the time

**Top-3 Accuracy (Target: >95%)**
- Percentage where correct agent is in top-3 predictions
- Example: 96.7% = correct agent in top-3, 96.7% of the time

**Cross-Validation Std (Target: <0.05)**
- Model stability indicator
- Low std = consistent predictions across different data splits

#### Performance Prediction Metrics

**MAE - Mean Absolute Error (Target: <0.1)**
- Average error in performance score prediction
- Example: 0.078 = predictions are off by ±7.8% on average

**R² - Coefficient of Determination (Target: >0.75)**
- How much variance is explained by the model
- Example: 0.803 = model explains 80.3% of performance variance

#### Duration Prediction Metrics

**MAPE - Mean Absolute Percentage Error (Target: <20%)**
- Average percentage error in duration prediction
- Example: 15.8% = predictions are off by ±15.8% on average

**MAE - Mean Absolute Error (Target: <5000ms)**
- Average error in milliseconds
- Example: 4203ms = predictions are off by ±4.2 seconds

## After Training: Next Steps

### 1. Verify Model Files

```bash
# Check all model files exist
ls -lh models/agent_selector/

# Should see:
# agent_classifier.pkl       (~30MB)
# performance_predictor.pkl  (~10MB)
# duration_predictor.pkl     (~10MB)
# label_encoder.pkl          (~1KB)
# metadata.pkl               (~10KB)
```

### 2. Test the Models

```bash
# Start the ML service
python3 -m app.main

# In another terminal, test predictions
curl -X POST http://localhost:8000/api/v1/agent-selection/predict \
  -H "Content-Type: application/json" \
  -d '{
    "type": "content-creation",
    "domain": "content",
    "complexity": "high",
    "priority": "high",
    "required_capabilities": ["multi-language", "seo-optimization"]
  }'
```

**Expected Response**:
```json
{
  "predictions": [
    {
      "agent_id": "content-writer-specialist",
      "confidence": 0.92,
      "predicted_performance": 0.88,
      "estimated_duration_ms": 45000,
      "reasoning": [
        "High confidence selection (92%)",
        "Expected high performance (88%)",
        "Specialized in content domain"
      ]
    }
  ],
  "model_version": "v1.0.0",
  "inference_time_ms": 15
}
```

### 3. Deploy to Production

```bash
# Option A: Docker deployment
docker-compose up -d ml-service

# Option B: Manual deployment
# Copy models to production location
cp -r ./models/agent_selector /production/models/

# Restart ML service
systemctl restart orchestrai-ml-service
```

### 4. Monitor Performance

```bash
# Check Prometheus metrics
curl http://localhost:8000/metrics

# View prediction logs
tail -f logs/ml-service.log

# Access Grafana dashboards
open http://localhost:3001
```

## Troubleshooting

### Issue: "Not enough training samples"

```bash
# Error: Only 50 samples, minimum 100 required

# Solution 1: Generate more synthetic data
python3 training/generate_synthetic_data.py --samples 2000

# Solution 2: Lower minimum threshold
python3 training/train_agent_selector.py \
    --data data.csv \
    --min-samples 50  # Add this parameter
```

### Issue: "Low model accuracy (<70%)"

**Possible causes**:
1. **Insufficient training data** → Generate more samples
2. **Poor data quality** → Run validation script
3. **Imbalanced classes** → Check agent distribution

**Solutions**:
```bash
# Check data quality
python3 training/validate_data.py --data data.csv

# Review agent distribution
python3 -c "
import pandas as pd
df = pd.read_csv('data.csv')
print(df['agent_id'].value_counts())
"

# Generate more balanced synthetic data
python3 training/generate_synthetic_data.py --samples 3000
```

### Issue: "Model file not found"

```bash
# Verify training completed successfully
ls -lh models/agent_selector/

# If files missing, retrain:
python3 training/train_agent_selector.py \
    --data data.csv \
    --output ./models/agent_selector
```

### Issue: "Memory error during training"

```bash
# Reduce data size or use smaller models

# Option 1: Sample data
python3 -c "
import pandas as pd
df = pd.read_csv('large_data.csv')
sampled = df.sample(n=2000, random_state=42)
sampled.to_csv('sampled_data.csv', index=False)
"

# Option 2: Train on sampled data
python3 training/train_agent_selector.py \
    --data sampled_data.csv
```

## Best Practices

### 1. Version Your Models

```bash
# Use semantic versioning
./models/
├── agent_selector_v1.0.0/  # Initial release
├── agent_selector_v1.1.0/  # Minor update with more data
├── agent_selector_v2.0.0/  # Major update with new features
└── agent_selector/         # Symlink to current version
```

### 2. Keep Training Logs

```bash
# Save training output
python3 training/train_agent_selector.py \
    --data data.csv 2>&1 | tee logs/training_$(date +%Y%m%d_%H%M%S).log
```

### 3. Validate Before Production

```bash
# Always validate data before training
python3 training/validate_data.py --data data.csv

# Run cross-validation with more folds for production
python3 training/train_agent_selector.py \
    --cv-folds 10  # More thorough validation
```

### 4. Monitor Model Drift

```bash
# Track accuracy over time
# Compare new predictions vs actual outcomes
# Retrain monthly or when accuracy drops >5%
```

## Quick Reference Commands

```bash
# Generate synthetic data
python3 training/generate_synthetic_data.py --output data.csv --samples 2000

# Validate data
python3 training/validate_data.py --data data.csv

# Train models
python3 training/train_agent_selector.py --data data.csv

# Test training pipeline
./training/quickstart_test.sh

# Start ML service
python3 -m app.main
```

---

**Ready to train?** Start with Method 1 (Synthetic Data) for immediate testing!
