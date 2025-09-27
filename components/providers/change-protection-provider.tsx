"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ChangeProtectionContextType {
  hasUnsavedChanges: boolean;
  markAsChanged: () => void;
  markAsSaved: () => void;
  confirmBeforeUnload: boolean;
  setConfirmBeforeUnload: (confirm: boolean) => void;
}

const ChangeProtectionContext = createContext<ChangeProtectionContextType>({
  hasUnsavedChanges: false,
  markAsChanged: () => {},
  markAsSaved: () => {},
  confirmBeforeUnload: false,
  setConfirmBeforeUnload: () => {},
});

export const useChangeProtection = () => useContext(ChangeProtectionContext);

interface ChangeProtectionProviderProps {
  children: ReactNode;
}

export function ChangeProtectionProvider({ children }: ChangeProtectionProviderProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmBeforeUnload, setConfirmBeforeUnload] = useState(false);

  // Marcar cambios como no guardados
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
    // Persistir en localStorage para sobrevivir a la hidratación
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasUnsavedChanges', 'true');
    }
  };

  // Marcar cambios como guardados
  const markAsSaved = () => {
    setHasUnsavedChanges(false);
    // Limpiar del localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasUnsavedChanges');
    }
  };

  // Restaurar estado de cambios no guardados después de la hidratación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hasUnsavedChanges');
      if (saved === 'true') {
        setHasUnsavedChanges(true);
      }
    }
  }, []);

  // Protección contra pérdida de cambios al cerrar/recargar
  useEffect(() => {
    if (!confirmBeforeUnload || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      return 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
        // Guardar estado actual en localStorage
        localStorage.setItem('lastSavedState', JSON.stringify({
          timestamp: Date.now(),
          hasChanges: true
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [confirmBeforeUnload, hasUnsavedChanges]);

  // Restaurar estado después de la hidratación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastSavedState = localStorage.getItem('lastSavedState');
      if (lastSavedState) {
        try {
          const state = JSON.parse(lastSavedState);
          const timeDiff = Date.now() - state.timestamp;

          // Si han pasado menos de 5 minutos, restaurar el estado
          if (timeDiff < 5 * 60 * 1000 && state.hasChanges) {
            setHasUnsavedChanges(true);
          }

          // Limpiar estado antiguo
          localStorage.removeItem('lastSavedState');
        } catch (error) {
        }
      }
    }
  }, []);

  return (
    <ChangeProtectionContext.Provider
      value={{
        hasUnsavedChanges,
        markAsChanged,
        markAsSaved,
        confirmBeforeUnload,
        setConfirmBeforeUnload,
      }}
    >
      {children}
    </ChangeProtectionContext.Provider>
  );
}
