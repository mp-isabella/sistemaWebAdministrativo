import { useCallback } from 'react';

export const useSmoothScroll = () => {
  const scrollToSection = useCallback((sectionId: string) => {
    console.log('🔍 scrollToSection called with:', sectionId);
    
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      console.warn('❌ Window is not available (SSR)');
      return;
    }
    
    // Remover el # si existe
    const targetId = sectionId.replace('#', '');
    console.log('🎯 targetId after cleanup:', targetId);
    
    // Caso especial para "Inicio" - hacer scroll al tope absoluto de la página
    if (targetId === 'hero') {
      console.log('🏠 INICIO: Ejecutando scroll al tope absoluto');
      
      // Método simple y directo para ir al tope
      try {
        if (typeof window === 'undefined') return;
        
        console.log('📍 Posición actual:', window.scrollY);
        
        // Scroll directo al tope
        window.scrollTo(0, 0);
        console.log('✅ Scroll directo ejecutado');
        
        // Verificar que funcionó
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            console.log('📍 Posición después del scroll:', window.scrollY);
            if (window.scrollY > 0) {
              console.log('⚠️ Forzando con métodos adicionales...');
              if (typeof document !== 'undefined') {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              }
            }
          }
        }, 100);
        
      } catch (error) {
        console.error('❌ Error en scroll:', error);
        // Fallback
        if (typeof document !== 'undefined') {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }
      return;
    }
    
    // Para otras secciones, usar el método normal
    console.log(`🔍 Buscando elemento con ID: ${targetId}`);
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
      console.warn(`❌ Element with id "${targetId}" not found`);
      return;
    }

    console.log(`✅ Elemento encontrado, haciendo scroll a: ${targetId}`);
    try {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      console.log(`✅ ScrollIntoView ejecutado para: ${targetId}`);
    } catch (error) {
      console.error(`❌ Error durante scroll a ${targetId}:`, error);
    }
  }, []);

  return { scrollToSection };
};
