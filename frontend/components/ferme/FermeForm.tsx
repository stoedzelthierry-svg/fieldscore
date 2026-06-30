"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { validateSiret, validateCodeInsee } from "@/lib/utils";
import type { CategorieProduction, FermeFormData } from "@/lib/api-types";
import { CATEGORIE_LABELS } from "@/lib/api-types";

interface FermeFormProps {
  data: FermeFormData;
  onChange: (data: FermeFormData) => void;
}

const categorieOptions = Object.entries(CATEGORIE_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function FermeForm({ data, onChange }: FermeFormProps) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const updateField = (field: keyof FermeFormData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
    const newErrors = { ...errors };
    if (field === "siret") {
      newErrors.siret = value ? validateSiret(value) : null;
    }
    if (field === "code_insee") {
      newErrors.code_insee = value ? validateCodeInsee(value) : null;
    }
    setErrors(newErrors);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {
      nom: data.nom.trim() ? null : "Le nom de la ferme est requis.",
      siret: data.siret ? validateSiret(data.siret) : null,
      code_insee: data.code_insee ? validateCodeInsee(data.code_insee) : null,
      categorie: data.categorie ? null : "Veuillez sélectionner un type de production.",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  return (
    <div className="space-y-5">
      <Input
        label="Nom de la ferme"
        placeholder="Ex: GAEC des Verts Pâturages"
        value={data.nom}
        onChange={(e) => updateField("nom", e.target.value)}
        error={errors.nom}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="SIRET"
          placeholder="14 chiffres"
          value={data.siret}
          onChange={(e) =>
            updateField("siret", e.target.value.replace(/\D/g, "").slice(0, 14))
          }
          error={errors.siret}
          hint="Optionnel — 14 chiffres (clé Luhn)"
        />
        <Input
          label="Code INSEE"
          placeholder="5 chiffres"
          value={data.code_insee}
          onChange={(e) =>
            updateField("code_insee", e.target.value.replace(/\D/g, "").slice(0, 5))
          }
          error={errors.code_insee}
          hint="Optionnel — code commune"
        />
      </div>

      <Select
        label="Type de production"
        placeholder="Sélectionnez une catégorie..."
        options={categorieOptions}
        value={data.categorie}
        onChange={(e) => updateField("categorie", e.target.value)}
        error={errors.categorie}
        required
      />

      {data.categorie && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800 font-body">
          <p className="font-semibold mb-1">
            {CATEGORIE_LABELS[data.categorie as CategorieProduction]}
          </p>
          <p className="text-primary-700">
            Les cultures disponibles pour les parcelles seront adaptées à cette
            catégorie de production.
          </p>
        </div>
      )}
    </div>
  );
}

export function validateFermeForm(
  data: FermeFormData
): Record<string, string | null> {
  return {
    nom: data.nom.trim() ? null : "Le nom de la ferme est requis.",
    siret: data.siret ? validateSiret(data.siret) : null,
    code_insee: data.code_insee ? validateCodeInsee(data.code_insee) : null,
    categorie: data.categorie
      ? null
      : "Veuillez sélectionner un type de production.",
  };
}
