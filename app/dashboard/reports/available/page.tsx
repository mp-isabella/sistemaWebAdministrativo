"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Wrench, Eye, Clock } from 'lucide-react'

export default function AvailableReportsPage() {
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

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
    },
    {
      title: "Reportes de Clientes",
      description: "Análisis del comportamiento y satisfacción",
      reports: [
        {
          id: "client-satisfaction",
          name: "Satisfacción del Cliente",
          description: "Encuestas y feedback de servicios",
          icon: Users,
          frequency: "Mensual",
          lastGenerated: "Hace 1 semana",
          color: "yellow"
        },
        {
          id: "client-retention",
          name: "Retención de Clientes",
          description: "Análisis de clientes recurrentes",
          icon: TrendingUp,
          frequency: "Trimestral",
          lastGenerated: "Hace 2 semanas",
          color: "purple"
        },
        {
          id: "service-demand",
          name: "Demanda de Servicios",
          description: "Servicios más solicitados por zona",
          icon: Wrench,
          frequency: "Mensual",
          lastGenerated: "Hace 1 semana",
          color: "orange"
        }
      ]
    }
  ]

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const exportReport = async (reportId: string, format: string = 'pdf') => {
    setLoading(true)
    try {
      showNotification('success', `Generando reporte ${format.toUpperCase()}...`)
      
      const response = await fetch(`/api/reports/export?type=${reportId}&format=${format}`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        if (typeof window !== 'undefined') {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.${format}`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          showNotification('success', 'Reporte descargado exitosamente')
        }
      } else {
        showNotification('error', 'Error al generar el reporte')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      showNotification('error', 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const viewReport = (reportId: string) => {
    if (typeof window !== 'undefined') {
      window.open(`/dashboard/reports/view/${reportId}`, '_blank')
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Diario":
        return "bg-green-100 text-green-800"
      case "Semanal":
        return "bg-blue-100 text-blue-800"
      case "Mensual":
        return "bg-purple-100 text-purple-800"
      case "Trimestral":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-600"
      case "green": return "bg-green-100 text-green-600"
      case "purple": return "bg-purple-100 text-purple-600"
      case "red": return "bg-red-100 text-red-600"
      case "yellow": return "bg-yellow-100 text-yellow-600"
      case "orange": return "bg-orange-100 text-orange-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md z-50 shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes Disponibles</h1>
          <p className="text-gray-600">Accede a todos los informes y análisis del sistema</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-white">
            <Clock className="mr-2 h-4 w-4" />
            Programar Reportes
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            Reporte Personalizado
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
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
        <div key={category.title} className="space-y-4">
          <div>
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
  )
}
