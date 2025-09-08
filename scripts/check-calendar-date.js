console.log('📅 Verificando fechas del calendario...\n')

// Fecha actual
const today = new Date()
console.log('📅 Fecha actual:', today.toLocaleDateString('es-CL'))
console.log('📅 Fecha actual (ISO):', today.toISOString().split('T')[0])

// Fecha del trabajo (26 de agosto de 2025)
const jobDate = new Date('2025-08-26')
console.log('📅 Fecha del trabajo:', jobDate.toLocaleDateString('es-CL'))
console.log('📅 Fecha del trabajo (ISO):', jobDate.toISOString().split('T')[0])

// Verificar si son la misma fecha
const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate())

console.log('\n🔍 Comparación de fechas:')
console.log('   Fecha actual (solo fecha):', todayOnly.toLocaleDateString('es-CL'))
console.log('   Fecha del trabajo (solo fecha):', jobDateOnly.toLocaleDateString('es-CL'))
console.log('   ¿Son iguales?:', todayOnly.getTime() === jobDateOnly.getTime() ? '✅ SÍ' : '❌ NO')

// Verificar si el trabajo está en el rango de 30 días
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(today.getDate() - 30)
const thirtyDaysFromNow = new Date()
thirtyDaysFromNow.setDate(today.getDate() + 30)

console.log('\n📊 Rango del calendario:')
console.log('   Desde:', thirtyDaysAgo.toLocaleDateString('es-CL'))
console.log('   Hasta:', thirtyDaysFromNow.toLocaleDateString('es-CL'))
console.log('   ¿El trabajo está en el rango?:', 
  jobDate >= thirtyDaysAgo && jobDate <= thirtyDaysFromNow ? '✅ SÍ' : '❌ NO')

// Simular el filtrado que hace el calendario
console.log('\n🎯 Simulación del filtrado del calendario:')
const selectedDate = today // El calendario usa la fecha actual por defecto
const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())

console.log('   Fecha seleccionada en el calendario:', selectedDateOnly.toLocaleDateString('es-CL'))
console.log('   Fecha del trabajo:', jobDateOnly.toLocaleDateString('es-CL'))
console.log('   ¿El trabajo aparecería?:', 
  selectedDateOnly.getTime() === jobDateOnly.getTime() ? '✅ SÍ' : '❌ NO')

if (selectedDateOnly.getTime() !== jobDateOnly.getTime()) {
  console.log('\n💡 SOLUCIÓN:')
  console.log('   El calendario está mostrando la fecha actual, pero el trabajo es del 26 de agosto de 2025.')
  console.log('   Necesitas navegar al 26 de agosto en el calendario para ver el trabajo.')
  console.log('   O cambiar la fecha del trabajo a la fecha actual.')
}
