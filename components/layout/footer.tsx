"use client";

import { Button } from "@/components/ui/button";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  LogIn,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// Icono de TikTok personalizado
const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Paleta de colores unificada
const colors = {
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  highlight: "#F46015",
  white: "#FFFFFF",
  gray: "#4B5563",
  lightGray: "#6B7280",
};

export default function Footer() {
  const { scrollToSection } = useSmoothScroll();

  const handleFooterLinkClick = (href: string) => {
    if (href.startsWith("#")) {
      setTimeout(() => {
        scrollToSection(href);
      }, 50);
    }
  };

  return (
    <footer className="relative bg-white">
      <div className="absolute left-0 w-full h-full bg-[#002D71] z-0">
        <div className="relative w-full h-full">
          <div
            className="absolute -top-12 left-0 w-full h-16 bg-gray-100"
            style={{ transform: "skewY(-2deg)" }}
          ></div>
        </div>
      </div>
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 lg:max-w-[400px]">
            <div className="relative w-[200px] h-[80px] mt-6">
              <Image
                src="/logo-blanco.png"
                alt="Logo Améstica"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 text-base font-semibold">
              Especialistas en la detección de fugas de agua, destape de
              alcantarillado y videoinspección de ductos.
            </p>

            <div className="flex space-x-4">
              {/* Redes sociales */}
              <SocialIcon href="https://www.facebook.com/share/1AwoWrjqxf/" icon={<Facebook />} />
              <SocialIcon href="https://www.instagram.com/amestica.ltda?igsh=OW15dHN4OW52cnJo" icon={<Instagram />} />
              <SocialIcon href="https://youtube.com/@amestica_ltda?si=NLRlH1aa4swqSoUQ" icon={<Youtube />} />
              <SocialIcon href="https://www.tiktok.com/@amesticaltda?is_from_webapp=1&sender_device=pc" icon={<TikTokIcon />} />
            </div>
          </div>

          {/* Enlaces rápidos y servicios */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 text-white">
            <QuickLinks handleClick={handleFooterLinkClick} />
            <ServicesLinks />
          </div>
        </div>
      </div>

      {/* Sección inferior */}
      <div className="relative z-10 bg-[#016AAB] mt-12 text-white py-4 px-6 flex flex-col lg:flex-row justify-between items-center rounded-t-3xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <p className="text-sm font-semibold">
            © {new Date().getFullYear()} Améstica. Todos los derechos reservados.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link href="/login">
            <Button className="bg-[#F46015] hover:bg-[#e1550f] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300 flex items-center space-x-2">
              <LogIn className="h-5 w-5" />
              <span>Acceso Sistema Interno</span>
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}

// Componente redes sociales animado
const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-2 rounded-full transition-colors duration-300 bg-white/10 hover:bg-[#F46015]"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <div className="h-6 w-6 text-white">{icon}</div>
  </motion.a>
);

// Enlaces rápidos
const QuickLinks = ({ handleClick }: { handleClick: (href: string) => void }) => (
  <div>
    <h3 className="text-xl font-bold mb-6" style={{ color: colors.highlight }}>
      Enlaces Rápidos
    </h3>
    <ul className="space-y-3">
      {[
        ["#hero", "Inicio"],
        ["#about", "Quienes somos"],
        ["#services", "Servicios"],
        ["#gallery", "Galería"],
        ["#testimonials", "Testimonios"],
        ["#contacto", "Contacto"],
      ].map(([href, label]) => (
        <li key={href}>
          <button
            onClick={() => handleClick(href || '')}
            className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
          >
            {label}
            <span
              className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: colors.highlight }}
            ></span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

// Servicios
const ServicesLinks = () => (
  <div>
    <h3 className="text-xl font-bold mb-6" style={{ color: colors.highlight }}>
      Servicios
    </h3>
    <ul className="space-y-3">
      {[
        "Detección de fugas de agua",
        "Detección de fugas de agua caliente",
        "Detección de fugas en piscina",
        "Detección de fugas en calefacción",
        "Detección de fugas en redes de incendio",
        "Detección de fugas en jardines",
        "Destape de alcantarillado",
        "Videoinspección de ductos",
      ].map((service) => (
        <li key={service}>
          <Link
            href="#services"
            className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-base font-semibold"
          >
            {service}
            <span
              className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: colors.highlight }}
            ></span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
