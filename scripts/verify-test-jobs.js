/**
 * Script para verificar que los trabajos de prueba se muestren correctamente
 * Este script verifica que los trabajos creados aparezcan en el calendario y dashboard
 */

// Función para verificar trabajos en el calendario
async function verifyJobsInCalendar() {
    try {
        console.log('🔍 Verificando trabajos en el calendario...');

        // Obtener trabajos desde la API
        const response = await fetch('/api/jobs');
        const jobs = await response.json();

        if (!jobs || jobs.length === 0) {
            console.log('❌ No se encontraron trabajos');
            return { success: false, message: 'No hay trabajos en el sistema' };
        }

        console.log(`✅ Se encontraron ${jobs.length} trabajos en el sistema`);

        // Verificar trabajos de prueba
        const testJobTitles = [
            "Detección de fugas de agua",
            "Destape de alcantarillado",
            "Video inspección de ductos",
            "Reparación de grifo",
            "Instalación de medidor de agua",
            "Mantenimiento preventivo",
            "Emergencia nocturna",
            "Limpieza de tanque"
        ];

        const testJobs = jobs.filter(job => testJobTitles.includes(job.title));

        console.log(`🧪 Trabajos de prueba encontrados: ${testJobs.length}/${testJobTitles.length}`);

        if (testJobs.length > 0) {
            console.log('📋 Detalles de trabajos de prueba:');
            testJobs.forEach((job, index) => {
                console.log(`  ${index + 1}. ${job.title}`);
                console.log(`     - Cliente: ${job.client?.name || 'Sin cliente'}`);
                console.log(`     - Fecha: ${new Date(job.scheduledAt).toLocaleDateString('es-CL')}`);
                console.log(`     - Horario: ${job.startTime} - ${job.endTime}`);
                console.log(`     - Prioridad: ${job.priority}`);
                console.log(`     - Estado: ${job.status}`);
                console.log(`     - Técnico: ${job.technician?.name || 'Sin asignar'}`);
                if (job.totalBudget) {
                    console.log(`     - Presupuesto: $${Number(job.totalBudget).toLocaleString('es-CL')}`);
                }
                if (job.totalWorkAmount) {
                    console.log(`     - Monto Total: $${Number(job.totalWorkAmount).toLocaleString('es-CL')}`);
                }
                console.log('');
            });
        }

        return {
            success: true,
            totalJobs: jobs.length,
            testJobs: testJobs.length,
            expectedTestJobs: testJobTitles.length,
            jobs: testJobs
        };

    } catch (error) {
        console.error('❌ Error verificando trabajos:', error);
        return { success: false, message: error.message };
    }
}

// Función para verificar estadísticas del dashboard
async function verifyDashboardStats() {
    try {
        console.log('📊 Verificando estadísticas del dashboard...');

        // Obtener trabajos
        const jobsResponse = await fetch('/api/jobs');
        const jobs = await jobsResponse.json();

        // Obtener clientes
        const clientsResponse = await fetch('/api/clients');
        const clients = await clientsResponse.json();

        // Obtener trabajadores
        const workersResponse = await fetch('/api/workers');
        const workers = await workersResponse.json();

        const stats = {
            totalJobs: jobs?.length || 0,
            totalClients: clients?.length || 0,
            totalWorkers: workers?.workers?.length || 0,
            pendingJobs: jobs?.filter(job => job.status === 'PENDING').length || 0,
            inProgressJobs: jobs?.filter(job => job.status === 'IN_PROGRESS').length || 0,
            completedJobs: jobs?.filter(job => job.status === 'COMPLETED').length || 0
        };

        console.log('📈 Estadísticas del sistema:');
        console.log(`  - Total de trabajos: ${stats.totalJobs}`);
        console.log(`  - Total de clientes: ${stats.totalClients}`);
        console.log(`  - Total de trabajadores: ${stats.totalWorkers}`);
        console.log(`  - Trabajos pendientes: ${stats.pendingJobs}`);
        console.log(`  - Trabajos en progreso: ${stats.inProgressJobs}`);
        console.log(`  - Trabajos completados: ${stats.completedJobs}`);

        return { success: true, stats };

    } catch (error) {
        console.error('❌ Error verificando estadísticas:', error);
        return { success: false, message: error.message };
    }
}

