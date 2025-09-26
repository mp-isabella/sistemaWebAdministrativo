#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkJobOrder() {
    console.log('🔍 Verificando orden de trabajos por fecha de creación...\n');

    const prisma = new PrismaClient();

    try {
        // Obtener trabajos ordenados por fecha de creación
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                scheduledAt: true,
                status: true
            }
        });

        console.log(`📋 Trabajos ordenados por fecha de creación (más recientes primero):\n`);

        jobs.forEach((job, index) => {
            const createdDate = new Date(job.createdAt);
            const scheduledDate = new Date(job.scheduledAt);

            console.log(`${index + 1}. ${job.title}`);
            console.log(`   📅 Creado: ${createdDate.toLocaleString('es-CL', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })}`);
            console.log(`   📅 Programado: ${scheduledDate.toLocaleDateString('es-CL', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })}`);
            console.log(`   📊 Estado: ${job.status}`);
            console.log(`   🆔 ID: ${job.id.slice(-8)}`);
            console.log('');
        });

        // Verificar que el orden es correcto
        let isOrdered = true;
        for (let i = 1; i < jobs.length; i++) {
            const prevJob = new Date(jobs[i - 1].createdAt);
            const currentJob = new Date(jobs[i].createdAt);

            if (prevJob < currentJob) {
                isOrdered = false;
                console.log(`❌ Orden incorrecto: ${jobs[i - 1].title} (${prevJob}) debería estar después de ${jobs[i].title} (${currentJob})`);
            }
        }

        if (isOrdered) {
            console.log('✅ El orden de trabajos es correcto (más recientes primero)');
        } else {
            console.log('❌ El orden de trabajos NO es correcto');
        }

        console.log('\n💡 Si el orden no se ve correcto en el navegador:');
        console.log('   1. Presiona Ctrl+F5 para forzar recarga');
        console.log('   2. O abre una ventana de incógnito');
        console.log('   3. O limpia el caché del navegador');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkJobOrder();
