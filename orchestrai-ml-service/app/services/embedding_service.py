"""
Embedding Service

Wraps sentence-transformers to produce dense vector embeddings.
Model is loaded once at startup (singleton pattern) to avoid
the ~2s cold start on every request.
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# Module-level singleton — initialized by load_model()
_model = None
_model_name: str = "all-MiniLM-L6-v2"
_dimensions: int = 384


def load_model(model_name: str = "all-MiniLM-L6-v2") -> None:
    """
    Load the sentence-transformers model into the module singleton.
    Call once during FastAPI startup.
    """
    global _model, _model_name, _dimensions

    if _model is not None:
        logger.info(f"Embedding model '{_model_name}' already loaded — skipping.")
        return

    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {model_name}")
        _model = SentenceTransformer(model_name)
        _model_name = model_name
        # Infer dimension from a test embedding
        _dimensions = len(_model.encode(["test"])[0])
        logger.info(
            f"✅ Embedding model loaded: {model_name} ({_dimensions} dimensions)"
        )
    except ImportError:
        logger.error(
            "sentence-transformers not installed. "
            "Run: pip install sentence-transformers"
        )
        raise
    except Exception as e:
        logger.error(f"Failed to load embedding model '{model_name}': {e}")
        raise


def is_loaded() -> bool:
    """Return True if the model singleton is initialized."""
    return _model is not None


def get_model_info() -> dict:
    """Return metadata about the currently loaded model."""
    return {
        "loaded": is_loaded(),
        "model_name": _model_name,
        "dimensions": _dimensions,
    }


def embed(texts: List[str]) -> List[List[float]]:
    """
    Encode a list of texts into dense vectors.

    Args:
        texts: Non-empty list of strings to embed.

    Returns:
        List of float lists, one per input text.

    Raises:
        RuntimeError: If the model has not been loaded yet.
        ValueError: If texts is empty.
    """
    if _model is None:
        raise RuntimeError(
            "Embedding model not loaded. Call load_model() first."
        )
    if not texts:
        raise ValueError("texts must be a non-empty list of strings.")

    # encode() returns a numpy array; convert to plain Python lists
    vectors = _model.encode(texts, batch_size=32, show_progress_bar=False)
    return [v.tolist() for v in vectors]
