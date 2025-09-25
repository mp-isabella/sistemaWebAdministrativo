#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔐 Verificando configuración de login para producción...');

async function verifyLoginProduction() {
    try {
        // Step 1: Verificar variables de entorno críticas
        console.log('🔍 Step 1: Verificando variables de entorno...');

        const requiredEnvVars = [
            'DATABASE_URL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL'
        ];

        const missingVars = [];

        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingVars.push(envVar);
            } else {
                console.log(`✅ ${envVar} está configurada`);
            }
        }

        if (missingVars.length > 0) {
            console.log('❌ Variables de entorno faltantes:', missingVars.join(', '));
            console.log('💡 Configura estas variables en Vercel Dashboard > Settings > Environment Variables');
            return false;
        }

        // Step 2: Verificar configuración de NextAuth
        console.log('🔍 Step 2: Verificando configuración de NextAuth...');

        if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === 'clave-unica-definitiva-2024-12345') {
            console.log('⚠️  NEXTAUTH_SECRET está usando el valor por defecto');
            console.log('💡 Genera un secret seguro para producción');
        }

        // Step 3: Verificar conexión a base de datos
        console.log('🔍 Step 3: Verificando conexión a base de datos...');
        try {
            execSync('node scripts/verify-database-config.js', { stdio: 'inherit' });
            console.log('✅ Conexión a base de datos exitosa');
        } catch (error) {
            console.log('❌ Error de conexión a base de datos');
            console.log('Error:', error.message);
            return false;
        }

        // Step 4: Verificar que Prisma Client esté generado
        console.log('🔍 Step 4: Verificando Prisma Client...');
        try {
            execSync('npx prisma generate', { stdio: 'pipe' });
            console.log('✅ Prisma Client generado correctamente');
        } catch (error) {
            console.log('❌ Error generando Prisma Client');
            console.log('Error:', error.message);
            return false;
        }

        // Step 5: Verificar configuración de cookies
        console.log('🔍 Step 5: Verificando configuración de cookies...');

        const isProduction = process.env.NODE_ENV === 'production';
        const isHttps = process.env.NEXTAUTH_URL?.startsWith('https://');

        if (isProduction && !isHttps) {
            console.log('⚠️  En producción, NEXTAUTH_URL debería usar HTTPS');
            console.log('💡 Asegúrate de que NEXTAUTH_URL use https:// en producción');
        }

        console.log('🎉 Configuración de login verificada correctamente!');
        return true;

    } catch (error) {
        console.error('❌ Error verificando configuración de login:', error.message);
        return false;
    }
}

// Ejecutar verificación
verifyLoginProduction().then(success => {
    if (success) {
        console.log('✅ Login está listo para producción');
    } else {
        console.log('❌ Login necesita configuración adicional');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Error verificando login:', error.message);
    process.exit(1);
});
