const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedClients() {
    try {
        console.log('🌱 Creando clientes de prueba...');

        const clients = [
            {
                name: 'Empresa ABC Ltda',
                email: 'contacto@empresaabc.cl',
                phone: '+56 9 1234 5678',
                address: 'Av. Principal 123, Santiago',
                company: 'Empresa ABC Ltda',
                region: 'Región Metropolitana',
                commune: 'Santiago',
                status: 'active',
                rut: '12.345.678-9'
            },
            {
                name: 'Industria XYZ S.A.',
                email: 'ventas@industriaxyz.cl',
                phone: '+56 9 2345 6789',
                address: 'Camino Industrial 456, Valparaíso',
                company: 'Industria XYZ S.A.',
                region: 'Región de Valparaíso',
                commune: 'Valparaíso',
                status: 'active',
                rut: '98.765.432-1'
            },
            {
                name: 'Residencial Los Pinos',
                email: 'admin@residencialpinos.cl',
                phone: '+56 9 3456 7890',
                address: 'Calle Residencial 789, Concepción',
                company: 'Residencial Los Pinos',
                region: 'Región del Biobío',
                commune: 'Concepción',
                status: 'active',
                rut: '11.222.333-4'
            },
            {
                name: 'Comercial Centro',
                email: 'gerencia@comercialcentro.cl',
                phone: '+56 9 4567 8901',
                address: 'Plaza Central 321, Antofagasta',
                company: 'Comercial Centro',
                region: 'Región de Antofagasta',
                commune: 'Antofagasta',
                status: 'active',
                rut: '55.666.777-8'
            },
            {
                name: 'Oficina Corporativa',
                email: 'info@oficinacorp.cl',
                phone: '+56 9 5678 9012',
                address: 'Torre Empresarial 654, Temuco',
                company: 'Oficina Corporativa',
                region: 'Región de La Araucanía',
                commune: 'Temuco',
                status: 'active',
                rut: '99.888.777-6'
            }
        ];

        for (const clientData of clients) {
            const client = await prisma.client.upsert({
                where: { email: clientData.email },
                update: {
                    name: clientData.name,
                    phone: clientData.phone,
                    address: clientData.address,
                    company: clientData.company,
                    region: clientData.region,
                    commune: clientData.commune,
                    status: clientData.status,
                    rut: clientData.rut
                },
                create: clientData
            });
            console.log(`✅ Cliente creado: ${client.name}`);
        }

        console.log('🎉 ¡Clientes de prueba creados exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

seedClients()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
