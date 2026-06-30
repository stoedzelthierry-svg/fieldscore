// ============================================================
// PDF Export — Génération de rapport FieldScore avec jsPDF
// ============================================================

import jsPDF from "jspdf";
import type {
  CalculResultatV1,
  CalculDetail,
  IndicateurResultat,
  ImpactDetaille,
  ContributionCulture,
  CategorieScore,
} from "./api-types";
import type { ParcelleResultat, IaeImpact } from "./api-types";
import {
  INDICATEURS_PEF,
  CATEGORIE_LABELS,
  SCORE_LABELS,
  SCORE_COLORS,
  type CategorieProduction,
} from "./api-types";

export interface FermeInfo {
  nom: string;
  commune?: string;
  code_insee?: string | null;
  type_production?: string | null;
  surface_ha?: number | null;
}

// Mapping des catégories score → couleurs et labels
const CAT_LABELS: Record<string, string> = {
  A: "Excellent",
  B: "Très bon",
  C: "Bon",
  D: "Moyen",
  E: "À améliorer",
};

const CAT_COLORS: Record<string, string> = {
  A: "#2E7D32",
  B: "#66BB6A",
  C: "#FFC107",
  D: "#FF9800",
  E: "#F44336",
};

/**
 * Génère et télécharge un rapport PDF formaté pour un calcul FieldScore V1.
 */
