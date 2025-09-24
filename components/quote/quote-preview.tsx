'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CompanyLogo from '@/components/ui/company-logo'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Check, Download, Edit, Printer, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  materials?: string
  exposedArea?: string
}

interface QuotePreviewProps {
  data: {
    clientName: string
    clientId: string
    clientAddress?: string
    clientEmail?: string
    clientPhone?: string
    clientRegion?: string
    clientCommune?: string
    companyId: string
    validUntil: string
    taxRate: number
    discount: number
    notes: string
    items: QuoteItem[]
    technician: string
    diagnosis: string
    serviceType: string
    warranty?: string
  }
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
  onConfirm: () => void
  onCancel: () => void
  onEdit: () => void
}

export default function QuotePreview({ data, client, company, onConfirm, onCancel, onEdit }: QuotePreviewProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Debug logging

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada'

    try {
      // Handle both ISO date strings and local date strings
      // If it's in YYYY-MM-DD format, parse it as local date to avoid timezone issues
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number)
        if (!year || !month || !day) return dateString
        const date = new Date(year, month - 1, day) // month is 0-indexed

        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } else {
        const date = new Date(dateString)

        // Check if the date is valid
        if (isNaN(date.getTime())) {

          return 'Fecha inválida'
        }

        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }
    } catch (error) {

      return 'Fecha inválida'
    }
  }

  // Debug logging for date
  console.log('Valid until date:', new Date(data.validUntil).toISOString().split('T')[0])
  console.log('Valid until timestamp:', new Date(data.validUntil).getTime())

  const getCompanyConfig = (company: any) => {

    // Si tenemos una empresa válida, usar sus datos directamente
    if (company && company.name) {

      // Función para obtener el logo correcto basado en el nombre de la empresa
      const getCorrectLogo = (companyName: string) => {
        const name = companyName.toUpperCase()
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        if (name.includes('AMESTICA')) return `${baseUrl}/amestica.png`
        if (name.includes('MULTIFUGAS')) return `${baseUrl}/multifugas.png`
        if (name.includes('SERVIFUGAS')) return `${baseUrl}/servifugas.png`
        return `${baseUrl}/amestica.png` // fallback
      }

      return {
        name: company.name,
        displayName: company.displayName || company.name,
        service: company.service || 'Servicio de detección y reparación de filtraciones de agua potable',
        rut: company.rut || '',
        address: company.address || '',
        email: company.email || '',
        phone: company.phone || '',
        logo: getCorrectLogo(company.name),
        colors: {
          primary: company.primaryColor || '#1e40af',
          secondary: company.secondaryColor || '#3b82f6',
          accent: company.accentColor || '#f97316'
        }
      }
    }

    // Fallback solo si no hay empresa

    return {
      name: 'AMESTICA LIMITADA',
      displayName: 'AMESTICA LIMITADA',
      service: 'Servicio de detección y reparación de filtraciones de agua potable',
      rut: '76.508.960-3',
      address: 'Hamburgo 1398, Ñuñoa.',
      email: 'amesticaltda@gmail.com',
      phone: '222660040',
      logo: '/amestica.png',
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#f97316'
      }
    }
  }

  const companyConfig = getCompanyConfig(company)

  // Obtener el logo correcto
  const correctLogo = companyConfig.logo

  // Debug: Log para verificar la configuración de la empresa

  // Calcular totales
  const subtotal = data.items.reduce((sum, item) => {
    const quantity = item.quantity || 0
    const unitPrice = item.unitPrice || 0
    return sum + (quantity * unitPrice)
  }, 0)
  const discount = data.discount || 0
  const subtotalAfterDiscount = subtotal - discount
  const tax = subtotalAfterDiscount * (data.taxRate / 100)
  const total = subtotalAfterDiscount + tax

  const handlePrint = () => {
    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const htmlContent = generatePrintHTML()
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Esperar un momento para que se cargue el contenido
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      // Usar el nuevo generador de PDF mejorado
      const { downloadQuotePDF } = await import('@/components/pdf-generator')

      // Preparar datos para el PDF
      const quoteData = {
        quoteNumber: `COT-${Date.now()}`,
        client: client,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        taxRate: data.taxRate,
        notes: data.notes,
        items: data.items,
        validUntil: data.validUntil
      }

      // Generar y descargar PDF
      downloadQuotePDF(quoteData, companyConfig)

      toast({
        title: "Éxito",
        description: "PDF descargado correctamente.",
      })
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al generar el PDF. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateQuote = async () => {
    setIsCreating(true)
    try {
      // Llamar a la función onConfirm que viene del componente padre
      await onConfirm()

      toast({
        title: "Éxito",
        description: "Presupuesto creado correctamente.",
      })
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al crear el presupuesto. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const generatePrintHTML = () => {

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto - ${companyConfig.name}</title>
                                      <style>
                         @media print {
                 @page {
                     margin: 0.5in;
                     size: A4;
                 }
                 body { 
                     margin: 0; 
                     padding: 12px;
                     font-size: 16px;
                     line-height: 1.5;
                     min-height: 100vh;
                     width: 100%;
                     box-sizing: border-box;
                 }
                 .no-print { display: none !important; }
                 .header { margin-bottom: 20px; }
                 .section { margin-bottom: 16px; }
                 .section-content { padding: 16px; }
                 .company-logo { width: 200px; height: 160px; }
                 .company-name { font-size: 24px; margin-bottom: 6px; }
                 .company-service { font-size: 14px; margin-bottom: 6px; }
                 .company-details { font-size: 13px; }
                 .quote-title { font-size: 28px; margin-bottom: 6px; }
                 .separator { margin-bottom: 10px; }
                 .info-row { font-size: 14px; margin-bottom: 6px; }
                 .info-label { min-width: 80px; }
                 .services-table th,
                 .services-table td { 
                     padding: 8px 10px; 
                     font-size: 13px;
                 }
                 .totals { margin-top: 16px; }
                 .totals-content { width: 220px; }
                 .total-row { 
                     font-size: 14px; 
                     margin-bottom: 8px; 
                 }
                 .total-final { font-size: 16px; }
                 .notes-section,
                 .conditions-section { 
                     padding: 16px; 
                     font-size: 13px;
                 }
                 .notes-title,
                 .conditions-title { 
                     font-size: 15px; 
                     margin-bottom: 8px; 
                 }
                 .conditions-list { font-size: 13px; }
                 .conditions-list li { margin-bottom: 6px; }
             }
             
             /* Estilos específicos para PDF */
             body {
               font-family: Arial, sans-serif;
               line-height: 1.5;
               color: #333;
               width: 210mm;
               height: 297mm;
               margin: 0 auto;
               padding: 20px;
               font-size: 16px;
               box-sizing: border-box;
               max-width: 210mm;
               background: white;
               position: relative;
               left: 0;
               top: 0;
               transform: none;
               overflow: hidden;
               -webkit-print-color-adjust: exact;
               color-adjust: exact;
             }
            
                         body {
               font-family: Arial, sans-serif;
               line-height: 1.5;
               color: #333;
               width: 210mm;
               height: 297mm;
               margin: 0 auto;
               padding: 20px;
               font-size: 16px;
               box-sizing: border-box;
               max-width: 210mm;
               background: white;
               position: relative;
               left: 0;
               top: 0;
               transform: none;
           }
           .main-container {
               width: 100%;
               height: 100%;
               position: relative;
               left: 0;
               top: 0;
               transform: none;
               overflow: hidden;
               box-sizing: border-box;
           }
                     .header {
                margin-bottom: 25px;
                position: relative;
                left: 0;
                top: 0;
            }
           .company-section {
               display: flex;
               align-items: flex-start;
               gap: 20px;
               margin-bottom: 15px;
           }
                     .company-logo {
               width: 250px;
               height: 200px;
               object-fit: contain;
               flex-shrink: 0;
               image-rendering: -webkit-optimize-contrast;
               display: block;
               image-rendering: crisp-edges;
           }
           .company-info {
               flex: 1;
           }
           .company-name {
               font-size: 22px;
               font-weight: bold;
               color: ${companyConfig.colors.primary};
               margin-bottom: 8px;
               line-height: 1.2;
           }
           .company-service {
               font-size: 14px;
               color: #666;
               margin-bottom: 8px;
           }
           .company-details {
               font-size: 13px;
               color: #666;
               line-height: 1.4;
           }
           .quote-title {
               font-size: 26px;
               font-weight: bold;
               color: ${companyConfig.colors.primary};
               margin-bottom: 8px;
           }
         .quote-badge {
             display: inline-block;
             background-color: #f3f4f6;
             color: #374151;
             padding: 3px 6px;
             border-radius: 3px;
             font-size: 10px;
             margin-bottom: 12px;
         }
          .separator {
              border-bottom: 2px solid ${companyConfig.colors.primary};
              margin-bottom: 8px;
          }
                     .section {
                margin-bottom: 15px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
                left: 0;
                top: 0;
            }
           .section-content {
               padding: 15px;
           }
          .client-info {
              display: flex;
              flex-direction: column;
              gap: 8px;
          }
          .info-row {
               display: flex;
               font-size: 13px;
               margin-bottom: 6px;
           }
          .info-label {
              font-weight: 500;
              color: #6b7280;
              min-width: 90px;
          }
          .info-value {
              color: #333;
              margin-left: 8px;
          }
          .services-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              table-layout: fixed;
          }
                     .services-table th,
           .services-table td {
               border: 1px solid #d1d5db;
               padding: 8px;
               font-size: 13px;
               word-wrap: break-word;
               overflow-wrap: break-word;
           }
           .services-table th {
               background-color: #f9fafb;
               font-weight: 600;
               text-align: left;
               font-size: 14px;
           }
          .services-table th:first-child,
          .services-table td:first-child {
              text-align: center;
          }
          .services-table th:last-child,
          .services-table td:last-child,
          .services-table th:nth-last-child(2),
          .services-table td:nth-last-child(2) {
              text-align: right;
          }
          .totals {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
          }
          .totals-content {
              width: 250px;
          }
                     .total-row {
               display: flex;
               justify-content: space-between;
               font-size: 15px;
               margin-bottom: 10px;
           }
           .total-separator {
               border-top: 1px solid #e5e7eb;
               margin: 18px 0;
           }
           .total-final {
               font-size: 18px;
               font-weight: bold;
               color: #059669;
           }
          .notes-section {
              background-color: #f9fafb;
              padding: 12px;
              border-radius: 6px;
          }
                     .notes-title {
               font-weight: 600;
               color: #374151;
               margin-bottom: 10px;
               font-size: 15px;
           }
           .conditions-section {
               background-color: #fef3c7;
               padding: 16px;
               border-left: 4px solid #f59e0b;
               border-radius: 6px;
           }
           .conditions-title {
               font-weight: 500;
               color: #92400e;
               margin-bottom: 8px;
               font-size: 15px;
           }
           .conditions-list {
               color: #92400e;
               font-size: 13px;
               line-height: 1.5;
           }
          .conditions-list li {
              margin-bottom: 4px;
          }
     </style>
</head>
 <body>
     <div class="main-container">
         <div class="header">
                 <div class="company-section">
            <img src="${companyConfig.logo}" alt="${companyConfig.name}" class="company-logo">
             <div class="company-info">
                 <div class="company-name">${companyConfig.displayName}</div>
                 <div class="company-service">${companyConfig.service}</div>
                 <div class="company-details">
                     RUT: ${companyConfig.rut}<br>
                     ${companyConfig.address}<br>
                     ${companyConfig.email}<br>
                     Fono: ${companyConfig.phone}
                 </div>
             </div>
         </div>
        
                 <div class="quote-title">COTIZACIÓN</div>
         <div class="separator"></div>
    </div>

    <div class="section">
        <div class="section-content">
            <div class="client-info">
                <div class="info-row">
                    <span class="info-label">Señor (a):</span>
                    <span class="info-value">${client.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dirección:</span>
                    <span class="info-value">${client.address || 'No especificada'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">${formatDate(data.validUntil)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contacto:</span>
                    <span class="info-value">${client.phone || 'No especificado'}</span>
                </div>
                ${client.email ? `
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${client.email}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Técnico:</span>
                    <span class="info-value">${data.technician || 'No asignado'}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-content">
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Cantidad</th>
                        <th>Detalle</th>
                        <th>Precio U.</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
      return `
                            <tr>
                                <td>${item.quantity || 0}</td>
                                <td>${item.description || ''}</td>
                                <td>${formatCurrency(item.unitPrice || 0)}</td>
                                <td>${formatCurrency(itemTotal)}</td>
                            </tr>
                        `
    }).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="totals-content">
                    <div class="total-row">
                        <span>Neto:</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    ${discount > 0 ? `
                    <div class="total-row">
                        <span>Descuento:</span>
                        <span>-${formatCurrency(discount)}</span>
                    </div>
                    ` : ''}
                    <div class="total-row">
                        <span>IVA (${data.taxRate}%):</span>
                        <span>${formatCurrency(tax)}</span>
                    </div>
                    <div class="total-separator"></div>
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <span>${formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    ${data.notes ? `
    <div class="section">
        <div class="section-content">
            <div class="notes-section">
                <div class="notes-title">Observaciones y Condiciones</div>
                <div>${data.notes}</div>
            </div>
        </div>
    </div>
    ` : ''}

    ${data.warranty && data.warranty.trim() !== '' ? `
    <div class="section">
        <div class="section-content">
            <div class="conditions-section">
                <div class="conditions-title">Garantía y Condiciones del Servicio:</div>
                <div class="conditions-list">
                    ${data.warranty.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    </div>
    ` : ''}
     </div>
 </body>
</html>
    `
  }

  return (
    <div ref={contentRef} className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header con logo y información de la empresa */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Logo a la izquierda */}
            <CompanyLogo
              logo={correctLogo}
              companyName={companyConfig.name}
              size="xxl"
              className="flex-shrink-0"
            />

            {/* Información de la empresa a la derecha */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-600">
                {companyConfig.displayName}
              </h1>
              <p className="text-sm text-gray-600 mb-2">{companyConfig.service}</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>RUT: {companyConfig.rut}</p>
                <p>{companyConfig.address}</p>
                <p>{companyConfig.email}</p>
                <p>Fono: {companyConfig.phone}</p>
              </div>
            </div>
          </div>

          {/* Título COTIZACIÓN */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-blue-600">
              COTIZACIÓN
            </h2>
          </div>

          {/* Línea separadora debajo del título */}
          <div className="mt-2 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>

      {/* Información del cliente */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Señor (a):</span>
              <span className="ml-2">{client.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Dirección:</span>
              <span className="ml-2">{client.address || 'No especificada'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Fecha:</span>
              <span className="ml-2">{formatDate(data.validUntil)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Contacto:</span>
              <span className="ml-2">{client.phone || 'No especificado'}</span>
            </div>
            {client.email && (
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2">{client.email}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-600">Técnico:</span>
              <span className="ml-2">{data.technician || 'No asignado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Servicios */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-center font-medium text-sm">Cantidad</th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-medium text-sm">Detalle</th>
                  <th className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">Precio U.</th>
                  <th className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => {
                  const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 text-center text-sm">{item.quantity || 0}</td>
                      <td className="border border-gray-200 px-3 py-2 text-sm">{item.description || ''}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-sm">{formatCurrency(item.unitPrice || 0)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">{formatCurrency(itemTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-base">
                <span className="font-medium">Neto:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-base">
                  <span className="font-medium">Descuento:</span>
                  <span className="font-semibold text-orange-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base">
                <span className="font-medium">IVA ({data.taxRate}%):</span>
                <span className="font-semibold text-red-600">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {data.notes && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Observaciones y Condiciones</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{data.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Garantía y Condiciones - Mostrar si hay contenido en el campo de garantía */}
      {data.warranty && data.warranty.trim() !== '' && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">
                Garantía y Condiciones del Servicio:
              </h4>
              <div className="text-yellow-700 text-sm whitespace-pre-wrap">
                {data.warranty}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex flex-wrap justify-center gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onEdit} size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline" onClick={handlePrint} size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} size="sm">
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generando...' : 'PDF'}
        </Button>
        <Button
          onClick={handleCreateQuote}
          disabled={isCreating}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Check className="mr-2 h-4 w-4" />
          {isCreating ? 'Creando...' : 'Crear'}
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
