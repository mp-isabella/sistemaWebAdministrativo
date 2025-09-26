#!/usr/bin/env node

/**
 * Script para solucionar problemas de conexión a la base de datos
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando problema de conexión a la base de datos...\n');

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ No se encontró el archivo .env.local');
    console.log('💡 Ejecuta primero: cp env.local.template .env.local');
    process.exit(1);
}

console.log('✅ Archivo .env.local encontrado');

// Leer configuración actual
require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL no está configurada');
    console.log('💡 Configura tu DATABASE_URL en .env.local');
    process.exit(1);
}

console.log('📊 URL de base de datos actual:');
console.log(`   ${process.env.DATABASE_URL.substring(0, 50)}...`);

// Verificar si es una URL de Supabase
if (process.env.DATABASE_URL.includes('supabase.com')) {
    console.log('\n🔍 Detectada configuración de Supabase');
    console.log('💡 Posibles soluciones:');
    console.log('1. Verifica que el proyecto de Supabase esté activo');
    console.log('2. Asegúrate de que la URL sea correcta');
    console.log('3. Espera unos minutos si acabas de crear el proyecto');
    console.log('4. Crea un nuevo proyecto en Supabase si es necesario');
} else if (process.env.DATABASE_URL.includes('localhost')) {
    console.log('\n🔍 Detectada configuración local');
    console.log('💡 Verifica que PostgreSQL esté ejecutándose');
} else {
    console.log('\n🔍 Configuración de base de datos detectada');
    console.log('💡 Verifica que la URL sea correcta y accesible');
}

console.log('\n🚀 Pasos para solucionar:');
console.log('1. Ve a https://supabase.com/dashboard');
console.log('2. Crea un nuevo proyecto');
console.log('3. Copia la URL de conexión');
console.log('4. Actualiza DATABASE_URL en .env.local');
console.log('5. Ejecuta: npm run check:db');

console.log('\n📋 Comandos útiles:');
console.log('• npm run check:db     - Verificar conexión');
console.log('• npm run db:push      - Aplicar migraciones');
console.log('• npm run dev          - Iniciar desarrollo');

console.log('\n🆘 Si necesitas ayuda:');
console.log('• Revisa SOLUCION_BASE_DATOS.md');
console.log('• Verifica la documentación de Supabase');
console.log('• Asegúrate de que el proyecto esté activo');