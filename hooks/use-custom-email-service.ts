import { useState } from 'react';

interface QuoteFormData {
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje: string;
  formType: 'hero' | 'contact';
}

export const useCustomEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuoteEmail = async (data: QuoteFormData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/send-custom-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message);
      }

      return {
        success: result.success,
        message: result.message
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        message: `❌ Error al enviar cotización: ${errorMessage}`
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendQuoteEmail,
    isLoading,
    error
  };
};
