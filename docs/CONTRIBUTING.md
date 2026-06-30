# Contribuer à FieldScore

Merci de votre intérêt pour FieldScore ! Ce document vous guidera pour contribuer efficacement au projet.

## 🌱 Comment contribuer

### Types de contributions

- **Code** : nouvelles fonctionnalités, corrections de bugs, améliorations de performance
- **Données** : enrichissement du mapping PAC, correction des données Agribalyse, ajout de cultures
- **Documentation** : corrections, traductions, tutoriels, exemples
- **Méthodologie** : amélioration des formules de calcul, ajout d'indicateurs, revue scientifique
- **Design** : amélioration de l'interface utilisateur, accessibilité, ergonomie
- **Tests** : ajout de cas de test, scénarios de validation
- **Bug reports** : signalement de bugs avec étapes de reproduction

### Code de conduite

Toutes les interactions doivent respecter les principes suivants :
- Respect et bienveillance
- Critique constructive
- Ouverture à la diversité des points de vue
- Collaboration et entraide

---

## 🛠️ Configuration de l'environnement de développement

### Prérequis

- Python 3.12+
- Node.js 18+ (LTS)
- Docker et Docker Compose
- Git

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-org/fieldscore.git
cd fieldscore

# Copier la configuration
cp .env.example .env

# Lancer les services
docker-compose up -d

# Backend — créer un environnement virtuel Python
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -e ".[dev]"

# Frontend
cd frontend
npm install
npm run dev
```

### Vérification

```bash
# API
curl http://localhost:8000/api/v1/health

# Frontend
open http://localhost:3000

# Docs API
open http://localhost:8000/docs
```

---

## 🔄 Workflow de contribution

### 1. Choisir ou créer une issue

Consultez les issues [ouvertes](https://github.com/votre-org/fieldscore/issues).
Si vous travaillez sur quelque chose de nouveau, créez d'abord une issue pour en discuter.

### 2. Créer une branche

```bash
git checkout -b feat/description-courte
```

Conventions de nommage :
- `feat/` — nouvelle fonctionnalité
- `fix/` — correction de bug
- `docs/` — documentation
- `data/` — données et mappings
- `refactor/` — refactoring
- `test/` — tests uniquement

### 3. Développer et tester

#### Backend (Python)

```bash
cd backend

# Formater le code
ruff format .
ruff check .

# Lancer les tests
pytest
pytest --cov=app --cov-report=html

# Vérification des types
mypy app/
```

#### Frontend (TypeScript)

```bash
cd frontend

# Linter
npm run lint

# Tests
npm test

# Build de vérification
npm run build
```

### 4. Commiter

Utilisez les [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
git commit -m "feat(score): ajoute le calcul du score par parcelle
git commit -m "fix(mapping): corrige le mapping pois protéagineux bio
git commit -m "docs(api): documente l'endpoint de score
```

Format : `type(scope): description`

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `data`

### 5. Pousser et créer une Pull Request

```bash
git push origin feat/description-courte
```

Créez une Pull Request sur GitHub avec :
- **Titre clair** décrivant le changement
- **Description** : ce que fait la PR, pourquoi, comment tester
- **Lien vers l'issue** associée : `Closes #42`
- **Checklist** : tests passés, doc mise à jour, compatibilité vérifiée

### 6. Revue de code

Un mainteneur examinera votre PR. Prévoyez 1 à 2 itérations de retours.

---

## 📊 Contribution de données

### Ajouter une culture au mapping PAC→Agribalyse

Le fichier `data/mapping/mapping_v1.0.csv` suit un format précis :

```csv
code_culture_pac,nom_culture,code_agb,nom_produit_agb,rendement_moyen_conv_kg_ha,rendement_moyen_bio_kg_ha,source_rendement
```

Pour ajouter une culture :
1. Identifiez le `code_agb` dans `data/agribalyse/v3.2/synthese.csv`
2. Trouvez les rendements moyens sur [Agreste](https://agreste.agriculture.gouv.fr/)
3. Ajoutez une ligne (et une ligne `/BIO` si pertinent)
4. Documentez la source du rendement

### Mettre à jour les coefficients IAE

Les coefficients IAE sont dans `backend/data/iae/coefficients.json`.
Pour proposer un changement :
1. Justifiez-le avec des sources scientifiques
2. Ouvrez une issue avec le tag `methodology`
3. Si approuvé, ouvrez une PR modifiant `coefficients.json`

---

## 🧪 Tests

### Tests backend

```bash
cd backend
pytest tests/ -v
pytest --cov=app --cov-report=term-missing
```

Structure des tests :
```
backend/tests/
├── test_api/
│   ├── test_fermes.py
│   ├── test_parcelles.py
│   ├── test_scores.py
│   └── test_iae.py
├── test_services/
│   ├── test_calcul_score.py
│   ├── test_normalisation.py
│   └── test_mapping.py
└── conftest.py
```

### Tests frontend

```bash
cd frontend
npm test
npm run test:e2e
```

---

## 📚 Documentation

### Documentation technique

La documentation est en Markdown dans le dossier `docs/`. Pour y contribuer :
- Respectez le format existant
- Utilisez le français (sauf noms techniques et code)
- Vérifiez les liens avant de commiter

### Documentation API

La documentation API est auto-générée par FastAPI (`/docs`).
Les descriptions des endpoints et des schémas sont dans le code Python.

---

## 🏷️ Versioning

FieldScore suit le [Semantic Versioning](https://semver.org/) :

- **PATCH** (1.0.x) : corrections de bugs, mise à jour de données
- **MINOR** (1.x.0) : nouvelles fonctionnalités rétrocompatibles
- **MAJOR** (x.0.0) : changements incompatibles de l'API ou de la méthode

---

## 📞 Support

- **Issues GitHub** : pour les bugs et suggestions
- **Discussions GitHub** : pour les questions et échanges
- **Documentation** : `docs/METHODOLOGY.md` pour la méthode, `docs/API.md` pour l'API

### Contact

Pour toute question non technique ou proposition de partenariat :
- Email : contact@fieldscore.example.com
- Site web : https://fieldscore.example.com

---

## 🌟 Reconnaissance

Tous les contributeurs sont reconnus dans le fichier [CONTRIBUTORS.md](./CONTRIBUTORS.md)
et dans les releases GitHub.

Les contributions significatives à la méthodologie peuvent donner lieu à une mention
dans la documentation technique et les publications associées.

---

<p align="center">
  <em>FieldScore est un projet communautaire. Chaque contribution compte ! 🌍</em>
</p>
