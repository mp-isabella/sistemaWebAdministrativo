const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Verificando si existe el usuario admin...');
    
    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@amestica.cl'
      }
    });

    if (existingAdmin) {
      console.log('✅ El usuario admin ya existe');
      console.log('Email:', existingAdmin.email);
      console.log('Rol:', existingAdmin.roleId);
      return;
    }

    console.log('🔍 Verificando si existe el rol admin...');
    
    // Verificar si existe el rol admin
    let adminRole = await prisma.role.findFirst({
      where: {
        name: 'admin'
      }
    });

    if (!adminRole) {
      console.log('📝 Creando rol admin...');
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: 'Administrador del sistema',
          permissions: ['all']
        }
      });
      console.log('✅ Rol admin creado con ID:', adminRole.id);
    } else {
      console.log('✅ Rol admin ya existe con ID:', adminRole.id);
    }

    console.log('🔐 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    console.log('👤 Creando usuario admin...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@amestica.cl',
        password: hashedPassword,
        name: 'Administrador',
        isActive: true,
        roleId: adminRole.id
      }
    });

    console.log('✅ Usuario admin creado exitosamente!');
    console.log('ID:', adminUser.id);
    console.log('Email:', adminUser.email);
    console.log('Nombre:', adminUser.name);
    console.log('Rol ID:', adminUser.roleId);
    console.log('Activo:', adminUser.isActive);

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
