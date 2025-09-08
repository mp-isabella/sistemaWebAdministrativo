#!/usr/bin/env node

/**
 * Script de instalación de optimizaciones de rendimiento
 * Para Améstica Ltda. - Sistema Web Administrativo
 * 
 * Este script automatiza la implementación de todas las optimizaciones
 * de rendimiento implementadas en el proyecto.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Instalando optimizaciones de rendimiento para Améstica Ltda...\n');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Verificar si estamos en el directorio correcto
function checkProjectStructure() {
  logStep(1, 'Verificando estructura del proyecto...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'app/layout.tsx',
    'components/sections/hero.tsx'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    logError(`Archivos requeridos no encontrados: ${missingFiles.join(', ')}`);
    logError('Asegúrate de ejecutar este script desde la raíz del proyecto.');
    process.exit(1);
  }
  
  logSuccess('Estructura del proyecto verificada');
}

// Instalar dependencias necesarias
function installDependencies() {
  logStep(2, 'Instalando dependencias de optimización...');
  
  try {
    const dependencies = [
      '@svgr/webpack',
      'webpack-bundle-analyzer'
    ];
    
    log('Instalando dependencias...', 'yellow');
    execSync(`npm install ${dependencies.join(' ')} --save-dev`, { stdio: 'inherit' });
    
    logSuccess('Dependencias instaladas correctamente');
  } catch (error) {
    logWarning('Error al instalar dependencias, continuando...');
    logWarning('Puedes instalarlas manualmente más tarde');
  }
}

// Configurar Next.js optimizado
function configureNextJS() {
  logStep(3, 'Configurando Next.js optimizado...');
  
  try {
    const optimizedConfig = 'next.config.optimized.js';
    const currentConfig = 'next.config.js';
    
    if (fs.existsSync(optimizedConfig)) {
      // Hacer backup de la configuración actual
      if (fs.existsSync(currentConfig)) {
        fs.copyFileSync(currentConfig, `${currentConfig}.backup`);
        logSuccess('Backup de configuración actual creado');
      }
      
      // Copiar configuración optimizada
      fs.copyFileSync(optimizedConfig, currentConfig);
      logSuccess('Configuración de Next.js optimizada aplicada');
    } else {
      logWarning('Archivo de configuración optimizada no encontrado');
    }
  } catch (error) {
    logError(`Error al configurar Next.js: ${error.message}`);
  }
}

// Verificar archivos de optimización
function verifyOptimizationFiles() {
  logStep(4, 'Verificando archivos de optimización...');
  
  const optimizationFiles = [
    'lib/performance-optimizations.ts',
    'hooks/use-image-optimization.ts',
    'hooks/use-component-optimization.ts',
    'components/ui/optimized-image.tsx'
  ];
  
  const missingFiles = optimizationFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    logWarning(`Algunos archivos de optimización no están presentes:`);
    missingFiles.forEach(file => logWarning(`  - ${file}`));
    logWarning('Estos archivos deben crearse manualmente');
  } else {
    logSuccess('Todos los archivos de optimización están presentes');
  }
}

// Crear archivo de configuración de entorno
function createEnvironmentConfig() {
  logStep(5, 'Creando configuración de entorno...');
  
  try {
    const envContent = `# Configuración de optimización de rendimiento
# Améstica Ltda. - Sistema Web Administrativo

# URL de optimización de imágenes (opcional)
NEXT_PUBLIC_IMAGE_OPTIMIZATION_URL=

# Análisis de bundle (true/false)
ANALYZE=false

# Modo de desarrollo optimizado
NODE_ENV=development

# Configuración de caché
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_CACHE_DURATION=3600

# Configuración de lazy loading
NEXT_PUBLIC_LAZY_LOADING_ENABLED=true
NEXT_PUBLIC_INTERSECTION_THRESHOLD=0.1
`;
    
    fs.writeFileSync('.env.local', envContent);
    logSuccess('Archivo de configuración de entorno creado (.env.local)');
  } catch (error) {
    logError(`Error al crear archivo de entorno: ${error.message}`);
  }
}

// Crear script de build optimizado
function createBuildScript() {
  logStep(6, 'Creando script de build optimizado...');
  
  try {
    const buildScript = `#!/bin/bash

# Script de build optimizado para Améstica Ltda.
# Sistema Web Administrativo

echo "🚀 Iniciando build optimizado..."

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf .next
rm -rf out

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
npm ci --only=production

# Build de producción
echo "🔨 Construyendo aplicación..."
npm run build

# Análisis de bundle (opcional)
if [ "$ANALYZE" = "true" ]; then
    echo "📊 Analizando bundle..."
    npm run analyze
fi

# Exportar estáticos (opcional)
if [ "$EXPORT" = "true" ]; then
    echo "📤 Exportando archivos estáticos..."
    npm run export
fi

echo "✅ Build completado exitosamente!"
echo "🎯 Para iniciar en producción: npm start"
echo "🌐 Para desarrollo: npm run dev"
`;
    
    fs.writeFileSync('scripts/build-optimized.sh', buildScript);
    fs.chmodSync('scripts/build-optimized.sh', '755');
    logSuccess('Script de build optimizado creado (scripts/build-optimized.sh)');
  } catch (error) {
    logError(`Error al crear script de build: ${error.message}`);
  }
}

// Crear archivo de configuración de Tailwind optimizado
function createTailwindConfig() {
  logStep(7, 'Creando configuración de Tailwind optimizada...');
  
  try {
    const tailwindConfig = `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Configuración existente...
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... otros colores
      },
      // Optimizaciones de animación
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin de optimización personalizado
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.optimize-gpu': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px',
        },
        '.optimize-animation': {
          'will-change': 'transform, opacity',
        },
        '.optimize-scroll': {
          'scroll-behavior': 'smooth',
          'scroll-padding-top': '80px',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
`;
    
    // Crear backup si existe
    if (fs.existsSync('tailwind.config.ts')) {
      fs.copyFileSync('tailwind.config.ts', 'tailwind.config.ts.backup');
      logSuccess('Backup de configuración de Tailwind creado');
    }
    
    fs.writeFileSync('tailwind.config.ts', tailwindConfig);
    logSuccess('Configuración de Tailwind optimizada aplicada');
  } catch (error) {
    logError(`Error al configurar Tailwind: ${error.message}`);
  }
}

// Función principal
function main() {
  try {
    log('🚀 INSTALADOR DE OPTIMIZACIONES DE RENDIMIENTO', 'bright');
    log('Améstica Ltda. - Sistema Web Administrativo\n', 'blue');
    
    checkProjectStructure();
    installDependencies();
    configureNextJS();
    verifyOptimizationFiles();
    createEnvironmentConfig();
    createBuildScript();
    createTailwindConfig();
    
    log('\n🎉 ¡Instalación completada exitosamente!', 'green');
    log('\n📋 Próximos pasos:', 'cyan');
    log('1. Reinicia el servidor de desarrollo: npm run dev', 'yellow');
    log('2. Verifica que las optimizaciones funcionen correctamente', 'yellow');
    log('3. Revisa la documentación en PERFORMANCE_OPTIMIZATIONS.md', 'yellow');
    log('4. Ejecuta el build optimizado: ./scripts/build-optimized.sh', 'yellow');
    
    log('\n🔧 Para más información, consulta:', 'blue');
    log('- PERFORMANCE_OPTIMIZATIONS.md', 'yellow');
    log('- next.config.optimized.js', 'yellow');
    log('- lib/performance-optimizations.ts', 'yellow');
    
    log('\n✨ ¡Tu sitio web ahora está optimizado para máximo rendimiento!', 'green');
    
  } catch (error) {
    logError(`Error durante la instalación: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkProjectStructure,
  installDependencies,
  configureNextJS,
  verifyOptimizationFiles,
  createEnvironmentConfig,
  createBuildScript,
  createTailwindConfig
};
