"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Camera, CheckCircle, MapPin, User, FileText, FilePenLineIcon as Signature } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"
import DigitalSignature from "@/components/ui/digital-signature"


export interface JobType {
  id: string;
  title: string;
  client: {
    name: string;
    phone: string;
    address: string;
  };
  service: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  scheduledAt: string;
  completedAt?: string;
  description: string;
  images: string[];
  observations: string;
  signature: string | null;
}


export default function TecnicoDashboard() {
 const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyJobs()
  }, [])

 const fetchMyJobs = async () => {
  try {
    const mockJobs: JobType[] = [
      {
        id: "JOB-001",
        title: "Fuga en jardín - Casa Las Condes",
        client: {
          name: "María González",
          phone: "+56912345678",
          address: "Av. Las Condes 1234, Las Condes",
        },
        service: "Detección de fuga",
        status: "IN_PROGRESS",
        priority: "HIGH",
        scheduledAt: "2024-01-16T09:00:00Z",
        description: "Cliente reporta fuga de agua en el jardín trasero.",
        images: [],
        observations: "",
        signature: null,
      },
      {
        id: "JOB-002",
        title: "Mantención preventiva - Oficina",
        client: {
          name: "Empresa ABC",
          phone: "+56987654321",
          address: "Av. Providencia 456, Providencia",
        },
        service: "Mantención preventiva",
        status: "PENDING",
        priority: "MEDIUM",
        scheduledAt: "2024-01-17T14:00:00Z",
        description: "Mantención programada del sistema de agua.",
        images: [],
        observations: "",
        signature: null,
      },
      {
        id: "JOB-003",
        title: "Reparación urgente - Condominio",
        client: {
          name: "Condominio Los Pinos",
          phone: "+56911111111",
          address: "Calle Los Pinos 789, Ñuñoa",
        },
        service: "Reparación de cañería",
        status: "COMPLETED",
        priority: "HIGH",
        scheduledAt: "2024-01-15T08:00:00Z",
        completedAt: "2024-01-15T16:30:00Z",
        description: "Reparación de cañería principal dañada.",
        images: ["/placeholder.svg?height=200&width=300"],
        observations: "Trabajo completado exitosamente. Se reemplazó 3 metros de cañería.",
        signature: "data:image/png;base64,signature_data",
      },
    ];

    setJobs(mockJobs);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    setLoading(false);
  }
};


  const updateJobStatus = async (jobId: string, status: string, data: any = {}) => {
    try {
      // API call to update job status
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, ...data }),
      })

      if (response.ok) {
        fetchMyJobs() // Refresh jobs
        setSelectedJob(null)
      }
    } catch (error) {
      console.error("Error updating job status:", error)
    }
  }

  const handleImageUpload = (jobId: string, images: string[]) => {
    setJobs((prevJobs) =>
      prevJobs.map((job: any) => (job.id === jobId ? { ...job, images: [...job.images, ...images] } : job)),
    )
  }

  const handleSignature = (jobId: string, signature: string) => {
    setJobs((prevJobs) => prevJobs.map((job: any) => (job.id === jobId ? { ...job, signature } : job)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredJobs = jobs.filter((job: any) => {
    if (filter === "all") return true
    return job.status === filter
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando trabajos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Trabajos</h1>
          <p className="text-gray-600">Gestiona tus trabajos asignados</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="bg-transparent"
          >
            Todos
          </Button>
          <Button
            variant={filter === "PENDING" ? "default" : "outline"}
            onClick={() => setFilter("PENDING")}
            className="bg-transparent"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === "IN_PROGRESS" ? "default" : "outline"}
            onClick={() => setFilter("IN_PROGRESS")}
            className="bg-transparent"
          >
            En Curso
          </Button>
          <Button
            variant={filter === "COMPLETED" ? "default" : "outline"}
            onClick={() => setFilter("COMPLETED")}
            className="bg-transparent"
          >
            Finalizados
          </Button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job: any) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{job.service}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                  <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  {job.client.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {job.client.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(job.scheduledAt).toLocaleDateString("es-CL")} -{" "}
                  {new Date(job.scheduledAt).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <p className="text-sm text-gray-700">{job.description}</p>

                <div className="flex space-x-2 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 bg-transparent"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                  {job.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => updateJobStatus(job.id, "IN_PROGRESS")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Iniciar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                  <p className="text-gray-600">{selectedJob.service}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Cerrar
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre</label>
                      <p className="text-gray-900">{selectedJob.client.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-gray-900">{selectedJob.client.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dirección</label>
                      <p className="text-gray-900">{selectedJob.client.address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estado del Trabajo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                      <Badge className={getStatusColor(selectedJob.status)}>{selectedJob.status}</Badge>
                      <Badge className={getPriorityColor(selectedJob.priority)}>{selectedJob.priority}</Badge>
                    </div>

                    {selectedJob.status === "IN_PROGRESS" && (
                      <div className="space-y-2">
                        <Button
                          onClick={() =>
                            updateJobStatus(selectedJob.id, "COMPLETED", {
                              observations: selectedJob.observations,
                              images: selectedJob.images,
                              signature: selectedJob.signature,
                            })
                          }
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={!selectedJob.signature}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Finalizar Trabajo
                        </Button>
                        <p className="text-xs text-gray-500">
                          {!selectedJob.signature && "Se requiere firma para finalizar"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Images Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5" />
                    Evidencias Fotográficas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    jobId={selectedJob.id}
                    existingImages={selectedJob.images}
                    onImagesUploaded={(images) => handleImageUpload(selectedJob.id, images)}
                    disabled={selectedJob.status === "COMPLETED"}
                  />
                </CardContent>
              </Card>

              {/* Observations */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe el trabajo realizado, materiales utilizados, observaciones..."
                    value={selectedJob.observations}
                    onChange={(e) =>
                      setJobs((prevJobs) =>
                        prevJobs.map((job: any) =>
                          job.id === selectedJob.id ? { ...job, observations: e.target.value } : job,
                        ),
                      )
                    }
                    rows={4}
                    disabled={selectedJob.status === "COMPLETED"}
                  />
                </CardContent>
              </Card>

              {/* Digital Signature */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Signature className="mr-2 h-5 w-5" />
                    Firma Digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DigitalSignature
                    jobId={selectedJob.id}
                    existingSignature={selectedJob.signature}
                    onSignatureSaved={(signature) => handleSignature(selectedJob.id, signature)}
                    disabled={selectedJob.status === "COMPLETED"}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
