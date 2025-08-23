"use client"

import { useState, useCallback } from "react"
import { CalendarHeader } from "./calendar-header"
import { CalendarSidebar } from "./calendar-sidebar"
import { CalendarGrid } from "./calendar-grid"
import { PatientSidebar } from "./patient-sidebar"
import type { Professional, Appointment, Patient } from "@/types/calendar"

const mockProfessionals: Professional[] = [
  { id: "1", name: "Andrea Cid Venegas", avatar: "/doctor-woman.png", status: "unavailable", timeRange: "09:00 - 20:00" },
  { id: "2", name: "Cristopher Hernández", avatar: "/doctor-man.png", status: "unavailable", timeRange: "09:00 - 20:00" },
  { id: "3", name: "Diego Cabezas Cádiz", avatar: "/doctor-man-beard.png", status: "unavailable", timeRange: "09:00 - 20:00" },
  { id: "4", name: "ECOGRAFÍAS", avatar: "/diverse-medical-equipment.png", status: "unavailable", timeRange: "09:00 - 20:00" },
  { id: "5", name: "Francisca Pino Vielma", avatar: "/doctor-woman.png", status: "unavailable", timeRange: "09:00 - 20:00" },
  { id: "6", name: "Francisca Quiñinao L.", avatar: "/doctor-woman.png", status: "unavailable", timeRange: "09:00 - 15:00" },
  { id: "7", name: "Katherine Sepúlveda", avatar: "/doctor-woman.png", status: "unavailable", timeRange: "09:00 - 20:00" },
]

const mockAppointments: Appointment[] = [
  { id: "1", professionalId: "6", patientName: "ELBA BAEZA RIQUELME", startTime: "15:00", endTime: "15:30", type: "consultation", color: "bg-blue-400" },
  { id: "2", professionalId: "6", patientName: "GENOVEVA DEL", startTime: "15:30", endTime: "16:00", type: "consultation", color: "bg-purple-400" },
  { id: "3", professionalId: "6", patientName: "MARÍA VICTORIA", startTime: "16:00", endTime: "16:30", type: "consultation", color: "bg-green-400" },
]

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

export function CalendarDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 7, 18))
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedCenter, setSelectedCenter] = useState("Améstica Ltda")

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
  }, []);

  const handleClosePopover = useCallback(() => {
    setSelectedPatient(null)
  }, []);

  return (
    <div className="flex bg-background min-h-screen overflow-hidden">
      {/* Left Sidebar */}
      <CalendarSidebar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedCenter={selectedCenter}
        onCenterChange={setSelectedCenter}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scroll-smooth">
        <CalendarHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedCenter={selectedCenter}
        />
        
        <div className="w-full flex-1 overflow-x-auto relative">
          <div className="min-w-max pb-8">
            <CalendarGrid
              selectedDate={selectedDate}
              professionals={mockProfessionals}
              appointments={mockAppointments}
              onPatientSelect={handlePatientSelect}
            />
          </div>
        </div>
      </div>
      
      {/* Overlay y modal centrado */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
          onClick={handleClosePopover}
        >
          <div
            className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <PatientSidebar patient={selectedPatient} onClose={handleClosePopover} />
          </div>
        </div>
      )}
    </div>
  )
}