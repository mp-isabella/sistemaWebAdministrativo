"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ZoomIn, ArrowLeft, ArrowRight } from "lucide-react";
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

// Array de imágenes y descripciones
const galleryItems = [
  { src: "/evidencia1.webp", description: "Inspección de tuberías con cámara de alta definición." },
  { src: "/evidencia2.webp", description: "Reparación de filtración en tubería de agua potable." },
  { src: "/evidencia3.webp", description: "Pruebas de presión para detectar fugas ocultas." },
  { src: "/evidencia4.webp", description: "Destape de alcantarillado con equipo de alta presión." },
  { src: "/evidencia5.webp", description: "Localización de fuga subterránea con geófono." },
  { src: "/evidencia6.webp", description: "Reparación de red de saneamiento en exterior." },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

  const currentItem = galleryItems[activeIndex];
  const prevItem = galleryItems[(activeIndex - 1 + galleryItems.length) % galleryItems.length];
  const nextItem = galleryItems[(activeIndex + 1) % galleryItems.length];

  return (
    <section
      id="galeria"
      className="w-full py-12 px-6 relative overflow-hidden"
      style={{ backgroundColor: colors.white }}
    >
      {/* Fondos decorativos */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 right-0 w-[400px] h-[400px]" style={{ backgroundColor: colors.strong, clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }} />
        <div className="absolute bottom-20 left-0 w-48 h-48 -translate-x-1/2 rotate-45" style={{ backgroundColor: colors.medium }} />
        <div className="absolute top-40 left-10 w-32 h-1" style={{ backgroundColor: colors.soft }} />
        <div className="absolute bottom-10 right-10 w-20 h-20 -rotate-45" style={{ backgroundColor: colors.highlight }} />
      </div>

      <div className="relative z-10 text-center container mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: colors.dark }}>
            Nuestra Galería de Trabajos
          </h2>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed font-medium" style={{ color: colors.medium }}>
            Tecnología de punta y experiencia profesional en cada intervención.
          </p>
        </div>

        {/* Galería principal */}
        <div className="flex justify-center items-center gap-4 md:gap-8 lg:gap-12 w-full px-4 relative">
          {/* Flechas */}
          <motion.button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full hover:scale-110 transition-all"
            style={{ backgroundColor: `${colors.dark}B3`, color: colors.white }}
          >
            <ArrowLeft size={24} />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full hover:scale-110 transition-all"
            style={{ backgroundColor: `${colors.dark}B3`, color: colors.white }}
          >
            <ArrowRight size={24} />
          </motion.button>

          {/* Miniatura izquierda */}
          <motion.div
            key={prevItem.src}
            className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-xl w-[20%] md:w-[25%] lg:w-[30%] aspect-[4/5] opacity-50 hover:opacity-100 transition-opacity duration-300 hidden md:block"
            onClick={handlePrev}
          >
            <Image src={prevItem.src} alt={prevItem.description} fill className="object-cover" />
          </motion.div>

          {/* Imagen central */}
          <motion.div
            key={currentItem.src}
            className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl w-full md:w-[55%] lg:w-[45%] aspect-square"
            onClick={() => setSelectedImage(currentItem.src)}
          >
            <Image src={currentItem.src} alt={currentItem.description} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2">
                <h3 className="text-white text-xl font-bold">Proyecto {String(activeIndex + 1).padStart(2, "0")}</h3>
                <p className="text-sm font-light" style={{ color: colors.light }}>{currentItem.description}</p>
                <div className="flex items-center gap-2 text-white font-semibold mt-2" style={{ color: colors.highlight }}>
                  <ZoomIn size={18} /> Ver más
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Miniatura derecha */}
          <motion.div
            key={nextItem.src}
            className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-xl w-[20%] md:w-[25%] lg:w-[30%] aspect-[4/5] opacity-50 hover:opacity-100 transition-opacity duration-300 hidden md:block"
            onClick={handleNext}
          >
            <Image src={nextItem.src} alt={nextItem.description} fill className="object-cover" />
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-50 p-3 rounded-full transition-all hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${colors.light}20, ${colors.soft}20)`, border: `1px solid ${colors.light}30` }}
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={selectedImage}
                  alt="Imagen en vista ampliada"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
