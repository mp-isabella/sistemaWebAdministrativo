"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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

  // Sin preload para máxima velocidad

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth !== undefined) {
      const checkMobile = () => {
        try {
          setIsMobile(window.innerWidth <= 768);
        } catch (error) {
          setIsMobile(false);
        }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
    return undefined;
  }, []);

  // Efecto para manejar el scroll cuando el modal está abierto
  useEffect(() => {
    if (selectedImage) {
      // Prevenir scroll cuando el modal está abierto
      document.body.style.overflow = 'hidden';

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
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

  // Función optimizada para abrir modal
  const handleOpenModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  // Navegación en modal para móviles
  const handleModalNext = () => {
    const currentIndex = galleryItems.findIndex(item => item.src === selectedImage);
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    const nextItem = galleryItems[nextIndex];
    if (nextItem) {
      setSelectedImage(nextItem.src);
    }
  };

  const handleModalPrev = () => {
    const currentIndex = galleryItems.findIndex(item => item.src === selectedImage);
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    const prevItem = galleryItems[prevIndex];
    if (prevItem) {
      setSelectedImage(prevItem.src);
    }
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
      className="section-full-height w-full py-12 md:py-20 px-4 md:px-6 relative overflow-hidden touch-optimized"
      style={{ backgroundColor: colors.white, maxWidth: '100vw', overflowX: 'hidden' }}
    >
      {/* Fondos decorativos - reducidos en móvil */}
      <div className="absolute inset-0 opacity-20 md:opacity-30">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px]" style={{ backgroundColor: colors.strong, clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }} />
        <div className="absolute bottom-20 left-0 w-24 h-24 md:w-48 md:h-48 -translate-x-1/2 rotate-45" style={{ backgroundColor: colors.medium }} />
        <div className="absolute top-40 left-10 w-16 h-1 md:w-32 md:h-1" style={{ backgroundColor: colors.soft }} />
        <div className="absolute bottom-10 right-10 w-10 h-10 md:w-20 md:h-20 -rotate-45" style={{ backgroundColor: colors.highlight }} />
      </div>

      <div className="relative z-10 text-center container mx-auto">
        <div className="mb-8 md:mb-16">
          <h2 id="gallery-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: colors.dark }}>
            Galería
          </h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-medium px-4" style={{ color: colors.medium }}>
            Estas imágenes representan nuestro trabajo a lo largo de los años, mostrando proyectos realizados en distintas localidades con profesionales expertos y tecnología de vanguardia, garantizando soluciones eficientes y de calidad.
          </p>
        </div>

        {/* Galería principal - optimizada para móvil */}
        <div className="flex justify-center items-center gap-2 md:gap-4 lg:gap-8 xl:gap-12 w-full px-2 md:px-4 relative" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
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
          {imagesToDisplay.map((item, index) => {
            if (!item) return null;
            return (
              <motion.div
                key={`${item.src}-${index}`}
                className={`relative group cursor-pointer overflow-hidden rounded-xl md:rounded-[1.5rem] shadow-lg md:shadow-xl mobile-image-optimized
                ${index === 1
                    ? 'w-full md:w-[55%] lg:w-[45%] shadow-xl md:shadow-2xl aspect-[4/3] md:aspect-[3/2]'
                    : 'w-[15%] md:w-[20%] lg:w-[25%] xl:w-[30%] opacity-30 md:opacity-50 hidden md:block aspect-[4/3]'
                  }
                `}
                onClick={() => {
                  // En móvil, siempre abrir modal directamente
                  if (isMobile) {
                    handleOpenModal(item.src);
                  } else {
                    if (index === 1) {
                      handleOpenModal(item.src);
                    } else if (index === 0) {
                      handlePrev();
                    } else {
                      handleNext();
                    }
                  }
                }}
                whileHover={{
                  scale: index === 1 ? 1.02 : 1.03,
                  transition: { duration: 0.2 }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                  priority={index === 1}
                  onLoad={() => {
                  }}
                  onError={() => {
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <ZoomIn size={16} />
                    Ver más
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Indicadores de navegación */}
        <div className="flex justify-center mt-6 md:mt-8 space-x-2 md:space-x-3">
          {galleryItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${i === activeIndex
                ? 'bg-blue-600 scale-110 md:scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
                }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal optimizado para móviles */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center gallery-modal"
          onClick={() => setSelectedImage(null)}
        >
          <div className={`relative w-full h-full flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
            {/* Botón de cerrar */}
            <button
              className={`absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black font-bold shadow-lg z-20 transition-all ${isMobile ? 'w-10 h-10' : 'w-12 h-12'
                }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={isMobile ? 18 : 20} />
            </button>

            {/* Imagen principal */}
            <div className={`relative ${isMobile ? 'w-full h-full' : 'max-w-4xl max-h-[90vh]'} flex items-center justify-center`}>
              <Image
                src={selectedImage}
                alt="Imagen ampliada"
                width={800}
                height={600}
                className={`${isMobile ? 'w-full h-full object-contain' : 'w-full h-full object-contain'} transition-opacity duration-200`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: isMobile ? '100%' : '90vw',
                  maxHeight: isMobile ? '100%' : '90vh'
                }}
              />

              {/* Botones de navegación para móviles */}
              {isMobile && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black shadow-lg z-20 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModalPrev();
                    }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black shadow-lg z-20 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModalNext();
                    }}
                  >
                    <ArrowRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}