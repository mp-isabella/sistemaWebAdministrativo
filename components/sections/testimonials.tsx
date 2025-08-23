"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";


// Paleta de colores
const colors = {
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  soft: "#5692C8",
  light: "#9ABCE1",
  highlight: "#F46015",
  white: "#FFFFFF",
  gray: "#4B5563",
  lightGray: "#6B7280",
};

// Testimonios
const testimonials: Array<{
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
}> = [
  {
    name: "María González",
    location: "Las Condes, Santiago",
    rating: 5,
    text: "Excelente servicio. Detectaron la fuga en mi casa sin romper nada y la repararon el mismo día. Muy profesionales y puntuales.",
    service: "Detección de fuga en jardín",
  },
  {
    name: "Ariel Lagos",
    location: "Coihueco, Ñuble",
    rating: 5,
    text: "Es una empresa seria al momento de realizar los diferentes trabajos, es una empresa en la cual se puede confiar",
    service: "Servicios de detección y reparación",
  },
  {
    name: "Ana Martínez",
    location: "Rancagua, VI Región",
    rating: 5,
    text: "Llevaba meses con una fuga que nadie podía encontrar. Améstica la detectó en 2 horas con su equipo especializado. Increíble tecnología.",
    service: "Detección de fuga oculta",
  },
  {
    name: "Pedro Sánchez",
    location: "Providencia, Santiago",
    rating: 5,
    text: "Trabajo impecable en mi condominio. Repararon las cañerías comunes sin afectar a los vecinos. Muy organizados y limpios.",
    service: "Reparación en condominio",
  },
  {
    name: "Lucía Torres",
    location: "Valparaíso, V Región",
    rating: 5,
    text: "Excelente atención y servicio profesional. Detectaron y repararon una fuga compleja que otras empresas no pudieron resolver.",
    service: "Detección y reparación de fuga",
  },
  {
    name: "Josefina Lagos",
    location: "Coihueco-Ñuble",
    rating: 5,
    text: "Excelente servicio, lo recomiendo al 100%, hace poco me contacté con ellos para la reparación de una fuga que otras empresas ni si quiera habían podido detectar, pero con el trabajo de la empresa Amestica pudo ser detectada y reparada con éxito",
    service: "Detección y reparación de fuga",
  },
];

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  // Detección simple de móvil usando CSS classes responsivas
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth !== undefined) {
      const checkMobile = () => {
        try {
          setIsMobile(window.innerWidth <= 768);
        } catch (error) {
          console.warn('Error checking mobile:', error);
          setIsMobile(false);
        }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Actualizar conteo visible basado en móvil
  useEffect(() => {
    if (isMobile) {
      setVisibleCount(isExpanded ? testimonials.length : 3);
    } else {
      setVisibleCount(3);
    }
  }, [isMobile, isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const cardsPerPage = isMobile ? 1 : 3;
  const totalSlides = Math.ceil((testimonials?.length || 0) / cardsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev: number) => (prev + 1) % (totalSlides || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev: number) => (prev - 1 + (totalSlides || 1)) % (totalSlides || 1));
  };



  // En móvil, mostrar todos los testimonios en vista vertical
  if (isMobile) {
    return (
      <section id="testimonials" className="section-full-height py-16 md:py-32 bg-gray-100 relative">
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          {/* Encabezado */}
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4" style={{ color: colors.dark }}>
              Testimonios
            </h2>
            <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-medium px-4" style={{ color: colors.medium }}>
              Nuestros clientes confían en nuestra experiencia y tecnología. Escucha lo que tienen que decir.
            </p>
          </div>

          {/* Vista móvil - Todos los testimonios */}
          <div className="space-y-4 md:hidden">
            {(testimonials || []).slice(0, visibleCount).map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: isMobile ? 0.6 : 0.3, 
                  delay: index * (isMobile ? 0.3 : 0.1) 
                }}
                className="w-full"
              >
                <Card className="bg-white shadow-lg border-t-4 rounded-2xl mobile-touch-target" style={{ borderColor: colors.highlight }}>
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial?.rating || 0)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" style={{ color: colors.highlight }} />
                      ))}
                    </div>
                    <blockquote className="text-base font-light italic leading-relaxed mb-4 mobile-text" style={{ color: colors.gray }}>
                      &quot;{testimonial.text}&quot;
                    </blockquote>
                    <div className="border-t pt-4 border-gray-200">
                      <h4 className="font-bold text-base mobile-heading" style={{ color: colors.dark }}>
                        {testimonial.name}
                      </h4>
                      <p className="mb-1 text-sm" style={{ color: colors.lightGray }}>
                        {testimonial.location}
                      </p>
                      <p className="font-semibold text-xs" style={{ color: colors.strong }}>
                        {testimonial.service}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Botón para expandir/contraer en móvil */}
            {(testimonials?.length || 0) > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: isMobile ? 0.6 : 0.3, 
                  delay: isMobile ? 1.0 : 0.5 
                }}
                className="flex justify-center mt-6"
              >
                <motion.button
                  onClick={toggleExpanded}
                  className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg mobile-button"
                  style={{ backgroundColor: colors.strong, color: colors.white }}
                  whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                  whileTap={{ scale: isMobile ? 0.98 : 0.95 }}
                  transition={{ duration: isMobile ? 0.4 : 0.2 }}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-5 w-5" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5" />
                      Ver todos los testimonios ({(testimonials?.length || 0)})
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Vista desktop - Carrusel original */}
          <div className="hidden md:block">
            <div className="relative w-full overflow-hidden">
                      <motion.div
          className="flex w-full"
          animate={{ x: `-${currentSlide * 100}%` }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        >
          {(testimonials || []).map((testimonial, index) => {
                  const cardPositionInSlide = index % cardsPerPage;

                  // Rotación solo en desktop
                  const rotation =
                    cardPositionInSlide === 0
                      ? "-2deg"
                      : cardPositionInSlide === 1
                      ? "0deg"
                      : "2deg";

                  return (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full md:w-1/3 p-4"
                      style={{ transform: `rotate(${rotation})` }}
                    >
                      <Card className="h-full bg-white shadow-xl border-t-8 rounded-3xl" style={{ borderColor: colors.highlight }}>
                        <CardContent className="h-full flex flex-col justify-between p-8">
                          <div>
                                                    <div className="flex justify-center mb-6">
                          {[...Array(testimonial?.rating || 0)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 fill-current" style={{ color: colors.highlight }} />
                              ))}
                            </div>
                            <blockquote className="text-lg font-light italic leading-relaxed mb-6" style={{ color: colors.gray }}>
                              &quot;{testimonial.text}&quot;
                            </blockquote>
                          </div>
                          <div className="border-t pt-6 border-gray-200">
                            <h4 className="font-bold text-lg" style={{ color: colors.dark }}>
                              {testimonial.name}
                            </h4>
                            <p className="mb-2" style={{ color: colors.lightGray }}>
                              {testimonial.location}
                            </p>
                            <p className="font-semibold text-sm" style={{ color: colors.strong }}>
                              {testimonial.service}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Botones desktop */}
            <button
              aria-label="Anterior slide"
              className="absolute left-0 top-1/2 -translate-y-1/2 ml-4 p-3 rounded-full shadow-lg border-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 touch-optimized"
              style={{ 
                backgroundColor: colors.white, 
                borderColor: colors.strong, 
                color: colors.strong,
                transitionDuration: `${isMobile ? 0.2 : 0.3}s`
              }}
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              aria-label="Siguiente slide"
              className="absolute right-0 top-1/2 -translate-y-1/2 mr-4 p-3 rounded-full shadow-lg border-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 touch-optimized"
              style={{ 
                backgroundColor: colors.white, 
                borderColor: colors.strong, 
                color: colors.strong,
                transitionDuration: `${isMobile ? 0.2 : 0.3}s`
              }}
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Indicadores desktop */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides || 1 }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  animate={{ scale: index === currentSlide ? 1.25 : 1 }}
                  className="w-3 h-3 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: index === currentSlide ? colors.strong : colors.gray }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Vista desktop original (sin cambios)
  return (
    <section id="testimonials" className="section-full-height py-32 bg-gray-100 relative">
      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: colors.dark }}>
            Testimonios
          </h2>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed font-medium" style={{ color: colors.medium }}>
            Nuestros clientes confían en nuestra experiencia y tecnología. Escucha lo que tienen que decir.
          </p>
        </div>

        {/* Carrusel */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex w-full"
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          >
            {(testimonials || []).map((testimonial, index) => {
              const cardPositionInSlide = index % cardsPerPage;

              // Rotación solo en md+
              const rotation =
                cardPositionInSlide === 0
                  ? "-2deg"
                  : cardPositionInSlide === 1
                  ? "0deg"
                  : "2deg";

              return (
                <div
                  key={index}
                  className="flex-shrink-0 w-full md:w-1/3 p-4"
                  style={{ transform: `rotate(${rotation})` }}
                >
                  <Card className="h-full bg-white shadow-xl border-t-8 rounded-3xl" style={{ borderColor: colors.highlight }}>
                    <CardContent className="h-full flex flex-col justify-between p-8">
                      <div>
                        <div className="flex justify-center mb-6">
                          {[...Array(testimonial?.rating || 0)].map((_, i) => (
                            <Star key={i} className="h-6 w-6 fill-current" style={{ color: colors.highlight }} />
                          ))}
                        </div>
                        <blockquote className="text-lg font-light italic leading-relaxed mb-6" style={{ color: colors.gray }}>
                          &quot;{testimonial.text}&quot;
                        </blockquote>
                      </div>
                      <div className="border-t pt-6 border-gray-200">
                        <h4 className="font-bold text-lg" style={{ color: colors.dark }}>
                          {testimonial.name}
                        </h4>
                        <p className="mb-2" style={{ color: colors.lightGray }}>
                          {testimonial.location}
                        </p>
                        <p className="font-semibold text-sm" style={{ color: colors.strong }}>
                          {testimonial.service}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Botones */}
        <button
          aria-label="Anterior slide"
          className="absolute left-0 top-1/2 -translate-y-1/2 ml-4 p-3 rounded-full shadow-lg border-2 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          style={{ backgroundColor: colors.white, borderColor: colors.strong, color: colors.strong }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          aria-label="Siguiente slide"
          className="absolute right-0 top-1/2 -translate-y-1/2 mr-4 p-3 rounded-full shadow-lg border-2 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          style={{ backgroundColor: colors.white, borderColor: colors.strong, color: colors.strong }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalSlides || 1 }).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            animate={{ scale: index === currentSlide ? 1.25 : 1 }}
            className="w-3 h-3 rounded-full transition-colors duration-300"
            style={{ backgroundColor: index === currentSlide ? colors.strong : colors.gray }}
          />
        ))}
      </div>
    </section>
  );
}
