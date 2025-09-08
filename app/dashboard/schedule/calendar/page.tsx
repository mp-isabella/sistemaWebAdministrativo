"use client"

import { useState, useEffect, useCallback } from "react"
import "./calendar-essential.css"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Building, Wrench, Plus, Filter, RefreshCw, ChevronLeft, ArrowUp, X, Phone, Mail, MessageCircle, DollarSign, FileText } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  scheduledAt: string
  startTime: string
  endTime: string
  client: {
    name: string
    phone: string
    address: string
    email?: string
  }
  service: {
    name: string
    price?: number
  }
  company: {
    name: string
    type: string
  }
  technician?: {
    id: string
    name: string
  }
}

interface Technician {
  id: string
  name: string
  specialty?: string
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTechnician, setSelectedTechnician] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("todos")
  const [jobs, setJobs] = useState<Job[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [reassigningJob, setReassigningJob] = useState<Job | null>(null)
  const [selectedNewTechnician, setSelectedNewTechnician] = useState<string>("")
  const [isReassigning, setIsReassigning] = useState(false)

  // Generar fechas para los mini calendarios
  const currentMonth = new Date()
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)

  // Generar horarios de 8:00 a 19:00
  const timeSlots = []
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
  }

  // Función para obtener el tiempo actual en Chile
  const getCurrentTimeInChile = () => {
    return new Date().toLocaleString("en-US", {timeZone: "America/Santiago"})
  }

  // Función para obtener el horario actual en formato HH:00
  const getCurrentHourSlot = () => {
    const chileTime = new Date(getCurrentTimeInChile())
    const hour = chileTime.getHours()
    return `${hour.toString().padStart(2, '0')}:00`
  }

  // Función para verificar si un horario es el actual
  const isCurrentTimeSlot = (time: string) => {
    const currentHourSlot = getCurrentHourSlot()
    return time === currentHourSlot
  }

  // Actualizar el tiempo actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(timer)
  }, [])

  // Función para cargar trabajos desde la API
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log('🔄 Cargando trabajos para el calendario...')
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error(`Error al cargar los trabajos: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Trabajos cargados:', data.length)
      console.log('📋 Primer trabajo:', data[0])
      setJobs(data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError(error instanceof Error ? error.message : "Error al cargar los trabajos")
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para cargar técnicos desde la API
  const fetchTechnicians = useCallback(async () => {
    try {
      console.log('🔄 Cargando técnicos para el calendario...')
      const response = await fetch("/api/workers/technicians")
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Técnicos cargados:', data.length)
        console.log('👨‍🔧 Primer técnico:', data[0])
        setTechnicians(data)
      }
    } catch (error) {
      console.error("Error fetching technicians:", error)
    }
  }, [])

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchJobs()
    fetchTechnicians()
  }, [fetchJobs, fetchTechnicians])

  // Escuchar eventos de sincronización del calendario
  useEffect(() => {
    const handleNewJobCreated = (event: CustomEvent) => {
      console.log('🔄 Nuevo trabajo creado, refrescando calendario...', event.detail)
      // Pequeño delay para asegurar que la base de datos se actualice
      setTimeout(() => {
        fetchJobs()
      }, 500)
    }

    const handleJobUpdated = (event: CustomEvent) => {
      console.log('🔄 Trabajo actualizado, refrescando calendario...', event.detail)
      // Si es una asignación de técnico, refrescar el calendario completo
      if (event.detail?.action === 'technicianAssigned') {
        console.log('👨‍🔧 Técnico asignado, refrescando calendario completo...')
        setTimeout(() => {
          fetchJobs()
        }, 500)
        return
      }
      
      // Para otras actualizaciones, refrescar inmediatamente
      fetchJobs()
    }

    const handleJobDeleted = (event: CustomEvent) => {
      console.log('🔄 Trabajo eliminado, refrescando calendario...', event.detail)
      fetchJobs()
    }

    const handleJobStatusUpdated = (event: CustomEvent) => {
      console.log('🔄 Estado de trabajo actualizado, refrescando calendario...', event.detail)
      fetchJobs()
    }

    // Agregar event listeners
    window.addEventListener('newJobCreated', handleNewJobCreated as EventListener)
    window.addEventListener('jobUpdated', handleJobUpdated as EventListener)
    window.addEventListener('jobDeleted', handleJobDeleted as EventListener)
    window.addEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('newJobCreated', handleNewJobCreated as EventListener)
      window.removeEventListener('jobUpdated', handleJobUpdated as EventListener)
      window.removeEventListener('jobDeleted', handleJobDeleted as EventListener)
      window.removeEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener)
    }
  }, [fetchJobs])

  // Filtrar trabajos según los filtros seleccionados
  const filteredJobs = jobs.filter(job => {
    // Filtrar por técnico
    if (selectedTechnician !== "todos" && job.technician?.id !== selectedTechnician) {
      return false
    }
    
    // Filtrar por estado
    if (selectedStatus !== "todos" && job.status !== selectedStatus) {
      return false
    }
    
    return true
  })

  // Función para obtener trabajos filtrados por fecha
  const getFilteredJobsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return filteredJobs.filter(job => {
      const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0]
      return jobDate === dateString
    })
  }

  // Función para obtener trabajos filtrados por hora y técnico
  const getFilteredJobsForTimeAndTechnician = (time: string, technicianId: string) => {
    return filteredJobs.filter(job => {
      if (job.technician?.id !== technicianId) return false
      
      const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0]
      const selectedDateString = selectedDate.toISOString().split('T')[0]
      if (jobDate !== selectedDateString) return false
      
      // Verificar si el trabajo se solapa con el horario
      const jobStartTime = job.startTime
      const jobEndTime = job.endTime
      const slotTime = time
      
      // Validar que las propiedades de tiempo existan
      if (!jobStartTime || !jobEndTime) return false
      
      // Convertir horarios a minutos para comparación
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      const slotMinutes = timeToMinutes(slotTime)
      const jobStartMinutes = timeToMinutes(jobStartTime)
      const jobEndMinutes = timeToMinutes(jobEndTime)
      
      // Un trabajo se muestra en un slot si:
      // 1. Empieza en ese horario, o
      // 2. Se extiende sobre ese horario
      return jobStartMinutes <= slotMinutes && jobEndMinutes > slotMinutes
    })
  }

  // Log para depuración
  useEffect(() => {
    console.log('🔍 Trabajos filtrados:', filteredJobs.length)
    console.log('📊 Filtros aplicados:', { selectedTechnician, selectedStatus })
  }, [filteredJobs, selectedTechnician, selectedStatus])

  // Generar días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Agregar días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Agregar días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const lastDayOfWeek = lastDay.getDay()
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedTechnician("todos")
    setSelectedStatus("todos")
  }

  // Función para abrir el modal de detalles del trabajo
  const openJobModal = (job: Job) => {
    setSelectedJob(job)
    setShowJobModal(true)
    // Scroll suave al modal
    setTimeout(() => {
      const modal = document.querySelector('[data-modal="job-details"]')
      if (modal) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
    
    // Log para depuración
    console.log('🔍 Abriendo modal para trabajo:', job.id)
    console.log('📋 Detalles del trabajo:', job)
  }

  // Función para cerrar el modal
  const closeJobModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
    console.log('🔒 Modal cerrado')
  }

  // Función para manejar teclas de acceso rápido
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showJobModal) {
        if (event.key === 'Escape') {
          closeJobModal()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showJobModal])

  // Función para obtener el color del trabajo basado en el estado (mejorada)
  const getJobColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-500' // Cambiado a naranja como en la imagen
      case 'IN_PROGRESS':
        return 'bg-blue-500'
      case 'COMPLETED':
        return 'bg-green-500'
      case 'CANCELLED':
        return 'bg-red-500'
      default:
        return 'bg-orange-500' // Por defecto naranja
    }
  }

  // Función para obtener el color del estado del badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'IN_PROGRESS':
        return 'En Progreso'
      case 'COMPLETED':
        return 'Completado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  // Función para abrir el modal de reasignación de técnico
  const openReassignModal = (job: Job) => {
    setReassigningJob(job)
    setSelectedNewTechnician("")
    setShowReassignModal(true)
    console.log('🔄 Abriendo modal de reasignación para trabajo:', job.id)
  }

  // Función para cerrar el modal de reasignación
  const closeReassignModal = () => {
    setShowReassignModal(false)
    setReassigningJob(null)
    setSelectedNewTechnician("")
    setIsReassigning(false)
    console.log('🔒 Modal de reasignación cerrado')
  }

  // Función para reasignar un trabajo a otro técnico
  const reassignJob = async () => {
    if (!reassigningJob || !selectedNewTechnician) {
      console.error('❌ Datos insuficientes para reasignar')
      return
    }

    try {
      setIsReassigning(true)
      console.log('🔄 Reasignando trabajo:', reassigningJob.id, 'a técnico:', selectedNewTechnician)

      // Llamada a la API para reasignar el trabajo
      const response = await fetch(`/api/jobs/${reassigningJob.id}/reassign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicianId: selectedNewTechnician
        })
      })

      if (!response.ok) {
        throw new Error(`Error al reasignar: ${response.status}`)
      }

      const updatedJob = await response.json()
      console.log('✅ Trabajo reasignado exitosamente:', updatedJob)

      // Actualizar el trabajo en el estado local
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === reassigningJob.id 
            ? { ...job, technician: updatedJob.technician }
            : job
        )
      )

      // Cerrar el modal y mostrar mensaje de éxito
      closeReassignModal()
      
      // Opcional: Mostrar notificación de éxito
      // Puedes implementar un sistema de notificaciones aquí
      
    } catch (error) {
      console.error('❌ Error al reasignar trabajo:', error)
      // Opcional: Mostrar mensaje de error al usuario
    } finally {
      setIsReassigning(false)
    }
  }

  // Función para obtener trabajos de una fecha específica
  const getJobsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return filteredJobs.filter(job => {
      const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0]
      return jobDate === dateString
    })
  }

  // Función para obtener trabajos de una hora específica y técnico
  // Permite múltiples trabajos en el mismo horario (máximo 8 por técnico)
  const getJobsForTimeAndTechnician = (time: string, technicianId: string) => {
    return filteredJobs.filter(job => {
      if (job.technician?.id !== technicianId) return false
      
      const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0]
      const selectedDateString = selectedDate.toISOString().split('T')[0]
      if (jobDate !== selectedDateString) return false
      
      // Verificar si el trabajo se solapa con el horario
      const jobStartTime = job.startTime
      const jobEndTime = job.endTime
      const slotTime = time
      
      // Validar que las propiedades de tiempo existan
      if (!jobStartTime || !jobEndTime) return false
      
      // Convertir horarios a minutos para comparación
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      const slotMinutes = timeToMinutes(slotTime)
      const jobStartMinutes = timeToMinutes(jobStartTime)
      const jobEndMinutes = timeToMinutes(jobEndTime)
      
      // Un trabajo se muestra en un slot si:
      // 1. Empieza en ese horario, o
      // 2. Se extiende sobre ese horario
      return jobStartMinutes <= slotMinutes && jobEndMinutes > slotMinutes
    })
  }

  // Función para obtener el ancho de columna basado en el número de trabajos
  const getColumnWidth = (jobCount: number) => {
    if (jobCount === 0) return 'w-full'
    if (jobCount === 1) return 'w-full'
    if (jobCount === 2) return 'w-1/2'
    if (jobCount === 3) return 'w-1/3'
    if (jobCount === 4) return 'w-1/4'
    if (jobCount === 5) return 'w-1/5'
    if (jobCount === 6) return 'w-1/6'
    if (jobCount === 7) return 'w-1/7'
    if (jobCount >= 8) return 'w-1/8'
    return 'w-full'
  }

  // Función para obtener el ancho mínimo de columna para evitar que sean demasiado estrechas
  const getMinWidth = (jobCount: number) => {
    if (jobCount <= 2) return 'min-w-0'
    if (jobCount <= 4) return 'min-w-[120px]'
    if (jobCount <= 6) return 'min-w-[100px]'
    return 'min-w-[80px]'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-600">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchJobs} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar Lateral con scroll */}
      <div className="w-72 lg:w-80 bg-white border-r border-slate-200 p-3 lg:p-5 overflow-y-auto max-h-screen sticky top-0">
        
        {/* Filtros */}
        <div className="mb-8 calendar-filters">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </h3>
          
          {/* Confirmación de que solo son técnicos */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <User className="h-3 w-3 inline mr-1" />
              Todas las columnas son para técnicos
            </p>
          </div>
          
          {/* Filtro por Técnico */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Técnico:
            </label>
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger className="w-full bg-white border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Seleccionar técnico" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg">
                <SelectItem value="todos" className="hover:bg-blue-50 focus:bg-blue-50">
                  <span className="font-medium text-blue-600">👥 Todos los técnicos</span>
                </SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id} className="hover:bg-slate-50 focus:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      {tech.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Estado */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado:
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full bg-white border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg">
                <SelectItem value="todos" className="hover:bg-blue-50 focus:bg-blue-50">
                  <span className="font-medium text-blue-600">📋 Todos los estados</span>
                </SelectItem>
                <SelectItem value="PENDING" className="hover:bg-orange-50 focus:bg-orange-50">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Pendiente
                  </span>
                </SelectItem>
                <SelectItem value="IN_PROGRESS" className="hover:bg-blue-50 focus:bg-blue-50">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    En Progreso
                  </span>
                </SelectItem>
                <SelectItem value="COMPLETED" className="hover:bg-green-50 focus:bg-green-50">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Completado
                  </span>
                </SelectItem>
                <SelectItem value="CANCELLED" className="hover:bg-red-50 focus:bg-red-50">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Cancelado
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón para limpiar filtros */}
          <div className="mb-4">
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              className="w-full bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 clear-filters-btn"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>

          {/* Información de filtros activos */}
          {(selectedTechnician !== "todos" || selectedStatus !== "todos") && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 active-filters-info">
              <p className="text-xs text-blue-700 font-medium mb-2">Filtros activos:</p>
              <div className="space-y-1">
                {selectedTechnician !== "todos" && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-700">
                      Técnico: {technicians.find(t => t.id === selectedTechnician)?.name || 'N/A'}
                    </span>
                  </div>
                )}
                {selectedStatus !== "todos" && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedStatus === 'PENDING' ? 'bg-orange-500' :
                      selectedStatus === 'IN_PROGRESS' ? 'bg-blue-500' :
                      selectedStatus === 'COMPLETED' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-blue-700">
                      Estado: {getStatusText(selectedStatus)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2 jobs-counter">
                Mostrando {filteredJobs.length} de {jobs.length} trabajos
              </p>
            </div>
          )}
        </div>

        {/* Mini Calendario - Mes Actual */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatMonth(currentMonth)}
          </h3>
          
          <div className="grid grid-cols-7 gap-0.5 text-xs">
            {/* Días de la semana */}
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="p-2 text-center font-bold text-slate-500 bg-slate-50">
                {day}
              </div>
            ))}
            
            {/* Días del mes */}
            {getDaysInMonth(currentMonth).map((day, index) => {
              const dayJobs = getFilteredJobsForDate(day.date)
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`p-2 text-center cursor-pointer rounded transition-colors relative ${
                    isToday(day.date) 
                      ? 'bg-blue-500 text-white font-bold' 
                      : isSelected(day.date) 
                      ? 'bg-blue-100 text-blue-900 font-bold border-2 border-blue-500' 
                      : day.isCurrentMonth 
                      ? 'bg-white text-slate-800 hover:bg-slate-100' 
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {day.date.getDate()}
                  {dayJobs.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mini Calendario - Próximo Mes */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatMonth(nextMonth)}
          </h3>
          
          <div className="grid grid-cols-7 gap-0.5 text-xs">
            {/* Días de la semana */}
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="p-2 text-center font-bold text-slate-500 bg-slate-50">
                {day}
              </div>
            ))}
            
            {/* Días del mes */}
            {getDaysInMonth(nextMonth).map((day, index) => {
              const dayJobs = getFilteredJobsForDate(day.date)
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`p-2 text-center cursor-pointer rounded transition-colors relative ${
                    day.isCurrentMonth 
                      ? 'bg-white text-slate-800 hover:bg-slate-100' 
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {day.date.getDate()}
                  {dayJobs.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

                 {/* Información del Día Seleccionado */}
         <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
           <h4 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
             <Calendar className="h-4 w-4" />
             {selectedDate.toLocaleDateString('es-ES', { 
               weekday: 'long', 
               day: 'numeric', 
               month: 'long' 
             })}
           </h4>
           <p className="text-sm text-blue-900 mb-2">
             {getFilteredJobsForDate(selectedDate).length} trabajos programados
           </p>
           
           {/* Indicador del tiempo actual en Chile */}
           <div className="pt-2 border-t border-blue-200">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
               <span className="text-xs text-red-700 font-medium">
                 {new Date(getCurrentTimeInChile()).toLocaleTimeString('es-CL', { 
                   hour: '2-digit', 
                   minute: '2-digit',
                   timeZone: 'America/Santiago'
                 })}
               </span>
             </div>
             <p className="text-xs text-red-600 mt-1">
               Hora actual en Chile
             </p>
           </div>
         </div>

      </div>

      {/* Contenido Principal con scroll */}
      <div className="flex-1 p-3 lg:p-5 overflow-y-auto max-h-screen max-w-full">
        
        {/* Header del Calendario */}
        <div className="bg-white p-3 lg:p-5 rounded-xl mb-3 lg:mb-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
                             <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <Clock className="h-6 w-6 lg:h-8 lg:w-8" />
                 Calendario por Hora
               </h1>
              
                             {/* Mensaje informativo sobre técnicos */}
               <p className="text-xs lg:text-sm text-slate-600 mb-2 lg:mb-3 flex items-center gap-2">
                 <User className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                 <span className="hidden sm:inline">Todas las columnas representan técnicos disponibles para asignación de trabajos</span>
                 <span className="sm:hidden">Columnas = Técnicos disponibles</span>
               </p>
               
               {/* Mensaje informativo sobre múltiples trabajos */}
               <p className="text-xs lg:text-sm text-green-600 mb-2 lg:mb-3 flex items-center gap-2">
                 <Wrench className="h-3 w-3 lg:h-4 lg:w-4" />
                 <span className="hidden sm:inline">Se pueden agendar múltiples trabajos en el mismo horario (máximo 8 por técnico)</span>
                 <span className="sm:hidden">Múltiples trabajos por horario</span>
               </p>
              
                             {/* Navegación de días con flechas */}
               <div className="flex items-center gap-2 lg:gap-4 mb-2">
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => {
                     const newDate = new Date(selectedDate)
                     newDate.setDate(selectedDate.getDate() - 1)
                     setSelectedDate(newDate)
                   }}
                   className="h-7 w-7 lg:h-8 lg:w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                   aria-label="Día anterior"
                 >
                   <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                 </Button>
                 
                 <p className="text-sm lg:text-lg text-slate-600">
                   <span className="hidden sm:inline">
                     {selectedDate.toLocaleDateString('es-ES', { 
                       weekday: 'long', 
                       day: 'numeric', 
                       month: 'long', 
                       year: 'numeric' 
                     })}
                   </span>
                   <span className="sm:hidden">
                     {selectedDate.toLocaleDateString('es-ES', { 
                       day: 'numeric', 
                       month: 'short', 
                       year: 'numeric' 
                     })}
                   </span>
                 </p>
                 
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => {
                     const newDate = new Date(selectedDate)
                     newDate.setDate(selectedDate.getDate() + 1)
                     setSelectedDate(newDate)
                   }}
                   className="h-7 w-7 lg:h-8 lg:w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                   aria-label="Día siguiente"
                 >
                   <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5 rotate-180" />
                 </Button>
               </div>
            </div>
            
                         <div className="flex gap-2 lg:gap-3">
               <Link href="/dashboard/schedule">
                 <Button className="bg-blue-500 hover:bg-blue-600 text-xs lg:text-sm">
                   <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                   <span className="hidden sm:inline">Nuevo Trabajo</span>
                   <span className="sm:hidden">Nuevo</span>
                 </Button>
               </Link>
               <Button variant="outline" onClick={fetchJobs} className="text-xs lg:text-sm">
                 <RefreshCw className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                 <span className="hidden sm:inline">Actualizar</span>
                 <span className="sm:hidden">Refrescar</span>
               </Button>
             </div>
          </div>
        </div>

        {/* Calendario por Hora */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm w-full">
          
          {/* Información de técnicos disponibles y tiempo actual */}
          {technicians.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 text-center">
              <p className="text-sm text-blue-700 font-medium">
                {technicians.length} técnico{technicians.length > 1 ? 's' : ''} disponible{technicians.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                El calendario se adapta automáticamente al ancho disponible
              </p>
              {/* Indicador del tiempo actual en Chile */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-700 font-medium">
                  Tiempo actual en Chile: {new Date(getCurrentTimeInChile()).toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Santiago'
                  })}
                </span>
              </div>
            </div>
          )}
          
          {/* Contenedor del calendario sin scroll horizontal */}
          <div className="w-full overflow-x-auto calendar-scroll">
            {/* Header de Columnas */}
            <div className="calendar-grid bg-slate-50 border-b-2 border-slate-200 w-full relative">
              {/* Línea roja vertical del tiempo actual en el header */}
              {timeSlots.some(time => isCurrentTimeSlot(time)) && (
                <div className="absolute left-0 top-0 w-1 h-full bg-red-500 z-10 animate-pulse shadow-lg"></div>
              )}
              
              <div className="calendar-time-column p-2 lg:p-4 border-r-2 border-slate-200 font-bold text-slate-700 text-center bg-slate-50">
                <span className="hidden sm:inline">Hora</span>
                <span className="sm:hidden">H</span>
              </div>
              {technicians.map(tech => (
                <div key={tech.id} className="calendar-technician-column p-2 lg:p-4 border-r border-slate-200 font-bold text-slate-700 text-center bg-slate-100">
                  <div className="font-bold mb-1 flex items-center justify-center gap-1 lg:gap-2">
                    <User className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                    <span className="text-xs lg:text-sm truncate">{tech.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 bg-blue-50 px-1 lg:px-2 py-0.5 lg:py-1 rounded-full">
                    <span className="hidden sm:inline">Técnico</span>
                    <span className="sm:hidden">Téc</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje informativo si no hay técnicos */}
            {technicians.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <User className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">No hay técnicos disponibles</p>
                <p className="text-sm">Contacta al administrador para agregar técnicos al sistema</p>
              </div>
            )}

            {/* Filas de Horarios - Solo mostrar si hay técnicos */}
            {technicians.length > 0 && timeSlots.map(time => (
              <div key={time} className={`calendar-grid border-b border-slate-200 w-full relative ${
                isCurrentTimeSlot(time) ? 'bg-red-50 border-red-300' : ''
              }`}>
                {/* Línea roja del tiempo actual */}
                {isCurrentTimeSlot(time) && (
                  <div className="calendar-current-time-line"></div>
                )}
                {/* Columna de Hora */}
                <div className="calendar-time-column p-2 lg:p-4 border-r-2 border-slate-200 bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-sm lg:text-base relative">
                  {time}
                  {/* Indicador del tiempo actual */}
                  {isCurrentTimeSlot(time) && (
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg border-2 border-white z-20"></div>
                  )}
                </div>
                
                {/* Línea roja vertical en toda la fila del tiempo actual */}
                {isCurrentTimeSlot(time) && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-red-500 z-10 animate-pulse shadow-lg"></div>
                )}
                
                {/* Columnas de Técnicos */}
                {technicians.map(tech => {
                  const timeJobs = getFilteredJobsForTimeAndTechnician(time, tech.id)
                  const maxJobs = Math.min(timeJobs.length, 8) // Máximo 8 trabajos
                  
                  return (
                    <div key={tech.id} className={`calendar-technician-column p-2 border-r border-slate-200 ${
                      timeJobs.length > 0 ? 'bg-blue-50' : 'bg-white'
                    } relative`}>
                      
                      {/* Contenedor de trabajos con grid adaptativo */}
                      <div className={`grid gap-1 h-full ${
                        maxJobs === 1 ? 'grid-cols-1' :
                        maxJobs === 2 ? 'grid-cols-2' :
                        maxJobs === 3 ? 'grid-cols-3' :
                        maxJobs === 4 ? 'grid-cols-2 grid-rows-2' :
                        maxJobs === 5 ? 'grid-cols-3 grid-rows-2' :
                        maxJobs === 6 ? 'grid-cols-3 grid-rows-2' :
                        maxJobs === 7 ? 'grid-cols-4 grid-rows-2' :
                        'grid-cols-4 grid-rows-2'
                      }`}>
                        {timeJobs.slice(0, maxJobs).map((job, index) => (
                          job && job.id ? (
                          <div 
                            key={job.id} 
                            className="w-full cursor-pointer transform transition-all duration-200 hover:scale-105 hover:z-10 relative group"
                            onClick={() => openJobModal(job)}
                            title="Haz clic para ver detalles"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                openJobModal(job)
                              }
                            }}
                          >
                            <div className={`${getJobColor(job.status)} text-white p-1.5 sm:p-2 rounded-md text-xs font-medium h-full flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-200 relative overflow-hidden`}>
                              {/* Overlay de hover */}
                              <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 pointer-events-none"></div>
                              <div>
                                <div className="font-bold mb-1 flex items-center gap-1 truncate">
                                  <User className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate text-xs lg:text-sm">{job.client?.name || 'Cliente no especificado'}</span>
                                </div>
                                <div className="mb-1 flex items-center gap-1">
                                  <Building className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate text-xs font-medium">
                                    <span className="hidden sm:inline">
                                      {job.company?.name || 'Empresa no especificada'} - {job.service?.name || 'Servicio no especificado'}
                                    </span>
                                    <span className="sm:hidden">
                                      {job.service?.name || 'Servicio'}
                                    </span>
                                  </span>
                                </div>
                                <div className="mb-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs font-medium">
                                    <span className="hidden sm:inline">
                                      {job.startTime || 'Hora no especificada'} - {job.endTime || 'Hora no especificada'}
                                    </span>
                                    <span className="sm:hidden">
                                      {job.startTime || 'Hora'} - {job.endTime || 'Hora'}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wrench className="h-3 w-3 flex-shrink-0" />
                                  <div className={`inline-flex items-center px-1 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium ${
                                    job.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    <span className="hidden sm:inline">{getStatusText(job.status)}</span>
                                    <span className="sm:hidden">
                                      {job.status === 'PENDING' ? 'Pend' :
                                       job.status === 'IN_PROGRESS' ? 'Prog' :
                                       job.status === 'COMPLETED' ? 'Comp' : 'Canc'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Información del técnico asignado */}
                              {job.technician && (
                                <div className="mt-1 pt-1 border-t border-white border-opacity-20 flex items-center gap-1">
                                  <User className="h-3 w-3 text-blue-200 flex-shrink-0" />
                                  <span className="text-xs text-blue-200 truncate font-medium">
                                    <span className="hidden sm:inline">{job.technician.name}</span>
                                    <span className="sm:hidden">
                                      {job.technician.name.split(' ')[0]}
                                    </span>
                                  </span>
                                </div>
                              )}
                              
                              {/* Indicador de clic */}
                              <div className="mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full mx-auto"></div>
                              </div>
                              
                              {/* Indicador de prioridad */}
                              {job.priority === 'URGENT' && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                          ) : null
                        ))}
                        
                          {/* Indicador si hay más de 8 trabajos */}
                          {timeJobs.length > 8 && (
                            <div className="w-full text-center mt-1">
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 cursor-help" title={`Hay ${timeJobs.length} trabajos en total. Solo se muestran los primeros 8.`}>
                                +{timeJobs.length - 8} más
                              </Badge>
                            </div>
                          )}
                          

                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal de Detalles del Trabajo */}
      {showJobModal && selectedJob && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeJobModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onClick={(e) => e.stopPropagation()}
            data-modal="job-details"
          >
            {/* Header del Modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 underline">
                  {selectedJob.client?.name || 'Cliente no especificado'}
                </h3>
                <button
                  onClick={closeJobModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">
              {/* Tipo de servicio */}
              <div className="text-gray-700">
                <p className="font-medium">{selectedJob.service?.name || 'Servicio no especificado'}</p>
                {selectedJob.description && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    &quot;{selectedJob.description}&quot;
                  </p>
                )}
              </div>
              
              {/* Fecha */}
              <div className="text-gray-700">
                <p>{new Date(selectedJob.scheduledAt).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}</p>
              </div>
              
              {/* Empresa */}
              {selectedJob.company?.name && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {selectedJob.company.name} - {selectedJob.company.type}
                  </span>
                </div>
              )}
              
              {/* Horario */}
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {selectedJob.startTime || 'Hora no especificada'} - {selectedJob.endTime || 'Hora no especificada'}
                </span>
              </div>
              
              {/* Técnico asignado */}
              {selectedJob.technician && (
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs">🔒</span>
                  </div>
                  <span>Se atenderá con: {selectedJob.technician.name}</span>
                </div>
              )}
              
              {/* Teléfono */}
              {selectedJob.client?.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>{selectedJob.client.phone}</span>
                  <a 
                    href={`https://wa.me/${selectedJob.client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Hablar por Whatsapp
                  </a>
                </div>
              )}
              
              {/* Email */}
              {selectedJob.client?.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{selectedJob.client.email}</span>
                </div>
              )}
              
              {/* Dirección */}
              {selectedJob.client?.address && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Building className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{selectedJob.client.address}</span>
                </div>
              )}
              
              {/* Precio del servicio */}
              {selectedJob.service?.price && (
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    Precio: ${selectedJob.service.price.toLocaleString('es-CL')}
                  </span>
                </div>
              )}
              
              {/* Estado y Prioridad */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">{getStatusText(selectedJob.status)}</span>
                
                {/* Indicadores de categoría/prioridad */}
                <div className="flex gap-1 ml-auto">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                </div>
              </div>
              
              {/* Prioridad */}
              {selectedJob.priority && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-sm font-medium">Prioridad:</span>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      selectedJob.priority === 'URGENT' ? 'bg-red-100 text-red-800 border-red-300' :
                      selectedJob.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                      selectedJob.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-green-100 text-green-800 border-green-300'
                    }`}
                  >
                    {selectedJob.priority === 'URGENT' ? 'Urgente' :
                     selectedJob.priority === 'HIGH' ? 'Alta' :
                     selectedJob.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Botones de Acción */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              {/* Botón para asignar otro técnico */}
              <button 
                className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                onClick={() => openReassignModal(selectedJob)}
              >
                <Wrench className="h-4 w-4" />
                Asignar otro técnico
              </button>
              
              {/* Botones existentes en una fila */}
              <div className="flex gap-3">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  onClick={() => {
                    // Aquí puedes agregar la lógica para ver el pago
                    console.log('Ver pago del trabajo:', selectedJob.id)
                  }}
                >
                  <DollarSign className="h-4 w-4" />
                  Ver pago
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  onClick={() => {
                    // Aquí puedes agregar la lógica para ver la ficha
                    console.log('Ver ficha del trabajo:', selectedJob.id)
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Reasignación de Técnico */}
      {showReassignModal && reassigningJob && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeReassignModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Reasignar Técnico
                </h3>
                <button
                  onClick={closeReassignModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Trabajo: {reassigningJob.service?.name} - {reassigningJob.client?.name}
              </p>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">
              {/* Técnico actual */}
              {reassigningJob.technician && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">Técnico actual:</p>
                  <p className="text-blue-900">{reassigningJob.technician.name}</p>
                </div>
              )}
              
              {/* Selector de nuevo técnico */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Seleccionar nuevo técnico:
                </label>
                <select
                  value={selectedNewTechnician}
                  onChange={(e) => setSelectedNewTechnician(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isReassigning}
                >
                  <option value="">Selecciona un técnico...</option>
                  {technicians
                    .filter(tech => tech.id !== reassigningJob.technician?.id)
                    .map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} {tech.specialty ? `(${tech.specialty})` : ''}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              {/* Información adicional */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {new Date(reassigningJob.scheduledAt).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Horario:</strong> {reassigningJob.startTime} - {reassigningJob.endTime}
                </p>
              </div>
            </div>
            
            {/* Botones de Acción */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors font-medium"
                onClick={closeReassignModal}
                disabled={isReassigning}
              >
                Cancelar
              </button>
              <button 
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={reassignJob}
                disabled={!selectedNewTechnician || isReassigning}
              >
                {isReassigning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                    Reasignando...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 inline mr-2" />
                    Reasignar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Botón flotante "Volver arriba" */}
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        title="Volver arriba"
        aria-label="Volver arriba"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}
