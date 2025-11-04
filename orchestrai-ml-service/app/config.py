"""
Application configuration management.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "orchestrai-ml-service"
    APP_VERSION: str = "1.0.0"
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"

    # API Configuration
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:5501", "http://localhost:3000"]

    # Database
    REDIS_URL: str = "redis://localhost:6379"
    POSTGRES_URL: str = "postgresql://postgres:password@localhost:5432/orchestrai_ml"

    # Model Configuration
    MODEL_STORAGE_PATH: str = "/models"
    MODEL_CACHE_ENABLED: bool = True
    MODEL_CACHE_TTL: int = 3600  # 1 hour

    # ML Settings
    AGENT_SELECTION_MODEL_VERSION: str = "latest"
    QUALITY_PREDICTION_MODEL_VERSION: str = "latest"
    PIPELINE_OPTIMIZATION_MODEL_VERSION: str = "latest"

    # Performance
    MAX_WORKERS: int = 4
    REQUEST_TIMEOUT: int = 30
    MAX_BATCH_SIZE: int = 32

    # Monitoring
    PROMETHEUS_ENABLED: bool = True
    METRICS_PORT: int = 8000

    # Integration
    ORCHESTRAI_NODE_URL: str = "http://localhost:5501"
    ORCHESTRAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
