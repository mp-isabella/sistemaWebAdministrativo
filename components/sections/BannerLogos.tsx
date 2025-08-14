"use client";

import React from "react";

export default function BannerLogos() {
  const services = [
    "Comprometidos con la calidad y cobertura nacional para cada cliente.",
    "Confía en nosotros para soluciones rápidas y efectivas donde lo necesites.",
    "Estamos aquí para ayudarte de lunes a sábado, en horarios extendidos.",
    "Conéctate con nosotros y descubre cómo podemos ayudarte en todo Chile.",
    "Experiencia y profesionalismo respaldan cada servicio que ofrecemos."
  ];

  return (
    <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
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

        .animate-marquee {
          display: flex;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
