const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function monitorDateIssues() {
  try {
    console.log('🔍 Monitoreando fechas problemáticas...\n')

    // Buscar trabajos con fechas nulas o inválidas
    const jobsWithNullDates = await prisma.job.findMany({
      where: {
        OR: [
          { scheduledAt: null },
          { scheduledAt: { equals: new Date(0) } } // Fecha epoch
        ]
      },
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    // Buscar trabajos con fechas que resulten en 1969
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    const jobsWith1969Dates = allJobs.filter(job => {
      if (!job.scheduledAt) return false
      const date = new Date(job.scheduledAt)
      return date.getFullYear() === 1969
    })

    const totalProblematicJobs = jobsWithNullDates.length + jobsWith1969Dates.length

    if (totalProblematicJobs === 0) {
      console.log('✅ No se encontraron trabajos con fechas problemáticas')
      return
    }

    console.log(`⚠️  Trabajos con fechas problemáticas encontrados: ${totalProblematicJobs}\n`)

    // Corregir trabajos con fechas nulas
    for (const job of jobsWithNullDates) {
      console.log(`🔧 Corrigiendo trabajo con fecha nula: ${job.title}`)
      console.log(`   ID: ${job.id}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name || 'Sin asignar'}`)

      // Crear una fecha para hoy con hora por defecto
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
      await prisma.job.update({
        where: { id: job.id },
        data: {
          scheduledAt: today,
          startTime: startTime,
          endTime: endTime
        }
      })

      console.log(`   ✅ Fecha corregida: ${today.toLocaleDateString('es-CL')}`)
      console.log(`   ✅ Horario: ${startTime} - ${endTime}`)
      console.log('')
    }

    // Corregir trabajos con fechas 1969
    for (const job of jobsWith1969Dates) {
      console.log(`🔧 Corrigiendo trabajo con fecha 1969: ${job.title}`)
      console.log(`   ID: ${job.id}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name || 'Sin asignar'}`)

      // Crear una fecha para hoy con hora por defecto
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
      await prisma.job.update({
        where: { id: job.id },
        data: {
          scheduledAt: today,
          startTime: startTime,
          endTime: endTime
        }
      })

      console.log(`   ✅ Fecha corregida: ${today.toLocaleDateString('es-CL')}`)
      console.log(`   ✅ Horario: ${startTime} - ${endTime}`)
      console.log('')
    }

    console.log('🎉 Todos los trabajos problemáticos han sido corregidos')

    // Verificación final
    const remainingProblematicJobs = await prisma.job.findMany({
      where: {
        OR: [
          { scheduledAt: null },
          { scheduledAt: { equals: new Date(0) } }
        ]
      }
    })

    if (remainingProblematicJobs.length === 0) {
      console.log('✅ Verificación: No quedan trabajos con fechas problemáticas')
    } else {
      console.log(`⚠️  Aún quedan ${remainingProblematicJobs.length} trabajos con fechas problemáticas`)
    }

  } catch (error) {
    console.error('❌ Error en monitoreo de fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el monitoreo
monitorDateIssues()
