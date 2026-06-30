"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card, { CardTitle } from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { uid } from "@/lib/utils";
import type { TypeIAE } from "@/lib/api-types";

// ============================================================
// Constantes
// ============================================================

const CODES_CULTURE = [
  "BLE_TENDRE", "BLE_DUR", "ORGE", "MAIS_GRAIN", "COLZA", "TOURNESOL",
  "SOJA", "POIS", "FEVEROLE", "PRAIRIE_PERMANENTE", "PRAIRIE_TEMPORAIRE",
  "VIGNE_CUVE", "VERGER", "OLIVIER", "MARAICHAGE_PLEIN_CHAMP",
  "MARAICHAGE_SOUS_ABRI", "POMME_DE_TERRE", "BETTERAVE_SUCRIERE",
  "LUZERNE", "SORGHO", "SEIGLE", "AVOINE", "TRITICALE", "RIZ",
] as const;

const CULTURE_LABELS: Record<string, string> = {
  BLE_TENDRE: "Blé tendre",
  BLE_DUR: "Blé dur",
  ORGE: "Orge",
  MAIS_GRAIN: "Maïs grain",
  COLZA: "Colza",
  TOURNESOL: "Tournesol",
  SOJA: "Soja",
  POIS: "Pois",
  FEVEROLE: "Féverole",
  PRAIRIE_PERMANENTE: "Prairie permanente",
  PRAIRIE_TEMPORAIRE: "Prairie temporaire",
  VIGNE_CUVE: "Vigne — raisin de cuve",
  VERGER: "Verger",
  OLIVIER: "Olivier",
  MARAICHAGE_PLEIN_CHAMP: "Maraîchage plein champ",
  MARAICHAGE_SOUS_ABRI: "Maraîchage sous abri",
  POMME_DE_TERRE: "Pomme de terre",
  BETTERAVE_SUCRIERE: "Betterave sucrière",
  LUZERNE: "Luzerne",
  SORGHO: "Sorgho",
  SEIGLE: "Seigle",
  AVOINE: "Avoine",
  TRITICALE: "Triticale",
  RIZ: "Riz",
};

const TYPES_IAE: { value: TypeIAE; label: string; defaultMetrique: string }[] = [
  { value: "haie", label: "Haie", defaultMetrique: "ml" },
  { value: "bande_enherbee", label: "Bande enherbée", defaultMetrique: "m2" },
  { value: "mare", label: "Mare", defaultMetrique: "nb" },
  { value: "agroforesterie", label: "Agroforesterie", defaultMetrique: "ha" },
  { value: "jachere", label: "Jachère", defaultMetrique: "ha" },
  { value: "muret", label: "Muret", defaultMetrique: "ml" },
  { value: "arbre_isole", label: "Arbre isolé", defaultMetrique: "nb" },
];

const METRIQUE_LABELS: Record<string, string> = {
  ml: "mètres linéaires",
  m2: "m²",
  ha: "hectares",
  nb: "nombre",
};

const STEP_LABELS = [
  "Infos générales",
  "Parcelles",
  "Infrastructures (IAE)",
  "Récapitulatif",
] as const;

const TOTAL_STEPS = 4;

// ============================================================
// Types
// ============================================================

interface FermeGenData {
  nom: string;
  type_production: string;
  commune: string;
  surface_totale_ha: string;
  annee_reference: string;
}

interface ParcelleRow {
  id: string;
  code_culture: string;
  surface_ha: string;
  est_bio: boolean;
}

interface IaeRow {
  id: string;
  type_iae: string;
  metrique: string;
  valeur: string;
}

type Step = 1 | 2 | 3 | 4;

// ============================================================
// Validation
// ============================================================

function validateStep1(data: FermeGenData): Record<string, string | null> {
  const errs: Record<string, string | null> = {};
  if (!data.nom.trim()) errs.nom = "Le nom de la ferme est requis.";
  if (!data.type_production) errs.type_production = "Le type de production est requis.";
  if (!data.commune.trim()) errs.commune = "La commune est requise.";
  const surf = parseFloat(data.surface_totale_ha);
  if (!data.surface_totale_ha || isNaN(surf) || surf <= 0)
    errs.surface_totale_ha = "Surface totale requise ( > 0 ha).";
  const anRef = parseInt(data.annee_reference);
  if (!data.annee_reference || isNaN(anRef) || anRef < 2000 || anRef > 2100)
    errs.annee_reference = "Année entre 2000 et 2100.";
  return errs;
}

