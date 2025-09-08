const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Configurando base de datos completa...\n');

    // 1. Crear roles
    console.log('1️⃣ Creando roles...');
    const roles = ['ADMIN', 'SECRETARIA', 'TECNICO'];
    
    for (const roleName of roles) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleName }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: { name: roleName }
        });
        console.log(`   ✅ Rol ${roleName} creado`);
      } else {
        console.log(`   ✅ Rol ${roleName} ya existe`);
      }
    }

    // 2. Crear usuarios
    console.log('\n2️⃣ Creando usuarios...');
    
    const users = [
      {
        name: 'Administrador',
        email: 'admin@amestica.cl',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        name: 'Secretaria',
        email: 'secretaria@amestica.cl',
        password: 'secretaria123',
        role: 'SECRETARIA'
      },
      {
        name: 'Marta Barrera',
        email: 'marta.barrera@amestica.cl',
        password: 'tecnico123',
        role: 'TECNICO',
        phone: '+56912345678'
      },
      {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@amestica.cl',
        password: 'tecnico123',
        role: 'TECNICO',
        phone: '+56987654321'
      },
      {
        name: 'Patricia López',
        email: 'patricia.lopez@amestica.cl',
        password: 'tecnico123',
        role: 'TECNICO',
        phone: '+56911223344'
      }
    ];

    for (const userData of users) {
      const existingUser = await prisma.user.findFirst({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const role = await prisma.role.findFirst({
          where: { name: userData.role }
        });

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            roleId: role.id,
            phone: userData.phone || null,
            isActive: true
          }
        });
        console.log(`   ✅ Usuario ${userData.name} (${userData.role}) creado`);
      } else {
        console.log(`   ✅ Usuario ${userData.name} ya existe`);
      }
    }

    // 3. Crear servicios
    console.log('\n3️⃣ Configurando servicios...');
    
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@amestica.cl' }
    });

    const services = [
      {
        name: 'Amestica',
        description: 'Diagnóstico de redes de agua',
        price: 80000,
        category: 'Diagnóstico'
      },
      {
        name: 'Multifugas',
        description: 'Detección de fugas con tecnología especializada',
        price: 50000,
        category: 'Detección'
      },
      {
        name: 'Servifugas',
        description: 'Revisión de fugas domiciliarias',
        price: 35000,
        category: 'Revisión'
      }
    ];

    // Desactivar todos los servicios existentes
    await prisma.service.updateMany({
      data: { isActive: false }
    });

    for (const serviceData of services) {
      const existingService = await prisma.service.findUnique({
        where: { name: serviceData.name }
      });

      if (existingService) {
        await prisma.service.update({
          where: { id: existingService.id },
          data: {
            ...serviceData,
            isActive: true,
            updatedAt: new Date()
          }
        });
        console.log(`   ✅ Servicio ${serviceData.name} actualizado`);
      } else {
        await prisma.service.create({
          data: {
            ...serviceData,
            createdById: adminUser.id,
            isActive: true
          }
        });
        console.log(`   ✅ Servicio ${serviceData.name} creado`);
      }
    }

    // 4. Crear clientes
    console.log('\n4️⃣ Creando clientes...');
    
    const clients = [
      {
        name: 'María Riquelme',
        email: 'paz.rimed@gmail.com',
        phone: '+56985714993',
        address: 'Chillán, Ñuble',
        region: 'Ñuble',
        commune: 'Chillán',
        company: 'Améstica Ltda',
        notes: 'Cliente preferencial',
        preferredTimeStart: '09:00',
        preferredTimeEnd: '17:00',
        preferredDays: 'Lunes,Martes,Miércoles,Jueves,Viernes'
      },
      {
        name: 'Camilo Rodríguez',
        email: 'camilo.rodriguez@empresa.cl',
        phone: '+56987654321',
        address: 'Santiago, Región Metropolitana',
        region: 'Región Metropolitana',
        commune: 'Santiago',
        company: 'Constructora Rodríguez',
        notes: 'Cliente corporativo',
        preferredTimeStart: '08:00',
        preferredTimeEnd: '16:00',
        preferredDays: 'Lunes,Viernes'
      },
      {
        name: 'Ana Martínez',
        email: 'ana.martinez@hotmail.com',
        phone: '+56911223344',
        address: 'Valparaíso, Valparaíso',
        region: 'Valparaíso',
        commune: 'Valparaíso',
        company: null,
        notes: 'Cliente residencial',
        preferredTimeStart: '10:00',
        preferredTimeEnd: '18:00',
        preferredDays: 'Martes,Jueves,Sábado'
      },
      {
        name: 'Juan Pérez',
        email: 'juan.perez@gmail.com',
        phone: '+56955667788',
        address: 'Concepción, Biobío',
        region: 'Biobío',
        commune: 'Concepción',
        company: 'Pérez & Asociados',
        notes: 'Cliente frecuente',
        preferredTimeStart: '09:30',
        preferredTimeEnd: '17:30',
        preferredDays: 'Lunes,Martes,Miércoles,Jueves,Viernes'
      },
      {
        name: 'Carmen Silva',
        email: 'carmen.silva@yahoo.com',
        phone: '+56999887766',
        address: 'La Serena, Coquimbo',
        region: 'Coquimbo',
        commune: 'La Serena',
        company: null,
        notes: 'Cliente nuevo',
        preferredTimeStart: '08:30',
        preferredTimeEnd: '16:30',
        preferredDays: 'Lunes,Miércoles,Viernes'
      }
    ];

    for (const clientData of clients) {
      const existingClient = await prisma.client.findFirst({
        where: { email: clientData.email }
      });

      if (!existingClient) {
        await prisma.client.create({
          data: {
            ...clientData,
            createdById: adminUser.id
          }
        });
        console.log(`   ✅ Cliente ${clientData.name} creado`);
      } else {
        console.log(`   ✅ Cliente ${clientData.name} ya existe`);
      }
    }

    // 5. Crear trabajo de prueba
    console.log('\n5️⃣ Creando trabajo de prueba...');
    
    const client = await prisma.client.findFirst();
    const service = await prisma.service.findFirst();
    const technician = await prisma.user.findFirst({
      where: { 
        role: { name: 'TECNICO' },
        isActive: true 
      }
    });

    if (client && service && technician) {
      const existingJob = await prisma.job.findFirst({
        where: { title: 'Trabajo de Prueba' }
      });

      if (!existingJob) {
        await prisma.job.create({
          data: {
            title: 'Trabajo de Prueba',
            description: 'Este es un trabajo de prueba para verificar el CRUD',
            clientId: client.id,
            serviceId: service.id,
            technicianId: technician.id,
            createdById: adminUser.id,
            scheduledAt: new Date('2025-08-28T10:00:00Z'),
            startTime: '09:00',
            endTime: '17:00',
            priority: 'MEDIUM',
            status: 'PENDING'
          }
        });
        console.log('   ✅ Trabajo de prueba creado');
      } else {
        console.log('   ✅ Trabajo de prueba ya existe');
      }
    }

    // 6. Resumen final
    console.log('\n📊 Resumen final:');
    
    const userCounts = await Promise.all([
      prisma.user.count({ where: { role: { name: 'ADMIN' } } }),
      prisma.user.count({ where: { role: { name: 'SECRETARIA' } } }),
      prisma.user.count({ where: { role: { name: 'TECNICO' } } }),
      prisma.client.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.job.count()
    ]);

    console.log(`   👤 Administradores: ${userCounts[0]}`);
    console.log(`   👩‍💼 Secretarias: ${userCounts[1]}`);
    console.log(`   👨‍🔧 Técnicos: ${userCounts[2]}`);
    console.log(`   👥 Clientes: ${userCounts[3]}`);
    console.log(`   🔧 Servicios activos: ${userCounts[4]}`);
    console.log(`   📋 Trabajos: ${userCounts[5]}`);

    console.log('\n🎉 Base de datos configurada completamente!');
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   👤 Admin: admin@amestica.cl / admin123');
    console.log('   👩‍💼 Secretaria: secretaria@amestica.cl / secretaria123');
    console.log('   👨‍🔧 Técnicos: [email] / tecnico123');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteDatabase();
