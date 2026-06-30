"use client";

import React from "react";
import type { IaeImpact } from "@/lib/api-types";
import { TYPE_IAE_LABELS } from "@/lib/api-types";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatNumber } from "@/lib/utils";

interface IaeImpactProps {
  iaeImpact: IaeImpact | null;
  className?: string;
}

const iaeEmoji: Record<string, string> = {
  haie: "🌳",
  mare: "💧",
  bosquet: "🌲",
  bande_enherbee: "🌿",
  prairie_permanente: "🌾",
  mur_pierre_seche: "🧱",
  fosse: "💦",
  verger_haute_tige: "🌳",
  autre: "🌱",
};

export default function IaeImpactVisualization({
  iaeImpact,
  className,
}: IaeImpactProps) {
  if (!iaeImpact || iaeImpact.details.length === 0) return null;

  const scoreFinal =
    iaeImpact.score_initial * (1 - iaeImpact.bonus_total_pct / 100);

  return (
    <Card className={className}>
      <CardTitle>Bonus Infrastructures Agro-Écologiques</CardTitle>
      <p className="text-sm text-gray-500 mt-1 font-body">
        Les IAE peuvent réduire le score environnemental jusqu&apos;à 15%.
      </p>

      {/* Score impact */}
      <div className="mt-5 p-5 rounded-xl bg-eco-50 border border-eco-200">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-body">Score initial</p>
            <p className="text-2xl font-extrabold text-gray-900 font-heading">
              {formatNumber(iaeImpact.score_initial, 1)}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-eco-600 font-heading">
              −{formatNumber(Math.abs(iaeImpact.bonus_total_pct), 1)}%
            </div>
            <p className="text-xs text-gray-500 font-body">Bonus IAE</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 font-body">Score final</p>
            <p className="text-2xl font-extrabold text-eco-700 font-heading">
              {formatNumber(scoreFinal, 1)}
            </p>
          </div>
        </div>
      </div>

      {/* Detail per IAE */}
      <div className="mt-4 space-y-2">
        {iaeImpact.details.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">
                {iaeEmoji[d.type] || "🌱"}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 font-body">
                  {TYPE_IAE_LABELS[d.type] || d.type}
                </p>
                {d.description && (
                  <p className="text-xs text-gray-500 font-body">
                    {d.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-body">
                {d.surface_ha != null
                  ? `${formatNumber(d.surface_ha, 2)} ha`
                  : d.longueur_m != null
                  ? `${formatNumber(d.longueur_m, 0)} m`
                  : ""}
              </span>
              <Badge variant="success" size="sm">
                −{d.bonus_pct.toFixed(1)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
