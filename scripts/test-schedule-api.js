const fetch = require('node-fetch');

async function testScheduleAPI() {
  console.log('🧪 Probando API de agenda...\n');

  try {
    // Test 1: Obtener todos los trabajos
    console.log('1️⃣ Probando GET /api/jobs...');
    const jobsResponse = await fetch('http://localhost:3000/api/jobs');
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log(`✅ Trabajos encontrados: ${jobsData.length}`);
      
      if (jobsData.length > 0) {
        console.log('\n📋 Detalles de trabajos:');
        jobsData.forEach((job, index) => {
          console.log(`\n   ${index + 1}. ${job.title}`);
          console.log(`      Cliente: ${job.client?.name}`);
          console.log(`      Servicio: ${job.service?.name}`);
          console.log(`      Técnico: ${job.technician?.name || 'Sin asignar'}`);
          console.log(`      Fecha: ${job.scheduledAt}`);
          console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
          console.log(`      Estado: ${job.status}`);
        });
      }
    } else {
      console.log(`❌ Error: ${jobsResponse.status} ${jobsResponse.statusText}`);
      const errorText = await jobsResponse.text();
      console.log(`   Detalles: ${errorText}`);
    }

    // Test 2: Verificar trabajos por fecha
    console.log('\n2️⃣ Verificando trabajos por fecha...');
    const today = new Date().toISOString().split('T')[0];
    console.log(`   Fecha actual: ${today}`);
    
    const jobsResponse2 = await fetch('http://localhost:3000/api/jobs');
    if (jobsResponse2.ok) {
      const jobsData2 = await jobsResponse2.json();
      
      // Filtrar trabajos por fecha actual
      const todayJobs = jobsData2.filter(job => {
        const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0];
        return jobDate === today;
      });
      
      console.log(`   Trabajos para hoy (${today}): ${todayJobs.length}`);
      todayJobs.forEach(job => {
        console.log(`      • ${job.title} - ${job.client?.name} - ${job.startTime}-${job.endTime}`);
      });
      
      // Mostrar todos los trabajos con sus fechas
      console.log('\n   📅 Todos los trabajos:');
      jobsData2.forEach(job => {
        const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0];
        console.log(`      • ${job.title} - ${jobDate} - ${job.startTime}-${job.endTime}`);
      });
    }

    console.log('\n🎉 Prueba de API de agenda completada!');
    console.log('\n💡 Si no ves trabajos en la agenda:');
    console.log('   1. Verifica que la fecha en el filtro coincida con la fecha del trabajo');
    console.log('   2. Usa el botón X para limpiar el filtro de fecha y ver todos los trabajos');
    console.log('   3. Verifica que los filtros de estado y técnico estén en "Todos"');

  } catch (error) {
    console.error('❌ Error probando API:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

testScheduleAPI();
