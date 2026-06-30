"use client";

import Link from "next/link";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-data-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full mb-6 uppercase tracking-wider font-body">
              🆕 Méthode Ecobalyse 2026
            </div>
            <h1 className="font-heading">
              Calculez le{" "}
              <span className="text-primary-600">coût environnemental</span>{" "}
              de n&apos;importe quelle ferme
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-body">
              Méthode officielle Ecobalyse. Données Agribalyse 3.2.{" "}
              <strong className="text-gray-900">Développé par EcoCert.</strong>{" "}
              Open source.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/fermes/nouvelle">
                <Button size="lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Essayer le calculateur
                </Button>
              </Link>
              <Link href="/methodologie">
                <Button variant="outline" size="lg">
                  📖 Comprendre la méthode
                </Button>
              </Link>
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
