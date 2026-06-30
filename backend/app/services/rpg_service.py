"""RPG (Registre Parcellaire Graphique) integration service.

Provides integration with the French RPG agricultural data API
to fetch parcel information, crop codes, and geometries.
"""

import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class RPGService:
    """Client for the RPG (Registre Parcellaire Graphique) API.

    Allows fetching declared crop data for farms identified by
    PACAGE number or SIRET.
    """

    def __init__(self):
        settings = get_settings()
        self.base_url: str = settings.RPG_API_URL.rstrip("/")
        self.timeout: int = settings.RPG_TIMEOUT
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create the HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                headers={"User-Agent": "EcoCert-FieldScore/1.0"},
            )
        return self._client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def get_parcelles_by_siret(
        self, siret: str, annee: int = 2024
    ) -> list[dict]:
        """Fetch declared parcels for a farm by SIRET.

        Args:
            siret: Farm SIRET number (14 digits).
            annee: Reference year.

        Returns:
            List of parcel data dicts with crop codes and surfaces.
        """
        try:
            client = await self.get_client()
            url = f"{self.base_url}/catalog/datasets/rpg/records"

            response = await client.get(
                url,
                params={
                    "where": f'siret="{siret}" AND annee={annee}',
                    "limit": 100,
                },
            )

            if response.status_code == 200:
                data = response.json()
                return self._parse_rpg_response(data)

            logger.warning("RPG API returned %d for SIRET %s", response.status_code, siret)
            return []

        except Exception as exc:
            logger.warning("RPG API error: %s", exc)
            return []

    def _parse_rpg_response(self, data: dict) -> list[dict]:
        """Parse RPG API response into standardized parcel list."""
        results = data.get("results", [])
        if not results:
            return []

        parcelles = []
        for record in results:
            parcelle = {
                "code_culture": record.get("code_culture", record.get("code_cultur", "")),
                "culture_nom": record.get("libelle_culture", record.get("culture_nom", "")),
                "surface_ha": float(record.get("surf_parc", record.get("surface_ha", 0))),
                "est_bio": record.get("bio", record.get("est_bio", 0)) == 1,
                "source": "RPG",
                "annee": record.get("annee", 2024),
            }
            parcelles.append(parcelle)

        return parcelles

    async def get_parcelle_geometry(self, parcelle_id: str) -> Optional[dict]:
        """Fetch geometry data for a specific RPG parcel.

        Args:
            parcelle_id: RPG parcel identifier.

        Returns:
            GeoJSON geometry dict or None.
        """
        try:
            client = await self.get_client()
            url = f"{self.base_url}/catalog/datasets/rpg/records"

            response = await client.get(
                url,
                params={
                    "where": f'id_parcel="{parcelle_id}"',
                    "limit": 1,
                    "select": "geo_shape",
                },
            )

            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    return results[0].get("geo_shape")

            return None

        except Exception as exc:
            logger.warning("RPG geometry error: %s", exc)
            return None


# Singleton instance
_rpg_service: Optional[RPGService] = None


async def get_rpg_service() -> RPGService:
    """Get or initialize the singleton RPG service."""
    global _rpg_service
    if _rpg_service is None:
        _rpg_service = RPGService()
    return _rpg_service
