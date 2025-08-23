"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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

// Array de imágenes optimizadas
const galleryItems = [
  { 
    src: "/evidencia1.webp",
    alt: "Evidencia de trabajo 1 - Detección de fugas",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  },
  { 
    src: "/evidencia3.webp",
    alt: "Evidencia de trabajo 3 - Reparación de tuberías",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  },
  { 
    src: "/evidencia4.webp",
    alt: "Evidencia de trabajo 4 - Videoinspección",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  },
  { 
    src: "/evidencia5.webp",
    alt: "Evidencia de trabajo 5 - Servicios profesionales",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [modalLoading, setModalLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Preload agresivo de imágenes para carga inicial rápida
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload inmediato de todas las imágenes
      galleryItems.forEach((item, index) => {
        // Crear múltiples instancias para asegurar carga
        const img1 = new window.Image();
        const img2 = new window.Image();
        
        img1.onload = () => {
          setImagesLoaded(prev => {
            const newSet = new Set(prev).add(item.src);
            // Si todas las imágenes están cargadas, ocultar loading inicial
            if (newSet.size === galleryItems.length) {
              setTimeout(() => setInitialLoading(false), 200);
            }
            return newSet;
          });
        };
        
        // Cargar con prioridad alta
        img1.src = item.src;
        img2.src = item.src;
        
        // Forzar carga con fetch
        fetch(item.src, { 
          method: 'GET',
          cache: 'force-cache'
        }).catch(() => {
          // Fallback si fetch falla
          console.warn(`Failed to preload: ${item.src}`);
        });
      });
    }
  }, []);

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

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

  const imagesToDisplay = [
    galleryItems[(activeIndex - 1 + galleryItems.length) % galleryItems.length],
    galleryItems[activeIndex],
    galleryItems[(activeIndex + 1) % galleryItems.length],
  ];

  return (
    <section
      id="gallery"
      className="section-full-height w-full py-16 md:py-32 px-4 md:px-6 relative overflow-hidden touch-optimized"
      style={{ backgroundColor: colors.white }}
    >
      {/* Loading inicial */}
      {initialLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando galería...</p>
            <p className="text-sm text-gray-500 mt-2">
              {imagesLoaded.size} de {galleryItems.length} imágenes cargadas
            </p>
          </div>
        </div>
      )}
      {/* Fondos decorativos - reducidos en móvil */}
      <div className="absolute inset-0 opacity-20 md:opacity-30">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px]" style={{ backgroundColor: colors.strong, clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }} />
        <div className="absolute bottom-20 left-0 w-24 h-24 md:w-48 md:h-48 -translate-x-1/2 rotate-45" style={{ backgroundColor: colors.medium }} />
        <div className="absolute top-40 left-10 w-16 h-1 md:w-32 md:h-1" style={{ backgroundColor: colors.soft }} />
        <div className="absolute bottom-10 right-10 w-10 h-10 md:w-20 md:h-20 -rotate-45" style={{ backgroundColor: colors.highlight }} />
      </div>

      <div className="relative z-10 text-center container mx-auto">
        <div className="mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: colors.dark }}>
            Galería
          </h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-medium px-4" style={{ color: colors.medium }}>
            Estas imágenes representan nuestro trabajo a lo largo de los años, mostrando proyectos realizados en distintas localidades con profesionales expertos y tecnología de vanguardia, garantizando soluciones eficientes y de calidad.
          </p>
        </div>

        {/* Galería principal - optimizada para móvil */}
        <div className="flex justify-center items-center gap-2 md:gap-4 lg:gap-8 xl:gap-12 w-full px-2 md:px-4 relative">
          {/* Flechas - más pequeñas en móvil */}
          <motion.button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 lg:p-3 rounded-full hover:scale-110 transition-all touch-optimized"
            style={{ backgroundColor: `${colors.dark}B3`, color: colors.white }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={isMobile ? 20 : 24} />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 lg:p-3 rounded-full hover:scale-110 transition-all touch-optimized"
            style={{ backgroundColor: `${colors.dark}B3`, color: colors.white }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight size={isMobile ? 20 : 24} />
          </motion.button>

          {/* Imágenes de la galería - optimizadas para móvil */}
          {imagesToDisplay.map((item, index) => (
            <motion.div
              key={`${item.src}-${index}`}
              className={`relative group cursor-pointer overflow-hidden rounded-xl md:rounded-[1.5rem] shadow-lg md:shadow-xl mobile-image-optimized
              ${index === 1 
                ? 'w-full md:w-[55%] lg:w-[45%] shadow-xl md:shadow-2xl aspect-[4/5] md:aspect-[9/10] transition-all duration-300 md:duration-500 ease-in-out' 
                : 'w-[15%] md:w-[20%] lg:w-[25%] xl:w-[30%] opacity-30 md:opacity-50 hidden md:block aspect-[3/4] transition-all duration-300 md:duration-500 ease-in-out'
              }
              `}
              onClick={() => {
                if (index === 1) {
                  setModalLoading(true);
                  setSelectedImage(item.src);
                  // La imagen ya está pre-cargada, así que el loading será muy rápido
                  setTimeout(() => setModalLoading(false), 100);
                } else if (index === 0) {
                  handlePrev();
                } else {
                  handleNext();
                }
              }}
              whileHover={{ scale: index === 1 ? 1.01 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-300 md:duration-500 group-hover:scale-105"
                sizes={item.sizes}
                priority={index === 1}
                quality={isMobile ? 50 : 65}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                loading="eager"
                fetchPriority={index === 1 ? "high" : "auto"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-200 md:duration-300 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 md:p-6">
                <motion.div 
                  initial={{ y: 10, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ duration: 0.3 }} 
                  className="flex flex-col gap-1 md:gap-2"
                >
                  <div className="flex items-center gap-1 md:gap-2 text-white font-semibold text-sm md:text-base" style={{ color: colors.highlight }}>
                    <ZoomIn size={isMobile ? 14 : 18} /> Ver más
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Indicadores de navegación */}
        <div className="flex justify-center mt-6 md:mt-8 space-x-2 md:space-x-3">
          {galleryItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                i === activeIndex 
                  ? 'bg-blue-600 scale-110 md:scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal optimizado para móvil */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full h-full max-w-4xl md:max-w-6xl max-h-[95vh] md:max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-2 right-2 md:top-4 md:right-4 z-50 p-2 md:p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                onClick={() => setSelectedImage(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </motion.button>
              
              <div className="relative w-full h-full overflow-hidden rounded-lg md:rounded-3xl shadow-2xl bg-black">
                {modalLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
                <Image
                  src={selectedImage}
                  alt="Imagen en vista ampliada"
                  fill
                  className="object-contain"
                  quality={90}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXwGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}