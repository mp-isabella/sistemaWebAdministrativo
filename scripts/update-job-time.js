const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateJobTime() {
  try {
    console.log('🕐 Actualizando hora del trabajo a 19:30...\n')
    
    // Buscar el trabajo existente
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    })
    
    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }
    
    console.log(`📊 Trabajos encontrados: ${jobs.length}`)
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${job.client?.name} - ${job.technician?.name} - ${job.scheduledAt}`)
    })
    
    // Actualizar el primer trabajo (o todos si hay varios)
    const updatePromises = jobs.map(async (job) => {
      // Crear nueva fecha con hora 19:30
      const newDate = new Date(job.scheduledAt)
      newDate.setHours(19, 30, 0, 0) // 19:30:00.000
      
      const updatedJob = await prisma.job.update({
        where: { id: job.id },
        data: {
          scheduledAt: newDate
        },
        include: {
          client: true,
          service: true,
          technician: true
        }
      })
      
      console.log(`✅ Trabajo actualizado: ${updatedJob.title} - ${updatedJob.client?.name}`)
      console.log(`   Nueva fecha/hora: ${updatedJob.scheduledAt}`)
      
      return updatedJob
    })
    
    await Promise.all(updatePromises)
    
    console.log('\n🎯 Verificación final:')
    const finalJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    })
    
    finalJobs.forEach((job, index) => {
      const date = new Date(job.scheduledAt)
      const time24 = date.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })
      console.log(`${index + 1}. ${job.title} - ${job.client?.name} - ${job.technician?.name}`)
      console.log(`   Fecha: ${date.toLocaleDateString('es-CL')}`)
      console.log(`   Hora: ${time24} (formato 24 horas)`)
    })
    
    console.log('\n✅ Todos los trabajos han sido actualizados a las 19:30')
    console.log('🎯 El calendario ahora debería mostrar el trabajo en la posición correcta')
    
  } catch (error) {
    console.error('❌ Error actualizando trabajo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateJobTime()
