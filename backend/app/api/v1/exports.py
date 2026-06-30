"""API v1 exports endpoints — JSON, CSV, PDF export of results."""

import csv
import io
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.ferme import Ferme
from app.models.parcelle import Parcelle
from app.models.calcul import ResultatCalcul
from app.models.infrastructure import InfrastructureEcologique

router = APIRouter(prefix="/fermes/{ferme_id}/exports", tags=["Exports"])


@router.get(
    "/json",
    summary="Export farm data as JSON",
    description="Retourne un JSON complet de la ferme : infos, parcelles, IAE, derniers calculs.",
)
async def export_json(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Export complete farm data as JSON."""
    # Farm
    farm_result = await db.execute(select(Ferme).where(Ferme.id == str(ferme_id)))
    ferme = farm_result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(status_code=404, detail="Ferme introuvable")

    # Parcelles
    parc_result = await db.execute(
        select(Parcelle).where(Parcelle.ferme_id == str(ferme_id))
    )
    parcelles = parc_result.scalars().all()

    # IAEs
    iae_result = await db.execute(
        select(InfrastructureEcologique).where(
            InfrastructureEcologique.ferme_id == str(ferme_id)
        )
    )
    iaes = iae_result.scalars().all()

    # Last calculation
    calc_result = await db.execute(
        select(ResultatCalcul)
        .where(ResultatCalcul.ferme_id == str(ferme_id))
        .order_by(ResultatCalcul.created_at.desc())
        .limit(5)
    )
    calculs = calc_result.scalars().all()

    return {
        "export_date": datetime.utcnow().isoformat(),
        "ferme": {
            "id": str(ferme.id),
            "nom": ferme.nom,
            "siret": ferme.siret,
            "type_production": ferme.type_production,
            "surface_totale_ha": ferme.surface_totale_ha,
            "annee_reference": ferme.annee_reference,
        },
        "parcelles": [
            {
                "id": str(p.id),
                "code_culture": p.code_culture,
                "culture_nom": p.culture_nom,
                "surface_ha": p.surface_ha,
                "est_bio": p.est_bio,
                "rendement_reel_kg_ha": p.rendement_reel_kg_ha,
                "annee": p.annee,
            }
            for p in parcelles
        ],
        "infrastructures_ecologiques": [
            {
                "id": str(iae.id),
                "type_iae": iae.type_iae,
                "metrique": iae.metrique,
                "valeur": iae.valeur,
                "source_donnees": iae.source_donnees,
            }
            for iae in iaes
        ],
        "calculs_recents": [
            {
                "id": str(c.id),
                "timestamp": c.timestamp.isoformat() if c.timestamp else None,
                "score_unique": c.score_unique,
                "categorie": c.categorie,
                "methode_version": c.methode_version,
                "source_donnees": c.source_donnees,
            }
            for c in calculs
        ],
    }


@router.get(
    "/csv",
    summary="Export calculation as CSV",
    description="Télécharge le dernier calcul au format CSV.",
)
async def export_csv(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Export latest calculation result as CSV."""
    # Get latest calculation
    calc_result = await db.execute(
        select(ResultatCalcul)
        .where(ResultatCalcul.ferme_id == str(ferme_id))
        .order_by(ResultatCalcul.created_at.desc())
        .limit(1)
    )
    calcul = calc_result.scalar_one_or_none()
    if calcul is None:
        raise HTTPException(status_code=404, detail="Aucun calcul trouvé pour cette ferme")

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["Indicateur", "Nom", "Valeur", "Unité", "Poids", "Contribution mPt"])

    # Impacts
    impacts = calcul.impacts_json or {}
    for indicator, data in impacts.items():
        writer.writerow([
            indicator,
            data.get("nom", ""),
            data.get("valeur", ""),
            data.get("unite", ""),
            data.get("poids", ""),
            data.get("contribution_score", ""),
        ])

    # Summary
    writer.writerow([])
    writer.writerow(["Score unique mPt", calcul.score_unique])
    writer.writerow(["Catégorie", calcul.categorie])
    writer.writerow(["Source données", calcul.source_donnees])
    writer.writerow(["Version méthode", calcul.methode_version])
    writer.writerow(["Niveau confiance", calcul.niveau_confiance])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=fieldscore_{ferme_id}.csv"
        },
    )


@router.get(
    "/pdf",
    summary="Export as PDF (summary)",
    description="Retourne un résumé PDF simple (JSON pour le MVP, PDF natif en v2).",
)
async def export_pdf(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Export summary as simple PDF-compatible data (full PDF in v2)."""
    # For MVP, return structured data that can be rendered to PDF client-side
    # Full reportlab PDF will be added in v2
    farm_result = await db.execute(select(Ferme).where(Ferme.id == str(ferme_id)))
    ferme = farm_result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(status_code=404, detail="Ferme introuvable")

    calc_result = await db.execute(
        select(ResultatCalcul)
        .where(ResultatCalcul.ferme_id == str(ferme_id))
        .order_by(ResultatCalcul.created_at.desc())
        .limit(1)
    )
    calcul = calc_result.scalar_one_or_none()

    return {
        "type": "pdf_summary",
        "generated_at": datetime.utcnow().isoformat(),
        "ferme": {
            "nom": ferme.nom,
            "type_production": ferme.type_production,
            "surface_ha": ferme.surface_totale_ha,
        },
        "dernier_calcul": {
            "score_unique": calcul.score_unique if calcul else None,
            "categorie": calcul.categorie if calcul else None,
            "date": calcul.timestamp.isoformat() if calcul and calcul.timestamp else None,
        },
        "message": "Export PDF complet disponible en v2 (reportlab). "
                   "Utilisez le endpoint /json pour les données structurées complètes.",
    }
