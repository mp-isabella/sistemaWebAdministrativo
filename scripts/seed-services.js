const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServices() {
  try {
    console.log('🌱 Iniciando seed de servicios...');

    // Buscar un usuario admin existente (con rol en minúscula)
    const adminUser = await prisma.user.findFirst({
      where: { role: { name: 'admin' } }
    });

    if (!adminUser) {
      console.error('❌ No se encontró usuario admin.');
      return;
    }

    console.log('✅ Usuario admin encontrado:', adminUser.email);

    // Servicios que deben existir
    const services = [
      {
        name: 'Detección de Fugas de Agua',
        description: 'Servicio especializado en la detección y localización de fugas de agua en sistemas hidráulicos',
        price: 50000,
        category: 'deteccion_fugas'
      },
      {
        name: 'Destape de Alcantarillado',
        description: 'Servicio de limpieza y destape de sistemas de alcantarillado y drenajes',
        price: 35000,
        category: 'destape_alcantarillado'
      },
      {
        name: 'Videointrospección de Ductos',
        description: 'Inspección con cámara de video para evaluar el estado interno de ductos y tuberías',
        price: 45000,
        category: 'videointrospeccion'
      }
    ];

    for (const service of services) {
      // Verificar si el servicio ya existe
      const existingService = await prisma.service.findFirst({
        where: { name: service.name }
      });

      if (!existingService) {
        const newService = await prisma.service.create({
          data: {
            name: service.name,
            description: service.description,
            price: service.price,
            createdById: adminUser.id
          }
        });
        console.log(`✅ Servicio creado: ${newService.name}`);
      } else {
        console.log(`ℹ️ Servicio ya existe: ${existingService.name}`);
      }
    }

    console.log('🎉 Seed de servicios completado');
  } catch (error) {
    console.error('❌ Error en seed de servicios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();
