"""FieldScore backend application configuration.

Uses pydantic-settings for environment-aware configuration loading.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "EcoCert FieldScore API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = ["*"]

    # Database (PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://fieldscore:fieldscore@localhost:5432/fieldscore"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://fieldscore:fieldscore@localhost:5432/fieldscore"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Agribalyse
    AGRIBALYSE_CSV_PATH: str = "data/agribalyse/v3.2/synthese.csv"
    AGRIBALYSE_VERSION: str = "3.2"

    # Ecobalyse API (external, fallback)
    ECOBALYSE_API_URL: str = "https://ecobalyse.beta.gouv.fr/api"
    ECOBALYSE_TIMEOUT: int = 10
    ECOBALYSE_ENABLED: bool = True

    # Mapping
    MAPPING_CSV_PATH: str = "data/mapping/mapping_v1.0.csv"
    IAE_COEFFICIENTS_PATH: str = "data/iae/coefficients.json"

    # Calculator
    METHOD_VERSION: str = "1.0"
    MAX_PREVIEW_PARCELLES: int = 100

    # RPG
    RPG_API_URL: str = "https://data.agriculture.gouv.fr/api/explore/v2.1"
    RPG_TIMEOUT: int = 30

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
