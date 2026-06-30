"""Main environmental impact calculator engine.

Orchestrates the full calculation pipeline:
1. For each parcelle: get Agribalyse impact per kg × surface × yield
2. Aggregate impacts across all parcelles
3. Normalize to PEF single score
4. Apply IAE modulation
5. Categorize result
6. Return full breakdown
"""

import logging
from typing import Optional

from app.core.agribalyse import (
    get_agribalyse_provider, AgribalyseProvider,
    PEF_INDICATORS, get_indicator_name, get_indicator_unit,
)
from app.core.normalizer import (
    normalize_impacts, compute_single_score,
    get_weight, get_all_indicators,
)
from app.core.scorer import categorize_score, get_category_info
from app.core.ecobalyse_client import get_ecobalyse_client, EcobalyseClient
from app.core.iae_modulator import get_iae_modulator, IAEModulator

logger = logging.getLogger(__name__)


class ImpactCalculator:
    """Calculates environmental impact scores for farms.

    Manages the full pipeline: data sourcing → impact computation →
    normalization → IAE modulation → scoring.

    Usage:
        calc = ImpactCalculator()
        result = await calc.calculate(parcelles, iae_entries, type_production)
    """

    def __init__(self):
        self._agribalyse: Optional[AgribalyseProvider] = None
        self._ecobalyse: Optional[EcobalyseClient] = None
        self._iae_modulator: Optional[IAEModulator] = None
        self._mapping: dict[str, dict] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Load all data providers and mapping tables."""
        if self._initialized:
            return

        self._agribalyse = await get_agribalyse_provider()
        self._ecobalyse = await get_ecobalyse_client()
        self._iae_modulator = await get_iae_modulator()

        # Load culture mapping
        self._mapping = await self._load_mapping()

        self._initialized = True
        logger.info("ImpactCalculator initialized")

    async def _load_mapping(self) -> dict[str, dict]:
        """Load PAC culture → Agribalyse mapping from CSV."""
        import csv
        from pathlib import Path
        from app.config import get_settings

        settings = get_settings()
        mapping_path = Path(settings.MAPPING_CSV_PATH)

        result: dict[str, dict] = {}

        # Default inline mapping as fallback
        default_mapping = [
            {"code_culture_pac": "BLE_TENDRE", "code_agb": "20010",
             "rendement_moyen_conv_kg_ha": 7500, "rendement_moyen_bio_kg_ha": 4500,
             "nom_culture": "Blé tendre", "nom_produit_agb": "Blé tendre grain"},
            {"code_culture_pac": "MAIS_GRAIN", "code_agb": "20050",
             "rendement_moyen_conv_kg_ha": 9500, "rendement_moyen_bio_kg_ha": 6500,
             "nom_culture": "Maïs grain", "nom_produit_agb": "Maïs grain"},
            {"code_culture_pac": "ORGE", "code_agb": "20020",
             "rendement_moyen_conv_kg_ha": 6800, "rendement_moyen_bio_kg_ha": 4000,
             "nom_culture": "Orge", "nom_produit_agb": "Orge grain"},
            {"code_culture_pac": "COLZA", "code_agb": "20110",
             "rendement_moyen_conv_kg_ha": 3500, "rendement_moyen_bio_kg_ha": 2200,
             "nom_culture": "Colza", "nom_produit_agb": "Colza grain"},
            {"code_culture_pac": "TOURNESOL", "code_agb": "20120",
             "rendement_moyen_conv_kg_ha": 2500, "rendement_moyen_bio_kg_ha": 1800,
             "nom_culture": "Tournesol", "nom_produit_agb": "Tournesol grain"},
            {"code_culture_pac": "POIS", "code_agb": "20210",
             "rendement_moyen_conv_kg_ha": 4500, "rendement_moyen_bio_kg_ha": 3500,
             "nom_culture": "Pois protéagineux", "nom_produit_agb": "Pois protéagineux"},
            {"code_culture_pac": "FEVE", "code_agb": "20230",
             "rendement_moyen_conv_kg_ha": 4000, "rendement_moyen_bio_kg_ha": 3000,
             "nom_culture": "Féverole", "nom_produit_agb": "Féverole"},
            {"code_culture_pac": "POMME_DE_TERRE", "code_agb": "44000",
             "rendement_moyen_conv_kg_ha": 45000, "rendement_moyen_bio_kg_ha": 25000,
             "nom_culture": "Pomme de terre", "nom_produit_agb": "Pomme de terre"},
            {"code_culture_pac": "BETTERAVE", "code_agb": "26000",
             "rendement_moyen_conv_kg_ha": 85000, "rendement_moyen_bio_kg_ha": 55000,
             "nom_culture": "Betterave sucrière", "nom_produit_agb": "Betterave sucrière"},
            {"code_culture_pac": "PRAIRIE_PERMANENTE", "code_agb": "99999",
             "rendement_moyen_conv_kg_ha": 6500, "rendement_moyen_bio_kg_ha": 6500,
             "nom_culture": "Prairie permanente", "nom_produit_agb": "Prairie permanente"},
            {"code_culture_pac": "PRAIRIE_TEMPORAIRE", "code_agb": "99998",
             "rendement_moyen_conv_kg_ha": 8000, "rendement_moyen_bio_kg_ha": 8000,
             "nom_culture": "Prairie temporaire", "nom_produit_agb": "Prairie temporaire"},
            {"code_culture_pac": "MAIS_ENSILAGE", "code_agb": "21010",
             "rendement_moyen_conv_kg_ha": 45000, "rendement_moyen_bio_kg_ha": 35000,
             "nom_culture": "Maïs ensilage", "nom_produit_agb": "Maïs ensilage"},
            {"code_culture_pac": "VIGNE_CUVE", "code_agb": "53000",
             "rendement_moyen_conv_kg_ha": 8500, "rendement_moyen_bio_kg_ha": 5500,
             "nom_culture": "Vigne cuve", "nom_produit_agb": "Raisin cuve"},
            {"code_culture_pac": "VERGER", "code_agb": "51000",
             "rendement_moyen_conv_kg_ha": 18000, "rendement_moyen_bio_kg_ha": 12000,
             "nom_culture": "Verger", "nom_produit_agb": "Fruits"},
        ]

        if mapping_path.exists():
            try:
                with mapping_path.open("r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        code_pac = row.get("code_culture_pac", "").strip()
                        if code_pac:
                            result[code_pac] = {
                                "code_agb": row.get("code_agb", "").strip(),
                                "rendement_moyen_conv_kg_ha": float(
                                    row.get("rendement_moyen_conv_kg_ha", 0)
                                ),
                                "rendement_moyen_bio_kg_ha": float(
                                    row.get("rendement_moyen_bio_kg_ha", 0)
                                ),
                                "nom_culture": row.get("nom_culture", code_pac).strip(),
                                "nom_produit_agb": row.get("nom_produit_agb", "").strip(),
                            }
                if result:
                    logger.info("Loaded %d mappings from %s", len(result), mapping_path)
                    return result
            except Exception as exc:
                logger.warning("Failed to load mapping CSV: %s", exc)

        # Use default mapping
        for entry in default_mapping:
            result[entry["code_culture_pac"]] = {
                "code_agb": entry["code_agb"],
                "rendement_moyen_conv_kg_ha": entry["rendement_moyen_conv_kg_ha"],
                "rendement_moyen_bio_kg_ha": entry["rendement_moyen_bio_kg_ha"],
                "nom_culture": entry["nom_culture"],
                "nom_produit_agb": entry["nom_produit_agb"],
            }

        logger.info("Using %d default culture mappings", len(result))
        return result

    def _resolve_code_agb(self, code_culture: str) -> tuple[str, str, str]:
        """Resolve a PAC culture code to Agribalyse code and names.

        Args:
            code_culture: PAC culture code (e.g., 'BLE_TENDRE').

        Returns:
            Tuple of (code_agb, nom_culture, nom_produit_agb).
            Falls back to treating code_culture as code_agb if no mapping found.
        """
        if code_culture in self._mapping:
            m = self._mapping[code_culture]
            return m["code_agb"], m.get("nom_culture", code_culture), m.get("nom_produit_agb", "")
        # Unknown — use the code itself as AGB code
        logger.warning("No mapping for culture '%s', using as-is", code_culture)
        return code_culture, code_culture, ""

    def _get_yield(
        self, code_culture: str, est_bio: bool, rendement_reel: Optional[float] = None
    ) -> float:
        """Determine yield (kg/ha) for a culture.

        Priority:
        1. rendement_reel if provided (field-level data)
        2. Mapping's average yield for the production mode
        3. Default 5000 if no mapping found

        Args:
            code_culture: PAC culture code.
            est_bio: Organic mode.
            rendement_reel: Actual field yield in kg/ha.

        Returns:
            Yield in kg/ha.
        """
        if rendement_reel is not None and rendement_reel > 0:
            return rendement_reel

        if code_culture in self._mapping:
            m = self._mapping[code_culture]
            if est_bio:
                return m.get("rendement_moyen_bio_kg_ha", 0) or m.get("rendement_moyen_conv_kg_ha", 5000)
            return m.get("rendement_moyen_conv_kg_ha", 5000)

        return 5000.0  # Default fallback yield

    async def calculate(
        self,
        parcelles: list[dict],
        iae_entries: Optional[list[dict]] = None,
        type_production: Optional[str] = None,
        forcer_ecobalyse: bool = False,
        inclure_iae: bool = True,
    ) -> dict:
        """Run the full environmental impact calculation.

        Args:
            parcelles: List of parcelle dicts with keys:
                       code_culture, surface_ha, est_bio, rendement_reel_kg_ha
            iae_entries: Optional list of IAE dicts for modulation.
            type_production: Farm production type for scoring thresholds.
            forcer_ecobalyse: If True, try Ecobalyse API first.
            inclure_iae: If True, apply IAE modulation.

        Returns:
            Complete result dict with score, category, impacts, details.
        """
        await self.initialize()

        impacts_absolus: dict[str, float] = {ind: 0.0 for ind in PEF_INDICATORS}
        surface_totale: float = 0.0
        contributions: list[dict] = []
        avertissements: list[str] = []
        source_donnees: str = "AGRIBALYSE"
        niveau_confiance: float = 0.7

        for parcelle in parcelles:
            code_culture = parcelle.get("code_culture", "")
            surface_ha = float(parcelle.get("surface_ha", 0))
            est_bio = bool(parcelle.get("est_bio", False))
            rendement_reel = parcelle.get("rendement_reel_kg_ha")

            if not code_culture or surface_ha <= 0:
                avertissements.append(
                    f"Parcelle ignorée: code={code_culture}, surface={surface_ha}"
                )
                continue

            surface_totale += surface_ha

            # Resolve Agribalyse code
            code_agb, nom_culture, nom_produit = self._resolve_code_agb(code_culture)

            # Get yield
            rendement = self._get_yield(code_culture, est_bio, rendement_reel)
            if rendement <= 0:
                avertissements.append(
                    f"Rendement nul pour {code_culture}, parcelle ignorée"
                )
                continue

            production_totale = surface_ha * rendement

            # Get impacts per kg
            impacts_kg: Optional[dict[str, float]] = None

            # Try Ecobalyse if forced
            if forcer_ecobalyse and self._ecobalyse:
                impacts_kg = await self._ecobalyse.get_product_impact(
                    code_agb, est_bio
                )
                if impacts_kg:
                    source_donnees = "ECOBALYSE"
                    niveau_confiance = min(niveau_confiance, 0.85)

            # Fallback to Agribalyse
            if impacts_kg is None:
                impacts_kg = self._agribalyse.get_impacts(code_agb, est_bio)

            # Parcelle contribution
            parcelle_impacts: dict[str, float] = {}
            for indicator in PEF_INDICATORS:
                impact_absolu = impacts_kg.get(indicator, 0.0) * production_totale
                impacts_absolus[indicator] = impacts_absolus.get(indicator, 0.0) + impact_absolu
                parcelle_impacts[indicator] = impact_absolu

            contributions.append({
                "code_culture": code_culture,
                "culture_nom": nom_culture,
                "code_agb": code_agb,
                "nom_produit_agb": nom_produit,
                "surface_ha": surface_ha,
                "rendement_kg_ha": rendement,
                "est_bio": est_bio,
                "production_totale_kg": production_totale,
                "impacts_absolus": parcelle_impacts,
            })

        if surface_totale <= 0:
            return {
                "score_unique": 0.0,
                "categorie": "?",
                "impacts_detailles": [],
                "contributions_cultures": [],
                "modulation_iae": None,
                "surface_totale_ha": 0.0,
                "nb_parcelles": 0,
                "source_donnees": source_donnees,
                "methode_version": "1.0",
                "niveau_confiance": 0.0,
                "avertissements": ["Aucune parcelle valide pour le calcul"],
            }

        # Apply IAE modulation on absolute impacts
        modulation_factors: Optional[dict[str, float]] = None
        if inclure_iae and iae_entries and self._iae_modulator:
            impacts_absolus, modulation_factors = self._iae_modulator.apply_modulation(
                impacts_absolus, iae_entries, surface_totale
            )

        # Normalize impacts to mPt
        normalized_scores = normalize_impacts(impacts_absolus)

        # Compute single score
        score_unique = compute_single_score(normalized_scores)

        # Categorize
        categorie = categorize_score(score_unique, type_production)

        # Compute contribution per culture (normalized)
        for contrib in contributions:
            parcelle_norm = normalize_impacts(contrib["impacts_absolus"])
            contrib["contribution_score"] = compute_single_score(parcelle_norm)
            # Add normalized impacts for display
            contrib["impacts_normalises"] = parcelle_norm

        # Build detailed impacts list
        impacts_detailles = []
        for indicator in PEF_INDICATORS:
            impacts_detailles.append({
                "indicateur": indicator,
                "nom": get_indicator_name(indicator),
                "valeur": round(impacts_absolus.get(indicator, 0.0), 6),
                "unite": get_indicator_unit(indicator),
                "poids": round(get_weight(indicator), 4),
                "contribution_score": round(normalized_scores.get(indicator, 0.0), 4),
            })

        result = {
            "score_unique": round(score_unique, 2),
            "categorie": categorie,
            "categorie_info": get_category_info(categorie),
            "impacts_detailles": impacts_detailles,
            "contributions_cultures": [
                {
                    "code_culture": c["code_culture"],
                    "culture_nom": c["culture_nom"],
                    "surface_ha": c["surface_ha"],
                    "rendement_kg_ha": c["rendement_kg_ha"],
                    "production_totale_kg": round(c["production_totale_kg"], 2),
                    "est_bio": c["est_bio"],
                    "impacts": c["impacts_normalises"],
                    "contribution_score": round(c["contribution_score"], 2),
                }
                for c in contributions
            ],
            "modulation_iae": modulation_factors,
            "surface_totale_ha": round(surface_totale, 2),
            "nb_parcelles": len(contributions),
            "source_donnees": source_donnees,
            "methode_version": "1.0",
            "niveau_confiance": round(niveau_confiance, 2),
            "avertissements": avertissements,
        }

        return result

    async def preview(
        self,
        parcelles: list[dict],
        iae_entries: Optional[list[dict]] = None,
        type_production: Optional[str] = None,
    ) -> dict:
        """Run a preview calculation (same as calculate, without persistence).

        Args:
            parcelles: List of parcelle dicts.
            iae_entries: Optional IAE entries.
            type_production: Farm production type.

        Returns:
            Same result structure as calculate().
        """
        return await self.calculate(
            parcelles=parcelles,
            iae_entries=iae_entries,
            type_production=type_production,
        )


# Singleton instance
_calculator: Optional[ImpactCalculator] = None


async def get_calculator() -> ImpactCalculator:
    """Get or initialize the singleton calculator."""
    global _calculator
    if _calculator is None:
        _calculator = ImpactCalculator()
        await _calculator.initialize()
    return _calculator
