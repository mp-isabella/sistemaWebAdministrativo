import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding companies...')

  // Create companies with their visual identity
  const companies = [
    {
      name: 'Amestica',
      type: 'AMESTICA',
      logo: '/amestica.png',
      primaryColor: '#1e40af',
      secondaryColor: '#f97316',
      address: 'Av. Providencia 1234, Providencia, Santiago',
      phone: '+56 2 2345 6789',
      email: 'contacto@amestica.cl',
      website: 'https://amestica.cl',
      taxId: '76.123.456-7'
    },
    {
      name: 'Multifugas',
      type: 'MULTIFUGAS',
      logo: '/multifugas.png',
      primaryColor: '#1e40af',
      secondaryColor: '#f97316',
      address: 'Av. Las Condes 5678, Las Condes, Santiago',
      phone: '+56 2 3456 7890',
      email: 'contacto@multifugas.cl',
      website: 'https://multifugas.cl',
      taxId: '76.234.567-8'
    },
    {
      name: 'Servifugas',
      type: 'SERVIFUGAS',
      logo: '/servifugas.png',
      primaryColor: '#059669',
      secondaryColor: '#1e40af',
      address: 'Av. Vitacura 9012, Vitacura, Santiago',
      phone: '+56 2 4567 8901',
      email: 'contacto@servifugas.cl',
      website: 'https://servifugas.cl',
      taxId: '76.345.678-9'
    }
  ]

  for (const company of companies) {
    const existingCompany = await prisma.company.findFirst({
      where: { name: company.name }
    })

    if (!existingCompany) {
      await prisma.company.create({
        data: company
      })
      console.log(`✅ Created company: ${company.name}`)
    } else {
      console.log(`⏭️  Company already exists: ${company.name}`)
    }
  }

  console.log('✅ Companies seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding companies:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
