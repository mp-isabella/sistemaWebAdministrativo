"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileText, User, Wrench, AlertTriangle } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface JobFormProps {
  job?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function JobForm({ job, onSubmit, onCancel, loading = false }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    description: job?.description || "",
    clientId: job?.clientId || "",
    serviceId: job?.serviceId || "",
    assignedToId: job?.assignedToId || "",
    scheduledAt: job?.scheduledAt ? new Date(job.scheduledAt) : null,
    priority: job?.priority || "MEDIUM"
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [technicians, setTechnicians] = useState([])

  useEffect(() => {
    fetchClients()
    fetchServices()
    fetchTechnicians()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data.services?.filter((s: any) => s.active) || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const response = await fetch("/api/workers?role=operador")
      const data = await response.json()
      setTechnicians(data.workers?.filter((w: any) => w.status === "active") || [])
    } catch (error) {
      console.error("Error fetching technicians:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido"
    }

    if (!formData.clientId) {
      newErrors.clientId = "Debe seleccionar un cliente"
    }

    if (!formData.serviceId) {
      newErrors.serviceId = "Debe seleccionar un servicio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      scheduledAt: formData.scheduledAt?.toISOString()
    }

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600"
      case "MEDIUM":
        return "text-yellow-600"
      case "LOW":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{job ? "Editar Trabajo" : "Nuevo Trabajo"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Trabajo *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="title"
                type="text"
                placeholder="Ej: Fuga en jardín - Casa Las Condes"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={`pl-10 ${errors.title ? "border-red-500" : ""}`}
              />
            </div>
            {errors.title && (
              <Alert variant="destructive">
                <AlertDescription>{errors.title}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Cliente y Servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                  <SelectTrigger className={`pl-10 ${errors.clientId ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.clientId && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.clientId}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Servicio *</Label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.serviceId} onValueChange={(value) => handleChange("serviceId", value)}>
                  <SelectTrigger className={`pl-10 ${errors.serviceId ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price.toLocaleString("es-CL")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.serviceId && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.serviceId}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Técnico y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedToId">Técnico Asignado</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.assignedToId} onValueChange={(value) => handleChange("assignedToId", value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Seleccionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {technicians.map((tech: any) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Baja
                      </span>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        Media
                      </span>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Alta
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Fecha Programada */}
          <div className="space-y-2">
            <Label>Fecha y Hora Programada</Label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledAt ? (
                      format(formData.scheduledAt, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
  mode="single"
  selected={formData.scheduledAt ?? undefined}
  onSelect={(date) => handleChange("scheduledAt", date)}
  initialFocus
/>
                </PopoverContent>
              </Popover>
              
              {formData.scheduledAt && (
                <Input
                  type="time"
                  value={formData.scheduledAt ? format(formData.scheduledAt, "HH:mm") : ""}
                  onChange={(e) => {
                    if (formData.scheduledAt && e.target.value) {
                      const [hours, minutes] = e.target.value.split(":")
                      const newDate = new Date(formData.scheduledAt)
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      handleChange("scheduledAt", newDate)
                    }
                  }}
                  className="w-32"
                />
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el problema o trabajo a realizar..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Guardando..." : job ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
