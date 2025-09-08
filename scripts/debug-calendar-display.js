const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugCalendarDisplay() {
  try {
    console.log('🔍 Debuggeando por qué el trabajo no aparece en el calendario...\n')
    
    // 1. Verificar trabajos en la base de datos
    console.log('📊 1. Trabajos en la base de datos:')
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    })
    
    console.log(`   Total: ${jobs.length} trabajos`)
    jobs.forEach((job, index) => {
      const date = new Date(job.scheduledAt)
      console.log(`   ${index + 1}. ${job.title} - ${job.client?.name} - ${job.technician?.name}`)
      console.log(`      Fecha: ${date.toLocaleDateString('es-CL')}`)
      console.log(`      Hora: ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}`)
      console.log(`      Técnico ID: ${job.technician?.id}`)
    })
    
    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }
    
    // 2. Simular la conversión de la API del calendario
    console.log('\n🔄 2. Simulando conversión de la API del calendario:')
    const calendarJobs = jobs.map(job => {
      const scheduledDate = job.scheduledAt ? new Date(job.scheduledAt) : new Date()
      
      // Generar formato de 24 horas para posicionamiento
      const startTime24 = scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })
      
      // Calcular hora de fin (asumiendo 1 hora por defecto)
      const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000)
      const endTime24 = endDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })
      
      // Generar formato de 24 horas para visualización
      const startTimeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })
      
      const endTimeDisplay = endDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })

      return {
        id: job.id,
        professionalId: job.technician?.id || "",
        patientName: job.client?.name || "Cliente sin nombre",
        startTime: startTime24,
        endTime: endTime24,
        startTimeDisplay: startTimeDisplay,
        endTimeDisplay: endTimeDisplay,
        type: job.service?.name || "Trabajo técnico",
        date: scheduledDate.toLocaleDateString('en-CA'),
        status: job.status || "PENDING"
      }
    })
    
    console.log(`   Trabajos convertidos: ${calendarJobs.length}`)
    calendarJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.patientName} - ${job.type}`)
      console.log(`      Técnico ID: ${job.professionalId}`)
      console.log(`      Fecha: ${job.date}`)
      console.log(`      Hora: ${job.startTime} - ${job.endTime}`)
      console.log(`      Display: ${job.startTimeDisplay} - ${job.endTimeDisplay}`)
    })
    
    // 3. Verificar técnicos disponibles
    console.log('\n👥 3. Técnicos disponibles:')
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    
    if (technicians.length === 0) {
      const techniciansAlt = await prisma.user.findMany({
        where: {
          role: {
            name: "tecnico"
          }
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
      console.log(`   Técnicos encontrados (alternativo): ${techniciansAlt.length}`)
      techniciansAlt.forEach((tech, index) => {
        console.log(`   ${index + 1}. ${tech.name} (ID: ${tech.id})`)
      })
    } else {
      console.log(`   Técnicos encontrados: ${technicians.length}`)
      technicians.forEach((tech, index) => {
        console.log(`   ${index + 1}. ${tech.name} (ID: ${tech.id})`)
      })
    }
    
    // 4. Verificar filtrado por fecha (26 de agosto)
    console.log('\n📅 4. Verificando filtrado por fecha (26 de agosto):')
    const targetDate = new Date('2025-08-26')
    const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    
    const jobsForDate = calendarJobs.filter(job => {
      const jobDate = new Date(job.date)
      const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate())
      return jobDateOnly.getTime() === targetDateOnly.getTime()
    })
    
    console.log(`   Trabajos para 26/08/2025: ${jobsForDate.length}`)
    jobsForDate.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.patientName} - ${job.type} - ${job.startTime}-${job.endTime}`)
      console.log(`      Técnico ID: ${job.professionalId}`)
    })
    
    // 5. Verificar posicionamiento en el calendario
    console.log('\n📍 5. Verificando posicionamiento en el calendario:')
    jobsForDate.forEach((job, index) => {
      const [startHour, startMinute] = job.startTime.split(":").map(Number)
      const [endHour, endMinute] = job.endTime.split(":").map(Number)
      
      // Asegurar que las horas estén en el rango correcto (9-21)
      const adjustedStartHour = Math.max(9, Math.min(21, startHour))
      const adjustedEndHour = Math.max(9, Math.min(21, endHour))
      
      // Calcular minutos totales desde las 9:00
      const startTotalMinutes = (adjustedStartHour - 9) * 60 + startMinute
      const endTotalMinutes = (adjustedEndHour - 9) * 60 + endMinute
      const duration = endTotalMinutes - startTotalMinutes
      
      // Calcular posiciones basadas en slots de 1 hora (64px cada slot)
      const slotHeight = 64
      const topPx = (startTotalMinutes / 60) * slotHeight
      const heightPx = Math.max((duration / 60) * slotHeight, 32)
      
      console.log(`   ${index + 1}. ${job.patientName}`)
      console.log(`      Hora original: ${startHour}:${startMinute.toString().padStart(2, '0')}`)
      console.log(`      Hora ajustada: ${adjustedStartHour}:${startMinute.toString().padStart(2, '0')}`)
      console.log(`      Posición top: ${topPx}px`)
      console.log(`      Altura: ${heightPx}px`)
      console.log(`      En rango 9-21: ${startHour >= 9 && startHour <= 21 ? '✅' : '❌'}`)
    })
    
    // 6. Diagnóstico final
    console.log('\n🎯 6. Diagnóstico final:')
    if (jobsForDate.length === 0) {
      console.log('❌ PROBLEMA: No hay trabajos para el 26 de agosto')
      console.log('   Posibles causas:')
      console.log('   - Problema con la zona horaria')
      console.log('   - Fecha incorrecta en la base de datos')
      console.log('   - Error en el filtrado de fechas')
    } else {
      console.log('✅ Hay trabajos para el 26 de agosto')
      jobsForDate.forEach((job, index) => {
        const [startHour] = job.startTime.split(":").map(Number)
        if (startHour < 9 || startHour > 21) {
          console.log(`❌ PROBLEMA: Trabajo ${index + 1} fuera del rango del calendario (${startHour}:00)`)
        } else {
          console.log(`✅ Trabajo ${index + 1} dentro del rango del calendario`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugCalendarDisplay()
