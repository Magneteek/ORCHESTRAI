# ORCHESTRAI ML Service - Training Guide

## Overview

This directory contains scripts and utilities for training the ORCHESTRAI agent selection ML models.

## Training Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                  Data Preparation Phase                      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
         ┌──────────▼────────┐  ┌──────▼───────────┐
         │  Extract Real Data │  │ Generate Synthetic│
         │  (extract_training │  │ Data (generate_   │
         │   _data.py)        │  │  synthetic_data.py)│
         └──────────┬────────┘  └──────┬───────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Training CSV      │
                    │  (data/*.csv)      │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                    Model Training Phase                        │
│                 (train_agent_selector.py)                      │
│                                                                │
│  1. Load and validate data                                    │
│  2. Feature engineering (23 features)                         │
│  3. Train three models:                                       │
│     - RandomForest (agent classification)                     │
│     - XGBoost (performance prediction)                        │
│     - XGBoost (duration prediction)                           │
│  4. Cross-validation and evaluation                           │
│  5. Save models and metadata                                  │
└───────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Trained Models    │
                    │  (models/*.pkl)    │
                    └───────────────────┘
```

## Scripts

### 1. extract_training_data.py

Extracts historical training data from ORCHESTRAI's crystalline memory (Redis).

**Usage:**
```bash
# Basic usage
python training/extract_training_data.py \
    --output ./data/training_data.csv

# Advanced usage with filters
python training/extract_training_data.py \
    --redis-url redis://localhost:6379 \
    --output ./data/training_data.csv \
    --min-samples 100 \
    --min-performance 0.5 \
    --lookback-days 90
```

**Parameters:**
- `--redis-url`: Redis connection URL (default: `redis://localhost:6379`)
- `--output`: Output CSV file path (default: `./data/training_data.csv`)
- `--min-samples`: Minimum number of samples required (default: 100)
- `--min-performance`: Minimum performance score 0-1 (default: 0.5)
- `--lookback-days`: Days of history to extract (default: 90)

**Data Sources:**
- `orchestrai:workflow:*` - Workflow execution records
- `orchestrai:agent-performance:*` - Agent performance metrics
- `orchestrai:memory:entity:*` - Crystalline memory entities

**Output:**
- Training CSV with columns:
  - Features: task_type, domain, complexity, priority, required_capabilities
  - Targets: agent_id, actual_performance, actual_duration_ms
  - Additional: client_name, project_uuid, estimated_word_count, etc.
- Statistics JSON with dataset summary

### 2. generate_synthetic_data.py

Generates realistic synthetic training data for testing and initial model training.

**Usage:**
```bash
# Generate 1000 samples
python training/generate_synthetic_data.py \
    --output ./data/synthetic_training_data.csv \
    --samples 1000

# Generate with realistic noise
python training/generate_synthetic_data.py \
    --output ./data/synthetic_training_data.csv \
    --samples 2000 \
    --add-noise
```

**Parameters:**
- `--output`: Output CSV file path (default: `./data/synthetic_training_data.csv`)
- `--samples`: Number of samples to generate (default: 1000)
- `--seed`: Random seed for reproducibility (default: 42)
- `--add-noise`: Add realistic noise and suboptimal selections

**Features:**
- Generates data for 10 ORCHESTRAI agents
- Realistic performance and duration distributions
- Proper capability matching
- Optional noise injection (20% suboptimal selections, 5% missing values)

### 3. train_agent_selector.py

Trains the agent selection ML models using prepared training data.

**Usage:**
```bash
# Basic training
python training/train_agent_selector.py \
    --data ./data/training_data.csv \
    --output ./models/agent_selector

# Training with custom parameters
python training/train_agent_selector.py \
    --data ./data/training_data.csv \
    --output ./models/agent_selector \
    --test-size 0.2 \
    --cv-folds 5
```

**Parameters:**
- `--data`: Path to training CSV file (required)
- `--output`: Output directory for models (default: `./models/agent_selector`)
- `--test-size`: Test set size fraction (default: 0.15)
- `--cv-folds`: Cross-validation folds (default: 5)

**Training Process:**
1. **Data Loading**: Load and validate CSV
2. **Feature Engineering**: Extract 23 features across 7 categories
3. **Train/Val/Test Split**: 70/15/15 split
4. **Model Training**:
   - RandomForest Classifier (200 trees, max_depth=15)
   - XGBoost Performance Predictor (100 estimators)
   - XGBoost Duration Predictor (100 estimators)
5. **Evaluation**: Cross-validation, test set metrics
6. **Model Saving**: PKL files + metadata

**Output Files:**
```
models/agent_selector/
├── agent_classifier.pkl       # RandomForest model
├── performance_predictor.pkl  # XGBoost performance model
├── duration_predictor.pkl     # XGBoost duration model
├── label_encoder.pkl          # Agent ID encoder
└── metadata.pkl              # Training metadata
```

## Quick Start Workflows

### Workflow 1: Training with Synthetic Data (Testing)

```bash
# Step 1: Generate synthetic data
python training/generate_synthetic_data.py \
    --output ./data/synthetic_data.csv \
    --samples 2000 \
    --add-noise

# Step 2: Train models
python training/train_agent_selector.py \
    --data ./data/synthetic_data.csv \
    --output ./models/agent_selector_v1

# Step 3: Start ML service
python -m app.main
```

### Workflow 2: Training with Real Data (Production)

```bash
# Step 1: Extract historical data
python training/extract_training_data.py \
    --redis-url redis://orchestrai-redis:6379 \
    --output ./data/real_training_data.csv \
    --min-samples 500 \
    --min-performance 0.6

# Step 2: Review extracted data
head -20 ./data/real_training_data.csv
cat ./data/real_training_data_stats.json

# Step 3: Train production models
python training/train_agent_selector.py \
    --data ./data/real_training_data.csv \
    --output ./models/agent_selector_production \
    --cv-folds 10

# Step 4: Deploy models
cp -r ./models/agent_selector_production/* ./models/agent_selector/

# Step 5: Restart ML service
docker-compose restart ml-service
```

### Workflow 3: Combining Real and Synthetic Data

```bash
# Step 1: Extract real data
python training/extract_training_data.py \
    --output ./data/real_data.csv \
    --min-samples 100

# Step 2: Generate synthetic data
python training/generate_synthetic_data.py \
    --output ./data/synthetic_data.csv \
    --samples 1000

# Step 3: Combine datasets
import pandas as pd
real = pd.read_csv('./data/real_data.csv')
synthetic = pd.read_csv('./data/synthetic_data.csv')
combined = pd.concat([real, synthetic], ignore_index=True)
combined.to_csv('./data/combined_data.csv', index=False)

# Step 4: Train on combined data
python training/train_agent_selector.py \
    --data ./data/combined_data.csv \
    --output ./models/agent_selector_combined
```

## Training Data Format

### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| **task_type** | string | Type of task | `content-creation` |
| **domain** | string | Task domain | `content` |
| **complexity** | string | Task complexity | `high` |
| **priority** | string | Task priority | `medium` |
| **required_capabilities** | JSON string | List of capabilities | `["multi-language","seo"]` |
| **agent_id** | string | Agent that performed task (TARGET) | `content-writer-specialist` |
| **actual_performance** | float | Performance score 0-1 (TARGET) | `0.92` |
| **actual_duration_ms** | int | Duration in ms (TARGET) | `45000` |

### Optional Columns

| Column | Type | Description |
|--------|------|-------------|
| client_name | string | Client name |
| project_uuid | string | Project identifier |
| estimated_word_count | int | Estimated content length |
| target_languages | JSON string | Target languages |
| quality_threshold | float | Quality requirement |
| psychographic_targeting | boolean | Uses psychographics |
| timestamp | ISO datetime | Completion timestamp |

## Model Evaluation Metrics

### Agent Classifier (RandomForest)
- **Accuracy**: >80% (correct agent selection)
- **Top-3 Accuracy**: >95% (one of top-3 is correct)
- **Cross-Validation**: <0.05 std (model stability)

### Performance Predictor (XGBoost)
- **MAE**: <0.1 (average error in performance score)
- **R²**: >0.75 (variance explained)

### Duration Predictor (XGBoost)
- **MAPE**: <20% (percentage error)
- **MAE**: <5000ms (average time error)

## Troubleshooting

### Issue: Not Enough Training Data

```bash
# Error: Only 50 samples extracted (minimum: 100)

# Solution 1: Lower minimum samples
python training/extract_training_data.py \
    --min-samples 50

# Solution 2: Increase lookback period
python training/extract_training_data.py \
    --lookback-days 180

# Solution 3: Lower performance threshold
python training/extract_training_data.py \
    --min-performance 0.3

# Solution 4: Use synthetic data
python training/generate_synthetic_data.py \
    --samples 1000
```

### Issue: Redis Connection Failed

```bash
# Check Redis is running
redis-cli ping

# Check ORCHESTRAI Redis
redis-cli -h orchestrai-redis -p 6379 ping

# Verify data exists
redis-cli KEYS "orchestrai:workflow:*" | wc -l
```

### Issue: Low Model Accuracy

1. **Check data quality**: Review extracted data for errors
2. **Increase training data**: Extract more historical data or generate more synthetic samples
3. **Tune hyperparameters**: Adjust model parameters in training script
4. **Feature engineering**: Review feature extraction in `app/services/feature_engineering.py`

### Issue: Model Training Fails

```bash
# Check data format
head -5 ./data/training_data.csv

# Validate CSV structure
python -c "import pandas as pd; df = pd.read_csv('./data/training_data.csv'); print(df.info())"

# Check for missing values
python -c "import pandas as pd; df = pd.read_csv('./data/training_data.csv'); print(df.isnull().sum())"
```

## Retraining Schedule

### Weekly (Incremental)
```bash
# Extract last 7 days of data
python training/extract_training_data.py \
    --lookback-days 7 \
    --output ./data/weekly_update.csv

# Combine with existing data and retrain
python training/train_agent_selector.py \
    --data ./data/combined_weekly_data.csv \
    --output ./models/agent_selector_v2
```

### Monthly (Full Retraining)
```bash
# Extract all historical data
python training/extract_training_data.py \
    --lookback-days 365 \
    --output ./data/full_history.csv

# Full model retraining
python training/train_agent_selector.py \
    --data ./data/full_history.csv \
    --output ./models/agent_selector_monthly
```

## Best Practices

1. **Always review statistics** before training:
   ```bash
   cat ./data/training_data_stats.json | jq
   ```

2. **Start with synthetic data** for initial testing:
   - Faster iteration
   - Known ground truth
   - No dependency on production data

3. **Validate extracted data** before training:
   - Check sample counts per agent
   - Review performance distributions
   - Verify date ranges

4. **Version your models**:
   ```bash
   ./models/agent_selector_v1.0.0/
   ./models/agent_selector_v1.1.0/
   ./models/agent_selector_v2.0.0/
   ```

5. **Keep training logs**:
   ```bash
   python training/train_agent_selector.py \
       --data ./data/training_data.csv 2>&1 | tee training_log.txt
   ```

## Next Steps

After training your models:

1. **Test predictions**: See `tests/test_models/test_agent_selector.py`
2. **Deploy models**: Copy to production model directory
3. **Monitor performance**: Track accuracy metrics in production
4. **Iterate**: Retrain as more data becomes available

## Support

- **Training Issues**: Review this README and troubleshooting section
- **Data Quality**: Check `extract_training_data.py` and data sources
- **Model Performance**: See `ML-MODEL-ARCHITECTURE.md` for architecture details
- **API Integration**: See main `README.md` and `QUICKSTART.md`
