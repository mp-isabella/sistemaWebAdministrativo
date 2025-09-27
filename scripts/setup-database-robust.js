#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupDatabaseRobust() {
    console.log('🔧 Configurando base de datos de forma robusta...\n');

    let prisma;

    try {
        // Crear instancia de Prisma con configuración robusta
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
                }
            },
            log: ['error', 'warn'],
        });

        // Probar conexión
        console.log('🔗 Probando conexión a la base de datos...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');

        // Verificar si ya existen datos
        console.log('\n📊 Verificando datos existentes...');

        const roleCount = await prisma.role.count();
        const userCount = await prisma.user.count();
        const companyCount = await prisma.company.count();
        const serviceCount = await prisma.service.count();
        const clientCount = await prisma.client.count();

        console.log(`   Roles: ${roleCount}`);
        console.log(`   Usuarios: ${userCount}`);
        console.log(`   Empresas: ${companyCount}`);
        console.log(`   Servicios: ${serviceCount}`);
        console.log(`   Clientes: ${clientCount}`);

        // Solo crear datos si no existen
        if (roleCount === 0) {
            console.log('\n👥 Creando roles...');
            await prisma.role.create({ data: { name: 'ADMIN' } });
            await prisma.role.create({ data: { name: 'SECRETARIA' } });
            await prisma.role.create({ data: { name: 'TECNICO' } });
            console.log('   ✅ Roles creados');
        } else {
            console.log('   ℹ️ Roles ya existen');
        }

        if (companyCount === 0) {
            console.log('\n🏢 Creando empresas...');
            await prisma.company.create({ data: { name: 'Amestica Ltda' } });
            await prisma.company.create({ data: { name: 'Multifugas' } });
            await prisma.company.create({ data: { name: 'Servifugas' } });
            console.log('   ✅ Empresas creadas');
        } else {
            console.log('   ℹ️ Empresas ya existen');
        }

        if (serviceCount === 0) {
            console.log('\n🔧 Creando servicios...');
            await prisma.service.create({
                data: {
                    name: 'Detección de fugas de agua',
                    description: 'Servicio de detección de fugas',
                    price: 50000,
                    isActive: true
                }
            });
            await prisma.service.create({
                data: {
                    name: 'Destape de alcantarillado',
                    description: 'Servicio de destape de alcantarillado',
                    price: 75000,
                    isActive: true
                }
            });
            await prisma.service.create({
                data: {
                    name: 'Videoinspeccion de ductos',
                    description: 'Servicio de videoinspección',
                    price: 100000,
                    isActive: true
                }
            });
            console.log('   ✅ Servicios creados');
        } else {
            console.log('   ℹ️ Servicios ya existen');
        }

        if (userCount === 0) {
            console.log('\n👤 Creando usuarios...');

            const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
            const secretariaRole = await prisma.role.findUnique({ where: { name: 'SECRETARIA' } });
            const tecnicoRole = await prisma.role.findUnique({ where: { name: 'TECNICO' } });

            if (adminRole && secretariaRole && tecnicoRole) {
                await prisma.user.create({
                    data: {
                        name: 'Administrador',
                        email: 'admin@amestica.cl',
                        password: await bcrypt.hash('admin123', 12),
                        roleId: adminRole.id,
                        isActive: true
                    }
                });

                await prisma.user.create({
                    data: {
                        name: 'Secretaria',
                        email: 'secretaria@amestica.cl',
                        password: await bcrypt.hash('secretaria123', 12),
                        roleId: secretariaRole.id,
                        isActive: true
                    }
                });

                await prisma.user.create({
                    data: {
                        name: 'Técnico',
                        email: 'tecnico@amestica.cl',
                        password: await bcrypt.hash('tecnico123', 12),
                        roleId: tecnicoRole.id,
                        isActive: true
                    }
                });

                console.log('   ✅ Usuarios creados');
            } else {
                console.log('   ❌ No se pudieron encontrar los roles necesarios');
            }
        } else {
            console.log('   ℹ️ Usuarios ya existen');
        }

        if (clientCount === 0) {
            console.log('\n👥 Creando clientes de ejemplo...');

            await prisma.client.create({
                data: {
                    name: 'Juan Pérez',
                    email: 'juan.perez@email.com',
                    phone: '+56912345678',
                    address: 'Av. Principal 123, Santiago',
                    status: 'active'
                }
            });

            await prisma.client.create({
                data: {
                    name: 'María González',
                    email: 'maria.gonzalez@email.com',
                    phone: '+56987654321',
                    address: 'Calle Secundaria 456, Valparaíso',
                    status: 'active'
                }
            });

            await prisma.client.create({
                data: {
                    name: 'Carlos Silva',
                    email: 'carlos.silva@email.com',
                    phone: '+56911223344',
                    address: 'Plaza Central 789, Concepción',
                    status: 'active'
                }
            });

            console.log('   ✅ Clientes creados');
        } else {
            console.log('   ℹ️ Clientes ya existen');
        }

        // Verificación final
        console.log('\n📊 Verificación final...');
        const finalRoleCount = await prisma.role.count();
        const finalUserCount = await prisma.user.count();
        const finalCompanyCount = await prisma.company.count();
        const finalServiceCount = await prisma.service.count();
        const finalClientCount = await prisma.client.count();

        console.log(`   Roles: ${finalRoleCount}`);
        console.log(`   Usuarios: ${finalUserCount}`);
        console.log(`   Empresas: ${finalCompanyCount}`);
        console.log(`   Servicios: ${finalServiceCount}`);
        console.log(`   Clientes: ${finalClientCount}`);

        console.log('\n✅ Base de datos configurada correctamente!');
        console.log('\n🔑 Credenciales de acceso:');
        console.log('   Administrador: admin@amestica.cl / admin123');
        console.log('   Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('   Técnico: tecnico@amestica.cl / tecnico123');

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);

        if (error.code === 'P1001') {
            console.log('   🔍 Error de conexión a la base de datos');
            console.log('   💡 Verifica que la URL de la base de datos sea correcta');
        } else if (error.code === 'P1002') {
            console.log('   🔍 Error de autenticación');
            console.log('   💡 Verifica las credenciales de la base de datos');
        } else if (error.code === 'P1003') {
            console.log('   🔍 Base de datos no encontrada');
            console.log('   💡 Verifica que la base de datos exista');
        } else {
            console.log(`   🔍 Error: ${error.message}`);
        }
    } finally {
        if (prisma) {
            try {
                await prisma.$disconnect();
                console.log('\n🔌 Conexión cerrada correctamente');
            } catch (disconnectError) {
                console.log('⚠️ Error cerrando conexión:', disconnectError.message);
            }
        }
    }
}

setupDatabaseRobust();
