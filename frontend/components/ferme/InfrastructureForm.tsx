"use client";

import React from "react";
import type { InfrastructureFormData } from "@/lib/api-types";
import { TYPE_IAE_LABELS } from "@/lib/api-types";
import Button from "@/components/ui/Button";
import { uid } from "@/lib/utils";

interface InfrastructureFormProps {
  infrastructures: InfrastructureFormData[];
  onChange: (infras: InfrastructureFormData[]) => void;
}

const typeOptions = Object.entries(TYPE_IAE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function InfrastructureForm({
  infrastructures,
  onChange,
}: InfrastructureFormProps) {
  const addInfrastructure = () => {
    onChange([
      ...infrastructures,
      {
        id: uid(),
        type: "",
        surface_ha: "",
        longueur_m: "",
        description: "",
      },
    ]);
  };

  const updateInfra = (
    id: string,
    field: keyof InfrastructureFormData,
    value: string
  ) => {
    onChange(
      infrastructures.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      )
    );
  };

  const removeInfra = (id: string) => {
    onChange(infrastructures.filter((i) => i.id !== id));
  };

  const selectBase =
    "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-body";
  const inputBase =
    "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-body placeholder:text-gray-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-heading">
            Infrastructures agro-écologiques (IAE)
          </h3>
          <p className="text-sm text-gray-500 font-body">
            Optionnel — Les IAE apportent un bonus qui améliore le score
            environnemental.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addInfrastructure} type="button">
          + Ajouter une IAE
        </Button>
      </div>

      {infrastructures.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3" aria-hidden="true">🌿</div>
          <p className="text-gray-500 text-sm mb-2 font-body">
            Aucune infrastructure agro-écologique déclarée.
          </p>
          <p className="text-gray-400 text-xs font-body">
            Haies, mares, bosquets, bandes enherbées — ils améliorent le score !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {infrastructures.map((infra) => (
            <div
              key={infra.id}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-card"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Type d&apos;IAE
                  </label>
                  <select
                    value={infra.type}
                    onChange={(e) => updateInfra(infra.id, "type", e.target.value)}
                    className={selectBase}
                  >
                    <option value="" disabled>
                      Sélectionnez...
                    </option>
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Surface / Longueur
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={infra.surface_ha}
                      onChange={(e) =>
                        updateInfra(infra.id, "surface_ha", e.target.value)
                      }
                      placeholder="Surface (ha)"
                      className={`flex-1 ${inputBase}`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={infra.longueur_m}
                      onChange={(e) =>
                        updateInfra(infra.id, "longueur_m", e.target.value)
                      }
                      placeholder="Long. (m)"
                      className={`w-24 ${inputBase}`}
                    />
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    onClick={() => removeInfra(infra.id)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-body min-h-[44px]"
                    type="button"
                    aria-label="Supprimer cette IAE"
                  >
                    <span aria-hidden="true">🗑</span> Supprimer
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={infra.description}
                  onChange={(e) =>
                    updateInfra(infra.id, "description", e.target.value)
                  }
                  placeholder="Description (optionnelle)"
                  className={`w-full ${inputBase}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
