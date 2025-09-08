const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCalendarIntegration() {
  try {
    console.log('📅 Probando integración con calendario...\n');

    // 1. Verificar trabajos existentes
    console.log('1️⃣ Trabajos existentes:');
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    });

    console.log(`   Total de trabajos: ${allJobs.length}`);
    
    allJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`);
      console.log(`      Cliente: ${job.client.name}`);
      console.log(`      Técnico: ${job.technician?.name || 'Sin asignar'}`);
      console.log(`      Fecha: ${job.scheduledAt.toLocaleDateString()}`);
      console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
      console.log(`      Estado: ${job.status}`);
      console.log('');
    });

    // 2. Verificar trabajos con técnico asignado (deberían aparecer en calendario)
    console.log('2️⃣ Trabajos que aparecen en calendario:');
    const jobsWithTechnician = allJobs.filter(job => job.technician && job.technician.id);
    
    console.log(`   Trabajos con técnico asignado: ${jobsWithTechnician.length}`);
    
    if (jobsWithTechnician.length > 0) {
      jobsWithTechnician.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - ${job.technician.name}`);
        console.log(`      Fecha: ${job.scheduledAt.toLocaleDateString()}`);
        console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
      });
    } else {
      console.log('   ⚠️  No hay trabajos con técnico asignado');
    }

    // 3. Verificar trabajos sin técnico (no aparecen en calendario)
    console.log('\n3️⃣ Trabajos que NO aparecen en calendario:');
    const jobsWithoutTechnician = allJobs.filter(job => !job.technician || !job.technician.id);
    
    console.log(`   Trabajos sin técnico asignado: ${jobsWithoutTechnician.length}`);
    
    if (jobsWithoutTechnician.length > 0) {
      jobsWithoutTechnician.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Sin técnico`);
        console.log(`      Fecha: ${job.scheduledAt.toLocaleDateString()}`);
      });
    } else {
      console.log('   ✅ Todos los trabajos tienen técnico asignado');
    }

    // 4. Verificar por fecha
    console.log('\n4️⃣ Trabajos por fecha:');
    const today = new Date();
    const todayJobs = allJobs.filter(job => {
      const jobDate = new Date(job.scheduledAt);
      return jobDate.toDateString() === today.toDateString();
    });

    console.log(`   Trabajos para hoy (${today.toLocaleDateString()}): ${todayJobs.length}`);
    todayJobs.forEach(job => {
      console.log(`      • ${job.title} - ${job.technician?.name || 'Sin técnico'}`);
    });

    // 5. Resumen final
    console.log('\n📊 Resumen de integración con calendario:');
    console.log(`   ✅ Trabajos totales: ${allJobs.length}`);
    console.log(`   ✅ Con técnico (aparecen en calendario): ${jobsWithTechnician.length}`);
    console.log(`   ⚠️  Sin técnico (no aparecen en calendario): ${jobsWithoutTechnician.length}`);
    
    if (jobsWithTechnician.length > 0) {
      console.log('\n🎉 Los trabajos con técnico asignado aparecerán automáticamente en el calendario!');
    } else {
      console.log('\n💡 Para que los trabajos aparezcan en el calendario, asegúrate de asignarles un técnico.');
    }

  } catch (error) {
    console.error('❌ Error probando integración con calendario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalendarIntegration();
