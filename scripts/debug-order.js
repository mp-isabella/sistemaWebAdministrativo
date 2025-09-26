#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function debugOrder() {
    console.log('🔍 Verificando orden de trabajos en la base de datos...\n');

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

        console.log('📋 Trabajos en la base de datos (orden por createdAt DESC):');
        jobs.forEach((job, index) => {
            const createdDate = new Date(job.createdAt);
            const scheduledDate = new Date(job.scheduledAt);

            console.log(`${index + 1}. ${job.title}`);
            console.log(`   📅 Creado: ${createdDate.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`);
            console.log(`   📅 Programado: ${scheduledDate.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' })}`);
            console.log(`   📊 Estado: ${job.status}`);
            console.log(`   🆔 ID: ${job.id.slice(-8)}`);
            console.log('');
        });

        console.log('🎯 Para verificar en el navegador:');
        console.log('1. Abre las herramientas de desarrollador (F12)');
        console.log('2. Ve a la pestaña "Console"');
        console.log('3. Busca los logs que empiezan con "📋 Trabajos cargados" y "🔄 Ordenando"');
        console.log('4. Verifica que el orden sea el mismo que se muestra arriba');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugOrder();
