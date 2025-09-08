"use client";

import { ExternalLink, MapPin, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function QuickAccess() {
  const quickLinks = [
    {
      title: "Portal SII",
      description: "Acceso directo al Servicio de Impuestos Internos",
      icon: <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />,
      href: "https://www.sii.cl",
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      hoverColor: "hover:from-blue-700 hover:to-blue-800",
    },
    {
      title: "App de Geolocalización",
      description: "Aplicación móvil para seguimiento en tiempo real",
      icon: <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />,
      href: "#", // Enlace placeholder - ajustar según la app real
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Accesos Directos
        </h3>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {quickLinks.map((link, index) => (
          <div
            key={index}
            className={`${link.bgColor} ${link.borderColor} border rounded-xl p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 group w-full`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className={`${link.textColor} mb-2 sm:mb-3`}>
                  {link.icon}
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
                  {link.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                  {link.description}
                </p>
                
                {link.href === "#" ? (
                  <button className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 cursor-not-allowed opacity-50">
                    <span>Próximamente</span>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-medium ${link.textColor} hover:underline transition-colors duration-200`}
                  >
                    <span>Acceder</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
              
              <div className={`${link.href === "#" ? "opacity-30" : ""} flex-shrink-0 ml-2`}>
                <ExternalLink className={`h-4 w-4 sm:h-5 sm:w-5 ${link.textColor} opacity-60`} />
              </div>
            </div>
            
            {/* Indicador de estado */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  link.href === "#" ? "bg-gray-400" : "bg-green-500"
                }`}></div>
                <span className="text-xs text-gray-500">
                  {link.href === "#" ? "En desarrollo" : "Disponible"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-blue-900">
              Enlaces externos
            </p>
            <p className="text-xs text-blue-700 line-clamp-2">
              Los accesos directos se abren en nuevas pestañas para mantener tu sesión activa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
