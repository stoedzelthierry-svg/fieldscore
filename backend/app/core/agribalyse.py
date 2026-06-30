"""Agribalyse 3.2 data provider.

Parses the synthesis CSV file and indexes it by product code × production mode
(conventional/organic). Provides the 16 PEF indicators per kg of product.

Falls back to embedded default data if the CSV file is not available.
"""

import csv
import logging
from pathlib import Path
from typing import Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

# 16 PEF indicators as present in Agribalyse 3.2 Synthese CSV
PEF_INDICATORS = [
    "cch",  # Changement climatique - kg CO2 eq
    "pma",  # Particules fines - disease inc.
    "wtu",  # Water use - m³ world eq
    "ldu",  # Land use - Pt
    "mru",  # Resource use, minerals and metals - kg Sb eq
    "fru",  # Resource use, fossils - MJ
    "acd",  # Acidification - mol H+ eq
    "tre",  # Eutrophication, terrestrial - mol N eq
    "fwe",  # Eutrophication, freshwater - kg P eq
    "swe",  # Eutrophication, marine - kg N eq
    "etf",  # Ecotoxicity, freshwater - CTUe
    "htc",  # Human toxicity, cancer - CTUh
    "htn",  # Human toxicity, non-cancer - CTUh
    "pco",  # Photochemical ozone formation - kg NMVOC eq
    "ior",  # Ionising radiation - kBq U-235 eq
    "ozd",  # Ozone depletion - kg CFC11 eq
]

