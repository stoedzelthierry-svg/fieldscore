"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getFerme, getCalculV1, getCalculsFerme, lancerCalcul } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import { exportCalculPdfV1, type FermeInfo } from "@/lib/pdf-export";
import type {
  FermeDetail,
  CalculResultatV1,
  CalculResume,
  ImpactDetaille,
  ContributionCulture,
  CategorieScore,
} from "@/lib/api-types";
import {
  CATEGORIE_LABELS,
  INDICATEURS_PEF,
} from "@/lib/api-types";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";

// --- Catégorie score mapping ---
const CAT_SCORE_COLORS: Record<CategorieScore, string> = {
  A: "#2E7D32",
  B: "#66BB6A",
  C: "#FFC107",
  D: "#FF9800",
  E: "#F44336",
};

const CAT_SCORE_LABELS: Record<CategorieScore, string> = {
  A: "Excellent",
  B: "Très bon",
  C: "Bon",
  D: "Moyen",
  E: "À améliorer",
};

// --- SVG Ring Gauge ---
function RingGauge({
  score,
  categorie,
  maxScore = 10,
}: {
  score: number;
  categorie: CategorieScore;
  maxScore?: number;
}) {
  const color = CAT_SCORE_COLORS[categorie];
  const ratio = Math.min(score / maxScore, 1);
  const circumference = 2 * Math.PI * 45;
  const filled = circumference * (1 - ratio);

  return (
    <div className="flex flex-col items-center">
      <svg
        width="140"
        height="140"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Score ${categorie} : ${formatNumber(score, 1)} mPt/ha`}
        className="drop-shadow-md"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        {/* Filled arc */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={filled}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        {/* Category letter in center */}
        <text
          x="60"
          y="57"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-heading"
          fontSize="32"
          fontWeight="800"
          fill={color}
        >
          {categorie}
        </text>
        <text
          x="60"
          y="78"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-body"
          fontSize="10"
          fill="#6B7280"
        >
          mPt/ha
        </text>
      </svg>
      <p
        className="text-xs font-semibold mt-1 font-body"
        style={{ color }}
      >
        {CAT_SCORE_LABELS[categorie]}
      </p>
    </div>
  );
}

// --- Horizontal impact bar ---
function ImpactBar({
  impact,
  maxContribution,
}: {
  impact: ImpactDetaille;
  maxContribution: number;
}) {
  const def = INDICATEURS_PEF.find((d) => d.trigramme === impact.trigramme);
  const name = def?.nom || impact.trigramme;
  const pct = maxContribution > 0 ? (impact.contribution_score / maxContribution) * 100 : 0;

  // Color based on position (use the score bar color logic adapted for contribution)
  let barColor = "#059669";
  if (impact.contribution_score >= maxContribution * 0.8) barColor = "#F44336";
  else if (impact.contribution_score >= maxContribution * 0.6) barColor = "#FF9800";
  else if (impact.contribution_score >= maxContribution * 0.4) barColor = "#FFC107";
  else if (impact.contribution_score >= maxContribution * 0.2) barColor = "#66BB6A";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs text-gray-500 shrink-0 w-7">
            {impact.trigramme}
          </span>
          <span className="text-sm text-gray-700 font-body truncate">
            {name}
          </span>
        </div>
        <span className="text-sm font-mono text-gray-500 shrink-0 ml-2">
          {formatNumber(impact.contribution_score, 2)} mPt
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(pct, 1)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5 font-body">
        {formatNumber(impact.valeur, 4)} {impact.unite} · Poids {(impact.poids * 100).toFixed(0)}%
      </p>
    </div>
  );
}

// --- Skeleton for loading ---
function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      {/* Gauge + score area */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="w-full lg:w-1/3 h-48 bg-gray-200 rounded-xl" />
        <div className="w-full lg:w-2/3 h-48 bg-gray-200 rounded-xl" />
      </div>
      {/* Impact bars */}
      <div className="h-96 bg-gray-200 rounded-xl mb-8" />
      {/* Culture table */}
      <div className="h-64 bg-gray-200 rounded-xl mb-8" />
      {/* IAE */}
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  );
}

// --- Vignette couleur catégorie (pour le header) ---
function CategorieLabel({
  categorie,
  score,
}: {
  categorie: CategorieScore;
  score: number;
}) {
  const color = CAT_SCORE_COLORS[categorie];
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-lg font-heading shadow-sm shrink-0"
        style={{ backgroundColor: color }}
      >
        {categorie}
      </div>
      <div>
        <p className="text-lg font-extrabold text-gray-900 font-heading leading-tight">
          {formatNumber(score, 1)} mPt/ha
        </p>
        <p className="text-xs font-semibold font-body" style={{ color }}>
          {CAT_SCORE_LABELS[categorie]}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function FermeDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [ferme, setFerme] = useState<FermeDetail | null>(null);
  const [calcul, setCalcul] = useState<CalculResultatV1 | null>(null);
  const [calculs, setCalculs] = useState<CalculResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculLoading, setCalculLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const f = await getFerme(id);
      setFerme(f);
      // Load calcul list for the history reference, and the v1 calcul in background
      const [c, v1] = await Promise.allSettled([
        getCalculsFerme(id),
        getCalculV1(id),
      ]);
      if (c.status === "fulfilled") setCalculs(c.value);
      if (v1.status === "fulfilled") {
        setCalcul(v1.value);
      } else if (v1.status === "rejected") {
        // V1 endpoint might not be available yet – that's ok
        console.warn("Calcul V1 indisponible:", v1.reason);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRelancerCalcul = async () => {
    try {
      setCalculLoading(true);
      setError(null);
      await lancerCalcul(id);
      // Re-fetch updated data
      await loadAll();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du calcul";
      setError(message);
    } finally {
      setCalculLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!calcul || !ferme) return;
    try {
      const fermeInfo: FermeInfo = {
        nom: ferme.nom,
        code_insee: ferme.code_insee,
        type_production: ferme.categorie,
        surface_ha: ferme.surface_ha,
      };
      exportCalculPdfV1(calcul, fermeInfo);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'export PDF";
      setError(message);
    }
  };

  // --- Loading state ---
  if (loading) return <DetailSkeleton />;

  // --- Error / not found ---
  if (error || !ferme) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="error">{error || "Ferme introuvable."}</Alert>
        <div className="mt-4">
          <Link href="/fermes">
            <Button variant="outline">← Retour aux fermes</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Empty state (no calculation) ---
  if (!calcul) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-body">
          <Link href="/fermes" className="hover:text-gray-700">Fermes</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-900 font-semibold">{ferme.nom}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading text-h2">{ferme.nom}</h1>
            {ferme.categorie && (
              <Badge variant="info">{CATEGORIE_LABELS[ferme.categorie]}</Badge>
            )}
          </div>
          <p className="text-gray-500 font-body text-sm">
            {ferme.siret && <span>SIRET {ferme.siret} · </span>}
            {ferme.surface_ha != null && (
              <span>{ferme.surface_ha.toFixed(1)} ha · </span>
            )}
            {ferme.nb_parcelles} parcelle{ferme.nb_parcelles !== 1 ? "s" : ""}
            {ferme.code_insee && <span> · {ferme.code_insee}</span>}
          </p>
        </div>

        <Card className="text-center py-12">
          <div className="text-5xl mb-4" aria-hidden="true">📊</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2 font-heading">
            Aucun calcul disponible
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto font-body">
            Lancez un calcul environnemental pour obtenir le score PEF détaillé
            de votre exploitation.
          </p>
          <Button onClick={handleRelancerCalcul} loading={calculLoading}>
            ⚡ Lancer le calcul
          </Button>
        </Card>

        {error && (
          <Alert variant="error" className="mt-6" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
      </div>
    );
  }

  // --- SUCCESS : full detail ---
  const sortedImpacts = [...calcul.impacts_detailles].sort(
    (a, b) => b.contribution_score - a.contribution_score
  );
  const maxContribution =
    sortedImpacts.length > 0 ? sortedImpacts[0].contribution_score : 1;
  const lastCalc = calculs.length > 0 ? calculs[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-body">
        <Link href="/fermes" className="hover:text-gray-700">Fermes</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 font-semibold">{ferme.nom}</span>
      </div>

      {/* ========== RÉSUMÉ CHIFFRÉ (4 KPI) ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label="Surface"
          value={`${formatNumber(calcul.surface_totale_ha, 1)} ha`}
          icon="🌍"
        />
        <KpiCard
          label="Parcelles"
          value={`${calcul.nb_parcelles}`}
          icon="🌱"
        />
        <KpiCard
          label="Score"
          value={`${formatNumber(calcul.score_unique, 1)}`}
          icon="📊"
          accent
          accentColor={CAT_SCORE_COLORS[calcul.categorie]}
        />
        <KpiCard
          label="Catégorie"
          value={calcul.categorie}
          icon="🏅"
          accent
          accentColor={CAT_SCORE_COLORS[calcul.categorie]}
        />
      </div>

      {/* ========== HEADER + SCORE ========== */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* LEFT: Jauge circulaire + score */}
        <Card className="lg:w-1/3 flex flex-col items-center justify-center py-8">
          <RingGauge score={calcul.score_unique} categorie={calcul.categorie} />
          <p className="text-sm text-gray-500 mt-3 font-body">
            Score unique PEF
          </p>
        </Card>

        {/* RIGHT: Header ferme + score détaillé */}
        <Card className="lg:w-2/3" padding="lg">
          {/* Farm identity */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-heading text-h2">{ferme.nom}</h1>
              {ferme.categorie && (
                <Badge variant="info">{CATEGORIE_LABELS[ferme.categorie]}</Badge>
              )}
            </div>
            <p className="text-gray-500 font-body text-sm">
              {ferme.siret && <span>SIRET {ferme.siret} · </span>}
              {ferme.code_insee && <span>{ferme.code_insee} · </span>}
              {ferme.surface_ha != null && (
                <span>{ferme.surface_ha.toFixed(1)} ha · </span>
              )}
              {ferme.nb_parcelles} parcelle{ferme.nb_parcelles !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Score détaillé */}
          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
            <CategorieLabel
              categorie={calcul.categorie}
              score={calcul.score_unique}
            />
            {lastCalc && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 font-body">
                <span>
                  Calculé le {formatDate(lastCalc.date_calcul)}
                </span>
                <span className="font-mono">{lastCalc.version_methode}</span>
                <Link
                  href={`/fermes/${id}/calcul/${lastCalc.id}`}
                  className="text-data-600 font-semibold hover:underline"
                >
                  Voir le calcul détaillé →
                </Link>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            <Button
              variant="primary"
              onClick={handleRelancerCalcul}
              loading={calculLoading}
            >
              ⚡ Relancer le calcul
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              📄 Exporter PDF
            </Button>
          </div>
        </Card>
      </div>

      {/* ========== GRAPHIQUE 16 INDICATEURS PEF ========== */}
      <Card className="mb-8">
        <CardTitle>Impacts environnementaux détaillés</CardTitle>
        <p className="text-sm text-gray-500 mt-1 font-body mb-6">
          16 indicateurs PEF classés par contribution au score (mPt)
        </p>
        <div className="space-y-4">
          {sortedImpacts.map((imp) => (
            <ImpactBar
              key={imp.trigramme}
              impact={imp}
              maxContribution={maxContribution}
            />
          ))}
        </div>
      </Card>

      {/* ========== CONTRIBUTION PAR CULTURE ========== */}
      <Card className="mb-8" padding="none">
        <div className="p-6 border-b border-gray-100">
          <CardTitle>Contribution par culture</CardTitle>
          <p className="text-sm text-gray-500 mt-1 font-body">
            {calcul.contributions_cultures.length} culture
            {calcul.contributions_cultures.length !== 1 ? "s" : ""} analysée
            {calcul.contributions_cultures.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
                  Culture
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
                  Surface
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
                  Rendement
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
                  Mode
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {calcul.contributions_cultures.map((cc, i) => (
                <CultureRow key={cc.code_culture || i} culture={cc} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========== EFFET IAE ========== */}
      {calcul.details_json?.modulation_iae &&
        Object.keys(calcul.details_json.modulation_iae).length > 0 && (
          <Card className="mb-8 border-eco-200 bg-eco-50/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl" aria-hidden="true">🌿</span>
              <CardTitle>Effet de vos infrastructures écologiques</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mb-5 font-body">
              Les IAE (Infrastructures Agro-Écologiques) modulent les indicateurs
              ci-dessous, réduisant leur contribution au score final.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(calcul.details_json.modulation_iae).map(
                ([trigramme, valeur]) => {
                  const def = INDICATEURS_PEF.find(
                    (d) => d.trigramme === trigramme
                  );
                  const name = def?.nom || trigramme;
                  const isPositive = valeur > 0;
                  return (
                    <div
                      key={trigramme}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-eco-100"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-gray-500">
                          {trigramme}
                        </span>
                        <p className="text-sm text-gray-700 font-body truncate">
                          {name}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold font-body shrink-0 ml-2 ${
                          isPositive ? "text-eco-600" : "text-gray-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {(valeur * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        )}

      {/* Error */}
      {error && (
        <Alert
          variant="error"
          className="mt-6"
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}
    </div>
  );
}

// ============================================================
// MICRO-COMPOSANTS INTERNES
// ============================================================

function KpiCard({
  label,
  value,
  icon,
  accent = false,
  accentColor,
}: {
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
  accentColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
      <span className="text-2xl shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-body">{label}</p>
        <p
          className="text-lg font-extrabold font-heading truncate"
          style={accent ? { color: accentColor } : { color: "#111827" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function CultureRow({ culture }: { culture: ContributionCulture }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🌾</span>
          <span className="text-sm font-semibold text-gray-900 font-body">
            {culture.culture_nom}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right text-sm font-mono text-gray-700">
        {formatNumber(culture.surface_ha, 2)} ha
      </td>
      <td className="px-6 py-4 text-right text-sm font-mono text-gray-700">
        {culture.rendement_kg_ha != null
          ? `${formatNumber(culture.rendement_kg_ha, 0)} kg/ha`
          : "—"}
      </td>
      <td className="px-6 py-4 text-center">
        {culture.est_bio ? (
          <Badge variant="success" size="sm">
            Bio
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">Conv.</span>
        )}
      </td>
      <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-gray-900">
        {formatNumber(culture.contribution_score, 2)} mPt
      </td>
    </tr>
  );
}