export function exportCalculPdfV1(
  calcul: CalculResultatV1,
  ferme: FermeInfo
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // ---- 1. En-tête ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 80, 50);
  doc.text("Rapport de Performance Environnementale", pageW / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 60);
  doc.text("EcoCert FieldScore", pageW / 2, y, { align: "center" });
  y += 10;

  // Ligne séparatrice
  doc.setDrawColor(0, 130, 80);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ---- 2. Infos ferme ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Informations de l'exploitation", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const typeLabel =
    ferme.type_production && ferme.type_production in CATEGORIE_LABELS
      ? CATEGORIE_LABELS[ferme.type_production as CategorieProduction]
      : ferme.type_production || "—";
  const surfaceStr =
    ferme.surface_ha != null ? `${ferme.surface_ha.toFixed(2)} ha` : "—";
  const communeStr = ferme.commune || ferme.code_insee || "—";

  doc.text(`Nom : ${ferme.nom}`, margin, y);
  y += 5;
  doc.text(`Type de production : ${typeLabel}`, margin, y);
  y += 5;
  doc.text(`Commune (INSEE) : ${communeStr}`, margin, y);
  y += 5;
  doc.text(`Surface exploitée : ${surfaceStr}`, margin, y);
  y += 8;

  // ---- 3. Score ----
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Score Environnemental", margin, y);
  y += 8;

  const catColor = CAT_COLORS[calcul.categorie] || "#333";
  const catLabel = CAT_LABELS[calcul.categorie] || calcul.categorie;
  const totalHa = calcul.surface_totale_ha;
  const mPtPerHa = totalHa > 0 ? (calcul.score_unique / totalHa).toFixed(2) : "—";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(catColor);
  doc.text(`${calcul.categorie} — ${calcul.score_unique.toFixed(1)} mPt/ha`, margin, y);
  y += 2;

  // Cercle coloré pour la catégorie visuelle
  doc.setFillColor(catColor);
  doc.circle(margin + 3, y - 5, 4, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`${catLabel}`, margin + 10, y - 2);
  y += 6;
  doc.text(`Score surfacique : ${mPtPerHa} mPt/ha`, margin, y);
  y += 5;
  doc.text(
    `Surface analysée : ${totalHa.toFixed(2)} ha — ${calcul.nb_parcelles} parcelle${calcul.nb_parcelles !== 1 ? "s" : ""}`,
    margin,
    y
  );
  y += 5;
  doc.text(
    `Méthode : ${(calcul as any).methode_version || "PEF v1"} — Source : ${(calcul as any).source_donnees || "Base de données"} — Confiance : ${((calcul as any).niveau_confiance * 100).toFixed(0) || "N/A"}%`,
    margin,
    y
  );
  y += 8;

  // ---- 4. Tableau des 16 indicateurs PEF ----
  if (y > 240) { doc.addPage(); y = margin; }

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Indicateurs PEF (Analyse du Cycle de Vie)", margin, y);
  y += 8;

  // En-tête du tableau
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setFillColor(0, 80, 50);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageW - 2 * margin, 6, "F");
  doc.text("Indicateur", margin + 2, y + 4.5);
  doc.text("Valeur", margin + 65, y + 4.5);
  doc.text("Unité", margin + 95, y + 4.5);
  doc.text("Poids", margin + 125, y + 4.5);
  doc.text("mPt", margin + 148, y + 4.5);
  y += 8;

  const impacts = calcul.impacts_detailles || [];
  const sortedImpacts = [...impacts].sort(
    (a, b) => b.contribution_score - a.contribution_score
  );

  sortedImpacts.forEach((imp: ImpactDetaille, i: number) => {
    if (i % 2 === 0) {
      doc.setFillColor(245, 250, 245);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y, pageW - 2 * margin, 5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);

    const defin = INDICATEURS_PEF.find((d) => d.trigramme === imp.trigramme);
    const nom = defin ? defin.nom : imp.trigramme;

    doc.text(nom, margin + 2, y + 3.5);
    doc.text(formatForPdf(imp.valeur), margin + 65, y + 3.5);
    doc.text(imp.unite, margin + 95, y + 3.5);
    doc.text(imp.poids.toFixed(2), margin + 125, y + 3.5);
    doc.text(imp.contribution_score.toFixed(2), margin + 148, y + 3.5);

    y += 5.5;

    if (y > 260 && i < impacts.length - 1) {
      doc.addPage();
      y = margin;
    }
  });

  y += 8;

  // ---- 5. Contribution par culture ----
  if (y > 220) { doc.addPage(); y = margin; }

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Contribution par culture", margin, y);
  y += 8;

  const cultures = calcul.contributions_cultures || [];
  if (cultures.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Aucune donnée de culture.", margin, y);
    y += 5;
  } else {
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFillColor(0, 80, 50);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageW - 2 * margin, 6, "F");
    doc.text("Culture", margin + 2, y + 4.5);
    doc.text("Surface", margin + 60, y + 4.5);
    doc.text("Rendement", margin + 88, y + 4.5);
    doc.text("Mode", margin + 116, y + 4.5);
    doc.text("Contribution", margin + 138, y + 4.5);
    y += 8;

    cultures.forEach((cc: ContributionCulture, i: number) => {
      if (i % 2 === 0) {
        doc.setFillColor(245, 250, 245);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, y, pageW - 2 * margin, 5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);

      const nom = cc.culture_nom || cc.code_culture;
      const rdt = cc.rendement_kg_ha != null ? `${Math.round(cc.rendement_kg_ha)} kg/ha` : "—";

      doc.text(nom, margin + 2, y + 3.5);
      doc.text(`${cc.surface_ha.toFixed(2)} ha`, margin + 60, y + 3.5);
      doc.text(rdt, margin + 88, y + 3.5);
      doc.text(cc.est_bio ? "Bio" : "Conv.", margin + 116, y + 3.5);
      doc.text(`${cc.contribution_score.toFixed(2)} mPt`, margin + 138, y + 3.5);

      y += 5.5;

      if (y > 260 && i < cultures.length - 1) {
        doc.addPage();
        y = margin;
      }
    });
  }

  y += 6;

  // ---- 6. Modulation IAE ----
  const modulationIae = calcul.details_json?.modulation_iae;
  if (modulationIae && Object.keys(modulationIae).length > 0) {
    if (y > 230) { doc.addPage(); y = margin; }

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Modulation Infrastructures Agro-Écologiques (IAE)", margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(
      "Les IAE réduisent l'impact environnemental en modulant les indicateurs PEF suivants :",
      margin,
      y
    );
    y += 7;

    // Table IAE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFillColor(0, 80, 50);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageW - 2 * margin, 6, "F");
    doc.text("Indicateur", margin + 2, y + 4.5);
    doc.text("Modulation", margin + 80, y + 4.5);
    y += 8;

    const entries = Object.entries(modulationIae);
    entries.forEach(([trigramme, valeur], i: number) => {
      if (i % 2 === 0) {
        doc.setFillColor(245, 250, 245);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, y, pageW - 2 * margin, 5, "F");

      const def = INDICATEURS_PEF.find((d) => d.trigramme === trigramme);
      const nom = def ? def.nom : trigramme;
      const isPositive = valeur > 0;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(isPositive ? 46 : 100, isPositive ? 125 : 100, isPositive ? 50 : 100);
      doc.text(nom, margin + 2, y + 3.5);
      doc.text(`${isPositive ? "+" : ""}${(valeur * 100).toFixed(0)}%`, margin + 80, y + 3.5);

      y += 5.5;
    });
  }

  y += 8;

  // ---- 7. Pied de page ----
  if (y > 260) { doc.addPage(); y = margin + 10; }

  doc.setDrawColor(0, 130, 80);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  const genDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const footerText = `Méthode Ecobalyse — Données Agribalyse 3.2 — Généré le ${genDate}`;
  doc.text(footerText, pageW / 2, y, { align: "center" });
  y += 5;
  doc.text("EcoCert FieldScore — Calculateur de Performance Environnementale", pageW / 2, y, {
    align: "center",
  });

  // ---- Sauvegarde ----
  const safeName = ferme.nom.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 40);
  doc.save(`FieldScore_${safeName}_${calcul.categorie}.pdf`);
}