# Default embedded data for key products when CSV is unavailable
# Values per kg of product (conventional)
DEFAULT_IMPACTS: dict[str, dict[str, dict[str, float]]] = {
    "20010": {  # Blé tendre grain conventionnel
        "conventionnel": {
            "cch": 0.44, "pma": 1.5e-7, "wtu": 0.8, "ldu": 12.0,
            "mru": 2.5e-5, "fru": 3.2, "acd": 0.005, "tre": 0.015,
            "fwe": 5.0e-4, "swe": 0.004, "etf": 2.0, "htc": 1.0e-8,
            "htn": 2.0e-7, "pco": 0.001, "ior": 0.03, "ozd": 2.0e-8,
        },
        "biologique": {
            "cch": 0.38, "pma": 1.3e-7, "wtu": 0.7, "ldu": 11.0,
            "mru": 2.0e-5, "fru": 2.8, "acd": 0.004, "tre": 0.013,
            "fwe": 4.0e-4, "swe": 0.003, "etf": 1.5, "htc": 0.8e-8,
            "htn": 1.5e-7, "pco": 0.0008, "ior": 0.025, "ozd": 1.5e-8,
        },
    },
    "20050": {  # Maïs grain conventionnel
        "conventionnel": {
            "cch": 0.50, "pma": 1.8e-7, "wtu": 1.2, "ldu": 14.0,
            "mru": 3.0e-5, "fru": 4.0, "acd": 0.006, "tre": 0.018,
            "fwe": 6.0e-4, "swe": 0.005, "etf": 2.5, "htc": 1.2e-8,
            "htn": 2.5e-7, "pco": 0.0012, "ior": 0.035, "ozd": 2.5e-8,
        },
        "biologique": {
            "cch": 0.42, "pma": 1.5e-7, "wtu": 1.0, "ldu": 12.0,
            "mru": 2.5e-5, "fru": 3.2, "acd": 0.005, "tre": 0.015,
            "fwe": 5.0e-4, "swe": 0.004, "etf": 2.0, "htc": 1.0e-8,
            "htn": 2.0e-7, "pco": 0.001, "ior": 0.03, "ozd": 2.0e-8,
        },
    },
    "20020": {  # Orge grain conventionnel
        "conventionnel": {
            "cch": 0.40, "pma": 1.4e-7, "wtu": 0.7, "ldu": 11.0,
            "mru": 2.2e-5, "fru": 3.0, "acd": 0.0045, "tre": 0.014,
            "fwe": 4.5e-4, "swe": 0.0035, "etf": 1.8, "htc": 0.9e-8,
            "htn": 1.8e-7, "pco": 0.0009, "ior": 0.028, "ozd": 1.8e-8,
        },
        "biologique": {
            "cch": 0.34, "pma": 1.2e-7, "wtu": 0.6, "ldu": 10.0,
            "mru": 1.8e-5, "fru": 2.5, "acd": 0.0035, "tre": 0.012,
            "fwe": 3.5e-4, "swe": 0.0028, "etf": 1.4, "htc": 0.7e-8,
            "htn": 1.4e-7, "pco": 0.0007, "ior": 0.022, "ozd": 1.4e-8,
        },
    },
    "20110": {  # Colza grain conventionnel
        "conventionnel": {
            "cch": 0.70, "pma": 2.5e-7, "wtu": 1.5, "ldu": 18.0,
            "mru": 4.0e-5, "fru": 5.5, "acd": 0.008, "tre": 0.025,
            "fwe": 8.0e-4, "swe": 0.007, "etf": 3.5, "htc": 1.8e-8,
            "htn": 3.5e-7, "pco": 0.0018, "ior": 0.05, "ozd": 3.5e-8,
        },
        "biologique": {
            "cch": 0.58, "pma": 2.0e-7, "wtu": 1.2, "ldu": 15.0,
            "mru": 3.2e-5, "fru": 4.5, "acd": 0.0065, "tre": 0.020,
            "fwe": 6.5e-4, "swe": 0.0055, "etf": 2.8, "htc": 1.4e-8,
            "htn": 2.8e-7, "pco": 0.0014, "ior": 0.04, "ozd": 2.8e-8,
        },
    },
    "20120": {  # Tournesol grain conventionnel
        "conventionnel": {
            "cch": 0.55, "pma": 2.0e-7, "wtu": 1.3, "ldu": 15.0,
            "mru": 3.5e-5, "fru": 4.5, "acd": 0.0065, "tre": 0.020,
            "fwe": 7.0e-4, "swe": 0.006, "etf": 3.0, "htc": 1.5e-8,
            "htn": 3.0e-7, "pco": 0.0015, "ior": 0.042, "ozd": 3.0e-8,
        },
        "biologique": {
            "cch": 0.45, "pma": 1.6e-7, "wtu": 1.0, "ldu": 12.0,
            "mru": 2.8e-5, "fru": 3.6, "acd": 0.0052, "tre": 0.016,
            "fwe": 5.6e-4, "swe": 0.0048, "etf": 2.4, "htc": 1.2e-8,
            "htn": 2.4e-7, "pco": 0.0012, "ior": 0.034, "ozd": 2.4e-8,
        },
    },
    "20210": {  # Pois protéagineux conventionnel
        "conventionnel": {
            "cch": 0.25, "pma": 1.0e-7, "wtu": 0.5, "ldu": 8.0,
            "mru": 1.5e-5, "fru": 2.2, "acd": 0.003, "tre": 0.010,
            "fwe": 3.5e-4, "swe": 0.0028, "etf": 1.2, "htc": 0.6e-8,
            "htn": 1.2e-7, "pco": 0.0006, "ior": 0.02, "ozd": 1.2e-8,
        },
        "biologique": {
            "cch": 0.20, "pma": 0.8e-7, "wtu": 0.4, "ldu": 7.0,
            "mru": 1.2e-5, "fru": 1.8, "acd": 0.0025, "tre": 0.008,
            "fwe": 3.0e-4, "swe": 0.0022, "etf": 1.0, "htc": 0.5e-8,
            "htn": 1.0e-7, "pco": 0.0005, "ior": 0.016, "ozd": 1.0e-8,
        },
    },
    "20230": {  # Féverole conventionnel
        "conventionnel": {
            "cch": 0.28, "pma": 1.1e-7, "wtu": 0.55, "ldu": 8.5,
            "mru": 1.6e-5, "fru": 2.4, "acd": 0.0032, "tre": 0.011,
            "fwe": 3.8e-4, "swe": 0.003, "etf": 1.3, "htc": 0.65e-8,
            "htn": 1.3e-7, "pco": 0.00065, "ior": 0.022, "ozd": 1.3e-8,
        },
        "biologique": {
            "cch": 0.22, "pma": 0.9e-7, "wtu": 0.45, "ldu": 7.5,
            "mru": 1.3e-5, "fru": 2.0, "acd": 0.0027, "tre": 0.009,
            "fwe": 3.2e-4, "swe": 0.0024, "etf": 1.1, "htc": 0.55e-8,
            "htn": 1.1e-7, "pco": 0.00055, "ior": 0.018, "ozd": 1.1e-8,
        },
    },
    "44000": {  # Pomme de terre conventionnelle
        "conventionnel": {
            "cch": 0.18, "pma": 8.0e-8, "wtu": 0.3, "ldu": 6.0,
            "mru": 1.0e-5, "fru": 1.8, "acd": 0.0025, "tre": 0.008,
            "fwe": 3.0e-4, "swe": 0.0022, "etf": 1.0, "htc": 0.5e-8,
            "htn": 1.0e-7, "pco": 0.0005, "ior": 0.015, "ozd": 1.0e-8,
        },
        "biologique": {
            "cch": 0.14, "pma": 6.0e-8, "wtu": 0.25, "ldu": 5.0,
            "mru": 0.8e-5, "fru": 1.4, "acd": 0.002, "tre": 0.006,
            "fwe": 2.5e-4, "swe": 0.0018, "etf": 0.8, "htc": 0.4e-8,
            "htn": 0.8e-7, "pco": 0.0004, "ior": 0.012, "ozd": 0.8e-8,
        },
    },
    "26000": {  # Betterave sucrière conventionnelle
        "conventionnel": {
            "cch": 0.08, "pma": 4.0e-8, "wtu": 0.15, "ldu": 3.0,
            "mru": 0.5e-5, "fru": 0.9, "acd": 0.0012, "tre": 0.004,
            "fwe": 1.5e-4, "swe": 0.0011, "etf": 0.5, "htc": 0.25e-8,
            "htn": 0.5e-7, "pco": 0.00025, "ior": 0.008, "ozd": 0.5e-8,
        },
        "biologique": {
            "cch": 0.06, "pma": 3.0e-8, "wtu": 0.12, "ldu": 2.5,
            "mru": 0.4e-5, "fru": 0.7, "acd": 0.001, "tre": 0.003,
            "fwe": 1.2e-4, "swe": 0.0009, "etf": 0.4, "htc": 0.2e-8,
            "htn": 0.4e-7, "pco": 0.0002, "ior": 0.006, "ozd": 0.4e-8,
        },
    },
    "53000": {  # Raisin cuve conventionnel
        "conventionnel": {
            "cch": 0.35, "pma": 1.3e-7, "wtu": 0.9, "ldu": 10.0,
            "mru": 2.8e-5, "fru": 3.5, "acd": 0.0055, "tre": 0.016,
            "fwe": 5.5e-4, "swe": 0.0045, "etf": 2.2, "htc": 1.1e-8,
            "htn": 2.2e-7, "pco": 0.0011, "ior": 0.032, "ozd": 2.2e-8,
        },
        "biologique": {
            "cch": 0.28, "pma": 1.0e-7, "wtu": 0.7, "ldu": 8.0,
            "mru": 2.2e-5, "fru": 2.8, "acd": 0.0044, "tre": 0.013,
            "fwe": 4.4e-4, "swe": 0.0036, "etf": 1.8, "htc": 0.9e-8,
            "htn": 1.8e-7, "pco": 0.0009, "ior": 0.026, "ozd": 1.8e-8,
        },
    },
    "51000": {  # Fruits conventionnel (verger)
        "conventionnel": {
            "cch": 0.30, "pma": 1.2e-7, "wtu": 0.8, "ldu": 9.0,
            "mru": 2.5e-5, "fru": 3.0, "acd": 0.005, "tre": 0.014,
            "fwe": 5.0e-4, "swe": 0.004, "etf": 2.0, "htc": 1.0e-8,
            "htn": 2.0e-7, "pco": 0.001, "ior": 0.03, "ozd": 2.0e-8,
        },
        "biologique": {
            "cch": 0.24, "pma": 0.9e-7, "wtu": 0.6, "ldu": 7.0,
            "mru": 2.0e-5, "fru": 2.4, "acd": 0.004, "tre": 0.011,
            "fwe": 4.0e-4, "swe": 0.0032, "etf": 1.6, "htc": 0.8e-8,
            "htn": 1.6e-7, "pco": 0.0008, "ior": 0.024, "ozd": 1.6e-8,
        },
    },
    "21010": {  # Maïs ensilage conventionnel
        "conventionnel": {
            "cch": 0.10, "pma": 5.0e-8, "wtu": 0.2, "ldu": 5.0,
            "mru": 0.8e-5, "fru": 1.2, "acd": 0.002, "tre": 0.006,
            "fwe": 2.0e-4, "swe": 0.0015, "etf": 0.8, "htc": 0.4e-8,
            "htn": 0.8e-7, "pco": 0.0004, "ior": 0.012, "ozd": 0.8e-8,
        },
        "biologique": {
            "cch": 0.08, "pma": 4.0e-8, "wtu": 0.16, "ldu": 4.0,
            "mru": 0.6e-5, "fru": 1.0, "acd": 0.0015, "tre": 0.005,
            "fwe": 1.6e-4, "swe": 0.0012, "etf": 0.6, "htc": 0.3e-8,
            "htn": 0.6e-7, "pco": 0.0003, "ior": 0.009, "ozd": 0.6e-8,
        },
    },
    "99999": {  # Prairie permanente (neutre)
        "conventionnel": {
            "cch": 0.01, "pma": 5.0e-9, "wtu": 0.02, "ldu": 0.5,
            "mru": 1.0e-6, "fru": 0.15, "acd": 0.0002, "tre": 0.0005,
            "fwe": 2.0e-5, "swe": 0.00015, "etf": 0.08, "htc": 0.04e-8,
            "htn": 0.08e-7, "pco": 0.00004, "ior": 0.0012, "ozd": 0.08e-8,
        },
        "biologique": {
            "cch": 0.01, "pma": 5.0e-9, "wtu": 0.02, "ldu": 0.5,
            "mru": 1.0e-6, "fru": 0.15, "acd": 0.0002, "tre": 0.0005,
            "fwe": 2.0e-5, "swe": 0.00015, "etf": 0.08, "htc": 0.04e-8,
            "htn": 0.08e-7, "pco": 0.00004, "ior": 0.0012, "ozd": 0.08e-8,
        },
    },
    "99998": {  # Prairie temporaire
        "conventionnel": {
            "cch": 0.03, "pma": 1.0e-8, "wtu": 0.05, "ldu": 1.0,
            "mru": 2.0e-6, "fru": 0.3, "acd": 0.0004, "tre": 0.001,
            "fwe": 4.0e-5, "swe": 0.0003, "etf": 0.15, "htc": 0.08e-8,
            "htn": 0.15e-7, "pco": 0.00008, "ior": 0.0025, "ozd": 0.15e-8,
        },
        "biologique": {
            "cch": 0.03, "pma": 1.0e-8, "wtu": 0.05, "ldu": 1.0,
            "mru": 2.0e-6, "fru": 0.3, "acd": 0.0004, "tre": 0.001,
            "fwe": 4.0e-5, "swe": 0.0003, "etf": 0.15, "htc": 0.08e-8,
            "htn": 0.15e-7, "pco": 0.00008, "ior": 0.0025, "ozd": 0.15e-8,
        },
    },
}

