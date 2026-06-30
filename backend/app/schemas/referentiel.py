"""Pydantic schemas for referentiel endpoints."""

import uuid
from typing import Optional
from pydantic import BaseModel, Field


class CultureReferentiel(BaseModel):
    """Culture reference data: PAC code → Agribalyse mapping with yields."""
    code_culture_pac: str
    nom_culture: str
    code_agb: str
    nom_produit_agb: str
    rendement_moyen_conv_kg_ha: float
    rendement_moyen_bio_kg_ha: float
    version: str = "1.0"

    model_config = {"from_attributes": True}


class IAETypeInfo(BaseModel):
    """Information about an IAE type and its coefficients."""
    type_iae: str = Field(..., description="Code type IAE")
    nom: str = Field(..., description="Nom lisible")
    description: str = Field(default="")
    metriques_acceptees: list[str] = Field(default_factory=list)
    coefficients: dict[str, float] = Field(
        default_factory=dict,
        description="Coefficients de modulation par indicateur PEF"
    )


class VersionInfo(BaseModel):
    """Method version information."""
    version: str
    date_publication: str
    description: str
    changelog: list[str] = Field(default_factory=list)
    active: bool = True


class IndicateurPEF(BaseModel):
    """PEF indicator description."""
    code: str
    nom: str
    unite: str
    poids: float
    description: str = ""
