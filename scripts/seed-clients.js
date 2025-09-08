const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedClients() {
  try {
    console.log('🌱 Poblando base de datos con clientes de ejemplo...');

    // Obtener el usuario admin para asignar como creador
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@amestica.cl' }
    });

    if (!adminUser) {
      console.error('❌ No se encontró el usuario admin. Ejecuta primero el seed de usuarios.');
      return;
    }

    // Crear clientes de ejemplo
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
        email: 'camilo@email.com',
        phone: '+56987654321',
        address: 'Viña del Mar, V Región',
        region: 'Valparaíso',
        commune: 'Viña del Mar',
        company: 'Empresa Constructora ABC',
        notes: 'Cliente comercial',
        preferredTimeStart: '08:00',
        preferredTimeEnd: '16:00',
        preferredDays: 'Lunes,Viernes'
      },
      {
        name: 'Ana Martínez',
        email: 'ana@email.com',
        phone: '+56911111111',
        address: 'Rancagua, VI Región',
        region: "O'Higgins",
        commune: 'Rancagua',
        notes: 'Cliente residencial',
        preferredTimeStart: '10:00',
        preferredTimeEnd: '18:00',
        preferredDays: 'Martes,Jueves,Sábado'
      },
      {
        name: 'Juan Pérez',
        email: 'juan.perez@empresa.cl',
        phone: '+56922222222',
        address: 'Santiago Centro, Región Metropolitana',
        region: 'Metropolitana',
        commune: 'Santiago',
        company: 'Condominio Las Flores',
        notes: 'Cliente condominio',
        preferredTimeStart: '07:00',
        preferredTimeEnd: '15:00',
        preferredDays: 'Lunes,Martes,Miércoles,Jueves,Viernes'
      },
      {
        name: 'Carmen Silva',
        email: 'carmen.silva@gmail.com',
        phone: '+56933333333',
        address: 'Concepción, VIII Región',
        region: 'Bío Bío',
        commune: 'Concepción',
        notes: 'Cliente residencial',
        preferredTimeStart: '14:00',
        preferredTimeEnd: '20:00',
        preferredDays: 'Lunes,Sábado'
      }
    ];

    // Insertar clientes
    for (const clientData of clients) {
      const existingClient = await prisma.client.findUnique({
        where: { email: clientData.email }
      });

      if (!existingClient) {
        await prisma.client.create({
          data: {
            ...clientData,
            createdById: adminUser.id
          }
        });
        console.log(`✅ Cliente creado: ${clientData.name}`);
      } else {
        console.log(`⏭️ Cliente ya existe: ${clientData.name}`);
      }
    }

    console.log('🎉 Poblado de clientes completado exitosamente!');
    console.log(`📊 Total de clientes en la base de datos: ${await prisma.client.count()}`);

  } catch (error) {
    console.error('❌ Error poblando clientes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClients();
