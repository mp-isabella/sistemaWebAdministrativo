"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ImageIcon,
  FilePenLineIcon as Signature,
} from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import DigitalSignature from "@/components/ui/digital-signature";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

// Definición de la interfaz Job
interface Job {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  scheduledAt: string;
  client: {
    name: string;
    phone: string;
    address: string;
  };
  service: {
    name: string;
  };
  images: {
    url: string
  }[];
  signatureUrl?: string;
}

// =========================================================================
// COMPONENTE PRINCIPAL: MyJobsPage
// =========================================================================

export default function MyJobsPage() {
  const { data: session, status } = useSession();

  
  const { toast } = useToast();
  const router = useRouter();

  const [jobs, setJobs] = useState < Job[] > ([]);
  const [filteredJobs, setFilteredJobs] = useState < Job[] > ([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentJobId, setCurrentJobId] = useState < string | null > (null);
  const [currentJobImages, setCurrentJobImages] = useState < string[] > ([]);
  const [currentJobSignature, setCurrentJobSignature] = useState <
    string | undefined
  > (undefined);

  // Lógica de redirección en un solo lugar
  useEffect(() => {
    // Si la sesión no está autenticada o el rol no es "operador", redirigir
    if (status === "unauthenticated" || (status === "authenticated" && session.user.role !== "operador")) {
      router.push("/login");
    }
  }, [status, session, router]);

  // Si la sesión está en estado de carga o no tiene el rol correcto, muestra un spinner.
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autorizado, simplemente no renderizamos nada, la redirección ya está en curso.
  if (status === "unauthenticated" || (status === "authenticated" && session.user.role !== "operador")) {
    return null;
  }

  // Hook para cargar los trabajos al inicio
  useEffect(() => {
    fetchMyJobs();
  }, []);

  // Hook para filtrar los trabajos cada vez que cambian los filtros
  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, searchTerm]);

  // =========================================================================
  // FUNCIONES DE LÓGICA
  // =========================================================================

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError("");
      // La API debe filtrar los trabajos basándose en el ID de usuario de la sesión
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al cargar tus trabajos.");
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Error de conexión al cargar tus trabajos.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs.filter((job) => {
      const statusMatch =
        statusFilter === "all" || job.status === statusFilter;
      const searchMatch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.service.name.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
    setFilteredJobs(filtered);
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        toast({
          title: "Estado Actualizado",
          description: `El trabajo ha sido marcado como ${getStatusLabel(
            newStatus
          )}.`,
        });
        await fetchMyJobs();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al actualizar el estado del trabajo.");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      setError("Error de conexión al actualizar el estado.");
    }
  };

  const handleImageSave = () => {
    toast({
      title: "Imágenes Subidas",
      description: "Las imágenes se han subido exitosamente.",
    });
    setShowImageUpload(false);
    fetchMyJobs();
  };

  const handleSignatureSave = async (dataUrl: string) => {
    if (!currentJobId) return;
    try {
      const response = await fetch(`/api/jobs/${currentJobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          signatureUrl: dataUrl
        }),
      });

      if (response.ok) {
        toast({
          title: "Firma Guardada",
          description: "La firma digital ha sido guardada exitosamente.",
        });
        setShowSignaturePad(false);
        await fetchMyJobs();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al guardar la firma.");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      setError("Error de conexión al guardar la firma.");
    }
  };

  // =========================================================================
  // FUNCIONES AUXILIARES DE UI
  // =========================================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completado";
      case "IN_PROGRESS":
        return "En Progreso";
      case "PENDING":
        return "Pendiente";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "Alta";
      case "MEDIUM":
        return "Media";
      case "LOW":
        return "Baja";
      default:
        return priority;
    }
  };

  // =========================================================================
  // RENDERIZADO DEL COMPONENTE
  // =========================================================================

  return (
    <div className="space-y-6">
      { /* Encabezado */ }
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Trabajos</h1>
        <p className="text-gray-600">Gestiona los servicios asignados a ti</p>
      </div>

      { /* Alerta de error */ } {
        error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )
      }

      { /* Filtros */ }
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar trabajo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Acciones</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      { /* Lista de trabajos */ }
      <div className="grid gap-4">
        {
          filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes trabajos asignados</h3>
                <p className="text-gray-600 mb-4">
                  {
                    searchTerm || statusFilter !== "all" ?
                    "No se encontraron trabajos para los filtros seleccionados." :
                      "Parece que no tienes trabajos pendientes. ¡Buen trabajo!"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</Badge>
                        <Badge className={getPriorityColor(job.priority)}>{getPriorityLabel(job.priority)}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{job.client.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{job.client.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{job.client.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.scheduledAt).toLocaleString("es-CL")}</span>
                        </div>
                      </div>
                      {job.description && <p className="text-gray-700 mb-3">{job.description}</p>}
                      {job.images && job.images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Imágenes del Trabajo:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.images.map((img, idx) => (
                              <img key={idx} src={img.url || "/placeholder.svg"} alt={`Job Image ${idx}`} className="w-20 h-20 object-cover rounded-md" />
                            ))}
                          </div>
                        </div>
                      )}
                      {job.signatureUrl && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Firma del Cliente:</h4>
                          <img src={job.signatureUrl || "/placeholder.svg"} alt="Client Signature" className="w-40 h-20 object-contain border rounded-md" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      {job.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateJobStatus(job.id, "IN_PROGRESS")}
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      )}
                      {job.status === "IN_PROGRESS" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateJobStatus(job.id, "COMPLETED")}
                            className="bg-green-500 text-white hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateJobStatus(job.id, "CANCELLED")}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {(job.status === "IN_PROGRESS" || job.status === "PENDING") && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentJobId(job.id);
                              setCurrentJobImages(job.images.map(img => img.url));
                              setShowImageUpload(true);
                            }}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Imágenes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentJobId(job.id);
                              setCurrentJobSignature(job.signatureUrl);
                              setShowSignaturePad(true);
                            }}
                          >
                            <Signature className="h-4 w-4 mr-2" />
                            Firma
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        }
      </div>

      { /* Modales */ } {
        showImageUpload && currentJobId && (
          <ImageUpload
            jobId={currentJobId}
            onImagesUploaded={handleImageSave}
            existingImages={currentJobImages}
            onCancel={() => setShowImageUpload(false)}
          />
        )
      }

      {
        showSignaturePad && currentJobId && (
          <DigitalSignature
            jobId={currentJobId}
            onSignatureSaved={handleSignatureSave}
            existingSignature={currentJobSignature}
            onCancel={() => setShowSignaturePad(false)}
          />
        )
      }
    </div>
  );
}