"""API v1 referentiels endpoints — cultures, IAE, indicators, versions."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.agribalyse import (
    get_indicator_name, get_indicator_unit,
)
from app.core.normalizer import get_weight, POIDS_PEF, get_all_indicators
from app.core.iae_modulator import get_iae_modulator
from app.core.calculator import get_calculator
from app.schemas.referentiel import (
    IAETypeInfo, VersionInfo, IndicateurPEF, CultureReferentiel,
)

router = APIRouter(prefix="/referentiels", tags=["Référentiels"])


@router.get(
    "/cultures",
    response_model=list[CultureReferentiel],
    summary="Available culture mapping",
    description="Retourne la liste de toutes les cultures PAC mappées vers Agribalyse.",
)
async def list_cultures() -> list[CultureReferentiel]:
    """List all PAC to Agribalyse culture mappings."""
    calculator = await get_calculator()
    mappings = calculator._mapping

    result = []
    for code_pac, info in mappings.items():
        result.append(CultureReferentiel(
            code_culture_pac=code_pac,
            nom_culture=info.get("nom_culture", code_pac),
            code_agb=info.get("code_agb", ""),
            nom_produit_agb=info.get("nom_produit_agb", ""),
            rendement_moyen_conv_kg_ha=info.get("rendement_moyen_conv_kg_ha", 0),
            rendement_moyen_bio_kg_ha=info.get("rendement_moyen_bio_kg_ha", 0),
            version="1.0",
        ))

    return result


@router.get(
    "/iae",
    response_model=list[IAETypeInfo],
    summary="IAE types and coefficients",
    description="Retourne les types d'infrastructures écologiques et leurs coefficients de modulation.",
)
async def list_iae_types() -> list[IAETypeInfo]:
    """List all IAE types with their modulation coefficients."""
    modulator = await get_iae_modulator()
    iae_types = modulator.get_iae_types()
    return [IAETypeInfo(**t) for t in iae_types]


@router.get(
    "/indicateurs",
    response_model=list[IndicateurPEF],
    summary="PEF indicators",
    description="Retourne la liste des 16 indicateurs PEF avec leurs poids.",
)
async def list_indicators() -> list[IndicateurPEF]:
    """List all 16 PEF indicators with weights."""
    result = []
    for code in get_all_indicators():
        result.append(IndicateurPEF(
            code=code,
            nom=get_indicator_name(code),
            unite=get_indicator_unit(code),
            poids=get_weight(code),
            description=f"Indicateur PEF {get_indicator_name(code)}",
        ))
    return result


@router.get(
    "/versions",
    response_model=list[VersionInfo],
    summary="Method versions",
    description="Retourne les versions disponibles de la méthode de calcul.",
)
async def list_versions() -> list[VersionInfo]:
    """List available method versions."""
    return [
        VersionInfo(
            version="1.0",
            date_publication="2026-06-01",
            description="Version initiale — Agribalyse 3.2 + PEF EF 3.1",
            changelog=[
                "Intégration Agribalyse 3.2 (synthèse)",
                "Normalisation PEF EF 3.1",
                "Modulation IAE (7 types)",
                "Catégorisation A-E par type de production",
                "Fallback Agribalyse local + API Ecobalyse beta",
            ],
            active=True,
        ),
    ]
