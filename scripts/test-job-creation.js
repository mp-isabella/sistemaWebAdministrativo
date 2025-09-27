#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
        }
    }
});

async function testJobCreation() {
    console.log('🧪 Probando creación de trabajo...\n');

    try {
        // Obtener datos necesarios
        const client = await prisma.client.findFirst();
        const service = await prisma.service.findFirst();
        const company = await prisma.company.findFirst();
        const technician = await prisma.user.findFirst({
            where: { role: { name: 'TECNICO' } }
        });

        if (!client) {
            console.log('❌ No hay clientes en la base de datos');
            return;
        }
        if (!service) {
            console.log('❌ No hay servicios en la base de datos');
            return;
        }
        if (!company) {
            console.log('❌ No hay empresas en la base de datos');
            return;
        }

        console.log('📋 Datos encontrados:');
        console.log(`   Cliente: ${client.name} (${client.id})`);
        console.log(`   Servicio: ${service.name} (${service.id})`);
        console.log(`   Empresa: ${company.name} (${company.id})`);
        console.log(`   Técnico: ${technician ? technician.name : 'Sin técnico'}`);

        // Crear trabajo de prueba
        const jobData = {
            title: "Prueba de creación de trabajo",
            description: "Trabajo de prueba para verificar la funcionalidad",
            clientId: client.id,
            serviceId: service.id,
            companyId: company.id,
            technicianId: technician ? technician.id : null,
            scheduledAt: new Date(),
            startTime: "09:00",
            endTime: "11:00",
            priority: "MEDIUM",
            status: "PENDING",
            totalBudget: 50000
        };

        console.log('\n🔧 Creando trabajo...');
        const newJob = await prisma.job.create({
            data: jobData,
            include: {
                client: true,
                service: true,
                company: true,
                technician: true
            }
        });

        console.log('✅ Trabajo creado exitosamente:');
        console.log(`   ID: ${newJob.id}`);
        console.log(`   Título: ${newJob.title}`);
        console.log(`   Cliente: ${newJob.client.name}`);
        console.log(`   Servicio: ${newJob.service.name}`);
        console.log(`   Empresa: ${newJob.company.name}`);
        console.log(`   Técnico: ${newJob.technician ? newJob.technician.name : 'Sin asignar'}`);

        // Limpiar el trabajo de prueba
        console.log('\n🧹 Limpiando trabajo de prueba...');
        await prisma.job.delete({
            where: { id: newJob.id }
        });
        console.log('✅ Trabajo de prueba eliminado');

    } catch (error) {
        console.error('❌ Error creando trabajo:', error);

        if (error.code === 'P2002') {
            console.log('   Error: Violación de restricción única');
        } else if (error.code === 'P2003') {
            console.log('   Error: Violación de clave foránea');
        } else if (error.code === 'P2025') {
            console.log('   Error: Registro no encontrado');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testJobCreation();