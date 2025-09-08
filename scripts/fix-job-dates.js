const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixJobDates() {
  try {
    console.log('🔧 Verificando y corrigiendo fechas de trabajos...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true,
        company: true
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    for (const job of jobs) {
      const originalDate = new Date(job.scheduledAt)
      console.log(`\n🔍 Trabajo: ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Fecha original: ${originalDate.toISOString()}`)
      console.log(`   Fecha local: ${originalDate.toLocaleString('es-CL')}`)
      
      // Verificar si la fecha está en el formato correcto
      // Si la fecha está en UTC pero debería estar en hora local de Chile
      const chileTimeZone = 'America/Santiago'
      const chileDate = new Date(originalDate.toLocaleString('en-US', { timeZone: chileTimeZone }))
      
      console.log(`   Fecha Chile: ${chileDate.toLocaleString('es-CL')}`)
      
      // Si la fecha está mal, corregirla
      // Por ejemplo, si está guardada en UTC pero debería estar en hora local
      const correctedDate = new Date(originalDate.toLocaleString('en-US', { timeZone: chileTimeZone }))
      
      if (originalDate.getTime() !== correctedDate.getTime()) {
        console.log(`   ⚠️  Fecha necesita corrección`)
        console.log(`   Fecha corregida: ${correctedDate.toISOString()}`)
        
        // Actualizar la fecha en la base de datos
        await prisma.job.update({
          where: { id: job.id },
          data: { scheduledAt: correctedDate }
        })
        
        console.log(`   ✅ Fecha corregida en la base de datos`)
      } else {
        console.log(`   ✅ Fecha correcta`)
      }
    }

    console.log('\n🎉 Verificación completada')

  } catch (error) {
    console.error('❌ Error al verificar fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixJobDates()
