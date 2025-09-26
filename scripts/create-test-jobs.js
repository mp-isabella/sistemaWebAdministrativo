/**
 * Script para crear trabajos de prueba
 * Este script crea trabajos de prueba con diferentes características para verificar el funcionamiento del sistema
 */

const testJobs = [
    // Trabajos con servicios predeterminados
    {
        title: "Detección de fugas de agua",
        description: "Revisión completa del sistema de agua para detectar posibles fugas en la propiedad del cliente",
        serviceName: "Detección de fugas de agua",
        priority: "HIGH",
        totalBudget: 150000,
        totalWorkAmount: 180000,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        startTime: "09:00",
        endTime: "11:00"
    },
    {
        title: "Destape de alcantarillado",
        description: "Servicio de destape y limpieza del sistema de alcantarillado",
        serviceName: "Destape de alcantarillado",
        priority: "MEDIUM",
        totalBudget: 80000,
        totalWorkAmount: 95000,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
        startTime: "14:00",
        endTime: "16:00"
    },
    {
        title: "Video inspección de ductos",
        description: "Inspección con cámara de video de los ductos de alcantarillado",
        serviceName: "Video inspección de ductos",
        priority: "LOW",
        totalBudget: 120000,
        totalWorkAmount: 140000,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        startTime: "10:00",
        endTime: "12:00"
    },

    // Trabajos con servicios personalizados
    {
        title: "Reparación de grifo",
        description: "Reparación completa del grifo de la cocina que tiene fuga constante",
        serviceName: "Reparación de grifo",
        priority: "HIGH",
        totalBudget: 45000,
        totalWorkAmount: 55000,
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // En 4 días
        startTime: "08:00",
        endTime: "10:00"
    },
    {
        title: "Instalación de medidor de agua",
        description: "Instalación de nuevo medidor de agua en propiedad residencial",
        serviceName: "Instalación de medidor de agua",
        priority: "MEDIUM",
        totalBudget: 200000,
        totalWorkAmount: 250000,
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // En 5 días
        startTime: "13:00",
        endTime: "15:00"
    },
    {
        title: "Mantenimiento preventivo",
        description: "Mantenimiento preventivo del sistema de agua y alcantarillado",
        serviceName: "Mantenimiento preventivo",
        priority: "LOW",
        totalBudget: 100000,
        totalWorkAmount: 120000,
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // En 6 días
        startTime: "16:00",
        endTime: "18:00"
    },

    // Trabajos con diferentes horarios
    {
        title: "Emergencia nocturna",
        description: "Servicio de emergencia para fuga de agua en horario nocturno",
        serviceName: "Servicio de emergencia",
        priority: "HIGH",
        totalBudget: 300000,
        totalWorkAmount: 350000,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        startTime: "18:00",
        endTime: "19:00"
    },
    {
        title: "Limpieza de tanque",
        description: "Limpieza y desinfección de tanque de agua",
        serviceName: "Limpieza de tanque",
        priority: "MEDIUM",
        totalBudget: 180000,
        totalWorkAmount: 220000,
        scheduledAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // En 8 días
        startTime: "11:00",
        endTime: "13:00"
    }
];

// Función para crear un trabajo de prueba
async function createTestJob(jobData, clientId, companyId) {
    try {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...jobData,
                clientId,
                companyId,
                // Sin técnico asignado para que vaya a la columna "Técnico" del calendario
                technicianId: null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error creando trabajo:', error);
            return null;
        }

        const createdJob = await response.json();
        console.log('✅ Trabajo creado:', createdJob.title);
        return createdJob;
    } catch (error) {
        console.error('Error en la creación del trabajo:', error);
        return null;
    }
}

