"use client";

import ClientForm, { ClientData } from "@/components/forms/client-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
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
  CheckCircle,
  Download,
  // Calendar,
  Edit,
  Filter,
  Mail,
  MapPin,
  // TrendingUp,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  commune: string;
  status: string;
  company?: string;
  rut?: string;
  createdAt: string;
  updatedAt: string;
}

const initialClients: Client[] = [];

// Componente de tarjeta de cliente con diseño profesional usando Tailwind
const ClientCard = React.memo(({
  client,
  onEdit,
  onDelete
}: {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{client.name}</h3>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(client.status)}`}>
                {getStatusLabel(client.status)}
              </Badge>
              {client.company && (
                <Badge className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200">
                  {client.company}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(client.id)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {client.rut && (
          <div className="flex items-center text-gray-600">
            <span className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0 text-xs font-bold">RUT</span>
            <span className="text-sm font-medium">{client.rut}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-medium">{client.phone}</span>
        </div>
        {client.email && (
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{client.email}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-medium">{client.address}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Building className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-medium">{client.commune} - {client.region}</span>
        </div>
      </div>

    </div>
  );
});

ClientCard.displayName = 'ClientCard';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  // Estados para confirmación de eliminación
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Referencias para optimización
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Función para cargar clientes desde la API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch('/api/clients');

      if (!response.ok) {
        throw new Error(`Error al cargar los clientes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Eliminar duplicados por nombre (mantener el más reciente)
      const uniqueClients = data.reduce((acc: Client[], current: Client) => {
        const existingIndex = acc.findIndex(client =>
          client.name.toLowerCase().trim() === current.name.toLowerCase().trim()
        );

        if (existingIndex === -1) {
          // No existe, agregar
          acc.push(current);
        } else {
          // Existe, mantener el más reciente (comparar por fecha de creación)
          const existing = acc[existingIndex];
          const currentDate = new Date(current.createdAt);
          const existingDate = new Date(existing?.createdAt || '');

          if (currentDate > existingDate) {
            acc[existingIndex] = current;
          }
        }

        return acc;
      }, []);

      setClients(uniqueClients);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  // Función optimizada para filtrar clientes
  const filterClients = useCallback(() => {
    const filtered = clients.filter((client) => {
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.toLowerCase().includes(searchLower) ||
          client.address.toLowerCase().includes(searchLower) ||
          (client.company || "").toLowerCase().includes(searchLower)
        );
      }

      // Filtrar por estado
      if (statusFilter !== "all" && client.status !== statusFilter) return false;

      // Filtrar por región
      if (regionFilter !== "all" && client.region !== regionFilter) return false;

      // Filtrar por empresa
      if (companyFilter !== "all") {
        if (companyFilter === "none" && client.company) return false;
        if (companyFilter !== "none" && client.company !== companyFilter) return false;
      }

      return true;
    });

    // Ordenar por nombre
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, regionFilter, companyFilter]);

  // Optimización: Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      filterClients();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [clients, searchTerm, statusFilter, regionFilter, filterClients]);

  useEffect(() => {
    fetchClients();
  }, []);

  // Estadísticas optimizadas con useMemo
  const _stats = useMemo(() => {
    // Intentionally unused - reserved for future statistics display
    const total = clients.length;
    const active = clients.filter(c => c.status === "active").length;
    const inactive = clients.filter(c => c.status === "inactive").length;
    const pending = clients.filter(c => c.status === "pending").length;
    return { total, active, inactive, pending };
  }, [clients]);
  // _stats is intentionally unused - reserved for future statistics display
  void _stats

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRegionFilter("all");
    setCompanyFilter("all");
  };

  // Función para exportar datos
  const handleExport = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Dirección', 'Región', 'Comuna', 'Estado', 'Empresa', 'RUT', 'Contacto'];
    const rows = filteredClients.map(client => [
      client.name,
      client.email,
      client.phone,
      client.address,
      client.region,
      client.commune,
      getStatusLabel(client.status),
      client.company || '',
      client.rut || '',
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
    link.setAttribute('download', `Reporte_Clientes_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para obtener etiqueta de estado
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "pending": return "Pendiente";
      default: return status;
    }
  };

  // Función para abrir formulario de nuevo cliente
  const handleNewClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  // Función para editar cliente
  const handleEditClient = async (client: Client) => {
    try {
      setLoading(true);
      // Obtener los datos completos del cliente desde la API individual
      const response = await fetch(`/api/clients/${client.id}`);

      if (!response.ok) {
        throw new Error('Error al cargar los datos del cliente');
      }

      const clientData = await response.json();
      setEditingClient(clientData);
      setShowClientForm(true);
    } catch (error) {
      setError('Error al cargar los datos del cliente');
      // Fallback: usar los datos de la lista
      setEditingClient(client);
      setShowClientForm(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar cliente
  const handleSaveClient = async (clientData: ClientData) => {
    setIsSaving(true);
    setError("");

    try {
      if (editingClient) {
        // Actualizar cliente existente
        const response = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar el cliente');
        }
      } else {
        // Crear nuevo cliente
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear el cliente');
        }
      }

      // Resetear estados y recargar datos
      setShowClientForm(false);
      setEditingClient(null);
      setSuccessMessage(editingClient ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente");
      await fetchClients();
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al guardar el cliente");
    } finally {
      setIsSaving(false);
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = (clientId: string) => {
    setDeletingClientId(clientId);
    setShowDeleteConfirm(true);
  };

  // Función para cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingClientId(null);
  };

  // Función para eliminar cliente
  const deleteClient = async () => {
    if (!deletingClientId) {
      return;
    }
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/clients/${deletingClientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el cliente');
      }
      // Cerrar diálogo y recargar datos
      cancelDelete();
      setSuccessMessage("Cliente eliminado exitosamente");
      await fetchClients();

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al eliminar el cliente");
    } finally {
      setIsDeleting(false);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="w-full">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 font-medium">Cargando clientes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="w-full space-y-8">
        {/* Header Unificado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                Gestión de <span className="text-blue-600">Clientes</span>
              </h1>
              <p className="text-lg text-gray-600 font-medium">Administra y mantén actualizada la información de tus clientes</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleNewClient} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Cliente
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Alerta de error */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de éxito */}
        {successMessage && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800">Éxito</h3>
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controles de filtro */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                <Filter className="h-5 w-5 text-blue-600 inline mr-2" />
                Filtros y Búsqueda
              </h3>
              <p className="text-gray-600 text-sm">Personaliza la vista de clientes según tus necesidades</p>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar clientes por nombre, email, teléfono o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder="Todas las regiones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las regiones</SelectItem>
                <SelectItem value="Metropolitana">Metropolitana</SelectItem>
                <SelectItem value="Valparaíso">Valparaíso</SelectItem>
                <SelectItem value="Biobío">Biobío</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                <SelectItem value="none">Sin empresa</SelectItem>
                <SelectItem value="Améstica Ltda">Améstica Ltda</SelectItem>
                <SelectItem value="Multifugas">Multifugas</SelectItem>
                <SelectItem value="Servifugas">Servifugas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="space-y-6">
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || regionFilter !== "all" || companyFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando tu primer cliente"}
              </p>
              <Button onClick={handleNewClient} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cliente
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleEditClient}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal para el formulario de cliente */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setShowClientForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <ClientForm
                  client={editingClient as any}
                  onSubmit={handleSaveClient}
                  onCancel={() => setShowClientForm(false)}
                  loading={isSaving}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Confirmar Eliminación</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  ¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={cancelDelete} className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                  Cancelar
                </Button>
                <Button
                  onClick={deleteClient}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
