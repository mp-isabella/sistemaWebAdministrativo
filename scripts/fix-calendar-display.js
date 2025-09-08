 const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixCalendarDisplay() {
  try {
    console.log('🔧 Solucionando problema del calendario...\n')

    // 1. Obtener el trabajo existente
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

    console.log(`1️⃣ Trabajo encontrado: ${job.title}`)
    console.log(`   Cliente: ${job.client?.name}`)
    console.log(`   Técnico actual: ${job.technician?.name || 'Sin asignar'}`)
    console.log(`   Fecha: ${job.scheduledAt}`)

    // 2. Obtener todos los técnicos disponibles
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        }
      }
    })

    console.log(`\n2️⃣ Técnicos disponibles:`)
    technicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.email})`)
    })

    // 3. Si el trabajo no tiene técnico asignado, asignarlo al primer técnico disponible
    if (!job.technician || !job.technician.id) {
      if (technicians.length > 0) {
        const firstTechnician = technicians[0]
        console.log(`\n3️⃣ Asignando trabajo a ${firstTechnician.name}...`)
        
        await prisma.job.update({
          where: { id: job.id },
          data: { technicianId: firstTechnician.id }
        })
        
        console.log(`   ✅ Trabajo asignado exitosamente`)
      } else {
        console.log(`\n❌ No hay técnicos disponibles para asignar el trabajo`)
        return
      }
    } else {
      console.log(`\n3️⃣ El trabajo ya está asignado a ${job.technician.name}`)
    }

    // 4. Mostrar información de login para ver el trabajo
    console.log(`\n4️⃣ Para ver el trabajo en el calendario:`)
    
    if (job.technician) {
      console.log(`   🔐 Logueate como técnico: ${job.technician.name}`)
      console.log(`   📧 Email: ${job.technician.email}`)
      console.log(`   🆔 ID: ${job.technician.id}`)
    }
    
    console.log(`   🔐 O logueate como administrador para ver todos los trabajos`)
    
    // 5. Verificar que el trabajo esté en el rango de fechas correcto
    const scheduledDate = new Date(job.scheduledAt)
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const isInRange = scheduledDate >= thirtyDaysAgo && scheduledDate <= thirtyDaysFromNow
    
    console.log(`\n5️⃣ Verificación de fechas:`)
    console.log(`   Fecha del trabajo: ${scheduledDate.toISOString()}`)
    console.log(`   Rango del calendario: ${thirtyDaysAgo.toISOString()} a ${thirtyDaysFromNow.toISOString()}`)
    console.log(`   ¿Está en rango?: ${isInRange ? '✅ Sí' : '❌ No'}`)

    if (!isInRange) {
      console.log(`   ⚠️  El trabajo está fuera del rango de fechas del calendario`)
      console.log(`   💡 Navega a la fecha ${scheduledDate.toLocaleDateString('es-CL')} en el calendario`)
    }

    // 6. Mostrar instrucciones finales
    console.log(`\n🎯 Instrucciones para ver el trabajo:`)
    console.log(`   1. Ve a http://localhost:3000/login`)
    console.log(`   2. Logueate como ${job.technician?.name || 'un técnico'}`)
    console.log(`   3. Ve a http://localhost:3000/dashboard/schedule/calendar`)
    console.log(`   4. El trabajo debería aparecer el ${scheduledDate.toLocaleDateString('es-CL')} a las ${scheduledDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })}`)

  } catch (error) {
    console.error('Error al solucionar el problema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCalendarDisplay()
