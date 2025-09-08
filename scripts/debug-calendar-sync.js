// Script para debuggear la sincronización entre agenda y calendario
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCalendarSync() {
  try {
    console.log('🔍 Debuggeando sincronización agenda-calendario...\n');

    // 1. Verificar todos los trabajos en la base de datos
    console.log('1️⃣ Verificando todos los trabajos en la base de datos:');
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    });

    console.log(`   Total de trabajos: ${allJobs.length}`);
    allJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name} - Técnico: ${job.technician?.name || 'Sin asignar'} - Fecha: ${job.scheduledAt} - Estado: ${job.status}`);
    });

    // 2. Verificar trabajos con técnico asignado
    console.log('\n2️⃣ Trabajos con técnico asignado:');
    const jobsWithTechnician = allJobs.filter(job => job.technician);
    console.log(`   Trabajos con técnico: ${jobsWithTechnician.length}`);
    jobsWithTechnician.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - Técnico: ${job.technician.name} - Fecha: ${job.scheduledAt}`);
    });

    // 3. Verificar técnicos disponibles
    console.log('\n3️⃣ Técnicos disponibles:');
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        },
        isActive: true
      }
    });

    console.log(`   Técnicos activos: ${technicians.length}`);
    technicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (ID: ${tech.id})`);
    });

    // 4. Simular la lógica de la API del calendario
    console.log('\n4️⃣ Simulando lógica de la API del calendario:');
    
    // Simular filtros de la API
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    console.log(`   Rango de fechas: ${startDate.toISOString()} a ${endDate.toISOString()}`);

    // Simular query de la API
    const calendarJobs = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate
        },
        technician: {
          isNot: null
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    });

    console.log(`   Trabajos en rango de fechas con técnico: ${calendarJobs.length}`);
    calendarJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - ${job.client?.name} - ${job.technician?.name} - ${job.scheduledAt}`);
    });

    // 5. Verificar trabajos específicos para el 26 de agosto
    console.log('\n5️⃣ Trabajos para el 26 de agosto de 2025:');
    const targetDate = new Date('2025-08-26');
    const targetDateEnd = new Date('2025-08-26');
    targetDateEnd.setHours(23, 59, 59, 999);

    const jobsForDate = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: targetDate,
          lte: targetDateEnd
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    });

    console.log(`   Trabajos para 26/08/2025: ${jobsForDate.length}`);
    jobsForDate.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name} - Técnico: ${job.technician?.name || 'Sin asignar'} - Hora: ${job.scheduledAt}`);
    });

    // 6. Simular conversión al formato del calendario
    console.log('\n6️⃣ Simulando conversión al formato del calendario:');
    
    const convertedJobs = calendarJobs.map(job => {
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

    console.log(`   Trabajos convertidos: ${convertedJobs.length}`);
    convertedJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.patientName} (${job.startTime}-${job.endTime}) - ${job.date} - Técnico ID: ${job.professionalId}`);
    });

    // 7. Verificar si hay problemas de zona horaria
    console.log('\n7️⃣ Verificando zona horaria:');
    const testJob = calendarJobs[0];
    if (testJob) {
      const utcDate = new Date(testJob.scheduledAt);
      const localDate = new Date(testJob.scheduledAt);
      
      console.log(`   Ejemplo de trabajo: ${testJob.title}`);
      console.log(`   Fecha UTC: ${utcDate.toISOString()}`);
      console.log(`   Fecha local: ${localDate.toLocaleString('es-CL')}`);
      console.log(`   Diferencia de zona horaria: ${utcDate.getTimezoneOffset()} minutos`);
    }

    console.log('\n✅ Debug completado');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCalendarSync();
