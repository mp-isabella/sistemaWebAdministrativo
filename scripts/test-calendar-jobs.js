const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCalendarJobs() {
  try {
    console.log('🔍 Verificando trabajos para el calendario...\n');

    // 1. Verificar trabajos con técnicos asignados
    const jobsWithTechnicians = await prisma.job.findMany({
      where: {
        technicianId: {
          not: null
        },
        scheduledAt: {
          not: null
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    console.log(`📊 Trabajos con técnicos asignados: ${jobsWithTechnicians.length}`);

    if (jobsWithTechnicians.length === 0) {
      console.log('❌ No hay trabajos con técnicos asignados');
      return;
    }

    // 2. Mostrar detalles de cada trabajo
    jobsWithTechnicians.forEach((job, index) => {
      console.log(`\n${index + 1}. Trabajo: ${job.title}`);
      console.log(`   ID: ${job.id}`);
      console.log(`   Cliente: ${job.client?.name || 'Sin cliente'}`);
      console.log(`   Servicio: ${job.service?.name || 'Sin servicio'}`);
      console.log(`   Técnico: ${job.technician?.name || 'Sin técnico'}`);
      console.log(`   Fecha: ${job.scheduledAt}`);
      console.log(`   Estado: ${job.status}`);
      console.log(`   Prioridad: ${job.priority}`);
    });

    // 3. Verificar técnicos disponibles
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['TECNICO', 'tecnico']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`\n👨‍🔧 Técnicos disponibles: ${technicians.length}`);
    technicians.forEach(tech => {
      console.log(`   - ${tech.name} (${tech.id})`);
    });

    // 4. Simular conversión al formato del calendario
    console.log('\n🔄 Simulando conversión al formato del calendario...');
    
    const calendarJobs = jobsWithTechnicians.map(job => {
      const scheduledDate = new Date(job.scheduledAt);
      const startTime = scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
      const endTime = endDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      return {
        id: job.id,
        professionalId: job.technician.id,
        patientName: job.client?.name || "Cliente sin nombre",
        startTime: startTime,
        endTime: endTime,
        type: job.service?.name || "Trabajo técnico",
        date: scheduledDate.toISOString().split('T')[0]
      };
    });

    console.log(`✅ Trabajos convertidos: ${calendarJobs.length}`);
    calendarJobs.forEach(job => {
      console.log(`   - ${job.patientName} (${job.startTime}-${job.endTime}) - ${job.date}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalendarJobs();
