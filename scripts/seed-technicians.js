const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTechnicians() {
  try {
    console.log('👨‍🔧 Poblando base de datos con técnicos...');

    // Obtener el usuario admin para asignar como creador
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@amestica.cl' }
    });

    if (!adminUser) {
      console.error('❌ No se encontró el usuario admin.');
      return;
    }

    // Crear rol técnico si no existe
    const technicianRole = await prisma.role.upsert({
      where: { name: 'TECNICO' },
      update: {},
      create: {
        name: 'TECNICO'
      }
    });

    // Datos de técnicos
    const technicians = [
      {
        name: 'Marta Barrera',
        email: 'marta.barrera@amestica.cl',
        phone: '+56912345678',
        isActive: true
      },
      {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@amestica.cl',
        phone: '+56987654321',
        isActive: true
      },
      {
        name: 'Patricia López',
        email: 'patricia.lopez@amestica.cl',
        phone: '+56911223344',
        isActive: true
      }
    ];

    for (const techData of technicians) {
      // Verificar si ya existe
      const existingTech = await prisma.user.findUnique({
        where: { email: techData.email }
      });

      if (existingTech) {
        console.log(`⚠️ Técnico ya existe: ${techData.name}`);
        continue;
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash('tecnico123', 10);

      // Crear técnico
      const technician = await prisma.user.create({
        data: {
          name: techData.name,
          email: techData.email,
          password: hashedPassword,
          phone: techData.phone,
          roleId: technicianRole.id,
          isActive: techData.isActive
        }
      });

      console.log(`✅ Técnico creado: ${technician.name}`);
    }

    // Contar técnicos activos
    const activeTechnicians = await prisma.user.count({
      where: { 
        role: { name: 'TECNICO' },
        isActive: true 
      }
    });

    console.log('🎉 Poblado de técnicos completado exitosamente!');
    console.log(`📊 Total de técnicos activos: ${activeTechnicians}`);

  } catch (error) {
    console.error('❌ Error poblando técnicos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTechnicians();
