// ============================================================
// FieldScore API Types — correspondance avec backend FastAPI
// ============================================================

// --- Énumérations ---

export type CategorieProduction =
  | "grandes_cultures"
  | "maraichage"
  | "arboriculture"
  | "viticulture"
  | "elevage_bovin"
  | "elevage_ovin_caprin"
  | "elevage_porcin"
  | "elevage_avicole"
  | "polyculture_elevage"
  | "autre";

export type CategorieScore = "A" | "B" | "C" | "D" | "E";

export type NiveauConfiance = "eleve" | "moyen" | "faible";

export type TypeIAE =
  | "haie"
  | "mare"
  | "bosquet"
  | "bande_enherbee"
  | "mur_pierre_seche"
  | "fosse"
  | "prairie_permanente"
  | "verger_haute_tige"
  | "agroforesterie"
  | "jachere"
  | "muret"
  | "arbre_isole"
  | "autre";

// --- Les 16 indicateurs PEF ---

export interface IndicateurDefinition {
  trigramme: string;
  nom: string;
  unite: string;
  description: string;
  poids_global: number; // 0-1, somme = 1 sur les 16
}

export const INDICATEURS_PEF: IndicateurDefinition[] = [
  {
    trigramme: "CC",
    nom: "Changement climatique",
    unite: "kg CO₂ eq",
    description:
      "Émissions de gaz à effet de serre sur l'ensemble du cycle de vie du produit agricole.",
    poids_global: 0.12,
  },
  {
    trigramme: "OD",
    nom: "Appauvrissement de la couche d'ozone",
    unite: "kg CFC-11 eq",
    description:
      "Impact des émissions de substances appauvrissant la couche d'ozone stratosphérique.",
    poids_global: 0.04,
  },
  {
    trigramme: "TA",
    nom: "Acidification terrestre",
    unite: "mol H⁺ eq",
    description:
      "Dépôts acides sur les sols et les eaux résultant des émissions de SO₂, NOx et NH₃.",
    poids_global: 0.06,
  },
  {
    trigramme: "ET",
    nom: "Eutrophisation terrestre",
    unite: "mol N eq",
    description:
      "Enrichissement excessif des sols en azote menant à la perte de biodiversité terrestre.",
    poids_global: 0.06,
  },
  {
    trigramme: "EM",
    nom: "Eutrophisation marine",
    unite: "kg N eq",
    description:
      "Enrichissement en azote des eaux côtières provoquant des blooms algaux.",
    poids_global: 0.06,
  },
  {
    trigramme: "EE",
    nom: "Eutrophisation eau douce",
    unite: "kg P eq",
    description:
      "Enrichissement des eaux douces en phosphore favorisant l'eutrophisation des lacs et rivières.",
    poids_global: 0.06,
  },
  {
    trigramme: "TO",
    nom: "Toxicité humaine, effets cancérigènes",
    unite: "CTUh",
    description:
      "Impact des substances toxiques sur la santé humaine via des effets cancérigènes.",
    poids_global: 0.06,
  },
  {
    trigramme: "TNC",
    nom: "Toxicité humaine, effets non cancérigènes",
    unite: "CTUh",
    description:
      "Impact des substances toxiques sur la santé humaine via des effets non cancérigènes.",
    poids_global: 0.06,
  },
  {
    trigramme: "PM",
    nom: "Particules fines / inorganiques",
    unite: "kg PM2.5 eq",
    description:
      "Émissions de particules fines et précurseurs affectant la santé respiratoire humaine.",
    poids_global: 0.07,
  },
  {
    trigramme: "IR",
    nom: "Rayonnements ionisants",
    unite: "kBq U-235 eq",
    description:
      "Impact des radionucléides émis sur la santé humaine et les écosystèmes.",
    poids_global: 0.04,
  },
  {
    trigramme: "OF",
    nom: "Formation d'ozone photochimique",
    unite: "kg NMVOC eq",
    description:
      "Formation d'ozone troposphérique par réaction des COV et NOx sous rayonnement solaire.",
    poids_global: 0.05,
  },
  {
    trigramme: "RU",
    nom: "Utilisation des ressources — minéraux et métaux",
    unite: "kg Sb eq",
    description:
      "Épuisement des ressources abiotiques non renouvelables (minéraux, métaux).",
    poids_global: 0.06,
  },
  {
    trigramme: "RF",
    nom: "Utilisation des ressources — énergies fossiles",
    unite: "MJ",
    description:
      "Consommation de ressources énergétiques fossiles non renouvelables.",
    poids_global: 0.08,
  },
  {
    trigramme: "EA",
    nom: "Utilisation du sol",
    unite: "Pt",
    description:
      "Impact de l'occupation et de la transformation des sols sur la biodiversité et les services écosystémiques.",
    poids_global: 0.08,
  },
  {
    trigramme: "EU",
    nom: "Utilisation de l'eau",
    unite: "m³ depriv.",
    description:
      "Volume d'eau consommé pondéré par un indice de stress hydrique local (AWARE).",
    poids_global: 0.07,
  },
  {
    trigramme: "EEc",
    nom: "Écotoxicité en eau douce",
    unite: "CTUe",
    description:
      "Impact des substances toxiques sur les écosystèmes d'eau douce.",
    poids_global: 0.05,
  },
];

