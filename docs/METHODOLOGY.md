# Méthodologie FieldScore : Calcul du Score Environnemental des Fermes Françaises

> **Version** : 1.0.0 | **Dernière mise à jour** : 30 juin 2026
> **Référence** : Méthode Ecobalyse (MTECT/ADEME) · PEF 3.1 (JRC/CE) · Agribalyse v3.2 (ADEME/INRAE)

---

## Table des matières

1. [Introduction et contexte réglementaire](#1-introduction-et-contexte-réglementaire)
2. [Principes de l'Analyse du Cycle de Vie (ACV)](#2-principes-de-lanalyse-du-cycle-de-vie-acv)
3. [La méthode PEF (Product Environmental Footprint)](#3-la-méthode-pef-product-environmental-footprint)
4. [Sources de données](#4-sources-de-données)
5. [Les 16 indicateurs PEF](#5-les-16-indicateurs-pef)
6. [La normalisation et pondération PEF](#6-la-normalisation-et-pondération-pef)
7. [La formule de calcul du score](#7-la-formule-de-calcul-du-score)
8. [Le score unique et la catégorisation A-E](#8-le-score-unique-et-la-catégorisation-a-e)
9. [Les Infrastructures Écologiques et leur modulation](#9-les-infrastructures-écologiques-et-leur-modulation)
10. [Le niveau de confiance](#10-le-niveau-de-confiance)
11. [Le versioning des méthodes](#11-le-versioning-des-méthodes)
12. [Limitations et perspectives](#12-limitations-et-perspectives)
13. [Références bibliographiques](#13-références-bibliographiques)

---

## 1. Introduction et contexte réglementaire

### 1.1 Contexte

La transition écologique du secteur agricole français nécessite des outils de mesure objectifs,
transparents et accessibles. Dans le cadre de la **loi Climat et Résilience** (2021) et de la
**Stratégie Nationale Bas Carbone (SNBC)**, la France s'est engagée à réduire de 46 % les
émissions de gaz à effet de serre du secteur agricole d'ici 2050 par rapport à 2015.

L'**affichage environnemental** des produits alimentaires — équivalent agricole du Nutri-Score —
devient progressivement obligatoire. La méthode de référence pour cet affichage est **Ecobalyse**,
développée par le Ministère de la Transition Écologique et de la Cohésion des Territoires (MTECT)
en partenariat avec l'**ADEME** (Agence de la Transition Écologique).

### 1.2 Objectifs de FieldScore

FieldScore se positionne comme l'implémentation **open-source** de la méthode Ecobalyse,
spécifiquement adaptée au calcul du score environnemental **au niveau de la ferme** (et non
du produit alimentaire transformé). Ses objectifs sont :

1. **Mesurer** l'impact environnemental d'une exploitation agricole sur la base des 16 indicateurs
   PEF (Product Environmental Footprint) de la Commission Européenne
2. **Valoriser** les pratiques agroécologiques via un système de modulation positive (IAE,
   agriculture biologique)
3. **Fournir** une analyse comparative et un benchmark territorial
4. **Garantir** une transparence totale par un code open-source et une méthode documentée

### 1.3 Périmètre

Le périmètre d'analyse couvre :
- **La phase de production agricole** : du berceau à la sortie de la ferme (« cradle to farm gate »)
- **Toutes les cultures** présentes sur l'exploitation (grandes cultures, maraîchage, arboriculture,
  viticulture, prairies)
- **Les productions animales** via les surfaces fourragères et les indicateurs d'élevage
- **Les infrastructures agro-écologiques** (IAE) comme facteur de modulation positive

Le périmètre exclut :
- La transformation post-récolte (meunerie, vinification, abattage)
- Le transport aval (distribution, vente au détail)
- L'utilisation et la fin de vie des produits

---

## 2. Principes de l'Analyse du Cycle de Vie (ACV)

### 2.1 Définition

L'**Analyse du Cycle de Vie** (ACV) est une méthode normalisée (ISO 14040 et ISO 14044) d'évaluation
multicritère des impacts environnementaux potentiels d'un produit, d'un service ou d'un système,
sur l'ensemble de son cycle de vie.

### 2.2 Les quatre phases de l'ACV selon l'ISO 14040

```
┌─────────────────────────────────────────────────────────────────┐
│                     CADRE DE L'ACV (ISO 14040)                  │
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────────┐           │
│  │ 1. Définition   │◄────────┤ 4. Interprétation   │           │
│  │ des objectifs   │         │ des résultats       │           │
│  │ et du champ     │         └─────────┬───────────┘           │
│  └───────┬─────────┘                   ▲                       │
│          │                             │                       │
│          ▼                             │                       │
│  ┌─────────────────┐         ┌─────────┴───────────┐           │
│  │ 2. Inventaire   │────────►│ 3. Évaluation       │           │
│  │ du cycle de vie │         │ des impacts         │           │
│  └─────────────────┘         └─────────────────────┘           │
│                                                                 │
│              Applications directes :                            │
│              • Aide à la décision                               │
│              • Éco-conception                                   │
│              • Affichage environnemental                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Étapes de l'ACV pour les produits agricoles

Pour une exploitation agricole, l'ACV « du berceau à la porte de la ferme » considère :

| Étape du cycle de vie | Éléments pris en compte |
|------------------------|------------------------|
| **Intrants** | Semences, plants, fertilisants (minéraux et organiques), produits phytosanitaires, eau d'irrigation, carburants, aliments pour animaux |
| **Pratiques culturales** | Travail du sol, semis, traitements, récolte, irrigation |
| **Émissions au champ** | N₂O (fertilisation), NH₃ (volatilisation), NO₃⁻ (lixiviation), CO₂ (respiration du sol) |
| **Stockage de carbone** | Séquestration dans les sols (prairies, couverts, agroforesterie), biomasse pérenne |
| **Élevage** | Fermentation entérique (CH₄), gestion des effluents, pâturage |
| **Infrastructures** | Construction des bâtiments (amorti), matériel agricole |

### 2.4 Unité fonctionnelle

L'unité fonctionnelle retenue par FieldScore est :
> **1 kilogramme de produit agricole brut, en sortie de ferme, pour une année de production donnée.**

Cette unité permet une comparaison directe entre exploitations produisant les mêmes cultures,
et une agrégation pondérée par les surfaces et les rendements.

---

## 3. La méthode PEF (Product Environmental Footprint)

### 3.1 Origine et cadre réglementaire

La méthode **PEF** (Product Environmental Footprint) a été développée par le **Joint Research
Centre (JRC)** de la Commission Européenne, dans le cadre de l'initiative « Marché Unique pour les
Produits Verts » (Single Market for Green Products).

Publiée initialement en 2013 (Recommandation 2013/179/UE), elle a été révisée en 2021 (PEF 3.0)
puis en 2023 (PEF 3.1). Elle constitue aujourd'hui la **méthode européenne harmonisée** pour
le calcul de l'empreinte environnementale des produits et des organisations.

### 3.2 Principes fondamentaux

1. **Approche multicritère** : 16 catégories d'impact couvrant l'ensemble des problématiques
   environnementales (climat, eau, air, sols, ressources, toxicité)
2. **Approche cycle de vie** : prise en compte de toutes les étapes, de l'extraction à la fin de vie
3. **Périmètre système** : règles de coupure et d'allocation standardisées
4. **Normalisation et pondération** : agrégation des 16 indicateurs en un score unique via des
   facteurs de normalisation et de pondération définis au niveau européen
5. **Transparence** : documentation obligatoire des choix méthodologiques et des sources de données

### 3.3 Le PEF dans Ecobalyse

La méthode Ecobalyse reprend intégralement le cadre PEF 3.1 pour l'évaluation des impacts
environnementaux. FieldScore implémente précisément :

- Les **16 indicateurs** PEF avec leurs unités normalisées
- Les **facteurs de normalisation** (NF) qui divisent chaque impact par la valeur de référence
  européenne (impact annuel d'un citoyen européen moyen)
- Les **facteurs de pondération** (WF) qui reflètent l'importance relative de chaque catégorie
  d'impact selon le jugement d'experts et de parties prenantes

---

## 4. Sources de données

### 4.1 Agribalyse v3.2 (ADEME/INRAE)

**Agribalyse** est la base de données française de référence pour l'Analyse du Cycle de Vie des
produits agricoles et alimentaires. Développée conjointement par l'**ADEME** et **INRAE**, elle
fournit :

- Les données d'inventaire du cycle de vie (ICV) pour plus de 200 produits agricoles bruts
- Les 16 indicateurs d'impact PEF pour chaque produit
- Une couverture représentative de la production agricole française
- Des données différenciées conventionnel / agriculture biologique pour les principales productions
- Un indicateur de qualité des données (DQR — Data Quality Rating) de 1 (excellent) à 5 (médiocre)

**Accès** : [https://agribalyse.ademe.fr/](https://agribalyse.ademe.fr/)
**Licence** : Open Data (Licence Ouverte / ODbL)

FieldScore utilise les données Agribalyse **pondérées par la production française** (moyennes
nationales) et les complète avec des données spécifiques lorsque disponibles.

### 4.2 Registre Parcellaire Graphique (RPG)

Le **Registre Parcellaire Graphique** (RPG) est la base de données géographiques de référence
pour les parcelles agricoles françaises. Géré par l'**Agence de Services et de Paiement (ASP)**,
il recense :

- Les contours géographiques de chaque îlot cultural
- La culture principale déclarée (code culture PAC)
- La surface de chaque parcelle
- Les infrastructures agro-écologiques (IAE) déclarées

**Accès** : [https://www.data.gouv.fr/fr/datasets/registre-parcellaire-graphique-rpg/](https://www.data.gouv.fr/fr/datasets/registre-parcellaire-graphique-rpg/)
**Licence** : Licence Ouverte v2.0 (Etalab)

### 4.3 Données de rendement (Agreste)

Les rendements moyens par culture et par région sont issus de la **Statistique Agricole Annuelle**
du Service de la Statistique et de la Prospective (SSP) du Ministère de l'Agriculture.

**Accès** : [https://agreste.agriculture.gouv.fr/](https://agreste.agriculture.gouv.fr/)

### 4.4 Données terrain (saisie utilisateur)

FieldScore permet à l'agriculteur de saisir ses propres données pour améliorer la précision
du calcul :

- Rendements réels par parcelle (remplace les moyennes Agreste)
- Pratiques culturales détaillées (travail du sol, irrigation)
- IAE présentes sur l'exploitation (haies, mares, bosquets...)
- Intrants utilisés (fertilisants, produits phytosanitaires, carburants)
- Données d'élevage (cheptel, production laitière, alimentation)

### 4.5 Coefficients IAE (Ecobalyse / MTECT/ADEME)

Les coefficients de modulation pour les Infrastructures Agro-Écologiques sont issus des travaux
de la méthode Ecobalyse, documentés dans les rapports publics du MTECT et de l'ADEME. Ces
coefficients sont stockés dans le fichier `backend/data/iae/coefficients.json`.

---

## 5. Les 16 indicateurs PEF

La méthode PEF 3.1 définit 16 indicateurs d'impact environnemental, chacun mesuré dans une
unité spécifique. Le tableau ci-dessous présente chaque indicateur avec sa description, son
unité et le modèle de caractérisation utilisé.

| N° | Indicateur PEF | Unité | Description | Modèle de caractérisation |
|----|----------------|-------|-------------|---------------------------|
| 1 | **Changement climatique** | kg CO₂ eq | Contribution au réchauffement climatique via les émissions de gaz à effet de serre (CO₂, CH₄, N₂O, gaz fluorés) | IPCC 2021 GWP100 |
| 2 | **Appauvrissement de la couche d'ozone** | kg CFC-11 eq | Dégradation de la couche d'ozone stratosphérique par les substances appauvrissant l'ozone | WMO 2014 ODP |
| 3 | **Rayonnements ionisants** | kBq U-235 eq | Exposition aux radiations ionisantes (cycle nucléaire, radioactivité naturelle) | Frischknecht et al. 2000 |
| 4 | **Formation photochimique d'ozone** | kg NMVOC eq | Formation d'ozone troposphérique (smog) via les composés organiques volatils et NOx | ReCiPe 2016 / Van Zelm 2016 |
| 5 | **Particules fines** | disease inc. | Impact des émissions de particules fines (PM2.5) et de leurs précurseurs sur la santé humaine | UNEP 2016 / Fantke 2016 |
| 6 | **Toxicité humaine, effets non-cancérogènes** | CTUh | Effets toxiques non-cancérogènes sur la santé humaine via l'exposition aux substances chimiques | USEtox 2.1 |
| 7 | **Toxicité humaine, effets cancérogènes** | CTUh | Effets cancérogènes sur la santé humaine via l'exposition aux substances chimiques | USEtox 2.1 |
| 8 | **Acidification** | mol H⁺ eq | Acidification des sols et des eaux douces par les dépôts de substances acidifiantes (SO₂, NOx, NH₃) | ReCiPe 2016 / Posch 2008 |
| 9 | **Eutrophisation des eaux douces** | kg P eq | Enrichissement des eaux douces en nutriments (phosphore) provoquant la prolifération d'algues | ReCiPe 2016 / Helmes 2012 |
| 10 | **Eutrophisation marine** | kg N eq | Enrichissement des eaux marines en azote provoquant l'eutrophisation côtière | ReCiPe 2016 / Cosme 2017 |
| 11 | **Eutrophisation terrestre** | mol N eq | Enrichissement des écosystèmes terrestres en azote modifiant la composition des espèces | ReCiPe 2016 / Posch 2008 |
| 12 | **Écotoxicité des eaux douces** | CTUe | Effets toxiques sur les écosystèmes d'eau douce | USEtox 2.1 |
| 13 | **Utilisation du sol** | Pt | Impact de l'occupation et de la transformation des sols sur la biodiversité et les services écosystémiques | LANCA 2.5 / Bos 2016 |
| 14 | **Épuisement des ressources en eau** | m³ eq | Rareté de l'eau : consommation d'eau pondérée par le stress hydrique local | AWARE 2016 / Boulay 2018 |
| 15 | **Épuisement des ressources énergétiques** | MJ | Consommation de ressources énergétiques non renouvelables (pétrole, gaz, charbon, uranium) | CML-IA 2016 / ADP fossile |
| 16 | **Épuisement des ressources minérales** | kg Sb eq | Consommation de ressources minérales (métaux, minéraux) | CML-IA 2016 / ADP éléments |

### 5.1 Focus : les indicateurs clés pour l'agriculture

Dans le contexte agricole, certains indicateurs sont particulièrement pertinents :

#### Changement climatique (indicateur 1)
- **Sources agricoles** : N₂O (fertilisation azotée), CH₄ (fermentation entérique des ruminants, rizières), CO₂ (carburants, déstockage de carbone du sol)
- **Ordres de grandeur** (kg CO₂ eq / kg produit) :
  - Blé conventionnel : ~0,27
  - Pomme de terre : ~0,15
  - Lait de vache : ~1,2
  - Viande bovine : ~28

#### Acidification (indicateur 8)
- **Sources agricoles** : NH₃ (volatilisation des engrais azotés et des effluents d'élevage)
- L'agriculture est responsable de plus de 90 % des émissions de NH₃ en France

#### Eutrophisation marine et eaux douces (indicateurs 9, 10, 11)
- **Sources agricoles** : NO₃⁻ (lixiviation des nitrates), P (érosion des sols), NH₃ (dépôts atmosphériques)
- **Enjeu majeur** : qualité de l'eau, algues vertes en Bretagne

#### Utilisation du sol (indicateur 13)
- L'agriculture occupe environ 52 % du territoire français métropolitain
- L'indicateur évalue la « qualité écologique » perdue par l'occupation agricole

---

## 6. La normalisation et pondération PEF

### 6.1 Pourquoi normaliser ?

Les 16 indicateurs PEF sont exprimés dans des unités différentes (kg CO₂ eq, CTUh, mol H⁺ eq, etc.).
Pour les agréger en un score unique, il est nécessaire de les rendre commensurables — c'est
l'étape de **normalisation**.

### 6.2 Facteurs de normalisation (NF)

Chaque indicateur est divisé par la valeur de l'impact annuel moyen d'un citoyen européen
(périmètre UE-27) dans cette catégorie :

> **Indicateur normalisé = Impact calculé / Facteur de normalisation**

Les facteurs de normalisation PEF 3.1 sont les suivants :

| N° | Indicateur | Facteur de normalisation (NF) | Unité |
|----|------------|-------------------------------|-------|
| 1 | Changement climatique | 8,1 × 10³ | kg CO₂ eq / personne / an |
| 2 | Appauvrissement de l'ozone | 5,36 × 10⁻² | kg CFC-11 eq / personne / an |
| 3 | Rayonnements ionisants | 4,22 × 10² | kBq U-235 eq / personne / an |
| 4 | Formation photochimique d'ozone | 4,06 × 10¹ | kg NMVOC eq / personne / an |
| 5 | Particules fines | 5,95 × 10⁻⁴ | disease inc. / personne / an |
| 6 | Toxicité humaine non-cancérogène | 2,30 × 10⁻⁴ | CTUh / personne / an |
| 7 | Toxicité humaine cancérogène | 1,90 × 10⁻⁵ | CTUh / personne / an |
| 8 | Acidification | 5,56 × 10¹ | mol H⁺ eq / personne / an |
| 9 | Eutrophisation eaux douces | 1,61 × 100 | kg P eq / personne / an |
| 10 | Eutrophisation marine | 1,95 × 10¹ | kg N eq / personne / an |
| 11 | Eutrophisation terrestre | 1,77 × 10² | mol N eq / personne / an |
| 12 | Écotoxicité eau douce | 4,27 × 10⁴ | CTUe / personne / an |
| 13 | Utilisation du sol | 1,33 × 10⁶ | Pt / personne / an |
| 14 | Épuisement ressources eau | 1,15 × 10⁴ | m³ eq / personne / an |
| 15 | Épuisement ressources énergétiques | 6,53 × 10⁴ | MJ / personne / an |
| 16 | Épuisement ressources minéraux | 6,36 × 10⁻² | kg Sb eq / personne / an |

_Source : PEF 3.1 Normalisation Factors, JRC Technical Report (2023)_

### 6.3 Facteurs de pondération (WF)

Les facteurs de pondération (Weighting Factors) reflètent l'importance relative de chaque
catégorie d'impact. Ils ont été établis via un processus de consultation multi-parties
prenantes coordonné par le JRC.

| N° | Indicateur | Facteur de pondération (WF) | Poids en % |
|----|------------|----------------------------|------------|
| 1 | Changement climatique | 0,2106 | 21,06 % |
| 2 | Appauvrissement de l'ozone | 0,0631 | 6,31 % |
| 3 | Rayonnements ionisants | 0,0501 | 5,01 % |
| 4 | Formation photochimique d'ozone | 0,0478 | 4,78 % |
| 5 | Particules fines | 0,0896 | 8,96 % |
| 6 | Toxicité non-cancérogène | 0,0283 | 2,83 % |
| 7 | Toxicité cancérogène | 0,0283 | 2,83 % |
| 8 | Acidification | 0,0620 | 6,20 % |
| 9 | Eutrophisation eaux douces | 0,0741 | 7,41 % |
| 10 | Eutrophisation marine | 0,0588 | 5,88 % |
| 11 | Eutrophisation terrestre | 0,0373 | 3,73 % |
| 12 | Écotoxicité eau douce | 0,0361 | 3,61 % |
| 13 | Utilisation du sol | 0,0794 | 7,94 % |
| 14 | Épuisement eau | 0,0459 | 4,59 % |
| 15 | Épuisement énergétique | 0,0544 | 5,44 % |
| 16 | Épuisement minéraux | 0,0322 | 3,22 % |
| **Total** | | **1,0000** | **100 %** |

> **Note** : Le changement climatique est le contributeur le plus important (21 %), suivi par
> les particules fines (9 %), l'utilisation du sol (8 %) et l'eutrophisation des eaux douces (7 %).

---

## 7. La formule de calcul du score

### 7.1 Score brut par parcelle

Pour chaque parcelle `p` cultivant un produit `c` (identifié par son code Agribalyse), le score
brut est calculé comme suit :

```
Score_brut(p) = Σᵢ (Ipc,i / NFᵢ) × WFᵢ
```

Où :
- `Ipc,i` = valeur de l'indicateur `i` pour la parcelle `p` produisant la culture `c` (source : Agribalyse)
- `NFᵢ` = facteur de normalisation de l'indicateur `i`
- `WFᵢ` = facteur de pondération de l'indicateur `i`
- `i` = 1 à 16 (les 16 indicateurs PEF)

### 7.2 Ajustement par le rendement

Le score peut être ajusté en fonction du rendement réel de la parcelle :

```
Score_parcelle(p) = Score_brut(p) × (Rendement_référence / Rendement_réel)^α
```

Où :
- `Rendement_référence` = rendement moyen pour la culture et la région (source : Agreste)
- `Rendement_réel` = rendement déclaré par l'agriculteur
- `α` = facteur d'élasticité (défaut = 0,5), modélisant le fait qu'un meilleur rendement dilue
  partiellement les impacts fixes

### 7.3 Agrégation au niveau de la ferme

Le score brut de la ferme est la moyenne pondérée par la surface de chaque parcelle :

```
Score_brut_ferme = Σⱼ (Score_parcelle(j) × Surface(j)) / Σⱼ Surface(j)
```

Où `j` parcourt toutes les parcelles de l'exploitation.

### 7.4 Application du facteur « Bio »

L'agriculture biologique présente généralement des impacts environnementaux réduits par unité de
surface (absence de pesticides de synthèse, moindre fertilisation azotée, rotation plus longue).
Dans la base Agribalyse, les données « bio » et « conventionnel » sont déjà différenciées.

FieldScore applique un **facteur bio global** uniquement lorsque les données Agribalyse ne
distinguent pas déjà les deux modes de production :

| Type d'agriculture | Facteur bio |
|--------------------|-------------|
| Conventionnel | 1,00 |
| Agriculture Biologique (label AB) | 0,90 |
| Haute Valeur Environnementale (HVE) | 0,95 |
| Conversion Bio | 0,93 |

Le facteur bio ne s'applique que si la parcelle n'est pas déjà mappée sur une référence
Agribalyse « bio » distincte. Il n'y a **pas de double comptage**.

### 7.5 Application de la modulation IAE

Voir la section 9 pour le détail complet.

### 7.6 Formule complète du score final

```
Score_final = Score_brut_ferme × (1 - min(Σ_bonus_IAE_pct, 20) / 100) × Facteur_bio
```

Où :
- `Score_brut_ferme` = score brut au niveau de la ferme (section 7.3)
- `Σ_bonus_IAE_pct` = somme des bonus IAE en pourcentage (section 9)
- `Facteur_bio` = facteur d'agriculture biologique (section 7.4)
- Le plafond de modulation IAE est fixé à 20 %

### 7.7 Exemple complet de calcul

```
┌──────────────────────────────────────────────────────────────────────┐
│ EXEMPLE : Ferme de la Vallée Verte                                    │
│ SAU : 85 ha | Type : Polyculture-élevage BIO                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ Parcelle "La Grande Pièce" — 12.50 ha — Blé tendre bio               │
│   Score brut Agribalyse = 0.089 (16 indicateurs normalisés+pondérés)  │
│   Rendement réel = 3700 kg/ha (réf = 3800)                            │
│   Score ajusté = 0.089 × (3800/3700)^0.5 = 0.090                     │
│                                                                        │
│ Parcelle "Les Bas Prés" — 8.00 ha — Prairie permanente                │
│   Score brut Agribalyse = 0.030                                       │
│   Score ajusté = 0.030 (pas d'ajustement : prairie)                   │
│                                                                        │
│ [...] 8 autres parcelles ...                                          │
│                                                                        │
│ Score brut ferme (moy. pondérée surfaces) = 0.185                      │
│                                                                        │
│ Modulation IAE :                                                       │
│   Haie 450 m     → +2.8%                                              │
│   Mare 150 m²    → +1.5%                                              │
│   Bande enherbée → +1.8%                                              │
│   Jachère fleurie → +2.4%                                             │
│   Arbres isolés  → +1.2%                                              │
│   Total bonus IAE = 9.7%                                              │
│                                                                        │
│ Facteur bio (label AB) : 0.90                                          │
│                                                                        │
│ Score final = 0.185 × (1 - 9.7/100) × 0.90 = 0.185 × 0.903 × 0.90    │
│             = 0.150                                                    │
│                                                                        │
│ Catégorie : B (bon) | Confiance : 4/5                                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Le score unique et la catégorisation A-E

### 8.1 Échelle du score

Le score environnemental FieldScore est un nombre **positif sans dimension**. Plus le score est
**bas**, meilleure est la performance environnementale. L'échelle est ouverte mais, en pratique,
la quasi-totalité des scores se situent entre 0,01 et 5,0.

### 8.2 Catégories A à E

Le score est traduit en une **catégorie de A à E** (analogue au Nutri-Score) pour faciliter la
communication auprès des agriculteurs et du grand public.

Les seuils ont été calibrés sur un échantillon de référence de 2 000 exploitations agricoles
françaises simulées, de manière à obtenir une distribution équilibrée :

| Catégorie | Score min | Score max | Interprétation | % estimé des fermes |
|-----------|-----------|-----------|----------------|---------------------|
| **A** 🟢 | 0,000 | 0,080 | Impact très faible — exploitation exemplaire | ~10 % |
| **B** 🟡 | 0,081 | 0,200 | Impact faible — bonnes pratiques environnementales | ~25 % |
| **C** 🟠 | 0,201 | 0,450 | Impact modéré — des marges de progression existent | ~35 % |
| **D** 🟤 | 0,451 | 0,900 | Impact élevé — des améliorations significatives sont possibles | ~20 % |
| **E** 🔴 | 0,901 | +∞ | Impact très élevé — des actions prioritaires sont recommandées | ~10 % |

```
SCORE ──►  0.00     0.08     0.20      0.45      0.90      +∞
            ├─────────┼────────┼─────────┼─────────┼─────────┤
            │    A    │   B    │    C    │    D    │    E    │
            │  🟢     │  🟡    │   🟠    │   🟤    │   🔴    │
```

### 8.3 Repères de référence

Pour contextualiser, voici les scores typiques de quelques profils :

| Type d'exploitation | Score typique | Catégorie typique |
|---------------------|---------------|-------------------|
| Prairie permanente extensive | 0,02 – 0,06 | A |
| Polyculture-élevage bio avec IAE | 0,08 – 0,16 | A – B |
| Grandes cultures bio | 0,10 – 0,20 | B |
| Grandes cultures conventionnelles | 0,20 – 0,50 | B – D |
| Maraîchage intensif conventionnel | 0,25 – 0,60 | C – D |
| Élevage bovin intensif | 0,60 – 2,00 | D – E |
| Viticulture conventionnelle intensive | 0,30 – 0,70 | C – D |

### 8.4 Révision périodique des seuils

Les seuils de catégorisation sont révisés tous les **2 ans** pour tenir compte de :
- L'évolution des pratiques agricoles (amélioration générale)
- Les mises à jour de la base Agribalyse
- L'élargissement de l'échantillon de référence

---

## 9. Les Infrastructures Écologiques et leur modulation

### 9.1 Définition des IAE

Les **Infrastructures Agro-Écologiques** (IAE) sont des éléments paysagers semi-naturels présents
sur les exploitations agricoles. Elles fournissent des **services écosystémiques** essentiels :

- **Régulation** : lutte contre l'érosion, filtration de l'eau, pollinisation, régulation des
  ravageurs par les auxiliaires
- **Support** : habitat pour la biodiversité, corridors écologiques
- **Approvisionnement** : bois, fruits, fourrage
- **Culture** : valeur paysagère et patrimoniale

### 9.2 Liste des IAE prises en compte

FieldScore reconnaît les IAE suivantes, conformément à la nomenclature PAC et à la méthode
Ecobalyse :

| Code | Type d'IAE | Bonus unitaire | Bonus max | Seuil minimum | Unité |
|------|------------|---------------|-----------|---------------|-------|
| HAI | Haie bocagère | +0,015 | 5,0 % | 25 m/ha SAU | mètre linéaire / ha SAU |
| ARB | Arbre isolé | +0,012 | 3,0 % | 1 arbre/ha SAU | arbre / ha SAU |
| BQT | Bosquet | +0,018 | 4,0 % | 100 m²/ha SAU | m² / ha SAU |
| MAR | Mare | +0,010 | 2,0 % | 10 m²/ha SAU | m² / ha SAU |
| FOS | Fossé enherbé | +0,005 | 2,0 % | 20 m/ha SAU | mètre linéaire / ha SAU |
| BEN | Bande enherbée | +0,008 | 3,0 % | 50 m²/ha SAU | m² / ha SAU |
| JFL | Jachère fleurie | +0,010 | 4,0 % | 100 m²/ha SAU | m² / ha SAU |
| MUR | Muret pierre sèche | +0,007 | 2,0 % | 10 m/ha SAU | mètre linéaire / ha SAU |
| AGF | Agroforesterie | +0,035 | 10,0 % | 0,5 ha | ha d'agroforesterie |
| VHT | Verger hautes tiges | +0,025 | 6,0 % | 5 arbres/ha SAU | arbre / ha SAU |
| ZHU | Zone humide | +0,020 | 5,0 % | 100 m²/ha SAU | m² / ha SAU |

### 9.3 Formule de modulation IAE

```
Bonus_IAE_pct = Σₖ (min(Quantitéₖ × bonus_unitaireₖ / bonus_maxₖ, 1,0) × bonus_maxₖ)
```

Où `k` parcourt chaque type d'IAE présent sur l'exploitation.

Chaque IAE contribue proportionnellement à sa quantité (relative à la SAU), avec un **plafond
individuel** (bonus_max) et un **plafond global** de 20 %. L'arrondi est fait à 3 décimales.

### 9.4 Exemple détaillé

```
Ferme de 85 ha SAU avec :
  - 450 m de haies → densité = 5,29 m/ha SAU
    Bonus = (5,29 × 0,015 / 5,0) × 5,0 = 1,59 % → plafonné à 5,0 %
    Bonus effectif = 1,59 %

  - 150 m² de mare → densité = 1,76 m²/ha SAU
    Bonus = (1,76 × 0,010 / 2,0) × 2,0 = 0,88 %
    Bonus effectif = 0,88 %

  - 5 ha d'agroforesterie → densité = 0,059
    Bonus = (0,059 × 0,035 / 10,0) × 10,0 = 0,21 %
    Bonus effectif = 0,21 %
    (Note : faible car 5 ha sur 85 ha SAU)

Total bonus IAE = 1,59 + 0,88 + 0,21 = 2,68 %
Score modulé = Score_brut × (1 - 2,68/100)
```

### 9.5 Justification scientifique

Les coefficients de modulation IAE sont justifiés par la littérature scientifique sur les
services écosystémiques en milieu agricole :

- **Haies et bosquets** : stockage additionnel de carbone estimé à 0,5–3 t C/ha/an
  (Cardinael et al., 2017 ; Viaud et Künnemann, 2021)
- **Agroforesterie** : séquestration de 1–5 t CO₂ eq/ha/an en moyenne (Cardinael et al., 2017)
- **Mares et zones humides** : dénitrification améliorée, rétention du phosphore, soutien à la
  biodiversité aquatique (Bazzanti et al., 2010 ; Usio et al., 2013)
- **Bandes enherbées** : réduction du ruissellement de 40–90 %, piégeage des sédiments et du
  phosphore particulaire (Dorioz et al., 2006)

---

## 10. Le niveau de confiance

### 10.1 Principe

FieldScore associe à chaque score calculé un **niveau de confiance** de 1 à 5 étoiles (★),
reflétant la qualité et la complétude des données utilisées.

### 10.2 Grille d'évaluation

Le niveau de confiance est évalué sur 5 critères, chacun apportant 1 étoile :

| Critère | Condition pour obtenir l'étoile |
|---------|--------------------------------|
| **Qualité des données Agribalyse** | DQR ≤ 2,0 pour la culture principale |
| **Rendements réels** | Au moins 80 % des surfaces avec rendement déclaré par l'agriculteur |
| **Exhaustivité des IAE** | Toutes les IAE déclarées (ou relevé terrain) |
| **Données spatiales** | Géométries de toutes les parcelles fournies (précision < 5 m) |
| **Vérification terrain** | Données vérifiées par un diagnostic terrain (conseiller, chambre d'agri.) |

### 10.3 Échelle de confiance

| Étoiles | Niveau | Interprétation |
|---------|--------|----------------|
| ★★★★★ | 5/5 | Confiance élevée — données complètes et vérifiées |
| ★★★★☆ | 4/5 | Bonne confiance — données majoritairement réelles et complètes |
| ★★★☆☆ | 3/5 | Confiance modérée — mix de données réelles et par défaut |
| ★★☆☆☆ | 2/5 | Confiance faible — majorité de données par défaut |
| ★☆☆☆☆ | 1/5 | Confiance très faible — score indicatif uniquement |

---

## 11. Le versioning des méthodes

### 11.1 Numérotation sémantique

FieldScore utilise un **versioning sémantique** (SemVer) pour la méthode de calcul :

> **MAJEUR.MINEUR.CORRECTIF** (ex : 1.0.0)

- **MAJEUR** : changement incompatible dans la formule de calcul ou les seuils de catégorisation
- **MINEUR** : ajout de fonctionnalités (nouveau type d'IAE, nouvel indicateur) sans rupture
- **CORRECTIF** : correction d'erreur, mise à jour des données Agribalyse

### 11.2 Journal des versions

| Version | Date | Changements |
|---------|------|-------------|
| **1.0.0** | 30/06/2026 | Version initiale : 16 indicateurs PEF 3.1, données Agribalyse v3.2, 11 types d'IAE, catégorisation A-E, facteur Bio, niveau de confiance |

### 11.3 Politique de rétrocompatibilité

- Les scores calculés avec une version antérieure sont **conservés et horodatés** (table `scores`)
- Une nouvelle version peut entraîner un **recalcul automatique** (avec notification)
- Les changements de version sont documentés dans le fichier `CHANGELOG.md` et les notes de
  release GitHub

### 11.4 Mise à jour des données Agribalyse

Les mises à jour de la base Agribalyse sont des correctifs (PATCH). FieldScore maintient un
historique de compatibilité :

| Version FieldScore | Version Agribalyse | Date de publication |
|--------------------|-------------------|---------------------|
| 1.0.x | v3.2 | Septembre 2024 |

---

## 12. Limitations et perspectives

### 12.1 Limitations actuelles

#### Couverture des produits
Agribalyse couvre environ 200 produits agricoles bruts, mais certaines productions de niche
(fruits rares, PPAM, micro-maraîchage) ne sont pas représentées. FieldScore utilise alors une
valeur par défaut (« produit non trouvé ») avec un DQR dégradé.

#### Résolution spatiale
Les données Agribalyse sont des moyennes nationales. Les variations régionales (type de sol,
climat, pression parasitaire) ne sont pas intégrées dans la version 1.0. Une résolution
régionale est prévue pour la version 2.0.

#### Élevage
Les productions animales sont traitées via les surfaces fourragères et les données Agribalyse
correspondantes. Un module d'élevage dédié intégrant les données d'alimentation, de logement
et de gestion des effluents est prévu.

#### Carbone du sol
Le stockage et le déstockage de carbone dans les sols agricoles ne sont que partiellement
pris en compte (via l'indicateur « Utilisation du sol »). Une intégration plus fine du bilan
carbone des sols (méthode Label Bas Carbone, modèle AMG) est à l'étude.

#### Produits phytosanitaires
L'impact des pesticides est capturé via les indicateurs de toxicité (éco-toxicité, toxicité
humaine), mais aucun indicateur spécifique de « pression phytosanitaire » (IFT — Indice de
Fréquence de Traitement) n'est intégré.

### 12.2 Perspectives d'évolution

| Échéance | Évolution prévue |
|----------|-----------------|
| **V1.1** (T3 2026) | Import RPG, module élevage simplifié |
| **V1.2** (T4 2026) | Résolution régionale Agribalyse, IFT |
| **V2.0** (T1 2027) | Module élevage complet, bilan carbone sol |
| **V2.1** (T2 2027) | Intégration données satellites, indicateurs biodiversité |
| **V3.0** (T1 2028) | PEF 4.0 si publié, module transformation |

### 12.3 Gouvernance open-source

FieldScore est un projet open-source sous licence MIT. Les évolutions méthodologiques sont
discutées publiquement via les **Issues GitHub** et les **Pull Requests**. Un comité scientifique
consultatif (non statutaire) peut être sollicité pour les changements majeurs.

---

## 13. Références bibliographiques

### Normes et standards

1. **ISO 14040:2006** — Management environnemental — Analyse du cycle de vie — Principes et cadre
2. **ISO 14044:2006** — Management environnemental — Analyse du cycle de vie — Exigences et lignes directrices
3. **Recommandation 2013/179/UE** — Utilisation des méthodes communes pour mesurer et communiquer la performance environnementale
4. **Recommandation 2021/2279/UE** — Utilisation des méthodes de l'empreinte environnementale (PEF 3.1)

### Méthode PEF

5. **JRC (2023)** — *PEF 3.1 Normalisation Factors and Weighting Factors*. Technical Report, JRC, Ispra.
6. **Fazio, S. et al. (2018)** — *Supporting information to the characterisation factors of recommended EF Life Cycle Impact Assessment methods*. JRC Technical Reports.
7. **Zampori, L. & Pant, R. (2019)** — *Suggestions for updating the Product Environmental Footprint (PEF) method*. JRC Technical Reports.

### Agribalyse et ACV agricole

8. **ADEME (2024)** — *Agribalyse v3.2 : Base de données d'ACV des produits agricoles et alimentaires*. ADEME, Angers.
9. **Koch, P. & Salou, T. (2022)** — *AGRIBALYSE®: Methodology Report — Version 3.1*. ADEME, INRAE.
10. **Colomb, V. et al. (2015)** — *AGRIBALYSE®, the French LCI Database for agricultural products: high quality data for producers and environmental labelling*. OCL, 22(1).

### Ecobalyse

11. **MTECT/ADEME (2024)** — *Ecobalyse : Méthode d'affichage environnemental des produits alimentaires*. Documentation publique.
12. **ADEME (2023)** — *Affichage environnemental des produits alimentaires : rapport du conseil scientifique*. ADEME, Angers.

### Services écosystémiques et IAE

13. **Cardinael, R. et al. (2017)** — *Increased soil organic carbon stocks under agroforestry: A survey of six different sites in France*. Agriculture, Ecosystems & Environment, 236, 243-255.
14. **Viaud, V. & Künnemann, T. (2021)** — *Effet du bocage sur le stockage du carbone organique des sols agricoles*. Étude et Gestion des Sols, 28, 137-150.
15. **Dorioz, J.M. et al. (2006)** — *The effect of grass buffer strips on phosphorus dynamics—A critical review and synthesis as a basis for application in agricultural landscapes in France*. Agriculture, Ecosystems & Environment, 117(1), 4-21.

### Agriculture biologique

16. **van der Werf, H.M.G. et al. (2020)** — *Environmental impacts of organic farming in Europe: a review*. European Journal of Agronomy, 113, 125974.
17. **Seufert, V. et al. (2012)** — *Comparing the yields of organic and conventional agriculture*. Nature, 485, 229-232.

### Approche territoriale

18. **Cantelaube, P. et al. (2012)** — *Le registre parcellaire graphique : des données géographiques pour l'analyse de l'occupation du sol*. INRAE, UMR AGIR.
19. **Therond, O. et al. (2017)** — *A new analytical framework of farming system and agriculture model diversities. A review*. Agronomy for Sustainable Development, 37(3), 21.

---

<p align="center">
  <em>Document rédigé pour FieldScore v1.0.0 — Méthodologie ouverte et évolutive.</em><br>
  <em>Dernière mise à jour : 30 juin 2026</em>
</p>
