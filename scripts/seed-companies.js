const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCompanies() {
  try {

    // Crear empresas si no existen
    const companies = [
      { name: 'Amestica Ltda.', email: 'contacto@amestica.cl', phone: '+56 2 1234 5678' },
      { name: 'Multifugas', email: 'contacto@multifugas.cl', phone: '+56 2 2345 6789' },
      { name: 'Servifugas', email: 'contacto@servifugas.cl', phone: '+56 2 3456 7890' }
    ]

    for (const companyData of companies) {
      const existingCompany = await prisma.company.findFirst({
        where: { name: companyData.name }
      })

      if (!existingCompany) {
        const company = await prisma.company.create({
          data: companyData
        })
        `)
      } else {
        
      }
    }

  } catch (error) {
    
  } finally {
    await prisma.$disconnect()
  }
}

seedCompanies()
