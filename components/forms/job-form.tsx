"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useScheduleValidation } from "@/hooks/use-schedule-validation"
import { useToast } from "@/hooks/use-toast"
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, Building, CheckCircle, Clock, MapPin, Plus, User, Wrench } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from "react"

interface JobFormProps {
  job?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function JobForm({ job, onSubmit, onCancel, loading = false }: JobFormProps) {
  try {
    // Usar el mapeo completo de regiones y comunas
    const regionCommuneMap = useMemo(() => REGIONES_Y_COMUNAS, []);

    const [formData, setFormData] = useState({
      description: "",
      clientId: "",
      serviceName: "",
      serviceId: "",
      companyId: "",
      assignedToId: "tecnico-generico",
      scheduledAt: null as Date | null,
      startTime: "",
      endTime: "",
      totalBudget: "" as string | number,
      priority: "MEDIUM" as string
    })

    // Estado para mostrar nombres de elementos seleccionados
    const [selectedClientName, setSelectedClientName] = useState("")
    const [selectedCompanyName, setSelectedCompanyName] = useState("")
    const [selectedTechnicianName, setSelectedTechnicianName] = useState("")

    // Estado para el tipo de servicio seleccionado
    const [serviceType, setServiceType] = useState<"predetermined" | "custom">("predetermined")
    const [selectedPredeterminedService, setSelectedPredeterminedService] = useState("")

    // Servicios predeterminados
    const predeterminedServices = useMemo(() => [
      "Detección de fugas de agua",
      "Destape de alcantarillado",
      "Video inspección de ductos"
    ], [])

    // Estado para el formulario de cliente nuevo
    const [showNewClientForm, setShowNewClientForm] = useState(false)
    const [newClientData, setNewClientData] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      rut: "",
      region: "",
      commune: ""
    })
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [clients, setClients] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const [technicians, setTechnicians] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
    const [paymentInfo, setPaymentInfo] = useState<any>(null)
    const [dataLoadErrors, setDataLoadErrors] = useState<{
      clients: boolean
      companies: boolean
      technicians: boolean
    }>({
      clients: false,
      companies: false,
      technicians: false
    })
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'unknown'>('unknown')

    // Hook para validación de horarios
    const { validateSchedule, clearValidation, isValidating, validationResult } = useScheduleValidation()

    // Hook para notificaciones
    const { toast } = useToast()

    // Memoizar los arrays para evitar re-renderizados innecesarios
    const memoizedClients = useMemo(() => clients, [clients])
    const memoizedTechnicians = useMemo(() => technicians, [technicians])

