"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Download, Eye, Edit, DollarSign, Calendar, FileText, TrendingUp } from "lucide-react"

export default function BillingPage() {
  const [invoices, setInvoices] = useState([
    {
      id: "INV-001",
      client: "María González",
      service: "Detección de Fugas",
      amount: 85000,
      status: "paid",
      date: "2024-01-15",
      dueDate: "2024-01-30",
      technician: "Juan Pérez",
    },
    {
      id: "INV-002",
      client: "Empresa ABC",
      service: "Video Inspección",
      amount: 120000,
      status: "pending",
      date: "2024-01-14",
      dueDate: "2024-01-29",
      technician: "Ana Silva",
    },
    {
      id: "INV-003",
      client: "Carlos Rodríguez",
      service: "Destape Alcantarillado",
      amount: 95000,
      status: "overdue",
      date: "2024-01-10",
      dueDate: "2024-01-25",
      technician: "Luis Torres",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagada"
      case "pending":
        return "Pendiente"
      case "overdue":
        return "Vencida"
      case "draft":
        return "Borrador"
      default:
        return status
    }
  }

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidRevenue = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingRevenue = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0)
  const overdueRevenue = invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.service.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recaudación y Facturación</h1>
          <p className="text-gray-600 mt-1">Gestiona facturas, pagos y reportes financieros</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString("es-CL")}</p>
                <p className="text-xs text-green-600 mt-1">Este mes</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cobrado</p>
                <p className="text-2xl font-bold text-gray-900">${paidRevenue.toLocaleString("es-CL")}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {invoices.filter((i) => i.status === "paid").length} facturas
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Por Cobrar</p>
                <p className="text-2xl font-bold text-gray-900">${pendingRevenue.toLocaleString("es-CL")}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {invoices.filter((i) => i.status === "pending").length} pendientes
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">${overdueRevenue.toLocaleString("es-CL")}</p>
                <p className="text-xs text-red-600 mt-1">
                  {invoices.filter((i) => i.status === "overdue").length} vencidas
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente, número de factura o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Facturas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Factura</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Servicio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Técnico</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vencimiento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{invoice.id}</div>
                      <div className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString("es-CL")}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{invoice.client}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{invoice.service}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{invoice.technician}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">${invoice.amount.toLocaleString("es-CL")}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{new Date(invoice.dueDate).toLocaleDateString("es-CL")}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="bg-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
