"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ZoomIn, X } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onClick?: () => void;
  showZoom?: boolean;
  showModal?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  quality = 90,
  sizes,
  onClick,
  showZoom = false,
  showModal = false,
  placeholder = "blur",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Preload de imagen para mejor calidad
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const img = new window.Image();
    img.onload = () => {
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  const handleImageClick = () => {
    if (showModal) {
      setIsModalOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  return (
    <>
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        
        {imageError ? (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
            <span className="text-sm">Error al cargar imagen</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              fill={fill}
              className={`transition-all duration-300 ${onClick || showModal ? 'cursor-pointer' : ''} ${
                showZoom ? 'hover:scale-105' : ''
              }`}
              priority={priority}
              quality={quality}
              sizes={sizes}
              onClick={handleImageClick}
              placeholder={placeholder}
              blurDataURL={blurDataURL || defaultBlurDataURL}
            />
            
            {showZoom && (onClick || showModal) && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <ZoomIn className="h-8 w-8 text-white" />
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal para vista ampliada */}
      <AnimatePresence>
        {isModalOpen && showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  quality={100}
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
