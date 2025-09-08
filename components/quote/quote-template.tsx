'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Download, Printer, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
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

export default function QuoteTemplate({ quote, onEdit, onView }: QuoteTemplateProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

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

  const getCompanyConfig = (companyType: string) => {
    const configs = {
      AMESTICA: {
        name: 'AMESTICA LIMITADA',
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        rut: '76.508.960-3',
        address: 'Hamburgo 1398, Ñuñoa.',
        email: 'amesticaltda@gmail.com',
        phone: '222660040',
        colors: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#f97316'
        },
        logoComponent: (
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
              <p className="text-sm text-gray-600">SERVICIOS PROFESIONALES</p>
            </div>
          </div>
        )
      },
      MULTIFUGAS: {
        name: 'MULTIFUGAS',
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        rut: '78.135.216-0',
        address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
        email: 'multifugas@gmail.com',
        phone: '+569 78868002',
        colors: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#f97316'
        },
        logoComponent: (
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src="/multifugas.png"
                alt="Logo MULTIFUGAS"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">MULTIFUGAS</h1>
              <p className="text-sm text-gray-600">Detección de Fugas</p>
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
        colors: {
          primary: '#059669',
          secondary: '#10b981',
          accent: '#1e40af'
        },
        logoComponent: (
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src="/servifugas.png"
                alt="Logo SERVIFUGAS"
                fill
                className="object-contain"
              />
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

  const companyConfig = getCompanyConfig(quote.company.type)

  const generateQuoteHTML = (quote: any) => {
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

    const getServiceTypeLabel = (type: string) => {
      const types = {
        detection: 'Detección de Filtración',
        repair: 'Reparación de Cañería',
        detection_repair: 'Detección y Reparación',
        maintenance: 'Mantenimiento',
        emergency: 'Servicio de Emergencia'
      }
      return types[type as keyof typeof types] || type
    }

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto ${quote.quoteNumber}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
        }
        .company-logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .company-service {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .company-info {
            font-size: 12px;
            color: #666;
        }
        .quote-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #1e40af;
        }
        .client-info, .quote-details {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1e40af;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .info-item {
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .totals {
            text-align: right;
            margin-top: 20px;
        }
        .total-row {
            margin-bottom: 8px;
        }
        .total-amount {
            font-weight: bold;
            font-size: 18px;
            color: #059669;
        }
        .conditions {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
        .conditions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .conditions li {
            margin-bottom: 5px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-logo">${companyConfig.name}</div>
        <div class="company-service">${companyConfig.service}</div>
        <div class="company-info">
            RUT: ${companyConfig.rut}<br>
            ${companyConfig.address}<br>
            ${companyConfig.email}<br>
            Fono: ${companyConfig.phone}
        </div>
    </div>

    <div class="quote-title">
        ${quote.serviceType === 'deteccion_fugas' ? 'PRESUPUESTO POR DETECCIÓN DE FUGAS DE AGUA' : 
          quote.serviceType === 'destape_alcantarillado' ? 'PRESUPUESTO POR DESTAPE DE ALCANTARILLADO' : 
          quote.serviceType === 'videointrospeccion' ? 'PRESUPUESTO POR VIDEOINSPECCIÓN DE DUCTOS' : 
          'COTIZACIÓN'}
    </div>

    <div class="info-grid">
        <div class="client-info">
            <div class="section-title">Información del Cliente</div>
            <div class="info-item">
                <span class="info-label">Señor (a):</span> ${quote.client.name}
            </div>
            ${quote.client.company ? `<div class="info-item"><span class="info-label">Empresa:</span> ${quote.client.company}</div>` : ''}
            ${quote.client.rut ? `<div class="info-item"><span class="info-label">RUT:</span> ${quote.client.rut}</div>` : ''}
            ${quote.client.address ? `<div class="info-item"><span class="info-label">Dirección:</span> ${quote.client.address}</div>` : ''}
            ${quote.client.phone ? `<div class="info-item"><span class="info-label">Contacto:</span> ${quote.client.phone}</div>` : ''}
        </div>

        <div class="quote-details">
            <div class="section-title">Detalles del Servicio</div>
            <div class="info-item">
                <span class="info-label">Fecha:</span> ${formatDate(quote.date)}
            </div>
            <div class="info-item">
                <span class="info-label">Válido hasta:</span> ${formatDate(quote.validUntil)}
            </div>
            ${quote.technician ? `<div class="info-item"><span class="info-label">Técnico:</span> ${quote.technician}</div>` : ''}
            ${quote.serviceType ? `<div class="info-item"><span class="info-label">Tipo de Servicio:</span> ${getServiceTypeLabel(quote.serviceType)}</div>` : ''}
        </div>
    </div>

    ${quote.diagnosis ? `
    <div class="section-title">Diagnóstico</div>
    <div style="margin-bottom: 20px;">${quote.diagnosis}</div>
    ` : ''}

    <div class="section-title">Detalle de Servicios</div>
    <table class="items-table">
        <thead>
            <tr>
                <th>Descripción del Servicio</th>
                <th style="text-align: right;">Precio Total</th>
            </tr>
        </thead>
        <tbody>
            ${quote.items.map((item: any) => `
            <tr>
                <td>${item.description}</td>
                <td style="text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span class="info-label">Neto:</span>
            <span style="font-weight: bold; margin-left: 20px;">${formatCurrency(quote.subtotal)}</span>
        </div>
        <div class="total-row">
            <span class="info-label">IVA (${quote.taxRate}%):</span>
            <span style="font-weight: bold; margin-left: 20px; color: #dc2626;">${formatCurrency(quote.tax)}</span>
        </div>
        <div class="total-row total-amount">
            <span class="info-label">Total:</span>
            <span style="margin-left: 20px;">${formatCurrency(quote.total)}</span>
        </div>
    </div>

    ${quote.notes ? `
    <div class="section-title">Observaciones y Condiciones</div>
    <div style="margin-bottom: 20px; white-space: pre-wrap;">${quote.notes}</div>
    ` : ''}

    <div class="section-title">Condiciones Generales del Servicio</div>
    <div class="conditions">
        ${quote.company.type === 'SERVIFUGAS' ? `
        <ul>
            <li>El pago se realizará en dos partes: 50% al inicio del servicio y el 50% restante al finalizar la detección de la filtración.</li>
            <li>La cañería será dejada a la vista únicamente con la exposición mínima y necesaria.</li>
            <li>Una vez detectada la filtración, se entregará un presupuesto para su reparación, siempre y cuando esta sea técnicamente viable.</li>
            <li>Si la filtración se encuentra bajo un mueble o artefacto, será responsabilidad del cliente retirarlo para permitir el acceso a la cañería.</li>
            <li>No se realizan trabajos de terminación, tales como reposición de cerámicas, madera, u otros materiales.</li>
            <li>El margen de error en la detección es de aproximadamente 2 metros.</li>
            <li>Las reparaciones realizadas por nuestra empresa cuentan con una garantía de 3 meses.</li>
            <li>El presupuesto tendrá una validez de 30 días a partir de su fecha de emisión.</li>
        </ul>
        ` : quote.company.type === 'AMESTICA' ? `
        <ul>
            <li>Condiciones de pago 100% al inicio para poder coordinar el servicio y enviar al técnico.</li>
            <li>No se realizan terminaciones, ya sea en cerámicas, madera, entre otros.</li>
            <li>Nuestra reparación tiene tres meses de garantía a partir de la fecha de realización del servicio.</li>
            <li>Presupuesto válido hasta 30 días a partir de la fecha de emisión.</li>
        </ul>
        ` : `
        <ul>
            <li>Se debe cancelar 50% al inicio del servicio y 50% al término de este.</li>
            <li>No se realiza terminaciones de piso en cemento, cerámica, madera, entre otros.</li>
            <li>No se retiran los escombros.</li>
            <li>Una vez terminada la reparación, se hará revisión del medidor para determinar si queda otra filtración.</li>
            <li>Garantía de tres meses por reparación realizada a partir de la fecha en que se realizó dicho trabajo.</li>
            <li>Presupuesto valido solo por 30 días a contar de la fecha de emisión.</li>
        </ul>
        `}
    </div>

    <div class="footer">
        <p>Presupuesto generado el ${formatDate(new Date().toISOString())}</p>
        <p>${companyConfig.name} - ${companyConfig.service}</p>
    </div>
</body>
</html>
    `
  }

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

  const handleExportPDF = async () => {
    setIsGenerating(true)
    try {
      // Usar el nuevo generador de PDF mejorado
      const { downloadQuotePDF } = await import('@/components/pdf-generator')
      
      // Generar y descargar PDF
      downloadQuotePDF(quote, companyConfig)
      
      toast({
        title: "PDF generado",
        description: "El presupuesto se ha descargado correctamente",
      })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header con logo y información de la empresa */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {companyConfig.logoComponent}
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>{companyConfig.service}</p>
                <p>RUT: {companyConfig.rut}</p>
                <p>{companyConfig.address}</p>
                <p>{companyConfig.email}</p>
                <p>Fono: {companyConfig.phone}</p>
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
        {onView && (
          <Button variant="outline" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </Button>
        )}
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Editar
          </Button>
        )}
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button onClick={handleExportPDF} disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generando...' : 'Descargar PDF'}
        </Button>
      </div>
    </div>
  )
}
