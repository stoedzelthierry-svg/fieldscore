"""MappingCulture model — RPG culture code to Agribalyse product code."""

import uuid
from sqlalchemy import Column, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class MappingCulture(Base):
    """Maps PAC culture codes to Agribalyse product codes.

    Provides default yield values for conventional and organic modes,
    used as fallback when field-level yield data is unavailable.
    """

    __tablename__ = "mapping_cultures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code_culture_pac = Column(
        String(20), nullable=False, unique=True, index=True,
        comment="Code culture PAC (ex: BLE_TENDRE)"
    )
    nom_culture = Column(
        String(255), nullable=False,
        comment="Nom lisible de la culture"
    )
    code_agb = Column(
        String(20), nullable=False, index=True,
        comment="Code produit Agribalyse correspondant"
    )
    nom_produit_agb = Column(
        String(255), nullable=False,
        comment="Nom du produit dans Agribalyse"
    )
    rendement_moyen_conv_kg_ha = Column(
        Float, nullable=False,
        comment="Rendement moyen conventionnel en kg/ha"
    )
    rendement_moyen_bio_kg_ha = Column(
        Float, nullable=False,
        comment="Rendement moyen bio en kg/ha"
    )
    version = Column(String(10), default="1.0")
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<MappingCulture(pac='{self.code_culture_pac}', agb='{self.code_agb}')>"
