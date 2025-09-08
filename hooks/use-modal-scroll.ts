import { useEffect, useRef } from 'react';

export function useModalScroll(isOpen: boolean) {
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    if (isOpen) {
      // Guardar la posición actual del scroll
      scrollPositionRef.current = window.scrollY;
      
      // Solo prevenir scroll del body, sin cambiar posicionamiento
      document.body.style.overflow = 'hidden';
      document.body.classList.add('services-modal-open');
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = '';
      document.body.classList.remove('services-modal-open');
      
      // Restaurar la posición del scroll de manera instantánea
      if (scrollPositionRef.current > 0) {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant'
        });
      }
    }

    // Cleanup al desmontar
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.classList.remove('services-modal-open');
      }
    };
  }, [isOpen]);

  return scrollPositionRef.current;
}
