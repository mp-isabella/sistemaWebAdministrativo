"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, CheckCircle, Clock, MapPin, User, Wrench } from 'lucide-react'
import { useEffect, useState } from "react"

interface JobFormProps {
  job?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function JobForm({ job, onSubmit, onCancel, loading = false }: JobFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    clientId: "",
    serviceId: "",
    assignedToId: "sin-asignar",
    scheduledAt: null as Date | null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
  }, [])

  // Actualizar formulario cuando se edita un trabajo
  useEffect(() => {
    if (job) {
      setFormData({
        description: job.description || "",
        clientId: job.clientId || "",
        serviceId: job.serviceId || "",
        assignedToId: job.technicianId || "sin-asignar",
        scheduledAt: job.scheduledAt ? new Date(job.scheduledAt) : null
      })
    }
    setErrors({})
  }, [job])

  const loadAllData = async () => {
    setLoadingData(true)
    try {
      // Cargar en paralelo para mayor velocidad
      const [clientsRes, servicesRes, techniciansRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/workers")
      ])

      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      const techniciansData = await techniciansRes.json()

      // Filtrar solo clientes activos para agendamiento
      const activeClients = (clientsData || []).filter((client: any) => client.status === 'active')
      setClients(activeClients)
      setServices(Array.isArray(servicesData) ? servicesData.filter((s: any) => s.isActive) : [])
      setTechnicians(techniciansData.workers?.filter((w: any) => w.isActive && w.role?.name === 'TECNICO') || [])

      console.log({
        totalTechnicians: techniciansData.workers?.filter((w: any) => w.isActive && w.role?.name === 'TECNICO').length || 0
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId) {
      newErrors.clientId = "Debe seleccionar un cliente"
    }

    if (!formData.serviceId) {
      newErrors.serviceId = "Debe seleccionar un servicio"
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "Debe seleccionar una fecha y hora"
    } else {
      // Validación más precisa de fecha y hora
      const now = new Date()

      // Si es la misma fecha, validar la hora
      if (formData.scheduledAt.toDateString() === now.toDateString()) {
        const scheduledHour = formData.scheduledAt.getHours()
        const scheduledMinute = formData.scheduledAt.getMinutes()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        // Si la hora programada es anterior a la hora actual
        if (scheduledHour < currentHour || (scheduledHour === currentHour && scheduledMinute <= currentMinute)) {
          newErrors.scheduledAt = "La hora programada no puede ser en el pasado"
        }
      } else if (formData.scheduledAt < now) {
        // Si es una fecha anterior
        newErrors.scheduledAt = "La fecha programada no puede ser en el pasado"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const selectedService = services.find(s => s.id === formData.serviceId)
      const selectedClient = clients.find(c => c.id === formData.clientId)

      const jobData = {
        ...formData,
        title: selectedService ? selectedService.name : "Trabajo sin título",
        scheduledAt: formData.scheduledAt?.toISOString(),
        technicianId: formData.assignedToId === "sin-asignar" ? null : formData.assignedToId,
        clientName: selectedClient?.name || "",
        serviceName: selectedService?.name || ""
      }

      await onSubmit(jobData)

      // Limpiar formulario
      setFormData({
        description: "",
        clientId: "",
        serviceId: "",
        assignedToId: "sin-asignar",
        scheduledAt: null
      })
      setErrors({})

    } catch (error) {

      setErrors({ submit: "Error al guardar el trabajo" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getFieldStatus = (fieldName: string) => {
    if (errors[fieldName]) return "error"
    if (formData[fieldName as keyof typeof formData]) return "success"
    return "default"
  }

  const getFormProgress = () => {
    const requiredFields = ['clientId', 'serviceId', 'scheduledAt']
    const completedFields = requiredFields.filter(field =>
      formData[field as keyof typeof formData] &&
      formData[field as keyof typeof formData] !== ""
    )
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const handleClearForm = () => {
    setFormData({
      description: "",
      clientId: "",
      serviceId: "",
      assignedToId: "sin-asignar",
      scheduledAt: null
    })
    setErrors({})
  }

  const handleCancel = () => {
    if (isSubmitting) return
    onCancel()
  }

  return (
    <div className="w-full">
      {loadingData && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando datos...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Progreso del formulario</span>
            <span>{getFormProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getFormProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Cliente y Servicio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Cliente
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleChange("clientId", value)}
                disabled={loadingData}
              >
                <SelectTrigger
                  className={cn(
                    "h-10 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200",
                    "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                    getFieldStatus("clientId") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                    getFieldStatus("clientId") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                  )}
                >
                  <SelectValue
                    placeholder={loadingData ? "Cargando..." : "Seleccionar cliente"}
                    className="text-gray-600"
                  />
                </SelectTrigger>
                <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white">
                  {clients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay clientes disponibles
                    </div>
                  ) : (
                    clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id} className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{client.name}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {getFieldStatus("clientId") === "success" && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.clientId && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.clientId}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Servicio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              Servicio
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Select
                value={formData.serviceId}
                onValueChange={(value) => handleChange("serviceId", value)}
                disabled={loadingData}
              >
                <SelectTrigger
                  className={cn(
                    "h-10 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200",
                    "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                    getFieldStatus("serviceId") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                    getFieldStatus("serviceId") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                  )}
                >
                  <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar servicio"} />
                </SelectTrigger>
                <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white">
                  {services.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay servicios disponibles
                    </div>
                  ) : (
                    services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id} className="py-2">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium truncate">{service.name}</span>
                          </div>
                          <span className="text-green-600 font-bold text-sm whitespace-nowrap">
                            ${service.price.toLocaleString("es-CL")}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {getFieldStatus("serviceId") === "success" && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.serviceId && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.serviceId}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Técnico y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Técnico */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Técnico Asignado
            </Label>
            <div className="relative">
              <Select
                value={formData.assignedToId}
                onValueChange={(value) => handleChange("assignedToId", value)}
                disabled={loadingData}
              >
                <SelectTrigger className="h-10 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white">
                  <SelectItem value="sin-asignar" className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Sin asignar</span>
                    </div>
                  </SelectItem>
                  {technicians.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay técnicos disponibles
                    </div>
                  ) : (
                    technicians.map((technician: any) => (
                      <SelectItem key={technician.id} value={technician.id} className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{technician.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Fecha y Hora Programada
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.scheduledAt ? format(formData.scheduledAt, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    // Parse the date string and create a date in local timezone
                    const [year, month, day] = e.target.value.split('-').map(Number)
                    if (!year || !month || !day) return
                    const date = new Date(year, month - 1, day) // month is 0-indexed
                    handleChange("scheduledAt", date)
                  } else {
                    handleChange("scheduledAt", null)
                  }
                }}
                min={format(new Date(), "yyyy-MM-dd")}
                className="h-10 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 flex-1"
              />

              {formData.scheduledAt && (
                <Input
                  type="time"
                  value={formData.scheduledAt ? format(formData.scheduledAt, "HH:mm") : ""}
                  onChange={(e) => {
                    if (formData.scheduledAt && e.target.value) {
                      const [hours, minutes] = e.target.value.split(":")
                      const newDate = new Date(formData.scheduledAt)
                      if (hours && minutes) {
                        newDate.setHours(parseInt(hours), parseInt(minutes))
                      }
                      handleChange("scheduledAt", newDate)
                    }
                  }}
                  className="h-10 w-24 text-sm border-2 rounded-lg text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              )}
            </div>
            {errors.scheduledAt && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.scheduledAt}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            Descripción del Trabajo
          </Label>
          <Textarea
            placeholder="Describe el problema o trabajo a realizar en detalle..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="min-h-[80px] text-sm border-2 rounded-lg p-3 transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Información del trabajo programado */}
        {formData.serviceId && formData.scheduledAt && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-2 h-full bg-gradient-to-b from-blue-500 to-green-500 rounded-full flex-shrink-0"></div>
              <div className="text-sm text-blue-800 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-blue-900">📅 Trabajo Programado</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-blue-700">Servicio:</span>
                    <span className="ml-1 text-blue-800">{services.find(s => s.id === formData.serviceId)?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Cliente:</span>
                    <span className="ml-1 text-blue-800">{clients.find(c => c.id === formData.clientId)?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Fecha:</span>
                    <span className="ml-1 text-blue-800">{format(formData.scheduledAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Hora:</span>
                    <span className="ml-1 text-blue-800">{format(formData.scheduledAt, "hh:mm a", { locale: es })}</span>
                  </div>
                  {formData.assignedToId !== "sin-asignar" && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-700">✅ Técnico Asignado:</span>
                      <span className="ml-1 text-green-800 font-semibold">{technicians.find(t => t.id === formData.assignedToId)?.name}</span>
                    </div>
                  )}
                </div>
                {formData.assignedToId === "sin-asignar" && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      ⚠️ <strong>Nota:</strong> El trabajo se creará sin técnico asignado. Puedes asignarlo más tarde desde la agenda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading || isSubmitting}
            className="flex-1 h-10 text-sm font-medium border-2 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
          >
            Cancelar
          </Button>
          {!job && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              disabled={loading || isSubmitting}
              className="flex-1 h-10 text-sm font-medium border-2 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
            >
              Limpiar
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || isSubmitting || loadingData}
            className="flex-1 h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{job ? "Actualizar Trabajo" : "Crear Trabajo"}</span>
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>

        {/* Error general */}
        {errors.submit && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{errors.submit}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
