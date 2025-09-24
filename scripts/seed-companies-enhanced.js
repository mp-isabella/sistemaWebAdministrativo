const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCompaniesEnhanced() {
  try {

    // Configuraciones completas de empresas
    const companies = [
      {
        name: 'AMESTICA LIMITADA',
        displayName: 'AMESTICA LIMITADA',
        email: 'amesticaltda@gmail.com',
        phone: '222660040',
        address: 'Hamburgo 1398, Ñuñoa.',
        rut: '76.508.960-3',
        logo: '/amestica.png',
        type: 'AMESTICA',
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#f97316'
      },
      {
        name: 'MULTIFUGAS',
        displayName: 'MULTIFUGAS SERVICIOS PROFESIONALES',
        email: 'multifugas@gmail.com',
        phone: '+569 78868002',
        address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
        rut: '78.135.216-0',
        logo: '/multifugas.png',
        type: 'MULTIFUGAS',
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#f97316'
      },
      {
        name: 'SERVIFUGAS SPA',
        displayName: 'SERVIFUGAS SPA',
        email: 'Servifugas1@gmail.com',
        phone: '+569 92492720',
        address: 'Lo Barnechea 1559.',
        rut: '78.135.232-2',
        logo: '/servifugas.png',
        type: 'SERVIFUGAS',
        service: 'Servicio de detección de filtraciones en agua potable y reparación de cañerías',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        accentColor: '#1e40af'
      }
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
        // Actualizar empresa existente con nueva información
        const updatedCompany = await prisma.company.update({
          where: { id: existingCompany.id },
          data: companyData
        })
        `)
      }
    }

  } catch (error) {
    
  } finally {
    await prisma.$disconnect()
  }
}

seedCompaniesEnhanced()
