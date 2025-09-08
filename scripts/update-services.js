const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateServices() {
  try {
    console.log('🔄 Actualizando servicios...');

    // Obtener el usuario admin para asignar como creador
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@amestica.cl' }
    });

    if (!adminUser) {
      console.error('❌ No se encontró el usuario admin.');
      return;
    }

    // Definir los servicios específicos
    const specificServices = [
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
    console.log('✅ Servicios existentes desactivados');

    // Crear o actualizar los servicios específicos
    for (const serviceData of specificServices) {
      const existingService = await prisma.service.findUnique({
        where: { name: serviceData.name }
      });

      if (existingService) {
        // Actualizar servicio existente
        await prisma.service.update({
          where: { id: existingService.id },
          data: {
            ...serviceData,
            isActive: true,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Servicio actualizado: ${serviceData.name}`);
      } else {
        // Crear nuevo servicio
        await prisma.service.create({
          data: {
            ...serviceData,
            createdById: adminUser.id,
            isActive: true
          }
        });
        console.log(`✅ Servicio creado: ${serviceData.name}`);
      }
    }

    // Contar servicios activos
    const activeServices = await prisma.service.count({
      where: { isActive: true }
    });

    console.log('🎉 Actualización de servicios completada!');
    console.log(`📊 Total de servicios activos: ${activeServices}`);

  } catch (error) {
    console.error('❌ Error actualizando servicios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServices();
