#!/usr/bin/env node

/**
 * Script simplificado para configurar desarrollo local
 * Usa variables de entorno para conectar a una base de datos externa
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando desarrollo local (modo simplificado)...\n');

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creando archivo .env.local...');

    // Leer el template
    const templatePath = path.join(process.cwd(), 'env.local.template');
    if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, 'utf8');
        fs.writeFileSync(envPath, template);
        console.log('✅ Archivo .env.local creado desde template');
        console.log('\n⚠️  IMPORTANTE: Edita el archivo .env.local con tu configuración de base de datos');
        console.log('   Puedes usar:');
        console.log('   - Una base de datos PostgreSQL local');
        console.log('   - Una base de datos en la nube (Supabase, Railway, etc.)');
        console.log('   - Una base de datos de Vercel Postgres');
    } else {
        console.log('❌ No se encontró el archivo env.local.template');
        process.exit(1);
    }
} else {
    console.log('✅ Archivo .env.local ya existe');
}

// Verificar variables de entorno
console.log('\n🔍 Verificando configuración...');
require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL no está configurada en .env.local');
    console.log('💡 Edita el archivo .env.local y configura tu DATABASE_URL');
    process.exit(1);
}

console.log('✅ DATABASE_URL configurada');

// Aplicar migraciones de Prisma
console.log('\n🔄 Aplicando migraciones de Prisma...');
try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Migraciones aplicadas exitosamente');
} catch (error) {
    console.log('❌ Error al aplicar migraciones');
    console.log('💡 Verifica que la conexión a la base de datos sea correcta');
    console.log('💡 Verifica que la URL de la base de datos sea válida');
    process.exit(1);
}

// Generar cliente Prisma
console.log('\n🔧 Generando cliente Prisma...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma generado');
} catch (error) {
    console.log('❌ Error al generar cliente Prisma');
    process.exit(1);
}

console.log('\n🎉 ¡Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecuta: npm run dev');
console.log('2. Abre: http://localhost:3000');
console.log('3. (Opcional) Ejecuta: npm run db:seed para datos de prueba');

console.log('\n💡 Opciones de base de datos:');
console.log('• Supabase (gratis): https://supabase.com');
console.log('• Railway (gratis): https://railway.app');
console.log('• Vercel Postgres: https://vercel.com/storage/postgres');
console.log('• PostgreSQL local con Docker');
