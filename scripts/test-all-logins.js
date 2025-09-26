#!/usr/bin/env node

/**
 * Script para probar todos los logins del sistema
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testAllLogins() {
    console.log('🔐 Probando todos los logins del sistema...\n');

    const prisma = new PrismaClient();

    try {
        // Credenciales a probar
        const testCredentials = [
            {
                email: 'admin@amestica.cl',
                password: 'admin123',
                expectedRole: 'admin',
                expectedName: 'Administrador Principal'
            },
            {
                email: 'secretaria@amestica.cl',
                password: 'secretaria123',
                expectedRole: 'secretaria',
                expectedName: 'Secretaria Principal'
            },
            {
                email: 'tecnico@amestica.cl',
                password: 'tecnico123',
                expectedRole: 'tecnico',
                expectedName: 'Técnico Principal'
            }
        ];

        for (const cred of testCredentials) {
            console.log(`🔍 Probando login para: ${cred.email}`);

            try {
                // Buscar usuario
                const user = await prisma.user.findUnique({
                    where: { email: cred.email },
                    include: {
                        role: true,
                        company: true
                    }
                });

                if (!user) {
                    console.log(`❌ Usuario ${cred.email} no encontrado`);
                    continue;
                }

                // Verificar contraseña
                const passwordMatch = await bcrypt.compare(cred.password, user.password);

                if (!passwordMatch) {
                    console.log(`❌ Contraseña incorrecta para ${cred.email}`);
                    continue;
                }

                // Verificar rol
                if (user.role.name !== cred.expectedRole) {
                    console.log(`⚠️  Rol incorrecto para ${cred.email}. Esperado: ${cred.expectedRole}, Actual: ${user.role.name}`);
                }

                // Verificar nombre
                if (user.name !== cred.expectedName) {
                    console.log(`⚠️  Nombre incorrecto para ${cred.email}. Esperado: ${cred.expectedName}, Actual: ${user.name}`);
                }

                console.log(`✅ Login exitoso para ${cred.email}`);
                console.log(`   👤 Nombre: ${user.name}`);
                console.log(`   🎭 Rol: ${user.role.name}`);
                console.log(`   🏢 Empresa: ${user.company?.displayName || 'Sin empresa'}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   ✅ Activo: ${user.isActive ? 'Sí' : 'No'}`);
                console.log('');

            } catch (error) {
                console.log(`❌ Error al probar ${cred.email}: ${error.message}`);
            }
        }

        // Mostrar resumen del sistema
        console.log('📊 Resumen del sistema:');

        const totalUsers = await prisma.user.count();
        const totalRoles = await prisma.role.count();
        const totalCompanies = await prisma.company.count();
        const totalServices = await prisma.service.count();

        console.log(`   👥 Usuarios: ${totalUsers}`);
        console.log(`   🎭 Roles: ${totalRoles}`);
        console.log(`   🏢 Empresas: ${totalCompanies}`);
        console.log(`   🔧 Servicios: ${totalServices}`);

        console.log('\n🎉 ¡Todas las pruebas completadas!');
        console.log('\n📋 Para probar manualmente:');
        console.log('1. Ve a http://localhost:3000/login');
        console.log('2. Usa las credenciales mostradas arriba');
        console.log('3. Verifica que cada usuario tenga acceso a las funciones correctas');

    } catch (error) {
        console.log('❌ Error durante las pruebas:');
        console.log(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAllLogins().catch(console.error);
