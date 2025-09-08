const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixCalendarDate() {
  try {
    console.log('🔧 Verificando fecha del calendario...\n')

    // 1. Obtener el trabajo existente
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (jobs.length === 0) {
      console.log('❌ No hay trabajos en la base de datos')
      return
    }

    const job = jobs[0]
    const scheduledDate = new Date(job.scheduledAt)
    
    console.log('📅 Trabajo encontrado:')
    console.log(`   Título: ${job.title}`)
    console.log(`   Cliente: ${job.client?.name}`)
    console.log(`   Técnico: ${job.technician?.name}`)
    console.log(`   Fecha programada: ${scheduledDate.toLocaleDateString('es-CL')}`)
    console.log(`   Hora programada: ${scheduledDate.toLocaleTimeString('es-CL')}`)
    console.log(`   Fecha ISO: ${scheduledDate.toISOString()}`)
    
    // 2. Calcular la fecha correcta para el calendario
    const calendarDate = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate())
    
    console.log('\n📋 Instrucciones para ver el trabajo:')
    console.log('1. Ve al calendario en el navegador')
    console.log('2. Haz clic en el día 26 de agosto de 2025')
    console.log('3. O navega al mes de agosto de 2025')
    console.log('4. El trabajo debería aparecer a las 19:30')
    
    console.log('\n🔧 Si el calendario no muestra agosto:')
    console.log('1. Abre las herramientas de desarrollador (F12)')
    console.log('2. Ve a la consola')
    console.log('3. Ejecuta: localStorage.setItem("calendar-selected-date", "2025-08-26T00:00:00.000Z")')
    console.log('4. Recarga la página')
    
    console.log('\n📊 Información adicional:')
    console.log(`   Mes del trabajo: ${scheduledDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`)
    console.log(`   Día del trabajo: ${scheduledDate.getDate()}`)
    console.log(`   Hora del trabajo: ${scheduledDate.getHours()}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCalendarDate()
