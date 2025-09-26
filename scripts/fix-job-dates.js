#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function fixJobDates() {
    console.log('🔧 Corrigiendo fechas de creación de trabajos...\n');

    const prisma = new PrismaClient();

    try {
        // Obtener todos los trabajos
        const jobs = await prisma.job.findMany({
            select: { id: true, title: true, createdAt: true, scheduledAt: true }
        });

        console.log(`📋 Encontrados ${jobs.length} trabajos:`);

        let updatedCount = 0;

        for (const job of jobs) {
            console.log(`\n🔍 Trabajo: ${job.title}`);
            console.log(`   - ID: ${job.id}`);
            console.log(`   - createdAt: ${job.createdAt}`);
            console.log(`   - scheduledAt: ${job.scheduledAt}`);

            // Si createdAt es null o muy antiguo, usar scheduledAt como fallback
            if (!job.createdAt || job.createdAt.getFullYear() < 2020) {
                const newCreatedAt = job.scheduledAt || new Date();

                await prisma.job.update({
                    where: { id: job.id },
                    data: { createdAt: newCreatedAt }
                });

                console.log(`   ✅ Actualizado createdAt a: ${newCreatedAt}`);
                updatedCount++;
            } else {
                console.log(`   ✅ createdAt ya es válido`);
            }
        }

        console.log(`\n🎯 Resumen:`);
        console.log(`   - Total trabajos: ${jobs.length}`);
        console.log(`   - Trabajos actualizados: ${updatedCount}`);

        // Verificar el orden final
        const orderedJobs = await prisma.job.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, title: true, createdAt: true }
        });

        console.log(`\n📅 Orden final de trabajos (más recientes primero):`);
        orderedJobs.forEach((job, index) => {
            console.log(`   ${index + 1}. ${job.title} - ${job.createdAt}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixJobDates();
