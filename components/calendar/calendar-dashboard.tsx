"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CalendarHeader } from "./calendar-header"
import { CalendarSidebar } from "./calendar-sidebar"
import { CalendarGrid } from "./calendar-grid"
import { PatientSidebar } from "./patient-sidebar"
import { JobDetailsModal } from "./job-details-modal"
import { Button } from "@/components/ui/button"
import { Plus, Menu, X, AlertCircle, Shield, Calendar } from "lucide-react"
import type { Professional, Appointment, Patient } from "@/types/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useCalendarSync } from "@/hooks/use-calendar-sync"

export function CalendarDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  // Estados básicos
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedJob, setSelectedJob] = useState<Appointment | null>(null)
  const [selectedCenter, setSelectedCenter] = useState("Amestica")
  const [selectedTechnician, setSelectedTechnician] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("activas")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [technicians, setTechnicians] = useState<Professional[]>([])
  const [jobs, setJobs] = useState<Appointment[]>([])

  // Obtener el rol del usuario de forma segura
  const userRole = (session?.user as any)?.role?.toLowerCase() || 'admin'

  // Función para obtener datos del calendario
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch('/api/calendar/jobs')
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Mapear técnicos
        let mappedTechnicians = data.technicians?.map((tech: any) => ({
          id: tech.id,
          name: tech.name,
          avatar: tech.avatar || null,
          email: tech.email || '',
          phone: tech.phone || '',
          role: tech.role || 'tecnico',
          status: 'disponible' as const,
          timeRange: '08:00-18:00'
        })) || []

        // Para admin y secretaria, agregar columna genérica "Técnico"
        if (userRole !== "tecnico") {
          mappedTechnicians.unshift({
            id: "tecnico-generico",
            name: "Técnico",
            avatar: null,
            email: '',
            phone: '',
            role: 'tecnico',
            status: 'disponible' as const,
            timeRange: '08:00-18:00'
          })
        }

        setTechnicians(mappedTechnicians)

        // Mapear trabajos
        const mappedJobs = data.data?.map((job: any) => ({
          id: job.id,
          professionalId: job.professionalId || 'tecnico-generico',
          patientName: job.patientName || 'Sin nombre',
          startTime: job.startTime || '08:00',
          endTime: job.endTime || '09:00',
          startTimeDisplay: job.startTimeDisplay || job.startTime || '08:00',
          endTimeDisplay: job.endTimeDisplay || job.endTime || '09:00',
          type: job.type || 'Sin tipo',
          color: job.color || 'bg-gray-100 border-gray-300 text-gray-800',
          date: job.date || new Date().toISOString().split('T')[0],
          status: job.status || 'PENDING',
          priority: job.priority || 'MEDIUM',
          description: job.description || '',
          client: job.client || null,
          service: job.service || null,
          technician: job.technician || null,
          company: job.company || null,
          scheduledAt: job.scheduledAt || new Date().toISOString()
        })) || []
        
        setJobs(mappedJobs)
      } else {
        throw new Error(data.error || 'Error al obtener datos del calendario')
      }
    } catch (error) {
      console.error('Error al obtener datos del calendario:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [userRole])

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Event listeners para sincronización en tiempo real
  useEffect(() => {
    const handleNewJobCreated = (event: CustomEvent) => {
      console.log('🔄 Nuevo trabajo creado, refrescando calendario...', event.detail)
      // Pequeño delay para asegurar que la base de datos se actualice
      setTimeout(() => {
        fetchCalendarData()
      }, 500)
    }

    const handleJobUpdated = (event: CustomEvent) => {
      console.log('🔄 Trabajo actualizado, refrescando calendario...', event.detail)
      // Si es una asignación de técnico, refrescar el calendario completo
      if (event.detail?.action === 'technicianAssigned') {
        console.log('👨‍🔧 Técnico asignado, refrescando calendario completo...')
        setTimeout(() => {
          fetchCalendarData()
        }, 500)
        return
      }
      
      // Para otras actualizaciones, refrescar inmediatamente
      fetchCalendarData()
    }

    const handleJobDeleted = (event: CustomEvent) => {
      console.log('🔄 Trabajo eliminado, refrescando calendario...', event.detail)
      fetchCalendarData()
    }

    // Agregar event listeners
    window.addEventListener('newJobCreated', handleNewJobCreated as EventListener)
    window.addEventListener('jobUpdated', handleJobUpdated as EventListener)
    window.addEventListener('jobDeleted', handleJobDeleted as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('newJobCreated', handleNewJobCreated as EventListener)
      window.removeEventListener('jobUpdated', handleJobUpdated as EventListener)
      window.removeEventListener('jobDeleted', handleJobDeleted as EventListener)
    }
  }, [fetchCalendarData])

  // Funciones de manejo de eventos
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const handleTechnicianChange = useCallback((technician: string) => {
    setSelectedTechnician(technician)
  }, [])

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchCalendarData()
    toast({
      title: "Calendario actualizado",
      description: "Los datos han sido refrescados correctamente.",
    })
  }, [fetchCalendarData, toast])

  const handleJobUpdate = useCallback((updatedJob: Appointment) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    )
    setSelectedJob(null)
    toast({
      title: "Trabajo actualizado",
      description: "El trabajo ha sido actualizado correctamente.",
    })
  }, [toast])

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
  }, [])

  const handleJobSelect = useCallback((job: Appointment) => {
    setSelectedJob(job)
  }, [])

  const handleClosePopover = useCallback(() => {
    setSelectedPatient(null)
  }, [])

  const handleCloseJobModal = useCallback(() => {
    setSelectedJob(null)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // Preparar técnicos para el sidebar
  const techniciansForSidebar = technicians.map(tech => ({
    id: tech.id,
    name: tech.name
  }))

  // Mostrar estado de carga de autenticación
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Mostrar error de autenticación
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No autorizado</h2>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para ver el calendario</p>
          <Button onClick={() => router.push('/login')}>
            Ir al Login
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar error de API
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-dashboard-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="calendar-sidebar-overlay lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Menu Button */}
      <Button
        data-menu-button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Left Sidebar */}
      <div className={`
        calendar-sidebar
        ${sidebarOpen ? 'open' : ''}
        fixed lg:relative z-50 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedCenter={selectedCenter}
          onCenterChange={setSelectedCenter}
          selectedTechnician={selectedTechnician}
          onTechnicianChange={handleTechnicianChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          technicians={techniciansForSidebar}
          onClose={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="calendar-main-content">
        {/* Header */}
        <div className="calendar-header">
          <CalendarHeader
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            selectedCenter={selectedCenter}
            userRole={userRole}
            onRefresh={handleRefresh}
          />
        </div>
        
        {/* Calendar Grid */}
        <div className="calendar-grid-container">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando calendario...</p>
              </div>
            </div>
          ) : technicians.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No hay técnicos</h2>
                <p className="text-gray-600 mb-4">No se encontraron técnicos en el sistema</p>
                <Button onClick={handleRefresh} variant="outline">
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <CalendarGrid
              selectedDate={selectedDate}
              professionals={technicians}
              appointments={jobs}
              onPatientSelect={handlePatientSelect}
              onJobSelect={handleJobSelect}
            />
          )}
        </div>
      </div>
      
      {/* Patient Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
          onClick={handleClosePopover}
        >
          <div
            className="w-auto h-auto max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <PatientSidebar patient={selectedPatient} onClose={handleClosePopover} />
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      <JobDetailsModal job={selectedJob} onClose={handleCloseJobModal} onJobUpdate={handleJobUpdate} />
    </div>
  )
}