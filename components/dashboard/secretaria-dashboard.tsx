"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Calendar, FileText, Plus, Search, Download, Receipt, ExternalLink, Clock, TrendingUp, CreditCard } from "lucide-react"

interface Activity {
  id: number;
  type: "client_registered" | "job_scheduled" | "invoice_generated";
  description: string;
  timestamp: string; // ISO string
}

export default function SecretariaDashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingJobs: 0,
    completedJobs: 0,
    pendingInvoices: 0,
  })

  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulated data - replace with actual API calls
    setStats({
      totalClients: 156,
      pendingJobs: 23,
      completedJobs: 89,
      pendingInvoices: 12,
    })

    setRecentActivities([
      {
        id: 1,
        type: "client_registered",
        description: "Nuevo cliente registrado: María González",
        timestamp: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        type: "job_scheduled",
        description: "Trabajo programado para Carlos Rodríguez",
        timestamp: "2024-01-15T09:15:00Z"
      },
      {
        id: 3,
        type: "invoice_generated",
        description: "Factura generada para Servicio #1234",
        timestamp: "2024-01-15T08:45:00Z"
      }
    ])
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "client_registered":
        return <Users className="h-4 w-4 text-blue-500" />
      case "job_scheduled":
        return <Calendar className="h-4 w-4 text-green-500" />
      case "invoice_generated":
        return <Receipt className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "client_registered":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "job_scheduled":
        return "bg-green-50 border-green-200 text-green-800"
      case "invoice_generated":
        return "bg-purple-50 border-purple-200 text-purple-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header del Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                Panel de <span className="text-blue-600">Secretaría</span>
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Gestión administrativa y coordinación de servicios
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Cliente
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Programar Trabajo
              </Button>
            </div>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Clientes */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-100 font-medium">Total Clientes</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.totalClients}</div>
            <div className="text-blue-100 text-sm">
              Clientes registrados
            </div>
          </div>

          {/* Trabajos Pendientes */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-yellow-100 font-medium">Trabajos Pendientes</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.pendingJobs}</div>
            <div className="text-yellow-100 text-sm">
              En espera de asignación
            </div>
          </div>

          {/* Trabajos Completados */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-emerald-100 font-medium">Trabajos Completados</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.completedJobs}</div>
            <div className="text-emerald-100 text-sm">
              Finalizados este mes
            </div>
          </div>

          {/* Facturas Pendientes */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-100 font-medium">Facturas Pendientes</div>
              <div className="bg-white/20 p-3 rounded-xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.pendingInvoices}</div>
            <div className="text-purple-100 text-sm">
              Por procesar
            </div>
          </div>
        </div>

        {/* Sección de Búsqueda y Acciones Rápidas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Búsqueda y Acciones Rápidas</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar clientes, trabajos, facturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline"
                className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Reportes
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Receipt className="h-5 w-5 mr-2" />
                Generar Facturas
              </Button>
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Actividades Recientes</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              Ver Todas
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.description}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos Directos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestión de Clientes */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Gestión de Clientes</h3>
                <p className="text-gray-600 text-sm">Administrar base de datos</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total registrados:</span>
                <span className="font-semibold text-gray-800">{stats.totalClients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Activos:</span>
                <span className="font-semibold text-green-600">{Math.floor(stats.totalClients * 0.8)}</span>
              </div>
            </div>
          </div>

          {/* Programación de Trabajos */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors duration-200">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Programación</h3>
                <p className="text-gray-600 text-sm">Coordinar trabajos</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pendientes:</span>
                <span className="font-semibold text-orange-600">{stats.pendingJobs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completados:</span>
                <span className="font-semibold text-green-600">{stats.completedJobs}</span>
              </div>
            </div>
          </div>

          {/* Facturación */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors duration-200">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Facturación</h3>
                <p className="text-gray-600 text-sm">Procesar pagos</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pendientes:</span>
                <span className="font-semibold text-red-600">{stats.pendingInvoices}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Este mes:</span>
                <span className="font-semibold text-green-600">$45,230</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
