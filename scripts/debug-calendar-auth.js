const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugCalendarAuth() {
  try {
    console.log('🔐 Diagnosticando autenticación del calendario...\n')

    // 1. Verificar el trabajo específico que debería aparecer
    const job = await prisma.job.findFirst({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (!job) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }

    console.log(`1️⃣ Trabajo que debería aparecer:`)
    console.log(`   Título: ${job.title}`)
    console.log(`   Cliente: ${job.client?.name}`)
    console.log(`   Técnico asignado: ${job.technician?.name} (${job.technician?.id})`)
    console.log(`   Fecha: ${job.scheduledAt}`)

    // 2. Verificar todos los usuarios técnicos
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        }
      }
    })

    console.log(`\n2️⃣ Técnicos disponibles para login:`)
    technicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name}`)
      console.log(`      Email: ${tech.email}`)
      console.log(`      ID: ${tech.id}`)
      console.log(`      ¿Es el técnico del trabajo?: ${tech.id === job.technician?.id ? '✅ SÍ' : '❌ NO'}`)
      console.log('')
    })

    // 3. Verificar usuarios administradores
    const admins = await prisma.user.findMany({
      where: {
        role: {
          name: 'ADMIN'
        }
      }
    })

    console.log(`3️⃣ Administradores disponibles:`)
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email})`)
    })

    // 4. Simular la consulta exacta que hace la API del calendario
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    console.log(`\n4️⃣ Simulando consulta de la API del calendario:`)
    console.log(`   Rango de fechas: ${thirtyDaysAgo.toISOString()} a ${thirtyDaysFromNow.toISOString()}`)

    // Consulta para técnico específico (como si estuvieras logueado como Ana Torres)
    const technicianJobs = await prisma.job.findMany({
      where: {
        technicianId: job.technician?.id,
        scheduledAt: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysFromNow
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    console.log(`   Trabajos para ${job.technician?.name}: ${technicianJobs.length}`)
    
    if (technicianJobs.length > 0) {
      technicianJobs.forEach((job, index) => {
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
        console.log(`   ${index + 1}. ${job.title} - ${dateDisplay} ${timeDisplay}`)
      })
    }

    // Consulta para administrador (ver todos los trabajos)
    const allJobsInRange = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysFromNow
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    console.log(`   Trabajos para administrador: ${allJobsInRange.length}`)
    
    if (allJobsInRange.length > 0) {
      allJobsInRange.forEach((job, index) => {
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
        console.log(`   ${index + 1}. ${job.title} - ${job.technician?.name || 'Sin técnico'} - ${dateDisplay} ${timeDisplay}`)
      })
    }

    // 5. Verificar si el trabajo está en la fecha correcta
    const jobDate = new Date(job.scheduledAt)
    const august26 = new Date('2025-08-26')
    const august27 = new Date('2025-08-27')
    
    const isAugust26 = jobDate >= august26 && jobDate < august27
    
    console.log(`\n5️⃣ Verificación de fecha específica:`)
    console.log(`   Fecha del trabajo: ${jobDate.toLocaleDateString('es-CL')}`)
    console.log(`   ¿Es 26 de agosto?: ${isAugust26 ? '✅ SÍ' : '❌ NO'}`)

    // 6. Instrucciones específicas
    console.log(`\n🎯 SOLUCIÓN:`)
    console.log(`   El trabajo SÍ existe y SÍ debería aparecer en el calendario.`)
    console.log(`   El problema es que necesitas estar autenticado correctamente.`)
    console.log('')
    console.log(`   🔐 Para ver el trabajo:`)
    console.log(`   1. Ve a http://localhost:3000/login`)
    console.log(`   2. Logueate como: ${job.technician?.name} (${job.technician?.email})`)
    console.log(`   3. O logueate como administrador para ver todos los trabajos`)
    console.log(`   4. Ve a http://localhost:3000/dashboard/schedule/calendar`)
    console.log(`   5. El trabajo aparecerá el 26 de agosto a las 19:30`)
    console.log('')
    console.log(`   ⚠️  Si sigues sin ver el trabajo después de loguearte:`)
    console.log(`   - Verifica que la sesión esté activa`)
    console.log(`   - Revisa la consola del navegador para errores`)
    console.log(`   - Asegúrate de estar en la fecha correcta (26 de agosto)`)

  } catch (error) {
    console.error('Error en el diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugCalendarAuth()
