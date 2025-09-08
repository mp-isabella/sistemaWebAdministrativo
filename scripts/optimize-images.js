#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  // Calidad para WebP
  webp: {
    quality: 85,
    effort: 6
  },
  // Calidad para JPEG
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  // Calidad para PNG
  png: {
    quality: 85,
    speed: 4
  },
  // Tamaños máximos
  maxWidth: 1920,
  maxHeight: 1080
};

// Directorios a procesar
const DIRECTORIES = [
  'public',
  'public/logos',
  'public/icons'
];

// Extensiones de imagen soportadas
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

// Función para optimizar una imagen individual
async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    
    console.log(`🔄 Optimizando: ${filePath}`);
    
    // Leer la imagen
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Redimensionar si es muy grande
    let processedImage = image;
    if (metadata.width > OPTIMIZATION_CONFIG.maxWidth || metadata.height > OPTIMIZATION_CONFIG.maxHeight) {
      processedImage = image.resize(OPTIMIZATION_CONFIG.maxWidth, OPTIMIZATION_CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`  📏 Redimensionando de ${metadata.width}x${metadata.height} a máximo ${OPTIMIZATION_CONFIG.maxWidth}x${OPTIMIZATION_CONFIG.maxHeight}`);
    }
    
    // Crear versiones optimizadas
    const outputs = [];
    
    // WebP (formato principal)
    const webpPath = path.join(dir, `${fileName}.webp`);
    await processedImage
      .webp(OPTIMIZATION_CONFIG.webp)
      .toFile(webpPath);
    outputs.push(webpPath);
    
    // JPEG optimizado (fallback)
    if (['.jpg', '.jpeg', '.JPG', '.JPEG'].includes(ext)) {
      const jpegPath = path.join(dir, `${fileName}-optimized.jpg`);
      await processedImage
        .jpeg(OPTIMIZATION_CONFIG.jpeg)
        .toFile(jpegPath);
      outputs.push(jpegPath);
    }
    
    // PNG optimizado (fallback)
    if (ext === '.png' || ext === '.PNG') {
      const pngPath = path.join(dir, `${fileName}-optimized.png`);
      await processedImage
        .png(OPTIMIZATION_CONFIG.png)
        .toFile(pngPath);
      outputs.push(pngPath);
    }
    
    // Obtener tamaños de archivo
    const originalSize = fs.statSync(filePath).size;
    const optimizedSizes = await Promise.all(
      outputs.map(async (output) => {
        const stats = fs.statSync(output);
        return { path: output, size: stats.size };
      })
    );
    
    // Mostrar resultados
    const bestOptimized = optimizedSizes.reduce((min, current) => 
      current.size < min.size ? current : min
    );
    
    const savings = ((originalSize - bestOptimized.size) / originalSize * 100).toFixed(1);
    console.log(`  ✅ Optimizado: ${bestOptimized.path}`);
    console.log(`  📊 Tamaño: ${(originalSize / 1024).toFixed(1)}KB → ${(bestOptimized.size / 1024).toFixed(1)}KB (${savings}% reducción)`);
    
    return { original: filePath, optimized: bestOptimized.path, savings };
    
  } catch (error) {
    console.error(`❌ Error optimizando ${filePath}:`, error.message);
    return null;
  }
}

// Función para procesar un directorio
async function processDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Procesar subdirectorios recursivamente
        await processDirectory(filePath);
      } else if (stat.isFile()) {
        // Verificar si es una imagen
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          await optimizeImage(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando directorio ${dirPath}:`, error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  
  const startTime = Date.now();
  let totalImages = 0;
  let successfulOptimizations = 0;
  let totalSavings = 0;
  
  // Procesar cada directorio
  for (const dir of DIRECTORIES) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Procesando directorio: ${dir}`);
      await processDirectory(dir);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  console.log(`\n🎉 Optimización completada en ${duration}s`);
  console.log(`📊 Total de imágenes procesadas: ${totalImages}`);
  console.log(`✅ Optimizaciones exitosas: ${successfulOptimizations}`);
  console.log(`💰 Ahorro total estimado: ${(totalSavings / 1024).toFixed(1)}KB`);
  
  console.log('\n💡 Recomendaciones:');
  console.log('  • Usa archivos .webp como formato principal');
  console.log('  • Mantén archivos .jpg/.png como fallback');
  console.log('  • Actualiza los componentes para usar las imágenes optimizadas');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage, processDirectory };
