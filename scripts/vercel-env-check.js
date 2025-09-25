#!/usr/bin/env node

console.log('🔍 Verificando variables de entorno en Vercel...');
console.log('');

// Verificar DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
console.log('📊 DATABASE_URL:');
if (databaseUrl) {
    console.log('   ✅ Configurada');
    console.log('   Host:', databaseUrl.includes('db.rwsqkirgxsxrpjepjhtr.supabase.co') ? '✅ Correcto' : '❌ Incorrecto');
    console.log('   Puerto:', databaseUrl.includes(':5432') ? '✅ Correcto' : '❌ Incorrecto');
    console.log('   Contraseña:', databaseUrl.includes('amesticaportal') ? '✅ Correcto' : '❌ Incorrecto');
} else {
    console.log('   ❌ No configurada');
}

// Verificar NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
console.log('📊 NEXTAUTH_URL:');
if (nextAuthUrl) {
    console.log('   ✅ Configurada:', nextAuthUrl);
} else {
    console.log('   ❌ No configurada');
}

// Verificar NEXTAUTH_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
console.log('📊 NEXTAUTH_SECRET:');
if (nextAuthSecret) {
    console.log('   ✅ Configurada');
} else {
    console.log('   ❌ No configurada');
}

console.log('');
console.log('🎯 Si alguna variable está incorrecta, corrígela en Vercel Dashboard');
console.log('   Settings → Environment Variables');
