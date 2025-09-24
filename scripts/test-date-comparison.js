// Script para probar la comparación de fechas en el calendario

// Simular un trabajo programado para el 22 de septiembre de 2025 a las 10:00
const jobScheduledAt = '2025-09-22T10:00:00.000Z'
const jobDate = new Date(jobScheduledAt)

// Simular la fecha seleccionada en el calendario (22 de septiembre de 2025)
const selectedDate = new Date(2025, 8, 22) // month - 1 porque Date usa 0-11

} ${jobDate.toLocaleTimeString('es-ES')}`)
}`)

// Método actual (problemático)
const jobDateString = new Date(jobScheduledAt).toISOString().split('T')[0]
const selectedDateString = selectedDate.toISOString().split('T')[0]

:')

// Método corregido
const jobDateCorrected = new Date(jobScheduledAt)
const jobYear = jobDateCorrected.getFullYear()
const jobMonth = jobDateCorrected.getMonth()
const jobDay = jobDateCorrected.getDate()

const selectedYear = selectedDate.getFullYear()
const selectedMonth = selectedDate.getMonth()
const selectedDay = selectedDate.getDate()

const datesMatch = jobYear === selectedYear && jobMonth === selectedMonth && jobDay === selectedDay

// Probar con diferentes zonas horarias

const utcDate = new Date('2025-09-22T00:00:00.000Z')
const localDate = new Date(2025, 8, 22, 0, 0, 0, 0)

.split('T')[0]}`)
.split('T')[0]}`)
.split('T')[0] === localDate.toISOString().split('T')[0]}`)
