"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Building,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClientForm from "@/components/forms/client-form";
import { ClientData } from "@/components/forms/client-form";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  status: string;
  company?: string;
  rut?: string;
  contactPerson?: string;
  totalServices: number;
  totalSpent: number;
  lastService: string;
  createdAt: string;
  updatedAt: string;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "+56 9 1234 5678",
    address: "Av. Libertad 123, Santiago",
    type: "residential",
    status: "active",
    company: "",
    rut: "12.345.678-9",
    contactPerson: "",
    totalServices: 5,
    totalSpent: 120000,
    lastService: "2025-07-01T12:00:00Z",
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2025-07-01T12:00:00Z",
  },
  {
    id: "2",
    name: "Empresa XYZ",
    email: "contacto@empresa.xyz",
    phone: "+56 2 9876 5432",
    address: "Calle Falsa 456, Valparaíso",
    type: "commercial",
    status: "active",
    company: "Empresa XYZ Ltda",
    rut: "76.543.210-1",
    contactPerson: "María González",
    totalServices: 12,
    totalSpent: 560000,
    lastService: "2025-07-03T14:30:00Z",
    createdAt: "2022-05-05T09:00:00Z",
    updatedAt: "2025-07-03T14:30:00Z",
  },
  {
    id: "3",
    name: "Ana Torres",
    email: "ana.torres@example.com",
    phone: "+56 9 8765 4321",
    address: "Pasaje 7 #123, Concepción",
    type: "residential",
    status: "pending",
    company: "",
    rut: "23.456.789-0",
    contactPerson: "",
    totalServices: 2,
    totalSpent: 45000,
    lastService: "2025-06-28T08:00:00Z",
    createdAt: "2024-11-15T15:00:00Z",
    updatedAt: "2025-06-28T08:00:00Z",
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
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
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "residential":
        return "Residencial";
      case "commercial":
        return "Comercial";
      default:
        return type;
    }
  };

  const handleDelete = (clientId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;
    const matchesType = typeFilter === "all" || client.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeClients = clients.filter((c) => c.status === "active");
  const commercialClients = clients.filter((c) => c.type === "commercial");
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">
            Administra tus clientes y su información
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6 text-center">
          <p className="text-2xl font-bold text-purple-600">{clients.length}</p>
          <p className="text-sm text-gray-600">Total Clientes</p>
        </CardContent></Card>

        <Card><CardContent className="p-6 text-center">
          <p className="text-2xl font-bold text-green-600">{activeClients.length}</p>
          <p className="text-sm text-gray-600">Activos</p>
        </CardContent></Card>

        <Card><CardContent className="p-6 text-center">
          <p className="text-2xl font-bold text-blue-600">{commercialClients.length}</p>
          <p className="text-sm text-gray-600">Comerciales</p>
        </CardContent></Card>

        <Card><CardContent className="p-6 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            ${totalRevenue.toLocaleString("es-CL")}
          </p>
          <p className="text-sm text-gray-600">Facturación Total</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="residential">Residencial</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex justify-between items-start pb-0">
              <CardTitle className="text-lg">{client.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedClient(client);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(client.id)}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(client.status)}>
                  {getStatusLabel(client.status)}
                </Badge>
                <Badge className={getTypeColor(client.type)}>
                  {getTypeLabel(client.type)}
                </Badge>
              </div>
              <p className="flex items-center text-sm text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-gray-400" /> {client.email}
              </p>
              <p className="flex items-center text-sm text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-gray-400" /> {client.phone}
              </p>
              <p className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" /> {client.address}
              </p>
              {client.company && (
                <p className="flex items-center text-sm text-gray-700">
                  <Building className="h-4 w-4 mr-2 text-gray-400" /> {client.company}
                </p>
              )}
              {client.contactPerson && (
                <p className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 mr-2 text-gray-400" /> {client.contactPerson}
                </p>
              )}
              <p className="flex items-center text-sm text-gray-700">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" /> Último servicio:{" "}
                {new Date(client.lastService).toLocaleDateString("es-CL")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <ClientForm
          client={selectedClient || undefined}
          onCancel={() => {
            setShowForm(false);
            setSelectedClient(null);
          }}
          onSubmit={(data: ClientData) => {
            if (selectedClient) {
              setClients((prev) =>
                prev.map((c) =>
                  c.id === selectedClient.id ? { ...c, ...data } : c
                )
              );
            } else {
              const newClient: Client = {
                id: crypto.randomUUID(),
                status: "active",
                totalServices: 0,
                totalSpent: 0,
                lastService: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data,
                email: data.email ?? "",
              };
              setClients((prev) => [...prev, newClient]);
            }
            setShowForm(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
