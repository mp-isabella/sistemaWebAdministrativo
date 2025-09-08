"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  User,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  Settings
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import JobManagementModal from "@/components/dashboard/job-management-modal"

interface Job {
  id: string
  title: string
  description: string
  status: string
  priority: string
  scheduledAt: string
  startTime: string
  endTime: string
  address: string
  notes: string
  images: string
  signature: string
  client: {
    name: string
    phone: string
    email: string
    address: string
  }
  service: {
    name: string
  }
  estimatedDuration?: number
}

// Datos de ejemplo para cuando no hay datos reales
const mockJobs: Job[] = [
  {
    id: "JOB-001",
    title: "Detección de Fugas de Agua",
    description: "Detección y reparación de fuga en sistema de agua potable del edificio",
    status: "PENDING",
    priority: "MEDIUM",
    scheduledAt: "2025-08-29T12:00:00Z",
    startTime: "12:00",
    endTime: "13:00",
    address: "Av. Providencia 1234, Santiago",
    notes: "Cliente reporta humedad en pared del baño principal",
    images: "",
    signature: "",
    client: {
      name: "Marcos Torres",
      phone: "+56985714993",
      email: "marcos.torres@gmail.com",
      address: "Av. Providencia 1234, Santiago"
    },
    service: {
      name: "Detección de Fugas"
    },
    estimatedDuration: 60
  },
  {
    id: "JOB-002",
    title: "Reparación Cañería Cocina",
    description: "Reparación de cañería rota en cocina principal",
    status: "IN_PROGRESS",
    priority: "HIGH",
    scheduledAt: "2025-08-29T14:00:00Z",
    startTime: "14:00",
    endTime: "16:00",
    address: "Las Condes 567, Santiago",
    notes: "Acceso por patio trasero, cliente disponible todo el día",
    images: "",
    signature: "",
    client: {
      name: "Ana Martínez",
      phone: "+56987654321",
      email: "ana.martinez@email.com",
      address: "Las Condes 567, Santiago"
    },
    service: {
      name: "Reparación de Cañerías"
    },
    estimatedDuration: 120
  },
  {
    id: "JOB-003",
    title: "Mantención Preventiva Sistema",
    description: "Mantención preventiva del sistema de agua del edificio",
    status: "COMPLETED",
    priority: "LOW",
    scheduledAt: "2025-08-28T10:00:00Z",
    startTime: "10:00",
    endTime: "11:30",
    address: "Ñuñoa 890, Santiago",
    notes: "Sistema funcionando correctamente, se realizó limpieza de filtros",
    images: "",
    signature: "",
    client: {
      name: "Carlos Rodríguez",
      phone: "+56911112222",
      email: "carlos.rodriguez@email.com",
      address: "Ñuñoa 890, Santiago"
    },
    service: {
      name: "Mantención Preventiva"
    },
    estimatedDuration: 90
  }
]

export default function MyJobsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchJobs()
    }
  }, [session])

  // Escuchar eventos de actualización de estado de trabajos
  useEffect(() => {
    const handleJobStatusUpdated = (event: CustomEvent) => {
      console.log('🔄 Estado de trabajo actualizado en Mis Trabajos:', event.detail)
      fetchJobs() // Recargar trabajos para reflejar el nuevo estado
    }

    window.addEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener)

    return () => {
      window.removeEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener)
    }
  }, [])

  useEffect(() => {
    // Aplicar filtros
    let filtered = jobs

    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(job => job.priority === priorityFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredJobs(filtered)
  }, [jobs, statusFilter, priorityFilter, searchTerm])

  useEffect(() => {
    // Aplicar filtro inicial desde URL
    const filter = searchParams.get("filter")
    if (filter) {
      setStatusFilter(filter.toUpperCase())
    }
  }, [searchParams])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/jobs")
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setJobs(data)
          setUseMockData(false)
        } else {
          // Si no hay datos reales, usar datos de ejemplo
          setJobs(mockJobs)
          setUseMockData(true)
        }
      } else {
        // Si hay error en la API, usar datos de ejemplo
        console.warn("Error fetching jobs, using mock data")
        setJobs(mockJobs)
        setUseMockData(true)
      }
    } catch (error) {
      console.error("Error:", error)
      // En caso de error, usar datos de ejemplo
      setJobs(mockJobs)
      setUseMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const handleJobAction = (job: Job, action: string) => {
    switch (action) {
      case 'manage':
        setSelectedJob(job)
        setIsManagementModalOpen(true)
        break
      case 'view':
        router.push(`/dashboard/my-jobs/${job.id}`)
        break
    }
  }

  const handleJobUpdated = () => {
    fetchJobs()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      HIGH: { label: 'Alta', color: 'bg-red-100 text-red-800' },
      MEDIUM: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
      LOW: { label: 'Baja', color: 'bg-green-100 text-green-800' }
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando trabajos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Mis <span className="text-blue-600">Trabajos</span></h1>
            <p className="section-subtitle">Gestión completa de trabajos asignados</p>
            {useMockData && (
              <p className="text-sm text-orange-600 mt-1">
                📝 Mostrando datos de ejemplo - Conectando con base de datos...
              </p>
            )}
          </div>
          <div className="header-actions">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Volver al Dashboard
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar trabajos..."
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
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Prioridad</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="LOW">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter("all")
                    setPriorityFilter("all")
                    setSearchTerm("")
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {jobs.filter(job => job.status === "PENDING").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Progreso</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {jobs.filter(job => job.status === "IN_PROGRESS").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {jobs.filter(job => job.status === "COMPLETED").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Trabajos */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron trabajos</h3>
                <p className="text-gray-600">No hay trabajos que coincidan con los filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        {getStatusBadge(job.status)}
                        {getPriorityBadge(job.priority)}
                      </div>
                      <p className="text-gray-600 mb-3">{job.description}</p>
                      
                      {/* Información del Cliente */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{job.client.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.client.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detalles del Trabajo */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(job.scheduledAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.startTime} - {job.endTime}</span>
                          </span>
                          {job.estimatedDuration && (
                            <span>Duración: {job.estimatedDuration} min</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <Button 
                        size="sm" 
                        className="btn-primary whitespace-nowrap"
                        onClick={() => handleJobAction(job, 'manage')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Gestionar Trabajo
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="btn-outline whitespace-nowrap"
                        onClick={() => handleJobAction(job, 'view')}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de Gestión de Trabajos */}
      <JobManagementModal
        job={selectedJob}
        isOpen={isManagementModalOpen}
        onClose={() => {
          setIsManagementModalOpen(false)
          setSelectedJob(null)
        }}
        onJobUpdated={handleJobUpdated}
      />
    </div>
  )
}