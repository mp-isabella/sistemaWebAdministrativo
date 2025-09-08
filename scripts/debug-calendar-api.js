const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugCalendarAPI() {
  try {
    console.log('🔍 Diagnosticando API del calendario...\n')

    // 1. Verificar todos los trabajos en la BD
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log(`1️⃣ Total de trabajos en BD: ${allJobs.length}`)
    
    if (allJobs.length > 0) {
      allJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name} - Técnico: ${job.technician?.name} - Fecha: ${job.scheduledAt}`)
      })
    }

    // 2. Verificar trabajos con técnico asignado
    const jobsWithTechnician = allJobs.filter(job => job.technician && job.technician.id)
    console.log(`\n2️⃣ Trabajos con técnico asignado: ${jobsWithTechnician.length}`)
    
    if (jobsWithTechnician.length > 0) {
      jobsWithTechnician.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Técnico: ${job.technician.name} - Fecha: ${job.scheduledAt}`)
      })
    }

    // 3. Simular el filtro de fecha que hace la API
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    console.log(`\n3️⃣ Rango de fechas de la API:`)
    console.log(`   Desde: ${thirtyDaysAgo.toISOString()}`)
    console.log(`   Hasta: ${thirtyDaysFromNow.toISOString()}`)

    // 4. Verificar trabajos en el rango de fechas
    const jobsInRange = allJobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate >= thirtyDaysAgo && jobDate <= thirtyDaysFromNow
    })

    console.log(`\n4️⃣ Trabajos en rango de fechas: ${jobsInRange.length}`)
    
    if (jobsInRange.length > 0) {
      jobsInRange.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Fecha: ${job.scheduledAt}`)
      })
    }

    // 5. Verificar trabajos que cumplen TODAS las condiciones
    const validJobs = allJobs.filter(job => {
      const hasTechnician = job.technician && job.technician.id
      const jobDate = new Date(job.scheduledAt)
      const inDateRange = jobDate >= thirtyDaysAgo && jobDate <= thirtyDaysFromNow
      
      return hasTechnician && inDateRange
    })

    console.log(`\n5️⃣ Trabajos válidos para el calendario: ${validJobs.length}`)
    
    if (validJobs.length > 0) {
      validJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Técnico: ${job.technician.name} - Fecha: ${job.scheduledAt}`)
      })
    } else {
      console.log('   ❌ No hay trabajos que cumplan todas las condiciones')
      console.log('   🔍 Posibles problemas:')
      
      const noTechnician = allJobs.filter(job => !job.technician || !job.technician.id)
      if (noTechnician.length > 0) {
        console.log(`      - ${noTechnician.length} trabajos sin técnico asignado`)
      }
      
      const outOfRange = allJobs.filter(job => {
        const jobDate = new Date(job.scheduledAt)
        return jobDate < thirtyDaysAgo || jobDate > thirtyDaysFromNow
      })
      if (outOfRange.length > 0) {
        console.log(`      - ${outOfRange.length} trabajos fuera del rango de fechas`)
      }
    }

    // 6. Verificar técnicos disponibles
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECNICO'
      }
    })

    console.log(`\n6️⃣ Técnicos disponibles: ${technicians.length}`)
    technicians.forEach(tech => {
      console.log(`   - ${tech.name} (${tech.id})`)
    })

  } catch (error) {
    console.error('Error en el diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugCalendarAPI()
