const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTechnicianReassignment() {
  try {
    console.log('🧪 Probando reasignación de técnicos...\n')

    // Buscar un trabajo con fecha válida
    const testJob = await prisma.job.findFirst({
      where: {
        scheduledAt: { not: null }
      },
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (!testJob) {
      console.log('❌ No se encontró ningún trabajo con fecha válida para la prueba')
      return
    }

    console.log('📋 Trabajo de prueba:')
    console.log(`   ID: ${testJob.id}`)
    console.log(`   Título: ${testJob.title}`)
    console.log(`   Cliente: ${testJob.client?.name}`)
    console.log(`   Técnico actual: ${testJob.technician?.name || 'Sin asignar'}`)
    console.log(`   Fecha antes: ${testJob.scheduledAt.toLocaleDateString('es-CL')}`)
    console.log(`   Hora antes: ${testJob.startTime} - ${testJob.endTime}`)

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

    // Simular la actualización que hace el modal
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
        technician: true,
        service: true
      }
    })

    console.log('\n📊 Resultado de la actualización:')
    console.log(`   Fecha después: ${updatedJob.scheduledAt.toLocaleDateString('es-CL')}`)
    console.log(`   Hora después: ${updatedJob.startTime} - ${updatedJob.endTime}`)
    console.log(`   Técnico después: ${updatedJob.technician?.name}`)

    // Verificar que la fecha no cambió
    const dateChanged = testJob.scheduledAt.getTime() !== updatedJob.scheduledAt.getTime()
    const timeChanged = testJob.startTime !== updatedJob.startTime || testJob.endTime !== updatedJob.endTime
    const technicianChanged = testJob.technicianId !== updatedJob.technicianId

    console.log('\n🔍 Verificación:')
    console.log(`   ✅ Fecha sin cambios: ${!dateChanged ? 'SÍ' : 'NO'}`)
    console.log(`   ✅ Hora sin cambios: ${!timeChanged ? 'SÍ' : 'NO'}`)
    console.log(`   ✅ Técnico cambiado: ${technicianChanged ? 'SÍ' : 'NO'}`)

    if (!dateChanged && !timeChanged && technicianChanged) {
      console.log('\n🎉 ¡PRUEBA EXITOSA! La reasignación de técnicos funciona correctamente')
    } else {
      console.log('\n❌ ¡PRUEBA FALLIDA! Se detectaron cambios no deseados')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTechnicianReassignment()
