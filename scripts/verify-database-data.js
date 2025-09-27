#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
        }
    }
});

async function verifyDatabaseData() {
    console.log('🔍 Verificando datos de la base de datos...\n');

    try {
        // Verificar roles
        console.log('📋 Verificando roles...');
        const roles = await prisma.role.findMany();
        console.log(`✅ Roles encontrados: ${roles.length}`);
        roles.forEach(role => console.log(`   - ${role.name}`));

        // Verificar usuarios
        console.log('\n👥 Verificando usuarios...');
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        console.log(`✅ Usuarios encontrados: ${users.length}`);
        users.forEach(user => console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role?.name || 'Sin rol'}`));

        // Verificar empresas
        console.log('\n🏢 Verificando empresas...');
        const companies = await prisma.company.findMany();
        console.log(`✅ Empresas encontradas: ${companies.length}`);
        companies.forEach(company => console.log(`   - ${company.name}`));

        // Verificar clientes
        console.log('\n👤 Verificando clientes...');
        const clients = await prisma.client.findMany();
        console.log(`✅ Clientes encontrados: ${clients.length}`);
        clients.forEach(client => console.log(`   - ${client.name} (${client.email || 'Sin email'})`));

        // Verificar servicios
        console.log('\n🔧 Verificando servicios...');
        const services = await prisma.service.findMany();
        console.log(`✅ Servicios encontrados: ${services.length}`);
        services.forEach(service => console.log(`   - ${service.name}`));

        // Verificar trabajos existentes
        console.log('\n💼 Verificando trabajos...');
        const jobs = await prisma.job.findMany({
            include: {
                client: true,
                service: true,
                company: true,
                technician: true
            }
        });
        console.log(`✅ Trabajos encontrados: ${jobs.length}`);
        jobs.forEach(job => console.log(`   - ${job.title} - Cliente: ${job.client?.name || 'Sin cliente'}`));

        // Verificar si faltan datos críticos
        console.log('\n🚨 Verificando datos críticos...');

        if (roles.length === 0) {
            console.log('❌ No hay roles en la base de datos');
        }

        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
        }

        if (companies.length === 0) {
            console.log('❌ No hay empresas en la base de datos');
        }

        if (clients.length === 0) {
            console.log('❌ No hay clientes en la base de datos');
        }

        if (services.length === 0) {
            console.log('❌ No hay servicios en la base de datos');
        }

        // Resumen
        console.log('\n📊 RESUMEN:');
        console.log(`   Roles: ${roles.length}`);
        console.log(`   Usuarios: ${users.length}`);
        console.log(`   Empresas: ${companies.length}`);
        console.log(`   Clientes: ${clients.length}`);
        console.log(`   Servicios: ${services.length}`);
        console.log(`   Trabajos: ${jobs.length}`);

        // Verificar si hay datos mínimos para crear trabajos
        const hasMinimumData = roles.length > 0 && users.length > 0 && companies.length > 0 && clients.length > 0 && services.length > 0;

        if (hasMinimumData) {
            console.log('\n✅ La base de datos tiene los datos mínimos necesarios para crear trabajos');
        } else {
            console.log('\n❌ Faltan datos críticos para crear trabajos');
            console.log('   Ejecuta: npm run setup para configurar los datos iniciales');
        }

    } catch (error) {
        console.error('❌ Error verificando la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDatabaseData();
