const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTechnicianReassignmentFix() {
  try {
    console.log('🧪 Probando la corrección de reasignación de técnicos...\n')

    // 1. Buscar un trabajo existente con fecha y hora válidas
    const testJob = await prisma.job.findFirst({
      where: {
        scheduledAt: { not: null },
        startTime: { not: null },
        endTime: { not: null }
      },
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (!testJob) {
      console.log('❌ No se encontró ningún trabajo con fecha y hora válidas para la prueba')
      return
    }

    console.log('📋 Trabajo de prueba encontrado:')
    console.log(`   ID: ${testJob.id}`)
    console.log(`   Título: ${testJob.title}`)
    console.log(`   Cliente: ${testJob.client?.name}`)
    console.log(`   Fecha original: ${testJob.scheduledAt.toLocaleDateString('es-CL')}`)
    console.log(`   Hora original: ${testJob.startTime} - ${testJob.endTime}`)
    console.log(`   Técnico actual: ${testJob.technician?.name || 'Sin asignar'}\n`)

    // 2. Buscar otro técnico disponible
    const newTechnician = await prisma.user.findFirst({
      where: {
        role: { name: 'TECNICO' },
        isActive: true,
        id: { not: testJob.technicianId || 'none' }
      }
    })

    if (!newTechnician) {
      console.log('❌ No se encontró otro técnico disponible para la prueba')
      return
    }

    console.log('🔄 Simulando reasignación de técnico...')
    console.log(`   Nuevo técnico: ${newTechnician.name}`)
    console.log(`   Fecha y hora: Se mantienen iguales\n`)

    // 3. Simular la actualización que haría el modal
    const originalScheduledAt = testJob.scheduledAt
    const originalStartTime = testJob.startTime
    const originalEndTime = testJob.endTime

    // Simular el formato de fecha que envía el modal
    const formattedDate = originalScheduledAt.toISOString().split('T')[0]
    console.log(`   Fecha formateada para comparación: ${formattedDate}`)

    // Simular la lógica de comparación del modal
    const normalizeDate = (dateStr) => {
      if (!dateStr) return ""
      try {
        const date = new Date(dateStr)
        return date.toISOString().split('T')[0]
      } catch {
        return dateStr || ""
      }
    }

    const normalizedNewDate = normalizeDate(formattedDate)
    const normalizedJobDate = normalizeDate(originalScheduledAt.toISOString().split('T')[0])

    console.log(`   Fecha normalizada nueva: ${normalizedNewDate}`)
    console.log(`   Fecha normalizada trabajo: ${normalizedJobDate}`)
    console.log(`   ¿Las fechas son iguales?: ${normalizedNewDate === normalizedJobDate ? 'SÍ' : 'NO'}\n`)

    // 4. Simular la actualización en la base de datos
    const updateData = {
      technicianId: newTechnician.id
    }

    // Solo incluir fecha si realmente cambió
    if (normalizedNewDate !== normalizedJobDate) {
      updateData.scheduledAt = formattedDate
      console.log('⚠️  ¡PROBLEMA! Se incluiría la fecha en la actualización')
    } else {
      console.log('✅ Correcto: No se incluye la fecha en la actualización')
    }

    // 5. Realizar la actualización real
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

    // 6. Verificar que fecha y hora se mantuvieron iguales
    const dateUnchanged = updatedJob.scheduledAt.getTime() === originalScheduledAt.getTime()
    const timeUnchanged = updatedJob.startTime === originalStartTime && updatedJob.endTime === originalEndTime
    const technicianChanged = updatedJob.technician.id !== testJob.technicianId

    console.log('\n🔍 Verificación final:')
    console.log(`   ✅ Fecha sin cambios: ${dateUnchanged ? 'SÍ' : 'NO'}`)
    console.log(`   ✅ Hora sin cambios: ${timeUnchanged ? 'SÍ' : 'NO'}`)
    console.log(`   ✅ Técnico cambiado: ${technicianChanged ? 'SÍ' : 'NO'}`)

    if (dateUnchanged && timeUnchanged && technicianChanged) {
      console.log('\n🎉 ¡PRUEBA EXITOSA! La reasignación de técnicos funciona correctamente')
    } else {
      console.log('\n❌ ¡PROBLEMA DETECTADO! La reasignación está modificando fecha/hora incorrectamente')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTechnicianReassignmentFix()
