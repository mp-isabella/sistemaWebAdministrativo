#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function createDefaultCompany() {
    console.log('🏢 Creando empresa por defecto "Sin empresa"...\n');

    const prisma = new PrismaClient();

    try {
        // Verificar si ya existe una empresa "Sin empresa"
        const existingCompany = await prisma.company.findFirst({
            where: { name: 'Sin empresa' }
        });

        if (existingCompany) {
            console.log('✅ La empresa "Sin empresa" ya existe con ID:', existingCompany.id);
            return;
        }

        // Crear la empresa "Sin empresa"
        const defaultCompany = await prisma.company.create({
            data: {
                id: 'sin-empresa',
                name: 'Sin empresa',
                type: 'DEFAULT',
                isActive: true
            }
        });

        console.log('✅ Empresa "Sin empresa" creada exitosamente:');
        console.log(`- ID: ${defaultCompany.id}`);
        console.log(`- Nombre: ${defaultCompany.name}`);
        console.log(`- Tipo: ${defaultCompany.type}`);

    } catch (error) {
        console.error('❌ Error creando empresa por defecto:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDefaultCompany();
