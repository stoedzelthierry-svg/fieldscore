"""API dependencies.

Provides reusable FastAPI dependencies like database session
and common query parameters.
"""

from typing import AsyncGenerator, Optional

from fastapi import Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session.

    The session is committed on success, rolled back on error,
    and always closed.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Common query parameters
async def pagination_params(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(
        default=20, ge=1, le=100, description="Number of items per page"
    ),
) -> dict:
    """Extract pagination parameters from query string."""
    return {"page": page, "page_size": page_size}
