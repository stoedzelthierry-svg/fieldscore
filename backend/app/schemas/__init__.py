"""Pydantic schemas package."""

from app.schemas.ferme import (
    FermeBase, FermeCreate, FermeUpdate, FermeOut, FermeList,
)
from app.schemas.parcelle import (
    ParcelleBase, ParcelleCreate, ParcelleUpdate, ParcelleOut, ParcelleList,
)
from app.schemas.calcul import (
    ParcelleInput, CalculRequest, ImpactDetail, CultureContribution,
    CalculPreviewOutput, CalculOutput, CalculList,
)
from app.schemas.referentiel import (
    CultureReferentiel, IAETypeInfo, VersionInfo, IndicateurPEF,
)

__all__ = [
    "FermeBase", "FermeCreate", "FermeUpdate", "FermeOut", "FermeList",
    "ParcelleBase", "ParcelleCreate", "ParcelleUpdate", "ParcelleOut", "ParcelleList",
    "ParcelleInput", "CalculRequest", "ImpactDetail", "CultureContribution",
    "CalculPreviewOutput", "CalculOutput", "CalculList",
    "CultureReferentiel", "IAETypeInfo", "VersionInfo", "IndicateurPEF",
]
