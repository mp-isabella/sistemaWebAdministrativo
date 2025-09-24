"use client";

import { safeRemoveElement } from '@/lib/dom-utils';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TawkTo() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Ocultar el chatbot en el portal administrativo y en el login
  const isDashboard = pathname?.startsWith('/dashboard');
  const isLogin = pathname === '/login';
  const shouldHideChatbot = isDashboard || isLogin;

  useEffect(() => {
    // Si estamos en el dashboard o login, no cargar el chatbot
    if (shouldHideChatbot) {
      return undefined;
    }

    setIsMounted(true);

    if (typeof document !== 'undefined') {
      // Crear el script de Tawk.to
      const s1 = document.createElement("script");
      s1.src = "https://embed.tawk.to/688e602e37c8b4192bd90d45/1j1m2fdn7";
      s1.async = true;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");

      // Agregar el script al documento
      document.body.appendChild(s1);

      // Función para verificar si el widget está listo
      const checkWidgetReady = () => {
        if (typeof window !== 'undefined' && (window as any).Tawk_API) {
          try {
            // Verificar si el widget está disponible
            if ((window as any).Tawk_API.isWidgetMinimized !== undefined) {
              // Agregar función global para abrir el chat
              (window as any).openTawkToChat = () => {
                try {
                  // Siempre maximizar el widget cuando se presiona el botón
                  if ((window as any).Tawk_API.isWidgetMinimized()) {
                    (window as any).Tawk_API.maximize();
                  } else {
                    // Si ya está maximizado, no hacer nada (mantener abierto)
                  }
                } catch (error) {
                }
              };

              return;
            }
          } catch (error) {
          }

          // Si no está listo, verificar de nuevo en 500ms
          setTimeout(checkWidgetReady, 500);
        } else {
          // Si Tawk_API no existe, verificar de nuevo en 500ms
          setTimeout(checkWidgetReady, 500);
        }
      };

      // Iniciar verificación después de un breve delay
      setTimeout(checkWidgetReady, 1000);

      // Función de fallback si el widget no se carga
      const fallbackCheck = setTimeout(() => {
        // Agregar función global de fallback
        (window as any).openTawkToChat = () => {
          // Intentar cargar el widget manualmente
          if (typeof window !== 'undefined' && (window as any).Tawk_API) {
            try {
              (window as any).Tawk_API.maximize();
            } catch (error) {
            }
          }
        };
      }, 10000); // 10 segundos de timeout

      return () => {
        clearTimeout(fallbackCheck);
        safeRemoveElement(s1, document.body);
        // Limpiar función global
        if (typeof window !== 'undefined') {
          delete (window as any).openTawkToChat;
        }
      };
    }

    return undefined;
  }, [shouldHideChatbot]); // Removed isWidgetReady dependency

  // No renderizar nada durante SSR o si estamos en el dashboard o login
  if (!isMounted || shouldHideChatbot) {
    return null;
  }

  return null;
}
