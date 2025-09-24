"use client"

import { useCalendarOptimization } from "@/hooks/use-calendar-optimization"
import type { Appointment, Professional } from "@/types/calendar"
import { useEffect, useState } from "react"

interface CalendarGridProps {
  professionals: Professional[]
  appointments: Appointment[]
  onJobSelect: (job: Appointment) => void
}

// Tipo para la posición de las citas
interface AppointmentPosition {
  top: number
  height: number
  left?: string
  width?: string
  zIndex?: number
}


export function CalendarGrid({ professionals, appointments, onJobSelect }: CalendarGridProps) {
  const [, setCurrentTime] = useState(new Date())

  // Hook de optimización del calendario
  const {
    timeConfig,
    getTechnicianColumnWidth,
    calculateAppointmentPosition
  } = useCalendarOptimization({ professionalsCount: professionals.length })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Actualizar cada segundo para tiempo real
    return () => clearInterval(timer)
  }, [])

  const getAppointmentsForProfessional = (professionalId: string) => {
    return appointments.filter((apt) => (apt as any).professionalId === professionalId)
  }

  // Función para agrupar trabajos por horario
  const groupAppointmentsByTimeSlot = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {}

    appointments.forEach(appointment => {
      if (!appointment.startTime || !appointment.endTime) return

      // Crear clave única para el horario
      const timeKey = `${appointment.startTime}-${appointment.endTime}`

      if (!grouped[timeKey]) {
        grouped[timeKey] = []
      }

      grouped[timeKey].push(appointment)
    })

    return grouped
  }

  // Función para obtener el estilo de posicionamiento para múltiples trabajos
  const getMultiJobPosition = (appointments: Appointment[], index: number, total: number): AppointmentPosition | null => {
    if (total === 1) {
      const firstAppointment = appointments[0]
      if (!firstAppointment) return null
      return calculateAppointmentPosition(firstAppointment.startTime, firstAppointment.endTime)
    }

    const firstAppointment = appointments[0]
    if (!firstAppointment) return null

    const basePosition = calculateAppointmentPosition(firstAppointment.startTime, firstAppointment.endTime)
    if (!basePosition) return null

    // Calcular ancho y posición para múltiples trabajos
    const maxWidth = getTechnicianColumnWidth() - 8 // Ancho dinámico menos padding
    const jobWidth = Math.min(maxWidth / total, Math.max(80, maxWidth / 3)) // Ancho adaptativo
    const leftOffset = (index * jobWidth) % maxWidth

    return {
      ...basePosition,
      left: `${leftOffset}px`,
      width: `${jobWidth}px`
    }
  }

  // Calcular posición de la línea de tiempo actual en Chile
  const getCurrentTimePosition = () => {
    const now = new Date()
    // Ajustar a zona horaria de Chile (UTC-3)
    const chileTime = new Date(now.getTime() - (3 * 60 * 60 * 1000))
    const hours = chileTime.getHours()
    const minutes = chileTime.getMinutes()

    // Calcular posición basada en el horario de trabajo (8:00 - 20:00)
    const startHour = timeConfig.startHour
    const endHour = timeConfig.endHour

    if (hours < startHour || hours >= endHour) return null

    const hourPosition = (hours - startHour) * timeConfig.slotHeight
    const minuteOffset = (minutes / 60) * timeConfig.slotHeight

    return hourPosition + minuteOffset
  }

  const currentTimePosition = getCurrentTimePosition()


  return (
    <div className="w-full h-full bg-white overflow-hidden">
      <div className="w-full h-full">
        {/* Calendar Grid Header */}
        <div className="flex border-b-2 border-gray-300 bg-gray-100 sticky top-0 z-30">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 border-r-2 border-gray-300 bg-gray-100 px-3 py-2 text-center">
            <span className="font-medium text-gray-700">Horario</span>
          </div>

          {/* Professional columns header */}
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="border-r-2 border-gray-300 bg-gray-100 px-3 py-2 text-center flex-shrink-0 w-50"
            >
              <div className="font-bold mb-1">{professional.name}</div>
              <div className="text-xs text-gray-500">Técnico</div>
            </div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div className="flex relative m-0 p-0 gap-0">
          {/* Time column */}
          <div className="w-16 flex-shrink-0 border-r-2 border-gray-300 bg-gray-50">
            {timeConfig.timeSlots.map((time: string) => (
              <div
                key={time}
                className="px-3 py-1 text-xs text-gray-700 border-b-2 border-gray-200 flex items-center justify-center bg-gray-50"
                style={{ height: `${timeConfig.slotHeight}px` }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Professional columns */}
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="flex-shrink-0 border-r-2 border-gray-300 bg-white relative w-50"
            >
              {/* Grid lines for each time slot */}
              {timeConfig.timeSlots.map((time: string, timeIndex: number) => (
                <div
                  key={`grid-${professional.id}-${time}`}
                  className="absolute left-0 right-0 border-b border-gray-200"
                  style={{
                    top: `${timeIndex * timeConfig.slotHeight}px`,
                    height: '1px'
                  }}
                />
              ))}

              {/* Empty time slots for visual consistency */}
              {timeConfig.timeSlots.map((time: string, timeIndex: number) => (
                <div
                  key={`empty-${professional.id}-${time}`}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${timeIndex * timeConfig.slotHeight}px`,
                    height: `${timeConfig.slotHeight}px`
                  }}
                />
              ))}

              {/* Appointments for this professional */}
              {(() => {
                const professionalAppointments = getAppointmentsForProfessional(professional.id)
                const groupedAppointments = groupAppointmentsByTimeSlot(professionalAppointments)

                return Object.entries(groupedAppointments).map(([, appointments]) => {
                  if (appointments.length === 0) return null

                  return appointments.map((appointment, index) => {
                    const position = getMultiJobPosition(appointments, index, appointments.length)
                    if (!position) return null


                    // Determinar clases CSS basadas en el estado del trabajo
                    const getJobCardClasses = (status: string | undefined, isUnassigned: boolean) => {
                      if (isUnassigned) {
                        return "absolute rounded-lg p-2 text-xs font-medium cursor-pointer hover:scale-105 transition-all bg-orange-100 text-orange-800 border-2 border-dashed border-orange-400 shadow-lg"
                      }

                      switch (status?.toUpperCase()) {
                        case "PENDING":
                          return "absolute rounded-lg p-2 text-xs font-medium cursor-pointer hover:scale-105 transition-all bg-yellow-100 text-yellow-800 shadow-md"
                        case "IN_PROGRESS":
                          return "absolute rounded-lg p-2 text-xs font-medium cursor-pointer hover:scale-105 transition-all bg-blue-100 text-blue-800 shadow-md"
                        case "COMPLETED":
                          return "absolute rounded-lg p-2 text-xs font-medium cursor-pointer hover:scale-105 transition-all bg-green-100 text-green-800 shadow-md"
                        case "CANCELLED":
                          return "absolute rounded-lg p-2 text-xs font-medium cursor-pointer hover:scale-105 transition-all bg-red-100 text-red-800 shadow-md"
                        default:
                          return "absolute rounded-lg p-2 text-xs font-medium cursor-pointer hover:scale-105 transition-all bg-gray-100 text-gray-800 shadow-md"
                      }
                    }

                    // Estilo especial para trabajos sin técnico asignado
                    const isUnassigned = (appointment as any).professionalId === "tecnico-generico"
                    const cardClasses = getJobCardClasses(appointment.status, isUnassigned)

                    // Mostrar indicador de múltiples trabajos si hay más de uno
                    const showMultiIndicator = appointments.length > 1

                    return (
                      <div
                        key={appointment.id}
                        className={`${cardClasses} calendar-appointment`}
                        style={{
                          top: `${position.top}px`,
                          left: `${position.left || 4}px`,
                          width: position.width ? `${position.width}px` : 'auto',
                          height: `${position.height}px`,
                          zIndex: position.zIndex || 20,
                          minHeight: '48px',
                          overflow: 'hidden'
                        }}
                        onClick={() => onJobSelect(appointment)}
                        title={isUnassigned ? "Trabajo sin técnico asignado - Hacer clic para asignar" : "Hacer clic para ver detalles"}
                      >
                        <div className="font-medium truncate">
                          {isUnassigned && (
                            <span className="text-orange-600">⚠️</span>
                          )}
                          {showMultiIndicator && (
                            <span className="text-xs bg-blue-600 text-white px-1 rounded-full">
                              {appointments.length}
                            </span>
                          )}
                          {appointment.patientName}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          {appointment.company && appointment.company.name ? appointment.company.name : "Sin empresa"} - {appointment.type}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {appointment.startTimeDisplay || appointment.startTime} - {appointment.endTimeDisplay || appointment.endTime}
                        </div>
                        {isUnassigned && (
                          <div className="text-xs text-orange-700 font-bold mt-1">
                            ⚠️ Sin asignar
                          </div>
                        )}
                      </div>
                    )
                  })
                }).flat()
              })()}
            </div>
          ))}
        </div>

        {/* Línea de tiempo actual en Chile */}
        {currentTimePosition && (
          <div
            className="absolute left-16 right-0 z-10 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="w-full h-0.5 bg-red-500 opacity-80 shadow-lg">
              <div className="absolute -left-2 -top-1 w-4 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}