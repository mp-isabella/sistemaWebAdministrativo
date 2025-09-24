const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando configuración de autenticación...');

// Limpiar archivos de caché de NextAuth
const cacheDir = path.join(__dirname, '..', '.next', 'cache');
if (fs.existsSync(cacheDir)) {
    console.log('🗑️ Eliminando caché de Next.js...');
    fs.rmSync(cacheDir, { recursive: true, force: true });
}

// Limpiar archivos de Prisma
const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');
if (fs.existsSync(prismaDir)) {
    console.log('🗑️ Limpiando caché de Prisma...');
    fs.rmSync(prismaDir, { recursive: true, force: true });
}

console.log('✅ Limpieza completada');
console.log('📝 Instrucciones:');
console.log('1. Abre el navegador y ve a http://localhost:3000/clear-cookies.html');
console.log('2. Esto limpiará todas las cookies del navegador');
console.log('3. Luego reinicia el servidor con: npm run dev');
console.log('4. Intenta hacer login nuevamente');
