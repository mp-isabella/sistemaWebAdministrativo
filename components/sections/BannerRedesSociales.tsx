"use client";

import React, { useState, useEffect } from "react";

export default function ServicesBanner() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const services = [
    "Cobertura nacional con tecnología de calidad",
    "Llegamos a donde nos necesites. Atención en Santiago, Ñuble y otras regiones del país",
    "Lunes a viernes 8:00 - 20:00 | Sábado 9:00 - 19:00",
    "Síguenos en nuestras redes sociales",
    "Entérate de nuestras novedades, servicios y cobertura en todo Chile",
  ];

  // Renderizar contenido básico durante SSR para evitar hidratación
  if (!isMounted) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center space-x-8 mx-8">
            {services.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-white text-lg font-medium">{service}</span>
                <span className="text-white text-2xl">✱</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-4 overflow-hidden">
      <div className={`flex whitespace-nowrap ${isMobile ? 'animate-marquee-mobile' : 'animate-marquee'}`}>
        {/* Primera serie de servicios */}
        <div className="flex items-center space-x-8 mx-8">
          {services.map((service, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-white text-lg font-medium">{service}</span>
              <span className="text-white text-2xl">✱</span>
            </div>
          ))}
        </div>

        {/* Segunda serie duplicada para loop continuo */}
        <div className="flex items-center space-x-8 mx-8">
          {services.map((service, index) => (
            <div key={`duplicate-${index}`} className="flex items-center space-x-2">
              <span className="text-white text-lg font-medium">{service}</span>
              <span className="text-white text-2xl">✱</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-mobile {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          display: flex;
          animation: marquee 45s linear infinite;
          will-change: transform;
          min-width: max-content;
        }

        .animate-marquee-mobile {
          display: flex;
          animation: marquee-mobile 140s linear infinite;
          will-change: transform;
          min-width: max-content;
        }

        /* Pausar animación solo en hover para desktop */
        @media (hover: hover) {
          .animate-marquee:hover,
          .animate-marquee-mobile:hover {
            animation-play-state: paused;
          }
        }

        /* Asegurar que las animaciones funcionen en móvil */
        @media (max-width: 768px) {
          .animate-marquee-mobile {
            animation-play-state: running !important;
            animation-timing-function: linear !important;
          }
        }

        /* Solo pausar si el usuario tiene preferencia de movimiento reducido */
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee,
          .animate-marquee-mobile {
            animation-play-state: paused;
          }
        }
      `}</style>
    </div>
  );
}
