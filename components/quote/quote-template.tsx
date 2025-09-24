'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Download, Eye, Printer } from 'lucide-react'
import Image from 'next/image'

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

interface QuoteTemplateProps {
  quote: Quote
  onEdit?: () => void
  onView?: () => void
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// This will be defined inside the component

// Function moved to component

const getStatusBadge = (status: string) => {
  const statusConfig = {
    DRAFT: { label: 'Borrador', variant: 'secondary' as const },
    SENT: { label: 'Guardado', variant: 'default' as const },
    ACCEPTED: { label: 'Aceptado', variant: 'default' as const },
    REJECTED: { label: 'Rechazado', variant: 'destructive' as const },
    EXPIRED: { label: 'Expirado', variant: 'outline' as const }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const getServiceTypeLabel = (type: string) => {
  const types = {
    deteccion_fugas: 'Detección de Fugas de Agua',
    destape_alcantarillado: 'Destape de Alcantarillado',
    videointrospeccion: 'Videoinspección de Ductos'
  }
  return types[type as keyof typeof types] || type
}

const _handleExportPDF = async () => {

  // PDF export logic would go here
}

const _handlePrint = () => {

  // Print logic would go here
}

export default function QuoteTemplate({ quote }: QuoteTemplateProps) {

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header con logo y información de la empresa */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <Image
                    src="/amestica.png"
                    alt="Logo AMESTICA"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-600">AMESTICA</h1>
                  <p className="text-sm text-gray-600">Detección y Reparación de Filtraciones</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>Servicio de detección y reparación de filtraciones de agua potable</p>
                <p>RUT: 76.508.960-3</p>
                <p>Hamburgo 1398, Ñuñoa.</p>
                <p>amesticaltda@gmail.com</p>
                <p>Fono: 222660040</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {quote.serviceType === 'deteccion_fugas' ? 'PRESUPUESTO POR DETECCIÓN DE FUGAS DE AGUA' :
                  quote.serviceType === 'destape_alcantarillado' ? 'PRESUPUESTO POR DESTAPE DE ALCANTARILLADO' :
                    quote.serviceType === 'videointrospeccion' ? 'PRESUPUESTO POR VIDEOINSPECCIÓN DE DUCTOS' :
                      'COTIZACIÓN'}
              </h1>
              <div className="flex items-center gap-2 justify-end">
                {getStatusBadge(quote.status)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del cliente y detalles */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Información del Cliente</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Señor (a):</span> {quote.client.name}</p>
                {quote.client.company && (
                  <p><span className="font-medium">Empresa:</span> {quote.client.company}</p>
                )}
                {quote.client.rut && (
                  <p><span className="font-medium">RUT:</span> {quote.client.rut}</p>
                )}
                {quote.client.address && (
                  <p><span className="font-medium">Dirección:</span> {quote.client.address}</p>
                )}
                {quote.client.phone && (
                  <p><span className="font-medium">Contacto:</span> {quote.client.phone}</p>
                )}
                {quote.client.email && (
                  <p><span className="font-medium">Email:</span> {quote.client.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Detalles del Servicio</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Fecha:</span> {formatDate(quote.date)}</p>
                <p><span className="font-medium">Válido hasta:</span> {formatDate(quote.validUntil)}</p>
                {quote.technician && (
                  <p><span className="font-medium">Técnico:</span> {quote.technician}</p>
                )}
                {quote.serviceType && (
                  <p><span className="font-medium">Tipo de Servicio:</span> {getServiceTypeLabel(quote.serviceType)}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      {quote.diagnosis && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Diagnóstico</h3>
            <p className="text-sm text-gray-700">{quote.diagnosis}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabla de servicios simplificada */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Detalle de Servicios</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Descripción del Servicio</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <p className="font-medium">{item.description}</p>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Neto:</span>
                <span className="font-semibold">{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium">IVA ({quote.taxRate}%):</span>
                <span className="font-semibold text-red-600">{formatCurrency(quote.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold bg-yellow-100 p-3 rounded">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {quote.notes && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Observaciones y Condiciones</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</div>
          </CardContent>
        </Card>
      )}

      {/* Condiciones generales según empresa */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Condiciones Generales del Servicio</h3>
          <div className="space-y-2 text-sm text-gray-700">
            {quote.company.type === 'SERVIFUGAS' ? (
              <>
                <p>• El pago se realizará en dos partes: 50% al inicio del servicio y el 50% restante al finalizar la detección de la filtración.</p>
                <p>• La cañería será dejada a la vista únicamente con la exposición mínima y necesaria.</p>
                <p>• Una vez detectada la filtración, se entregará un presupuesto para su reparación, siempre y cuando esta sea técnicamente viable.</p>
                <p>• Si la filtración se encuentra bajo un mueble o artefacto, será responsabilidad del cliente retirarlo para permitir el acceso a la cañería.</p>
                <p>• No se realizan trabajos de terminación, tales como reposición de cerámicas, madera, u otros materiales.</p>
                <p>• El margen de error en la detección es de aproximadamente 2 metros.</p>
                <p>• Las reparaciones realizadas por nuestra empresa cuentan con una garantía de 3 meses.</p>
                <p>• El presupuesto tendrá una validez de 30 días a partir de su fecha de emisión.</p>
              </>
            ) : quote.company.type === 'AMESTICA' ? (
              <>
                <p>• Condiciones de pago 100% al inicio para poder coordinar el servicio y enviar al técnico.</p>
                <p>• No se realizan terminaciones, ya sea en cerámicas, madera, entre otros.</p>
                <p>• Nuestra reparación tiene tres meses de garantía a partir de la fecha de realización del servicio.</p>
                <p>• Presupuesto válido hasta 30 días a partir de la fecha de emisión.</p>
              </>
            ) : (
              <>
                <p>• Se debe cancelar 50% al inicio del servicio y 50% al término de este.</p>
                <p>• No se realiza terminaciones de piso en cemento, cerámica, madera, entre otros.</p>
                <p>• No se retiran los escombros.</p>
                <p>• Una vez terminada la reparación, se hará revisión del medidor para determinar si queda otra filtración.</p>
                <p>• Garantía de tres meses por reparación realizada a partir de la fecha en que se realizó dicho trabajo.</p>
                <p>• Presupuesto valido solo por 30 días a contar de la fecha de emisión.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 print:hidden">
        <Button variant="outline" onClick={() => console.log('View details')}>
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalles
        </Button>
        <Button variant="outline" onClick={() => console.log('Edit quote')}>
          Editar
        </Button>
        <Button variant="outline" onClick={_handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button onClick={_handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>
    </div>
  )
}
