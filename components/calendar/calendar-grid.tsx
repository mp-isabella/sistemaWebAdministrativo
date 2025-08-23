"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Professional, Appointment, Patient } from "@/types/calendar"
import { DollarSign } from "lucide-react"

interface CalendarGridProps {
  selectedDate: Date
  professionals: Professional[]
  appointments: Appointment[]
  onPatientSelect: (patient: Patient) => void
}

const timeSlots = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`)

const mockPatient: Patient = {
  id: "1",
  name: "ELIZABETH DEL PILAR LOYOLA",
  appointmentType: "Consulta Matrona",
  price: "$20.000",
  date: "Lunes 18 de agosto",
  time: "12:00 a 12:30 hrs",
  attendedBy: "María Isabel Sandoval",
  phone: "+56933745946",
  email: "elizabeth.loyola2904@gmail.com",
  id_number: "19.294.498-8",
  notes: "Sin información",
}

export function CalendarGrid({ selectedDate, professionals, appointments, onPatientSelect }: CalendarGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const getAppointmentsForProfessional = (professionalId: string) => {
    return appointments.filter((apt) => apt.professionalId === professionalId)
  }

  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)
    
    const startTotalMinutes = (startHour - 9) * 60 + startMinute
    const endTotalMinutes = (endHour - 9) * 60 + endMinute
    const duration = endTotalMinutes - startTotalMinutes

    const slotHeightMinutes = 60
    const slotHeightPx = 64

    const top = (startTotalMinutes / slotHeightMinutes) * slotHeightPx
    const height = (duration / slotHeightMinutes) * slotHeightPx

    return { top: `${top}px`, height: `${height}px` }
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    if (selectedDate.getDate() !== now.getDate() ||
        selectedDate.getMonth() !== now.getMonth() ||
        selectedDate.getFullYear() !== now.getFullYear()) {
          return null
    }

    if (hours < 9 || hours > 19) return null

    const totalMinutes = (hours - 9) * 60 + minutes
    const totalSlotsMinutes = 11 * 60
    const percentage = (totalMinutes / totalSlotsMinutes) * 100

    return Math.min(Math.max(percentage, 0), 100)
  }

  const currentTimePosition = getCurrentTimePosition()

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="min-w-max">
        {/* Header with professional info */}
        <div className="flex">
          {/* Time column header */}
          <div className="w-20 flex-shrink-0 sticky top-0 z-20 bg-white border-b border-r border-gray-200" />

          {/* Professional columns header */}
          {professionals.map((professional) => (
            <div key={professional.id} className="w-40 flex-shrink-0 sticky top-0 z-20 bg-white border-b border-r border-gray-200 p-4 text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarImage src={professional.avatar || "/placeholder.svg"} alt={professional.name} />
                <AvatarFallback>
                  {professional.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-sm text-gray-900 mb-1">{professional.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {professional.status === 'available' ? 'Disponible' : 'No disponible'}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">{professional.timeRange}</p>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="relative">
          <div className="flex">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 sticky left-0 z-10 bg-gray-50 border-r border-gray-200">
              {timeSlots.map((time) => (
                <div key={time} className="h-16 border-b border-gray-200 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">{time}</span>
                </div>
              ))}
            </div>

            {/* Professional columns with appointments and current time indicator */}
            <div className="flex-1 relative">
              {/* Current time indicator */}
              {currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ top: `${currentTimePosition}%` }}
                  aria-hidden="true"
                >
                  <div className="absolute -left-2 -top-1 w-4 h-2 bg-red-500 rounded-full" />
                </div>
              )}
              <div className="grid grid-cols-7 min-h-full">
                {professionals.map((professional) => (
                  <div key={professional.id} className="relative border-r border-gray-200">
                    {/* Background grid lines */}
                    {timeSlots.map((time, index) => (
                      <div
                        key={`${professional.id}-${time}`}
                        className="h-16 border-b border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                      />
                    ))}

                    {/* Appointments */}
                    {getAppointmentsForProfessional(professional.id).map((appointment) => {
                      const { top, height } = getAppointmentPosition(appointment.startTime, appointment.endTime)
                      
                      return (
                        <div
                          key={appointment.id}
                          className={`absolute left-1 right-1 rounded px-2 py-1 text-white shadow-sm cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-md ${appointment.color}`}
                          style={{ top, height }}
                          onClick={() => onPatientSelect(mockPatient)}
                        >
                          <div className="text-xs font-semibold truncate">{appointment.patientName}</div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}