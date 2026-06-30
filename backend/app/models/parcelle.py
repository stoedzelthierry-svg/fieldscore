"""Parcelle (field plot) ORM model."""

import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, func
from app.database import Base


class Parcelle(Base):
    """Represents a cultivated field plot within a farm.

    Each parcelle is linked to one farm and carries culture code,
    surface, and optional real yield data for precise calculations.
    """

    __tablename__ = "parcelles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ferme_id = Column(
        String(36), ForeignKey("fermes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Référence à la ferme parente"
    )
    code_culture = Column(
        String(20), nullable=False, index=True,
        comment="Code culture PAC (ex: BLE_TENDRE, MAIS_GRAIN)"
    )
    culture_nom = Column(
        String(255), nullable=True,
        comment="Nom lisible de la culture"
    )
    surface_ha = Column(
        Float, nullable=False,
        comment="Surface de la parcelle en hectares"
    )
    est_bio = Column(
        Boolean, default=False,
        comment="La parcelle est-elle en agriculture biologique ?"
    )
    rendement_reel_kg_ha = Column(
        Float, nullable=True,
        comment="Rendement réel mesuré en kg/ha (donnée terrain). Si absent, le rendement moyen est utilisé."
    )
    annee = Column(Integer, default=2024, comment="Année de culture")
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<Parcelle(id={self.id}, code='{self.code_culture}', surface={self.surface_ha}ha)>"
