const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixNullDates() {
  try {
    console.log('🔧 Corrigiendo trabajos con fechas nulas...\n')

    // Buscar trabajos con fecha nula
    const jobsWithNullDates = await prisma.job.findMany({
      where: {
        scheduledAt: null
      },
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log(`📊 Trabajos con fecha nula encontrados: ${jobsWithNullDates.length}\n`)

    if (jobsWithNullDates.length === 0) {
      console.log('✅ No hay trabajos con fechas nulas para corregir')
      return
    }

    // Corregir cada trabajo
    for (let i = 0; i < jobsWithNullDates.length; i++) {
      const job = jobsWithNullDates[i]
      
      console.log(`${i + 1}. Corrigiendo trabajo: ${job.title}`)
      console.log(`   ID: ${job.id}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name || 'Sin asignar'}`)
      console.log(`   Fecha actual: NULL`)

      // Crear una fecha para hoy con la hora actual
      const today = new Date()
      today.setHours(14, 0, 0, 0) // 2:00 PM por defecto

      // Si el trabajo tiene horarios, usarlos
      let startTime = '14:00'
      let endTime = '15:00'
      
      if (job.startTime && job.endTime) {
        startTime = job.startTime
        endTime = job.endTime
      }

      // Actualizar el trabajo
      const updatedJob = await prisma.job.update({
        where: { id: job.id },
        data: {
          scheduledAt: today,
          startTime: startTime,
          endTime: endTime
        },
        include: {
          client: true,
          technician: true,
          service: true
        }
      })

      console.log(`   ✅ Fecha corregida: ${updatedJob.scheduledAt.toLocaleDateString('es-CL')}`)
      console.log(`   ✅ Horario: ${updatedJob.startTime} - ${updatedJob.endTime}`)
      console.log('')
    }

    console.log('🎉 Todos los trabajos han sido corregidos exitosamente')

    // Verificar que no quedan trabajos con fechas nulas
    const remainingNullDates = await prisma.job.findMany({
      where: {
        scheduledAt: null
      }
    })

    if (remainingNullDates.length === 0) {
      console.log('✅ Verificación: No quedan trabajos con fechas nulas')
    } else {
      console.log(`⚠️  Aún quedan ${remainingNullDates.length} trabajos con fechas nulas`)
    }

  } catch (error) {
    console.error('❌ Error corrigiendo fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixNullDates()
