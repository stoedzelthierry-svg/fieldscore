"use client";

import React from "react";
import type { NiveauConfiance } from "@/lib/api-types";
import { CONFIANCE_COLORS, CONFIANCE_LABELS } from "@/lib/api-types";

interface ConfidenceBadgeProps {
  niveau: NiveauConfiance;
  className?: string;
}

const descriptions: Record<NiveauConfiance, string> = {
  eleve:
    "Données terrain principales — Calcul précis basé sur des mesures directes et des facteurs d'émission spécifiques.",
  moyen:
    "Données régionales — Des données locales sont disponibles mais certains facteurs reposent sur des moyennes nationales.",
  faible:
    "Données génériques — Le calcul repose principalement sur des moyennes nationales. Résultat indicatif.",
};

const icons: Record<NiveauConfiance, string> = {
  eleve: "🟢",
  moyen: "🟡",
  faible: "🔴",
};

export default function ConfidenceBadge({
  niveau,
  className,
}: ConfidenceBadgeProps) {
  const color = CONFIANCE_COLORS[niveau];
  const label = CONFIANCE_LABELS[niveau];

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          {icons[niveau]}
        </span>
        <span
          className="px-3 py-1 rounded-full text-sm font-semibold font-body border"
          style={{
            color,
            borderColor: color,
            backgroundColor: `${color}12`,
          }}
        >
          Confiance : {label}
        </span>
      </div>
      <p className="text-xs text-gray-500 max-w-xs leading-snug font-body">
        {descriptions[niveau]}
      </p>
    </div>
  );
}
