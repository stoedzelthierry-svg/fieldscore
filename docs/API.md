# Documentation API FieldScore

> **Base URL** : `http://localhost:8000/api/v1`
> **Format** : JSON
> **Authentification** : Non requise en développement

---

## Table des matières

- [Généralités](#généralités)
- [Fermes](#fermes)
- [Parcelles](#parcelles)
- [Scores](#scores)
- [IAE](#iae)
- [Références](#références)
- [Santé](#santé)

---

## Généralités

### Pagination

Toutes les listes utilisent la pagination par curseur :

```
GET /api/v1/fermes?limit=20&offset=0
```

Réponse paginée :
```json
{
  "items": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Gestion des erreurs

Format standard en cas d'erreur :

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Ferme avec l'ID X non trouvée",
    "details": {}
  }
}
```

Codes HTTP utilisés :
- `200` — Succès
- `201` — Création réussie
- `400` — Requête invalide
- `404` — Ressource non trouvée
- `409` — Conflit (ex : SIRET déjà existant)
- `422` — Erreur de validation (schéma)
- `500` — Erreur serveur

---

## Fermes

### Lister toutes les fermes

```bash
curl -X GET "http://localhost:8000/api/v1/fermes?limit=20&offset=0" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "nom": "Ferme de la Vallée Verte",
      "siret": "12345678900011",
      "type_agriculture": "BIO",
      "region": "Pays de la Loire",
      "departement": "49",
      "sau_ha": 85.0,
      "score_categorie": null,
      "created_at": "2025-06-15T10:30:00Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

### Récupérer une ferme

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "nom": "Ferme de la Vallée Verte",
  "siret": "12345678900011",
  "description": "Ferme familiale en polyculture-élevage bio...",
  "adresse": "12 Route des Prés, 49400 Saumur",
  "sau_ha": 85.0,
  "type_agriculture": "BIO",
  "region": "Pays de la Loire",
  "departement": "49",
  "score_calcule": null,
  "score_categorie": null,
  "score_niveau_confiance": null,
  "nb_parcelles": 10,
  "nb_iae": 5,
  "created_at": "2025-06-15T10:30:00Z",
  "updated_at": "2025-06-15T10:30:00Z"
}
```

### Créer une ferme

```bash
curl -X POST "http://localhost:8000/api/v1/fermes" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nom": "Ma Nouvelle Ferme",
    "siret": "11122233300044",
    "description": "Ferme de grandes cultures en conversion bio",
    "adresse": "5 Rue des Champs, 89000 Auxerre",
    "sau_ha": 120.0,
    "type_agriculture": "CONVERSION_BIO",
    "region": "Bourgogne-Franche-Comté",
    "departement": "89"
  }'
```

**Réponse (201)** :
```json
{
  "id": "a1b2c3d4-...",
  "nom": "Ma Nouvelle Ferme",
  "siret": "11122233300044",
  "sau_ha": 120.0,
  "type_agriculture": "CONVERSION_BIO",
  "region": "Bourgogne-Franche-Comté",
  "departement": "89",
  "created_at": "2025-06-30T..."
}
```

### Mettre à jour une ferme

```bash
curl -X PUT "http://localhost:8000/api/v1/fermes/a1b2c3d4-..." \
  -H "Content-Type: application/json" \
  -d '{
    "sau_ha": 125.0,
    "description": "Ferme de grandes cultures en bio (certifiée depuis janvier 2025)"
  }'
```

**Réponse (200)** : La ferme mise à jour.

### Supprimer une ferme

```bash
curl -X DELETE "http://localhost:8000/api/v1/fermes/a1b2c3d4-..." \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "message": "Ferme supprimée avec succès",
  "id": "a1b2c3d4-..."
}
```

---

## Parcelles

### Lister les parcelles d'une ferme

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/parcelles" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "items": [
    {
      "id": "b1c2d3e4-...",
      "ferme_id": "00000000-0000-0000-0000-000000000001",
      "nom": "La Grande Pièce",
      "surface_ha": 12.5,
      "code_culture_pac": "BLE/BIO",
      "pratique": "BIO",
      "rendement_kg_ha": 3700.0,
      "irrigation": false,
      "travail_sol": "TCS",
      "couvert_hivernal": true
    }
  ],
  "total": 10,
  "ferme_id": "00000000-0000-0000-0000-000000000001"
}
```

### Récupérer une parcelle

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/parcelles/b1c2d3e4-..." \
  -H "Accept: application/json"
```

### Ajouter une parcelle

```bash
curl -X POST "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/parcelles" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Nouvelle Parcelle",
    "surface_ha": 5.0,
    "code_culture_pac": "BLE/BIO",
    "pratique": "BIO",
    "rendement_kg_ha": 3800,
    "irrigation": false,
    "travail_sol": "TCS",
    "couvert_hivernal": true,
    "geometrie": {
      "type": "Polygon",
      "coordinates": [[[-0.085, 47.260], [-0.080, 47.260], [-0.080, 47.255], [-0.085, 47.255], [-0.085, 47.260]]]
    }
  }'
```

**Réponse (201)** : La parcelle créée.

### Mettre à jour une parcelle

```bash
curl -X PUT "http://localhost:8000/api/v1/fermes/.../parcelles/b1c2d3e4-..." \
  -H "Content-Type: application/json" \
  -d '{
    "rendement_kg_ha": 3900,
    "couvert_hivernal": true
  }'
```

### Supprimer une parcelle

```bash
curl -X DELETE "http://localhost:8000/api/v1/fermes/.../parcelles/b1c2d3e4-..."
```

---

## Scores

### Calculer le score d'une ferme

Déclenche le calcul complet du score environnemental.

```bash
curl -X POST "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/score" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "utiliser_rendements_reels": true,
    "version_methode": "1.0.0"
  }'
```

**Réponse (200)** :
```json
{
  "ferme_id": "00000000-0000-0000-0000-000000000001",
  "score_brut": 0.185,
  "score_final": 0.146,
  "categorie": "B",
  "categorie_label": "Bon — impact faible",
  "niveau_confiance": 4,
  "modulation_iae": {
    "bonus_total_pct": 9.7,
    "details": [
      {"type_iae": "HAI", "bonus_pct": 2.8, "description": "Haie bocagère double face"},
      {"type_iae": "MAR", "bonus_pct": 1.5, "description": "Mare naturelle restaurée"},
      {"type_iae": "BEN", "bonus_pct": 1.8, "description": "Bande enherbée"},
      {"type_iae": "JFL", "bonus_pct": 2.4, "description": "Jachère mellifère"},
      {"type_iae": "ARB", "bonus_pct": 1.2, "description": "Arbres isolés"}
    ]
  },
  "facteur_bio": 0.90,
  "version_methode": "1.0.0",
  "calcule_le": "2025-06-30T..."
}
```

### Récupérer le dernier score

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/score" \
  -H "Accept: application/json"
```

### Récupérer le détail par indicateur

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/score/details" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "ferme_id": "00000000-0000-0000-0000-000000000001",
  "score_final": 0.146,
  "indicateurs": [
    {
      "code": "CC",
      "nom": "Changement climatique",
      "valeur": 0.240,
      "valeur_normalisee": 2.96e-05,
      "valeur_ponderee": 6.24e-06,
      "contribution_pct": 23.5,
      "unite": "kg CO2 eq"
    },
    {
      "code": "ODP",
      "nom": "Appauvrissement couche d'ozone",
      "valeur": 1.8e-08,
      "valeur_normalisee": 3.36e-07,
      "valeur_ponderee": 2.12e-08,
      "contribution_pct": 0.1,
      "unite": "kg CFC11 eq"
    }
  ],
  "parcelles": [
    {
      "nom": "La Grande Pièce",
      "surface_ha": 12.5,
      "culture": "Blé tendre bio",
      "score_parcelle": 0.090,
      "contribution_pct": 13.2
    }
  ]
}
```

### Historique des scores

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/scores" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "items": [
    {
      "id": "...",
      "score_final": 0.146,
      "categorie": "B",
      "version_methode": "1.0.0",
      "calcule_le": "2025-06-30T..."
    },
    {
      "id": "...",
      "score_final": 0.152,
      "categorie": "B",
      "version_methode": "0.9.0",
      "calcule_le": "2025-05-15T..."
    }
  ],
  "total": 2
}
```

---

## IAE

### Lister les IAE d'une ferme

```bash
curl -X GET "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/iae" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "items": [
    {
      "id": "...",
      "type_iae": "HAI",
      "description": "Haie bocagère double face",
      "longueur_m": 450.0,
      "bonus_pct": 2.8
    }
  ],
  "total_bonus_pct": 9.7,
  "total": 5
}
```

### Ajouter une IAE

```bash
curl -X POST "http://localhost:8000/api/v1/fermes/00000000-0000-0000-0000-000000000001/iae" \
  -H "Content-Type: application/json" \
  -d '{
    "type_iae": "HAI",
    "description": "Nouvelle haie plantée en 2024 (charme, noisetier, érable)",
    "longueur_m": 120.0
  }'
```

**Réponse (201)** :
```json
{
  "id": "...",
  "ferme_id": "00000000-0000-0000-0000-000000000001",
  "type_iae": "HAI",
  "description": "Nouvelle haie plantée en 2024 (charme, noisetier, érable)",
  "longueur_m": 120.0,
  "bonus_pct": 1.2,
  "created_at": "2025-06-30T..."
}
```

### Mettre à jour une IAE

```bash
curl -X PUT "http://localhost:8000/api/v1/fermes/.../iae/..." \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Haie élargie en 2025",
    "longueur_m": 135.0
  }'
