"use client"

import WorkOrderForm from "@/components/forms/work-order-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertCircle,
  Building2,
  Clock,
  // Calendar,
  DollarSign,
  Download,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  User,
  // Eye,
  Wrench
} from 'lucide-react'
import { useEffect, useState } from "react"

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingWorkOrder, setEditingWorkOrder] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    loadWorkOrders()
    loadCompanies()
  }, [])

  const loadWorkOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/work-orders")
      if (!response.ok) throw new Error("Error cargando órdenes de trabajo")

      const data = await response.json()
      setWorkOrders(data)
    } catch (error) {
      
      setError("Error cargando órdenes de trabajo")
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      
    }
  }

  const handleCreateWorkOrder = async (data: any) => {
    try {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error("Error creando orden de trabajo")

      await loadWorkOrders()
      setShowForm(false)
    } catch (error) {
      
      setError("Error creando orden de trabajo")
    }
  }

  const handleUpdateWorkOrder = async (data: any) => {
    try {
      const response = await fetch(`/api/work-orders/${editingWorkOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error("Error actualizando orden de trabajo")

      await loadWorkOrders()
      setShowForm(false)
      setEditingWorkOrder(null)
    } catch (error) {
      
      setError("Error actualizando orden de trabajo")
    }
  }

  const handleDeleteWorkOrder = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta orden de trabajo?")) return

    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Error eliminando orden de trabajo")

      await loadWorkOrders()
    } catch (error) {
      
      setError("Error eliminando orden de trabajo")
    }
  }

  const handleExportPDF = (id: string) => {
    window.open(`/api/work-orders/${id}/export-pdf`, '_blank')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "Borrador", className: "bg-yellow-100 text-yellow-800" },
      IN_PROGRESS: { label: "En Progreso", className: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Completado", className: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800" },
      BILLED: { label: "Facturado", className: "bg-purple-100 text-purple-800" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { label: "Baja", className: "bg-green-100 text-green-800" },
      MEDIUM: { label: "Media", className: "bg-yellow-100 text-yellow-800" },
      HIGH: { label: "Alta", className: "bg-orange-100 text-orange-800" },
      URGENT: { label: "Urgente", className: "bg-red-100 text-red-800" }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM
    return <Badge className={config.className}>{config.label}</Badge>
  }

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

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch =
      workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.client?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter
    const matchesCompany = companyFilter === "all" || workOrder.companyId === companyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando órdenes de trabajo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-gray-600">Gestión de órdenes de trabajo y servicios</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkOrder ? "Editar Orden de Trabajo" : "Nueva Orden de Trabajo"}
              </DialogTitle>
            </DialogHeader>
            <WorkOrderForm
              workOrder={editingWorkOrder}
              onSubmit={editingWorkOrder ? handleUpdateWorkOrder : handleCreateWorkOrder}
              onCancel={() => {
                setShowForm(false)
                setEditingWorkOrder(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="hidden lg:block">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, número o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="BILLED">Facturado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Empresa</label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCompanyFilter("all")
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <div className="grid gap-4">
        {filteredWorkOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de trabajo</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || statusFilter !== "all" || companyFilter !== "all"
                  ? "No se encontraron órdenes con los filtros aplicados"
                  : "Comience creando su primera orden de trabajo"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkOrders.map((workOrder) => {
            const companyColors = getCompanyColors(workOrder.company?.type || 'AMESTICA')

            return (
              <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: companyColors.primary }}
                        />
                        <h3 className="text-lg font-semibold">{workOrder.title}</h3>
                        {getStatusBadge(workOrder.status)}
                        {getPriorityBadge(workOrder.priority)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{workOrder.company?.name || 'Sin empresa'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{workOrder.client?.name || 'Sin cliente'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {workOrder.scheduledAt
                              ? format(new Date(workOrder.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: es })
                              : 'Sin fecha'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${workOrder.total?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPDF(workOrder.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingWorkOrder(workOrder)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWorkOrder(workOrder.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {workOrder.description && (
                    <p className="text-gray-600 text-sm mb-3">{workOrder.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Orden: {workOrder.workOrderNumber}</span>
                    <span>Creado: {format(new Date(workOrder.createdAt), 'dd/MM/yyyy', { locale: es })}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Summary */}
      {filteredWorkOrders.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Total de órdenes: {filteredWorkOrders.length}</span>
              <span>
                Total valor: ${filteredWorkOrders.reduce((sum, wo) => sum + (wo.total || 0), 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
