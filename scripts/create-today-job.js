const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTodayJob() {
  try {
    console.log('📅 Creando trabajo para hoy...\n');

    // Obtener datos necesarios
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

    // Crear fecha para hoy
    const today = new Date();
    today.setHours(14, 0, 0, 0); // 2:00 PM

    // Crear trabajo para hoy
    const todayJob = await prisma.job.create({
      data: {
        title: 'Trabajo para Hoy',
        description: 'Trabajo programado para la fecha actual para pruebas',
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

    console.log('✅ Trabajo para hoy creado exitosamente:');
    console.log(`   ID: ${todayJob.id}`);
    console.log(`   Título: ${todayJob.title}`);
    console.log(`   Cliente: ${todayJob.client.name}`);
    console.log(`   Servicio: ${todayJob.service.name}`);
    console.log(`   Técnico: ${todayJob.technician.name}`);
    console.log(`   Fecha: ${todayJob.scheduledAt.toLocaleDateString()}`);
    console.log(`   Horario: ${todayJob.startTime} - ${todayJob.endTime}`);
    console.log(`   Estado: ${todayJob.status}`);

    // Contar trabajos totales
    const totalJobs = await prisma.job.count();
    console.log(`\n📊 Total de trabajos en la base de datos: ${totalJobs}`);

    // Verificar trabajos para hoy
    const todayJobs = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    });

    console.log(`\n📅 Trabajos para hoy (${today.toLocaleDateString()}): ${todayJobs.length}`);
    todayJobs.forEach(job => {
      console.log(`   • ${job.title} - ${job.client.name} - ${job.startTime}-${job.endTime}`);
    });

    console.log('\n🎉 Trabajo para hoy creado exitosamente!');
    console.log('💡 Ahora debería aparecer en la agenda cuando selecciones la fecha de hoy.');

  } catch (error) {
    console.error('❌ Error creando trabajo para hoy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTodayJob();
