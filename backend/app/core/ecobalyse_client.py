"""Ecobalyse API client with Agribalyse fallback.

Provides an HTTP client to call the Ecobalyse beta API,
with automatic fallback to local Agribalyse data when the
external API is unavailable or returns errors.
"""

import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class EcobalyseClient:
    """Client for the Ecobalyse beta API.

    Wraps HTTP calls to Ecobalyse with timeout, retry, and fallback
    to local Agribalyse data when the API is down or returns errors.
    """

    def __init__(self):
        settings = get_settings()
        self.base_url: str = settings.ECOBALYSE_API_URL.rstrip("/")
        self.timeout: int = settings.ECOBALYSE_TIMEOUT
        self.enabled: bool = settings.ECOBALYSE_ENABLED
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create an HTTP client."""
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

    async def get_product_impact(
        self, code_agb: str, est_bio: bool = False
    ) -> Optional[dict[str, float]]:
        """Fetch PEF impacts for a product from Ecobalyse API.

        Args:
            code_agb: Agribalyse product code.
            est_bio: If True, fetch organic mode data.

        Returns:
            Dict of {indicator: value_per_kg} or None if API call fails.
        """
        if not self.enabled:
            return None

        try:
            client = await self.get_client()
            mode_param = "bio" if est_bio else "conventionnel"
            url = f"{self.base_url}/food/{code_agb}"

            response = await client.get(
                url,
                params={"mode": mode_param},
            )

            if response.status_code == 200:
                data = response.json()
                return self._parse_ecobalyse_response(data)

            logger.warning(
                "Ecobalyse API returned %d for code %s",
                response.status_code, code_agb,
            )
            return None

        except httpx.TimeoutException:
            logger.info("Ecobalyse API timeout for code %s", code_agb)
            return None
        except httpx.RequestError as exc:
            logger.info("Ecobalyse API request error: %s", exc)
            return None
        except Exception as exc:
            logger.warning("Ecobalyse API unexpected error: %s", exc)
            return None

    def _parse_ecobalyse_response(self, data: dict) -> dict[str, float]:
        """Parse Ecobalyse API response into standard PEF format.

        The Ecobalyse API may return different key formats.
        This method normalizes to our standard indicator codes.
        """
        impacts: dict[str, float] = {}

        # Ecobalyse typically returns 'impacts' or 'ecoscore_data'
        impact_data = data.get("impacts", data.get("ecoscore_data", data))

        # Map common Ecobalyse response keys to our indicator codes
        key_mapping = {
            "climate_change": "cch",
            "cch": "cch",
            "particulate_matter": "pma",
            "pma": "pma",
            "water_use": "wtu",
            "wtu": "wtu",
            "land_use": "ldu",
            "ldu": "ldu",
            "resource_use_minerals": "mru",
            "mru": "mru",
            "resource_use_fossils": "fru",
            "fru": "fru",
            "acidification": "acd",
            "acd": "acd",
            "eutrophication_terrestrial": "tre",
            "tre": "tre",
            "eutrophication_freshwater": "fwe",
            "fwe": "fwe",
            "eutrophication_marine": "swe",
            "swe": "swe",
            "ecotoxicity_freshwater": "etf",
            "etf": "etf",
            "human_toxicity_cancer": "htc",
            "htc": "htc",
            "human_toxicity_noncancer": "htn",
            "htn": "htn",
            "photochemical_ozone": "pco",
            "pco": "pco",
            "ionising_radiation": "ior",
            "ior": "ior",
            "ozone_depletion": "ozd",
            "ozd": "ozd",
        }

        for key, value in impact_data.items():
            if isinstance(value, (int, float)):
                indicator = key_mapping.get(key, key)
                impacts[indicator] = float(value)

        return impacts if impacts else None

    async def health_check(self) -> bool:
        """Check if the Ecobalyse API is reachable.

        Returns:
            True if the API responds, False otherwise.
        """
        if not self.enabled:
            return False

        try:
            client = await self.get_client()
            response = await client.get(f"{self.base_url}/")
            return response.status_code < 500
        except Exception:
            return False


# Singleton instance
_ecobalyse_client: Optional[EcobalyseClient] = None


async def get_ecobalyse_client() -> EcobalyseClient:
    """Get or initialize the singleton Ecobalyse client."""
    global _ecobalyse_client
    if _ecobalyse_client is None:
        _ecobalyse_client = EcobalyseClient()
    return _ecobalyse_client
