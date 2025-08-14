"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
const testimonials = [
  {
    name: "María González",
    location: "Las Condes, Santiago",
    rating: 5,
    text: "Excelente servicio. Detectaron la fuga en mi casa sin romper nada y la repararon el mismo día. Muy profesionales y puntuales.",
    service: "Detección de fuga en jardín",
  },
  {
    name: "Carlos Rodríguez",
    location: "Viña del Mar, V Región",
    rating: 5,
    text: "Tuve una emergencia un domingo y vinieron inmediatamente. Solucionaron el problema rápidamente y a un precio justo. Los recomiendo 100%.",
    service: "Servicio de emergencia",
  },
  {
    name: "Ana Martínez",
    location: "Rancagua, VI Región",
    rating: 5,
    text: "Llevaba meses con una fuga que nadie podía encontrar. SIGAS la detectó en 2 horas con su equipo especializado. Increíble tecnología.",
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
    text: "Contraté el servicio de mantención preventiva y desde entonces no he tenido problemas. Vale la pena la inversión.",
    service: "Mantención preventiva",
  },
  {
    name: "Javier Vargas",
    location: "La Serena, IV Región",
    rating: 5,
    text: "El equipo de SIGAS me brindó un diagnóstico claro y preciso. Muy transparentes con los costos y el tiempo de trabajo. Quedé muy satisfecho.",
    service: "Revisión de alcantarillado",
  },
];

export default function Testimonials() {
  const cardsPerPage = 3;
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = Math.ceil(testimonials.length / cardsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section id="testimonios" className="py-20 bg-gray-100 relative">
      <div className="relative max-w-7xl mx-auto px-4 md:px-12">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: colors.dark }}>
            Testimonios de Clientes Satisfechos
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
            {testimonials.map((testimonial, index) => {
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
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-6 w-6 fill-current" style={{ color: colors.highlight }} />
                          ))}
                        </div>
                        <blockquote className="text-lg font-light italic leading-relaxed mb-6" style={{ color: colors.gray }}>
                          "{testimonial.text}"
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
        {Array.from({ length: totalSlides }).map((_, index) => (
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
