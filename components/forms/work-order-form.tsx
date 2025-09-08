"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Wrench, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Building2,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface WorkOrderFormProps {
  workOrder?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

interface WorkOrderItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

export default function WorkOrderForm({ workOrder, onSubmit, onCancel, loading = false }: WorkOrderFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    serviceId: "",
    companyId: "",
    technicianId: "sin-asignar",
    scheduledAt: null as Date | null,
    startTime: "",
    endTime: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    address: "",
    notes: ""
  })
  
  const [items, setItems] = useState<WorkOrderItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
  }, [])

  // Actualizar formulario cuando se edita una orden de trabajo
  useEffect(() => {
    if (workOrder) {
      setFormData({
        title: workOrder.title || "",
        description: workOrder.description || "",
        clientId: workOrder.clientId || "",
        serviceId: workOrder.serviceId || "",
        companyId: workOrder.companyId || "",
        technicianId: workOrder.technicianId || "sin-asignar",
        scheduledAt: workOrder.scheduledAt ? new Date(workOrder.scheduledAt) : null,
        startTime: workOrder.startTime || "",
        endTime: workOrder.endTime || "",
        priority: workOrder.priority || "MEDIUM",
        address: workOrder.address || "",
        notes: workOrder.notes || ""
      })
      
      if (workOrder.items) {
        setItems(workOrder.items.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          notes: item.notes
        })))
      }
    }
    setErrors({})
  }, [workOrder])

  const loadAllData = async () => {
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

      setClients(clientsData || [])
      setServices(Array.isArray(servicesData) ? servicesData.filter((s: any) => s.isActive) : [])
      setCompanies(companiesData || [])
      setTechnicians(techniciansData.workers?.filter((w: any) => w.isActive && w.role?.name === 'TECNICO') || [])

      console.log('✅ Datos cargados:', {
        clients: clientsData?.length || 0,
        services: servicesData?.length || 0,
        companies: companiesData?.length || 0,
        technicians: techniciansData.workers?.filter((w: any) => w.isActive && w.role?.name === 'TECNICO').length || 0
      })
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
    } finally {
      setLoadingData(false)
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

    if (!formData.companyId) {
      newErrors.companyId = "Debe seleccionar una empresa"
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "Debe seleccionar una fecha y hora"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes
        }))
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting work order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = () => {
    const newItem: WorkOrderItem = {
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: ""
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof WorkOrderItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Calcular total automáticamente
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice
    }
    
    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.19 // IVA 19%
    const total = subtotal + tax
    
    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = calculateTotals()

  const getCompanyColors = (companyType: string) => {
    switch (companyType) {
      case 'AMESTICA':
        return { primary: '#1e40af', secondary: '#3b82f6' }
      case 'MULTIFUGAS':
        return { primary: '#059669', secondary: '#10b981' }
      case 'SERVIFUGAS':
        return { primary: '#dc2626', secondary: '#ef4444' }
      default:
        return { primary: '#1e40af', secondary: '#3b82f6' }
    }
  }

  const selectedCompany = companies.find(c => c.id === formData.companyId)
  const companyColors = selectedCompany ? getCompanyColors(selectedCompany.type) : { primary: '#1e40af', secondary: '#3b82f6' }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Trabajo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Reparación de fuga en baño"
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del trabajo a realizar"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="companyId">Empresa *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger className={cn(errors.companyId && "border-red-500")}>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getCompanyColors(company.type).primary }}
                        />
                        {company.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cliente y Servicio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente y Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientId">Cliente *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger className={cn(errors.clientId && "border-red-500")}>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.rut || 'Sin RUT'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <Label htmlFor="serviceId">Servicio *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              >
                <SelectTrigger className={cn(errors.serviceId && "border-red-500")}>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.price ? `$${service.price.toLocaleString()}` : 'Sin precio'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceId && <p className="text-red-500 text-sm mt-1">{errors.serviceId}</p>}
            </div>

            <div>
              <Label htmlFor="technicianId">Técnico Asignado</Label>
              <Select
                value={formData.technicianId}
                onValueChange={(value) => setFormData({ ...formData, technicianId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Dirección del Trabajo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección donde se realizará el trabajo"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Programación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="scheduledAt">Fecha Programada *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt ? format(formData.scheduledAt, "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value ? new Date(e.target.value) : null })}
                className={cn(errors.scheduledAt && "border-red-500")}
              />
              {errors.scheduledAt && <p className="text-red-500 text-sm mt-1">{errors.scheduledAt}</p>}
            </div>

            <div>
              <Label htmlFor="startTime">Hora de Inicio</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endTime">Hora de Fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items y Costos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Items y Costos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Descripción del item"
                  />
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Precio Unitario</Label>
                  <Input
                    type="text"
                    value={item.unitPrice ? new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(item.unitPrice) : ''}
                    onChange={(e) => {
                      const value = e.target.value
                      // Remover símbolos de moneda y separadores de miles
                      const cleanValue = value.replace(/[^\d]/g, '')
                      const numValue = cleanValue === '' ? 0 : parseInt(cleanValue) || 0
                      updateItem(index, 'unitPrice', numValue)
                    }}
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input
                    value={new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(item.total)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>

            {items.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">IVA (19%):</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg" style={{ color: companyColors.primary }}>
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Observaciones adicionales sobre el trabajo"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || loading}
          style={{ backgroundColor: companyColors.primary }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : workOrder ? 'Actualizar Orden' : 'Crear Orden'}
        </Button>
      </div>
    </form>
  )
}
