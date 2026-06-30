// ============================================================
// Utilitaires — formatting, conversions, validation
// ============================================================

import {
  type CategorieScore,
  type NiveauConfiance,
  SCORE_LABELS,
  CONFIANCE_LABELS,
} from "./api-types";

/** Formate un nombre avec séparateur de milliers (espace) */
export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Formate une surface en ha */
export function formatSurface(ha: number): string {
  return `${formatNumber(ha)} ha`;
}

/** Formate un score avec unité */
export function formatScore(score: number): string {
  return `${formatNumber(score, 1)} pts`;
}

/** Pourcentage formaté */
export function formatPercent(pct: number): string {
  return `${formatNumber(pct, 1)} %`;
}

/** Date FR courte */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Date FR avec heure */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Validation SIRET : 14 chiffres, clé de Luhn */
export function validateSiret(siret: string): string | null {
  if (!siret) return null;
  const cleaned = siret.replace(/\s/g, "");
  if (cleaned.length !== 14) return "Le SIRET doit contenir 14 chiffres.";
  if (!/^\d{14}$/.test(cleaned)) return "Le SIRET ne doit contenir que des chiffres.";
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  if (sum % 10 !== 0) return "SIRET invalide (clé de contrôle).";
  return null;
}

/** Validation code INSEE */
export function validateCodeInsee(code: string): string | null {
  if (!code) return null;
  if (!/^\d{5}$/.test(code)) return "Le code INSEE doit contenir 5 chiffres.";
  return null;
}

/** Génère un id unique client */
let _uid = 0;
export function uid(): string {
  return `tmp_${++_uid}_${Date.now().toString(36)}`;
}

/** Tronque un texte */
export function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

/** Score → catégorie lettre */
export function scoreToCategorie(score: number): CategorieScore {
  if (score <= 1.0) return "A";
  if (score <= 2.0) return "B";
  if (score <= 3.5) return "C";
  if (score <= 5.5) return "D";
  return "E";
}

/** Catégorie → label */
export function categorieLabel(cat: CategorieScore): string {
  return SCORE_LABELS[cat];
}

/** Niveau confiance → label */
export function confianceLabel(niv: NiveauConfiance): string {
  return CONFIANCE_LABELS[niv];
}

/** Télécharger un blob */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