// --- Modèles de données ---

export interface Ferme {
  id: number;
  nom: string;
  siret: string | null;
  code_insee: string | null;
  categorie: CategorieProduction | null;
  surface_ha: number | null;
  nb_parcelles: number;
  nb_calculs: number;
  date_creation: string;
}

export interface FermeDetail extends Ferme {
  parcelles: Parcelle[];
  infrastructures: Infrastructure[];
  derniers_calculs: CalculResume[];
}

export interface Parcelle {
  id: number;
  ferme_id: number;
  culture: string;
  surface_ha: number;
  culture_intermediaire: string | null;
  bio: boolean;
  labour: boolean;
  irrigation: boolean;
  commentaire: string | null;
}

export interface ParcelleCreate {
  culture: string;
  surface_ha: number;
  culture_intermediaire?: string | null;
  bio?: boolean;
  labour?: boolean;
  irrigation?: boolean;
  commentaire?: string | null;
}

export interface Infrastructure {
  id: number;
  ferme_id: number;
  type: TypeIAE;
  surface_ha: number | null;
  longueur_m: number | null;
  description: string | null;
}

export interface InfrastructureCreate {
  type: TypeIAE;
  surface_ha?: number | null;
  longueur_m?: number | null;
  description?: string | null;
}

export interface FermeCreate {
  nom: string;
  siret?: string | null;
  code_insee?: string | null;
  categorie?: CategorieProduction | null;
  parcelles?: ParcelleCreate[];
}

// --- Calcul / Résultats ---

export interface CalculResume {
  id: number;
  ferme_id: number;
  date_calcul: string;
  version_methode: string;
  score_unique: number;
  categorie: CategorieScore;
  niveau_confiance: NiveauConfiance;
  nb_parcelles_traitees: number;
}

// --- Nouveau type : impact détaillé (POST /api/v1/fermes/{id}/calcul) ---

export interface ImpactDetaille {
  trigramme: string;
  valeur: number;
  unite: string;
  poids: number;
  contribution_score: number; // contribution en mPt
}

export interface ContributionCulture {
  code_culture: string;
  culture_nom: string;
  surface_ha: number;
  rendement_kg_ha: number | null;
  est_bio: boolean;
  impacts: ImpactDetaille[];
  contribution_score: number; // contribution en mPt
}

export interface CalculResultatV1 {
  score_unique: number;
  categorie: CategorieScore;
  impacts_detailles: ImpactDetaille[];
  contributions_cultures: ContributionCulture[];
  details_json: {
    modulation_iae: Record<string, number> | null;
  };
  surface_totale_ha: number;
  nb_parcelles: number;
}

export interface IndicateurResultat {
  trigramme: string;
  valeur: number;
  unite: string;
  poids: number;
  normalise: number; // 0-1 normalisé pour radar
}

export interface ParcelleResultat {
  parcelle_id: number;
  culture: string;
  surface_ha: number;
  bio: boolean;
  indicateurs: IndicateurResultat[];
  contribution_pct: number;
}

export interface IaeImpact {
  score_initial: number;
  bonus_total_pct: number;
  details: {
    id: number;
    type: TypeIAE;
    surface_ha: number | null;
    longueur_m: number | null;
    bonus_pct: number;
    description: string | null;
  }[];
}

export interface CalculDetail {
  id: number;
  ferme_id: number;
  date_calcul: string;
  version_methode: string;
  categorie: CategorieScore;
  score_unique: number;
  niveau_confiance: NiveauConfiance;
  indicateurs: IndicateurResultat[];
  parcelles: ParcelleResultat[];
  iae_impact: IaeImpact | null;
}

// --- Réponses API ---

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// --- Formulaires ---

export interface FermeFormData {
  nom: string;
  siret: string;
  code_insee: string;
  categorie: CategorieProduction | "";
}

export interface ParcelleFormData {
  id: string; // client-side id
  culture: string;
  surface_ha: string;
  bio: boolean;
  labour: boolean;
  irrigation: boolean;
  culture_intermediaire: string;
  commentaire: string;
}

export interface InfrastructureFormData {
  id: string;
  type: TypeIAE | "";
  surface_ha: string;
  longueur_m: string;
  description: string;
}

