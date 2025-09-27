'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import WorkerForm from '@/components/forms/worker-form';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Building,
  // MapPin,
  Calendar,
  Download,
  Edit,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCog,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  company?: string;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

const initialWorkers: Worker[] = [
  {
    id: "1",
    name: 'Juan Pérez',
    email: 'juan.perez@amestica.com',
    phone: '+56 9 1234 5678',
    role: 'Técnico',
    status: 'activo',
    company: 'Améstica Ltda',
    joinDate: '2023-01-15',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: "2",
    name: 'María González',
    email: 'maria.gonzalez@amestica.com',
    phone: '+56 9 2345 6789',
    role: 'Secretaria',
    status: 'activo',
    company: 'Améstica Ltda',
    joinDate: '2023-03-20',
    createdAt: '2023-03-20',
    updatedAt: '2024-01-14',
  },
  {
    id: "3",
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@amestica.com',
    phone: '+56 9 3456 7890',
    role: 'Administrador',
    status: 'activo',
    company: 'Améstica Ltda',
    joinDate: '2022-11-10',
    createdAt: '2022-11-10',
    updatedAt: '2024-01-20',
  },
];

// Componente de tarjeta de trabajador con diseño profesional usando Tailwind
const WorkerCard = ({
  worker,
  onEdit,
  onDelete
}: {
  worker: Worker;
  onEdit: (worker: Worker) => void;
  onDelete: (id: string) => void;
}) => {
  const getStatusColor = (status: string | boolean | undefined) => {
    const statusValue = typeof status === 'boolean' ? (status ? 'activo' : 'inactivo') : status;
    switch (statusValue) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspendido': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Técnico': return 'bg-green-100 text-green-800 border-green-200';
      case 'Secretaria': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Administrador': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserCog className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{worker.name}</h3>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(worker.isActive || worker.status)}`}>
                {typeof worker.isActive === 'boolean' ? (worker.isActive ? 'Activo' : 'Inactivo') : (worker.status || 'Activo')}
              </Badge>
              <Badge className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(worker.role)}`}>
                {worker.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Botones de acción - Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(worker)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(worker.id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>

        {/* Menú de tres puntos - Solo móvil */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex items-center justify-center">
                <MoreVertical className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={() => onEdit(worker)} className="hover:bg-gray-50 flex items-center">
                <Edit className="h-4 w-4 mr-2 flex-shrink-0" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(worker.id)} className="text-red-600 hover:bg-red-50 flex items-center">
                <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0 flex items-center justify-center" />
          <span className="text-sm font-medium truncate">{worker.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0 flex items-center justify-center" />
          <span className="text-sm font-medium">{worker.phone}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Building className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0 flex items-center justify-center" />
          <span className="text-sm font-medium">{worker.company || 'Améstica Ltda'}</span>
        </div>
        {worker.joinDate && (
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0 flex items-center justify-center" />
            <span className="text-sm font-medium">
              Ingreso: {new Date(worker.joinDate).toLocaleDateString('es-CL')}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(initialWorkers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Estados para confirmación de eliminación
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Referencias para optimización
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Función para cargar trabajadores desde la API
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch('/api/workers/technicians');

      if (!response.ok) {
        throw new Error(`Error al cargar los trabajadores: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transformar los datos para que sean compatibles con la interfaz Worker
      const transformedWorkers = data.map((worker: any) => ({
        id: worker.id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        role: worker.role?.name || 'Técnico',
        status: worker.isActive ? 'activo' : 'inactivo',
        company: 'Améstica Ltda', // Valor por defecto
        joinDate: worker.createdAt,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt,
        isActive: worker.isActive
      }));

      setWorkers(transformedWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setError(error instanceof Error ? error.message : "Error al cargar los trabajadores");
    } finally {
      setLoading(false);
    }
  };

  // Función optimizada para filtrar trabajadores
  const filterWorkers = useCallback(() => {
    let filtered = workers;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(term) ||
        worker.email.toLowerCase().includes(term) ||
        worker.phone.includes(term) ||
        (worker.company || '').toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(worker => {
        if (typeof worker.isActive === 'boolean') {
          return statusFilter === 'activo' ? worker.isActive : !worker.isActive;
        }
        return worker.status === statusFilter;
      });
    }

    // Filtro por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter(worker => worker.role === roleFilter);
    }

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, statusFilter, roleFilter]);

  // Efecto para aplicar filtros
  useEffect(() => {
    filterWorkers();
  }, [filterWorkers]);

  // Función optimizada para búsqueda con debounce
  const handleSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
  }, []);

  // Función para manejar nuevo trabajador
  const handleNewWorker = useCallback(() => {
    setEditingWorker(null);
    setShowWorkerForm(true);
  }, []);

  // Función para manejar edición de trabajador
  const handleEditWorker = useCallback((worker: Worker) => {
    setEditingWorker(worker);
    setShowWorkerForm(true);
  }, []);

  // Función para manejar eliminación de trabajador
  const handleDeleteWorker = useCallback((id: string) => {
    setDeletingWorkerId(id);
    setShowDeleteConfirm(true);
  }, []);

  // Función para confirmar eliminación
  const confirmDelete = useCallback(async () => {
    if (!deletingWorkerId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/workers/technicians/${deletingWorkerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el trabajador');
      }

      setWorkers(prev => prev.filter(worker => worker.id !== deletingWorkerId));
      setShowDeleteConfirm(false);
      setDeletingWorkerId(null);
    } catch (error) {

      setError(error instanceof Error ? error.message : 'Error al eliminar el trabajador');
    } finally {
      setLoading(false);
    }
  }, [deletingWorkerId]);

  // Función para exportar datos
  const handleExport = useCallback(() => {
    // Implementar exportación a Excel

  }, []);

  // Función para manejar envío del formulario
  const handleFormSubmit = useCallback(async (formData: any) => {
    try {

      setLoading(true);
      setError("");

      const url = editingWorker
        ? `/api/workers/technicians/${editingWorker.id}`
        : '/api/workers/technicians';

      const method = editingWorker ? 'PUT' : 'POST';

      const requestBody = {
        ...formData,
        isActive: formData.status === 'active'
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error de la API:', errorData);
        throw new Error(errorData.error || 'Error al guardar el trabajador');
      }

      const result = await response.json();

      // Transformar el resultado para que sea compatible con la interfaz Worker
      const transformedResult = {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role?.name || result.role || 'Técnico',
        status: result.isActive ? 'activo' : 'inactivo',
        company: formData.company || 'Améstica Ltda', // Usar la empresa del formulario
        joinDate: result.createdAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        isActive: result.isActive
      };

      if (editingWorker) {
        // Actualizar trabajador existente
        setWorkers(prev => prev.map(worker =>
          worker.id === editingWorker.id
            ? { ...worker, ...transformedResult }
            : worker
        ));
      } else {
        // Agregar nuevo trabajador al principio de la lista
        setWorkers(prev => [transformedResult, ...prev]);
      }

      setShowWorkerForm(false);
      setEditingWorker(null);
    } catch (error) {

      setError(error instanceof Error ? error.message : 'Error al guardar el trabajador');
    } finally {
      setLoading(false);
    }
  }, [editingWorker]);

  // Función para cancelar formulario
  const handleFormCancel = useCallback(() => {
    setShowWorkerForm(false);
    setEditingWorker(null);
  }, []);

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Mostrar estado de carga
  if (loading && workers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando trabajadores...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requiredPermission="canAccessWorkers">
      <div className="workers-page min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-6">
        <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Unificado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                  Gestión de <span className="text-blue-600">Trabajadores</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Administra y mantén actualizada la información de tu personal técnico</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleNewWorker} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base flex items-center">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Nuevo Trabajador</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base flex items-center"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Exportar Excel</span>
                  <span className="sm:hidden">Exportar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Alerta de error */}
          {error && (
            <div className="bg-white rounded-2xl shadow-lg border border-red-200 bg-red-50 p-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError("")}
                  className="ml-auto text-red-500 hover:text-red-700 flex items-center justify-center"
                >
                  <X className="h-4 w-4 flex-shrink-0" />
                </Button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Input
                    placeholder="Buscar trabajadores por nombre, email, teléfono o empresa..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 sm:h-12 text-sm sm:text-base lg:text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Secretaria">Secretaria</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10 sm:h-12 px-4 sm:px-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm sm:text-base"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Trabajadores */}
          <div className="space-y-6">
            {filteredWorkers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <UserCog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron trabajadores</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza agregando tu primer trabajador"}
                </p>
                <Button onClick={handleNewWorker} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Trabajador
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onEdit={handleEditWorker}
                    onDelete={handleDeleteWorker}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación de eliminación mejorado */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-100">
              {/* Header con gradiente y icono mejorado */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-t-2xl border-b border-red-100">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Icono de advertencia mejorado */}
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmar Eliminación</h2>
                    <p className="text-gray-600 text-sm">
                      Esta acción es irreversible
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-6">
                <div className="text-center">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-gray-700 font-medium leading-relaxed">
                      ¿Estás seguro de que quieres eliminar este trabajador?
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Todos los datos asociados se perderán permanentemente y no podrán ser recuperados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción mejorados */}
              <div className="p-6 bg-gray-50 rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal del formulario de trabajador */}
        <ModalPortal isOpen={showWorkerForm}>
          <WorkerForm
            worker={editingWorker}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        </ModalPortal>
      </div>
    </RoleGuard>
  );
}