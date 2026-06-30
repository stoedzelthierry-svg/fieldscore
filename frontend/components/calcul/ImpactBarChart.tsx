"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import type { IndicateurResultat } from "@/lib/api-types";
import { INDICATEURS_PEF, getScoreBarColor } from "@/lib/api-types";

interface ImpactBarChartProps {
  indicateurs: IndicateurResultat[];
  className?: string;
}

export default function ImpactBarChart({
  indicateurs,
  className,
}: ImpactBarChartProps) {
  const data = indicateurs
    .map((ind) => {
      const def = INDICATEURS_PEF.find((d) => d.trigramme === ind.trigramme);
      return {
        trigramme: ind.trigramme,
        nom: def?.nom || ind.trigramme,
        normalise: ind.normalise * 100,
        valeur: ind.valeur,
        unite: ind.unite,
      };
    })
    .sort((a, b) => b.normalise - a.normalise);

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
        <p className="font-semibold">
          {d.trigramme} — {d.nom}
        </p>
        <p className="text-gray-500 text-xs">{d.unite}</p>
        <p className="text-data-700 font-semibold">
          Contribution : {d.normalise.toFixed(1)}%
        </p>
        <p className="text-gray-400 text-xs">
          Valeur : {d.valeur.toExponential(2)}
        </p>
      </div>
    );
  };

  return (
    <div className={className}>
      <ResponsiveContainer
        width="100%"
        height={Math.max(350, data.length * 32)}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Open Sans" }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="trigramme"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 600, fontFamily: "Open Sans" }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", fontFamily: "Open Sans" }}
            payload={[
              { value: "Contribution normalisée", type: "rect", color: "#6366F1" },
            ]}
          />
          <Bar dataKey="normalise" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={getScoreBarColor(entry.normalise)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
