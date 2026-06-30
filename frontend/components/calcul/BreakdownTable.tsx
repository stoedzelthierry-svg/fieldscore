"use client";

import React from "react";
import type { IndicateurResultat } from "@/lib/api-types";
import { INDICATEURS_PEF, getScoreBarColor } from "@/lib/api-types";
import { formatNumber } from "@/lib/utils";
import Card, { CardTitle } from "@/components/ui/Card";

interface BreakdownTableProps {
  indicateurs: IndicateurResultat[];
  className?: string;
}

export default function BreakdownTable({
  indicateurs,
  className,
}: BreakdownTableProps) {
  const sorted = [...indicateurs].sort((a, b) => b.normalise - a.normalise);

  return (
    <Card className={className} padding="none">
      <div className="p-6 border-b border-gray-100">
        <CardTitle>Détail par indicateur</CardTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Indicateur
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Valeur brute
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Poids
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contribution
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((ind) => {
              const def = INDICATEURS_PEF.find(
                (d) => d.trigramme === ind.trigramme
              );
              const pct = (ind.normalise * 100).toFixed(1);
              const barColor = getScoreBarColor(parseFloat(pct));
              return (
                <tr
                  key={ind.trigramme}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-gray-500 w-8">
                        {ind.trigramme}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {def?.nom || ind.trigramme}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600 text-xs">
                    {ind.valeur < 0.0001
                      ? ind.valeur.toExponential(3)
                      : formatNumber(ind.valeur, 4)}{" "}
                    <span className="text-gray-400">{ind.unite}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">
                    {formatNumber(ind.poids * 100, 1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-20 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                      <span className="font-mono font-semibold w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
