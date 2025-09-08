"use client";

import { useState } from 'react';

export interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje: string;
}

export interface ValidationErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  servicio?: string;
  mensaje?: string;
  [key: string]: string | undefined;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          return 'El nombre es obligatorio';
        }
        if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        break;

      case 'email':
        if (!value.trim()) {
          return 'El email es obligatorio';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor, ingresa un email válido';
        }
        break;

      case 'telefono':
        if (!value.trim()) {
          return 'El teléfono es obligatorio';
        }
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
          return 'Por favor, ingresa un teléfono válido';
        }
        break;

      case 'region':
        if (!value.trim()) {
          return 'La región es obligatoria';
        }
        break;

      case 'comuna':
        if (!value.trim()) {
          return 'La comuna es obligatoria';
        }
        break;

      case 'direccion':
        if (!value.trim()) {
          return 'La dirección es obligatoria';
        }
        if (value.trim().length < 5) {
          return 'La dirección debe tener al menos 5 caracteres';
        }
        break;

      case 'servicio':
        if (!value.trim()) {
          return 'El tipo de servicio es obligatorio';
        }
        break;

      case 'mensaje':
        // El mensaje es opcional, no necesita validación
        break;

      default:
        break;
    }
    return undefined;
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validar todos los campos obligatorios
    const requiredFields: (keyof FormData)[] = ['nombre', 'email', 'telefono', 'region', 'comuna', 'direccion', 'servicio'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validar mensaje si está presente
    if (formData.mensaje && formData.mensaje.trim()) {
      const error = validateField('mensaje', formData.mensaje);
      if (error) {
        newErrors.mensaje = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateSingleField = (field: keyof FormData, value: string): boolean => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    return !error;
  };

  const clearError = (field: keyof FormData) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  const getFirstError = (): string | undefined => {
    const firstErrorField = Object.keys(errors)[0] as keyof FormData;
    return firstErrorField ? errors[firstErrorField] : undefined;
  };

  return {
    errors,
    validateForm,
    validateSingleField,
    clearError,
    clearAllErrors,
    hasErrors,
    getFirstError
  };
};
