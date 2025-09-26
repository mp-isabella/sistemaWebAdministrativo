#!/usr/bin/env node

/**
 * Script para crear el usuario administrador inicial
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    console.log('👤 Creando usuario administrador...\n');

    const prisma = new PrismaClient();

    try {
        // Crear rol de administrador
        console.log('📝 Creando rol de administrador...');
        const adminRole = await prisma.role.upsert({
            where: { name: 'admin' },
            update: {},
            create: {
                id: 'admin-role-001',
                name: 'admin'
            }
        });
        console.log('✅ Rol de administrador creado');

        // Crear empresa por defecto
        console.log('📝 Creando empresa por defecto...');
        const defaultCompany = await prisma.company.upsert({
            where: { id: 'company-001' },
            update: {},
            create: {
                id: 'company-001',
                name: 'AMESTICA SERVICIOS PROFESIONALES',
                displayName: 'AMESTICA',
                email: 'contacto@amestica.cl',
                phone: '+56 9 1234 5678',
                address: 'Santiago, Chile',
                rut: '12345678-9',
                isActive: true
            }
        });
        console.log('✅ Empresa creada');

        // Crear usuario administrador
        console.log('📝 Creando usuario administrador...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@amestica.cl' },
            update: {},
            create: {
                id: 'user-admin-001',
                email: 'admin@amestica.cl',
                name: 'Administrador',
                password: hashedPassword,
                isActive: true,
                roleId: adminRole.id,
                companyId: defaultCompany.id
            }
        });
        console.log('✅ Usuario administrador creado');

        console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
        console.log('📋 Credenciales de acceso:');
        console.log('• Email: admin@amestica.cl');
        console.log('• Contraseña: admin123');
        console.log('\n📋 Próximos pasos:');
        console.log('1. Ve a http://localhost:3001');
        console.log('2. Inicia sesión con las credenciales de arriba');

    } catch (error) {
        console.log('❌ Error al crear usuario administrador:');
        console.log(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser().catch(console.error);
