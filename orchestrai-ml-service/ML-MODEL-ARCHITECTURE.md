# ORCHESTRAI Agent Selection ML Model Architecture

## Model Design Philosophy

The agent selection model uses a **hybrid ensemble approach** combining multiple ML algorithms to predict:
1. **Best agent for task** (classification)
2. **Expected performance** (regression)
3. **Estimated duration** (regression)
4. **Prediction confidence** (ensemble scoring)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Input: Task Context                           │
│  {type, domain, complexity, capabilities, priority, context...}  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Feature Engineering Pipeline                        │
│  FeatureEngineer.extract_features()                             │
│                                                                  │
│  Extracts 23 features:                                          │
│  • Task characteristics (4 features)                            │
│  • Capability matching (6 features)                             │
│  • Temporal patterns (4 features)                               │
│  • Context indicators (3 features)                              │
│  • Workload estimation (2 features)                             │
│  • Language features (2 features)                               │
│  • Quality requirements (2 features)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │   Feature Vector (23 dims)     │
            │   Normalized float32 array     │
            └────────┬───────────────────────┘
                     │
         ┌───────────┴───────────┬───────────────────┐
         ▼                       ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ RandomForest     │  │  XGBoost         │  │  XGBoost         │
│ Classifier       │  │  Regressor       │  │  Regressor       │
│                  │  │                  │  │                  │
│ 200 trees        │  │  100 estimators  │  │  100 estimators  │
│ max_depth=15     │  │  max_depth=6     │  │  max_depth=6     │
│ balanced classes │  │  learning_rate   │  │  learning_rate   │
│                  │  │  =0.1            │  │  =0.1            │
│                  │  │                  │  │                  │
│ Predicts:        │  │  Predicts:       │  │  Predicts:       │
│ • Agent ID       │  │  • Performance   │  │  • Duration (ms) │
│ • Probability    │  │    score (0-1)   │  │                  │
│   distribution   │  │                  │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         └──────────┬──────────┴──────────┬───────────┘
                    ▼                     ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ Top-K Selection  │  │ Confidence       │
         │ (ranked by prob) │  │ Scoring          │
         └────────┬─────────┘  └────────┬─────────┘
                  │                     │
                  └──────────┬──────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Final Prediction                               │
