#!/usr/bin/env node

/**
 * Script para limpiar conexiones de base de datos y reiniciar
 * Soluciona el error "prepared statement already exists"
 */

console.log('🧹 Limpiando conexiones de base de datos...\n');

// Limpiar variables globales de Prisma
if (typeof global !== 'undefined') {
    if (global.prisma) {
        console.log('🗑️  Limpiando instancia global de Prisma...');
        delete global.prisma;
    }
}

// Limpiar variables globales de Node.js
if (typeof globalThis !== 'undefined') {
    const globalForPrisma = globalThis;
    if (globalForPrisma.prisma) {
        console.log('🗑️  Limpiando instancia globalThis de Prisma...');
        delete globalForPrisma.prisma;
    }
}

console.log('✅ Variables globales limpiadas');

// Limpiar caché de módulos de Node.js
if (typeof require !== 'undefined' && require.cache) {
    console.log('🗑️  Limpiando caché de módulos...');

    // Limpiar caché de Prisma
    Object.keys(require.cache).forEach(key => {
        if (key.includes('@prisma/client') || key.includes('prisma')) {
            delete require.cache[key];
        }
    });

    console.log('✅ Caché de módulos limpiada');
}

console.log('\n🎯 Recomendaciones:');
console.log('1. Reinicia tu servidor de desarrollo (Ctrl+C y luego npm run dev)');
console.log('2. Limpia la caché del navegador (Ctrl+Shift+R)');
console.log('3. Si usas Vercel, redepiega la aplicación');

console.log('\n📋 Si el problema persiste:');
console.log('1. Verifica que DATABASE_URL sea correcta');
console.log('2. Asegúrate de que la base de datos esté ejecutándose');
console.log('3. Verifica que no haya múltiples instancias de la aplicación');

console.log('\n✅ Limpieza completada');
console.log('🚀 Ahora puedes reiniciar tu aplicación');
