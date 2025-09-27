#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🚀 Configurando base de datos...');

async function setupDatabase() {
    // Forzar uso de URL real de Supabase
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

    console.log('🔗 Using database URL:', databaseUrl.includes('supabase') ? 'Supabase' : 'Custom');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl
            }
        }
    });

    try {
        console.log('📋 Creando roles...');

        // Crear roles
        let adminRole = await prisma.role.findFirst({ where: { name: 'administrador' } });
        if (!adminRole) {
            adminRole = await prisma.role.create({ data: { name: 'administrador' } });
        }

        let secretariaRole = await prisma.role.findFirst({ where: { name: 'secretaria' } });
        if (!secretariaRole) {
            secretariaRole = await prisma.role.create({ data: { name: 'secretaria' } });
        }

        let tecnicoRole = await prisma.role.findFirst({ where: { name: 'tecnico' } });
        if (!tecnicoRole) {
            tecnicoRole = await prisma.role.create({ data: { name: 'tecnico' } });
        }

        console.log('🏢 Creando empresas...');

        // Crear empresas
        let amestica = await prisma.company.findFirst({ where: { name: 'Amestica Ltda' } });
        if (!amestica) {
            amestica = await prisma.company.create({
                data: {
                    name: 'Amestica Ltda',
                    address: 'Dirección Amestica',
                    phone: '+56 9 1234 5678',
                    email: 'contacto@amestica.cl'
                }
            });
        }

        let multifugas = await prisma.company.findFirst({ where: { name: 'Multifugas' } });
        if (!multifugas) {
            multifugas = await prisma.company.create({
                data: {
                    name: 'Multifugas',
                    address: 'Dirección Multifugas',
                    phone: '+56 9 8765 4321',
                    email: 'contacto@multifugas.cl'
                }
            });
        }

        let servifugas = await prisma.company.findFirst({ where: { name: 'Servifugas' } });
        if (!servifugas) {
            servifugas = await prisma.company.create({
                data: {
                    name: 'Servifugas',
                    address: 'Dirección Servifugas',
                    phone: '+56 9 1122 3344',
                    email: 'contacto@servifugas.cl'
                }
            });
        }

        console.log('👤 Creando usuarios...');

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
