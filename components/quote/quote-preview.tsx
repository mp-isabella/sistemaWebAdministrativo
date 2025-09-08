'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Download, Printer, Eye, Check, X, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  console.log('QuotePreview rendered with:', { data, client, company })

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
      },
      MULTIFUGAS: {
        name: 'MULTIFUGAS',
        displayName: 'MULTIFUGAS SERVICIOS PROFESIONALES',
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        rut: '78.135.216-0',
        address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
        email: 'multifugas@gmail.com',
        phone: '+569 78868002',
        logo: '/multifugas.png',
        colors: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#f97316'
        }
      },
             SERVIFUGAS: {
         name: 'SERVIFUGAS SPA',
         displayName: 'SERVIFUGAS SPA',
         service: 'Servicio de detección de filtraciones en agua potable y reparación de cañerías',
         rut: '78.135.232-2',
         address: 'Lo Barnechea 1559.',
         email: 'Servifugas1@gmail.com',
         phone: '+569 92492720',
         logo: '/servifugas.png',
         colors: {
           primary: '#059669',
           secondary: '#10b981',
           accent: '#1e40af'
         }
       }
    }

    return configs[companyType as keyof typeof configs] || configs.AMESTICA
  }

  const companyConfig = getCompanyConfig(company.type)

  // Calcular totales
  const subtotal = data.items.reduce((sum, item) => {
    const quantity = item.quantity || 0
    const unitPrice = item.unitPrice || 0
    return sum + (quantity * unitPrice)
  }, 0)
  const tax = subtotal * (data.taxRate / 100)
  const total = subtotal + tax

  const getServiceTypeLabel = (type: string) => {
    const types = {
      deteccion_fugas: 'Detección de Fugas de Agua',
      destape_alcantarillado: 'Destape de Alcantarillado',
      videointrospeccion: 'Videoinspección de Ductos'
    }
    return types[type as keyof typeof types] || type
  }

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
      // Crear una ventana temporal para renderizar el contenido
      const printWindow = window.open('', '_blank', 'width=794,height=1123')
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión')
      }
      
      const htmlContent = generatePrintHTML()
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Esperar a que se cargue el contenido y las imágenes
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Asegurar que todas las imágenes estén cargadas
      const images = printWindow.document.querySelectorAll('img')
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise(resolve => {
          img.onload = resolve
          img.onerror = resolve
        })
      }))
      
      // Configurar el tamaño de la ventana para que coincida con A4
      printWindow.document.body.style.width = '210mm'
      printWindow.document.body.style.height = '297mm'
      printWindow.document.body.style.margin = '0'
      printWindow.document.body.style.padding = '0'
      printWindow.document.body.style.overflow = 'hidden'
      printWindow.document.body.style.position = 'relative'
      printWindow.document.body.style.left = '0'
      printWindow.document.body.style.top = '0'
      printWindow.document.body.style.transform = 'none'
      printWindow.document.body.style.backgroundColor = '#ffffff'
      
      // Asegurar que el contenedor principal mantenga su posición
      const mainContainer = printWindow.document.querySelector('.main-container') as HTMLElement
      if (mainContainer) {
        mainContainer.style.position = 'relative'
        mainContainer.style.left = '0'
        mainContainer.style.top = '0'
        mainContainer.style.transform = 'none'
        mainContainer.style.width = '100%'
        mainContainer.style.height = '100%'
      }
      
      // Forzar el reflow del documento
      printWindow.document.body.offsetHeight
      
      // Esperar un poco más para asegurar que todo esté estable
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Capturar el contenido como imagen con configuración optimizada para mejor calidad
      const canvas = await html2canvas(printWindow.document.body, {
        scale: 3, // Aumentar la escala para mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Crear PDF con tamaño A4 exacto
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // Ancho A4 en mm
      const imgHeight = 297 // Alto A4 en mm
      
      // Agregar la imagen al PDF con mejor calidad
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, imgWidth, imgHeight)
      
      // Descargar PDF
      pdf.save(`presupuesto-${client.name}-${formatDate(new Date().toISOString())}.pdf`)
      
      // Cerrar ventana temporal
      printWindow.close()
      
      toast({
        title: "Éxito",
        description: "PDF descargado correctamente.",
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
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
      console.error('Error creating quote:', error)
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
    const conditions = company.type === 'SERVIFUGAS' ? `
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
    ` : company.type === 'AMESTICA' ? `
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
    `

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
                 .company-logo { width: 120px; height: 120px; }
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
               width: 120px;
               height: 120px;
               object-fit: contain;
               flex-shrink: 0;
               image-rendering: -webkit-optimize-contrast;
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

    <div class="section">
        <div class="section-content">
            <div class="conditions-section">
                <div class="conditions-title">Condiciones específicas de ${companyConfig.name}:</div>
                <ul class="conditions-list">
                                         ${company.type === 'SERVIFUGAS' ? `
                         <li>El pago se realizará en dos partes: 50% al inicio del servicio y el 50% restante al finalizar la detección de la filtración</li>
                         <li>La cañería será dejada a la vista únicamente con la exposición mínima y necesaria</li>
                         <li>Una vez detectada la filtración, se entregará un presupuesto para su reparación, siempre y cuando esta sea técnicamente viable</li>
                         <li>Si la filtración se encuentra bajo un mueble o artefacto, será responsabilidad del cliente retirarlo para permitir el acceso a la cañería</li>
                         <li>No se realizan trabajos de terminación, tales como reposición de cerámicas, madera, u otros materiales</li>
                         <li>El margen de error en la detección es de aproximadamente 2 metros</li>
                         <li>Las reparaciones realizadas por nuestra empresa cuentan con una garantía de 3 meses</li>
                         <li>El presupuesto tendrá una validez de 30 días a partir de su fecha de emisión</li>
                     ` : company.type === 'AMESTICA' ? `
                         <li>Condiciones de pago 100% al inicio para poder coordinar el servicio y enviar al técnico.</li>
                         <li>No se realizan terminaciones, ya sea en cerámicas, madera, entre otros.</li>
                         <li>Nuestra reparación tiene tres meses de garantía a partir de la fecha de realización del servicio.</li>
                         <li>Presupuesto válido hasta 30 días a partir de la fecha de emisión.</li>
                     ` : `
                         <li>Se debe cancelar 50% al inicio del servicio y 50% al término de este.</li>
                         <li>No se realiza terminaciones de piso en cemento, cerámica, madera, entre otros.</li>
                         <li>No se retiran los escombros.</li>
                         <li>Una vez terminada la reparación, se hará revisión del medidor para determinar si queda otra filtración.</li>
                         <li>Garantía de tres meses por reparación realizada a partir de la fecha en que se realizó dicho trabajo.</li>
                         <li>Presupuesto valido solo por 30 días a contar de la fecha de emisión.</li>
                     `}
                </ul>
            </div>
        </div>
             </div>
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
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={companyConfig.logo}
                  alt={`Logo ${companyConfig.name}`}
                  fill
                  className="object-contain"
                />
              </div>
              
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

             {/* Condiciones generales */}
       <Card className="shadow-sm">
         <CardContent className="p-4">
           <div className="bg-yellow-50 p-4 rounded-lg">
             <h4 className="font-medium text-yellow-800 mb-2">
               Condiciones específicas de {companyConfig.name}:
             </h4>
                           {company.type === 'SERVIFUGAS' ? (
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>El pago se realizará en dos partes: 50% al inicio del servicio y el 50% restante al finalizar la detección de la filtración</li>
                  <li>La cañería será dejada a la vista únicamente con la exposición mínima y necesaria</li>
                  <li>Una vez detectada la filtración, se entregará un presupuesto para su reparación, siempre y cuando esta sea técnicamente viable</li>
                  <li>Si la filtración se encuentra bajo un mueble o artefacto, será responsabilidad del cliente retirarlo para permitir el acceso a la cañería</li>
                  <li>No se realizan trabajos de terminación, tales como reposición de cerámicas, madera, u otros materiales</li>
                  <li>El margen de error en la detección es de aproximadamente 2 metros</li>
                  <li>Las reparaciones realizadas por nuestra empresa cuentan con una garantía de 3 meses</li>
                  <li>El presupuesto tendrá una validez de 30 días a partir de su fecha de emisión</li>
                </ul>
              ) : company.type === 'AMESTICA' ? (
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>Condiciones de pago 100% al inicio para poder coordinar el servicio y enviar al técnico.</li>
                  <li>No se realizan terminaciones, ya sea en cerámicas, madera, entre otros.</li>
                  <li>Nuestra reparación tiene tres meses de garantía a partir de la fecha de realización del servicio.</li>
                  <li>Presupuesto válido hasta 30 días a partir de la fecha de emisión.</li>
                </ul>
              ) : (
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>Se debe cancelar 50% al inicio del servicio y 50% al término de este.</li>
                  <li>No se realiza terminaciones de piso en cemento, cerámica, madera, entre otros.</li>
                  <li>No se retiran los escombros.</li>
                  <li>Una vez terminada la reparación, se hará revisión del medidor para determinar si queda otra filtración.</li>
                  <li>Garantía de tres meses por reparación realizada a partir de la fecha en que se realizó dicho trabajo.</li>
                  <li>Presupuesto valido solo por 30 días a contar de la fecha de emisión.</li>
                </ul>
              )}
           </div>
         </CardContent>
       </Card>

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
