"""API v1 parcelles endpoints — CRUD operations for field plots."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.parcelle import Parcelle
from app.models.ferme import Ferme
from app.schemas.parcelle import (
    ParcelleCreate, ParcelleUpdate, ParcelleOut, ParcelleList,
)

router = APIRouter(prefix="/fermes/{ferme_id}/parcelles", tags=["Parcelles"])


@router.get(
    "",
    response_model=ParcelleList,
    summary="List field plots",
    description="Retourne la liste paginée des parcelles d'une ferme.",
)
async def list_parcelles(
    ferme_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> ParcelleList:
    """List all parcelles for a given farm."""
    # Verify farm exists
    farm_result = await db.execute(select(Ferme).where(Ferme.id == str(ferme_id)))
    if farm_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=f"Ferme {ferme_id} introuvable")

    query = select(Parcelle).where(Parcelle.ferme_id == str(ferme_id))

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(Parcelle.code_culture).offset(offset).limit(page_size)

    result = await db.execute(query)
    parcelles = result.scalars().all()

    return ParcelleList(
        items=[ParcelleOut.model_validate(p) for p in parcelles],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=ParcelleOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add a field plot",
    description="Ajoute une nouvelle parcelle à une ferme.",
)
async def create_parcelle(
    ferme_id: uuid.UUID,
    body: ParcelleCreate,
    db: AsyncSession = Depends(get_db),
) -> ParcelleOut:
    """Create a new parcelle for a farm."""
    # Verify farm exists
    farm_result = await db.execute(select(Ferme).where(Ferme.id == str(ferme_id)))
    if farm_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=f"Ferme {ferme_id} introuvable")

    parcelle_data = body.model_dump()
    parcelle_data["ferme_id"] = str(ferme_id)
    parcelle = Parcelle(**parcelle_data)
    db.add(parcelle)
    await db.flush()
    await db.refresh(parcelle)
    return ParcelleOut.model_validate(parcelle)


@router.get(
    "/{parcelle_id}",
    response_model=ParcelleOut,
    summary="Get field plot details",
    description="Retourne le détail d'une parcelle.",
)
async def get_parcelle(
    ferme_id: uuid.UUID,
    parcelle_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ParcelleOut:
    """Get a specific parcelle."""
    result = await db.execute(
        select(Parcelle).where(
            Parcelle.id == str(parcelle_id),
            Parcelle.ferme_id == str(ferme_id),
        )
    )
    parcelle = result.scalar_one_or_none()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle introuvable")
    return ParcelleOut.model_validate(parcelle)


@router.put(
    "/{parcelle_id}",
    response_model=ParcelleOut,
    summary="Update a field plot",
    description="Met à jour une parcelle existante.",
)
async def update_parcelle(
    ferme_id: uuid.UUID,
    parcelle_id: uuid.UUID,
    body: ParcelleUpdate,
    db: AsyncSession = Depends(get_db),
) -> ParcelleOut:
    """Update a parcelle."""
    result = await db.execute(
        select(Parcelle).where(
            Parcelle.id == str(parcelle_id),
            Parcelle.ferme_id == str(ferme_id),
        )
    )
    parcelle = result.scalar_one_or_none()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle introuvable")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(parcelle, key, value)

    await db.flush()
    await db.refresh(parcelle)
    return ParcelleOut.model_validate(parcelle)


@router.delete(
    "/{parcelle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a field plot",
    description="Supprime une parcelle.",
)
async def delete_parcelle(
    ferme_id: uuid.UUID,
    parcelle_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a parcelle."""
    result = await db.execute(
        select(Parcelle).where(
            Parcelle.id == str(parcelle_id),
            Parcelle.ferme_id == str(ferme_id),
        )
    )
    parcelle = result.scalar_one_or_none()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle introuvable")
    await db.delete(parcelle)
    await db.flush()
