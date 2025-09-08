#!/usr/bin/env node

/**
 * Script de configuración automática para la solución definitiva de hidratación
 * Este script configura todo lo necesario para evitar problemas de hidratación
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando solución definitiva de hidratación...\n');

try {
  // Verificar que estamos en el directorio correcto
  if (!fs.existsSync('package.json')) {
    throw new Error('No se encontró package.json. Ejecuta este script desde la raíz del proyecto.');
  }

  // 1. Hacer backup de la configuración actual
  console.log('📋 1. Creando backup de la configuración actual...');
  if (fs.existsSync('next.config.js')) {
    fs.copyFileSync('next.config.js', 'next.config.backup.js');
    console.log('✅ Backup creado: next.config.backup.js');
  }

  // 2. Aplicar configuración definitiva
  console.log('🔧 2. Aplicando configuración definitiva...');
  if (fs.existsSync('next.config.definitive.js')) {
    fs.copyFileSync('next.config.definitive.js', 'next.config.js');
    console.log('✅ Configuración definitiva aplicada');
  } else {
    throw new Error('No se encontró next.config.definitive.js');
  }

  // 3. Limpiar builds anteriores
  console.log('🧹 3. Limpiando builds anteriores...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('✅ Build anterior eliminado');
  }

  // 4. Verificar dependencias
  console.log('📦 4. Verificando dependencias...');
  if (!fs.existsSync('node_modules')) {
    console.log('Instalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ Dependencias ya instaladas');
  }

  // 5. Ejecutar build de prueba
  console.log('🔨 5. Ejecutando build de prueba...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado exitosamente!');

  // 6. Crear archivo de estado
  console.log('📝 6. Creando archivo de estado...');
  const stateFile = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'Solución definitiva de hidratación aplicada',
    config: 'next.config.definitive.js',
    backup: 'next.config.backup.js',
    status: 'success'
  };
  
  fs.writeFileSync('hydration-fix-state.json', JSON.stringify(stateFile, null, 2));
  console.log('✅ Archivo de estado creado: hydration-fix-state.json');

  console.log('\n🎉 ¡Configuración completada exitosamente!');
  console.log('\n📋 Resumen de cambios:');
  console.log('   ✅ Backup de configuración creado');
  console.log('   ✅ Configuración definitiva aplicada');
  console.log('   ✅ Builds anteriores limpiados');
  console.log('   ✅ Dependencias verificadas');
  console.log('   ✅ Build de prueba exitoso');
  console.log('   ✅ Archivo de estado creado');
  
  console.log('\n🚀 Para probar la solución:');
  console.log('   npm run dev    # Desarrollo');
  console.log('   npm start      # Producción');
  
  console.log('\n🔄 Para revertir cambios:');
  console.log('   mv next.config.backup.js next.config.js');
  
  console.log('\n📚 Documentación disponible en: HYDRATION_FIX_README.md');

} catch (error) {
  console.error('❌ Error durante la configuración:', error.message);
  
  // Intentar restaurar configuración anterior
  if (fs.existsSync('next.config.backup.js')) {
    console.log('🔄 Restaurando configuración anterior...');
    fs.copyFileSync('next.config.backup.js', 'next.config.js');
    console.log('✅ Configuración anterior restaurada');
  }
  
  process.exit(1);
}
