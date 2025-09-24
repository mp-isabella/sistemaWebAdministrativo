import { Company, Report, ReportMetric } from '@prisma/client'

interface ReportData {
  summary: any
  monthlyData?: any[]
  metrics: ReportMetric[]
  [key: string]: any
}

interface PDFOptions {
  report: Report & { company: Company; metrics: ReportMetric[] }
  data: ReportData
  company: Company
}

export async function generatePDF({ report, data, company }: PDFOptions): Promise<Buffer> {
  // Esta es una implementación básica usando jsPDF
  // En un entorno de producción, podrías usar Puppeteer o similar para generar PDFs más complejos

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  // Configurar colores de la empresa
  const primaryColor = company.primaryColor || '#2563eb'
  const secondaryColor = company.secondaryColor || '#64748b'

  // Header con logo y colores de la empresa
  doc.setFillColor(primaryColor)
  doc.rect(0, 0, 210, 30, 'F')

  // Título del reporte
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(company.displayName || company.name, 20, 20)

  // Información del reporte
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Reporte: ${report.title}`, 20, 40)
  doc.text(`Período: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}`, 20, 50)
  doc.text(`Generado: ${formatDate(report.createdAt)}`, 20, 60)

  // Resumen del reporte
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen Ejecutivo', 20, 80)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let yPosition = 90

  if (data.summary) {
    Object.entries(data.summary).forEach(([key, value]) => {
      const label = formatLabel(key)
      const formattedValue = formatValue(value, key)
      doc.text(`${label}: ${formattedValue}`, 20, yPosition)
      yPosition += 8
    })
  }

  // Métricas principales
  if (data.metrics && data.metrics.length > 0) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Métricas Principales', 20, yPosition + 10)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition += 20

    data.metrics.forEach((metric, _index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(`${metric.name}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`, 20, yPosition)
      yPosition += 8
    })
  }

  // Datos mensuales si existen
  if (data.monthlyData && data.monthlyData.length > 0) {
    doc.addPage()
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Datos Mensuales', 20, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition = 30

    // Headers de la tabla
    doc.setFont('helvetica', 'bold')
    doc.text('Mes', 20, yPosition)
    doc.text('Ingresos', 60, yPosition)
    doc.text('Gastos', 100, yPosition)
    doc.text('Utilidad', 140, yPosition)
    doc.text('Trabajos', 180, yPosition)
    yPosition += 10

    doc.setFont('helvetica', 'normal')
    data.monthlyData.forEach((monthData: any) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(`${monthData.month}/${monthData.year}`, 20, yPosition)
      doc.text(`$${monthData.revenue?.toLocaleString() || '0'}`, 60, yPosition)
      doc.text(`$${monthData.expenses?.toLocaleString() || '0'}`, 100, yPosition)
      doc.text(`$${monthData.profit?.toLocaleString() || '0'}`, 140, yPosition)
      doc.text(monthData.jobsCount?.toString() || '0', 180, yPosition)
      yPosition += 8
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(secondaryColor)
    doc.text(`Página ${i} de ${pageCount}`, 20, 290)
    doc.text(`Generado por ${company.name}`, 150, 290)
  }

  return Buffer.from(doc.output('arraybuffer'))
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-CL')
}

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    totalRevenue: 'Ingresos Totales',
    totalQuotes: 'Cotizaciones Totales',
    totalExpenses: 'Gastos Totales',
    totalIncome: 'Ingresos de Caja',
    profit: 'Utilidad',
    profitMargin: 'Margen de Utilidad',
    totalJobs: 'Total de Trabajos',
    completedJobs: 'Trabajos Completados',
    pendingJobs: 'Trabajos Pendientes',
    inProgressJobs: 'Trabajos en Progreso',
    completionRate: 'Tasa de Completación',
    totalTechnicians: 'Total de Técnicos',
    averageJobsPerDay: 'Promedio de Trabajos por Día',
    averageCompletionTime: 'Tiempo Promedio de Completación',
    efficiency: 'Eficiencia'
  }
  return labels[key] || key
}

function formatValue(value: any, key: string): string {
  if (typeof value === 'number') {
    if (key.includes('Rate') || key.includes('Margin') || key.includes('efficiency')) {
      return `${value.toFixed(1)}%`
    }
    if (key.includes('Revenue') || key.includes('Expenses') || key.includes('Income') || key.includes('profit')) {
      return `$${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }
  return String(value)
}
