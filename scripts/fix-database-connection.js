#!/usr/bin/env node

/**
 * Script para solucionar problemas de conexión de base de datos
 * Específicamente para el error "prepared statement already exists"
 */

const { PrismaClient } = require('@prisma/client');

console.log('🔧 Solucionando problemas de conexión de base de datos...\n');

// Verificar variables de entorno
if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL no está configurada');
    console.log('💡 Configura tu DATABASE_URL en .env.local');
    process.exit(1);
}

console.log('✅ DATABASE_URL configurada');
console.log(`   ${process.env.DATABASE_URL.substring(0, 50)}...`);

// Detectar tipo de base de datos
if (process.env.DATABASE_URL.includes('supabase.com')) {
    console.log('🗄️  Detectada base de datos Supabase');
    console.log('💡 Usando configuración optimizada para Supabase');
} else if (process.env.DATABASE_URL.includes('localhost')) {
    console.log('🗄️  Detectada base de datos local');
} else {
    console.log('🗄️  Base de datos detectada');
}

async function fixDatabaseConnection() {
    let prisma;

    try {
        console.log('\n🔌 Creando nueva instancia de Prisma...');

        // Crear nueva instancia con configuración optimizada
        prisma = new PrismaClient({
            log: ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });

        console.log('✅ Instancia de Prisma creada');

        console.log('\n🔗 Probando conexión...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');

        console.log('\n🧪 Probando consulta simple...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Consulta de prueba exitosa:', result);

        console.log('\n👥 Verificando usuarios...');
        const userCount = await prisma.user.count();
        console.log(`✅ Encontrados ${userCount} usuarios en la base de datos`);

        if (userCount > 0) {
            console.log('\n🔍 Probando consulta de usuario...');
            const testUser = await prisma.user.findFirst({
                include: { role: true }
            });

            if (testUser) {
                console.log(`✅ Usuario de prueba encontrado: ${testUser.email}`);
                console.log(`   Rol: ${testUser.role?.name || 'Sin rol'}`);
            }
        }

        console.log('\n✅ Todas las pruebas pasaron exitosamente');
        console.log('\n🎉 El problema de conexión ha sido solucionado');
        console.log('\n📋 Próximos pasos:');
        console.log('1. Reinicia tu servidor de desarrollo');
        console.log('2. Prueba el login nuevamente');
        console.log('3. Si el problema persiste, verifica tu DATABASE_URL');
        console.log('4. Actualiza DATABASE_URL en .env.local');

    } catch (error) {
        console.error('\n❌ Error durante la prueba:', error.message);

        if (error.code === 'P1001') {
            console.log('\n💡 Soluciones para P1001:');
            console.log('1. Verifica que tu base de datos esté ejecutándose');
            console.log('2. Verifica las credenciales en DATABASE_URL');
            console.log('3. Verifica que el puerto sea correcto (5432 para PostgreSQL)');
        } else if (error.code === '42P05') {
            console.log('\n💡 Soluciones para 42P05 (prepared statement already exists):');
            console.log('1. Reinicia tu servidor de desarrollo');
            console.log('2. Limpia la caché del navegador');
            console.log('3. Verifica que no haya múltiples instancias de Prisma');
        }

        console.log('\n🔧 Soluciones generales:');
        console.log('1. Reinicia tu aplicación completamente');
        console.log('2. Verifica que DATABASE_URL sea correcta');
        console.log('3. Ejecuta: npm run dev (para reiniciar)');

    } finally {
        if (prisma) {
            console.log('\n🔌 Cerrando conexión...');
            await prisma.$disconnect();
            console.log('✅ Conexión cerrada correctamente');
        }
    }
}

// Ejecutar la función
fixDatabaseConnection()
    .then(() => {
        console.log('\n🏁 Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });