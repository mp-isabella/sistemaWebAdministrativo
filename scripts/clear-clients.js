const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearClients() {
  console.log('🗑️ ELIMINANDO CLIENTES ACTUALES...');
  console.log('');

  try {
    // Primero eliminar trabajos asociados a clientes
    console.log('1. Eliminando trabajos asociados...');
    const deletedJobs = await prisma.job.deleteMany({});
    console.log(`   ✅ ${deletedJobs.count} trabajos eliminados`);

    // Luego eliminar clientes
    console.log('2. Eliminando clientes...');
    const deletedClients = await prisma.client.deleteMany({});
    console.log(`   ✅ ${deletedClients.count} clientes eliminados`);

    console.log('');
    console.log('🎉 LIMPIEZA COMPLETADA');
    console.log('');
    console.log('📊 RESUMEN:');
    console.log(`   - Trabajos eliminados: ${deletedJobs.count}`);
    console.log(`   - Clientes eliminados: ${deletedClients.count}`);
    console.log('');
    console.log('✨ Ahora puedes crear nuevos clientes desde cero');
    console.log('👥 Los técnicos se cargarán automáticamente desde la sección de trabajadores');

  } catch (error) {
    console.error('❌ Error eliminando clientes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
clearClients().catch(console.error);
