const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSecretary() {
  try {
    console.log('👩‍💼 Creando rol y usuario secretaria...');

    // Verificar si ya existe el rol secretaria
    const existingSecretaryRole = await prisma.role.findFirst({
      where: { name: 'SECRETARIA' }
    });

    if (!existingSecretaryRole) {
      // Crear rol secretaria
      const secretaryRole = await prisma.role.create({
        data: {
          name: 'SECRETARIA'
        }
      });
      console.log('✅ Rol SECRETARIA creado');
    } else {
      console.log('✅ El rol SECRETARIA ya existe');
    }

    // Verificar si ya existe un usuario secretaria
    const existingSecretary = await prisma.user.findFirst({
      where: { email: 'secretaria@amestica.cl' }
    });

    if (existingSecretary) {
      console.log('✅ El usuario secretaria ya existe');
      return;
    }

    // Obtener el rol secretaria
    const secretaryRole = await prisma.role.findFirst({
      where: { name: 'SECRETARIA' }
    });

    if (!secretaryRole) {
      console.error('❌ No se pudo encontrar el rol SECRETARIA');
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('secretaria123', 10);

    // Crear usuario secretaria
    const secretaryUser = await prisma.user.create({
      data: {
        name: 'Secretaria',
        email: 'secretaria@amestica.cl',
        password: hashedPassword,
        roleId: secretaryRole.id,
        isActive: true
      }
    });

    console.log('✅ Usuario secretaria creado exitosamente');
    console.log(`   Email: ${secretaryUser.email}`);
    console.log(`   Contraseña: secretaria123`);

    // Contar usuarios por rol
    const adminCount = await prisma.user.count({
      where: { role: { name: 'ADMIN' } }
    });

    const secretaryCount = await prisma.user.count({
      where: { role: { name: 'SECRETARIA' } }
    });

    const technicianCount = await prisma.user.count({
      where: { role: { name: 'TECNICO' } }
    });

    console.log('\n📊 Resumen de usuarios:');
    console.log(`   👤 Administradores: ${adminCount}`);
    console.log(`   👩‍💼 Secretarias: ${secretaryCount}`);
    console.log(`   👨‍🔧 Técnicos: ${technicianCount}`);

  } catch (error) {
    console.error('❌ Error creando secretaria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSecretary();
