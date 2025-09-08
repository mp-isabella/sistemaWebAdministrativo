"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  Settings,
  FileText,
  Camera,
  Signature
} from "lucide-react"
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
const mockJob: Job = {
  id: "JOB-001",
  title: "Detección de Fugas de Agua",
  description: "Detección y reparación de fuga en sistema de agua potable del edificio. El cliente reporta humedad en la pared del baño principal y sospecha que hay una fuga en las tuberías.",
  status: "PENDING",
  priority: "MEDIUM",
  scheduledAt: "2025-08-29T12:00:00Z",
  startTime: "12:00",
  endTime: "13:00",
  address: "Av. Providencia 1234, Santiago",
  notes: "Cliente reporta humedad en pared del baño principal. Acceso por el lobby del edificio, piso 5, departamento 502.",
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
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false)

  useEffect(() => {
    if (session && params.id) {
      fetchJob()
    }
  }, [session, params.id])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        // Si no hay datos reales, usar datos de ejemplo
        console.warn("Error fetching job, using mock data")
        setJob(mockJob)
      }
    } catch (error) {
      console.error("Error:", error)
      // En caso de error, usar datos de ejemplo
      setJob(mockJob)
    } finally {
      setLoading(false)
    }
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

  const handleJobUpdated = () => {
    fetchJob()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando trabajo...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trabajo no encontrado</h3>
          <p className="text-gray-600">El trabajo que buscas no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => router.push('/dashboard/my-jobs')} className="mt-4">
            Volver a Mis Trabajos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div className="section-header">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/dashboard/my-jobs')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </div>
              <h1 className="section-title">{job.title}</h1>
              <p className="section-subtitle">Detalles completos del trabajo</p>
            </div>
            <div className="header-actions">
              <Button 
                onClick={() => setIsManagementModalOpen(true)} 
                className="btn-primary"
              >
                <Settings className="mr-2 h-4 w-4" />
                Gestionar Trabajo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detalles del Trabajo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Información del Trabajo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estado:</span>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Prioridad:</span>
                    {getPriorityBadge(job.priority)}
                  </div>
                  <div>
                    <span className="font-medium">Descripción:</span>
                    <p className="text-gray-600 mt-1">{job.description}</p>
                  </div>
                  <div>
                    <span className="font-medium">Dirección:</span>
                    <p className="text-gray-600 mt-1">{job.address}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Fecha:</span>
                      <p className="text-gray-600 mt-1">{formatDate(job.scheduledAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Horario:</span>
                      <p className="text-gray-600 mt-1">{job.startTime} - {job.endTime}</p>
                    </div>
                  </div>
                  {job.estimatedDuration && (
                    <div>
                      <span className="font-medium">Duración estimada:</span>
                      <p className="text-gray-600 mt-1">{job.estimatedDuration} minutos</p>
                    </div>
                  )}
                  {job.notes && (
                    <div>
                      <span className="font-medium">Notas:</span>
                      <p className="text-gray-600 mt-1">{job.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Evidencias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Evidencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {job.images ? (
                    <div className="grid grid-cols-2 gap-4">
                      {job.images.split(",").map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay evidencias cargadas</p>
                  )}
                </CardContent>
              </Card>

              {/* Firma */}
              {job.signature && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Signature className="h-5 w-5" />
                      Firma del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={job.signature}
                      alt="Firma del cliente"
                      className="max-w-full h-32 object-contain border rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Información del Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{job.client.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{job.client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{job.client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{job.client.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Servicio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{job.service.name}</p>
                </CardContent>
              </Card>

              {/* Acciones Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setIsManagementModalOpen(true)} 
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gestionar Trabajo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard/my-jobs')}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Mis Trabajos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Gestión de Trabajos - Fuera del contenedor del dashboard */}
      <JobManagementModal
        job={job}
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        onJobUpdated={handleJobUpdated}
      />
    </>
  )
}
