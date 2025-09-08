"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, TrendingUp, Download, FileText, DollarSign, Plus, Eye, Wrench, CreditCard, ExternalLink, MapPin } from 'lucide-react'
import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useRouter } from "next/navigation"
import { CalendarEvents } from "@/lib/calendar-events"
import JobForm from "@/components/forms/job-form"
import ClientForm from "@/components/forms/client-form"
import CashTransactionForm from "@/components/forms/cash-transaction-form"
import InvoiceForm from "@/components/forms/invoice-form"
import ReportGeneratorForm from "@/components/forms/report-generator-form"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalClients: 0,
    pendingJobs: 0,
    completedJobs: 0,
    monthlyRevenue: 0,
    activeJobs: 0,
  })

  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Modales states
  const [showJobForm, setShowJobForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [showCashForm, setShowCashForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [cashTransactionType, setCashTransactionType] = useState<'income' | 'expense'>('income')
  
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const [recentJobs, setRecentJobs] = useState<Array<{
    id: string
    client: string
    service: string
    status: string
    priority: string
    technician: string
    date: string
  }>>([])

  const fetchDashboardData = async () => {
    try {
      // Simulated data - replace with actual API calls
      setStats({
        totalWorkers: 15,
        totalClients: 128,
        pendingJobs: 12,
        completedJobs: 45,
        monthlyRevenue: 2500000,
        activeJobs: 8,
      })
      
      setRecentJobs([
        {
          id: "JOB-001",
          client: "María González",
          service: "Detección de fuga",
          status: "IN_PROGRESS",
          priority: "HIGH",
          technician: "Juan Pérez",
          date: "2024-01-15",
        },
        {
          id: "JOB-002",
          client: "Carlos Rodríguez",
          service: "Reparación de cañería",
          status: "COMPLETED",
          priority: "MEDIUM",
          technician: "Marta Durán",
          date: "2024-01-14",
        },
        {
          id: "JOB-003",
          client: "Ana Silva",
          service: "Instalación de grifo",
          status: "PENDING",
          priority: "LOW",
          technician: "Sin asignar",
          date: "2024-01-16",
        },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'IN_PROGRESS':
        return 'primary'
      case 'COMPLETED':
        return 'success'
      case 'CANCELLED':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'danger'
      case 'MEDIUM':
        return 'warning'
      case 'LOW':
        return 'success'
      default:
        return 'info'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'IN_PROGRESS':
        return 'En Progreso'
      case 'COMPLETED':
        return 'Completado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Alta'
      case 'MEDIUM':
        return 'Media'
      case 'LOW':
        return 'Baja'
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-lg sm:text-xl text-gray-600 font-medium ml-4">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 md:space-y-8">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 p-3 sm:p-4 rounded-xl text-white shadow-lg transform transition-all duration-300 max-w-sm sm:max-w-md ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <p className="text-sm sm:text-base">{notification.message}</p>
        </div>
      )}

      {/* Header del Dashboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Resumen general del sistema y estadísticas
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              onClick={() => setShowJobForm(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Nuevo Trabajo</span>
              <span className="sm:hidden">Trabajo</span>
            </Button>
            <Button 
              onClick={() => setShowClientForm(true)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
              <span className="sm:hidden">Cliente</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Total Trabajadores */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                Total Trabajadores
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.totalWorkers}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Técnicos activos en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Total Clientes */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                Total Clientes
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.totalClients}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        {/* Trabajos Pendientes */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                Trabajos Pendientes
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingJobs}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Trabajos en espera
            </p>
          </CardContent>
        </Card>

        {/* Trabajos Completados */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                Trabajos Completados
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.completedJobs}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Trabajos finalizados este mes
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Mensuales */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                Ingresos Mensuales
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Ingresos del mes actual
            </p>
          </CardContent>
        </Card>

        {/* Trabajos Activos */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                Trabajos Activos
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.activeJobs}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Trabajos en progreso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Gráfico de Trabajos por Estado */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Trabajos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <Pie
                data={{
                  labels: ['Pendientes', 'En Progreso', 'Completados', 'Cancelados'],
                  datasets: [
                    {
                      data: [stats.pendingJobs, stats.activeJobs, stats.completedJobs, 2],
                      backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444'],
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 20,
                        font: {
                          size: window.innerWidth < 768 ? 10 : 14,
                          weight: 600
                        }
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Ingresos Mensuales */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <Bar
                data={{
                  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Ingresos (CLP)',
                      data: [2100000, 1800000, 2500000, 2200000, 2800000, 2500000],
                      backgroundColor: 'rgba(0, 45, 113, 0.8)',
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value as number).replace('CLP', '');
                        },
                        font: {
                          size: window.innerWidth < 768 ? 10 : 12,
                          weight: 600
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: window.innerWidth < 768 ? 10 : 12,
                          weight: 600
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trabajos Recientes */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Trabajos Recientes
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/schedule')}
              className="w-full sm:w-auto"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Servicio</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Estado</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Prioridad</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden lg:table-cell">Técnico</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Fecha</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-mono text-gray-600">{job.id}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-20 sm:max-w-32">{job.client}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell truncate max-w-24 sm:max-w-40">{job.service}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <Badge variant="outline" className={`text-xs ${
                        getStatusColor(job.status) === 'warning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        getStatusColor(job.status) === 'primary' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        getStatusColor(job.status) === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {getStatusText(job.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                      <Badge variant="outline" className={`text-xs ${
                        getPriorityColor(job.priority) === 'danger' ? 'bg-red-50 text-red-700 border-red-200' :
                        getPriorityColor(job.priority) === 'warning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {getPriorityText(job.priority)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 hidden lg:table-cell truncate max-w-24">{job.technician}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{new Date(job.date).toLocaleDateString('es-CL')}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/my-jobs/${job.id}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Button 
              onClick={() => setShowCashForm(true)}
              className="h-auto flex-col gap-3 p-4 sm:p-6"
            >
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-sm sm:text-base">Registrar Pago</span>
            </Button>
            
            <Button 
              onClick={() => setShowInvoiceForm(true)}
              variant="outline"
              className="h-auto flex-col gap-3 p-4 sm:p-6"
            >
              <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-sm sm:text-base">Crear Factura</span>
            </Button>
            
            <Button 
              onClick={() => setShowReportForm(true)}
              variant="outline"
              className="h-auto flex-col gap-3 p-4 sm:p-6"
            >
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-sm sm:text-base">Generar Reporte</span>
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard/calendar')}
              variant="outline"
              className="h-auto flex-col gap-3 p-4 sm:p-6"
            >
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-sm sm:text-base">Ver Calendario</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <JobForm 
              onSubmit={() => {}} 
              onCancel={() => setShowJobForm(false)} 
            />
          </div>
        </div>
      )}

      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <ClientForm 
              onSubmit={() => {}} 
              onCancel={() => setShowClientForm(false)} 
            />
          </div>
        </div>
      )}

      {showCashForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CashTransactionForm 
              type={cashTransactionType}
              onSubmit={() => {}} 
              onCancel={() => setShowCashForm(false)} 
            />
          </div>
        </div>
      )}

      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <InvoiceForm 
              onSubmit={() => {}} 
              onCancel={() => setShowInvoiceForm(false)} 
            />
          </div>
        </div>
      )}

      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <ReportGeneratorForm 
              onSubmit={() => {}} 
              onCancel={() => setShowReportForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
