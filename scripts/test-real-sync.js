// Script para probar la sincronización real del calendario
console.log('🧪 Probando sincronización real del calendario...\n');

// Simular un trabajo real que se crearía desde el formulario
const mockRealJob = {
  id: 'test-real-job-' + Date.now(),
  title: 'Reparación de Fuga Urgente',
  description: 'Fuga en tubería principal del baño',
  clientId: 'cmesy6gqv0001uky4yu5l0d8d',
  serviceId: 'cmesy6gqv0001uky4yu5l0d8e',
  technicianId: 'cmesya2o00001uk5wx4wnn09m', // Marta Barrera
  scheduledAt: new Date('2025-08-29T14:00:00Z').toISOString(),
  startTime: '14:00',
  endTime: '15:00',
  priority: 'HIGH',
  status: 'PENDING',
  client: {
    id: 'cmesy6gqv0001uky4yu5l0d8d',
    name: 'María González',
    phone: '+56912345678',
    address: 'Av. Providencia 123, Santiago'
  },
  service: {
    id: 'cmesy6gqv0001uky4yu5l0d8e',
    name: 'Reparación de Fuga',
    price: 45000
  },
  technician: {
    id: 'cmesya2o00001uk5wx4wnn09m',
    name: 'Marta Barrera'
  }
};

console.log('📋 Trabajo simulado:', mockRealJob);

// Simular el evento que se dispararía cuando se crea un trabajo
function simulateJobCreationEvent() {
  console.log('\n🎯 Simulando evento de creación de trabajo...');
  
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('newJobCreated', {
      detail: mockRealJob
    });
    
    window.dispatchEvent(event);
    console.log('✅ Evento newJobCreated disparado con datos reales');
    
    // Verificar que el evento se disparó correctamente
    setTimeout(() => {
      console.log('🔍 Verificando que el evento se procesó...');
      console.log('📅 El trabajo debería aparecer en el calendario para el 29 de agosto de 2025');
      console.log('👨‍🔧 Asignado a: Marta Barrera');
      console.log('⏰ Horario: 14:00 - 15:00');
    }, 1000);
    
  } else {
    console.log('❌ window no disponible (entorno Node.js)');
    console.log('💡 Para probar en el navegador:');
    console.log('   1. Abre la consola del navegador');
    console.log('   2. Copia y pega este código:');
    console.log('   const event = new CustomEvent("newJobCreated", {');
    console.log('     detail: ' + JSON.stringify(mockRealJob, null, 2));
    console.log('   });');
    console.log('   window.dispatchEvent(event);');
  }
}

// Función para verificar el estado del calendario
function checkCalendarState() {
  console.log('\n📊 Verificando estado del calendario...');
  
  if (typeof window !== 'undefined') {
    // Intentar acceder al estado del calendario si está disponible
    const calendarElement = document.querySelector('[data-calendar]');
    if (calendarElement) {
      console.log('✅ Elemento del calendario encontrado');
    } else {
      console.log('⚠️ Elemento del calendario no encontrado');
    }
  }
}

// Función principal
function runRealTest() {
  console.log('🚀 Iniciando prueba de sincronización real...\n');
  
  // Simular creación de trabajo
  simulateJobCreationEvent();
  
  // Verificar estado
  setTimeout(checkCalendarState, 2000);
  
  console.log('\n📝 Instrucciones para probar manualmente:');
  console.log('   1. Abre el calendario en: http://localhost:3000/dashboard/schedule/calendar');
  console.log('   2. Abre la consola del navegador (F12)');
  console.log('   3. Ve a la agenda en: http://localhost:3000/dashboard/schedule');
  console.log('   4. Crea un nuevo trabajo con técnico asignado');
  console.log('   5. Regresa al calendario y verifica que aparece');
  console.log('   6. Revisa la consola para ver los logs de sincronización');
}

// Ejecutar la prueba
runRealTest();
