"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import FermeSelector from "../ferme/FermeSelector";

interface NavLink {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const mainLinks: NavLink[] = [
  { href: "/", label: "Tableau de bord", icon: "📊", exact: true },
  { href: "/fermes", label: "Fermes", icon: "🏡" },
];

const secondaryLinks: NavLink[] = [
  { href: "/methodologie", label: "Méthodologie", icon: "📖" },
];

const bottomLinks: NavLink[] = [
  { href: "/privacy", label: "Confidentialité", icon: "🔒" },
  { href: "/legal", label: "Mentions légales", icon: "⚖️" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (link: NavLink) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  const renderNavLinks = (links: NavLink[]) =>
    links.map((link) => {
      const active = isActive(link);
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className={`sidebar-nav-link ${
            active ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
          }`}
          aria-current={active ? "page" : undefined}
        >
          <span className="text-lg" aria-hidden="true">
            {link.icon}
          </span>
          <span>{link.label}</span>
        </Link>
      );
    });

  return (
    <>
      {/* === Desktop Sidebar === */}
      <aside className="sidebar flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/ecocert-logo.jpg"
              alt="Groupe Ecocert"
              className="h-10 w-auto"
              style={{ height: "40px" }}
            />
          </Link>
        </div>

        {/* Sélecteur de ferme */}
        <FermeSelector />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigation principale">
          <div className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-body">
              Principal
            </p>
            {renderNavLinks(mainLinks)}
          </div>

          <div className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-body">
              Documentation
            </p>
            {renderNavLinks(secondaryLinks)}
          </div>
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-gray-200">
          {renderNavLinks(bottomLinks)}
        </div>

        {/* CTA */}
        <div className="px-3 pb-5">
          <Link
            href="/fermes/nouvelle"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold text-sm rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-button hover:scale-105 font-body"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau calcul
          </Link>
        </div>
      </aside>

      {/* === Mobile header === */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/ecocert-logo.jpg"
              alt="Groupe Ecocert"
              className="h-9 w-auto"
              style={{ height: "36px" }}
            />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="px-3 py-3 space-y-1 border-t border-gray-100 bg-white animate-fade-in">
            {[...mainLinks, ...secondaryLinks, ...bottomLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-nav-link ${
                  isActive(link) ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            <Link
              href="/fermes/nouvelle"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold text-sm rounded-lg hover:bg-primary-700 transition-all duration-200 mt-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau calcul
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
