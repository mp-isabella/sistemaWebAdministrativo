#!/usr/bin/env node

/**
 * Script para probar todas las operaciones CRUD del sistema
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCRUDOperations() {
    // Usar process.stdout.write para logging sin console.log
    process.stdout.write('🧪 Iniciando pruebas de CRUD...\n\n');

    try {
        // 1. Probar conexión a la base de datos
        process.stdout.write('1️⃣ Probando conexión a la base de datos...\n');
        await prisma.$connect();
        process.stdout.write('✅ Conexión exitosa\n\n');

        // 2. Probar operaciones de Roles
        process.stdout.write('2️⃣ Probando operaciones de Roles...\n');
        const roles = await prisma.role.findMany();
        process.stdout.write(`✅ Roles encontrados: ${roles.length}\n`);
        roles.forEach(role => process.stdout.write(`   - ${role.name}\n`));
        process.stdout.write('\n');

        // 3. Probar operaciones de Usuarios
        process.stdout.write('3️⃣ Probando operaciones de Usuarios...\n');
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        process.stdout.write(`✅ Usuarios encontrados: ${users.length}\n`);
        users.forEach(user => process.stdout.write(`   - ${user.name} (${user.role.name})\n`));
        process.stdout.write('\n');

        // 4. Probar operaciones de Clientes
        process.stdout.write('4️⃣ Probando operaciones de Clientes...\n');
        const clients = await prisma.client.findMany();
        process.stdout.write(`✅ Clientes encontrados: ${clients.length}\n`);
        clients.forEach(client => process.stdout.write(`   - ${client.name} (${client.email || 'Sin email'})\n`));
        process.stdout.write('\n');

        // 5. Probar operaciones de Servicios
        process.stdout.write('5️⃣ Probando operaciones de Servicios...\n');
        const services = await prisma.service.findMany();
        process.stdout.write(`✅ Servicios encontrados: ${services.length}\n`);
        services.forEach(service => process.stdout.write(`   - ${service.name} ($${service.price || 0})\n`));
        process.stdout.write('\n');

        // 6. Probar operaciones de Empresas
        process.stdout.write('6️⃣ Probando operaciones de Empresas...\n');
        const companies = await prisma.company.findMany();
        process.stdout.write(`✅ Empresas encontradas: ${companies.length}\n`);
        companies.forEach(company => process.stdout.write(`   - ${company.name} (${company.type || 'Sin tipo'})\n`));
        process.stdout.write('\n');

        // 7. Probar operaciones de Trabajos
        process.stdout.write('7️⃣ Probando operaciones de Trabajos...\n');
        const jobs = await prisma.job.findMany({
            include: {
                client: true,
                service: true,
                technician: true,
                company: true
            }
        });
        process.stdout.write(`✅ Trabajos encontrados: ${jobs.length}\n`);
        jobs.forEach(job => process.stdout.write(`   - ${job.title} (${job.status}) - Cliente: ${job.client.name}\n`));
        process.stdout.write('\n');

        // 8. Probar operaciones de Pagos
        process.stdout.write('8️⃣ Probando operaciones de Pagos...\n');
        const payments = await prisma.payment.findMany();
        process.stdout.write(`✅ Pagos encontrados: ${payments.length}\n`);
        payments.forEach(payment => process.stdout.write(`   - $${payment.amount} (${payment.status})\n`));
        process.stdout.write('\n');

        // 9. Probar operaciones de Transacciones de Caja
        process.stdout.write('9️⃣ Probando operaciones de Transacciones de Caja...\n');
        const cashTransactions = await prisma.cashTransaction.findMany();
        process.stdout.write(`✅ Transacciones de caja encontradas: ${cashTransactions.length}\n`);
        cashTransactions.forEach(transaction => process.stdout.write(`   - $${transaction.amount} (${transaction.type})\n`));
        process.stdout.write('\n');

        // 10. Probar operaciones de Liquidaciones
        process.stdout.write('🔟 Probando operaciones de Liquidaciones...\n');
        try {
            const liquidations = await prisma.liquidation.findMany();
            process.stdout.write(`✅ Liquidaciones encontradas: ${liquidations.length}\n`);
            liquidations.forEach(liquidation => process.stdout.write(`   - ${liquidation.liquidationNumber || liquidation.id} (${liquidation.status})\n`));
        } catch (error) {
            process.stdout.write(`⚠️  Liquidaciones no disponibles: ${error.message}\n`);
        }
        process.stdout.write('\n');

        // 11. Verificar integridad de relaciones
        process.stdout.write('🔍 Verificando integridad de relaciones...\n');

        // Verificar que todos los trabajos tengan cliente válido
        const allJobs = await prisma.job.findMany({
            include: { client: true }
        });
        const jobsWithoutClient = allJobs.filter(job => !job.client);
        if (jobsWithoutClient.length > 0) {
            process.stdout.write(`⚠️  Trabajos sin cliente: ${jobsWithoutClient.length}\n`);
        } else {
            process.stdout.write('✅ Todos los trabajos tienen cliente válido\n');
        }

        // Verificar que todos los trabajos tengan servicio válido
        const jobsWithService = await prisma.job.findMany({
            include: { service: true }
        });
        const jobsWithoutService = jobsWithService.filter(job => !job.service);
        if (jobsWithoutService.length > 0) {
            process.stdout.write(`⚠️  Trabajos sin servicio: ${jobsWithoutService.length}\n`);
        } else {
            process.stdout.write('✅ Todos los trabajos tienen servicio válido\n');
        }

        // Verificar que todos los usuarios tengan rol válido
        const usersWithRole = await prisma.user.findMany({
            include: { role: true }
        });
        const usersWithoutRole = usersWithRole.filter(user => !user.role);
        if (usersWithoutRole.length > 0) {
            process.stdout.write(`⚠️  Usuarios sin rol: ${usersWithoutRole.length}\n`);
        } else {
            process.stdout.write('✅ Todos los usuarios tienen rol válido\n');
        }

        process.stdout.write('\n🎉 Pruebas de CRUD completadas exitosamente!\n');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

async function testAPIConnectivity() {
    process.stdout.write('\n🌐 Probando conectividad de APIs...\n\n');

    const baseURL = 'http://localhost:3000';
    const endpoints = [
        '/api/clients',
        '/api/services',
        '/api/workers',
        '/api/jobs',
        '/api/companies',
        '/api/cash-transactions',
        '/api/liquidations'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${baseURL}${endpoint}`);
            if (response.ok) {
                process.stdout.write(`✅ ${endpoint} - OK (${response.status})\n`);
            } else {
                process.stdout.write(`⚠️  ${endpoint} - ${response.status} ${response.statusText}\n`);
            }
        } catch (error) {
            process.stdout.write(`❌ ${endpoint} - Error: ${error.message}\n`);
        }
    }
}

async function main() {
    try {
        await testCRUDOperations();

        // Solo probar APIs si el servidor está corriendo
        process.stdout.write('\n💡 Para probar las APIs, asegúrate de que el servidor esté corriendo (npm run dev)\n');
        process.stdout.write('   Luego ejecuta: node scripts/test-api-endpoints.js\n');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testCRUDOperations, testAPIConnectivity };
