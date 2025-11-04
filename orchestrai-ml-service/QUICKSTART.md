# ORCHESTRAI ML Service - Quick Start Guide

## Prerequisites

- Python 3.11+
- Docker and Docker Compose
- 4GB RAM minimum
- Access to ORCHESTRAI Node.js system (for integration)

## Local Development Setup

### Step 1: Environment Setup

```bash
# Navigate to project directory
cd orchestrai-ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Key settings:
# - REDIS_URL
# - POSTGRES_URL
# - MODEL_STORAGE_PATH
```

### Step 3: Start Supporting Services

```bash
# Start Redis and PostgreSQL using Docker Compose
docker-compose up -d redis postgres

# Verify services are running
docker-compose ps
```

### Step 4: Run Development Server

```bash
# Start FastAPI development server with hot reload
python -m app.main

# Or using uvicorn directly:
uvicorn app.main:app --reload --port 8000

# Service will be available at:
# - API: http://localhost:8000
# - Docs: http://localhost:8000/docs
# - Health: http://localhost:8000/health
```

## Training Your First Model

### Step 1: Prepare Training Data

Create a training dataset CSV with these columns:
- `task_type`: Type of task
- `domain`: Task domain
- `complexity`: low, medium, high, very-high
- `priority`: low, medium, high
- `required_capabilities`: JSON list of capabilities
- `agent_id`: The agent that performed the task (target)
- `actual_performance`: Performance score 0-1 (target)
- `actual_duration_ms`: Duration in milliseconds (target)

Example CSV:
```csv
task_type,domain,complexity,priority,required_capabilities,agent_id,actual_performance,actual_duration_ms
content-creation,content,high,high,"[""multi-language"", ""seo""]",content-writer-specialist,0.92,45000
seo-analysis,seo,medium,medium,"[""keyword-research""]",seo-keyword-research,0.88,30000
```

### Step 2: Train Model

```bash
# Activate virtual environment
source venv/bin/activate

# Run training script
python training/train_agent_selector.py \
    --data ./data/training_data.csv \
    --output ./models/agent_selector

# Training will output:
# - Validation accuracy
# - Cross-validation scores
# - Test set performance
# - Saved models in ./models/agent_selector/
```

### Step 3: Verify Model

```bash
# Start the service
python -m app.main

# Test prediction endpoint
curl -X POST http://localhost:8000/api/v1/agent-selection/predict \
  -H "Content-Type: application/json" \
  -d '{
    "type": "content-creation",
    "domain": "content",
    "complexity": "high",
    "required_capabilities": ["multi-language", "seo-optimization"],
    "priority": "high"
  }'
```

## Docker Deployment

### Full Stack Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f ml-service

# Check health
curl http://localhost:8000/health

# Access services:
# - ML Service API: http://localhost:8000
# - API Documentation: http://localhost:8000/docs
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
```

### Production Build

```bash
# Build production image
docker build -t orchestrai-ml-service:v1.0.0 -f deployment/Dockerfile .

# Run production container
docker run -d \
  --name ml-service \
  -p 8000:8000 \
  -e REDIS_URL=redis://redis:6379 \
  -e LOG_LEVEL=INFO \
  -v $(pwd)/models:/models \
  orchestrai-ml-service:v1.0.0
```

## Integration with ORCHESTRAI Node.js

### Node.js Client Setup

```javascript
// In your ORCHESTRAI Node.js project
const MLServiceClient = require('./orchestrai-shared/ml-integration/ml-service-client');

// Initialize client
const mlService = new MLServiceClient({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
  enableFallback: true
});

// Use in agent selection
const prediction = await mlService.predictBestAgent({
  type: 'content-creation',
  domain: 'content',
  complexity: 'high',
  required_capabilities: ['multi-language', 'seo-optimization'],
  priority: 'high'
});

console.log('Selected agent:', prediction.predictions[0].agent_id);
console.log('Confidence:', prediction.predictions[0].confidence);
```

## Testing

### Run Unit Tests

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run all tests with coverage
pytest

# Run specific test file
pytest tests/test_models/test_agent_selector.py

# View coverage report
open htmlcov/index.html
```

### API Testing

```bash
# Install httpie for easy API testing
pip install httpie

# Test health endpoint
http GET http://localhost:8000/health

# Test prediction endpoint
http POST http://localhost:8000/api/v1/agent-selection/predict \
  type=content-creation \
  domain=content \
  complexity=high \
  priority=high

# Get model statistics
http GET http://localhost:8000/api/v1/agent-selection/model/stats
```

## Monitoring

### Prometheus Metrics

Access Prometheus at http://localhost:9090

Key metrics:
- `ml_service_requests_total` - Total requests
- `ml_service_request_latency_seconds` - Request latency
- `ml_model_inference_seconds` - Model inference time
- `ml_model_predictions_total` - Total predictions
- `ml_model_confidence_score` - Prediction confidence distribution

### Grafana Dashboards

1. Access Grafana at http://localhost:3001
2. Login with admin/admin
3. Add Prometheus data source: http://prometheus:9090
4. Import pre-built dashboard (coming soon)

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs ml-service

# Verify dependencies
docker-compose ps

# Rebuild services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Model Not Loading

```bash
# Verify model files exist
ls -la models/agent_selector/

# Required files:
# - agent_classifier.pkl
# - performance_predictor.pkl
# - duration_predictor.pkl
# - label_encoder.pkl
# - metadata.pkl

# Check file permissions
chmod -R 755 models/
```

### Low Prediction Accuracy

1. Check training data quality
2. Verify feature engineering
3. Increase training data size
4. Tune hyperparameters
5. Try different algorithms

## Next Steps

1. **Collect Training Data**: Extract historical task data from ORCHESTRAI
2. **Train Initial Model**: Run training script with collected data
3. **Deploy Service**: Start ML service with Docker Compose
4. **Integrate**: Connect Node.js orchestrator to ML service
5. **Monitor**: Track performance metrics and model accuracy
6. **Iterate**: Retrain models as more data becomes available

## Support

- Documentation: See README.md
- Issues: Create GitHub issue
- Training Help: See training/README.md (coming soon)
- API Reference: http://localhost:8000/docs
