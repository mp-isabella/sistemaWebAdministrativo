const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJobs() {
  try {
    console.log('📋 Verificando trabajos en la base de datos...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      },
      take: 10
    })

    console.log(`📊 Total de trabajos: ${jobs.length}`)
    
    if (jobs.length > 0) {
      console.log('\n🔧 Trabajos encontrados:')
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title}`)
        console.log(`   - Cliente: ${job.client.name}`)
        console.log(`   - Servicio: ${job.service.name}`)
        console.log(`   - Técnico: ${job.technician?.name || 'Sin asignar'}`)
        console.log(`   - Estado: ${job.status}`)
        console.log(`   - Fecha: ${job.createdAt.toLocaleDateString('es-CL')}`)
        console.log('')
      })
    }

    // Verificar por empresa/servicio
    const jobsByService = await prisma.job.groupBy({
      by: ['serviceId'],
      _count: { id: true }
    })

    // Obtener detalles de servicios
    const serviceIds = jobsByService.map(item => item.serviceId)
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } }
    })
    const servicesMap = new Map(services.map(s => [s.id, s]))

    console.log('📈 Trabajos por empresa/servicio:')
    jobsByService.forEach(item => {
      const service = servicesMap.get(item.serviceId)
      console.log(`   - ${service?.name || 'Servicio desconocido'}: ${item._count.id} trabajos`)
    })

  } catch (error) {
    console.error('❌ Error verificando trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobs()
