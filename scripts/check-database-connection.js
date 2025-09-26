#!/usr/bin/env node

/**
 * Script para verificar la conexión a la base de datos
 */

const { PrismaClient } = require('@prisma/client');

async function checkConnection() {
    console.log('🔍 Verificando conexión a la base de datos...\n');

    const prisma = new PrismaClient();

    try {
        // Intentar conectar
        await prisma.$connect();
        console.log('✅ Conexión exitosa a la base de datos');

        // Verificar que las tablas existan
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        console.log(`📊 Tablas encontradas: ${tables.length}`);

        if (tables.length === 0) {
            console.log('⚠️  No se encontraron tablas. Aplicando migraciones...');
            return false;
        } else {
            console.log('✅ Base de datos configurada correctamente');
            return true;
        }

    } catch (error) {
        console.log('❌ Error de conexión:');
        console.log(`   ${error.message}`);

        if (error.message.includes('Tenant or user not found')) {
            console.log('\n💡 Soluciones:');
            console.log('1. Verifica que la URL de Supabase sea correcta');
            console.log('2. Asegúrate de que el proyecto esté activo');
            console.log('3. Verifica que las credenciales sean correctas');
        } else if (error.message.includes('Connection refused')) {
            console.log('\n💡 Soluciones:');
            console.log('1. Verifica que la base de datos esté ejecutándose');
            console.log('2. Verifica la URL de conexión');
            console.log('3. Verifica el puerto y host');
        }

        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const isConnected = await checkConnection();

    if (!isConnected) {
        console.log('\n🔧 Pasos para solucionar:');
        console.log('1. Verifica tu archivo .env.local');
        console.log('2. Asegúrate de que DATABASE_URL sea correcta');
        console.log('3. Si usas Supabase, verifica que el proyecto esté activo');
        console.log('4. Ejecuta: npm run db:push');
    } else {
        console.log('\n🎉 ¡Base de datos lista para usar!');
        console.log('Ejecuta: npm run dev');
    }
}

main().catch(console.error);
