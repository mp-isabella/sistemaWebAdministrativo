#!/usr/bin/env node

// Script para verificar la conexión a la base de datos en Vercel
console.log('🔍 Verificando conexión a la base de datos en Vercel...');
console.log('DATABASE_URL configurada:', !!process.env.DATABASE_URL);
console.log('NEXTAUTH_URL configurada:', !!process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET configurada:', !!process.env.NEXTAUTH_SECRET);

if (process.env.DATABASE_URL) {
    console.log('URL de conexión:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

console.log('✅ Script de verificación ejecutado');
