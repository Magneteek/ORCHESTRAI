"""
API v1 routes.
"""

from fastapi import APIRouter
from app.api.v1 import agent_selection

router = APIRouter()

# Include sub-routers
router.include_router(
    agent_selection.router,
    prefix="/agent-selection",
    tags=["agent-selection"]
)
