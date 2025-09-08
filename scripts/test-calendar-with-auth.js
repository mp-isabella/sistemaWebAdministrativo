const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCalendarWithAuth() {
  try {
    console.log('🔐 Probando API del calendario con autenticación simulada...\n')

    // 1. Obtener un usuario técnico de la base de datos
    const technician = await prisma.user.findFirst({
      where: {
        role: {
          name: 'TECNICO'
        }
      }
    })

    if (!technician) {
      console.log('❌ No hay técnicos en la base de datos')
      return
    }

    console.log(`1️⃣ Técnico encontrado: ${technician.name} (${technician.id})`)

    // 2. Verificar trabajos asignados a este técnico
    const technicianJobs = await prisma.job.findMany({
      where: {
        technicianId: technician.id
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    console.log(`\n2️⃣ Trabajos asignados al técnico: ${technicianJobs.length}`)
    
    if (technicianJobs.length > 0) {
      technicianJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name} - Fecha: ${job.scheduledAt}`)
      })
    }

    // 3. Simular la consulta que haría la API del calendario
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    console.log(`\n3️⃣ Simulando consulta de la API del calendario:`)
    console.log(`   Técnico ID: ${technician.id}`)
    console.log(`   Rango de fechas: ${thirtyDaysAgo.toISOString()} a ${thirtyDaysFromNow.toISOString()}`)

    const calendarJobs = await prisma.job.findMany({
      where: {
        technicianId: technician.id,
        scheduledAt: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysFromNow
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log(`\n4️⃣ Trabajos encontrados por la API: ${calendarJobs.length}`)
    
    if (calendarJobs.length > 0) {
      calendarJobs.forEach((job, index) => {
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

        console.log(`   ${index + 1}. ${job.title}`)
        console.log(`      Cliente: ${job.client?.name}`)
        console.log(`      Servicio: ${job.service?.name}`)
        console.log(`      Fecha: ${date}`)
        console.log(`      Hora: ${startTime} - ${endTime}`)
        console.log(`      Estado: ${job.status}`)
        console.log('')
      })
    } else {
      console.log('   ❌ No se encontraron trabajos para mostrar en el calendario')
    }

    // 5. Verificar si hay trabajos para el 26 de agosto específicamente
    const august26 = new Date('2025-08-26')
    const august27 = new Date('2025-08-27')
    
    const jobsAugust26 = calendarJobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate >= august26 && jobDate < august27
    })

    console.log(`\n5️⃣ Trabajos para el 26 de agosto: ${jobsAugust26.length}`)
    
    if (jobsAugust26.length > 0) {
      jobsAugust26.forEach((job, index) => {
        const scheduledDate = new Date(job.scheduledAt)
        const timeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Santiago'
        })
        console.log(`   ${index + 1}. ${job.title} - ${job.client?.name} - ${timeDisplay}`)
      })
    }

    console.log('\n🎯 Resumen:')
    if (calendarJobs.length > 0) {
      console.log(`   ✅ La API debería devolver ${calendarJobs.length} trabajos`)
      console.log(`   ✅ El calendario debería mostrar estos trabajos correctamente`)
      console.log(`   ✅ Si no ves trabajos en el calendario, verifica que estés autenticado`)
    } else {
      console.log(`   ❌ No hay trabajos para mostrar en el calendario`)
      console.log(`   💡 Crea un trabajo asignado a un técnico para verlo en el calendario`)
    }

  } catch (error) {
    console.error('Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCalendarWithAuth()
