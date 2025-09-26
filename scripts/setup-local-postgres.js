#!/usr/bin/env node

/**
 * Script para configurar PostgreSQL local con Docker
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐘 Configurando PostgreSQL local...\n');

try {
    // Verificar si Docker está disponible
    console.log('🔍 Verificando Docker...');
    try {
        execSync('docker --version', { stdio: 'pipe' });
        console.log('✅ Docker está disponible');
    } catch (error) {
        console.log('❌ Docker no está disponible');
        console.log('💡 Instala Docker Desktop desde: https://docker.com');
        process.exit(1);
    }

    // Crear contenedor PostgreSQL
    console.log('\n📦 Creando contenedor PostgreSQL...');
    try {
        execSync('docker run --name postgres-local -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sistemaweb_local -p 5432:5432 -d postgres:15', { stdio: 'inherit' });
        console.log('✅ Contenedor PostgreSQL creado');
    } catch (error) {
        console.log('⚠️  El contenedor ya existe, continuando...');
    }

    // Actualizar .env.local
    console.log('\n📝 Actualizando .env.local...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = `# Configuración para desarrollo local
DATABASE_URL="postgresql://postgres:password@localhost:5432/sistemaweb_local"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="desarrollo-local-secret-key-2024"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="tu-email@gmail.com"
NODE_ENV="development"`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env.local actualizado');

    // Aplicar migraciones
    console.log('\n🔄 Aplicando migraciones...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Migraciones aplicadas');

    // Crear usuario administrador
    console.log('\n👤 Creando usuario administrador...');
    execSync('npm run create:admin', { stdio: 'inherit' });
    console.log('✅ Usuario administrador creado');

    console.log('\n🎉 ¡Configuración completada!');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Ve a: http://localhost:3000');
    console.log('3. Login: admin@amestica.cl / admin123');

} catch (error) {
    console.log('❌ Error durante la configuración:');
    console.log(error.message);
    console.log('\n💡 Soluciones:');
    console.log('1. Instala Docker Desktop');
    console.log('2. Reinicia tu computadora');
    console.log('3. Ejecuta el script nuevamente');
}
