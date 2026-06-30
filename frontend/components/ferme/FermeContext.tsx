"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface Ferme {
  id: string;
  nom: string;
  type_production?: string;
  commune?: string;
}

interface FermeContextType {
  fermeSelectionnee: Ferme | null;
  setFermeSelectionnee: (ferme: Ferme | null) => void;
  fermes: Ferme[];
  loading: boolean;
  rafraichirFermes: () => Promise<void>;
}

const FermeContext = createContext<FermeContextType>({
  fermeSelectionnee: null,
  setFermeSelectionnee: () => {},
  fermes: [],
  loading: false,
  rafraichirFermes: async () => {},
});

export function useFerme() {
  return useContext(FermeContext);
}

export function FermeProvider({ children }: { children: React.ReactNode }) {
  const [fermes, setFermes] = useState<Ferme[]>([]);
  const [fermeSelectionnee, setFermeSelectionnee] = useState<Ferme | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialise, setInitialise] = useState(false);

  const rafraichirFermes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/fermes?page_size=100");
      const data = await res.json();
      setFermes(data.items || []);
    } catch (err) {
      console.error("Erreur chargement fermes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    rafraichirFermes();
  }, [rafraichirFermes]);

  // Restaurer la ferme sauvegardée dans localStorage une fois les fermes chargées
  useEffect(() => {
    if (fermes.length > 0 && !initialise) {
      const savedId = localStorage.getItem("fieldscore-ferme-id");
      if (savedId) {
        const saved = fermes.find((f) => f.id === savedId);
        if (saved) {
          setFermeSelectionnee(saved);
        }
      }
      // Si pas de sauvegarde, sélectionner la première
      if (!fermeSelectionnee && !savedId) {
        setFermeSelectionnee(fermes[0]);
      }
      setInitialise(true);
    }
  }, [fermes, initialise, fermeSelectionnee]);

  // Persister dans localStorage à chaque changement
  useEffect(() => {
    if (fermeSelectionnee) {
      localStorage.setItem("fieldscore-ferme-id", fermeSelectionnee.id);
    }
  }, [fermeSelectionnee]);

  return (
    <FermeContext.Provider
      value={{
        fermeSelectionnee,
        setFermeSelectionnee,
        fermes,
        loading,
        rafraichirFermes,
      }}
    >
      {children}
    </FermeContext.Provider>
  );
}
