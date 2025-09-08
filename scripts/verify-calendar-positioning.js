const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyCalendarPositioning() {
  try {
    console.log('🎯 Verificando posicionamiento de trabajos en el calendario...\n')

    // 1. Obtener todos los trabajos
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log(`1️⃣ Total de trabajos en BD: ${jobs.length}`)

    // 2. Simular la lógica de posicionamiento del calendario
    const calendarJobs = jobs
      .filter(job => job.technician && job.technician.id)
      .map(job => {
        const scheduledDate = new Date(job.scheduledAt)
        
        // Convertir a zona horaria de Chile
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
        
        // Calcular posición en el calendario (misma lógica que CalendarGrid)
        const [startHour, startMinute] = startTime.split(":").map(Number)
        const [endHour, endMinute] = endTime.split(":").map(Number)
        
        // Asegurar que las horas estén en el rango correcto (9-21)
        const adjustedStartHour = Math.max(9, Math.min(21, startHour))
        const adjustedEndHour = Math.max(9, Math.min(21, endHour))
        
        // Calcular minutos totales desde las 9:00
        const startTotalMinutes = (adjustedStartHour - 9) * 60 + startMinute
        const endTotalMinutes = (adjustedEndHour - 9) * 60 + endMinute
        const duration = endTotalMinutes - startTotalMinutes

        // Calcular posiciones basadas en slots de 1 hora (64px cada slot)
        const slotHeight = 64 // altura de cada slot de 1 hora
        const topPx = (startTotalMinutes / 60) * slotHeight
        const heightPx = Math.max((duration / 60) * slotHeight, 32) // mínimo 32px
        
        return {
          id: job.id,
          title: job.title,
          clientName: job.client?.name || "Sin cliente",
          technicianName: job.technician?.name || "Sin técnico",
          technicianId: job.technician?.id,
          chileDate: chileDate,
          startTime: startTime,
          endTime: endTime,
          status: job.status,
          position: {
            top: topPx,
            height: heightPx,
            startHour: adjustedStartHour,
            startMinute: startMinute,
            endHour: adjustedEndHour,
            endMinute: endMinute
          }
        }
      })

    console.log('\n2️⃣ Trabajos con posicionamiento calculado:')
    calendarJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`)
      console.log(`      Cliente: ${job.clientName}`)
      console.log(`      Técnico: ${job.technicianName}`)
      console.log(`      Fecha: ${job.chileDate}`)
      console.log(`      Hora: ${job.startTime} - ${job.endTime}`)
      console.log(`      Posición: top=${job.position.top}px, height=${job.position.height}px`)
      console.log(`      Slot: ${job.position.startHour}:${job.position.startMinute.toString().padStart(2, '0')} - ${job.position.endHour}:${job.position.endMinute.toString().padStart(2, '0')}`)
      console.log('')
    })

    // 3. Verificar trabajos para el 26 de agosto de 2025
    const targetDate = '2025-08-26'
    const jobsForDate = calendarJobs.filter(job => job.chileDate === targetDate)
    
    console.log(`3️⃣ Trabajos para ${targetDate} con posicionamiento:`)
    if (jobsForDate.length === 0) {
      console.log('   ❌ No hay trabajos para esta fecha')
    } else {
      jobsForDate.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title}`)
        console.log(`      Cliente: ${job.clientName} - Técnico: ${job.technicianName}`)
        console.log(`      Hora: ${job.startTime} - ${job.endTime}`)
        console.log(`      Posición: top=${job.position.top}px, height=${job.position.height}px`)
        console.log(`      Slot visual: ${job.position.startHour}:${job.position.startMinute.toString().padStart(2, '0')} - ${job.position.endHour}:${job.position.endMinute.toString().padStart(2, '0')}`)
        
        // Verificar si está en el rango visible del calendario (9:00-21:00)
        if (job.position.startHour >= 9 && job.position.startHour <= 21) {
          console.log(`      ✅ Visible en calendario`)
        } else {
          console.log(`      ⚠️ Fuera del rango visible (9:00-21:00)`)
        }
        console.log('')
      })
    }

    // 4. Verificar específicamente el trabajo de Patricia López
    const patriciaJobs = calendarJobs.filter(job => 
      job.technicianName === 'Patricia López' && job.chileDate === targetDate
    )
    
    console.log(`4️⃣ Trabajo de Patricia López para ${targetDate}:`)
    if (patriciaJobs.length === 0) {
      console.log('   ❌ Patricia López no tiene trabajos para esta fecha')
    } else {
      patriciaJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - ${job.clientName}`)
        console.log(`      Hora: ${job.startTime} - ${job.endTime}`)
        console.log(`      Posición: top=${job.position.top}px, height=${job.position.height}px`)
        console.log(`      Debería aparecer en: ${job.position.startHour}:${job.position.startMinute.toString().padStart(2, '0')}`)
        
        // Verificar si 17:30 está en el rango visible
        if (job.position.startHour === 17 && job.position.startMinute === 30) {
          console.log(`      ✅ Hora correcta (17:30) - Visible en calendario`)
        } else {
          console.log(`      ⚠️ Hora incorrecta o fuera de rango`)
        }
      })
    }

    // 5. Verificar conflictos de horarios
    console.log('\n5️⃣ Verificando conflictos de horarios:')
    const techniciansWithJobs = {}
    
    jobsForDate.forEach(job => {
      if (!techniciansWithJobs[job.technicianId]) {
        techniciansWithJobs[job.technicianId] = []
      }
      techniciansWithJobs[job.technicianId].push(job)
    })
    
    Object.entries(techniciansWithJobs).forEach(([techId, techJobs]) => {
      if (techJobs.length > 1) {
        console.log(`   ⚠️ ${techJobs[0].technicianName} tiene ${techJobs.length} trabajos el mismo día:`)
        techJobs.forEach(job => {
          console.log(`      - ${job.title}: ${job.startTime} - ${job.endTime}`)
        })
      }
    })

    console.log('\n✅ Verificación de posicionamiento completada')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyCalendarPositioning()
