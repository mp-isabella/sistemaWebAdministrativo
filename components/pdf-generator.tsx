"use client"

import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface CashTransaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  category: string
  paymentMethod: string
  reference?: string
  date: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
}

interface CashSummary {
  total: number
  income: number
  expense: number
  balance: number
}

interface MonthlyReportData {
  month: string
  year: number
  summary: CashSummary
  transactions: CashTransaction[]
  companyName?: string
}

// Configuración mejorada para PDFs
export const PDF_CONFIG = {
  pageSize: 'A4',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  fonts: {
    title: { size: 20, style: 'bold' },
    subtitle: { size: 16, style: 'bold' },
    section: { size: 14, style: 'bold' },
    body: { size: 12, style: 'normal' },
    small: { size: 10, style: 'normal' }
  },
  colors: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#f97316',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    gray: '#6b7280'
  }
}

// Función mejorada para generar reportes de caja
export const generateMonthlyCashReport = (data: MonthlyReportData) => {
  const doc = new jsPDF('p', 'mm', PDF_CONFIG.pageSize)
  
  // Configuración inicial
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = PDF_CONFIG.margins.left
  let yPosition = PDF_CONFIG.margins.top

  // Título del reporte
  doc.setFontSize(PDF_CONFIG.fonts.title.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.title.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Reporte de Gestión de Caja", pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 15
  
  // Período
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Período: ${data.month} ${data.year}`, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 20

  // Información de la empresa
  if (data.companyName) {
    doc.setFontSize(PDF_CONFIG.fonts.body.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(`Empresa: ${data.companyName}`, margin, yPosition)
    yPosition += 10
  }

  // Fecha de generación
  const currentDate = new Date().toLocaleDateString('es-CL')
  doc.text(`Fecha de generación: ${currentDate}`, margin, yPosition)
  
  yPosition += 20

  // Resumen ejecutivo
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Resumen Ejecutivo", margin, yPosition)
  
  yPosition += 15

  // Tabla de resumen con mejor diseño
  const summaryData = [
    ["Concepto", "Monto"],
    ["Ingresos del Período", `$${data.summary.income.toLocaleString('es-CL')}`],
    ["Gastos del Período", `$${data.summary.expense.toLocaleString('es-CL')}`],
    ["Balance del Período", `$${data.summary.balance.toLocaleString('es-CL')}`],
    ["Total Transacciones", data.summary.total.toString()]
  ]

  doc.autoTable({
    startY: yPosition,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 64, 175], // Azul más oscuro
      textColor: 255,
      fontSize: PDF_CONFIG.fonts.body.size,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: PDF_CONFIG.fonts.body.size,
      textColor: PDF_CONFIG.colors.gray
    },
    styles: { 
      fontSize: PDF_CONFIG.fonts.body.size,
      cellPadding: 8
    },
    margin: { 
      left: margin, 
      right: margin 
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' }
    }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Detalle de transacciones
  if (data.transactions.length > 0) {
    doc.setFontSize(PDF_CONFIG.fonts.section.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
    doc.setTextColor(PDF_CONFIG.colors.primary)
    doc.text("Detalle de Transacciones", margin, yPosition)
    
    yPosition += 15

    // Preparar datos de transacciones para la tabla
    const transactionData = data.transactions.map(t => [
      t.date,
      t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
      t.description,
      t.category,
      `$${t.amount.toLocaleString('es-CL')}`,
      t.paymentMethod
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Fecha", "Tipo", "Descripción", "Categoría", "Monto", "Método de Pago"]],
      body: transactionData,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94], 
        textColor: 255,
        fontSize: PDF_CONFIG.fonts.small.size,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        textColor: PDF_CONFIG.colors.gray
      },
      styles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        cellPadding: 6
      },
      margin: { 
        left: margin, 
        right: margin 
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 50, halign: 'left' },
        3: { cellWidth: 25, halign: 'left' },
        4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 25, halign: 'center' }
      },
      didDrawPage: function (data) {
        // Agregar número de página
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(PDF_CONFIG.fonts.small.size)
        doc.setTextColor(PDF_CONFIG.colors.gray)
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        )
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 20
  }

  // Análisis por categorías
  const categoryAnalysis = analyzeTransactionsByCategory(data.transactions)
  
  if (Object.keys(categoryAnalysis).length > 0) {
    doc.setFontSize(PDF_CONFIG.fonts.section.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
    doc.setTextColor(PDF_CONFIG.colors.primary)
    doc.text("Análisis por Categorías", margin, yPosition)
    
    yPosition += 15

    const categoryData = Object.entries(categoryAnalysis).map(([category, amount]) => [
      category,
      `$${amount.toLocaleString('es-CL')}`
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Categoría", "Total"]],
      body: categoryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [46, 204, 113], 
        textColor: 255,
        fontSize: PDF_CONFIG.fonts.body.size,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: PDF_CONFIG.fonts.body.size,
        textColor: PDF_CONFIG.colors.gray
      },
      styles: { 
        fontSize: PDF_CONFIG.fonts.body.size,
        cellPadding: 8
      },
      margin: { 
        left: margin, 
        right: margin 
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
      }
    })
  }

  return doc
}

// Función para generar PDF de liquidaciones con mejor calidad
export const generateLiquidationPDF = (liquidationData: any, companyConfig: any) => {
  const doc = new jsPDF('p', 'mm', PDF_CONFIG.pageSize)
  
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = PDF_CONFIG.margins.left
  let yPosition = PDF_CONFIG.margins.top

  // Header con logo y información de la empresa
  doc.setFontSize(PDF_CONFIG.fonts.title.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.title.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text(companyConfig.name, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.small.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(companyConfig.service, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 15
  
  // Información de la empresa
  doc.text(`RUT: ${companyConfig.rut}`, margin, yPosition)
  yPosition += 6
  doc.text(`Dirección: ${companyConfig.address}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${companyConfig.email}`, margin, yPosition)
  yPosition += 6
  doc.text(`Teléfono: ${companyConfig.phone}`, margin, yPosition)
  
  yPosition += 20

  // Título del documento
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("LIQUIDACIÓN DE SERVICIOS", pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 20

  // Información del técnico
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Información del Técnico", margin, yPosition)
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Nombre: ${liquidationData.technician?.name || 'No especificado'}`, margin, yPosition)
  yPosition += 8
  doc.text(`Período: ${liquidationData.periodStart} - ${liquidationData.periodEnd}`, margin, yPosition)
  
  yPosition += 20

  // Resumen de liquidación
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Resumen de Liquidación", margin, yPosition)
  
  yPosition += 15

  const summaryData = [
    ["Concepto", "Monto"],
    ["Total Ganado", `$${liquidationData.totalEarnings?.toLocaleString('es-CL') || '0'}`],
    ["Total Descuentos", `$${liquidationData.totalDeductions?.toLocaleString('es-CL') || '0'}`],
    ["Total Anticipos", `$${liquidationData.totalAdvances?.toLocaleString('es-CL') || '0'}`],
    ["Monto Neto", `$${liquidationData.netAmount?.toLocaleString('es-CL') || '0'}`]
  ]

  doc.autoTable({
    startY: yPosition,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 64, 175],
      textColor: 255,
      fontSize: PDF_CONFIG.fonts.body.size,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: PDF_CONFIG.fonts.body.size,
      textColor: PDF_CONFIG.colors.gray
    },
    styles: { 
      fontSize: PDF_CONFIG.fonts.body.size,
      cellPadding: 8
    },
    margin: { 
      left: margin, 
      right: margin 
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
    }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Detalle de items si existen
  if (liquidationData.items && liquidationData.items.length > 0) {
    doc.setFontSize(PDF_CONFIG.fonts.section.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
    doc.setTextColor(PDF_CONFIG.colors.primary)
    doc.text("Detalle de Items", margin, yPosition)
    
    yPosition += 15

    const itemsData = liquidationData.items.map((item: any) => [
      item.description,
      item.type === 'EARNINGS' ? 'Ganancia' : 'Descuento',
      `$${item.total?.toLocaleString('es-CL') || '0'}`
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Descripción", "Tipo", "Monto"]],
      body: itemsData,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94], 
        textColor: 255,
        fontSize: PDF_CONFIG.fonts.small.size,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        textColor: PDF_CONFIG.colors.gray
      },
      styles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        cellPadding: 6
      },
      margin: { 
        left: margin, 
        right: margin 
      },
      columnStyles: {
        0: { cellWidth: 80, halign: 'left' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      }
    })
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fonts.small.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc
}

