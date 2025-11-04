"""
Agent Selection API Endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import time
import logging

from app.schemas.agent_selection import (
    TaskContext,
    AgentPrediction,
    AgentSelectionResponse
)
from app.services.feature_engineering import FeatureEngineer
from app.models.agent_selector import AgentSelectorModel
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Global instances (will be initialized on startup)
feature_engineer = FeatureEngineer()
agent_model: AgentSelectorModel = None


def get_agent_model() -> AgentSelectorModel:
    """Dependency to get loaded agent model."""
    global agent_model

    if agent_model is None:
        # Load model (in production, this would be done at startup)
        model_path = f"{settings.MODEL_STORAGE_PATH}/agent_selector"
        agent_model = AgentSelectorModel(
            model_path=model_path,
            version=settings.AGENT_SELECTION_MODEL_VERSION
        )

        try:
            agent_model.load()
        except Exception as e:
            logger.error(f"Failed to load agent model: {e}")
            raise HTTPException(
                status_code=503,
                detail="Agent selection model not available"
            )

    return agent_model


@router.post("/predict", response_model=AgentSelectionResponse)
async def predict_best_agent(
    context: TaskContext,
    top_k: int = 3,
    model: AgentSelectorModel = Depends(get_agent_model)
):
    """
    Predict the best agent(s) for a given task using ML model.

    Returns top-k agent predictions ranked by expected performance.

    **Example Request:**
    ```json
    {
      "type": "content-creation",
      "domain": "content",
      "complexity": "high",
      "required_capabilities": ["multi-language", "seo-optimization"],
      "priority": "high",
      "client_name": "QuartzIQ",
      "estimated_word_count": 2000
    }
    ```

    **Returns:**
    - List of top-k agent predictions
    - Confidence scores and performance estimates
    - Human-readable reasoning
    - Model version and inference time
    """
    start_time = time.time()

    try:
        logger.info(f"Received prediction request: type={context.type}, domain={context.domain}")

        # Extract features
        features = feature_engineer.extract_features(context.dict())

        # Make prediction
        if top_k > 1:
            predictions_data = model.predict_top_k(features, k=top_k)
        else:
            predictions_data = [model.predict(features)]

        # Convert to response schema
        predictions = [
            AgentPrediction(**pred) for pred in predictions_data
        ]

        inference_time = (time.time() - start_time) * 1000

        logger.info(
            f"Prediction complete: agent={predictions[0].agent_id}, "
            f"confidence={predictions[0].confidence:.2%}, "
            f"time={inference_time:.1f}ms"
        )

        return AgentSelectionResponse(
            predictions=predictions,
            model_version=model.version,
            inference_time_ms=inference_time,
            fallback_used=False
        )

    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Agent selection prediction failed: {str(e)}"
        )


@router.get("/model/stats")
async def get_model_stats(
    model: AgentSelectorModel = Depends(get_agent_model)
):
    """
    Get model statistics and metadata.

    Returns information about the loaded model including:
    - Version and training date
    - Number of features and agents
    - Training metrics
    - Available agents
    """
    try:
        stats = model.get_model_stats()
        return stats

    except Exception as e:
        logger.error(f"Failed to get model stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve model statistics: {str(e)}"
        )


@router.get("/feature/names")
async def get_feature_names():
    """Get list of all feature names used by the model."""
    return {
        "features": feature_engineer.get_feature_names(),
        "count": feature_engineer.n_features
    }