// Función principal para crear todos los trabajos de prueba
async function createAllTestJobs() {
    console.log('🚀 Iniciando creación de trabajos de prueba...');

    try {
        // Obtener clientes disponibles
        const clientsResponse = await fetch('/api/clients');
        const clients = await clientsResponse.json();

        if (!clients || clients.length === 0) {
            console.error('❌ No hay clientes disponibles. Crea al menos un cliente primero.');
            return;
        }

        // Obtener empresas disponibles (hardcoded según el formulario)
        const companies = [
            { id: "domestica", name: "Empresa Doméstica" },
            { id: "ltda", name: "LTDA" },
            { id: "multifugas", name: "Multifugas" },
            { id: "servifugas", name: "Servifugas" }
        ];

        console.log(`📋 Clientes disponibles: ${clients.length}`);
        console.log(`🏢 Empresas disponibles: ${companies.length}`);

        let createdJobs = 0;
        let failedJobs = 0;

        for (let i = 0; i < testJobs.length; i++) {
            const jobData = testJobs[i];

            // Seleccionar cliente aleatorio
            const randomClient = clients[Math.floor(Math.random() * clients.length)];

            // Seleccionar empresa aleatoria
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];

            console.log(`\n📝 Creando trabajo ${i + 1}/${testJobs.length}: ${jobData.title}`);
            console.log(`👤 Cliente: ${randomClient.name}`);
            console.log(`🏢 Empresa: ${randomCompany.name}`);
            console.log(`📅 Fecha: ${jobData.scheduledAt.toLocaleDateString('es-CL')}`);
            console.log(`⏰ Horario: ${jobData.startTime} - ${jobData.endTime}`);
            console.log(`⚡ Prioridad: ${jobData.priority}`);
            console.log(`💰 Presupuesto: $${jobData.totalBudget?.toLocaleString('es-CL') || 'N/A'}`);

            const createdJob = await createTestJob(jobData, randomClient.id, randomCompany.id);

            if (createdJob) {
                createdJobs++;
                console.log(`✅ Trabajo creado exitosamente: ${createdJob.id}`);
            } else {
                failedJobs++;
                console.log(`❌ Error creando trabajo: ${jobData.title}`);
            }

            // Pequeña pausa entre creaciones para evitar sobrecarga
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n🎉 Resumen de creación de trabajos:');
        console.log(`✅ Trabajos creados exitosamente: ${createdJobs}`);
        console.log(`❌ Trabajos fallidos: ${failedJobs}`);
        console.log(`📊 Total procesados: ${testJobs.length}`);

        if (createdJobs > 0) {
            console.log('\n🔍 Puedes verificar los trabajos en:');
            console.log('- Dashboard: /dashboard');
            console.log('- Calendario: /dashboard/schedule/calendar');
            console.log('- Lista de trabajos: /dashboard/schedule');
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Función para limpiar trabajos de prueba (opcional)
async function cleanupTestJobs() {
    console.log('🧹 Limpiando trabajos de prueba...');

    try {
        const response = await fetch('/api/jobs');
        const jobs = await response.json();

        const testJobTitles = testJobs.map(job => job.title);
        const testJobsToDelete = jobs.filter(job => testJobTitles.includes(job.title));

        console.log(`🗑️ Encontrados ${testJobsToDelete.length} trabajos de prueba para eliminar`);

        for (const job of testJobsToDelete) {
            try {
                const deleteResponse = await fetch(`/api/jobs?id=${job.id}`, {
                    method: 'DELETE'
                });

                if (deleteResponse.ok) {
                    console.log(`✅ Trabajo eliminado: ${job.title}`);
                } else {
                    console.log(`❌ Error eliminando trabajo: ${job.title}`);
                }
            } catch (error) {
                console.error(`❌ Error eliminando trabajo ${job.title}:`, error);
            }
        }

        console.log('🧹 Limpieza completada');
    } catch (error) {
        console.error('❌ Error en la limpieza:', error);
    }
}

// Exportar funciones para uso en el navegador
if (typeof window !== 'undefined') {
    window.createAllTestJobs = createAllTestJobs;
    window.cleanupTestJobs = cleanupTestJobs;
    window.testJobs = testJobs;

    console.log('🔧 Funciones de prueba disponibles:');
    console.log('- createAllTestJobs(): Crear todos los trabajos de prueba');
    console.log('- cleanupTestJobs(): Limpiar trabajos de prueba');
    console.log('- testJobs: Array con los datos de trabajos de prueba');
}

// Si se ejecuta directamente en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createAllTestJobs,
        cleanupTestJobs,
        testJobs
    };
}
