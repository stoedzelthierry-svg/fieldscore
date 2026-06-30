import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — EcoCert FieldScore",
  description: "Politique de confidentialité d'EcoCert FieldScore : traitement des données personnelles, cookies et droits des utilisateurs.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-h2 mb-2">
        Politique de confidentialité
      </h1>
      <p className="text-gray-500 mb-10 font-body">
        Dernière mise à jour : Juin 2026
      </p>

      <div className="prose-content">
        <h2>1. Collecte des données</h2>
        <p>
          EcoCert FieldScore collecte les données strictement nécessaires au
          calcul du coût environnemental des exploitations agricoles :
        </p>
        <ul>
          <li>
            <strong>Données d&apos;exploitation :</strong> nom de la ferme,
            SIRET, code INSEE, type de production
          </li>
          <li>
            <strong>Données parcellaires :</strong> cultures, surfaces, pratiques
            agricoles (bio, labour, irrigation)
          </li>
          <li>
            <strong>Infrastructures agro-écologiques :</strong> types, surfaces et
            longueurs déclarés
          </li>
          <li>
            <strong>Résultats de calcul :</strong> scores environnementaux,
            historiques de calculs
          </li>
        </ul>
        <p>
          Aucune donnée personnelle au sens du RGPD n&apos;est collectée en dehors
          des informations professionnelles d&apos;exploitation agricole.
        </p>

        <h2>2. Finalité du traitement</h2>
        <p>
          Les données sont exclusivement utilisées pour :
        </p>
        <ul>
          <li>
            Calculer le score environnemental selon la méthode Ecobalyse
          </li>
          <li>
            Conserver l&apos;historique des calculs pour traçabilité
          </li>
          <li>
            Améliorer la précision des modèles de calcul (données agrégées et
            anonymisées uniquement)
          </li>
        </ul>
        <p>
          En aucun cas les données individuelles d&apos;une exploitation ne sont
          partagées, vendues ou communiquées à des tiers.
        </p>

        <h2>3. Base légale</h2>
        <p>
          Le traitement des données repose sur :
        </p>
        <ul>
          <li>
            <strong>L&apos;intérêt légitime</strong> d&apos;EcoCert à fournir des
            outils d&apos;évaluation environnementale aux organismes de
            certification et aux agriculteurs (art. 6.1.f du RGPD)
          </li>
          <li>
            <strong>L&apos;exécution d&apos;un contrat</strong> lorsque
            l&apos;utilisation de FieldScore s&apos;inscrit dans une prestation de
            certification EcoCert (art. 6.1.b du RGPD)
          </li>
        </ul>

        <h2>4. Durée de conservation</h2>
        <p>
          Les données sont conservées pendant la durée d&apos;utilisation active de
          l&apos;outil. Un utilisateur peut demander la suppression de ses données
          à tout moment (voir section 7). Les données inactives depuis plus de
          3 ans sont automatiquement supprimées.
        </p>

        <h2>5. Cookies</h2>
        <p>
          FieldScore n&apos;utilise pas de cookies de tracking ou de publicité. Les
          seuls cookies techniques possibles sont liés au fonctionnement
          normal de l&apos;application (cookies de session).
        </p>

        <h2>6. Sécurité</h2>
        <p>
          Les données sont stockées et transmises de manière sécurisée
          (chiffrement en transit via HTTPS). Les accès sont restreints aux
          personnes habilitées. Une politique de sécurité stricte encadre
          l&apos;infrastructure technique.
        </p>

        <h2>7. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez des droits suivants sur vos
          données :
        </p>
        <ul>
          <li>Droit d&apos;accès à vos données</li>
          <li>Droit de rectification des données inexactes</li>
          <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
          <li>Droit à la portabilité de vos données</li>
          <li>Droit d&apos;opposition au traitement</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée dans
          les mentions légales.
        </p>

        <h2>8. Contact</h2>
        <p>
          Pour toute question relative à la protection des données :
        </p>
        <ul>
          <li>
            <strong>Délégué à la protection des données :</strong> dpo@ecocert.com
          </li>
          <li>
            <strong>Adresse postale :</strong> EcoCert — DPO, BP 47,
            32600 L&apos;Isle-Jourdain, France
          </li>
        </ul>
        <p>
          Vous avez également le droit d&apos;introduire une réclamation auprès de
          la CNIL (www.cnil.fr).
        </p>
      </div>
    </div>
  );
}
