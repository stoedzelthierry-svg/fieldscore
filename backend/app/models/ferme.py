"""Ferme (farm) ORM model."""

import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, func
from app.database import Base


class Ferme(Base):
    """Represents a registered farm in the FieldScore system.

    A farm can have multiple parcelles (fields), infrastructures écologiques,
    and calculation results.
    """

    __tablename__ = "fermes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    siret = Column(String(14), nullable=True, index=True, comment="SIRET de l'exploitation")
    nom = Column(String(255), nullable=False, comment="Nom de la ferme")
    code_insee = Column(String(5), nullable=True, comment="Code INSEE de la commune")
    type_production = Column(
        String(50), nullable=True,
        comment="Type principal: GRANDES_CULTURES, ELEVAGE, MIXTE, MARAICHAGE, VITICULTURE, ARBORICULTURE"
    )
    surface_totale_ha = Column(Float, nullable=True, comment="Surface totale en hectares")
    annee_reference = Column(Integer, default=2024, comment="Année de référence des données")
    created_at = Column(DateTime, server_default=func.now(), comment="Date de création")
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(),
        comment="Date de dernière modification"
    )

    def __repr__(self) -> str:
        return f"<Ferme(id={self.id}, nom='{self.nom}')>"
