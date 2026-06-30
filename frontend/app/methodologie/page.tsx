import type { Metadata } from "next";
import { INDICATEURS_PEF } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Méthodologie — FieldScore",
  description:
    "Méthodologie complète du calcul du coût environnemental des fermes : méthode Ecobalyse, indicateurs PEF, sources de données, formule de calcul.",
};

export default function MethodologiePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-eco-600 flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <path d="M16 6v12l8 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="2" fill="#fff" />
            </svg>
          </div>
          <span className="text-sm font-medium text-eco-700 bg-eco-50 px-3 py-1 rounded-full">
            Méthodologie
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          Méthode de calcul du coût environnemental
        </h1>
        <p className="mt-3 text-lg text-gray-600 leading-relaxed max-w-3xl">
          Comment FieldScore calcule l&apos;impact environnemental d&apos;une ferme à partir
          de ses parcelles, de ses pratiques agricoles et de ses infrastructures
          agro-écologiques.
        </p>
      </div>

      <div className="prose-content">
        {/* ===== Section 1 : Qu'est-ce que le coût environnemental ? ===== */}
        <h2>1. Qu&apos;est-ce que le coût environnemental ?</h2>
        <p>
          Le <strong>coût environnemental</strong> d&apos;une ferme est une mesure
          quantitative de l&apos;ensemble des impacts de ses activités agricoles sur
          l&apos;environnement. Il ne s&apos;agit pas d&apos;un coût financier, mais d&apos;un
          <strong>score d&apos;impact</strong> calculé sur 16 indicateurs environnementaux
          normalisés.
        </p>
        <p>
          Ce score est exprimé en <strong>points (pts)</strong>, sur une échelle de 0 à
          10+, puis synthétisé sous forme de <strong>catégorie (A à E)</strong>, où A
          représente un impact très faible et E un impact très élevé.
        </p>
        <p>
          L&apos;objectif est de fournir une <strong>métrique comparable</strong> entre
          exploitations agricoles, permettant aux organismes de certification et aux
          agriculteurs de mesurer et piloter leur performance environnementale.
        </p>

        {/* ===== Section 2 : Méthode officielle ===== */}
        <h2>2. Méthode officielle</h2>
        <p>
          FieldScore est fondé sur la méthode <strong>Ecobalyse</strong>, un outil
          d&apos;évaluation environnementale des produits agricoles et alimentaires
          développé par l&apos;<strong>ADEME</strong> (Agence de la Transition Écologique)
          et le <strong>ministère de la Transition Écologique</strong>.
        </p>
        <blockquote>
          Ecobalyse met en œuvre la méthode PEF (Product Environmental
          Footprint) définie par la Commission Européenne (Recommandation
          2021/2279), cadre de référence pour l&apos;affichage environnemental des
          produits alimentaires en France.
        </blockquote>
        <p>
          La <strong>méthode PEF</strong> repose sur l&apos;<strong>Analyse du Cycle de
          Vie (ACV)</strong>. Pour chaque produit agricole, on évalue les impacts
          environnementaux depuis l&apos;extraction des matières premières jusqu&apos;à
          la sortie de la ferme (du berceau à la porte de la ferme, <em>cradle
          to farm gate</em>).
        </p>
        <p>
          FieldScore applique cette méthode à l&apos;<strong>échelle de
          l&apos;exploitation</strong> : chaque parcelle est évaluée séparément, puis les
          résultats sont agrégés pour obtenir un score global représentatif de
          l&apos;ensemble de la ferme.
        </p>

        <h3>2.1. Pourquoi FieldScore existe ?</h3>
        <p>
          Ecobalyse est conçu pour évaluer des <strong>produits</strong> (un kilo de
          blé, un litre de lait). FieldScore <strong>étend cette approche</strong> à
          l&apos;échelle de la <strong>ferme entière</strong>, en agrégeant les résultats
          de chaque parcelle, en pondérant par les surfaces, et en intégrant les
          bénéfices des infrastructures agro-écologiques.
        </p>
        <p>
          Cette approche permet aux <strong>organismes de certification</strong> (EcoCert,
          mais aussi tout certificateur) de disposer d&apos;une métrique
          environnementale globale pour chaque exploitation auditée.
        </p>

        {/* ===== Section 3 : Sources de données ===== */}
        <h2>3. Sources de données</h2>
        <p>
          Le calcul est alimenté par <strong>trois sources principales</strong> de
          données :
        </p>

        <h3>3.1. Agribalyse 3.2 (ADEME / INRAE)</h3>
        <p>
          Base de données de référence pour l&apos;analyse du cycle de vie des
          produits agricoles français. Elle fournit, pour chaque produit agricole,
          les <strong>facteurs d&apos;impact unitaires</strong> pour chacun des 16
          indicateurs PEF.
        </p>
        <p>
          Ces facteurs sont exprimés par unité de production : par kilogramme de
          produit récolté (ex : kg CO₂ eq / kg de blé), par hectare (ex : kg
          CO₂ eq / ha), ou par tête d&apos;animal.
        </p>
        <p>
          Agribalyse 3.2 est issue de la collaboration entre l&apos;ADEME et
          l&apos;INRAE, avec des données mises à jour régulièrement.
        </p>

        <h3>3.2. RPG (Registre Parcellaire Graphique — IGN)</h3>
        <p>
          Le RPG fournit la géolocalisation et l&apos;occupation des sols des
          parcelles agricoles déclarées à la PAC. Il permet de <strong>contextualiser
          spatialement</strong> une exploitation : type de sol, zone climatique,
          proximité de zones sensibles.
        </p>

        <h3>3.3. Données terrain de certification</h3>
        <p>
          Les données saisies par l&apos;utilisateur dans FieldScore :
        </p>
        <ul>
          <li>Type de culture par parcelle</li>
          <li>Surface de chaque parcelle</li>
          <li>Pratiques : agriculture biologique ou conventionnelle</li>
          <li>Travail du sol (labour, semis direct)</li>
          <li>Irrigation</li>
          <li>Cultures intermédiaires</li>
          <li>Infrastructures agro-écologiques (haies, mares, bosquets…)</li>
        </ul>
        <p>
          Ces données permettent d&apos;<strong>adapter les facteurs
          d&apos;Agribalyse</strong> au contexte spécifique de l&apos;exploitation, et
          déterminent le <strong>niveau de confiance</strong> du résultat.
        </p>

        {/* ===== Section 4 : Les 16 indicateurs ===== */}
        <h2>4. Les 16 indicateurs PEF</h2>
        <p>
          Le Product Environmental Footprint définit 16 catégories d&apos;impact
          environnemental. Chaque indicateur couvre une dimension spécifique de
          l&apos;atteinte à l&apos;environnement.
        </p>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Indicateur</th>
                <th>Unité</th>
                <th>Description</th>
                <th>Poids normalisation</th>
              </tr>
            </thead>
            <tbody>
              {INDICATEURS_PEF.map((ind) => (
                <tr key={ind.trigramme}>
                  <td>
                    <code>{ind.trigramme}</code>
                  </td>
                  <td>
                    <strong>{ind.nom}</strong>
                  </td>
                  <td className="font-mono text-xs">{ind.unite}</td>
                  <td className="text-xs leading-relaxed">{ind.description}</td>
                  <td className="text-center font-mono">
                    {ind.poids_global.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500">
          Les poids de normalisation sont définis par la méthode PEF. Leur somme
          est égale à 1. Ils ne représentent pas une hiérarchie d&apos;importance,
          mais un facteur de conversion qui permet de ramener tous les
          indicateurs à une échelle comparable.
        </p>

        {/* ===== Section 5 : La formule de calcul ===== */}
        <h2>5. La formule de calcul</h2>
        <p>
          Le calcul procède en <strong>quatre étapes</strong> successives.
        </p>

        <h3>5.1. Étape 1 — Calcul par parcelle</h3>
        <p>
          Pour chaque parcelle <em>p</em> de culture <em>c</em>, et pour chaque
          indicateur <em>i</em> :
        </p>
        <pre>{`I(p, i) = F(c, i) × S(p) × M(p, i)

Où :
  I(p, i) = Impact de la parcelle p pour l'indicateur i
  F(c, i) = Facteur d'impact unitaire de la culture c pour i (source Agribalyse)
  S(p)    = Surface de la parcelle (ha)
  M(p, i) = Modificateur lié aux pratiques (bio, labour, irrigation, etc.)`}</pre>

        <h3>5.2. Étape 2 — Agrégation par indicateur</h3>
        <p>
          Pour chaque indicateur <em>i</em>, on somme les impacts de toutes les
          parcelles :
        </p>
        <pre>{`I_total(i) = Σ I(p, i)    pour toutes les parcelles p`}</pre>

        <h3>5.3. Étape 3 — Normalisation et pondération</h3>
        <p>
          Chaque indicateur agrégé est <strong>normalisé</strong> par rapport à une valeur
          de référence (moyenne nationale de l&apos;impact par hectare pour la
          catégorie), puis <strong>pondéré</strong> par son poids PEF :
        </p>
        <pre>{`I_norm(i) = I_total(i) / Ref(i)
I_pond(i) = I_norm(i) × Poids(i)

Score_unique = Σ I_pond(i)    pour i = 1 à 16`}</pre>

        <h3>5.4. Étape 4 — Score unique et catégorie</h3>
        <p>
          Le score unique obtenu est ensuite traduit en <strong>catégorie (A à
          E)</strong>, et éventuellement modulé par les infrastructures
          agro-écologiques (voir section 6).
        </p>

        {/* ===== Section 6 : Score unique ===== */}
        <h2>6. Le score unique (A à E)</h2>
        <p>
          Le score unique agrège les 16 indicateurs PEF en une valeur comprise
          entre 0 et 10+ points. Plus le score est bas, plus l&apos;impact
          environnemental est faible.
        </p>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Score</th>
                <th>Signification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong className="text-eco-700">A</strong>
                </td>
                <td className="font-mono">≤ 1.0</td>
                <td>Excellent — Impact environnemental très faible</td>
              </tr>
              <tr>
                <td>
                  <strong className="text-eco-600">B</strong>
                </td>
                <td className="font-mono">1.0 − 2.0</td>
                <td>Très bon — Impact inférieur à la moyenne</td>
              </tr>
              <tr>
                <td>
                  <strong className="text-field-600">C</strong>
                </td>
                <td className="font-mono">2.0 − 3.5</td>
                <td>Moyen — Impact dans la moyenne nationale</td>
              </tr>
              <tr>
                <td>
                  <strong className="text-orange-600">D</strong>
                </td>
                <td className="font-mono">3.5 − 5.5</td>
                <td>Élevé — Impact supérieur à la moyenne</td>
              </tr>
              <tr>
                <td>
                  <strong className="text-red-600">E</strong>
                </td>
                <td className="font-mono">&gt; 5.5</td>
                <td>Très élevé — Impact significatif, points d&apos;amélioration à identifier</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Les seuils de catégories sont calibrés sur les distributions statistiques
          des scores calculés sur un large échantillon d&apos;exploitations agricoles
          françaises.
        </p>

        {/* ===== Section 7 : IAE ===== */}
        <h2>7. Infrastructures agro-écologiques (IAE)</h2>
        <p>
          Les <strong>infrastructures agro-écologiques</strong> sont des éléments du
          paysage agricole qui fournissent des services écosystémiques : haies,
          mares, bosquets, bandes enherbées, murs en pierre sèche, fossés,
          prairies permanentes, vergers haute tige.
        </p>
        <p>
          Leur présence sur l&apos;exploitation permet d&apos;obtenir un <strong>bonus</strong> sur
          le score environnemental. Ce bonus vient reconnaître les externalités
          positives des IAE :
        </p>
        <ul>
          <li>Stockage de carbone (sols, biomasse)</li>
          <li>Filtration de l&apos;eau</li>
          <li>Habitat pour la biodiversité</li>
          <li>Régulation des ravageurs</li>
          <li>Lutte contre l&apos;érosion</li>
        </ul>
        <p>
          Chaque IAE déclarée apporte un <strong>bonus en pourcentage</strong> qui vient
          réduire le score final :
        </p>
        <pre>{`Score_final = Score_unique × (1 − bonus_IAE)

Où bonus_IAE = Σ bonus_pct(iae)   (plafonné à 15%)`}</pre>
        <p>
          Le bonus est plafonné à 15% pour éviter un effet
          d&apos;écoblanchiment (greenwashing) et pour refléter le fait que les IAE
          ne compensent pas intégralement les impacts négatifs.
        </p>

        <h3>7.1. Barème des bonus</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type d&apos;IAE</th>
                <th>Unité</th>
                <th>Bonus max</th>
                <th>Exemple</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Haie</td>
                <td>mètre linéaire</td>
                <td className="font-mono">5%</td>
                <td>2 km de haies → bonus ≈ 3%</td>
              </tr>
              <tr>
                <td>Mare</td>
                <td>surface (ha)</td>
                <td className="font-mono">3%</td>
                <td>0.5 ha de mares → bonus ≈ 1.5%</td>
              </tr>
              <tr>
                <td>Bande enherbée</td>
                <td>surface (ha)</td>
                <td className="font-mono">4%</td>
                <td>2 ha de bandes → bonus ≈ 2%</td>
              </tr>
              <tr>
                <td>Prairie permanente</td>
                <td>surface (ha)</td>
                <td className="font-mono">6%</td>
                <td>5 ha de prairie → bonus ≈ 4%</td>
              </tr>
              <tr>
                <td>Bosquet</td>
                <td>surface (ha)</td>
                <td className="font-mono">4%</td>
                <td>1 ha de bosquet → bonus ≈ 2%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== Section 8 : Niveau de confiance ===== */}
        <h2>8. Niveau de confiance</h2>
        <p>
          Le niveau de confiance reflète la <strong>qualité et la spécificité</strong> des
          données utilisées pour le calcul. Il est déterminé automatiquement en
          fonction du type de données disponibles.
        </p>

        <h3>Niveaux</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Niveau</th>
                <th>Icône</th>
                <th>Condition</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong className="text-eco-700">Élevé</strong>
                </td>
                <td>🟢</td>
                <td className="text-xs">
                  Données terrain complètes + SIRET vérifié + données RPG
                </td>
                <td className="text-xs">
                  Calcul basé sur des mesures directes et facteurs
                  d&apos;émission spécifiques. Résultat fiable et
                  contextuellement pertinent.
                </td>
              </tr>
              <tr>
                <td>
                  <strong className="text-field-700">Moyen</strong>
                </td>
                <td>🟡</td>
                <td className="text-xs">
                  Données terrain partielles ou pas de SIRET
                </td>
                <td className="text-xs">
                  Des données locales sont disponibles mais certains facteurs
                  reposent sur des moyennes régionales ou nationales.
                </td>
              </tr>
              <tr>
                <td>
                  <strong className="text-red-700">Faible</strong>
                </td>
                <td>🔴</td>
                <td className="text-xs">
                  Peu ou pas de données spécifiques à l&apos;exploitation
                </td>
                <td className="text-xs">
                  Le calcul repose principalement sur des moyennes nationales.
                  Résultat indicatif, à affiner avec des données terrain.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Le niveau de confiance évolue à mesure que des données plus précises
          sont saisies. Un calcul avec un niveau de confiance faible peut être
          <strong>recalculé</strong> après enrichissement des données.
        </p>

        {/* ===== Section 9 : Versioning ===== */}
        <h2>9. Versioning de la méthode</h2>
        <p>
          La méthode de calcul évolue dans le temps. Chaque calcul est associé à
          une <strong>version de méthode</strong> qui garantit la traçabilité et la
          reproductibilité.
        </p>
        <ul>
          <li>
            <strong>Version sémantique</strong> : <code>MAJEUR.MINEUR.CORRECTIF</code> (ex:
            2.1.0)
          </li>
          <li>
            <strong>Changements majeurs</strong> : modification des poids PEF, ajout ou
            suppression d&apos;indicateurs.
          </li>
          <li>
            <strong>Changements mineurs</strong> : mise à jour des facteurs Agribalyse,
            ajustement des modificateurs.
          </li>
          <li>
            <strong>Correctifs</strong> : corrections de bugs sans impact sur la
            méthode.
          </li>
        </ul>
        <p>
          L&apos;historique des versions est consultable. Un calcul effectué avec une
          version antérieure reste accessible et identifiable par sa version.
        </p>

        {/* ===== Section 10 : Licence ===== */}
        <h2>10. Licence MIT</h2>
        <p>
          FieldScore est distribué sous <strong>licence MIT</strong>. Cela signifie que :
        </p>
        <ul>
          <li>
            Le code source est <strong>librement accessible</strong> et modifiable
          </li>
          <li>
            Tout organisme de certification peut l&apos;utiliser, y compris à des
            fins commerciales
          </li>
          <li>
            Les contributions sont bienvenues : bugs, améliorations, nouvelles
            fonctionnalités
          </li>
          <li>
            La méthode est <strong>auditable</strong> : chaque calcul est reproductible
            indépendamment
          </li>
        </ul>
        <p>
          L&apos;objectif est de fournir un <strong>bien commun numérique</strong> pour la
          transition agro-écologique, en évitant les systèmes propriétaires qui
          enferment les données des agriculteurs.
        </p>

        {/* ===== Annexe ===== */}
        <h2>11. Références</h2>
        <ul>
          <li>
            <strong>Ecobalyse</strong> —{" "}
            <a href="https://ecobalyse.beta.gouv.fr" target="_blank" rel="noopener noreferrer">
              ecobalyse.beta.gouv.fr
            </a>
          </li>
          <li>
            <strong>Agribalyse 3.2</strong> —{" "}
            <a href="https://doc.agribalyse.fr" target="_blank" rel="noopener noreferrer">
              doc.agribalyse.fr
            </a>
          </li>
          <li>
            <strong>ADEME</strong> —{" "}
            <a href="https://www.ademe.fr" target="_blank" rel="noopener noreferrer">
              ademe.fr
            </a>
          </li>
          <li>
            <strong>Product Environmental Footprint (PEF)</strong> —{" "}
            Recommandation (UE) 2021/2279 de la Commission Européenne
          </li>
          <li>
            <strong>INRAE</strong> —{" "}
            <a href="https://www.inrae.fr" target="_blank" rel="noopener noreferrer">
              inrae.fr
            </a>
          </li>
          <li>
            <strong>RPG (IGN)</strong> —{" "}
            <a href="https://geoservices.ign.fr" target="_blank" rel="noopener noreferrer">
              geoservices.ign.fr
            </a>
          </li>
        </ul>

        <div className="mt-10 p-6 bg-eco-50 border border-eco-200 rounded-xl">
          <h3 className="text-xl font-semibold text-eco-900 mb-3">
            Prêt à calculer l&apos;impact de votre ferme ?
          </h3>
          <p className="text-eco-800 mb-4">
            Lancez un calcul dès maintenant et obtenez votre score
            environnemental en quelques minutes.
          </p>
          <a
            href="/fermes/nouvelle"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-eco-600 text-white font-medium rounded-lg hover:bg-eco-700 transition-colors"
          >
            🌱 Essayer le calculateur
          </a>
        </div>
      </div>
    </div>
  );
}
