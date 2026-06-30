"""Core module package."""

from app.core.calculator import ImpactCalculator, get_calculator
from app.core.agribalyse import AgribalyseProvider, get_agribalyse_provider
from app.core.ecobalyse_client import EcobalyseClient, get_ecobalyse_client
from app.core.iae_modulator import IAEModulator, get_iae_modulator
from app.core.normalizer import normalize_impacts, compute_single_score, POIDS_PEF
from app.core.scorer import categorize_score, get_category_info

__all__ = [
    "ImpactCalculator",
    "get_calculator",
    "AgribalyseProvider",
    "get_agribalyse_provider",
    "EcobalyseClient",
    "get_ecobalyse_client",
    "IAEModulator",
    "get_iae_modulator",
    "normalize_impacts",
    "compute_single_score",
    "POIDS_PEF",
    "categorize_score",
    "get_category_info",
]
