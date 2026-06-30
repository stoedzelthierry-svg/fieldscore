"use client";

import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { IndicateurResultat } from "@/lib/api-types";
import { INDICATEURS_PEF } from "@/lib/api-types";

interface ImpactRadarProps {
  indicateurs: IndicateurResultat[];
  className?: string;
}

export default function ImpactRadar({
  indicateurs,
  className,
}: ImpactRadarProps) {
  const data = INDICATEURS_PEF.map((def) => {
    const result = indicateurs.find((i) => i.trigramme === def.trigramme);
    return {
      trigramme: def.trigramme,
      nom: def.nom,
      valeur: result ? result.normalise * 100 : 0,
      valeurBrute: result ? result.valeur : 0,
      unite: def.unite,
    };
  });

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof data)[0] }>;
  }) => {
    if (!active || !payload || !payload[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-card-hover p-3 text-sm font-body">
        <p className="font-semibold text-gray-900">{d.nom}</p>
        <p className="text-gray-500 text-xs">
          {d.trigramme} — {d.unite}
        </p>
        <p className="text-data-700 font-semibold mt-1">
          Normalisé : {d.valeur.toFixed(1)}%
        </p>
        <p className="text-gray-400 text-xs">
          Brut : {d.valeurBrute.toExponential(2)}
        </p>
      </div>
    );
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={420}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="trigramme"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 600, fontFamily: "Open Sans" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "Open Sans" }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", fontFamily: "Open Sans" }}
            payload={[{ value: "Profil d'impact", type: "rect", color: "#6366F1" }]}
          />
          <Radar
            name="Profil d'impact"
            dataKey="valeur"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
