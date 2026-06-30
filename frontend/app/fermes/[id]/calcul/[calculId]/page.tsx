"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ScoreGauge from "@/components/calcul/ScoreGauge";
import ImpactRadar from "@/components/calcul/ImpactRadar";
import ImpactBarChart from "@/components/calcul/ImpactBarChart";
import BreakdownTable from "@/components/calcul/BreakdownTable";
import IaeImpactVisualization from "@/components/calcul/IaeImpact";
import ConfidenceBadge from "@/components/calcul/ConfidenceBadge";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import { getCalculDetail, exportCalcul } from "@/lib/api";
import { formatDate, formatNumber, downloadBlob } from "@/lib/utils";
import type { CalculDetail, ParcelleResultat } from "@/lib/api-types";

export default function CalculResultatPage() {
  const params = useParams();
  const fermeId = Number(params.id);
  const calculId = Number(params.calculId || 0);

  const [calcul, setCalcul] = useState<CalculDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCalculDetail(fermeId, calculId);
      setCalcul(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fermeId, calculId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async (format: "json" | "csv") => {
    try {
      setExporting(true);
      const blob = await exportCalcul(fermeId, calculId, format);
      downloadBlob(
        blob,
        `fieldscore_${fermeId}_calcul_${calculId}.${format}`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur d'export";
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <Spinner size="lg" label="Chargement du résultat..." />
      </div>
    );
  }

  if (error || !calcul) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="error">{error || "Résultat introuvable."}</Alert>
        <div className="mt-4">
          <Link href={`/fermes/${fermeId}`}>
            <Button variant="outline">← Retour à la ferme</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-body">
        <Link href="/fermes" className="hover:text-gray-700">Fermes</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/fermes/${fermeId}`} className="hover:text-gray-700">
          Ferme {fermeId}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 font-semibold">
          Calcul du {formatDate(calcul.date_calcul)}
        </span>
      </div>

      {/* Main score header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <ScoreGauge score={calcul.score_unique} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-heading text-h2 mb-3">
              Résultat du calcul environnemental
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
              <Badge
                variant={
                  calcul.categorie === "A" || calcul.categorie === "B"
                    ? "success"
                    : calcul.categorie === "C"
                    ? "warning"
                    : "danger"
                }
                size="md"
              >
                Score {calcul.categorie} — {formatNumber(calcul.score_unique, 1)} pts
              </Badge>
              <ConfidenceBadge niveau={calcul.niveau_confiance} />
            </div>
            <div className="text-sm text-gray-500 space-y-1 font-body">
              <p>
                Méthode :{" "}
                <span className="font-mono">{calcul.version_methode}</span> ·
                Calculé le {formatDate(calcul.date_calcul)}
              </p>
              <p>
                {calcul.parcelles.length} parcelle
                {calcul.parcelles.length !== 1 ? "s" : ""} analysée
                {calcul.parcelles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                loading={exporting}
              >
                📥 Exporter JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                loading={exporting}
              >
                📊 Exporter CSV
              </Button>
              <Link href={`/fermes/${fermeId}`}>
                <Button variant="ghost" size="sm">
                  ← Retour à la ferme
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Radar + Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardTitle>Profil d&apos;impact (radar)</CardTitle>
          <p className="text-sm text-gray-500 mt-1 font-body">
            Les 16 indicateurs PEF normalisés sur 100%
          </p>
          <ImpactRadar indicateurs={calcul.indicateurs} />
        </Card>

        <Card>
          <CardTitle>Impacts par ordre d&apos;importance</CardTitle>
          <p className="text-sm text-gray-500 mt-1 font-body">
            Contribution relative de chaque indicateur (échelle normalisée)
          </p>
          <ImpactBarChart indicateurs={calcul.indicateurs} />
        </Card>
      </div>

      {/* Detail per parcel */}
      <Card className="mb-8">
        <CardTitle>Détail par parcelle</CardTitle>
        <p className="text-sm text-gray-500 mt-1 font-body">
          Contribution de chaque parcelle au score global
        </p>
        <div className="mt-5 space-y-4">
          {calcul.parcelles.map((p) => (
            <ParcelleDetail key={p.parcelle_id} parcelle={p} />
          ))}
        </div>
      </Card>

      {/* IAE Bonus */}
      <IaeImpactVisualization iaeImpact={calcul.iae_impact} className="mb-8" />

      {/* Full breakdown table */}
      <BreakdownTable indicateurs={calcul.indicateurs} className="mb-8" />

      {error && (
        <Alert variant="error" className="mt-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
}

function ParcelleDetail({ parcelle }: { parcelle: ParcelleResultat }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🌱</span>
          <div>
            <p className="font-semibold text-gray-900 font-body">
              {parcelle.culture}
            </p>
            <p className="text-sm text-gray-500 font-body">
              {parcelle.surface_ha.toFixed(2)} ha
              {parcelle.bio && " · Bio"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-body">
            Contribution au score
          </p>
          <p className="font-extrabold text-xl text-gray-900 font-heading">
            {parcelle.contribution_pct.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {parcelle.indicateurs
          .sort((a, b) => b.normalise - a.normalise)
          .slice(0, 5)
          .map((ind) => (
            <div key={ind.trigramme} className="flex items-center gap-3 text-sm font-body">
              <span className="font-mono w-6 text-gray-500 text-xs">
                {ind.trigramme}
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-data-500 transition-all duration-300"
                  style={{ width: `${ind.normalise * 100}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-gray-500">
                {(ind.normalise * 100).toFixed(0)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
