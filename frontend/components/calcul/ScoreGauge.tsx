"use client";

import React, { useEffect, useState } from "react";
import type { CategorieScore } from "@/lib/api-types";
import { SCORE_COLORS, SCORE_LABELS } from "@/lib/api-types";
import { formatNumber, scoreToCategorie } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  className?: string;
}

export default function ScoreGauge({
  score,
  maxScore = 10,
  size = 220,
  className,
}: ScoreGaugeProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const categorie = scoreToCategorie(score);
  const color = SCORE_COLORS[categorie];
  const ratio = Math.min(score / maxScore, 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(ratio), 100);
    return () => clearTimeout(timer);
  }, [ratio]);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2 - 10;
  const gradientId = `score-gauge-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={className} style={{ width: size, height: size * 0.75 }}>
      <svg
        width={size}
        height={size * 0.75}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Score environnemental : catégorie ${categorie}, ${formatNumber(score, 1)} points`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="25%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC3B41" />
          </linearGradient>
        </defs>

        <path
          d={describeArc(size / 2, size * 0.75, radius, 180, 360)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <path
          d={describeArc(
            size / 2,
            size * 0.75,
            radius,
            180,
            180 + 180 * animProgress
          )}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: "all 1s ease-out" }}
        />

        {["A", "B", "C", "D", "E"].map((letter, i) => {
          const angle = 180 + (i * 180) / 4;
          const rad = ((angle - 90) * Math.PI) / 180;
          const r = radius + 2;
          const x = size / 2 + r * Math.cos(rad);
          const y = size * 0.75 + r * Math.sin(rad);
          return (
            <text
              key={letter}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-heading"
              fontSize="14"
              fontWeight={letter === categorie ? "800" : "600"}
              fill={letter === categorie ? color : "#9CA3AF"}
            >
              {letter}
            </text>
          );
        })}
      </svg>

      <div className="text-center" style={{ marginTop: `-${size * 0.22}px` }}>
        <div
          className="text-5xl font-extrabold transition-colors duration-500 font-heading"
          style={{ color }}
        >
          {categorie}
        </div>
        <div className="text-sm font-semibold text-gray-600 mt-0.5 font-body">
          {SCORE_LABELS[categorie]}
        </div>
        <div className="text-sm font-mono text-gray-500 mt-0.5">
          {formatNumber(score, 1)} pts
        </div>
      </div>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}
