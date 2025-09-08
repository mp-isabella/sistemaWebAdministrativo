const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCalendarData() {
  try {
    console.log('🌱 Creando datos de prueba para el calendario...');

    // Obtener técnicos existentes
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECNICO'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (technicians.length === 0) {
      console.log('❌ No se encontraron técnicos en la base de datos');
      console.log('Por favor, crea algunos técnicos primero usando el script de creación de usuarios');
      return;
    }

    console.log(`📋 Encontrados ${technicians.length} técnicos:`);
    technicians.forEach(tech => {
      console.log(`  - ${tech.name} (${tech.email})`);
    });

    // Obtener clientes existentes
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10 // Limitar a 10 clientes para las pruebas
    });

    if (clients.length === 0) {
      console.log('❌ No se encontraron clientes en la base de datos');
      console.log('Por favor, crea algunos clientes primero');
      return;
    }

    // Obtener servicios existentes
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    if (services.length === 0) {
      console.log('❌ No se encontraron servicios en la base de datos');
      console.log('Por favor, crea algunos servicios primero');
      return;
    }

    // Crear trabajos de prueba para los próximos 30 días
    const jobs = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Crear 1-3 trabajos por día
      const jobsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < jobsPerDay; j++) {
        const technician = technicians[Math.floor(Math.random() * technicians.length)];
        const client = clients[Math.floor(Math.random() * clients.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        
        // Generar hora aleatoria entre 8:00 y 18:00
        const hour = Math.floor(Math.random() * 10) + 8; // 8-17
        const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
        
        const scheduledAt = new Date(currentDate);
        scheduledAt.setHours(hour, minute, 0, 0);
        
        // Generar prioridad aleatoria
        const priorities = ['LOW', 'MEDIUM', 'HIGH'];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        // Generar estado aleatorio
        const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const job = {
          title: `${service.name} - ${client.name}`,
          description: `Trabajo programado para ${client.name}. ${service.description || 'Servicio técnico especializado.'}`,
          status: status,
          priority: priority,
          scheduledAt: scheduledAt,
          clientId: client.id,
          serviceId: service.id,
          technicianId: technician.id,
          createdById: technician.id, // El técnico crea su propio trabajo
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        jobs.push(job);
      }
    }

    console.log(`📅 Creando ${jobs.length} trabajos de prueba...`);

    // Insertar trabajos en lotes
    const batchSize = 10;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      await prisma.job.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`  ✅ Insertados trabajos ${i + 1} - ${Math.min(i + batchSize, jobs.length)}`);
    }

    // Mostrar estadísticas
    const totalJobs = await prisma.job.count();
    const pendingJobs = await prisma.job.count({ where: { status: 'PENDING' } });
    const inProgressJobs = await prisma.job.count({ where: { status: 'IN_PROGRESS' } });
    const completedJobs = await prisma.job.count({ where: { status: 'COMPLETED' } });

    console.log('\n📊 Estadísticas de trabajos:');
    console.log(`  - Total: ${totalJobs}`);
    console.log(`  - Pendientes: ${pendingJobs}`);
    console.log(`  - En progreso: ${inProgressJobs}`);
    console.log(`  - Completados: ${completedJobs}`);

    // Mostrar trabajos por técnico
    console.log('\n👨‍🔧 Trabajos por técnico:');
    for (const technician of technicians) {
      const technicianJobs = await prisma.job.count({
        where: { technicianId: technician.id }
      });
      console.log(`  - ${technician.name}: ${technicianJobs} trabajos`);
    }

    console.log('\n✅ Datos de prueba creados exitosamente!');
    console.log('🎯 Ahora puedes acceder al calendario como técnico para ver los trabajos programados.');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
createTestCalendarData();
