const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testScheduleGrouping() {
  try {
    console.log('🧪 Probando lógica de agrupación por fecha...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true,
        company: true
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    // Simular la lógica de groupJobsByDate de la página de agenda
    const groups = {}
    
    jobs.forEach(job => {
      // Crear fecha directamente desde scheduledAt (ya está en UTC)
      const date = new Date(job.scheduledAt)
      
      // Usar la fecha directamente sin conversiones de zona horaria
      // ya que scheduledAt ya contiene la fecha correcta
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

    console.log('📅 Agrupación por fecha:')
    Object.keys(groups).sort().forEach(monthKey => {
      console.log(`\n📆 ${monthKey}:`)
      Object.keys(groups[monthKey]).sort().forEach(dayKey => {
        const jobs = groups[monthKey][dayKey]
        console.log(`  📅 ${dayKey} (${jobs.length} trabajo${jobs.length > 1 ? 's' : ''}):`)
        jobs.forEach(job => {
          const scheduledDate = new Date(job.scheduledAt)
          console.log(`    - ${job.title}`)
          console.log(`      Cliente: ${job.client?.name}`)
          console.log(`      Fecha ISO: ${scheduledDate.toISOString()}`)
          console.log(`      Fecha local: ${scheduledDate.toLocaleString('es-CL')}`)
          console.log(`      Hora: ${scheduledDate.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Santiago'
          })}`)
        })
      })
    })

    // Verificar trabajos para hoy (28 de agosto)
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    
    console.log(`\n🔍 Trabajos para hoy (${todayKey}):`)
    let foundToday = false
    Object.keys(groups).forEach(monthKey => {
      Object.keys(groups[monthKey]).forEach(dayKey => {
        if (dayKey === todayKey) {
          foundToday = true
          const jobs = groups[monthKey][dayKey]
          console.log(`  ✅ Encontrados ${jobs.length} trabajo${jobs.length > 1 ? 's' : ''} para hoy:`)
          jobs.forEach(job => {
            console.log(`    - ${job.title} (${job.client?.name})`)
          })
        }
      })
    })
    
    if (!foundToday) {
      console.log(`  ❌ No se encontraron trabajos para hoy`)
    }

  } catch (error) {
    console.error('❌ Error al probar agrupación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testScheduleGrouping()
