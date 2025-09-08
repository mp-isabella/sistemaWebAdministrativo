"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Wrench, Clock, MapPin, AlertCircle, CheckCircle, Building, Plus } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useScheduleValidation } from "@/hooks/use-schedule-validation"
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes"

interface JobFormProps {
  job?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function JobForm({ job, onSubmit, onCancel, loading = false }: JobFormProps) {
  // Usar el mapeo completo de regiones y comunas
  const regionCommuneMap = useMemo(() => REGIONES_Y_COMUNAS, []);

  const [formData, setFormData] = useState({
    description: "",
    clientId: "",
    serviceId: "",
    companyId: "",
    assignedToId: "tecnico-generico",
    scheduledAt: null as Date | null,
    startTime: "",
    endTime: ""
  })

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
  const [services, setServices] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hook para validación de horarios
  const { validateSchedule, clearValidation, isValidating, validationResult } = useScheduleValidation()

  // Memoizar los arrays para evitar re-renderizados innecesarios
  const memoizedClients = useMemo(() => clients, [clients])
  const memoizedServices = useMemo(() => services, [services])
  const memoizedTechnicians = useMemo(() => technicians, [technicians])


  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
  }, []) // loadAllData no cambia, por lo que no necesitamos incluirlo en las dependencias

  // Actualizar formulario cuando se edita un trabajo
  useEffect(() => {
    if (job) {
      // Manejar la fecha correctamente para evitar problemas de zona horaria
      let scheduledDate = null
      if (job.scheduledAt) {
        const jobDate = new Date(job.scheduledAt)
        // Crear la fecha usando el formato ISO para mantener la zona horaria local
        const year = jobDate.getFullYear()
        const month = (jobDate.getMonth() + 1).toString().padStart(2, '0')
        const day = jobDate.getDate().toString().padStart(2, '0')
        const dateString = `${year}-${month}-${day}T00:00:00`
        scheduledDate = new Date(dateString)
      }
      
      setFormData({
        description: job.description || "",
        clientId: job.clientId || "",
        serviceId: job.serviceId || "",
        companyId: job.companyId || "",
        assignedToId: job.technicianId || "tecnico-generico",
        scheduledAt: scheduledDate,
        startTime: job.startTime || "",
        endTime: job.endTime || ""
      })
    } else {
      // Resetear formulario si no hay trabajo para editar
      // La empresa por defecto se establecerá cuando se carguen los datos
      setFormData({
        description: "",
        clientId: "",
        serviceId: "",
        companyId: "", // Se establecerá automáticamente cuando se carguen las empresas
        assignedToId: "tecnico-generico",
        scheduledAt: null,
        startTime: "",
        endTime: ""
      })
    }
    setErrors({})
    clearValidation()
  }, [job?.id, clearValidation]) // Solo dependemos del ID del trabajo, no del objeto completo

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

  const loadAllData = useCallback(async () => {
    setLoadingData(true)
    try {
      // Cargar en paralelo para mayor velocidad
      const [clientsRes, servicesRes, companiesRes, techniciansRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/companies"),
        fetch("/api/workers")
      ])

      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      const companiesData = await companiesRes.json()
      const techniciansData = await techniciansRes.json()

      console.log('📊 Datos recibidos:', {
        clients: clientsData,
        services: servicesData,
        companies: companiesData,
        technicians: techniciansData
      })

      setClients(clientsData || [])
      
             // Filtrar solo los tres servicios específicos
       const allowedServices = [
         "Detección de Fugas de Agua",
         "Destape de Alcantarillado", 
         "Videointrospección de Ductos"
       ];
       
       const filteredServices = Array.isArray(servicesData) 
         ? servicesData.filter((s: any) => s.isActive && allowedServices.includes(s.name))
         : []
       setServices(filteredServices)
      
        // Establecer empresas
  console.log('🏢 Companies data:', companiesData)
  setCompanies(companiesData || [])
  
  // Establecer empresa por defecto (Amestica) si no hay trabajo para editar
  if (!job?.id && companiesData && companiesData.length > 0) {
            const defaultCompany = companiesData.find((c: any) => c.name === 'Amestica')
    if (defaultCompany) {
      setFormData(prev => ({
        ...prev,
        companyId: defaultCompany.id
      }))
      console.log('🏢 Establecida empresa por defecto:', defaultCompany.name)
    }
  }
      
      // Filtrar técnicos correctamente
      const activeTechnicians = techniciansData.workers?.filter((w: any) => 
        w.isActive && (w.role?.name === 'TECNICO' || w.role?.name === 'tecnico')
      ) || []
      setTechnicians(activeTechnicians)

      console.log('✅ Datos cargados:', {
        clients: clientsData?.length || 0,
        services: filteredServices.length,
        companies: companiesData?.length || 0,
        technicians: activeTechnicians.length
      })
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
    } finally {
      setLoadingData(false)
    }
  }, [])



  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId) {
      newErrors.clientId = "Debe seleccionar un cliente"
    }

    if (!formData.serviceId) {
      newErrors.serviceId = "Debe seleccionar un servicio"
    }

    if (!formData.companyId) {
      newErrors.companyId = "Debe seleccionar una empresa"
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "Debe seleccionar una fecha"
    } else {
      // Validación más precisa de fecha y hora
      const now = new Date()
      const scheduledDateTime = new Date(formData.scheduledAt)
      
      // Si es la misma fecha, validar la hora
      if (formData.scheduledAt.toDateString() === now.toDateString()) {
        if (formData.startTime) {
          const [startHour, startMinute] = formData.startTime.split(':').map(Number)
          const currentHour = now.getHours()
          const currentMinute = now.getMinutes()
          
          // Si la hora de inicio es anterior a la hora actual
          if (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute)) {
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

    // Permitir crear trabajos sin asignar técnico (se irán a la columna "Técnico" del calendario)
    // if (!formData.assignedToId || formData.assignedToId === "tecnico-generico") {
    //   newErrors.assignedToId = "Debe asignar un técnico"
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

    if (!validateForm()) {
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
      // Obtener el nombre del servicio seleccionado para usarlo como título
      const selectedService = services.find(s => s.id === formData.serviceId)
      const selectedClient = clients.find(c => c.id === formData.clientId)
      
             // Combinar fecha con hora de inicio para scheduledAt
       let combinedScheduledAt = null
       if (formData.scheduledAt && formData.startTime) {
         const [hours, minutes] = formData.startTime.split(':').map(Number)
         
         // Crear la fecha combinada usando la fecha seleccionada
         const combinedDate = new Date(formData.scheduledAt)
         combinedDate.setHours(hours, minutes, 0, 0)
         
         // Convertir a ISO string
         combinedScheduledAt = combinedDate.toISOString()
       }
      
      const jobData = {
        ...formData,
        id: job?.id, // Incluir el ID si estamos editando
        title: selectedService ? selectedService.name : "Trabajo sin título",
        scheduledAt: combinedScheduledAt,
        technicianId: formData.assignedToId === "tecnico-generico" ? null : formData.assignedToId,
        clientName: selectedClient?.name || "",
        serviceName: selectedService?.name || ""
      }

      await onSubmit(jobData)
      
      // Limpiar formulario después de guardar exitosamente
      // La empresa por defecto se establecerá cuando se carguen los datos
      setFormData({
        description: "",
        clientId: "",
        serviceId: "",
        companyId: "", // Se establecerá automáticamente cuando se carguen las empresas
        assignedToId: "tecnico-generico",
        scheduledAt: null,
        startTime: "",
        endTime: ""
      })
      setErrors({})
      
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({ submit: "Error al guardar el trabajo" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
    
    // Limpiar conflicto de horarios cuando se cambia técnico, fecha u horarios
    if (['assignedToId', 'scheduledAt', 'startTime', 'endTime'].includes(field)) {
      clearValidation()
    }
  }, [errors])

  const getFieldStatus = useCallback((fieldName: string) => {
    if (errors[fieldName]) return "error"
    if (formData[fieldName as keyof typeof formData]) return "success"
    return "default"
  }, [errors, formData])

  const getFormProgress = useCallback(() => {
    const requiredFields = ['clientId', 'serviceId', 'companyId', 'scheduledAt', 'startTime', 'endTime']
    const completedFields = requiredFields.filter(field => 
      formData[field as keyof typeof formData] && 
      formData[field as keyof typeof formData] !== ""
    )
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }, [formData.clientId, formData.serviceId, formData.companyId, formData.scheduledAt, formData.startTime, formData.endTime])

  const handleClearForm = () => {
    setFormData({
      description: "",
      clientId: "",
      serviceId: "",
      companyId: "",
      assignedToId: "sin-asignar",
      scheduledAt: null,
      startTime: "",
      endTime: ""
    })
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

  // Obtener comunas disponibles según la región seleccionada
  const getAvailableCommunes = () => {
    const communes = [...(regionCommuneMap[newClientData.region as keyof typeof regionCommuneMap] || [])];
    console.log('🏘️ Getting communes for region:', newClientData.region, 'Result:', communes)
    return communes;
  };

  // Resetear comuna cuando cambia la región
  const handleNewClientRegionChange = (region: string) => {
    console.log('🌍 Region changed to:', region)
    const availableCommunes = [...(regionCommuneMap[region as keyof typeof regionCommuneMap] || [])];
    console.log('🏘️ Available communes:', availableCommunes)
    const newCommune = availableCommunes.includes(newClientData.commune as any) ? newClientData.commune : availableCommunes[0] || "";
    
    setNewClientData(prev => ({
      ...prev,
      region,
      commune: newCommune
    }));
    
    // Limpiar errores
    if (clientErrors.region) {
      setClientErrors(prev => ({ ...prev, region: "" }));
    }
    if (clientErrors.commune) {
      setClientErrors(prev => ({ ...prev, commune: "" }));
    }
  };

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
      setClients(prev => [newClient, ...prev])
      
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
      console.error("Error creating client:", error)
      setClientErrors({ submit: "Error al crear el cliente" })
      return null
    }
  }

  return (
    <div className="w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {loadingData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-base text-slate-600 font-medium">Cargando datos...</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* Header del formulario - Fijo en la parte superior */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg shadow-slate-200/50 mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {job ? 'Editar Trabajo' : 'Crear Nuevo Trabajo'}
            </h1>
            <p className="text-slate-600 text-base">
              {job ? 'Modifica los detalles del trabajo existente' : 'Completa el formulario para programar un nuevo trabajo'}
            </p>
          </div>
        </div>

        {/* Barra de progreso - Fija debajo del header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg shadow-slate-200/50 mb-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Progreso del formulario</span>
              <span className="text-xl font-bold text-blue-600">{getFormProgress()}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${getFormProgress()}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del formulario con scroll */}
        <div className="space-y-4">
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
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                        />
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-4">
              <Label htmlFor="serviceId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-green-600" />
                Servicio
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <div className="relative">
                <Select 
                  value={formData.serviceId} 
                  onValueChange={(value: string) => handleChange("serviceId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger 
                    className={cn(
                      "pl-12 pr-4 text-base border-2 rounded-xl transition-all duration-200 font-medium",
                      "focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm",
                      getFieldStatus("serviceId") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                      getFieldStatus("serviceId") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                    )}
                  >
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar servicio"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white" position="popper">
                    {memoizedServices.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        <Wrench className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="font-medium">No hay servicios disponibles</p>
                      </div>
                    ) : (
                      memoizedServices.map((service: any) => (
                        <SelectItem key={service.id} value={service.id} className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-semibold truncate text-slate-800">{service.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Wrench className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                {getFieldStatus("serviceId") === "success" && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                )}
              </div>
              {errors.serviceId && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.serviceId}</AlertDescription>
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
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar empresa"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white" position="popper">
                    {companies.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        <Building className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="font-medium">No hay empresas disponibles</p>
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
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white" position="popper">
                    <SelectItem value="tecnico-generico" className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                        <span className="font-semibold text-slate-800">Sin asignar</span>
                      </div>
                    </SelectItem>
                    {memoizedTechnicians.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        <User className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="font-medium">No hay técnicos disponibles</p>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00`
                    const date = new Date(dateString)
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

        {/* Información del trabajo programado */}
        {formData.serviceId && formData.scheduledAt && formData.startTime && formData.endTime && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
            <div className="flex items-start gap-6">
              <div className="w-4 h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full flex-shrink-0"></div>
              <div className="text-base text-blue-800 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <p className="font-bold text-blue-900 text-lg">📅 Trabajo Programado</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-base">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-blue-700 min-w-[90px]">Servicio:</span>
                    <span className="text-blue-800 font-medium">{services.find(s => s.id === formData.serviceId)?.name}</span>
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

        {/* Botones */}
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50">
          <div className="flex gap-3">
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
              className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>{job ? "Actualizar Trabajo" : "Crear Trabajo"}</span>
                  <CheckCircle className="h-5 w-5" />
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
  )
}
