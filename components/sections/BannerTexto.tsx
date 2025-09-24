"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageSquareText, MapPin } from "lucide-react";

type ContactProps = {
  city: string;
  phone: string;
  whatsapp: string;
};

const Contacto = ({ city, phone, whatsapp }: ContactProps) => (
  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
    {/* Ciudad con icono */}
    <div className="flex items-center gap-2 text-white">
      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{city}:</span>
    </div>
    
    {/* Botones de contacto */}
    <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
      {/* Botón de llamada */}
      <Link
        href={`tel:${phone}`}
        className="bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 transition-all duration-200 group flex-shrink-0 flex-1 sm:flex-none justify-center"
        aria-label={`Llamar a ${city}`}
      >
        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        <span className="text-xs sm:text-sm font-medium text-white">Llamar</span>
      </Link>
      
      {/* Botón de WhatsApp */}
      <Link
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-teal-600 hover:bg-teal-700 border border-teal-500 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 transition-all duration-200 group flex-shrink-0 flex-1 sm:flex-none justify-center"
        aria-label={`Enviar WhatsApp a ${city}`}
      >
        <MessageSquareText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        <span className="text-xs sm:text-sm font-medium text-white">WhatsApp</span>
      </Link>
    </div>
  </div>
);

export default function BannerTexto() {
  return (
    <section className="py-3 md:py-4 px-3 md:px-6 bg-blue-900 overflow-hidden" style={{ maxWidth: '100vw' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
          {/* Título principal */}
          <div className="text-white text-center lg:text-left">
            <h2 className="text-sm md:text-base lg:text-lg font-bold">
              ¿Necesitas ayuda? Contáctanos:
            </h2>
          </div>
          
          {/* Contenedor de contactos */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto">
            {/* Santiago */}
            <Contacto city="Santiago" phone="+56942008410" whatsapp="56942008410" />
            
            {/* Separador - solo visible en desktop */}
            <div className="hidden lg:block w-px h-8 bg-white/20 flex-shrink-0"></div>
            
            {/* Ñuble */}
            <Contacto city="Ñuble" phone="+56996706640" whatsapp="56996706640" />
          </div>
        </div>
      </div>
    </section>
  );
}