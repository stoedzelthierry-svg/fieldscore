"""IAE (Infrastructure Agro-Écologique) modulator.

Applies correction coefficients to environmental impact scores
based on the presence and extent of ecological infrastructures
on the farm (hedges, grass strips, ponds, agroforestry, etc.).
"""

import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Type definitions
IAE_COEFFICIENTS_TYPE = dict[str, dict[str, float]]

# Default IAE coefficients when JSON file is unavailable
DEFAULT_IAE_COEFFICIENTS: IAE_COEFFICIENTS_TYPE = {
    "haie": {
        "cch": -0.15, "bvi": 0.20, "ldu": -0.10,
        "fwe": -0.05, "swe": -0.05, "tre": -0.05,
    },
    "bande_enherbee": {
        "cch": -0.05, "fwe": -0.20, "swe": -0.20,
        "tre": -0.20, "ldu": -0.10, "bvi": 0.10, "etf": -0.05,
    },
    "mare": {
        "bvi": 0.15, "etf": -0.10, "wtu": -0.10,
        "fwe": -0.10, "swe": -0.05, "tre": -0.05,
    },
    "agroforesterie": {
        "cch": -0.25, "ldu": -0.20, "bvi": 0.30,
        "fwe": -0.10, "swe": -0.05, "tre": -0.10,
    },
    "jachere": {
        "bvi": 0.25, "ldu": -0.10, "cch": -0.05,
        "fwe": -0.05, "swe": -0.05, "tre": -0.05,
    },
    "muret": {
        "bvi": 0.10,
    },
    "arbre_isole": {
        "cch": -0.02, "bvi": 0.05,
    },
}

# Normalisation factors per IAE type per hectare
# These determine how strongly a given IAE modulates impacts based on its extent
IAE_NORMALISATION = {
    "haie": {"ml_par_ha": 100, "max_modulation": 0.15},
    "bande_enherbee": {"ml_par_ha": 200, "max_modulation": 0.20},
    "mare": {"nb_par_ha": 1, "max_modulation": 0.10},
    "agroforesterie": {"ha_par_ha": 0.3, "max_modulation": 0.30},
    "jachere": {"ha_par_ha": 0.3, "max_modulation": 0.15},
    "muret": {"ml_par_ha": 50, "max_modulation": 0.05},
    "arbre_isole": {"nb_par_ha": 5, "max_modulation": 0.05},
}

IAE_DESCRIPTIONS = {
    "haie": "Haie",
    "bande_enherbee": "Bande enherbée",
    "mare": "Mare",
    "agroforesterie": "Agroforesterie",
    "jachere": "Jachère",
    "muret": "Muret",
    "arbre_isole": "Arbre isolé",
}


