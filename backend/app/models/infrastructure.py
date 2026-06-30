"""Infrastructure Écologique (ecological infrastructure) ORM model.

Supports haies, bandes enherbées, mares, agroforesterie, jachères, etc.
Used by the IAE modulator to adjust environmental impact scores.
"""

import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, func
from app.database import Base


class InfrastructureEcologique(Base):
    """Ecological infrastructure present on the farm.

    Each infrastructure has a type, a metric (m, m², ha, count),
    and a measured value. The source of data is tracked for traceability.
    """

    __tablename__ = "infrastructures_ecologiques"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ferme_id = Column(
        String(36), ForeignKey("fermes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type_iae = Column(
        String(50), nullable=False, index=True,
        comment="Type d'IAE: haie, bande_enherbee, mare, agroforesterie, jachere, muret, arbre_isole"
    )
    metrique = Column(
        String(20), nullable=False,
        comment="Unité de mesure: ml (mètres linéaires), m2, ha, nb (nombre)"
    )
    valeur = Column(
        Float, nullable=False,
        comment="Valeur mesurée dans l'unité spécifiée"
    )
    source_donnees = Column(
        String(50), default="DECLARATIF",
        comment="Source: DECLARATIF, RPG_IAE, BD_TOPO, ECOCERT_AUDIT"
    )
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<InfrastructureEcologique(id={self.id}, type='{self.type_iae}', valeur={self.valeur})>"
