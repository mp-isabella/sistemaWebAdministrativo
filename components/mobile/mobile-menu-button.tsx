"use client";

import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function MobileMenuButton({ isOpen, onToggle, className = "" }: MobileMenuButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <button 
      data-mobile-menu-button
      className={`block lg:hidden p-3 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-200 ${className}`}
      onClick={handleClick}
      onTouchEnd={handleTouch}
      aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
      type="button"
      style={{
        minWidth: '48px',
        minHeight: '48px',
        zIndex: 1000,
        position: 'relative',
        pointerEvents: 'auto',
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.2)',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-gray-700" />
      ) : (
        <Menu className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
