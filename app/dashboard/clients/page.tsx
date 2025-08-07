"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, MapPin, Calendar, Edit, Trash2, Building, Users } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ClientForm from "@/components/forms/client-form"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  type: string
  status: string
  company?: string
  rut?: string
  contactPerson?: string
  totalServices: number
  totalSpent: number
  lastService: string
  createdAt: string
  updatedAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const response = await fetch(`/api/clients?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      } else {
        console.error('Error fetching clients')
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [searchTerm, statusFilter, typeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800"
      case "commercial":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Activo"
      case "inactive": return "Inactivo"
      case "pending": return "Pendiente"
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "residential": return "Residencial"
      case "commercial": return "Comercial"
      default: return type
    }
  }

  const handleDelete = async (clientId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchClients()
        } else {
          const error = await response.json()
          alert(error.error || "Error al eliminar cliente")
        }
      } catch (error) {
        console.error("Error deleting client:", error)
        alert("Error de conexión")
      }
    }
  }

  const activeClients = clients.filter(c => c.status === "active")
  const commercialClients = clients.filter(c => c.type === "commercial")
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra tu base de clientes y su información</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              <p className="text-sm text-gray-600">Total Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeClients.length}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{commercialClients.length}</p>
              <p className="text-sm text-gray-600">Comerciales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ${totalRevenue.toLocaleString("es-CL")}
              </p>
              <p className="text-sm text-gray-600">Facturación Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900">{client.name}</CardTitle>
                  {client.company && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Building className="mr-1 h-3 w-3" />
                      {client.company}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(client.status)}>
                    {getStatusLabel(client.status)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedClient(client)
                        setShowForm(true)
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2 h-4 w-4" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {client.email}
                  </div>
                )}
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                  <span className="flex-1">{client.address}</span>
                </div>
                {client.contactPerson && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {client.contactPerson}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{client.totalServices}</p>
                    <p className="text-xs text-gray-600">Servicios</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      ${client.totalSpent.toLocaleString("es-CL")}
                    </p>
                    <p className="text-xs text-gray-600">Facturado</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge className={getTypeColor(client.type)} variant="outline">
                  {getTypeLabel(client.type)}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(client.lastService).toLocaleDateString("es-CL")}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button size="sm" variant="outline" className="flex-1 bg-white">
                  Ver Historial
                </Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Nuevo Servicio
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No se encontraron clientes con los filtros aplicados.'
                : 'Comienza agregando tu primer cliente.'}
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Form Modal */}
     {/*  {showForm && (
        <ClientForm
          client={selectedClient}
          onClose={() => {
            setShowForm(false)
            setSelectedClient(null)
          }}
          onSave={() => {
            fetchClients()
            setShowForm(false)
            setSelectedClient(null)
          }}
        />
      )} */}
    </div>
  )
}
