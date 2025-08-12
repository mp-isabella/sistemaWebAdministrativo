"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, TrendingUp, Download, FileText, DollarSign, Plus, Eye, Wrench, CreditCard } from 'lucide-react'
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
          technician: "Ana Silva",
          date: "2024-01-14",
        },
        {
          id: "JOB-003",
          client: "Pedro Sánchez",
          service: "Mantención preventiva",
          status: "PENDING",
          priority: "LOW",
          technician: "Luis Torres",
          date: "2024-01-16",
        },
      ])

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/reports/export?type=${type}`, {
        method: "GET",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte-${type}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  // Handlers for various actions
  const handleNewJob = () => {
    setShowJobForm(true)
  }

  const handleViewSchedule = () => {
    router.push('/dashboard/schedule')
  }

  const handleNewClient = () => {
    setShowClientForm(true)
  }

  const handleManageWorkers = () => {
    router.push('/dashboard/workers')
  }

  const handleViewStats = () => {
    router.push('/dashboard/analytics')
  }

  const handleRegisterIncome = () => {
    setCashTransactionType('income')
    setShowCashForm(true)
  }

  const handleRegisterExpense = () => {
    setCashTransactionType('expense')
    setShowCashForm(true)
  }

  const handleNewInvoice = () => {
    setShowInvoiceForm(true)
  }

  const handleExportBilling = () => {
    exportReport('billing')
  }

  const handleNewReport = () => {
    setShowReportForm(true)
  }

  const handleJobFormSubmit = async (jobData: any) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        setShowJobForm(false)
        fetchDashboardData() // Refresh data
        showNotification('success', 'Trabajo creado exitosamente')
      } else {
        showNotification('error', 'Error al crear el trabajo')
      }
    } catch (error) {
      console.error('Error creating job:', error)
      showNotification('error', 'Error de conexión')
    }
  }

  const handleClientFormClose = () => {
    setShowClientForm(false)
  }

  const handleClientFormSave = async () => {
    setShowClientForm(false)
    fetchDashboardData() // Refresh data
    showNotification('success', 'Cliente guardado exitosamente')
  }

  const handleCashFormSubmit = async (transactionData: any) => {
    try {
      const response = await fetch('/api/cash-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionData,
          type: cashTransactionType.toUpperCase()
        }),
      })

      if (response.ok) {
        setShowCashForm(false)
        fetchDashboardData() // Refresh data
        showNotification('success', `${cashTransactionType === 'income' ? 'Ingreso' : 'Gasto'} registrado exitosamente`)
      } else {
        showNotification('error', 'Error al registrar la transacción')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      showNotification('error', 'Error de conexión')
    }
  }

  const handleInvoiceFormSubmit = async (invoiceData: any) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        setShowInvoiceForm(false)
        fetchDashboardData() // Refresh data
        showNotification('success', 'Factura creada exitosamente')
      } else {
        showNotification('error', 'Error al crear la factura')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      showNotification('error', 'Error de conexión')
    }
  }

  const handleReportFormSubmit = (reportData: any) => {
    exportReport(reportData.type)
    setShowReportForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Chart data
  const monthlyJobsData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Trabajos Completados",
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  }

  const revenueData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Ingresos (CLP)",
        data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.1,
      },
    ],
  }

  const serviceDistribution = {
    labels: ["Detección", "Reparación", "Mantención", "Emergencia", "Instalación"],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
      },
    ],
  }

  const handleChartClick = (chartType: string) => {
    router.push(`/dashboard/analytics?chart=${chartType}`)
  }

  const handleAddClient = () => {
    setShowClientForm(true)
  }

  const handleExportSpecificReport = (reportType: string) => {
    exportReport(reportType)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Vista general del sistema SIGAS</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleNewJob} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Trabajo
          </Button>
          <Button onClick={handleViewSchedule} variant="outline" className="bg-white">
            <Calendar className="mr-2 h-4 w-4" />
            Ver Agenda
          </Button>
          <Button onClick={() => exportReport("general")} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleManageWorkers}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trabajadores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/clients')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewSchedule}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trabajos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/billing')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString("es-CL")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleChartClick('jobs')}>
          <CardHeader>
            <CardTitle>Trabajos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={monthlyJobsData} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleChartClick('revenue')}>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={revenueData} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={serviceDistribution} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Trabajos Recientes</span>
              <Button variant="outline" size="sm" onClick={handleViewSchedule}>
                <FileText className="mr-2 h-4 w-4" />
                Ver Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{job.id}</span>
                      <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {job.client} - {job.service}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Técnico: {job.technician} | {job.date}
                    </p>
                  </div>
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                </div>
              ))}
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
            <Button onClick={handleNewClient} className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <Users className="h-6 w-6" />
              <span>Nuevo Cliente</span>
            </Button>
            <Button onClick={handleNewJob} className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <Calendar className="h-6 w-6" />
              <span>Programar Trabajo</span>
            </Button>
            <Button onClick={handleNewReport} className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <FileText className="h-6 w-6" />
              <span>Generar Reporte</span>
            </Button>
            <Button onClick={handleViewStats} className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
              <TrendingUp className="h-6 w-6" />
              <span>Ver Estadísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button onClick={handleAddClient} className="h-16 flex-col space-y-2" variant="outline">
              <Plus className="h-5 w-5" />
              <span>Nuevo Cliente</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/clients')} className="h-16 flex-col space-y-2" variant="outline">
              <Eye className="h-5 w-5" />
              <span>Ver Clientes</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/clients?filter=potential')} className="h-16 flex-col space-y-2" variant="outline">
              <Plus className="h-5 w-5" />
              <span>Clientes Potenciales</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cash Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleRegisterIncome} className="h-16 flex-col space-y-2 bg-green-600 hover:bg-green-700 text-white">
              <TrendingUp className="h-5 w-5" />
              <span>Registrar Ingreso</span>
            </Button>
            <Button onClick={handleRegisterExpense} className="h-16 flex-col space-y-2 bg-red-600 hover:bg-red-700 text-white">
              <TrendingUp className="h-5 w-5 rotate-180" />
              <span>Registrar Gasto</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/cash')} className="h-16 flex-col space-y-2" variant="outline">
              <Eye className="h-5 w-5" />
              <span>Ver Movimientos</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/cash/balance')} className="h-16 flex-col space-y-2" variant="outline">
              <DollarSign className="h-5 w-5" />
              <span>Balance General</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recaudación y Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleNewInvoice} className="h-16 flex-col space-y-2 bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="h-5 w-5" />
              <span>Nueva Factura</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/billing')} className="h-16 flex-col space-y-2" variant="outline">
              <Eye className="h-5 w-5" />
              <span>Ver Facturas</span>
            </Button>
            <Button onClick={handleExportBilling} className="h-16 flex-col space-y-2" variant="outline">
              <Download className="h-5 w-5" />
              <span>Exportar</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/billing/pending')} className="h-16 flex-col space-y-2" variant="outline">
              <Clock className="h-5 w-5" />
              <span>Pendientes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes y Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => handleExportSpecificReport('general')} className="h-16 flex-col space-y-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Download className="h-5 w-5" />
              <span>Exportar PDF</span>
            </Button>
            <Button onClick={handleNewReport} className="h-16 flex-col space-y-2" variant="outline">
              <FileText className="h-5 w-5" />
              <span>Nuevo Reporte</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/reports/available')} className="h-16 flex-col space-y-2" variant="outline">
              <Eye className="h-5 w-5" />
              <span>Reportes Disponibles</span>
            </Button>
            <Button onClick={() => router.push('/dashboard/analytics')} className="h-16 flex-col space-y-2" variant="outline">
              <TrendingUp className="h-5 w-5" />
              <span>Análisis Avanzado</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {showJobForm && (
        <div className="fixed inset-0 z-50">
          <JobForm 
            onSubmit={handleJobFormSubmit}
            onCancel={() => setShowJobForm(false)}
          />
        </div>
      )}

      {showClientForm && (
        <ClientForm 
          onCancel={handleClientFormClose}
          onSubmit={handleClientFormSave}
        />
      )}

      {showCashForm && (
        <CashTransactionForm 
          type={cashTransactionType}
          onSubmit={handleCashFormSubmit}
          onCancel={() => setShowCashForm(false)}
        />
      )}

      {showInvoiceForm && (
        <InvoiceForm 
          onSubmit={handleInvoiceFormSubmit}
          onCancel={() => setShowInvoiceForm(false)}
        />
      )}

      {showReportForm && (
        <ReportGeneratorForm 
          onSubmit={handleReportFormSubmit}
          onCancel={() => setShowReportForm(false)}
        />
      )}

      {/* Estado para notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}
