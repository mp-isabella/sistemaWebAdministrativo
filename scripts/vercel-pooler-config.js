#!/usr/bin/env node

console.log('🔧 Configuración alternativa para Vercel usando Session Pooler...');
console.log('');

console.log('📋 URL alternativa para Vercel:');
console.log('   postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
console.log('');

console.log('🔍 Diferencias con la conexión directa:');
console.log('   ✅ Usa pooler.supabase.com (más compatible con Vercel)');
console.log('   ✅ Puerto 5432 (Session pooler)');
console.log('   ✅ Soporta PREPARE statements (necesario para Prisma)');
console.log('   ✅ Optimizado para aplicaciones serverless');
console.log('');

console.log('📝 Pasos para implementar:');
console.log('   1. Ve a Vercel Dashboard → Settings → Environment Variables');
console.log('   2. Actualiza DATABASE_URL con la URL del pooler');
console.log('   3. Guarda los cambios');
console.log('   4. Redeploya la aplicación');
console.log('');

console.log('⚠️  Nota: Esta configuración es más compatible con Vercel');
console.log('   pero puede tener limitaciones de conexión concurrente.');
