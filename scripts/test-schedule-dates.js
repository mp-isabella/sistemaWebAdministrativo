const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testScheduleDates() {
  try {
    console.log('🧪 Probando lógica de fechas de la agenda...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log('📊 Trabajos en la base de datos:')
    jobs.forEach(job => {
      const scheduledDate = new Date(job.scheduledAt)
      console.log(`- ${job.title}: ${scheduledDate.toISOString()}`)
    })

    console.log('\n🔍 Simulando lógica de agrupación por fecha:')
    
    // Simular la lógica corregida de groupJobsByDate
    const groups = {}
    
    jobs.forEach(job => {
      const date = new Date(job.scheduledAt)
      
      // Usar la fecha directamente sin conversiones de zona horaria
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const dayKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      
      if (!groups[monthKey]) {
        groups[monthKey] = {}
      }
      
      if (!groups[monthKey][dayKey]) {
        groups[monthKey][dayKey] = []
      }
      
      groups[monthKey][dayKey].push(job)
    })

    console.log('\n📅 Trabajos agrupados por fecha:')
    Object.entries(groups).forEach(([monthKey, days]) => {
      console.log(`\n📆 Mes: ${monthKey}`)
      Object.entries(days).forEach(([dayKey, dayJobs]) => {
        const date = new Date(dayKey)
        const dayName = date.toLocaleDateString('es-CL', { 
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
        console.log(`  📅 ${dayName} (${dayKey}): ${dayJobs.length} trabajo(s)`)
        dayJobs.forEach(job => {
          console.log(`    - ${job.title} (${job.client?.name})`)
        })
      })
    })

    console.log('\n✅ Verificación completada. Los trabajos deberían aparecer en sus fechas correctas.')

  } catch (error) {
    console.error('❌ Error al probar fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testScheduleDates()
