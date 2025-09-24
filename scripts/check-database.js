const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Verificando conexión a la base de datos...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');

        console.log('🔍 Verificando usuarios...');
        const users = await prisma.user.findMany({
            include: { role: true }
        });

        console.log(`📊 Usuarios encontrados: ${users.length}`);
        users.forEach(user => {
            console.log(`- ${user.email} (${user.name}) - Rol: ${user.role?.name || 'Sin rol'}`);
        });

        console.log('🔍 Verificando roles...');
        const roles = await prisma.role.findMany();
        console.log(`📊 Roles encontrados: ${roles.length}`);
        roles.forEach(role => {
            console.log(`- ${role.name}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
