 const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyCalendarDisplay() {
  try {
    console.log('🔍 Verificando visualización del calendario con zona horaria corregida...\n')

    // 1. Obtener todos los trabajos
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log(`1️⃣ Total de trabajos en BD: ${jobs.length}`)

    // 2. Simular la nueva lógica de conversión de zona horaria
    const calendarJobs = jobs
      .filter(job => job.technician && job.technician.id)
      .map(job => {
        const scheduledDate = new Date(job.scheduledAt)
        
        // Nueva lógica de zona horaria
        const chileTime = new Date(scheduledDate.toLocaleString("en-US", {timeZone: "America/Santiago"}))
        
        const startTime = chileTime.toLocaleTimeString('es-CL', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        })
        
        const endDate = new Date(chileTime.getTime() + 60 * 60 * 1000)
        const endTime = endDate.toLocaleTimeString('es-CL', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        })
        
        const chileDate = chileTime.toLocaleDateString('en-CA')
        
        return {
          id: job.id,
          title: job.title,
          clientName: job.client?.name || "Sin cliente",
          technicianName: job.technician?.name || "Sin técnico",
          technicianId: job.technician?.id,
          originalDate: job.scheduledAt,
          chileDate: chileDate,
          startTime: startTime,
          endTime: endTime,
          status: job.status
        }
      })

    console.log('\n2️⃣ Trabajos convertidos con nueva lógica:')
    calendarJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`)
      console.log(`      Cliente: ${job.clientName}`)
      console.log(`      Técnico: ${job.technicianName} (ID: ${job.technicianId})`)
      console.log(`      Fecha original: ${job.originalDate}`)
      console.log(`      Fecha Chile: ${job.chileDate}`)
      console.log(`      Hora: ${job.startTime} - ${job.endTime}`)
      console.log(`      Estado: ${job.status}`)
      console.log('')
    })

    // 3. Verificar trabajos para el 26 de agosto de 2025
    const targetDate = '2025-08-26'
    const jobsForDate = calendarJobs.filter(job => job.chileDate === targetDate)
    
    console.log(`3️⃣ Trabajos para ${targetDate}:`)
    if (jobsForDate.length === 0) {
      console.log('   ❌ No hay trabajos para esta fecha')
    } else {
      jobsForDate.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - ${job.clientName} - ${job.technicianName}`)
        console.log(`      Hora: ${job.startTime} - ${job.endTime}`)
        console.log(`      Técnico ID: ${job.technicianId}`)
      })
    }

    // 4. Verificar que Patricia López tenga trabajos
    const patriciaJobs = calendarJobs.filter(job => 
      job.technicianName === 'Patricia López' || 
      job.technicianId === 'cmesya2rz0005uk5wzu8tc90x'
    )
    
    console.log('\n4️⃣ Trabajos de Patricia López:')
    if (patriciaJobs.length === 0) {
      console.log('   ❌ Patricia López no tiene trabajos asignados')
    } else {
      patriciaJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - ${job.clientName}`)
        console.log(`      Fecha: ${job.chileDate} - Hora: ${job.startTime} - ${job.endTime}`)
      })
    }

    // 5. Verificar trabajos de Juan Pérez
    const juanJobs = calendarJobs.filter(job => 
      job.clientName === 'Juan Pérez'
    )
    
    console.log('\n5️⃣ Trabajos de Juan Pérez:')
    if (juanJobs.length === 0) {
      console.log('   ❌ Juan Pérez no tiene trabajos')
    } else {
      juanJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Técnico: ${job.technicianName}`)
        console.log(`      Fecha: ${job.chileDate} - Hora: ${job.startTime} - ${job.endTime}`)
      })
    }

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyCalendarDisplay()
