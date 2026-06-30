"""API v1 farms endpoints — CRUD operations for farms."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, pagination_params
from app.models.ferme import Ferme
from app.schemas.ferme import (
    FermeCreate, FermeUpdate, FermeOut, FermeList,
)

router = APIRouter(prefix="/fermes", tags=["Fermes"])


@router.get(
    "",
    response_model=FermeList,
    summary="List farms",
    description="Retourne la liste paginée des fermes enregistrées.",
)
async def list_fermes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    type_production: Optional[str] = Query(
        default=None,
        description="Filtrer par type de production"
    ),
    search: Optional[str] = Query(
        default=None,
        description="Recherche par nom ou SIRET"
    ),
    db: AsyncSession = Depends(get_db),
) -> FermeList:
    """List all registered farms with optional filters and pagination."""
    query = select(Ferme)

    if type_production:
        query = query.where(Ferme.type_production == type_production)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Ferme.nom.ilike(search_term)) |
            (Ferme.siret.ilike(search_term))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(Ferme.nom).offset(offset).limit(page_size)

    result = await db.execute(query)
    fermes = result.scalars().all()

    return FermeList(
        items=[FermeOut.model_validate(f) for f in fermes],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=FermeOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a farm",
    description="Crée une nouvelle ferme et retourne ses informations.",
)
async def create_ferme(
    body: FermeCreate,
    db: AsyncSession = Depends(get_db),
) -> FermeOut:
    """Create a new farm."""
    ferme = Ferme(**body.model_dump())
    db.add(ferme)
    await db.flush()
    await db.refresh(ferme)
    return FermeOut.model_validate(ferme)


@router.get(
    "/{ferme_id}",
    response_model=FermeOut,
    summary="Get farm details",
    description="Retourne le détail d'une ferme par son ID.",
)
async def get_ferme(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> FermeOut:
    """Get a farm by its ID."""
    result = await db.execute(
        select(Ferme).where(Ferme.id == ferme_id)
    )
    ferme = result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ferme {ferme_id} introuvable",
        )
    return FermeOut.model_validate(ferme)


@router.put(
    "/{ferme_id}",
    response_model=FermeOut,
    summary="Update a farm",
    description="Met à jour une ferme existante. Seuls les champs fournis sont modifiés.",
)
async def update_ferme(
    ferme_id: uuid.UUID,
    body: FermeUpdate,
    db: AsyncSession = Depends(get_db),
) -> FermeOut:
    """Update an existing farm."""
    result = await db.execute(
        select(Ferme).where(Ferme.id == ferme_id)
    )
    ferme = result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ferme {ferme_id} introuvable",
        )

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ferme, key, value)

    await db.flush()
    await db.refresh(ferme)
    return FermeOut.model_validate(ferme)


@router.delete(
    "/{ferme_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a farm",
    description="Supprime une ferme et toutes ses données associées.",
)
async def delete_ferme(
    ferme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a farm and all its associated data."""
    result = await db.execute(
        select(Ferme).where(Ferme.id == ferme_id)
    )
    ferme = result.scalar_one_or_none()
    if ferme is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ferme {ferme_id} introuvable",
        )
    await db.delete(ferme)
    await db.flush()