// Función para generar PDF de presupuestos con mejor calidad
export const generateQuotePDF = (quoteData: any, companyConfig: any) => {
  const doc = new jsPDF('p', 'mm', PDF_CONFIG.pageSize)
  
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = PDF_CONFIG.margins.left
  let yPosition = PDF_CONFIG.margins.top

  // Header con logo y información de la empresa
  doc.setFontSize(PDF_CONFIG.fonts.title.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.title.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text(companyConfig.name, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.small.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(companyConfig.service, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 15
  
  // Información de la empresa
  doc.text(`RUT: ${companyConfig.rut}`, margin, yPosition)
  yPosition += 6
  doc.text(`Dirección: ${companyConfig.address}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${companyConfig.email}`, margin, yPosition)
  yPosition += 6
  doc.text(`Teléfono: ${companyConfig.phone}`, margin, yPosition)
  
  yPosition += 20

  // Título del documento
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("PRESUPUESTO", pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 20

  // Información del cliente
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Información del Cliente", margin, yPosition)
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Cliente: ${quoteData.client?.name || 'No especificado'}`, margin, yPosition)
  yPosition += 8
  if (quoteData.client?.address) {
    doc.text(`Dirección: ${quoteData.client.address}`, margin, yPosition)
    yPosition += 8
  }
  if (quoteData.client?.phone) {
    doc.text(`Teléfono: ${quoteData.client.phone}`, margin, yPosition)
    yPosition += 8
  }
  
  yPosition += 15

  // Detalle de servicios
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Detalle de Servicios", margin, yPosition)
  
  yPosition += 15

  if (quoteData.items && quoteData.items.length > 0) {
    const itemsData = quoteData.items.map((item: any) => [
      item.quantity || 1,
      item.description,
      `$${item.unitPrice?.toLocaleString('es-CL') || '0'}`,
      `$${item.total?.toLocaleString('es-CL') || '0'}`
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Cantidad", "Descripción", "Precio U.", "Total"]],
      body: itemsData,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: PDF_CONFIG.fonts.small.size,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        textColor: PDF_CONFIG.colors.gray
      },
      styles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        cellPadding: 6
      },
      margin: { 
        left: margin, 
        right: margin 
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 20
  }

  // Totales
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Totales", margin, yPosition)
  
  yPosition += 15
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Subtotal: $${quoteData.subtotal?.toLocaleString('es-CL') || '0'}`, pageWidth - margin - 60, yPosition)
  yPosition += 8
  doc.text(`IVA (${quoteData.taxRate || 19}%): $${quoteData.tax?.toLocaleString('es-CL') || '0'}`, pageWidth - margin - 60, yPosition)
  yPosition += 8
  
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.success)
  doc.text(`Total: $${quoteData.total?.toLocaleString('es-CL') || '0'}`, pageWidth - margin - 60, yPosition)

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fonts.small.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc
}

// Función para generar PDF de facturas con mejor calidad
export const generateInvoicePDF = (invoiceData: any, companyConfig: any) => {
  const doc = new jsPDF('p', 'mm', PDF_CONFIG.pageSize)
  
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = PDF_CONFIG.margins.left
  let yPosition = PDF_CONFIG.margins.top

  // Header con logo y información de la empresa
  doc.setFontSize(PDF_CONFIG.fonts.title.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.title.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text(companyConfig.name, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.small.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(companyConfig.service, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 15
  
  // Información de la empresa
  doc.text(`RUT: ${companyConfig.rut}`, margin, yPosition)
  yPosition += 6
  doc.text(`Dirección: ${companyConfig.address}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${companyConfig.email}`, margin, yPosition)
  yPosition += 6
  doc.text(`Teléfono: ${companyConfig.phone}`, margin, yPosition)
  
  yPosition += 20

  // Título del documento
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("FACTURA", pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 20

  // Información de la factura
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Información de la Factura", margin, yPosition)
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Número: ${invoiceData.invoiceNumber || 'N/A'}`, margin, yPosition)
  yPosition += 8
  doc.text(`Fecha: ${invoiceData.date ? new Date(invoiceData.date).toLocaleDateString('es-CL') : 'N/A'}`, margin, yPosition)
  yPosition += 8
  doc.text(`Estado: ${invoiceData.status || 'N/A'}`, margin, yPosition)
  
  yPosition += 15

  // Información del cliente
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Información del Cliente", margin, yPosition)
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Cliente: ${invoiceData.client?.name || 'No especificado'}`, margin, yPosition)
  yPosition += 8
  if (invoiceData.client?.address) {
    doc.text(`Dirección: ${invoiceData.client.address}`, margin, yPosition)
    yPosition += 8
  }
  if (invoiceData.client?.phone) {
    doc.text(`Teléfono: ${invoiceData.client.phone}`, margin, yPosition)
    yPosition += 8
  }
  
  yPosition += 15

  // Detalle de servicios
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Detalle de Servicios", margin, yPosition)
  
  yPosition += 15

  if (invoiceData.items && invoiceData.items.length > 0) {
    const itemsData = invoiceData.items.map((item: any) => [
      item.quantity || 1,
      item.description,
      `$${item.unitPrice?.toLocaleString('es-CL') || '0'}`,
      `$${item.total?.toLocaleString('es-CL') || '0'}`
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Cantidad", "Descripción", "Precio U.", "Total"]],
      body: itemsData,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: PDF_CONFIG.fonts.small.size,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        textColor: PDF_CONFIG.colors.gray
      },
      styles: { 
        fontSize: PDF_CONFIG.fonts.small.size,
        cellPadding: 6
      },
      margin: { 
        left: margin, 
        right: margin 
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 20
  }

  // Totales
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Totales", margin, yPosition)
  
  yPosition += 15
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Subtotal: $${invoiceData.subtotal?.toLocaleString('es-CL') || '0'}`, pageWidth - margin - 60, yPosition)
  yPosition += 8
  doc.text(`IVA (${invoiceData.taxRate || 19}%): $${invoiceData.tax?.toLocaleString('es-CL') || '0'}`, pageWidth - margin - 60, yPosition)
  yPosition += 8
  
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.success)
  doc.text(`Total: $${invoiceData.total?.toLocaleString('es-CL') || '0'}`, pageWidth - margin - 60, yPosition)

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fonts.small.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc
}

// Función para generar PDF de órdenes de trabajo
export const generateWorkOrderPDF = (workOrderData: any, companyConfig: any) => {
  const doc = new jsPDF('p', 'mm', PDF_CONFIG.pageSize)
  
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = PDF_CONFIG.margins.left
  let yPosition = PDF_CONFIG.margins.top

  // Header con logo y información de la empresa
  doc.setFontSize(PDF_CONFIG.fonts.title.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.title.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text(companyConfig.name, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.small.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(companyConfig.service, pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 15
  
  // Información de la empresa
  doc.text(`RUT: ${companyConfig.rut}`, margin, yPosition)
  yPosition += 6
  doc.text(`Dirección: ${companyConfig.address}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${companyConfig.email}`, margin, yPosition)
  yPosition += 6
  doc.text(`Teléfono: ${companyConfig.phone}`, margin, yPosition)
  
  yPosition += 20

  // Título del documento
  doc.setFontSize(PDF_CONFIG.fonts.subtitle.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.subtitle.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("ORDEN DE TRABAJO", pageWidth / 2, yPosition, { align: "center" })
  
  yPosition += 20

  // Información de la orden
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Información de la Orden", margin, yPosition)
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Número: ${workOrderData.orderNumber || 'N/A'}`, margin, yPosition)
  yPosition += 8
  doc.text(`Fecha: ${workOrderData.date ? new Date(workOrderData.date).toLocaleDateString('es-CL') : 'N/A'}`, margin, yPosition)
  yPosition += 8
  doc.text(`Estado: ${workOrderData.status || 'N/A'}`, margin, yPosition)
  yPosition += 8
  doc.text(`Prioridad: ${workOrderData.priority || 'N/A'}`, margin, yPosition)
  
  yPosition += 15

  // Información del cliente
  doc.setFontSize(PDF_CONFIG.fonts.section.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
  doc.setTextColor(PDF_CONFIG.colors.primary)
  doc.text("Información del Cliente", margin, yPosition)
  
  yPosition += 10
  
  doc.setFontSize(PDF_CONFIG.fonts.body.size)
  doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
  doc.setTextColor(PDF_CONFIG.colors.gray)
  doc.text(`Cliente: ${workOrderData.client?.name || 'No especificado'}`, margin, yPosition)
  yPosition += 8
  if (workOrderData.client?.address) {
    doc.text(`Dirección: ${workOrderData.client.address}`, margin, yPosition)
    yPosition += 8
  }
  if (workOrderData.client?.phone) {
    doc.text(`Teléfono: ${workOrderData.client.phone}`, margin, yPosition)
    yPosition += 8
  }
  
  yPosition += 15

  // Descripción del trabajo
  if (workOrderData.description) {
    doc.setFontSize(PDF_CONFIG.fonts.section.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
    doc.setTextColor(PDF_CONFIG.colors.primary)
    doc.text("Descripción del Trabajo", margin, yPosition)
    
    yPosition += 10
    
    doc.setFontSize(PDF_CONFIG.fonts.body.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    
    // Dividir la descripción en líneas si es muy larga
    const maxWidth = pageWidth - (2 * margin)
    const lines = doc.splitTextToSize(workOrderData.description, maxWidth)
    doc.text(lines, margin, yPosition)
    yPosition += (lines.length * 8) + 15
  }

  // Información del técnico
  if (workOrderData.technician) {
    doc.setFontSize(PDF_CONFIG.fonts.section.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.section.style)
    doc.setTextColor(PDF_CONFIG.colors.primary)
    doc.text("Técnico Asignado", margin, yPosition)
    
    yPosition += 10
    
    doc.setFontSize(PDF_CONFIG.fonts.body.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.body.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(`Nombre: ${workOrderData.technician.name}`, margin, yPosition)
    yPosition += 8
    if (workOrderData.technician.phone) {
      doc.text(`Teléfono: ${workOrderData.technician.phone}`, margin, yPosition)
      yPosition += 8
    }
    
    yPosition += 15
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fonts.small.size)
    doc.setFont("helvetica", PDF_CONFIG.fonts.small.style)
    doc.setTextColor(PDF_CONFIG.colors.gray)
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc
}

const analyzeTransactionsByCategory = (transactions: CashTransaction[]) => {
  const analysis: { [key: string]: number } = {}
  
  transactions.forEach(transaction => {
    if (!analysis[transaction.category]) {
      analysis[transaction.category] = 0
    }
    analysis[transaction.category] += transaction.amount
  })
  
  return analysis
}

export const downloadMonthlyReport = (data: MonthlyReportData, filename?: string) => {
  const doc = generateMonthlyCashReport(data)
  const defaultFilename = `reporte-caja-${data.month.toLowerCase()}-${data.year}.pdf`
  doc.save(filename || defaultFilename)
}

export const downloadLiquidationPDF = (liquidationData: any, companyConfig: any, filename?: string) => {
  const doc = generateLiquidationPDF(liquidationData, companyConfig)
  const defaultFilename = `liquidacion-${liquidationData.technician?.name || 'tecnico'}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename || defaultFilename)
}

export const downloadQuotePDF = (quoteData: any, companyConfig: any, filename?: string) => {
  const doc = generateQuotePDF(quoteData, companyConfig)
  const defaultFilename = `presupuesto-${quoteData.quoteNumber || 'sin-numero'}.pdf`
  doc.save(filename || defaultFilename)
}

export const downloadInvoicePDF = (invoiceData: any, companyConfig: any, filename?: string) => {
  const doc = generateInvoicePDF(invoiceData, companyConfig)
  const defaultFilename = `factura-${invoiceData.invoiceNumber || 'sin-numero'}.pdf`
  doc.save(filename || defaultFilename)
}

export const downloadWorkOrderPDF = (workOrderData: any, companyConfig: any, filename?: string) => {
  const doc = generateWorkOrderPDF(workOrderData, companyConfig)
  const defaultFilename = `orden-trabajo-${workOrderData.orderNumber || 'sin-numero'}.pdf`
  doc.save(filename || defaultFilename)
}
