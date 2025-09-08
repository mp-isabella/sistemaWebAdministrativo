const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompanies() {
  try {
    console.log('🏢 Iniciando seed de empresas...');

    // Empresas que deben existir
    const companies = [
      {
        name: 'Amestica',
        type: 'AMESTICA',
        address: 'Santiago, Chile',
        phone: '+56 2 2345 6789',
        email: 'contacto@amestica.cl',
        website: 'https://amestica.cl',
        taxId: '76.123.456-7',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6'
      },
      {
        name: 'Servifugas',
        type: 'SERVIFUGAS',
        address: 'Santiago, Chile',
        phone: '+56 2 2345 6790',
        email: 'contacto@servifugas.cl',
        website: 'https://servifugas.cl',
        taxId: '76.123.456-8',
        primaryColor: '#059669',
        secondaryColor: '#10b981'
      },
      {
        name: 'Multifugas',
        type: 'MULTIFUGAS',
        address: 'Santiago, Chile',
        phone: '+56 2 2345 6791',
        email: 'contacto@multifugas.cl',
        website: 'https://multifugas.cl',
        taxId: '76.123.456-9',
        primaryColor: '#dc2626',
        secondaryColor: '#ef4444'
      }
    ];

    for (const company of companies) {
      // Verificar si la empresa ya existe
      const existingCompany = await prisma.company.findFirst({
        where: { name: company.name }
      });

      if (!existingCompany) {
        const newCompany = await prisma.company.create({
          data: company
        });
        console.log(`✅ Empresa creada: ${newCompany.name}`);
      } else {
        console.log(`ℹ️ Empresa ya existe: ${existingCompany.name}`);
      }
    }

    console.log('🎉 Seed de empresas completado');
  } catch (error) {
    console.error('❌ Error en seed de empresas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompanies();
