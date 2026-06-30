"use client";

import React from "react";
import type { ParcelleFormData } from "@/lib/api-types";

interface ParcelleRowProps {
  data: ParcelleFormData;
  cultures: string[];
  onChange: (data: ParcelleFormData) => void;
  onRemove: () => void;
}

export default function ParcelleRow({
  data,
  cultures,
  onChange,
  onRemove,
}: ParcelleRowProps) {
  const update = (field: keyof ParcelleFormData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const selectBase =
    "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-body";
  const inputBase =
    "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 font-body placeholder:text-gray-400";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Culture */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1F2937] font-body">
            Culture
          </label>
          <select
            value={data.culture}
            onChange={(e) => update("culture", e.target.value)}
            className={selectBase}
          >
            {cultures.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Surface */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1F2937] font-body">
            Surface (ha)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={data.surface_ha}
            onChange={(e) => update("surface_ha", e.target.value)}
            placeholder="0.00"
            className={inputBase}
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1F2937] font-body">
            Options
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={data.bio}
                onChange={(e) => update("bio", e.target.checked)}
                className="rounded border-gray-300 text-eco-600 focus:ring-eco-500"
              />
              <span className="text-sm text-gray-700 font-body">Bio</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={data.labour}
                onChange={(e) => update("labour", e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 font-body">Labour</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={data.irrigation}
                onChange={(e) => update("irrigation", e.target.checked)}
                className="rounded border-gray-300 text-data-600 focus:ring-data-500"
              />
              <span className="text-sm text-gray-700 font-body">Irrigation</span>
            </label>
          </div>
        </div>

        {/* Remove */}
        <div className="flex items-end justify-end">
          <button
            onClick={onRemove}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-body min-h-[44px]"
            title="Supprimer cette parcelle"
            type="button"
            aria-label="Supprimer cette parcelle"
          >
            <span aria-hidden="true">🗑</span> Supprimer
          </button>
        </div>
      </div>

      {/* Culture intermédiaire + commentaire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1F2937] font-body">
            Culture intermédiaire (optionnel)
          </label>
          <input
            type="text"
            value={data.culture_intermediaire}
            onChange={(e) => update("culture_intermediaire", e.target.value)}
            placeholder="Ex: moutarde, phacélie..."
            className={inputBase}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1F2937] font-body">
            Commentaire
          </label>
          <input
            type="text"
            value={data.commentaire}
            onChange={(e) => update("commentaire", e.target.value)}
            placeholder="Note libre..."
            className={inputBase}
          />
        </div>
      </div>
    </div>
  );
}
