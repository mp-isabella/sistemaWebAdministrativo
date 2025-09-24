const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDateIssues() {
  try {

    // Buscar trabajos con fechas nulas o inválidas
    const jobsWithNullDates = await prisma.job.findMany({
      where: {
        OR: [
          { scheduledAt: null },
          { scheduledAt: { equals: new Date('1969-12-31T21:00:00.000Z') } } // Fecha epoch
        ]
      },
      include: {
        client: true,
        technician: true,
        company: true
      }
    })

    if (jobsWithNullDates.length === 0) {
      
      return
    }

    // Corregir cada trabajo
    for (let i = 0; i < jobsWithNullDates.length; i++) {
      const job = jobsWithNullDates[i]

       : 'NULL'}`)

      // Usar la fecha actual como fecha por defecto
      const today = new Date()
      const startTime = job.startTime || '10:00'
      const endTime = job.endTime || '11:00'

      // Crear fecha combinada
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const combinedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute, 0, 0)

      const updatedJob = await prisma.job.update({
        where: { id: job.id },
        data: {
          scheduledAt: combinedDate,
          startTime: startTime,
          endTime: endTime
        }
      })

      }`)
      
    }

    // Verificar que no quedan trabajos con fechas problemáticas
    const remainingIssues = await prisma.job.findMany({
      where: {
        OR: [
          { scheduledAt: null },
          { scheduledAt: { equals: new Date('1969-12-31T21:00:00.000Z') } }
        ]
      }
    })

    if (remainingIssues.length === 0) {
      
    } else {
      
    }

  } catch (error) {
    
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
fixDateIssues()
