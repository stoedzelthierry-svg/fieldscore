"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FermeForm, { validateFermeForm } from "@/components/ferme/FermeForm";
import ParcellesTable from "@/components/ferme/ParcellesTable";
import InfrastructureForm from "@/components/ferme/InfrastructureForm";
import CheptelForm from "@/components/ferme/CheptelForm";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { createFerme } from "@/lib/api";
import type {
  FermeFormData,
  ParcelleFormData,
  InfrastructureFormData,
  CategorieProduction,
} from "@/lib/api-types";
import { CULTURES } from "@/lib/api-types";
import { uid } from "@/lib/utils";

type Step = 1 | 2 | 3;

export default function NouvelleFermePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fermeData, setFermeData] = useState<FermeFormData>({
    nom: "",
    siret: "",
    code_insee: "",
    categorie: "",
  });

  const [parcelles, setParcelles] = useState<ParcelleFormData[]>([
    {
      id: uid(),
      culture: "Blé tendre",
      surface_ha: "",
      bio: false,
      labour: true,
      irrigation: false,
      culture_intermediaire: "",
      commentaire: "",
    },
  ]);

  const [infraAE, setInfraAE] = useState<InfrastructureFormData[]>([]);
  const [cheptels, setCheptels] = useState<
    Array<{
      type_animal: string;
      nb_animaux: string;
      logement: string;
      alimentation: string;
      gestion_effluents: string;
    }>
  >([]);

  const availableCultures = fermeData.categorie
    ? CULTURES[fermeData.categorie as CategorieProduction]
    : CULTURES.grandes_cultures;

  const canGoNext = (): boolean => {
    if (step === 1) {
      const errors = validateFermeForm(fermeData);
      return !Object.values(errors).some(Boolean);
    }
    if (step === 2) {
      return (
        parcelles.length > 0 &&
        parcelles.every((p) => p.culture && parseFloat(p.surface_ha) > 0)
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const result = await createFerme({
        nom: fermeData.nom,
        siret: fermeData.siret || null,
        code_insee: fermeData.code_insee || null,
        categorie: (fermeData.categorie as CategorieProduction) || null,
        parcelles: parcelles.map((p) => ({
          culture: p.culture,
          surface_ha: parseFloat(p.surface_ha) || 0,
          culture_intermediaire: p.culture_intermediaire || null,
          bio: p.bio,
          labour: p.labour,
          irrigation: p.irrigation,
          commentaire: p.commentaire || null,
        })),
      });
      router.push(`/fermes/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la création";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Infos", "Parcelles", "IAE & cheptel"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/fermes"
          className="text-sm text-gray-500 hover:text-gray-700 mb-3 inline-block font-body"
        >
          ← Retour aux fermes
        </Link>
        <h1 className="font-heading text-h2">Nouvelle ferme</h1>
        <p className="text-gray-500 mt-1 font-body">
          Saisissez les informations pour lancer un calcul environnemental.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="stepper-step">
            <div
              className={`stepper-circle ${
                step === s
                  ? "stepper-step-active"
                  : step > s
                  ? "stepper-step-completed"
                  : ""
              }`}
            >
              {step > s ? "✓" : s}
            </div>
            <span
              className={`text-sm ml-2 font-semibold hidden sm:inline font-body ${
                step >= s ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {stepLabels[s - 1]}
            </span>
            {s < 3 && <div className="stepper-line ml-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: General info */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8 animate-fade-in">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 font-heading">
            Informations générales
          </h2>
          <FermeForm data={fermeData} onChange={setFermeData} />
        </div>
      )}

      {/* Step 2: Parcels */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8 animate-fade-in">
          <ParcellesTable
            parcelles={parcelles}
            cultures={availableCultures}
            onChange={setParcelles}
          />
        </div>
      )}

      {/* Step 3: IAE & Cheptel */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8">
            <InfrastructureForm infrastructures={infraAE} onChange={setInfraAE} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8">
            <CheptelForm cheptels={cheptels} onChange={setCheptels} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => {
            if (step === 1) router.push("/fermes");
            else setStep((s) => (s - 1) as Step);
          }}
        >
          {step === 1 ? "Annuler" : "← Retour"}
        </Button>

        <div className="flex gap-3">
          {step < 3 ? (
            <Button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canGoNext()}>
              Suivant →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Créer la ferme
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
