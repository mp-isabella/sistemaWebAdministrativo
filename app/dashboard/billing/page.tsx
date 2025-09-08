'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { RoleRedirect } from '@/components/auth/role-redirect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Download, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import InvoiceTemplate from '@/components/invoice/invoice-template'

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  status: string
  client: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    company?: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  notes?: string
  company: {
    id: string
    name: string
    type: 'AMESTICA' | 'MULTIFUGAS' | 'SERVIFUGAS'
    address: string
    phone: string
    email: string
    rut: string
  }
  createdBy: {
    name: string
    email: string
  }
}

export default function BillingPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clients, setClients] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceTemplate, setShowInvoiceTemplate] = useState(false)

  useEffect(() => {
    if (session) {
      fetchInvoices()
      fetchClients()
    }
  }, [session])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las facturas",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        title: "Error",
        description: "Error al cargar las facturas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary' as const },
      PAID: { label: 'Pagada', variant: 'default' as const },
      OVERDUE: { label: 'Vencida', variant: 'destructive' as const },
      CANCELLED: { label: 'Cancelada', variant: 'outline' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL')
  }

  const calculateTotals = () => {
    return filteredInvoices.reduce((acc, invoice) => {
      acc.total += invoice.total
      acc.pending += invoice.status === 'PENDING' ? invoice.total : 0
      acc.paid += invoice.status === 'PAID' ? invoice.total : 0
      acc.overdue += invoice.status === 'OVERDUE' ? invoice.total : 0
      return acc
    }, { total: 0, pending: 0, paid: 0, overdue: 0 })
  }

  const totals = calculateTotals()
  const userRole = session?.user?.role?.toLowerCase()

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceTemplate(true)
  }

  const handleCloseInvoice = () => {
    setSelectedInvoice(null)
    setShowInvoiceTemplate(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <RoleRedirect allowedRoles={["admin", "secretaria"]}>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-600">
            {userRole === 'admin' ? 'Gestión completa de facturas y pagos' : 'Gestión de facturas y consultas'}
          </p>
        </div>
        {/* Solo admin puede crear nuevas facturas */}
        {userRole === 'admin' && (
          <Button onClick={() => router.push('/dashboard/billing/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Button>
        )}
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">Total Facturado</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">Pendiente</div>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">Pagado</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.paid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">Vencido</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.overdue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagada</SelectItem>
                <SelectItem value="OVERDUE">Vencida</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            {/* Solo admin puede exportar */}
            {userRole === 'admin' && (
              <Button variant="outline" onClick={() => router.push('/api/reports/export?type=billing')}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de facturas */}
      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/billing/${invoice.id}`)}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-gray-600">
                    <strong>Cliente:</strong> {invoice.client.name}
                    {invoice.client.company && ` (${invoice.client.company})`}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Fecha:</strong> {formatDate(invoice.date)} | 
                    <strong> Vencimiento:</strong> {formatDate(invoice.dueDate)} |
                    <strong> Creada por:</strong> {invoice.createdBy.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(invoice.total)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Subtotal: {formatCurrency(invoice.subtotal)} | IVA: {formatCurrency(invoice.tax)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewInvoice(invoice)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/billing/${invoice.id}`)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron facturas</p>
            {userRole === 'admin' && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/billing/new')}
              >
                Crear primera factura
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de vista previa de factura */}
      {showInvoiceTemplate && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Vista Previa de Factura</h2>
              <Button variant="ghost" onClick={handleCloseInvoice}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <InvoiceTemplate 
                invoice={selectedInvoice}
                onView={() => router.push(`/dashboard/billing/${selectedInvoice.id}`)}
                onEdit={() => router.push(`/dashboard/billing/${selectedInvoice.id}/edit`)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleRedirect>
  )
}