# Indicator display names
INDICATOR_NAMES = {
    "cch": "Changement climatique",
    "pma": "Particules fines",
    "wtu": "Utilisation de l'eau",
    "ldu": "Utilisation du sol",
    "mru": "Ressources minérales et métaux",
    "fru": "Ressources énergétiques fossiles",
    "acd": "Acidification",
    "tre": "Eutrophisation terrestre",
    "fwe": "Eutrophisation eaux douces",
    "swe": "Eutrophisation marine",
    "etf": "Écotoxicité eaux douces",
    "htc": "Toxicité humaine cancérigène",
    "htn": "Toxicité humaine non-cancérigène",
    "pco": "Formation d'ozone photochimique",
    "ior": "Radiations ionisantes",
    "ozd": "Appauvrissement de la couche d'ozone",
}

# Indicator units
INDICATOR_UNITS = {
    "cch": "kg CO2 eq",
    "pma": "disease inc.",
    "wtu": "m³ world eq",
    "ldu": "Pt",
    "mru": "kg Sb eq",
    "fru": "MJ",
    "acd": "mol H+ eq",
    "tre": "mol N eq",
    "fwe": "kg P eq",
    "swe": "kg N eq",
    "etf": "CTUe",
    "htc": "CTUh",
    "htn": "CTUh",
    "pco": "kg NMVOC eq",
    "ior": "kBq U-235 eq",
    "ozd": "kg CFC11 eq",
}


