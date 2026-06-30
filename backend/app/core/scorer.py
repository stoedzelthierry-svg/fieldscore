"""Environmental scoring and categorization.

Converts the single PEF score into a letter category (A to E)
with thresholds adapted per production type.
"""

import logging

logger = logging.getLogger(__name__)

# Default thresholds in mPt (single score values)
# These can be adjusted based on production type
DEFAULT_THRESHOLDS = {
    "A": 100.0,   # ≤ 100 mPt → A (excellent)
    "B": 250.0,   # ≤ 250 mPt → B (très bon)
    "C": 500.0,   # ≤ 500 mPt → C (bon)
    "D": 1000.0,  # ≤ 1000 mPt → D (moyen)
    # > 1000 mPt → E (à améliorer)
}

# Production-type-specific thresholds
PRODUCTION_THRESHOLDS = {
    "GRANDES_CULTURES": {
        "A": 150.0, "B": 350.0, "C": 700.0, "D": 1400.0,
    },
    "ELEVAGE": {
        "A": 200.0, "B": 500.0, "C": 1000.0, "D": 2000.0,
    },
    "MIXTE": {
        "A": 175.0, "B": 425.0, "C": 850.0, "D": 1700.0,
    },
    "MARAICHAGE": {
        "A": 80.0, "B": 200.0, "C": 400.0, "D": 800.0,
    },
    "VITICULTURE": {
        "A": 120.0, "B": 300.0, "C": 600.0, "D": 1200.0,
    },
    "ARBORICULTURE": {
        "A": 100.0, "B": 250.0, "C": 500.0, "D": 1000.0,
    },
}

CATEGORY_LABELS = {
    "A": "Excellent — Impact environnemental très faible",
    "B": "Très bon — Impact environnemental faible",
    "C": "Bon — Impact environnemental modéré",
    "D": "Moyen — Impact environnemental significatif",
    "E": "À améliorer — Impact environnemental élevé",
}

CATEGORY_COLORS = {
    "A": "#2E7D32",  # Dark green
    "B": "#66BB6A",  # Light green
    "C": "#FFC107",  # Amber
    "D": "#FF9800",  # Orange
    "E": "#F44336",  # Red
}


def categorize_score(
    score: float, type_production: str | None = None
) -> str:
    """Convert a single PEF score (mPt) to a letter category.

    Args:
        score: Single PEF score in mPt.
        type_production: Farm production type for adapted thresholds.
                         If None, uses default thresholds.

    Returns:
        Letter category: 'A', 'B', 'C', 'D', or 'E'.
    """
    if score < 0:
        score = 0.0

    thresholds = DEFAULT_THRESHOLDS
    if type_production and type_production in PRODUCTION_THRESHOLDS:
        thresholds = PRODUCTION_THRESHOLDS[type_production]

    if score <= thresholds["A"]:
        return "A"
    elif score <= thresholds["B"]:
        return "B"
    elif score <= thresholds["C"]:
        return "C"
    elif score <= thresholds["D"]:
        return "D"
    else:
        return "E"


def get_category_info(category: str) -> dict:
    """Get label and color for a category letter.

    Args:
        category: Letter category ('A' through 'E').

    Returns:
        Dict with 'label' and 'color' keys.
    """
    return {
        "label": CATEGORY_LABELS.get(category, "Inconnu"),
        "color": CATEGORY_COLORS.get(category, "#9E9E9E"),
    }


def get_thresholds_for_type(type_production: str | None) -> dict:
    """Get the score thresholds for a given production type.

    Args:
        type_production: Production type string.

    Returns:
        Dict of {category_letter: threshold_mPt}.
    """
    if type_production and type_production in PRODUCTION_THRESHOLDS:
        return dict(PRODUCTION_THRESHOLDS[type_production])
    return dict(DEFAULT_THRESHOLDS)
