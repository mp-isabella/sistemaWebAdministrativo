#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración de optimización
const config = {
  inputDir: './public',
  outputDir: './public/optimized',
  quality: 85,
  formats: ['webp', 'avif'],
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
    xlarge: 1920
  }
};

// Función para crear directorio si no existe
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Función para obtener todas las imágenes
function getImageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath));
    } else if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Función para optimizar imagen con sharp
function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const sharp = require('sharp');
    
    return sharp(inputPath)
      .resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: options.quality || config.quality })
      .toFile(outputPath);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

// Función para generar diferentes tamaños
function generateSizes(inputPath, outputDir, filename) {
  const results = [];
  
  for (const [sizeName, size] of Object.entries(config.sizes)) {
    const outputPath = path.join(outputDir, `${filename}-${sizeName}.webp`);
    
    const result = optimizeImage(inputPath, outputPath, {
      width: size,
      height: size,
      quality: config.quality
    });
    
    if (result) {
      results.push({
        size: sizeName,
        path: outputPath,
        width: size
      });
    }
  }
  
  return results;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando optimización de imágenes...');
  
  // Verificar si sharp está instalado
  try {
    require('sharp');
  } catch (error) {
    console.error('❌ Sharp no está instalado. Instalando...');
    try {
      execSync('npm install sharp', { stdio: 'inherit' });
    } catch (installError) {
      console.error('❌ Error instalando sharp:', installError.message);
      process.exit(1);
    }
  }
  
  // Crear directorio de salida
  ensureDir(config.outputDir);
  
  // Obtener todas las imágenes
  const imageFiles = getImageFiles(config.inputDir);
  console.log(`📁 Encontradas ${imageFiles.length} imágenes para optimizar`);
  
  let processed = 0;
  let errors = 0;
  
  for (const imagePath of imageFiles) {
    try {
      const relativePath = path.relative(config.inputDir, imagePath);
      const filename = path.basename(imagePath, path.extname(imagePath));
      const outputSubDir = path.dirname(relativePath);
      const fullOutputDir = path.join(config.outputDir, outputSubDir);
      
      // Crear subdirectorio si no existe
      ensureDir(fullOutputDir);
      
      console.log(`🔄 Procesando: ${relativePath}`);
      
      // Generar diferentes tamaños
      const results = generateSizes(imagePath, fullOutputDir, filename);
      
      if (results.length > 0) {
        processed++;
        console.log(`✅ Optimizada: ${relativePath} (${results.length} tamaños)`);
      } else {
        errors++;
        console.log(`❌ Error: ${relativePath}`);
      }
      
    } catch (error) {
      errors++;
      console.error(`❌ Error procesando ${imagePath}:`, error.message);
    }
  }
  
  console.log('\n📊 Resumen:');
  console.log(`✅ Procesadas: ${processed}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📁 Directorio de salida: ${config.outputDir}`);
  
  if (errors === 0) {
    console.log('\n🎉 ¡Optimización completada exitosamente!');
  } else {
    console.log('\n⚠️  Optimización completada con errores');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage, generateSizes, config };
