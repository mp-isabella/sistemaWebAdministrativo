import { useState, useEffect } from 'react';

/**
 * Hook to safely handle client-side only logic without causing hydration mismatches
 * @param defaultValue - The value to return during SSR
 * @param clientValue - The value to return after hydration
 * @returns The appropriate value based on hydration state
 */
export function useHydrationSafe<T>(defaultValue: T, clientValue: T): T {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? clientValue : defaultValue;
}

/**
 * Hook to safely access window object without causing hydration errors
 * @returns Whether the component is mounted on the client
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook to safely access window object
 * @returns Window object or null if not available
 */
export function useWindow(): Window | null {
  const [windowObj, setWindowObj] = useState<Window | null>(null);

  useEffect(() => {
    setWindowObj(window);
  }, []);

  return windowObj;
}

/**
 * Hook to safely access document object
 * @returns Document object or null if not available
 */
export function useDocument(): Document | null {
  const [documentObj, setDocumentObj] = useState<Document | null>(null);

  useEffect(() => {
    setDocumentObj(document);
  }, []);

  return documentObj;
}

/**
 * Hook to safely handle mobile detection without hydration mismatches
 * @returns Mobile detection state that's safe for SSR
 */
export function useSafeMobileDetection() {
  const isClient = useIsClient();
  
  if (!isClient) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1024,
      screenHeight: 768,
      orientation: 'landscape' as const,
      isTouchDevice: false,
    };
  }

  // Only import and use the actual hook on the client
  const { useMobileDetection } = require('@/hooks/use-mobile-detection');
  return useMobileDetection();
}
