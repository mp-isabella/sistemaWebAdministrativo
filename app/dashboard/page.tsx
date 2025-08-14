"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, Wrench, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react'
import { Bar, Line, Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from "chart.js"
import { RoleRedirect } from "@/components/auth/role-redirect"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    todayJobs: 8,
    pendingJobs: 12,
    completedJobs: 45,
    totalRevenue: 2850000,
    activeClients: 128,
    activeTechnicians: 6,
  })

  const [todaySchedule, setTodaySchedule] = useState([
    { id: "1", time: "09:00", client: "María González", service: "Detección de Fugas", technician: "Juan Pérez", status: "confirmed", priority: "high" },
    { id: "2", time: "11:30", client: "Empresa ABC", service: "Video Inspección", technician: "Ana Silva", status: "in_progress", priority: "medium" },
    { id: "3", time: "14:00", client: "Carlos Rodríguez", service: "Destape Alcantarillado", technician: "Luis Torres", status: "pending", priority: "high" },
    { id: "4", time: "16:30", client: "Condominio Los Pinos", service: "Detección de Fugas", technician: "Pedro Sánchez", status: "confirmed", priority: "low" },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Chart data
  const weeklyJobsData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [{ label: "Trabajos Completados", data: [12, 15, 8, 18, 22, 14, 6], backgroundColor: "rgba(59, 130, 246, 0.8)", borderColor: "rgb(59, 130, 246)", borderWidth: 1, borderRadius: 4 }],
  }

  const revenueData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [{ label: "Ingresos (CLP)", data: [1200000, 1900000, 1500000, 2500000, 2200000, 2850000], borderColor: "rgb(245, 124, 0)", backgroundColor: "rgba(245, 124, 0, 0.1)", tension: 0.4, fill: true }],
  }

  const serviceDistribution = {
    labels: ["Detección de Fugas", "Destape Alcantarillado", "Video Inspección"],
    datasets: [{ data: [45, 35, 20], backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(245, 124, 0, 0.8)", "rgba(34, 197, 94, 0.8)"], borderWidth: 0 }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" } }, x: { grid: { display: false } } },
  }

  return (
    <RoleRedirect>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Hola, {session?.user?.name?.split(" ")[0] || "Usuario"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Aquí tienes un resumen de tu día en Améstica</p>
          </div>
          <div className="flex space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Trabajo
            </Button>
            <Button variant="outline" className="bg-white">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Agenda
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trabajos Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.todayJobs}</p>
                  <p className="text-xs text-green-600 mt-1">+2 desde ayer</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingJobs}</p>
                  <p className="text-xs text-yellow-600 mt-1">Requieren atención</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedJobs}</p>
                  <p className="text-xs text-green-600 mt-1">Este mes</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString("es-CL")}</p>
                  <p className="text-xs text-green-600 mt-1">+15% vs mes anterior</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Agenda de Hoy</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {todaySchedule.length} trabajos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{appointment.time}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{appointment.client}</h4>
                          <Badge className={getPriorityColor(appointment.priority)} variant="outline">
                            {appointment.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                        <p className="text-xs text-gray-500">Técnico: {appointment.technician}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">Distribución de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut
                  data={serviceDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">Trabajos por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={weeklyJobsData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">Evolución de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={revenueData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.parsed.y.toLocaleString("es-CL")}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white hover:bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Nuevo Cliente</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white hover:bg-green-50">
                <Wrench className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Programar Servicio</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white hover:bg-orange-50">
                <DollarSign className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium">Generar Factura</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white hover:bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">Ver Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleRedirect>
  )
}
