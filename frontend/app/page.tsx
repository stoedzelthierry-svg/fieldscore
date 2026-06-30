"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useFerme } from "@/components/ferme/FermeContext";

// Sector averages (mPt/ha) — hardcoded for now
const SECTOR_AVERAGES: Record<string, { label: string; value: number }> = {
  GRANDES_CULTURES: { label: "Grandes cultures", value: 750 },
  MIXTE: { label: "Mixte", value: 450 },
  VITICULTURE: { label: "Viticulture", value: 550 },
  MARAICHAGE: { label: "Maraîchage", value: 400 },
  ARBORICULTURE: { label: "Arboriculture", value: 350 },
  ELEVAGE_BOVIN: { label: "Élevage bovin", value: 900 },
  ELEVAGE_OVIN_CAPRIN: { label: "Élevage ovin/caprin", value: 820 },
  ELEVAGE_PORCIN: { label: "Élevage porcin", value: 1200 },
  ELEVAGE_AVICOLE: { label: "Élevage avicole", value: 950 },
  POLYCULTURE_ELEVAGE: { label: "Polyculture-élevage", value: 700 },
  AUTRE: { label: "Autre", value: 600 },
};

function getSectorComparison(fermeScore: number, fermeType?: string): { label: string; avg: number; above: boolean } | null {
  const key = fermeType?.toUpperCase() || null;
  const sector = key ? SECTOR_AVERAGES[key] : null;
  if (!sector || fermeScore === 0) return null;
  return {
    label: sector.label,
    avg: sector.value,
    above: fermeScore < sector.value, // lower score = better
  };
}

// Score color mapping with light gradient variants
const catGradients: Record<string, string> = {
  A: "bg-gradient-to-br from-emerald-50 to-white",
  B: "bg-gradient-to-br from-green-50 to-white",
  C: "bg-gradient-to-br from-amber-50 to-white",
  D: "bg-gradient-to-br from-orange-50 to-white",
  E: "bg-gradient-to-br from-red-50 to-white",
  "?": "bg-gradient-to-br from-gray-50 to-white",
};

