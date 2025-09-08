const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTechnicianReassignmentFinal() {
  try {
    console.log('🧪 Prueba final de reasignación de técnicos...\n')

    // Buscar el trabajo "Destape de Alcantarillado"
    const testJob = await prisma.job.findFirst({
      where: {
        title: "Destape de Alcantarillado"
      },
      include: {
        client: true,
        technician: true
      }
    })

    if (!testJob) {
      console.log('❌ No se encontró el trabajo de prueba')
      return
    }

    console.log('📋 Estado inicial del trabajo:')
    console.log(`   ID: ${testJob.id}`)
    console.log(`   Título: ${testJob.title}`)
    console.log(`   Cliente: ${testJob.client?.name}`)
    console.log(`   Técnico actual: ${testJob.technician?.name || 'Sin asignar'}`)
    console.log(`   Fecha: ${testJob.scheduledAt.toLocaleDateString('es-CL')}`)
    console.log(`   Horario: ${testJob.startTime} - ${testJob.endTime}`)

    // Buscar otro técnico para la reasignación
    const otherTechnician = await prisma.user.findFirst({
      where: {
        role: {
          name: "TECNICO"
        },
        id: { not: testJob.technicianId },
        isActive: true
      }
    })

    if (!otherTechnician) {
      console.log('❌ No se encontró otro técnico para la reasignación')
      return
    }

    console.log(`\n🔄 Reasignando a: ${otherTechnician.name}`)

    // Simular la actualización que hace el modal (SOLO técnico)
    const updateData = {
      technicianId: otherTechnician.id
    }

    console.log('📤 Datos enviados:', updateData)

    // Actualizar el trabajo
    const updatedJob = await prisma.job.update({
      where: { id: testJob.id },
      data: updateData,
      include: {
        client: true,
        technician: true
      }
    })

    console.log('\n📊 Resultado después de la actualización:')
    console.log(`   Fecha: ${updatedJob.scheduledAt.toLocaleDateString('es-CL')}`)
    console.log(`   Horario: ${updatedJob.startTime} - ${updatedJob.endTime}`)
    console.log(`   Técnico: ${updatedJob.technician?.name}`)

    // Verificar que la fecha y hora NO cambiaron
    const dateChanged = testJob.scheduledAt.getTime() !== updatedJob.scheduledAt.getTime()
    const timeChanged = testJob.startTime !== updatedJob.startTime || testJob.endTime !== updatedJob.endTime
    const technicianChanged = testJob.technicianId !== updatedJob.technicianId

    console.log('\n🔍 Verificación:')
    console.log(`   ✅ Fecha sin cambios: ${!dateChanged ? 'SÍ' : 'NO'}`)
    console.log(`   ✅ Horario sin cambios: ${!timeChanged ? 'SÍ' : 'NO'}`)
    console.log(`   ✅ Técnico cambiado: ${technicianChanged ? 'SÍ' : 'NO'}`)

    if (!dateChanged && !timeChanged && technicianChanged) {
      console.log('\n🎉 ¡PRUEBA EXITOSA! La reasignación de técnicos funciona correctamente')
      console.log('✅ La fecha y hora se mantuvieron iguales')
      console.log('✅ Solo cambió el técnico')
    } else {
      console.log('\n❌ ¡PRUEBA FALLIDA! Se detectaron cambios no deseados')
      if (dateChanged) console.log('   ❌ La fecha cambió incorrectamente')
      if (timeChanged) console.log('   ❌ El horario cambió incorrectamente')
      if (!technicianChanged) console.log('   ❌ El técnico no cambió')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTechnicianReassignmentFinal()
