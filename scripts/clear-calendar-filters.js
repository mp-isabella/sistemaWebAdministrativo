// Script para limpiar el localStorage del calendario
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando filtros del calendario...')

// Limpiar todos los filtros guardados
localStorage.removeItem('calendar-selected-date')
localStorage.removeItem('calendar-technician-filter')
localStorage.removeItem('calendar-status-filter')
localStorage.removeItem('calendar-search-query')

console.log('✅ Filtros limpiados exitosamente')
console.log('🔄 Recargando página...')

// Recargar la página para aplicar los cambios
window.location.reload()
