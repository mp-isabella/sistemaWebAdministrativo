const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDatesToCurrent() {
  try {
    console.log('🔧 Actualizando fechas de trabajos a la fecha actual...\n')

    // Obtener la fecha actual
    const today = new Date()
    console.log('📅 Fecha actual:', today.toLocaleDateString('es-CL'))
    console.log('📅 Día de la semana:', today.toLocaleDateString('es-CL', { weekday: 'long' }))

    // Obtener todos los trabajos
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }

    console.log(`📊 Encontrados ${jobs.length} trabajos para actualizar\n`)

    // Actualizar cada trabajo
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      const oldDate = new Date(job.scheduledAt)
      
      // Crear nueva fecha manteniendo la hora pero con la fecha actual
      const newDate = new Date(today)
      newDate.setHours(oldDate.getHours())
      newDate.setMinutes(oldDate.getMinutes())
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)

      // Si es el primer trabajo, ponerlo para hoy
      // Si es el segundo, para mañana
      // Si es el tercero, para pasado mañana
      if (i > 0) {
        newDate.setDate(today.getDate() + i)
      }

      console.log(`📝 Actualizando trabajo: ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Fecha anterior: ${oldDate.toLocaleDateString('es-CL')} ${oldDate.toLocaleTimeString('es-CL')}`)
      console.log(`   Fecha nueva: ${newDate.toLocaleDateString('es-CL')} ${newDate.toLocaleTimeString('es-CL')}`)

      // Actualizar en la base de datos
      await prisma.job.update({
        where: { id: job.id },
        data: {
          scheduledAt: newDate.toISOString()
        }
      })

      console.log('   ✅ Actualizado correctamente\n')
    }

    // Verificar los trabajos actualizados
    const updatedJobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log('📋 Trabajos actualizados:')
    updatedJobs.forEach((job, index) => {
      const date = new Date(job.scheduledAt)
      console.log(`${index + 1}. ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Fecha: ${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL')}`)
      console.log(`   Día: ${date.toLocaleDateString('es-CL', { weekday: 'long' })}\n`)
    })

    console.log('🎉 ¡Todas las fechas han sido actualizadas correctamente!')
    console.log('💡 Ahora la agenda debería mostrar los trabajos con las fechas actuales.')

  } catch (error) {
    console.error('❌ Error actualizando fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDatesToCurrent()
