"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Paleta de colores para un uso más limpio en Tailwind CSS
const colors = {
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  soft: "#5692C8",
  light: "#9ABCE1",
  extraLight: "#C4E9F9",
  highlight: "#F46015",
  white: "#FFFFFF",
};

const faqs = [
  {
    question: "¿Cómo saber si tengo una fuga si no hay señales visibles?",
    answer:
      "Las fugas ocultas pueden identificarse por aumentos inusuales en la cuenta del agua, baja presión o sonidos constantes en las tuberías. Contamos con equipos que detectan fugas sin necesidad de romper superficies.",
  },
  {
    question: "¿Qué tecnología utilizan para garantizar una detección precisa?",
    answer:
      "Usamos herramientas de ultrasonido, termografía infrarroja y correladores electrónicos, que localizan con precisión milimétrica las fugas sin intervención destructiva.",
  },
  {
    question: "¿Ofrecen informes técnicos después de la detección?",
    answer:
      "Sí. Entregamos un informe detallado con evidencias fotográficas, ubicación exacta del problema y recomendaciones técnicas para su solución.",
  },
  {
    question: "¿Qué hago si tengo una fuga pero aún no sé dónde?",
    answer:
      "No te preocupes. Nuestra visita incluye diagnóstico profesional. Evaluamos el sistema completo hasta encontrar el origen exacto sin daños innecesarios.",
  },
  {
    question: "¿Cuánto cuesta el servicio de detección de fugas?",
    answer:
      "El costo varía según el tipo de inmueble y dificultad del acceso. Sin embargo, el diagnóstico inicial y el presupuesto son completamente gratuitos y sin compromiso.",
  },
  {
    question: "¿La detección de fugas incluye la reparación del daño?",
    answer:
      "Sí. Una vez identificada la fuga, ofrecemos un servicio integral que incluye reparación, materiales y restauración de lo intervenido si así lo deseas.",
  },
  {
    question: "¿Cuánto demora la reparación una vez encontrada la fuga?",
    answer:
      "En la mayoría de los casos, la reparación puede realizarse el mismo día. Si se requieren materiales especiales, agendamos en las siguientes 24 a 48 horas.",
  },
  {
    question: "¿Pueden ayudar en casos de filtraciones en piscinas o calefacción?",
    answer:
      "Absolutamente. Detectamos pérdidas en piscinas, sistemas de calefacción por radiadores o loza radiante, y filtraciones en redes de riego o alcantarillado.",
  },
];

const backgroundShapes = [
  { color: colors.light, size: 24, top: "10%", left: "5%", rotate: 45 },
  { color: colors.soft, size: 32, top: "25%", right: "15%", rotate: 45 },
  { color: colors.extraLight, size: 28, bottom: "20%", left: "20%", rotate: 45 },
  { color: colors.light, size: 36, bottom: "5%", right: "50%", rotate: 45 },
  { color: colors.soft, size: 24, top: "40%", left: "40%", rotate: 45 },
  { color: colors.extraLight, size: 30, top: "60%", right: "30%", rotate: 45 },
  { color: colors.light, size: 28, top: "50%", left: "15%", rotate: 45 },
  { color: colors.soft, size: 20, bottom: "5%", left: "60%", rotate: 45 },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [index]
    );
  };

  return (
    <section id="faq" className="relative py-20 overflow-hidden" style={{ backgroundColor: colors.white }}>
      {/* Fondo con un patrón geométrico de "galería" */}
      <div className="absolute top-0 left-0 w-full h-full opacity-60">
        {backgroundShapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              backgroundColor: shape.color,
              top: shape.top,
              left: shape.left,
              right: shape.right,
              bottom: shape.bottom,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotate: shape.rotate }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
      
      <div className="relative container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
            style={{ color: colors.dark }}
          >
            Preguntas Frecuentes
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto leading-relaxed font-medium"
            style={{ color: colors.medium }}
          >
            Resolvemos las dudas más comunes sobre nuestros servicios de detección y reparación de fugas de agua.
          </p>
        </div>

        <div className="border-t" style={{ borderColor: colors.soft }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="py-4 cursor-pointer transition-all duration-300 border-b"
              style={{ borderColor: colors.soft }}
              onClick={() => toggleItem(index)}
              initial={false}
            >
              <div className="flex items-center justify-between gap-4">
                <h3
                  className="text-lg font-bold flex-grow leading-relaxed"
                  style={{ color: openItems.includes(index) ? colors.strong : colors.dark }}
                >
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown
                    className="h-6 w-6 flex-shrink-0"
                    style={{ color: openItems.includes(index) ? colors.highlight : colors.strong }}
                  />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, paddingTop: 0 }}
                    animate={{ opacity: 1, height: "auto", paddingTop: "1rem" }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-base leading-relaxed" style={{ color: colors.medium }}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}