const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJobsDates() {
  try {
    console.log('🔍 Verificando fechas de trabajos en la base de datos...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    jobs.forEach((job, index) => {
      const scheduledDate = new Date(job.scheduledAt)
      
      console.log(`${index + 1}. Trabajo: ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name}`)
      console.log(`   Servicio: ${job.service?.name}`)
      console.log(`   Fecha ISO: ${scheduledDate.toISOString()}`)
      console.log(`   Fecha local: ${scheduledDate.toLocaleString('es-CL')}`)
      console.log(`   Hora de inicio: ${job.startTime}`)
      console.log(`   Hora de fin: ${job.endTime}`)
      console.log(`   Estado: ${job.status}`)
      console.log('---')
    })

    // Verificar si hay trabajos con fechas incorrectas
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('\n🔍 Análisis de fechas:')
    
    jobs.forEach(job => {
      const scheduledDate = new Date(job.scheduledAt)
      const isToday = scheduledDate.toDateString() === today.toDateString()
      const isTomorrow = scheduledDate.toDateString() === tomorrow.toDateString()
      
      if (isToday) {
        console.log(`✅ ${job.title} - Programado para HOY`)
      } else if (isTomorrow) {
        console.log(`📅 ${job.title} - Programado para MAÑANA`)
      } else if (scheduledDate < today) {
        console.log(`⚠️  ${job.title} - Fecha PASADA: ${scheduledDate.toLocaleDateString('es-CL')}`)
      } else {
        console.log(`📅 ${job.title} - Fecha FUTURA: ${scheduledDate.toLocaleDateString('es-CL')}`)
      }
    })

  } catch (error) {
    console.error('❌ Error al verificar trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobsDates()
