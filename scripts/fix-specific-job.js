const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSpecificJob() {
  try {
    console.log('🔧 Corrigiendo trabajo específico...\n')

    // Buscar el trabajo "Destape de Alcantarillado"
    const job = await prisma.job.findFirst({
      where: {
        title: "Destape de Alcantarillado"
      },
      include: {
        client: true,
        technician: true
      }
    })

    if (!job) {
      console.log('❌ No se encontró el trabajo "Destape de Alcantarillado"')
      return
    }

    console.log('📋 Trabajo encontrado:')
    console.log(`   ID: ${job.id}`)
    console.log(`   Título: ${job.title}`)
    console.log(`   Cliente: ${job.client?.name}`)
    console.log(`   Técnico: ${job.technician?.name || 'Sin asignar'}`)
    console.log(`   Fecha actual: ${job.scheduledAt}`)
    console.log(`   Horario actual: ${job.startTime} - ${job.endTime}`)

    // Crear una fecha para hoy con hora por defecto
    const today = new Date()
    today.setHours(10, 0, 0, 0) // 10:00 AM por defecto

    // Actualizar el trabajo con fecha y horarios válidos
    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        scheduledAt: today,
        startTime: '10:00',
        endTime: '11:00'
      },
      include: {
        client: true,
        technician: true
      }
    })

    console.log('\n✅ Trabajo corregido:')
    console.log(`   Fecha nueva: ${updatedJob.scheduledAt.toLocaleDateString('es-CL')}`)
    console.log(`   Horario nuevo: ${updatedJob.startTime} - ${updatedJob.endTime}`)
    console.log(`   Técnico: ${updatedJob.technician?.name || 'Sin asignar'}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificJob()
