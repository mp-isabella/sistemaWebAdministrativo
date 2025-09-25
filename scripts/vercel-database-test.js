#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Verificando conexión a la base de datos en Vercel...');
console.log('');

// Verificar variables de entorno
const databaseUrl = process.env.DATABASE_URL;
console.log('📊 Variables de entorno:');
console.log('   DATABASE_URL:', databaseUrl ? '✅ Configurada' : '❌ No configurada');
console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Configurada' : '❌ No configurada');
console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configurada' : '❌ No configurada');

if (databaseUrl) {
    console.log('');
    console.log('🔗 Análisis de DATABASE_URL:');
    console.log('   URL completa:', databaseUrl);

    // Verificar componentes específicos
    const hasCorrectHost = databaseUrl.includes('db.rwsqkirgxsxrpjepjhtr.supabase.co');
    const hasCorrectPort = databaseUrl.includes(':5432');
    const hasPassword = databaseUrl.includes('@') && databaseUrl.split('@')[0].includes(':');
    const hasCorrectProtocol = databaseUrl.startsWith('postgresql://');

    console.log('   Protocolo correcto:', hasCorrectProtocol ? '✅' : '❌');
    console.log('   Host correcto:', hasCorrectHost ? '✅' : '❌');
    console.log('   Puerto correcto:', hasCorrectPort ? '✅' : '❌');
    console.log('   Contraseña presente:', hasPassword ? '✅' : '❌');

    if (!hasCorrectHost || !hasCorrectPort || !hasPassword || !hasCorrectProtocol) {
        console.log('');
        console.log('❌ DATABASE_URL incorrecta');
        console.log('💡 Debe ser: postgresql://postgres:[PASSWORD]@db.rwsqkirgxsxrpjepjhtr.supabase.co:5432/postgres');
        process.exit(1);
    }
}

console.log('');
console.log('🔗 Probando conexión con Prisma...');

// Crear cliente Prisma con configuración específica para Vercel
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

async function testConnection() {
    try {
        // Probar conexión básica
        console.log('   Probando conexión básica...');
        await prisma.$connect();
        console.log('   ✅ Conexión exitosa');

        // Probar consulta simple
        console.log('   Probando consulta simple...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('   ✅ Consulta exitosa:', result);

        // Probar consulta a tabla User
        console.log('   Probando consulta a tabla User...');
        const userCount = await prisma.user.count();
        console.log('   ✅ Usuarios encontrados:', userCount);

        console.log('');
        console.log('🎉 ¡Conexión a la base de datos exitosa en Vercel!');
        console.log('   El error P1001 está resuelto.');

        return true;
    } catch (error) {
        console.log('   ❌ Error de conexión:', error.message);
        console.log('   Código de error:', error.code);

        if (error.code === 'P1001') {
            console.log('   💡 P1001: No se puede conectar al servidor de base de datos');
            console.log('   Soluciones:');
            console.log('   1. Verificar que el proyecto de Supabase esté activo');
            console.log('   2. Verificar que la contraseña sea correcta');
            console.log('   3. Verificar que no haya límites de conexión');
            console.log('   4. Probar con una nueva contraseña en Supabase');
        }

        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar prueba
testConnection()
    .then((success) => {
        if (success) {
            console.log('✅ Prueba completada exitosamente');
            process.exit(0);
        } else {
            console.log('❌ Prueba falló');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('❌ Error inesperado:', error);
        process.exit(1);
    });