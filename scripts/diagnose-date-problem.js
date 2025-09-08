const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseDateProblem() {
  try {
    console.log('🔍 Diagnosticando problema de fecha 31-12-1969...\n');

    // Buscar trabajos con fecha problemática
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    console.log(`📊 Total de trabajos: ${jobs.length}\n`);

    jobs.forEach((job, index) => {
      const date = new Date(job.scheduledAt);
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   ID: ${job.id}`);
      console.log(`   Cliente: ${job.client?.name}`);
      console.log(`   Técnico: ${job.technician?.name}`);
      console.log(`   Fecha ISO: ${job.scheduledAt}`);
      console.log(`   Fecha local: ${date.toLocaleString('es-CL')}`);
      console.log(`   Fecha DD-MM-YYYY: ${date.toLocaleDateString('es-CL')}`);
      console.log(`   Año: ${date.getFullYear()}`);
      console.log(`   Mes: ${date.getMonth() + 1}`);
      console.log(`   Día: ${date.getDate()}`);
      console.log(`   Es fecha inválida: ${isNaN(date.getTime())}`);
      console.log(`   Es 1969: ${date.getFullYear() === 1969}`);
      console.log('');
    });

    // Buscar específicamente trabajos con fecha 1969
    const jobs1969 = jobs.filter(job => {
      const date = new Date(job.scheduledAt);
      return date.getFullYear() === 1969;
    });

    if (jobs1969.length > 0) {
      console.log('🚨 TRABAJOS CON FECHA 1969 ENCONTRADOS:');
      jobs1969.forEach((job, index) => {
        const date = new Date(job.scheduledAt);
        console.log(`${index + 1}. ${job.title} - ${job.client?.name}`);
        console.log(`   Fecha: ${date.toLocaleDateString('es-CL')}`);
        console.log(`   Técnico: ${job.technician?.name}`);
        console.log(`   ID: ${job.id}`);
      });
    } else {
      console.log('✅ No se encontraron trabajos con fecha 1969');
    }

    // Verificar si hay trabajos con fecha inválida
    const invalidJobs = jobs.filter(job => {
      const date = new Date(job.scheduledAt);
      return isNaN(date.getTime());
    });

    if (invalidJobs.length > 0) {
      console.log('\n❌ TRABAJOS CON FECHA INVÁLIDA:');
      invalidJobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} - ${job.client?.name}`);
        console.log(`   Fecha raw: ${job.scheduledAt}`);
        console.log(`   ID: ${job.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDateProblem();
