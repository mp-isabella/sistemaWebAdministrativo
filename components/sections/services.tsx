"use client";

/**
 * Componente de Servicios optimizado para móvil
 * 
 * Mejoras implementadas:
 * - Detección móvil segura sin problemas de hidratación
 * - Prevención de doble tap en dispositivos móviles
 * - Animaciones optimizadas para rendimiento móvil
 * - Gestión mejorada del modal con prevención de scroll
 * - Indicadores visuales de estado de procesamiento
 * - Clases CSS específicas para touch optimization
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { X, Droplets, Search, Camera, Shield, ArrowRight } from "lucide-react";
import { useMobileCardInteraction } from "@/hooks/use-mobile-card-interaction";

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

interface Service {
  title: string;
  subtitle: string;
  img: string;
  icon: React.ElementType;
  description: string;
}

const heroTexts: Service[] = [
  {
    title: "¿Tienes una fuga de agua?",
    subtitle: "En Améstica Ltda. la detectamos rápido, preciso y sin dañar tus instalaciones.",
    img: "/evidencia3.webp",
    icon: Droplets,
    description:
      "Como empresa, contamos con tecnología de ultrasonido, gas trazador, localizadores de cañerías y termografía para detectar fugas no visibles, garantizando una mínima intervención en las estructuras. Además, ofrecemos la reparación profesional de las cañerías detectadas, asegurando soluciones completas y confiables para nuestros clientes.",
  },
  {
    title: "¿Problemas con el alcantarillado?",
    subtitle: "Realizamos destapes rápidos y eficientes.",
    img: "/evidencia4.webp",
    icon: Search,
    description:
      "Para el destape de alcantarillados, utilizamos herramientas especializadas como varillas, máquinas eléctricas, aire comprimido e hidrolavadoras de alta presión, garantizando la eliminación rápida y efectiva de obstrucciones y asegurando un funcionamiento óptimo de las instalaciones sanitarias.",
  },
  {
    title: "¿Necesitas inspeccionar tus tuberías?",
    subtitle: "Nuestra videoinspección detecta fallas rápida y fácilmente, sin romper nada.",
    img: "/IMG_2614.JPG",
    icon: Camera,
    description:
      "Es un procedimiento que utiliza cámaras especiales para inspeccionar el interior de tuberías y ductos, permitiendo detectar obstrucciones, fugas o daños de manera precisa, rápida y sin necesidad de romper paredes ni pisos. Esta tecnología asegura un diagnóstico confiable y facilita la planificación de reparaciones.",
  },
];

// Animaciones optimizadas para móvil
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      staggerChildren: 0.1
    } 
  },
};

// Animaciones específicas para móvil
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: "easeOut"
    } 
  },
};

// Animaciones del modal optimizadas para móvil
const modalVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { 
      duration: 0.2, 
      ease: "easeIn"
    } 
  }
};

export default function Services() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Service | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Hook personalizado para interacciones móviles
  const { 
    isMobile, 
    isMounted, 
    handleCardInteraction, 
    handleHover, 
    handleModal,
    isProcessing 
  } = useMobileCardInteraction({
    preventDoubleTap: true,
    tapDelay: 300,
    enableHover: true
  });

  const handleCardClick = (item: Service, event: React.MouseEvent) => {
    // Prevenir comportamiento por defecto y propagación del evento
    event.preventDefault();
    event.stopPropagation();
    
    handleCardInteraction(() => {
      if (modalOpen) return;
      
      // Guardar posición actual del scroll
      setScrollPosition(window.scrollY);
      
      setModalData(item);
      setModalOpen(true);
      handleModal(true);
    });
  };

  const handleCloseModal = (event?: React.MouseEvent) => {
    // Prevenir comportamiento por defecto si hay evento
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setModalOpen(false);
    handleModal(false);
    
    // Restaurar posición del scroll después de cerrar el modal
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
      setModalData(null);
    }, 100);
  };

  // Efecto para mantener la posición del scroll cuando el modal está abierto
  useEffect(() => {
    if (modalOpen) {
      // Prevenir scroll cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar scroll cuando el modal se cierra
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [modalOpen, scrollPosition]);

  return (
    <section
      id="services"
      className="section-full-height relative w-full flex flex-col items-center justify-center py-32 px-4"
      style={{ backgroundColor: colors.dark }}
    >
      {/* Fondo con cuadrícula y efecto de luz */}
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
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Títulos */}
        <div className="text-center mb-6 mt-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
            Servicios
          </h2>

          <p className="text-lg max-w-3xl mx-auto leading-relaxed font-medium" style={{ color: colors.white }}>
            Utilizamos tecnología de vanguardia para ofrecerte un servicio de calidad insuperable y resultados duraderos.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full" style={{ gridAutoRows: '1fr' }}>
          {heroTexts.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                className="group relative h-full"
                variants={cardVariants}
                onMouseEnter={() => handleHover(true, () => setHoveredCard(idx))}
                onMouseLeave={() => handleHover(false, () => setHoveredCard(null))}
                whileHover={!isMobile ? { y: -10 } : {}}
                whileTap={isMobile ? { scale: 0.98 } : {}}
                style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}
              >
                <Card
                  className={`cursor-pointer overflow-hidden rounded-[3rem] shadow-xl transition-all duration-300 ease-in-out border-2 h-full flex flex-col touch-optimized ${
                    isProcessing ? 'pointer-events-none' : ''
                  }`}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: hoveredCard === idx ? colors.highlight : "transparent",
                    transform: hoveredCard === idx && !isMobile ? "translateY(-10px)" : "translateY(0)",
                  }}
                  onClick={(event) => handleCardClick(item, event)}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* CAMBIO AQUÍ: de h-52 a h-64 */}
                    <div className="relative h-64 w-full overflow-hidden rounded-[2rem] flex-shrink-0">
                      <Image
                        src={item.img || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{
                          background: `linear-gradient(to top, ${colors.dark}60, transparent 80%)`,
                        }}
                      />
                    </div>

                    <div className="p-6 text-left flex flex-col flex-grow">
                      <div className="text-center mb-3 flex-grow">
                        <div
                          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                          style={{ background: colors.highlight, color: colors.white }}
                        >
                          <IconComponent size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                        <p className="text-sm font-light mb-3" style={{ color: colors.light }}>
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 text-sm font-bold mt-auto text-white">
                        <span>Ver más detalles</span>
                        <motion.div
                          animate={{ 
                            x: hoveredCard === idx && !isMobile ? 5 : 0,
                            opacity: isProcessing ? 0.5 : 1
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight size={16} />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal optimizado para móvil */}
      <AnimatePresence mode="wait">
        {modalOpen && modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isMobile ? 0.2 : 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8"
            style={{
              background: `rgba(0,0,0,0.8)`,
              backdropFilter: "blur(10px)",
            }}
            onClick={handleCloseModal}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
                isMobile ? 'max-h-[90vh] mx-4' : 'max-h-[80vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div
                className="relative p-4 md:p-6 text-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${colors.strong}, ${colors.medium})` }}
              >
                <button
                  className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 hover:scale-110 bg-white bg-opacity-20 hover:bg-opacity-30 touch-optimized"
                  onClick={(event) => handleCloseModal(event)}
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div
                  className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${colors.white}20, ${colors.white}10)`,
                    border: `2px solid rgba(255,255,255,0.3)`,
                  }}
                >
                  <modalData.icon size={24} className="text-white md:w-8 md:h-8" />
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{modalData.title}</h3>
                <p className="text-sm md:text-base" style={{ color: colors.light }}>
                  {modalData.subtitle}
                </p>
              </div>

              <div className="p-4 md:p-6 flex-grow overflow-y-auto">
                <div className={`relative w-full rounded-xl overflow-hidden mb-4 bg-gray-100 ${
                  isMobile ? 'h-48' : 'h-56 md:h-80'
                }`}>
                  <Image
                    src={modalData.img || "/placeholder.svg"}
                    alt={modalData.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">{modalData.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}