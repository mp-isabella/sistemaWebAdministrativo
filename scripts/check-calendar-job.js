// Script para verificar el trabajo de María Riquelme en la base de datos
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCalendarJob() {
  try {
    console.log('🔍 Verificando trabajo de María Riquelme en la base de datos...\n')

    // Buscar el trabajo específico
    const job = await prisma.job.findFirst({
      where: {
        client: {
          name: {
            contains: 'María Riquelme',
            mode: 'insensitive'
          }
        }
      },
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (job) {
      console.log('✅ Trabajo encontrado:')
      console.log('  - ID:', job.id)
      console.log('  - Título:', job.title)
      console.log('  - Cliente:', job.client?.name)
      console.log('  - Técnico:', job.technician?.name)
      console.log('  - Servicio:', job.service?.name)
      console.log('  - Fecha programada:', job.scheduledAt)
      console.log('  - Estado:', job.status)
      console.log('  - Prioridad:', job.priority)
    } else {
      console.log('❌ No se encontró el trabajo de María Riquelme')
    }

    // Buscar todos los trabajos programados
    console.log('\n📋 Todos los trabajos programados:')
    const allJobs = await prisma.job.findMany({
      where: {
        scheduledAt: {
          not: null
        }
      },
      include: {
        client: true,
        technician: true,
        service: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log(`Total de trabajos programados: ${allJobs.length}`)
    
    allJobs.forEach((job, index) => {
      console.log(`  ${index + 1}. ${job.title}`)
      console.log(`     Cliente: ${job.client?.name}`)
      console.log(`     Técnico: ${job.technician?.name || 'Sin técnico'}`)
      console.log(`     Fecha: ${job.scheduledAt}`)
      console.log(`     Estado: ${job.status}`)
      console.log('')
    })

    // Verificar técnicos
    console.log('👨‍🔧 Técnicos disponibles:')
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    console.log(`Total de técnicos: ${technicians.length}`)
    technicians.forEach((tech, index) => {
      console.log(`  ${index + 1}. ${tech.name} (${tech.email})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCalendarJob()
