// app/components/ClientWrapper.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";

export default function ClientWrapper({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render children only after hydration to prevent mismatches
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return <>{children}</>;
}
