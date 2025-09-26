"use client";

import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface FormAlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const FormAlert: React.FC<FormAlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = ''
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          iconComponent: AlertCircle
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          iconComponent: CheckCircle
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500',
          iconComponent: AlertCircle
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          iconComponent: Info
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          iconComponent: Info
        };
    }
  };

  const styles = getAlertStyles();
  const IconComponent = styles.iconComponent;

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'error' 
                    ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' 
                    : type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : type === 'warning'
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                    : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                }`}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente específico para errores de validación
export interface ValidationAlertProps {
  errors: Record<string, string | undefined>;
  onClose?: () => void;
  className?: string;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  errors,
  onClose,
  className = ''
}) => {
  const errorMessages = Object.values(errors).filter(Boolean) as string[];
  
  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <FormAlert
      type="error"
      title="Por favor, corrige los siguientes errores:"
      message={errorMessages.join('. ')}
      onClose={onClose}
      className={className}
    />
  );
};
