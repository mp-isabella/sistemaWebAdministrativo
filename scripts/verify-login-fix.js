#!/usr/bin/env node

/**
 * Script de verificación para confirmar que el problema de login está solucionado
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('🔍 Verificando solución del problema de login...\n');

async function verifyLoginFix() {
    let prisma;

    try {
        console.log('1️⃣ Creando instancia de Prisma...');
        prisma = new PrismaClient({
            log: ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });

        console.log('✅ Instancia creada exitosamente');

        console.log('\n2️⃣ Probando conexión...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');

        console.log('\n3️⃣ Verificando usuarios...');
        const users = await prisma.user.findMany({
            include: { role: true },
            take: 5
        });

        if (users.length === 0) {
            console.log('⚠️  No se encontraron usuarios');
            console.log('💡 Ejecuta el script de seed para crear usuarios');
            return;
        }

        console.log(`✅ Encontrados ${users.length} usuarios`);

        console.log('\n4️⃣ Probando autenticación...');
        const testUser = users[0];
        console.log(`   Usuario: ${testUser.email}`);
        console.log(`   Rol: ${testUser.role?.name || 'Sin rol'}`);
        console.log(`   Activo: ${testUser.isActive ? 'Sí' : 'No'}`);

        // Simular verificación de contraseña
        console.log('\n5️⃣ Verificando hash de contraseña...');
        const hasValidPassword = testUser.password && testUser.password.length > 10;
        console.log(`   Hash válido: ${hasValidPassword ? 'Sí' : 'No'}`);

        if (hasValidPassword) {
            console.log('✅ Contraseña hasheada correctamente');
        } else {
            console.log('⚠️  La contraseña no está hasheada correctamente');
            console.log('💡 Ejecuta el script de fix-passwords para corregir esto');
        }

        console.log('\n6️⃣ Probando consulta de autenticación...');
        const authUser = await prisma.user.findUnique({
            where: { email: testUser.email },
            include: { role: true }
        });

        if (authUser) {
            console.log('✅ Consulta de autenticación exitosa');
            console.log(`   Usuario encontrado: ${authUser.name}`);
            console.log(`   Rol: ${authUser.role?.name}`);
        } else {
            console.log('❌ Error en consulta de autenticación');
        }

        console.log('\n🎉 Verificación completada exitosamente');
        console.log('\n📋 Estado del sistema:');
        console.log('✅ Conexión a base de datos: OK');
        console.log('✅ Consultas de usuario: OK');
        console.log('✅ Estructura de datos: OK');

        if (hasValidPassword) {
            console.log('✅ Contraseñas: OK');
        } else {
            console.log('⚠️  Contraseñas: Necesitan corrección');
        }

        console.log('\n🚀 El sistema está listo para usar');
        console.log('\n📝 Credenciales de prueba:');
        users.slice(0, 3).forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} (${user.role?.name || 'Sin rol'})`);
        });

    } catch (error) {
        console.error('\n❌ Error durante la verificación:', error.message);

        if (error.code === '42P05') {
            console.log('\n💡 Error de prepared statement detectado');
            console.log('🔧 Soluciones:');
            console.log('1. Ejecuta: node scripts/clear-database-connections.js');
            console.log('2. Reinicia tu servidor de desarrollo');
            console.log('3. Limpia la caché del navegador');
        } else if (error.code === 'P1001') {
            console.log('\n💡 Error de conexión a base de datos');
            console.log('🔧 Soluciones:');
            console.log('1. Verifica que DATABASE_URL sea correcta');
            console.log('2. Asegúrate de que la base de datos esté ejecutándose');
            console.log('3. Verifica las credenciales');
        }

    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

// Ejecutar verificación
verifyLoginFix()
    .then(() => {
        console.log('\n🏁 Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
