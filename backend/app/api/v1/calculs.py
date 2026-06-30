"""API v1 calculs endpoints — environmental score calculations."""

import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.ferme import Ferme
from app.models.parcelle import Parcelle
from app.models.infrastructure import InfrastructureEcologique
from app.models.calcul import ResultatCalcul
from app.schemas.calcul import (
    CalculRequest, CalculPreviewOutput, CalculOutput, CalculList,
)
from app.core.calculator import get_calculator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fermes/{ferme_id}", tags=["Calculs"])


@router.post(
    "/calcul",
    response_model=CalculOutput,
    status_code=status.HTTP_201_CREATED,
    summary="Launch full calculation",
    description=(
        "Lance un calcul de score environnemental complet pour une ferme. "
        "Si des parcelles sont fournies dans le body, elles sont utilisées "
        "pour un calcul preview. Sinon, les parcelles enregistrées de la ferme "
        "sont utilisées. Le résultat est persisté dans l'historique."
    ),
)
async def launch_calculation(
    ferme_id: uuid.UUID,
    body: CalculRequest = CalculRequest(),
    db: AsyncSession = Depends(get_db),
) -> CalculOutput:
    """Run a full environmental score calculation for a farm and persist result."""
    # Verify farm exists
    farm_result = await db.execute(select(Ferme).where(Ferme.id == ferme_id))
    ferme = farm_result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(status_code=404, detail=f"Ferme {ferme_id} introuvable")

    # Get parcelles
    if body.parcelles:
        # Use inline parcelles for preview
        parcelles_data = [
            {
                "code_culture": p.code_culture,
                "surface_ha": p.surface_ha,
                "est_bio": p.est_bio,
                "rendement_reel_kg_ha": p.rendement_reel_kg_ha,
                "culture_nom": p.culture_nom,
            }
            for p in body.parcelles
        ]
    else:
        # Use stored parcelles
        parcelles_result = await db.execute(
            select(Parcelle).where(Parcelle.ferme_id == ferme_id)
        )
        parcelles_db = parcelles_result.scalars().all()
        if not parcelles_db:
            raise HTTPException(
                status_code=400,
                detail="Aucune parcelle trouvée pour cette ferme. "
                       "Ajoutez des parcelles ou fournissez-les dans le body.",
            )
        parcelles_data = [
            {
                "code_culture": p.code_culture,
                "surface_ha": p.surface_ha,
                "est_bio": p.est_bio,
                "rendement_reel_kg_ha": p.rendement_reel_kg_ha,
                "culture_nom": p.culture_nom,
            }
            for p in parcelles_db
        ]

    # Get IAE entries if modulation requested
    iae_entries = None
    if body.inclure_iae:
        iae_result = await db.execute(
            select(InfrastructureEcologique).where(
                InfrastructureEcologique.ferme_id == ferme_id
            )
        )
        iae_db = iae_result.scalars().all()
        if iae_db:
            iae_entries = [
                {
                    "type_iae": iae.type_iae,
                    "metrique": iae.metrique,
                    "valeur": iae.valeur,
                }
                for iae in iae_db
            ]

    # Run calculation
    calculator = await get_calculator()
    result = await calculator.calculate(
        parcelles=parcelles_data,
        iae_entries=iae_entries,
        type_production=ferme.type_production,
        forcer_ecobalyse=body.forcer_ecobalyse,
        inclure_iae=body.inclure_iae,
    )

    # Build details and metadata
    details = {
        "contributions_cultures": result.get("contributions_cultures", []),
        "modulation_iae": result.get("modulation_iae"),
    }
    metadonnees = {
        "surface_totale_ha": result["surface_totale_ha"],
        "nb_parcelles": result["nb_parcelles"],
        "source_donnees": result["source_donnees"],
        "avertissements": result.get("avertissements", []),
        "categorie_info": result.get("categorie_info"),
    }

    # Build impacts dict
    impacts = {}
    for imp in result.get("impacts_detailles", []):
        impacts[imp["indicateur"]] = {
            "nom": imp["nom"],
            "valeur": imp["valeur"],
            "unite": imp["unite"],
            "poids": imp["poids"],
            "contribution_score": imp["contribution_score"],
        }

    # Persist result
    calcul = ResultatCalcul(
        ferme_id=ferme_id,
        methode_version=result["methode_version"],
        score_unique=result["score_unique"],
        categorie=result["categorie"],
        impacts_json=impacts,
        details_json=details,
        metadonnees_json=metadonnees,
        niveau_confiance=result["niveau_confiance"],
        source_donnees=result["source_donnees"],
        statut="complete" if not result.get("avertissements") else "partial",
    )
    db.add(calcul)
    await db.flush()
    await db.refresh(calcul)

    return CalculOutput.model_validate(calcul)


