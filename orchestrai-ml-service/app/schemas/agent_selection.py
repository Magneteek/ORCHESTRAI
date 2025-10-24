"""
Pydantic schemas for agent selection API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class TaskContext(BaseModel):
    """Task context for agent selection."""

    type: str = Field(..., description="Task type (e.g., 'content-creation', 'seo-analysis')")
    domain: str = Field(..., description="Domain (e.g., 'content', 'seo', 'research')")
    complexity: str = Field(
        default="medium",
        description="Task complexity: low, medium, high, very-high"
    )
    required_capabilities: List[str] = Field(
        default_factory=list,
        description="List of required capabilities"
    )
    priority: str = Field(
        default="medium",
        description="Task priority: low, medium, high"
    )
    client_name: Optional[str] = Field(None, description="Client name for context")
    project_uuid: Optional[str] = Field(None, description="Project UUID for context")
    historical_context: Optional[Dict] = Field(
        None,
        description="Historical performance data for this type of task"
    )
    estimated_word_count: Optional[int] = Field(
        None,
        description="Estimated word count for content tasks"
    )
    target_languages: List[str] = Field(
        default_factory=lambda: ["en"],
        description="Target languages for multi-language tasks"
    )
    quality_threshold: float = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
        description="Required quality threshold (0-1)"
    )
    psychographic_targeting: bool = Field(
        default=False,
        description="Whether psychographic targeting is required"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "type": "content-creation",
                "domain": "content",
                "complexity": "high",
                "required_capabilities": ["multi-language", "seo-optimization", "psychographic-targeting"],
                "priority": "high",
                "client_name": "QuartzIQ",
                "project_uuid": "ea511e99-bb89-4cd0-9c88-ae5584d2e010",
                "estimated_word_count": 2000,
                "target_languages": ["nl", "en"],
                "quality_threshold": 0.95,
                "psychographic_targeting": True
            }
        }


class AgentPrediction(BaseModel):
    """Individual agent prediction."""

    agent_id: str = Field(..., description="Agent identifier")
    agent_type: str = Field(..., description="Agent type")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Prediction confidence score (0-1)"
    )
    predicted_performance: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Expected performance score (0-1)"
    )
    estimated_duration_ms: int = Field(
        ...,
        gt=0,
        description="Estimated task duration in milliseconds"
    )
    reasoning: List[str] = Field(
        ...,
        description="Human-readable explanation for this selection"
    )
    capabilities: List[str] = Field(
        default_factory=list,
        description="Agent capabilities"
    )
    domain: str = Field(
        default="general",
        description="Agent's primary domain"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "agent_id": "content-writer-specialist",
                "agent_type": "content-creation",
                "confidence": 0.92,
                "predicted_performance": 0.88,
                "estimated_duration_ms": 45000,
                "reasoning": [
                    "High confidence selection (92%)",
                    "Expected high performance (88%)",
                    "Specialized in content domain",
                    "Key factors: task_type=content-creation, complexity=high"
                ],
                "capabilities": ["multi-language", "seo-optimization", "psychographic-targeting"],
                "domain": "content"
            }
        }


class AgentSelectionResponse(BaseModel):
    """Response with agent predictions."""

    predictions: List[AgentPrediction] = Field(
        ...,
        description="List of agent predictions ranked by confidence"
    )
    model_version: str = Field(..., description="Model version used for prediction")
    inference_time_ms: float = Field(
        ...,
        description="Model inference time in milliseconds"
    )
    fallback_used: bool = Field(
        default=False,
        description="Whether fallback selection was used"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {
                        "agent_id": "content-writer-specialist",
                        "agent_type": "content-creation",
                        "confidence": 0.92,
                        "predicted_performance": 0.88,
                        "estimated_duration_ms": 45000,
                        "reasoning": [
                            "High confidence selection (92%)",
                            "Expected high performance (88%)"
                        ],
                        "capabilities": ["multi-language", "seo-optimization"],
                        "domain": "content"
                    }
                ],
                "model_version": "v1.0.0",
                "inference_time_ms": 12.5,
                "fallback_used": False
            }
        }
