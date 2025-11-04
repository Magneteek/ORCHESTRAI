# ORCHESTRAI ML Service

Machine Learning microservice for intelligent agent selection, quality prediction, and pipeline optimization.

## Architecture

This Python microservice provides ML-powered decision-making capabilities to the ORCHESTRAI Node.js core:

- **Agent Selection**: Predict optimal agent for task based on historical performance
- **Quality Prediction**: Estimate content quality before generation
- **Pipeline Optimization**: Recommend optimal pipeline configurations
- **Semantic Search**: Find related content using embeddings

## Technology Stack

- **Framework**: FastAPI (async Python web framework)
- **ML Libraries**: scikit-learn, XGBoost, sentence-transformers
- **Database**: PostgreSQL (metadata), Redis (caching)
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker, Kubernetes

## Quick Start

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Redis and PostgreSQL
docker-compose up -d redis postgres

# Run development server
uvicorn app.main:app --reload --port 8000

# Visit http://localhost:8000/docs for API documentation
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f ml-service

# Health check
curl http://localhost:8000/health
```

## Project Structure

```
orchestrai-ml-service/
├── app/                        # Main application code
│   ├── api/v1/                # API endpoints
│   ├── models/                # ML model implementations
│   ├── services/              # Business logic
│   ├── schemas/               # Pydantic models
│   └── utils/                 # Utilities
├── training/                  # Model training scripts
├── tests/                     # Test suite
├── deployment/                # Docker and K8s configs
└── notebooks/                 # Jupyter notebooks for experiments
```

## API Endpoints

- `POST /api/v1/agent-selection/predict` - Predict best agent for task
- `POST /api/v1/quality/predict` - Predict content quality
- `POST /api/v1/pipeline/optimize` - Optimize pipeline configuration
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Development Timeline

- **Weeks 1-2**: Foundation and data collection
- **Weeks 3-4**: Model development and training
- **Weeks 5-6**: API development and integration
- **Weeks 7-8**: Testing and optimization
- **Weeks 9-10**: Deployment and monitoring

## Environment Variables

```
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://user:pass@localhost:5432/orchestrai_ml
MODEL_STORAGE_PATH=/models
LOG_LEVEL=INFO
```

## License

Proprietary - ORCHESTRAI System
