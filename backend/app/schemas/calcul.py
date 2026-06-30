"""Pydantic schemas for Calculation endpoints - Input and Output."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ParcelleInput(BaseModel):
    """Parcelle data submitted for a calculation."""
    id: Optional[uuid.UUID] = None
    code_culture: str = Field(..., min_length=1, max_length=20)
    surface_ha: float = Field(..., gt=0)
    est_bio: bool = False
    rendement_reel_kg_ha: Optional[float] = Field(None, gt=0)
    culture_nom: Optional[str] = None


class IAEInput(BaseModel):
    """Infrastructure agro-écologique submitted for a calculation."""
    type_iae: str = Field(..., min_length=1, max_length=50)
    metrique: str = Field(default="ha")
    valeur: float = Field(..., gt=0)


class CalculRequest(BaseModel):
    """Request body to trigger a full calculation for a farm.

    The parcelles may be submitted inline (preview) or the farm's
    stored parcelles are used when this field is empty.
    """
    parcelles: Optional[list[ParcelleInput]] = Field(
        None,
        max_length=100,
        description="Parcelles optionnelles pour un calcul preview. "
                    "Si absent, utilise les parcelles enregistrées de la ferme."
    )
    infrastructures: Optional[list[IAEInput]] = Field(
        None,
        max_length=50,
        description="IAE optionnelles pour un calcul preview. "
                    "Si absent, utilise les IAE enregistrées de la ferme."
    )
    inclure_iae: bool = Field(
        default=True,
        description="Applique la modulation infrastructures écologiques si True."
    )
    forcer_ecobalyse: bool = Field(
        default=False,
        description="Force l'appel à l'API Ecobalyse (si disponible)."
    )


class ImpactDetail(BaseModel):
    """Detail for a single PEF indicator."""
    indicateur: str = Field(..., description="Code PEF indicator (cch, pma, wtu, etc.)")
    nom: str = Field(..., description="Nom lisible de l'indicateur")
    valeur: float = Field(..., description="Valeur de l'impact dans l'unité PEF")
    unite: str = Field(..., description="Unité PEF")
    poids: float = Field(..., description="Poids de normalisation")
    contribution_score: float = Field(..., description="Contribution au score unique (mPt)")


class CultureContribution(BaseModel):
    """Contribution breakdown per culture."""
    code_culture: str
    culture_nom: Optional[str] = None
    surface_ha: float
    rendement_kg_ha: float
    production_totale_kg: float
    impacts: dict[str, float] = Field(default_factory=dict)
    contribution_score: float


class CalculPreviewOutput(BaseModel):
    """Output schema for a preview calculation (not persisted)."""
    score_unique: float = Field(..., description="Score PEF unique en mPt")
    categorie: str = Field(..., description="Catégorie A, B, C, D, E")
    impacts_detailles: list[ImpactDetail] = Field(default_factory=list)
    contributions_cultures: list[CultureContribution] = Field(default_factory=list)
    modulation_iae: Optional[dict[str, float]] = Field(
        None, description="Facteurs de modulation IAE appliqués"
    )
    surface_totale_ha: float = Field(default=0)
    nb_parcelles: int = Field(default=0)
    source_donnees: str = Field(default="AGRIBALYSE")
    methode_version: str = Field(default="1.0")
    niveau_confiance: float = Field(default=0.5)
    avertissements: list[str] = Field(default_factory=list)


class CalculOutput(BaseModel):
    """Output schema for a persisted calculation result."""
    id: uuid.UUID
    ferme_id: uuid.UUID
    methode_version: str
    timestamp: Optional[datetime] = None
    score_unique: Optional[float] = None
    categorie: Optional[str] = None
    impacts_json: dict
    details_json: Optional[dict] = None
    metadonnees_json: Optional[dict] = None
    niveau_confiance: float
    source_donnees: str
    statut: str
    erreur_message: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CalculList(BaseModel):
    """Schema for paginated calculation history."""
    items: list[CalculOutput]
    total: int
    page: int
    page_size: int
