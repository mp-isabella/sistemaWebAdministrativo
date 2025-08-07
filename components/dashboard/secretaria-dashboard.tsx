"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Calendar, FileText, Plus, Search, Download, Receipt } from "lucide-react"

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

const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
  try {
    // Simulated data - replace with actual API calls
    setStats({
      totalClients: 128,
      pendingJobs: 12,
      completedJobs: 45,
      pendingInvoices: 8,
    });

    setRecentActivities([
      {
        id: 1,
        type: "client_registered",
        description: "Nuevo cliente registrado: María González",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        type: "job_scheduled",
        description: "Trabajo programado para Carlos Rodríguez",
        timestamp: "2024-01-15T09:15:00Z",
      },
      {
        id: 3,
        type: "invoice_generated",
        description: "Factura generada para trabajo JOB-001",
        timestamp: "2024-01-14T16:45:00Z",
      },
    ]);

    setLoading(false);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    setLoading(false);
  }
};


  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Secretaría</h1>
          <p className="text-gray-600">Gestión de clientes, servicios y facturas</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trabajos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trabajos Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Facturas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <Users className="h-6 w-6" />
              <span>Registrar Cliente</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <Calendar className="h-6 w-6" />
              <span>Programar Trabajo</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <Receipt className="h-6 w-6" />
              <span>Generar Factura</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <FileText className="h-6 w-6" />
              <span>Ver Reportes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString("es-CL")} -{" "}
                    {new Date(activity.timestamp).toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge variant="outline">{activity.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input placeholder="Buscar cliente, trabajo o factura..." className="w-full" />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
