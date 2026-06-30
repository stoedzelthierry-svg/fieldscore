"""Initial migration - Create all tables.

Revision ID: 001
Revises: None
Create Date: 2026-06-30
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all initial tables."""

    # Enable uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Fermes table
    op.create_table(
        "fermes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("siret", sa.String(14), nullable=True, index=True),
        sa.Column("nom", sa.String(255), nullable=False),
        sa.Column("code_insee", sa.String(5), nullable=True),
        sa.Column("type_production", sa.String(50), nullable=True),
        sa.Column("surface_totale_ha", sa.Float(), nullable=True),
        sa.Column("annee_reference", sa.Integer(), default=2024),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Parcelles table
    op.create_table(
        "parcelles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("ferme_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("fermes.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("code_culture", sa.String(20), nullable=False, index=True),
        sa.Column("culture_nom", sa.String(255), nullable=True),
        sa.Column("surface_ha", sa.Float(), nullable=False),
        sa.Column("est_bio", sa.Boolean(), default=False),
        sa.Column("rendement_reel_kg_ha", sa.Float(), nullable=True),
        sa.Column("annee", sa.Integer(), default=2024),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Cheptels table
    op.create_table(
        "cheptels",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("ferme_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("fermes.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("type_animal", sa.String(50), nullable=False),
        sa.Column("code_agb", sa.String(20), nullable=True),
        sa.Column("nombre_tetes", sa.Integer(), nullable=False, default=1),
        sa.Column("est_bio", sa.Boolean(), default=False),
        sa.Column("poids_vif_kg", sa.Float(), nullable=True),
        sa.Column("lait_kg_an", sa.Float(), nullable=True),
        sa.Column("ugb", sa.Float(), nullable=True),
        sa.Column("annee", sa.Integer(), default=2024),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Infrastructures écologiques table
    op.create_table(
        "infrastructures_ecologiques",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("ferme_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("fermes.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("type_iae", sa.String(50), nullable=False, index=True),
        sa.Column("metrique", sa.String(20), nullable=False),
        sa.Column("valeur", sa.Float(), nullable=False),
        sa.Column("source_donnees", sa.String(50), default="DECLARATIF"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Résultats calcul table
    op.create_table(
        "resultats_calcul",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("ferme_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("fermes.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("methode_version", sa.String(20), nullable=False, default="1.0"),
        sa.Column("timestamp", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("score_unique", sa.Float(), nullable=True),
        sa.Column("categorie", sa.String(2), nullable=True),
        sa.Column("impacts_json", postgresql.JSONB(), nullable=False,
                  server_default=sa.text("'{}'::jsonb")),
        sa.Column("details_json", postgresql.JSONB(), nullable=True),
        sa.Column("metadonnees_json", postgresql.JSONB(), nullable=True,
                  server_default=sa.text("'{}'::jsonb")),
        sa.Column("niveau_confiance", sa.Float(), default=0.5),
        sa.Column("source_donnees", sa.String(50), default="AGRIBALYSE"),
        sa.Column("statut", sa.String(20), default="complete"),
        sa.Column("erreur_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Mapping cultures table
    op.create_table(
        "mapping_cultures",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("code_culture_pac", sa.String(20), nullable=False, unique=True, index=True),
        sa.Column("nom_culture", sa.String(255), nullable=False),
        sa.Column("code_agb", sa.String(20), nullable=False, index=True),
        sa.Column("nom_produit_agb", sa.String(255), nullable=False),
        sa.Column("rendement_moyen_conv_kg_ha", sa.Float(), nullable=False),
        sa.Column("rendement_moyen_bio_kg_ha", sa.Float(), nullable=False),
        sa.Column("version", sa.String(10), default="1.0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Additional indexes for frequently queried columns
    op.create_index("ix_fermes_type_production", "fermes", ["type_production"])
    op.create_index("ix_parcelles_est_bio", "parcelles", ["est_bio"])
    op.create_index("ix_resultats_calcul_score", "resultats_calcul", ["score_unique"])
    op.create_index("ix_resultats_calcul_categorie", "resultats_calcul", ["categorie"])


def downgrade() -> None:
    """Drop all tables."""
    op.execute("DROP TABLE IF EXISTS mapping_cultures CASCADE")
    op.execute("DROP TABLE IF EXISTS resultats_calcul CASCADE")
    op.execute("DROP TABLE IF EXISTS infrastructures_ecologiques CASCADE")
    op.execute("DROP TABLE IF EXISTS cheptels CASCADE")
    op.execute("DROP TABLE IF EXISTS parcelles CASCADE")
    op.execute("DROP TABLE IF EXISTS fermes CASCADE")
