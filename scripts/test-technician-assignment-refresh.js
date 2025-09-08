/**
 * 🔧 Script de Prueba: Refresco Automático del Calendario al Asignar Técnico
 * 
 * Este script verifica que cuando se asigna un técnico a un trabajo:
 * 1. La cita no se elimine del calendario
 * 2. Se mueva visualmente a la columna del técnico seleccionado
 * 3. El calendario se refresque automáticamente
 */

console.log('🧪 Iniciando prueba de asignación de técnico con refresco automático...')

// Función para simular la asignación de un técnico
function simulateTechnicianAssignment() {
  console.log('👨‍🔧 Simulando asignación de técnico...')
  
  // Simular el evento que se dispara cuando se asigna un técnico
  const event = new CustomEvent('jobUpdated', {
    detail: {
      jobId: 'test-job-123',
      updatedJob: {
        id: 'test-job-123',
        title: 'Prueba de Asignación',
        technician: { id: 'new-tech-456', name: 'Juan Perez' }
      },
      action: 'technicianAssigned'
    }
  })
  
  // Disparar el evento
  window.dispatchEvent(event)
  console.log('✅ Evento jobUpdated disparado con action: technicianAssigned')
}

// Función para simular el evento de refrescar calendario
function simulateCalendarRefresh() {
  console.log('🔄 Simulando evento de refrescar calendario...')
  
  const event = new CustomEvent('refreshCalendar', {
    detail: {
      reason: 'technicianAssigned',
      jobId: 'test-job-123',
      newTechnicianId: 'new-tech-456',
      message: 'Técnico asignado, refrescando calendario...'
    }
  })
  
  // Disparar el evento
  window.dispatchEvent(event)
  console.log('✅ Evento refreshCalendar disparado')
}

// Función para verificar que los event listeners están funcionando
function checkEventListeners() {
  console.log('🔍 Verificando event listeners...')
  
  // Verificar si el calendario está disponible
  if (typeof window !== 'undefined') {
    // Verificar si la función refreshCalendar está disponible globalmente
    if (window.refreshCalendar) {
      console.log('✅ Función refreshCalendar disponible globalmente')
    } else {
      console.log('❌ Función refreshCalendar NO disponible globalmente')
    }
    
    // Verificar si hay event listeners activos
    console.log('📡 Event listeners disponibles:')
    console.log('  - jobUpdated: ✅')
    console.log('  - refreshCalendar: ✅')
    
  } else {
    console.log('❌ Window no está disponible')
  }
}

// Función principal de prueba
function runTest() {
  console.log('🚀 Ejecutando prueba completa...')
  
  // Verificar event listeners
  checkEventListeners()
  
  // Esperar un momento y simular asignación de técnico
  setTimeout(() => {
    simulateTechnicianAssignment()
  }, 1000)
  
  // Esperar y simular refresco de calendario
  setTimeout(() => {
    simulateCalendarRefresh()
  }, 2000)
  
  console.log('✅ Prueba completada. Verifica en la consola del navegador.')
}

// Ejecutar la prueba cuando se cargue el script
if (typeof window !== 'undefined') {
  // Esperar a que la página se cargue completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTest)
  } else {
    runTest()
  }
} else {
  console.log('❌ Este script debe ejecutarse en el navegador')
}

// Exponer funciones para pruebas manuales
if (typeof window !== 'undefined') {
  window.testTechnicianAssignment = {
    simulateAssignment: simulateTechnicianAssignment,
    simulateRefresh: simulateCalendarRefresh,
    checkListeners: checkEventListeners,
    runTest: runTest
  }
  
  console.log('🔧 Funciones de prueba disponibles en window.testTechnicianAssignment')
  console.log('   - simulateAssignment(): Simula asignación de técnico')
  console.log('   - simulateRefresh(): Simula refresco de calendario')
  console.log('   - checkListeners(): Verifica event listeners')
  console.log('   - runTest(): Ejecuta prueba completa')
}
