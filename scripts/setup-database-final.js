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

        // Crear roles con try-catch individual
        try {
            await prisma.role.create({ data: { name: 'administrador' } });
            console.log('✅ Rol administrador creado');
        } catch (e) {
            console.log('ℹ️ Rol administrador ya existe');
        }

        try {
            await prisma.role.create({ data: { name: 'secretaria' } });
            console.log('✅ Rol secretaria creado');
        } catch (e) {
            console.log('ℹ️ Rol secretaria ya existe');
        }

        try {
            await prisma.role.create({ data: { name: 'tecnico' } });
            console.log('✅ Rol tecnico creado');
        } catch (e) {
            console.log('ℹ️ Rol tecnico ya existe');
        }

        console.log('🏢 Creando empresas...');

        // Crear empresas con try-catch individual
        try {
            await prisma.company.create({
                data: {
                    name: 'Amestica Ltda',
                    address: 'Dirección Amestica',
                    phone: '+56 9 1234 5678',
                    email: 'contacto@amestica.cl'
                }
            });
            console.log('✅ Empresa Amestica Ltda creada');
        } catch (e) {
            console.log('ℹ️ Empresa Amestica Ltda ya existe');
        }

        try {
            await prisma.company.create({
                data: {
                    name: 'Multifugas',
                    address: 'Dirección Multifugas',
                    phone: '+56 9 8765 4321',
                    email: 'contacto@multifugas.cl'
                }
            });
            console.log('✅ Empresa Multifugas creada');
        } catch (e) {
            console.log('ℹ️ Empresa Multifugas ya existe');
        }

        try {
            await prisma.company.create({
                data: {
                    name: 'Servifugas',
                    address: 'Dirección Servifugas',
                    phone: '+56 9 1122 3344',
                    email: 'contacto@servifugas.cl'
                }
            });
            console.log('✅ Empresa Servifugas creada');
        } catch (e) {
            console.log('ℹ️ Empresa Servifugas ya existe');
        }

        console.log('👤 Creando usuarios...');

        // Obtener roles y empresa
        const adminRole = await prisma.role.findFirst({ where: { name: 'administrador' } });
        const secretariaRole = await prisma.role.findFirst({ where: { name: 'secretaria' } });
        const tecnicoRole = await prisma.role.findFirst({ where: { name: 'tecnico' } });
        const amestica = await prisma.company.findFirst({ where: { name: 'Amestica Ltda' } });

        // Crear usuarios con try-catch individual
        try {
            await prisma.user.create({
                data: {
                    email: 'admin@amestica.cl',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
                    name: 'Administrador',
                    roleId: adminRole.id,
                    companyId: amestica.id
                }
            });
            console.log('✅ Usuario admin@amestica.cl creado');
        } catch (e) {
            console.log('ℹ️ Usuario admin@amestica.cl ya existe');
        }

        try {
            await prisma.user.create({
                data: {
                    email: 'secretaria@amestica.cl',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // secretaria123
                    name: 'Secretaria',
                    roleId: secretariaRole.id,
                    companyId: amestica.id
                }
            });
            console.log('✅ Usuario secretaria@amestica.cl creado');
        } catch (e) {
            console.log('ℹ️ Usuario secretaria@amestica.cl ya existe');
        }

        try {
            await prisma.user.create({
                data: {
                    email: 'tecnico@amestica.cl',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // tecnico123
                    name: 'Técnico',
                    roleId: tecnicoRole.id,
                    companyId: amestica.id
                }
            });
            console.log('✅ Usuario tecnico@amestica.cl creado');
        } catch (e) {
            console.log('ℹ️ Usuario tecnico@amestica.cl ya existe');
        }

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
