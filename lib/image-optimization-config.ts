export const IMAGE_OPTIMIZATION_CONFIG = {
  // Calidad por defecto
  DEFAULT_QUALITY: 85,

  // Formatos soportados
  FORMATS: {
    WEBP: 'webp',
    AVIF: 'avif',
    JPEG: 'jpeg',
    PNG: 'png'
  },

  // Tamaños de imagen
  SIZES: {
    THUMBNAIL: 150,
    SMALL: 300,
    MEDIUM: 600,
    LARGE: 1200,
    XLARGE: 1920
  },

  // Breakpoints responsivos
  BREAKPOINTS: [640, 768, 1024, 1280, 1920],

  // Configuración de lazy loading
  LAZY_LOADING: {
    ROOT_MARGIN: '50px',
    THRESHOLD: 0.1
  },

  // Configuración de preload
  PRELOAD: {
    ENABLED: true,
    PRIORITY_IMAGES: ['hero', 'logo', 'banner']
  },

  // Configuración de cache
  CACHE: {
    TTL: 2592000, // 30 días
    STALE_WHILE_REVALIDATE: 86400 // 1 día
  }
};

export const generateImageSrc = (baseSrc: string, options: {
  format?: string;
  width?: number;
  quality?: number;
}) => {
  const { format = 'webp', width, quality: _quality = IMAGE_OPTIMIZATION_CONFIG.DEFAULT_QUALITY } = options;

  // Si es una URL externa, devolver tal como está
  if (baseSrc.startsWith('http')) {
    return baseSrc;
  }

  // Para imágenes locales, generar URL optimizada
  const baseName = baseSrc.replace(/\.(webp|jpg|jpeg|png|JPG|JPEG|PNG)$/i, '');
  const extension = format === 'webp' ? 'webp' : 'jpg';

  if (width) {
    return `${baseName}-${width}w.${extension}`;
  }

  return `${baseName}.${extension}`;
};
