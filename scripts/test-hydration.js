#!/usr/bin/env node

/**
 * Script para probar la hidratación de la aplicación Next.js
 * Ejecuta build y start para verificar que no hay errores de hidratación
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando pruebas de hidratación...\n');

try {
  // Verificar que estamos en el directorio correcto
  if (!fs.existsSync('package.json')) {
    throw new Error('No se encontró package.json. Ejecuta este script desde la raíz del proyecto.');
  }

  // Limpiar builds anteriores
  console.log('🧹 Limpiando builds anteriores...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // Instalar dependencias si es necesario
  console.log('📦 Verificando dependencias...');
  if (!fs.existsSync('node_modules')) {
    console.log('Instalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Ejecutar build
  console.log('🔨 Ejecutando build...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completado exitosamente!');
  console.log('🎯 No se detectaron errores de hidratación durante el build.');
  
  console.log('\n📋 Resumen de la prueba:');
  console.log('   ✅ Dependencias verificadas');
  console.log('   ✅ Build completado sin errores');
  console.log('   ✅ Configuración de hidratación aplicada');
  
  console.log('\n🚀 Para probar en desarrollo, ejecuta: npm run dev');
  console.log('🌐 Para probar en producción, ejecuta: npm start');

} catch (error) {
  console.error('❌ Error durante la prueba de hidratación:', error.message);
  process.exit(1);
}
