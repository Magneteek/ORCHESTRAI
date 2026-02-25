"""
Embedding API Endpoints

POST /embed   — encode one or more texts into dense vectors
GET  /embed/health — confirm model is loaded and ready
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from app.services import embedding_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embed", tags=["embeddings"])


# ── Request / Response schemas ────────────────────────────────────────────────

class EmbedRequest(BaseModel):
    texts: List[str]
    model: Optional[str] = "all-MiniLM-L6-v2"

    @field_validator("texts")
    @classmethod
    def texts_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("texts must contain at least one string.")
        stripped = [t.strip() for t in v if t and t.strip()]
        if not stripped:
            raise ValueError("texts must contain at least one non-empty string.")
        return stripped


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    dimensions: int
    count: int


class EmbedHealthResponse(BaseModel):
    status: str
    model_name: str
    dimensions: int
    loaded: bool


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", response_model=EmbedResponse)
async def create_embeddings(request: EmbedRequest):
    """
    Encode one or more texts into dense float vectors.

    **Example request:**
    ```json
    {
      "texts": ["dental SEO keyword research for local clinics"],
      "model": "all-MiniLM-L6-v2"
    }
    ```

    **Returns:**
    - `embeddings`: list of float vectors, one per input text
    - `dimensions`: 384 for all-MiniLM-L6-v2
    - `count`: number of embeddings returned
    """
    if not embedding_service.is_loaded():
        raise HTTPException(
            status_code=503,
            detail=(
                "Embedding model not loaded. "
                "Ensure the service started correctly and sentence-transformers is installed."
            ),
        )

    try:
        vectors = embedding_service.embed(request.texts)
        info = embedding_service.get_model_info()

        logger.debug(
            f"Embedded {len(request.texts)} text(s) "
            f"→ {info['dimensions']} dimensions each"
        )

        return EmbedResponse(
            embeddings=vectors,
            model=info["model_name"],
            dimensions=info["dimensions"],
            count=len(vectors),
        )

    except Exception as e:
        logger.error(f"Embedding failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")


@router.get("/health", response_model=EmbedHealthResponse)
async def embedding_health():
    """
    Check that the embedding model is loaded and ready.

    Returns HTTP 503 if the model has not been initialized.
    """
    info = embedding_service.get_model_info()

    if not info["loaded"]:
        raise HTTPException(
            status_code=503,
            detail="Embedding model not loaded.",
        )

    return EmbedHealthResponse(
        status="ready",
        model_name=info["model_name"],
        dimensions=info["dimensions"],
        loaded=True,
    )
