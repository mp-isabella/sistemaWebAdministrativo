const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetCompanies() {
  try {

    // Eliminar todas las empresas existentes
    const deleteResult = await prisma.company.deleteMany({})

    // Crear las 3 empresas que queremos
    const companies = [
      { name: 'Amestica Ltda.', email: 'contacto@amestica.cl', phone: '+56 2 1234 5678' },
      { name: 'Multifugas', email: 'contacto@multifugas.cl', phone: '+56 2 2345 6789' },
      { name: 'Servifugas', email: 'contacto@servifugas.cl', phone: '+56 2 3456 7890' }
    ]

    for (const companyData of companies) {
      const company = await prisma.company.create({
        data: companyData
      })
      `)
    }

    // Verificar el resultado final
    const finalCompanies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    })

    :`)
    finalCompanies.forEach(company => {
      
    })

  } catch (error) {
    
  } finally {
    await prisma.$disconnect()
  }
}

resetCompanies()
