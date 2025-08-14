"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageSquareText } from "lucide-react";

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
  <div className="flex items-center gap-2">
    <span className="text-lg text-white">{city}:</span>
    <Link
      href={`tel:${phone}`}
      className="text-base font-bold text-white hover:text-gray-200 flex items-center gap-1"
      aria-label={`Llamar a ${city}`}
    >
      <Phone className="h-5 w-5" />
      Llamar
    </Link>
    <Link
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-base font-bold text-white hover:text-green-300 flex items-center gap-1"
      aria-label={`Enviar WhatsApp a ${city}`}
    >
      <MessageSquareText className="h-5 w-5 text-green-500" />
      WhatsApp
    </Link>
  </div>
);

export default function BannerTexto() {
  return (
    <section className="py-5 px-4 sm:px-6 lg:px-8 bg-brand-dark">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left md:justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">
            ¿Necesitas ayuda? Contáctanos:
          </h2>
          <div className="flex items-center gap-4">
            <Contacto city="Santiago" phone="+56942008410" whatsapp="56942008410" />
            <span className="text-white text-base">|</span>
            <Contacto city="Ñuble" phone="+56996706640" whatsapp="56996706640" />
          </div>
        </div>
      </div>
    </section>
  );
}
