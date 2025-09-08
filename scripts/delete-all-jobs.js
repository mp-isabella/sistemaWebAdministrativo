const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllJobs() {
  try {
    console.log('🗑️ Eliminando todos los trabajos de la base de datos...\n')
    
    // Obtener todos los trabajos actuales
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    })
    
    console.log(`📊 Total de trabajos a eliminar: ${allJobs.length}\n`)
    
    if (allJobs.length === 0) {
      console.log('✅ No hay trabajos para eliminar')
      return
    }
    
    // Mostrar trabajos que se van a eliminar
    console.log('📋 Trabajos que se eliminarán:')
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.client?.name || 'Sin cliente'} - ${job.service?.name || 'Sin servicio'} - ${job.technician?.name || 'Sin técnico'} - ${new Date(job.scheduledAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
    })
    
    // Eliminar todos los trabajos
    const deleteResult = await prisma.job.deleteMany({})
    
    console.log(`\n✅ Eliminados ${deleteResult.count} trabajos de la base de datos`)
    console.log('🗑️ Base de datos limpia - lista para agregar solo los 2 trabajos de la agenda')
    
  } catch (error) {
    console.error('❌ Error eliminando trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllJobs()
