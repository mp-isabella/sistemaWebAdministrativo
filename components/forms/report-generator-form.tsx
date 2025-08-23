"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X, FileText, Download, Calendar, Filter } from 'lucide-react'

interface ReportGeneratorFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function ReportGeneratorForm({ onSubmit, onCancel }: ReportGeneratorFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    format: 'pdf',
    dateFrom: '',
    dateTo: '',
    includeCharts: true,
    includeDetails: true,
    groupBy: '',
    filters: {
      status: [],
      priority: [],
      technician: [],
      client: [],
      service: []
    }
  })

  const [loading, setLoading] = useState(false)

  const reportTypes = [
    { value: 'general', label: 'Reporte General', description: 'Vista completa de todas las actividades' },
    { value: 'jobs', label: 'Trabajos', description: 'Reporte detallado de trabajos realizados' },
    { value: 'clients', label: 'Clientes', description: 'Análisis de clientes y servicios' },
    { value: 'financial', label: 'Financiero', description: 'Ingresos, gastos y rentabilidad' },
    { value: 'technicians', label: 'Técnicos', description: 'Rendimiento y productividad' },
    { value: 'services', label: 'Servicios', description: 'Análisis de servicios más solicitados' },
    { value: 'inventory', label: 'Inventario', description: 'Estado de materiales y herramientas' },
    { value: 'custom', label: 'Personalizado', description: 'Reporte con filtros específicos' }
  ]

  const formats = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' }
  ]

  const groupByOptions = [
    { value: 'date', label: 'Por Fecha' },
    { value: 'technician', label: 'Por Técnico' },
    { value: 'client', label: 'Por Cliente' },
    { value: 'service', label: 'Por Servicio' },
    { value: 'status', label: 'Por Estado' },
    { value: 'priority', label: 'Por Prioridad' }
  ]

  const statusOptions: string[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
  const priorityOptions: string[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: checked
          ? [...prev.filters[filterType as keyof typeof prev.filters], value]
          : prev.filters[filterType as keyof typeof prev.filters].filter((item: string) => item !== value)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const setDateRange = (range: string) => {
    const today = new Date()
    let fromDate = new Date()

    switch (range) {
      case 'today':
        fromDate = today
        break
      case 'week':
        fromDate.setDate(today.getDate() - 7)
        break
      case 'month':
        fromDate.setMonth(today.getMonth() - 1)
        break
      case 'quarter':
        fromDate.setMonth(today.getMonth() - 3)
        break
      case 'year':
        fromDate.setFullYear(today.getFullYear() - 1)
        break
    }

    setFormData(prev => ({
      ...prev,
      dateFrom: fromDate.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span>Generador de Reportes</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type */}
            <div className="space-y-3">
              <Label>Tipo de Reporte *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'ring-2 ring-purple-500 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.type === type.value
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Format and Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Formato de Exportación</Label>
                <div className="flex space-x-2">
                  {formats.map((format) => (
                    <Button
                      key={format.value}
                      type="button"
                      variant={formData.format === format.value ? "default" : "outline"}
                      onClick={() => handleInputChange('format', format.value)}
                      className="flex-1"
                    >
                      <span className="mr-2">{format.icon}</span>
                      {format.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Rango de Fechas Rápido</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'today', label: 'Hoy' },
                    { key: 'week', label: 'Última semana' },
                    { key: 'month', label: 'Último mes' },
                    { key: 'quarter', label: 'Último trimestre' }
                  ].map((range) => (
                    <Button
                      key={range.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange(range.key)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={formData.dateFrom}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={formData.dateTo}
                  onChange={(e) => handleInputChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label>Opciones del Reporte</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={formData.includeCharts}
                    onCheckedChange={(checked) => handleInputChange('includeCharts', checked)}
                  />
                  <Label htmlFor="includeCharts">Incluir gráficos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetails"
                    checked={formData.includeDetails}
                    onCheckedChange={(checked) => handleInputChange('includeDetails', checked)}
                  />
                  <Label htmlFor="includeDetails">Incluir detalles</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupBy">Agrupar por</Label>
                <Select value={formData.groupBy} onValueChange={(value) => handleInputChange('groupBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar agrupación" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupByOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters */}
            {formData.type === 'custom' && (
              <Card className="p-4">
                <h4 className="font-medium mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avanzados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Estado</Label>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={(formData.filters.status as string[]).includes(status)}
                            onCheckedChange={(checked) => handleFilterChange('status', status, !!checked)}
                          />
                          <Label htmlFor={`status-${status}`}>{status}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Prioridad</Label>
                    <div className="space-y-2">
                      {priorityOptions.map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={(formData.filters.priority as string[]).includes(priority)}
                            onCheckedChange={(checked) => handleFilterChange('priority', priority, !!checked)}
                          />
                          <Label htmlFor={`priority-${priority}`}>{priority}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={loading || !formData.type}
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
