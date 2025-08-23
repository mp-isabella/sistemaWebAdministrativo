"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Paleta de colores
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

// Preguntas frecuentes
const faqs = [
  {
    question: "¿Cómo saber si tengo una fuga de agua en mi casa?",
    answer:
      "Algunas señales comunes son:\n• Aumento inesperado en la cuenta del agua.\n• Humedad o manchas en muros, techos o pisos.\n• Ruidos de agua corriendo cuando todas las llaves están cerradas.\n• Disminución en la presión del agua.",
  },
  {
    question: "¿Qué debo hacer si sospecho que tengo una fuga?",
    answer:
      "Primero, cierre la llave de paso para evitar mayores pérdidas y contacte a un especialista en detección de fugas para confirmar y reparar el problema.",
  },
  {
    question: "¿Qué pasa si no reparo una fuga de agua?",
    answer:
      "Una fuga no atendida puede provocar:\n• Aumento considerable en la cuenta de agua.\n• Daños estructurales en la vivienda (humedad, hongos, corrosión).\n• Riesgo eléctrico por filtraciones de agua.",
  },
  {
    question: "¿Cómo se detectan las fugas de agua ocultas?",
    answer:
      "Existen diferentes métodos según el tipo de instalación:\n• Equipos de escucha acústica.\n• Gas trazador.\n• Cámaras termográficas.\n• Videoinspección de tuberías.",
  },
  {
    question: "¿Las fugas de agua siempre requieren romper muros o pisos?",
    answer:
      "No siempre. Hoy existen tecnologías de detección no invasivas que permiten ubicar con precisión la fuga y minimizar roturas innecesarias.",
  },
  {
    question: "¿Cuál es la diferencia entre una fuga visible y una oculta?",
    answer:
      "Visible: cuando el agua se aprecia a simple vista (ej. llave, WC, cañería expuesta).\nOculta: está dentro de muros, pisos o subterráneos, y requiere equipos especializados para su detección.",
  },
  {
    question: "¿Puedo detectar una fuga yo mismo?",
    answer:
      "Puedes hacer pruebas simples como cerrar todas las llaves y revisar si el medidor sigue marcando consumo. Sin embargo, para fugas ocultas se recomienda la inspección profesional.",
  },
  {
    question: "¿Una fuga pequeña es realmente peligrosa?",
    answer:
      "Sí. Incluso una fuga del tamaño de una gota puede desperdiciar cientos de litros de agua al mes y causar daños en la infraestructura de tu hogar.",
  },
];

// Formas de fondo
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
      prev.includes(index) ? prev.filter((item) => item !== index) : [index]
    );
  };

  return (
    <section
      id="faq"
      className="section-full-height relative py-24 overflow-hidden"
      style={{ backgroundColor: colors.white }}
    >
      {/* Fondo geométrico */}
      <div className="absolute top-0 left-0 w-full h-full opacity-60 pointer-events-none">
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
            Preguntas frecuentes sobre fugas de agua
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
                    <div className="text-base leading-relaxed" style={{ color: colors.medium }}>
                      {faq.answer.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
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
