import { useState, useEffect, useCallback } from 'react';

interface UseMobileCardInteractionOptions {
  preventDoubleTap?: boolean;
  tapDelay?: number;
  enableHover?: boolean;
}

export function useMobileCardInteraction(options: UseMobileCardInteractionOptions = {}) {
  const {
    preventDoubleTap = true,
    tapDelay = 300,
    enableHover = false
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detección móvil segura
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para manejar clicks/taps de manera segura
  const handleCardInteraction = useCallback((callback: () => void) => {
    if (!isMounted) return;
    
    const now = Date.now();
    
    // Prevenir doble tap en móvil
    if (preventDoubleTap && isMobile) {
      if (now - lastTapTime < tapDelay || isProcessing) {
        return;
      }
    }
    
    setLastTapTime(now);
    setIsProcessing(true);
    
    // Ejecutar callback
    callback();
    
    // Resetear estado después del delay
    setTimeout(() => {
      setIsProcessing(false);
    }, tapDelay);
  }, [isMobile, isMounted, preventDoubleTap, tapDelay, lastTapTime, isProcessing]);

  // Función para manejar hover (solo en desktop)
  const handleHover = useCallback((isHovering: boolean, callback: (hovering: boolean) => void) => {
    if (!isMounted || isMobile || !enableHover) return;
    callback(isHovering);
  }, [isMobile, isMounted, enableHover]);

  // Función para manejar modal
  const handleModal = useCallback((isOpen: boolean) => {
    if (typeof document === 'undefined') return;
    
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      // Restaurar la posición del scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
      
      // Restaurar la posición del scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        // Restaurar la posición del scroll
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        
        // Restaurar la posición del scroll
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, []);

  return {
    isMobile,
    isMounted,
    handleCardInteraction,
    handleHover,
    handleModal,
    isProcessing
  };
}
