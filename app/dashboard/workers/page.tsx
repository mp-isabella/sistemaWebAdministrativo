'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  User,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Users,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Building,
  Calendar,
  Star,
  Download,
  Filter,
  X
} from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  location: string;
  specializations?: string[];
  experience?: number;
  rating?: number;
  totalJobs?: number;
  completedJobs?: number;
  createdAt?: string;
}

// Mock data - replace with actual API call
const mockWorkers: Worker[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    phone: '+56 9 1234 5678',
    role: 'Técnico',
    status: 'active',
    location: 'Santiago',
    specializations: ['Plomería', 'Electricidad'],
    experience: 5,
    rating: 4.8,
    totalJobs: 150,
    completedJobs: 145,
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@empresa.com',
    phone: '+56 9 8765 4321',
    role: 'Técnico',
    status: 'active',
    location: 'Providencia',
    specializations: ['Climatización', 'Mantenimiento'],
    experience: 3,
    rating: 4.9,
    totalJobs: 120,
    completedJobs: 118,
    createdAt: '2023-03-20'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@empresa.com',
    phone: '+56 9 5555 1234',
    role: 'Técnico',
    status: 'inactive',
    location: 'Las Condes',
    specializations: ['Gasfitería'],
    experience: 7,
    rating: 4.6,
    totalJobs: 200,
    completedJobs: 195,
    createdAt: '2022-08-10'
  }
];

