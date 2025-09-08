const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDateIssue() {
  try {
    console.log('🔍 Diagnóstico de fechas...\n')

    // Buscar todos los trabajos
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`)
      console.log(`   ID: ${job.id}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name || 'Sin asignar'}`)
      console.log(`   scheduledAt en BD: ${job.scheduledAt}`)
      
      if (job.scheduledAt) {
        const date = new Date(job.scheduledAt)
        console.log(`   Fecha convertida: ${date.toLocaleDateString('es-CL')}`)
        console.log(`   Es 1969: ${date.getFullYear() === 1969}`)
        console.log(`   Es inválida: ${isNaN(date.getTime())}`)
      } else {
        console.log(`   scheduledAt: NULL`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDateIssue()