    // Función para cargar información de pago
    const loadPaymentInfo = async (jobId: string) => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/payment`)
        if (response.ok) {
          const data = await response.json()

          if (data.hasPayment && data.payment) {
            setPaymentInfo({
              isPaid: data.payment.status === 'PAID',
              paidAmount: data.payment.status === 'PAID' ? data.payment.amount : 0,
              paymentMethod: data.payment.method?.toLowerCase() || 'efectivo',
              budget: data.payment.amount || 0,
              status: data.payment.status,
              method: data.payment.method,
              amount: data.payment.amount
            })
          } else {
            setPaymentInfo({
              isPaid: false,
              paidAmount: 0,
              paymentMethod: 'efectivo',
              budget: 0,
              status: 'PENDING',
              method: 'CASH',
              amount: 0
            })
          }
        }
      } catch (error) {

      }
    }

    // Función para inicializar el formulario con datos del trabajo
    const initializeFormWithJob = useCallback((jobData: any) => {

      // Manejar la fecha correctamente para evitar problemas de zona horaria
      let scheduledDate = null
      if (jobData.scheduledAt) {
        const jobDate = new Date(jobData.scheduledAt)
        // Crear la fecha usando componentes individuales para evitar problemas de zona horaria
        const year = jobDate.getFullYear()
        const month = jobDate.getMonth()
        const day = jobDate.getDate()
        if (year && month && day) {
          scheduledDate = new Date(year, month, day, 0, 0, 0, 0)
        }
      }

      const serviceName = jobData.service?.name || jobData.serviceName || jobData.title || "";

      // Determinar si el servicio es predeterminado o personalizado
      const isPredetermined = predeterminedServices.includes(serviceName);

      const initialFormData = {
        description: jobData.description || "",
        clientId: jobData.client?.id || jobData.clientId || "",
        serviceName: serviceName,
        companyId: jobData.companyId || "",
        assignedToId: jobData.technician?.id || jobData.technicianId || "tecnico-generico",
        scheduledAt: scheduledDate,
        startTime: jobData.startTime || "",
        endTime: jobData.endTime || "",
        totalBudget: jobData.totalBudget !== null && jobData.totalBudget !== undefined && jobData.totalBudget > 0 ? String(jobData.totalBudget) : ""
      };

      const finalFormData = {
        ...initialFormData,
        serviceId: jobData.serviceId || "",
        priority: jobData.priority || "MEDIUM"
      };

      setFormData(finalFormData);

      // Configurar el tipo de servicio
      setServiceType(isPredetermined ? "predetermined" : "custom");
      setSelectedPredeterminedService(isPredetermined ? serviceName : "");

      // Establecer nombres de elementos seleccionados
      setSelectedClientName(jobData.client?.name || "");
      setSelectedCompanyName(jobData.company?.name || "");
      setSelectedTechnicianName(jobData.technician?.name || "");

      setErrors({})
      clearValidation()
    }, [clearValidation, predeterminedServices])

    const loadAllData = useCallback(async () => {
      setLoadingData(true)
      setDataLoadErrors({
        clients: false,
        companies: false,
        technicians: false
      })

      try {

        // Cargar en paralelo para mayor velocidad
        const [clientsRes, companiesRes, techniciansRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/companies"),
          fetch("/api/workers/technicians")
        ])

        // Verificar respuestas HTTP
        const clientsOk = clientsRes.ok
        const companiesOk = companiesRes.ok
        const techniciansOk = techniciansRes.ok

        const clientsData = clientsOk ? await clientsRes.json() : null
        const companiesData = companiesOk ? await companiesRes.json() : null
        const techniciansData = techniciansOk ? await techniciansRes.json() : null

        // Procesar clientes
        if (clientsData && Array.isArray(clientsData)) {
          const activeClients = clientsData.filter((client: any) => client.status === 'active')
          setClients(activeClients)

        } else {

          setDataLoadErrors(prev => ({ ...prev, clients: true }))
          setClients([])
        }

        // Procesar empresas
        if (companiesData && Array.isArray(companiesData)) {
          // Filtrar empresas duplicadas por nombre (incluyendo variaciones de "Amestica")
          const uniqueCompanies = companiesData.filter((company: any, index: number, self: any[]) => {
            const currentName = company.name.toLowerCase().trim()

            // Buscar si ya existe una empresa similar
            const existingIndex = self.findIndex((c: any) => {
              const existingName = c.name.toLowerCase().trim()

              // Si es Amestica, considerar ambas variaciones como la misma empresa
              if (currentName.includes('amestica') && existingName.includes('amestica')) {
                return true
              }

              // Para otras empresas, comparación exacta
              return existingName === currentName
            })

            // Solo incluir si es la primera ocurrencia o si es Amestica y no hay otra Amestica ya incluida
            if (existingIndex === index) {
              return true
            }

            // Si es Amestica y ya hay otra Amestica incluida, no incluir esta
            if (currentName.includes('amestica')) {
              return false
            }

            return true
          })

          setCompanies(uniqueCompanies)

          // Establecer empresa por defecto (Amestica) si no hay trabajo para editar
          if (!job?.id && uniqueCompanies.length > 0) {
            const defaultCompany = uniqueCompanies.find((c: any) =>
              c.name.toLowerCase().includes('amestica')
            )
            if (defaultCompany) {
              setFormData(prev => ({
                ...prev,
                companyId: defaultCompany.id
              }))

            }
          }
        } else {

          setDataLoadErrors(prev => ({ ...prev, companies: true }))
          setCompanies([])
        }

        // Procesar técnicos
        if (techniciansData && Array.isArray(techniciansData)) {
          const activeTechnicians = techniciansData.filter((w: any) =>
            w.isActive && (w.role === 'TECNICO' || w.role === 'tecnico')
          )

          setTechnicians(activeTechnicians)
        } else {

          setDataLoadErrors(prev => ({ ...prev, technicians: true }))
          setTechnicians([])
        }

        // Si hay un trabajo para editar, inicializar el formulario después de cargar los datos
        if (job) {

          // Usar la función de inicialización después de un pequeño delay para asegurar que los datos estén listos
          setTimeout(() => {
            initializeFormWithJob(job);
          }, 100);
        }
      } catch (error) {

        // Marcar todos como errores si hay un error general
        setDataLoadErrors({
          clients: true,
          companies: true,
          technicians: true
        })

        // Mostrar mensaje de error más específico
        if (error instanceof TypeError && error.message.includes('fetch')) {

        } else {

        }
      } finally {
        setLoadingData(false)

      }
    }, [initializeFormWithJob, clients.length, companies.length, dataLoadErrors, job, technicians.length])

    // Cargar datos al montar el componente
    useEffect(() => {
      loadAllData()
    }, [loadAllData]) // Solo ejecutar una vez al montar

    // Cargar información de pago cuando se abre el modal con un trabajo existente
    useEffect(() => {
      if (job?.id) {
        loadPaymentInfo(job.id)
      }
    }, [job?.id])

    // Actualizar formulario cuando se edita un trabajo
    useEffect(() => {
      if (job && !loadingData) {

        initializeFormWithJob(job)
      } else if (!job && !loadingData) {
        // Resetear formulario si no hay trabajo para editar
        setFormData({
          description: "",
          clientId: "",
          serviceName: "",
          serviceId: "",
          companyId: "", // Se establecerá automáticamente cuando se carguen las empresas
          assignedToId: "tecnico-generico",
          scheduledAt: null,
          startTime: "",
          endTime: "",
          totalBudget: "",
          priority: "MEDIUM"
        })
        setServiceType("predetermined")
        setSelectedPredeterminedService("")
        setErrors({})
        clearValidation()
      }
    }, [job?.id, loadingData, initializeFormWithJob, clearValidation, job])

    // Efecto para asegurar que el presupuesto se cargue correctamente
    useEffect(() => {
      if (job && job.totalBudget !== null && job.totalBudget !== undefined && job.totalBudget > 0 &&
        (formData.totalBudget === "" || formData.totalBudget !== String(job.totalBudget))) {
        setFormData(prev => ({
          ...prev,
          totalBudget: String(job.totalBudget)
        }))
      }
    }, [job?.totalBudget, formData.totalBudget, job])

    // Validación en tiempo real de conflictos de horarios
    useEffect(() => {
      const timeoutId = setTimeout(async () => {
        if (formData.assignedToId && formData.assignedToId !== "tecnico-generico" &&
          formData.scheduledAt && formData.startTime && formData.endTime) {
          await validateSchedule(
            formData.assignedToId,
            formData.scheduledAt,
            formData.startTime,
            formData.endTime,
            job?.id
          )
        }
      }, 1000) // Debounce de 1 segundo

      return () => clearTimeout(timeoutId)
    }, [formData.assignedToId, formData.scheduledAt, formData.startTime, formData.endTime, job?.id, validateSchedule])

    // Función para validar conflictos de horarios
    const validateScheduleConflict = async () => {
      if (!formData.assignedToId || formData.assignedToId === "tecnico-generico" ||
        !formData.scheduledAt || !formData.startTime || !formData.endTime) {
        return true // No hay conflicto si faltan datos
      }

      const result = await validateSchedule(
        formData.assignedToId,
        formData.scheduledAt,
        formData.startTime,
        formData.endTime,
        job?.id
      )

      return !result.hasConflict
    }

    // Función para verificar el estado de conexión
    const checkConnectionStatus = useCallback(async () => {
      setConnectionStatus('checking')
      try {
        const response = await fetch('/api/health')
        const data = await response.json()

        if (response.ok && data.status === 'healthy') {
          setConnectionStatus('connected')

          // Si la conexión es exitosa, intentar recargar los datos automáticamente
          if (dataLoadErrors.clients || dataLoadErrors.companies || dataLoadErrors.technicians) {

            await loadAllData()
          }
        } else {
          setConnectionStatus('disconnected')

        }
      } catch (error) {
        setConnectionStatus('disconnected')

      }
    }, [dataLoadErrors, loadAllData])

    const validateForm = () => {
      const newErrors: Record<string, string> = {}

      if (!formData.clientId) {
        newErrors.clientId = "Debe seleccionar un cliente"
      }

      if (!formData.serviceName.trim()) {
        newErrors.serviceName = "Debe ingresar un servicio"
      }

      if (!formData.companyId) {
        newErrors.companyId = "Debe seleccionar una empresa"
      }

      if (!formData.scheduledAt) {
        newErrors.scheduledAt = "Debe seleccionar una fecha"
      } else {
        // Validación más precisa de fecha y hora
        const now = new Date()

        // Si es la misma fecha, validar la hora
        if (formData.scheduledAt.toDateString() === now.toDateString()) {
          if (formData.startTime) {
            const [startHour, startMinute] = formData.startTime.split(':').map(Number)
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()

            // Si la hora de inicio es anterior a la hora actual
            if (startHour && startMinute && (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute))) {
              newErrors.scheduledAt = "La hora programada no puede ser en el pasado"
            }
          }
        } else if (formData.scheduledAt < now) {
          // Si es una fecha anterior
          newErrors.scheduledAt = "La fecha programada no puede ser en el pasado"
        }
      }

      if (!formData.startTime) {
        newErrors.startTime = "Debe seleccionar hora de inicio"
      }

      if (!formData.endTime) {
        newErrors.endTime = "Debe seleccionar hora de fin"
      }

      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        newErrors.endTime = "La hora de fin debe ser posterior a la hora de inicio"
      }

      if (!formData.totalBudget || formData.totalBudget === "" || Number(formData.totalBudget) <= 0) {
        newErrors.totalBudget = "Debe ingresar un presupuesto total válido"
      }

      // Permitir crear trabajos sin asignar técnico (se irán a la columna "Técnico" del calendario)
      // if (!formData.assignedToId || formData.assignedToId === "tecnico-generico") {
      //   newErrors.assignedToId = "Debe asignar un técnico"
      // }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Evitar doble envío - verificación más robusta
      if (isSubmitting) {

        return;
      }

      // Prevenir múltiples envíos con un timestamp
      const submitTimestamp = Date.now()
      if ((window as any).lastJobSubmit && (submitTimestamp - (window as any).lastJobSubmit) < 2000) {

        return;
      }
      (window as any).lastJobSubmit = submitTimestamp

      setIsSubmitting(true)
      setErrors({})
      clearValidation()

      // Si se está mostrando el formulario de cliente nuevo, crear el cliente primero
      if (showNewClientForm) {

        const newClient = await createNewClient()
        if (!newClient) {

          setIsSubmitting(false)
          return
        }

      }

      const isFormValid = validateForm()

      if (!isFormValid) {

        setIsSubmitting(false)
        return
      }

      // Validar conflictos de horarios
      const isScheduleValid = await validateScheduleConflict()

      if (!isScheduleValid) {

        setIsSubmitting(false)
        return
      }

      try {
        // Obtener el nombre del cliente seleccionado
        const selectedClient = clients.find(c => c.id === formData.clientId)

        // Combinar fecha con hora de inicio para scheduledAt
        let combinedScheduledAt = null
        if (formData.scheduledAt && formData.startTime) {
          const [hours, minutes] = formData.startTime.split(':').map(Number)

          // Crear la fecha combinada usando la fecha seleccionada
          // Usar los componentes de fecha directamente para evitar problemas de zona horaria
          const year = formData.scheduledAt.getFullYear()
          const month = formData.scheduledAt.getMonth()
          const day = formData.scheduledAt.getDate()

          const combinedDate = new Date(year, month, day, hours, minutes, 0, 0)

          // Convertir a ISO string
          combinedScheduledAt = combinedDate.toISOString()
        }

        const jobData = {
          ...formData,
          id: job?.id, // Incluir el ID si estamos editando
          title: formData.serviceName || "Trabajo sin título",
          scheduledAt: combinedScheduledAt,
          technicianId: formData.assignedToId === "tecnico-generico" ? null : formData.assignedToId,
          clientName: selectedClient?.name || "",
          serviceName: formData.serviceName,
          // Asegurar que se envíen todos los campos requeridos
          serviceId: formData.serviceId || null,
          priority: formData.priority || "MEDIUM",
          // Asegurar que companyId esté presente
          companyId: formData.companyId || null,
          // Convertir totalBudget a número
          totalBudget: formData.totalBudget ? Number(formData.totalBudget) : null
        }

        // Debug del totalBudget antes del envío
        console.log({
          enJobData: jobData.totalBudget,
          tipoEnJobData: typeof jobData.totalBudget
        })

        await onSubmit(jobData)

        // Limpiar formulario después de guardar exitosamente
        // La empresa por defecto se establecerá cuando se carguen los datos
        setFormData({
          description: "",
          clientId: "",
          serviceName: "",
          serviceId: "",
          companyId: "", // Se establecerá automáticamente cuando se carguen las empresas
          assignedToId: "tecnico-generico",
          scheduledAt: null,
          startTime: "",
          endTime: "",
          totalBudget: "",
          priority: "MEDIUM"
        })
        setServiceType("predetermined")
        setSelectedPredeterminedService("")
        setErrors({})

      } catch (error) {

        const errorMessage = error instanceof Error ? error.message : "Error al guardar el trabajo"
        setErrors({ submit: errorMessage })
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleChange = useCallback((field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }))
      }

      // Actualizar nombres seleccionados
      if (field === "clientId") {
        const selectedClient = memoizedClients.find(c => c.id === value)
        setSelectedClientName(selectedClient?.name || "")
      } else if (field === "companyId") {
        const selectedCompany = companies.find(c => c.id === value)
        setSelectedCompanyName(selectedCompany?.name || "")
      } else if (field === "assignedToId") {
        const selectedTechnician = technicians.find(t => t.id === value)
        setSelectedTechnicianName(selectedTechnician?.name || "")
      }

      // Limpiar conflicto de horarios cuando se cambia técnico, fecha u horarios
      if (['assignedToId', 'scheduledAt', 'startTime', 'endTime'].includes(field)) {
        clearValidation()
      }
    }, [errors, memoizedClients, companies, technicians, clearValidation])

    // Función para manejar el cambio de tipo de servicio
    const handleServiceTypeChange = useCallback((type: "predetermined" | "custom") => {
      setServiceType(type)
      if (type === "predetermined") {
        setFormData(prev => ({ ...prev, serviceName: selectedPredeterminedService }))
      } else {
        setFormData(prev => ({ ...prev, serviceName: "" }))
      }
      // Limpiar error del campo
      if (errors.serviceName) {
        setErrors(prev => ({ ...prev, serviceName: "" }))
      }
    }, [selectedPredeterminedService, errors.serviceName])

    // Función para manejar la selección de servicio predeterminado
    const handlePredeterminedServiceChange = useCallback((service: string) => {
      setSelectedPredeterminedService(service)
      setFormData(prev => ({ ...prev, serviceName: service }))
      // Limpiar error del campo
      if (errors.serviceName) {
        setErrors(prev => ({ ...prev, serviceName: "" }))
      }
    }, [errors.serviceName])

    const getFieldStatus = useCallback((fieldName: string) => {
      if (errors[fieldName]) return "error"
      if (formData[fieldName as keyof typeof formData]) return "success"
      return "default"
    }, [errors, formData])

    const handleClearForm = () => {
      setFormData({
        description: "",
        clientId: "",
        serviceName: "",
        serviceId: "",
        companyId: "",
        assignedToId: "sin-asignar",
        scheduledAt: null,
        startTime: "",
        endTime: "",
        totalBudget: "",
        priority: "MEDIUM"
      })
      setServiceType("predetermined")
      setSelectedPredeterminedService("")
      setErrors({})
      setShowNewClientForm(false)
      setNewClientData({
        name: "",
        email: "",
        phone: "",
        address: "",
        rut: "",
        region: "",
        commune: ""
      })
      setClientErrors({})
    }

    const handleCancel = () => {
      if (isSubmitting) return
      onCancel()
    }

    // Funciones para manejar el formulario de cliente nuevo
    const handleNewClientChange = (field: string, value: string) => {
      setNewClientData(prev => ({ ...prev, [field]: value }))
      if (clientErrors[field]) {
        setClientErrors(prev => ({ ...prev, [field]: "" }))
      }
    }

    const validateNewClient = () => {
      const newErrors: Record<string, string> = {}

      if (!newClientData.name.trim()) {
        newErrors.name = "El nombre es requerido"
      }

      if (!newClientData.email.trim()) {
        newErrors.email = "El email es requerido"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)) {
        newErrors.email = "Email inválido"
      }

      if (!newClientData.phone.trim()) {
        newErrors.phone = "El teléfono es requerido"
      }

      if (!newClientData.address.trim()) {
        newErrors.address = "La dirección es requerida"
      }

      if (!newClientData.region) {
        newErrors.region = "La región es requerida"
      }

      if (!newClientData.commune) {
        newErrors.commune = "La comuna es requerida"
      }

      setClientErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const createNewClient = async () => {
      if (!validateNewClient()) {
        return null
      }

      try {
        // Preparar datos para envío
        const submitData = {
          ...newClientData
        };

        const response = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        })

        if (!response.ok) {
          throw new Error("Error al crear el cliente")
        }

        const newClient = await response.json()

        // Agregar el nuevo cliente a la lista
        setClients(prev => {
          const updatedClients = [newClient, ...prev]

          return updatedClients
        })

        // Seleccionar automáticamente el nuevo cliente
        handleChange("clientId", newClient.id)

        // Limpiar el formulario de cliente nuevo
        setNewClientData({
          name: "",
          email: "",
          phone: "",
          address: "",
          rut: "",
          region: "",
          commune: ""
        })
        setClientErrors({})
        setShowNewClientForm(false)

        return newClient
      } catch (error) {

        setClientErrors({ submit: "Error al crear el cliente" })
        return null
      }
    }

    // Función para marcar como pagado
    const handleMarkAsPaid = async () => {
      if (!job || !job.totalBudget || job.totalBudget <= 0) {
        toast({
          title: "Error",
          description: "No se puede marcar como pagado un trabajo sin presupuesto definido.",
          variant: "destructive"
        })
        return
      }

      setIsUpdatingPayment(true)

      try {
        const response = await fetch(`/api/jobs/${job.id}/payment-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isPaid: true,
            paymentMethod: "CASH",
            amount: job.totalBudget
          })
        })

        if (response.ok) {
          toast({
            title: "✅ Trabajo Marcado como Pagado",
            description: "El trabajo ha sido marcado como pagado y se ha registrado automáticamente en la sección de cajas correspondiente al mes y año actual.",
          })

          // Actualizar el estado local de información de pago
          setPaymentInfo((prev: any) => ({
            ...prev,
            isPaid: true,
            paidAmount: job.totalBudget,
            status: 'PAID'
          }))

          // Actualizar el trabajo localmente
          if (onSubmit) {
            const updatedJob = {
              ...job,
              paymentStatus: "PAID" as const,
              payment: {
                ...job.payment,
                amount: job.totalBudget,
                status: "PAID"
              }
            }
            onSubmit(updatedJob)
          }
        } else {
          const error = await response.json()
          toast({
            title: "Error",
            description: error.error || "Error al marcar como pagado",
            variant: "destructive"
          })
        }
      } catch (error) {

        toast({
          title: "Error",
          description: "Error de conexión al marcar como pagado",
          variant: "destructive"
        })
      } finally {
        setIsUpdatingPayment(false)
      }
    }

    // Verificar si hay errores críticos
    if (dataLoadErrors.clients && dataLoadErrors.companies && dataLoadErrors.technicians) {
      return (
        <div className="w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 min-h-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Error de Conexión</h2>
              <p className="text-base text-slate-600 mb-4">No se pudieron cargar los datos necesarios</p>
              <Button onClick={loadAllData} className="bg-blue-600 hover:bg-blue-700">
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 min-h-0">
        {loadingData && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-base text-slate-600 font-medium">Cargando datos...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Header del formulario - Fijo en la parte superior */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg shadow-slate-200/50 mb-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {job ? 'Editar Trabajo' : 'Crear Nuevo Trabajo'}
              </h1>
              <p className="text-slate-600 text-base">
                {job ? 'Modifica los detalles del trabajo existente' : 'Completa el formulario para programar un nuevo trabajo'}
              </p>

              {/* Indicador de estado de conexión */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'disconnected' ? 'bg-red-500' :
                    connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                      'bg-gray-400'
                  }`}></div>
                <span className="text-xs text-slate-500">
                  {connectionStatus === 'connected' ? 'Conexión estable' :
                    connectionStatus === 'disconnected' ? 'Sin conexión' :
                      connectionStatus === 'checking' ? 'Verificando conexión...' :
                        'Estado desconocido'}
                </span>
              </div>
              {!loadingData && (dataLoadErrors.clients || dataLoadErrors.companies || dataLoadErrors.technicians) && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">
                        ⚠️ Algunos datos no se cargaron correctamente
                      </p>
                      <div className="space-y-1 text-xs text-yellow-700">
                        {dataLoadErrors.clients && (
                          <p>• <strong>Clientes:</strong> No se pudieron cargar los clientes disponibles</p>
                        )}
                        {dataLoadErrors.companies && (
                          <p>• <strong>Empresas:</strong> No se pudieron cargar las empresas disponibles</p>
                        )}
                        {dataLoadErrors.technicians && (
                          <p>• <strong>Técnicos:</strong> No se pudieron cargar los técnicos disponibles</p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadAllData}
                          disabled={loadingData}
                          className="text-yellow-700 border-yellow-300 hover:bg-yellow-100 flex-1"
                        >
                          {loadingData ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600 mr-2"></div>
                              Cargando...
                            </>
                          ) : (
                            '🔄 Recargar Datos'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={checkConnectionStatus}
                          disabled={connectionStatus === 'checking'}
                          className="text-blue-700 border-blue-300 hover:bg-blue-100 flex-1"
                        >
                          {connectionStatus === 'checking' ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
                              Verificando...
                            </>
                          ) : (
                            '🔍 Verificar Conexión'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenido del formulario con scroll */}
          <div className="flex-1 overflow-y-auto space-y-6 p-1 notebook-form-content">
            {/* Sección 1: Información del Cliente y Servicio */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Información del Cliente y Servicio</h2>
                    <p className="text-slate-600">Selecciona el cliente y el servicio a realizar</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-4">
                  <Label htmlFor="clientId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Cliente
                    <span className="text-red-500 font-bold">*</span>
                  </Label>

                  {!showNewClientForm ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Select
                          value={formData.clientId}
                          onValueChange={(value: string) => handleChange("clientId", value)}
                          disabled={loadingData}
                        >
                          <SelectTrigger
                            className={cn(
                              "pl-12 pr-4 text-base border-2 rounded-xl transition-all duration-200 font-medium",
                              "focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm",
                              getFieldStatus("clientId") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                              getFieldStatus("clientId") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                            )}
                          >
                            <SelectValue
                              placeholder={loadingData ? "Cargando..." : "Seleccionar cliente"}
                              className="text-slate-600"
                            >
                              {selectedClientName || (formData.clientId ?
                                memoizedClients.find(c => c.id === formData.clientId)?.name || "Cliente seleccionado"
                                : "Seleccionar cliente")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white" position="popper">
                            {memoizedClients.length === 0 ? (
                              <div className="p-6 text-center text-slate-500">
                                <User className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                <p className="font-medium">No hay clientes disponibles</p>
                              </div>
                            ) : (
                              memoizedClients.map((client: any) => (
                                <SelectItem key={client.id} value={client.id} className="py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-semibold truncate text-slate-800">{client.name}</div>
                                      <div className="text-sm text-slate-500 truncate">{client.email}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                        {getFieldStatus("clientId") === "success" && (
                          <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewClientForm(true)}
                        className="w-full h-12 text-base font-semibold border-2 border-blue-200 rounded-xl transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md text-blue-700"
                      >
                        <Plus className="h-5 w-5 mr-3" />
                        Agregar Cliente Nuevo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-blue-900">Nuevo Cliente</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewClientForm(false)}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          ×
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newClientName" className="text-sm font-semibold text-slate-700">
                            Nombre Completo
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="newClientName"
                            type="text"
                            value={newClientData.name}
                            onChange={(e) => handleNewClientChange("name", e.target.value)}
                            placeholder="Ingresa el nombre completo"
                            className={cn(
                              "h-12 text-base border-2 rounded-xl transition-all duration-200",
                              "focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                              clientErrors.name && "border-red-500 focus:border-red-500 focus:ring-red-100"
                            )}
                          />
                          {clientErrors.name && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newClientEmail" className="text-sm font-semibold text-slate-700">
                            Email
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="newClientEmail"
                            type="email"
                            value={newClientData.email}
                            onChange={(e) => handleNewClientChange("email", e.target.value)}
                            placeholder="Ingresa el email"
                            className={cn(
                              "h-12 text-base border-2 rounded-xl transition-all duration-200",
                              "focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                              clientErrors.email && "border-red-500 focus:border-red-500 focus:ring-red-100"
                            )}
                          />
                          {clientErrors.email && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.email}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newClientPhone" className="text-sm font-semibold text-slate-700">
                            Teléfono
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="newClientPhone"
                            type="tel"
                            value={newClientData.phone}
                            onChange={(e) => handleNewClientChange("phone", e.target.value)}
                            placeholder="Ingresa el teléfono"
                            className={cn(
                              "h-12 text-base border-2 rounded-xl transition-all duration-200",
                              "focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                              clientErrors.phone && "border-red-500 focus:border-red-500 focus:ring-red-100"
                            )}
                          />
                          {clientErrors.phone && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.phone}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newClientRut" className="text-sm font-semibold text-slate-700">
                            RUT
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="newClientRut"
                            type="text"
                            value={newClientData.rut}
                            onChange={(e) => handleNewClientChange("rut", e.target.value)}
                            placeholder="Ingresa el RUT"
                            className={cn(
                              "h-12 text-base border-2 rounded-xl transition-all duration-200",
                              "focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                              clientErrors.rut && "border-red-500 focus:border-red-500 focus:ring-red-100"
                            )}
                          />
                          {clientErrors.rut && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.rut}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="newClientAddress" className="text-sm font-semibold text-slate-700">
                            Dirección
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Input
                            id="newClientAddress"
                            type="text"
                            value={newClientData.address}
                            onChange={(e) => handleNewClientChange("address", e.target.value)}
                            placeholder="Ingresa la dirección completa"
                            className={cn(
                              "h-12 text-base border-2 rounded-xl transition-all duration-200",
                              "focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                              clientErrors.address && "border-red-500 focus:border-red-500 focus:ring-red-100"
                            )}
                          />
                          {clientErrors.address && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.address}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newClientRegion" className="text-sm font-semibold text-slate-700">
                            Región
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Select
                            value={newClientData.region}
                            onValueChange={(value: string) => handleNewClientChange("region", value)}
                          >
                            <SelectTrigger className="text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500">
                              <SelectValue placeholder="Seleccionar región" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border shadow-2xl max-h-64 bg-white">
                              {Object.keys(regionCommuneMap).map((region) => (
                                <SelectItem key={region} value={region} className="py-3">
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {clientErrors.region && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.region}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newClientCommune" className="text-sm font-semibold text-slate-700">
                            Comuna
                            <span className="text-red-500 font-bold">*</span>
                          </Label>
                          <Select
                            value={newClientData.commune}
                            onValueChange={(value: string) => handleNewClientChange("commune", value)}
                            disabled={!newClientData.region}
                          >
                            <SelectTrigger className="text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500">
                              <SelectValue placeholder={newClientData.region ? "Seleccionar comuna" : "Primero selecciona una región"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border shadow-2xl max-h-64 bg-white">
                              {newClientData.region && regionCommuneMap[newClientData.region as keyof typeof regionCommuneMap]?.map((commune) => (
                                <SelectItem key={commune} value={commune} className="py-3">
                                  {commune}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {clientErrors.commune && (
                            <p className="text-sm text-red-600 mt-1">{clientErrors.commune}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewClientForm(false)}
                          className="flex-1 h-12 text-base font-semibold border-2 border-slate-300 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={createNewClient}
                          disabled={loading || isSubmitting}
                          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Crear Cliente
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Servicio */}
                <div className="space-y-3 sm:space-y-4">
                  <Label htmlFor="serviceName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-green-600" />
                    Servicio
                    <span className="text-red-500 font-bold">*</span>
                  </Label>

                  {/* Selector de tipo de servicio */}
                  <div className="flex flex-col lg:flex-row gap-2 mb-3 sm:mb-4">
                    <Button
                      type="button"
                      variant={serviceType === "predetermined" ? "default" : "outline"}
                      onClick={() => handleServiceTypeChange("predetermined")}
                      className={cn(
                        "w-full lg:flex-1 h-10 text-sm font-medium transition-all duration-200",
                        serviceType === "predetermined"
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                          : "border-green-300 text-green-700 hover:bg-green-50"
                      )}
                    >
                      Servicios Predeterminados
                    </Button>
                    <Button
                      type="button"
                      variant={serviceType === "custom" ? "default" : "outline"}
                      onClick={() => handleServiceTypeChange("custom")}
                      className={cn(
                        "w-full lg:flex-1 h-10 text-sm font-medium transition-all duration-200",
                        serviceType === "custom"
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                          : "border-green-300 text-green-700 hover:bg-green-50"
                      )}
                    >
                      Servicio Personalizado
                    </Button>
                  </div>

                  {/* Campo de servicio según el tipo seleccionado */}
                  {serviceType === "predetermined" ? (
                    <div className="relative">
                      <Select
                        value={selectedPredeterminedService}
                        onValueChange={handlePredeterminedServiceChange}
                        disabled={loadingData}
                      >
                        <SelectTrigger
                          className={cn(
                            "pl-12 pr-4 h-11 sm:h-12 text-sm sm:text-base border-2 rounded-xl transition-all duration-200 font-medium",
                            "focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm",
                            getFieldStatus("serviceName") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                            getFieldStatus("serviceName") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                          )}
                        >
                          <SelectValue placeholder="Selecciona un servicio predeterminado" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white">
                          {predeterminedServices.map((service) => (
                            <SelectItem key={service} value={service} className="py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Wrench className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="font-semibold text-slate-800 text-sm sm:text-base truncate">{service}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Wrench className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                      {getFieldStatus("serviceName") === "success" && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="serviceName"
                        type="text"
                        value={formData.serviceName}
                        onChange={(e) => handleChange("serviceName", e.target.value)}
                        placeholder="Ingresa el nombre del servicio personalizado"
                        className={cn(
                          "pl-12 pr-4 h-11 sm:h-12 text-sm sm:text-base border-2 rounded-xl transition-all duration-200 font-medium",
                          "focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm",
                          getFieldStatus("serviceName") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                          getFieldStatus("serviceName") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                        )}
                      />
                      <Wrench className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                      {getFieldStatus("serviceName") === "success" && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                      )}
                    </div>
                  )}

                  {errors.serviceName && (
                    <Alert variant="destructive" className="py-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.serviceName}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Empresa y Técnico */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Empresa y Asignación</h2>
                    <p className="text-slate-600">Selecciona la empresa y asigna un técnico</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Empresa */}
                <div className="space-y-4">
                  <Label htmlFor="companyId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Empresa
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      value={formData.companyId}
                      onValueChange={(value: string) => handleChange("companyId", value)}
                      disabled={loadingData}
                    >
                      <SelectTrigger
                        className={cn(
                          "pl-12 pr-4 text-base border-2 rounded-xl transition-all duration-200 font-medium",
                          "focus:ring-4 focus:ring-purple-100 focus:border-purple-500 shadow-sm",
                          getFieldStatus("companyId") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                          getFieldStatus("companyId") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                        )}
                      >
                        <SelectValue placeholder={loadingData ? "Cargando..." : companies.length > 0 ? `Seleccionar empresa (${companies.length} disponibles)` : "No hay empresas"}>
                          {selectedCompanyName || (formData.companyId ?
                            companies.find(c => c.id === formData.companyId)?.name || "Empresa seleccionada"
                            : "Seleccionar empresa")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white" position="popper">
                        {loadingData ? (
                          <div className="p-6 text-center text-slate-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                            <p className="font-medium">Cargando empresas...</p>
                          </div>
                        ) : companies.length === 0 ? (
                          <div className="p-6 text-center text-slate-500">
                            <Building className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                            <p className="font-medium">No hay empresas disponibles</p>
                            <p className="text-sm text-slate-400 mt-1">Verifica la conexión a la base de datos</p>
                          </div>
                        ) : (
                          companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id} className="py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="font-semibold truncate text-slate-800">{company.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                    {getFieldStatus("companyId") === "success" && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                    )}
                  </div>
                  {errors.companyId && (
                    <Alert variant="destructive" className="py-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.companyId}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Técnico */}
                <div className="space-y-4">
                  <Label htmlFor="assignedToId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Técnico Asignado
                  </Label>
                  <div className="relative">
                    <Select
                      value={formData.assignedToId}
                      onValueChange={(value: string) => handleChange("assignedToId", value)}
                      disabled={loadingData}
                    >
                      <SelectTrigger className="pl-12 pr-4 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium">
                        <SelectValue placeholder={loadingData ? "Cargando..." : memoizedTechnicians.length > 0 ? `Sin asignar (${memoizedTechnicians.length} técnicos disponibles)` : "Sin asignar (No hay técnicos)"}>
                          {formData.assignedToId === "tecnico-generico" ? "Sin asignar" :
                            selectedTechnicianName || (formData.assignedToId ?
                              memoizedTechnicians.find(t => t.id === formData.assignedToId)?.name || "Técnico seleccionado"
                              : "Sin asignar")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white" position="popper">
                        <SelectItem value="tecnico-generico" className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                            <span className="font-semibold text-slate-800">Sin asignar</span>
                          </div>
                        </SelectItem>
                        {loadingData ? (
                          <div className="p-6 text-center text-slate-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="font-medium">Cargando técnicos...</p>
                          </div>
                        ) : memoizedTechnicians.length === 0 ? (
                          <div className="p-6 text-center text-slate-500">
                            <User className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                            <p className="font-medium">No hay técnicos disponibles</p>
                            <p className="text-sm text-slate-400 mt-1">Verifica que existan técnicos activos</p>
                          </div>
                        ) : (
                          memoizedTechnicians.map((technician: any) => (
                            <SelectItem key={technician.id} value={technician.id} className="py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="font-semibold text-slate-800">{technician.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                  </div>
                  {errors.assignedToId && (
                    <Alert variant="destructive" className="py-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.assignedToId}</AlertDescription>
                    </Alert>
                  )}
                  {isValidating && (
                    <Alert className="py-3 border-blue-200 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <AlertDescription className="text-sm text-blue-800">
                          Validando disponibilidad de horarios...
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  {validationResult?.hasConflict && (
                    <Alert variant="destructive" className="py-4 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-sm">
                        <div className="font-semibold mb-2">
                          Límite de trabajos alcanzado ({validationResult.totalJobs}/{validationResult.maxJobs}):
                        </div>
                        {validationResult.conflictingJobs?.map((conflict: any, index: number) => (
                          <div key={index} className="text-sm mb-1">
                            • {conflict.title} ({conflict.startTime} - {conflict.endTime})
                            {conflict.client?.name && ` - Cliente: ${conflict.client.name}`}
                          </div>
                        ))}
                        <div className="text-sm mt-3 font-semibold text-blue-600">
                          💡 Puedes programar hasta {validationResult.maxJobs} trabajos en el mismo horario
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  {validationResult && !validationResult.hasConflict && !isValidating && (
                    <Alert className="py-4 border-green-200 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-sm text-green-800">
                        <div className="font-semibold">Horario disponible para el técnico seleccionado</div>
                        <div className="text-sm mt-1">
                          Trabajos actuales: {validationResult.totalJobs}/{validationResult.maxJobs}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Programación */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Programación del Trabajo</h2>
                    <p className="text-slate-600">Define la fecha y horarios del servicio</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Fecha */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">
                    Fecha
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.scheduledAt ? format(formData.scheduledAt, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value.split('-').map(Number)
                        // Crear la fecha usando el constructor de Date con componentes individuales para evitar problemas de zona horaria
                        if (!year || !month || !day) return
                        const date = new Date(year, month - 1, day, 0, 0, 0, 0)
                        handleChange("scheduledAt", date)
                      } else {
                        handleChange("scheduledAt", null)
                      }
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 shadow-sm font-medium"
                  />
                  {errors.scheduledAt && (
                    <Alert variant="destructive" className="py-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.scheduledAt}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Hora de Inicio */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">
                    Hora de Inicio
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange("startTime", e.target.value)}
                    className="h-14 text-base border-2 rounded-xl text-center focus:ring-4 focus:ring-orange-100 focus:border-orange-500 shadow-sm font-medium"
                    placeholder="09:00"
                  />
                  {errors.startTime && (
                    <Alert variant="destructive" className="py-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.startTime}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Hora de Fin */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">
                    Hora de Fin
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange("endTime", e.target.value)}
                    className="h-14 text-base border-2 rounded-xl text-center focus:ring-4 focus:ring-orange-100 focus:border-orange-500 shadow-sm font-medium"
                    placeholder="17:00"
                  />
                  {errors.endTime && (
                    <Alert variant="destructive" className="py-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.endTime}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 4: Descripción */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Descripción del Trabajo</h2>
                    <p className="text-slate-600">Describe el problema o trabajo a realizar</p>
                  </div>
                </div>
              </div>

              <Textarea
                id="description"
                placeholder="Describe el problema o trabajo a realizar en detalle..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[140px] text-base border-2 rounded-xl p-4 transition-all duration-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 resize-none shadow-sm font-medium"
              />
            </div>

            {/* Sección 5: Presupuesto Total */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Presupuesto Total</h2>
                    <p className="text-slate-600">Establece el presupuesto total del trabajo</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="totalBudget" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Presupuesto Total (CLP)
                  <span className="text-red-500 font-bold">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="totalBudget"
                    type="text"
                    value={formData.totalBudget || ""}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      handleChange("totalBudget", value)
                    }}
                    placeholder="Ingresa el presupuesto total del trabajo"
                    className={cn(
                      "pl-12 pr-4 h-14 text-base border-2 rounded-xl transition-all duration-200 font-medium",
                      "focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm",
                      getFieldStatus("totalBudget") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                      getFieldStatus("totalBudget") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                    )}
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  {getFieldStatus("totalBudget") === "success" && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                  )}
                </div>
                {errors.totalBudget && (
                  <Alert variant="destructive" className="py-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.totalBudget}</AlertDescription>
                  </Alert>
                )}
                {formData.totalBudget && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>Presupuesto establecido:</strong> ${Number(formData.totalBudget).toLocaleString('es-CL')} CLP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 6: Estado de Pago (solo para trabajos existentes) */}
            {job && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Estado de Pago</h2>
                      <p className="text-slate-600">Gestiona el estado de pago del trabajo</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Información de pago actual */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Estado Actual</p>
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                          paymentInfo?.isPaid
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : paymentInfo?.status === "PARTIAL"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                        )}>
                          {paymentInfo?.isPaid ? "✅ Pagado" :
                            paymentInfo?.status === "PARTIAL" ? "⚠️ Parcial" :
                              "❌ Pendiente"}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Presupuesto</p>
                        <p className="text-lg font-bold text-slate-800">
                          ${job.totalBudget ? Number(job.totalBudget).toLocaleString('es-CL') : '0'} CLP
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Pagado</p>
                        <p className="text-lg font-bold text-green-600">
                          ${paymentInfo?.paidAmount ? Number(paymentInfo.paidAmount).toLocaleString('es-CL') : '0'} CLP
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón para marcar como pagado */}
                  {!paymentInfo?.isPaid && (
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        onClick={handleMarkAsPaid}
                        disabled={isUpdatingPayment || !job.totalBudget || job.totalBudget <= 0}
                        className={cn(
                          "h-12 px-8 text-base font-semibold rounded-xl transition-all duration-200",
                          "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                          "text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        )}
                      >
                        {isUpdatingPayment ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Marcando como pagado...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5" />
                            <span>Marcar como Pagado</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Mensaje de advertencia si no hay presupuesto */}
                  {(!job.totalBudget || job.totalBudget <= 0) && (
                    <Alert className="py-4 border-yellow-200 bg-yellow-50 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <AlertDescription className="text-sm text-yellow-800">
                        <div className="font-semibold mb-1">⚠️ No se puede marcar como pagado</div>
                        <div>Este trabajo no tiene un presupuesto definido. Primero asigna un presupuesto al trabajo para poder marcarlo como pagado.</div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Mensaje de éxito si ya está pagado */}
                  {paymentInfo?.isPaid && (
                    <Alert className="py-4 border-green-200 bg-green-50 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-sm text-green-800">
                        <div className="font-semibold mb-1">✅ Trabajo marcado como pagado</div>
                        <div>Este trabajo ha sido marcado como pagado y se ha registrado automáticamente en la sección de cajas correspondiente al mes y año actual.</div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* Información del trabajo programado */}
            {formData.serviceName && formData.scheduledAt && formData.startTime && formData.endTime && formData.totalBudget && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-start gap-6">
                  <div className="w-4 h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full flex-shrink-0"></div>
                  <div className="text-base text-blue-800 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <p className="font-bold text-blue-900 text-lg">📅 Trabajo Programado</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700 min-w-[90px]">Servicio:</span>
                        <span className="text-blue-800 font-medium">{formData.serviceName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700 min-w-[90px]">Cliente:</span>
                        <span className="text-blue-800 font-medium">{clients.find(c => c.id === formData.clientId)?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700 min-w-[90px]">Fecha:</span>
                        <span className="text-blue-800 font-medium">{format(formData.scheduledAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700 min-w-[90px]">Horario:</span>
                        <span className="text-blue-800 font-medium">
                          {formData.startTime && formData.endTime
                            ? `${formData.startTime} - ${formData.endTime}`
                            : "Por definir"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-700 min-w-[90px]">💰 Presupuesto:</span>
                        <span className="text-green-800 font-bold text-lg">${Number(formData.totalBudget).toLocaleString('es-CL')} CLP</span>
                      </div>
                      {formData.assignedToId !== "tecnico-generico" && (
                        <div className="lg:col-span-2 flex items-center gap-3">
                          <span className="font-semibold text-green-700 min-w-[90px]">✅ Técnico:</span>
                          <span className="text-green-800 font-bold text-lg">{technicians.find(t => t.id === formData.assignedToId)?.name}</span>
                        </div>
                      )}
                    </div>
                    {formData.assignedToId === "tecnico-generico" && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-sm text-yellow-700">
                          ⚠️ <strong>Nota:</strong> El trabajo se creará sin técnico asignado. Puedes asignarlo más tarde desde la agenda.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botones - Fijos en la parte inferior */}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 flex-shrink-0 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading || isSubmitting}
                className="flex-1 h-14 text-base font-semibold border-2 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md"
              >
                Cancelar
              </Button>
              {!job && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  disabled={loading || isSubmitting}
                  className="flex-1 h-14 text-base font-semibold border-2 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md"
                >
                  Limpiar
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || isSubmitting || loadingData}
                className="flex-1 h-14 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3 text-white">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-white">Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-white">
                    <span className="text-white">{job ? "Actualizar Trabajo" : "Crear Trabajo"}</span>
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Error general */}
          {errors.submit && (
            <Alert variant="destructive" className="py-4 rounded-xl">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">{errors.submit}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    );
  } catch (error) {
    console.error('Error en JobForm:', error);
    return (
      <div className="w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 min-h-0">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error en el Formulario</h2>
            <p className="text-base text-slate-600 mb-4">Ha ocurrido un error inesperado</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Recargar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
