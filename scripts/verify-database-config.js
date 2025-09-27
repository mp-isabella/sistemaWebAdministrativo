#!/usr/bin/env node

console.log('🔍 Verificando configuración de base de datos...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('  VERCEL:', process.env.VERCEL || 'undefined');
console.log('  SKIP_ENV_VALIDATION:', process.env.SKIP_ENV_VALIDATION || 'undefined');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    console.log('  URL:', url.includes('supabase') ? 'Supabase' : 'Custom');
    console.log('  Puerto:', url.includes(':6543') ? '✅ 6543' : '❌ Otro puerto');
}

// Simular la lógica de Prisma
console.log('\n🧠 Lógica de Prisma:');
const isBuildTime = process.env.NODE_ENV === 'production' &&
    process.env.SKIP_ENV_VALIDATION === 'true' &&
    !process.env.DATABASE_URL;

console.log('  isBuildTime:', isBuildTime);
console.log('  Usará:', isBuildTime ? '❌ URL dummy' : '✅ URL real');

if (!isBuildTime) {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres';
    console.log('  URL final:', databaseUrl.includes('supabase') ? 'Supabase' : 'Custom');
}

console.log('\n✅ Verificación completada');