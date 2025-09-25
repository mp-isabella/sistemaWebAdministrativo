#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
    console.log('🔐 Creando usuarios en la base de datos...');

    try {
        // Crear roles primero
        console.log('📋 Creando roles...');

        const adminRole = await prisma.role.upsert({
            where: { name: 'ADMIN' },
            update: {},
            create: {
                name: 'ADMIN',
            },
        });
        console.log('✅ Rol ADMIN creado');

        const secretaryRole = await prisma.role.upsert({
            where: { name: 'SECRETARIA' },
            update: {},
            create: {
                name: 'SECRETARIA',
            },
        });
        console.log('✅ Rol SECRETARIA creado');

        const technicianRole = await prisma.role.upsert({
            where: { name: 'TECNICO' },
            update: {},
            create: {
                name: 'TECNICO',
            },
        });
        console.log('✅ Rol TECNICO creado');

        // Crear empresa
        console.log('🏢 Creando empresa...');
        let company = await prisma.company.findFirst({
            where: { name: 'AMESTICA SERVICIOS PROFESIONALES' },
        });

        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: 'AMESTICA SERVICIOS PROFESIONALES',
                    displayName: 'AMESTICA',
                    email: 'contacto@amestica.cl',
                    phone: '+56 9 1234 5678',
                    address: 'Santiago, Chile',
                    type: 'AMESTICA',
                    service: 'Servicios Profesionales',
                    primaryColor: '#2563eb',
                    secondaryColor: '#1e40af',
                    accentColor: '#3b82f6',
                    isActive: true,
                },
            });
            console.log('✅ Empresa AMESTICA creada');
        } else {
            console.log('✅ Empresa AMESTICA ya existe');
        }

        // Crear usuarios
        console.log('👥 Creando usuarios...');

        // Administrador
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@amestica.cl' },
            update: {},
            create: {
                email: 'admin@amestica.cl',
                name: 'Administrador',
                phone: '+56 9 1234 5678',
                password: adminPassword,
                isActive: true,
                roleId: adminRole.id,
                companyId: company.id,
            },
        });
        console.log('✅ Usuario ADMIN creado: admin@amestica.cl');

        // Secretaria
        const secretaryPassword = await bcrypt.hash('secretaria123', 10);
        const secretary = await prisma.user.upsert({
            where: { email: 'secretaria@amestica.cl' },
            update: {},
            create: {
                email: 'secretaria@amestica.cl',
                name: 'Secretaria',
                phone: '+56 9 1234 5679',
                password: secretaryPassword,
                isActive: true,
                roleId: secretaryRole.id,
                companyId: company.id,
            },
        });
        console.log('✅ Usuario SECRETARIA creado: secretaria@amestica.cl');

        // Técnico
        const technicianPassword = await bcrypt.hash('tecnico123', 10);
        const technician = await prisma.user.upsert({
            where: { email: 'tecnico@amestica.cl' },
            update: {},
            create: {
                email: 'tecnico@amestica.cl',
                name: 'Técnico',
                phone: '+56 9 1234 5680',
                password: technicianPassword,
                isActive: true,
                roleId: technicianRole.id,
                companyId: company.id,
            },
        });
        console.log('✅ Usuario TECNICO creado: tecnico@amestica.cl');

        console.log('');
        console.log('🎉 ¡Usuarios creados exitosamente!');
        console.log('');
        console.log('📋 Credenciales de acceso:');
        console.log('👑 Administrador: admin@amestica.cl / admin123');
        console.log('📝 Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('🔧 Técnico: tecnico@amestica.cl / tecnico123');
        console.log('');
        console.log('✅ Ahora puedes hacer login con cualquiera de estas credenciales');

    } catch (error) {
        console.error('❌ Error creando usuarios:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
createUsers()
    .then(() => {
        console.log('✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error en el script:', error);
        process.exit(1);
    });
