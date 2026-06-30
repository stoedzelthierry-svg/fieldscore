import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/ecocert-logo.svg"
                alt="EcoCert"
                className="h-8 w-auto brightness-0 invert opacity-80"
              />
            </div>
            <p className="text-sm leading-relaxed font-body">
              Calculateur de coût environnemental des fermes développé par
              EcoCert. Basé sur la méthode Ecobalyse et les données Agribalyse
              3.2.
            </p>
          </div>

          {/* Méthode */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 font-heading">
              Méthode
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <Link
                  href="/methodologie"
                  className="hover:text-white transition-colors duration-200"
                >
                  Méthodologie complète
                </Link>
              </li>
              <li>
                <a
                  href="https://ecobalyse.beta.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  Ecobalyse
                </a>
              </li>
              <li>
                <a
                  href="https://doc.agribalyse.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  Agribalyse 3.2
                </a>
              </li>
            </ul>
          </div>

          {/* Calculateur */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 font-heading">
              Calculateur
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <Link
                  href="/fermes/nouvelle"
                  className="hover:text-white transition-colors duration-200"
                >
                  Nouveau calcul
                </Link>
              </li>
              <li>
                <Link
                  href="/fermes"
                  className="hover:text-white transition-colors duration-200"
                >
                  Mes fermes
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 font-heading">
              Légal
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <Link
                  href="/legal"
                  className="hover:text-white transition-colors duration-200"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors duration-200"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li className="hover:text-white transition-colors duration-200">
                Licence MIT
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-body text-sm">
          <p>
            © {new Date().getFullYear()} EcoCert FieldScore — Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-4">
            <span>Méthode PEF (Product Environmental Footprint)</span>
            <span className="text-gray-600">•</span>
            <span>Open Source MIT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
