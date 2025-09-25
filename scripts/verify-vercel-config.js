#!/usr/bin/env node

console.log('🔍 Verificando configuración para Vercel...');
console.log('');
console.log('📋 Variables de entorno requeridas en Vercel:');
console.log('');
console.log('DATABASE_URL = postgresql://postgres:holamaria123@db.rwsqkirgxsxrpjepjhtr.supabase.co:5432/postgres');
console.log('NEXTAUTH_URL = https://tu-dominio.vercel.app');
console.log('NEXTAUTH_SECRET = 6ed3302d9fa1acf20879e253244b39f3f529c2e47d4d94758aa89a0c511a6fd5');
console.log('');
console.log('🔧 Pasos para configurar en Vercel:');
console.log('1. Ve a tu proyecto en Vercel Dashboard');
console.log('2. Settings → Environment Variables');
console.log('3. Agrega las variables de arriba');
console.log('4. Asegúrate de que DATABASE_URL use el puerto 5432 (no 6543)');
console.log('5. Asegúrate de que el host sea db.rwsqkirgxsxrpjepjhtr.supabase.co');
console.log('6. Redeploya tu aplicación');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('- NO uses el pooler (puerto 6543)');
console.log('- Usa la conexión directa (puerto 5432)');
console.log('- Verifica que la contraseña sea exactamente "holamaria123"');
console.log('- El host debe ser db.rwsqkirgxsxrpjepjhtr.supabase.co');
