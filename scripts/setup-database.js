const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
    try {
        console.log('🔧 Configurando base de datos...');

        // Crear roles
        console.log('📝 Creando roles...');
        const adminRole = await prisma.role.upsert({
            where: { name: 'administrador' },
            update: {},
            create: { name: 'administrador' }
        });

        const secretaryRole = await prisma.role.upsert({
            where: { name: 'secretaria' },
            update: {},
            create: { name: 'secretaria' }
        });

        const techRole = await prisma.role.upsert({
            where: { name: 'tecnico' },
            update: {},
            create: { name: 'tecnico' }
        });

        console.log('✅ Roles creados');

        // Crear usuarios
        console.log('👥 Creando usuarios...');

        const hashedAdminPassword = await bcrypt.hash('admin123', 12);
        const hashedSecretaryPassword = await bcrypt.hash('secretaria123', 12);
        const hashedTechPassword = await bcrypt.hash('tecnico123', 12);

        const admin = await prisma.user.upsert({
            where: { email: 'admin@amestica.cl' },
            update: {},
            create: {
                email: 'admin@amestica.cl',
                name: 'Administrador',
                password: hashedAdminPassword,
                roleId: adminRole.id,
                isActive: true
            }
        });

        const secretary = await prisma.user.upsert({
            where: { email: 'secretaria@amestica.cl' },
            update: {},
            create: {
                email: 'secretaria@amestica.cl',
                name: 'Secretaria',
                password: hashedSecretaryPassword,
                roleId: secretaryRole.id,
                isActive: true
            }
        });

        const technician = await prisma.user.upsert({
            where: { email: 'tecnico@amestica.cl' },
            update: {},
            create: {
                email: 'tecnico@amestica.cl',
                name: 'Técnico',
                password: hashedTechPassword,
                roleId: techRole.id,
                isActive: true
            }
        });

        console.log('✅ Usuarios creados:');
        console.log(`- ${admin.email} (${admin.name})`);
        console.log(`- ${secretary.email} (${secretary.name})`);
        console.log(`- ${technician.email} (${technician.name})`);

        console.log('🎉 Base de datos configurada correctamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setupDatabase();
