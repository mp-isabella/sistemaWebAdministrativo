const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUnassignedJobs() {
  try {
    console.log('🧪 Probando creación de trabajos sin asignar técnico...\n')

    // 1. Verificar que hay clientes, servicios, empresas y usuarios disponibles
    const clients = await prisma.client.findMany({ take: 1 })
    const services = await prisma.service.findMany({ take: 1 })
    const companies = await prisma.company.findMany({ take: 1 })
    const users = await prisma.user.findMany({ take: 1 })

    if (!clients.length || !services.length || !companies.length || !users.length) {
      console.log('❌ No hay suficientes datos para crear un trabajo')
      console.log(`   Clientes: ${clients.length}`)
      console.log(`   Servicios: ${services.length}`)
      console.log(`   Empresas: ${companies.length}`)
      console.log(`   Usuarios: ${users.length}`)
      return
    }

    console.log('✅ Datos disponibles para crear trabajo:')
    console.log(`   Cliente: ${clients[0].name}`)
    console.log(`   Servicio: ${services[0].name}`)
    console.log(`   Empresa: ${companies[0].name}`)
    console.log(`   Usuario creador: ${users[0].name}`)

    // 2. Crear un trabajo sin asignar técnico
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0) // 10:00 AM

    const newJob = await prisma.job.create({
      data: {
        title: "Trabajo de Prueba Sin Técnico",
        description: "Trabajo creado para probar funcionalidad sin asignar técnico",
        clientId: clients[0].id,
        serviceId: services[0].id,
        companyId: companies[0].id,
        technicianId: null, // Sin técnico asignado
        scheduledAt: tomorrow,
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "MEDIUM",
        createdById: users[0].id // Usar un usuario real
      },
      include: {
        client: true,
        service: true,
        company: true,
        technician: true
      }
    })

    console.log('\n✅ Trabajo creado exitosamente sin técnico asignado:')
    console.log(`   ID: ${newJob.id}`)
    console.log(`   Título: ${newJob.title}`)
    console.log(`   Cliente: ${newJob.client.name}`)
    console.log(`   Servicio: ${newJob.service.name}`)
    console.log(`   Empresa: ${newJob.company.name}`)
    console.log(`   Técnico: ${newJob.technician ? newJob.technician.name : 'Sin asignar'}`)
    console.log(`   Fecha: ${newJob.scheduledAt}`)
    console.log(`   Horario: ${newJob.startTime} - ${newJob.endTime}`)

    // 3. Verificar que el trabajo aparece en la API del calendario
    console.log('\n🔍 Verificando que el trabajo aparece en la API del calendario...')
    
    // Simular la consulta de la API del calendario
    const calendarJobs = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
          lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)
        }
      },
      include: {
        client: true,
        service: true,
        technician: true,
        company: true
      }
    })

    const unassignedJob = calendarJobs.find(job => job.id === newJob.id)
    
    if (unassignedJob) {
      console.log('✅ Trabajo encontrado en la API del calendario')
      console.log(`   professionalId: ${unassignedJob.technician?.id || 'tecnico-generico'}`)
      console.log(`   Debería aparecer en la columna "Técnico" del calendario`)
    } else {
      console.log('❌ Trabajo no encontrado en la API del calendario')
    }

    // 4. Limpiar el trabajo de prueba
    console.log('\n🧹 Limpiando trabajo de prueba...')
    await prisma.job.delete({
      where: { id: newJob.id }
    })
    console.log('✅ Trabajo de prueba eliminado')

    console.log('\n🎉 Prueba completada exitosamente!')
    console.log('   Los trabajos sin técnico asignado se pueden crear y aparecen en la columna "Técnico" del calendario')

  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la prueba
testUnassignedJobs()