/**
 * Alias maintenu pour compatibilité.
 */
/**
 * Génère un PDF à partir d'un CalculDetail (ancienne API).
 * Champs: categorie, score_unique, indicateurs[], parcelles[], iae_impact.
 */
export function exportCalculPdfFromDetail(
  calcul: CalculDetail,
  ferme: FermeInfo
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 80, 50);
  doc.text("Rapport de Performance Environnementale", pageW / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 60);
  doc.text("EcoCert FieldScore", pageW / 2, y, { align: "center" });
  y += 10;
  doc.setDrawColor(0, 130, 80);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Farm info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Informations de l'exploitation", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const typeLabel = ferme.type_production && ferme.type_production in CATEGORIE_LABELS
    ? CATEGORIE_LABELS[ferme.type_production as CategorieProduction] : ferme.type_production || "—";
  const surfaceStr = ferme.surface_ha != null ? `${ferme.surface_ha.toFixed(2)} ha` : "—";
  const communeStr = ferme.commune || ferme.code_insee || "—";
  doc.text(`Nom : ${ferme.nom}`, margin, y); y += 5;
  doc.text(`Type : ${typeLabel}`, margin, y); y += 5;
  doc.text(`Commune (INSEE) : ${communeStr}`, margin, y); y += 5;
  doc.text(`Surface : ${surfaceStr}`, margin, y); y += 8;

  // Score
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y); y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Score Environnemental", margin, y); y += 8;

  const catColor = CAT_COLORS[calcul.categorie] || "#333";
  const catLabel = CAT_LABELS[calcul.categorie] || calcul.categorie;
  const totalHa = calcul.parcelles.reduce((sum: number, p: ParcelleResultat) => sum + p.surface_ha, 0);
  const mPtPerHa = totalHa > 0 ? (calcul.score_unique / totalHa).toFixed(2) : "—";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(catColor);
  doc.text(`${calcul.categorie} — ${calcul.score_unique.toFixed(1)} pts`, margin, y); y += 2;
  doc.setFillColor(catColor);
  doc.circle(margin + 3, y - 5, 4, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`${catLabel}`, margin + 10, y - 2); y += 6;
  doc.text(`Score surfacique : ${mPtPerHa} pts/ha`, margin, y); y += 5;
  doc.text(`Surface analysée : ${totalHa.toFixed(2)} ha — ${calcul.parcelles.length} parcelle${calcul.parcelles.length !== 1 ? "s" : ""}`, margin, y); y += 5;
  doc.text(`Méthode : ${calcul.version_methode} — Confiance : ${calcul.niveau_confiance}`, margin, y); y += 8;

  // Indicators table
  if (y > 240) { doc.addPage(); y = margin; }
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y); y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Indicateurs PEF (Analyse du Cycle de Vie)", margin, y); y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setFillColor(0, 80, 50);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageW - 2 * margin, 6, "F");
  doc.text("Indicateur", margin + 2, y + 4.5);
  doc.text("Valeur", margin + 65, y + 4.5);
  doc.text("Unité", margin + 95, y + 4.5);
  doc.text("Poids", margin + 125, y + 4.5);
  doc.text("Norm.", margin + 152, y + 4.5);
  y += 8;

  const sortedInd = [...(calcul.indicateurs || [])].sort((a, b) => b.normalise - a.normalise);
  sortedInd.forEach((ind: IndicateurResultat, i: number) => {
    if (i % 2 === 0) doc.setFillColor(245, 250, 245); else doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, pageW - 2 * margin, 5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    const defin = INDICATEURS_PEF.find((d) => d.trigramme === ind.trigramme);
    const nom = defin ? defin.nom : ind.trigramme;
    doc.text(nom, margin + 2, y + 3.5);
    doc.text(formatForPdf(ind.valeur), margin + 65, y + 3.5);
    doc.text(ind.unite, margin + 95, y + 3.5);
    doc.text(ind.poids.toFixed(2), margin + 125, y + 3.5);
    doc.text(ind.normalise.toFixed(2), margin + 152, y + 3.5);
    y += 5.5;
    if (y > 260 && i < sortedInd.length - 1) { doc.addPage(); y = margin; }
  });
  y += 8;

  // Parcels
  if (y > 220) { doc.addPage(); y = margin; }
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y); y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Contribution par parcelle", margin, y); y += 8;

  if (calcul.parcelles.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Aucune donnée de parcelle.", margin, y);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFillColor(0, 80, 50);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageW - 2 * margin, 6, "F");
    doc.text("Culture", margin + 2, y + 4.5);
    doc.text("Surface", margin + 60, y + 4.5);
    doc.text("Bio", margin + 95, y + 4.5);
    doc.text("Contribution", margin + 120, y + 4.5);
    y += 8;
    calcul.parcelles.forEach((p: ParcelleResultat, i: number) => {
      if (i % 2 === 0) doc.setFillColor(245, 250, 245); else doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, pageW - 2 * margin, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(p.culture, margin + 2, y + 3.5);
      doc.text(`${p.surface_ha.toFixed(2)} ha`, margin + 60, y + 3.5);
      doc.text(p.bio ? "Oui" : "Non", margin + 95, y + 3.5);
      doc.text(`${p.contribution_pct.toFixed(1)}%`, margin + 120, y + 3.5);
      y += 5.5;
      if (y > 260 && i < calcul.parcelles.length - 1) { doc.addPage(); y = margin; }
    });
  }
  y += 6;

  // IAE
  const iae = calcul.iae_impact;
  if (iae && iae.details && iae.details.length > 0) {
    if (y > 230) { doc.addPage(); y = margin; }
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y); y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Modulation IAE", margin, y); y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Bonus total : ${iae.bonus_total_pct > 0 ? "+" : ""}${iae.bonus_total_pct.toFixed(1)}%`, margin, y); y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFillColor(0, 80, 50);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageW - 2 * margin, 6, "F");
    doc.text("Type", margin + 2, y + 4.5);
    doc.text("Surface", margin + 55, y + 4.5);
    doc.text("Longueur", margin + 85, y + 4.5);
    doc.text("Bonus", margin + 118, y + 4.5);
    doc.text("Description", margin + 145, y + 4.5);
    y += 8;
    iae.details.forEach((d: any, i: number) => {
      if (i % 2 === 0) doc.setFillColor(245, 250, 245); else doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, pageW - 2 * margin, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(d.type || "—", margin + 2, y + 3.5);
      doc.text(d.surface_ha != null ? `${d.surface_ha.toFixed(2)} ha` : "—", margin + 55, y + 3.5);
      doc.text(d.longueur_m != null ? `${d.longueur_m.toFixed(0)} m` : "—", margin + 85, y + 3.5);
      doc.text(d.bonus_pct > 0 ? `+${d.bonus_pct.toFixed(1)}%` : "—", margin + 118, y + 3.5);
      doc.text(d.description || "—", margin + 145, y + 3.5);
      y += 5.5;
      if (y > 260 && i < iae.details.length - 1) { doc.addPage(); y = margin; }
    });
  }
  y += 8;

  // Footer
  if (y > 260) { doc.addPage(); y = margin + 10; }
  doc.setDrawColor(0, 130, 80);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y); y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const genDate = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Méthode Ecobalyse — Données Agribalyse 3.2 — Généré le ${genDate}`, pageW / 2, y, { align: "center" });
  y += 5;
  doc.text("EcoCert FieldScore — Calculateur de Performance Environnementale", pageW / 2, y, { align: "center" });

  const safeName = ferme.nom.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 40);
  doc.save(`FieldScore_${safeName}_${calcul.categorie}.pdf`);
}

/**
 * Dispatch automatique : V1 (impacts_detailles) ou Detail (indicateurs).
 */
export function exportCalculPdf(
  calcul: CalculResultatV1 | CalculDetail,
  ferme: FermeInfo
): void {
  if ("impacts_detailles" in calcul) {
    return exportCalculPdfV1(calcul as CalculResultatV1, ferme);
  }
  return exportCalculPdfFromDetail(calcul as CalculDetail, ferme);
}

function formatForPdf(n: number): string {
  if (Math.abs(n) < 0.01 && n !== 0) return n.toExponential(2);
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  return n.toFixed(2);
}
