"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useFerme } from "@/components/ferme/FermeContext";

export default function HomePage() {
  const { fermeSelectionnee } = useFerme();
  const [calcul, setCalcul] = useState<any>(null);
  const [loadingCalcul, setLoadingCalcul] = useState(false);

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
          // Map backend response to frontend display format
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
        })
        .catch((e) => console.error("Erreur calcul:", e))
        .finally(() => setLoadingCalcul(false));
    }
  }, [fermeSelectionnee]);

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
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-100">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3 font-body">Score environnemental</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-5xl font-extrabold font-heading" style={{ color: calcul.score.couleur || "#059669" }}>
                      {calcul.score.categorie}
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-gray-900 font-heading">{calcul.score.note?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 font-body">mPt/ha</div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mt-3 font-body">{calcul.score.label}</p>
                  <p className="text-xs text-gray-500 mt-1 font-body">{fermeSelectionnee.nom}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center text-xs text-gray-500">
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