class AgribalyseProvider:
    """Provides Agribalyse 3.2 impact data per kg of product.

    Loads data from a CSV file or falls back to embedded defaults.
    Indexed by (code_agb, mode) where mode is 'conventionnel' or 'biologique'.
    """

    def __init__(self, csv_path: Optional[str] = None):
        """Initialize the provider.

        Args:
            csv_path: Path to the Agribalyse synthesis CSV. If None or file
                      not found, uses embedded default data.
        """
        self.csv_path = csv_path
        self._impacts: dict[str, dict[str, dict[str, float]]] = {}
        self._loaded = False

    async def load(self) -> None:
        """Load Agribalyse data from CSV or defaults."""
        if self._loaded:
            return

        if self.csv_path:
            csv_file = Path(self.csv_path)
            if csv_file.exists():
                try:
                    self._load_from_csv(csv_file)
                    if self._impacts:
                        self._loaded = True
                        logger.info(
                            "Loaded %d products from Agribalyse CSV", len(self._impacts)
                        )
                        return
                    else:
                        logger.warning(
                            "Agribalyse CSV at %s parsed but contained no data. Using defaults.",
                            csv_file,
                        )
                except Exception as exc:
                    logger.warning(
                        "Failed to parse Agribalyse CSV at %s: %s. Using defaults.",
                        csv_file, exc,
                    )

        # Fallback to embedded defaults
        self._impacts = DEFAULT_IMPACTS
        self._loaded = True
        logger.info(
            "Using embedded Agribalyse data: %d products", len(self._impacts)
        )

    def _load_from_csv(self, csv_file: Path) -> None:
        """Parse the Agribalyse synthesis CSV.

        Expected CSV columns (French):
        Code_AGB, Groupe_produit, Nom_produit, Mode_production,
        Score_unique, cch_kgCO2eq, pma_disease, wtu_m3world, ldu_Pt,
        mru_kgSbeq, fru_MJ, acd_molH+, tre_molN, fwe_kgP,
        swe_kgN, etf_CTUe, htc_CTUh, htn_CTUh, pco_kgNMVOC,
        ior_kBqU235, ozd_kgCFC11
        """
        with csv_file.open("r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter=";")
            # Try comma delimiter as fallback
            first_row = next(reader, None)
            if first_row is None:
                return

            f.seek(0)
            if "," in csv_file.read_text(encoding="utf-8-sig").split("\n")[0]:
                delimiter = ","
            else:
                delimiter = ";"

            f.seek(0)
            reader = csv.DictReader(f, delimiter=delimiter)

            column_map = self._build_column_map(reader.fieldnames or [])

            for row in reader:
                code_agb = row.get(column_map.get("code_agb", "Code_AGB"), "").strip()
                mode = row.get(
                    column_map.get("mode", "Mode_production"), ""
                ).strip().lower()

                if not code_agb:
                    continue

                # Normalize mode
                if "bio" in mode or "biologique" in mode:
                    mode = "biologique"
                else:
                    mode = "conventionnel"

                impacts: dict[str, float] = {}
                for ind in PEF_INDICATORS:
                    col = column_map.get(ind)
                    if col and col in row:
                        try:
                            impacts[ind] = float(row[col])
                        except (ValueError, TypeError):
                            impacts[ind] = 0.0
                    else:
                        impacts[ind] = 0.0

                if code_agb not in self._impacts:
                    self._impacts[code_agb] = {}
                self._impacts[code_agb][mode] = impacts

    @staticmethod
    def _build_column_map(fieldnames: list[str]) -> dict[str, str]:
        """Map standard indicator codes to CSV column names."""
        # Try to find columns that contain indicator codes
        mapping: dict[str, str] = {
            "code_agb": "Code_AGB",
            "mode": "Mode_production",
        }
        for field in fieldnames:
            fl = field.lower()
            for ind in PEF_INDICATORS:
                if ind in fl:
                    mapping[ind] = field
                    break
        return mapping

    def get_impacts(
        self, code_agb: str, est_bio: bool = False
    ) -> dict[str, float]:
        """Get PEF impacts per kg for a product code.

        Args:
            code_agb: Agribalyse product code (e.g., '20010' for wheat).
            est_bio: If True, returns organic mode impacts.

        Returns:
            Dict of {indicator_code: impact_value_per_kg}. Returns zeros
            if the product code is unknown.
        """
        mode = "biologique" if est_bio else "conventionnel"

        if code_agb in self._impacts:
            if mode in self._impacts[code_agb]:
                return dict(self._impacts[code_agb][mode])
            # Fallback to other mode if specific mode unavailable
            other = "conventionnel" if est_bio else "biologique"
            if other in self._impacts[code_agb]:
                logger.warning(
                    "Mode '%s' not found for %s, using '%s'", mode, code_agb, other
                )
                return dict(self._impacts[code_agb][other])

        # Unknown product — return zeros
        logger.warning(
            "Unknown Agribalyse code: %s, returning zero impacts", code_agb
        )
        return {ind: 0.0 for ind in PEF_INDICATORS}

    def has_product(self, code_agb: str) -> bool:
        """Check if a product code is known."""
        return code_agb in self._impacts

    def get_all_codes(self) -> list[str]:
        """Return all known Agribalyse product codes."""
        return list(self._impacts.keys())


# Singleton instance
_provider: Optional[AgribalyseProvider] = None


async def get_agribalyse_provider() -> AgribalyseProvider:
    """Get or initialize the singleton Agribalyse provider."""
    global _provider
    if _provider is None:
        from app.config import get_settings
        settings = get_settings()
        _provider = AgribalyseProvider(csv_path=settings.AGRIBALYSE_CSV_PATH)
        await _provider.load()
    return _provider


def get_indicator_name(code: str) -> str:
    """Get human-readable name for a PEF indicator code."""
    return INDICATOR_NAMES.get(code, code)


def get_indicator_unit(code: str) -> str:
    """Get unit for a PEF indicator."""
    return INDICATOR_UNITS.get(code, "")
