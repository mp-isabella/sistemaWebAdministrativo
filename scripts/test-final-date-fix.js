// Script final para probar que las correcciones de fechas funcionen correctamente

// Simular un trabajo programado para el 22 de septiembre de 2025
const jobScheduledAt = '2025-09-22T10:00:00.000Z'
const job = { scheduledAt: jobScheduledAt }

// Simular la fecha seleccionada en el calendario (22 de septiembre de 2025)
const selectedDate = new Date(2025, 8, 22) // month - 1 porque Date usa 0-11

}`)

// Método anterior (problemático)
:')
const oldJobDate = new Date(job.scheduledAt).toISOString().split('T')[0]
const oldSelectedDate = selectedDate.toISOString().split('T')[0]
const oldMatch = oldJobDate === oldSelectedDate

// Método nuevo (corregido)
:')
const jobDate = new Date(job.scheduledAt)
const jobYear = jobDate.getFullYear()
const jobMonth = jobDate.getMonth()
const jobDay = jobDate.getDate()

const selectedYear = selectedDate.getFullYear()
const selectedMonth = selectedDate.getMonth()
const selectedDay = selectedDate.getDate()

const newMatch = jobYear === selectedYear && jobMonth === selectedMonth && jobDay === selectedDay

// Probar con diferentes escenarios

// Escenario 1: Trabajo a las 00:00 UTC (puede aparecer en día anterior en zona horaria local)
const jobMidnight = '2025-09-22T00:00:00.000Z'
const jobMidnightDate = new Date(jobMidnight)
const jobMidnightYear = jobMidnightDate.getFullYear()
const jobMidnightMonth = jobMidnightDate.getMonth()
const jobMidnightDay = jobMidnightDate.getDate()

// Escenario 2: Trabajo a las 23:59 UTC (puede aparecer en día siguiente en zona horaria local)
const jobLate = '2025-09-22T23:59:00.000Z'
const jobLateDate = new Date(jobLate)
const jobLateYear = jobLateDate.getFullYear()
const jobLateMonth = jobLateDate.getMonth()
const jobLateDay = jobLateDate.getDate()

