"""Pydantic schemas for Parcelle endpoints."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ParcelleBase(BaseModel):
    """Base schema for parcelle data."""
    code_culture: str = Field(..., min_length=1, max_length=20)
    culture_nom: Optional[str] = Field(None, max_length=255)
    surface_ha: float = Field(..., gt=0, le=100000)
    est_bio: bool = Field(default=False)
    rendement_reel_kg_ha: Optional[float] = Field(None, gt=0)
    annee: int = Field(default=2024, ge=2000, le=2100)


class ParcelleCreate(ParcelleBase):
    """Schema for creating a new parcelle."""
    ferme_id: Optional[uuid.UUID] = None


class ParcelleUpdate(BaseModel):
    """Schema for updating an existing parcelle."""
    code_culture: Optional[str] = Field(None, min_length=1, max_length=20)
    culture_nom: Optional[str] = Field(None, max_length=255)
    surface_ha: Optional[float] = Field(None, gt=0, le=100000)
    est_bio: Optional[bool] = None
    rendement_reel_kg_ha: Optional[float] = Field(None, gt=0)
    annee: Optional[int] = Field(None, ge=2000, le=2100)


class ParcelleOut(ParcelleBase):
    """Schema for parcelle output (response)."""
    id: uuid.UUID
    ferme_id: uuid.UUID
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ParcelleList(BaseModel):
    """Schema for paginated parcelle list response."""
    items: list[ParcelleOut]
    total: int
    page: int
    page_size: int
