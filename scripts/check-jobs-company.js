const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJobsCompany() {
  try {
    console.log('🏢 Verificando empresas asignadas a trabajos...\n')

    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true,
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Total de trabajos: ${jobs.length}\n`)

    jobs.forEach((job, index) => {
      console.log(`${index + 1}. Trabajo: ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico: ${job.technician?.name}`)
      console.log(`   Servicio: ${job.service?.name}`)
      console.log(`   Empresa ID: ${job.companyId}`)
      console.log(`   Empresa: ${job.company?.name || 'Sin empresa'}`)
      console.log(`   Estado: ${job.status}`)
      console.log('---')
    })

    // Verificar trabajos sin empresa
    const jobsWithoutCompany = jobs.filter(job => !job.companyId || !job.company)
    const jobsWithCompany = jobs.filter(job => job.companyId && job.company)

    console.log('\n📋 Resumen:')
    console.log(`✅ Trabajos CON empresa: ${jobsWithCompany.length}`)
    console.log(`❌ Trabajos SIN empresa: ${jobsWithoutCompany.length}`)

    if (jobsWithoutCompany.length > 0) {
      console.log('\n⚠️  Trabajos sin empresa:')
      jobsWithoutCompany.forEach(job => {
        console.log(`   - ${job.title} (ID: ${job.id})`)
      })
    }

    // Verificar todas las empresas disponibles
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true
      }
    })

    console.log('\n🏢 Empresas disponibles:')
    companies.forEach(company => {
      console.log(`   - ${company.name} (ID: ${company.id})`)
    })

  } catch (error) {
    console.error('❌ Error al verificar trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobsCompany()
