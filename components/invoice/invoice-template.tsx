'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Download, Edit, Eye, Printer } from 'lucide-react'

interface InvoiceTemplateProps {
  invoice: {
    id: string
    invoiceNumber: string
    date: string
    dueDate: string
    subtotal: number
    tax: number
    total: number
    status: string
    client: {
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
      name: string
      type: 'AMESTICA' | 'MULTIFUGAS' | 'SERVIFUGAS'
      logo?: string
      address: string
      phone: string
      email: string
      rut: string
    }
  }
  onEdit?: () => void
  onView?: () => void
}

export default function InvoiceTemplate({ invoice, onEdit, onView }: InvoiceTemplateProps) {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL')
  }

  const getCompanyConfig = (companyType: string) => {
    const configs = {
      AMESTICA: {
        name: 'AMESTICA LIMITADA',
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        rut: '76.508.960-3',
        address: 'Hamburgo 1398, Ñuñoa.',
        email: 'amesticaltda@gmail.com',
        phone: '222660040',
        logo: '/logo.png',
        colors: {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-200'
        },
        logoComponent: (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">AMESTICA</h1>
              <p className="text-sm text-gray-600">SERVICIOS PROFESIONALES</p>
            </div>
          </div>
        )
      },
      MULTIFUGAS: {
        name: 'MULTIFUGAS',
        service: 'Servicio de detección y reparación de filtraciones',
        rut: '78.135.216-0',
        address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
        email: 'multifugas@gmail.com',
        phone: '+569 78868002',
        logo: '/logo.png',
        colors: {
          primary: 'bg-green-600',
          secondary: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200'
        },
        logoComponent: (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">Multi</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">Fugas</span>
            </div>
          </div>
        )
      },
      SERVIFUGAS: {
        name: 'SERVIFUGAS SPA',
        service: 'Servicio de detección de filtraciones en agua potable y reparación de cañerías',
        rut: '78.135.232-2',
        address: 'Lo Barnechea 1559.',
        email: 'Servifugas1@gmail.com',
        phone: '+569 92492720',
        logo: '/logo.png',
        colors: {
          primary: 'bg-green-600',
          secondary: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200'
        },
        logoComponent: (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">ServiFugas</h1>
              <p className="text-sm text-gray-600">Detección de Fugas de Agua</p>
            </div>
          </div>
        )
      }
    }

    return configs[companyType as keyof typeof configs] || configs.AMESTICA
  }

  const companyConfig = getCompanyConfig(invoice.company.type)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/export-pdf`)
      if (response.ok) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          const htmlContent = await response.text()
          printWindow.document.write(htmlContent)
          printWindow.document.close()

          setTimeout(() => {
            printWindow.print()
          }, 500)
        }

        toast({
          title: "Éxito",
          description: `Factura ${invoice.invoiceNumber} generada para impresión`,
        })
      } else {
        toast({
          title: "Error",
          description: "Error al generar la factura",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al imprimir la factura",
        variant: "destructive"
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = async () => {
    try {
      // Usar el nuevo generador de PDF mejorado
      const { downloadInvoicePDF } = await import('@/components/pdf-generator')

      // Generar y descargar PDF
      downloadInvoicePDF(invoice, companyConfig)

      toast({
        title: "Éxito",
        description: `Factura ${invoice.invoiceNumber} descargada`,
      })
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al descargar la factura",
        variant: "destructive"
      })
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

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header con logo y información de la empresa */}
      <div className={`p-6 ${companyConfig.colors.secondary}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {companyConfig.logoComponent}
            <div className="mt-4 space-y-1 text-sm">
              <p><strong>RUT:</strong> {companyConfig.rut}</p>
              <p><strong>Dirección:</strong> {companyConfig.address}</p>
              <p><strong>Email:</strong> {companyConfig.email}</p>
              <p><strong>Teléfono:</strong> {companyConfig.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">FACTURA</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Número:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Fecha:</strong> {formatDate(invoice.date)}</p>
              <p><strong>Vencimiento:</strong> {formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Información del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Nombre:</strong> {invoice.client.name}</p>
            {invoice.client.email && (
              <p><strong>Email:</strong> {invoice.client.email}</p>
            )}
            <p><strong>Teléfono:</strong> {invoice.client.phone}</p>
          </div>
          <div>
            <p><strong>Dirección:</strong> {invoice.client.address}</p>
            {invoice.client.company && (
              <p><strong>Empresa:</strong> {invoice.client.company}</p>
            )}
          </div>
        </div>
      </div>

      {/* Detalle de la factura */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalle de Servicios</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Precio Unit.</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (19%):</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className={companyConfig.colors.text}>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {invoice.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Observaciones:</h4>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Condiciones de pago */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold mb-2 text-yellow-800">CONDICIONES DE PAGO</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Factura válida por 30 días desde la fecha de emisión</li>
            <li>• Pago mediante transferencia bancaria o efectivo</li>
            <li>• En caso de pago atrasado se aplicarán intereses</li>
            <li>• Para consultas sobre esta factura, contactar a {companyConfig.email}</li>
          </ul>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getStatusBadge(invoice.status)}
            <span className="text-sm text-gray-600">
              Generada el {formatDate(invoice.date)}
            </span>
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? 'Imprimiendo...' : 'Imprimir'}
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className={companyConfig.colors.primary}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
