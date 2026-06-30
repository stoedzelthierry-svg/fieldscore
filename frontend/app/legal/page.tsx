import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — EcoCert FieldScore",
  description: "Mentions légales d'EcoCert FieldScore : éditeur, hébergement, propriété intellectuelle et conditions d'utilisation.",
};

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-h2 mb-2">Mentions légales</h1>
      <p className="text-gray-500 mb-10 font-body">
        Conformément aux articles 6-III et 19 de la Loi n° 2004-575 du 21 juin
        2004 pour la Confiance dans l&apos;Économie Numérique (LCEN).
      </p>

      <div className="prose-content">
        <h2>1. Éditeur du service</h2>
        <p>
          <strong>EcoCert FieldScore</strong> est un service édité par :
        </p>
        <ul>
          <li>
            <strong>Raison sociale :</strong> EcoCert SAS
          </li>
          <li>
            <strong>Forme juridique :</strong> Société par Actions Simplifiée
          </li>
          <li>
            <strong>Capital social :</strong> 3 048 900 €
          </li>
          <li>
            <strong>RCS :</strong> Auch B 331 885 587
          </li>
          <li>
            <strong>SIRET :</strong> 331 885 587 00029
          </li>
          <li>
            <strong>Code APE :</strong> 7120B (Analyses, essais et inspections
            techniques)
          </li>
          <li>
            <strong>Siège social :</strong> Lieu-dit Lamothe Ouest, BP 47,
            32600 L&apos;Isle-Jourdain, France
          </li>
          <li>
            <strong>Téléphone :</strong> +33 (0)5 62 07 34 24
          </li>
          <li>
            <strong>Email :</strong> fieldscore@ecocert.com
          </li>
        </ul>

        <h2>2. Directeur de la publication</h2>
        <p>
          Le directeur de la publication est le Président d&apos;EcoCert SAS,
          représentant légal de la société.
        </p>

        <h2>3. Hébergement</h2>
        <p>
          Le service FieldScore est hébergé par :
        </p>
        <ul>
          <li>
            <strong>Hébergeur :</strong> Scalingo SAS
          </li>
          <li>
            <strong>Adresse :</strong> 13 rue Alphonse Daudet, 75014 Paris,
            France
          </li>
          <li>
            <strong>Site :</strong> scalingo.com
          </li>
        </ul>

        <h2>4. Propriété intellectuelle</h2>
        <p>
          Le code source de FieldScore est publié sous{" "}
          <strong>licence MIT</strong>, permettant son utilisation, sa
          modification et sa redistribution librement, y compris à des fins
          commerciales, sous réserve de conservation de la mention de
          copyright.
        </p>
        <p>
          La marque <strong>EcoCert</strong> est une marque déposée. Le logo
          EcoCert ne peut être utilisé sans autorisation préalable. Les données
          Agribalyse 3.2 sont la propriété de l&apos;ADEME/INRAE et sont
          utilisées sous licence ouverte.
        </p>
        <p>
          La méthode Ecobalyse est un outil développé par l&apos;ADEME et le
          ministère de la Transition Écologique.
        </p>

        <h2>5. Données personnelles</h2>
        <p>
          Le traitement des données personnelles est détaillé dans notre{" "}
          <a href="/privacy">politique de confidentialité</a>. Conformément
          au RGPD, vous pouvez exercer vos droits auprès de notre DPO à
          l&apos;adresse dpo@ecocert.com.
        </p>

        <h2>6. Limitation de responsabilité</h2>
        <p>
          Les résultats fournis par FieldScore sont des indicateurs
          d&apos;impact environnemental calculés selon la méthode Ecobalyse et les
          données Agribalyse 3.2. Ces résultats ont une valeur indicative et ne
          remplacent pas une certification officielle délivrée par EcoCert ou
          tout autre organisme certificateur.
        </p>
        <p>
          EcoCert ne peut être tenu responsable des décisions prises sur la
          base des scores calculés par FieldScore, notamment en cas de données
          saisies incomplètes ou erronées par l&apos;utilisateur.
        </p>

        <h2>7. Conditions d&apos;utilisation</h2>
        <p>
          L&apos;utilisation de FieldScore est gratuite et ouverte à tous.
          L&apos;utilisateur s&apos;engage à :
        </p>
        <ul>
          <li>
            Fournir des données exactes et ne pas saisir de données
            manifestement erronées
          </li>
          <li>
            Ne pas utiliser le service à des fins illicites ou frauduleuses
          </li>
          <li>
            Respecter les droits de propriété intellectuelle mentionnés
            ci-dessus
          </li>
        </ul>
        <p>
          EcoCert se réserve le droit de suspendre l&apos;accès au service en cas
          d&apos;utilisation abusive ou de maintenance technique.
        </p>

        <h2>8. Droit applicable</h2>
        <p>
          Les présentes mentions légales sont soumises au droit français. En
          cas de litige, les tribunaux français sont seuls compétents.
        </p>
      </div>
    </div>
  );
}
