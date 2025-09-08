const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createServices() {
  try {
    console.log('🔍 Verificando servicios existentes...');
    
    // Obtener servicios existentes
    const existingServices = await prisma.service.findMany();
    console.log('Servicios existentes:', existingServices.map(s => ({ id: s.id, name: s.name, isActive: s.isActive })));
    
    // Servicios requeridos
    const requiredServices = [
      {
        name: "Detección de Fugas de Agua",
        description: "Servicio de detección de fugas de agua usando tecnología avanzada",
        price: 75000,
        category: "deteccion_fugas",
        isActive: true
      },
      {
        name: "Destape de Alcantarillado",
        description: "Servicio de destape y limpieza de alcantarillado",
        price: 50000,
        category: "destape_alcantarillado",
        isActive: true
      },
      {
        name: "Videointrospección de Ductos",
        description: "Inspección de ductos usando cámara de video",
        price: 60000,
        category: "videointrospeccion",
        isActive: true
      }
    ];
    
    console.log('📝 Creando servicios requeridos...');
    
    for (const service of requiredServices) {
      const existing = existingServices.find(s => s.name === service.name);
      
      if (existing) {
        console.log(`✅ Servicio "${service.name}" ya existe`);
        // Actualizar si no está activo
        if (!existing.isActive) {
          await prisma.service.update({
            where: { id: existing.id },
            data: { isActive: true }
          });
          console.log(`🔄 Servicio "${service.name}" activado`);
        }
      } else {
        const newService = await prisma.service.create({
          data: service
        });
        console.log(`✅ Servicio "${service.name}" creado con ID: ${newService.id}`);
      }
    }
    
    console.log('🎉 Proceso completado');
    
    // Verificar servicios finales
    const finalServices = await prisma.service.findMany({
      where: { isActive: true }
    });
    
    console.log('📊 Servicios activos finales:');
    finalServices.forEach(s => {
      console.log(`  - ${s.name} (ID: ${s.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createServices();
