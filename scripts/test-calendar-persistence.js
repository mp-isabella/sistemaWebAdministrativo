// Script para probar la persistencia del calendario
console.log('🧪 Probando persistencia del calendario...\n');

// Función para simular el guardado de estado
function saveCalendarState(date, filters = {}) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('calendar-selected-date', date.toISOString())
    localStorage.setItem('calendar-technician-filter', filters.technician || 'todos')
    localStorage.setItem('calendar-status-filter', filters.status || 'activas')
    localStorage.setItem('calendar-search-query', filters.search || '')
    console.log('✅ Estado guardado en localStorage')
  } else {
    console.log('❌ localStorage no disponible (entorno Node.js)')
  }
}

// Función para simular la carga de estado
function loadCalendarState() {
  if (typeof window !== 'undefined') {
    const savedDate = localStorage.getItem('calendar-selected-date')
    const savedTechnician = localStorage.getItem('calendar-technician-filter')
    const savedStatus = localStorage.getItem('calendar-status-filter')
    const savedSearch = localStorage.getItem('calendar-search-query')
    
    console.log('📅 Estado cargado desde localStorage:')
    console.log(`   Fecha: ${savedDate ? new Date(savedDate).toLocaleDateString('es-CL') : 'No guardada'}`)
    console.log(`   Técnico: ${savedTechnician || 'No guardado'}`)
    console.log(`   Estado: ${savedStatus || 'No guardado'}`)
    console.log(`   Búsqueda: ${savedSearch || 'No guardada'}`)
    
    return {
      date: savedDate ? new Date(savedDate) : new Date(),
      technician: savedTechnician || 'todos',
      status: savedStatus || 'activas',
      search: savedSearch || ''
    }
  } else {
    console.log('❌ localStorage no disponible (entorno Node.js)')
    return {
      date: new Date(),
      technician: 'todos',
      status: 'activas',
      search: ''
    }
  }
}

// Función para limpiar el estado
function clearCalendarState() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('calendar-selected-date')
    localStorage.removeItem('calendar-technician-filter')
    localStorage.removeItem('calendar-status-filter')
    localStorage.removeItem('calendar-search-query')
    console.log('🗑️ Estado del calendario limpiado')
  } else {
    console.log('❌ localStorage no disponible (entorno Node.js)')
  }
}

// Simular diferentes escenarios
console.log('1️⃣ Simulando guardado de estado...')
const testDate = new Date('2025-08-27')
const testFilters = {
  technician: 'Marta Barrera',
  status: 'pendientes',
  search: 'Amestica'
}

saveCalendarState(testDate, testFilters)

console.log('\n2️⃣ Simulando carga de estado...')
const loadedState = loadCalendarState()

console.log('\n3️⃣ Verificando que los datos se mantienen...')
console.log(`   Fecha original: ${testDate.toLocaleDateString('es-CL')}`)
console.log(`   Fecha cargada: ${loadedState.date.toLocaleDateString('es-CL')}`)
console.log(`   Filtros originales: ${JSON.stringify(testFilters)}`)
console.log(`   Filtros cargados: ${JSON.stringify({
  technician: loadedState.technician,
  status: loadedState.status,
  search: loadedState.search
})}`)

console.log('\n4️⃣ Simulando limpieza de estado...')
clearCalendarState()

console.log('\n5️⃣ Verificando que el estado se limpió...')
const clearedState = loadCalendarState()
console.log(`   Estado después de limpiar: ${JSON.stringify(clearedState)}`)

console.log('\n✅ Prueba de persistencia completada')
console.log('\n📝 Para probar en el navegador:')
console.log('   1. Abre el calendario en http://localhost:3000/dashboard/schedule/calendar')
console.log('   2. Navega a una fecha diferente')
console.log('   3. Cambia algunos filtros')
console.log('   4. Recarga la página (F5)')
console.log('   5. Verifica que la fecha y filtros se mantienen')
