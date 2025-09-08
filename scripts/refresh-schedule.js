const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function refreshSchedule() {
  try {
    console.log('🔄 Refrescando página de agenda...\n')

    // Verificar trabajos actuales
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

    console.log(`📊 Trabajos en la base de datos: ${jobs.length}\n`)

    jobs.forEach((job, index) => {
      const scheduledDate = new Date(job.scheduledAt)
      console.log(`${index + 1}. ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name}`)
      console.log(`   Servicio: ${job.service?.name}`)
      console.log(`   Empresa: ${job.company?.name || 'Sin empresa'}`)
      console.log(`   Fecha programada: ${scheduledDate.toLocaleDateString('es-CL', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago'
      })}`)
      console.log(`   Hora: ${scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })}`)
      console.log(`   Estado: ${job.status}`)
      console.log('---')
    })

    // Verificar trabajos para hoy
    const today = new Date()
    const todayJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate.toDateString() === today.toDateString()
    })

    console.log(`\n📅 Trabajos para hoy (${today.toLocaleDateString('es-CL')}): ${todayJobs.length}`)
    todayJobs.forEach(job => {
      const scheduledDate = new Date(job.scheduledAt)
      console.log(`  ✅ ${job.title} - ${scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })}`)
    })

    console.log('\n🎉 Verificación completada')
    console.log('💡 Si los trabajos no aparecen en la página web, intenta:')
    console.log('   1. Refrescar la página (F5)')
    console.log('   2. Limpiar el caché del navegador')
    console.log('   3. Verificar que el servidor esté corriendo')

  } catch (error) {
    console.error('❌ Error al refrescar agenda:', error)
  } finally {
    await prisma.$disconnect()
  }
}

refreshSchedule()
