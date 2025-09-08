const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJobAssignment() {
  try {
    console.log('🔍 Verificando asignación de trabajos a técnicos...\n')

    // 1. Obtener todos los técnicos
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        }
      }
    })

    console.log(`1️⃣ Técnicos disponibles: ${technicians.length}`)
    technicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.id})`)
    })

    // 2. Obtener todos los trabajos con sus técnicos asignados
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log(`\n2️⃣ Total de trabajos: ${allJobs.length}`)
    
    if (allJobs.length > 0) {
      allJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title}`)
        console.log(`      Cliente: ${job.client?.name}`)
        console.log(`      Técnico asignado: ${job.technician?.name || 'Sin asignar'} (${job.technician?.id || 'N/A'})`)
        console.log(`      Fecha: ${job.scheduledAt}`)
        console.log('')
      })
    }

    // 3. Verificar trabajos sin técnico asignado
    const jobsWithoutTechnician = allJobs.filter(job => !job.technician || !job.technician.id)
    console.log(`3️⃣ Trabajos sin técnico asignado: ${jobsWithoutTechnician.length}`)
    
    if (jobsWithoutTechnician.length > 0) {
      jobsWithoutTechnician.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name}`)
      })
    }

    // 4. Verificar trabajos con técnico asignado
    const jobsWithTechnician = allJobs.filter(job => job.technician && job.technician.id)
    console.log(`\n4️⃣ Trabajos con técnico asignado: ${jobsWithTechnician.length}`)
    
    if (jobsWithTechnician.length > 0) {
      jobsWithTechnician.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Técnico: ${job.technician.name}`)
      })
    }

    // 5. Mostrar trabajos por técnico
    console.log(`\n5️⃣ Trabajos por técnico:`)
    technicians.forEach(tech => {
      const techJobs = allJobs.filter(job => job.technician?.id === tech.id)
      console.log(`   ${tech.name}: ${techJobs.length} trabajos`)
      
      if (techJobs.length > 0) {
        techJobs.forEach((job, index) => {
          const scheduledDate = new Date(job.scheduledAt)
          const timeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Santiago'
          })
          const dateDisplay = scheduledDate.toLocaleDateString('es-CL', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Santiago'
          })
          console.log(`      ${index + 1}. ${job.title} - ${dateDisplay} ${timeDisplay}`)
        })
      }
    })

    console.log('\n🎯 Resumen:')
    if (jobsWithTechnician.length > 0) {
      console.log(`   ✅ Hay ${jobsWithTechnician.length} trabajos con técnico asignado`)
      console.log(`   ✅ Estos trabajos deberían aparecer en el calendario del técnico correspondiente`)
    } else {
      console.log(`   ❌ No hay trabajos con técnico asignado`)
      console.log(`   💡 Asigna técnicos a los trabajos para que aparezcan en el calendario`)
    }

    if (jobsWithoutTechnician.length > 0) {
      console.log(`   ⚠️  Hay ${jobsWithoutTechnician.length} trabajos sin técnico asignado`)
      console.log(`   💡 Estos trabajos no aparecerán en ningún calendario`)
    }

  } catch (error) {
    console.error('Error en la verificación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobAssignment()
