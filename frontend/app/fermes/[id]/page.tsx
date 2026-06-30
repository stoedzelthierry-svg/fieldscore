"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getFerme, getCalculsFerme, lancerCalcul } from "@/lib/api";
import { formatDate, formatScore } from "@/lib/utils";
import type { FermeDetail, CalculResume } from "@/lib/api-types";
import { CATEGORIE_LABELS, SCORE_COLORS } from "@/lib/api-types";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Table from "@/components/ui/Table";

export default function FermeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [ferme, setFerme] = useState<FermeDetail | null>(null);
  const [calculs, setCalculs] = useState<CalculResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculLoading, setCalculLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFerme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [f, c] = await Promise.all([getFerme(id), getCalculsFerme(id)]);
      setFerme(f);
      setCalculs(c);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFerme();
  }, [loadFerme]);

  const handleLancerCalcul = async () => {
    try {
      setCalculLoading(true);
      setError(null);
      const result = await lancerCalcul(id);
      router.push(`/fermes/${id}/calcul/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du calcul";
      setError(message);
      setCalculLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <Spinner size="lg" label="Chargement de la ferme..." />
      </div>
    );
  }

  if (error || !ferme) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="error">{error || "Ferme introuvable."}</Alert>
        <div className="mt-4">
          <Link href="/fermes">
            <Button variant="outline">← Retour aux fermes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lastCalcul = calculs.length > 0 ? calculs[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-body">
        <Link href="/fermes" className="hover:text-gray-700">Fermes</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 font-semibold">{ferme.nom}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
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
            {ferme.nb_parcelles} parcelle{ferme.nb_parcelles !== 1 ? "s" : ""}{" "}
            · Créée le {formatDate(ferme.date_creation)}
          </p>
        </div>
        <Button onClick={handleLancerCalcul} loading={calculLoading}>
          ⚡ Lancer le calcul
        </Button>
      </div>

      {/* Score summary */}
      {lastCalcul && (
        <Card className="mb-8 border-eco-200 bg-eco-50/30" padding="lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg font-heading"
                style={{ backgroundColor: SCORE_COLORS[lastCalcul.categorie] }}
              >
                {lastCalcul.categorie}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-body">Dernier score</p>
                <p className="text-2xl font-extrabold text-gray-900 font-heading">
                  {formatScore(lastCalcul.score_unique)}
                </p>
                <p className="text-xs text-gray-500 font-body">
                  Version {lastCalcul.version_methode} —{" "}
                  {formatDate(lastCalcul.date_calcul)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  lastCalcul.niveau_confiance === "eleve"
                    ? "success"
                    : lastCalcul.niveau_confiance === "moyen"
                    ? "warning"
                    : "danger"
                }
              >
                Confiance : {lastCalcul.niveau_confiance}
              </Badge>
              <Link
                href={`/fermes/${ferme.id}/calcul/${lastCalcul.id}`}
                className="text-sm text-data-600 font-semibold hover:underline font-body"
              >
                Voir le détail →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Parcels */}
      <Card className="mb-8" padding="none">
        <div className="p-6 border-b border-gray-100">
          <CardTitle>Parcelles ({ferme.parcelles.length})</CardTitle>
        </div>
        {ferme.parcelles.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 font-body">
            Aucune parcelle saisie.
          </p>
        ) : (
          <Table
            data={ferme.parcelles}
            keyExtractor={(p) => p.id}
            columns={[
              {
                key: "culture",
                header: "Culture",
                render: (p) => <span className="font-semibold">{p.culture}</span>,
              },
              {
                key: "surface_ha",
                header: "Surface",
                render: (p) => (
                  <span className="font-mono text-sm">
                    {p.surface_ha.toFixed(2)} ha
                  </span>
                ),
              },
              {
                key: "bio",
                header: "Bio",
                render: (p) =>
                  p.bio ? (
                    <Badge variant="success" size="sm">Bio</Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">Conv.</span>
                  ),
              },
              {
                key: "labour",
                header: "Labour",
                render: (p) =>
                  p.labour ? (
                    <span className="text-sm">Oui</span>
                  ) : (
                    <span className="text-sm text-gray-400">Non</span>
                  ),
              },
              {
                key: "irrigation",
                header: "Irrigation",
                render: (p) =>
                  p.irrigation ? (
                    <Badge variant="info" size="sm">Irrigué</Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  ),
              },
            ]}
          />
        )}
      </Card>

      {/* IAE */}
      {ferme.infrastructures.length > 0 && (
        <Card className="mb-8" padding="none">
          <div className="p-6 border-b border-gray-100">
            <CardTitle>
              IAE ({ferme.infrastructures.length})
            </CardTitle>
          </div>
          <Table
            data={ferme.infrastructures}
            keyExtractor={(i) => i.id}
            columns={[
              {
                key: "type",
                header: "Type",
                render: (i) => (
                  <span className="font-semibold capitalize">
                    {i.type.replace(/_/g, " ")}
                  </span>
                ),
              },
              {
                key: "surface_ha",
                header: "Surface",
                render: (i) =>
                  i.surface_ha != null ? (
                    <span className="font-mono text-sm">
                      {i.surface_ha.toFixed(2)} ha
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  ),
              },
              {
                key: "longueur_m",
                header: "Longueur",
                render: (i) =>
                  i.longueur_m != null ? (
                    <span className="font-mono text-sm">
                      {i.longueur_m.toFixed(0)} m
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  ),
              },
              {
                key: "description",
                header: "Description",
                render: (i) => (
                  <span className="text-sm text-gray-600">
                    {i.description || "—"}
                  </span>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Calculation history */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100">
          <CardTitle>Historique des calculs</CardTitle>
        </div>
        {calculs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 mb-4 font-body">
              Aucun calcul effectué pour cette ferme.
            </p>
            <Button
              variant="outline"
              onClick={handleLancerCalcul}
              loading={calculLoading}
            >
              ⚡ Lancer un premier calcul
            </Button>
          </div>
        ) : (
          <Table
            data={calculs}
            keyExtractor={(c) => c.id}
            columns={[
              {
                key: "date",
                header: "Date",
                render: (c) => (
                  <span className="text-sm">{formatDate(c.date_calcul)}</span>
                ),
              },
              {
                key: "version",
                header: "Version",
                render: (c) => (
                  <span className="font-mono text-xs">{c.version_methode}</span>
                ),
              },
              {
                key: "score",
                header: "Score",
                render: (c) => (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        c.categorie === "A" || c.categorie === "B"
                          ? "success"
                          : c.categorie === "C"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {c.categorie}
                    </Badge>
                    <span className="font-mono text-sm">
                      {formatScore(c.score_unique)}
                    </span>
                  </div>
                ),
              },
              {
                key: "confiance",
                header: "Confiance",
                render: (c) => (
                  <Badge
                    variant={
                      c.niveau_confiance === "eleve"
                        ? "success"
                        : c.niveau_confiance === "moyen"
                        ? "warning"
                        : "danger"
                    }
                    size="sm"
                  >
                    {c.niveau_confiance}
                  </Badge>
                ),
              },
              {
                key: "action",
                header: "",
                render: (c) => (
                  <Link
                    href={`/fermes/${id}/calcul/${c.id}`}
                    className="text-sm text-data-600 font-semibold hover:underline font-body"
                  >
                    Détail →
                  </Link>
                ),
                className: "w-24",
              },
            ]}
          />
        )}
      </Card>

      {error && (
        <Alert variant="error" className="mt-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
}
