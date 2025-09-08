const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJobsPersistence() {
  try {
    console.log('🔍 Verificando persistencia de trabajos...\n')
    
    // Verificar trabajos actuales
    const currentJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Trabajos actuales en la base de datos: ${currentJobs.length}`)
    
    if (currentJobs.length === 0) {
      console.log('ℹ️ No hay trabajos en la base de datos')
      console.log('💡 Para probar la persistencia:')
      console.log('   1. Ve a "Agenda tu trabajo"')
      console.log('   2. Crea un nuevo trabajo')
      console.log('   3. Guarda el trabajo')
      console.log('   4. Ejecuta este script nuevamente')
      return
    }
    
    console.log('\n📋 Trabajos encontrados:')
    currentJobs.forEach((job, index) => {
      console.log(`${index + 1}. ID: ${job.id}`)
      console.log(`   Título: ${job.title}`)
      console.log(`   Cliente: ${job.client?.name || 'Sin cliente'}`)
      console.log(`   Servicio: ${job.service?.name || 'Sin servicio'}`)
      console.log(`   Técnico: ${job.technician?.name || 'Sin técnico'}`)
      console.log(`   Fecha: ${new Date(job.scheduledAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
      console.log(`   Estado: ${job.status}`)
      console.log(`   Creado: ${new Date(job.createdAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
      console.log(`   Actualizado: ${new Date(job.updatedAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
      console.log('')
    })
    
    // Verificar que los trabajos tengan todos los datos necesarios
    const incompleteJobs = currentJobs.filter(job => 
      !job.client || !job.service || !job.technician || !job.scheduledAt
    )
    
    if (incompleteJobs.length > 0) {
      console.log('⚠️ Trabajos con datos incompletos:')
      incompleteJobs.forEach((job, index) => {
        console.log(`${index + 1}. ID: ${job.id} - ${job.title}`)
        console.log(`   - Cliente: ${!!job.client}`)
        console.log(`   - Servicio: ${!!job.service}`)
        console.log(`   - Técnico: ${!!job.technician}`)
        console.log(`   - Fecha: ${!!job.scheduledAt}`)
      })
    } else {
      console.log('✅ Todos los trabajos tienen datos completos')
    }
    
    // Verificar que los trabajos aparezcan en el calendario
    console.log('\n🎯 Trabajos que deberían aparecer en el calendario:')
    const calendarJobs = currentJobs.filter(job => job.technician && job.scheduledAt)
    console.log(`Total: ${calendarJobs.length} trabajos`)
    
    calendarJobs.forEach((job, index) => {
      const scheduledDate = new Date(job.scheduledAt)
      const isToday = scheduledDate.toDateString() === new Date().toDateString()
      const isInRange = scheduledDate >= new Date() && scheduledDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      
      console.log(`${index + 1}. ${job.client?.name} - ${job.service?.name} - ${job.technician?.name}`)
      console.log(`   Fecha: ${scheduledDate.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
      console.log(`   Es hoy: ${isToday ? '✅' : '❌'}`)
      console.log(`   En rango (30 días): ${isInRange ? '✅' : '❌'}`)
    })
    
  } catch (error) {
    console.error('❌ Error verificando trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobsPersistence()