// --- Constantes UI ---

export const CULTURES: Record<CategorieProduction, string[]> = {
  grandes_cultures: [
    "Blé tendre",
    "Blé dur",
    "Orge",
    "Maïs grain",
    "Colza",
    "Tournesol",
    "Betterave sucrière",
    "Pomme de terre",
    "Pois protéagineux",
    "Féverole",
    "Soja",
    "Luzerne",
    "Prairie temporaire",
  ],
  maraichage: [
    "Tomate",
    "Carotte",
    "Salade",
    "Oignon",
    "Poireau",
    "Chou-fleur",
    "Courgette",
    "Haricot vert",
    "Épinard",
    "Fraise",
    "Melon",
    "Asperge",
  ],
  arboriculture: [
    "Pomme",
    "Poire",
    "Pêche",
    "Abricot",
    "Cerise",
    "Prune",
    "Noix",
    "Amande",
    "Châtaigne",
    "Olive",
  ],
  viticulture: [
    "Vigne — raisin de cuve",
    "Vigne — raisin de table",
  ],
  elevage_bovin: [
    "Prairie permanente",
    "Prairie temporaire",
    "Maïs ensilage",
    "Métail grain",
  ],
  elevage_ovin_caprin: [
    "Prairie permanente",
    "Prairie temporaire",
    "Luzerne",
    "Sainfoin",
  ],
  elevage_porcin: [
    "Maïs grain",
    "Blé tendre",
    "Orge",
    "Pois protéagineux",
  ],
  elevage_avicole: [
    "Maïs grain",
    "Blé tendre",
    "Soja",
    "Tournesol",
  ],
  polyculture_elevage: [
    "Blé tendre",
    "Maïs grain",
    "Prairie permanente",
    "Prairie temporaire",
    "Colza",
    "Orge",
  ],
  autre: [
    "Blé tendre",
    "Maïs grain",
    "Prairie permanente",
    "Autre culture",
  ],
};

export const CATEGORIE_LABELS: Record<CategorieProduction, string> = {
  grandes_cultures: "Grandes cultures",
  maraichage: "Maraîchage",
  arboriculture: "Arboriculture",
  viticulture: "Viticulture",
  elevage_bovin: "Élevage bovin",
  elevage_ovin_caprin: "Élevage ovin/caprin",
  elevage_porcin: "Élevage porcin",
  elevage_avicole: "Élevage avicole",
  polyculture_elevage: "Polyculture-élevage",
  autre: "Autre",
};

export const TYPE_IAE_LABELS: Record<TypeIAE, string> = {
  haie: "Haie",
  mare: "Mare",
  bosquet: "Bosquet",
  bande_enherbee: "Bande enherbée",
  mur_pierre_seche: "Mur en pierre sèche",
  fosse: "Fossé",
  prairie_permanente: "Prairie permanente",
  verger_haute_tige: "Verger haute tige",
  agroforesterie: "Agroforesterie",
  jachere: "Jachère",
  muret: "Muret",
  arbre_isole: "Arbre isolé",
  autre: "Autre IAE",
};

export const SCORE_COLORS: Record<CategorieScore, string> = {
  A: "#059669",
  B: "#34D399",
  C: "#F59E0B",
  D: "#F97316",
  E: "#DC3B41",
};

export const SCORE_LABELS: Record<CategorieScore, string> = {
  A: "Excellent",
  B: "Très bon",
  C: "Moyen",
  D: "Élevé",
  E: "Très élevé",
};

export const CONFIANCE_COLORS: Record<NiveauConfiance, string> = {
  eleve: "#059669",
  moyen: "#F59E0B",
  faible: "#DC3B41",
};

export const CONFIANCE_LABELS: Record<NiveauConfiance, string> = {
  eleve: "Élevé",
  moyen: "Moyen",
  faible: "Faible",
};

export function getScoreColor(score: number): string {
  if (score <= 1.0) return SCORE_COLORS.A;
  if (score <= 2.0) return SCORE_COLORS.B;
  if (score <= 3.5) return SCORE_COLORS.C;
  if (score <= 5.5) return SCORE_COLORS.D;
  return SCORE_COLORS.E;
}

export function getScoreBarColor(score_normalise: number): string {
  if (score_normalise <= 20) return "#059669";
  if (score_normalise <= 40) return "#34D399";
  if (score_normalise <= 60) return "#F59E0B";
  if (score_normalise <= 80) return "#F97316";
  return "#DC3B41";
}

export function getScoreCategorie(score: number): CategorieScore {
  if (score <= 1.0) return "A";
  if (score <= 2.0) return "B";
  if (score <= 3.5) return "C";
  if (score <= 5.5) return "D";
  return "E";
}
