const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTechnicianJobs() {
  try {
    console.log('🔍 Verificando trabajos con técnicos asignados...\n');

    // 1. Verificar todos los trabajos
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total de trabajos en la base de datos: ${allJobs.length}`);

    // 2. Trabajos con técnico asignado
    const jobsWithTechnician = allJobs.filter(job => job.technicianId);
    console.log(`👨‍🔧 Trabajos con técnico asignado: ${jobsWithTechnician.length}`);

    // 3. Trabajos sin técnico asignado
    const jobsWithoutTechnician = allJobs.filter(job => !job.technicianId);
    console.log(`❌ Trabajos sin técnico asignado: ${jobsWithoutTechnician.length}`);

    // 4. Mostrar detalles de trabajos con técnico
    if (jobsWithTechnician.length > 0) {
      console.log('\n📋 Detalles de trabajos con técnico asignado:');
      jobsWithTechnician.forEach((job, index) => {
        console.log(`\n${index + 1}. Trabajo ID: ${job.id}`);
        console.log(`   Título: ${job.title}`);
        console.log(`   Cliente: ${job.client?.name || 'Sin cliente'}`);
        console.log(`   Servicio: ${job.service?.name || 'Sin servicio'}`);
        console.log(`   Técnico: ${job.technician?.name || 'Sin técnico'} (ID: ${job.technicianId})`);
        console.log(`   Fecha programada: ${job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString('es-CL') : 'Sin fecha'}`);
        console.log(`   Estado: ${job.status}`);
        console.log(`   Horarios: ${job.startTime || 'Sin hora inicio'} - ${job.endTime || 'Sin hora fin'}`);
      });
    }

    // 5. Verificar técnicos disponibles
    console.log('\n👥 Verificando técnicos disponibles...');
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      }
    });

    console.log(`📊 Total de técnicos: ${technicians.length}`);
    technicians.forEach(tech => {
      console.log(`   - ${tech.name} (${tech.email}) - Activo: ${tech.isActive}`);
    });

    // 6. Verificar trabajos por técnico
    console.log('\n📈 Trabajos por técnico:');
    for (const tech of technicians) {
      const techJobs = await prisma.job.findMany({
        where: {
          technicianId: tech.id
        },
        include: {
          client: true,
          service: true
        }
      });
      
      console.log(`   ${tech.name}: ${techJobs.length} trabajos`);
      techJobs.forEach(job => {
        console.log(`     - ${job.title} (${job.client?.name}) - ${job.status}`);
      });
    }

    // 7. Verificar trabajos para el calendario (próximos 30 días)
    console.log('\n🗓️ Trabajos para el calendario (próximos 30 días):');
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const calendarJobs = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: today,
          lte: thirtyDaysFromNow
        },
        technicianId: {
          not: null
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    console.log(`📅 Trabajos en calendario: ${calendarJobs.length}`);
    calendarJobs.forEach(job => {
      console.log(`   - ${job.title} - ${job.technician?.name} - ${new Date(job.scheduledAt).toLocaleDateString('es-CL')}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTechnicianJobs();
