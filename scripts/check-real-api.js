const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRealAPI() {
  try {
    console.log('🔍 Verificando API real en tiempo real...\n');

    // 1. Obtener trabajo directamente de la base de datos
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true,
        company: true
      }
    });

    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos');
      return;
    }

    const job = jobs[0];
    console.log('📅 Trabajo en la base de datos:');
    console.log(`   ID: ${job.id}`);
    console.log(`   Título: ${job.title}`);
    console.log(`   Cliente: ${job.client?.name}`);
    console.log(`   Técnico: ${job.technician?.name}`);
    console.log(`   scheduledAt: ${job.scheduledAt}`);
    console.log(`   Tipo de scheduledAt: ${typeof job.scheduledAt}`);

    // 2. Simular el procesamiento de la API
    const scheduledDate = job.scheduledAt ? new Date(job.scheduledAt) : new Date();
    console.log('\n🔄 Procesamiento de la API:');
    console.log(`   scheduledDate: ${scheduledDate}`);
    console.log(`   scheduledDate.toISOString(): ${scheduledDate.toISOString()}`);
    console.log(`   scheduledDate.toLocaleDateString('en-CA'): ${scheduledDate.toLocaleDateString('en-CA')}`);

    // 3. Simular la respuesta de la API
    const apiResponse = {
      id: job.id,
      professionalId: job.technician?.id || "tecnico-generico",
      patientName: job.client?.name || "Cliente sin nombre",
      startTime: job.startTime || "08:00",
      endTime: job.endTime || "09:00",
      startTimeDisplay: job.startTime || "08:00",
      endTimeDisplay: job.endTime || "09:00",
      type: job.service?.name || "Trabajo técnico",
      color: "bg-yellow-200",
      date: scheduledDate.toLocaleDateString('en-CA'), // ← AQUÍ SE GENERA LA FECHA
      status: job.status || "PENDING",
      priority: job.priority || "MEDIUM",
      description: job.description || "",
      client: job.client,
      service: job.service,
      technician: job.technician,
      company: job.company,
      scheduledAt: job.scheduledAt
    };

    console.log('\n📋 Respuesta simulada de la API:');
    console.log(`   date: ${apiResponse.date}`);
    console.log(`   Tipo de date: ${typeof apiResponse.date}`);

    // 4. Simular el procesamiento del frontend
    const frontendJob = {
      id: apiResponse.id,
      professionalId: apiResponse.technician?.id || "tecnico-generico",
      patientName: apiResponse.client?.name || "Cliente sin nombre",
      startTime: apiResponse.startTime,
      endTime: apiResponse.endTime,
      startTimeDisplay: apiResponse.startTimeDisplay,
      endTimeDisplay: apiResponse.endTimeDisplay,
      type: apiResponse.service?.name || "Trabajo técnico",
      color: "bg-yellow-200",
      date: apiResponse.date, // ← AQUÍ SE USA LA FECHA
      status: apiResponse.status || "PENDING",
      priority: apiResponse.priority || "MEDIUM",
      description: apiResponse.description || "",
      client: apiResponse.client,
      service: apiResponse.service,
      technician: apiResponse.technician,
      company: apiResponse.company,
      scheduledAt: apiResponse.scheduledAt
    };

    console.log('\n📅 Trabajo procesado por el frontend:');
    console.log(`   date: ${frontendJob.date}`);
    console.log(`   Cliente: ${frontendJob.patientName}`);
    console.log(`   Técnico: ${frontendJob.technician?.name}`);

    // 5. Verificar si la fecha es válida
    const testDate = new Date(frontendJob.date);
    console.log('\n🔍 Validación final:');
    console.log(`   Fecha parseada: ${testDate}`);
    console.log(`   Es válida: ${!isNaN(testDate.getTime())}`);
    console.log(`   Año: ${testDate.getFullYear()}`);
    console.log(`   Mes: ${testDate.getMonth() + 1}`);
    console.log(`   Día: ${testDate.getDate()}`);

    if (testDate.getFullYear() === 1969) {
      console.log('\n🚨 ¡PROBLEMA DETECTADO!');
      console.log('   La fecha se está convirtiendo a 1969');
    } else {
      console.log('\n✅ La fecha es correcta');
      console.log(`   Se muestra como: ${testDate.toLocaleDateString('es-CL')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealAPI();
