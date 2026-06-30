import type { Metadata } from "next";
import "./globals.css";
import { FermeProvider } from "@/components/ferme/FermeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "EcoCert FieldScore — Coût environnemental des fermes",
    template: "%s | EcoCert FieldScore",
  },
  description:
    "Calculez le coût environnemental de n'importe quelle ferme en France avec la méthode officielle Ecobalyse et les données Agribalyse 3.2. Développé par EcoCert. Open source.",
  keywords: [
    "coût environnemental",
    "ferme",
    "agriculture",
    "Ecobalyse",
    "Agribalyse",
    "PEF",
    "EcoCert",
    "certification",
    "écoconception",
  ],
  icons: {
    icon: "/ecocert-logo.svg",
  },
  openGraph: {
    title: "EcoCert FieldScore — Coût environnemental des fermes",
    description:
      "Calculez le coût environnemental de n'importe quelle ferme avec la méthode Ecobalyse.",
    type: "website",
    locale: "fr_FR",
    siteName: "EcoCert FieldScore",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-body min-h-screen flex flex-col bg-[#F9FAFB] text-[#374151]">
        <FermeProvider>
          <Header />
          {/* Sidebar spacer */}
          <div className="flex-1 lg:pl-64">
            <main>{children}</main>
            <Footer />
          </div>
        </FermeProvider>
      </body>
    </html>
  );
}
