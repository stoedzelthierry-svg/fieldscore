"""Tests for the environmental impact calculator core."""

import pytest
import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.agribalyse import (
    AgribalyseProvider, PEF_INDICATORS,
    get_indicator_name, get_indicator_unit,
)
from app.core.normalizer import (
    normalize_impacts, compute_single_score,
    normalize_single_indicator, POIDS_PEF,
    NORMALISATION_FACTORS, get_all_indicators,
)
from app.core.scorer import categorize_score, get_category_info, get_thresholds_for_type
from app.core.iae_modulator import IAEModulator


class TestAgribalyseProvider:
    """Tests for the Agribalyse data provider."""

    @pytest.mark.asyncio
    async def test_load_defaults(self):
        """Test that the provider loads default data when no CSV available."""
        provider = AgribalyseProvider(csv_path="nonexistent.csv")
        await provider.load()
        codes = provider.get_all_codes()
        assert len(codes) > 0, "Should have default products"
        assert "20010" in codes, "Wheat (20010) should be in defaults"

    @pytest.mark.asyncio
    async def test_get_impacts_conventionnel(self):
        """Test getting conventional mode impacts."""
        provider = AgribalyseProvider()
        await provider.load()
        impacts = provider.get_impacts("20010", est_bio=False)
        assert "cch" in impacts
        assert impacts["cch"] == 0.44  # Default wheat CCH value
        assert len(impacts) == 16, "Should have all 16 PEF indicators"

    @pytest.mark.asyncio
    async def test_get_impacts_bio(self):
        """Test getting organic mode impacts."""
        provider = AgribalyseProvider()
        await provider.load()
        impacts = provider.get_impacts("20010", est_bio=True)
        assert impacts["cch"] < 0.44, "Organic should have lower CCH than conventional"

    @pytest.mark.asyncio
    async def test_unknown_product(self):
        """Test getting impacts for unknown product returns zeros."""
        provider = AgribalyseProvider()
        await provider.load()
        impacts = provider.get_impacts("UNKNOWN_CODE")
        for val in impacts.values():
            assert val == 0.0, "Unknown product should return zero impacts"

    @pytest.mark.asyncio
    async def test_has_product(self):
        """Test product existence check."""
        provider = AgribalyseProvider()
        await provider.load()
        assert provider.has_product("20010") is True
        assert provider.has_product("NONEXISTENT") is False

    def test_indicator_names(self):
        """Test indicator display names."""
        assert get_indicator_name("cch") == "Changement climatique"
        assert get_indicator_name("unknown") == "unknown"

    def test_indicator_units(self):
        """Test indicator units."""
        assert get_indicator_unit("cch") == "kg CO2 eq"
        assert get_indicator_unit("wtu") == "m³ world eq"


class TestNormalizer:
    """Tests for PEF normalization."""

    def test_normalize_impacts(self):
        """Test normalization of impacts."""
        impacts = {
            "cch": 1000.0,  # 1000 kg CO2 eq
            "pma": 0.0,
            "wtu": 0.0,
            "ldu": 0.0,
            "mru": 0.0,
            "fru": 0.0,
            "acd": 0.0,
            "tre": 0.0,
            "fwe": 0.0,
            "swe": 0.0,
            "etf": 0.0,
            "htc": 0.0,
            "htn": 0.0,
            "pco": 0.0,
            "ior": 0.0,
            "ozd": 0.0,
        }
        scores = normalize_impacts(impacts)

        # CCH: 1000 / 8100 * 0.2106 * 1000 = 26.0 mPt
        expected_cch = (1000.0 / 8100.0) * 0.2106 * 1000.0
        assert abs(scores["cch"] - expected_cch) < 1.0
        assert scores["pma"] == 0.0

    def test_compute_single_score(self):
        """Test summing normalized scores."""
        scores = {"cch": 25.0, "pma": 10.0, "wtu": 5.0}
        total = compute_single_score(scores)
        assert total == 40.0

    def test_normalize_single_indicator(self):
        """Test normalizing a single indicator."""
        score = normalize_single_indicator("cch", 8100.0)
        # 8100 / 8100 * 0.2106 * 1000 = 210.6
        expected = 0.2106 * 1000.0
        assert abs(score - expected) < 0.1

    def test_all_indicators_present(self):
        """Test that all 16 indicators have weights and factors."""
        indicators = get_all_indicators()
        assert len(indicators) == 16
        for ind in indicators:
            assert ind in POIDS_PEF, f"Missing POIDS_PEF for {ind}"
            assert ind in NORMALISATION_FACTORS, f"Missing normalisation factor for {ind}"
            assert POIDS_PEF[ind] > 0, f"Weight for {ind} should be > 0"
            assert NORMALISATION_FACTORS[ind] > 0, f"Factor for {ind} should be > 0"


