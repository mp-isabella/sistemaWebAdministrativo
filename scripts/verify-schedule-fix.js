const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyScheduleFix() {
  try {
    console.log('✅ Verificando corrección de fechas en la agenda...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true,
        company: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    // Verificar trabajos para hoy
    const today = new Date()
    const todayJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate.toDateString() === today.toDateString()
    })

    console.log(`📅 Trabajos para hoy (${today.toLocaleDateString('es-CL')}): ${todayJobs.length}`)
    
    if (todayJobs.length > 0) {
      todayJobs.forEach(job => {
        const scheduledDate = new Date(job.scheduledAt)
        console.log(`  ✅ ${job.title}`)
        console.log(`     Cliente: ${job.client?.name}`)
        console.log(`     Técnico: ${job.technician?.name}`)
        console.log(`     Empresa: ${job.company?.name || 'Sin empresa'}`)
        console.log(`     Hora: ${scheduledDate.toLocaleTimeString('es-CL', { 
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Santiago'
        })}`)
        console.log(`     Estado: ${job.status}`)
        console.log('')
      })
    } else {
      console.log('  ❌ No hay trabajos programados para hoy')
    }

    // Verificar trabajos para mañana
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate.toDateString() === tomorrow.toDateString()
    })

    console.log(`📅 Trabajos para mañana (${tomorrow.toLocaleDateString('es-CL')}): ${tomorrowJobs.length}`)
    
    if (tomorrowJobs.length > 0) {
      tomorrowJobs.forEach(job => {
        const scheduledDate = new Date(job.scheduledAt)
        console.log(`  ✅ ${job.title}`)
        console.log(`     Cliente: ${job.client?.name}`)
        console.log(`     Técnico: ${job.technician?.name}`)
        console.log(`     Empresa: ${job.company?.name || 'Sin empresa'}`)
        console.log(`     Hora: ${scheduledDate.toLocaleTimeString('es-CL', { 
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Santiago'
        })}`)
        console.log(`     Estado: ${job.status}`)
        console.log('')
      })
    } else {
      console.log('  ❌ No hay trabajos programados para mañana')
    }

    // Verificar que las fechas estén en el formato correcto
    console.log('🔍 Verificando formato de fechas:')
    jobs.forEach((job, index) => {
      const scheduledDate = new Date(job.scheduledAt)
      const formattedDate = scheduledDate.toLocaleDateString('es-CL', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago'
      })
      const formattedTime = scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })
      
      console.log(`  ${index + 1}. ${job.title}: ${formattedDate} ${formattedTime}`)
    })

    console.log('\n🎉 Verificación completada')
    console.log('💡 Si los trabajos no aparecen en la página web:')
    console.log('   1. Refresca la página (F5)')
    console.log('   2. Verifica que el servidor esté corriendo')
    console.log('   3. Los eventos de actualización automática están configurados')

  } catch (error) {
    console.error('❌ Error al verificar agenda:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyScheduleFix()
