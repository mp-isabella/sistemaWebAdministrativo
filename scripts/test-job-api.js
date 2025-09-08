const fetch = require('node-fetch');

async function testJobAPI() {
  console.log('🧪 Probando API de trabajos...\n');

  try {
    // Test 1: Obtener trabajos existentes
    console.log('1️⃣ Probando GET /api/jobs...');
    const jobsResponse = await fetch('http://localhost:3000/api/jobs');
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log(`✅ Trabajos encontrados: ${jobsData.length}`);
      if (jobsData.length > 0) {
        const job = jobsData[0];
        console.log(`   📋 Primer trabajo: ${job.title}`);
        console.log(`   👤 Cliente: ${job.client?.name}`);
        console.log(`   🔧 Servicio: ${job.service?.name}`);
        console.log(`   👨‍🔧 Técnico: ${job.technician?.name || 'Sin asignar'}`);
        console.log(`   📅 Fecha: ${job.scheduledAt}`);
        console.log(`   ⏰ Horario: ${job.startTime} - ${job.endTime}`);
      }
    } else {
      console.log(`❌ Error: ${jobsResponse.status} ${jobsResponse.statusText}`);
    }

    // Test 2: Crear un nuevo trabajo
    console.log('\n2️⃣ Probando POST /api/jobs...');
    const newJobData = {
      title: 'Trabajo desde API',
      description: 'Trabajo creado desde la API para pruebas',
      clientId: 'cmesy6gqv0001uky4yu5l0d8d', // ID del primer cliente
      serviceId: 'cmesy6gqv0001uky4yu5l0d8e', // ID del primer servicio
      technicianId: 'cmesy6gqv0001uky4yu5l0d8f', // ID del primer técnico
      scheduledAt: new Date('2025-08-29T10:00:00Z').toISOString(),
      startTime: '10:00',
      endTime: '18:00',
      priority: 'MEDIUM'
    };

    const createResponse = await fetch('http://localhost:3000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newJobData)
    });

    if (createResponse.ok) {
      const createdJob = await createResponse.json();
      console.log('✅ Trabajo creado exitosamente:');
      console.log(`   ID: ${createdJob.id}`);
      console.log(`   Título: ${createdJob.title}`);
      console.log(`   Estado: ${createdJob.status}`);
    } else {
      const errorData = await createResponse.text();
      console.log(`❌ Error creando trabajo: ${createResponse.status} ${createResponse.statusText}`);
      console.log(`   Detalles: ${errorData}`);
    }

    console.log('\n🎉 Prueba de API de trabajos completada!');

  } catch (error) {
    console.error('❌ Error probando API:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

testJobAPI();