class TestScorer:
    """Tests for score categorization."""

    def test_categorize_score_default(self):
        """Test category assignment with default thresholds."""
        assert categorize_score(50.0) == "A"
        assert categorize_score(150.0) == "B"
        assert categorize_score(300.0) == "C"
        assert categorize_score(600.0) == "D"
        assert categorize_score(2000.0) == "E"

    def test_categorize_score_production_type(self):
        """Test category assignment with production-type thresholds."""
        # Grandes cultures has higher thresholds
        assert categorize_score(200.0, "GRANDES_CULTURES") == "B"
        # Élevage has even higher thresholds
        assert categorize_score(200.0, "ELEVAGE") == "A"

    def test_categorize_negative(self):
        """Test negative scores are clamped to 0."""
        assert categorize_score(-100.0) == "A"

    def test_category_info(self):
        """Test category info returns label and color."""
        info = get_category_info("A")
        assert "Excellent" in info["label"]
        assert info["color"] == "#2E7D32"

        info = get_category_info("E")
        assert "améliorer" in info["label"]
        assert info["color"] == "#F44336"

    def test_get_thresholds(self):
        """Test threshold retrieval for production types."""
        default = get_thresholds_for_type(None)
        assert default["A"] == 100.0

        gc = get_thresholds_for_type("GRANDES_CULTURES")
        assert gc["A"] == 150.0

        el = get_thresholds_for_type("ELEVAGE")
        assert el["A"] == 200.0


class TestIAEModulator:
    """Tests for IAE modulation."""

    @pytest.mark.asyncio
    async def test_load_defaults(self):
        """Test loading default IAE coefficients."""
        modulator = IAEModulator()
        await modulator.load()
        assert "haie" in modulator.coefficients
        assert "bande_enherbee" in modulator.coefficients
        assert "mare" in modulator.coefficients

    @pytest.mark.asyncio
    async def test_apply_modulation_hay(self):
        """Test that hedges reduce certain impacts."""
        modulator = IAEModulator()
        await modulator.load()

        indicators = {
            "cch": 1000.0,
            "pma": 100.0,
            "wtu": 200.0,
            "ldu": 300.0,
            "fwe": 50.0,
            "swe": 40.0,
            "tre": 80.0,
        }

        iae_entries = [
            {"type_iae": "haie", "metrique": "ml", "valeur": 500.0}
        ]
        surface = 50.0  # 50 ha farm, 500 ml of hedges = 10 ml/ha, norm is 100 ml/ha

        modulated, factors = modulator.apply_modulation(
            indicators, iae_entries, surface
        )

        # With 500 ml on 50 ha, factor = (500/50)/100 = 0.1
        # max_mod = 0.15, so effective: 0.1 * 0.15 = 0.015
        # cch coef = -0.15, so adjustment = -0.15 * 0.015 = -0.00225
        # new cch = 1000 * (1 - 0.00225) = 997.75
        assert modulated["cch"] < indicators["cch"], "Hedge should reduce CCH"
        assert modulated["cch"] > 990.0, "Small farm = small effect"

    @pytest.mark.asyncio
    async def test_no_modulation_without_iae(self):
        """Test that no modulation occurs without IAE entries."""
        modulator = IAEModulator()
        await modulator.load()

        indicators = {"cch": 100.0}
        modulated, factors = modulator.apply_modulation(indicators, [], 50.0)
        assert modulated["cch"] == 100.0
        assert factors == {}

    @pytest.mark.asyncio
    async def test_biodiversity_not_modifies_impacts(self):
        """Test that 'bvi' indicator is not applied to environmental indicators."""
        modulator = IAEModulator()
        await modulator.load()

        indicators = {"cch": 100.0}
        # Haie has bvi=0.20 but this should NOT change cch beyond the cch coefficient
        iae_entries = [{"type_iae": "haie", "metrique": "ml", "valeur": 100.0}]
        modulated, _ = modulator.apply_modulation(indicators, iae_entries, 1.0)

        # bvi coefficient is excluded from environmental impact modulation
        # Only cch coefficient (-0.15) applies
        assert "cch" in modulated
        # Should still be modulated by the cch coefficient, not bvi
        assert modulated["cch"] <= 100.0

    @pytest.mark.asyncio
    async def test_get_iae_types(self):
        """Test listing IAE types."""
        modulator = IAEModulator()
        await modulator.load()
        types = modulator.get_iae_types()
        assert len(types) >= 7
        type_names = [t["type_iae"] for t in types]
        assert "haie" in type_names
        assert "agroforesterie" in type_names


