#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
        }
    }
});

async function cleanAndSetupDatabase() {
    console.log('🧹 Limpiando y configurando base de datos...\n');

    try {
        // 1. Limpiar datos existentes
        console.log('🗑️ Eliminando datos existentes...');
        await prisma.job.deleteMany();
        await prisma.client.deleteMany();
        await prisma.service.deleteMany();
        await prisma.user.deleteMany();
        await prisma.company.deleteMany();
        await prisma.role.deleteMany();
        console.log('✅ Datos eliminados');

        // 2. Crear roles (solo 3)
        console.log('\n👥 Creando roles...');
        const roles = [
            { name: 'ADMIN' },
            { name: 'SECRETARIA' },
            { name: 'TECNICO' }
        ];

        for (const roleData of roles) {
            await prisma.role.create({ data: roleData });
            console.log(`   ✅ Rol creado: ${roleData.name}`);
        }

        // 3. Crear empresas (solo 3)
        console.log('\n🏢 Creando empresas...');
        const companies = [
            { name: 'Amestica Ltda', description: 'Empresa principal' },
            { name: 'Multifugas', description: 'Empresa de servicios' },
            { name: 'Servifugas', description: 'Empresa de servicios' }
        ];

        for (const companyData of companies) {
            await prisma.company.create({ data: companyData });
            console.log(`   ✅ Empresa creada: ${companyData.name}`);
        }

        // 4. Crear servicios (solo 3)
        console.log('\n🔧 Creando servicios...');
        const services = [
            { name: 'Detección de fugas de agua', description: 'Servicio de detección de fugas', price: 50000, isActive: true },
            { name: 'Destape de alcantarillado', description: 'Servicio de destape de alcantarillado', price: 75000, isActive: true },
            { name: 'Videoinspeccion de ductos', description: 'Servicio de videoinspección', price: 100000, isActive: true }
        ];

        for (const serviceData of services) {
            await prisma.service.create({ data: serviceData });
            console.log(`   ✅ Servicio creado: ${serviceData.name}`);
        }

        // 5. Crear usuarios (solo 3)
        console.log('\n👤 Creando usuarios...');

        // Obtener roles para asignar
        const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        const secretariaRole = await prisma.role.findUnique({ where: { name: 'SECRETARIA' } });
        const tecnicoRole = await prisma.role.findUnique({ where: { name: 'TECNICO' } });

        const users = [
            {
                name: 'Administrador',
                email: 'admin@amestica.cl',
                password: await bcrypt.hash('admin123', 12),
                roleId: adminRole.id,
                isActive: true
            },
            {
                name: 'Secretaria',
                email: 'secretaria@amestica.cl',
                password: await bcrypt.hash('secretaria123', 12),
                roleId: secretariaRole.id,
                isActive: true
            },
            {
                name: 'Técnico',
                email: 'tecnico@amestica.cl',
                password: await bcrypt.hash('tecnico123', 12),
                roleId: tecnicoRole.id,
                isActive: true
            }
        ];

        for (const userData of users) {
            await prisma.user.create({ data: userData });
            console.log(`   ✅ Usuario creado: ${userData.name} (${userData.email})`);
        }

        // 6. Crear algunos clientes de ejemplo
        console.log('\n👥 Creando clientes de ejemplo...');
        const clients = [
            {
                name: 'Juan Pérez',
                email: 'juan.perez@email.com',
                phone: '+56912345678',
                address: 'Av. Principal 123, Santiago',
                status: 'active'
            },
            {
                name: 'María González',
                email: 'maria.gonzalez@email.com',
                phone: '+56987654321',
                address: 'Calle Secundaria 456, Valparaíso',
                status: 'active'
            },
            {
                name: 'Carlos Silva',
                email: 'carlos.silva@email.com',
                phone: '+56911223344',
                address: 'Plaza Central 789, Concepción',
                status: 'active'
            }
        ];

        for (const clientData of clients) {
            await prisma.client.create({ data: clientData });
            console.log(`   ✅ Cliente creado: ${clientData.name}`);
        }

        // 7. Verificar datos creados
        console.log('\n📊 Verificando datos creados...');
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

        console.log('\n✅ Base de datos configurada correctamente!');
        console.log('\n🔑 Credenciales de acceso:');
        console.log('   Administrador: admin@amestica.cl / admin123');
        console.log('   Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('   Técnico: tecnico@amestica.cl / tecnico123');

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanAndSetupDatabase();
