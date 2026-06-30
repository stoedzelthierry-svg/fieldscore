# 🌾 FieldScore

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)

**Calculateur open-source du coût environnemental des fermes françaises**

FieldScore calcule un **score environnemental unique** (de A à E) pour chaque exploitation agricole française, en s'appuyant sur la méthode **Ecobalyse** du MTECT et de l'ADEME, et sur la base de données **Agribalyse v3.2** (ADEME/INRAE).

---

## 📖 Pour quoi faire ?

- **Pour les agriculteurs** : mesurer l'impact environnemental de leur ferme, identifier des leviers d'amélioration, valoriser leurs pratiques vertueuses.
- **Pour les consommateurs** : comprendre l'empreinte environnementale des produits qu'ils achètent via un score transparent et objectif.
- **Pour les labels et certifications** : disposer d'un outil de calcul standardisé et open-source, auditable par tous.
- **Pour les chercheurs** : exploiter une base de calcul ACV documentée et ouverte, enrichissable collaborativement.

---

## 🧠 Méthodologie

FieldScore met en œuvre la méthode **Ecobalyse** développée par le Ministère de la Transition Écologique et de la Cohésion des Territoires (MTECT) et l'ADEME, qui repose sur trois piliers :

### 1. L'Analyse du Cycle de Vie (ACV)
Une ACV évalue les impacts environnementaux d'un produit sur l'ensemble de son cycle de vie : de l'extraction des matières premières à la fin de vie, en passant par la production, la transformation, le transport et l'utilisation.

### 2. La méthode PEF (Product Environmental Footprint)
Le PEF est la méthode européenne de référence pour l'ACV. Elle définit **16 indicateurs environnementaux** normalisés, allant du changement climatique à l'épuisement des ressources minérales.

### 3. La base Agribalyse
Agribalyse est la base de données française de référence pour l'ACV des produits agricoles. Elle couvre plus de 2 500 produits alimentaires et fournit, pour chacun, les valeurs des 16 indicateurs PEF.

**La formule de calcul** du score FieldScore :

```
Score brut = Σ (indicateur_i normalisé × poids_i), pour i = 1 à 16
Score final = Score brut × (1 - modulation_IAE) × facteur_bio
```

Où :
- Les 16 indicateurs sont normalisés via les facteurs PEF (version 3.1)
- La **modulation IAE** (Infrastructures Agro-Écologiques) applique un bonus récompensant la présence de haies, mares, bandes enherbées, agroforesterie, etc.
- Le **facteur bio** applique une pondération favorable aux pratiques d'agriculture biologique

Le score final est catégorisé de **A** (excellent) à **E** (impact élevé).

📚 Documentation exhaustive : [METHODOLOGY.md](./docs/METHODOLOGY.md)

---

## 🚀 Quick Start

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

### Lancer le projet

```bash
# Cloner le dépôt
git clone https://github.com/votre-org/fieldscore.git
cd fieldscore

# Copier les variables d'environnement
cp .env.example .env

# Lancer l'ensemble des services
docker-compose up -d

# Charger les données de test (optionnel)
docker-compose exec backend python /app/../scripts/seed_data.py
```

### Accéder aux services

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000      |
| API       | http://localhost:8000      |
| API Docs  | http://localhost:8000/docs |
| Base de données | localhost:5432        |

---

## 🏗️ Architecture

```
fieldscore/
├── backend/            # API FastAPI (Python 3.12+)
│   ├── app/
│   │   ├── api/        # Endpoints REST
│   │   ├── core/       # Configuration, sécurité
│   │   ├── models/     # Modèles SQLAlchemy
│   │   ├── schemas/    # Schémas Pydantic
│   │   ├── services/   # Logique métier
│   │   └── data/       # Fichiers de données statiques (IAE, etc.)
│   └── Dockerfile
├── frontend/           # Interface Next.js 14 (React)
│   ├── app/            # Routes App Router
│   ├── components/     # Composants React
│   ├── lib/            # Utilitaires, hooks
│   └── Dockerfile
├── data/               # Données de référence
│   ├── agribalyse/     # Base Agribalyse v3.2
│   └── mapping/        # Mapping PAC → Agribalyse
├── scripts/            # Scripts utilitaires (seed, import)
├── docs/               # Documentation technique
│   ├── METHODOLOGY.md  # Méthode de calcul exhaustive
│   ├── API.md          # Documentation de l'API
│   └── CONTRIBUTING.md # Guide de contribution
├── docker-compose.yml
├── .env.example
├── LICENSE
└── README.md
```

### Stack technique

