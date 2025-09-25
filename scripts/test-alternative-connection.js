#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Probando conexión alternativa para Vercel...');
console.log('');

// Verificar variables de entorno
const databaseUrl = process.env.DATABASE_URL;
console.log('📊 DATABASE_URL actual:', databaseUrl ? '✅ Configurada' : '❌ No configurada');

if (databaseUrl) {
    console.log('   URL:', databaseUrl.substring(0, 50) + '...');
}

console.log('');
console.log('🔗 Probando conexión con configuración optimizada para Vercel...');

// Crear cliente Prisma con configuración optimizada para Vercel
const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

async function testAlternativeConnection() {
    try {
        console.log('   Conectando a la base de datos...');
        await prisma.$connect();
        console.log('   ✅ Conexión exitosa');

        console.log('   Probando consulta simple...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('   ✅ Consulta exitosa:', result);

        console.log('   Probando consulta a tabla User...');
        const userCount = await prisma.user.count();
        console.log('   ✅ Usuarios encontrados:', userCount);

        console.log('');
        console.log('🎉 ¡Conexión alternativa exitosa!');
        console.log('   La base de datos está funcionando correctamente.');

        return true;
    } catch (error) {
        console.log('   ❌ Error de conexión:', error.message);
        console.log('   Código de error:', error.code);

        if (error.code === 'P1001') {
            console.log('');
            console.log('💡 P1001: No se puede conectar al servidor de base de datos');
            console.log('   Posibles soluciones:');
            console.log('   1. Verificar que el proyecto de Supabase esté activo');
            console.log('   2. Verificar que la contraseña sea correcta');
            console.log('   3. Verificar que no haya límites de conexión');
            console.log('   4. Probar con una nueva contraseña en Supabase');
            console.log('   5. Verificar que no haya problemas de red desde Vercel');
        }

        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar prueba
testAlternativeConnection()
    .then((success) => {
        if (success) {
            console.log('✅ Prueba de conexión alternativa completada exitosamente');
            process.exit(0);
        } else {
            console.log('❌ Prueba de conexión alternativa falló');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('❌ Error inesperado:', error);
        process.exit(1);
    });