│                                                                  │
│  Top Agent:                                                      │
│  • agent_id: "content-writer-specialist"                        │
│  • confidence: 0.92                                             │
│  • predicted_performance: 0.88                                  │
│  • estimated_duration_ms: 45000                                 │
│  • reasoning: ["High confidence (92%)", "Expected high          │
│               performance (88%)", "Specialized in content"]      │
│                                                                  │
│  Alternative Agents (top-k):                                    │
│  • agent_id: "seo-content-optimizer", confidence: 0.78          │
│  • agent_id: "multi-language-writer", confidence: 0.65         │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Engineering Details

### 1. Task Characteristics (4 features)

```python
# Encoded categorical features
task_type_encoded       # 0.0-1.0 (10 task types)
domain_encoded          # 0.0-1.0 (8 domains)
complexity_score        # 0.3 (low) to 1.0 (very-high)
priority_score          # 0.3 (low) to 1.0 (high)
```

**Purpose**: Capture fundamental task properties

**Example**:
- Content creation, high complexity, high priority
- `[0.0, 0.0, 0.9, 1.0]`

### 2. Capability Matching (6 features)

```python
num_required_capabilities      # Count of required capabilities
capability_diversity_score     # Unique capabilities / total
has_ml_capability             # 0 or 1
has_nlp_capability            # 0 or 1
has_seo_capability            # 0 or 1
has_content_capability        # 0 or 1
```

**Purpose**: Match agent capabilities to task requirements

**Example**:
- Requires: ["multi-language", "seo-optimization", "content-creation"]
- `[3, 1.0, 0, 0, 1, 1]`

### 3. Temporal Features (4 features)

```python
hour_of_day_normalized    # 0.0-1.0 (hour / 24)
day_of_week_normalized    # 0.0-1.0 (day / 7)
is_weekend                # 0 or 1
is_business_hours         # 0 or 1 (9am-5pm)
```

**Purpose**: Capture time-based patterns in agent performance

**Why it matters**: Some agents perform better at specific times due to load distribution

### 4. Context Features (3 features)

```python
has_historical_context    # 0 or 1
has_client_context        # 0 or 1
has_project_context       # 0 or 1
```

**Purpose**: Indicate availability of historical data for better prediction

### 5. Workload Features (2 features)

```python
estimated_word_count_normalized      # min(word_count / 5000, 1.0)
estimated_complexity_multiplier      # 0.5 to 2.0
```

**Purpose**: Estimate task size and resource requirements

### 6. Language Features (2 features)

```python
is_multi_language           # 0 or 1
target_language_encoded     # 0.0-1.0 (language code)
```

**Purpose**: Match agents with language capabilities

### 7. Quality Requirements (2 features)

```python
quality_threshold_normalized         # 0.0-1.0
requires_psychographic_targeting     # 0 or 1
```

**Purpose**: Match quality expectations with agent capabilities

## Model Training Process

### Data Preparation

```
Historical Tasks (from crystalline memory)
           ↓
Feature Engineering
           ↓
Train/Val/Test Split (70/15/15)
           ↓
Label Encoding (agent IDs → integers)
           ↓
3 Parallel Model Trainings
```

### Training Configuration

```python
# Agent Classifier (RandomForest)
RandomForestClassifier(
    n_estimators=200,        # 200 decision trees
    max_depth=15,            # Prevent overfitting
    min_samples_split=5,     # Minimum samples for split
    class_weight='balanced', # Handle imbalanced agents
    random_state=42
)

# Performance Predictor (XGBoost)
XGBRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8
)

# Duration Predictor (XGBoost)
XGBRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8
)
```

### Evaluation Metrics

| Model | Metric | Target | Purpose |
|-------|--------|--------|---------|
| **Agent Classifier** | Accuracy | >80% | Correct agent selection rate |
| | Top-3 Accuracy | >95% | One of top-3 is correct |
| | Cross-validation | <0.05 std | Model stability |
| **Performance Predictor** | MAE | <0.1 | Average error in performance |
| | R² | >0.75 | Variance explained |
| **Duration Predictor** | MAPE | <20% | Percentage error |
| | MAE | <5000ms | Average time error |

## Inference Pipeline

### Single Prediction

```python
# 1. Extract features
features = feature_engineer.extract_features(task_context)
# Shape: (23,)

# 2. Predict agent (classification)
probabilities = agent_classifier.predict_proba(features)
# Shape: (n_agents,)
agent_idx = np.argmax(probabilities)
agent_id = label_encoder.inverse_transform([agent_idx])[0]
confidence = probabilities[agent_idx]

# 3. Predict performance (regression)
performance = performance_predictor.predict(features)[0]
# Value: 0.0 - 1.0

# 4. Predict duration (regression)
duration_ms = duration_predictor.predict(features)[0]
# Value: milliseconds

# 5. Generate reasoning
reasoning = model._generate_reasoning(agent_id, features, confidence, performance)

# 6. Return prediction
return {
    "agent_id": agent_id,
    "confidence": confidence,
    "predicted_performance": performance,
    "estimated_duration_ms": duration_ms,
    "reasoning": reasoning
}
```

### Top-K Predictions

```python
# Get probabilities for all agents
probabilities = agent_classifier.predict_proba(features)[0]

# Get top-k indices
top_k_indices = np.argsort(probabilities)[-k:][::-1]

# Generate prediction for each top-k agent
predictions = []
for idx in top_k_indices:
    agent_id = label_encoder.inverse_transform([idx])[0]
    # ... predict performance and duration ...
    predictions.append(prediction_dict)

return predictions  # Ranked by confidence
```

## Confidence Scoring

The model uses a multi-factor confidence score:

```python
# Base confidence from RandomForest
base_confidence = max_probability_from_classifier

# Adjust based on prediction variance
if std_dev_across_trees < threshold:
    confidence_boost = +0.05

# Adjust based on feature quality
if has_historical_context:
    confidence_boost = +0.03

# Adjust based on performance prediction
if predicted_performance > 0.85:
    confidence_boost = +0.02

final_confidence = min(base_confidence + adjustments, 1.0)
```

## Reasoning Generation

The model generates human-readable explanations:

```python
reasoning = []

# Confidence level
if confidence > 0.9:
    reasoning.append("High confidence selection (92%)")

# Performance expectation
if predicted_performance > 0.85:
    reasoning.append("Expected high performance (88%)")

# Feature importance
important_features = get_top_features(features, n=3)
reasoning.append(f"Key factors: {', '.join(important_features)}")

# Agent specialization
reasoning.append(f"Specialized in {agent.domain} domain")
```

**Example Output**:
```
[
  "High confidence selection (92%)",
  "Expected high performance (88%)",
  "Key factors: task_type=content-creation, complexity=high, has_content_capability=1",
  "Specialized in content domain"
]
```

## Model Versioning & Registry

### Model Artifacts

```
models/agent_selector/
├── agent_classifier.pkl       # RandomForest model
├── performance_predictor.pkl  # XGBoost performance model
├── duration_predictor.pkl     # XGBoost duration model
├── label_encoder.pkl          # Agent ID encoder
└── metadata.pkl               # Model metadata
    ├── version
    ├── training_date
    ├── feature_names
    ├── n_features
    ├── agent_registry
    └── training_metrics
```

### Metadata Structure

```python
{
    "version": "v1.0.0",
    "training_date": "2025-10-15T10:30:00",
    "feature_names": [...],  # 23 features
    "n_features": 23,
    "agent_registry": {
        "content-writer-specialist": {
            "type": "content-creation",
            "domain": "content",
            "capabilities": ["multi-language", "seo"]
        },
        # ... more agents ...
    },
    "training_metrics": {
        "agent_classifier": {
            "val_accuracy": 0.87,
            "test_accuracy": 0.85
        },
        "performance_predictor": {
            "val_mae": 0.08,
            "val_r2": 0.82
        },
        "duration_predictor": {
            "val_mape_percent": 15.3
        }
    }
}
```

## Performance Characteristics

### Inference Speed

- **Single Prediction**: 10-20ms
- **Top-3 Predictions**: 15-25ms
- **Batch (10 tasks)**: 50-80ms

### Memory Footprint

- **Model Size**: ~50MB total
  - RandomForest: ~30MB
  - XGBoost models: ~10MB each
- **Runtime Memory**: ~150MB
- **Feature Engineering**: <1MB

### Scalability

- **Throughput**: 500+ requests/second
- **Horizontal Scaling**: Stateless, scales linearly
- **Model Loading**: Once at startup, cached in memory

## Future Enhancements

### Phase 2: Advanced Features

1. **Deep Learning Component**
   - Neural network for complex pattern recognition
   - Embedding layer for agent similarity

2. **Reinforcement Learning**
   - Learn from actual agent performance
   - Adaptive agent selection based on feedback

3. **Multi-Task Learning**
   - Joint training for related prediction tasks
   - Shared representations across models

4. **Attention Mechanism**
   - Identify most important features per prediction
   - Improve interpretability

### Phase 3: Production Optimizations

1. **Model Compression**
   - Quantization for faster inference
   - Knowledge distillation

2. **A/B Testing Framework**
   - Compare model versions
   - Gradual rollout

3. **Online Learning**
   - Continuous model updates
   - Real-time performance adaptation

## Model Maintenance

### Retraining Schedule

- **Weekly**: Incremental updates with new data
- **Monthly**: Full retraining from scratch
- **Quarterly**: Hyperparameter tuning and architecture review

### Monitoring Thresholds

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| Accuracy | <75% | Review recent data quality |
| Confidence | <60% average | Retrain with more data |
| Latency | >100ms p95 | Optimize inference pipeline |
| Error Rate | >5% | Investigate failed predictions |

