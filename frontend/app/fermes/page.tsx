"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFermes, deleteFerme } from "@/lib/api";
import { formatDate, formatSurface, formatScore } from "@/lib/utils";
import type { Ferme, CategorieScore } from "@/lib/api-types";
import { CATEGORIE_LABELS, getScoreCategorie } from "@/lib/api-types";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";

export default function FermesPage() {
  const router = useRouter();
  const [fermes, setFermes] = useState<Ferme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadFermes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFermes(1, 50, search || undefined);
      setFermes(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadFermes();
  }, [loadFermes]);

  const handleDelete = async (id: number, nom: string) => {
    if (
      !window.confirm(
        `Supprimer la ferme "${nom}" ? Cette action est irréversible.`
      )
    )
      return;
    try {
      setDeleting(id);
      await deleteFerme(id);
      setFermes((prev) => prev.filter((f) => f.id !== id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de suppression";
      setError(message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle ferme
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Rechercher par nom, SIRET..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher des fermes"
        />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-20">
          <Spinner size="lg" label="Chargement des fermes..." />
        </div>
      ) : fermes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-card">
          <div className="text-6xl mb-4" aria-hidden="true">🏡</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2 font-heading">
            Aucune ferme enregistrée
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto font-body">
            Créez votre première ferme pour commencer à calculer son coût
            environnemental.
          </p>
          <Link href="/fermes/nouvelle">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première ferme
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
          <Table
            data={fermes}
            keyExtractor={(f) => f.id}
            columns={[
              {
                key: "nom",
                header: "Nom",
                render: (f) => (
                  <Link
                    href={`/fermes/${f.id}`}
                    className="text-data-700 font-semibold hover:underline"
                  >
                    {f.nom}
                  </Link>
                ),
              },
              {
                key: "siret",
                header: "SIRET",
                render: (f) => (
                  <span className="text-gray-500">{f.siret || "—"}</span>
                ),
              },
              {
                key: "categorie",
                header: "Type",
                render: (f) =>
                  f.categorie ? (
                    <Badge variant="info" size="sm">
                      {CATEGORIE_LABELS[f.categorie]}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">—</span>
                  ),
              },
              {
                key: "surface_ha",
                header: "Surface",
                render: (f) =>
                  f.surface_ha != null ? (
                    <span className="font-mono text-sm">
                      {formatSurface(f.surface_ha)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  ),
              },
              {
                key: "score",
                header: "Score",
                render: (f) =>
                  f.nb_calculs > 0 ? (
                    <Badge variant="info" size="sm">Calculé</Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (f) => (
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/fermes/${f.id}`}
                      className="text-sm text-data-600 hover:text-data-800 font-semibold font-body"
                    >
                      Détail
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(f.id, f.nom);
                      }}
                      disabled={deleting === f.id}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 font-body min-h-[44px]"
                      aria-label={`Supprimer ${f.nom}`}
                    >
                      {deleting === f.id ? "..." : "Suppr."}
                    </button>
                  </div>
                ),
                className: "w-40",
              },
            ]}
            onRowClick={(f) => router.push(`/fermes/${f.id}`)}
          />
        </div>
      )}
    </div>
  );
}
