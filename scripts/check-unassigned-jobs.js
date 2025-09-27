#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Verificando trabajos sin asignar...');

async function checkUnassignedJobs() {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres';
    console.log('🔗 Using database URL:', databaseUrl.includes('supabase') ? 'Supabase' : 'Custom');

    const prisma = new PrismaClient({
        datasources: { db: { url: databaseUrl } }
    });

    try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos exitosa');

        // Buscar trabajos sin técnico asignado
        const unassignedJobs = await prisma.job.findMany({
            where: {
                OR: [
                    { technicianId: null },
                    { technicianId: '' },
                    { technician: null }
                ]
            },
            include: {
                client: true,
                company: true,
                service: true,
                technician: true
            }
        });

        console.log(`\n📋 Trabajos sin asignar encontrados: ${unassignedJobs.length}`);

        if (unassignedJobs.length > 0) {
            console.log('\n📝 Detalles de trabajos sin asignar:');
            unassignedJobs.forEach((job, index) => {
                console.log(`\n${index + 1}. Trabajo ID: ${job.id}`);
                console.log(`   Título: ${job.title || 'Sin título'}`);
                console.log(`   Cliente: ${job.client?.name || 'Sin cliente'}`);
                console.log(`   Empresa: ${job.company?.name || 'Sin empresa'}`);
                console.log(`   Servicio: ${job.service?.name || 'Sin servicio'}`);
                console.log(`   Técnico: ${job.technician?.name || 'SIN ASIGNAR'}`);
                console.log(`   Fecha: ${job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString('es-CL') : 'Sin fecha'}`);
                console.log(`   Estado: ${job.status || 'Sin estado'}`);
            });
        } else {
            console.log('\n✅ No hay trabajos sin asignar en la base de datos');
        }

        // Buscar todos los trabajos para ver el estado general
        const allJobs = await prisma.job.findMany({
            include: {
                client: true,
                company: true,
                service: true,
                technician: true
            }
        });

        console.log(`\n📊 Resumen total de trabajos: ${allJobs.length}`);

        if (allJobs.length > 0) {
            const withTechnician = allJobs.filter(job => job.technician && job.technicianId);
            const withoutTechnician = allJobs.filter(job => !job.technician || !job.technicianId);

            console.log(`   - Con técnico asignado: ${withTechnician.length}`);
            console.log(`   - Sin técnico asignado: ${withoutTechnician.length}`);
        }

    } catch (error) {
        console.error('❌ Error verificando trabajos sin asignar:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUnassignedJobs();