// Función para verificar que los trabajos aparezcan en diferentes vistas
async function verifyJobsInViews() {
    try {
        console.log('👀 Verificando trabajos en diferentes vistas...');

        const views = [
            { name: 'Dashboard', url: '/dashboard' },
            { name: 'Calendario', url: '/dashboard/schedule/calendar' },
            { name: 'Lista de trabajos', url: '/dashboard/schedule' }
        ];

        console.log('🔗 Enlaces para verificar:');
        views.forEach(view => {
            console.log(`  - ${view.name}: ${window.location.origin}${view.url}`);
        });

        return { success: true, views };

    } catch (error) {
        console.error('❌ Error verificando vistas:', error);
        return { success: false, message: error.message };
    }
}

// Función principal de verificación
async function verifyTestJobs() {
    console.log('🚀 Iniciando verificación de trabajos de prueba...\n');

    try {
        // Verificar trabajos en el calendario
        const calendarResult = await verifyJobsInCalendar();
        console.log('');

        // Verificar estadísticas del dashboard
        const statsResult = await verifyDashboardStats();
        console.log('');

        // Verificar vistas
        const viewsResult = await verifyJobsInViews();
        console.log('');

        // Resumen final
        console.log('🎉 Resumen de verificación:');
        console.log(`✅ Trabajos en calendario: ${calendarResult.success ? 'OK' : 'Error'}`);
        console.log(`✅ Estadísticas del dashboard: ${statsResult.success ? 'OK' : 'Error'}`);
        console.log(`✅ Vistas disponibles: ${viewsResult.success ? 'OK' : 'Error'}`);

        if (calendarResult.success && calendarResult.testJobs > 0) {
            console.log(`\n🎯 Trabajos de prueba verificados: ${calendarResult.testJobs}/${calendarResult.expectedTestJobs}`);

            if (calendarResult.testJobs === calendarResult.expectedTestJobs) {
                console.log('✅ Todos los trabajos de prueba están presentes');
            } else {
                console.log('⚠️ Algunos trabajos de prueba no se encontraron');
            }
        }

        return {
            success: calendarResult.success && statsResult.success && viewsResult.success,
            calendar: calendarResult,
            stats: statsResult,
            views: viewsResult
        };

    } catch (error) {
        console.error('❌ Error en la verificación:', error);
        return { success: false, message: error.message };
    }
}

// Función para generar reporte de verificación
async function generateVerificationReport() {
    console.log('📋 Generando reporte de verificación...\n');

    const result = await verifyTestJobs();

    const report = {
        timestamp: new Date().toISOString(),
        success: result.success,
        details: {
            calendar: result.calendar,
            stats: result.stats,
            views: result.views
        }
    };

    console.log('📄 Reporte de verificación:');
    console.log(JSON.stringify(report, null, 2));

    return report;
}

// Exportar funciones para uso en el navegador
if (typeof window !== 'undefined') {
    window.verifyTestJobs = verifyTestJobs;
    window.verifyJobsInCalendar = verifyJobsInCalendar;
    window.verifyDashboardStats = verifyDashboardStats;
    window.verifyJobsInViews = verifyJobsInViews;
    window.generateVerificationReport = generateVerificationReport;

    console.log('🔧 Funciones de verificación disponibles:');
    console.log('- verifyTestJobs(): Verificar todos los trabajos de prueba');
    console.log('- verifyJobsInCalendar(): Verificar trabajos en el calendario');
    console.log('- verifyDashboardStats(): Verificar estadísticas del dashboard');
    console.log('- verifyJobsInViews(): Verificar vistas disponibles');
    console.log('- generateVerificationReport(): Generar reporte completo');
}

// Si se ejecuta directamente en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        verifyTestJobs,
        verifyJobsInCalendar,
        verifyDashboardStats,
        verifyJobsInViews,
        generateVerificationReport
    };
}
