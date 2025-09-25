#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Probando configuración de login para producción...');

async function testLoginProduction() {
    try {
        // Step 1: Verificar que la aplicación compile correctamente
        console.log('🔍 Step 1: Verificando compilación...');
        try {
            execSync('npx next build --no-lint', { stdio: 'pipe' });
            console.log('✅ Aplicación compila correctamente');
        } catch (error) {
            console.log('❌ Error de compilación');
            console.log('Error:', error.message);
            return false;
        }

        // Step 2: Verificar configuración de NextAuth
        console.log('🔍 Step 2: Verificando configuración de NextAuth...');

        const nextAuthUrl = process.env.NEXTAUTH_URL;
        const nextAuthSecret = process.env.NEXTAUTH_SECRET;

        if (!nextAuthUrl) {
            console.log('❌ NEXTAUTH_URL no está configurada');
            console.log('💡 Configura NEXTAUTH_URL en Vercel (ej: https://tu-dominio.vercel.app)');
            return false;
        }

        if (!nextAuthSecret || nextAuthSecret === 'clave-unica-definitiva-2024-12345') {
            console.log('⚠️  NEXTAUTH_SECRET necesita ser más seguro para producción');
            console.log('💡 Genera un secret seguro: openssl rand -base64 32');
        }

        // Step 3: Verificar configuración de base de datos
        console.log('🔍 Step 3: Verificando configuración de base de datos...');

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            console.log('❌ DATABASE_URL no está configurada');
            return false;
        }

        // Verificar formato de DATABASE_URL
        if (!databaseUrl.startsWith('postgresql://')) {
            console.log('❌ DATABASE_URL tiene formato incorrecto');
            console.log('💡 Debe empezar con postgresql://');
            return false;
        }

        // Step 4: Probar conexión a base de datos
        console.log('🔍 Step 4: Probando conexión a base de datos...');
        try {
            execSync('node scripts/verify-database-config.js', { stdio: 'pipe' });
            console.log('✅ Conexión a base de datos exitosa');
        } catch (error) {
            console.log('❌ Error de conexión a base de datos');
            console.log('💡 Verifica que DATABASE_URL sea correcta y que la base de datos esté accesible');
            return false;
        }

        // Step 5: Verificar que Prisma esté configurado correctamente
        console.log('🔍 Step 5: Verificando configuración de Prisma...');
        try {
            execSync('npx prisma generate', { stdio: 'pipe' });
            console.log('✅ Prisma Client generado correctamente');
        } catch (error) {
            console.log('❌ Error generando Prisma Client');
            return false;
        }

        console.log('🎉 Configuración de login lista para producción!');
        console.log('');
        console.log('📋 Resumen de configuración:');
        console.log(`   NEXTAUTH_URL: ${nextAuthUrl}`);
        console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 20)}...`);
        console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret ? 'Configurado' : 'No configurado'}`);
        console.log('');
        console.log('💡 Para probar el login:');
        console.log('   1. Despliega la aplicación en Vercel');
        console.log('   2. Ve a /login en tu dominio');
        console.log('   3. Usa las credenciales de un usuario existente');

        return true;

    } catch (error) {
        console.error('❌ Error probando configuración de login:', error.message);
        return false;
    }
}

// Ejecutar prueba
testLoginProduction().then(success => {
    if (success) {
        console.log('✅ Login está listo para producción');
    } else {
        console.log('❌ Login necesita configuración adicional');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Error probando login:', error.message);
    process.exit(1);
});
