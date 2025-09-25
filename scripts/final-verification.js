#!/usr/bin/env node

console.log('🔍 Verificación final de configuración...');
console.log('');

// Verificar variables de entorno
const databaseUrl = process.env.DATABASE_URL;
const nextAuthUrl = process.env.NEXTAUTH_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

console.log('📊 Variables de entorno:');
console.log('   DATABASE_URL:', databaseUrl ? '✅ Configurada' : '❌ No configurada');
console.log('   NEXTAUTH_URL:', nextAuthUrl ? '✅ Configurada' : '❌ No configurada');
console.log('   NEXTAUTH_SECRET:', nextAuthSecret ? '✅ Configurada' : '❌ No configurada');

if (databaseUrl) {
    console.log('');
    console.log('🔗 Análisis de DATABASE_URL:');
    console.log('   URL completa:', databaseUrl);

    // Verificar componentes
    const hasCorrectHost = databaseUrl.includes('db.rwsqkirgxsxrpjepjhtr.supabase.co');
    const hasCorrectPort = databaseUrl.includes(':5432');
    const hasPassword = databaseUrl.includes('@') && databaseUrl.split('@')[0].includes(':');

    console.log('   Host correcto:', hasCorrectHost ? '✅' : '❌');
    console.log('   Puerto correcto:', hasCorrectPort ? '✅' : '❌');
    console.log('   Contraseña presente:', hasPassword ? '✅' : '❌');

    if (!hasCorrectHost || !hasCorrectPort || !hasPassword) {
        console.log('');
        console.log('❌ DATABASE_URL incorrecta');
        console.log('💡 Debe ser: postgresql://postgres:[PASSWORD]@db.rwsqkirgxsxrpjepjhtr.supabase.co:5432/postgres');
    }
}

console.log('');
console.log('🎯 Si hay errores, corrige las variables en Vercel Dashboard');
console.log('   Settings → Environment Variables');
