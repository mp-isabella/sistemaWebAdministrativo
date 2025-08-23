"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Youtube,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { Button } from "@/components/ui/button";
import { FaTiktok } from "react-icons/fa";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

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
    if (href.startsWith('#')) {
      scrollToSection(href);
    }
  };

  return (
    <footer className="relative bg-white">
      {" "}
      {/* Altura reducida aquí */}
      {/* Sección con fondo angulado */}
      <div className="absolute left-0 w-full h-full bg-[#002D71] z-0">
        <div className="relative w-full h-full">
          {/* Este div crea el efecto de ángulo con un transform */}
          <div
            className="absolute -top-12 left-0 w-full h-16 bg-gray-100"
            style={{ transform: "skewY(-2deg)" }}
          ></div>
        </div>
      </div>
      {/* Contenedor principal del footer sobre el fondo */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Columna Izquierda: Logo + Descripción + Redes Sociales */}
          <div className="flex-1 lg:max-w-[400px]">
            <div className="relative w-[200px] h-[80px] mt-6">
              <Image
                src="/logo-blanco.png"
                alt="Logo Améstica"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Especialistas en la detección de fugas de agua, destape de
              alcantarillado y videoinspección de ductos.
            </p>

            {/* Redes Sociales */}
            <div className="flex space-x-4">
              <motion.a
                href="https://www.facebook.com/www.amestica.cl/?locale=es_LA"
                aria-label="Facebook"
                className="block p-2 rounded-full transition-colors duration-300 bg-white/10 hover:bg-[#F46015]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="h-6 w-6 text-white" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/amestica.cl"
                aria-label="Instagram"
                className="block p-2 rounded-full transition-colors duration-300 bg-white/10 hover:bg-[#F46015]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-6 w-6 text-white" />
              </motion.a>
              <motion.a
                href="https://www.youtube.com/@amestica.cl"
                aria-label="YouTube"
                className="block p-2 rounded-full transition-colors duration-300 bg-white/10 hover:bg-[#F46015]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Youtube className="h-6 w-6 text-white" />
              </motion.a>
              <motion.a
                href="https://www.tiktok.com/@amestica.cl"
                aria-label="TikTok"
                className="block p-2 rounded-full transition-colors duration-300 bg-white/10 hover:bg-[#F46015]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTiktok className="h-6 w-6 text-white" />
              </motion.a>
            </div>
          </div>

          {/* Columna Derecha: Enlaces Rápidos y Servicios */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 text-white">
            {/* Enlaces Rápidos */}
            <div>
              <h3
                className="text-xl font-bold mb-6"
                style={{ color: colors.highlight }}
              >
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleFooterLinkClick("#hero")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
                  >
                    Inicio
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterLinkClick("#about")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
                  >
                    Quienes somos
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterLinkClick("#services")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
                  >
                    Servicios
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterLinkClick("#gallery")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
                  >
                    Galería
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </button>
                </li>
                                  <li>
                    <button
                      onClick={() => handleFooterLinkClick("#testimonials")}
                      className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
                    >
                      Testimonios
                      <span
                        className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: colors.highlight }}
                      ></span>
                    </button>
                  </li>
                  <li>
                  <button
                    onClick={() => handleFooterLinkClick("#contact")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-left"
                  >
                    Contacto
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Servicios */}
            <div>
              <h3
                className="text-xl font-bold mb-6"
                style={{ color: colors.highlight }}
              >
                Servicios
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#services"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Detección de fugas de agua
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#services"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Detección de fugas de agua caliente
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#services"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Detección de fugas en piscina
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Detección de fugas en calefacción
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#services"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Detección de fugas en redes de incendio
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Detección de fugas en jardines
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Destape de alcantarillado
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#services"
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    Videoinspección de ductos
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.highlight }}
                    ></span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Bottom (Sección inferior simplificada) */}
      <div className="relative z-10 bg-[#016AAB] mt-12 text-white py-4 px-6 flex flex-col lg:flex-row justify-between items-center rounded-t-3xl shadow-xl">
        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <p className="text-sm">
            © {new Date().getFullYear()} Améstica. Todos los derechos
            reservados.
          </p>
          <div className="flex flex-wrap justify-center space-x-6">
            <Link
              href="#"
              className="text-sm hover:text-gray-200 transition-colors duration-300"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="#"
              className="text-sm hover:text-gray-200 transition-colors duration-300"
            >
              Política de Privacidad
            </Link>
          </div>
        </div>

        {/* Botón de acceso al sistema */}
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
