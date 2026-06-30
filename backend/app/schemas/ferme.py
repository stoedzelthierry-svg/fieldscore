"""Pydantic schemas for Farm endpoints."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class FermeBase(BaseModel):
    """Base schema for farm data."""
    siret: Optional[str] = Field(None, min_length=14, max_length=14, pattern=r"^\d{14}$")
    nom: str = Field(..., min_length=1, max_length=255)
    code_insee: Optional[str] = Field(None, min_length=5, max_length=5)
    type_production: Optional[str] = Field(
        None,
        pattern=r"^(GRANDES_CULTURES|ELEVAGE|MIXTE|MARAICHAGE|VITICULTURE|ARBORICULTURE)$"
    )
    surface_totale_ha: Optional[float] = Field(None, gt=0)
    annee_reference: int = Field(default=2024, ge=2000, le=2100)


class FermeCreate(FermeBase):
    """Schema for creating a new farm."""
    pass


class FermeUpdate(BaseModel):
    """Schema for updating an existing farm. All fields optional."""
    siret: Optional[str] = Field(None, min_length=14, max_length=14, pattern=r"^\d{14}$")
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    code_insee: Optional[str] = Field(None, min_length=5, max_length=5)
    type_production: Optional[str] = Field(
        None,
        pattern=r"^(GRANDES_CULTURES|ELEVAGE|MIXTE|MARAICHAGE|VITICULTURE|ARBORICULTURE)$"
    )
    surface_totale_ha: Optional[float] = Field(None, gt=0)
    annee_reference: Optional[int] = Field(None, ge=2000, le=2100)


class FermeOut(FermeBase):
    """Schema for farm output (response)."""
    id: uuid.UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FermeList(BaseModel):
    """Schema for paginated farm list response."""
    items: list[FermeOut]
    total: int
    page: int
    page_size: int
