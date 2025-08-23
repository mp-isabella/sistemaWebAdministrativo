"use client";

import React, { useState, useEffect } from "react";

export default function BannerLogos() {
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
    "Comprometidos con la calidad y cobertura nacional para cada cliente.",
    "Confía en nosotros para soluciones rápidas y efectivas donde lo necesites.",
    "Estamos aquí para ayudarte de lunes a sábado, en horarios extendidos.",
    "Conéctate con nosotros y descubre cómo podemos ayudarte en todo Chile.",
    "Experiencia y profesionalismo respaldan cada servicio que ofrecemos."
  ];

  // Renderizar contenido básico durante SSR para evitar hidratación
  if (!isMounted) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center space-x-4 md:space-x-8 mx-4 md:mx-8">
            {services.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-white text-sm md:text-lg font-medium">{service}</span>
                <span className="text-white text-xl md:text-2xl">✱</span>
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
        <div className="flex items-center space-x-4 md:space-x-8 mx-4 md:mx-8">
          {services.map((service, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-white text-sm md:text-lg font-medium">{service}</span>
              <span className="text-white text-xl md:text-2xl">✱</span>
            </div>
          ))}
        </div>

        {/* Segunda serie duplicada para loop continuo */}
        <div className="flex items-center space-x-4 md:space-x-8 mx-4 md:mx-8">
          {services.map((service, index) => (
            <div key={`duplicate-${index}`} className="flex items-center space-x-2">
              <span className="text-white text-sm md:text-lg font-medium">{service}</span>
              <span className="text-white text-xl md:text-2xl">✱</span>
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
          animation: marquee 50s linear infinite;
          will-change: transform;
          min-width: max-content;
        }

        .animate-marquee-mobile {
          display: flex;
          animation: marquee-mobile 150s linear infinite;
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
