"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [modalKey, setModalKey] = useState(0); // Key para forzar re-render
  const [imageReady, setImageReady] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Preload optimizado de imágenes para carga inicial rápida
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload optimizado - más agresivo en móvil
      galleryItems.forEach((item, index) => {
        const img = new window.Image();
        
        img.onload = () => {
          setImagesLoaded(prev => {
            const newSet = new Set(prev).add(item.src);
            // Ocultar loading inicial más rápido en móvil
            if (newSet.size === galleryItems.length) {
              const hideTime = isMobile ? 100 : 200;
              setTimeout(() => setInitialLoading(false), hideTime);
            }
            return newSet;
          });
        };
        
        // Cargar con prioridad alta
        img.src = item.src;
        
        // Preload adicional solo si no es móvil para ahorrar datos
        if (!isMobile) {
          fetch(item.src, { 
            method: 'GET',
            cache: 'force-cache'
          }).catch(() => {
            // Fallback silencioso
          });
        }
      });
    }
  }, [isMobile]);

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
  
  // Efecto para manejar el scroll cuando el modal está abierto
  useEffect(() => {
    if (selectedImage) {
      // Prevenir scroll cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
      
      // Agregar listener para tecla Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
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
  }, [selectedImage, scrollPosition]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

  // Función optimizada para abrir modal
  const handleOpenModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setImageReady(false);
  };

  // Función simple para cerrar modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

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
                ? 'w-full md:w-[55%] lg:w-[45%] shadow-xl md:shadow-2xl aspect-[4/5] md:aspect-[9/10]' 
                : 'w-[15%] md:w-[20%] lg:w-[25%] xl:w-[30%] opacity-30 md:opacity-50 hidden md:block aspect-[3/4]'
              }
              `}
              onClick={() => {
                if (index === 1) {
                  handleOpenModal(item.src);
                } else if (index === 0) {
                  handlePrev();
                } else {
                  handleNext();
                }
              }}
              whileHover={{ 
                scale: index === 1 ? 1.03 : 1.05,
                y: index === 1 ? -8 : -5,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ 
                scale: index === 1 ? 0.97 : 0.95,
                y: index === 1 ? -2 : 0,
                transition: { duration: 0.1, ease: "easeIn" }
              }}
              transition={{ 
                duration: isMobile ? 0.2 : 0.4, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-all duration-500 ease-out group-hover:scale-110 pointer-events-none"
                sizes={item.sizes}
                priority={index === 1}
                quality={isMobile ? 85 : 95}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                loading="eager"
                fetchPriority={index === 1 ? "high" : "auto"}
                style={{
                  filter: "brightness(1.05) contrast(1.1) saturate(1.1)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 md:p-6">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut",
                    delay: 0.1
                  }} 
                  className="flex flex-col gap-1 md:gap-2"
                >
                  <div className="flex items-center gap-1 md:gap-2 text-white font-semibold text-sm md:text-base" style={{ color: colors.highlight }}>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ZoomIn size={isMobile ? 14 : 18} />
                    </motion.div>
                    Ver más
                  </div>
                </motion.div>
              </div>
              
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
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

      {/* Modal ultra simple */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[80vh]">
            {imageReady && (
              <button
                className="absolute top-4 right-4 w-12 h-12 md:w-14 md:h-14 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-black font-bold text-2xl md:text-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-10"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            )}
            
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onLoad={() => setImageReady(true)}
              style={{
                filter: "brightness(1.05) contrast(1.1) saturate(1.1)",
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}