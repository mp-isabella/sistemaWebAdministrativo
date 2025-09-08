"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  ImageIcon, 
  FileText, 
  Calendar,
  Download,
  Eye,
  Trash2
} from "lucide-react";
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
  status: "pending" | "approved" | "rejected";
}

export default function EvidencePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Datos de ejemplo
  const evidenceData: Evidence[] = [
    {
      id: "1",
      title: "Instalación Sistema de Riego",
      description: "Evidencia de la instalación completa del sistema de riego automático",
      type: "image",
      fileName: "instalacion_riego_001.jpg",
      fileSize: "2.5 MB",
      uploadedAt: "2025-01-15",
      jobId: "JOB-001",
      clientName: "María González",
      status: "approved"
    },
    {
      id: "2",
      title: "Mantenimiento Equipos",
      description: "Documento técnico del mantenimiento realizado",
      type: "document",
      fileName: "mantenimiento_equipos.pdf",
      fileSize: "1.8 MB",
      uploadedAt: "2025-01-14",
      jobId: "JOB-002",
      clientName: "Carlos Rodríguez",
      status: "pending"
    },
    {
      id: "3",
      title: "Reparación Tuberías",
      description: "Video de la reparación de tuberías principales",
      type: "video",
      fileName: "reparacion_tuberias.mp4",
      fileSize: "15.2 MB",
      uploadedAt: "2025-01-13",
      jobId: "JOB-003",
      clientName: "Ana Martínez",
      status: "approved"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                         evidence.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || evidence.type === typeFilter;
    const matchesStatus = statusFilter === "all" || evidence.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
              Administra y revisa todas las evidencias de trabajos realizados
            </p>
          </div>
          <div className="header-actions">
            <Button className="btn-primary">
              <ImageIcon className="mr-2 h-4 w-4" />
              Subir Evidencia
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="unified-card">
          <div className="unified-card-header">
            <h3 className="text-lg font-semibold text-slate-900">Filtros y Búsqueda</h3>
          </div>
          <div className="unified-card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Buscar</label>
                <div className="search-container">
                  <Search className="search-icon" />
                  <Input
                    type="text"
                    placeholder="Buscar evidencia o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="image">Imágenes</option>
                  <option value="document">Documentos</option>
                  <option value="video">Videos</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Acciones</label>
                <Button
                  variant="outline"
                  className="btn-outline w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Evidencias */}
        <div className="grid gap-6">
          {filteredEvidence.length === 0 ? (
            <div className="unified-card">
              <div className="unified-card-content text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron evidencias</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all" ?
                    "No se encontraron evidencias para los filtros seleccionados." :
                    "Aún no hay evidencias registradas en el sistema."
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredEvidence.map((evidence) => (
              <div key={evidence.id} className="unified-card hover:shadow-lg transition-shadow">
                <div className="unified-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(evidence.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{evidence.title}</h3>
                        </div>
                        <Badge className={getStatusColor(evidence.status)}>
                          {getStatusLabel(evidence.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{evidence.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{evidence.fileName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Tamaño:</span>
                          <span>{evidence.fileSize}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(evidence.uploadedAt).toLocaleDateString("es-CL")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Cliente:</span>
                          <span>{evidence.clientName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline text-red-600 hover:text-red-700"
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
      </div>
    </div>
  );
}
