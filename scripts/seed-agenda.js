const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAgenda() {
  try {
    console.log('🌱 Poblando base de datos con datos de agenda...');

    // Crear roles si no existen
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin' }
    });

    const secretariaRole = await prisma.role.upsert({
      where: { name: 'secretaria' },
      update: {},
      create: { name: 'secretaria' }
    });

    const tecnicoRole = await prisma.role.upsert({
      where: { name: 'tecnico' },
      update: {},
      create: { name: 'tecnico' }
    });

    // Crear usuarios técnicos
    const tecnico1 = await prisma.user.upsert({
      where: { email: 'juan.perez@empresa.com' },
      update: {},
      create: {
        email: 'juan.perez@empresa.com',
        name: 'Juan Pérez',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', // password: 123456
        roleId: tecnicoRole.id,
        phone: '+56 9 1234 5678',
        isActive: true
      }
    });

    const tecnico2 = await prisma.user.upsert({
      where: { email: 'ana.silva@empresa.com' },
      update: {},
      create: {
        email: 'ana.silva@empresa.com',
        name: 'Ana Silva',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', // password: 123456
        roleId: tecnicoRole.id,
        phone: '+56 9 8765 4321',
        isActive: true
      }
    });

    const tecnico3 = await prisma.user.upsert({
      where: { email: 'luis.torres@empresa.com' },
      update: {},
      create: {
        email: 'luis.torres@empresa.com',
        name: 'Luis Torres',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', // password: 123456
        roleId: tecnicoRole.id,
        phone: '+56 9 5555 1234',
        isActive: true
      }
    });

    // Crear clientes
    const cliente1 = await prisma.client.upsert({
      where: { email: 'maria.gonzalez@email.com' },
      update: {},
      create: {
        email: 'maria.gonzalez@email.com',
        name: 'María González',
        phone: '+56 9 1234 5678',
        address: 'Av. Providencia 1234, Providencia',
        rut: '12.345.678-9',
        company: 'Residencial',
        isActive: true,
        createdById: tecnico1.id
      }
    });

    const cliente2 = await prisma.client.upsert({
      where: { email: 'empresa.abc@email.com' },
      update: {},
      create: {
        email: 'empresa.abc@email.com',
        name: 'Empresa ABC',
        phone: '+56 2 2345 6789',
        address: 'Las Condes 567, Las Condes',
        rut: '98.765.432-1',
        company: 'Empresa ABC Ltda.',
        isActive: true,
        createdById: tecnico1.id
      }
    });

    const cliente3 = await prisma.client.upsert({
      where: { email: 'carlos.rodriguez@email.com' },
      update: {},
      create: {
        email: 'carlos.rodriguez@email.com',
        name: 'Carlos Rodríguez',
        phone: '+56 9 8765 4321',
        address: 'Ñuñoa 890, Ñuñoa',
        rut: '11.222.333-4',
        company: 'Residencial',
        isActive: true,
        createdById: tecnico1.id
      }
    });

    // Crear servicios
    const servicio1 = await prisma.service.upsert({
      where: { name: 'Detección de Fugas de Agua' },
      update: {},
      create: {
        name: 'Detección de Fugas de Agua',
        description: 'Detección de fugas de agua usando tecnología avanzada',
        price: 45000,
        category: 'deteccion_fugas',
        isActive: true,
        createdById: tecnico1.id
      }
    });

    const servicio2 = await prisma.service.upsert({
      where: { name: 'Videointrospección de Ductos' },
      update: {},
      create: {
        name: 'Videointrospección de Ductos',
        description: 'Inspección de ductos usando cámara de video',
        price: 35000,
        category: 'videointrospeccion',
        isActive: true,
        createdById: tecnico1.id
      }
    });

    const servicio3 = await prisma.service.upsert({
      where: { name: 'Destape de Alcantarillado' },
      update: {},
      create: {
        name: 'Destape de Alcantarillado',
        description: 'Servicio de destape y limpieza de alcantarillado',
        price: 55000,
        category: 'destape_alcantarillado',
        isActive: true,
        createdById: tecnico1.id
      }
    });

    // Crear trabajos programados
    const trabajo1 = await prisma.job.create({
      data: {
        title: 'Detección de Fuga - Urgente',
        description: 'Cliente reporta fuga en baño principal',
        status: 'PENDING',
        priority: 'HIGH',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas desde ahora
        clientId: cliente1.id,
        serviceId: servicio1.id,
        technicianId: tecnico1.id,
        createdById: tecnico1.id
      }
    });

    const trabajo2 = await prisma.job.create({
      data: {
        title: 'Video Inspección Programada',
        description: 'Inspección rutinaria de cañerías',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        clientId: cliente2.id,
        serviceId: servicio2.id,
        technicianId: tecnico2.id,
        createdById: tecnico1.id
      }
    });

    const trabajo3 = await prisma.job.create({
      data: {
        title: 'Destape de Alcantarillado',
        description: 'Problema de obstrucción en alcantarillado',
        status: 'COMPLETED',
        priority: 'HIGH',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
        clientId: cliente3.id,
        serviceId: servicio3.id,
        technicianId: tecnico3.id,
        createdById: tecnico1.id
      }
    });

    const trabajo4 = await prisma.job.create({
      data: {
        title: 'Mantenimiento Preventivo',
        description: 'Mantenimiento rutinario de sistema de agua',
        status: 'PENDING',
        priority: 'LOW',
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        clientId: cliente1.id,
        serviceId: servicio2.id,
        // Sin técnico asignado
        createdById: tecnico1.id
      }
    });

    console.log('✅ Datos de agenda creados exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${3} técnicos creados`);
    console.log(`   - ${3} clientes creados`);
    console.log(`   - ${3} servicios creados`);
    console.log(`   - ${4} trabajos programados`);

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAgenda();
