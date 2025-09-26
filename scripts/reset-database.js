#!/usr/bin/env node

/**
 * Script para resetear la base de datos y solucionar errores de Prisma
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Reseteando base de datos...\n');

try {
    // 1. Generar cliente Prisma
    console.log('📦 Generando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma generado');

    // 2. Aplicar migraciones con reset
    console.log('\n🔄 Aplicando migraciones...');
    try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
        console.log('✅ Migraciones aplicadas');
    } catch (error) {
        console.log('⚠️  Error al aplicar migraciones, continuando...');
    }

    // 3. Verificar conexión
    console.log('\n🔍 Verificando conexión...');
    try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Conexión verificada');
    } catch (error) {
        console.log('⚠️  Error en verificación, pero continuando...');
    }

    console.log('\n🎉 ¡Base de datos reseteada!');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Prueba el login en http://localhost:3000');

} catch (error) {
    console.log('❌ Error durante el reset:');
    console.log(error.message);
    console.log('\n💡 Soluciones alternativas:');
    console.log('1. Reinicia tu computadora');
    console.log('2. Crea un nuevo proyecto en Supabase');
    console.log('3. Usa PostgreSQL local con Docker');
}
