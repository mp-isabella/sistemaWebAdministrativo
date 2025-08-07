"use client";

import React from 'react';
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { X, Droplets, Search, Wrench, Shield, ArrowRight } from "lucide-react";


const colors = {
  transparent: "transparent",
  black: "#000000",
  gray: "#4B5563",
  lightGray: "#6B7280",
  white: "#FFFFFF",
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  soft: "#5692C8",
  light: "#9ABCE1",
  extraLight: "#C4E9F9",
  highlight: "#F46015",
};

// Definición de tipos para los servicios
interface Service {
  title: string;
  subtitle: string;
  img: string;
  icon: React.ElementType;
  description: string;
}

// Datos de los servicios para las tarjetas
const heroTexts: Service[] = [
  {
    title: "¿Tienes una fuga de agua?",
    subtitle: "Nosotros la detectamos rápido.",
    img: "/evidencia3.webp",
    icon: Droplets,
    description:
      "Utilizamos tecnología de punta para localizar fugas sin romper paredes ni pisos. Detección precisa y rápida.",
  },
  {
    title: "Problemas con el alcantarillado?",
    subtitle: "Realizamos destapes y video inspecciones.",
    img: "/evidencia4.webp",
    icon: Search,
    description:
      "Video inspecciones con cámaras especializadas y destapes profesionales con equipos de alta presión.",
  },
  {
    title: "Atención profesional a domicilio",
    subtitle: "Tecnología de punta a tu alcance.",
    img: "/evidencia5.webp",
    icon: Wrench,
    description:
      "Servicio técnico especializado con equipos profesionales y atención personalizada en tu domicilio.",
  },
];

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function Services() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Service | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleCardClick = (item: Service) => {
    setModalData(item);
    setModalOpen(true);
  };

  return (
    <section
      id="servicios"
      className="relative w-full flex flex-col items-center justify-start py-8 md:py-8 px-4"
      style={{ backgroundColor: colors.dark }}
    >
      {/* Fondo de alta tecnología con cuadrícula y efecto de brillo */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${colors.soft}, transparent 70%)`,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-7xl"
        variants={fadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Títulos de la sección con márgenes reducidos */}
        <div className="text-center mb-8 md:mb-8 mt-4 md:mt-4">
          <div className="inline-block mb-4">
            <span
              className="px-6 py-2 border rounded-full text-sm font-semibold tracking-wide flex items-center gap-2"
              style={{
                borderColor: colors.soft,
                backgroundColor: colors.medium,
                color: colors.white,
              }}
            >
              <Shield size={18} />
              SERVICIOS PROFESIONALES
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white">
            Soluciones Avanzadas <br /> para tu Hogar
          </h2>

          <p
            className="text-lg max-w-3xl mx-auto leading-relaxed font-medium"
            style={{ color: colors.white }}
          >
            Utilizamos tecnología de vanguardia para ofrecerte un servicio de
            calidad insuperable y resultados duraderos.
          </p>
        </div>

        {/* Contenedor de las tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
          {heroTexts.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="group relative"
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card
                  className="cursor-pointer overflow-hidden rounded-[3rem] shadow-xl transition-all duration-300 ease-in-out border-2"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor:
                      hoveredCard === idx ? colors.highlight : "transparent",
                    transform:
                      hoveredCard === idx
                        ? "translateY(-10px)"
                        : "translateY(0)",
                  }}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="relative rounded-[3rem] p-0">
                    <CardContent className="p-0">
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={item.img || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                          style={{
                            background: `linear-gradient(to top, ${colors.dark}60, transparent 80%)`,
                          }}
                        />
                        <div
                          className="absolute bottom-6 left-6 px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-sm"
                          style={{ backgroundColor: colors.highlight }}
                        >
                          {item.title.includes("fuga")
                            ? "DETECCIÓN"
                            : item.title.includes("alcantarillado")
                              ? "DESTAPE"
                              : "ATENCIÓN"}{" "}
                          EXPERTA
                        </div>
                      </div>

                      <div className="p-8 text-left">
                        <div className="p-4 text-center">
                          <div
                            className="inline-flex items-center justify-center w-14 h-14 rounded-3xl mb-4"
                            style={{
                              background: colors.highlight,
                              color: colors.white,
                            }}
                          >
                            <IconComponent size={28} />
                          </div>
                          <h3 className="block w-full text-2xl font-bold mb-2 text-white">
                            {item.title}
                          </h3>
                          <p
                            className="block w-full text-base font-light mb-4"
                            style={{ color: colors.light }}
                          >
                            {item.subtitle}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 text-base font-bold mt-3 text-white">
                          <span>Ver más detalles</span>
                          <motion.div
                            animate={{ x: hoveredCard === idx ? 5 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight size={18} />
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal - se mantiene igual, ya que su diseño coincide con el nuevo estilo oscuro */}
      <AnimatePresence>
        {modalOpen && modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            style={{
  background: `linear-gradient(130deg, ${colors.transparent}, rgba(255, 255, 255, 0.05))`,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
}}
            
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-3xl w-full relative bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.strong}, ${colors.medium})`,
                }}
              >
                <button
                  className="absolute top-4 right-4 p-2 rounded-full transition-all duration-300 hover:scale-110 bg-white bg-opacity-20 hover:bg-opacity-30"
                  onClick={() => setModalOpen(false)}
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${colors.white}20, ${colors.white}10)`,
                    border: `2px solid ${colors.white}30`,
                  }}
                >
                  <modalData.icon size={40} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {modalData.title}
                </h3>
                <p className="text-lg" style={{ color: colors.light }}>
                  {modalData.subtitle}
                </p>
              </div>

              <div className="p-8">
                <div className="relative h-96 w-full rounded-xl overflow-hidden mb-6">
                  <Image
                    src={modalData.img || "/placeholder.svg"}
                    alt={modalData.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>

                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  {modalData.description}
                </p>

                <div className="flex justify-center">
                  <button
                    className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${colors.highlight}, ${colors.strong})`,
                    }}
                    onClick={() => setModalOpen(false)}
                  >
                    Solicitar Servicio
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}