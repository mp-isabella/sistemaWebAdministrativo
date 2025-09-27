const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupInitialData() {
    try {
        console.log('🚀 Iniciando configuración de datos iniciales...');

        // 1. Crear roles si no existen
        console.log('📋 Configurando roles...');

        const roles = [
            { name: 'administrador', description: 'Administrador del sistema' },
            { name: 'secretaria', description: 'Secretaria del sistema' },
            { name: 'tecnico', description: 'Técnico del sistema' }
        ];

        for (const roleData of roles) {
            await prisma.role.upsert({
                where: { name: roleData.name },
                update: {},
                create: roleData
            });
            console.log(`✅ Rol ${roleData.name} configurado`);
        }

        // 2. Crear empresas
        console.log('🏢 Creando empresas...');

        const companies = [
            {
                name: 'Amestica Ltda',
                displayName: 'Amestica Ltda',
                email: 'contacto@amestica.cl',
                phone: '+56 9 1234 5678',
                address: 'Santiago, Chile',
                rut: '12.345.678-9',
                type: 'AMESTICA',
                service: 'Servicios de mantenimiento y reparación'
            },
            {
                name: 'Multifugas',
                displayName: 'Multifugas',
                email: 'contacto@multifugas.cl',
                phone: '+56 9 2345 6789',
                address: 'Santiago, Chile',
                rut: '23.456.789-0',
                type: 'MULTIFUGAS',
                service: 'Servicios múltiples especializados'
            },
            {
                name: 'Servifugas',
                displayName: 'Servifugas',
                email: 'contacto@servifugas.cl',
                phone: '+56 9 3456 7890',
                address: 'Santiago, Chile',
                rut: '34.567.890-1',
                type: 'SERVIFUGAS',
                service: 'Servicios especializados'
            }
        ];

        const createdCompanies = [];
        for (const companyData of companies) {
            const company = await prisma.company.upsert({
                where: { name: companyData.name },
                update: {},
                create: companyData
            });
            createdCompanies.push(company);
            console.log(`✅ Empresa ${companyData.name} creada`);
        }

        // 3. Crear usuarios con credenciales específicas
        console.log('👥 Creando usuarios...');

        const users = [
            {
                email: 'admin@amestica.cl',
                password: 'admin123',
                name: 'Administrador',
                role: 'administrador',
                companyId: createdCompanies[0].id // Amestica Ltda
            },
            {
                email: 'secretaria@amestica.cl',
                password: 'secretaria123',
                name: 'Secretaria',
                role: 'secretaria',
                companyId: createdCompanies[0].id // Amestica Ltda
            },
            {
                email: 'tecnico@amestica.cl',
                password: 'tecnico123',
                name: 'Técnico',
                role: 'tecnico',
                companyId: createdCompanies[0].id // Amestica Ltda
            }
        ];

        for (const userData of users) {
            // Buscar el rol
            const role = await prisma.role.findUnique({
                where: { name: userData.role }
            });

            if (!role) {
                throw new Error(`Rol ${userData.role} no encontrado`);
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 12);

            // Crear o actualizar usuario
            const user = await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    password: hashedPassword,
                    name: userData.name,
                    roleId: role.id,
                    companyId: userData.companyId
                },
                create: {
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    roleId: role.id,
                    companyId: userData.companyId
                }
            });

            console.log(`✅ Usuario ${userData.email} creado/actualizado`);
        }

        // 4. Crear servicios básicos para cada empresa
        console.log('🔧 Creando servicios...');

        const services = [
            { name: 'Servicio Amestica', description: 'Servicio principal de Amestica', price: 50000, companyId: createdCompanies[0].id },
            { name: 'Servicio Multifugas', description: 'Servicio de Multifugas', price: 45000, companyId: createdCompanies[1].id },
            { name: 'Servicio Servifugas', description: 'Servicio de Servifugas', price: 40000, companyId: createdCompanies[2].id }
        ];

        for (const serviceData of services) {
            await prisma.service.upsert({
                where: {
                    name_companyId: {
                        name: serviceData.name,
                        companyId: serviceData.companyId
                    }
                },
                update: {},
                create: serviceData
            });
            console.log(`✅ Servicio ${serviceData.name} creado`);
        }

        console.log('\n🎉 ¡Configuración completada exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('👑 Administrador: admin@amestica.cl / admin123');
        console.log('📝 Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('🔧 Técnico: tecnico@amestica.cl / tecnico123');
        console.log('\n🏢 Empresas creadas:');
        console.log('• Amestica Ltda');
        console.log('• Multifugas');
        console.log('• Servifugas');

    } catch (error) {
        console.error('❌ Error en la configuración:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    setupInitialData()
        .then(() => {
            console.log('✅ Script ejecutado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error ejecutando script:', error);
            process.exit(1);
        });
}

module.exports = { setupInitialData };
