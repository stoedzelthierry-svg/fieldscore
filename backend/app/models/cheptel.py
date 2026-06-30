"""Cheptel (livestock) ORM model."""

import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Cheptel(Base):
    """Represents a livestock unit within a farm.

    Supports different livestock types for mixed farming operations.
    """

    __tablename__ = "cheptels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ferme_id = Column(
        UUID(as_uuid=True),
        ForeignKey("fermes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type_animal = Column(
        String(50), nullable=False,
        comment="Type: BOVIN_LAIT, BOVIN_VIANDE, OVIN, CAPRIN, PORCIN, VOLAILLE, MIXTE"
    )
    code_agb = Column(
        String(20), nullable=True,
        comment="Code Agribalyse correspondant"
    )
    nombre_tetes = Column(Integer, nullable=False, default=1)
    est_bio = Column(Boolean, default=False)
    poids_vif_kg = Column(Float, nullable=True, comment="Poids vif total en kg")
    lait_kg_an = Column(Float, nullable=True, comment="Production laitière annuelle en kg")
    ugb = Column(Float, nullable=True, comment="Unité Gros Bétail calculée")
    annee = Column(Integer, default=2024)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<Cheptel(id={self.id}, type='{self.type_animal}', tetes={self.nombre_tetes})>"
