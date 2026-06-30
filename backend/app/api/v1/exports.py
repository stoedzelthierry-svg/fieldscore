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
    "/exports/json",
    summary="Export farm data as JSON",
    description="Retourne un JSON complet de la ferme : infos, parcelles, IAE, derniers calculs.",
)
async def export_json(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Export complete farm data as JSON."""
    farm_result = await db.execute(select(Ferme).where(Ferme.id == str(ferme_id)))
    ferme = farm_result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(status_code=404, detail="Ferme introuvable")

    parc_result = await db.execute(
        select(Parcelle).where(Parcelle.ferme_id == str(ferme_id))
    )
    parcelles = parc_result.scalars().all()

    iae_result = await db.execute(
        select(InfrastructureEcologique).where(
            InfrastructureEcologique.ferme_id == str(ferme_id)
        )
    )
    iaes = iae_result.scalars().all()

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
    "/exports/csv",
    summary="Export calculation as CSV",
    description="Télécharge le dernier calcul au format CSV.",
)
async def export_csv(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Export latest calculation result as CSV."""
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

    writer.writerow(["Indicateur", "Nom", "Valeur", "Unité", "Poids", "Contribution mPt"])

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


def _build_calcul_pdf_data(ferme: Ferme, calcul: ResultatCalcul) -> dict:
    """Build structured data for PDF export from stored calculation."""
    impacts = []
    impacts_json = calcul.impacts_json or {}
    for code, data in impacts_json.items():
        impacts.append({
            "indicateur": code,
            "nom": data.get("nom", code),
            "valeur": data.get("valeur", 0),
            "unite": data.get("unite", ""),
            "poids": data.get("poids", 0),
            "contribution_score": data.get("contribution_score", 0),
        })

    cultures = []
    details = calcul.details_json or {}
    for cc in details.get("contributions_cultures", []):
        cultures.append({
            "code_culture": cc.get("code_culture", ""),
            "culture_nom": cc.get("culture_nom", cc.get("code_culture", "")),
            "surface_ha": cc.get("surface_ha", 0),
            "rendement_kg_ha": cc.get("rendement_kg_ha"),
            "contribution_score": cc.get("contribution_score", 0),
        })

    modulation_iae = details.get("modulation_iae")
    meta = calcul.metadonnees_json or {}

    return {
        "type": "pdf_report",
        "generated_at": datetime.utcnow().isoformat(),
        "ferme": {
            "id": str(ferme.id),
            "nom": ferme.nom,
            "code_insee": ferme.code_insee,
            "type_production": ferme.type_production,
            "surface_totale_ha": ferme.surface_totale_ha,
        },
        "calcul": {
            "id": str(calcul.id),
            "timestamp": calcul.timestamp.isoformat() if calcul.timestamp else None,
            "score_unique": calcul.score_unique,
            "categorie": calcul.categorie,
            "methode_version": calcul.methode_version,
            "source_donnees": calcul.source_donnees,
            "niveau_confiance": calcul.niveau_confiance,
            "impacts": impacts,
            "contributions_cultures": cultures,
            "modulation_iae": modulation_iae,
            "surface_totale_ha": meta.get("surface_totale_ha", 0),
            "nb_parcelles": meta.get("nb_parcelles", 0),
        },
    }


@router.get(
    "/exports/pdf",
    summary="Export latest calculation as PDF data",
    description="Retourne les données structurées du dernier calcul pour génération PDF.",
)
async def export_pdf(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Export latest calculation data for PDF generation."""
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
    if calcul is None:
        raise HTTPException(status_code=404, detail="Aucun calcul trouvé pour cette ferme")

    return _build_calcul_pdf_data(ferme, calcul)
