#!/usr/bin/env node

async function testJobCreation() {
    console.log('🧪 Probando creación de trabajo...\n');

    try {
        // Datos de prueba usando IDs reales de la base de datos
        const testJobData = {
            title: "Detección de fugas de agua",
            description: "Servicio de detección de fugas de agua en domicilio",
            clientId: "cmfy79qpl000euk5wm9pnit3z", // Juan Pérez
            serviceName: "Detección de fugas de agua",
            companyId: "company-amestica-001", // AMESTICA LTDA
            technicianId: "cmfy79qok0006uk5waapniiee", // Secretaria (técnico)
            scheduledAt: new Date().toISOString(),
            startTime: "09:00",
            endTime: "11:00",
            priority: "MEDIUM",
            totalBudget: 50000
        };

        console.log('📋 Datos del trabajo a crear:');
        console.log(JSON.stringify(testJobData, null, 2));

        const response = await fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testJobData)
        });

        console.log(`\n📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        console.log('📄 Contenido de la respuesta:');
        console.log(responseText);

        if (response.ok) {
            console.log('\n✅ ¡Trabajo creado exitosamente!');
        } else {
            console.log('\n❌ Error al crear el trabajo');
            try {
                const errorData = JSON.parse(responseText);
                console.log('🔍 Detalles del error:');
                console.log(JSON.stringify(errorData, null, 2));
            } catch (e) {
                console.log('⚠️ No se pudo parsear la respuesta como JSON');
            }
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testJobCreation();
