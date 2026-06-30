"use client";

import React from "react";
import type { ParcelleFormData } from "@/lib/api-types";
import ParcelleRow from "./ParcelleRow";
import Button from "@/components/ui/Button";
import { uid } from "@/lib/utils";

interface ParcellesTableProps {
  parcelles: ParcelleFormData[];
  cultures: string[];
  onChange: (parcelles: ParcelleFormData[]) => void;
}

export default function ParcellesTable({
  parcelles,
  cultures,
  onChange,
}: ParcellesTableProps) {
  const addParcelle = () => {
    onChange([
      ...parcelles,
      {
        id: uid(),
        culture: cultures[0] || "",
        surface_ha: "",
        bio: false,
        labour: true,
        irrigation: false,
        culture_intermediaire: "",
        commentaire: "",
      },
    ]);
  };

  const updateParcelle = (id: string, updated: ParcelleFormData) => {
    onChange(parcelles.map((p) => (p.id === id ? updated : p)));
  };

  const removeParcelle = (id: string) => {
    onChange(parcelles.filter((p) => p.id !== id));
  };

  const totalSurface = parcelles
    .reduce((sum, p) => sum + (parseFloat(p.surface_ha) || 0), 0)
    .toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-heading">
            Parcelles
          </h3>
          <p className="text-sm text-gray-500 font-body">
            {parcelles.length} parcelle{parcelles.length !== 1 ? "s" : ""} —
            Surface totale : <strong>{totalSurface} ha</strong>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addParcelle} type="button">
          + Ajouter une parcelle
        </Button>
      </div>

      {parcelles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3" aria-hidden="true">🌱</div>
          <p className="text-gray-500 text-sm mb-4 font-body">
            Aucune parcelle saisie.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={addParcelle}
            type="button"
          >
            + Ajouter une parcelle
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {parcelles.map((parcelle) => (
            <ParcelleRow
              key={parcelle.id}
              data={parcelle}
              cultures={cultures}
              onChange={(updated) => updateParcelle(parcelle.id, updated)}
              onRemove={() => removeParcelle(parcelle.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
