#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🚀 Configurando base de datos...');

async function setupDatabase() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
            }
        }
    });

    try {
        console.log('📋 Creando roles...');

        // Crear roles
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

        console.log('🏢 Creando empresas...');

        // Crear empresas
        const amestica = await prisma.company.upsert({
            where: { name: 'Amestica Ltda' },
            update: {},
            create: {
                name: 'Amestica Ltda',
                address: 'Dirección Amestica',
                phone: '+56 9 1234 5678',
                email: 'contacto@amestica.cl'
            }
        });

        const multifugas = await prisma.company.upsert({
            where: { name: 'Multifugas' },
            update: {},
            create: {
                name: 'Multifugas',
                address: 'Dirección Multifugas',
                phone: '+56 9 8765 4321',
                email: 'contacto@multifugas.cl'
            }
        });

        const servifugas = await prisma.company.upsert({
            where: { name: 'Servifugas' },
            update: {},
            create: {
                name: 'Servifugas',
                address: 'Dirección Servifugas',
                phone: '+56 9 1122 3344',
                email: 'contacto@servifugas.cl'
            }
        });

        console.log('👤 Creando usuarios...');

        // Obtener roles
        const adminRole = await prisma.role.findUnique({ where: { name: 'administrador' } });
        const secretariaRole = await prisma.role.findUnique({ where: { name: 'secretaria' } });
        const tecnicoRole = await prisma.role.findUnique({ where: { name: 'tecnico' } });

        // Crear usuarios
        await prisma.user.upsert({
            where: { email: 'admin@amestica.cl' },
            update: {},
            create: {
                email: 'admin@amestica.cl',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
                name: 'Administrador',
                roleId: adminRole.id,
                companyId: amestica.id
            }
        });

        await prisma.user.upsert({
            where: { email: 'secretaria@amestica.cl' },
            update: {},
            create: {
                email: 'secretaria@amestica.cl',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // secretaria123
                name: 'Secretaria',
                roleId: secretariaRole.id,
                companyId: amestica.id
            }
        });

        await prisma.user.upsert({
            where: { email: 'tecnico@amestica.cl' },
            update: {},
            create: {
                email: 'tecnico@amestica.cl',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // tecnico123
                name: 'Técnico',
                roleId: tecnicoRole.id,
                companyId: amestica.id
            }
        });

        console.log('✅ Base de datos configurada exitosamente');
        console.log('👤 Credenciales:');
        console.log('   Admin: admin@amestica.cl / admin123');
        console.log('   Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('   Técnico: tecnico@amestica.cl / tecnico123');

    } catch (error) {
        console.error('❌ Error configurando base de datos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
