-- FieldScore : Script d'initialisation de la base de données
-- Exécuté automatiquement au premier démarrage du conteneur PostgreSQL

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fermes
CREATE TABLE IF NOT EXISTS fermes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parcelles agricoles
CREATE TABLE IF NOT EXISTS parcelles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infrastructures Agro-Écologiques (IAE)
CREATE TABLE IF NOT EXISTS iae (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    type_iae VARCHAR(10) NOT NULL,
    description VARCHAR(500),
    longueur_m DECIMAL(10, 2),
    surface_m2 DECIMAL(10, 2),
    nb_unites INTEGER,
    bonus_pct DECIMAL(5, 2) DEFAULT 0,
    geometrie GEOMETRY(GEOMETRY, 4326),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Résultats de calcul de score (historique)
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    score_brut DOUBLE PRECISION NOT NULL,
    score_final DOUBLE PRECISION NOT NULL,
    categorie CHAR(1) NOT NULL,
    niveau_confiance DOUBLE PRECISION NOT NULL,
    modulation_iae_pct DOUBLE PRECISION DEFAULT 0,
    facteur_bio DOUBLE PRECISION DEFAULT 1.0,
    details_json JSONB NOT NULL,
    version_methode VARCHAR(20),
    calculé_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache de correspondance cultures PAC → Agribalyse
CREATE TABLE IF NOT EXISTS mapping_cultures (
    code_culture_pac VARCHAR(20) PRIMARY KEY,
    nom_culture VARCHAR(255) NOT NULL,
    code_agb VARCHAR(20) NOT NULL,
    nom_produit_agb VARCHAR(255) NOT NULL,
    rendement_moyen_conv_kg_ha DECIMAL(10, 2),
    rendement_moyen_bio_kg_ha DECIMAL(10, 2),
    source_rendement VARCHAR(255)
);

-- Données Agribalyse
CREATE TABLE IF NOT EXISTS agribalyse (
    code_agb VARCHAR(20) PRIMARY KEY,
    code_ciqual VARCHAR(20),
    groupe_aliment VARCHAR(100),
    sous_groupe VARCHAR(100),
    nom_produit_fr VARCHAR(255) NOT NULL,
    lci_name VARCHAR(255),
    saison VARCHAR(10) DEFAULT 'FR',
    avion BOOLEAN DEFAULT FALSE,
    livraison BOOLEAN DEFAULT FALSE,
    emballage BOOLEAN DEFAULT FALSE,
    preparation BOOLEAN DEFAULT FALSE,
    dqr DECIMAL(3, 1),
    score_unique_ef DOUBLE PRECISION,
    changement_climatique DOUBLE PRECISION,
    appauvrissement_ozone DOUBLE PRECISION,
    rayonnements_ionisants DOUBLE PRECISION,
    formation_ozone DOUBLE PRECISION,
    particules_fines DOUBLE PRECISION,
    toxicite_non_cancero DOUBLE PRECISION,
    toxicite_cancero DOUBLE PRECISION,
    acidification DOUBLE PRECISION,
    eutrophisation_eaux_douces DOUBLE PRECISION,
    eutrophisation_marine DOUBLE PRECISION,
    eutrophisation_terrestre DOUBLE PRECISION,
    ecotoxicite_eau_douce DOUBLE PRECISION,
    utilisation_sol DOUBLE PRECISION,
    epuisement_eau DOUBLE PRECISION,
    epuisement_energetique DOUBLE PRECISION,
    epuisement_mineraux DOUBLE PRECISION
);

-- Index
CREATE INDEX IF NOT EXISTS idx_parcelles_ferme_id ON parcelles(ferme_id);
CREATE INDEX IF NOT EXISTS idx_iae_ferme_id ON iae(ferme_id);
CREATE INDEX IF NOT EXISTS idx_iae_type ON iae(type_iae);
CREATE INDEX IF NOT EXISTS idx_scores_ferme_id ON scores(ferme_id);
CREATE INDEX IF NOT EXISTS idx_parcelles_geometrie ON parcelles USING GIST(geometrie);
CREATE INDEX IF NOT EXISTS idx_iae_geometrie ON iae USING GIST(geometrie);
CREATE INDEX IF NOT EXISTS idx_parcelles_culture ON parcelles(code_culture_pac);
CREATE INDEX IF NOT EXISTS idx_mapping_culture ON mapping_cultures(code_culture_pac);
CREATE INDEX IF NOT EXISTS idx_agribalyse_groupe ON agribalyse(groupe_aliment);
