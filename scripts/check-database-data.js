#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkDatabaseData() {
    console.log('🔍 Verificando datos en la base de datos...\n');

    const prisma = new PrismaClient();

    try {
        // Verificar clientes
        const clients = await prisma.client.findMany({
            where: { status: 'active' },
            select: { id: true, name: true, email: true }
        });

        console.log('👥 Clientes activos:');
        if (clients.length === 0) {
            console.log('❌ No hay clientes activos');
        } else {
            clients.forEach(client => {
                console.log(`- ${client.name} (${client.email}) - ID: ${client.id}`);
            });
        }

        // Verificar servicios
        const services = await prisma.service.findMany({
            where: { isActive: true },
            select: { id: true, name: true, price: true }
        });

        console.log('\n🔧 Servicios activos:');
        if (services.length === 0) {
            console.log('❌ No hay servicios activos');
        } else {
            services.forEach(service => {
                console.log(`- ${service.name} - Precio: $${service.price} - ID: ${service.id}`);
            });
        }

        // Verificar empresas
        const companies = await prisma.company.findMany({
            select: { id: true, name: true }
        });

        console.log('\n🏢 Empresas:');
        if (companies.length === 0) {
            console.log('❌ No hay empresas');
        } else {
            companies.forEach(company => {
                console.log(`- ${company.name} - ID: ${company.id}`);
            });
        }

        // Verificar técnicos
        const technicians = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: 'TECNICO' } },
                    { role: { name: 'tecnico' } }
                ],
                isActive: true
            },
            select: { id: true, name: true, email: true, role: true }
        });

        console.log('\n👨‍🔧 Técnicos activos:');
        if (technicians.length === 0) {
            console.log('❌ No hay técnicos activos');
        } else {
            technicians.forEach(tech => {
                console.log(`- ${tech.name} (${tech.email}) - Rol: ${tech.role?.name} - ID: ${tech.id}`);
            });
        }

        // Verificar trabajos existentes
        const jobs = await prisma.job.findMany({
            select: { id: true, title: true, status: true, createdAt: true }
        });

        console.log('\n📋 Trabajos existentes:');
        if (jobs.length === 0) {
            console.log('❌ No hay trabajos');
        } else {
            jobs.forEach(job => {
                console.log(`- ${job.title} - Estado: ${job.status} - ID: ${job.id}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseData();
