#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
    }
  }
});

async function setupCleanDatabase() {
  console.log('🧹 Configurando base de datos limpia...\n');

  try {
    // 1. Crear roles (solo 3)
    console.log('👥 Creando roles...');
    
    // Verificar si ya existen roles
    const existingRoles = await prisma.role.findMany();
    if (existingRoles.length === 0) {
      const roles = ['ADMIN', 'SECRETARIA', 'TECNICO'];
      for (const roleName of roles) {
        await prisma.role.create({ data: { name: roleName } });
        console.log(`   ✅ Rol creado: ${roleName}`);
      }
    } else {
      console.log(`   ℹ️ Roles ya existen: ${existingRoles.length}`);
    }

    // 2. Crear empresas (solo 3)
    console.log('\n🏢 Creando empresas...');
    const existingCompanies = await prisma.company.findMany();
    if (existingCompanies.length === 0) {
      const companies = [
        { name: 'Amestica Ltda' },
        { name: 'Multifugas' },
        { name: 'Servifugas' }
      ];
      
      for (const companyData of companies) {
        await prisma.company.create({ data: companyData });
        console.log(`   ✅ Empresa creada: ${companyData.name}`);
      }
    } else {
      console.log(`   ℹ️ Empresas ya existen: ${existingCompanies.length}`);
    }

    // 3. Crear servicios (solo 3)
    console.log('\n🔧 Creando servicios...');
    const existingServices = await prisma.service.findMany();
    if (existingServices.length === 0) {
      const services = [
        { name: 'Detección de fugas de agua', description: 'Servicio de detección de fugas', price: 50000, isActive: true },
        { name: 'Destape de alcantarillado', description: 'Servicio de destape de alcantarillado', price: 75000, isActive: true },
        { name: 'Videoinspeccion de ductos', description: 'Servicio de videoinspección', price: 100000, isActive: true }
      ];
      
      for (const serviceData of services) {
        await prisma.service.create({ data: serviceData });
        console.log(`   ✅ Servicio creado: ${serviceData.name}`);
      }
    } else {
      console.log(`   ℹ️ Servicios ya existen: ${existingServices.length}`);
    }

    // 4. Crear usuarios (solo 3)
    console.log('\n👤 Creando usuarios...');
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length === 0) {
      // Obtener roles
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
      const secretariaRole = await prisma.role.findUnique({ where: { name: 'SECRETARIA' } });
      const tecnicoRole = await prisma.role.findUnique({ where: { name: 'TECNICO' } });

      const users = [
        {
          name: 'Administrador',
          email: 'admin@amestica.cl',
          password: await bcrypt.hash('admin123', 12),
          roleId: adminRole.id,
          isActive: true
        },
        {
          name: 'Secretaria',
          email: 'secretaria@amestica.cl',
          password: await bcrypt.hash('secretaria123', 12),
          roleId: secretariaRole.id,
          isActive: true
        },
        {
          name: 'Técnico',
          email: 'tecnico@amestica.cl',
          password: await bcrypt.hash('tecnico123', 12),
          roleId: tecnicoRole.id,
          isActive: true
        }
      ];

      for (const userData of users) {
        await prisma.user.create({ data: userData });
        console.log(`   ✅ Usuario creado: ${userData.name} (${userData.email})`);
      }
    } else {
      console.log(`   ℹ️ Usuarios ya existen: ${existingUsers.length}`);
    }

    // 5. Crear algunos clientes de ejemplo
    console.log('\n👥 Creando clientes de ejemplo...');
    const existingClients = await prisma.client.findMany();
    if (existingClients.length === 0) {
      const clients = [
        {
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+56912345678',
          address: 'Av. Principal 123, Santiago',
          status: 'active'
        },
        {
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+56987654321',
          address: 'Calle Secundaria 456, Valparaíso',
          status: 'active'
        },
        {
          name: 'Carlos Silva',
          email: 'carlos.silva@email.com',
          phone: '+56911223344',
          address: 'Plaza Central 789, Concepción',
          status: 'active'
        }
      ];

      for (const clientData of clients) {
        await prisma.client.create({ data: clientData });
        console.log(`   ✅ Cliente creado: ${clientData.name}`);
      }
    } else {
      console.log(`   ℹ️ Clientes ya existen: ${existingClients.length}`);
    }

    // 6. Verificar datos finales
    console.log('\n📊 Verificando datos finales...');
    const roleCount = await prisma.role.count();
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    const serviceCount = await prisma.service.count();
    const clientCount = await prisma.client.count();

    console.log(`   Roles: ${roleCount}`);
    console.log(`   Usuarios: ${userCount}`);
    console.log(`   Empresas: ${companyCount}`);
    console.log(`   Servicios: ${serviceCount}`);
    console.log(`   Clientes: ${clientCount}`);

    console.log('\n✅ Base de datos configurada correctamente!');
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Administrador: admin@amestica.cl / admin123');
    console.log('   Secretaria: secretaria@amestica.cl / secretaria123');
    console.log('   Técnico: tecnico@amestica.cl / tecnico123');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCleanDatabase();
