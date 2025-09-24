'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    // Verificar si el Service Worker está disponible
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Registrar el Service Worker de forma segura
    const registerSW = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
      }
    };

    registerSW();
  }, []);

  return null;
}
