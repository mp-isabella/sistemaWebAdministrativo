const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateCompanies() {
  try {

    // Configuraciones completas de empresas
    const companiesData = [
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

    for (const companyData of companiesData) {
      // Buscar empresa existente por nombre
      const existingCompany = await prisma.company.findFirst({
        where: { 
          OR: [
            { name: companyData.name },
            { name: { contains: companyData.name.split(' ')[0] } }
          ]
        }
      })

      if (existingCompany) {
        // Actualizar empresa existente
        const updatedCompany = await prisma.company.update({
          where: { id: existingCompany.id },
          data: companyData
        })
        `)
      } else {
        // Crear nueva empresa
        const newCompany = await prisma.company.create({
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

updateCompanies()
