"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface HydrationContextType {
  isHydrated: boolean;
  isHydrating: boolean;
}

const HydrationContext = createContext<HydrationContextType>({
  isHydrated: false,
  isHydrating: true,
});

export const useHydration = () => useContext(HydrationContext);

interface HydrationProviderProps {
  children: ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    // Marcar que la hidratación ha comenzado
    setIsHydrating(true);

    // Simular un pequeño delay para asegurar que la hidratación esté completa
    const timer = setTimeout(() => {
      setIsHydrated(true);
      setIsHydrating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const value: HydrationContextType = {
    isHydrated,
    isHydrating,
  };

  return (
    <HydrationContext.Provider value={value}>
      {children}
    </HydrationContext.Provider>
  );
}
