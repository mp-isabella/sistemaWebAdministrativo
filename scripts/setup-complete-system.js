#!/usr/bin/env node

/**
 * Script para configurar el sistema completo con roles, empresas y usuarios
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupCompleteSystem() {
    console.log('🚀 Configurando sistema completo...\n');

    const prisma = new PrismaClient();

    try {
        // 1. Crear roles
        console.log('📝 Creando roles...');
        const roles = [
            { id: 'role-admin-001', name: 'admin' },
            { id: 'role-secretaria-001', name: 'secretaria' },
            { id: 'role-tecnico-001', name: 'tecnico' }
        ];

        for (const role of roles) {
            try {
                await prisma.role.upsert({
                    where: { name: role.name },
                    update: {},
                    create: role
                });
                console.log(`✅ Rol ${role.name} creado/actualizado`);
            } catch (error) {
                console.log(`⚠️  Rol ${role.name} ya existe, continuando...`);
            }
        }

        // 2. Crear empresas
        console.log('\n📝 Creando empresas...');
        const companies = [
            {
                id: 'company-amestica-001',
                name: 'AMESTICA LTDA',
                displayName: 'AMESTICA',
                email: 'contacto@amestica.cl',
                phone: '+56 9 1234 5678',
                address: 'Santiago, Chile',
                rut: '12345678-9',
                type: 'AMESTICA',
                service: 'Servicios de fumigación y control de plagas',
                primaryColor: '#1e40af',
                secondaryColor: '#3b82f6',
                accentColor: '#60a5fa',
                isActive: true
            },
            {
                id: 'company-multifugas-001',
                name: 'MULTIFUGAS',
                displayName: 'MULTIFUGAS',
                email: 'contacto@multifugas.cl',
                phone: '+56 9 2345 6789',
                address: 'Valparaíso, Chile',
                rut: '23456789-0',
                type: 'MULTIFUGAS',
                service: 'Servicios de fumigación especializada',
                primaryColor: '#059669',
                secondaryColor: '#10b981',
                accentColor: '#34d399',
                isActive: true
            },
            {
                id: 'company-servifugas-001',
                name: 'SERVIFUGAS',
                displayName: 'SERVIFUGAS',
                email: 'contacto@servifugas.cl',
                phone: '+56 9 3456 7890',
                address: 'Concepción, Chile',
                rut: '34567890-1',
                type: 'SERVIFUGAS',
                service: 'Servicios integrales de fumigación',
                primaryColor: '#dc2626',
                secondaryColor: '#ef4444',
                accentColor: '#f87171',
                isActive: true
            }
        ];

        for (const company of companies) {
            try {
                await prisma.company.upsert({
                    where: { id: company.id },
                    update: {},
                    create: company
                });
                console.log(`✅ Empresa ${company.displayName} creada/actualizada`);
            } catch (error) {
                console.log(`⚠️  Empresa ${company.displayName} ya existe, continuando...`);
            }
        }

        // 3. Crear usuarios
        console.log('\n📝 Creando usuarios...');
        const users = [
            {
                id: 'user-admin-001',
                email: 'admin@amestica.cl',
                name: 'Administrador Principal',
                password: 'admin123',
                roleId: 'role-admin-001',
                companyId: 'company-amestica-001'
            },
            {
                id: 'user-secretaria-001',
                email: 'secretaria@amestica.cl',
                name: 'Secretaria Principal',
                password: 'secretaria123',
                roleId: 'role-secretaria-001',
                companyId: 'company-amestica-001'
            },
            {
                id: 'user-tecnico-001',
                email: 'tecnico@amestica.cl',
                name: 'Técnico Principal',
                password: 'tecnico123',
                roleId: 'role-tecnico-001',
                companyId: 'company-amestica-001'
            }
        ];

        for (const user of users) {
            try {
                const hashedPassword = await bcrypt.hash(user.password, 10);

                await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        password: hashedPassword,
                        roleId: user.roleId,
                        companyId: user.companyId
                    },
                    create: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        password: hashedPassword,
                        isActive: true,
                        roleId: user.roleId,
                        companyId: user.companyId
                    }
                });
                console.log(`✅ Usuario ${user.name} creado/actualizado`);
            } catch (error) {
                console.log(`⚠️  Usuario ${user.name} ya existe, continuando...`);
            }
        }

        // 4. Crear servicios básicos
        console.log('\n📝 Creando servicios básicos...');
        const services = [
            {
                id: 'service-deteccion-fugas-001',
                name: 'Detección de Fugas de Agua',
                description: 'Servicio profesional de detección de fugas de agua en tuberías y sistemas hidráulicos',
                price: 80000,
                isActive: true
            },
            {
                id: 'service-destape-alcantarillado-001',
                name: 'Destape de Alcantarillado',
                description: 'Servicio de destape y limpieza de alcantarillado y sistemas de drenaje',
                price: 60000,
                isActive: true
            },
            {
                id: 'service-videoinspeccion-001',
                name: 'Videoinspección de Ductos',
                description: 'Servicio de videoinspección con cámara para inspeccionar ductos y tuberías',
                price: 100000,
                isActive: true
            }
        ];

        for (const service of services) {
            try {
                await prisma.service.upsert({
                    where: { id: service.id },
                    update: {},
                    create: service
                });
                console.log(`✅ Servicio ${service.name} creado/actualizado`);
            } catch (error) {
                console.log(`⚠️  Servicio ${service.name} ya existe, continuando...`);
            }
        }

        console.log('\n🎉 ¡Sistema configurado exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('👑 ADMINISTRADOR:');
        console.log('   Email: admin@amestica.cl');
        console.log('   Contraseña: admin123');
        console.log('   Empresa: AMESTICA LTDA');
        console.log('\n📝 SECRETARIA:');
        console.log('   Email: secretaria@amestica.cl');
        console.log('   Contraseña: secretaria123');
        console.log('   Empresa: AMESTICA LTDA');
        console.log('\n🔧 TÉCNICO:');
        console.log('   Email: tecnico@amestica.cl');
        console.log('   Contraseña: tecnico123');
        console.log('   Empresa: AMESTICA LTDA');
        console.log('\n🏢 Empresas creadas:');
        console.log('   • AMESTICA LTDA');
        console.log('   • MULTIFUGAS');
        console.log('   • SERVIFUGAS');
        console.log('\n📋 Próximos pasos:');
        console.log('1. Ve a http://localhost:3000/login');
        console.log('2. Prueba las credenciales de cada usuario');
        console.log('3. Verifica que cada rol tenga los permisos correctos');

    } catch (error) {
        console.log('❌ Error al configurar el sistema:');
        console.log(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setupCompleteSystem().catch(console.error);
