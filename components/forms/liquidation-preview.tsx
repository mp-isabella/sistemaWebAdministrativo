'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Save, 
  Calculator,
  User,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Check,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface LiquidationPreviewProps {
  data: any
  technician: any
  company: any
  onConfirm: () => void
  onCancel: () => void
  onEdit: () => void
}

export default function LiquidationPreview({ 
  data, 
  technician, 
  company, 
  onConfirm, 
  onCancel, 
  onEdit 
}: LiquidationPreviewProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
        service: 'Servicio de detección y reparación de filtraciones de agua potable',
        rut: '78.135.216-0',
        address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
        email: 'servifugas@gmail.com',
        phone: '+569 78868002',
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

  const companyConfig = getCompanyConfig(company?.type || 'AMESTICA')

  const calculateTotals = () => {
    const totalEarnings = data.items
      ?.filter((item: any) => item.type === 'EARNINGS')
      ?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
    
    const totalDeductions = data.items
      ?.filter((item: any) => item.type !== 'EARNINGS')
      ?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
    
    const totalAdvances = data.advances?.reduce((sum: number, advance: any) => sum + (advance.amount || 0), 0) || 0
    
    const netSalary = (data.baseSalary + totalEarnings - totalDeductions - totalAdvances)

    return {
      totalEarnings,
      totalDeductions,
      totalAdvances,
      netSalary
    }
  }

  const totals = calculateTotals()

  const handlePrint = () => {
    if (contentRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const htmlContent = generatePrintHTML()
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      // Usar el nuevo generador de PDF mejorado
      const { downloadLiquidationPDF } = await import('@/components/pdf-generator')
      
      // Configuración de la empresa
      const companyConfig = {
        name: company?.name || 'Empresa',
        service: 'Servicios de detección y reparación de filtraciones',
        rut: company?.rut || 'N/A',
        address: company?.address || 'N/A',
        email: company?.email || 'N/A',
        phone: company?.phone || 'N/A'
      }
      
      // Preparar datos para el PDF
      const liquidationData = {
        technician: technician,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalEarnings: totals.totalEarnings,
        totalDeductions: totals.totalDeductions,
        totalAdvances: totals.totalAdvances,
        netAmount: totals.netSalary,
        items: data.items
      }
      
      // Generar y descargar PDF
      downloadLiquidationPDF(liquidationData, companyConfig)
      
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

  const handleCreateLiquidation = async () => {
    setIsCreating(true)
    try {
      // Llamar a la función onConfirm que viene del componente padre
      await onConfirm()
      
      // No mostrar toast aquí porque el componente padre ya lo maneja
      // El toast se mostrará desde la página que usa el formulario
    } catch (error) {
      console.error('Error creating liquidation:', error)
      toast({
        title: "Error",
        description: "Error al crear la liquidación. Intenta nuevamente.",
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
    <title>Liquidación - ${companyConfig.name}</title>
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
            .liquidation-title { font-size: 28px; margin-bottom: 6px; }
            .separator { margin-bottom: 10px; }
            .info-row { font-size: 14px; margin-bottom: 6px; }
            .info-label { min-width: 80px; }
            .items-table th,
            .items-table td { 
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
            .notes-section { 
                padding: 16px; 
                font-size: 13px;
            }
            .notes-title { 
                font-size: 15px; 
                margin-bottom: 8px; 
            }
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
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
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
        
        .liquidation-title {
            font-size: 26px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            text-align: center;
        }
        
        .period-info {
            font-size: 16px;
            color: #666;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-section {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid ${companyConfig.colors.primary};
        }
        
        .info-section h3 {
            margin: 0 0 12px 0;
            color: ${companyConfig.colors.primary};
            font-size: 16px;
            font-weight: bold;
        }
        
        .info-row {
            margin-bottom: 6px;
            font-size: 14px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            min-width: 80px;
            display: inline-block;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 20px 0 12px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 13px;
        }
        
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #333;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-green {
            color: #059669;
        }
        
        .text-red {
            color: #dc2626;
        }
        
        .text-orange {
            color: #ea580c;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .badge-earnings {
            background-color: #dcfce7;
            color: #059669;
        }
        
        .badge-deduction {
            background-color: #fee2e2;
            color: #dc2626;
        }
        
        .badge-material {
            background-color: #fef3c7;
            color: #d97706;
        }
        
        .badge-fuel {
            background-color: #fce7f3;
            color: #be185d;
        }
        
        .badge-loan {
            background-color: #f3e8ff;
            color: #7c3aed;
        }
        
        .badge-advance {
            background-color: #fff7ed;
            color: #ea580c;
        }
        
        .summary-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 6px 0;
            font-size: 14px;
        }
        
        .total-section {
            border-left: 4px solid #059669;
            padding-left: 16px;
            text-align: center;
        }
        
        .total-title {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 8px;
        }
        
        .total-amount {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
        }
        
        .notes-section {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 6px;
            margin: 16px 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
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
                        <div><strong>RUT:</strong> ${companyConfig.rut}</div>
                        <div><strong>Dirección:</strong> ${companyConfig.address}</div>
                        <div><strong>Email:</strong> ${companyConfig.email}</div>
                        <div><strong>Teléfono:</strong> ${companyConfig.phone}</div>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <div class="liquidation-title">LIQUIDACIÓN DE SUELDO</div>
                <div class="period-info">Período: ${formatDate(data.periodStart)} - ${formatDate(data.periodEnd)}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-section">
                <h3>Información del Técnico</h3>
                <div class="info-row">
                    <span class="info-label">Nombre:</span> ${technician?.name || 'No especificado'}
                </div>
                <div class="info-row">
                    <span class="info-label">RUT:</span> ${technician?.rut || 'No especificado'}
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span> ${technician?.email || 'No especificado'}
                </div>
                <div class="info-row">
                    <span class="info-label">Teléfono:</span> ${technician?.phone || 'No especificado'}
                </div>
            </div>
            
            <div class="info-section">
                <h3>Detalles del Período</h3>
                <div class="info-row">
                    <span class="info-label">Inicio:</span> ${formatDate(data.periodStart)}
                </div>
                <div class="info-row">
                    <span class="info-label">Fin:</span> ${formatDate(data.periodEnd)}
                </div>
                <div class="info-row">
                    <span class="info-label">Sueldo Base:</span> ${formatCurrency(data.baseSalary)}
                </div>
            </div>
        </div>

        ${data.items && data.items.length > 0 ? `
        <div>
            <div class="section-title">Items de Liquidación</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th class="text-center">Tipo</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-right">Precio Unit.</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map((item: any, index: number) => `
                        <tr>
                            <td>${item.description}</td>
                            <td class="text-center">
                                <span class="badge badge-${item.type.toLowerCase()}">
                                    ${item.type === 'EARNINGS' ? 'Ganancia' : 
                                      item.type === 'DEDUCTION' ? 'Deducción' :
                                      item.type === 'MATERIAL' ? 'Material' :
                                      item.type === 'FUEL' ? 'Combustible' :
                                      item.type === 'LOAN' ? 'Préstamo' : 'Anticipo'}
                                </span>
                            </td>
                            <td class="text-center">${item.quantity || '-'}</td>
                            <td class="text-right">
                                ${item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
                            </td>
                            <td class="text-right font-semibold">
                                ${formatCurrency(item.total)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.advances && data.advances.length > 0 ? `
        <div>
            <div class="section-title">Anticipos</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th class="text-right">Monto</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.advances.map((advance: any, index: number) => `
                        <tr>
                            <td>${formatDate(advance.date)}</td>
                            <td>${advance.description}</td>
                            <td class="text-right font-semibold text-red-600">
                                -${formatCurrency(advance.amount)}
                            </td>
                            <td>${advance.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="summary-section">
            <div class="section-title">Resumen de Liquidación</div>
            <div class="summary-grid">
                <div>
                    <div class="summary-item">
                        <span>Sueldo Base:</span>
                        <span><strong>${formatCurrency(data.baseSalary)}</strong></span>
                    </div>
                    <div class="summary-item">
                        <span>Total Ganancias:</span>
                        <span class="text-green"><strong>${formatCurrency(totals.totalEarnings)}</strong></span>
                    </div>
                    <div class="summary-item">
                        <span>Total Deducciones:</span>
                        <span class="text-red"><strong>${formatCurrency(totals.totalDeductions)}</strong></span>
                    </div>
                    <div class="summary-item">
                        <span>Total Anticipos:</span>
                        <span class="text-orange"><strong>-${formatCurrency(totals.totalAdvances)}</strong></span>
                    </div>
                </div>
                
                <div class="total-section">
                    <div class="total-title">TOTAL A PAGAR</div>
                    <div class="total-amount">${formatCurrency(totals.netSalary)}</div>
                </div>
            </div>
        </div>

        ${data.notes ? `
        <div class="notes-section">
            <div class="section-title">Notas</div>
            <p>${data.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString('es-CL')}</p>
            <p>Esta liquidación es un documento oficial de ${companyConfig.name}</p>
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
              <h1 className="text-2xl font-bold" style={{ color: companyConfig.colors.primary }}>
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
          
          {/* Título LIQUIDACIÓN */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold" style={{ color: companyConfig.colors.primary }}>
              LIQUIDACIÓN DE SUELDO
            </h2>
          </div>
          
          {/* Línea separadora debajo del título */}
          <div className="mt-2 border-b-2" style={{ borderColor: companyConfig.colors.primary }}></div>
        </CardContent>
      </Card>

      {/* Información del técnico y período */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Técnico:</span>
                <span className="ml-2">{technician?.name || 'No especificado'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">RUT:</span>
                <span className="ml-2">{technician?.rut || 'No especificado'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2">{technician?.email || 'No especificado'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Teléfono:</span>
                <span className="ml-2">{technician?.phone || 'No especificado'}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Período:</span>
                <span className="ml-2">{formatDate(data.periodStart)} - {formatDate(data.periodEnd)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Sueldo Base:</span>
                <span className="ml-2">{formatCurrency(data.baseSalary)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">IVA:</span>
                <span className="ml-2">{data.taxRate}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items de Liquidación */}
      {data.items && data.items.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Items de Liquidación</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-sm">Descripción</th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-medium text-sm">Tipo</th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-medium text-sm">Cantidad</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">Precio U.</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 text-sm">{item.description}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-sm">
                        <Badge variant={
                          item.type === 'EARNINGS' ? 'default' :
                          item.type === 'DEDUCTION' ? 'destructive' :
                          item.type === 'MATERIAL' ? 'secondary' :
                          item.type === 'FUEL' ? 'outline' :
                          item.type === 'LOAN' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {item.type === 'EARNINGS' ? 'Ganancia' : 
                           item.type === 'DEDUCTION' ? 'Deducción' :
                           item.type === 'MATERIAL' ? 'Material' :
                           item.type === 'FUEL' ? 'Combustible' :
                           item.type === 'LOAN' ? 'Préstamo' : 'Anticipo'}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-sm">{item.quantity || '-'}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-sm">
                        {item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anticipos */}
      {data.advances && data.advances.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Anticipos</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-sm">Fecha</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-sm">Descripción</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-medium text-sm">Monto</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-sm">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.advances.map((advance: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 text-sm">{formatDate(advance.date)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-sm">{advance.description}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-medium text-sm text-red-600">
                        -{formatCurrency(advance.amount)}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-sm">{advance.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Resumen de Liquidación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="font-medium">Sueldo Base:</span>
                <span className="font-semibold">{formatCurrency(data.baseSalary)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-medium">Total Ganancias:</span>
                <span className="font-semibold text-green-600">{formatCurrency(totals.totalEarnings)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-medium">Total Deducciones:</span>
                <span className="font-semibold text-red-600">{formatCurrency(totals.totalDeductions)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-medium">Total Anticipos:</span>
                <span className="font-semibold text-orange-600">-{formatCurrency(totals.totalAdvances)}</span>
              </div>
            </div>
            
            <div className="pl-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  TOTAL A PAGAR
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(totals.netSalary)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {data.notes && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{data.notes}</p>
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
          onClick={handleCreateLiquidation} 
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
