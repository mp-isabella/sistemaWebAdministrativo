const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateRoles() {
  try {
    console.log('🧹 Iniciando limpieza de roles duplicados...');

    // Obtener todos los roles
    const allRoles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('📋 Roles encontrados:', allRoles.map(r => ({ id: r.id, name: r.name })));

    // Agrupar por nombre (case-insensitive)
    const roleGroups = {};
    allRoles.forEach(role => {
      const normalizedName = role.name.toUpperCase();
      if (!roleGroups[normalizedName]) {
        roleGroups[normalizedName] = [];
      }
      roleGroups[normalizedName].push(role);
    });

    // Encontrar duplicados (case-insensitive)
    const duplicates = Object.entries(roleGroups)
      .filter(([name, roles]) => roles.length > 1)
      .map(([name, roles]) => ({ name, roles }));

    if (duplicates.length === 0) {
      console.log('✅ No se encontraron roles duplicados');
      return;
    }

    console.log('⚠️ Roles duplicados encontrados:', duplicates);

    // Limpiar duplicados
    for (const { name, roles } of duplicates) {
      console.log(`🔄 Limpiando duplicados para rol: ${name}`);
      
      // Mantener el rol con nombre en mayúsculas, eliminar los demás
      const keepRole = roles.find(r => r.name === r.name.toUpperCase()) || roles[0];
      const duplicateRoles = roles.filter(r => r.id !== keepRole.id);
      
      console.log(`   Manteniendo: ${keepRole.id} (${keepRole.name})`);
      
      for (const duplicateRole of duplicateRoles) {
        console.log(`   Eliminando: ${duplicateRole.id} (${duplicateRole.name})`);
        
        // Actualizar usuarios que usan el rol duplicado
        await prisma.user.updateMany({
          where: { roleId: duplicateRole.id },
          data: { roleId: keepRole.id }
        });
        
        // Eliminar el rol duplicado
        await prisma.role.delete({
          where: { id: duplicateRole.id }
        });
      }
    }

    console.log('✅ Limpieza completada');

    // Verificar resultado
    const finalRoles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('📋 Roles finales:', finalRoles.map(r => ({ id: r.id, name: r.name })));

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateRoles();
