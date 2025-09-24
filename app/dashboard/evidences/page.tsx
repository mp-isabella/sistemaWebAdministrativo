"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  // Filter, 
  ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video,
  X
} from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import "../styles/unified-design.css";

interface Evidence {
  id: string;
  title: string;
  description: string;
  type: "image" | "document" | "video";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  jobId: string;
  clientName: string;
  technicianName: string;
  status: "pending" | "approved" | "rejected";
  url?: string;
  thumbnail?: string;
}

export default function EvidencesPage() {
  const { data: _session } = useSession();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Datos de ejemplo mejorados
  const [evidenceData, setEvidenceData] = useState<Evidence[]>([
    {
      id: "1",
      title: "Instalación Sistema de Riego",
      description: "Evidencia de la instalación completa del sistema de riego automático en el jardín principal",
      type: "image",
      fileName: "instalacion_riego_001.jpg",
      fileSize: "2.5 MB",
      uploadedAt: "2025-01-15",
      jobId: "JOB-001",
      clientName: "María González",
      technicianName: "Juan Pérez",
      status: "approved",
      url: "/evidencia1.webp",
      thumbnail: "/evidencia1.webp"
    },
    {
      id: "2",
      title: "Mantenimiento Equipos Hidráulicos",
      description: "Documento técnico detallado del mantenimiento preventivo realizado",
      type: "document",
      fileName: "mantenimiento_equipos.pdf",
      fileSize: "1.8 MB",
      uploadedAt: "2025-01-14",
      jobId: "JOB-002",
      clientName: "Carlos Rodríguez",
      technicianName: "Ana Silva",
      status: "pending"
    },
    {
      id: "3",
      title: "Reparación Tuberías Principales",
      description: "Video completo de la reparación de tuberías principales del sistema",
      type: "video",
      fileName: "reparacion_tuberias.mp4",
      fileSize: "15.2 MB",
      uploadedAt: "2025-01-13",
      jobId: "JOB-003",
      clientName: "Ana Martínez",
      technicianName: "Luis Torres",
      status: "approved"
    },
    {
      id: "4",
      title: "Detección de Fugas",
      description: "Imágenes del proceso de detección y localización de fugas",
      type: "image",
      fileName: "deteccion_fugas_001.jpg",
      fileSize: "3.1 MB",
      uploadedAt: "2025-01-12",
      jobId: "JOB-004",
      clientName: "Empresa ABC",
      technicianName: "Pedro Sánchez",
      status: "approved",
      url: "/evidencia3.webp",
      thumbnail: "/evidencia3.webp"
    },
    {
      id: "5",
      title: "Video Inspección Alcantarillado",
      description: "Video inspección completa del sistema de alcantarillado",
      type: "video",
      fileName: "video_inspeccion.mp4",
      fileSize: "8.7 MB",
      uploadedAt: "2025-01-11",
      jobId: "JOB-005",
      clientName: "Condominio Los Pinos",
      technicianName: "María López",
      status: "pending"
    }
  ]);

  // Estadísticas
  const stats = {
    total: evidenceData.length,
    approved: evidenceData.filter(e => e.status === "approved").length,
    pending: evidenceData.filter(e => e.status === "pending").length,
    rejected: evidenceData.filter(e => e.status === "rejected").length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Camera className="h-5 w-5 text-blue-600" />;
      case "document":
        return <FileText className="h-5 w-5 text-green-600" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const filteredEvidence = evidenceData.filter(evidence => {
    const matchesSearch = evidence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evidence.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evidence.technicianName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || evidence.type === typeFilter;
    const matchesStatus = statusFilter === "all" || evidence.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUploadEvidence = () => {
    setShowUploadModal(true);
  };

  const handleViewEvidence = (evidence: Evidence) => {
    if (evidence.url) {
      window.open(evidence.url, '_blank');
    } else {
      toast({
        title: "Evidencia no disponible",
        description: "La evidencia no tiene una URL válida para visualizar.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadEvidence = (evidence: Evidence) => {
    toast({
      title: "Descarga iniciada",
      description: `Descargando ${evidence.fileName}...`,
    });
    // Aquí iría la lógica real de descarga
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setEvidenceData(prev => prev.filter(e => e.id !== evidenceId));
    toast({
      title: "Evidencia eliminada",
      description: "La evidencia ha sido eliminada exitosamente.",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Unificado */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              <span className="text-blue-600">Gestión de</span> Evidencias
            </h1>
            <p className="section-subtitle">
              Administra y revisa todas las evidencias de trabajos realizados por técnicos
            </p>
          </div>
          <div className="header-actions">
            <Button
              className="btn-primary"
              onClick={handleUploadEvidence}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Evidencia
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Evidencias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="unified-card">
          <div className="unified-card-header">
            <h3 className="text-lg font-semibold text-slate-900">Filtros y Búsqueda</h3>
          </div>
          <div className="unified-card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group hidden lg:block">
                <label className="form-label">Buscar</label>
                <div className="search-container">
                  <Search className="search-icon" />
                  <Input
                    type="text"
                    placeholder="Buscar evidencia, cliente o técnico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="image">Imágenes</SelectItem>
                    <SelectItem value="document">Documentos</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group">
                <label className="form-label">Acciones</label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="btn-outline flex-1"
                    onClick={clearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-outline"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Evidencias */}
        <div className="grid gap-6">
          {filteredEvidence.length === 0 ? (
            <div className="unified-card">
              <div className="unified-card-content text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron evidencias</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all" ?
                    "No se encontraron evidencias para los filtros seleccionados. Intenta ajustar los criterios de búsqueda." :
                    "Aún no hay evidencias registradas en el sistema. Comienza subiendo la primera evidencia."
                  }
                </p>
                <Button
                  className="btn-primary"
                  onClick={handleUploadEvidence}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Subir Primera Evidencia
                </Button>
              </div>
            </div>
          ) : (
            filteredEvidence.map((evidence) => (
              <div key={evidence.id} className="unified-card hover:shadow-lg transition-all duration-300">
                <div className="unified-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(evidence.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{evidence.title}</h3>
                        </div>
                        <Badge className={`${getStatusColor(evidence.status)} border`}>
                          {getStatusLabel(evidence.status)}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">{evidence.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Archivo:</span>
                          <span className="truncate">{evidence.fileName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Tamaño:</span>
                          <span>{evidence.fileSize}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(evidence.uploadedAt).toLocaleDateString("es-CL")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Cliente:</span>
                          <span>{evidence.clientName}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-medium">Técnico:</span>
                        <span>{evidence.technicianName}</span>
                        <span className="font-medium">Trabajo:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                          {evidence.jobId}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline"
                        onClick={() => handleViewEvidence(evidence)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline"
                        onClick={() => handleDownloadEvidence(evidence)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteEvidence(evidence.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Subida (placeholder) */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Subir Nueva Evidencia</h3>
              <p className="text-gray-600 mb-4">
                Funcionalidad de subida de evidencias en desarrollo...
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="btn-primary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