function validateStep2(parcelles: ParcelleRow[]): string | null {
  if (parcelles.length === 0) return "Ajoutez au moins une parcelle.";
  for (const p of parcelles) {
    if (!p.code_culture) return "Chaque parcelle doit avoir une culture.";
    const surf = parseFloat(p.surface_ha);
    if (!p.surface_ha || isNaN(surf) || surf <= 0)
      return "Chaque parcelle doit avoir une surface > 0 ha.";
  }
  return null;
}

// ============================================================
// Helpers
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiRequest(path: string, options: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      let detail = `Erreur ${res.status}`;
      try {
        const errBody = await res.json();
        if (errBody.detail) detail = errBody.detail;
      } catch {}
      throw new Error(detail);
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function emptyParcelle(): ParcelleRow {
  return { id: uid(), code_culture: "", surface_ha: "", est_bio: false };
}

function emptyIae(): IaeRow {
  return { id: uid(), type_iae: "", metrique: "", valeur: "" };
}

// ============================================================
// Composant principal
// ============================================================

export default function NouvelleFermeWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

  // --- Step 1 state ---
  const [fermeData, setFermeData] = useState<FermeGenData>({
    nom: "",
    type_production: "",
    commune: "",
    surface_totale_ha: "",
    annee_reference: String(new Date().getFullYear()),
  });

  // --- Step 2 state ---
  const [parcelles, setParcelles] = useState<ParcelleRow[]>([emptyParcelle()]);

  // --- Step 3 state ---
  const [iaes, setIaes] = useState<IaeRow[]>([]);

  // --- Navigation ---
  const goNext = useCallback(() => {
    if (step === 1) {
      const errs = validateStep1(fermeData);
      setValidationErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
    }
    if (step === 2) {
      const err = validateStep2(parcelles);
      if (err) { setError(err); return; }
    }
    setError(null);
    setStep((s) => (s + 1) as Step);
  }, [step, fermeData, parcelles]);

  const goPrev = useCallback(() => {
    setError(null);
    if (step === 1) router.push("/fermes");
    else setStep((s) => (s - 1) as Step);
  }, [step, router]);

  // --- Parcelle management ---
  const addParcelle = useCallback(() => {
    setParcelles((prev) => [...prev, emptyParcelle()]);
  }, []);

  const removeParcelle = useCallback((id: string) => {
    setParcelles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateParcelle = useCallback((id: string, field: keyof ParcelleRow, value: string | boolean) => {
    setParcelles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  // --- IAE management ---
  const addIae = useCallback(() => {
    setIaes((prev) => [...prev, emptyIae()]);
  }, []);

  const removeIae = useCallback((id: string) => {
    setIaes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateIae = useCallback((id: string, field: keyof IaeRow, value: string) => {
    setIaes((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        // Auto-set métrique when type changes
        if (field === "type_iae") {
          const tpl = TYPES_IAE.find((t) => t.value === value);
          if (tpl) updated.metrique = tpl.defaultMetrique;
        }
        return updated;
      })
    );
  }, []);

  // --- Submission ---
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // 1. Créer la ferme
      const fermePayload = {
        nom: fermeData.nom.trim(),
        type_production: fermeData.type_production,
        code_insee: fermeData.commune.trim(),
        surface_totale_ha: parseFloat(fermeData.surface_totale_ha),
        annee_reference: parseInt(fermeData.annee_reference),
        siret: null as string | null,
      };

      const ferme = (await apiRequest("/fermes", {
        method: "POST",
        body: JSON.stringify(fermePayload),
      })) as { id: string };

      const fermeId = ferme.id;

      // 2. Créer chaque parcelle
      const parcellePromises = parcelles.map((p) =>
        apiRequest(`/fermes/${fermeId}/parcelles`, {
          method: "POST",
          body: JSON.stringify({
            code_culture: p.code_culture,
            surface_ha: parseFloat(p.surface_ha),
            est_bio: p.est_bio,
          }),
        })
      );
      await Promise.all(parcellePromises);

      // 3. Créer les IAE via POST /api/v1/fermes/{id}/calcul avec données inline
      //    (pas d'endpoint dédié infrastructures pour l'instant)
      if (iaes.length > 0) {
        const infrastructuresPayload = iaes.map((i) => ({
          type_iae: i.type_iae,
          metrique: i.metrique,
          valeur: parseFloat(i.valeur) || 0,
        }));

        await apiRequest(`/fermes/${fermeId}/calcul`, {
          method: "POST",
          body: JSON.stringify({
            inclure_iae: true,
            infrastructures: infrastructuresPayload,
          }),
        });
      }

      router.push(`/fermes/${fermeId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/fermes"
          className="text-sm text-gray-500 hover:text-gray-700 mb-3 inline-block font-body transition-colors"
        >
          ← Retour aux fermes
        </Link>
        <h1 className="font-heading text-h2 text-gray-900">
          Nouvelle ferme
        </h1>
        <p className="text-gray-500 mt-1.5 font-body">
          Complétez les 4 étapes pour créer votre ferme et lancer un calcul environnemental.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <Alert variant="error" className="mb-6 animate-fade-in" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, idx) => {
            const s = idx + 1;
            const isActive = step === s;
            const isCompleted = step > s;
            const isFuture = step < s;
            return (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading transition-all duration-300 shrink-0",
                      isActive
                        ? "bg-primary-600 text-white shadow-md scale-110"
                        : isCompleted
                          ? "bg-eco-600 text-white"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-200",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                  <span
                    className={[
                      "text-sm font-semibold font-body hidden md:inline transition-colors",
                      isActive ? "text-gray-900" : isCompleted ? "text-eco-700" : "text-gray-400",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </div>
                {s < TOTAL_STEPS && (
                  <div
                    className={[
                      "flex-1 h-1 rounded-full mx-3 transition-colors duration-300",
                      isCompleted ? "bg-eco-500" : "bg-gray-200",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* === STEP 1: Infos générales === */}
      {step === 1 && (
        <Card padding="lg" className="animate-fade-in">
          <CardTitle as="h2" className="mb-6">Informations générales</CardTitle>

          <div className="space-y-5">
            <Input
              label="Nom de la ferme"
              placeholder="Ex: GAEC des Verts Pâturages"
              value={fermeData.nom}
              onChange={(e) => setFermeData({ ...fermeData, nom: e.target.value })}
              error={validationErrors.nom}
              required
            />

            <Select
              label="Type de production"
              placeholder="Sélectionnez un type..."
              options={[
                { value: "GRANDES_CULTURES", label: "Grandes cultures" },
                { value: "ELEVAGE", label: "Élevage" },
                { value: "MIXTE", label: "Mixte / Polyculture-élevage" },
                { value: "MARAICHAGE", label: "Maraîchage" },
                { value: "VITICULTURE", label: "Viticulture" },
                { value: "ARBORICULTURE", label: "Arboriculture" },
              ]}
              value={fermeData.type_production}
              onChange={(e) => setFermeData({ ...fermeData, type_production: e.target.value })}
              error={validationErrors.type_production}
              required
            />

            <Input
              label="Commune (code INSEE)"
              placeholder="Ex: 31555"
              value={fermeData.commune}
              onChange={(e) => setFermeData({ ...fermeData, commune: e.target.value.replace(/\D/g, "").slice(0, 5) })}
              error={validationErrors.commune}
              hint="Code INSEE à 5 chiffres de la commune"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Surface totale (ha)"
                placeholder="Ex: 85.5"
                type="number"
                min="0"
                step="0.01"
                value={fermeData.surface_totale_ha}
                onChange={(e) => setFermeData({ ...fermeData, surface_totale_ha: e.target.value })}
                error={validationErrors.surface_totale_ha}
                required
              />
              <Input
                label="Année de référence"
                placeholder="2024"
                type="number"
                min="2000"
                max="2100"
                value={fermeData.annee_reference}
                onChange={(e) => setFermeData({ ...fermeData, annee_reference: e.target.value })}
                error={validationErrors.annee_reference}
                hint="Année des données de culture"
                required
              />
            </div>

            {/* Data summary card */}
            {fermeData.nom && fermeData.type_production && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-4 animate-fade-in">
                <p className="text-sm font-semibold text-gray-700 font-body mb-2">Résumé</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 font-body">
                  <div>
                    <span className="text-gray-400">Nom :</span>{" "}
                    <span className="font-semibold text-gray-900">{fermeData.nom}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type :</span>{" "}
                    <span className="font-semibold text-gray-900">
                      {fermeData.type_production === "GRANDES_CULTURES" ? "Grandes cultures" :
                       fermeData.type_production === "ELEVAGE" ? "Élevage" :
                       fermeData.type_production === "MIXTE" ? "Mixte" :
                       fermeData.type_production === "MARAICHAGE" ? "Maraîchage" :
                       fermeData.type_production === "VITICULTURE" ? "Viticulture" :
                       fermeData.type_production === "ARBORICULTURE" ? "Arboriculture" :
                       fermeData.type_production}
                    </span>
                  </div>
                  {fermeData.commune && (
                    <div>
                      <span className="text-gray-400">Commune :</span>{" "}
                      <span className="font-semibold text-gray-900">{fermeData.commune}</span>
                    </div>
                  )}
                  {fermeData.surface_totale_ha && (
                    <div>
                      <span className="text-gray-400">Surface :</span>{" "}
                      <span className="font-semibold text-gray-900">{fermeData.surface_totale_ha} ha</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Année réf. :</span>{" "}
                    <span className="font-semibold text-gray-900">{fermeData.annee_reference}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* === STEP 2: Parcelles === */}
      {step === 2 && (
        <div className="animate-fade-in space-y-5">
          <Card padding="lg">
            <CardTitle as="h2" className="mb-1">Parcelles</CardTitle>
            <p className="text-sm text-gray-500 mb-6 font-body">
              Ajoutez les parcelles de la ferme. Sélectionnez la culture parmi les 24 codes PAC disponibles.
            </p>

            {parcelles.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-4xl mb-3">🌾</div>
                <p className="text-gray-500 font-body mb-4">Aucune parcelle ajoutée.</p>
                <Button variant="outline" size="sm" onClick={addParcelle}>
                  + Ajouter une parcelle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {parcelles.map((p, idx) => (
                  <div
                    key={p.id}
                    className="relative bg-gray-50 border border-gray-200 rounded-xl p-5 animate-fade-in group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-400 font-heading uppercase tracking-wider">
                        Parcelle {idx + 1}
                      </span>
                      {parcelles.length > 1 && (
                        <button
                          onClick={() => removeParcelle(p.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-red-50"
                          aria-label={`Supprimer la parcelle ${idx + 1}`}
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <Select
                        label="Culture"
                        placeholder="Choisir une culture..."
                        options={CODES_CULTURE.map((code) => ({
                          value: code,
                          label: CULTURE_LABELS[code] || code,
                        }))}
                        value={p.code_culture}
                        onChange={(e) => updateParcelle(p.id, "code_culture", e.target.value)}
                      />

                      <Input
                        label="Surface (ha)"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 5.5"
                        value={p.surface_ha}
                        onChange={(e) => updateParcelle(p.id, "surface_ha", e.target.value)}
                      />

                      <div className="flex items-center gap-3 h-input">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={p.est_bio}
                              onChange={(e) => updateParcelle(p.id, "est_bio", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div
                              className={[
                                "w-11 h-6 rounded-full transition-colors duration-200",
                                p.est_bio ? "bg-eco-600" : "bg-gray-200",
                              ].join(" ")}
                            />
                            <div
                              className={[
                                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
                                p.est_bio ? "translate-x-5" : "translate-x-0",
                              ].join(" ")}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 font-body">
                            {p.est_bio ? "Bio 🌿" : "Conventionnel"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addParcelle}
                  className="w-full border-2 border-dashed border-gray-300 text-gray-400 hover:text-primary-600 hover:border-primary-300 rounded-xl py-4 text-sm font-semibold font-body transition-all duration-200 flex items-center justify-center gap-2 hover:bg-primary-50/50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une parcelle
                </button>
              </div>
            )}

            {/* Summary */}
            {parcelles.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-body">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 font-heading">{parcelles.length}</div>
                    <div className="text-gray-500 text-xs mt-0.5">parcelle{parcelles.length > 1 ? "s" : ""}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 font-heading">
                      {parcelles.reduce((sum, p) => sum + (parseFloat(p.surface_ha) || 0), 0).toFixed(1)}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">ha total</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-eco-700 font-heading">
                      {parcelles.filter((p) => p.est_bio).length}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">parcelles bio</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* === STEP 3: Infrastructures écologiques === */}
      {step === 3 && (
        <div className="animate-fade-in space-y-5">
          <Card padding="lg">
            <CardTitle as="h2" className="mb-1">Infrastructures écologiques (IAE)</CardTitle>
            <p className="text-sm text-gray-500 mb-6 font-body">
              Ajoutez les infrastructures agro-écologiques présentes sur l&apos;exploitation (optionnel).
              Elles influencent positivement le score environnemental.
            </p>

            {iaes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-4xl mb-3">🌳</div>
                <p className="text-gray-500 font-body mb-4">Aucune infrastructure ajoutée.</p>
                <Button variant="outline" size="sm" onClick={addIae}>
                  + Ajouter une IAE
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {iaes.map((i, idx) => (
                  <div
                    key={i.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-5 animate-fade-in"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-400 font-heading uppercase tracking-wider">
                        IAE {idx + 1}
                      </span>
                      <button
                        onClick={() => removeIae(i.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-red-50"
                        aria-label={`Supprimer l'IAE ${idx + 1}`}
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Select
                        label="Type d'IAE"
                        placeholder="Choisir un type..."
                        options={TYPES_IAE.map((t) => ({ value: t.value, label: t.label }))}
                        value={i.type_iae}
                        onChange={(e) => updateIae(i.id, "type_iae", e.target.value)}
                      />
                      <Input
                        label={`Valeur (${METRIQUE_LABELS[i.metrique] || "?"})`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={i.metrique === "nb" ? "Ex: 3" : "Ex: 150"}
                        value={i.valeur}
                        onChange={(e) => updateIae(i.id, "valeur", e.target.value)}
                        disabled={!i.metrique}
                      />
                      {i.type_iae && (
                        <div className="flex items-center h-input">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-eco-50 text-eco-700 text-sm font-semibold font-body border border-eco-200">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            {METRIQUE_LABELS[i.metrique] || i.metrique}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addIae}
                  className="w-full border-2 border-dashed border-gray-300 text-gray-400 hover:text-eco-600 hover:border-eco-300 rounded-xl py-4 text-sm font-semibold font-body transition-all duration-200 flex items-center justify-center gap-2 hover:bg-eco-50/50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une IAE
                </button>
              </div>
            )}

            {/* Summary */}
            {iaes.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-body mb-3 uppercase tracking-wider">Résumé IAE</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {iaes.map((i, idx) => (
                    <div key={i.id} className="flex items-center gap-2 text-sm font-body bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-base">{
                        i.type_iae === "haie" ? "🌿" :
                        i.type_iae === "bande_enherbee" ? "🌱" :
                        i.type_iae === "mare" ? "💧" :
                        i.type_iae === "agroforesterie" ? "🌳" :
                        i.type_iae === "jachere" ? "🌸" :
                        i.type_iae === "muret" ? "🧱" :
                        i.type_iae === "arbre_isole" ? "🌲" : "🌍"
                      }</span>
                      <span className="font-semibold text-gray-900">
                        {TYPES_IAE.find((t) => t.value === i.type_iae)?.label || i.type_iae}
                      </span>
                      <span className="text-gray-500 ml-auto">
                        {i.valeur} {i.metrique}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* === STEP 4: Récapitulatif === */}
      {step === 4 && (
        <div className="animate-fade-in space-y-6">
          <Card padding="lg">
            <CardTitle as="h2" className="mb-4">Récapitulatif de la ferme</CardTitle>
            <p className="text-sm text-gray-500 font-body mb-6">
              Vérifiez les informations avant de créer la ferme.
            </p>

            {/* 1. Infos générales */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 font-heading uppercase tracking-wider mb-3">
                Informations générales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <RecapItem label="Nom" value={fermeData.nom} />
                <RecapItem
                  label="Type de production"
                  value={
                    fermeData.type_production === "GRANDES_CULTURES" ? "Grandes cultures" :
                    fermeData.type_production === "ELEVAGE" ? "Élevage" :
                    fermeData.type_production === "MIXTE" ? "Mixte" :
                    fermeData.type_production === "MARAICHAGE" ? "Maraîchage" :
                    fermeData.type_production === "VITICULTURE" ? "Viticulture" :
                    fermeData.type_production === "ARBORICULTURE" ? "Arboriculture" :
                    fermeData.type_production
                  }
                />
                <RecapItem label="Commune" value={fermeData.commune} />
                <RecapItem label="Surface totale" value={`${fermeData.surface_totale_ha} ha`} />
                <RecapItem label="Année de référence" value={fermeData.annee_reference} />
              </div>
            </div>

            {/* 2. Parcelles */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 font-heading uppercase tracking-wider mb-3">
                Parcelles ({parcelles.length})
              </h3>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm font-body">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Culture</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Surface</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {parcelles.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{CULTURE_LABELS[p.code_culture] || p.code_culture}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{parseFloat(p.surface_ha).toFixed(2)} ha</td>
                        <td className="px-4 py-3 text-center">
                          {p.est_bio ? (
                            <span className="inline-flex items-center gap-1 text-eco-700 bg-eco-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                              🌿 Bio
                            </span>
                          ) : (
                            <span className="text-gray-400">Conv.</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-3 text-sm font-body">
                <span className="text-gray-500">
                  <span className="font-semibold text-gray-900">{parcelles.length}</span> parcelle{parcelles.length > 1 ? "s" : ""}
                </span>
                <span className="text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {parcelles.reduce((sum, p) => sum + (parseFloat(p.surface_ha) || 0), 0).toFixed(2)} ha
                  </span>{" "}
                  total
                </span>
                <span className="text-gray-500">
                  <span className="font-semibold text-eco-700">
                    {parcelles.filter((p) => p.est_bio).length}
                  </span>{" "}
                  en bio
                </span>
              </div>
            </div>

            {/* 3. IAE */}
            {iaes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 font-heading uppercase tracking-wider mb-3">
                  Infrastructures écologiques ({iaes.length})
                </h3>
                <div className="space-y-2">
                  {iaes.map((i, idx) => (
                    <div key={i.id} className="flex items-center gap-3 text-sm font-body bg-gray-50 rounded-lg px-4 py-3">
                      <span className="text-gray-400 font-heading w-6">{idx + 1}.</span>
                      <span className="text-2xl">{
                        i.type_iae === "haie" ? "🌿" :
                        i.type_iae === "bande_enherbee" ? "🌱" :
                        i.type_iae === "mare" ? "💧" :
                        i.type_iae === "agroforesterie" ? "🌳" :
                        i.type_iae === "jachere" ? "🌸" :
                        i.type_iae === "muret" ? "🧱" :
                        i.type_iae === "arbre_isole" ? "🌲" : "🌍"
                      }</span>
                      <span className="font-semibold text-gray-900 flex-1">
                        {TYPES_IAE.find((t) => t.value === i.type_iae)?.label || i.type_iae}
                      </span>
                      <span className="text-gray-500">
                        {i.valeur} {METRIQUE_LABELS[i.metrique] || i.metrique}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {iaes.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-400 font-body italic">
                Aucune infrastructure écologique
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" onClick={goPrev} disabled={submitting}>
          {step === 1 ? "Annuler" : "← Précédent"}
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-body hidden sm:inline">
            Étape {step}/{TOTAL_STEPS}
          </span>
          {step < TOTAL_STEPS ? (
            <Button onClick={goNext} size="lg">
              Suivant →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} size="lg">
              Créer la ferme
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sous-composant RecapItem
// ============================================================

function RecapItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-400 font-body mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900 font-body">{value || "—"}</p>
    </div>
  );
}
