"use client";

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const openMenu = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return newState;
    });
  }, []);

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
      document.body.style.overflow = 'unset';
    }
  }, [pathname]);

  // Manejar clicks fuera del menú, scroll y touch
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-mobile-sidebar]');
      const menuButton = document.querySelector('[data-mobile-menu-button]');
      const closeButton = document.querySelector('[data-mobile-close-button]');
      const target = event.target as Node;

      if (sidebar && !sidebar.contains(target) &&
        menuButton && !menuButton.contains(target) &&
        closeButton && !closeButton.contains(target)) {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };

    const handleTouchMove = () => {
      setIsOpen(false);
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchmove', handleTouchMove);
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu
  };
}