```

### Supprimer une IAE

```bash
curl -X DELETE "http://localhost:8000/api/v1/fermes/.../iae/..."
```

---

## Références

### Liste des produits Agribalyse

```bash
curl -X GET "http://localhost:8000/api/v1/reference/produits" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "items": [
    {
      "code_agb": "AGB-001",
      "nom_produit_fr": "Blé tendre conventionnel",
      "groupe_aliment": "Céréales",
      "sous_groupe": "Blé",
      "dqr": 1.8,
      "score_unique_ef": 0.118,
      "changement_climatique": 0.270
    }
  ],
  "total": 31
}
```

### Rechercher un produit Agribalyse

```bash
curl -X GET "http://localhost:8000/api/v1/reference/produits?q=blé" \
  -H "Accept: application/json"
```

### Détail d'un produit Agribalyse

```bash
curl -X GET "http://localhost:8000/api/v1/reference/produits/AGB-001" \
  -H "Accept: application/json"
```

**Réponse (200)** : Le produit avec tous ses indicateurs PEF.

### Mapping Cultures PAC → Agribalyse

```bash
curl -X GET "http://localhost:8000/api/v1/reference/mapping?code=BLE" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "code_culture_pac": "BLE",
  "nom_culture": "BLE tendre",
  "code_agb": "AGB-001",
  "nom_produit_agb": "Blé tendre conventionnel",
  "rendement_moyen_conv_kg_ha": 7200,
  "rendement_moyen_bio_kg_ha": 3800,
  "source_rendement": "Agreste Statistique Agricole Annuelle 2023"
}
```

### Liste complète du mapping

```bash
curl -X GET "http://localhost:8000/api/v1/reference/mapping" \
  -H "Accept: application/json"
