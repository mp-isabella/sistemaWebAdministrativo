"use client";

import { useEffect, useState } from 'react';

interface HydrationDebuggerProps {
  name: string;
  children: React.ReactNode;
}

export function HydrationDebugger({ name, children }: HydrationDebuggerProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Hydration')) {
        console.error(`Hydration error in ${name}:`, event);
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [name]);

  if (hasError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <strong>Hydration Error in {name}</strong>
        <p>Check console for details</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function useHydrationDebug(name: string) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    console.log(`[Hydration] ${name} mounted`);
    setIsHydrated(true);
    return () => console.log(`[Hydration] ${name} unmounted`);
  }, [name]);

  return isHydrated;
}
