"""PEF normalization weights and scoring.

Provides the official PEF normalisation factors used to convert
midpoint indicator values into a single dimensionless score (mPt).
"""

import logging

logger = logging.getLogger(__name__)

# PEF normalisation weights (EU PEF 3.1 / EF 3.1)
# These convert each indicator's absolute value into points (Pt),
# then multiplied by 1000 to get mPt. The weights here include both
# the normalisation and weighting factors.
POIDS_PEF: dict[str, float] = {
    "cch": 0.2106,  # Changement climatique
    "pma": 0.0896,  # Particules fines
    "wtu": 0.0851,  # Utilisation de l'eau
    "ldu": 0.0794,  # Utilisation du sol
    "mru": 0.0755,  # Ressources minérales et métaux
    "fru": 0.0832,  # Ressources énergétiques fossiles
    "acd": 0.0620,  # Acidification
    "tre": 0.0371,  # Eutrophisation terrestre
    "fwe": 0.0280,  # Eutrophisation eaux douces
    "swe": 0.0296,  # Eutrophisation marine
    "etf": 0.0192,  # Écotoxicité eaux douces
    "htc": 0.0213,  # Toxicité humaine cancérigène
    "htn": 0.0184,  # Toxicité humaine non-cancérigène
    "pco": 0.0478,  # Formation d'ozone photochimique
    "ior": 0.0501,  # Radiations ionisantes
    "ozd": 0.0631,  # Appauvrissement de la couche d'ozone
}

# Normalisation factors (EU EF 3.1) — per capita EU-27 reference
# These divide the absolute impact to get a dimensionless value
NORMALISATION_FACTORS: dict[str, float] = {
    "cch": 8.10e3,    # kg CO2 eq / capita
    "pma": 5.95e-4,   # disease inc. / capita
    "wtu": 1.15e4,    # m³ world eq / capita
    "ldu": 1.33e6,    # Pt / capita
    "mru": 6.36e-2,   # kg Sb eq / capita
    "fru": 6.53e4,    # MJ / capita
    "acd": 5.56e1,    # mol H+ eq / capita
    "tre": 1.77e2,    # mol N eq / capita
    "fwe": 1.61e1,    # kg P eq / capita
    "swe": 1.96e1,    # kg N eq / capita
    "etf": 4.27e4,    # CTUe / capita
    "htc": 1.69e-5,   # CTUh / capita
    "htn": 2.30e-4,   # CTUh / capita
    "pco": 4.06e1,    # kg NMVOC eq / capita
    "ior": 4.22e3,    # kBq U-235 eq / capita
    "ozd": 5.36e-2,   # kg CFC11 eq / capita
}


def normalize_impacts(impacts: dict[str, float]) -> dict[str, float]:
    """Convert absolute PEF impacts into normalized mPt scores.

    The formula is:
        score_mPt = (impact_value / normalization_factor) * weight * 1000

    Args:
        impacts: Dict of {indicator_code: absolute_impact_value}

    Returns:
        Dict of {indicator_code: score_in_mPt}
    """
    scores: dict[str, float] = {}
    for indicator, value in impacts.items():
        if indicator not in POIDS_PEF or indicator not in NORMALISATION_FACTORS:
            logger.warning("Unknown indicator '%s' in normalization", indicator)
            scores[indicator] = 0.0
            continue

        norm_factor = NORMALISATION_FACTORS[indicator]
        weight = POIDS_PEF[indicator]

        if norm_factor > 0:
            score = (value / norm_factor) * weight * 1000  # Convert to mPt
        else:
            score = 0.0

        scores[indicator] = score

    return scores


def compute_single_score(normalized_scores: dict[str, float]) -> float:
    """Sum all normalized indicator scores into a single PEF score (mPt).

    Args:
        normalized_scores: Dict of {indicator_code: mPt_score}

    Returns:
        Single score value in mPt.
    """
    return sum(normalized_scores.values())


def normalize_single_indicator(indicator: str, value: float) -> float:
    """Normalize a single indicator value to mPt.

    Args:
        indicator: PEF indicator code.
        value: Absolute impact value.

    Returns:
        Normalized score in mPt.
    """
    if indicator not in POIDS_PEF or indicator not in NORMALISATION_FACTORS:
        return 0.0

    norm_factor = NORMALISATION_FACTORS[indicator]
    weight = POIDS_PEF[indicator]

    if norm_factor > 0:
        return (value / norm_factor) * weight * 1000
    return 0.0


def get_all_indicators() -> list[str]:
    """Return the list of all 16 PEF indicators."""
    return list(POIDS_PEF.keys())


def get_weight(indicator: str) -> float:
    """Get the PEF weight for an indicator."""
    return POIDS_PEF.get(indicator, 0.0)


def get_normalisation_factor(indicator: str) -> float:
    """Get the normalisation factor for an indicator."""
    return NORMALISATION_FACTORS.get(indicator, 0.0)
