"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, User, Calendar, Edit, Trash2, Users } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import WorkerForm from "@/components/forms/worker-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Worker = {
  id: string
  name: string
  email: string
  role: string
  status: string
  phone?: string
  createdAt: string
  _count?: {
    assignedJobs?: number
  }
}


export default function WorkersPage() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: { admin: 0, secretaria: 0, operador: 0 }
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  
  useEffect(() => {
    fetchWorkers()
  }, [searchTerm, roleFilter, statusFilter])

  const fetchWorkers = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (roleFilter !== "all") params.append("role", roleFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/workers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setWorkers(data.workers || [])
        setStats(data.stats || { total: 0, active: 0, inactive: 0, byRole: { admin: 0, secretaria: 0, operador: 0 } })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error al cargar trabajadores")
      }
    } catch (error) {
      console.error("Error fetching workers:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setFormLoading(true)
    try {
      const url = selectedWorker ? `/api/workers/${selectedWorker.id}` : '/api/workers' // ✅ sin errores

      const method = selectedWorker ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchWorkers()
        setShowForm(false)
        setSelectedWorker(null)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al guardar trabajador")
      }
    } catch (error) {
      console.error("Error saving worker:", error)
      alert("Error de conexión")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (worker: any) => {
    setSelectedWorker(worker)
    setShowForm(true)
  }

  const handleDelete = async (workerId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este trabajador?")) {
      return
    }

    try {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        await fetchWorkers()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al eliminar trabajador")
      }
    } catch (error) {
      console.error("Error deleting worker:", error)
      alert("Error de conexión")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "secretaria":
        return "bg-blue-100 text-blue-800"
      case "operador":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "secretaria":
        return "Secretaria"
      case "operador":
        return "Técnico"
      default:
        return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "inactive":
        return "Inactivo"
      default:
        return status
    }
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => {
            setShowForm(false)
            setSelectedWorker(null)
          }}>
            ← Volver
          </Button>
          <h1 className="text-2xl font-bold">
            {selectedWorker ? "Editar Trabajador" : "Nuevo Trabajador"}
          </h1>
        </div>
        
        <WorkerForm
          worker={selectedWorker}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setSelectedWorker(null)
          }}
          loading={formLoading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Trabajadores</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Trabajador
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Trabajadores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.byRole.operador}</p>
              <p className="text-sm text-gray-600">Técnicos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.byRole.admin + stats.byRole.secretaria}</p>
              <p className="text-sm text-gray-600">Administrativos</p>
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="secretaria">Secretaria</SelectItem>
                <SelectItem value="operador">Técnico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando trabajadores...</p>
          </div>
        </div>
      ) : workers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron trabajadores</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando tu primer trabajador al sistema"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Trabajador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {workers.map((worker: any) => (
            <Card key={worker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900">{worker.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{worker.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(worker.role)}>{getRoleLabel(worker.role)}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(worker)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(worker.id)}>
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
                  {worker.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {worker.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {worker.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Desde: {new Date(worker.createdAt).toLocaleDateString("es-CL")}
                  </div>
                </div>

                {worker.role === "operador" && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{worker._count?.assignedJobs || 0}</p>
                        <p className="text-xs text-gray-600">Trabajos</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-600">⭐ 4.5</p>
                        <p className="text-xs text-gray-600">Rating</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(worker.status)} variant="outline">
                      {getStatusLabel(worker.status)}
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button size="sm" variant="outline" className="flex-1 bg-white" onClick={() => handleEdit(worker)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <User className="mr-2 h-4 w-4" />
                    Ver Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
