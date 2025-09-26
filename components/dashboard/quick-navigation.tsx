"use client";

import {
  // CreditCard,
  BarChart3,
  Building2,
  Calendar,
  // TrendingUp, 
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  TestTube,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';
import Link from 'next/link';

export function QuickNavigation() {
  const navigationItems = [
    {
      title: "Calendario",
      description: "Programación y gestión de trabajos",
      icon: <Calendar className="h-6 w-6" />,
      href: "/dashboard/schedule/calendar",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    {
      title: "Agenda",
      description: "Gestión de citas y programación",
      icon: <Clock className="h-6 w-6" />,
      href: "/dashboard/schedule",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200"
    },
    {
      title: "Clientes",
      description: "Base de datos de clientes",
      icon: <Users className="h-6 w-6" />,
      href: "/dashboard/clients",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200"
    },
    {
      title: "Trabajadores",
      description: "Gestión de técnicos y personal",
      icon: <Wrench className="h-6 w-6" />,
      href: "/dashboard/workers",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200"
    },
    {
      title: "Cajas",
      description: "Gestión financiera y caja",
      icon: <DollarSign className="h-6 w-6" />,
      href: "/dashboard/cash",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200"
    },
    {
      title: "Cotizaciones",
      description: "Presupuestos y cotizaciones",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/quotes",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    {
      title: "Liquidación",
      description: "Procesos de liquidación",
      icon: <UserCheck className="h-6 w-6" />,
      href: "/dashboard/liquidations",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      borderColor: "border-pink-200"
    },
    {
      title: "Reportes",
      description: "Análisis y estadísticas",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/dashboard/reports",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
      borderColor: "border-cyan-200"
    },
    {
      title: "Portal SII",
      description: "Acceso directo al Servicio de Impuestos Internos",
      icon: <Building2 className="h-6 w-6" />,
      href: "https://www.sii.cl",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      isExternal: true
    },
    {
      title: "Trabajos de Prueba",
      description: "Crear trabajos de prueba para verificar el sistema",
      icon: <TestTube className="h-6 w-6" />,
      href: "/test-jobs",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    {
      title: "App Geolocalización",
      description: "Aplicación móvil para seguimiento en tiempo real",
      icon: <MapPin className="h-6 w-6" />,
      href: "#",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
      isExternal: false,
      isComingSoon: true
    }
  ];

  return (
    <div className="bg-transparent rounded-xl p-3 sm:p-4 lg:p-6 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Accesos Rápidos
        </h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {navigationItems.map((item, index) => {
          const isExternal = item.isExternal;
          const isComingSoon = item.isComingSoon;

          const cardContent = (
            <div className={`bg-transparent ${item.borderColor} border rounded-xl p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 group w-full ${isComingSoon ? 'opacity-75' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className={`${item.textColor} mb-2 sm:mb-3`}>
                    <div className="h-4 w-4 sm:h-6 sm:w-6">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {isComingSoon ? (
                    <div className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 cursor-not-allowed">
                      <span>Próximamente</span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      <span>Acceder</span>
                      {isExternal && <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                      {!isExternal && <div className="w-1 h-1 bg-gray-400 rounded-full"></div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de estado */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isComingSoon ? 'bg-gray-400' : 'bg-green-500'
                    }`}></div>
                  <span className="text-xs text-gray-500">
                    {isComingSoon ? 'En desarrollo' : 'Disponible'}
                  </span>
                </div>
              </div>
            </div>
          );

          if (isComingSoon) {
            return (
              <div key={index}>
                {cardContent}
              </div>
            );
          }

          if (isExternal) {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link key={index} href={item.href}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-transparent rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-blue-900">
              Navegación rápida
            </p>
            <p className="text-xs sm:text-sm text-blue-700">
              Accede directamente a todas las secciones principales del sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
