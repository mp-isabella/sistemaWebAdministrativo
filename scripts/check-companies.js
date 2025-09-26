const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCompanies() {
    try {
        console.log('🔍 Verificando empresas en la base de datos...\n');

        const companies = await prisma.company.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`📊 Total de empresas: ${companies.length}`);
        console.log('\nEmpresas actuales:');
        companies.forEach(company => {
            console.log(`  - ${company.name} (ID: ${company.id})`);
        });

        // Identificar duplicados
        const nameGroups = {};
        companies.forEach(company => {
            const normalizedName = company.name.toUpperCase().trim();
            if (!nameGroups[normalizedName]) {
                nameGroups[normalizedName] = [];
            }
            nameGroups[normalizedName].push(company);
        });

        console.log('\n🔍 Análisis de duplicados:');
        Object.keys(nameGroups).forEach(name => {
            if (nameGroups[name].length > 1) {
                console.log(`  ⚠️  "${name}" tiene ${nameGroups[name].length} registros:`);
                nameGroups[name].forEach(company => {
                    console.log(`    - ID: ${company.id}, Nombre: "${company.name}"`);
                });
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCompanies();
