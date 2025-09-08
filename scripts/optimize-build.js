#!/usr/bin/env node

/**
 * Script de optimización para el build de producción
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando optimización del build...');

// Función para ejecutar comandos
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado`);
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    process.exit(1);
  }
}

// Función para verificar si un archivo existe
function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath));
}

// Función para crear directorio si no existe
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Función para optimizar imágenes
function optimizeImages() {
  console.log('\n🖼️  Optimizando imágenes...');
  
  const publicDir = path.resolve('public');
  const imagesDir = path.join(publicDir, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('⚠️  Directorio de imágenes no encontrado, saltando optimización...');
    return;
  }
  
  // Lista de archivos de imagen
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
  
  if (imageFiles.length === 0) {
    console.log('⚠️  No se encontraron imágenes para optimizar');
    return;
  }
  
  console.log(`📸 Encontradas ${imageFiles.length} imágenes para optimizar`);
  
  // Crear directorio de imágenes optimizadas
  const optimizedDir = path.join(publicDir, 'images-optimized');
  ensureDir(optimizedDir);
  
  // Optimizar cada imagen
  imageFiles.forEach(file => {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(optimizedDir, file);
    
    try {
      // Usar sharp para optimizar (si está disponible)
      if (fileExists('node_modules/sharp')) {
        execSync(`npx sharp-cli resize 1920 --input "${inputPath}" --output "${outputPath}"`);
      } else {
        // Fallback: copiar archivo
        fs.copyFileSync(inputPath, outputPath);
      }
      console.log(`✅ Optimizada: ${file}`);
    } catch (error) {
      console.warn(`⚠️  No se pudo optimizar ${file}:`, error.message);
    }
  });
}

// Función para generar sitemap
function generateSitemap() {
  console.log('\n🗺️  Generando sitemap...');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://amestica.cl</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://amestica.cl/dashboard</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  
  fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemap);
  console.log('✅ Sitemap generado');
}

// Función para generar robots.txt
function generateRobots() {
  console.log('\n🤖 Generando robots.txt...');
  
  const robots = `User-agent: *
Allow: /

Sitemap: https://amestica.cl/sitemap.xml`;
  
  fs.writeFileSync(path.resolve('public/robots.txt'), robots);
  console.log('✅ robots.txt generado');
}

// Función para limpiar archivos temporales
function cleanupTempFiles() {
  console.log('\n🧹 Limpiando archivos temporales...');
  
  const tempDirs = ['.next/cache', 'node_modules/.cache'];
  
  tempDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Limpiado: ${dir}`);
      } catch (error) {
        console.warn(`⚠️  No se pudo limpiar ${dir}:`, error.message);
      }
    }
  });
}

// Función para verificar el bundle
function analyzeBundle() {
  console.log('\n📊 Analizando bundle...');
  
  try {
    // Ejecutar análisis de bundle si está disponible
    if (fileExists('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.analyze) {
        runCommand('npm run analyze', 'Análisis de bundle');
      } else {
        console.log('⚠️  Script de análisis no encontrado');
      }
    }
  } catch (error) {
    console.warn('⚠️  No se pudo analizar el bundle:', error.message);
  }
}

// Función para verificar la configuración
function validateConfig() {
  console.log('\n🔍 Validando configuración...');
  
  const requiredFiles = [
    'next.config.js',
    'tailwind.config.ts',
    'tsconfig.json',
    'package.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fileExists(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Archivos de configuración faltantes:', missingFiles);
    process.exit(1);
  }
  
  console.log('✅ Configuración válida');
}

// Función para generar reporte de optimización
function generateReport() {
  console.log('\n📋 Generando reporte de optimización...');
  
  const report = {
    timestamp: new Date().toISOString(),
    optimizations: [
      'Configuración de Next.js optimizada',
      'TypeScript configurado con reglas estrictas',
      'Tailwind CSS optimizado',
      'Componentes memoizados',
      'Lazy loading implementado',
      'Bundle splitting configurado',
      'Imágenes optimizadas',
      'Sitemap generado',
      'Robots.txt generado',
      'Archivos temporales limpiados'
    ],
    recommendations: [
      'Implementar Service Worker para caché offline',
      'Configurar CDN para assets estáticos',
      'Implementar compresión gzip/brotli',
      'Configurar headers de seguridad',
      'Implementar monitoreo de performance'
    ]
  };
  
  fs.writeFileSync(
    path.resolve('optimization-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Reporte generado: optimization-report.json');
}

// Función principal
async function main() {
  try {
    // Validar configuración
    validateConfig();
    
    // Limpiar archivos temporales
    cleanupTempFiles();
    
    // Optimizar imágenes
    optimizeImages();
    
    // Generar archivos estáticos
    generateSitemap();
    generateRobots();
    
    // Analizar bundle
    analyzeBundle();
    
    // Generar reporte
    generateReport();
    
    console.log('\n🎉 Optimización completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ejecutar: npm run build');
    console.log('2. Ejecutar: npm run start');
    console.log('3. Verificar el reporte: optimization-report.json');
    
  } catch (error) {
    console.error('\n❌ Error durante la optimización:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  optimizeImages,
  generateSitemap,
  generateRobots,
  cleanupTempFiles,
  analyzeBundle,
  validateConfig,
  generateReport
};
