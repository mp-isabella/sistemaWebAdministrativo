const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabaseJobs() {
  try {
    console.log('🔍 Verificando trabajos en la base de datos...\n')
    
    // Obtener todos los trabajos con información relacionada
    const jobs = await prisma.job.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })
    
    console.log(`📊 Total de trabajos en la base de datos: ${jobs.length}\n`)
    
    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }
    
    // Mostrar detalles de cada trabajo
    jobs.forEach((job, index) => {
      console.log(`--- Trabajo ${index + 1} ---`)
      console.log(`ID: ${job.id}`)
      console.log(`Título: ${job.title}`)
      console.log(`Cliente: ${job.client?.name || 'Sin cliente'}`)
      console.log(`Servicio: ${job.service?.name || 'Sin servicio'}`)
      console.log(`Técnico: ${job.technician?.name || 'Sin técnico'}`)
      console.log(`Estado: ${job.status || 'Sin estado'}`)
      console.log(`Fecha programada: ${job.scheduledAt}`)
      console.log(`Descripción: ${job.description || 'Sin descripción'}`)
      console.log('')
    })
    
    // Verificar trabajos por fecha específica (26 de agosto)
    const august26 = new Date('2025-08-26')
    const august27 = new Date('2025-08-27')
    
    const jobsAugust26 = jobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate.toDateString() === august26.toDateString()
    })
    
    const jobsAugust27 = jobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate.toDateString() === august27.toDateString()
    })
    
    console.log(`📅 Trabajos para el 26 de agosto: ${jobsAugust26.length}`)
    jobsAugust26.forEach(job => {
      console.log(`  - ${job.client?.name} (${job.service?.name}) - ${job.technician?.name} - ${job.scheduledAt}`)
    })
    
    console.log(`📅 Trabajos para el 27 de agosto: ${jobsAugust27.length}`)
    jobsAugust27.forEach(job => {
      console.log(`  - ${job.client?.name} (${job.service?.name}) - ${job.technician?.name} - ${job.scheduledAt}`)
    })
    
    // Verificar técnicos
    console.log('\n👥 Verificando técnicos...')
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['TECNICO', 'tecnico']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`Técnicos encontrados: ${technicians.length}`)
    technicians.forEach(tech => {
      console.log(`  - ${tech.name} (${tech.role.name}) - ${tech.id}`)
    })
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabaseJobs()
