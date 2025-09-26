const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateRoles() {
    try {
        console.log('🧹 Limpiando roles duplicados...\n');

        // Obtener todos los roles
        const allRoles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`📊 Total de roles encontrados: ${allRoles.length}`);
        console.log('Roles actuales:');
        allRoles.forEach(role => {
            console.log(`  - ${role.name} (ID: ${role.id})`);
        });

        // Definir los 3 roles principales que queremos mantener
        const targetRoles = [
            'ADMINISTRADOR',
            'SECRETARIA',
            'TECNICO'
        ];

        // Crear los roles principales si no existen
        console.log('\n👥 Creando/actualizando roles principales...');

        for (const roleName of targetRoles) {
            // Buscar si ya existe un rol con este nombre
            let existingRole = await prisma.role.findFirst({
                where: { name: roleName }
            });

            if (existingRole) {
                console.log(`✅ ${existingRole.name} ya existe - ${existingRole.id}`);
            } else {
                // Crear nuevo rol
                const role = await prisma.role.create({
                    data: { name: roleName }
                });
                console.log(`✅ ${role.name} creado - ${role.id}`);
            }
        }

        // Eliminar roles que no son los principales
        console.log('\n🗑️ Eliminando roles duplicados...');

        const rolesToDelete = await prisma.role.findMany({
            where: {
                name: {
                    notIn: targetRoles
                }
            }
        });

        if (rolesToDelete.length > 0) {
            console.log(`Roles a eliminar (${rolesToDelete.length}):`);
            rolesToDelete.forEach(role => {
                console.log(`  - ${role.name} (ID: ${role.id})`);
            });

            // Verificar si hay usuarios asociados a estos roles
            for (const role of rolesToDelete) {
                const usersWithRole = await prisma.user.findMany({
                    where: { roleId: role.id }
                });

                if (usersWithRole.length > 0) {
                    console.log(`⚠️  El rol ${role.name} tiene ${usersWithRole.length} usuarios asociados.`);
                    console.log('   Reasignando usuarios a TECNICO...');

                    // Reasignar usuarios a TECNICO
                    const tecnicoRole = await prisma.role.findFirst({
                        where: { name: 'TECNICO' }
                    });

                    if (tecnicoRole) {
                        await prisma.user.updateMany({
                            where: { roleId: role.id },
                            data: { roleId: tecnicoRole.id }
                        });
                        console.log(`   ✅ Usuarios reasignados a ${tecnicoRole.name}`);
                    }
                }

                // Eliminar el rol
                await prisma.role.delete({
                    where: { id: role.id }
                });
                console.log(`   ✅ Rol ${role.name} eliminado`);
            }
        } else {
            console.log('✅ No hay roles duplicados para eliminar');
        }

        // Verificar el resultado final
        const finalRoles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });

        console.log('\n🎉 Limpieza completada!');
        console.log(`📊 Roles finales (${finalRoles.length}):`);
        finalRoles.forEach(role => {
            console.log(`  ✅ ${role.name} (ID: ${role.id})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

cleanDuplicateRoles()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
