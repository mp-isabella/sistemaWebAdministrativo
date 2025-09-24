#!/usr/bin/env node

/**
 * Script para configurar la aplicación para producción
 * Este script ayuda a configurar las variables de entorno y la base de datos
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando aplicación para producción...\n');

// Verificar si existe .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envLocalPath)) {
    console.log('📝 Creando archivo .env.local...');

    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envLocalPath);
        console.log('✅ Archivo .env.local creado desde env.example');
        console.log('⚠️  IMPORTANTE: Debes configurar las variables de entorno en .env.local');
    } else {
        // Crear un archivo .env.local básico
        const basicEnv = `# Configuración de producción
# IMPORTANTE: Configura estas variables antes de desplegar

# Base de datos PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# NextAuth.js
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="genera-una-clave-secreta-segura"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-contraseña-de-aplicacion"
EMAIL_FROM="tu-email@gmail.com"
`;

        fs.writeFileSync(envLocalPath, basicEnv);
        console.log('✅ Archivo .env.local creado con configuración básica');
    }
} else {
    console.log('✅ Archivo .env.local ya existe');
}

console.log('\n📋 Pasos para completar la configuración:');
console.log('1. Configura tu base de datos PostgreSQL en producción');
console.log('2. Actualiza las variables en .env.local:');
console.log('   - DATABASE_URL: URL de tu base de datos PostgreSQL');
console.log('   - NEXTAUTH_URL: URL de tu aplicación en producción');
console.log('   - NEXTAUTH_SECRET: Genera una clave secreta segura');
console.log('   - Variables de email si usas notificaciones');
console.log('3. Ejecuta: npm run build');
console.log('4. Despliega en Vercel, Netlify o tu plataforma preferida');

console.log('\n🔧 Comandos útiles:');
console.log('- npm run build: Construir para producción');
console.log('- npx prisma db push: Sincronizar esquema con la base de datos');
console.log('- npx prisma generate: Generar cliente de Prisma');

console.log('\n✨ ¡Configuración completada!');
