"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook personalizado para manejar estado persistente usando localStorage
 * Mantiene el estado de las secciones fijo al recargar la página
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    validateValue?: (value: any) => boolean;
  } = {}
) {
  // Funciones estáticas para evitar re-renders
  const serialize = options.serialize || JSON.stringify;
  const deserialize = options.deserialize || JSON.parse;
  const validateValue = options.validateValue || (() => true);

  // Estado interno
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar estado desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = deserialize(stored);
        if (validateValue(parsed)) {
          setState(parsed);
        }
      }
    } catch (error) {
    } finally {
      setIsLoaded(true);
    }
  }, [key]); // Solo depende de la key para evitar bucles infinitos

  // Función para actualizar el estado y persistirlo
  const updateState = useCallback(
    (newValue: T | ((prevState: T) => T)) => {
      setState((prevState) => {
        const nextState = typeof newValue === "function"
          ? (newValue as (prevState: T) => T)(prevState)
          : newValue;

        // Persistir en localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(key, serialize(nextState));
          } catch (error) {
          }
        }

        return nextState;
      });
    },
    [key] // Solo depende de key, serialize es estable
  );

  // Función para limpiar el estado persistente
  const clearState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
      }
    }
    setState(initialValue);
  }, [key]); // initialValue es estable

  return {
    state,
    setState: updateState,
    clearState,
    isLoaded,
  };
}

/**
 * Hook específico para manejar estado de formularios persistente
 */
export function usePersistentFormState<T extends Record<string, any>>(
  key: string,
  initialFormData: T
) {
  return usePersistentState(key, initialFormData, {
    validateValue: (value) => {
      return (
        typeof value === "object" &&
        value !== null &&
        Object.keys(initialFormData).every(field => field in value)
      );
    },
  });
}

/**
 * Hook específico para manejar índices de carrusel persistente
 */
export function usePersistentCarouselState(
  key: string,
  maxIndex: number,
  initialIndex: number = 0
) {
  return usePersistentState(key, initialIndex, {
    validateValue: (value) => {
      return typeof value === "number" && value >= 0 && value < maxIndex;
    },
  });
}

/**
 * Hook específico para manejar estado de modales persistente
 */
export function usePersistentModalState(key: string) {
  return usePersistentState(key, false, {
    validateValue: (value) => typeof value === "boolean",
  });
}
