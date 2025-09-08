const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('🔍 Checking database data...\n')

    // Check clients
    const clients = await prisma.client.findMany()
    console.log(`📋 Clients: ${clients.length}`)
    if (clients.length > 0) {
      console.log('   Sample clients:')
      clients.slice(0, 3).forEach(client => {
        console.log(`   - ${client.name} (${client.email})`)
      })
    }

    // Check companies
    const companies = await prisma.company.findMany()
    console.log(`\n🏢 Companies: ${companies.length}`)
    if (companies.length > 0) {
      console.log('   Sample companies:')
      companies.forEach(company => {
        console.log(`   - ${company.name} (${company.type})`)
      })
    }

    // Check users with technician role
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        }
      },
      include: {
        role: true
      }
    })
    console.log(`\n👨‍🔧 Technicians: ${technicians.length}`)
    if (technicians.length > 0) {
      console.log('   Sample technicians:')
      technicians.forEach(tech => {
        console.log(`   - ${tech.name} (${tech.email})`)
      })
    }

    // Check roles
    const roles = await prisma.role.findMany()
    console.log(`\n👥 Roles: ${roles.length}`)
    roles.forEach(role => {
      console.log(`   - ${role.name}`)
    })

    console.log('\n✅ Data check completed!')
  } catch (error) {
    console.error('❌ Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
