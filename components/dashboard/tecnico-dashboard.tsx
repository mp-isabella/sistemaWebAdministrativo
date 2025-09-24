"use client"

import { useEffect, useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  // Camera, 
  FileText,
  Mail,
  MapPin,
  Phone,
  Settings,
  TrendingUp,
  User,
  Wrench
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import JobManagementModal from "./job-management-modal"

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

export default function TecnicoDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    efficiency: 0,
    averageRating: 0
  })
  const [todayJobs, setTodayJobs] = useState<Job[]>([])
  const [recentCompleted, setRecentCompleted] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false)

  useEffect(() => {
    if (session) {
      fetchTecnicoData()
    }
  }, [session])

  const fetchTecnicoData = async () => {
    try {
      // Simulated data - replace with actual API calls
      setStats({
        todayJobs: 5,
        pendingJobs: 8,
        completedJobs: 42,
        efficiency: 95,
        averageRating: 4.8
      })

      setTodayJobs([
        {
          id: "JOB-001",
          title: "Detección de Fuga",
          description: "Detección de fuga en sistema de agua potable",
          status: "IN_PROGRESS",
          priority: "HIGH",
          scheduledAt: "2024-01-15T09:00:00Z",
          startTime: "09:00",
          endTime: "11:00",
          address: "Av. Providencia 1234, Santiago",
          notes: "Cliente reporta humedad en pared",
          images: "",
          signature: "",
          client: {
            name: "María González",
            phone: "+56 9 1234 5678",
            email: "maria@email.com",
            address: "Av. Providencia 1234, Santiago"
          },
          service: { name: "Detección de Fugas" },
          estimatedDuration: 120
        },
        {
          id: "JOB-002",
          title: "Reparación Cañería",
          description: "Reparación de cañería rota en cocina",
          status: "PENDING",
          priority: "MEDIUM",
          scheduledAt: "2024-01-15T14:00:00Z",
          startTime: "14:00",
          endTime: "17:00",
          address: "Las Condes 567, Santiago",
          notes: "Acceso por patio trasero",
          images: "",
          signature: "",
          client: {
            name: "Carlos Rodríguez",
            phone: "+56 9 8765 4321",
            email: "carlos@email.com",
            address: "Las Condes 567, Santiago"
          },
          service: { name: "Reparación de Cañerías" },
          estimatedDuration: 180
        }
      ])

      setRecentCompleted([
        {
          id: "JOB-003",
          title: "Mantención Preventiva",
          description: "Mantención preventiva sistema de agua",
          status: "COMPLETED",
          priority: "LOW",
          scheduledAt: "2024-01-14T10:00:00Z",
          startTime: "10:00",
          endTime: "11:30",
          address: "Ñuñoa 890, Santiago",
          notes: "Sistema funcionando correctamente",
          images: "",
          signature: "",
          client: {
            name: "Pedro Sánchez",
            phone: "+56 9 1111 2222",
            email: "pedro@email.com",
            address: "Ñuñoa 890, Santiago"
          },
          service: { name: "Mantención Preventiva" },
          estimatedDuration: 90
        }
      ])

      setLoading(false)
    } catch (error) {
      
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', color: 'warning' },
      IN_PROGRESS: { label: 'En Progreso', color: 'primary' },
      COMPLETED: { label: 'Completado', color: 'success' },
      CANCELLED: { label: 'Cancelado', color: 'danger' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'info' }
    return <span className={`badge-modern ${config.color}`}>{config.label}</span>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      HIGH: { label: 'Alta', color: 'danger' },
      MEDIUM: { label: 'Media', color: 'warning' },
      LOW: { label: 'Baja', color: 'success' }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'info' }
    return <span className={`badge-modern ${config.color}`}>{config.label}</span>
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleJobAction = (jobId: string, action: string) => {
    switch (action) {
      case 'start':
        router.push(`/dashboard/my-jobs/${jobId}/start`)
        break
      case 'complete':
        router.push(`/dashboard/my-jobs/${jobId}/complete`)
        break
      case 'view':
        router.push(`/dashboard/my-jobs/${jobId}`)
        break
      case 'manage':
        const job = todayJobs.find(j => j.id === jobId) || recentCompleted.find(j => j.id === jobId)
        if (job) {
          setSelectedJob(job)
          setIsManagementModalOpen(true)
        }
        break
    }
  }

  const handleJobUpdated = () => {
    fetchTecnicoData()
  }

  if (loading) {
    return (
      <div className="loading-modern">
        <div className="loading-spinner-modern"></div>
        <p className="text-xl text-gray-600 font-medium ml-4">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header del Dashboard */}
        <div className="dashboard-header-modern">
          <div className="header-content">
            <div className="header-main">
              <h1 className="header-title">
                Panel de <span className="text-gradient">Técnico</span>
              </h1>
              <p className="header-subtitle">
                Gestión de trabajos asignados
              </p>
            </div>

            <div className="header-actions">
              <Button
                onClick={() => router.push('/dashboard/my-jobs')}
                className="btn-modern primary lg"
              >
                <Wrench className="h-5 w-5" />
                Mis Trabajos
              </Button>
              <Button
                onClick={() => router.push('/dashboard/calendar')}
                className="btn-modern secondary lg"
              >
                <Calendar className="h-5 w-5" />
                Calendario
              </Button>
            </div>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="stats-grid-modern">
          {/* Trabajos Hoy */}
          <div className="stat-card-modern primary" onClick={() => router.push('/dashboard/my-jobs?filter=today')}>
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-label">Trabajos Hoy</div>
                <div className="stat-value">{stats.todayJobs}</div>
                <div className="stat-subtitle">Trabajos programados para hoy</div>
              </div>
              <div className="stat-icon">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Trabajos Pendientes */}
          <div className="stat-card-modern warning" onClick={() => router.push('/dashboard/my-jobs?filter=pending')}>
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-label">Pendientes</div>
                <div className="stat-value">{stats.pendingJobs}</div>
                <div className="stat-subtitle">Trabajos en espera</div>
              </div>
              <div className="stat-icon">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Trabajos Completados */}
          <div className="stat-card-modern success" onClick={() => router.push('/dashboard/my-jobs?filter=completed')}>
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-label">Completados</div>
                <div className="stat-value">{stats.completedJobs}</div>
                <div className="stat-subtitle">Trabajos finalizados</div>
              </div>
              <div className="stat-icon">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de Rendimiento */}
        <div className="grid-modern cols-2 gap-8">
          {/* Eficiencia del Mes */}
          <div className="content-card-modern">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h2 className="card-title">Eficiencia del Mes</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progreso</span>
                    <span className="text-lg font-bold text-green-600">{stats.efficiency}%</span>
                  </div>
                  <Progress value={stats.efficiency} className="h-3" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Calificación Promedio</span>
                  <span className="text-lg font-bold text-blue-600">{stats.averageRating}/5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Trabajos */}
          <div className="content-card-modern">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <h2 className="card-title">Próximos Trabajos</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {todayJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-100/70 transition-colors duration-150">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{job.title}</p>
                        <p className="text-xs text-gray-500">{formatTime(job.scheduledAt)}</p>
                      </div>
                    </div>
                    {getPriorityBadge(job.priority)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trabajos de Hoy */}
        <div className="content-card-modern">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-indigo-600" />
                <h2 className="card-title">Trabajos de Hoy</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/my-jobs')}
                className="btn-modern secondary"
              >
                Ver Todos
              </Button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              {todayJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                        {getStatusBadge(job.status)}
                        {getPriorityBadge(job.priority)}
                      </div>
                      <p className="text-gray-600 mb-4">{job.description}</p>

                      {/* Información del Cliente */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">{job.client.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.client.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.client.email}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.client.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detalles del Trabajo */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Duración estimada: {job.estimatedDuration} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      className="btn-modern primary"
                      onClick={() => handleJobAction(job.id, 'manage')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gestionar Trabajo
                    </Button>
                    <Button
                      size="sm"
                      className="btn-modern secondary"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trabajos Completados Recientemente */}
        <div className="content-card-modern">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="card-title">Trabajos Completados Recientemente</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentCompleted.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-100/70 transition-colors duration-150">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-800">{job.title}</span>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {job.client.name} - {job.service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Completado: {formatDate(job.scheduledAt)}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      className="btn-modern secondary"
                      onClick={() => handleJobAction(job.id, 'manage')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gestionar
                    </Button>
                    <Button
                      size="sm"
                      className="btn-modern secondary"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  )
}
