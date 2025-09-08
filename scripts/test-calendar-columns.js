const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCalendarColumns() {
  try {
    console.log('🧪 Probando funcionalidad de columnas del calendario...\n')

    // 1. Verificar técnicos activos
    console.log('1️⃣ Verificando técnicos activos:')
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

    console.log(`   Técnicos activos encontrados: ${activeTechnicians.length}`)
    activeTechnicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.id})`)
    })

    // 2. Verificar trabajos sin técnico asignado
    console.log('\n2️⃣ Verificando trabajos sin técnico asignado:')
    const unassignedJobs = await prisma.job.findMany({
      where: {
        technicianId: null
      },
      include: {
        client: true,
        service: true
      }
    })

    console.log(`   Trabajos sin asignar: ${unassignedJobs.length}`)
    unassignedJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name}`)
    })

    // 3. Verificar trabajos con técnico asignado
    console.log('\n3️⃣ Verificando trabajos con técnico asignado:')
    const assignedJobs = await prisma.job.findMany({
      where: {
        technicianId: {
          not: null
        }
      },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    console.log(`   Trabajos con técnico asignado: ${assignedJobs.length}`)
    assignedJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - Cliente: ${job.client?.name} - Técnico: ${job.technician?.name}`)
    })

    // 4. Simular asignación de trabajo a técnico
    if (unassignedJobs.length > 0 && activeTechnicians.length > 0) {
      console.log('\n4️⃣ Simulando asignación de trabajo a técnico:')
      const jobToAssign = unassignedJobs[0]
      const technicianToAssign = activeTechnicians[0]

      console.log(`   Asignando trabajo "${jobToAssign.title}" a ${technicianToAssign.name}...`)

      const updatedJob = await prisma.job.update({
        where: { id: jobToAssign.id },
        data: { technicianId: technicianToAssign.id },
        include: {
          client: true,
          service: true,
          technician: true
        }
      })

      console.log(`   ✅ Trabajo asignado exitosamente`)
      console.log(`   Nuevo estado: ${updatedJob.title} - Técnico: ${updatedJob.technician?.name}`)

      // 5. Verificar que ya no hay trabajos sin asignar
      console.log('\n5️⃣ Verificando trabajos sin asignar después de la asignación:')
      const remainingUnassignedJobs = await prisma.job.findMany({
        where: {
          technicianId: null
        }
      })

      console.log(`   Trabajos sin asignar restantes: ${remainingUnassignedJobs.length}`)
      if (remainingUnassignedJobs.length === 0) {
        console.log('   ✅ No hay trabajos sin asignar - La columna "Sin Asignar" debería desaparecer')
      } else {
        console.log('   ⚠️ Aún hay trabajos sin asignar - La columna "Sin Asignar" permanecerá')
      }
    }

    // 6. Verificar estado final
    console.log('\n6️⃣ Estado final del sistema:')
    const finalTechnicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        },
        isActive: true
      }
    })

    const finalUnassignedJobs = await prisma.job.findMany({
      where: {
        technicianId: null
      }
    })

    console.log(`   Técnicos activos: ${finalTechnicians.length}`)
    console.log(`   Trabajos sin asignar: ${finalUnassignedJobs.length}`)
    
    if (finalUnassignedJobs.length > 0) {
      console.log('   📋 Columnas que deberían aparecer en el calendario:')
      console.log('      - "Sin Asignar" (porque hay trabajos sin técnico)')
      finalTechnicians.forEach((tech, index) => {
        console.log(`      - "${tech.name}"`)
      })
    } else {
      console.log('   📋 Columnas que deberían aparecer en el calendario:')
      finalTechnicians.forEach((tech, index) => {
        console.log(`      - "${tech.name}"`)
      })
      console.log('   ✅ NO debería aparecer columna "Sin Asignar"')
    }

    console.log('\n🎯 Prueba completada exitosamente!')
    console.log('💡 Para ver los cambios en el calendario:')
    console.log('   1. Ve a http://localhost:3000/dashboard/schedule/calendar')
    console.log('   2. Verifica que las columnas coincidan con el estado final')
    console.log('   3. Si asignaste un trabajo, la columna "Sin Asignar" debería desaparecer')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCalendarColumns()
