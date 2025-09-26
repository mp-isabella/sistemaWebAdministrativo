const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateCompanies() {
    try {
        console.log('🧹 Limpiando empresas duplicadas...\n');

        // Obtener todas las empresas
        const allCompanies = await prisma.company.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`📊 Total de empresas encontradas: ${allCompanies.length}`);
        console.log('Empresas actuales:');
        allCompanies.forEach(company => {
            console.log(`  - ${company.name} (ID: ${company.id})`);
        });

        // Definir las 3 empresas principales que queremos mantener
        const targetCompanies = [
            'AMESTICA LTDA',
            'MULTIFUGAS',
            'SERVIFUGAS'
        ];

        // Crear las empresas principales si no existen
        console.log('\n🏢 Creando/actualizando empresas principales...');

        for (const companyName of targetCompanies) {
            const companyData = getCompanyData(companyName);

            // Buscar si ya existe una empresa con este nombre
            let existingCompany = await prisma.company.findFirst({
                where: { name: companyName }
            });

            if (existingCompany) {
                // Actualizar empresa existente
                const company = await prisma.company.update({
                    where: { id: existingCompany.id },
                    data: {
                        displayName: companyData.displayName,
                        email: companyData.email,
                        phone: companyData.phone,
                        address: companyData.address,
                        rut: companyData.rut,
                        type: companyData.type,
                        service: companyData.service,
                        primaryColor: companyData.primaryColor,
                        secondaryColor: companyData.secondaryColor,
                        accentColor: companyData.accentColor,
                        isActive: true
                    }
                });
                console.log(`✅ ${company.name} actualizada - ${company.id}`);
            } else {
                // Crear nueva empresa
                const company = await prisma.company.create({
                    data: companyData
                });
                console.log(`✅ ${company.name} creada - ${company.id}`);
            }
        }

        // Eliminar empresas que no son las principales
        console.log('\n🗑️ Eliminando empresas duplicadas...');

        const companiesToDelete = await prisma.company.findMany({
            where: {
                name: {
                    notIn: targetCompanies
                }
            }
        });

        if (companiesToDelete.length > 0) {
            console.log(`Empresas a eliminar (${companiesToDelete.length}):`);
            companiesToDelete.forEach(company => {
                console.log(`  - ${company.name} (ID: ${company.id})`);
            });

            // Verificar si hay usuarios asociados a estas empresas
            for (const company of companiesToDelete) {
                const usersWithCompany = await prisma.user.findMany({
                    where: { companyId: company.id }
                });

                if (usersWithCompany.length > 0) {
                    console.log(`⚠️  La empresa ${company.name} tiene ${usersWithCompany.length} usuarios asociados.`);
                    console.log('   Reasignando usuarios a AMESTICA LTDA...');

                    // Reasignar usuarios a AMESTICA LTDA
                    const amesticaCompany = await prisma.company.findFirst({
                        where: { name: 'AMESTICA LTDA' }
                    });

                    if (amesticaCompany) {
                        await prisma.user.updateMany({
                            where: { companyId: company.id },
                            data: { companyId: amesticaCompany.id }
                        });
                        console.log(`   ✅ Usuarios reasignados a ${amesticaCompany.name}`);
                    }
                }

                // Eliminar la empresa
                await prisma.company.delete({
                    where: { id: company.id }
                });
                console.log(`   ✅ Empresa ${company.name} eliminada`);
            }
        } else {
            console.log('✅ No hay empresas duplicadas para eliminar');
        }

        // Verificar el resultado final
        const finalCompanies = await prisma.company.findMany({
            orderBy: { name: 'asc' }
        });

        console.log('\n🎉 Limpieza completada!');
        console.log(`📊 Empresas finales (${finalCompanies.length}):`);
        finalCompanies.forEach(company => {
            console.log(`  ✅ ${company.name} (ID: ${company.id})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

function getCompanyData(companyName) {
    const companiesData = {
        'AMESTICA LTDA': {
            name: 'AMESTICA LTDA',
            displayName: 'AMESTICA LTDA',
            email: 'contacto@amestica.cl',
            phone: '+56 9 1234 5678',
            address: 'Santiago, Chile',
            rut: '76.508.960-3',
            type: 'AMESTICA',
            service: 'Servicio de detección y reparación de filtraciones de agua potable',
            primaryColor: '#1e40af',
            secondaryColor: '#3b82f6',
            accentColor: '#60a5fa',
            isActive: true
        },
        'MULTIFUGAS': {
            name: 'MULTIFUGAS',
            displayName: 'MULTIFUGAS',
            email: 'contacto@multifugas.cl',
            phone: '+56 9 2345 6789',
            address: 'Valparaíso, Chile',
            rut: '78.135.216-0',
            type: 'MULTIFUGAS',
            service: 'Servicio de detección y reparación de filtraciones de agua potable',
            primaryColor: '#059669',
            secondaryColor: '#10b981',
            accentColor: '#34d399',
            isActive: true
        },
        'SERVIFUGAS': {
            name: 'SERVIFUGAS',
            displayName: 'SERVIFUGAS',
            email: 'contacto@servifugas.cl',
            phone: '+56 9 3456 7890',
            address: 'Concepción, Chile',
            rut: '78.135.232-2',
            type: 'SERVIFUGAS',
            service: 'Servicio de detección de filtraciones en agua potable y reparación de cañerías',
            primaryColor: '#dc2626',
            secondaryColor: '#ef4444',
            accentColor: '#f87171',
            isActive: true
        }
    };

    return companiesData[companyName];
}

cleanDuplicateCompanies()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
