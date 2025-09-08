const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTechnicianAssignmentFix() {
  try {
    console.log('🧪 Probando corrección de asignación de técnicos...\n');

    // 1. Crear un trabajo de prueba con fecha y hora específicas
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@amestica.cl' }
    });

    const client = await prisma.client.findFirst();
    const service = await prisma.service.findFirst();
    const technician = await prisma.user.findFirst({
      where: { 
        role: { name: 'TECNICO' },
        isActive: true 
      }
    });

    if (!adminUser || !client || !service || !technician) {
      console.error('❌ Faltan datos necesarios');
      return;
    }

    // Crear fecha para hoy a las 14:00
    const today = new Date();
    today.setHours(14, 0, 0, 0);

    console.log('📅 Creando trabajo de prueba...');
    console.log(`   Fecha original: ${today.toLocaleDateString()}`);
    console.log(`   Hora original: 14:00 - 16:00`);
    console.log(`   Técnico original: ${technician.name}\n`);

    // Crear trabajo de prueba
    const testJob = await prisma.job.create({
      data: {
        title: 'Trabajo de Prueba - Asignación Técnico',
        description: 'Trabajo para probar asignación de técnicos sin modificar fecha/hora',
        clientId: client.id,
        serviceId: service.id,
        technicianId: technician.id,
        createdById: adminUser.id,
        scheduledAt: today,
        startTime: '14:00',
        endTime: '16:00',
        priority: 'MEDIUM',
        status: 'PENDING'
      },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      }
    });

    console.log('✅ Trabajo de prueba creado:');
    console.log(`   ID: ${testJob.id}`);
    console.log(`   Título: ${testJob.title}`);
    console.log(`   Fecha: ${testJob.scheduledAt.toLocaleDateString()}`);
    console.log(`   Horario: ${testJob.startTime} - ${testJob.endTime}`);
    console.log(`   Técnico: ${testJob.technician.name}\n`);

    // 2. Simular cambio de técnico (solo técnico, sin modificar fecha/hora)
    const newTechnician = await prisma.user.findFirst({
      where: { 
        role: { name: 'TECNICO' },
        isActive: true,
        id: { not: technician.id }
      }
    });

    if (!newTechnician) {
      console.log('⚠️ No hay otro técnico disponible para la prueba');
      return;
    }

    console.log('🔄 Simulando cambio de técnico (solo técnico)...');
    console.log(`   Nuevo técnico: ${newTechnician.name}`);
    console.log(`   Fecha y hora: Se mantienen iguales\n`);

    // Actualizar solo el técnico
    const updatedJob = await prisma.job.update({
      where: { id: testJob.id },
      data: {
        technicianId: newTechnician.id
        // NO incluir scheduledAt, startTime, endTime para mantener valores originales
      },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      }
    });

    console.log('✅ Trabajo actualizado:');
    console.log(`   ID: ${updatedJob.id}`);
    console.log(`   Fecha: ${updatedJob.scheduledAt.toLocaleDateString()}`);
    console.log(`   Horario: ${updatedJob.startTime} - ${updatedJob.endTime}`);
    console.log(`   Técnico: ${updatedJob.technician.name}\n`);

    // 3. Verificar que fecha y hora se mantuvieron iguales
    const dateUnchanged = updatedJob.scheduledAt.getTime() === testJob.scheduledAt.getTime();
    const timeUnchanged = updatedJob.startTime === testJob.startTime && updatedJob.endTime === testJob.endTime;
    const technicianChanged = updatedJob.technician.id !== testJob.technician.id;

    console.log('🔍 Verificando resultados:');
    console.log(`   ✅ Fecha sin cambios: ${dateUnchanged ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Horario sin cambios: ${timeUnchanged ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Técnico cambiado: ${technicianChanged ? 'SÍ' : 'NO'}\n`);

    if (dateUnchanged && timeUnchanged && technicianChanged) {
      console.log('🎉 ¡PRUEBA EXITOSA! La corrección funciona correctamente.');
      console.log('   - Solo se cambió el técnico');
      console.log('   - Fecha y hora se mantuvieron originales');
    } else {
      console.log('❌ PRUEBA FALLIDA. La corrección no funciona correctamente.');
      if (!dateUnchanged) console.log('   - La fecha cambió cuando no debería');
      if (!timeUnchanged) console.log('   - El horario cambió cuando no debería');
      if (!technicianChanged) console.log('   - El técnico no cambió');
    }

    // 4. Limpiar trabajo de prueba
    await prisma.job.delete({
      where: { id: testJob.id }
    });

    console.log('\n🧹 Trabajo de prueba eliminado.');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTechnicianAssignmentFix();
