const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTimeDisplay() {
  try {
    console.log('🕐 Probando visualización de tiempo en el calendario...\n')

    // 1. Obtener un trabajo de ejemplo
    const job = await prisma.job.findFirst({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (!job) {
      console.log('❌ No hay trabajos en la base de datos para probar')
      return
    }

    console.log('1️⃣ Trabajo de ejemplo:')
    console.log(`   ID: ${job.id}`)
    console.log(`   Título: ${job.title}`)
    console.log(`   Cliente: ${job.client?.name}`)
    console.log(`   Técnico: ${job.technician?.name}`)
    console.log(`   Fecha original en BD: ${job.scheduledAt}`)

    // 2. Simular la conversión de la API del calendario
    const scheduledDate = new Date(job.scheduledAt)
    
    const startTime = scheduledDate.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago'
    })
    
    const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000)
    const endTime = endDate.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago'
    })
    
    const date = scheduledDate.toLocaleDateString('en-CA', {
      timeZone: 'America/Santiago'
    })

    console.log('\n2️⃣ Conversión de la API del calendario:')
    console.log(`   Hora de inicio: ${startTime}`)
    console.log(`   Hora de fin: ${endTime}`)
    console.log(`   Fecha: ${date}`)

    // 3. Simular la conversión del componente my-jobs
    const myJobsTime = new Date(job.scheduledAt).toLocaleString("es-CL", { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago'
    })

    const myJobsDate = new Date(job.scheduledAt).toLocaleDateString("es-CL", { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Santiago'
    })

    console.log('\n3️⃣ Conversión del componente my-jobs:')
    console.log(`   Hora: ${myJobsTime}`)
    console.log(`   Fecha: ${myJobsDate}`)

    // 4. Verificar que las conversiones son consistentes
    console.log('\n4️⃣ Verificación de consistencia:')
    const timeFromAPI = startTime
    const timeFromMyJobs = myJobsTime
    
    if (timeFromAPI === timeFromMyJobs) {
      console.log('✅ Las conversiones de tiempo son consistentes')
    } else {
      console.log('❌ Las conversiones de tiempo NO son consistentes')
      console.log(`   API: ${timeFromAPI}`)
      console.log(`   My Jobs: ${timeFromMyJobs}`)
    }

    console.log('\n🎯 Resumen:')
    console.log(`   El trabajo "${job.title}" se mostrará en el calendario a las ${startTime}`)
    console.log(`   En my-jobs se mostrará como: ${myJobsTime}`)
    console.log(`   Ambos deberían mostrar la misma hora en zona horaria de Chile`)

  } catch (error) {
    console.error('Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTimeDisplay()
