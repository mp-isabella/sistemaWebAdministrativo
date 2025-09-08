"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  X, 
  Phone, 
  Mail, 
  MessageCircle, 
  DollarSign, 
  FileText, 
  Lock,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Play,
  Pause,
  CheckSquare,
  Building,
  ExternalLink,
  Users,
  Edit
} from "lucide-react"
import type { Appointment } from "@/types/calendar"
import { useToast } from "@/hooks/use-toast"

interface JobDetailsModalProps {
  job: Appointment | null
  onClose: () => void
  onJobUpdate?: (updatedJob: Appointment) => void
}

export function JobDetailsModal({ job, onClose, onJobUpdate }: JobDetailsModalProps) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTechnicianModal, setShowTechnicianModal] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState<string>("")
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false)
  const [isAssigningTechnician, setIsAssigningTechnician] = useState(false)
  const [newDate, setNewDate] = useState<string>("")
  const [newStartTime, setNewStartTime] = useState<string>("")
  const [newEndTime, setNewEndTime] = useState<string>("")
  const [isQuoteLoading, setIsQuoteLoading] = useState(false)
  const [jobQuote, setJobQuote] = useState<any>(null)
  
  // Log del estado inicial
  console.log('🔧 Estado inicial del modal:', { 
    selectedTechnician, 
    newDate, 
    newStartTime, 
    newEndTime, 
    isAssigningTechnician, 
    isLoadingTechnicians,
    showTechnicianModal 
  })
  
  // Verificar permisos del usuario
  const userRole = (session?.user as any)?.role?.toLowerCase() || ""
  const canAssignTechnician = ["admin", "secretaria"].includes(userRole)      
  const isTechnician = userRole === "tecnico"
  const isCurrentTechnician = job?.technician?.id === (session?.user as any)?.id
  
  if (!job) return null

  const handleUpdateStatus = async (newStatus: string) => {
    // Verificar permisos para cambiar estado
    if (isTechnician && !isCurrentTechnician) {
      toast({
        title: "Sin Permisos",
        description: "Solo puedes cambiar el estado de tus trabajos asignados.",
        variant: "destructive"
      })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Estado Actualizado",
          description: `El trabajo ha sido marcado como ${getStatusText(newStatus)}.`,
        })
        // Actualizar el trabajo en el modal si se proporciona la función
        if (onJobUpdate && result.job) {
          const updatedJob = {
            ...job,
            status: newStatus
          }
          onJobUpdate(updatedJob)
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Error al actualizar el estado del trabajo.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating job status:", error)
      toast({
        title: "Error",
        description: "Error de conexión al actualizar el estado.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }
    return date.toLocaleDateString('es-ES', options)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Reservado"
      case "IN_PROGRESS":
        return "En Progreso"
      case "COMPLETED":
        return "Completado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  const loadTechnicians = async () => {
    console.log('🔧 Cargando técnicos...')
    setIsLoadingTechnicians(true)
    try {
      const response = await fetch("/api/workers")
      const data = await response.json()
      
      console.log('🔧 Respuesta de técnicos:', { status: response.status, data })
      
      if (response.ok) {
        const activeTechnicians = data.workers?.filter((w: any) => 
          w.isActive && (w.role?.name === 'TECNICO' || w.role?.name === 'tecnico')
        ) || []
        console.log('🔧 Técnicos activos encontrados:', activeTechnicians)
        setTechnicians(activeTechnicians)
        
        // Establecer el técnico actual si existe
        if (job.technician?.id) {
          console.log('🔧 Estableciendo técnico actual:', job.technician.id)
          setSelectedTechnician(job.technician.id)
        }
      } else {
        console.log('🔧 Error al cargar técnicos:', data)
        toast({
          title: "Error",
          description: "Error al cargar técnicos",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading technicians:", error)
      toast({
        title: "Error",
        description: "Error de conexión al cargar técnicos",
        variant: "destructive"
      })
    } finally {
      setIsLoadingTechnicians(false)
      console.log('🔧 Carga de técnicos completada')
    }
  }

  const handleAssignTechnician = async () => {
    console.log('🔧 Iniciando cambio de técnico...', { selectedTechnician, job })
    console.log('🔧 Estado del botón:', { selectedTechnician, isAssigningTechnician, disabled: !selectedTechnician || isAssigningTechnician })
    
    if (!selectedTechnician) {
      toast({
        title: "Error",
        description: "Debe seleccionar un técnico",
        variant: "destructive"
      })
      return
    }

    setIsAssigningTechnician(true)
    try {
      // SOLUCIÓN: Solo enviar el técnico, NO modificar fecha/hora
      const updateData: any = {
        technicianId: selectedTechnician
      }

      // IMPORTANTE: NO incluir fecha ni horarios a menos que el usuario los modifique EXPLÍCITAMENTE
      // Esto evita que se envíen fechas inválidas como "31-12-1969"
      
      // Solo incluir fecha si el usuario la modificó y es válida
      if (newDate && newDate.trim() !== "") {
        try {
          const testDate = new Date(newDate)
          if (!isNaN(testDate.getTime())) {
            // Solo incluir si es diferente a la fecha actual del trabajo
            const currentJobDate = job.scheduledAt || job.date
            if (currentJobDate) {
              const currentDate = new Date(currentJobDate)
              const newDateObj = new Date(newDate)
              if (currentDate.toDateString() !== newDateObj.toDateString()) {
                updateData.scheduledAt = newDate
                console.log('🔧 Fecha modificada:', newDate)
              }
            }
          }
        } catch (error) {
          console.log('🔧 Fecha inválida, no se incluye:', newDate)
        }
      }

      // Solo incluir horarios si el usuario los modificó y son válidos
      if (newStartTime && newStartTime.trim() !== "" && newStartTime !== job.startTime) {
        updateData.startTime = newStartTime
        console.log('🔧 Hora de inicio modificada:', newStartTime)
      }
      if (newEndTime && newEndTime.trim() !== "" && newEndTime !== job.endTime) {
        updateData.endTime = newEndTime
        console.log('🔧 Hora de fin modificada:', newEndTime)
      }

      // Validación final: asegurar que no se envíen fechas inválidas
      if (updateData.scheduledAt) {
        try {
          const testDate = new Date(updateData.scheduledAt)
          if (isNaN(testDate.getTime()) || testDate.getFullYear() <= 1970) {
            console.log('🔧 Fecha inválida detectada, removiendo del updateData:', updateData.scheduledAt)
            delete updateData.scheduledAt
          }
        } catch (error) {
          console.log('🔧 Error validando fecha, removiendo del updateData:', updateData.scheduledAt)
          delete updateData.scheduledAt
        }
      }

      console.log('🔧 Enviando actualización a la API:', { jobId: job.id, updateData })
      
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })

      console.log('🔧 Respuesta de la API:', { status: response.status, ok: response.ok })

      if (response.ok) {
        const result = await response.json()
        console.log('🔧 Resultado de la API:', result)
        
        toast({
          title: "Técnico Asignado",
          description: "El técnico ha sido asignado exitosamente al trabajo.",
        })
        
        // Actualizar el trabajo en el modal
        if (onJobUpdate && result) {
          const updatedJob = {
            ...job,
            technician: result.technician,
            // MANTENER fecha y hora originales a menos que se hayan modificado explícitamente
            date: job.scheduledAt || job.date, // Mantener la fecha original
            startTime: job.startTime, // Mantener la hora original
            endTime: job.endTime, // Mantener la hora original
            startTimeDisplay: job.startTimeDisplay, // Mantener la hora original
            endTimeDisplay: job.endTimeDisplay // Mantener la hora original
          }
          onJobUpdate(updatedJob)
        }
        
        // 🔄 DISPARAR EVENTO PARA REFRESCAR EL CALENDARIO COMPLETO
        // Esto permitirá que la cita se mueva visualmente al técnico seleccionado
        if (typeof window !== 'undefined') {
          console.log('🔄 Disparando eventos para refrescar calendario...')
          
          // Evento para refrescar el calendario completo
          const refreshEvent = new CustomEvent('refreshCalendar', {
            detail: {
              reason: 'technicianAssigned',
              jobId: job.id,
              newTechnicianId: selectedTechnician,
              message: 'Técnico asignado, refrescando calendario...'
            }
          })
          window.dispatchEvent(refreshEvent)
          console.log('🔄 Evento refreshCalendar disparado:', refreshEvent)
          
          // Evento para notificar que se actualizó un trabajo
          const jobUpdatedEvent = new CustomEvent('jobUpdated', {
            detail: {
              jobId: job.id,
              updatedJob: result,
              action: 'technicianAssigned'
            }
          })
          window.dispatchEvent(jobUpdatedEvent)
          console.log('🔄 Evento jobUpdated disparado:', jobUpdatedEvent)
          
          console.log('🔄 Eventos disparados para refrescar calendario después de asignar técnico')
        }
        
        // Cerrar el modal después de un breve delay para que se vea la actualización
        setTimeout(() => {
          console.log('🔧 Cerrando modal de técnico...')
          setShowTechnicianModal(false)
          console.log('🔧 Modal cerrado, trabajo actualizado exitosamente')
        }, 500)
      } else {
        const errorData = await response.json()
        console.log('🔧 Error en la API:', errorData)
        toast({
          title: "Error",
          description: errorData.error || "Error al actualizar trabajo",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "Error de conexión al actualizar trabajo",
        variant: "destructive"
      })
    } finally {
      setIsAssigningTechnician(false)
    }
  }

  const openTechnicianModal = () => {
    console.log('🔧 Abriendo modal de técnico...')
    setShowTechnicianModal(true)
    console.log('🔧 Modal abierto, cargando técnicos...')
    loadTechnicians()
    
    // Inicializar los valores con los actuales del trabajo
    // Convertir la fecha al formato correcto para el input date
    let formattedDate = ""
    // Usar scheduledAt si está disponible, sino usar date
    const jobDateToFormat = job.scheduledAt || job.date
    if (jobDateToFormat) {
      try {
        const date = new Date(jobDateToFormat)
        if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
          // Solo usar fechas válidas (posteriores a 1970)
          formattedDate = date.toISOString().split('T')[0]
          console.log('🔧 Fecha válida del trabajo:', formattedDate)
        } else {
          console.log('🔧 Fecha inválida del trabajo, usando fecha actual:', jobDateToFormat)
          // Si la fecha es inválida, usar la fecha actual
          formattedDate = new Date().toISOString().split('T')[0]
        }
      } catch (error) {
        console.error("Error formatting date:", error)
        // En caso de error, usar la fecha actual
        formattedDate = new Date().toISOString().split('T')[0]
      }
    } else {
      // Si no hay fecha, usar la fecha actual
      formattedDate = new Date().toISOString().split('T')[0]
    }
    
    console.log('🔧 Fecha inicializada en el modal:', formattedDate)
    setNewDate(formattedDate)
    setNewStartTime(job.startTime || "")
    setNewEndTime(job.endTime || "")
  }

  const handleQuoteAction = async () => {
    setIsQuoteLoading(true)
    try {
      // Primero verificar si ya existe una cotización para este trabajo
      const response = await fetch(`/api/jobs/${job.id}/quote`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.hasQuote) {
          // Si ya existe una cotización, redirigir a la página de cotizaciones
          window.open(`/dashboard/quotes/${data.quote.id}`, '_blank')
          toast({
            title: "Cotización Encontrada",
            description: "Se ha abierto la cotización existente en una nueva pestaña.",
          })
        } else {
          // Si no existe, crear una nueva cotización
          const createResponse = await fetch(`/api/jobs/${job.id}/quote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          
          if (createResponse.ok) {
            const createData = await createResponse.json()
            toast({
              title: "Cotización Creada",
              description: "Se ha creado una nueva cotización para este trabajo.",
            })
            // Redirigir a la nueva cotización
            window.open(`/dashboard/quotes/${createData.quote.id}`, '_blank')
          } else {
            const error = await createResponse.json()
            toast({
              title: "Error",
              description: error.error || "Error al crear la cotización",
              variant: "destructive"
            })
          }
        }
      } else {
        toast({
          title: "Error",
          description: "Error al verificar la cotización",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error handling quote action:', error)
      toast({
        title: "Error",
        description: "Error de conexión al manejar la cotización",
        variant: "destructive"
      })
    } finally {
      setIsQuoteLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="pr-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {job.patientName}
            </h2>
            <p className="text-gray-600 text-sm">
              {job.type}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Date and Time */}
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatDate(job.date || '')}</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {job.startTimeDisplay || job.startTime} - {job.endTimeDisplay || job.endTime}
            </span>
          </div>

          {/* Service Provider */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Se atenderá con: {job.technician?.name || "Sin técnico asignado"}
              </span>
            </div>
            {canAssignTechnician && (
              <Button
                variant="outline"
                size="sm"
                onClick={openTechnicianModal}
                className="h-7 px-2 text-xs gap-1"
              >
                {job.technician?.id ? (
                  <>
                    <Edit className="h-3 w-3" />
                    Cambiar
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3" />
                    Asignar
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Company Information */}
          {job.company && (
            <div className="flex items-center gap-3 text-gray-700">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Empresa: {job.company.name}
              </span>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{job.client?.phone || "+56912345678"}</span>
              <div className="flex gap-1 ml-2">
                {/* Call Button */}
                <a
                  href={`tel:${job.client?.phone || "+56912345678"}`}
                  className="inline-flex items-center justify-center h-6 w-6 p-0 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors group relative"
                  title="Llamar"
                >
                  <Phone className="h-3 w-3" />
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Llamar
                  </span>
                </a>
                {/* WhatsApp Link */}
                <a
                  href={`https://wa.me/${(job.client?.phone || "+56912345678").replace(/\D/g, '')}?text=Hola ${job.client?.name || 'cliente'}, soy de ${job.company?.name || 'la empresa'} y te contacto sobre el trabajo de ${job.type || 'servicio'} programado para el ${formatDate(job.date || '')} de ${job.startTimeDisplay || job.startTime} a ${job.endTimeDisplay || job.endTime}. ¿Podemos confirmar la cita?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-6 w-6 p-0 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors group relative"
                  title="Abrir WhatsApp"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.87 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.87 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.87 0 0020.885 3.488"/>
                  </svg>
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Abrir WhatsApp
                  </span>
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{job.client?.email || "cliente@email.com"}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <Badge className={getStatusColor(job.status || "PENDING")}>
                {getStatusText(job.status || "PENDING")}
              </Badge>
            </div>
            
            {/* Status indicators */}
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {job.description}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {/* Status Update Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus("PENDING")}
              disabled={isUpdating || job.status === "PENDING" || (isTechnician && !isCurrentTechnician)}
              className="flex-1 gap-2"
            >
              <Pause className="h-4 w-4" />
              Pendiente
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus("IN_PROGRESS")}
              disabled={isUpdating || job.status === "IN_PROGRESS" || (isTechnician && !isCurrentTechnician)}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              En Progreso
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={isUpdating || job.status === "COMPLETED" || (isTechnician && !isCurrentTechnician)}
              className="flex-1 gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Completado
            </Button>
          </div>
          
          {/* Other Action Buttons - Solo para admin y secretaria */}
          {canAssignTechnician && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2">
                <DollarSign className="h-4 w-4" />
                Ver pago
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleQuoteAction}
                disabled={isQuoteLoading}
              >
                <FileText className="h-4 w-4" />
                {isQuoteLoading ? "Cargando..." : "Cotización"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Asignación de Técnico */}
      {showTechnicianModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTechnicianModal(false)}
                className="absolute top-4 right-4 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="pr-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {job.technician?.id ? "Cambiar Técnico y Horario" : "Asignar Técnico y Horario"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {job.technician?.id 
                    ? "Modifica el técnico, fecha u horario del trabajo. Si no cambias fecha/hora, se mantendrán las originales."
                    : "Asigna un técnico y define fecha/horario del trabajo"
                  }
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Técnico Actual */}
              {job.technician?.id && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Técnico Actual: {job.technician.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Selector de Técnico */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Seleccionar Técnico
                </label>
                {isLoadingTechnicians ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando técnicos...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {technicians.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No hay técnicos disponibles
                      </div>
                    ) : (
                      technicians.map((technician) => (
                        <div
                          key={technician.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedTechnician === technician.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => {
                            console.log('🔧 Técnico seleccionado:', technician.id, technician.name)
                            setSelectedTechnician(technician.id)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              selectedTechnician === technician.id
                                ? "bg-blue-500"
                                : "border-2 border-gray-300"
                            }`}></div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {technician.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {technician.email}
                              </div>
                            </div>
                            {selectedTechnician === technician.id && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Fecha y Horario */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Fecha y Horario
                </label>
                
                {/* Fecha */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Fecha</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Hora de inicio</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Hora de fin</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTechnicianModal(false)}
                className="flex-1"
                disabled={isAssigningTechnician}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignTechnician}
                disabled={!selectedTechnician || isAssigningTechnician}
                className="flex-1"
              >
                {isAssigningTechnician ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Actualizando...</span>
                  </div>
                ) : (
                  <span>{job.technician?.id ? "Actualizar" : "Asignar"}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
