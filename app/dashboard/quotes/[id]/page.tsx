'use client'

import QuoteTemplate from '@/components/quote/quote-template'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Check, Clock, Download, Edit, Send, Trash2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  materials?: string
  exposedArea?: string
}

interface Quote {
  id: string
  quoteNumber: string
  date: string
  validUntil: string
  subtotal: number
  tax: number
  total: number
  taxRate: number
  notes?: string
  status: string
  technician?: string
  diagnosis?: string
  serviceType?: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    company?: string
    rut?: string
  }
  company: {
    id: string
    name: string
    type: string
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    address?: string
    phone?: string
    email?: string
    taxId?: string
  }
  items: QuoteItem[]
  createdBy: {
    name: string
    email: string
  }
}

export default function QuoteDetailPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)

  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch(`/api/quotes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar el presupuesto",
          variant: "destructive"
        })
        router.push('/dashboard/quotes')
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al cargar el presupuesto",
        variant: "destructive"
      })
      router.push('/dashboard/quotes')
    } finally {
      setLoading(false)
    }
  }, [params.id, toast, router])

  useEffect(() => {
    if (session && params.id) {
      fetchQuote()
    }
  }, [session, params.id, fetchQuote])

  const downloadPDF = async () => {
    if (!quote) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/quotes/${quote.id}/export-pdf`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `presupuesto-${quote.quoteNumber}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Éxito",
          description: "Presupuesto descargado correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "Error al generar el PDF",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al descargar el PDF",
        variant: "destructive"
      })
    } finally {
      setDownloading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!quote) return

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quote,
          status: newStatus
        }),
      })

      if (response.ok) {
        const updatedQuote = await response.json()
        setQuote(updatedQuote)
        toast({
          title: "Éxito",
          description: `Estado actualizado a ${getStatusText(newStatus)}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar el estado",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al actualizar el estado",
        variant: "destructive"
      })
    }
  }

  const deleteQuote = async () => {
    if (!quote) return

    if (!confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      return
    }

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Presupuesto eliminado exitosamente",
        })
        router.push('/dashboard/quotes')
      } else {
        toast({
          title: "Error",
          description: "Error al eliminar el presupuesto",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al eliminar el presupuesto",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', variant: 'secondary' as const, icon: Clock },
      SENT: { label: 'Enviado', variant: 'default' as const, icon: Send },
      ACCEPTED: { label: 'Aceptado', variant: 'default' as const, icon: Check },
      REJECTED: { label: 'Rechazado', variant: 'destructive' as const, icon: X },
      EXPIRED: { label: 'Expirado', variant: 'outline' as const, icon: Clock }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
      icon: Clock
    }
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Borrador',
      'SENT': 'Enviado',
      'ACCEPTED': 'Aceptado',
      'REJECTED': 'Rechazado',
      'EXPIRED': 'Expirado'
    }
    return statusMap[status] || status
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <p className="text-gray-500">Presupuesto no encontrado</p>
          <Button onClick={() => router.push('/dashboard/quotes')} className="mt-4">
            Volver a Presupuestos
          </Button>
        </div>
      </div>
    )
  }

  if (showTemplate) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowTemplate(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Vista Detallada
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vista de Presupuesto</h1>
            <p className="text-gray-600">Vista previa del presupuesto para impresión</p>
          </div>
        </div>

        <QuoteTemplate
          quote={quote}
          onEdit={() => router.push(`/dashboard/quotes/${quote.id}/edit`)}
          onView={() => setShowTemplate(false)}
        />
      </div>
    )
  }

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/quotes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuesto {quote.quoteNumber}</h1>
            <p className="text-gray-600">Detalles completos del presupuesto</p>
          </div>
        </div>

        <div className="flex gap-2">
          {getStatusBadge(quote.status)}
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Generando...' : 'Descargar PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/quotes/${quote.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={deleteQuote}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del Presupuesto */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Número</p>
                  <p className="text-lg font-semibold">{quote.quoteNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">{getStatusBadge(quote.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                  <p className="text-lg">{formatDate(quote.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Válido hasta</p>
                  <p className="text-lg">{formatDate(quote.validUntil)}</p>
                </div>
                {quote.technician && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Técnico</p>
                    <p className="text-lg">{quote.technician}</p>
                  </div>
                )}
                {quote.serviceType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Servicio</p>
                    <p className="text-lg">{quote.serviceType}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-500">Creado por</p>
                <p className="text-lg">{quote.createdBy.name}</p>
                <p className="text-sm text-gray-500">{quote.createdBy.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          {quote.diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{quote.diagnosis}</p>
              </CardContent>
            </Card>
          )}

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-lg font-semibold">{quote.client?.name || 'No especificado'}</p>
                </div>
                {quote.client?.company && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Empresa</p>
                    <p className="text-lg">{quote.client.company}</p>
                  </div>
                )}
                {quote.client?.rut && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">RUT</p>
                    <p className="text-lg">{quote.client.rut}</p>
                  </div>
                )}
                {quote.client?.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg">{quote.client.email}</p>
                  </div>
                )}
                {quote.client?.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-lg">{quote.client.phone}</p>
                  </div>
                )}
              </div>

              {quote.client?.address && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <p className="text-lg">{quote.client.address}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items del Presupuesto */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Descripción</th>
                      <th className="text-center py-3 px-4 font-medium">Cantidad</th>
                      <th className="text-right py-3 px-4 font-medium">Precio Unitario</th>
                      <th className="text-right py-3 px-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, _index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            {item.materials && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Materiales:</span> {item.materials}
                              </p>
                            )}
                            {item.exposedArea && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Área expuesta:</span> {item.exposedArea}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{item.quantity}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA ({quote.taxRate}%):</span>
                <span className="font-medium text-red-600">{formatCurrency(quote.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(quote.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quote.status === 'DRAFT' && (
                <Button
                  onClick={() => updateStatus('SENT')}
                  className="w-full flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Marcar como Enviado
                </Button>
              )}

              {quote.status === 'SENT' && (
                <div className="space-y-2">
                  <Button
                    onClick={() => updateStatus('ACCEPTED')}
                    className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Aceptar Presupuesto
                  </Button>
                  <Button
                    onClick={() => updateStatus('REJECTED')}
                    variant="destructive"
                    className="w-full flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Rechazar Presupuesto
                  </Button>
                </div>
              )}

              {quote.status === 'ACCEPTED' && (
                <Button
                  onClick={() => router.push(`/dashboard/invoices/new?quoteId=${quote.id}`)}
                  className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Crear Factura
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