- **Backend** : FastAPI (Python 3.12+), SQLAlchemy 2.0, Pydantic v2, asyncpg
- **Base de données** : PostgreSQL 16 + PostGIS 3.4
- **Frontend** : Next.js 14, React 18, TailwindCSS, Leaflet/OpenLayers
- **Infrastructure** : Docker Compose (développement), prêt pour déploiement Kubernetes

---

## 🔌 API Endpoints Principaux

### Fermes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/farmes` | Lister toutes les fermes |
| `GET` | `/api/v1/farmes/{id}` | Détail d'une ferme |
| `POST` | `/api/v1/farmes` | Créer une ferme |
| `PUT` | `/api/v1/farmes/{id}` | Mettre à jour une ferme |

### Parcelles
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/farmes/{id}/parcelles` | Lister les parcelles d'une ferme |
| `POST` | `/api/v1/farmes/{id}/parcelles` | Ajouter une parcelle |

### Score Environnemental
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/farmes/{id}/score` | Calculer le score d'une ferme |
| `GET` | `/api/v1/farmes/{id}/score/details` | Décomposition par indicateur |

### IAE
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/farmes/{id}/iae` | Infrastructures agro-écologiques |
| `POST` | `/api/v1/farmes/{id}/iae` | Ajouter une IAE |

### Données de référence
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/reference/produits` | Liste des produits Agribalyse |
| `GET` | `/api/v1/reference/mapping` | Mapping cultures PAC |
| `GET` | `/api/v1/reference/iae-coefficients` | Coefficients IAE |

📚 Documentation complète : [API.md](./docs/API.md)

---

## 📊 Exemple de Score

```
┌─────────────────────────────────────────────────┐
│ Ferme : Ferme de la Vallée Verte                 │
│ Type  : Polyculture-élevage bio                 │
│ SAU   : 85 ha                                   │
│                                                   │
│ Score Brut (PEF) : 0.185                         │
│ Modulation IAE   : -12.5%  (haies + mares)       │
│ Facteur Bio      : ×0.90  (label AB)            │
│ ─────────────────────────────────────────────── │
│ Score Final      : 0.146                         │
│ Catégorie        : B (bon)                       │
│ Niveau Confiance : ★★★★☆ (4/5)                  │
└─────────────────────────────────────────────────┘
```

---

## 🗺️ Feuille de route

- [x] Calcul ACV basé Agribalyse v3.2
- [x] Intégration des 16 indicateurs PEF
- [x] Modulation IAE (infrastructures agro-écologiques)
- [x] Catégorisation A-E
- [ ] Import RPG (Registre Parcellaire Graphique)
- [ ] Import parcelles depuis TelePAC
- [ ] Tableau de bord comparatif (benchmark territorial)
- [ ] Export PDF du rapport environnemental
- [ ] API publique pour intégration labels
- [ ] Module ACV pour l'élevage
- [ ] Intégration bilan carbone (méthode Label Bas Carbone)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez le [guide de contribution](./docs/CONTRIBUTING.md) pour démarrer.

Ce projet adhère au [Code de Conduite des Contributeurs](./CODE_OF_CONDUCT.md).

---

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

**Note importante** : La base de données Agribalyse v3.2 est produite par l'ADEME et INRAE. Elle est distribuée sous licence [Open Database License (ODbL)](https://www.etalab.gouv.fr/licence-ouverte-open-licence). Les fichiers de mapping PAC sont dérivés de données publiques (RPG, Agreste). Les coefficients IAE sont issus de la documentation publique de la méthode Ecobalyse (MTECT/ADEME).

---

## 🙏 Crédits

FieldScore est construit sur les épaules de géants :

- **[Ecobalyse](https://ecobalyse.beta.gouv.fr/)** — la méthode publique d'affichage environnemental développée par le **MTECT** (Ministère de la Transition Écologique et de la Cohésion des Territoires) et l'**ADEME**
- **[Agribalyse](https://agribalyse.ademe.fr/)** — la base de données d'ACV des produits agricoles et alimentaires français, produite par l'**ADEME** et **INRAE**
- **[Product Environmental Footprint (PEF)](https://ec.europa.eu/environment/eussd/smgp/pefcr_oefsr_en.htm)** — la méthode européenne harmonisée de calcul de l'empreinte environnementale
- **[Registre Parcellaire Graphique (RPG)](https://www.data.gouv.fr/fr/datasets/registre-parcellaire-graphique-rpg-contours-des-parcelles-et-ilots-culturaux-et-leur-groupe-de-cultures-majoritaire/)** — données géographiques des parcelles agricoles françaises (IGN / ASP)

---

<p align="center">
  <em>FieldScore — Pour une agriculture mesurée, transparente et durable.</em>
</p>
