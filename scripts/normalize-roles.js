const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function normalizeRoles() {
  try {
    console.log('🔄 Normalizando nombres de roles...');

    // Obtener todos los roles
    const allRoles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('📋 Roles actuales:', allRoles.map(r => ({ id: r.id, name: r.name })));

    // Normalizar roles que no están en mayúsculas
    for (const role of allRoles) {
      if (role.name !== role.name.toUpperCase()) {
        console.log(`🔄 Normalizando: ${role.name} -> ${role.name.toUpperCase()}`);
        
        await prisma.role.update({
          where: { id: role.id },
          data: { name: role.name.toUpperCase() }
        });
      }
    }

    console.log('✅ Normalización completada');

    // Verificar resultado
    const finalRoles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('📋 Roles finales:', finalRoles.map(r => ({ id: r.id, name: r.name })));

  } catch (error) {
    console.error('❌ Error durante la normalización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

normalizeRoles();
