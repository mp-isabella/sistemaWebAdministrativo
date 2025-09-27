#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function fixDatabase() {
  console.log('🔧 Solucionando base de datos...\n');

  // Crear nueva instancia de Prisma para evitar problemas de prepared statements
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
      }
    }
  });

  try {
    // 1. Verificar estado actual
    console.log('📊 Verificando estado actual...');
    
    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();
    const companies = await prisma.company.findMany();
    const services = await prisma.service.findMany();
    const clients = await prisma.client.findMany();

    console.log(`   Roles: ${roles.length}`);
    console.log(`   Usuarios: ${users.length}`);
    console.log(`   Empresas: ${companies.length}`);
    console.log(`   Servicios: ${services.length}`);
    console.log(`   Clientes: ${clients.length}`);

    // 2. Crear roles si no existen
    if (roles.length === 0) {
      console.log('\n👥 Creando roles...');
      await prisma.role.create({ data: { name: 'ADMIN' } });
      await prisma.role.create({ data: { name: 'SECRETARIA' } });
      await prisma.role.create({ data: { name: 'TECNICO' } });
      console.log('   ✅ Roles creados');
    }

    // 3. Crear empresas si no existen
    if (companies.length === 0) {
      console.log('\n🏢 Creando empresas...');
      await prisma.company.create({ data: { name: 'Amestica Ltda' } });
      await prisma.company.create({ data: { name: 'Multifugas' } });
      await prisma.company.create({ data: { name: 'Servifugas' } });
      console.log('   ✅ Empresas creadas');
    }

    // 4. Crear servicios si no existen
    if (services.length === 0) {
      console.log('\n🔧 Creando servicios...');
      await prisma.service.create({ 
        data: { 
          name: 'Detección de fugas de agua', 
          description: 'Servicio de detección de fugas', 
          price: 50000, 
          isActive: true 
        } 
      });
      await prisma.service.create({ 
        data: { 
          name: 'Destape de alcantarillado', 
          description: 'Servicio de destape de alcantarillado', 
          price: 75000, 
          isActive: true 
        } 
      });
      await prisma.service.create({ 
        data: { 
          name: 'Videoinspeccion de ductos', 
          description: 'Servicio de videoinspección', 
          price: 100000, 
          isActive: true 
        } 
      });
      console.log('   ✅ Servicios creados');
    }

    // 5. Crear usuarios si no existen
    if (users.length === 0) {
      console.log('\n👤 Creando usuarios...');
      
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
      const secretariaRole = await prisma.role.findUnique({ where: { name: 'SECRETARIA' } });
      const tecnicoRole = await prisma.role.findUnique({ where: { name: 'TECNICO' } });

      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@amestica.cl',
          password: await bcrypt.hash('admin123', 12),
          roleId: adminRole.id,
          isActive: true
        }
      });

      await prisma.user.create({
        data: {
          name: 'Secretaria',
          email: 'secretaria@amestica.cl',
          password: await bcrypt.hash('secretaria123', 12),
          roleId: secretariaRole.id,
          isActive: true
        }
      });

      await prisma.user.create({
        data: {
          name: 'Técnico',
          email: 'tecnico@amestica.cl',
          password: await bcrypt.hash('tecnico123', 12),
          roleId: tecnicoRole.id,
          isActive: true
        }
      });

      console.log('   ✅ Usuarios creados');
    }

    // 6. Crear clientes de ejemplo si no existen
    if (clients.length === 0) {
      console.log('\n👥 Creando clientes de ejemplo...');
      
      await prisma.client.create({
        data: {
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+56912345678',
          address: 'Av. Principal 123, Santiago',
          status: 'active'
        }
      });

      await prisma.client.create({
        data: {
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+56987654321',
          address: 'Calle Secundaria 456, Valparaíso',
          status: 'active'
        }
      });

      await prisma.client.create({
        data: {
          name: 'Carlos Silva',
          email: 'carlos.silva@email.com',
          phone: '+56911223344',
          address: 'Plaza Central 789, Concepción',
          status: 'active'
        }
      });

      console.log('   ✅ Clientes creados');
    }

    console.log('\n✅ Base de datos configurada correctamente!');
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Administrador: admin@amestica.cl / admin123');
    console.log('   Secretaria: secretaria@amestica.cl / secretaria123');
    console.log('   Técnico: tecnico@amestica.cl / tecnico123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
