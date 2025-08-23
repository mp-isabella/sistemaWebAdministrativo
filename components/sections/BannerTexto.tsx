"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageSquareText, MapPin } from "lucide-react";

// Paleta de colores de la marca Améstica
const amesticaColors = {
  text: "#FFFFFF",
  highlight: "#F46015",
  strongBlue: "#016AAB",
  mediumBlue: "#014C90",
};

type ContactProps = {
  city: string;
  phone: string;
  whatsapp: string;
};

const Contacto = ({ city, phone, whatsapp }: ContactProps) => (
  <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
    {/* Ciudad con icono */}
    <div className="flex items-center gap-1 text-white">
      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{city}:</span>
    </div>
    
    {/* Botones de contacto */}
    <div className="flex gap-1 sm:gap-2">
      {/* Botón de llamada */}
      <Link
        href={`tel:${phone}`}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 flex items-center gap-1 hover:bg-white/20 transition-all duration-200 touch-optimized group flex-shrink-0"
        aria-label={`Llamar a ${city}`}
      >
        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-white group-hover:text-green-400 transition-colors flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-white">Llamar</span>
      </Link>
      
      {/* Botón de WhatsApp */}
      <Link
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 flex items-center gap-1 hover:bg-green-600/30 transition-all duration-200 touch-optimized group flex-shrink-0"
        aria-label={`Enviar WhatsApp a ${city}`}
      >
        <MessageSquareText className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 group-hover:text-green-300 transition-colors flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-white">WhatsApp</span>
      </Link>
    </div>
  </div>
);

export default function BannerTexto() {
  return (
    <section className="py-2 sm:py-3 md:py-2 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Efecto de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full blur-xl"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Layout responsivo completo */}
        <div className="flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-h-[40px] sm:min-h-[48px] md:min-h-[56px]">
          {/* Título principal */}
          <div className="text-center xs:text-left flex-shrink-0">
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white leading-tight">
              ¿Necesitas ayuda? Contáctanos:
            </h2>
          </div>
          
          {/* Contenedor de contactos responsivo */}
          <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-wrap justify-center">
            {/* Santiago */}
            <Contacto city="Santiago" phone="+56942008410" whatsapp="56942008410" />
            
            {/* Separador - visible en tablets y desktop */}
            <div className="hidden sm:block w-px h-4 sm:h-5 md:h-6 bg-white/20 flex-shrink-0"></div>
            
            {/* Ñuble */}
            <Contacto city="Ñuble" phone="+56996706640" whatsapp="56996706640" />
          </div>
        </div>
      </div>
    </section>
  );
}
