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

export default function BannerTexto() {
  return (
    <section
      className="py-5 md:py-5 px-4 sm:px-6 lg:px-8 bg-brand-dark" // Aumento del padding vertical
      
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left md:justify-between gap-4">
          <div>
            <h2
              className="text-lg font-semibold text-white" // Tamaño de letra aumentado a text-lg
            >
              ¿Necesitas ayuda? Contáctanos:
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Santiago */}
            <div className="flex items-center gap-2">
              <span className="text-lg text-white">Santiago:</span>
              <Link
                href="tel:+56942008410"
                className="text-base font-bold text-white hover:text-gray-200 flex items-center gap-1"
              >
                <Phone className="h-5 w-5" />
                Llamar
              </Link>
              <Link
                href="https://wa.me/+56942008410"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-white hover:text-green-300 flex items-center gap-1"
              >
                <MessageSquareText className="h-5 w-5 text-green-500" />
                WhatsApp
              </Link>
            </div>
            <span className="text-white text-base">|</span>
            {/* Ñuble (Chillán) */}
            <div className="flex items-center gap-2">
              <span className="text-lg text-white">Ñuble:</span>
              <Link
                href="tel:+56996706640"
                className="text-base font-bold text-white hover:text-gray-200 flex items-center gap-1"
              >
                <Phone className="h-5 w-5" />
                Llamar
              </Link>
              <Link
                href="https://wa.me/+56996706640"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-white hover:text-green-300 flex items-center gap-1"
              >
                <MessageSquareText className="h-5 w-5 text-green-500" />
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}