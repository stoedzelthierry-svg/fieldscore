"""EcoCert FieldScore — Main FastAPI Application.

Environmental impact calculator for farms using Agribalyse 3.2 + RPG data.
Provides CRUD for farms/parcelles, calculation engine, and exports.

Usage:
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.api.v1.router import api_v1_router
from app.core.calculator import get_calculator
from app.core.agribalyse import get_agribalyse_provider
from app.core.iae_modulator import get_iae_modulator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown events.

    On startup:
        - Load Agribalyse data into memory
        - Initialize IAE modulator coefficients
        - Warm up the calculator

    On shutdown:
        - Close HTTP clients (Ecobalyse, RPG)
    """
    logger.info("Starting EcoCert FieldScore API v%s ...", settings.APP_VERSION)

    # Pre-load data providers
    try:
        agribalyse = await get_agribalyse_provider()
        logger.info("Agribalyse provider ready: %d products", len(agribalyse.get_all_codes()))
    except Exception as exc:
        logger.error("Failed to load Agribalyse: %s", exc)

    try:
        iae = await get_iae_modulator()
        logger.info("IAE modulator ready: %d types", len(iae.coefficients))
    except Exception as exc:
        logger.error("Failed to load IAE modulator: %s", exc)

    try:
        await get_calculator()
        logger.info("Calculator initialized and ready")
    except Exception as exc:
        logger.error("Failed to initialize calculator: %s", exc)

    logger.info("FieldScore API is ready on %s:%s", settings.HOST, settings.PORT)

    yield  # Application runs here

    # Shutdown
    logger.info("Shutting down FieldScore API...")
    try:
        from app.core.ecobalyse_client import get_ecobalyse_client
        ecobalyse = await get_ecobalyse_client()
        await ecobalyse.close()
    except Exception:
        pass

    try:
        from app.services.rpg_service import get_rpg_service
        rpg = await get_rpg_service()
        await rpg.close()
    except Exception:
        pass

    logger.info("FieldScore API shutdown complete")


# Create the FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## EcoCert FieldScore — Calculateur de coût environnemental

API de calcul du score environnemental des exploitations agricoles.

### Fonctionnalités
- **Gestion des fermes** : CRUD complet (création, lecture, mise à jour, suppression)
- **Gestion des parcelles** : Association de cultures avec surfaces et rendements
- **Calcul d'impact** : Moteur de calcul PEF basé sur Agribalyse 3.2
- **Modulation IAE** : Ajustement du score via infrastructures écologiques
- **Référentiels** : Mapping cultures PAC↔Agribalyse, indicateurs PEF
- **Export** : Résultats en JSON, CSV (PDF en v2)

### Sources de données
- **Agribalyse 3.2** (ADEME/INRAE) — 16 indicateurs PEF par kg de produit
- **RPG** — Registre Parcellaire Graphique (données PAC)
- **Ecobalyse beta** — API externe (fallback Agribalyse)

### Méthode de calcul
1. Pour chaque parcelle : surface × rendement × impact_Agribalyse(code_culture)
2. Agrégation des 16 indicateurs PEF
3. Normalisation selon les poids EF 3.1
4. Application de la modulation IAE (si infrastructures renseignées)
5. Calcul du score unique PEF (mPt) et catégorisation A-E
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Vérifie que l'API est opérationnelle.",
)
async def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get(
    "/",
    tags=["Root"],
    summary="API root",
    description="Redirige vers la documentation.",
)
async def root() -> dict:
    """Root endpoint with API info and links."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_v1": "/api/v1",
    }


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler to return structured error responses."""
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erreur interne du serveur",
            "type": type(exc).__name__,
            "message": str(exc) if settings.DEBUG else None,
        },
    )


# Include API v1 router
app.include_router(api_v1_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
