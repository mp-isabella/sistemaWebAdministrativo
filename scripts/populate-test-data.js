const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateTestData() {
  try {
    // Crear empresas de prueba
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: 'Amestica Ltda.',
          displayName: 'Améstica Servicios Técnicos',
          email: 'contacto@amestica.cl',
          phone: '+56 9 1234 5678',
          address: 'Santiago, Chile',
          rut: '76.123.456-7',
          type: 'AMESTICA',
          service: 'Servicios de fumigación y control de plagas',
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
          accentColor: '#60a5fa',
          isActive: true
        }
      }),
      prisma.company.create({
        data: {
          name: 'Multifugas Ltda.',
          displayName: 'Multifugas Servicios',
          email: 'contacto@multifugas.cl',
          phone: '+56 9 8765 4321',
          address: 'Valparaíso, Chile',
          rut: '76.987.654-3',
          type: 'MULTIFUGAS',
          service: 'Servicios de fumigación industrial',
          primaryColor: '#059669',
          secondaryColor: '#10b981',
          accentColor: '#34d399',
          isActive: true
        }
      }),
      prisma.company.create({
        data: {
          name: 'Servifugas Ltda.',
          displayName: 'Servifugas Técnicos',
          email: 'contacto@servifugas.cl',
          phone: '+56 9 5555 1234',
          address: 'Concepción, Chile',
          rut: '76.555.123-4',
          type: 'SERVIFUGAS',
          service: 'Servicios especializados de fumigación',
          primaryColor: '#dc2626',
          secondaryColor: '#ef4444',
          accentColor: '#f87171',
          isActive: true
        }
      })
    ]);
    // Crear clientes de prueba
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          name: 'Juan Pérez',
          email: 'cliente1@ejemplo.com',
          phone: '+56 9 1111 2222',
          address: 'Av. Providencia 123, Santiago',
          region: 'Metropolitana',
          commune: 'Providencia',
          company: 'Empresa ABC',
          rut: '12.345.678-9',
          status: 'active'
        }
      }),
      prisma.client.create({
        data: {
          name: 'María González',
          email: 'cliente2@ejemplo.com',
          phone: '+56 9 3333 4444',
          address: 'Calle Las Flores 456, Valparaíso',
          region: 'Valparaíso',
          commune: 'Valparaíso',
          company: 'Comercial XYZ',
          rut: '98.765.432-1',
          status: 'active'
        }
      }),
      prisma.client.create({
        data: {
          name: 'Carlos Rodríguez',
          email: 'cliente3@ejemplo.com',
          phone: '+56 9 5555 6666',
          address: 'Av. Libertad 789, Concepción',
          region: 'Biobío',
          commune: 'Concepción',
          company: 'Industrias DEF',
          rut: '11.222.333-4',
          status: 'active'
        }
      }),
      prisma.client.create({
        data: {
          name: 'Ana Silva',
          email: 'cliente4@ejemplo.com',
          phone: '+56 9 7777 8888',
          address: 'Calle Principal 321, Viña del Mar',
          region: 'Valparaíso',
          commune: 'Viña del Mar',
          company: 'Hotel Resort',
          rut: '55.666.777-8',
          status: 'active'
        }
      }),
      prisma.client.create({
        data: {
          name: 'Roberto Torres',
          email: 'cliente5@ejemplo.com',
          phone: '+56 9 9999 0000',
          address: 'Av. Central 654, Temuco',
          region: 'Araucanía',
          commune: 'Temuco',
          company: 'Restaurante Familiar',
          rut: '99.888.777-6',
          status: 'active'
        }
      })
    ]);
    // Crear servicios de prueba
    const services = await Promise.all([
      prisma.service.create({
        data: {
          name: 'Fumigación Residencial',
          description: 'Servicio de fumigación para hogares y residencias',
          price: 50000,
          isActive: true
        }
      }),
      prisma.service.create({
        data: {
          name: 'Fumigación Comercial',
          description: 'Servicio de fumigación para locales comerciales',
          price: 80000,
          isActive: true
        }
      }),
      prisma.service.create({
        data: {
          name: 'Fumigación Industrial',
          description: 'Servicio de fumigación para instalaciones industriales',
          price: 150000,
          isActive: true
        }
      }),
      prisma.service.create({
        data: {
          name: 'Control de Plagas',
          description: 'Servicio especializado de control de plagas',
          price: 60000,
          isActive: true
        }
      })
    ]);
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

populateTestData();
