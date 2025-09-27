const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function quickSetup() {
    try {
        console.log('🚀 Configuración rápida del sistema...\n');

        // 1. Crear roles
        console.log('📋 Creando roles...');
        await prisma.role.upsert({
            where: { name: 'administrador' },
            update: {},
            create: { name: 'administrador' }
        });

        await prisma.role.upsert({
            where: { name: 'secretaria' },
            update: {},
            create: { name: 'secretaria' }
        });

        await prisma.role.upsert({
            where: { name: 'tecnico' },
            update: {},
            create: { name: 'tecnico' }
        });
        console.log('✅ Roles creados\n');

        // 2. Crear empresas
        console.log('🏢 Creando empresas...');

        // Verificar si ya existen y crear si no existen
        let amestica = await prisma.company.findFirst({ where: { name: 'Amestica Ltda' } });
        if (!amestica) {
            amestica = await prisma.company.create({
                data: {
                    name: 'Amestica Ltda',
                    displayName: 'Amestica Ltda',
                    email: 'contacto@amestica.cl',
                    phone: '+56 9 1234 5678',
                    address: 'Santiago, Chile',
                    rut: '12.345.678-9',
                    type: 'AMESTICA',
                    service: 'Servicios de mantenimiento y reparación'
                }
            });
        }

        let multifugas = await prisma.company.findFirst({ where: { name: 'Multifugas' } });
        if (!multifugas) {
            multifugas = await prisma.company.create({
                data: {
                    name: 'Multifugas',
                    displayName: 'Multifugas',
                    email: 'contacto@multifugas.cl',
                    phone: '+56 9 2345 6789',
                    address: 'Santiago, Chile',
                    rut: '23.456.789-0',
                    type: 'MULTIFUGAS',
                    service: 'Servicios múltiples especializados'
                }
            });
        }

        let servifugas = await prisma.company.findFirst({ where: { name: 'Servifugas' } });
        if (!servifugas) {
            servifugas = await prisma.company.create({
                data: {
                    name: 'Servifugas',
                    displayName: 'Servifugas',
                    email: 'contacto@servifugas.cl',
                    phone: '+56 9 3456 7890',
                    address: 'Santiago, Chile',
                    rut: '34.567.890-1',
                    type: 'SERVIFUGAS',
                    service: 'Servicios especializados'
                }
            });
        }
        console.log('✅ Empresas creadas\n');

        // 3. Obtener roles
        const adminRole = await prisma.role.findUnique({ where: { name: 'administrador' } });
        const secretariaRole = await prisma.role.findUnique({ where: { name: 'secretaria' } });
        const tecnicoRole = await prisma.role.findUnique({ where: { name: 'tecnico' } });

        // 4. Crear usuarios
        console.log('👥 Creando usuarios...');

        // Administrador
        const adminPassword = await bcrypt.hash('admin123', 12);
        await prisma.user.upsert({
            where: { email: 'admin@amestica.cl' },
            update: { password: adminPassword },
            create: {
                email: 'admin@amestica.cl',
                password: adminPassword,
                name: 'Administrador',
                roleId: adminRole.id,
                companyId: amestica.id
            }
        });
        console.log('✅ Administrador: admin@amestica.cl / admin123');

        // Secretaria
        const secretariaPassword = await bcrypt.hash('secretaria123', 12);
        await prisma.user.upsert({
            where: { email: 'secretaria@amestica.cl' },
            update: { password: secretariaPassword },
            create: {
                email: 'secretaria@amestica.cl',
                password: secretariaPassword,
                name: 'Secretaria',
                roleId: secretariaRole.id,
                companyId: amestica.id
            }
        });
        console.log('✅ Secretaria: secretaria@amestica.cl / secretaria123');

        // Técnico
        const tecnicoPassword = await bcrypt.hash('tecnico123', 12);
        await prisma.user.upsert({
            where: { email: 'tecnico@amestica.cl' },
            update: { password: tecnicoPassword },
            create: {
                email: 'tecnico@amestica.cl',
                password: tecnicoPassword,
                name: 'Técnico',
                roleId: tecnicoRole.id,
                companyId: amestica.id
            }
        });
        console.log('✅ Técnico: tecnico@amestica.cl / tecnico123');

        // 5. Crear servicios básicos
        console.log('\n🔧 Creando servicios...');

        // Verificar si ya existen y crear si no existen
        let servicioAmestica = await prisma.service.findFirst({ where: { name: 'Servicio Amestica' } });
        if (!servicioAmestica) {
            await prisma.service.create({
                data: {
                    name: 'Servicio Amestica',
                    description: 'Servicio principal de Amestica',
                    price: 50000
                }
            });
        }

        let servicioMultifugas = await prisma.service.findFirst({ where: { name: 'Servicio Multifugas' } });
        if (!servicioMultifugas) {
            await prisma.service.create({
                data: {
                    name: 'Servicio Multifugas',
                    description: 'Servicio de Multifugas',
                    price: 45000
                }
            });
        }

        let servicioServifugas = await prisma.service.findFirst({ where: { name: 'Servicio Servifugas' } });
        if (!servicioServifugas) {
            await prisma.service.create({
                data: {
                    name: 'Servicio Servifugas',
                    description: 'Servicio de Servifugas',
                    price: 40000
                }
            });
        }
        console.log('✅ Servicios creados');

        console.log('\n🎉 ¡Configuración completada exitosamente!');
        console.log('\n📋 Resumen:');
        console.log('👑 Administrador: admin@amestica.cl / admin123');
        console.log('📝 Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('🔧 Técnico: tecnico@amestica.cl / tecnico123');
        console.log('\n🏢 Empresas:');
        console.log('• Amestica Ltda');
        console.log('• Multifugas');
        console.log('• Servifugas');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar
quickSetup()
    .then(() => {
        console.log('\n✅ Script ejecutado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error ejecutando script:', error);
        process.exit(1);
    });
