"use client";

import {
  Calendar,
  CalendarDays,
  CreditCard,
  DollarSign,
  FileText,
  Settings,
  UserCheck,
  Users,
  Wrench,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface MobileNavigationProps {
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ userRole, isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getNavigationItems = () => {
    const commonItems = [
      { name: "Calendario", href: "/dashboard/schedule/calendar", icon: Calendar, color: "text-yellow-500" },
    ];

    switch (userRole) {
      case "admin":
      case "administrador":
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: CalendarDays, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Trabajadores", href: "/dashboard/workers", icon: UserCheck, color: "text-indigo-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Cotizaciones", href: "/dashboard/quotes", icon: DollarSign, color: "text-orange-500" },
          { name: "Liquidación", href: "/dashboard/liquidations", icon: UserCheck, color: "text-red-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
          { name: "Administración", href: "/dashboard/admin", icon: Settings, color: "text-gray-300" },
        ];
      case "secretaria":
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: CalendarDays, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Cotizaciones", href: "/dashboard/quotes", icon: DollarSign, color: "text-orange-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
        ];
      case "tecnico":
        return [
          ...commonItems,
          { name: "Mis Trabajos", href: "/dashboard/my-jobs", icon: Wrench, color: "text-blue-500" },
        ];
      default:
        return commonItems;
    }
  };

  const handleNavigation = (href: string) => {
    // Force cleanup of body styles
    document.body.style.overflow = 'unset';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    onClose();
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  const handleClose = useCallback(() => {
    // Force cleanup of body styles
    document.body.style.overflow = 'unset';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    onClose();
  }, [onClose]);

  // Cerrar menú con Escape, scroll y cleanup
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        handleClose();
      }
    };

    const handleTouchMove = (_event: TouchEvent) => {
      if (isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchmove', handleTouchMove);
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen, onClose, handleClose]);
  if (!isOpen) {
    return null;
  }
  // Debug info
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden mobile-overlay"
        onClick={handleClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 40,
          pointerEvents: 'auto'
        }}
      />

      {/* Sidebar */}
      <div
        data-mobile-sidebar
        className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100vh',
          zIndex: 9999,
          transform: 'translateX(0)',
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          pointerEvents: 'auto',
          background: 'linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)',
          borderRight: '1px solid rgba(51, 65, 85, 0.5)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold text-white">Améstica</h1>
              <p className="text-sm text-slate-400 font-medium">Servicios Técnicos</p>
            </div>
          </Link>
          <button
            data-mobile-close-button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="mobile-navigation-close-btn p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-800 touch-manipulation select-none"
            aria-label="Cerrar menú de navegación"
            type="button"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.2)',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              zIndex: 1000
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {getNavigationItems().map((item) => (
            <button
              key={item.name}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigation(item.href);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigation(item.href);
              }}
              className={`w-full group flex items-center space-x-3 px-3 py-3 text-slate-300 rounded-xl transition-all duration-200 hover:bg-slate-700/50 hover:text-white hover:scale-[1.02] hover:shadow-lg text-sm font-medium relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-800 ${pathname === item.href
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                  : ''
                }`}
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.2)',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div className={`relative z-10 p-2 rounded-lg transition-all duration-200 ${pathname === item.href
                  ? 'bg-white/20'
                  : 'group-hover:bg-slate-600/30'
                }`}>
                <item.icon className={`h-5 w-5 ${item.color} transition-all duration-200 ${pathname === item.href ? 'text-white' : 'group-hover:text-white'
                  }`} />
              </div>
              <span className="relative z-10 truncate font-medium text-base">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
