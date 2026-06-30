"""API v1 router aggregator.

Assembles all v1 sub-routers into a single v1 router mounted at /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.fermes import router as fermes_router
from app.api.v1.parcelles import router as parcelles_router
from app.api.v1.calculs import router as calculs_router
from app.api.v1.referentiels import router as referentiels_router
from app.api.v1.exports import router as exports_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(fermes_router)
api_v1_router.include_router(parcelles_router)
api_v1_router.include_router(calculs_router)
api_v1_router.include_router(referentiels_router)
api_v1_router.include_router(exports_router)

__all__ = ["api_v1_router"]
