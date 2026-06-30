"use client";

import { useFerme } from "./FermeContext";

export default function FermeSelector() {
  const { fermes, fermeSelectionnee, setFermeSelectionnee, loading } = useFerme();

  if (loading) {
    return (
      <div className="px-5 py-3">
        <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (fermes.length === 0) {
    return (
      <div className="px-5 py-3">
        <p className="text-xs text-gray-400 font-body">Aucune ferme</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 border-b border-gray-100">
      <label
        htmlFor="ferme-select"
        className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-body"
      >
        Ma ferme
      </label>
      <select
        id="ferme-select"
        value={fermeSelectionnee?.id || ""}
        onChange={(e) => {
          const ferme = fermes.find((f) => f.id === e.target.value) || null;
          setFermeSelectionnee(ferme);
        }}
        className="w-full text-sm font-heading font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          backgroundSize: "12px",
        }}
      >
        {fermes.map((ferme) => (
          <option key={ferme.id} value={ferme.id}>
            {ferme.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
