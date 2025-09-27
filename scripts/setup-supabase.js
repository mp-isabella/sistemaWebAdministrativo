const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Configurar Prisma para usar Supabase
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
        }
    }
});

async function setupSupabase() {
    try {
        console.log('🚀 Configurando base de datos Supabase...');

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
        console.log('✅ Roles creados');

        // 2. Crear empresas
        console.log('🏢 Creando empresas...');

        const amestica = await prisma.company.upsert({
            where: { name: 'Amestica Ltda' },
            update: {},
            create: {
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

        const multifugas = await prisma.company.upsert({
            where: { name: 'Multifugas' },
            update: {},
            create: {
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

        const servifugas = await prisma.company.upsert({
            where: { name: 'Servifugas' },
            update: {},
            create: {
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
        console.log('✅ Empresas creadas');

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

        // 5. Crear servicios
        console.log('🔧 Creando servicios...');

        await prisma.service.upsert({
            where: { name: 'Servicio Amestica' },
            update: {},
            create: {
                name: 'Servicio Amestica',
                description: 'Servicio principal de Amestica',
                price: 50000
            }
        });

        await prisma.service.upsert({
            where: { name: 'Servicio Multifugas' },
            update: {},
            create: {
                name: 'Servicio Multifugas',
                description: 'Servicio de Multifugas',
                price: 45000
            }
        });

        await prisma.service.upsert({
            where: { name: 'Servicio Servifugas' },
            update: {},
            create: {
                name: 'Servicio Servifugas',
                description: 'Servicio de Servifugas',
                price: 40000
            }
        });
        console.log('✅ Servicios creados');

        console.log('\n🎉 ¡Base de datos Supabase configurada exitosamente!');
        console.log('\n📋 Credenciales:');
        console.log('👑 Administrador: admin@amestica.cl / admin123');
        console.log('📝 Secretaria: secretaria@amestica.cl / secretaria123');
        console.log('🔧 Técnico: tecnico@amestica.cl / tecnico123');

    } catch (error) {
        console.error('❌ Error configurando Supabase:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    setupSupabase()
        .then(() => {
            console.log('✅ Script ejecutado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error ejecutando script:', error);
            process.exit(1);
        });
}

module.exports = { setupSupabase };