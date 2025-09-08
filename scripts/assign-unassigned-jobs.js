const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function assignUnassignedJobs() {
  try {
    console.log('🔧 Asignando trabajos sin técnico...\n')

    // 1. Obtener trabajos sin asignar
    const unassignedJobs = await prisma.job.findMany({
      where: {
        technicianId: null
      },
      include: {
        client: true,
        service: true
      }
    })

    console.log(`📋 Trabajos sin asignar encontrados: ${unassignedJobs.length}`)
    unassignedJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name}`)
    })

    if (unassignedJobs.length === 0) {
      console.log('✅ No hay trabajos sin asignar')
      return
    }

    // 2. Obtener técnicos activos
    const activeTechnicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    console.log(`\n👨‍🔧 Técnicos activos disponibles: ${activeTechnicians.length}`)
    activeTechnicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.id})`)
    })

    if (activeTechnicians.length === 0) {
      console.log('❌ No hay técnicos activos disponibles')
      return
    }

    // 3. Asignar trabajos a técnicos
    console.log('\n🔄 Asignando trabajos a técnicos...')
    
    for (let i = 0; i < unassignedJobs.length; i++) {
      const job = unassignedJobs[i]
      const technician = activeTechnicians[i % activeTechnicians.length] // Distribuir entre técnicos
      
      console.log(`   Asignando "${job.title}" a ${technician.name}...`)
      
      const updatedJob = await prisma.job.update({
        where: { id: job.id },
        data: { technicianId: technician.id },
        include: {
          client: true,
          service: true,
          technician: true
        }
      })
      
      console.log(`   ✅ Asignado exitosamente`)
    }

    // 4. Verificar estado final
    console.log('\n📊 Verificando estado final...')
    
    const finalUnassignedJobs = await prisma.job.findMany({
      where: {
        technicianId: null
      }
    })

    const finalTechnicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        },
        isActive: true
      }
    })

    console.log(`   Trabajos sin asignar: ${finalUnassignedJobs.length}`)
    console.log(`   Técnicos activos: ${finalTechnicians.length}`)

    if (finalUnassignedJobs.length === 0) {
      console.log('\n✅ ¡Éxito! Todos los trabajos han sido asignados')
      console.log('📋 Columnas que deberían aparecer en el calendario:')
      finalTechnicians.forEach((tech, index) => {
        console.log(`   - "${tech.name}"`)
      })
      console.log('   ✅ NO debería aparecer columna "Sin Asignar"')
    } else {
      console.log('\n⚠️ Aún quedan trabajos sin asignar')
      console.log('📋 Columnas que deberían aparecer en el calendario:')
      console.log('   - "Sin Asignar"')
      finalTechnicians.forEach((tech, index) => {
        console.log(`   - "${tech.name}"`)
      })
    }

    console.log('\n🎯 Proceso completado!')
    console.log('💡 Para ver los cambios:')
    console.log('   1. Ve a http://localhost:3000/dashboard/schedule/calendar')
    console.log('   2. Verifica que la columna "Sin Asignar" haya desaparecido')
    console.log('   3. Los trabajos deberían aparecer en las columnas de los técnicos asignados')

  } catch (error) {
    console.error('❌ Error asignando trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignUnassignedJobs()
