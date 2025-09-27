
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { safeCleanupDuplicates } from "@/lib/dom-utils"
import { AlertCircle, Building, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, Edit, Filter, Menu, MessageCircle, Phone, Plus, RefreshCw, User, Wrench, X } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
// CSS optimizations handled by dashboard layout

// Simple debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

interface Job {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  scheduledAt: string
  startTime: string
  endTime: string
  totalBudget?: number
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
  payments?: any[]
}

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  role: string | { name: string }
  company: string
  fechaIngreso: string
  ultimaActividad: string
  isActive: boolean
  status?: 'disponible' | 'ocupado'
  conflictReason?: string | null
}

export default function CalendarPage() {
  const { data: session } = useSession()

  // Obtener información del usuario actual
  const currentUser = session?.user as any
  const userRole = currentUser?.role?.toLowerCase() || 'tecnico'

  // Debug del usuario y rol
  console.log('🔍 Debug Usuario:', {
    currentUser,
    userRole,
    session: session?.user,
    canViewAllJobs: ['administrador', 'secretaria'].includes(userRole)
  })

  // Funciones para verificar permisos según el rol

  const canViewAllJobs = () => {
    const canView = ['administrador', 'secretaria'].includes(userRole)
    console.log('🔍 Debug canViewAllJobs:', { userRole, canView })
    return canView
  }

  const canEditJobs = (jobId?: string) => {
    // Administradores y secretarias pueden editar todos los trabajos
    if (['administrador', 'secretaria'].includes(userRole)) {
      return true
    }

    // Técnicos solo pueden editar sus propios trabajos asignados
    if (userRole === 'tecnico') {
      if (jobId) {
        const job = jobs.find(j => j.id === jobId)
        return job?.technician?.id === currentUser?.id
      }
      return true // Para botones generales, permitir si es técnico
    }

    return false
  }

  // Función helper para filtrar trabajadores activos
  const getActiveTechnicians = () => {
    let filteredTechnicians = technicians.filter(tech => {
      // Manejar tanto estructura plana como anidada del rol
      const roleName = typeof tech.role === 'string' ? tech.role : tech.role?.name || ''
      // Filtrar SOLO técnicos, excluyendo administradores y secretarias
      const isTechnician = (
        roleName === 'TECNICO' ||
        roleName === 'Técnico' ||
        roleName === 'Trabajador' ||
        roleName === 'TRABAJADOR'
      )

      const isNotAdminOrSecretary = (
        roleName !== 'ADMINISTRADOR' &&
        roleName !== 'Administrador' &&
        roleName !== 'SECRETARIA' &&
        roleName !== 'Secretaria'
      )

      // Filtrar también por nombre para excluir usuarios con nombres de secretarias/administradores
      const name = tech.name?.toLowerCase() || ''
      const isNotAdminOrSecretaryByName = (
        !name.includes('administrador') &&
        !name.includes('admin') &&
        !name.includes('secretaria') &&
        !name.includes('secretary')
      )

      return (
        isTechnician &&
        isNotAdminOrSecretary &&
        isNotAdminOrSecretaryByName &&
        tech.isActive &&
        tech.name &&
        tech.name.trim() !== ''
      )
    })

    // Si el usuario es técnico, solo mostrar su propia columna
    if (userRole === 'tecnico') {
      filteredTechnicians = filteredTechnicians.filter(tech => tech.id === currentUser?.id)
    }

    // Si hay un filtro de trabajador específico, mostrar solo ese trabajador
    if (selectedTechnicianFilter !== "todos") {
      filteredTechnicians = filteredTechnicians.filter(tech => tech.id === selectedTechnicianFilter)
    }

    return filteredTechnicians
  }

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTechnicianFilter, setSelectedTechnicianFilter] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("todos")
  const [jobs, setJobs] = useState<Job[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRendering, setIsRendering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Debug logs removidos para evitar bucles infinitos

  // Funciones para controlar el menú móvil
  const toggleMobileMenu = () => {

    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  // Función para seleccionar fecha y cerrar menú en móvil
  const selectDateAndCloseMenu = (date: Date) => {
    setSelectedDate(date)
    // Cerrar menú automáticamente en móvil después de seleccionar fecha
    if (window.innerWidth < 768) {
      setTimeout(() => {
        closeMobileMenu()
      }, 300)
    }
  }

  // Función para aplicar filtros y cerrar menú en móvil
  const applyFilterAndCloseMenu = (filterType: string, value: string) => {
    if (filterType === 'technician') {
      setSelectedTechnicianFilter(value)
    } else if (filterType === 'status') {
      setSelectedStatus(value)
    }

    // Cerrar menú automáticamente en móvil después de aplicar filtro
    if (window.innerWidth < 768) {
      setTimeout(() => {
        closeMobileMenu()
      }, 500)
    }
  }
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [_currentTime, _setCurrentTime] = useState(new Date())
  const [jobQuote, setJobQuote] = useState<any>(null)
  const [jobPayment, setJobPayment] = useState<any>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [_statusUpdateMessage, _setStatusUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [paymentUpdateMessage, setPaymentUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Estados para el modal de método de pago
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('efectivo')
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState<boolean | null>(null)

  // Estados para la reasignación de técnicos
  const [showTechnicianModal, setShowTechnicianModal] = useState(false)
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>([])
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("")
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false)
  const [isAssigningTechnician, setIsAssigningTechnician] = useState(false)

  // Estados para edición de fecha y hora
  const [isEditingDateTime, setIsEditingDateTime] = useState(false)
  const [editDate, setEditDate] = useState<string>("")
  const [editStartTime, setEditStartTime] = useState<string>("")
  const [editEndTime, setEditEndTime] = useState<string>("")
  const [isSavingDateTime, setIsSavingDateTime] = useState(false)

  // Estados para los mini calendarios
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [nextMonth, setNextMonth] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date
  })

  // Generar horarios de 8:00 a 19:00 (12 horas de servicio)
  const timeSlots = []
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
  }

  // Debug: verificar que se generen todos los horarios
  // Logs de horarios removidos para mejorar rendimiento

  // Verificar que se generen exactamente 12 horarios (8:00 a 19:00)
  if (timeSlots.length !== 12) {

  } else {
    // Log de verificación removido para mejorar rendimiento
  }

  // Función para obtener el tiempo actual en Chile
  const getCurrentTimeInChile = () => {
    const now = new Date()

    // Método más directo usando toLocaleString
    const chileTimeString = now.toLocaleString('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    // Parsear la fecha directamente
    const [datePart, timePart] = chileTimeString.split(', ')
    const [year, month, day] = datePart?.split('-').map(Number) || [0, 0, 0]
    const [hour, minute, second] = timePart?.split(':').map(Number) || [0, 0, 0]

    const chileDate = new Date(year || 0, (month || 1) - 1, day || 0, hour || 0, minute || 0, second || 0)

    // Logs de tiempo removidos para mejorar rendimiento

    return chileDate
  }

  // Función para obtener el horario actual en formato HH:00

  // Función para verificar si un horario es el actual

  // Función para obtener la posición exacta de la hora actual
  const getCurrentTimePosition = () => {
    const chileTime = getCurrentTimeInChile()
    const minutes = chileTime.getMinutes()

    // Debug: Log para verificar la hora actual
    // Logs de hora actual removidos para mejorar rendimiento

    // Calcular la posición exacta dentro del slot de tiempo (0-100%)
    const positionInSlot = (minutes / 60) * 100
    return positionInSlot
  }

  // Función para verificar si la hora actual está en un slot específico
  const isCurrentTimeInSlot = (timeSlot: string) => {
    const chileTime = getCurrentTimeInChile()
    const currentHour = chileTime.getHours()
    const slotHour = parseInt(timeSlot?.split(':')[0] || '0')
    return currentHour === slotHour
  }

  // Función para verificar si la hora actual está dentro del rango visible

  // Actualizar el tiempo actual cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      _setCurrentTime(new Date())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  // Hook para detectar el tamaño de la pantalla
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar al cargar
    checkIsMobile()

    // Verificar en resize
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Hook para detectar cambios en el tamaño de la ventana y recalcular la línea roja
  useEffect(() => {
    const handleResize = () => {
      // Forzar re-renderizado cuando cambie el tamaño de la ventana
      _setCurrentTime(new Date())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Función para manejar teclas de acceso rápido
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showJobModal && event.key === 'Escape') {
        closeJobModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showJobModal])

  // Ref para evitar múltiples llamadas simultáneas
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchRef = useRef<number>(0);

  // Función para cargar trabajos desde la API del calendario
  const fetchJobs = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current) {

      return;
    }

    // Prevenir llamadas muy frecuentes (debounce)
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {

      return;
    }
    lastFetchRef.current = now;

    try {

      isFetchingRef.current = true;
      setLoading(true)
      setError("")

      const timestamp = Date.now();
      const response = await fetch(`/api/calendar/jobs?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) {
        throw new Error(`Error al cargar los trabajos: ${response.status}`)
      }

      const result = await response.json()

      // Debug logs removed to prevent infinite loop

      // Log detallado de trabajos para depuración
      if (result.data && result.data.length > 0) {

        result.data.forEach((_job: any) => {
        })
      }

      if (result.success && result.data) {
        // Mapear los datos del calendario al formato esperado
        const mappedJobs = result.data.map((job: any) => ({
          id: job.id,
          title: job.title || job.service?.name || 'Sin título',
          description: job.description || '',
          status: job.status || 'PENDING',
          priority: job.priority || 'MEDIUM',
          scheduledAt: job.scheduledAt || new Date().toISOString(),
          startTime: job.startTime || '08:00',
          endTime: job.endTime || '09:00',
          totalBudget: job.totalBudget || 0,
          client: job.client ? {
            name: job.client.name || job.patientName || 'Sin nombre',
            phone: job.client.phone || '',
            address: job.client.address || '',
            email: job.client.email || ''
          } : {
            name: job.patientName || 'Sin cliente',
            phone: '',
            address: '',
            email: ''
          },
          service: job.service ? {
            name: job.service.name || 'Sin servicio',
            price: job.service.price || 0
          } : {
            name: job.title || 'Sin servicio',
            price: 0
          },
          company: job.company ? {
            name: job.company.name || 'Sin empresa',
            type: 'Empresa'
          } : {
            name: 'Sin empresa',
            type: 'Empresa'
          },
          technician: job.technician && job.technician.id ? {
            id: job.technician.id,
            name: job.technician.name
          } : undefined,
          payments: job.payments || []
        }))

        // Eliminar duplicados antes de establecer el estado
        const uniqueJobs = mappedJobs.filter((job: Job, index: number, self: Job[]) =>
          index === self.findIndex((j: Job) => j.id === job.id)
        )

        // Verificar duplicados por contenido (no solo ID)
        const contentDuplicates = uniqueJobs.filter((job: Job, index: number, self: Job[]) =>
          self.findIndex((j: Job) =>
            j.title === job.title &&
            j.client.name === job.client.name &&
            j.scheduledAt === job.scheduledAt &&
            j.startTime === job.startTime &&
            j.endTime === job.endTime
          ) !== index
        )

        if (contentDuplicates.length > 0) {

          // Eliminar duplicados por contenido, manteniendo solo el primero
          const finalUniqueJobs = uniqueJobs.filter((job: Job, index: number, self: Job[]) =>
            self.findIndex((j: Job) =>
              j.title === job.title &&
              j.client.name === job.client.name &&
              j.scheduledAt === job.scheduledAt &&
              j.startTime === job.startTime &&
              j.endTime === job.endTime
            ) === index
          )
          setJobs(finalUniqueJobs)
        } else {
          setJobs(uniqueJobs)
        }

        // Solo usar datos reales de la base de datos
      } else {

        setError(result.error || 'Error al cargar los trabajos')
      }
    } catch (error) {

      setError(error instanceof Error ? error.message : "Error al cargar los trabajos")
    } finally {

      isFetchingRef.current = false;
      setLoading(false)
    }
  }, [])

  // Listener para actualizar el calendario cuando se asignan técnicos
  useEffect(() => {
    const handleCalendarRefresh = () => {

      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        fetchJobs()
      }
    }

    const handlePaymentStatusUpdated = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        fetchJobs()
      }
    }

    const handleNewJobCreated = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        fetchJobs()
      }
    }

    window.addEventListener('calendarRefresh', handleCalendarRefresh as EventListener)
    window.addEventListener('paymentStatusUpdated', handlePaymentStatusUpdated as EventListener)
    window.addEventListener('newJobCreated', handleNewJobCreated as EventListener)
    return () => {
      window.removeEventListener('calendarRefresh', handleCalendarRefresh as EventListener)
      window.removeEventListener('paymentStatusUpdated', handlePaymentStatusUpdated as EventListener)
      window.removeEventListener('newJobCreated', handleNewJobCreated as EventListener)
    }
  }, [fetchJobs])

  // Función para cargar trabajadores desde la API
  const fetchTechnicians = useCallback(async () => {
    try {
      const response = await fetch("/api/workers/technicians")
      if (response.ok) {
        const data = await response.json()
        setTechnicians(data)
      } else {
        console.error('Error loading technicians:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching technicians:', error)
    }
  }, [])

  // Función debounced para recargar datos
  const debouncedFetchJobs = useCallback(() => {

    fetchJobs();
  }, [fetchJobs])

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchJobs()
    fetchTechnicians()
  }, [fetchJobs, fetchTechnicians])

  // Filtrar trabajos según los filtros seleccionados
  const filteredJobs = jobs.filter(job => {
    // Si es trabajador, solo mostrar sus propios trabajos asignados (NO trabajos sin asignar)
    if (userRole === 'tecnico') {
      // Solo mostrar trabajos asignados al técnico actual
      if (!job.technician || job.technician.id !== currentUser?.id) {
        return false
      }
    }

    // Filtrar por trabajador (solo para administradores y secretarias)
    if (canViewAllJobs() && selectedTechnicianFilter !== "todos") {
      // Si se selecciona "sin-asignar", mostrar solo trabajos sin técnico
      if (selectedTechnicianFilter === "sin-asignar") {
        if (job.technician && job.technician.id) {
          return false
        }
      } else {
        // Si se selecciona un técnico específico, mostrar solo sus trabajos
        if (job.technician?.id !== selectedTechnicianFilter) {
          return false
        }
      }
    }

    // Filtrar por estado
    if (selectedStatus !== "todos" && job.status !== selectedStatus) {
      return false
    }

    return true
  })

  // Eliminar duplicados a nivel de datos usando useMemo para optimización
  const uniqueFilteredJobs = useMemo(() => {
    return filteredJobs.reduce((acc, job) => {
      const existingJob = acc.find(j => j.id === job.id)
      if (!existingJob) {
        acc.push(job)
      }
      return acc
    }, [] as Job[])
  }, [filteredJobs])

  // Controlar el estado de renderizado para evitar duplicaciones
  useEffect(() => {
    if (uniqueFilteredJobs.length > 0) {
      setIsRendering(true)
      const timer = setTimeout(() => {
        setIsRendering(false)
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [uniqueFilteredJobs])

  // Función para limpiar duplicados visuales después del renderizado
  useEffect(() => {
    // Solo ejecutar limpieza si hay trabajos y no estamos cargando o renderizando
    if (uniqueFilteredJobs.length > 0 && !loading && !isRendering) {
      const cleanupDuplicates = async () => {
        try {
          // Verificar que el documento esté listo y que no estemos en medio de una actualización
          if (document.readyState === 'complete' && !loading && !isRendering) {
            // Usar requestAnimationFrame para asegurar que el DOM esté listo
            requestAnimationFrame(async () => {
              // Verificar nuevamente que no estamos cargando o renderizando antes de limpiar
              if (!loading && !isRendering) {
                await safeCleanupDuplicates('[data-job-id]', 'data-job-id')
              }
            })
          }
        } catch (error) {

        }
      }

      // Ejecutar limpieza después de un delay más corto para mejor UX
      const timeoutId = setTimeout(cleanupDuplicates, 800)

      return () => {
        clearTimeout(timeoutId)
      }
    }
    return undefined
  }, [uniqueFilteredJobs, loading, selectedDate, isRendering]) // Incluir isRendering para evitar conflictos

  // Log de depuración removido para mejorar rendimiento

  // Log específico para trabajos sin asignar
  const unassignedJobs = uniqueFilteredJobs.filter(job => !job.technician)
  if (unassignedJobs.length > 0) {
  } else {
    // Log removido para mejorar rendimiento
  }

  // Debug logs removed to prevent infinite loop and improve performance

  // Función para obtener el estado de disponibilidad de un técnico
  const getTechnicianAvailability = (technicianId: string) => {
    const todayJobs = filteredJobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      const jobYear = jobDate.getFullYear()
      const jobMonth = jobDate.getMonth()
      const jobDay = jobDate.getDate()

      const selectedYear = selectedDate.getFullYear()
      const selectedMonth = selectedDate.getMonth()
      const selectedDay = selectedDate.getDate()

      return jobYear === selectedYear && jobMonth === selectedMonth && jobDay === selectedDay && job.technician?.id === technicianId
    })

    const totalHours = todayJobs.reduce((total, job) => {
      const start = parseInt(job.startTime?.split(':')[0] || '0')
      const end = parseInt(job.endTime?.split(':')[0] || '0')
      return total + (end - start)
    }, 0)

    return {
      totalJobs: todayJobs.length,
      totalHours,
      isAvailable: totalHours < 8 // Consideramos disponible si tiene menos de 8 horas
    }
  }

  // Función para convertir tiempo a minutos
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours || 0) * 60 + (minutes || 0)
  }

  // Función para calcular la posición exacta de un trabajo
  const getJobPosition = (jobStartTime: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime)
    const jobStartMinutes = timeToMinutes(jobStartTime)

    // Si el trabajo comienza en este slot, calcular la posición exacta
    if (jobStartMinutes >= slotMinutes && jobStartMinutes < slotMinutes + 60) {
      const offsetInSlot = jobStartMinutes - slotMinutes
      const offsetPercentage = (offsetInSlot / 60) * 100
      return Math.max(0, Math.min(100, offsetPercentage))
    }

    // Si el trabajo comenzó antes de este slot pero termina en este slot o después
    if (jobStartMinutes < slotMinutes) {
      return 0 // Comenzar desde arriba del slot
    }

    // Para cualquier otro caso, comenzar desde arriba
    return 0
  }

  // Función para calcular la altura de un trabajo basada en su duración completa
  const getJobHeight = (jobStartTime: string, jobEndTime: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime)
    const jobStartMinutes = timeToMinutes(jobStartTime)
    const jobEndMinutes = timeToMinutes(jobEndTime)

    // Calcular cuántos minutos del trabajo están en este slot específico
    const slotStart = Math.max(slotMinutes, jobStartMinutes)
    const slotEnd = Math.min(slotMinutes + 60, jobEndMinutes)
    const minutesInSlot = Math.max(0, slotEnd - slotStart)

    // Convertir a porcentaje de altura del slot
    const heightPercentage = (minutesInSlot / 60) * 100

    // Asegurar que la altura mínima sea proporcional a la duración real
    const minHeight = Math.max(15, (minutesInSlot / 60) * 100)

    // Si el trabajo comienza en este slot
    if (jobStartMinutes >= slotMinutes && jobStartMinutes < slotMinutes + 60) {
      // Si el trabajo termina en este mismo slot, usar altura proporcional exacta
      if (jobEndMinutes <= slotMinutes + 60) {
        return Math.max(minHeight, Math.min(100, heightPercentage))
      }
      // Si el trabajo continúa en el siguiente slot, usar altura completa
      return 100
    }

    // Si el trabajo está en progreso (comenzó antes de este slot)
    if (jobStartMinutes < slotMinutes && jobEndMinutes > slotMinutes) {
      // Si el trabajo termina en este slot, usar altura proporcional exacta
      if (jobEndMinutes <= slotMinutes + 60) {
        return Math.max(minHeight, Math.min(100, heightPercentage))
      }
      // Si el trabajo continúa después de este slot, usar altura completa
      return 100
    }

    // Si el trabajo termina en este slot (caso especial)
    if (jobEndMinutes > slotMinutes && jobEndMinutes <= slotMinutes + 60) {
      return Math.max(minHeight, Math.min(100, heightPercentage))
    }

    return Math.max(minHeight, Math.min(100, heightPercentage))
  }

  // Nueva función para calcular la altura total que debe abarcar un trabajo
  const getJobSpanHeight = (jobStartTime: string, jobEndTime: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime)
    const jobStartMinutes = timeToMinutes(jobStartTime)
    const jobEndMinutes = timeToMinutes(jobEndTime)

    // Si el trabajo comienza en este slot, calcular cuántos slots debe abarcar
    if (jobStartMinutes >= slotMinutes && jobStartMinutes < slotMinutes + 60) {
      const totalDuration = jobEndMinutes - jobStartMinutes
      const slotsToSpan = Math.ceil(totalDuration / 60)

      // Calcular la altura total en píxeles (cada slot tiene 80px de altura)
      const totalHeightPx = slotsToSpan * 80

      return {
        height: totalHeightPx,
        slotsToSpan: slotsToSpan,
        isStartingSlot: true
      }
    }

    // Si el trabajo está en progreso, no mostrar en este slot
    if (jobStartMinutes < slotMinutes && jobEndMinutes > slotMinutes) {
      return {
        height: 0,
        slotsToSpan: 0,
        isStartingSlot: false
      }
    }

    return {
      height: 0,
      slotsToSpan: 0,
      isStartingSlot: false
    }
  }

  // Función para detectar si un trabajo es parcial (no abarca todo el slot)
  const isPartialJob = (jobStartTime: string, jobEndTime: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime)
    const jobStartMinutes = timeToMinutes(jobStartTime)
    const jobEndMinutes = timeToMinutes(jobEndTime)

    // Si el trabajo comienza en este slot
    if (jobStartMinutes >= slotMinutes && jobStartMinutes < slotMinutes + 60) {
      // Si el trabajo termina en este mismo slot, verificar si abarca todo el slot
      if (jobEndMinutes <= slotMinutes + 60) {
        const jobDuration = jobEndMinutes - jobStartMinutes
        const slotDuration = 60
        // Es parcial si no abarca al menos el 80% del slot
        return (jobDuration / slotDuration) < 0.8
      }
    }

    // Si el trabajo está en progreso (comenzó antes de este slot)
    if (jobStartMinutes < slotMinutes && jobEndMinutes > slotMinutes) {
      // Si el trabajo termina en este slot, verificar si abarca todo el slot
      if (jobEndMinutes <= slotMinutes + 60) {
        const jobDuration = jobEndMinutes - slotMinutes
        const slotDuration = 60
        // Es parcial si no abarca al menos el 80% del slot
        return (jobDuration / slotDuration) < 0.8
      }
    }

    return false
  }

  // Función para calcular la posición de columna para múltiples trabajos
  const getJobColumnPosition = (jobs: Job[], currentJob: Job, time: string) => {
    // Filtrar trabajos que se solapan con este slot de tiempo
    const overlappingJobs = jobs.filter(job => {
      const jobStartMinutes = timeToMinutes(job.startTime)
      const jobEndMinutes = timeToMinutes(job.endTime)
      const slotMinutes = timeToMinutes(time)

      return jobStartMinutes < slotMinutes + 60 && jobEndMinutes > slotMinutes
    })

    // Separar trabajos completos y parciales
    const fullJobs = overlappingJobs.filter(job => !isPartialJob(job.startTime, job.endTime, time))
    const partialJobs = overlappingJobs.filter(job => isPartialJob(job.startTime, job.endTime, time))

    // Ordenar trabajos completos por hora de inicio
    const sortedFullJobs = fullJobs.sort((a, b) => {
      const timeA = timeToMinutes(a.startTime)
      const timeB = timeToMinutes(b.startTime)
      return timeA - timeB
    })

    // Ordenar trabajos parciales por hora de inicio (más recientes primero)
    const sortedPartialJobs = partialJobs.sort((a, b) => {
      const timeA = timeToMinutes(a.startTime)
      const timeB = timeToMinutes(b.startTime)
      return timeB - timeA // Orden descendente para mostrar los más recientes primero
    })

    // Combinar: trabajos parciales primero, luego trabajos completos
    const allSortedJobs = [...sortedPartialJobs, ...sortedFullJobs]

    // Encontrar el índice del trabajo actual
    const currentJobIndex = allSortedJobs.findIndex(job => job.id === currentJob.id)

    if (currentJobIndex === -1) return { column: 0, totalColumns: 1, isPartial: false }

    // Calcular la columna (máximo 8 columnas)
    const column = currentJobIndex % 8
    const totalColumns = Math.min(allSortedJobs.length, 8)
    const isPartial = isPartialJob(currentJob.startTime, currentJob.endTime, time)

    return { column, totalColumns, isPartial }
  }

  // Función para determinar si una tarjeta es muy pequeña
  const isJobCardSmall = (jobStartTime: string, jobEndTime: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime)
    const jobStartMinutes = timeToMinutes(jobStartTime)
    const jobEndMinutes = timeToMinutes(jobEndTime)

    // Calcular la duración total del trabajo en minutos
    const totalJobDuration = jobEndMinutes - jobStartMinutes

    // Calcular cuántos minutos del trabajo están en este slot específico
    const slotStart = Math.max(slotMinutes, jobStartMinutes)
    const slotEnd = Math.min(slotMinutes + 60, jobEndMinutes)
    const minutesInSlot = Math.max(0, slotEnd - slotStart)

    // Si el trabajo es muy corto en este slot (menos de 20 minutos) o la duración total es muy corta
    if (minutesInSlot < 20 || totalJobDuration < 30) {
      return true
    }

    // Si la altura calculada es muy pequeña
    const height = getJobHeight(jobStartTime, jobEndTime, slotTime)
    return height < 25
  }

  // Función para obtener trabajos filtrados por hora y trabajador con posicionamiento exacto
  const getJobsForTimeAndTechnician = (time: string, technicianId: string) => {
    // Debug logs removed to prevent infinite loop

    const jobs = uniqueFilteredJobs.filter(job => {
      // Debug logs removed to prevent infinite loop
      // Si technicianId es 'unassigned', mostrar trabajos sin trabajador asignado
      if (technicianId === 'unassigned') {
        if (job.technician) return false
      } else {
        // Mostrar trabajos asignados al técnico específico
        if (job.technician?.id !== technicianId) return false
      }

      // Comparar fechas
      const jobDate = new Date(job.scheduledAt)
      const jobYear = jobDate.getFullYear()
      const jobMonth = jobDate.getMonth()
      const jobDay = jobDate.getDate()

      const selectedYear = selectedDate.getFullYear()
      const selectedMonth = selectedDate.getMonth()
      const selectedDay = selectedDate.getDate()

      const dateMatches = jobYear === selectedYear && jobMonth === selectedMonth && jobDay === selectedDay
      if (!dateMatches) return false

      // Verificar si el trabajo se solapa con este slot de hora
      const jobStartTime = job.startTime
      const jobEndTime = job.endTime

      if (!jobStartTime || !jobEndTime) return false

      // Validar que el trabajo esté dentro del rango de horarios permitido (8:00 - 19:00)
      const startHour = parseInt(jobStartTime?.split(':')[0] || '0')
      const endHour = parseInt(jobEndTime?.split(':')[0] || '0')

      if (startHour < 8 || startHour > 19 || endHour < 8 || endHour > 19) {

        return false
      }

      const slotMinutes = timeToMinutes(time)
      const jobStartMinutes = timeToMinutes(jobStartTime)
      const jobEndMinutes = timeToMinutes(jobEndTime)

      // Un trabajo aparece en un slot si se solapa con él
      // Esto incluye trabajos que:
      // 1. Comienzan en este slot
      // 2. Están en progreso durante este slot
      // 3. Terminan en este slot
      // 4. Comienzan antes y terminan después de este slot
      const overlaps = jobStartMinutes < (slotMinutes + 60) && jobEndMinutes > slotMinutes

      return overlaps
    })

    // Eliminar duplicados de manera más robusta
    const uniqueJobs = jobs.reduce((acc, job) => {
      const existingJob = acc.find(j => j.id === job.id)
      if (!existingJob) {
        acc.push(job)
      }
      return acc
    }, [] as Job[])

    // Ordenar trabajos por hora de inicio para consistencia visual
    const sortedJobs = uniqueJobs.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return ((timeA[0] || 0) * 60 + (timeA[1] || 0)) - ((timeB[0] || 0) * 60 + (timeB[1] || 0));
    });

    // Debug logs removed to prevent infinite loop

    // Limitar a máximo 8 trabajos por slot
    return sortedJobs.slice(0, 8)
  }

  // Función para abrir el modal de detalles del trabajo
  // Función para cargar información de pago
  const loadJobDetails = async (jobId: string, _forceReload = false) => {
    try {
      // Cargar información de pago
      const paymentResponse = await fetch(`/api/jobs/${jobId}/payment`)
      if (paymentResponse.ok) {
        const responseData = await paymentResponse.json()

        // Procesar la respuesta según el formato de la API
        if (responseData.hasPayment && responseData.payment) {
          const payment = responseData.payment
          const paymentData = {
            isPaid: payment.status === 'PAID',
            paidAmount: payment.status === 'PAID' ? payment.amount : 0,
            paymentMethod: payment.method?.toLowerCase() || 'efectivo',
            budget: payment.amount || 0,
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            notes: payment.notes
          }
          setJobPayment(paymentData)

        } else {
          // No hay información de pago, crear estado por defecto
          setJobPayment({
            isPaid: false,
            paidAmount: 0,
            paymentMethod: 'efectivo',
            budget: 0,
            status: 'PENDING',
            method: 'CASH',
            amount: 0
          })

        }
      } else {

        setJobPayment(null)
      }
    } catch (error) {

      setJobPayment(null)
    }
  }

  // Función para abrir el modal de selección de método de pago
  const openPaymentMethodModal = (newStatus: boolean) => {
    if (!selectedJob) return

    setSelectedPaymentMethod(jobPayment?.paymentMethod || 'efectivo')
    setPendingPaymentStatus(newStatus)
    setShowPaymentMethodModal(true)
  }

  // Función para convertir métodos de pago de español a inglés
  const translatePaymentMethodToEnglish = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'efectivo': 'CASH',
      'transferencia': 'TRANSFER',
      'tarjeta': 'CARD',
      'cheque': 'CHECK'
    }
    return methodMap[method] || 'CASH'
  }

  // Función para convertir métodos de pago de inglés a español
  const translatePaymentMethodToSpanish = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'CASH': 'Efectivo',
      'cash': 'Efectivo',
      'TRANSFER': 'Transferencia',
      'transfer': 'Transferencia',
      'CARD': 'Tarjeta',
      'card': 'Tarjeta',
      'CHECK': 'Cheque',
      'check': 'Cheque'
    }
    return methodMap[method] || 'Efectivo'
  }

  // Función para manejar el cambio de estado de pago con método seleccionado
  const handlePaymentStatusChange = async (newStatus: boolean, paymentMethod: string = 'efectivo') => {
    if (!selectedJob) return

    // Convertir método de pago de español a inglés
    const englishPaymentMethod = translatePaymentMethodToEnglish(paymentMethod)

    setIsUpdatingPayment(true)
    setPaymentUpdateMessage(null)

    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPaid: newStatus,
          paymentMethod: englishPaymentMethod,
          amount: selectedJob?.totalBudget || 0
        })
      })

      if (response.ok) {
        // Actualizar el estado local inmediatamente
        const updatedPayment = {
          ...jobPayment,
          isPaid: newStatus,
          paidAmount: newStatus ? (selectedJob?.totalBudget || 0) : 0,
          paymentMethod: paymentMethod,
          budget: selectedJob?.totalBudget || 0
        }
        setJobPayment(updatedPayment)

        // Mostrar mensaje de éxito
        setPaymentUpdateMessage({
          type: 'success',
          message: newStatus ? `Trabajo marcado como pagado (${paymentMethod})` : 'Trabajo marcado como pendiente'
        })

        // Recargar información de pago para sincronizar con el servidor
        setTimeout(() => {
          loadJobDetails(selectedJob.id, true) // Forzar recarga para sincronizar
        }, 1000)

      } else {
        const errorData = await response.json()

        setPaymentUpdateMessage({
          type: 'error',
          message: errorData.error || 'Error al actualizar el estado de pago'
        })
      }
    } catch (error) {

      setPaymentUpdateMessage({
        type: 'error',
        message: 'Error de conexión al actualizar el estado de pago'
      })
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  // Función para confirmar el método de pago
  const confirmPaymentMethod = async () => {
    if (!selectedJob || pendingPaymentStatus === null) return

    await handlePaymentStatusChange(pendingPaymentStatus, selectedPaymentMethod)
    setShowPaymentMethodModal(false)
  }

  // Función para cerrar el modal de método de pago
  const closePaymentMethodModal = () => {
    setShowPaymentMethodModal(false)
    setSelectedPaymentMethod('efectivo')
    setPendingPaymentStatus(null)
  }

  const openJobModal = (job: Job) => {

    setSelectedJob(job)
    setShowJobModal(true)
    _setStatusUpdateMessage(null) // Limpiar mensajes previos
    setPaymentUpdateMessage(null) // Limpiar mensajes de pago previos
    setJobPayment(null) // Limpiar estado de pago previo
    loadJobDetails(job.id, true) // Forzar recarga inicial

  }

  // Debug del estado del modal
  useEffect(() => {

  }, [showJobModal, selectedJob])

  // Función para cerrar el modal
  const closeJobModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
    setJobQuote(null)
    setJobPayment(null)
    _setStatusUpdateMessage(null)
    setPaymentUpdateMessage(null)
    setIsUpdatingStatus(false)
  }

  // Función para cargar técnicos disponibles
  const loadAvailableTechnicians = async () => {
    if (!selectedJob) return

    setIsLoadingTechnicians(true)
    try {
      const jobDate = selectedJob.scheduledAt
      const jobStartTime = selectedJob.startTime
      const jobEndTime = selectedJob.endTime

      if (!jobDate || !jobStartTime || !jobEndTime) {

        _setStatusUpdateMessage({
          type: 'error',
          message: 'El trabajo debe tener fecha y horario para asignar técnicos'
        })
        return
      }

      // Formatear fecha para la API
      const formattedDate = new Date(jobDate).toISOString().split('T')[0]
      const apiUrl = `/api/workers/available?date=${formattedDate}&startTime=${jobStartTime}&endTime=${jobEndTime}&excludeJobId=${selectedJob.id}`

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (response.ok) {
        // Mostrar solo técnicos disponibles primero, luego ocupados
        const allTechnicians = [...(data.available || []), ...(data.busy || [])]

        setAvailableTechnicians(allTechnicians)

        // Establecer el técnico actual si existe
        if (selectedJob.technician?.id) {
          const currentTechnician = allTechnicians.find(t => t.id === selectedJob.technician?.id)
          if (currentTechnician) {
            setSelectedTechnicianId(selectedJob.technician.id)

          }
        }

        // Si no hay técnicos, mostrar mensaje informativo
        if (allTechnicians.length === 0) {

          _setStatusUpdateMessage({
            type: 'error',
            message: 'No hay técnicos disponibles para este horario'
          })
        }
      } else {

        _setStatusUpdateMessage({
          type: 'error',
          message: data.error || 'Error al cargar técnicos disponibles'
        })

        // Fallback: cargar solo técnicos si la API falla
        try {
          const fallbackResponse = await fetch('/api/workers/technicians')
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            // Filtrar solo técnicos reales (no opciones genéricas)
            const techniciansOnly = fallbackData.filter((tech: any) => {
              const role = tech.role?.toLowerCase() || tech.role?.name?.toLowerCase() || ''
              const name = tech.name?.toLowerCase() || ''
              // Excluir opciones genéricas y solo incluir técnicos reales
              return (role === 'tecnico' || role === 'técnico') &&
                name !== 'técnico' &&
                name !== 'secretaria' &&
                name !== 'administrador' &&
                tech.id !== 'tecnico-generico'
            })
            const allTechs = techniciansOnly.map((tech: any) => ({
              ...tech,
              status: 'disponible' as const,
              conflictReason: null
            }))
            setAvailableTechnicians(allTechs)

          }
        } catch (fallbackError) {
          console.error('🔧 Fallback error:', fallbackError)
        }
      }
    } catch (error) {

      _setStatusUpdateMessage({
        type: 'error',
        message: 'Error de conexión al cargar técnicos disponibles'
      })
    } finally {
      setIsLoadingTechnicians(false)
    }
  }

  // Función para abrir el modal de reasignación de técnico
  const openTechnicianModal = () => {
    if (!canEditJobs(selectedJob?.id)) {
      _setStatusUpdateMessage({
        type: 'error',
        message: 'No tienes permisos para asignar técnicos'
      })
      return
    }

    setShowTechnicianModal(true)
    setSelectedTechnicianId(selectedJob?.technician?.id || "")
    loadAvailableTechnicians()
  }

  // Función para cerrar el modal de técnico
  const closeTechnicianModal = () => {
    setShowTechnicianModal(false)
    setSelectedTechnicianId("")
    setAvailableTechnicians([])
  }

  // Función para asignar técnico
  const assignTechnician = async () => {
    if (!selectedJob || !selectedTechnicianId) return

    setIsAssigningTechnician(true)
    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          technicianId: selectedTechnicianId
        })
      })

      if (response.ok) {
        const updatedJob = await response.json()

        // Actualizar el trabajo en el estado local
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === selectedJob.id
              ? { ...job, technician: updatedJob.technician }
              : job
          )
        )

        // Actualizar el trabajo seleccionado
        setSelectedJob({ ...selectedJob, technician: updatedJob.technician })

        _setStatusUpdateMessage({
          type: 'success',
          message: 'Técnico asignado exitosamente'
        })

        // Cerrar el modal
        closeTechnicianModal()

        // Disparar evento para refrescar el calendario
        if (typeof window !== 'undefined') {
          const refreshEvent = new CustomEvent('calendarRefresh', {
            detail: {
              reason: 'technicianAssigned',
              jobId: selectedJob.id,
              newTechnicianId: selectedTechnicianId,
              message: 'Técnico asignado, refrescando calendario...'
            }
          })
          window.dispatchEvent(refreshEvent)
        }

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => _setStatusUpdateMessage(null), 3000)
      } else {
        const errorData = await response.json()
        _setStatusUpdateMessage({
          type: 'error',
          message: errorData.error || 'Error al asignar técnico'
        })
      }
    } catch (error) {

      _setStatusUpdateMessage({
        type: 'error',
        message: 'Error de conexión al asignar técnico'
      })
    } finally {
      setIsAssigningTechnician(false)
    }
  }

  // Función para manejar la edición de fecha y hora
  const handleEditDateTime = () => {
    if (!selectedJob) return

    setIsEditingDateTime(true)

    // Inicializar campos con los valores actuales
    const jobDate = selectedJob.scheduledAt
    if (jobDate) {
      try {
        const date = new Date(jobDate)
        if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
          // Usar la zona horaria de Chile para evitar problemas de fecha
          const chileDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Santiago" }))
          const year = chileDate.getFullYear()
          const month = String(chileDate.getMonth() + 1).padStart(2, '0')
          const day = String(chileDate.getDate()).padStart(2, '0')
          setEditDate(`${year}-${month}-${day}`)
        } else {
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, '0')
          const day = String(today.getDate()).padStart(2, '0')
          setEditDate(`${year}-${month}-${day}`)
        }
      } catch (error) {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        setEditDate(`${year}-${month}-${day}`)
      }
    } else {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      setEditDate(`${year}-${month}-${day}`)
    }
    setEditStartTime(selectedJob.startTime ?? "")
    setEditEndTime(selectedJob.endTime ?? "")
  }

  // Función para cancelar la edición de fecha y hora
  const handleCancelEditDateTime = () => {
    setIsEditingDateTime(false)
  }

  // Función para guardar los cambios de fecha y hora
  const handleSaveDateTime = async () => {
    if (!selectedJob) return

    // Validaciones
    if (!editDate || !editStartTime || !editEndTime) {

      _setStatusUpdateMessage({
        type: 'error',
        message: 'Todos los campos de fecha y hora son obligatorios'
      })
      setTimeout(() => _setStatusUpdateMessage(null), 5000)
      return
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    const startTime = editStartTime.split(':').map(Number)
    const endTime = editEndTime.split(':').map(Number)
    const startMinutes = (startTime[0] || 0) * 60 + (startTime[1] || 0)
    const endMinutes = (endTime[0] || 0) * 60 + (endTime[1] || 0)

    if (endMinutes <= startMinutes) {
      _setStatusUpdateMessage({
        type: 'error',
        message: 'La hora de fin debe ser posterior a la hora de inicio'
      })
      setTimeout(() => _setStatusUpdateMessage(null), 5000)
      return
    }

    setIsSavingDateTime(true)
    try {
      // Asegurar que la fecha esté en formato ISO para el servidor
      const isoDate = new Date(editDate + 'T00:00:00').toISOString()

      const response = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scheduledAt: isoDate,
          startTime: editStartTime,
          endTime: editEndTime
        })
      })

      if (response.ok) {
        await response.json()

        // Actualizar el trabajo en el estado local
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === selectedJob.id
              ? {
                ...job,
                scheduledAt: isoDate,
                startTime: editStartTime,
                endTime: editEndTime
              }
              : job
          )
        )

        // Actualizar el trabajo seleccionado
        setSelectedJob({
          ...selectedJob,
          scheduledAt: isoDate,
          startTime: editStartTime,
          endTime: editEndTime
        })

        _setStatusUpdateMessage({
          type: 'success',
          message: 'Fecha y hora actualizadas exitosamente'
        })

        setIsEditingDateTime(false)

        // Forzar recarga del calendario
        setTimeout(() => {
          fetchJobs()
        }, 500)

        // Disparar evento para refrescar el calendario
        if (typeof window !== 'undefined') {
          const refreshEvent = new CustomEvent('calendarRefresh', {
            detail: {
              reason: 'dateTimeUpdated',
              jobId: selectedJob.id,
              message: 'Fecha y hora actualizadas, refrescando calendario...'
            }
          })
          window.dispatchEvent(refreshEvent)
        }

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => _setStatusUpdateMessage(null), 3000)
      } else {
        const errorData = await response.json()

        _setStatusUpdateMessage({
          type: 'error',
          message: errorData.error || 'Error al actualizar fecha y hora'
        })
        setTimeout(() => _setStatusUpdateMessage(null), 5000)
      }
    } catch (error) {

      _setStatusUpdateMessage({
        type: 'error',
        message: 'Error de conexión al actualizar fecha y hora'
      })
      setTimeout(() => _setStatusUpdateMessage(null), 5000)
    } finally {
      setIsSavingDateTime(false)
    }
  }

  // Función para obtener el color del trabajo basado en el estado
  const getJobColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-500'
      case 'IN_PROGRESS':
        return 'bg-blue-500'
      case 'COMPLETED':
        return 'bg-green-500'
      case 'CANCELLED':
        return 'bg-red-500'
      default:
        return 'bg-orange-500'
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

  // Funciones para navegar entre meses en los mini calendarios
  const navigateCurrentMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)

    // Cerrar menú automáticamente en móvil después de navegar
    if (window.innerWidth < 768) {
      setTimeout(() => {
        closeMobileMenu()
      }, 300)
    }
  }

  const navigateNextMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(nextMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setNextMonth(newDate)

    // Cerrar menú automáticamente en móvil después de navegar
    if (window.innerWidth < 768) {
      setTimeout(() => {
        closeMobileMenu()
      }, 300)
    }
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
    <div className="calendar-mobile-container flex flex-col lg:flex-row min-h-screen">
      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="calendar-mobile-overlay open"
          onClick={closeMobileMenu}
        />
      )}

      {/* Botón para abrir menú móvil - Solo en móviles */}
      <button
        className="calendar-mobile-menu-toggle md:hidden fixed top-4 left-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3 shadow-lg transition-colors duration-200"
        onClick={toggleMobileMenu}
        aria-label="Abrir menú del calendario"
        title="Filtros y navegación"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar - Lado izquierdo - Visible en desktop o cuando el menú móvil está abierto */}
      <div className={`calendar-mobile-sidebar ${isMobileMenuOpen ? 'open' : ''} md:block md:static md:w-72 lg:w-80 bg-white border-r border-slate-200 p-4 lg:p-6 overflow-y-auto max-h-screen sticky top-0 flex-shrink-0`}>
        {/* Debug logs removidos para evitar bucle infinito */}
        {/* Header del sidebar móvil */}
        <div className="calendar-mobile-sidebar-header md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="calendar-mobile-sidebar-header-title">
                <Calendar className="h-6 w-6" />
                Calendario
              </h2>
              <p className="calendar-mobile-sidebar-header-subtitle">
                Filtros y navegación
              </p>
            </div>
            <button
              className="calendar-mobile-touch-target bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMobileMenuOpen(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMobileMenuOpen(false);
              }}
              aria-label="Cerrar menú"
              title="Cerrar menú"
              type="button"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'rgba(239, 68, 68, 0.3)',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 1000
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {(selectedTechnicianFilter !== "todos" || selectedStatus !== "todos") && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                Activos
              </Badge>
            )}
          </h3>

          {/* Filtro por Trabajador - Solo para administradores y secretarias */}
          {canViewAllJobs() && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trabajador:
              </label>
              <Select value={selectedTechnicianFilter} onValueChange={(value) => applyFilterAndCloseMenu('technician', value)}>
                <SelectTrigger className="w-full bg-white border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar trabajador" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-lg">
                  <SelectItem value="todos" className="hover:bg-blue-50 focus:bg-blue-50">
                    <span className="font-medium text-blue-600">👥 Todos los trabajadores</span>
                  </SelectItem>
                  <SelectItem value="sin-asignar" className="hover:bg-orange-50 focus:bg-orange-50">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-orange-600">Sin asignar</span>
                        <span className="text-xs text-orange-500">Trabajos sin técnico</span>
                      </div>
                    </span>
                  </SelectItem>
                  {getActiveTechnicians().map(tech => (
                    <SelectItem key={tech.id} value={tech.id} className="hover:bg-slate-50 focus:bg-slate-50">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-xs text-gray-500 capitalize">{typeof tech.role === 'string' ? tech.role.toLowerCase() : tech.role.name.toLowerCase()}</span>
                        </div>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro por Estado */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado:
            </label>
            <Select value={selectedStatus} onValueChange={(value) => applyFilterAndCloseMenu('status', value)}>
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
          {(selectedTechnicianFilter !== "todos" || selectedStatus !== "todos") && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTechnicianFilter("todos")
                  setSelectedStatus("todos")
                  // Cerrar menú automáticamente en móvil después de limpiar filtros
                  if (window.innerWidth < 768) {
                    setTimeout(() => {
                      closeMobileMenu()
                    }, 300)
                  }
                }}
                className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Mini Calendario - Mes Actual */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCurrentMonth('prev')}
                className="h-6 w-6 p-0 hover:bg-blue-50 border-blue-200"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCurrentMonth('next')}
                className="h-6 w-6 p-0 hover:bg-blue-50 border-blue-200"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 gap-0 text-xs">
              {/* Días de la semana */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center font-bold text-slate-500 bg-slate-50 border-r border-slate-200 last:border-r-0">
                  {day}
                </div>
              ))}

              {/* Días del mes */}
              {(() => {
                const year = currentMonth.getFullYear()
                const month = currentMonth.getMonth()
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

                return days.map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = day.date.toDateString() === selectedDate.toDateString()
                  const dayJobs = filteredJobs.filter(job => {
                    const jobDate = new Date(job.scheduledAt)
                    const jobYear = jobDate.getFullYear()
                    const jobMonth = jobDate.getMonth()
                    const jobDay = jobDate.getDate()

                    const dayYear = day.date.getFullYear()
                    const dayMonth = day.date.getMonth()
                    const dayDay = day.date.getDate()

                    return jobYear === dayYear && jobMonth === dayMonth && jobDay === dayDay
                  })

                  return (
                    <div
                      key={index}
                      onClick={() => selectDateAndCloseMenu(day.date)}
                      className={`p-2 text-center cursor-pointer transition-colors relative border-r border-slate-200 last:border-r-0 border-b border-slate-200 ${isToday
                        ? 'bg-blue-500 text-white font-bold'
                        : isSelected
                          ? 'bg-blue-100 text-blue-900 font-bold border-2 border-blue-500'
                          : day.isCurrentMonth
                            ? 'bg-white text-slate-800 hover:bg-slate-100'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                    >
                      <span className="text-sm font-medium">{day.date.getDate()}</span>
                      {isToday && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                      )}
                      {dayJobs.length > 0 && !isToday && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white shadow-sm"></div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>

        {/* Mini Calendario - Próximo Mes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {nextMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateNextMonth('prev')}
                className="h-6 w-6 p-0 hover:bg-blue-50 border-blue-200"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateNextMonth('next')}
                className="h-6 w-6 p-0 hover:bg-blue-50 border-blue-200"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 gap-0 text-xs">
              {/* Días de la semana */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center font-bold text-slate-500 bg-slate-50 border-r border-slate-200 last:border-r-0">
                  {day}
                </div>
              ))}

              {/* Días del mes */}
              {(() => {
                const year = nextMonth.getFullYear()
                const month = nextMonth.getMonth()
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

                return days.map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = day.date.toDateString() === selectedDate.toDateString()
                  const dayJobs = filteredJobs.filter(job => {
                    const jobDate = new Date(job.scheduledAt)
                    const jobYear = jobDate.getFullYear()
                    const jobMonth = jobDate.getMonth()
                    const jobDay = jobDate.getDate()

                    const dayYear = day.date.getFullYear()
                    const dayMonth = day.date.getMonth()
                    const dayDay = day.date.getDate()

                    return jobYear === dayYear && jobMonth === dayMonth && jobDay === dayDay
                  })

                  return (
                    <div
                      key={index}
                      onClick={() => selectDateAndCloseMenu(day.date)}
                      className={`p-2 text-center cursor-pointer transition-colors relative border-r border-slate-200 last:border-r-0 border-b border-slate-200 ${isToday
                        ? 'bg-blue-500 text-white font-bold'
                        : isSelected
                          ? 'bg-blue-100 text-blue-900 font-bold border-2 border-blue-500'
                          : day.isCurrentMonth
                            ? 'bg-white text-slate-800 hover:bg-slate-100'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                    >
                      <span className="text-sm font-medium">{day.date.getDate()}</span>
                      {isToday && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                      )}
                      {dayJobs.length > 0 && !isToday && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white shadow-sm"></div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>

        {/* Información del Día Seleccionado */}
        <div className="calendar-mobile-date-info p-4 bg-blue-50 rounded-lg border border-blue-300 mb-4">
          <h4 className="calendar-mobile-date-title text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {selectedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h4>

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

      {/* Contenido Principal - Lado derecho */}
      <div className="calendar-mobile-main flex-1 p-2 md:p-4 lg:p-6 overflow-y-auto flex flex-col">
        {/* Header del Calendario - Optimizado para móviles */}
        <div className="calendar-mobile-header bg-white p-3 md:p-4 lg:p-6 rounded-xl mb-3 md:mb-4 lg:mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h1 className="calendar-mobile-header-title text-lg md:text-2xl lg:text-3xl font-bold text-slate-800 mb-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600" />
                    <span className="text-base md:text-xl lg:text-2xl">{userRole === 'tecnico' ? 'Mi Agenda' : 'Calendario'}</span>
                  </div>
                  <span className="text-sm font-normal text-slate-500">
                    {selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </h1>
                <p className="text-xs md:text-base text-slate-600 hidden md:block">
                  {userRole === 'tecnico' ? 'Visualiza tus trabajos asignados' : 'Visualiza servicios y gestiona trabajadores'}
                </p>
                {/* Información de filtros activos - Solo en desktop */}
                {(selectedTechnicianFilter !== "todos" || selectedStatus !== "todos") && (
                  <div className="mt-2 flex flex-wrap gap-2 hidden md:flex">
                    {selectedTechnicianFilter !== "todos" && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <User className="h-3 w-3 mr-1" />
                        {technicians.find(t => t.id === selectedTechnicianFilter)?.name || 'Trabajador'}
                      </Badge>
                    )}
                    {selectedStatus !== "todos" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {getStatusText(selectedStatus)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción - Optimizados para móviles */}
            <div className="flex gap-2 lg:gap-3">
              {canEditJobs() && (
                <Link href="/dashboard/schedule">
                  <Button className="calendar-mobile-new-job-btn bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2">
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Nuevo</span>
                    <span className="sm:hidden">+</span>
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setLoading(true)
                  debounce(() => {
                    debouncedFetchJobs()
                  }, 1000)()
                  fetchTechnicians()
                }}
                className="border-slate-300 hover:bg-slate-50 text-sm px-3 py-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Actualizar</span>
              </Button>

            </div>
          </div>
        </div>

        {/* Navegación de días - Optimizada para móviles */}
        <div className="calendar-mobile-main-calendar bg-white p-2 md:p-4 rounded-xl mb-2 md:mb-4 shadow-sm border border-slate-200">
          <div className="calendar-mobile-main-calendar-header flex items-center justify-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setDate(selectedDate.getDate() - 1)
                setSelectedDate(newDate)
              }}
              className="h-8 w-8 md:h-10 md:w-10 p-0 hover:bg-blue-50 border-blue-200 transition-colors touch-manipulation"
              aria-label="Día anterior"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            <div className="text-center flex-1 min-w-0">
              <p className="text-sm md:text-lg font-semibold text-slate-800 truncate">
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs md:text-sm text-slate-500">
                {selectedDate.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setDate(selectedDate.getDate() + 1)
                setSelectedDate(newDate)
              }}
              className="h-8 w-8 md:h-10 md:w-10 p-0 hover:bg-blue-50 border-blue-200 transition-colors touch-manipulation"
              aria-label="Día siguiente"
            >
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        {/* Calendario por horas - Optimizado para móviles */}
        <div className="calendar-mobile-timeline bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible relative">
          <div className="calendar-mobile-timeline-content overflow-x-auto h-auto max-h-none overflow-y-visible min-w-0">
            <table className="w-full relative h-auto max-h-none min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-10 md:w-12 p-1 text-center text-xs md:text-sm font-semibold text-slate-700 border-r border-slate-200">
                    Hora
                  </th>
                  {canViewAllJobs() && (
                    <th className="p-2 md:p-3 text-center text-xs md:text-sm font-semibold text-slate-700 border-r border-slate-200 bg-orange-50 min-w-20">
                      {/* Vista desktop */}
                      <div className="hidden md:block">
                        Sin Asignar
                        <div className="text-xs font-normal text-orange-600 mt-1">
                          {selectedStatus === "todos" ? "Pendiente" : getStatusText(selectedStatus)}
                        </div>
                      </div>
                      {/* Vista móvil */}
                      <div className="md:hidden">
                        <div className="text-xs font-bold text-slate-700">SA</div>
                        <div className="text-xs text-orange-600">P</div>
                      </div>
                    </th>
                  )}
                  {getActiveTechnicians().map((tech) => {
                    const availability = getTechnicianAvailability(tech.id)
                    // Generar nombre simplificado para móvil: primer nombre + inicial del apellido
                    const nameParts = tech.name.split(' ')
                    const firstName = nameParts[0]
                    const lastNameInitial = nameParts.length > 1 ? (nameParts[1]?.[0] || '') + '.' : ''
                    const mobileName = `${firstName} ${lastNameInitial}`.trim()

                    return (
                      <th key={tech.id} className={`p-2 md:p-3 text-center text-xs md:text-sm font-semibold text-slate-700 border-r border-slate-200 min-w-20 ${userRole === 'tecnico' ? 'w-full' : ''
                        }`}>
                        <div className="flex flex-col items-center">
                          {/* Vista desktop - mostrar nombre completo */}
                          <div className="hidden md:flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{tech.name}</span>
                            <div className={`w-2 h-2 rounded-full ${availability.isAvailable ? 'bg-green-500' : 'bg-orange-500'
                              }`} title={availability.isAvailable ? 'Disponible' : 'Ocupado'}></div>
                          </div>
                          {/* Vista móvil - mostrar primer nombre + inicial del apellido */}
                          <div className="md:hidden flex flex-col items-center">
                            <div className="text-xs font-bold text-slate-700 mb-1">{mobileName}</div>
                            <div className={`w-2 h-2 rounded-full ${availability.isAvailable ? 'bg-green-500' : 'bg-orange-500'
                              }`} title={`${tech.name} - ${availability.isAvailable ? 'Disponible' : 'Ocupado'}`}></div>
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="h-auto max-h-none">
                {timeSlots.map((time, _index) => {
                  // Debug logs removed to prevent infinite loop
                  return (
                    <tr key={time} className="calendar-mobile-time-slot border-b border-slate-100 hover:bg-slate-50 h-auto max-h-none table-row">
                      <td className="calendar-mobile-time-label w-10 md:w-12 p-1 text-xs md:text-sm font-medium text-slate-600 border-r border-slate-200 bg-slate-50 relative h-auto max-h-none table-cell">
                        {time}
                      </td>
                      {canViewAllJobs() && (
                        <td className="p-0 border-r border-slate-200 bg-orange-50/30 relative h-auto max-h-none table-cell min-w-20 w-20 md:min-w-40 md:w-40">
                          <div className="relative h-16 md:h-20 overflow-visible">
                            {(() => {
                              const unassignedJobs = getJobsForTimeAndTechnician(time, 'unassigned')
                              // Debug logs removed to prevent infinite loop

                              // Debug logs removed to prevent infinite loop
                              return unassignedJobs.map((job, index) => {
                                const position = getJobPosition(job.startTime, time)
                                const height = getJobHeight(job.startTime, job.endTime, time)
                                const isSmall = isJobCardSmall(job.startTime, job.endTime, time)
                                const spanInfo = getJobSpanHeight(job.startTime, job.endTime, time)
                                const columnInfo = getJobColumnPosition(unassignedJobs, job, time)

                                // Solo renderizar si es el slot de inicio o si el trabajo abarca este slot
                                if (!spanInfo.isStartingSlot && spanInfo.height === 0) {
                                  return null
                                }

                                // Calcular el ancho y posición de la columna
                                const columnWidth = 100 / columnInfo.totalColumns
                                const leftPosition = (columnInfo.column * columnWidth)

                                // Estilos especiales para trabajos parciales
                                const partialJobStyles = columnInfo.isPartial ? {
                                  border: '2px solid #fbbf24', // Borde dorado para trabajos parciales
                                  boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)',
                                  zIndex: 20 + index // Mayor z-index para aparecer por encima
                                } : {}

                                return (
                                  <div
                                    key={`unassigned-${job.id}-${time}`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      openJobModal(job)
                                    }}
                                    onTouchEnd={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      openJobModal(job)
                                    }}
                                    className={`absolute rounded cursor-pointer transition-all duration-200 hover:shadow-sm ${getJobColor(job.status)} text-white text-xs border border-white/20 flex flex-col justify-center px-1 md:px-2 py-1 ${columnInfo.isPartial ? 'ring-2 ring-yellow-400' : ''}`}
                                    style={{
                                      top: `${position}%`,
                                      left: `${leftPosition}%`,
                                      width: `${columnWidth}%`,
                                      height: spanInfo.isStartingSlot ? `${spanInfo.height}px` : `${height}%`,
                                      zIndex: columnInfo.isPartial ? 20 + index : 10 + index,
                                      ...partialJobStyles
                                    }}
                                    title={`${job.title} - ${job.client.name} (${job.startTime} - ${job.endTime})${columnInfo.isPartial ? ' - Trabajo parcial' : ''}`}
                                    data-job-id={job.id}
                                    data-job-index={index}
                                    data-job-time={time}
                                  >
                                    {isSmall ? (
                                      <div className="font-medium truncate text-xs leading-tight text-center px-1">{job.title}</div>
                                    ) : (
                                      <>
                                        <div className="font-medium truncate text-xs leading-tight">{job.title}</div>
                                        <div className="text-xs opacity-90 truncate leading-tight hidden md:block">{job.client.name}</div>
                                        <div className="text-xs opacity-75 font-mono leading-tight hidden md:block">{job.startTime}-{job.endTime}</div>
                                      </>
                                    )}
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        </td>
                      )}
                      {getActiveTechnicians().map((tech) => (
                        <td key={tech.id} className={`p-0 border-r border-slate-200 relative h-auto max-h-none table-cell min-w-20 w-20 md:min-w-40 md:w-40 ${userRole === 'tecnico' ? 'w-full' : ''
                          }`}>
                          <div className="relative h-16 md:h-20 overflow-visible">
                            {/* Línea roja para la hora actual en columnas de técnicos */}
                            {isCurrentTimeInSlot(time) && (
                              <div
                                className="absolute left-0 right-0 h-0.5 bg-red-500 z-50"
                                style={{
                                  top: `${getCurrentTimePosition()}%`,
                                  boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)'
                                }}
                                title={`Hora actual: ${new Date(getCurrentTimeInChile()).toLocaleTimeString('es-CL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'America/Santiago'
                                })}`}
                              />
                            )}
                            {(() => {
                              const techJobs = getJobsForTimeAndTechnician(time, tech.id)
                              // Debug logs removed to prevent infinite loop
                              return techJobs.map((job, index) => {
                                const position = getJobPosition(job.startTime, time)
                                const height = getJobHeight(job.startTime, job.endTime, time)
                                const isSmall = isJobCardSmall(job.startTime, job.endTime, time)
                                const spanInfo = getJobSpanHeight(job.startTime, job.endTime, time)
                                const columnInfo = getJobColumnPosition(techJobs, job, time)

                                // Solo renderizar si es el slot de inicio o si el trabajo abarca este slot
                                if (!spanInfo.isStartingSlot && spanInfo.height === 0) {
                                  return null
                                }

                                // Calcular el ancho y posición de la columna
                                const columnWidth = 100 / columnInfo.totalColumns
                                const leftPosition = (columnInfo.column * columnWidth)

                                // Estilos especiales para trabajos parciales
                                const partialJobStyles = columnInfo.isPartial ? {
                                  border: '2px solid #fbbf24', // Borde dorado para trabajos parciales
                                  boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)',
                                  zIndex: 20 + index // Mayor z-index para aparecer por encima
                                } : {}

                                return (
                                  <div
                                    key={`tech-${tech.id}-${job.id}-${time}`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      openJobModal(job)
                                    }}
                                    onTouchEnd={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      openJobModal(job)
                                    }}
                                    className={`absolute rounded cursor-pointer transition-all duration-200 hover:shadow-sm ${getJobColor(job.status)} text-white text-xs border border-white/20 flex flex-col justify-center px-1 md:px-2 py-1 ${columnInfo.isPartial ? 'ring-2 ring-yellow-400' : ''}`}
                                    style={{
                                      top: `${position}%`,
                                      left: `${leftPosition}%`,
                                      width: `${columnWidth}%`,
                                      height: spanInfo.isStartingSlot ? `${spanInfo.height}px` : `${height}%`,
                                      zIndex: columnInfo.isPartial ? 20 + index : 10 + index,
                                      ...partialJobStyles
                                    }}
                                    title={`${job.title} - ${job.client.name} (${job.startTime} - ${job.endTime})${columnInfo.isPartial ? ' - Trabajo parcial' : ''}`}
                                    data-job-id={job.id}
                                    data-tech-id={tech.id}
                                    data-job-index={index}
                                    data-job-time={time}
                                  >
                                    {isSmall ? (
                                      <div className="font-medium truncate text-xs leading-tight text-center px-1">{job.title}</div>
                                    ) : (
                                      <>
                                        <div className="font-medium truncate text-xs leading-tight">{job.title}</div>
                                        <div className="text-xs opacity-90 truncate leading-tight hidden md:block">{job.client.name}</div>
                                        <div className="text-xs opacity-75 font-mono leading-tight hidden md:block">{job.startTime}-{job.endTime}</div>
                                      </>
                                    )}
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal de detalles del trabajo */}
        {showJobModal && selectedJob && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 ${isMobile
              ? 'flex flex-col'
              : 'flex items-center justify-center p-2 sm:p-4'
              }`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeJobModal()
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: isMobile ? 'stretch' : 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              className={`bg-white shadow-xl overflow-y-auto relative ${isMobile
                ? 'w-full h-full rounded-none'
                : 'rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh]'
                }`}
              style={{
                backgroundColor: 'white',
                borderRadius: isMobile ? '0' : '0.75rem',
                boxShadow: isMobile ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                width: '100%',
                maxWidth: isMobile ? '100%' : '56rem',
                maxHeight: isMobile ? '100vh' : '95vh',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 100000
              }}
            >
              <div className={`${isMobile ? 'p-4' : 'p-4 sm:p-6'}`}>
                {/* Header del modal */}
                <div className={`flex items-center justify-between mb-4 ${isMobile ? 'sticky top-0 bg-white z-10 pb-4 border-b border-gray-200' : ''}`}>
                  <h2 className={`font-bold text-slate-800 ${isMobile ? 'text-lg' : 'text-lg sm:text-xl'}`}>
                    Detalles del Trabajo
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeJobModal}
                    className={`${isMobile ? 'h-10 w-10 text-lg' : 'h-8 w-8 p-0'}`}
                  >
                    {isMobile ? '✕' : '×'}
                  </Button>
                </div>

                <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'}`}>
                  {/* Contenido principal - en móvil se muestra como pila vertical */}
                  <div className={`${isMobile ? 'space-y-6' : 'space-y-6'}`}>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">Información General</h3>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{selectedJob.title}</span>
                        </div>
                        <p className="text-sm text-slate-600">{selectedJob.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getJobColor(selectedJob.status)} text-white`}>
                            {getStatusText(selectedJob.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">Cliente</h3>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{selectedJob.client.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{selectedJob.client.phone}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 h-6 px-2 text-xs flex-shrink-0"
                            onClick={() => {
                              const phoneNumber = selectedJob.client.phone.replace(/\D/g, '')
                              const whatsappUrl = `https://wa.me/56${phoneNumber}`
                              window.open(whatsappUrl, '_blank')
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">WhatsApp</span>
                            <span className="sm:hidden">WA</span>
                          </Button>
                        </div>
                        {selectedJob.client.address && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedJob.client.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Horario</h3>
                        {canEditJobs(selectedJob?.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditDateTime}
                            disabled={isEditingDateTime}
                            className="h-7 px-2 text-xs gap-1 flex-shrink-0"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="hidden sm:inline">{isEditingDateTime ? "Editando..." : "Editar"}</span>
                            <span className="sm:hidden">{isEditingDateTime ? "..." : "Ed"}</span>
                          </Button>
                        )}
                      </div>

                      {isEditingDateTime ? (
                        <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Fecha</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-700">Hora de inicio</label>
                              <input
                                type="time"
                                value={editStartTime}
                                onChange={(e) => setEditStartTime(e.target.value)}
                                min="08:00"
                                max="19:00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-700">Hora de fin</label>
                              <input
                                type="time"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                min="08:00"
                                max="19:00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditDateTime}
                              disabled={isSavingDateTime}
                              className="flex-1 text-xs"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveDateTime}
                              disabled={isSavingDateTime}
                              className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              {isSavingDateTime ? (
                                <div className="flex items-center gap-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Guardando...
                                </div>
                              ) : (
                                "Guardar"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{selectedJob.startTime} - {selectedJob.endTime}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">Trabajador Asignado</h3>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        {selectedJob.technician ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{selectedJob.technician.name}</span>
                            </div>
                            {canEditJobs(selectedJob?.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={openTechnicianModal}
                                className="flex-shrink-0"
                              >
                                <User className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Cambiar</span>
                                <span className="sm:hidden">Cam</span>
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Sin asignar</span>
                            {canEditJobs(selectedJob?.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={openTechnicianModal}
                                className="flex-shrink-0"
                              >
                                <User className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Asignar</span>
                                <span className="sm:hidden">Asig</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha - en móvil se muestra después de la izquierda */}
                  <div className={`${isMobile ? 'space-y-6' : 'space-y-4 sm:space-y-6'}`}>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">Estado del Trabajo</h3>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <Select
                          value={selectedJob.status}
                          onValueChange={async (newStatus) => {
                            if (isUpdatingStatus) return // Prevenir múltiples actualizaciones

                            // Validar que el nuevo estado sea diferente al actual
                            if (newStatus === selectedJob.status) {
                              return
                            }

                            // Validar permisos según el rol del usuario
                            const userRole = currentUser?.role?.toLowerCase()
                            if (userRole === 'tecnico' && selectedJob.technician?.id !== currentUser?.id) {
                              _setStatusUpdateMessage({
                                type: 'error',
                                message: 'Solo puedes modificar el estado de tus trabajos asignados'
                              })
                              setTimeout(() => _setStatusUpdateMessage(null), 5000)
                              return
                            }

                            setIsUpdatingStatus(true)
                            _setStatusUpdateMessage(null)

                            try {
                              const response = await fetch(`/api/jobs/${selectedJob.id}/status`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ status: newStatus }),
                              })

                              const result = await response.json()

                              if (response.ok) {
                                // Actualizar el trabajo en el estado local
                                setJobs(prevJobs =>
                                  prevJobs.map(job =>
                                    job.id === selectedJob.id
                                      ? { ...job, status: newStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }
                                      : job
                                  )
                                )
                                setSelectedJob({ ...selectedJob, status: newStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' })

                                // Mostrar mensaje de éxito
                                _setStatusUpdateMessage({
                                  type: 'success',
                                  message: result.message || 'Estado actualizado correctamente'
                                })

                                // Limpiar mensaje después de 3 segundos
                                setTimeout(() => _setStatusUpdateMessage(null), 3000)
                              } else {
                                _setStatusUpdateMessage({
                                  type: 'error',
                                  message: result.error || 'Error al actualizar el estado'
                                })

                                // Limpiar mensaje después de 5 segundos
                                setTimeout(() => _setStatusUpdateMessage(null), 5000)
                              }
                            } catch (error) {

                              _setStatusUpdateMessage({
                                type: 'error',
                                message: 'Error de conexión. Intenta nuevamente.'
                              })

                              // Limpiar mensaje después de 5 segundos
                              setTimeout(() => _setStatusUpdateMessage(null), 5000)
                            } finally {
                              setIsUpdatingStatus(false)
                            }
                          }}
                          disabled={isUpdatingStatus}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                            <SelectItem value="COMPLETED">Completado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Indicador de carga */}
                        {isUpdatingStatus && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                            Actualizando estado...
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">Información de Pago</h3>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estado de pago:</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={
                              jobPayment?.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }>
                              {jobPayment?.isPaid ? 'Pagado' : 'Pendiente'}
                            </Badge>
                            {canEditJobs(selectedJob?.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs flex-shrink-0"
                                onClick={() => openPaymentMethodModal(!jobPayment?.isPaid)}
                                disabled={isUpdatingPayment}
                              >
                                {isUpdatingPayment ? (
                                  <div className="flex items-center gap-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                    <span className="hidden sm:inline">{jobPayment?.isPaid ? 'Marcando Pendiente...' : 'Marcando Pagado...'}</span>
                                    <span className="sm:hidden">{jobPayment?.isPaid ? 'Pend...' : 'Pag...'}</span>
                                  </div>
                                ) : (
                                  <>
                                    <span className="hidden sm:inline">{jobPayment?.isPaid ? 'Marcar Pendiente' : 'Marcar Pagado'}</span>
                                    <span className="sm:hidden">{jobPayment?.isPaid ? 'Pend' : 'Pag'}</span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Presupuesto:</span>
                          <span className="font-medium">${selectedJob?.totalBudget?.toLocaleString() || jobPayment?.budget?.toLocaleString() || jobQuote?.total?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pagado:</span>
                          <span className="font-medium text-green-600">${jobPayment?.paidAmount?.toLocaleString() || '0'}</span>
                        </div>
                        {jobPayment?.isPaid && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Método:</span>
                            <span className="text-sm">{translatePaymentMethodToSpanish(jobPayment?.paymentMethod || 'efectivo')}</span>
                          </div>
                        )}

                        {/* Mensaje de estado para información de pago */}
                        {paymentUpdateMessage && (
                          <div className={`mt-3 p-2 rounded-md text-sm ${paymentUpdateMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            <div className="flex items-center gap-2">
                              {paymentUpdateMessage.type === 'success' ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                              {paymentUpdateMessage.message}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción - optimizados para móvil */}
                <div className={`flex gap-3 pt-6 border-t ${isMobile ? 'flex-col sticky bottom-0 bg-white' : 'flex-col sm:flex-row'}`}>
                  <Button
                    variant="outline"
                    className={`flex-1 ${isMobile ? 'order-2 h-12 text-base' : 'order-2 sm:order-1'}`}
                    onClick={closeJobModal}
                  >
                    {isMobile ? '✕ Cerrar' : 'Cerrar'}
                  </Button>
                  {canEditJobs(selectedJob?.id) && (
                    <Button
                      className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white ${isMobile ? 'order-1 h-12 text-base' : 'order-1 sm:order-2'}`}
                      onClick={() => {
                        // Navegar a la página de edición del trabajo
                        window.location.href = `/dashboard/schedule?edit=${selectedJob.id}`
                      }}
                    >
                      <Edit className={`${isMobile ? 'h-5 w-5 mr-2' : 'h-4 w-4 mr-2'}`} />
                      {isMobile ? '✏️ Editar Trabajo' : 'Editar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Reasignación de Técnico */}
        {showTechnicianModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeTechnicianModal}
                  className="absolute top-4 right-4 h-8 w-8 p-0"
                >
                  ×
                </Button>

                <div className="pr-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🔧 {selectedJob?.technician?.id ? "Cambiar Técnico" : "Asignar Técnico"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Selecciona un técnico disponible para este trabajo.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Lista de Técnicos */}
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
                    <div className="space-y-2">
                      {availableTechnicians.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-gray-500 font-medium">No hay técnicos disponibles</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Esto puede deberse a que todos los técnicos están ocupados en este horario
                          </p>
                          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Información del trabajo:</strong><br />
                              Fecha: {selectedJob?.scheduledAt ? new Date(selectedJob.scheduledAt).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }) : 'N/A'}<br />
                              Horario: {selectedJob?.startTime} - {selectedJob?.endTime}
                            </p>
                          </div>
                        </div>
                      ) : (
                        availableTechnicians.map((technician) => {
                          const isSelected = selectedTechnicianId === technician.id
                          const isBusy = technician.status === 'ocupado'

                          return (
                            <div
                              key={technician.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                                ? "border-gray-500 bg-gray-100"
                                : isBusy
                                  ? "border-orange-200 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                                }`}
                              onClick={() => {
                                setSelectedTechnicianId(technician.id)
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${isSelected ? "bg-gray-500" :
                                  isBusy ? "bg-orange-500" :
                                    "border-2 border-gray-300"
                                  }`}></div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {technician.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {technician.email}
                                  </div>
                                  {isBusy && technician.conflictReason && (
                                    <div className="text-xs text-orange-600 mt-1">
                                      ⚠️ {technician.conflictReason}
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeTechnicianModal}
                  className="flex-1"
                  disabled={isAssigningTechnician}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={assignTechnician}
                  disabled={!selectedTechnicianId || isAssigningTechnician}
                  className={`flex-1 ${!selectedTechnicianId || isAssigningTechnician
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                >
                  {isAssigningTechnician ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Asignando...</span>
                    </div>
                  ) : !selectedTechnicianId ? (
                    <span>Selecciona un técnico</span>
                  ) : (
                    <span>Asignar Técnico</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Selección de Método de Pago */}
        {showPaymentMethodModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200 bg-blue-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePaymentMethodModal}
                  className="absolute top-4 right-4 h-8 w-8 p-0"
                >
                  ×
                </Button>

                <div className="pr-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    💰 {pendingPaymentStatus ? "Marcar como Pagado" : "Marcar como Pendiente"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Selecciona el método de pago para este trabajo.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Información del trabajo */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Trabajo: {selectedJob?.title}</div>
                  <div className="text-sm text-gray-600">Cliente: {selectedJob?.client?.name}</div>
                  <div className="text-sm font-medium">Monto: ${selectedJob?.totalBudget?.toLocaleString() || '0'}</div>
                </div>

                {/* Selección de método de pago */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Método de Pago
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'efectivo', label: 'Efectivo', icon: '💵' },
                      { value: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
                      { value: 'tarjeta', label: 'Tarjeta de Débito/Crédito', icon: '💳' },
                      { value: 'cheque', label: 'Cheque', icon: '📄' }
                    ].map((method) => (
                      <div
                        key={method.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedPaymentMethod === method.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => setSelectedPaymentMethod(method.value)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedPaymentMethod === method.value ? "bg-blue-500" : "border-2 border-gray-300"
                            }`}></div>
                          <span className="text-lg">{method.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {method.label}
                            </div>
                          </div>
                          {selectedPaymentMethod === method.value && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  onClick={closePaymentMethodModal}
                  className="flex-1"
                  disabled={isUpdatingPayment}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmPaymentMethod}
                  disabled={isUpdatingPayment}
                  className={`flex-1 ${isUpdatingPayment
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                >
                  {isUpdatingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <span>Confirmar</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estilos CSS específicos para móviles */}
      <style jsx>{`
        .calendar-mobile-container {
          position: relative;
        }

        .calendar-mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .calendar-mobile-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .calendar-mobile-sidebar {
          position: fixed;
          top: 0;
          left: -100%;
          width: 100%;
          max-width: 320px;
          height: 100vh;
          z-index: 50;
          transition: left 0.3s ease;
          overflow-y: auto;
          display: block;
        }

        .calendar-mobile-sidebar.open {
          left: 0;
        }

        @media (min-width: 768px) {
          .calendar-mobile-sidebar {
            position: static;
            left: auto;
            width: auto;
            height: auto;
            max-width: none;
            z-index: auto;
            transition: none;
          }
        }

        .calendar-mobile-timeline-content {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        .calendar-mobile-timeline-content::-webkit-scrollbar {
          height: 6px;
        }

        .calendar-mobile-timeline-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .calendar-mobile-timeline-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .calendar-mobile-timeline-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Optimizaciones para touch en móviles */
        @media (max-width: 767px) {
          .calendar-mobile-time-slot {
            min-height: 64px;
          }

          .calendar-mobile-time-label {
            font-size: 0.75rem;
            padding: 0.25rem;
          }

          /* Mejorar la experiencia táctil */
          .calendar-mobile-timeline-content table {
            touch-action: pan-x;
          }

          /* Asegurar que los elementos sean tocables */
          .calendar-mobile-timeline-content [data-job-id] {
            min-height: 32px;
            min-width: 40px;
          }
        }
      `}</style>
    </div>
  )
}