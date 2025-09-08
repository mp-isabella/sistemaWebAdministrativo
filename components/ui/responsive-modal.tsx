"use client";

import { ReactNode, useEffect } from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ResponsiveModalProps) {
  const { isMobile, isTablet } = useResponsive();

  // Cerrar modal con Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: isMobile ? 'w-full h-full' : 'w-full max-w-sm',
    md: isMobile ? 'w-full h-full' : 'w-full max-w-md',
    lg: isMobile ? 'w-full h-full' : 'w-full max-w-lg',
    xl: isMobile ? 'w-full h-full' : 'w-full max-w-xl',
    full: 'w-full h-full',
  };

  const modalClasses = cn(
    // Base classes
    'fixed inset-0 z-50 flex items-center justify-center',
    'bg-black bg-opacity-50 backdrop-blur-sm',
    // Animaciones
    'animate-in fade-in-0 duration-300',
    className
  );

  const contentClasses = cn(
    // Base classes
    'bg-white rounded-lg shadow-xl',
    'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
    // Tamaños responsivos
    sizeClasses[size],
    // Padding responsivo
    isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8',
    // Altura en móvil
    isMobile && size !== 'full' && 'max-h-[90vh] overflow-y-auto'
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={modalClasses} onClick={handleOverlayClick}>
      <div className={contentClasses}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {title && (
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente para modales de confirmación
interface ResponsiveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ResponsiveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ResponsiveConfirmModalProps) {
  const { isMobile } = useResponsive();

  const buttonVariant = variant === 'destructive' ? 'destructive' : 'default';

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className="p-4 sm:p-6"
    >
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {message}
        </p>
        
        <div className={cn(
          "flex gap-3",
          isMobile ? "flex-col" : "flex-row justify-end"
        )}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className={cn(
              "flex-1 sm:flex-none",
              isMobile ? "order-2" : "order-1"
            )}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 sm:flex-none",
              isMobile ? "order-1" : "order-2"
            )}
          >
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

// Componente para modales de formulario
interface ResponsiveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveFormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  loading = false,
  size = 'md',
}: ResponsiveFormModalProps) {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-4 sm:space-y-6">
          {children}
        </div>
        
        <div className={cn(
          "flex gap-3 pt-4 border-t border-gray-200",
          isMobile ? "flex-col" : "flex-row justify-end"
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className={cn(
              "flex-1 sm:flex-none",
              isMobile ? "order-2" : "order-1"
            )}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "flex-1 sm:flex-none",
              isMobile ? "order-1" : "order-2"
            )}
          >
            {loading ? 'Guardando...' : submitText}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

// Componente para modales de información
interface ResponsiveInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveInfoModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ResponsiveInfoModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </ResponsiveModal>
  );
}
