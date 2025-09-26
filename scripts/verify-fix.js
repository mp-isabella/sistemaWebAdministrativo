#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function verifyFix() {
    console.log('🔍 Verificando que la corrección esté aplicada...\n');

    const prisma = new PrismaClient();

    try {
        // Verificar que la empresa "Sin empresa" existe
        const sinEmpresa = await prisma.company.findUnique({
            where: { id: 'sin-empresa' }
        });

        if (sinEmpresa) {
            console.log('✅ Empresa "Sin empresa" existe:');
            console.log(`   - ID: ${sinEmpresa.id}`);
            console.log(`   - Nombre: ${sinEmpresa.name}`);
            console.log(`   - Tipo: ${sinEmpresa.type}`);
        } else {
            console.log('❌ Empresa "Sin empresa" NO existe');
        }

        // Verificar todas las empresas disponibles
        const allCompanies = await prisma.company.findMany({
            select: { id: true, name: true, type: true }
        });

        console.log('\n🏢 Todas las empresas en la base de datos:');
        allCompanies.forEach(company => {
            console.log(`   - ${company.name} (ID: ${company.id}) - Tipo: ${company.type}`);
        });

        // Verificar que hay clientes activos
        const activeClients = await prisma.client.findMany({
            where: { status: 'active' },
            select: { id: true, name: true }
        });

        console.log('\n👥 Clientes activos disponibles:');
        activeClients.forEach(client => {
            console.log(`   - ${client.name} (ID: ${client.id})`);
        });

        // Verificar que hay técnicos activos
        const activeTechnicians = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: 'TECNICO' } },
                    { role: { name: 'tecnico' } }
                ],
                isActive: true
            },
            select: { id: true, name: true, role: true }
        });

        console.log('\n👨‍🔧 Técnicos activos disponibles:');
        activeTechnicians.forEach(tech => {
            console.log(`   - ${tech.name} (ID: ${tech.id}) - Rol: ${tech.role?.name}`);
        });

        console.log('\n🎯 Estado de la corrección:');
        if (sinEmpresa && activeClients.length > 0 && activeTechnicians.length > 0) {
            console.log('✅ TODO CORRECTO - El formulario debería funcionar ahora');
            console.log('💡 Si aún no ves los cambios:');
            console.log('   1. Refresca la página con Ctrl+F5 (forzar recarga)');
            console.log('   2. Abre las herramientas de desarrollador (F12)');
            console.log('   3. Ve a la pestaña "Application" > "Storage" > "Clear storage"');
            console.log('   4. Recarga la página');
        } else {
            console.log('❌ Aún hay problemas - revisa los datos faltantes arriba');
        }

    } catch (error) {
        console.error('❌ Error verificando la corrección:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFix();
