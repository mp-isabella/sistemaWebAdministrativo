// src/components/ui/loader.tsx
import { RefreshCcw } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
      <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
      <p className="mt-4">Cargando...</p>
    </div>
  );
}