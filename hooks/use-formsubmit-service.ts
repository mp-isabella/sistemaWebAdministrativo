"use client";

import { useState } from 'react';
import { sendFormSubmitQuote, type FormSubmitData } from '@/lib/formsubmit-service';

// Interfaz para los datos del formulario (mantener compatibilidad)
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

export const useFormSubmitService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuoteEmail = async (data: QuoteFormData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convertir datos al formato esperado por el servicio
      const formSubmitData: FormSubmitData = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        region: data.region,
        comuna: data.comuna,
        direccion: data.direccion,
        servicio: data.servicio,
        mensaje: data.mensaje,
        formType: data.formType
      };

      // Usar el servicio de FormSubmit
      const result = await sendFormSubmitQuote(formSubmitData);
      
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