class IAEModulator:
    """Applies IAE coefficients to adjust environmental impact scores.

    Coefficients represent the relative reduction (negative values) or
    biodiversity improvement (positive 'bvi' indicator) contributed by
    each IAE type, scaled by the farm's surface area.
    """

    def __init__(self, coefficients_path: Optional[str] = None):
        """Initialize the modulator.

        Args:
            coefficients_path: Path to IAE coefficients JSON file.
        """
        self.coefficients_path = coefficients_path
        self.coefficients: IAE_COEFFICIENTS_TYPE = {}

    async def load(self) -> None:
        """Load IAE coefficients from JSON file or defaults."""
        if self.coefficients:
            return

        if self.coefficients_path:
            json_file = Path(self.coefficients_path)
            if json_file.exists():
                try:
                    raw = json.loads(json_file.read_text())
                    # Support nested format: {"coefficients": {"AGF": ...}}
                    if "coefficients" in raw and isinstance(raw["coefficients"], dict):
                        nested = raw["coefficients"]
                        # Check if codes are uppercase (AGF, HAI...) and map them
                        # Create a mapping from short codes to our standard names
                        code_to_name = {
                            "AGF": "agroforesterie",
                            "HAI": "haie",
                            "BEN": "bande_enherbee",
                            "MAR": "mare",
                            "JFL": "jachere",
                            "MUR": "muret",
                            "ARB": "arbre_isole",
                            "BQT": "bosquet",
                            "FOS": "fosse",
                            "VHT": "verger_hautes_tiges",
                            "ZHU": "zone_humide",
                        }
                        self.coefficients = {}
                        for code, info in nested.items():
                            if isinstance(info, dict):
                                name = code_to_name.get(code, code.lower())
                                # Extract impacts_modifies or use flat dict
                                if "impacts_modifies" in info:
                                    self.coefficients[name] = info["impacts_modifies"]
                                else:
                                    self.coefficients[name] = {k: v for k, v in info.items()
                                                              if isinstance(v, (int, float))}
                    else:
                        # Flat format: {"haie": {"cch": -0.15, ...}}
                        self.coefficients = {k: v for k, v in raw.items()
                                            if isinstance(v, dict)}
                    logger.info(
                        "Loaded %d IAE coefficients from %s",
                        len(self.coefficients), json_file,
                    )
                    return
                except Exception as exc:
                    logger.warning(
                        "Failed to load IAE coefficients from %s: %s",
                        json_file, exc,
                    )

        self.coefficients = dict(DEFAULT_IAE_COEFFICIENTS)
        logger.info("Using default IAE coefficients")

    def apply_modulation(
        self,
        indicators: dict[str, float],
        iae_entries: list[dict],
        surface_totale_ha: float,
    ) -> tuple[dict[str, float], dict[str, float]]:
        """Apply IAE modulation to indicator values.

        For each IAE entry, computes a modulation factor based on
        the extent relative to farm surface, capped at max_modulation.
        Applies per-indicator coefficients proportionally.

        Args:
            indicators: Current impact values {indicator: value}.
            iae_entries: List of IAE entries, each with
                         {'type_iae', 'metrique', 'valeur'}.
            surface_totale_ha: Total farm surface in hectares.

        Returns:
            Tuple of (modulated_indicators, modulation_factors_per_indicator).
            modulation_factors is {indicator: total_factor_applied}.
        """
        if not indicators or not iae_entries or surface_totale_ha <= 0:
            return dict(indicators), {}

        result = dict(indicators)
        modulation_factors: dict[str, float] = {}

        # Track which indicators have been modulated and aggregate factors
        accumulated_factors: dict[str, float] = {}

        for iae in iae_entries:
            type_iae = iae.get("type_iae", "").lower()
            metrique = iae.get("metrique", "")
            valeur = float(iae.get("valeur", 0))

            if not type_iae or valeur <= 0:
                continue

            iae_coefs = self.coefficients.get(type_iae, {})
            iae_norm = IAE_NORMALISATION.get(type_iae, {})

            if not iae_coefs or not iae_norm:
                continue

            # Determine the normalisation factor for this IAE
            norm_key = f"{metrique}_par_ha"
            if norm_key not in iae_norm:
                # Try alternative keys
                if metrique == "ml":
                    norm_key = "ml_par_ha"
                elif metrique == "m2":
                    # Convert m2 to ha equivalent
                    valeur = valeur / 10000.0
                    norm_key = "ha_par_ha"
                elif metrique == "ha":
                    norm_key = "ha_par_ha"

            norm_value = iae_norm.get(norm_key, 1.0)
            max_mod = iae_norm.get("max_modulation", 0.3)

            if norm_value <= 0:
                continue

            # Compute modulation factor: how much of the max effect?
            density = valeur / surface_totale_ha
            factor = min(density / norm_value, 1.0) * max_mod

            # Apply this IAE's coefficients scaled by factor
            for indicator, coef in iae_coefs.items():
                if indicator == "bvi":
                    # Biodiversity index is handled separately
                    continue

                adjustment = coef * factor
                if indicator in result:
                    result[indicator] = result[indicator] * (1.0 + adjustment)
                    if result[indicator] < 0:
                        result[indicator] = 0.0

                accumulated_factors[indicator] = (
                    accumulated_factors.get(indicator, 0.0) + adjustment
                )

        # Compute modulation factors per indicator
        for ind in accumulated_factors:
            modulation_factors[ind] = accumulated_factors[ind]

        return result, modulation_factors

    def get_iae_types(self) -> list[dict]:
        """Return information about all supported IAE types."""
        result = []
        for type_iae, coefficients in self.coefficients.items():
            norm = IAE_NORMALISATION.get(type_iae, {})
            accepted = list(norm.keys()) if norm else []
            info = {
                "type_iae": type_iae,
                "nom": IAE_DESCRIPTIONS.get(type_iae, type_iae),
                "description": IAE_DESCRIPTIONS.get(type_iae, ""),
                "metriques_acceptees": accepted,
                "coefficients": coefficients,
            }
            result.append(info)
        return result


# Singleton instance
_modulator: Optional[IAEModulator] = None


async def get_iae_modulator() -> IAEModulator:
    """Get or initialize the singleton IAE modulator."""
    global _modulator
    if _modulator is None:
        from app.config import get_settings
        settings = get_settings()
        _modulator = IAEModulator(
            coefficients_path=settings.IAE_COEFFICIENTS_PATH
        )
        await _modulator.load()
    return _modulator
