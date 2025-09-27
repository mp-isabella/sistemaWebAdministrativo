#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🚀 Configurando base de datos...');

async function setupDatabase() {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

    console.log('🔗 Using database URL:', databaseUrl.includes('supabase') ? 'Supabase' : 'Custom');

    const prisma = new PrismaClient({
        datasources: { db: { url: databaseUrl } }
    });

    try {
        console.log('📋 Creando roles...');

        // Crear roles
        await prisma.role.createMany({
            data: [
                { name: 'administrador' },
                { name: 'secretaria' },
                { name: 'tecnico' }
            ],
            skipDuplicates: true
        });

        console.log('🏢 Creando empresas...');

        // Crear empresas
        await prisma.company.createMany({
            data: [
                {
                    name: 'Amestica Ltda',
                    address: 'Dirección Amestica',
                    phone: '+56 9 1234 5678',
                    email: 'contacto@amestica.cl'
                },
                {
                    name: 'Multifugas',
                    address: 'Dirección Multifugas',
                    phone: '+56 9 8765 4321',
                    email: 'contacto@multifugas.cl'
                },
                {
                    name: 'Servifugas',
                    address: 'Dirección Servifugas',
                    phone: '+56 9 1122 3344',
                    email: 'contacto@servifugas.cl'
                }
            ],
            skipDuplicates: true
        });

        console.log('👤 Creando usuarios...');

        // Obtener IDs
        const adminRole = await prisma.role.findFirst({ where: { name: 'administrador' } });
        const secretariaRole = await prisma.role.findFirst({ where: { name: 'secretaria' } });
        const tecnicoRole = await prisma.role.findFirst({ where: { name: 'tecnico' } });
        const amestica = await prisma.company.findFirst({ where: { name: 'Amestica Ltda' } });

        // Crear usuarios
        await prisma.user.createMany({
            data: [
                {
                    email: 'admin@amestica.cl',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                    name: 'Administrador',
                    roleId: adminRole.id,
                    companyId: amestica.id
                },
                {
                    email: 'secretaria@amestica.cl',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                    name: 'Secretaria',
                    roleId: secretariaRole.id,
                    companyId: amestica.id
                },
                {
                    email: 'tecnico@amestica.cl',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                    name: 'Técnico',
                    roleId: tecnicoRole.id,
                    companyId: amestica.id
                }
            ],
            skipDuplicates: true
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

if (require.main === module) {
    setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
