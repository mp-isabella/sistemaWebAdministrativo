"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
      return;
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
              console.log('✅ Tawk.to widget is ready and available');
              
              // Agregar función global para abrir el chat
              (window as any).openTawkToChat = () => {
                try {
                  console.log('🔧 Attempting to open Tawk.to chat...');
                  
                  // Siempre maximizar el widget cuando se presiona el botón
                  if ((window as any).Tawk_API.isWidgetMinimized()) {
                    console.log('📱 Widget is minimized, maximizing...');
                    (window as any).Tawk_API.maximize();
                  } else {
                    // Si ya está maximizado, no hacer nada (mantener abierto)
                    console.log('📱 Widget is already maximized');
                  }
                  
                  console.log('✅ Chat action completed successfully');
                } catch (error) {
                  console.error('❌ Error toggling Tawk.to widget:', error);
                }
              };
              
              return;
            }
          } catch (error) {
            console.log('⏳ Widget not ready yet, checking again...');
          }
          
          // Si no está listo, verificar de nuevo en 500ms
          setTimeout(checkWidgetReady, 500);
        } else {
          console.log('⏳ Tawk_API not available yet, checking again...');
          // Si Tawk_API no existe, verificar de nuevo en 500ms
          setTimeout(checkWidgetReady, 500);
        }
      };

      // Iniciar verificación después de un breve delay
      setTimeout(checkWidgetReady, 1000);

      // Función de fallback si el widget no se carga
      const fallbackCheck = setTimeout(() => {
        console.warn('⚠️ Tawk.to widget failed to load, using fallback');
        // Agregar función global de fallback
        (window as any).openTawkToChat = () => {
          console.log('🔄 Using fallback chat method');
          // Intentar cargar el widget manualmente
          if (typeof window !== 'undefined' && (window as any).Tawk_API) {
            try {
              (window as any).Tawk_API.maximize();
            } catch (error) {
              console.error('Fallback also failed:', error);
            }
          }
        };
      }, 10000); // 10 segundos de timeout

      return () => {
        clearTimeout(fallbackCheck);
        if (document.body.contains(s1)) {
          document.body.removeChild(s1);
        }
        // Limpiar función global
        if (typeof window !== 'undefined') {
          delete (window as any).openTawkToChat;
        }
      };
    }
  }, [shouldHideChatbot]); // Removed isWidgetReady dependency

  // No renderizar nada durante SSR o si estamos en el dashboard o login
  if (!isMounted || shouldHideChatbot) {
    return null;
  }

  return null;
}