// Componente de tarjeta de trabajador unificado con el nuevo sistema de diseño
const WorkerCard = React.memo(({ 
  worker, 
  onEdit, 
  onDelete 
}: { 
  worker: Worker; 
  onEdit: (worker: Worker) => void; 
  onDelete: (id: string) => void; 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "badge badge-success";
      case "inactive":
        return "badge badge-error";
      default:
        return "badge badge-info";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      default:
        return status;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "técnico":
        return "badge badge-primary";
      case "secretaria":
        return "badge badge-warning";
      case "administrador":
        return "badge badge-info";
      default:
        return "badge badge-secondary";
    }
  };

  return (
    <div className="content-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] will-change-transform">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {worker.name}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <Badge className={getStatusColor(worker.status)}>
                  {getStatusLabel(worker.status)}
                </Badge>
                <Badge className={getRoleColor(worker.role)}>
                  {worker.role}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="truncate">{worker.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="truncate">{worker.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="truncate">{worker.location}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-500" />
                <span className="truncate">{worker.experience} años exp.</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="truncate">{worker.rating}/5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span className="truncate">{worker.totalJobs} trabajos</span>
              </div>
            </div>
            
            {worker.specializations && worker.specializations.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Especializaciones:</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  {worker.specializations.map((spec, index) => (
                    <Badge key={index} className="badge badge-info">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {worker.completedJobs} completados
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Desde {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString('es-CL') : 'N/A'}
                </span>
              </div>
              <span className="text-gray-400">ID: {worker.id.slice(-8)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(worker)}
              className="btn btn-secondary btn-sm"
              title="Editar trabajador"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(worker.id)}
              className="btn btn-danger btn-sm"
              title="Eliminar trabajador"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

WorkerCard.displayName = 'WorkerCard';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(mockWorkers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Estados para confirmación de eliminación
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Función para cargar trabajadores desde la API
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Aquí iría la llamada real a la API
      // const response = await fetch('/api/workers');
      // const data = await response.json();
      // setWorkers(data);
      
      // Por ahora usamos mock data
      setWorkers(mockWorkers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError("Error al cargar los trabajadores");
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar trabajadores
  const filterWorkers = () => {
    let filtered = workers.filter((worker) => {
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          worker.name.toLowerCase().includes(searchLower) ||
          worker.email.toLowerCase().includes(searchLower) ||
          worker.phone.toLowerCase().includes(searchLower) ||
          worker.location.toLowerCase().includes(searchLower) ||
          (worker.specializations || []).some(spec => 
            spec.toLowerCase().includes(searchLower)
          )
        );
      }
      
      // Filtrar por estado
      if (statusFilter !== "all" && worker.status !== statusFilter) return false;
      
      // Filtrar por rol
      if (roleFilter !== "all" && worker.role !== roleFilter) return false;
      
      // Filtrar por ubicación
      if (locationFilter !== "all" && worker.location !== locationFilter) return false;
      
      return true;
    });

    // Ordenar por nombre
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredWorkers(filtered);
  };

  useEffect(() => {
    filterWorkers();
  }, [workers, searchTerm, statusFilter, roleFilter, locationFilter]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Estadísticas optimizadas
  const stats = {
    total: workers.length,
    active: workers.filter(w => w.status === "active").length,
    inactive: workers.filter(w => w.status === "inactive").length,
    technicians: workers.filter(w => w.role.toLowerCase() === "técnico").length,
    totalExperience: workers.reduce((sum, w) => sum + (w.experience || 0), 0),
    avgRating: workers.reduce((sum, w) => sum + (w.rating || 0), 0) / workers.length || 0
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setLocationFilter("all");
  };

  // Función para exportar datos
  const handleExport = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Ubicación', 'Especializaciones', 'Experiencia', 'Rating', 'Total Trabajos', 'Trabajos Completados', 'Fecha de Ingreso'];
    const rows = filteredWorkers.map(worker => [
      worker.name,
      worker.email,
      worker.phone,
      worker.role,
      worker.status === 'active' ? 'Activo' : 'Inactivo',
      worker.location,
      (worker.specializations || []).join(', '),
      worker.experience || 0,
      worker.rating || 0,
      worker.totalJobs || 0,
      worker.completedJobs || 0,
      worker.createdAt ? new Date(worker.createdAt).toLocaleDateString('es-CL') : 'N/A'
    ]);

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Trabajadores_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para abrir formulario de nuevo trabajador
  const handleNewWorker = () => {
    setEditingWorker(null);
    setShowWorkerForm(true);
  };

  // Función para editar trabajador
  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setShowWorkerForm(true);
  };

  // Función para guardar trabajador
  const handleSaveWorker = async (workerData: any) => {
    try {
      if (editingWorker) {
        // Actualizar trabajador existente
        const updatedWorkers = workers.map(w => 
          w.id === editingWorker.id ? { ...w, ...workerData } : w
        );
        setWorkers(updatedWorkers);
      } else {
        // Crear nuevo trabajador
        const newWorker: Worker = {
          id: Date.now().toString(),
          ...workerData,
          createdAt: new Date().toISOString()
        };
        setWorkers([...workers, newWorker]);
      }
      
      // Resetear estados
      setShowWorkerForm(false);
      setEditingWorker(null);
      
    } catch (error) {
      console.error('Error saving worker:', error);
      setError("Error al guardar el trabajador");
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = (workerId: string) => {
    setDeletingWorkerId(workerId);
    setShowDeleteConfirm(true);
  };

  // Función para cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingWorkerId(null);
  };

  // Función para eliminar trabajador
  const deleteWorker = async () => {
    if (!deletingWorkerId) return;

    try {
      // Aquí iría la llamada real a la API
      // await fetch(`/api/workers/${deletingWorkerId}`, { method: 'DELETE' });
      
      // Por ahora actualizamos el estado local
      const updatedWorkers = workers.filter(w => w.id !== deletingWorkerId);
      setWorkers(updatedWorkers);
      
      // Cerrar diálogo
      cancelDelete();
      
    } catch (error) {
      console.error('Error deleting worker:', error);
      setError("Error al eliminar el trabajador");
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="max-w-7xl mx-auto">
          <div className="empty-state">
            <div className="loading-spinner mx-auto"></div>
            <p className="empty-description">Cargando trabajadores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Unificado */}
        <div className="content-card mb-6">
          <div className="card-header">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="card-title text-3xl">
                  Gestión de <span className="text-blue-600">Trabajadores</span>
                </h1>
                <p className="card-subtitle">Administra tu equipo de trabajo y mantén actualizada la información</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleNewWorker} className="btn btn-primary btn-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Trabajador
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  className="btn btn-secondary btn-lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de error */}
        {error && (
          <div className="content-card border-red-200 bg-red-50">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Total Trabajadores</p>
                <p className="stat-value">{stats.total}</p>
                <p className="stat-subtitle">En el sistema</p>
              </div>
              <div className="stat-icon blue">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Activos</p>
                <p className="stat-value">{stats.active}</p>
                <p className="stat-subtitle">Actualmente activos</p>
              </div>
              <div className="stat-icon green">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Técnicos</p>
                <p className="stat-value">{stats.technicians}</p>
                <p className="stat-subtitle">Especialistas técnicos</p>
              </div>
              <div className="stat-icon orange">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros y Búsqueda
            </h3>
            <p className="card-subtitle">Personaliza la vista de trabajadores según tus necesidades</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar trabajador, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todos los roles</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Secretaria">Secretaria</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ubicación</label>
                <select 
                  value={locationFilter} 
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todas las ubicaciones</option>
                  <option value="Santiago">Santiago</option>
                  <option value="Providencia">Providencia</option>
                  <option value="Las Condes">Las Condes</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                <Filter className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de trabajadores */}
        <div className="space-y-4">
          {filteredWorkers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Users className="h-16 w-16" />
              </div>
              <h3 className="empty-title">No hay trabajadores</h3>
              <p className="empty-description">
                {searchTerm || statusFilter !== "all" || roleFilter !== "all" || locationFilter !== "all"
                  ? "No se encontraron trabajadores para los filtros seleccionados. Intenta ajustar los criterios de búsqueda."
                  : "Comienza agregando tu primer trabajador para organizar tu equipo."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleNewWorker} className="btn btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Trabajador
                </Button>
                {(searchTerm || statusFilter !== "all" || roleFilter !== "all" || locationFilter !== "all") && (
                  <Button variant="outline" onClick={clearFilters} className="btn btn-secondary">
                    <Filter className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onEdit={handleEditWorker}
                onDelete={confirmDelete}
              />
            ))
          )}
        </div>

        {/* Modal para el formulario de trabajador */}
        {showWorkerForm && (
          <div className="modal-overlay">
            <div className="modal w-full max-w-4xl">
              <div className="modal-header">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="modal-title">
                    {editingWorker ? 'Editar Trabajador' : 'Nuevo Trabajador'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowWorkerForm(false)}
                  className="modal-close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="modal-body">
                <p className="text-sm text-gray-600 mb-4">
                  {editingWorker ? 'Modifica los detalles del trabajador.' : 'Completa el formulario para agregar un nuevo trabajador.'}
                </p>
                {/* Aquí iría el formulario de trabajador */}
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <Input
                      type="text"
                      placeholder="Nombre completo"
                      className="form-input"
                      defaultValue={editingWorker?.name || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      className="form-input"
                      defaultValue={editingWorker?.email || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <Input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      className="form-input"
                      defaultValue={editingWorker?.phone || ''}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Rol</label>
                      <select className="form-input" defaultValue={editingWorker?.role || 'Técnico'}>
                        <option value="Técnico">Técnico</option>
                        <option value="Secretaria">Secretaria</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estado</label>
                      <select className="form-input" defaultValue={editingWorker?.status || 'active'}>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="outline" onClick={() => setShowWorkerForm(false)} className="btn btn-secondary">
                  Cancelar
                </Button>
                <Button onClick={() => handleSaveWorker({})} className="btn btn-primary">
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal max-w-md">
              <div className="modal-header">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h2 className="modal-title">Confirmar Eliminación</h2>
                </div>
                <button
                  onClick={cancelDelete}
                  className="modal-close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="modal-body">
                <p className="text-gray-600">
                  ¿Estás seguro de que quieres eliminar este trabajador? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="modal-footer">
                <Button variant="outline" onClick={cancelDelete} className="btn btn-secondary">
                  Cancelar
                </Button>
                <Button onClick={deleteWorker} className="btn btn-danger">
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
