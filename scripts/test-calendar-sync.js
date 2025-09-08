// Script para probar la sincronización del calendario con nuevos trabajos
console.log('🧪 Probando sincronización del calendario...\n');

// Simular la creación de un trabajo
function simulateJobCreation() {
  console.log('1️⃣ Simulando creación de trabajo...');
  
  const newJob = {
    id: 'test-job-' + Date.now(),
    title: 'Trabajo de Prueba',
    description: 'Trabajo creado para probar sincronización',
    clientId: 'cmesy6gqv0001uky4yu5l0d8d',
    serviceId: 'cmesy6gqv0001uky4yu5l0d8e',
    technicianId: 'cmesya2o00001uk5wx4wnn09m', // Marta Barrera
    scheduledAt: new Date('2025-08-29T14:00:00Z').toISOString(),
    startTime: '14:00',
    endTime: '15:00',
    priority: 'MEDIUM'
  };
  
  console.log('📋 Datos del trabajo:', newJob);
  return newJob;
}

// Simular el disparo del evento
function simulateEventDispatch() {
  console.log('\n2️⃣ Simulando disparo de evento...');
  
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('newJobCreated', {
      detail: simulateJobCreation()
    });
    
    window.dispatchEvent(event);
    console.log('✅ Evento newJobCreated disparado');
  } else {
    console.log('❌ window no disponible (entorno Node.js)');
  }
}

// Simular la respuesta del calendario
function simulateCalendarResponse() {
  console.log('\n3️⃣ Simulando respuesta del calendario...');
  
  const mockCalendarData = {
    selectedDate: '2025-08-29',
    technicians: [
      {
        id: "cmesya2o00001uk5wx4wnn09m",
        name: "Marta Barrera"
      }
    ],
    jobs: [
      {
        id: 'test-job-' + Date.now(),
        professionalId: "cmesya2o00001uk5wx4wnn09m",
        patientName: "Cliente de Prueba",
        startTime: "14:00",
        endTime: "15:00",
        type: "Servicio técnico",
        date: "2025-08-29"
      }
    ]
  };
  
  console.log('📅 Datos del calendario actualizados:', mockCalendarData);
  return mockCalendarData;
}

// Función principal de prueba
function runTest() {
  console.log('🚀 Iniciando prueba de sincronización...\n');
  
  // Simular creación de trabajo
  const newJob = simulateJobCreation();
  
  // Simular disparo de evento
  simulateEventDispatch();
  
  // Simular respuesta del calendario
  const calendarData = simulateCalendarResponse();
  
  console.log('\n✅ Prueba completada');
  console.log('\n📝 Para probar en el navegador:');
  console.log('   1. Abre el calendario en http://localhost:3000/dashboard/schedule/calendar');
  console.log('   2. Abre otra pestaña con la agenda en http://localhost:3000/dashboard/schedule');
  console.log('   3. Crea un nuevo trabajo en la agenda');
  console.log('   4. Verifica que aparece inmediatamente en el calendario');
  console.log('   5. Revisa la consola del navegador para ver los eventos');
}

// Ejecutar la prueba
runTest();
