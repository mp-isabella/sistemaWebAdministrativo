"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react"
import { Bar, Line, Doughnut } from "react-chartjs-2"
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
import type { DateRange } from "react-day-picker" 
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)  
    const [selectedCompany, setSelectedCompany] = useState("all")
    const [selectedTechnician, setSelectedTechnician] = useState("all")

  const servicesByTechnician = {
    labels: ["Juan Pérez", "Ana Silva", "Luis Torres", "Pedro Sánchez"],
    datasets: [
      {
        label: "Servicios Completados",
        data: [25, 19, 22, 18],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 124, 0, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  }

  const revenueByMonth = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Ingresos",
        data: [1200000, 1900000, 1500000, 2500000, 2200000, 2850000],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const serviceDistribution = {
    labels: ["Detección de Fugas", "Destape Alcantarillado", "Video Inspección"],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(245, 124, 0, 0.8)", "rgba(34, 197, 94, 0.8)"],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  }

  const exportReport = (type: string) => {
    console.log(`Exporting ${type} report...`)
    // Implement PDF export logic here
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">Analiza el rendimiento y métricas de tu negocio</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => exportReport("general")} className="bg-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            Nuevo Reporte
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Fechas</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  <SelectItem value="amestica">Améstica</SelectItem>
                  <SelectItem value="multifugas">Multifugas</SelectItem>
                  <SelectItem value="semifugas">Semifugas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Técnico</label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los técnicos</SelectItem>
                  <SelectItem value="juan">Juan Pérez</SelectItem>
                  <SelectItem value="ana">Ana Silva</SelectItem>
                  <SelectItem value="luis">Luis Torres</SelectItem>
                  <SelectItem value="pedro">Pedro Sánchez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Aplicar Filtros</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Servicios Totales</p>
                <p className="text-3xl font-bold text-gray-900">84</p>
                <p className="text-xs text-green-600 mt-1">+12% vs mes anterior</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-gray-900">$2.85M</p>
                <p className="text-xs text-green-600 mt-1">+18% vs mes anterior</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Técnicos Activos</p>
                <p className="text-3xl font-bold text-gray-900">6</p>
                <p className="text-xs text-blue-600 mt-1">100% disponibilidad</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-3xl font-bold text-gray-900">4.8</p>
                <p className="text-xs text-green-600 mt-1">Promedio de 5 estrellas</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Servicios por Técnico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={servicesByTechnician} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Evolución de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={revenueByMonth} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Distribución de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={serviceDistribution} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Reportes Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-white hover:bg-blue-50"
                onClick={() => exportReport("services")}
              >
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Reporte de Servicios</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-white hover:bg-green-50"
                onClick={() => exportReport("revenue")}
              >
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Reporte Financiero</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-white hover:bg-orange-50"
                onClick={() => exportReport("technicians")}
              >
                <BarChart3 className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium">Rendimiento Técnicos</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-white hover:bg-purple-50"
                onClick={() => exportReport("clients")}
              >
                <PieChart className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">Análisis de Clientes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
