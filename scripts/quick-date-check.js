const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function quickDateCheck() {
  try {
    console.log('🔍 Verificación rápida de fechas...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    jobs.forEach((job, index) => {
      const date = new Date(job.scheduledAt)
      const isInvalid = isNaN(date.getTime())
      const is1969 = date.getFullYear() === 1969
      
      console.log(`${index + 1}. ${job.title}`)
      console.log(`   ID: ${job.id}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name || 'Sin asignar'}`)
      console.log(`   Fecha ISO: ${job.scheduledAt}`)
      console.log(`   Fecha local: ${date.toLocaleString('es-CL')}`)
      console.log(`   Es inválida: ${isInvalid}`)
      console.log(`   Es 1969: ${is1969}`)
      console.log('')
    })

    // Buscar trabajos problemáticos
    const invalidJobs = jobs.filter(job => {
      const date = new Date(job.scheduledAt)
      return isNaN(date.getTime()) || date.getFullYear() === 1969
    })

    if (invalidJobs.length > 0) {
      console.log(`⚠️  Trabajos con fechas problemáticas: ${invalidJobs.length}`)
      invalidJobs.forEach(job => {
        console.log(`   - ${job.title} (ID: ${job.id})`)
      })
    } else {
      console.log('✅ No se encontraron trabajos con fechas problemáticas')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickDateCheck()
