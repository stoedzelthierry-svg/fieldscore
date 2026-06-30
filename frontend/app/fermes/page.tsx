"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import { getFermes } from "@/lib/api";
import type { Ferme, CategorieScore } from "@/lib/api-types";
import {
  CATEGORIE_LABELS,
  SCORE_COLORS,
  SCORE_LABELS,
  getScoreCategorie,
} from "@/lib/api-types";
import { formatDate, formatSurface } from "@/lib/utils";

interface FermeWithScore extends Ferme {
  scoreCategorie?: CategorieScore;
  scoreValue?: number;
  scoreLoading?: boolean;
  scoreError?: boolean;
}

function ScoreBadge({ categorie, loading }: { categorie?: CategorieScore; loading?: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-body">
        <span className="w-3 h-3 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
        Calcul...
      </span>
    );
  }
  if (!categorie) {
    return (
      <span className="text-xs text-gray-400 italic font-body">
        Calcul non disponible
      </span>
    );
  }
  const color = SCORE_COLORS[categorie];
  const label = SCORE_LABELS[categorie];
  return (
    <Badge
      size="sm"
      className="inline-flex items-center gap-1.5"
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      {categorie} · {label}
    </Badge>
  );
}

export default function FermesPage() {
  const [fermes, setFermes] = useState<FermeWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFermes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFermes(1, 100);
      const data: FermeWithScore[] = (res.data || []).map((f) => ({
        ...f,
        scoreLoading: f.nb_parcelles > 0,
        scoreError: false,
      }));
      setFermes(data);

      for (const ferme of data) {
        if (ferme.nb_parcelles > 0) {
          loadScore(ferme.id);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadScore = async (fermeId: number) => {
    try {
      const res = await fetch("/api/v1/fermes/" + fermeId + "/calcul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inclure_iae: true }),
      });
      if (!res.ok) throw new Error("Calcul failed");
      const data = await res.json();
      const cat: CategorieScore = data.categorie || getScoreCategorie(data.score_unique || 0);
      setFermes((prev) =>
        prev.map((f) =>
          f.id === fermeId
            ? { ...f, scoreCategorie: cat, scoreValue: data.score_unique, scoreLoading: false }
            : f
        )
      );
    } catch {
      setFermes((prev) =>
        prev.map((f) =>
          f.id === fermeId
            ? { ...f, scoreLoading: false, scoreError: true }
            : f
        )
      );
    }
  };

  useEffect(() => {
    loadFermes();
  }, [loadFermes]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Spinner size="lg" label="Chargement des fermes..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-h2">Mes fermes</h1>
          <p className="text-gray-500 mt-1 font-body">
            {fermes.length} exploitation{fermes.length !== 1 ? "s" : ""}{" "}
            enregistrée{fermes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/fermes/nouvelle">
          <Button size="lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle ferme
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {fermes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-card">
          <div className="text-6xl mb-4" aria-hidden="true">🌾</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2 font-heading">
            Aucune ferme enregistrée
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto font-body">
            Créez votre première ferme pour commencer à calculer son coût
            environnemental.
          </p>
          <Link href="/fermes/nouvelle">
            <Button size="lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première ferme
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fermes.map((ferme) => (
            <Link key={ferme.id} href={"/fermes/" + ferme.id}>
              <Card hover className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl" aria-hidden="true">🏡</div>
                    <ScoreBadge
                      categorie={ferme.scoreCategorie}
                      loading={ferme.scoreLoading}
                    />
                  </div>

                  <CardTitle className="text-lg leading-snug mb-1">
                    {ferme.nom}
                  </CardTitle>

                  {ferme.categorie && (
                    <p className="text-sm text-gray-500 font-body mb-2">
                      {CATEGORIE_LABELS[ferme.categorie]}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-body mt-3">
                    {ferme.surface_ha != null && (
                      <span className="inline-flex items-center gap-1">
                        📐 {formatSurface(ferme.surface_ha)}
                      </span>
                    )}
                    {ferme.nb_parcelles > 0 && (
                      <span className="inline-flex items-center gap-1">
                        🌱 {ferme.nb_parcelles} parcelle{ferme.nb_parcelles > 1 ? "s" : ""}
                      </span>
                    )}
                    {ferme.code_insee && (
                      <span className="inline-flex items-center gap-1">
                        📍 {ferme.code_insee}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-body">
                    {ferme.date_creation ? formatDate(ferme.date_creation) : "—"}
                  </span>
                  <span className="text-primary-600 font-semibold font-body inline-flex items-center gap-1">
                    Voir le détail
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
