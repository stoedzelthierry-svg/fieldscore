#!/usr/bin/env python3
"""
Script de chargement des données de test pour FieldScore.

Crée 3 fermes de test avec leurs parcelles, IAE et configurations,
pour démontrer les capacités de l'outil de calcul environnemental.

Usage :
    python scripts/seed_data.py
    python scripts/seed_data.py --db-url postgresql://user:pass@host:5432/db
"""

import asyncio
import argparse
import sys
import uuid
from datetime import date, datetime
from decimal import Decimal

# On essaie d'importer asyncpg, sinon on propose de l'installer
try:
    import asyncpg
except ImportError:
    print("❌ asyncpg n'est pas installé. Faites : pip install asyncpg")
    sys.exit(1)


# ─── Données des fermes de test ───────────────────────────────────────────────

FERMES_TEST = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "nom": "Ferme de la Vallée Verte",
        "siret": "12345678900011",
        "description": "Ferme familiale en polyculture-élevage bio, engagée dans la transition agroécologique depuis 2010. 85 ha de SAU avec un atelier bovin lait et un atelier grandes cultures diversifié.",
        "adresse": "12 Route des Prés, 49400 Saumur",
        "sau_ha": Decimal("85.0"),
        "type_agriculture": "BIO",
        "region": "Pays de la Loire",
        "departement": "49",
        "score_calcule": None,
        "score_categorie": None,
        "score_niveau_confiance": None,
        "created_at": datetime(2025, 6, 15, 10, 30, 0),
        "updated_at": datetime(2025, 6, 15, 10, 30, 0),
        "parcelles": [
            {
                "id": str(uuid.uuid4()),
                "nom": "La Grande Pièce",
                "surface_ha": Decimal("12.50"),
                "code_culture_pac": "BLE/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 3700,
                "irrigation": False,
                "travail_sol": "TCS",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.085 47.260, -0.080 47.260, -0.080 47.255, -0.085 47.255, -0.085 47.260))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Les Bas Prés",
                "surface_ha": Decimal("8.00"),
                "code_culture_pac": "BOV/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 4800,
                "irrigation": False,
                "travail_sol": "Sans labour",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.082 47.258, -0.077 47.258, -0.077 47.253, -0.082 47.253, -0.082 47.258))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Le Champ du Moulin",
                "surface_ha": Decimal("15.00"),
                "code_culture_pac": "MAI/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 5400,
                "irrigation": False,
                "travail_sol": "TCS",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.088 47.262, -0.083 47.262, -0.083 47.257, -0.088 47.257, -0.088 47.262))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "La Pâture Haute",
                "surface_ha": Decimal("10.00"),
                "code_culture_pac": "PPH",
                "pratique": "BIO",
                "rendement_kg_ha": 5000,
                "irrigation": False,
                "travail_sol": "Sans labour",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.090 47.265, -0.085 47.265, -0.085 47.260, -0.090 47.260, -0.090 47.265))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Les Terres Blanches",
                "surface_ha": Decimal("14.00"),
                "code_culture_pac": "COL/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 1950,
                "irrigation": False,
                "travail_sol": "TCS",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.078 47.255, -0.073 47.255, -0.073 47.250, -0.078 47.250, -0.078 47.255))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "La Parcelle du Verger",
                "surface_ha": Decimal("4.50"),
                "code_culture_pac": "POM/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 22000,
                "irrigation": True,
                "travail_sol": "Sans labour",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.075 47.263, -0.071 47.263, -0.071 47.259, -0.075 47.259, -0.075 47.263))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Les Foins",
                "surface_ha": Decimal("6.00"),
                "code_culture_pac": "PRT",
                "pratique": "BIO",
                "rendement_kg_ha": 5400,
                "irrigation": False,
                "travail_sol": "Sans labour",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.092 47.268, -0.087 47.268, -0.087 47.264, -0.092 47.264, -0.092 47.268))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Sud",
                "surface_ha": Decimal("5.50"),
                "code_culture_pac": "POI/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 2700,
                "irrigation": False,
                "travail_sol": "TCS",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.080 47.250, -0.075 47.250, -0.075 47.246, -0.080 47.246, -0.080 47.250))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle du Bois",
                "surface_ha": Decimal("4.50"),
                "code_culture_pac": "ORH/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 3400,
                "irrigation": False,
                "travail_sol": "TCS",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.087 47.256, -0.083 47.256, -0.083 47.252, -0.087 47.252, -0.087 47.256))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "La Pièce du Ruisseau",
                "surface_ha": Decimal("5.00"),
                "code_culture_pac": "TOU/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 1550,
                "irrigation": False,
                "travail_sol": "TCS",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((-0.083 47.248, -0.078 47.248, -0.078 47.244, -0.083 47.244, -0.083 47.248))",
            },
        ],
        "iae": [
            {
                "id": str(uuid.uuid4()),
                "type_iae": "HAI",
                "description": "Haie bocagère double face, essence locale (chêne, charme, noisetier)",
                "longueur_m": Decimal("450.00"),
                "surface_m2": None,
                "nb_unites": None,
                "bonus_pct": Decimal("2.8"),
                "created_at": datetime(2025, 6, 15, 11, 0, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "MAR",
                "description": "Mare naturelle restaurée en 2018, présence de batraciens",
                "longueur_m": None,
                "surface_m2": Decimal("150.00"),
                "nb_unites": None,
                "bonus_pct": Decimal("1.5"),
                "created_at": datetime(2025, 6, 15, 11, 0, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "BEN",
                "description": "Bande enherbée de 5 m de large le long du ruisseau",
                "longueur_m": None,
                "surface_m2": Decimal("1500.00"),
                "nb_unites": None,
                "bonus_pct": Decimal("1.8"),
                "created_at": datetime(2025, 6, 15, 11, 0, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "JFL",
                "description": "Jachère mellifère de 0.4 ha, semée en sainfoin-phacélie-trefle",
                "longueur_m": None,
                "surface_m2": Decimal("4000.00"),
                "nb_unites": None,
                "bonus_pct": Decimal("2.4"),
                "created_at": datetime(2025, 6, 15, 11, 0, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "ARB",
                "description": "Arbres isolés dans la parcelle La Grande Pièce (3 noyers)",
                "longueur_m": None,
                "surface_m2": None,
                "nb_unites": 3,
                "bonus_pct": Decimal("1.2"),
                "created_at": datetime(2025, 6, 15, 11, 0, 0),
            },
        ],
    },
    {
        "id": "00000000-0000-0000-0000-000000000002",
        "nom": "GAEC des Grands Champs",
        "siret": "98765432100022",
        "description": "Grande exploitation céréalière conventionnelle, spécialisée en blé, orge et colza. 150 ha d'un seul tenant sur les plateaux de Beauce.",
        "adresse": "2 Rue de la Beauce, 28150 Voves",
        "sau_ha": Decimal("150.0"),
        "type_agriculture": "CONVENTIONNEL",
        "region": "Centre-Val de Loire",
        "departement": "28",
        "score_calcule": None,
        "score_categorie": None,
        "score_niveau_confiance": None,
        "created_at": datetime(2025, 3, 10, 14, 0, 0),
        "updated_at": datetime(2025, 3, 10, 14, 0, 0),
        "parcelles": [
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Nord 1",
                "surface_ha": Decimal("25.00"),
                "code_culture_pac": "BLE",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 7500,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.590 48.280, 1.600 48.280, 1.600 48.270, 1.590 48.270, 1.590 48.280))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Nord 2",
                "surface_ha": Decimal("20.00"),
                "code_culture_pac": "BLE",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 7200,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.595 48.285, 1.605 48.285, 1.605 48.275, 1.595 48.275, 1.595 48.285))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Centre 1",
                "surface_ha": Decimal("30.00"),
                "code_culture_pac": "COL",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 3800,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.580 48.270, 1.595 48.270, 1.595 48.258, 1.580 48.258, 1.580 48.270))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Sud 1",
                "surface_ha": Decimal("18.00"),
                "code_culture_pac": "ORH",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 6800,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.585 48.260, 1.596 48.260, 1.596 48.250, 1.585 48.250, 1.585 48.260))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Sud 2",
                "surface_ha": Decimal("22.00"),
                "code_culture_pac": "ORH",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 6600,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.590 48.255, 1.602 48.255, 1.602 48.243, 1.590 48.243, 1.590 48.255))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Est",
                "surface_ha": Decimal("15.00"),
                "code_culture_pac": "TOU",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 2700,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.610 48.275, 1.620 48.275, 1.620 48.265, 1.610 48.265, 1.610 48.275))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Ouest",
                "surface_ha": Decimal("12.00"),
                "code_culture_pac": "POI",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 4200,
                "irrigation": False,
                "travail_sol": "Labour profond",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((1.575 48.272, 1.583 48.272, 1.583 48.264, 1.575 48.264, 1.575 48.272))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Mais",
                "surface_ha": Decimal("8.00"),
                "code_culture_pac": "MAI",
                "pratique": "CONVENTIONNEL",
                "rendement_kg_ha": 9800,
                "irrigation": True,
                "travail_sol": "Labour profond",
                "couvert_hivernal": False,
                "geometrie": "SRID=4326;POLYGON((1.578 48.266, 1.586 48.266, 1.586 48.260, 1.578 48.260, 1.578 48.266))",
            },
        ],
        "iae": [
            {
                "id": str(uuid.uuid4()),
                "type_iae": "BEN",
                "description": "Bande tampon réglementaire le long du fossé (obligation PAC)",
                "longueur_m": None,
                "surface_m2": Decimal("800.00"),
                "nb_unites": None,
                "bonus_pct": Decimal("0.5"),
                "created_at": datetime(2025, 3, 10, 14, 30, 0),
            },
        ],
    },
    {
        "id": "00000000-0000-0000-0000-000000000003",
        "nom": "Domaine Viticole du Soleil",
        "siret": "55566677700033",
        "description": "Domaine viticole bio de 25 ha situé dans le Languedoc. Production de raisins de cuve en AOP avec pratiques agroforestières innovantes.",
        "adresse": "1 Chemin des Vignes, 34320 Roujan",
        "sau_ha": Decimal("25.0"),
        "type_agriculture": "BIO",
        "region": "Occitanie",
        "departement": "34",
        "score_calcule": None,
        "score_categorie": None,
        "score_niveau_confiance": None,
        "created_at": datetime(2025, 1, 5, 9, 0, 0),
        "updated_at": datetime(2025, 1, 5, 9, 0, 0),
        "parcelles": [
            {
                "id": str(uuid.uuid4()),
                "nom": "Vigne Haute",
                "surface_ha": Decimal("8.00"),
                "code_culture_pac": "VRC/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 4400,
                "irrigation": True,
                "travail_sol": "Enherbement permanent",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((3.310 43.500, 3.320 43.500, 3.320 43.492, 3.310 43.492, 3.310 43.500))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Vigne Basse",
                "surface_ha": Decimal("12.00"),
                "code_culture_pac": "VRC/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 4500,
                "irrigation": True,
                "travail_sol": "Enherbement un rang sur deux",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((3.305 43.495, 3.318 43.495, 3.318 43.485, 3.305 43.485, 3.305 43.495))",
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Parcelle Agroforestière",
                "surface_ha": Decimal("5.00"),
                "code_culture_pac": "VRC/BIO",
                "pratique": "BIO",
                "rendement_kg_ha": 4000,
                "irrigation": True,
                "travail_sol": "Enherbement permanent",
                "couvert_hivernal": True,
                "geometrie": "SRID=4326;POLYGON((3.315 43.488, 3.325 43.488, 3.325 43.481, 3.315 43.481, 3.315 43.488))",
            },
        ],
        "iae": [
            {
                "id": str(uuid.uuid4()),
                "type_iae": "AGF",
                "description": "Parcelle en agroforesterie viticole : rangs de vigne intercalés avec amandiers et figuiers",
                "longueur_m": None,
                "surface_m2": None,
                "nb_unites": None,
                "bonus_pct": Decimal("8.5"),
                "created_at": datetime(2025, 1, 5, 9, 30, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "HAI",
                "description": "Haie composite cyprès-chêne vert en bordure Nord (brise-vent)",
                "longueur_m": Decimal("380.00"),
                "surface_m2": None,
                "nb_unites": None,
                "bonus_pct": Decimal("2.5"),
                "created_at": datetime(2025, 1, 5, 9, 30, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "BQT",
                "description": "Bosquet de chênes verts (0.3 ha) sur éperon rocheux",
                "longueur_m": None,
                "surface_m2": Decimal("3000.00"),
                "nb_unites": None,
                "bonus_pct": Decimal("2.0"),
                "created_at": datetime(2025, 1, 5, 9, 30, 0),
            },
            {
                "id": str(uuid.uuid4()),
                "type_iae": "MUR",
                "description": "Murets de pierre sèche traditionnels en restanques (180 m)",
                "longueur_m": Decimal("180.00"),
                "surface_m2": None,
                "nb_unites": None,
                "bonus_pct": Decimal("1.5"),
                "created_at": datetime(2025, 1, 5, 9, 30, 0),
            },
        ],
    },
]


# ─── SQL de création des tables ──────────────────────────────────────────────

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS fermes (
    id UUID PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    siret VARCHAR(14) UNIQUE,
    description TEXT,
    adresse VARCHAR(500),
    sau_ha DECIMAL(10, 2) NOT NULL,
    type_agriculture VARCHAR(50) NOT NULL DEFAULT 'CONVENTIONNEL',
    region VARCHAR(100),
    departement VARCHAR(3),
    score_calcule DOUBLE PRECISION,
    score_categorie CHAR(1),
    score_niveau_confiance DOUBLE PRECISION,
    score_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parcelles (
    id UUID PRIMARY KEY,
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    surface_ha DECIMAL(10, 4) NOT NULL,
    code_culture_pac VARCHAR(20) NOT NULL,
    pratique VARCHAR(50) NOT NULL DEFAULT 'CONVENTIONNEL',
    rendement_kg_ha DECIMAL(10, 2),
    irrigation BOOLEAN DEFAULT FALSE,
    travail_sol VARCHAR(100),
    couvert_hivernal BOOLEAN DEFAULT FALSE,
    geometrie GEOMETRY(GEOMETRY, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iae (
    id UUID PRIMARY KEY,
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    type_iae VARCHAR(10) NOT NULL,
    description VARCHAR(500),
    longueur_m DECIMAL(10, 2),
    surface_m2 DECIMAL(10, 2),
    nb_unites INTEGER,
    bonus_pct DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcelles_ferme_id ON parcelles(ferme_id);
CREATE INDEX IF NOT EXISTS idx_iae_ferme_id ON iae(ferme_id);
CREATE INDEX IF NOT EXISTS idx_parcelles_geometrie ON parcelles USING GIST(geometrie);
"""

DEFAULT_DB_URL = "postgresql://fieldscore:fieldscore@localhost:5432/fieldscore"


async def seed_database(db_url: str):
    """Charge les données de test dans la base de données."""
    conn = None
    try:
        print(f"🔌 Connexion à la base de données : {db_url}")
        conn = await asyncpg.connect(db_url)
        print("✅ Connecté !")

        # Créer les tables
        print("📋 Création des tables...")
        await conn.execute(CREATE_TABLES_SQL)
        print("   ✅ Tables créées (ou déjà existantes)")

        # Vérifier si les données existent déjà
        row = await conn.fetchrow("SELECT COUNT(*) as c FROM fermes WHERE id = $1",
                                  FERMES_TEST[0]["id"])
        if row and row["c"] > 0:
            print("\n⚠️  Des données de test existent déjà.")
            resp = input("   Voulez-vous les réinitialiser ? [o/N] ")
            if resp.lower() not in ("o", "oui", "y", "yes"):
                print("   ❌ Annulé.")
                return
            await conn.execute("DELETE FROM iae")
            await conn.execute("DELETE FROM parcelles")
            await conn.execute("DELETE FROM fermes")
            print("   🗑️  Données existantes supprimées")

        fermes_nb = 0
        parcelles_nb = 0
        iae_nb = 0

        for ferme_data in FERMES_TEST:
            # Insérer la ferme
            await conn.execute("""
                INSERT INTO fermes (id, nom, siret, description, adresse, sau_ha,
                                    type_agriculture, region, departement,
                                    score_calcule, score_categorie, score_niveau_confiance,
                                    created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ON CONFLICT (id) DO UPDATE SET
                    nom = EXCLUDED.nom,
                    description = EXCLUDED.description,
                    updated_at = NOW()
            """,
                ferme_data["id"],
                ferme_data["nom"],
                ferme_data["siret"],
                ferme_data["description"],
                ferme_data["adresse"],
                ferme_data["sau_ha"],
                ferme_data["type_agriculture"],
                ferme_data["region"],
                ferme_data["departement"],
                ferme_data["score_calcule"],
                ferme_data["score_categorie"],
                ferme_data["score_niveau_confiance"],
                ferme_data["created_at"],
                ferme_data["updated_at"],
            )
            fermes_nb += 1

            # Insérer les parcelles
            for parcelle in ferme_data["parcelles"]:
                geom_sql = parcelle.get("geometrie", None)
                await conn.execute("""
                    INSERT INTO parcelles (id, ferme_id, nom, surface_ha,
                                           code_culture_pac, pratique,
                                           rendement_kg_ha, irrigation,
                                           travail_sol, couvert_hivernal, geometrie)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                            ST_GeomFromText($11, 4326))
                    ON CONFLICT (id) DO NOTHING
                """,
                    parcelle["id"],
                    ferme_data["id"],
                    parcelle["nom"],
                    parcelle["surface_ha"],
                    parcelle["code_culture_pac"],
                    parcelle["pratique"],
                    parcelle["rendement_kg_ha"],
                    parcelle["irrigation"],
                    parcelle["travail_sol"],
                    parcelle["couvert_hivernal"],
                    geom_sql.replace("SRID=4326;", "") if geom_sql else None,
                )
                parcelles_nb += 1

            # Insérer les IAE
            for iae in ferme_data.get("iae", []):
                await conn.execute("""
                    INSERT INTO iae (id, ferme_id, type_iae, description,
                                     longueur_m, surface_m2, nb_unites, bonus_pct, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (id) DO NOTHING
                """,
                    iae["id"],
                    ferme_data["id"],
                    iae["type_iae"],
                    iae["description"],
                    iae.get("longueur_m"),
                    iae.get("surface_m2"),
                    iae.get("nb_unites"),
                    iae.get("bonus_pct"),
                    iae.get("created_at"),
                )
                iae_nb += 1

            print(f"   🏡 {ferme_data['nom']} : {len(ferme_data['parcelles'])} parcelles, {len(ferme_data.get('iae', []))} IAE")

        print(f"\n🎉 Données de test chargées avec succès !")
        print(f"   ✅ {fermes_nb} fermes")
        print(f"   ✅ {parcelles_nb} parcelles")
        print(f"   ✅ {iae_nb} IAE")

        # Afficher un résumé
        rows = await conn.fetch("""
            SELECT f.nom, f.sau_ha, f.type_agriculture,
                   COUNT(p.id) as nb_parcelles,
                   SUM(p.surface_ha) as surface_parcelles,
                   COUNT(i.id) as nb_iae
            FROM fermes f
            LEFT JOIN parcelles p ON p.ferme_id = f.id
            LEFT JOIN iae i ON i.ferme_id = f.id
            GROUP BY f.id
            ORDER BY f.nom
        """)
        print("\n📊 Résumé des données :")
        print(f"   {'Ferme':<35} {'SAU':>6} {'Parcelles':>10} {'IAE':>4}")
        print("   " + "-" * 60)
        for row in rows:
            print(f"   {row['nom']:<35} {str(row['sau_ha']):>6} {str(row['nb_parcelles']):>10} {str(row['nb_iae']):>4}")

    except asyncpg.exceptions.ConnectionFailureError as e:
        print(f"\n❌ Erreur de connexion : {e}")
        print("   Vérifiez que la base de données est accessible.")
        print("   Avec Docker : docker-compose up -d db")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur : {e}")
        raise
    finally:
        if conn:
            await conn.close()
            print("\n👋 Connexion fermée.")


def main():
    parser = argparse.ArgumentParser(
        description="Charge les données de test FieldScore dans la base de données."
    )
    parser.add_argument(
        "--db-url",
        default=DEFAULT_DB_URL,
        help=f"URL de connexion PostgreSQL (défaut : {DEFAULT_DB_URL})"
    )
    args = parser.parse_args()

    asyncio.run(seed_database(args.db_url))


if __name__ == "__main__":
    main()
