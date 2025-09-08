const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanDatabaseJobs() {
  try {
    console.log('🧹 Limpiando base de datos de trabajos...\n')
    
    // Obtener todos los trabajos actuales
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })
    
    console.log(`📊 Total de trabajos en la base de datos: ${allJobs.length}\n`)
    
    if (allJobs.length === 0) {
      console.log('✅ Base de datos ya está limpia - no hay trabajos')
      return
    }
    
    // Mostrar trabajos actuales
    console.log('📋 Trabajos actuales en la base de datos:')
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.client?.name || 'Sin cliente'} - ${job.service?.name || 'Sin servicio'} - ${job.technician?.name || 'Sin técnico'} - ${new Date(job.scheduledAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
    })
    
    console.log('\n❓ ¿Deseas eliminar todos los trabajos y empezar con una base de datos limpia? (s/n)')
    
    // En un entorno real, aquí se pediría confirmación al usuario
    // Por ahora, vamos a mantener solo los trabajos válidos
    
    // Identificar trabajos que podrían ser problemáticos
    const problematicJobs = allJobs.filter(job => {
      // Trabajos sin cliente, servicio o técnico
      const hasMissingData = !job.client || !job.service || !job.technician
      
      // Trabajos con fechas muy antiguas o futuras (más de 1 año)
      const jobDate = new Date(job.scheduledAt)
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      const hasInvalidDate = jobDate < oneYearAgo || jobDate > oneYearFromNow
      
      return hasMissingData || hasInvalidDate
    })
    
    if (problematicJobs.length > 0) {
      console.log(`\n⚠️ Encontrados ${problematicJobs.length} trabajos problemáticos:`)
      problematicJobs.forEach((job, index) => {
        console.log(`${index + 1}. ID: ${job.id} - ${job.client?.name || 'Sin cliente'} - ${job.service?.name || 'Sin servicio'} - ${job.technician?.name || 'Sin técnico'}`)
      })
      
      // Eliminar trabajos problemáticos
      for (const job of problematicJobs) {
        await prisma.job.delete({
          where: { id: job.id }
        })
        console.log(`🗑️ Eliminado trabajo problemático: ${job.id}`)
      }
    }
    
    // Verificar trabajos restantes
    const remainingJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })
    
    console.log(`\n✅ Limpieza completada. Trabajos restantes: ${remainingJobs.length}`)
    
    if (remainingJobs.length > 0) {
      console.log('\n📋 Trabajos válidos restantes:')
      remainingJobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.client?.name || 'Sin cliente'} - ${job.service?.name || 'Sin servicio'} - ${job.technician?.name || 'Sin técnico'} - ${new Date(job.scheduledAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabaseJobs()
