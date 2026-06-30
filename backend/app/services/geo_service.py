"""Geo-spatial service — surface computation, coordinate transforms.

Provides utility functions for geospatial calculations:
- Area computation from GeoJSON geometries
- Coordinate system transforms (WGS84 <-> Lambert 93)
- Distance and buffer operations
"""

import logging
import math
from typing import Optional

logger = logging.getLogger(__name__)


class GeoService:
    """Service for geospatial calculations.

    Currently uses pure-Python fallbacks. Full GIS capabilities
    (shapely, pyproj) are available when dependencies are installed.
    """

    def __init__(self):
        self._has_shapely = False
        self._has_pyproj = False
        self._check_dependencies()

    def _check_dependencies(self) -> None:
        """Check if optional geo dependencies are available."""
        try:
            import shapely  # noqa: F401
            self._has_shapely = True
            logger.info("Shapely is available for geo calculations")
        except ImportError:
            logger.info("Shapely not installed, using fallback geo calculations")

        try:
            import pyproj  # noqa: F401
            self._has_pyproj = True
            logger.info("PyProj is available for coordinate transforms")
        except ImportError:
            logger.info("PyProj not installed, using fallback transforms")

    def compute_area_ha(self, geometry: dict) -> float:
        """Compute area in hectares from a GeoJSON geometry.

        Uses shapely if available, otherwise uses a simple approximation.

        Args:
            geometry: GeoJSON geometry dict with type and coordinates.

        Returns:
            Area in hectares.
        """
        if self._has_shapely:
            return self._compute_area_shapely(geometry)
        return self._compute_area_fallback(geometry)

    def _compute_area_shapely(self, geometry: dict) -> float:
        """Compute area using shapely (accurate)."""
        try:
            from shapely.geometry import shape
            from shapely.ops import transform
            import pyproj

            geom = shape(geometry)

            if self._has_pyproj:
                # Transform to Lambert 93 for accurate area in m²
                # Use centroid to determine best UTM zone
                centroid = geom.centroid
                wgs84 = pyproj.CRS("EPSG:4326")
                lambert93 = pyproj.CRS("EPSG:2154")

                project = pyproj.Transformer.from_crs(
                    wgs84, lambert93, always_xy=True
                ).transform
                geom_proj = transform(project, geom)
                area_m2 = geom_proj.area
            else:
                # Approximate using WGS84
                area_m2 = geom.area * 111320.0 * math.cos(
                    math.radians(geom.centroid.y)
                ) * 111320.0

            return area_m2 / 10000.0  # Convert m² to ha

        except Exception as exc:
            logger.warning("Shapely area computation failed: %s", exc)
            return self._compute_area_fallback(geometry)

    def _compute_area_fallback(self, geometry: dict) -> float:
        """Fallback area computation using the shoelace formula.

        Note: This is an approximation and does not account for
        Earth curvature. Suitable for small polygons.
        """
        try:
            geom_type = geometry.get("type", "")
            coords = geometry.get("coordinates", [])

            if geom_type == "Polygon":
                coords_flat = coords[0]
            elif geom_type == "MultiPolygon":
                total = 0.0
                for poly in coords:
                    total += self._shoelace_area(poly[0])
                return total
            else:
                return 0.0

            return self._shoelace_area(coords_flat)

        except Exception as exc:
            logger.warning("Fallback area computation failed: %s", exc)
            return 0.0

    @staticmethod
    def _shoelace_area(coords: list) -> float:
        """Compute polygon area using the shoelace formula.

        Args:
            coords: List of [lon, lat] coordinate pairs.

        Returns:
            Area in hectares.
        """
        if len(coords) < 3:
            return 0.0

        n = len(coords)
        area_deg = 0.0
        for i in range(n - 1):
            x1, y1 = coords[i][0], coords[i][1]
            x2, y2 = coords[i + 1][0], coords[i + 1][1]
            area_deg += (x1 * y2) - (x2 * y1)

        area_deg = abs(area_deg) / 2.0

        # Convert square degrees to approximate hectares
        # 1 degree ≈ 111.32 km at equator
        # Use middle latitude for approx conversion
        avg_lat = sum(c[1] for c in coords[:-1]) / (n - 1)
        lat_factor = math.cos(math.radians(avg_lat))
        area_km2 = area_deg * 111.32 * 111.32 * lat_factor
        area_ha = area_km2 * 100.0

        return area_ha

    def compute_distance_km(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """Compute great-circle distance between two points (km).

        Uses the Haversine formula.

        Args:
            lat1, lon1: First point coordinates (degrees).
            lat2, lon2: Second point coordinates (degrees).

        Returns:
            Distance in kilometers.
        """
        R = 6371.0  # Earth's radius in km

        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

        return R * c


# Singleton instance
_geo_service: Optional[GeoService] = None


async def get_geo_service() -> GeoService:
    """Get or initialize the singleton geo service."""
    global _geo_service
    if _geo_service is None:
        _geo_service = GeoService()
    return _geo_service
