const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedWithSchedule() {
  console.log('🌱 POBLANDO BASE DE DATOS CON HORARIOS...');
  console.log('');

  try {
    // Crear roles
    console.log('1. Creando roles...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' }
    });

    const secretariaRole = await prisma.role.upsert({
      where: { name: 'SECRETARIA' },
      update: {},
      create: { name: 'SECRETARIA' }
    });

    const tecnicoRole = await prisma.role.upsert({
      where: { name: 'TECNICO' },
      update: {},
      create: { name: 'TECNICO' }
    });

    console.log('   ✅ Roles creados');

    // Crear usuarios con contraseñas hasheadas correctamente
    console.log('2. Creando usuarios...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@amestica.cl' },
      update: {},
      create: {
        email: 'admin@amestica.cl',
        name: 'Administrador Principal',
        password: hashedPassword,
        roleId: adminRole.id,
        status: 'active'
      }
    });

    const secretaria = await prisma.user.upsert({
      where: { email: 'secretaria@amestica.cl' },
      update: {},
      create: {
        email: 'secretaria@amestica.cl',
        name: 'María Secretaria',
        password: hashedPassword,
        roleId: secretariaRole.id,
        status: 'active'
      }
    });

    const tecnico1 = await prisma.user.upsert({
      where: { email: 'tecnico@amestica.cl' },
      update: {},
      create: {
        email: 'tecnico@amestica.cl',
        name: 'Juan Técnico',
        password: hashedPassword,
        roleId: tecnicoRole.id,
        status: 'active'
      }
    });

    const tecnico2 = await prisma.user.upsert({
      where: { email: 'martin@amestica.cl' },
      update: {},
      create: {
        email: 'martin@amestica.cl',
        name: 'Martin Torres',
        password: hashedPassword,
        roleId: tecnicoRole.id,
        status: 'active'
      }
    });

    console.log('   ✅ Usuarios creados');

    // Crear servicios
    console.log('3. Creando servicios...');
    const servicio1 = await prisma.service.upsert({
      where: { name: 'Mantenimiento Preventivo' },
      update: {},
      create: {
        name: 'Mantenimiento Preventivo',
        description: 'Servicio de mantenimiento preventivo de equipos',
        price: 45000,
        category: 'Mantenimiento',
        createdById: admin.id
      }
    });

    const servicio2 = await prisma.service.upsert({
      where: { name: 'Reparación Urgente' },
      update: {},
      create: {
        name: 'Reparación Urgente',
        description: 'Servicio de reparación urgente',
        price: 75000,
        category: 'Reparación',
        createdById: admin.id
      }
    });

    console.log('   ✅ Servicios creados');

    // Crear clientes con horarios
    console.log('4. Creando clientes con horarios...');
    const cliente1 = await prisma.client.upsert({
      where: { email: 'cliente1@email.com' },
      update: {},
      create: {
        name: 'BÁRBARA TRONCOSO',
        email: 'cliente1@email.com',
        phone: '+56912345678',
        address: 'Av. Providencia 123, Santiago',
        rut: '19.294.498-8',
        company: 'Améstica Ltda',
        region: 'Metropolitana',
        commune: 'Providencia',
        // Horario preferido
        preferredTimeStart: '09:00',
        preferredTimeEnd: '17:00',
        preferredDays: 'Lunes,Martes,Miércoles,Jueves,Viernes',
        createdById: admin.id
      }
    });

    const cliente2 = await prisma.client.upsert({
      where: { email: 'cliente2@email.com' },
      update: {},
      create: {
        name: 'CARLOS MARTÍNEZ',
        email: 'cliente2@email.com',
        phone: '+56987654321',
        address: 'Las Condes 456, Santiago',
        rut: '15.678.901-2',
        company: 'Multifugas',
        region: 'Metropolitana',
        commune: 'Las Condes',
        // Horario preferido
        preferredTimeStart: '10:00',
        preferredTimeEnd: '18:00',
        preferredDays: 'Martes,Jueves,Sábado',
        createdById: admin.id
      }
    });

    const cliente3 = await prisma.client.upsert({
      where: { email: 'cliente3@email.com' },
      update: {},
      create: {
        name: 'ANA GONZÁLEZ',
        email: 'cliente3@email.com',
        phone: '+56911223344',
        address: 'Ñuñoa 789, Santiago',
        rut: '12.345.678-9',
        company: 'Servifugas',
        region: 'Metropolitana',
        commune: 'Ñuñoa',
        // Sin horario preferido
        createdById: admin.id
      }
    });

    console.log('   ✅ Clientes creados');

    // Crear trabajos con horarios
    console.log('5. Creando trabajos con horarios...');
    const trabajo1 = await prisma.job.upsert({
      where: { id: 'job1' },
      update: {},
      create: {
        id: 'job1',
        title: 'Mantenimiento Preventivo - Bárbara Troncoso',
        description: 'Mantenimiento preventivo de equipos en oficina',
        status: 'PENDING',
        priority: 'MEDIUM',
        scheduledAt: new Date('2025-08-26T10:00:00Z'), // 10:00 AM
        address: 'Av. Providencia 123, Santiago',
        clientId: cliente1.id,
        serviceId: servicio1.id,
        technicianId: tecnico1.id,
        createdById: admin.id
      }
    });

    const trabajo2 = await prisma.job.upsert({
      where: { id: 'job2' },
      update: {},
      create: {
        id: 'job2',
        title: 'Reparación Urgente - Carlos Martínez',
        description: 'Reparación urgente de sistema de agua',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        scheduledAt: new Date('2025-08-26T14:00:00Z'), // 2:00 PM
        address: 'Las Condes 456, Santiago',
        clientId: cliente2.id,
        serviceId: servicio2.id,
        technicianId: tecnico2.id,
        createdById: admin.id
      }
    });

    const trabajo3 = await prisma.job.upsert({
      where: { id: 'job3' },
      update: {},
      create: {
        id: 'job3',
        title: 'Mantenimiento - Ana González',
        description: 'Mantenimiento general de instalaciones',
        status: 'COMPLETED',
        priority: 'LOW',
        scheduledAt: new Date('2025-08-25T09:00:00Z'), // 9:00 AM (ayer)
        address: 'Ñuñoa 789, Santiago',
        clientId: cliente3.id,
        serviceId: servicio1.id,
        technicianId: tecnico1.id,
        createdById: admin.id
      }
    });

    console.log('   ✅ Trabajos creados');

    console.log('');
    console.log('🎉 BASE DE DATOS POBLADA EXITOSAMENTE');
    console.log('');
    console.log('📊 RESUMEN:');
    console.log(`   - Roles: 3 creados`);
    console.log(`   - Usuarios: 4 creados (1 admin, 1 secretaria, 2 técnicos)`);
    console.log(`   - Servicios: 2 creados`);
    console.log(`   - Clientes: 3 creados (2 con horarios, 1 sin horario)`);
    console.log(`   - Trabajos: 3 creados con horarios específicos`);
    console.log('');
    console.log('🔧 DATOS DE PRUEBA:');
    console.log('   - Cliente 1: Horario 09:00-17:00, Lunes a Viernes');
    console.log('   - Cliente 2: Horario 10:00-18:00, Martes, Jueves, Sábado');
    console.log('   - Cliente 3: Sin horario preferido');
    console.log('');
    console.log('📅 TRABAJOS PROGRAMADOS:');
    console.log('   - Trabajo 1: 26/08/2025 10:00 AM (Pendiente)');
    console.log('   - Trabajo 2: 26/08/2025 2:00 PM (En Progreso)');
    console.log('   - Trabajo 3: 25/08/2025 9:00 AM (Completado)');
    console.log('');
    console.log('🔐 CREDENCIALES DE ACCESO:');
    console.log('   - Email: admin@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('   - Email: secretaria@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('   - Email: tecnico@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('   - Email: martin@amestica.cl');
    console.log('   - Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
seedWithSchedule().catch(console.error);
