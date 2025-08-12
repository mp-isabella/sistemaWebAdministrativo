"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Phone, Mail, User, Calendar, Edit, Trash2, Users } from 'lucide-react'
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

// Datos de prueba para simular trabajadores
const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    role: "admin",
    status: "active",
    phone: "555-1234",
    createdAt: new Date("2023-01-10").toISOString(),
  },
  {
    id: "2",
    name: "María González",
    email: "maria.gonzalez@example.com",
    role: "secretaria",
    status: "active",
    phone: "555-5678",
    createdAt: new Date("2023-03-15").toISOString(),
  },
  {
    id: "3",
    name: "Pedro Martínez",
    email: "pedro.martinez@example.com",
    role: "operador",
    status: "inactive",
    phone: "555-8765",
    createdAt: new Date("2023-02-20").toISOString(),
    _count: { assignedJobs: 12 }
  },
  {
    id: "4",
    name: "Luisa Ramírez",
    email: "luisa.ramirez@example.com",
    role: "operador",
    status: "active",
    phone: "555-4321",
    createdAt: new Date("2023-04-05").toISOString(),
    _count: { assignedJobs: 8 }
  }
]

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

  // Función para filtrar y calcular stats localmente
  const filterAndStats = () => {
    setLoading(true)
    setError("")
    try {
      // Filtrar
      let filtered = mockWorkers.filter(worker => {
        const term = searchTerm.toLowerCase()
        const matchesSearch =
          worker.name.toLowerCase().includes(term) ||
          worker.email.toLowerCase().includes(term) ||
          (worker.phone?.toLowerCase().includes(term) ?? false)
        const matchesRole = roleFilter === "all" || worker.role === roleFilter
        const matchesStatus = statusFilter === "all" || worker.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
      })

      // Calcular stats
      const total = filtered.length
      const active = filtered.filter(w => w.status === "active").length
      const inactive = filtered.filter(w => w.status === "inactive").length
      const byRole = {
        admin: filtered.filter(w => w.role === "admin").length,
        secretaria: filtered.filter(w => w.role === "secretaria").length,
        operador: filtered.filter(w => w.role === "operador").length,
      }

      setWorkers(filtered)
      setStats({ total, active, inactive, byRole })
    } catch (error) {
      console.error(error)
      setError("Error al filtrar los trabajadores")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    filterAndStats()
  }, [searchTerm, roleFilter, statusFilter])

  // El resto del código (handleSubmit, handleEdit, handleDelete) lo dejamos igual para que funcione cuando integres con API

  const handleSubmit = async (formData: any) => {
    setFormLoading(true)
    try {
      // Aquí iría la llamada a la API real
      alert("Simulación: guardado de trabajador")
      setShowForm(false)
      setSelectedWorker(null)
    } catch (error) {
      console.error("Error saving worker:", error)
      alert("Error de conexión")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker)
    setShowForm(true)
  }

  const handleDelete = async (workerId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este trabajador?")) {
      return
    }
    alert("Simulación: eliminación de trabajador")
    // Solo para simulación, no se borra realmente
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

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-4">
        <Input
          type="search"
          placeholder="Buscar trabajador..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
          aria-label="Buscar trabajador"
          
        />
        <Select
          onValueChange={(value) => setRoleFilter(value)}
          defaultValue="all"
          value={roleFilter}
          aria-label="Filtrar por rol"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="secretaria">Secretaria</SelectItem>
            <SelectItem value="operador">Técnico</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setStatusFilter(value)}
          defaultValue="all"
          value={statusFilter}
          aria-label="Filtrar por estado"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de trabajadores */}
<div className="overflow-x-auto mt-6 shadow-sm border border-gray-300 rounded-md">
  <table className="w-full table-auto border-separate border-spacing-y-2 text-base text-gray-700">
    <thead>
      <tr className="bg-gray-30 border-b border-gray-200">
        <th className="py-3 px-4 font-semibold text-left">Nombre</th>
        <th className="py-3 px-4 font-semibold text-left">Email</th>
        <th className="py-3 px-4 font-semibold text-left">Teléfono</th>
        <th className="py-3 px-4 font-semibold text-left">Rol</th>
        <th className="py-3 px-4 font-semibold text-left">Estado</th>
        <th className="py-3 px-4 font-semibold text-center">Creado</th>
        <th className="py-3 px-4 font-semibold text-center">Trabajos</th>
        <th className="py-3 px-4 font-semibold text-center">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {loading && (
        <tr>
          <td colSpan={8} className="text-center py-8 text-gray-500 italic">
            Cargando...
          </td>
        </tr>
      )}
      {!loading && workers.length === 0 && (
        <tr>
          <td colSpan={8} className="text-center py-8 text-gray-500 italic">
            No se encontraron trabajadores
          </td>
        </tr>
      )}
      {!loading && workers.map(worker => (
        <tr key={worker.id} className="rounded-lg shadow hover:bg-gray-50 transition-colors">
          <td className="py-3 px-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="truncate max-w-xs">{worker.name}</span>
          </td>
          <td className="py-3 px-4 flex items-center space-x-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate max-w-xs">{worker.email}</span>
          </td>
          <td className="py-3 px-4 flex items-center space-x-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{worker.phone || "-"}</span>
          </td>
          <td className="py-3 px-4">
            <Badge className={getRoleColor(worker.role)} >
              {getRoleLabel(worker.role)}
            </Badge>
          </td>
          <td className="py-3 px-4">
            <Badge className={getStatusColor(worker.status)} >
              {getStatusLabel(worker.status)}
            </Badge>
          </td>
          <td className="py-3 px-4 text-center whitespace-nowrap text-gray-500">
            <Calendar className="inline-block w-5 h-5 mr-1" />
            {new Date(worker.createdAt).toLocaleDateString()}
          </td>
          <td className="py-3 px-4 text-center font-medium">
            {worker._count?.assignedJobs ?? 0}
          </td>
          <td className="py-3 px-4 text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem onClick={() => handleEdit(worker)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(worker.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


    </div>
  )
}
