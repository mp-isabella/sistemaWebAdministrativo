const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCalendarData() {
  try {
    console.log('🔍 Debuggeando datos del calendario...\n');

    // 1. Verificar trabajos con técnico asignado
    console.log('1️⃣ Trabajos con técnico asignado:');
    const jobsWithTechnician = await prisma.job.findMany({
      where: {
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

    console.log(`   Total de trabajos con técnico: ${jobsWithTechnician.length}`);
    
    if (jobsWithTechnician.length > 0) {
      jobsWithTechnician.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title}`);
        console.log(`      ID: ${job.id}`);
        console.log(`      Cliente: ${job.client.name} (ID: ${job.client.id})`);
        console.log(`      Técnico: ${job.technician.name} (ID: ${job.technician.id})`);
        console.log(`      Fecha: ${job.scheduledAt.toLocaleDateString()}`);
        console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
        console.log(`      Estado: ${job.status}`);
        console.log(`      Prioridad: ${job.priority}`);
        console.log('');
      });
    }

    // 2. Verificar técnicos disponibles
    console.log('2️⃣ Técnicos disponibles:');
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`   Total de técnicos: ${technicians.length}`);
    technicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (ID: ${tech.id}, Email: ${tech.email})`);
    });

    // 3. Simular la conversión de datos como lo hace la API
    console.log('\n3️⃣ Simulando conversión de datos de la API:');
    
    const calendarJobs = jobsWithTechnician.map(job => {
      const scheduledDate = job.scheduledAt ? new Date(job.scheduledAt) : new Date();
      const startTime = scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      // Calcular hora de fin (asumiendo 1 hora por defecto)
      const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
      const endTime = endDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      // Función para obtener color según prioridad
      function getJobColor(priority) {
        switch (priority?.toUpperCase()) {
          case "HIGH":
            return "bg-red-400";
          case "MEDIUM":
            return "bg-blue-400";
          case "LOW":
            return "bg-green-400";
          default:
            return "bg-gray-400";
        }
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        status: job.status,
        priority: job.priority,
        scheduledAt: job.scheduledAt,
        client: job.client,
        service: job.service,
        technician: job.technician,
        calendarData: {
          startTime,
          endTime,
          date: scheduledDate.toISOString().split('T')[0],
          color: getJobColor(job.priority || "MEDIUM"),
          patientName: job.client?.name || "Cliente sin nombre",
          type: job.service?.name || "Trabajo técnico"
        }
      };
    });

    console.log(`   Trabajos convertidos: ${calendarJobs.length}`);
    calendarJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`);
      console.log(`      Técnico ID: ${job.technician.id}`);
      console.log(`      Técnico Nombre: ${job.technician.name}`);
      console.log(`      Fecha: ${job.calendarData.date}`);
      console.log(`      Horario: ${job.calendarData.startTime} - ${job.calendarData.endTime}`);
      console.log(`      Color: ${job.calendarData.color}`);
      console.log(`      Cliente: ${job.calendarData.patientName}`);
      console.log('');
    });

    // 4. Simular la conversión del frontend
    console.log('4️⃣ Simulando conversión del frontend:');
    
    const frontendJobs = calendarJobs
      .filter((job) => job.technician && job.technician.id)
      .map((job) => {
        console.log(`   Procesando trabajo: ${job.title}, Técnico: ${job.technician.name}`);
        return {
          id: job.id,
          professionalId: job.technician.id,
          patientName: job.calendarData?.patientName || job.client?.name || "Cliente sin nombre",
          startTime: job.calendarData?.startTime || job.startTime || "09:00",
          endTime: job.calendarData?.endTime || job.endTime || "10:00",
          type: job.calendarData?.type || job.service?.name || "Trabajo técnico",
          color: job.calendarData?.color || "bg-blue-400",
          date: job.calendarData?.date || new Date(job.scheduledAt).toISOString().split('T')[0]
        };
      });

    console.log(`   Trabajos para frontend: ${frontendJobs.length}`);
    frontendJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.patientName}`);
      console.log(`      Professional ID: ${job.professionalId}`);
      console.log(`      Fecha: ${job.date}`);
      console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
      console.log(`      Color: ${job.color}`);
      console.log('');
    });

    // 5. Verificar coincidencia de IDs
    console.log('5️⃣ Verificando coincidencia de IDs:');
    
    const technicianIds = technicians.map(t => t.id);
    const jobTechnicianIds = jobsWithTechnician.map(j => j.technician.id);
    const frontendTechnicianIds = frontendJobs.map(j => j.professionalId);
    
    console.log(`   IDs de técnicos en BD: ${technicianIds.join(', ')}`);
    console.log(`   IDs de técnicos en trabajos: ${jobTechnicianIds.join(', ')}`);
    console.log(`   IDs de técnicos en frontend: ${frontendTechnicianIds.join(', ')}`);
    
    const missingIds = jobTechnicianIds.filter(id => !technicianIds.includes(id));
    if (missingIds.length > 0) {
      console.log(`   ⚠️  IDs faltantes: ${missingIds.join(', ')}`);
    } else {
      console.log(`   ✅ Todos los IDs coinciden`);
    }

    // 6. Resumen final
    console.log('\n📊 Resumen del debug:');
    console.log(`   ✅ Trabajos con técnico: ${jobsWithTechnician.length}`);
    console.log(`   ✅ Técnicos disponibles: ${technicians.length}`);
    console.log(`   ✅ Trabajos convertidos: ${calendarJobs.length}`);
    console.log(`   ✅ Trabajos para frontend: ${frontendJobs.length}`);
    
    if (frontendJobs.length > 0) {
      console.log('\n🎉 Los trabajos deberían aparecer en el calendario!');
      console.log('💡 Si no aparecen, verifica:');
      console.log('   1. Que estés en la vista correcta (/dashboard/schedule/calendar)');
      console.log('   2. Que los logs del navegador muestren los datos');
      console.log('   3. Que no haya errores en la consola');
    } else {
      console.log('\n❌ No hay trabajos para mostrar en el frontend');
      console.log('💡 Verifica que los trabajos tengan técnico asignado');
    }

  } catch (error) {
    console.error('❌ Error debuggeando datos del calendario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCalendarData();