export default function HomePage() {
  const { fermeSelectionnee } = useFerme();
  const [calcul, setCalcul] = useState<any>(null);
  const [loadingCalcul, setLoadingCalcul] = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (fermeSelectionnee) {
      setLoadingCalcul(true);
      fetch(`/api/v1/fermes/${fermeSelectionnee.id}/calcul`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annee: 2024 }),
      })
        .then((r) => r.json())
        .then((data) => {
          const cat = data.categorie || '?';
          const catLabels: Record<string, string> = { A: 'Excellent', B: 'Très bon', C: 'Bon', D: 'Moyen', E: 'À améliorer' };
          const catColors: Record<string, string> = { A: '#2E7D32', B: '#66BB6A', C: '#FFC107', D: '#FF9800', E: '#F44336' };
          setCalcul({
            score: {
              note: Math.round(data.score_unique || 0),
              label: catLabels[cat] || `Catégorie ${cat}`,
              couleur: catColors[cat] || '#F44336',
              categorie: cat,
            },
            empreinte_carbone_kgco2e: data.impacts_json?.cch?.valeur || 0,
            impact_total_mpt: data.score_unique || 0,
          });
          // Trigger animation by remounting score element
          setAnimKey((k) => k + 1);
        })
        .catch((e) => console.error("Erreur calcul:", e))
        .finally(() => setLoadingCalcul(false));
    }
  }, [fermeSelectionnee]);

  const sectorComp = calcul?.score
    ? getSectorComparison(calcul.impact_total_mpt, fermeSelectionnee?.type_production)
    : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-data-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full mb-6 uppercase tracking-wider font-body">
              🆕 Méthode Ecobalyse 2026
            </div>
            <h1 className="font-heading">
              Votre{" "}
              <span className="text-primary-600">performance environnementale</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-body">
              {fermeSelectionnee ? (
                <>
                  Analyse en cours pour{" "}
                  <strong className="text-gray-900">{fermeSelectionnee.nom}</strong>
                </>
              ) : (
                <>
                  Méthode officielle Ecobalyse. Données Agribalyse 3.2.{" "}
                  <strong className="text-gray-900">Développé par EcoCert.</strong>{" "}
                  Open source.
                </>
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/fermes/nouvelle">
                <Button size="lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une ferme
                </Button>
              </Link>
              <Link href="/methodologie">
                <Button variant="outline" size="lg">
                  📖 Comprendre la méthode
                </Button>
              </Link>
            </div>

            {/* Score / État ferme */}
            <div className="mt-10 max-w-lg mx-auto">
              {!fermeSelectionnee ? (
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 font-body">
                    Sélectionnez une ferme dans le menu pour voir son score
                  </p>
                </div>
              ) : loadingCalcul ? (
                <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-36 mx-auto mb-3" />
                  <div className="h-10 bg-gray-200 rounded w-24 mx-auto" />
                </div>
              ) : calcul?.score ? (
                <div
                  key={animKey}
                  className={`rounded-2xl p-6 shadow-lg border ${catGradients[calcul.score.categorie] || catGradients["?"]}`}
                  style={{ borderColor: calcul.score.couleur ? `${calcul.score.couleur}30` : undefined }}
                >
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3 font-body">
                    Score environnemental
                  </p>
                  {/* Catégorie letter with pulse animation */}
                  <div className="flex items-center justify-center gap-4">
                    <div
                      className="text-5xl font-extrabold font-heading animate-score-pulse"
                      style={{ color: calcul.score.couleur || "#059669" }}
                    >
                      {calcul.score.categorie}
                    </div>
                    <div className="text-left">
                      <div
                        ref={scoreRef}
                        className="text-2xl font-bold text-gray-900 font-heading animate-count-up"
                      >
                        {calcul.score.note?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-body">mPt/ha</div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mt-3 font-body">{calcul.score.label}</p>
                  <p className="text-xs text-gray-500 mt-1 font-body">{fermeSelectionnee.nom}</p>
                  {/* Sector comparison */}
                  {sectorComp && (
                    <div className="mt-3 pt-3 border-t border-gray-200/70 animate-fade-in-up">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-body">
                          Moyenne {sectorComp.label}
                        </span>
                        <span className="text-gray-400 font-mono">{sectorComp.avg.toLocaleString()} mPt/ha</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        {sectorComp.above ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-eco-700 bg-eco-100 px-2 py-0.5 rounded-full font-body">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 15l7-7 7 7"/>
                              </svg>
                              Au-dessus de la moyenne
                            </span>
                            <span className="text-xs text-eco-600 font-body">
                              {((1 - calcul.impact_total_mpt / sectorComp.avg) * 100).toFixed(0)} % meilleur
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-warn-700 bg-warn-100 px-2 py-0.5 rounded-full font-body">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M19 9l-7 7-7-7"/>
                              </svg>
                              Sous la moyenne
                            </span>
                            <span className="text-xs text-warn-600 font-body">
                              {((calcul.impact_total_mpt / sectorComp.avg - 1) * 100).toFixed(0)} % au-dessus
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Stats row */}
                  <div className="mt-4 pt-4 border-t border-gray-200/70 grid grid-cols-2 gap-4 text-center text-xs text-gray-500">
                    <div>
                      <div className="font-bold text-gray-900">{calcul.empreinte_carbone_kgco2e?.toLocaleString() || "—"}</div>
                      <div>kg CO₂e/ha</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{calcul.impact_total_mpt?.toLocaleString() || "—"}</div>
                      <div>mPt/ha</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-100">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-2 font-body">Ferme sélectionnée</p>
                  <h3 className="font-heading text-xl font-extrabold text-gray-900">{fermeSelectionnee.nom}</h3>
                  <p className="text-sm text-gray-600 mt-1 font-body">{fermeSelectionnee.type_production}</p>
                  <p className="text-xs text-gray-400 mt-3 font-body">Ajoutez des parcelles pour lancer le calcul</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="text-center">
            <div className="text-4xl mb-4" aria-hidden="true">🏛️</div>
            <CardTitle>Calcul certifié</CardTitle>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed font-body">
              Basé sur la méthode officielle <strong className="text-gray-900">Ecobalyse</strong> et le référentiel
              PEF (Product Environmental Footprint) de la Commission Européenne.
              16 indicateurs normalisés.
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="text-4xl mb-4" aria-hidden="true">🔓</div>
            <CardTitle>Open Source</CardTitle>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed font-body">
              Licence <strong className="text-gray-900">MIT</strong>. Code source ouvert, données
              publiques, méthode documentée. Tout organisme de certification
              peut utiliser, auditer et contribuer.
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="text-4xl mb-4" aria-hidden="true">🌍</div>
            <CardTitle>Données terrain</CardTitle>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed font-body">
              Intégrez vos données d&apos;audit : parcelles, infrastructures
              agro-écologiques, pratiques culturales. Résultats contextualisés
              par exploitation.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="font-heading text-h2 lg:text-h2-lg">
          Une méthode scientifique, transparente et accessible
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mt-4 font-body">
          EcoCert FieldScore implémente la méthode Ecobalyse développée par
          l&apos;ADEME et le ministère de la Transition Écologique. Les données
          proviennent d&apos;Agribalyse 3.2.
        </p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: "Indicateurs PEF", value: "16" },
            { label: "Agribalyse", value: "v3.2" },
            { label: "Produits couverts", value: "2 500+" },
            { label: "Licence", value: "MIT" },
          ].map((stat) => (
            <div key={stat.label} className="bg-eco-50 rounded-xl p-5">
              <div className="text-3xl font-extrabold text-eco-700 font-heading">{stat.value}</div>
              <div className="text-xs font-semibold text-eco-600 mt-1 font-body">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