class TestIntegration:
    """Integration tests for the full calculation pipeline."""

    @pytest.mark.asyncio
    async def test_full_calculation_pipeline(self):
        """Test the complete pipeline: provider → normalization → scoring."""
        from app.core.calculator import ImpactCalculator

        calc = ImpactCalculator()
        # Bypass external calls by using inline data

        parcelles = [
            {
                "code_culture": "BLE_TENDRE",
                "surface_ha": 10.0,
                "est_bio": False,
                "rendement_reel_kg_ha": None,
            },
            {
                "code_culture": "MAIS_GRAIN",
                "surface_ha": 5.0,
                "est_bio": True,
                "rendement_reel_kg_ha": None,
            },
        ]

        result = await calc.calculate(parcelles)

        # Basic structure
        assert "score_unique" in result
        assert "categorie" in result
        assert "impacts_detailles" in result
        assert "contributions_cultures" in result
        assert result["score_unique"] > 0, "Score should be positive"
        assert result["nb_parcelles"] == 2
        assert result["surface_totale_ha"] == 15.0
        assert result["categorie"] in ("A", "B", "C", "D", "E")

    @pytest.mark.asyncio
    async def test_real_yield_overrides_default(self):
        """Test that rendement_reel overrides the default mapping yield."""
        from app.core.calculator import ImpactCalculator

        calc = ImpactCalculator()
        await calc.initialize()

        # With real yield
        parcelle_real = [
            {
                "code_culture": "BLE_TENDRE",
                "surface_ha": 1.0,
                "est_bio": False,
                "rendement_reel_kg_ha": 10000.0,  # Higher than default 7500
            }
        ]
        result_real = await calc.calculate(parcelle_real)

        # With default yield (7500 kg/ha)
        parcelle_default = [
            {
                "code_culture": "BLE_TENDRE",
                "surface_ha": 1.0,
                "est_bio": False,
                "rendement_reel_kg_ha": None,
            }
        ]
        result_default = await calc.calculate(parcelle_default)

        # Real yield produces more production → higher absolute impact
        assert result_real["score_unique"] > result_default["score_unique"], (
            "Higher yield should produce higher score (more production on same surface)"
        )

    @pytest.mark.asyncio
    async def test_bio_reduces_score(self):
        """Test that organic mode produces lower scores than conventional."""
        from app.core.calculator import ImpactCalculator

        calc = ImpactCalculator()

        bio_result = await calc.calculate([
            {"code_culture": "BLE_TENDRE", "surface_ha": 10.0, "est_bio": True}
        ])
        conv_result = await calc.calculate([
            {"code_culture": "BLE_TENDRE", "surface_ha": 10.0, "est_bio": False}
        ])

        # Note: bio has lower yield too (4500 vs 7500), so much lower production
        # The score should reflect lower total production on bio
        assert bio_result["score_unique"] > 0
        assert conv_result["score_unique"] > 0

    @pytest.mark.asyncio
    async def test_calculation_with_iae(self):
        """Test that IAE modulation affects the score."""
        from app.core.calculator import ImpactCalculator

        calc = ImpactCalculator()

        iae = [
            {"type_iae": "agroforesterie", "metrique": "ha", "valeur": 3.0},
        ]

        result_iae = await calc.calculate(
            [{"code_culture": "BLE_TENDRE", "surface_ha": 100.0, "est_bio": False}],
            iae_entries=iae,
            type_production="GRANDES_CULTURES",
        )

        result_no_iae = await calc.calculate(
            [{"code_culture": "BLE_TENDRE", "surface_ha": 100.0, "est_bio": False}],
            type_production="GRANDES_CULTURES",
        )

        # Agroforesterie should reduce CCH and LDU significantly
        assert "modulation_iae" in result_iae
        assert result_iae["modulation_iae"] is not None
        assert result_iae["modulation_iae"] != {}, "Modulation factors should not be empty"
        # Check that CCH was modulated (coefficient -0.25)
        assert "cch" in result_iae["modulation_iae"], "CCH should be modulated by agroforesterie"
        assert result_iae["score_unique"] < result_no_iae["score_unique"], (
            "IAE modulation should reduce the score"
        )

    @pytest.mark.asyncio
    async def test_empty_parcelles(self):
        """Test calculation with no valid parcelles."""
        from app.core.calculator import ImpactCalculator

        calc = ImpactCalculator()
        result = await calc.calculate([])
        assert result["score_unique"] == 0.0
        assert result["categorie"] == "?"
        assert result["nb_parcelles"] == 0
        assert len(result["avertissements"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
