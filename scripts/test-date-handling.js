// Script para probar el manejo de fechas y verificar que no haya problemas de zona horaria

// Simular la creación de una fecha como lo hace el formulario
function testDateCreation() {

  // Simular selección de fecha 22 de septiembre de 2025
  const inputValue = '2025-09-22'
  const [year, month, day] = inputValue.split('-').map(Number)
  
  // Método anterior (problemático)
  const oldMethod = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00`)
  
  // Método nuevo (corregido)
  const newMethod = new Date(year, month - 1, day, 0, 0, 0, 0)

  } (${oldMethod.toLocaleDateString('es-ES')})`)
  } (${newMethod.toLocaleDateString('es-ES')})`)
   - newMethod.getTime()) / (1000 * 60 * 60)} horas\n`)
}

// Simular la combinación de fecha con hora
function testDateTimeCombination() {

  // Fecha base: 22 de septiembre de 2025
  const baseDate = new Date(2025, 8, 22, 0, 0, 0, 0) // month - 1 porque Date usa 0-11
  const startTime = '10:00'
  const [hours, minutes] = startTime.split(':').map(Number)
  
  // Método anterior (problemático)
  const oldCombined = new Date(baseDate)
  oldCombined.setHours(hours, minutes, 0, 0)
  
  // Método nuevo (corregido)
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const day = baseDate.getDate()
  const newCombined = new Date(year, month, day, hours, minutes, 0, 0)
  
  }`)
  
  } (${oldCombined.toLocaleDateString('es-ES')} ${oldCombined.toLocaleTimeString('es-ES')})`)
  } (${newCombined.toLocaleDateString('es-ES')} ${newCombined.toLocaleTimeString('es-ES')})`)
   - newCombined.getTime()) / (1000 * 60 * 60)} horas\n`)
}

// Simular la inicialización de fecha desde la base de datos
function testDateInitialization() {

  // Simular fecha de la base de datos (ISO string)
  const dbDate = '2025-09-22T10:00:00.000Z'
  const jobDate = new Date(dbDate)
  
  // Método anterior (problemático)
  const year = jobDate.getFullYear()
  const month = (jobDate.getMonth() + 1).toString().padStart(2, '0')
  const day = jobDate.getDate().toString().padStart(2, '0')
  const oldMethod = new Date(`${year}-${month}-${day}T00:00:00`)
  
  // Método nuevo (corregido)
  const newMethod = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate(), 0, 0, 0, 0)

  } (${oldMethod.toLocaleDateString('es-ES')})`)
  } (${newMethod.toLocaleDateString('es-ES')})`)
   - newMethod.getTime()) / (1000 * 60 * 60)} horas\n`)
}

// Ejecutar todas las pruebas
testDateCreation()
testDateTimeCombination()
testDateInitialization()

