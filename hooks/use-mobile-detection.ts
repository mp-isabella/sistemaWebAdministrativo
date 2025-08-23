import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

export function useMobileDetection(): MobileDetection {
  const [mobileInfo, setMobileInfo] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true, // Default desktop for SSR
    screenWidth: 1024, // Default value for SSR
    screenHeight: 768, // Default value for SSR
    orientation: 'landscape', // Default landscape for SSR
    isTouchDevice: false,
  });
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const updateMobileInfo = () => {
      try {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Detect touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Detect orientation
        const orientation = width > height ? 'landscape' : 'portrait';
        
        // Classify device
        const isMobile = width <= 768 || (width <= 1024 && isTouchDevice);
        const isTablet = width > 768 && width <= 1024 && isTouchDevice;
        const isDesktop = width > 1024 || (!isTouchDevice && width > 768);

        setMobileInfo({
          isMobile,
          isTablet,
          isDesktop,
          screenWidth: width,
          screenHeight: height,
          orientation,
          isTouchDevice,
        });
      } catch (error) {
        console.warn('Error updating mobile info:', error);
        // Fallback to default values
        setMobileInfo({
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          screenWidth: 1024,
          screenHeight: 768,
          orientation: 'landscape',
          isTouchDevice: false,
        });
      }
    };

    // Initial detection
    updateMobileInfo();

    // Listen for size and orientation changes
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, []);

  // Return default values during SSR to avoid hydration differences
  // Only return actual values after mounting
  if (!isMounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1024,
      screenHeight: 768,
      orientation: 'landscape',
      isTouchDevice: false,
    };
  }

  return mobileInfo;
}
