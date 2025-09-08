"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Building,
  Users,
  Filter,
  X,
  Wrench,
  Download,
  CheckCircle,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import ClientForm, { ClientData } from "@/components/forms/client-form";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  commune: string;
  type: string;
  status: string;
  company?: string;
  rut?: string;
  contactPerson?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  totalServices: number;
  totalSpent: number;
  lastService: string;
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] will-change-transform">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-gray-800 truncate">
              {client.name}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                {getStatusLabel(client.status)}
              </span>
              {client.type && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {client.type}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{client.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{client.phone}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{client.address}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Building className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{client.region} - {client.commune}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Wrench className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{client.totalServices} servicios</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">${client.totalSpent.toLocaleString()}</span>
            </div>
          </div>
          
          {client.company && (
            <div className="p-3 bg-orange-50 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Empresa: {client.company}</span>
              </div>
            </div>
          )}
          
          {client.rut && (
            <div className="p-3 bg-indigo-50 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">RUT: {client.rut}</span>
              </div>
            </div>
          )}
          
          {client.contactPerson && (
            <div className="p-3 bg-purple-50 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Contacto: {client.contactPerson}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Último servicio: {client.lastService ? new Date(client.lastService).toLocaleDateString('es-CL') : 'Nunca'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {client.assignedTechnicianName || "Sin técnico asignado"}
              </span>
            </div>
            <span className="text-gray-400">ID: {client.id.slice(-8)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(client)}
            className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            title="Editar cliente"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onDelete(client.id)}
            className="border-2 border-red-200 text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            title="Eliminar cliente"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  // Estados para confirmación de eliminación
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
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
      
      // Filtrar por tipo
      if (typeFilter !== "all" && client.type !== typeFilter) return false;
      
      // Filtrar por región
      if (regionFilter !== "all" && client.region !== regionFilter) return false;
      
      return true;
    });

    // Ordenar por nombre
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, typeFilter, regionFilter]);

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
  }, [clients, searchTerm, statusFilter, typeFilter, regionFilter, filterClients]);

  useEffect(() => {
    fetchClients();
  }, []);

  // Estadísticas optimizadas con useMemo
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === "active").length;
    const inactive = clients.filter(c => c.status === "inactive").length;
    const pending = clients.filter(c => c.status === "pending").length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgRevenue = total > 0 ? totalRevenue / total : 0;
    
    return { total, active, inactive, pending, totalRevenue, avgRevenue };
  }, [clients]);

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setRegionFilter("all");
  };

  // Función para exportar datos
  const handleExport = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Dirección', 'Región', 'Comuna', 'Tipo', 'Estado', 'Empresa', 'RUT', 'Contacto', 'Total Servicios', 'Total Gastado', 'Último Servicio'];
    const rows = filteredClients.map(client => [
      client.name,
      client.email,
      client.phone,
      client.address,
      client.region,
      client.commune,
      client.type,
      getStatusLabel(client.status),
      client.company || '',
      client.rut || '',
      client.contactPerson || '',
      client.totalServices,
      client.totalSpent,
      client.lastService ? new Date(client.lastService).toLocaleDateString('es-CL') : 'Nunca'
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
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  // Función para guardar cliente
  const handleSaveClient = async (clientData: ClientData) => {
    try {
      let savedClient;
      
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
          throw new Error('Error al actualizar el cliente');
        }
        
        savedClient = await response.json();
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
          throw new Error('Error al crear el cliente');
        }
        
        savedClient = await response.json();
      }
      
      // Resetear estados y recargar datos
      setShowClientForm(false);
      setEditingClient(null);
      await fetchClients();
      
    } catch (error) {
      console.error('Error saving client:', error);
      setError("Error al guardar el cliente");
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
    if (!deletingClientId) return;

    try {
      const response = await fetch(`/api/clients/${deletingClientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el cliente');
      }

      // Cerrar diálogo y recargar datos
      cancelDelete();
      await fetchClients();
      
    } catch (error) {
      console.error('Error deleting client:', error);
      setError("Error al eliminar el cliente");
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto space-y-8">
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

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-100 font-medium">Total Clientes</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.total}</div>
            <div className="text-blue-100 text-sm">En el sistema</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-emerald-100 font-medium">Clientes Activos</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.active}</div>
            <div className="text-emerald-100 text-sm">Actualmente activos</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-orange-100 font-medium">Ingresos Totales</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-orange-100 text-sm">Generados por clientes</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-100 font-medium">Promedio</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">${stats.avgRevenue.toLocaleString()}</div>
            <div className="text-purple-100 text-sm">Por cliente</div>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <Filter className="h-5 w-5 text-blue-600 inline mr-2" />
              Filtros y Búsqueda
            </h3>
            <p className="text-gray-600">Personaliza la vista de clientes según tus necesidades</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar cliente, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Filtrar por región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las regiones</SelectItem>
                  <SelectItem value="Metropolitana">Metropolitana</SelectItem>
                  <SelectItem value="Valparaíso">Valparaíso</SelectItem>
                  <SelectItem value="Biobío">Biobío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="space-y-6">
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="mb-6">
                <Users className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay clientes</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || regionFilter !== "all"
                  ? "No se encontraron clientes para los filtros seleccionados. Intenta ajustar los criterios de búsqueda."
                  : "Comienza agregando tu primer cliente para organizar tu base de datos."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleNewClient} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Cliente
                </Button>
                {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || regionFilter !== "all") && (
                  <Button variant="outline" onClick={clearFilters} className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                    <Filter className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleEditClient}
                onDelete={confirmDelete}
              />
            ))
          )}
        </div>

        {/* Modal para el formulario de cliente */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                  </div>
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
                  client={editingClient ? editingClient as ClientData : undefined}
                  onSubmit={handleSaveClient}
                  onCancel={() => setShowClientForm(false)}
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
                <Button onClick={deleteClient} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
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
