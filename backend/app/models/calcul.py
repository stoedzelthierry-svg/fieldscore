"""ResultatCalcul (calculation result) ORM model.

Stores the complete environmental impact evaluation for a farm,
including per-indicator breakdown, confidence level, and metadata.
"""

import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, func, Text, JSON
from app.database import Base


class ResultatCalcul(Base):
    """Persisted result of an environmental score calculation.

    Each calculation is versioned (methode_version) for traceability.
    Stores the full impact breakdown as JSONB for flexibility.
    """

    __tablename__ = "resultats_calcul"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ferme_id = Column(
        String(36), ForeignKey("fermes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    methode_version = Column(
        String(20), nullable=False, default="1.0",
        comment="Version de la méthode de calcul utilisée"
    )
    timestamp = Column(
        DateTime, server_default=func.now(),
        comment="Horodatage du calcul"
    )

    # Core results
    score_unique = Column(
        Float, nullable=True,
        comment="Score PEF unique (éco-score) normalisé en mPt"
    )
    categorie = Column(
        String(2), nullable=True,
        comment="Catégorie environnementale: A, B, C, D, E"
    )

    # Detailed breakdowns
    impacts_json = Column(
        JSON, nullable=False, default=dict,
        comment="Dict des 16 impacts PEF {indicator: value_mPt}"
    )
    details_json = Column(
        JSON, nullable=True,
        comment="Détail par parcelle, contribution par culture"
    )
    metadonnees_json = Column(
        JSON, nullable=True, default=dict,
        comment="Métadonnées: nb_parcelles, surface_totale, source_donnees"
    )

    # Confidence and status
    niveau_confiance = Column(
        Float, default=0.5,
        comment="Niveau de confiance du calcul (0-1)"
    )
    source_donnees = Column(
        String(50), default="AGRIBALYSE",
        comment="Source des données d'impact: AGRIBALYSE, ECOBALYSE"
    )
    statut = Column(
        String(20), default="complete",
        comment="Statut: pending, complete, partial, error"
    )
    erreur_message = Column(Text, nullable=True, comment="Message d'erreur si statut=error")

    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<ResultatCalcul(id={self.id}, ferme={self.ferme_id}, score={self.score_unique})>"