```

### Coefficients IAE

```bash
curl -X GET "http://localhost:8000/api/v1/reference/iae-coefficients" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "version": "1.0.0",
  "coefficients": {
    "HAI": {
      "nom": "Haie",
      "bonus_unitaire": 0.015,
      "bonus_max": 5.0,
      "unite": "mètre linéaire par ha de SAU"
    },
    "AGF": {
      "nom": "Agroforesterie",
      "bonus_unitaire": 0.035,
      "bonus_max": 10.0,
      "unite": "ha d'agroforesterie"
    }
  }
}
```

### Liste des codes cultures PAC

```bash
curl -X GET "http://localhost:8000/api/v1/reference/cultures-pac" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "items": ["BLE", "ORH", "MAI", "COL", "TOU", "POI", "VRC", "POM", "..."]
}
```

### Facteurs de normalisation et pondération PEF

```bash
curl -X GET "http://localhost:8000/api/v1/reference/facteurs-pef" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "version": "PEF 3.1",
  "facteurs": [
    {
      "code": "CC",
      "nom": "Changement climatique",
      "unite": "kg CO2 eq",
      "facteur_normalisation": 8100.0,
      "facteur_ponderation": 0.2106
    }
  ]
}
```

---

## Santé

### Health check

```bash
curl -X GET "http://localhost:8000/api/v1/health" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected"
}
```

### Version de l'API

```bash
curl -X GET "http://localhost:8000/api/v1/version" \
  -H "Accept: application/json"
```

**Réponse (200)** :
```json
{
  "api_version": "1.0.0",
  "methode_version": "1.0.0",
  "agribalyse_version": "v3.2",
  "pef_version": "3.1"
}
```

---

## Notes d'implémentation

### Format des géométries

Les géométries utilisent le format **GeoJSON** (RFC 7946) en SRID 4326 (WGS84).

```json
{
  "geometrie": {
    "type": "Polygon",
    "coordinates": [[[long, lat], ...]]
  }
}
```

### Types d'agriculture

Valeurs acceptées pour le champ `type_agriculture` :
- `CONVENTIONNEL` — agriculture conventionnelle
- `BIO` — agriculture biologique certifiée AB
- `CONVERSION_BIO` — en conversion vers l'agriculture biologique
- `HVE` — certification Haute Valeur Environnementale

### Types d'IAE

Valeurs acceptées pour le champ `type_iae` :
- `HAI` — Haie
- `ARB` — Arbre isolé
- `BQT` — Bosquet
- `MAR` — Mare
- `FOS` — Fossé enherbé
- `BEN` — Bande enherbée
- `JFL` — Jachère fleurie
- `MUR` — Muret en pierre sèche
- `AGF` — Agroforesterie
- `VHT` — Verger hautes tiges
- `ZHU` — Zone humide

### Codes cultures PAC courants

| Code | Culture | Code | Culture |
|------|---------|------|---------|
| BLE | Blé tendre | BLE/BIO | Blé tendre bio |
| ORH | Orge d'hiver | ORP | Orge de printemps |
| MAI | Maïs grain | MAI/BIO | Maïs grain bio |
| COL | Colza | TOU | Tournesol |
| POI | Pois protéagineux | PDT | Pomme de terre |
| BET | Betterave sucrière | MIS | Maïs ensilage |
| PPH | Prairie permanente | PRT | Prairie temporaire |
| VRC | Vigne cuve | POM | Pommes |
| FEVE | Féverole | SOJ | Soja |
| BOV | Vache laitière | VOL | Volailles |
