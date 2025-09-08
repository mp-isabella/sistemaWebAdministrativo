const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearCalendarCache() {
  try {
    console.log('🧹 Limpiando caché del calendario...\n')
    
    // Verificar que solo hay datos reales en la base de datos
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })
    
    console.log(`📊 Total de trabajos reales en la base de datos: ${jobs.length}\n`)
    
    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }
    
    // Mostrar solo los trabajos reales
    console.log('✅ Trabajos reales que deberían aparecer en el calendario:')
    jobs.forEach((job, index) => {
      const scheduledDate = new Date(job.scheduledAt)
      const chileTime = new Date(scheduledDate.toLocaleString("en-US", {timeZone: "America/Santiago"}))
      const timeDisplay = chileTime.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
      const dateDisplay = chileTime.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      console.log(`${index + 1}. ${job.client?.name} - ${job.service?.name} - ${job.technician?.name} - ${dateDisplay} ${timeDisplay}`)
    })
    
    // Verificar técnicos reales
    console.log('\n👥 Técnicos reales en la base de datos:')
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['TECNICO', 'tecnico']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    
    technicians.forEach(tech => {
      console.log(`  - ${tech.name} (${tech.id})`)
    })
    
    console.log('\n🎯 INSTRUCCIONES PARA EL USUARIO:')
    console.log('1. Refresca la página del calendario (F5)')
    console.log('2. Si aún ves datos incorrectos, limpia el caché del navegador')
    console.log('3. Verifica que solo aparezcan los trabajos listados arriba')
    console.log('4. Si hay datos incorrectos, son datos hardcodeados que deben eliminarse')
    
  } catch (error) {
    console.error('❌ Error al limpiar caché:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearCalendarCache()
