async function testWorkersAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('🧪 Probando API de Workers...\n');

  try {
    // 1. Probar obtener roles
    console.log('1. Probando GET /api/roles...');
    const rolesResponse = await fetch(`${baseURL}/roles`);
    if (rolesResponse.ok) {
      const roles = await rolesResponse.json();
      console.log('✅ Roles cargados exitosamente:', roles.length, 'roles encontrados');
      console.log('Roles:', roles.map(r => r.name));
    } else {
      console.log('❌ Error al cargar roles:', rolesResponse.status);
    }

    // 2. Probar obtener workers
    console.log('\n2. Probando GET /api/workers...');
    const workersResponse = await fetch(`${baseURL}/workers`);
    if (workersResponse.ok) {
      const workers = await workersResponse.json();
      console.log('✅ Workers cargados exitosamente:', workers.length, 'workers encontrados');
      if (workers.length > 0) {
        console.log('Primer worker:', {
          id: workers[0].id,
          name: workers[0].name,
          email: workers[0].email,
          role: workers[0].role?.name
        });
      }
    } else {
      console.log('❌ Error al cargar workers:', workersResponse.status);
    }

    // 3. Si hay workers, probar actualizar uno
    if (workersResponse.ok) {
      const workers = await workersResponse.json();
      if (workers.length > 0) {
        const workerToUpdate = workers[0];
        console.log('\n3. Probando PUT /api/workers/[id]...');
        console.log('Actualizando worker:', workerToUpdate.name);
        
        const updateData = {
          name: workerToUpdate.name,
          email: workerToUpdate.email,
          phone: workerToUpdate.phone || '555123456',
          roleId: workerToUpdate.role?.id,
          status: 'active'
        };

        const updateResponse = await fetch(`${baseURL}/workers/${workerToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          const updatedWorker = await updateResponse.json();
          console.log('✅ Worker actualizado exitosamente');
          console.log('Datos actualizados:', {
            name: updatedWorker.name,
            email: updatedWorker.email,
            role: updatedWorker.role?.name
          });
        } else {
          const error = await updateResponse.json();
          console.log('❌ Error al actualizar worker:', updateResponse.status, error);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testWorkersAPI();
