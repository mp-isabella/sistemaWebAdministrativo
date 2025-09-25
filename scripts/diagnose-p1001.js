#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Diagnosticando error P1001...');
console.log('');

// Verificar variables de entorno
const databaseUrl = process.env.DATABASE_URL;
console.log('📊 Variables de entorno:');
console.log('   DATABASE_URL:', databaseUrl ? '✅ Configurada' : '❌ No configurada');

if (databaseUrl) {
    try {
        const url = new URL(databaseUrl);
        console.log('   Host:', url.hostname);
        console.log('   Port:', url.port);
        console.log('   Database:', url.pathname.substring(1));
        console.log('   Username:', url.username);
        console.log('   Password:', url.password ? '***' + url.password.slice(-3) : 'No configurada');
    } catch (error) {
        console.log('   ❌ URL malformada:', error.message);
    }
}

console.log('');

// Probar conexión con Prisma
console.log('🔗 Probando conexión con Prisma...');
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
    try {
        // Intentar una consulta simple
        console.log('   Probando consulta simple...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('   ✅ Conexión exitosa:', result);

        // Probar consulta a la tabla User
        console.log('   Probando consulta a tabla User...');
        const userCount = await prisma.user.count();
        console.log('   ✅ Usuarios encontrados:', userCount);

        return true;
    } catch (error) {
        console.log('   ❌ Error de conexión:', error.message);
        console.log('   Código de error:', error.code);

        if (error.code === 'P1001') {
            console.log('   💡 P1001: No se puede conectar al servidor de base de datos');
            console.log('   Soluciones:');
            console.log('   1. Verificar que la URL de conexión sea correcta');
            console.log('   2. Verificar que las credenciales sean correctas');
            console.log('   3. Verificar que la base de datos esté accesible');
            console.log('   4. Verificar que no haya problemas de red');
        } else if (error.code === 'P1002') {
            console.log('   💡 P1002: El servidor de base de datos está inaccesible');
        } else if (error.code === 'P1003') {
            console.log('   💡 P1003: La base de datos no existe');
        }

        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar diagnóstico
testConnection()
    .then((success) => {
        if (success) {
            console.log('');
            console.log('🎉 ¡Conexión a la base de datos exitosa!');
            console.log('   El problema P1001 está resuelto.');
        } else {
            console.log('');
            console.log('❌ Error P1001 confirmado');
            console.log('   Necesitas verificar la configuración de la base de datos.');
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('❌ Error inesperado:', error);
        process.exit(1);
    });
