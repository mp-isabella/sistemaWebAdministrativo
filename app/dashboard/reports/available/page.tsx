"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Download, Eye, FileText, TrendingUp, Users, Wrench } from 'lucide-react'
import { useState } from "react"

export default function AvailableReportsPage() {
  const [loading, setLoading] = useState(false)

  const reportCategories = [
    {
      title: "Reportes Operacionales",
      description: "Informes relacionados con la operación diaria",
      reports: [
        {
          id: "jobs-summary",
          name: "Resumen de Trabajos",
          description: "Trabajos realizados, pendientes y en progreso",
          icon: Wrench,
          frequency: "Diario",
          lastGenerated: "Hace 2 horas",
          color: "blue"
        },
        {
          id: "technician-performance",
          name: "Rendimiento de Técnicos",
          description: "Productividad y eficiencia del personal",
          icon: Users,
          frequency: "Semanal",
          lastGenerated: "Hace 1 día",
          color: "green"
        },
        {
          id: "schedule-overview",
          name: "Vista General de Agenda",
          description: "Programación de servicios y disponibilidad",
          icon: Calendar,
          frequency: "Diario",
          lastGenerated: "Hace 3 horas",
          color: "purple"
        }
      ]
    },
    {
      title: "Reportes Financieros",
      description: "Análisis económico y de rentabilidad",
      reports: [
        {
          id: "revenue-analysis",
          name: "Análisis de Ingresos",
          description: "Ingresos por servicio, cliente y período",
          icon: TrendingUp,
          frequency: "Mensual",
          lastGenerated: "Hace 2 días",
          color: "green"
        },
        {
          id: "expense-tracking",
          name: "Seguimiento de Gastos",
          description: "Gastos operacionales y de mantenimiento",
          icon: DollarSign,
          frequency: "Mensual",
          lastGenerated: "Hace 5 días",
          color: "red"
        },
        {
          id: "profit-loss",
          name: "Estado de Resultados",
          description: "Pérdidas y ganancias del período",
          icon: FileText,
          frequency: "Mensual",
          lastGenerated: "Hace 1 semana",
          color: "blue"
        }
      ]
    }
  ]

  const exportReport = async (reportId: string, format: string = 'pdf') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/export?reportId=${reportId}&format=${format}`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        // Definir nombre de archivo según el formato
        const timestamp = new Date().toISOString().split('T')[0]
        const fileName = `reporte-${reportId}-${timestamp}.${format}`
        a.download = fileName

        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Mostrar notificación de éxito
        alert(`Reporte ${reportId} exportado exitosamente en formato ${format.toUpperCase()}`)
      } else {
        throw new Error('Error al exportar reporte')
      }
    } catch (error) {

      alert(`Error al exportar el reporte: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const viewReport = (reportId: string) => {
    // Mapear reportId a un ID de reporte existente
    const reportIdMap: Record<string, string> = {
      'jobs-summary': 'REP-2024-002',
      'technician-performance': 'REP-2024-003',
      'schedule-overview': 'REP-2024-002',
      'revenue-analysis': 'REP-2024-001',
      'expense-tracking': 'REP-2024-001',
      'profit-loss': 'REP-2024-001'
    }

    const actualReportId = reportIdMap[reportId] || 'REP-2024-001'
    window.location.href = `/dashboard/reports/${actualReportId}`
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Diario": return "bg-green-100 text-green-800"
      case "Semanal": return "bg-blue-100 text-blue-800"
      case "Mensual": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-600"
      case "green": return "bg-green-100 text-green-600"
      case "purple": return "bg-purple-100 text-purple-600"
      case "red": return "bg-red-100 text-red-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes Disponibles</h1>
          <p className="text-gray-600">Accede a todos los informes y análisis del sistema</p>
        </div>

        {/* Quick Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Estadísticas de Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Reportes Generados</div>
                <div className="text-xs text-gray-500">Este mes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Reportes Automáticos</div>
                <div className="text-xs text-gray-500">Programados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">Reportes Personalizados</div>
                <div className="text-xs text-gray-500">Creados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">156</div>
                <div className="text-sm text-gray-600">Descargas Totales</div>
                <div className="text-xs text-gray-500">Último mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Categories */}
        {reportCategories.map((category) => (
          <div key={category.title} className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
              <p className="text-gray-600">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getIconColor(report.color)}`}>
                          <report.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                        </div>
                      </div>
                      <Badge className={getFrequencyColor(report.frequency)}>
                        {report.frequency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{report.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Último reporte: {report.lastGenerated}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReport(report.id)}
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => exportReport(report.id, 'pdf')}
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                    </div>

                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportReport(report.id, 'excel')}
                        disabled={loading}
                        className="flex-1"
                      >
                        Excel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportReport(report.id, 'csv')}
                        disabled={loading}
                        className="flex-1"
                      >
                        CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
