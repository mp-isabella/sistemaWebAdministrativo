"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  User, 
  Building, 
  Calendar,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import "../../styles/unified-design.css"

interface Job {
  id: string
  title: string
  description?: string
  status: string
  scheduledAt?: string
  completedAt?: string
  address?: string
  service: {
    id: string
    name: string
    price?: number
  }
  client: {
    id: string
    name: string
    email: string
    company?: string
  }
  technician?: {
    id: string
    name: string
    email: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export default function PendingPaymentsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [processingJob, setProcessingJob] = useState<string | null>(null)

  // Cargar trabajos completados pendientes de pago
  const loadPendingPayments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs?status=COMPLETED&pendingPayment=true')
      const data = await response.json()
      
      if (data.jobs) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Error loading pending payments:', error)
      toast({
        title: "Error",
        description: "Error al cargar trabajos pendientes de pago",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadPendingPayments()
    }
  }, [status])

  // Verificar si el usuario tiene permisos
  if (status === "loading") {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || !['admin', 'secretaria'].includes((session?.user as any)?.role?.toLowerCase() || '')) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Acceso Denegado</h3>
            <p className="text-gray-500">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      </div>
    )
  }

  // Marcar trabajo como pagado
  const handleMarkAsPaid = async (jobId: string, paymentMethod: string = 'efectivo') => {
    setProcessingJob(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: data.message,
        })
        // Remover el trabajo de la lista
        setJobs(prev => prev.filter(job => job.id !== jobId))
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al marcar como pagado",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setProcessingJob(null)
    }
  }

  // Filtrar trabajos
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.technician?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    return matchesSearch
  })

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              💰 Pagos <span className="text-green-600">Pendientes</span>
            </h1>
            <p className="section-subtitle">
              Trabajos completados pendientes de confirmación de pago
            </p>
          </div>
          <div className="header-actions">
            <Button variant="outline" onClick={loadPendingPayments} className="btn-outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, cliente, técnico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📋 Todos los trabajos</SelectItem>
                    <SelectItem value="completed">✅ Completados</SelectItem>
                    <SelectItem value="pending">⏳ Pendientes de pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredJobs.length} trabajos encontrados
              </div>
              <div className="text-sm text-green-600 font-medium">
                Total pendiente: ${filteredJobs.reduce((sum, job) => sum + (job.service.price || 0), 0).toLocaleString('es-CL')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Trabajos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay pagos pendientes</h3>
                <p className="text-gray-500">Todos los trabajos completados han sido marcados como pagados</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                          ✅ Completado
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                          💰 Pendiente de Pago
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{job.client.name}</p>
                            <p className="text-xs text-gray-500">{job.client.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {job.technician?.name || 'Sin asignar'}
                            </p>
                            <p className="text-xs text-gray-500">Técnico</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              ${(job.service.price || 0).toLocaleString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-500">{job.service.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {job.completedAt ? formatDate(job.completedAt) : 'No completado'}
                            </p>
                            <p className="text-xs text-gray-500">Completado</p>
                          </div>
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                      )}

                      {job.address && (
                        <p className="text-sm text-gray-500 mb-4">
                          📍 {job.address}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleMarkAsPaid(job.id, 'efectivo')}
                        disabled={processingJob === job.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingJob === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <DollarSign className="h-4 w-4 mr-2" />
                        )}
                        Marcar como Pagado
                      </Button>

                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(job.id, 'efectivo')}
                          disabled={processingJob === job.id}
                          className="text-xs"
                        >
                          💵 Efectivo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(job.id, 'tarjeta')}
                          disabled={processingJob === job.id}
                          className="text-xs"
                        >
                          💳 Tarjeta
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(job.id, 'transferencia')}
                          disabled={processingJob === job.id}
                          className="text-xs"
                        >
                          🏦 Transferencia
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