@router.get(
    "/calculs",
    response_model=CalculList,
    summary="Calculation history",
    description="Retourne l'historique paginé des calculs d'une ferme.",
)
async def list_calculations(
    ferme_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> CalculList:
    """List calculation history for a farm."""
    # Verify farm exists
    farm_result = await db.execute(select(Ferme).where(Ferme.id == ferme_id))
    if farm_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=f"Ferme {ferme_id} introuvable")

    query = select(ResultatCalcul).where(
        ResultatCalcul.ferme_id == ferme_id
    )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(ResultatCalcul.timestamp.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    calculs = result.scalars().all()

    return CalculList(
        items=[CalculOutput.model_validate(c) for c in calculs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/calculs/{calcul_id}",
    response_model=CalculOutput,
    summary="Get calculation detail",
    description="Retourne le détail complet d'un calcul.",
)
async def get_calculation(
    ferme_id: uuid.UUID,
    calcul_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> CalculOutput:
    """Get a specific calculation result."""
    result = await db.execute(
        select(ResultatCalcul).where(
            ResultatCalcul.id == calcul_id,
            ResultatCalcul.ferme_id == ferme_id,
        )
    )
    calcul = result.scalar_one_or_none()
    if calcul is None:
        raise HTTPException(status_code=404, detail="Calcul introuvable")
    return CalculOutput.model_validate(calcul)


@router.post(
    "/calculs/preview",
    response_model=CalculPreviewOutput,
    summary="Preview calculation",
    description=(
        "Lance un calcul rapide sans sauvegarde en base. "
        "Les parcelles doivent être fournies dans le body. "
        "Utile pour tester des scénarios avant de les enregistrer."
    ),
)
async def preview_calculation(
    ferme_id: uuid.UUID,
    body: CalculRequest,
    db: AsyncSession = Depends(get_db),
) -> CalculPreviewOutput:
    """Run a preview calculation without persisting."""
    # Verify farm exists
    farm_result = await db.execute(select(Ferme).where(Ferme.id == ferme_id))
    ferme = farm_result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(status_code=404, detail=f"Ferme {ferme_id} introuvable")

    if not body.parcelles:
        raise HTTPException(
            status_code=400,
            detail="Des parcelles sont requises pour un calcul preview.",
        )

    parcelles_data = [
        {
            "code_culture": p.code_culture,
            "surface_ha": p.surface_ha,
            "est_bio": p.est_bio,
            "rendement_reel_kg_ha": p.rendement_reel_kg_ha,
            "culture_nom": p.culture_nom,
        }
        for p in body.parcelles
    ]

    # Get IAE entries
    iae_entries = None
    if body.inclure_iae:
        iae_result = await db.execute(
            select(InfrastructureEcologique).where(
                InfrastructureEcologique.ferme_id == ferme_id
            )
        )
        iae_db = iae_result.scalars().all()
        if iae_db:
            iae_entries = [
                {
                    "type_iae": iae.type_iae,
                    "metrique": iae.metrique,
                    "valeur": iae.valeur,
                }
                for iae in iae_db
            ]

    calculator = await get_calculator()
    result = await calculator.preview(
        parcelles=parcelles_data,
        iae_entries=iae_entries,
        type_production=ferme.type_production,
    )

    return CalculPreviewOutput(
        score_unique=result["score_unique"],
        categorie=result["categorie"],
        impacts_detailles=result.get("impacts_detailles", []),
        contributions_cultures=result.get("contributions_cultures", []),
        modulation_iae=result.get("modulation_iae"),
        surface_totale_ha=result["surface_totale_ha"],
        nb_parcelles=result["nb_parcelles"],
        source_donnees=result["source_donnees"],
        methode_version=result["methode_version"],
        niveau_confiance=result["niveau_confiance"],
        avertissements=result.get("avertissements", []),
    )
