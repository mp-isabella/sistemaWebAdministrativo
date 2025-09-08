const BASE_URL = 'http://localhost:3000/api';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    console.log(`✅ ${method} ${endpoint}:`, response.status, result);
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de APIs del formulario de trabajo...\n');

  // Test 1: Obtener clientes
  console.log('1. Probando API de clientes...');
  await testAPI('/clients');

  // Test 2: Obtener servicios
  console.log('\n2. Probando API de servicios...');
  await testAPI('/services');

  // Test 3: Obtener técnicos
  console.log('\n3. Probando API de técnicos...');
  await testAPI('/workers?role=TECNICO');

  // Test 4: Obtener trabajos
  console.log('\n4. Probando API de trabajos...');
  await testAPI('/jobs');

  // Test 5: Crear un trabajo de prueba
  console.log('\n5. Probando creación de trabajo...');
  const testJob = {
    title: 'Trabajo de prueba',
    description: 'Descripción de prueba',
    clientId: 'test-client-id',
    serviceId: 'test-service-id',
    technicianId: null,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
    priority: 'MEDIUM'
  };
  
  const createResult = await testAPI('/jobs', 'POST', testJob);
  
  if (createResult.success && createResult.data.id) {
    const jobId = createResult.data.id;
    
    // Test 6: Obtener trabajo específico
    console.log('\n6. Probando obtención de trabajo específico...');
    await testAPI(`/jobs/${jobId}`);

    // Test 7: Actualizar trabajo
    console.log('\n7. Probando actualización de trabajo...');
    const updateData = {
      title: 'Trabajo actualizado',
      description: 'Descripción actualizada',
      clientId: 'test-client-id',
      serviceId: 'test-service-id',
      technicianId: null,
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // En 2 días
      priority: 'HIGH'
    };
    await testAPI(`/jobs/${jobId}`, 'PUT', updateData);

    // Test 8: Eliminar trabajo
    console.log('\n8. Probando eliminación de trabajo...');
    await testAPI(`/jobs/${jobId}`, 'DELETE');
  }

  console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar las pruebas
runTests().catch(console.error);
