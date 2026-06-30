"use client";

import React from "react";

interface CheptelFormData {
  type_animal: string;
  nb_animaux: string;
  logement: string;
  alimentation: string;
  gestion_effluents: string;
}

interface CheptelFormProps {
  cheptels: CheptelFormData[];
  onChange: (cheptels: CheptelFormData[]) => void;
}

let _uid = 1000;
function uidCheptel(): string {
  return `cheptel_${++_uid}`;
}

const typesAnimaux = [
  "Vache laitière",
  "Vache allaitante",
  "Bovin à l'engrais",
  "Génisse",
  "Veau",
  "Brebis",
  "Agneau",
  "Chèvre",
  "Porc à l'engrais",
  "Truie",
  "Poulet de chair",
  "Poule pondeuse",
  "Dinde",
  "Canard",
  "Autre",
];

const logements = [
  "Pâturage libre",
  "Stabulation libre",
  "Stabulation entravée",
  "Logettes",
  "Cages",
  "Volailles plein air",
  "Volailles bâtiment",
  "Mixte",
];

const alimentations = [
  "Herbe uniquement",
  "Herbe + concentrés",
  "Ensilage maïs",
  "Ration complète",
  "Aliment du commerce",
  "Autoproduction",
  "Mixte",
];

const selectBase =
  "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-body";
const inputBase =
  "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-body placeholder:text-gray-400";

export default function CheptelForm({
  cheptels,
  onChange,
}: CheptelFormProps) {
  const addCheptel = () => {
    onChange([
      ...cheptels,
      {
        type_animal: typesAnimaux[0],
        nb_animaux: "",
        logement: logements[0],
        alimentation: alimentations[0],
        gestion_effluents: "",
      },
    ]);
  };

  const update = (idx: number, field: string, value: string) => {
    const updated = cheptels.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    );
    onChange(updated);
  };

  const remove = (idx: number) => {
    onChange(cheptels.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-heading">
            Cheptel
          </h3>
          <p className="text-sm text-gray-500 font-body">
            Optionnel — Saisissez les animaux présents sur l&apos;exploitation.
          </p>
        </div>
        <button
          onClick={addCheptel}
          className="px-4 py-2.5 border-2 border-primary-600 text-primary-700 text-sm font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-200 font-body min-h-[44px]"
          type="button"
        >
          + Ajouter un cheptel
        </button>
      </div>

      {cheptels.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3" aria-hidden="true">🐄</div>
          <p className="text-gray-500 text-sm font-body">
            Aucun cheptel déclaré. Ajoutez-en un si votre exploitation inclut
            des animaux.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cheptels.map((cheptel, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-card"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Type d&apos;animal
                  </label>
                  <select
                    value={cheptel.type_animal}
                    onChange={(e) => update(idx, "type_animal", e.target.value)}
                    className={selectBase}
                  >
                    {typesAnimaux.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Nombre d&apos;animaux
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cheptel.nb_animaux}
                    onChange={(e) => update(idx, "nb_animaux", e.target.value)}
                    placeholder="Ex: 50"
                    className={inputBase}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    onClick={() => remove(idx)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-body min-h-[44px]"
                    type="button"
                    aria-label="Supprimer ce cheptel"
                  >
                    <span aria-hidden="true">🗑</span> Supprimer
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Logement
                  </label>
                  <select
                    value={cheptel.logement}
                    onChange={(e) => update(idx, "logement", e.target.value)}
                    className={selectBase}
                  >
                    {logements.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Alimentation
                  </label>
                  <select
                    value={cheptel.alimentation}
                    onChange={(e) =>
                      update(idx, "alimentation", e.target.value)
                    }
                    className={selectBase}
                  >
                    {alimentations.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1F2937] font-body">
                    Gestion des effluents
                  </label>
                  <input
                    type="text"
                    value={cheptel.gestion_effluents}
                    onChange={(e) =>
                      update(idx, "gestion_effluents", e.target.value)
                    }
                    placeholder="Ex: Fumier composté"
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
