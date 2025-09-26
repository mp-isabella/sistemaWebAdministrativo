#!/usr/bin/env node

/**
 * Script para probar los endpoints de API del sistema
 */

const baseURL = 'http://localhost:3000';

async function testEndpoint(method, endpoint, data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${baseURL}${endpoint}`, options);
        const result = await response.text();

        let parsedResult;
        try {
            parsedResult = JSON.parse(result);
        } catch {
            parsedResult = result;
        }

        return {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            data: parsedResult
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function testAllEndpoints() {
    console.log('🧪 Probando endpoints de API...\n');

    const tests = [
        {
            name: 'GET /api/clients',
            method: 'GET',
            endpoint: '/api/clients'
        },
        {
            name: 'GET /api/services',
            method: 'GET',
            endpoint: '/api/services'
        },
        {
            name: 'GET /api/workers',
            method: 'GET',
            endpoint: '/api/workers'
        },
        {
            name: 'GET /api/jobs',
            method: 'GET',
            endpoint: '/api/jobs'
        },
        {
            name: 'GET /api/companies',
            method: 'GET',
            endpoint: '/api/companies'
        },
        {
            name: 'GET /api/cash-transactions',
            method: 'GET',
            endpoint: '/api/cash-transactions'
        },
        {
            name: 'GET /api/liquidations',
            method: 'GET',
            endpoint: '/api/liquidations'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        console.log(`🔍 ${test.name}...`);

        const result = await testEndpoint(test.method, test.endpoint);

        if (result.success) {
            console.log(`✅ ${test.name} - OK (${result.status})`);
            if (Array.isArray(result.data)) {
                console.log(`   📊 Datos encontrados: ${result.data.length}`);
            }
            passed++;
        } else {
            console.log(`❌ ${test.name} - ${result.status} ${result.statusText || result.error}`);
            if (result.data && result.data.error) {
                console.log(`   💬 Error: ${result.data.error}`);
            }
            failed++;
        }
        console.log('');
    }

    console.log('📊 Resumen de pruebas:');
    console.log(`✅ Exitosas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`📈 Total: ${passed + failed}`);

    if (failed === 0) {
        console.log('\n🎉 ¡Todas las pruebas pasaron!');
    } else {
        console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
    }
}

async function testCRUDOperations() {
    console.log('\n🔧 Probando operaciones CRUD...\n');

    // Nota: Estas pruebas requieren autenticación
    // En un entorno real, necesitarías tokens de autenticación válidos

    console.log('💡 Para probar operaciones CRUD completas:');
    console.log('   1. Inicia sesión en la aplicación web');
    console.log('   2. Usa las herramientas de desarrollador del navegador');
    console.log('   3. Ejecuta las operaciones desde la interfaz');
    console.log('   4. Verifica que los datos se guarden correctamente');
}

async function main() {
    try {
        await testAllEndpoints();
        await testCRUDOperations();
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testAllEndpoints, testCRUDOperations };
