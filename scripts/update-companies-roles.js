const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateCompaniesAndRoles() {
    try {
        console.log('🔄 Actualizando empresas y roles...');

        // Crear/actualizar roles
        console.log('📝 Actualizando roles...');

        const adminRole = await prisma.role.upsert({
            where: { name: 'ADMINISTRADOR' },
            update: {},
            create: { name: 'ADMINISTRADOR' }
        });
        console.log('✅ Rol ADMINISTRADOR actualizado');

        const secretariaRole = await prisma.role.upsert({
            where: { name: 'SECRETARIA' },
            update: {},
            create: { name: 'SECRETARIA' }
        });
        console.log('✅ Rol SECRETARIA actualizado');

        const tecnicoRole = await prisma.role.upsert({
            where: { name: 'TECNICO' },
            update: {},
            create: { name: 'TECNICO' }
        });
        console.log('✅ Rol TECNICO actualizado');

        // Crear/actualizar empresas
        console.log('🏢 Actualizando empresas...');

        const companies = [
            {
                name: 'Amestica Ltda.',
                displayName: 'Amestica Ltda.',
                email: 'contacto@amestica.cl',
                phone: '+56 9 1234 5678',
                address: 'Santiago, Chile',
                type: 'AMESTICA',
                service: 'Servicios de reparación y mantenimiento',
                isActive: true,
            },
            {
                name: 'Multifugas',
                displayName: 'Multifugas',
                email: 'contacto@multifugas.cl',
                phone: '+56 9 2345 6789',
                address: 'Santiago, Chile',
                type: 'MULTIFUGAS',
                service: 'Servicios especializados en multifugas',
                isActive: true,
            },
            {
                name: 'Servifugas',
                displayName: 'Servifugas',
                email: 'contacto@servifugas.cl',
                phone: '+56 9 3456 7890',
                address: 'Santiago, Chile',
                type: 'SERVIFUGAS',
                service: 'Servicios de reparación y mantenimiento',
                isActive: true,
            },
        ];

        for (const companyData of companies) {
            const company = await prisma.company.upsert({
                where: { name: companyData.name },
                update: {
                    displayName: companyData.displayName,
                    email: companyData.email,
                    phone: companyData.phone,
                    address: companyData.address,
                    type: companyData.type,
                    service: companyData.service,
                    isActive: companyData.isActive,
                },
                create: companyData,
            });
            console.log(`✅ Empresa ${company.name} actualizada`);
        }

        console.log('🎉 ¡Actualización completada exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

updateCompaniesAndRoles()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
